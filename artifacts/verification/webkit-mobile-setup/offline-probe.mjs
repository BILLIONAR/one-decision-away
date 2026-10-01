import {webkit,devices} from 'playwright';
import {getInitialDemoState}from'../src/services/repository.ts';
import{writeFileSync}from'node:fs';
const base='https://127.0.0.1:4175/one-decision-away/';
const report={events:[],checks:[]};const b=await webkit.launch({executablePath:webkit.executablePath()});const c=await b.newContext({...devices['iPhone 13'],viewport:{width:390,height:844},ignoreHTTPSErrors:true,serviceWorkers:'allow'});
const seed=getInitialDemoState();seed.profile={...seed.profile,displayName:'Offline QA',onboardingStep:'completed',simpleModeOff:true,firstOpenedAt:'2026-08-01T00:00:00Z'};
await c.addInitScript(({seed})=>{if(!localStorage.getItem('one_decision_away_app_data_v1'))localStorage.setItem('one_decision_away_app_data_v1',JSON.stringify(seed));},{seed});
const p=await c.newPage();p.on('pageerror',e=>report.events.push({type:'pageerror',message:e.message}));p.on('console',e=>{if(e.type()==='error')report.events.push({type:'consoleerror',message:e.text()});});p.on('requestfailed',e=>report.events.push({type:'requestfailed',url:e.url(),failure:e.failure()}));p.on('response',e=>{if(e.request().isNavigationRequest())report.events.push({type:'navigation',url:e.url(),status:e.status(),worker:e.fromServiceWorker()});});
try{
 await p.goto(base+'#/app');await p.locator('#set-one-decision').waitFor();await p.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));await p.reload();await p.locator('#set-one-decision').waitFor();
 report.online=await p.evaluate(async()=>({controller:navigator.serviceWorker.controller?.scriptURL,cacheKeys:await caches.keys(),cached:await Promise.all((await caches.keys()).map(async k=>{const ca=await caches.open(k);return{key:k,requests:(await ca.keys()).map(r=>r.url),index:await ca.match(new URL('index.html',location.href))?.then(async r=>r?{status:r.status,type:r.type,url:r.url,headers:[...r.headers],start:(await r.text()).slice(0,100)}:null)};}))}));
 await c.setOffline(true);
 report.offlineFetch=await p.evaluate(async()=>{try{const r=await fetch(new URL('index.html',location.href));return{status:r.status,url:r.url,start:(await r.text()).slice(0,100)}}catch(e){return{error:String(e)}}});
 try{await p.reload({timeout:10000});await p.locator('#set-one-decision').waitFor({timeout:10000});report.reload={status:'passed',url:p.url()};}catch(e){report.reload={error:String(e),url:p.url()};}
 try{await p.goto(base+'index.html#/app',{timeout:10000});await p.locator('#set-one-decision').waitFor({timeout:10000});report.indexNavigation={status:'passed',url:p.url()};}catch(e){report.indexNavigation={error:String(e),url:p.url()};}
}finally{writeFileSync('artifacts/verification/webkit-mobile-setup/offline-probe.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await b.close();}
