/** Synthetic account regressions. Requires a fresh Vite source server with DISABLE_HMR=true. All external requests are blocked; no real auth, provider or deletion request is sent. */
import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {chromium} from 'playwright';
const base=process.env.REVIEW_URL || 'http://127.0.0.1:3000';const fixed=process.env.REVIEW_FIXED!=='0';
const browser=await chromium.launch({executablePath:process.env.ODA_CHROMIUM || '/usr/bin/chromium',args:['--no-sandbox']});const context=await browser.newContext({serviceWorkers:'block'});
await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());const page=await context.newPage();
try{
 await page.goto(base+'/app');await page.waitForFunction(()=>Boolean(localStorage.getItem('one_decision_away_app_data_v1')));await page.locator('h1').first().waitFor();
 await page.evaluate(async()=>{const {getInitialDemoState,LocalDemoRepository}=await import('/src/services/repository.ts');const data=getInitialDemoState();data.profile.onboardingStep='completed';data.profile.displayName='Synthetic account A record';await new LocalDemoRepository().replaceAll(data);localStorage.setItem('oda_locale','en');});
 await page.goto(base+'/app/account');await page.locator('h1').first().waitFor();
 await page.evaluate(async()=>{
  const {cloudSync}=await import('/src/services/cloudSync.ts');window.reviewCloud=cloudSync;window.reviewUploads=[];
  Object.assign(cloudSync,{initialized:true,config:{url:'https://synthetic-review.supabase.co',anonKey:'fixture-public'},client:{from:()=>({
   select:()=>({eq:()=>({maybeSingle:()=>new Promise(resolve=>{window.reviewRead=()=>resolve({data:null,error:null});})})}),
   upsert:async row=>{window.reviewUploads.push({targetAccount:row.user_id,recordName:row.data.profile.displayName});return {error:null};}
  })}});
  cloudSync.setSession({access_token:'fixture-A',user:{id:'A',email:'A@example.test'}});cloudSync.emit();
 });
 await page.getByRole('button',{name:'Sync now',exact:true}).click();await page.waitForFunction(()=>Boolean(window.reviewRead));
 await page.evaluate(()=>{window.reviewCloud.setSession({access_token:'fixture-B',user:{id:'B',email:'B@example.test'}});window.reviewCloud.emit();window.reviewRead();});
 await page.waitForTimeout(120);
 const uploads=await page.evaluate(()=>window.reviewUploads);
 await page.evaluate(()=>{
  window.reviewCloud.setSession({access_token:'fixture-A',user:{id:'A',email:'A@example.test'}});window.reviewCloud.emit();window.reviewDeletionInvocations=[];
  window.reviewCloud.deleteAccount=async()=>{window.reviewDeletionInvocations.push(window.reviewCloud.getState().session?.user.id);return {ok:true};};
  Object.defineProperty(navigator.serviceWorker,'getRegistration',{configurable:true,value:()=>new Promise(resolve=>{window.reviewReleasePushStop=()=>resolve(undefined);})});
 });
 await page.getByRole('button',{name:'Delete my account',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Delete my account',exact:true}).click();await page.waitForFunction(()=>Boolean(window.reviewReleasePushStop));
 await page.evaluate(()=>{window.reviewCloud.setSession({access_token:'fixture-B',user:{id:'B',email:'B@example.test'}});window.reviewCloud.emit();window.reviewReleasePushStop();});
 await page.waitForTimeout(120);
 const deletionInvocations=await page.evaluate(()=>window.reviewDeletionInvocations);
 if(fixed){assert.deepEqual(uploads,[]);assert.deepEqual(deletionInvocations,[]);}
 const report={at:new Date().toISOString(),mode:fixed?'after-fix':'before-fix',uploadCount:uploads.length,uploadTargetAccounts:uploads.map(upload=>upload.targetAccount),previousAccountRecordUploadedToB:uploads.some(upload=>upload.targetAccount==='B'&&upload.recordName==='Synthetic account A record'),deletionInvocationCount:deletionInvocations.length,deletionInvocationAccounts:deletionInvocations,providerRequestsSent:0,realDeletionRequestsSent:0};
 const out=process.env.REVIEW_OUT || 'artifacts/verification/deep-account';mkdirSync(out,{recursive:true});writeFileSync(`${out}/${fixed?'after':'before'}.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
