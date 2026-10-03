import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from '/workspace/oda-reference-redesign/node_modules/playwright/index.mjs';
import {makeSeed} from '../../domino-palette/browser-qa/fixture.mjs';

const root='/workspace/scratch/oda-reference-redesign/domino-logo/browser-qa',repo='/workspace/oda-reference-redesign';
const mode=process.env.ODA_QA_MODE||'baseline';
if(mode!=='baseline'&&process.env.ODA_FINAL_QA_GO!=='1')throw Error('Frozen-source finalGO required');
const receiptPath=process.env.ODA_BUILD_RECEIPT||'/workspace/scratch/oda-reference-redesign/domino-palette/final-build/build-receipt.json';
const receipt=JSON.parse(fs.readFileSync(receiptPath));
const hash=b=>createHash('sha256').update(b).digest('hex');
function verify(){for(const a of receipt.build){const b=fs.readFileSync(repo+'/'+a.file);assert.equal(hash(b),a.sha256,a.file)}return receipt.build.length}
const dir=root+'/'+mode+'-sw';fs.mkdirSync(dir,{recursive:true});
const base='http://127.0.0.1:4194/one-decision-away/',prefix='oda:%2Fone-decision-away%2F:';
const report={mode,sourceCommit:receipt.sourceCommit,compiledFilesMatchedBefore:verify(),startedAtUtc:new Date().toISOString(),synthetic:true,physicalDevice:false,checks:[],requests:[],externalBlocked:[],pageErrors:[],screenshots:[]};
const pass=(name,data={})=>report.checks.push({name,pass:true,...data});
const context=await chromium.launchPersistentContext(root+'/sw-profile',{executablePath:'/usr/bin/chromium',viewport:{width:390,height:844},timezoneId:'UTC',locale:'en-US',reducedMotion:'reduce',serviceWorkers:'allow'});
await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===new URL(base).origin)return r.continue();report.externalBlocked.push(u.origin+u.pathname);return r.abort()});
context.on('request',r=>report.requests.push({url:r.url(),fromServiceWorker:Boolean(r.serviceWorker())}));
await context.addInitScript(seed=>{if(!localStorage.getItem('one_decision_away_app_data_v1')){localStorage.setItem('one_decision_away_app_data_v1',JSON.stringify(seed));localStorage.setItem('oda_locale','en');localStorage.setItem('oda_theme','light')}},makeSeed());
const page=context.pages()[0]||await context.newPage();page.on('pageerror',e=>report.pageErrors.push(e.message));
async function screenshot(name){const file=name+'.png';await page.screenshot({path:dir+'/'+file,animations:'disabled'});const b=fs.readFileSync(dir+'/'+file);report.screenshots.push({file,bytes:b.length,sha256:hash(b)})}
async function cacheState(){return page.evaluate(async()=>{const keys=await caches.keys();return{keys,registrations:(await navigator.serviceWorker.getRegistrations()).map(r=>({scope:r.scope,active:r.active?.scriptURL,waiting:r.waiting?.scriptURL,installing:r.installing?.scriptURL})),controller:navigator.serviceWorker.controller?.scriptURL,entries:await Promise.all(keys.map(async key=>({key,urls:(await(await caches.open(key)).keys()).map(r=>r.url)})))}})}
try{
 await page.goto(base+'#/app');await page.locator('.oda-decision-text').waitFor();
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller),{timeout:15000});
 if(mode==='baseline'){
  const state=await cacheState();assert.ok(state.keys.includes(prefix+'v5'));assert.ok(state.entries.find(e=>e.key===prefix+'v5').urls.some(u=>u.endsWith('/brand/oda-c4.png')));assert.equal(report.requests.filter(r=>/narration\/.*\.mp3/.test(r.url)).length,0);pass('Installed actual reviewed v5 service worker/cache without first-load narration',{state});await screenshot('baseline-v5-today-390');
 }else{
  const before=await cacheState();report.before=before;
  await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();if(!r)throw Error('No persisted baseline registration');await r.update()});
  await page.waitForFunction(async prefix=>{const keys=await caches.keys();return keys.includes(prefix+'v6')&&!keys.includes(prefix+'v5')},prefix,{timeout:20000});
  await page.reload();await page.locator('.oda-decision-text').waitFor();await page.evaluate(()=>document.fonts.ready);
  const state=await cacheState();report.afterReload=state;assert.ok(state.keys.includes(prefix+'v6'));assert.ok(!state.keys.some(k=>k.startsWith(prefix+'v5')),JSON.stringify(state));pass('Actual old v5 profile upgraded to v6 and removed obsolete scoped caches',{before,state});
  const manifestUrl=await page.locator('link[rel="manifest"]').getAttribute('href');const manifest=await page.evaluate(async url=>await(await fetch(url)).json(),manifestUrl);const resources=[...manifest.icons.map(i=>new URL(i.src,new URL(manifestUrl,base)).href),...await page.locator('link[rel="icon"],link[rel="apple-touch-icon"]').evaluateAll(es=>es.map(e=>e.href)),...await page.locator('.oda-brand-mark img,img.oda-brand-mark,.oda-brand-mark image').evaluateAll(es=>es.map(e=>e.src||e.getAttribute('href')).filter(Boolean))];
  report.iconDownloads=await page.evaluate(async urls=>Promise.all([...new Set(urls)].map(async url=>{url=new URL(url,location.href).href;const r=await fetch(url);const b=await r.arrayBuffer();const h=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).map(x=>x.toString(16).padStart(2,'0')).join('');return{url,status:r.status,bytes:b.byteLength,sha256:h,type:r.headers.get('content-type')}})),resources);
  for(const r of report.iconDownloads){assert.equal(r.status,200);let rel=new URL(r.url).pathname.slice('/one-decision-away/'.length),a=receipt.build.find(a=>a.file==='dist/'+rel);assert.ok(a,'Icon in compiled receipt '+rel);assert.equal(r.sha256,a.sha256);assert.equal(r.bytes,a.bytes)}pass('Manifest/favicon/apple-touch/visible brand downloads are exact final compiled PNGs',{downloads:report.iconDownloads});
  assert.equal(report.requests.filter(r=>/narration\/.*\.mp3/.test(r.url)).length,0);pass('Fresh upgraded Today load fetches zero narration clips');await screenshot('upgraded-v6-today-390');
  // Populate normal lazy routes, then confirm installed-shell and icon replay offline.
  await page.goto(base+'#/app/notebook');await page.locator('#notebook-journal-content').waitFor();await page.goto(base+'#/app/focus');await page.locator('#focus-timer-hub').waitFor();await page.evaluate(()=>document.fonts.ready);await context.setOffline(true);
  await page.reload();await page.locator('#focus-timer-hub').waitFor();const logo=await page.locator('.oda-brand-mark').evaluateAll(async es=>Promise.all(es.map(async e=>{const source=e.src||e.querySelector('image')?.getAttribute('href')||e.querySelector('img')?.src;let image=new Image();image.src=new URL(source,location.href).href;await image.decode();return{tag:e.tagName,source:image.src,complete:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight}})));assert.ok(logo.some(x=>x.complete&&x.naturalWidth>0));pass('New installed shell and secondary-header logo replay offline',{logo});await screenshot('offline-v6-focus-header-390');await page.goto(base+'#/app/notebook');await page.locator('#notebook-journal-content').waitFor();assert.equal(await page.locator('.oda-hybrid-entry-preview').filter({hasText:'A small step forward'}).count(),1);pass('Existing Notebook saved entry survives upgrade and offline route replay');await screenshot('offline-v6-notebook-390');await context.setOffline(false);
 }
 assert.deepEqual(report.externalBlocked,[]);assert.deepEqual(report.pageErrors,[]);pass('No external account/media attempts or browser page errors');report.compiledFilesMatchedAfter=verify();report.finishedAtUtc=new Date().toISOString();
}catch(e){report.error={name:e.name,message:e.message,stack:e.stack};throw e}finally{await context.close();fs.writeFileSync(dir+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({mode,sourceCommit:report.sourceCommit,checks:report.checks.length,pngs:report.screenshots.length,error:report.error}))}
