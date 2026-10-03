import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from '/workspace/oda-reference-redesign/node_modules/playwright/index.mjs';
import {getInitialDemoState} from '/workspace/oda-reference-redesign/src/services/repository.ts';
import {courseCatalogFor} from '/workspace/oda-reference-redesign/src/data/courseCatalog.ts';

const repo='/workspace/oda-reference-redesign';
const root='/workspace/scratch/oda-reference-redesign/domino-palette/browser-qa';
const mode=process.env.ODA_QA_MODE||'baseline';
const out=root+'/'+mode;
const receiptPath=process.env.ODA_BUILD_RECEIPT||repo+'/artifacts/verification/reference-led-design/today-notebook-polish/final-reviewed/build-receipt.json';
const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
function verifyBuild(){for(const a of receipt.build){const b=fs.readFileSync(repo+'/'+a.file);if(b.length!==a.bytes||sha(b)!==a.sha256)throw Error('Build mismatch '+a.file);}return receipt.build.length;}
fs.mkdirSync(out,{recursive:true});
const report={mode,synthetic:true,sourceCommit:receipt.sourceCommit,checkoutHead:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),buildReceipt:receiptPath,buildFilesMatched:verifyBuild(),startedAtUtc:new Date().toISOString(),cases:[],externalBlocked:[],pageErrors:[]};
const base='http://127.0.0.1:4194/one-decision-away/';
const now='2026-10-03T12:00:00.000Z',today='2026-10-03';
export function makeSeed(kind='active'){
 const d=getInitialDemoState();
 Object.assign(d.profile,{displayName:'Alex',locale:'en',theme:'light',onboardingStep:'completed',simpleModeOff:true,soundMuted:true,nudgesEnabled:false,dailyWisdomEnabled:false,reminderAskedAt:now,firstOpenedAt:'2026-01-01T00:00:00Z',lastOpenedAt:now});
 d.lastActiveDateKey=today;d.lastDailyResetTimestamp=now;d.dreamJournal=[];d.completions=[];
 d.missions=d.missions.filter(m=>!m.isOneDecision);
 if(kind!=='empty')d.missions.push({id:'synthetic-palette-decision',userId:d.profile.id,title:'Read two pages',type:'daily_quest',area:'Mindset',difficulty:'easy',isOneDecision:true,status:kind==='completed'?'completed':'active',createdAt:now,scheduledFor:today,plan:{obstacle:'I reach for my phone',ifThen:'put it aside and read one paragraph.',plannedAt:now}});
 d.notebook.entries=[{id:'synthetic-palette-entry',kind:'journal',title:'A small step forward',content:'I made time to read today. Starting small helped me keep the promise I made to myself.',dateKey:today,createdAt:now,updatedAt:now,mood:'focused'}];
 d.notebook.activityDays=[{dateKey:today,rewardAmount:0}];
 const catalog=courseCatalogFor('en'),first=catalog[0].lessons[0];
 d.courseProgress={version:1,lessons:{[first.id]:{checked:Array(first.practiceCount).fill(true),answer:first.correct,reflection:'Starting small made it easier to begin.',completed:true}}};
 return d;
}
const selectors=['.oda-reference-app','.oda-sidebar','.oda-sidebar-profile','.oda-nav-active','.oda-tabbar','.oda-tab[aria-current="page"]','#oda-main','.oda-page-enter','.oda-reference-today','.oda-today-headline','.oda-fidelity-command','.oda-fidelity-hero','.oda-fidelity-hero-copy','.oda-fidelity-scene img','.oda-decision','.oda-decision-text','.oda-decision-plan','.oda-decision-action','.oda-decision-done','.oda-decision-input','.oda-hybrid-progress','.oda-hybrid-ring','.oda-hybrid-focus','.oda-hybrid-actions','.oda-hybrid-action','.oda-fidelity-support','.oda-fidelity-shortcuts','.oda-growth-panel','.oda-course-continuation','.oda-notebook-week-region','#notebook-journal-content'];
async function inspect(page){return page.evaluate(selectors=>{
 const rect=e=>{let r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}};
 const props=['color','backgroundColor','backgroundImage','borderTopColor','borderTopWidth','outlineColor','outlineWidth','outlineOffset','boxShadow','fontSize','fontWeight','opacity','padding','gap','borderRadius','transform'];
 const view={width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,scrollY};
 const nodes=Object.fromEntries(selectors.map(s=>[s,[...document.querySelectorAll(s)].map(e=>{const c=getComputedStyle(e);return{text:e.textContent.trim().slice(0,240),rect:rect(e),styles:Object.fromEntries(props.map(p=>[p,c[p]])),hidden:c.display==='none'||c.visibility==='hidden',src:e.getAttribute('src')}})]));
 const text=[...document.querySelectorAll('#oda-main h1,#oda-main h2,#oda-main h3,#oda-main p,#oda-main label,#oda-main button,.oda-sidebar button,.oda-tabbar button')].filter(e=>{let r=e.getBoundingClientRect();return r.width&&r.height}).map(e=>{const c=getComputedStyle(e);let chain=[],p=e;while(p&&chain.length<7){let cs=getComputedStyle(p);chain.push({tag:p.tagName,class:p.className,color:cs.color,backgroundColor:cs.backgroundColor,backgroundImage:cs.backgroundImage,opacity:cs.opacity});p=p.parentElement;}return{tag:e.tagName,class:e.className,text:e.textContent.trim().slice(0,100),rect:rect(e),fontSize:c.fontSize,fontWeight:c.fontWeight,color:c.color,backgrounds:chain}});
 const assets=[...document.images].map(e=>({src:e.getAttribute('src'),naturalWidth:e.naturalWidth,complete:e.complete}));
 return{view,nodes,text,assets,route:document.querySelector('[data-app-route]')?.getAttribute('data-app-route')};
 },selectors)}
