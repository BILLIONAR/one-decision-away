import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from '/workspace/oda-landing-photographic/node_modules/playwright/index.mjs';
import {makeSeed} from './fixture.mjs';
import {actualTextContrast} from './contrast-capture.mjs';

if(process.env.ODA_LANDING_QA_GO!=='1'||!process.env.ODA_BUILD_RECEIPT)throw Error('Final frozen-source/build GO and receipt required');
const repo='/workspace/oda-landing-photographic';
const out='/workspace/scratch/oda-landing-photographic/browser-qa/boundary/remaining-768';
const base=process.env.ODA_QA_URL;
assert.ok(base,'Explicit frozen local preview URL required');
const origin=new URL(base);
assert.equal(origin.protocol,'http:');
assert.ok(['127.0.0.1','localhost'].includes(origin.hostname));
const sha=b=>createHash('sha256').update(b).digest('hex');
const receiptBytes=fs.readFileSync(process.env.ODA_BUILD_RECEIPT);
const receipt=JSON.parse(receiptBytes);
assert.equal(receipt.sourceCommit,'f02ce3344c3b75090e99e7e3e9c1f988251c3f24');
fs.mkdirSync(out,{recursive:true});
assert.equal(fs.existsSync(out+'/report.json'),false,'Preserve any earlier boundary run');
function verify(){for(const a of [...receipt.source,...receipt.build]){const b=fs.readFileSync(repo+'/'+a.file);assert.equal(b.length,a.bytes,a.file);assert.equal(sha(b),a.sha256,a.file)}return{source:receipt.source.length,compiled:receipt.build.length}}
const report={sourceCommit:receipt.sourceCommit,head:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),buildReceipt:{file:process.env.ODA_BUILD_RECEIPT,bytes:receiptBytes.length,sha256:sha(receiptBytes)},base,synthetic:true,physicalDevice:false,published:false,startedAtUtc:new Date().toISOString(),hashesBefore:verify(),cases:[],checks:[],pngs:[],blockedExternal:[],pageErrors:[],responseErrors:[],continuation:{priorReport:'../report.json',priorLog:'../run.log',reason:'Initial attempt expected1280 at768 from an unapproved harness assumption; actual srcset selects768/30,084 bytes. Parent corrected assumption. Original attempt preserved; only remaining768 cases run, no360 retest.'},limits:['Synthetic local Chromium at DPR1; no physical device or production verification.','DOM character rectangles and ancestor overflow bounds check text fit; actual screenshot inspection supplements the geometry.','Paired screenshot contrast samples rendered photograph/scrim backgrounds beneath text; not broad WCAG certification.','Native select emoji glyph colors and group opacity are outside the CSS-foreground contrast model.']};
assert.equal(report.head,report.sourceCommit);
const pass=(name,details={})=>report.checks.push({name,pass:true,...details});
const browser=await chromium.launch({executablePath:'/usr/bin/chromium'});
async function open(width,locale){
 const context=await browser.newContext({viewport:{width,height:width===768?1000:844},deviceScaleFactor:1,locale:({en:'en-US',tr:'tr-TR',es:'es-ES'})[locale],timezoneId:'UTC',colorScheme:'light',reducedMotion:'reduce',serviceWorkers:'block'});
 const requests=[],responses=[],pending=[];
 await context.route('**/*',route=>{const r=route.request(),u=new URL(r.url());if(u.origin===origin.origin&&u.pathname.startsWith(origin.pathname)&&r.method()==='GET')return route.continue();report.blockedExternal.push({method:r.method(),url:u.origin+u.pathname});return route.abort()});
 const seed=makeSeed();Object.assign(seed.profile,{locale,theme:'light'});
 await context.addInitScript(({seed,locale})=>{localStorage.setItem('one_decision_away_app_data_v1',JSON.stringify(seed));localStorage.setItem('oda_locale',locale);localStorage.setItem('oda_theme','light')},{seed,locale});
 context.on('request',r=>requests.push({url:r.url(),method:r.method()}));
 const page=await context.newPage();await page.clock.setFixedTime(new Date('2026-10-03T12:00:00.000Z'));page.on('pageerror',e=>report.pageErrors.push(e.message));
 page.on('response',response=>{const u=new URL(response.url());if(u.origin!==origin.origin)return;const relative=u.pathname.slice(origin.pathname.length)||'index.html';const asset=receipt.build.find(a=>a.file==='dist/'+relative);if(!asset)return;pending.push((async()=>{const b=await response.body();const row={url:response.url(),file:asset.file,status:response.status(),bytes:b.length,sha256:sha(b)};assert.equal(row.status,200);assert.equal(row.bytes,asset.bytes);assert.equal(row.sha256,asset.sha256);responses.push(row)})().catch(e=>report.responseErrors.push(e.message)))});
 return{context,page,requests,responses,pending};
}
async function capture(page,file,selector=null){if(selector)await page.locator(selector).screenshot({path:out+'/'+file,animations:'disabled',scale:'device'});else await page.screenshot({path:out+'/'+file,animations:'disabled',scale:'device'});const b=fs.readFileSync(out+'/'+file);report.pngs.push({file,bytes:b.length,sha256:sha(b),diagnostic:false})}
async function fit(page){return page.locator('.oda-landing').evaluate(root=>{
 const issues=[],checkedRuns=[],tol=1;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
 while((node=walker.nextNode())){const parent=node.parentElement;if(!node.textContent.trim()||parent.namespaceURI!=='http://www.w3.org/1999/xhtml'||parent.closest('svg,[aria-hidden="true"],.sr-only,option,.oda-landing-skip'))continue;
  const style=getComputedStyle(parent);if(style.display==='none'||style.visibility!=='visible'||!parent.getClientRects().length)continue;
  let count=0,minX=Infinity,maxX=-Infinity;
  for(let i=0;i<node.length;i++){if(/\s/.test(node.textContent[i]))continue;const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);
   for(const r of range.getClientRects()){if(!r.width||!r.height)continue;count++;minX=Math.min(minX,r.left);maxX=Math.max(maxX,r.right);const label=parent.tagName.toLowerCase()+'.'+parent.className;
    if(r.left< -tol||r.right>innerWidth+tol)issues.push({type:'horizontalViewport',selector:label,text:node.textContent.trim(),char:node.textContent[i],rect:{x:r.x,y:r.y,width:r.width,height:r.height},viewport:innerWidth});
    for(let a=parent;a&&a!==root.parentElement;a=a.parentElement){const c=getComputedStyle(a),box=a.getBoundingClientRect();if(!box.width||!box.height)continue;
     const left=box.left+a.clientLeft,right=left+a.clientWidth,top=box.top+a.clientTop,bottom=top+a.clientHeight;
     const clipX=['hidden','clip','scroll','auto'].includes(c.overflowX),clipY=['hidden','clip','scroll','auto'].includes(c.overflowY);
     if(clipX&&(r.left<left-tol||r.right>right+tol)||clipY&&(r.top<top-tol||r.bottom>bottom+tol))issues.push({type:'ancestorClip',selector:label,text:node.textContent.trim(),char:node.textContent[i],ancestor:a.tagName.toLowerCase()+'.'+a.className,overflow:{x:c.overflowX,y:c.overflowY},rect:{x:r.x,y:r.y,width:r.width,height:r.height},bounds:{left,right,top,bottom}});
    }
   }
  }
  if(count)checkedRuns.push({selector:parent.tagName.toLowerCase()+'.'+parent.className,text:node.textContent.trim(),characterRects:count,minX,maxX});
 }
 const controls=[...root.querySelectorAll('button,select,summary,a')].filter(e=>{const c=getComputedStyle(e),r=e.getBoundingClientRect();return c.visibility==='visible'&&r.width>0&&r.height>0&&!e.classList.contains('oda-landing-skip')}).map(e=>({selector:e.tagName.toLowerCase()+'.'+e.className,text:e.tagName==='SELECT'?e.selectedOptions[0]?.textContent:e.textContent.trim(),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}));
 return{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,lang:root.lang,theme:document.documentElement.getAttribute('data-theme'),issues,checkedRuns,controls};
 })}
