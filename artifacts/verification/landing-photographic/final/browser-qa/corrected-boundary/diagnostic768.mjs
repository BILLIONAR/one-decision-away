import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from '/workspace/oda-landing-photographic/node_modules/playwright/index.mjs';
import {makeSeed} from '../fixture.mjs';
const out='/workspace/scratch/oda-landing-photographic/browser-qa/corrected-boundary/diagnostic768';
fs.mkdirSync(out,{recursive:true});assert.ok(!fs.existsSync(out+'/report.json'));
const base='http://127.0.0.1:4197/one-decision-away/',origin=new URL(base),sha=b=>createHash('sha256').update(b).digest('hex');
const receipt=JSON.parse(fs.readFileSync('/workspace/scratch/oda-landing-photographic/corrected-build/build-receipt.json'));
function verify(){for(const a of [...receipt.source,...receipt.build]){const b=fs.readFileSync('/workspace/oda-landing-photographic/'+a.file);assert.equal(b.length,a.bytes);assert.equal(sha(b),a.sha256)}return{source:receipt.source.length,compiled:receipt.build.length}}
const report={sourceCommit:receipt.sourceCommit,before:verify(),requests:[],responses:[],snapshots:[],pngs:[],external:[],errors:[]};let stage='startup';const pending=[];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium'});
try{
 const context=await browser.newContext({viewport:{width:768,height:1000},deviceScaleFactor:1,locale:'en-US',timezoneId:'UTC',colorScheme:'light',reducedMotion:'reduce',serviceWorkers:'block'});
 await context.route('**/*',route=>{const r=route.request(),u=new URL(r.url());if(u.origin===origin.origin&&u.pathname.startsWith(origin.pathname)&&r.method()==='GET')return route.continue();report.external.push(r.url());return route.abort()});
 const seed=makeSeed();await context.addInitScript(seed=>{localStorage.setItem('one_decision_away_app_data_v1',JSON.stringify(seed));localStorage.setItem('oda_locale','en');localStorage.setItem('oda_theme','light');window.__resizeLog=[];window.addEventListener('resize',()=>window.__resizeLog.push({width:innerWidth,height:innerHeight,media:matchMedia('(max-width:640px)').matches}))},seed);
 context.on('request',r=>{if(r.url().includes('/landing-photo/'))report.requests.push({url:r.url(),stage})});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));await page.clock.setFixedTime(new Date('2026-10-03T12:00:00.000Z'));
 page.on('response',response=>{if(!response.url().includes('/landing-photo/'))return;const at=stage;pending.push((async()=>{const b=await response.body();report.responses.push({url:response.url(),stage:at,bytes:b.length,sha256:sha(b)})})())});
 async function snapshot(label){await page.waitForTimeout(200);await Promise.all(pending);report.snapshots.push({label,...await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,mobileMedia:matchMedia('(max-width:640px)').matches,src:document.querySelector('.oda-landing-hero-photo img').currentSrc,resizes:window.__resizeLog})),requestCount:report.requests.length})}
 stage='initial-page-load';await page.goto(base+'#/');await page.locator('#landing-title').waitFor();await page.evaluate(()=>document.fonts.ready);await page.locator('.oda-landing-hero-photo img').evaluate(img=>img.decode());await snapshot('ready-before-any-capture');
 stage='normal-top-screenshot';await page.screenshot({path:out+'/top.png',animations:'disabled',scale:'device'});await snapshot('after-top');
 stage='fullPage-clip-hero-screenshot';const clip=await page.locator('.oda-landing-hero').evaluate(e=>{const r=e.getBoundingClientRect();return{x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}});await page.screenshot({path:out+'/hero.png',fullPage:true,clip,animations:'disabled',scale:'device'});await snapshot('after-hero');
 for(const file of ['top.png','hero.png']){const b=fs.readFileSync(out+'/'+file);report.pngs.push({file,bytes:b.length,sha256:sha(b)})}
 await context.close();report.after=verify();
}finally{await browser.close();report.browserClosed=true;fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report))}