async function settle(page,route){await page.locator('#oda-main h1').waitFor();if(route==='today')await page.locator('.oda-decision-text').waitFor();if(route==='notebook')await page.locator('#notebook-journal-content').waitFor();if(route==='courses')await page.locator('.oda-course-title').waitFor();if(route==='coach')await page.locator('#coach-message').waitFor();if(route==='settings')await page.locator('#profile-name').waitFor();if(route==='sound')await page.locator('.oda-sound-title').waitFor();await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(e=>{let r=e.getBoundingClientRect();return r.width&&r.bottom>0&&r.top<innerHeight}).map(e=>e.decode().catch(()=>{})))});await page.waitForTimeout(200);}
const browser=await chromium.launch({executablePath:'/usr/bin/chromium'});
try{
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},timezoneId:'UTC',locale:'en-US',reducedMotion:'reduce',serviceWorkers:'block'});
  await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin===new URL(base).origin)return route.continue();report.externalBlocked.push(u.origin+u.pathname);return route.abort()});
  await context.addInitScript(seed=>{localStorage.setItem('one_decision_away_app_data_v1',JSON.stringify(seed));localStorage.setItem('oda_locale','en');localStorage.setItem('oda_theme','light')},makeSeed());
  const page=await context.newPage();await page.clock.setFixedTime(new Date(now));page.on('pageerror',e=>report.pageErrors.push(e.message));
  const routes=width===320?['today']:['today','notebook','courses','coach','settings','sound'];
  for(const route of routes){
   await page.goto(base+'#'+(route==='today'?'/app':'/app/'+route));await settle(page,route);
   const c={width,route,observed:await inspect(page),pngs:[]};
   for(const fullPage of route==='today'?[false,true]:[false]){const file=`${route}-${width}${fullPage?'-full':''}.png`;await page.screenshot({path:out+'/'+file,animations:'disabled',fullPage});const b=fs.readFileSync(out+'/'+file);c.pngs.push({file,bytes:b.length,sha256:sha(b)})}
   report.cases.push(c);
  }
  await context.close();
 }
}finally{await browser.close();report.finishedAtUtc=new Date().toISOString();report.buildFilesMatchedAfter=verifyBuild();fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n')}
console.log(JSON.stringify({mode,sourceCommit:report.sourceCommit,buildFilesMatched:report.buildFilesMatched,cases:report.cases.length,screenshots:report.cases.reduce((n,c)=>n+c.pngs.length,0),externalBlocked:report.externalBlocked,pageErrors:report.pageErrors}));
