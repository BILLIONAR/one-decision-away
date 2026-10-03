import { chromium } from '/workspace/oda-reference-redesign/node_modules/playwright/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const out='/workspace/scratch/oda-landing-photographic/draft-preview';
mkdirSync(out,{recursive:true});
const origin='http://127.0.0.1:4196';
const base=origin+'/one-decision-away/';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium'});
const report={synthetic:true,stage:'Draft composition review; final aggregate and independent QA pending',cases:[],pageErrors:[],externalBlocked:[]};
try {
  for(const width of [1440,390,320]){
    const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},serviceWorkers:'block',reducedMotion:'reduce',colorScheme:'light'});
    await context.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
    await context.addInitScript(()=>{localStorage.setItem('oda_locale','en');localStorage.setItem('oda_theme','light');});
    const page=await context.newPage();const requests=[];
    page.on('pageerror',e=>report.pageErrors.push(String(e)));
    page.on('request',r=>{if(r.url().includes('/landing-photo/'))requests.push(r.url());});
    await page.goto(base+'#/');await page.locator('.oda-landing-title').waitFor();
    await page.evaluate(async()=>{await document.fonts.ready;await document.querySelector('.oda-landing-hero-photo img').decode();});
    const observed=await page.evaluate(()=>{const hero=document.querySelector('.oda-landing-hero'),image=hero.querySelector('img');const rect=e=>{const b=e.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom}};return{hero:rect(hero),image:rect(image),source:image.currentSrc,natural:[image.naturalWidth,image.naturalHeight],title:rect(document.querySelector('h1')),copy:rect(document.querySelector('.oda-landing-hero-copy')),example:rect(document.querySelector('.oda-landing-example')),documentWidth:document.documentElement.scrollWidth,viewport:innerWidth};});
    await page.screenshot({path:`${out}/landing-en-${width}.png`});
    report.cases.push({width,...observed,photoRequests:requests});
    await context.close();
  }
}finally{writeFileSync(out+'/report.json',JSON.stringify(report,null,2));await browser.close();}
console.log(JSON.stringify(report));
