import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from '/workspace/oda-reference-redesign/node_modules/playwright/index.mjs';
import {getInitialDemoState} from '/workspace/oda-reference-redesign/src/services/repository.ts';
import {makeSeed} from '../../domino-palette/browser-qa/fixture.mjs';

const repo='/workspace/oda-reference-redesign',root='/workspace/scratch/oda-reference-redesign/domino-logo/browser-qa';
const mode=process.env.ODA_QA_MODE||'baseline';
if(mode!=='baseline'&&process.env.ODA_FINAL_QA_GO!=='1')throw Error('Root frozen source/build GO required');
const receiptPath=process.env.ODA_BUILD_RECEIPT||'/workspace/scratch/oda-reference-redesign/domino-palette/final-build/build-receipt.json';
const receipt=JSON.parse(fs.readFileSync(receiptPath));
const out=root+'/'+mode+(process.env.ODA_QA_OUTPUT_SUFFIX?'-'+process.env.ODA_QA_OUTPUT_SUFFIX:'');fs.mkdirSync(out,{recursive:true});
const sha=b=>createHash('sha256').update(b).digest('hex');
function verify(includeSource=false){let files=includeSource?[...receipt.source,...receipt.build]:receipt.build;for(const a of files){const b=fs.readFileSync(repo+'/'+a.file);if(b.length!==a.bytes||sha(b)!==a.sha256)throw Error('Receipt mismatch '+a.file)}return{compiled:receipt.build.length,source:includeSource?receipt.source.length:0}}
const report={mode,sourceCommit:receipt.sourceCommit,checkoutHead:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),buildReceipt:receiptPath,hashesBefore:verify(mode!=='baseline'),synthetic:true,physicalDevice:false,startedAtUtc:new Date().toISOString(),cases:[],servedResponses:[],externalBlocked:[],pageErrors:[]};
const base='http://127.0.0.1:4194/one-decision-away/',now='2026-10-03T12:00:00.000Z',pending=[];
const selectors=['.oda-landing-nav','.oda-landing-brand','.oda-landing-brand-mark','.oda-landing-hero','.oda-landing-title','.oda-landing-preview-logo','.oda-landing-principle-mark','.oda-landing-library-mark','.oda-landing-closing-mark','.oda-landing-footer-mark','.oda-onboarding header','.oda-onboarding main','.oda-sidebar','.oda-sidebar>button:first-child','.oda-sidebar-profile','.oda-reference-app>header','.oda-reference-app','.oda-page-enter','.oda-fidelity-hero','.oda-decision','.oda-decision-text','.oda-decision-action','.oda-hybrid-progress','.oda-hybrid-actions','.oda-growth-panel','.oda-growth-course','.oda-tabbar','#notebook-journal-content','#coach-message'];
async function inspect(page){return page.evaluate(selectors=>{
 const rect=e=>{let r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
 const style=e=>{let c=getComputedStyle(e);return{color:c.color,bg:c.backgroundColor,image:c.backgroundImage,display:c.display,padding:c.padding,border:c.borderColor,font:c.fontFamily,fontSize:c.fontSize,fontWeight:c.fontWeight,outline:c.outlineColor,outlineWidth:c.outlineWidth}};
 const nodes=Object.fromEntries(selectors.map(s=>[s,[...document.querySelectorAll(s)].map(e=>({rect:rect(e),style:style(e),text:e.textContent.trim().slice(0,200)}))]));
 const marks=[...document.querySelectorAll('.oda-brand-mark')].map(e=>({tag:e.tagName,classes:e.getAttribute('class'),rect:rect(e),style:style(e),ariaHidden:e.getAttribute('aria-hidden'),role:e.getAttribute('role'),ariaLabel:e.getAttribute('aria-label'),alt:e.getAttribute('alt'),viewBox:e.getAttribute('viewBox'),source:e.tagName.toLowerCase()==='img'?e.getAttribute('src'):e.querySelector('image')?.getAttribute('href'),naturalWidth:e.naturalWidth||null,naturalHeight:e.naturalHeight||null,complete:e.complete??null,parent:{tag:e.parentElement.tagName,classes:e.parentElement.className,ariaLabel:e.parentElement.getAttribute('aria-label')}}));
 return{view:{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,scrollY},theme:document.documentElement.getAttribute('data-theme'),nodes,marks,route:document.querySelector('[data-app-route]')?.getAttribute('data-app-route')||location.hash,headIcons:[...document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"],link[rel="manifest"]')].map(e=>({rel:e.rel,href:e.href,sizes:e.sizes?.value,type:e.type}))};
 },selectors)}
const browser=await chromium.launch({executablePath:'/usr/bin/chromium'});
try{
 for(const width of [1440,390,320]){
  for(const route of (process.env.ODA_QA_ROUTES?process.env.ODA_QA_ROUTES.split(','):['landing','onboarding','today','notebook','coach','focus'])){
   const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},timezoneId:'UTC',locale:'en-US',reducedMotion:'reduce',serviceWorkers:'block'});
   await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===new URL(base).origin)return r.continue();report.externalBlocked.push(u.origin+u.pathname);return r.abort()});
   const seed=route==='onboarding'?getInitialDemoState():makeSeed();if(route==='onboarding')Object.assign(seed.profile,{locale:'en',theme:'light',soundMuted:true,nudgesEnabled:false,dailyWisdomEnabled:false});
   await context.addInitScript(seed=>{localStorage.setItem('one_decision_away_app_data_v1',JSON.stringify(seed));localStorage.setItem('oda_locale','en');localStorage.setItem('oda_theme','light')},seed);
   const page=await context.newPage();await page.clock.setFixedTime(new Date(now));page.on('pageerror',e=>report.pageErrors.push(e.message));page.on('response',r=>{let u=new URL(r.url());if(u.origin!==new URL(base).origin)return;let rel=u.pathname.slice('/one-decision-away/'.length)||'index.html';const a=receipt.build.find(x=>x.file==='dist/'+rel);if(a&&(/\.(js|css|png|webmanifest)$/.test(rel)||rel==='index.html'))pending.push((async()=>{const b=await r.body();if(sha(b)!==a.sha256)throw Error('HTTP body mismatch '+rel);report.servedResponses.push({file:a.file,status:r.status(),bytes:b.length,sha256:sha(b)})})())});
   await page.goto(base+'#'+(route==='landing'?'/':route==='onboarding'||route==='today'?'/app':'/app/'+route));
   await page.locator(route==='landing'?'#landing-title':route==='onboarding'?'.oda-onboarding':route==='today'?'.oda-decision-text':route==='notebook'?'#notebook-journal-content':route==='coach'?'#coach-message':route==='focus'?'.oda-fidelity-focus':'#profile-name').waitFor();
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(e=>{let r=e.getBoundingClientRect();return r.width&&r.bottom>0&&r.top<innerHeight}).map(e=>e.decode().catch(()=>{})))});await page.waitForTimeout(150);
   const c={width,route,theme:'light',observed:await inspect(page),pngs:[]};
   for(const fullPage of route==='landing'?[false,true]:[false]){const file=`${route}-${width}${fullPage?'-full':''}.png`;await page.screenshot({path:out+'/'+file,animations:'disabled',fullPage});const b=fs.readFileSync(out+'/'+file);c.pngs.push({file,bytes:b.length,sha256:sha(b)})}
   report.cases.push(c);await context.close();
  }
 }
 await Promise.all(pending);
}finally{await browser.close();report.hashesAfter=verify(mode!=='baseline');report.finishedAtUtc=new Date().toISOString();fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n')}
console.log(JSON.stringify({mode,sourceCommit:report.sourceCommit,checkoutHead:report.checkoutHead,cases:report.cases.length,pngs:report.cases.reduce((n,c)=>n+c.pngs.length,0),servedResponses:report.servedResponses.length,external:report.externalBlocked,pageErrors:report.pageErrors}));
