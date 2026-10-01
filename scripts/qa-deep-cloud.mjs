/** Synthetic account regressions. Requires a fresh Vite source server with DISABLE_HMR=true. All external requests are blocked; no real auth, provider or deletion request is sent. */
import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {chromium} from 'playwright';
const base=process.env.REVIEW_URL || 'http://127.0.0.1:3000';
const fixed=process.env.REVIEW_FIXED!=='0';
const browser=await chromium.launch({executablePath:process.env.ODA_CHROMIUM || '/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({serviceWorkers:'block'});
let blockedExternalRequests=0;
await context.route('**/*',route=>{if(new URL(route.request().url()).origin===base)return route.continue();blockedExternalRequests++;return route.abort();});
const page=await context.newPage();
const errors=[];page.on('pageerror',error=>errors.push(error.message));
try{
 await page.goto(base+'/app');await page.waitForFunction(()=>Boolean(localStorage.getItem('one_decision_away_app_data_v1')));await page.locator('h1').first().waitFor();
 await page.evaluate(async()=>{const {getInitialDemoState,LocalDemoRepository}=await import('/src/services/repository.ts');const data=getInitialDemoState();data.profile.onboardingStep='completed';data.notebook.entries.push({id:'synthetic-private-entry',kind:'journal',title:'Synthetic private entry',content:'Synthetic private notebook line from A',dateKey:'2026-10-01',createdAt:'2026-10-01T00:00:00Z',updatedAt:'2026-10-01T00:00:00Z'});await new LocalDemoRepository().replaceAll(data);localStorage.setItem('oda_locale','en');});
 await page.goto(base+'/app/coach');await page.locator('#coach-message').waitFor();
 await page.evaluate(async()=>{
  const {cloudSync}=await import('/src/services/cloudSync.ts');window.reviewCloud=cloudSync;
  const original=window.fetch.bind(window);window.reviewRequests=[];window.reviewReleases=[];
  window.fetch=async(input,init)=>{
   if(String(input).endsWith('/functions/v1/coach-chat')){
    const body=JSON.parse(init.body);window.reviewRequests.push({body,auth:init.headers.Authorization});
    if(!body.messages.length)return Response.json({remaining:30,limit:30,tier:'coach'});
    const sequence=window.reviewReleases.length;
    return new Promise(resolve=>{window.reviewReleases.push(()=>resolve(Response.json({reply:`Synthetic account ${sequence?'B':'A'} reply`,remaining:29,limit:30,tier:'coach'})));});
   }return original(input,init);
  };
  Object.assign(cloudSync,{initialized:true,config:{url:'https://synthetic-review.supabase.co',anonKey:'fixture-public'},client:{}});
  cloudSync.setSession({access_token:'fixture-A',user:{id:'A'}});cloudSync.emit();
 });
 await page.getByText('30 of 30 messages left this month',{exact:true}).waitFor();
 await page.getByRole('checkbox',{name:'Let the coach read today’s decision and recent notebook lines'}).check();
 await page.locator('#coach-message').fill('Synthetic private account A topic');await page.locator('#coach-message').press('Enter');await page.waitForFunction(()=>window.reviewReleases.length===1);
 assert.equal(await page.evaluate(()=>window.reviewRequests.find(request=>request.body.messages.length).body.context?.journalSnippets?.[0]),'Synthetic private notebook line from A');
 await page.evaluate(()=>{window.reviewCloud.setSession({access_token:'fixture-B',user:{id:'B'}});window.reviewCloud.emit();});
 await page.waitForFunction(()=>window.reviewRequests.filter(request=>!request.body.messages.length).length===2);
 const retained=await page.getByText('Synthetic private account A topic',{exact:true}).count();
 const consentInherited=await page.getByRole('checkbox',{name:'Let the coach read today’s decision and recent notebook lines'}).isChecked();
 if(fixed){
  assert.equal(retained,0);assert.equal(consentInherited,false);
  await page.locator('#coach-message').fill('Synthetic account B question');await page.locator('#coach-message').press('Enter');await page.waitForFunction(()=>window.reviewReleases.length===2);
  await page.evaluate(()=>window.reviewReleases[0]());
  await page.waitForTimeout(80);
  assert.equal(await page.getByText('Synthetic account A reply',{exact:true}).count(),0);
  assert.equal(await page.getByRole('button',{name:'Stop response',exact:true}).count(),1,'old completion must not release B request busy state');
 }else{
  await page.evaluate(()=>window.reviewReleases[0]());await page.getByText('Synthetic account A reply',{exact:true}).waitFor();
  await page.locator('#coach-message').fill('Synthetic account B question');await page.locator('#coach-message').press('Enter');await page.waitForFunction(()=>window.reviewReleases.length===2);
 }
 await page.evaluate(()=>window.reviewReleases[1]());await page.getByText('Synthetic account B reply',{exact:true}).waitFor();
 const finalRequest=(await page.evaluate(()=>window.reviewRequests)).at(-1);
 if(fixed){assert.equal(finalRequest.auth,'Bearer fixture-B');assert.deepEqual(finalRequest.body.messages,[{role:'user',content:'Synthetic account B question'}]);assert.equal('context' in finalRequest.body,false);assert.deepEqual(errors,[]);}
 const report={at:new Date().toISOString(),mode:fixed?'after-fix':'before-fix',authenticatedAccount:finalRequest.auth==='Bearer fixture-B'?'B':'unexpected',retainedAccountATextAfterSwitch:retained,contextConsentInheritedByB:consentInherited,sentMessageCount:finalRequest.body.messages.length,sentRoles:finalRequest.body.messages.map(message=>message.role),previousAccountHistorySent:finalRequest.body.messages.some(message=>message.content.includes('account A')),previousAccountNotebookContextSent:finalRequest.body.context?.journalSnippets?.includes('Synthetic private notebook line from A')??false,pageErrorCount:errors.length,providerRequestsSent:0,externalRequestsBlocked:blockedExternalRequests};
 const out=process.env.REVIEW_OUT || 'artifacts/verification/deep-cloud';mkdirSync(out,{recursive:true});writeFileSync(`${out}/${fixed?'after':'before'}.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
