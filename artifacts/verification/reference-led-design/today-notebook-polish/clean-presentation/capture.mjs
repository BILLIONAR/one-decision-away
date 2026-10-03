import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const repo='/workspace/oda-reference-redesign';
const out='/workspace/scratch/oda-reference-redesign/clean-presentation';
const sourceCommit='7b78cf89adf3c1bd89e9e5c1540cffdb3953a566';
const evidenceCommit='d4fc80080002deccb78c24164c4a10c50c838d1f';
const receiptPath='artifacts/verification/reference-led-design/today-notebook-polish/final-reviewed/build-receipt.json';
const receiptBytes=readFileSync(`${repo}/${receiptPath}`);
const receipt=JSON.parse(receiptBytes);
const base='http://127.0.0.1:4193/one-decision-away/';
const now='2026-10-03T12:00:00.000Z',today='2026-10-03';
const sha=b=>createHash('sha256').update(b).digest('hex');
const git=args=>execFileSync('git',args,{cwd:repo,encoding:'utf8'}).trim();
function verify(){
  assert.equal(git(['rev-parse','HEAD']),evidenceCommit);
  assert.equal(git(['branch','--show-current']),'design/reference-led-oda');
  assert.equal(git(['status','--porcelain']),'');
  assert.equal(receipt.sourceCommit,sourceCommit);
  for(const row of [...receipt.source,...receipt.build]){
    const bytes=readFileSync(`${repo}/${row.file}`);
    assert.equal(bytes.length,row.bytes,row.file);
    assert.equal(sha(bytes),row.sha256,row.file);
  }
  return {head:evidenceCommit,sourceFiles:receipt.source.length,compiledFiles:receipt.build.length,allExact:true,workingTreeClean:true};
}
const report={kind:'Synthetic presentation screenshots, supplementary to existing QA proof',sourceCommit,evidenceCommit,branch:'design/reference-led-oda',startedAtUtc:new Date().toISOString(),buildReceipt:{path:receiptPath,bytes:receiptBytes.length,sha256:sha(receiptBytes)},syntheticDate:now,screenshotMethod:'Unmodified viewport PNGs captured by Playwright from the existing compiled app using normal local Vite preview. No rebuild, image processing, DOM text/style replacement, source edit or real user record access.',preflight:verify(),screenshots:[],contexts:[],observedCompiledResponses:[],limits:['Chromium desktop and 320px viewport emulation; not a physical device.','These three clean synthetic presentation views supplement and do not replace the prior stress-test QA evidence.','No test campaign, feature work, production deployment or publication approval.']};
const require=createRequire(`${repo}/package.json`);
const {chromium}=require('playwright');
const {getInitialDemoState}=await import(`${repo}/src/services/repository.ts`);
const browser=await chromium.launch({executablePath:'/usr/bin/chromium'});
report.browser=await browser.version();
const observed=new Map();
function seed(){
  const d=getInitialDemoState();
  d.profile={...d.profile,displayName:'Alex',locale:'en',theme:'light',onboardingStep:'completed',simpleModeOff:true,soundMuted:true,nudgesEnabled:false,dailyWisdomEnabled:false,reminderAskedAt:now,firstOpenedAt:'2026-01-01T00:00:00Z',lastOpenedAt:now};
  d.lastActiveDateKey=today;d.lastDailyResetTimestamp=now;d.dreamJournal=[];d.completions=[];
  d.missions=d.missions.filter(m=>!m.isOneDecision);
  d.missions.push({id:'synthetic-presentation-decision',userId:d.profile.id,title:'Read two pages',type:'daily_quest',area:'Mindset',difficulty:'easy',isOneDecision:true,status:'active',createdAt:now,scheduledFor:today,plan:{obstacle:'I reach for my phone',ifThen:'read one paragraph first.',plannedAt:now}});
  d.notebook.entries=[{id:'synthetic-presentation-entry',kind:'journal',title:'A small step forward',content:'I made time to read today. Starting small helped me keep the promise I made to myself.',dateKey:today,createdAt:now,updatedAt:now,mood:'focused'}];
  d.notebook.activityDays=[{dateKey:today,rewardAmount:0}];
  return d;
}
async function capture(file,route,width){
  const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},timezoneId:'UTC',locale:'en-US',reducedMotion:'reduce',serviceWorkers:'block'});
  const record={file,route,width,blockedExternal:[],pageErrors:[]};report.contexts.push(record);
  await context.route('**/*',route=>{
    const req=route.request();
    if(new URL(req.url()).origin!==new URL(base).origin||!['GET','HEAD'].includes(req.method())){
      record.blockedExternal.push({origin:new URL(req.url()).origin,path:new URL(req.url()).pathname,method:req.method()});return route.abort();
    }
    return route.continue();
  });
  await context.addInitScript(d=>{
    if(!localStorage.getItem('one_decision_away_app_data_v1'))localStorage.setItem('one_decision_away_app_data_v1',JSON.stringify(d));
    localStorage.setItem('oda_locale','en');localStorage.setItem('oda_theme','light');
  },seed());
  const page=await context.newPage();
  const responses=[];
  page.on('pageerror',e=>record.pageErrors.push(e.message));
  page.on('response',response=>{
    const p=new URL(response.url()).pathname;
    if(!p.startsWith(new URL(base).pathname))return;
    const relative=p.slice(new URL(base).pathname.length);
    const file=relative?`dist/${decodeURIComponent(relative)}`:'dist/index.html';
    const expected=receipt.build.find(r=>r.file===file);
    if(expected&&(file==='dist/index.html'||/\.(js|css)$/.test(file)))responses.push((async()=>{
      const bytes=await response.body();assert.equal(response.status(),200,file);assert.equal(bytes.length,expected.bytes,file);assert.equal(sha(bytes),expected.sha256,file);
      observed.set(file,{file,bytes:bytes.length,sha256:sha(bytes),httpStatus:response.status()});
    })());
  });
  try{
    await page.clock.setFixedTime(new Date(now));
    await page.goto(`${base}#${route}`);
    await page.locator(route==='/app'?'.oda-decision-plan':'#notebook-journal-content').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(async()=>{
      await Promise.all([...document.images].filter(img=>{const r=img.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;}).map(img=>img.decode().catch(()=>{})));
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    });
    if(route==='/app'){
      assert.equal(await page.locator('.oda-decision-text').innerText(),'Read two pages');
      record.generatedPlan=await page.locator('.oda-decision-plan').innerText();
    }else{
      assert.equal(await page.locator('.oda-hybrid-entry-preview h3').innerText(),'A small step forward');
      assert.equal(await page.locator('.oda-hybrid-preview-text').innerText(),'I made time to read today. Starting small helped me keep the promise I made to myself.');
      const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('one_decision_away_app_data_v1')).notebook.entries);
      assert.equal(saved.length,1);record.savedEntryCount=saved.length;
      if(width===320){
        await page.locator('.oda-notebook-week-strip [aria-current="date"]').click();
        const date=page.locator('.oda-notebook-week-strip [aria-pressed="true"]');
        record.selectedDate=await date.evaluate(el=>{
          const region=el.closest('.oda-notebook-week-region'),b=el.getBoundingClientRect(),r=region.getBoundingClientRect();
          return {text:el.innerText,button:{left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height},region:{left:r.left,right:r.right,scrollLeft:region.scrollLeft},fullyVisible:b.left>=r.left-.5&&b.right<=r.right+.5&&b.top>=0&&b.bottom<=innerHeight,pageY:scrollY};
        });
        assert.ok(record.selectedDate.fullyVisible);assert.equal(record.selectedDate.pageY,0);
      }
    }
    record.pageGeometry=await page.evaluate(()=>({viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth,pageY:scrollY}));
    assert.ok(record.pageGeometry.documentWidth<=width+1);
    await page.screenshot({path:`${out}/${file}`,animations:'disabled',fullPage:false});
    await Promise.all(responses);
    assert.deepEqual(record.pageErrors,[]);assert.deepEqual(record.blockedExternal,[]);
    const bytes=readFileSync(`${out}/${file}`);report.screenshots.push({file,width,height:width===1440?1000:844,bytes:bytes.length,sha256:sha(bytes),pixelReview:'pending'});
    console.log(`Captured ${file}: ${bytes.length} bytes`);
  }finally{await context.close();}
}
try{
  await capture('today-desktop.png','/app',1440);
  await capture('notebook-desktop.png','/app/notebook',1440);
  await capture('notebook-320.png','/app/notebook',320);
  report.postflight=verify();report.observedCompiledResponses=[...observed.values()];report.status='captured-awaiting-pixel-review';
}catch(e){report.status='failed';report.error=String(e.stack||e);console.error(report.error);process.exitCode=1;}
finally{await browser.close();report.finishedAtUtc=new Date().toISOString();writeFileSync(`${out}/capture-receipt.json`,JSON.stringify(report,null,2)+'\n',{flag:'wx'});}