try{
 for(const width of [768])for(const locale of ['en','tr','es']){
  const c=await open(width,locale),page=c.page,name=`landing-${locale}-light-${width}`;
  try{
   await page.goto(base+'#/');await page.locator('#landing-title').waitFor();await page.evaluate(()=>document.fonts.ready);await page.locator('.oda-landing-hero-photo img').evaluate(img=>img.decode());await page.waitForTimeout(250);await Promise.all(c.pending);
   await capture(page,name+'.png');await capture(page,name+'-hero.png','.oda-landing-hero');await page.evaluate(()=>window.scrollTo(0,0));
   const observed=await fit(page),photo=await page.locator('.oda-landing-hero-photo img').evaluate(img=>{const r=img.getBoundingClientRect(),c=getComputedStyle(img);return{currentSrc:img.currentSrc,complete:img.complete,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,objectFit:c.objectFit,objectPosition:c.objectPosition,frame:{x:r.x,y:r.y,width:r.width,height:r.height}}});
   const photoRequests=c.requests.filter(r=>r.url.includes('/assets/oda/landing-photo/')),photoResponses=c.responses.filter(r=>r.url.includes('/assets/oda/landing-photo/'));
   const caseRow={name,width,locale,theme:'light',dpr:1,observed,photo,photoRequests,photoResponses};report.cases.push(caseRow);
   assert.equal(observed.scrollWidth,width);assert.equal(observed.bodyWidth,width);assert.equal(observed.lang,locale);assert.equal(observed.theme,'light');assert.ok(observed.checkedRuns.length>0);assert.deepEqual(observed.issues,[],name+' DOM character rectangles fit viewport and clipping ancestors');
   pass(name+' no horizontal overflow and no clipped text rectangles',{runs:observed.checkedRuns.length,characterRects:observed.checkedRuns.reduce((s,r)=>s+r.characterRects,0)});
   const shortControls=observed.controls.filter(c=>c.height<44-0.01);assert.deepEqual(shortControls,[],name+' visible controls have 44px height');pass(name+' visible controls at least 44px',{count:observed.controls.length});
   assert.equal(photoRequests.length,1);assert.equal(photoResponses.length,1);assert.equal(photo.complete,true);assert.ok(photo.naturalWidth>0);assert.ok(photo.currentSrc.endsWith('hero-dolomites-768.webp'));assert.equal(photoResponses[0].bytes,30084);assert.ok(!c.requests.some(r=>r.url.includes('-original')||r.url.endsWith('.jpg')||r.url.endsWith('.mp3')));caseRow.cover={encoded:{width:768,height:436},physicalScale:Math.max(photo.frame.width/768,photo.frame.height/436),sourceUpsampled:Math.max(photo.frame.width/768,photo.frame.height/436)>1,note:'Source is selected by 100vw srcset; cover uses740px hero height. Manual softness review required, no unapproved numeric sharpness threshold.'};pass(name+' one chosen derivative request and exact served hash/bytes',{bytes:photoResponses[0].bytes,sha256:photoResponses[0].sha256,physicalScale:caseRow.cover.physicalScale});
   const measured=await actualTextContrast(page,out,name);caseRow.contrast={input:measured.input,output:measured.output,analysis:measured.analysis};report.pngs.push(...measured.pngs);assert.equal(measured.analysis.pass,true,name+' actual photograph/scrim contrast');pass(name+' sampled rendered text contrast');
   await Promise.all(c.pending);caseRow.responses=c.responses;caseRow.requests=c.requests;
   console.log(JSON.stringify({name,pass:true,checks:4,photoBytes:photoResponses[0].bytes,pngs:6}));
  }finally{await Promise.all(c.pending);await c.context.close()}
 }
 assert.deepEqual(report.blockedExternal,[]);assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.responseErrors,[]);pass('Three remaining768 boundaries have no external calls, browser/HTTP hash errors or automatic audio');report.hashesAfter=verify();pass('Frozen 912 source files and 451 compiled files unchanged after boundary QA');report.finishedAtUtc=new Date().toISOString();
}catch(e){report.error={name:e.name,message:e.message,stack:e.stack};console.error(JSON.stringify({error:report.error}));throw e}finally{await browser.close();fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({checks:report.checks.length,cases:report.cases.length,pngs:report.pngs.length,error:report.error||null,browserClosed:true}))}
