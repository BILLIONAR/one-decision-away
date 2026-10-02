import { writeFileSync } from 'node:fs';
const mode=process.argv[2]??'interim';
const { PurchasesService }=await import(`./${mode}.mjs`);
const results=[];
const ci=(tier='free')=>({entitlements:{active:tier==='free'?{}:{[tier]:{expirationDate:null}}}});
const offer={current:{availablePackages:[{identifier:'annual',packageType:'ANNUAL',product:{identifier:'oda_pro_annual',priceString:'$49',price:49,pricePerMonthString:null,introPrice:null}}]},all:{}};
for (const operation of ['purchase','restore','init']) for (const depth of [1,2,3,4,5,6]) {
 let sdkIdentity='$RCAnonymous:review',anonymous=true,customer=ci(),armed=false,checks=0,triggered=false,pb,offerReads=0;
 let releaseB;const bhold=new Promise(r=>releaseB=r);const events=[];
 const nested=(n,fn)=>queueMicrotask(()=>n>1?nested(n-1,fn):fn());
 let service;
 const sdk={configure:async()=>{},addCustomerInfoUpdateListener:async()=>'',getAppUserID:async()=>({appUserID:sdkIdentity}),isAnonymous:async()=>{const answer={isAnonymous:anonymous};if(armed&&++checks===(operation==='init'?2:2)){nested(depth,()=>{triggered=true;pb=service.identify('B');});}return answer;},getCustomerInfo:async()=>({customerInfo:customer}),getOfferings:async()=>{if(operation==='init'&&++offerReads===1)throw new Error('synthetic first plan load failure');return offer;},checkTrialOrIntroductoryPriceEligibility:async()=>({}),logIn:async({appUserID})=>{if(appUserID==='B')await bhold;sdkIdentity=appUserID;anonymous=false;customer=ci();return{customerInfo:customer};},logOut:async()=>{sdkIdentity='$RCAnonymous:review';anonymous=true;customer=ci();return{customerInfo:customer};},purchasePackage:async()=>{customer=ci('pro');return{customerInfo:customer};},restorePurchases:async()=>({customerInfo:ci('pro')})};
 service=new PurchasesService({native:()=>true,key:()=> 'synthetic-key',sdk:async()=>sdk});service.subscribe(()=>events.push({afterBDesired:triggered,...structuredClone(service.getState())}));
 await service.identify('A');if(operation!=='init')await service.init();if(operation==='init')customer=ci('pro');
 const guard=service.currentIdentityGuard();armed=true;
 const action=operation==='purchase'?service.purchase('oda_pro_annual'):operation==='restore'?service.restore():service.init();
 const result=await action;const beforeB=structuredClone(service.getState());const eventsBeforeB=events.slice();releaseB();if(pb)await pb;
 results.push({operation,depth,triggered,result,guardCurrentAfterBDesired:guard(),priorCustomerPublishedAfterBDesired:events.some(e=>e.afterBDesired&&e.tier==='pro'),invalidConfirmationBeforeBSDKCompletes:eventsBeforeB.some(e=>e.afterBDesired&&e.identityConfirmed===true&&e.ready===false),beforeB});
}
writeFileSync(new URL(`./${mode}-microtask-report.json`,import.meta.url),JSON.stringify({mode,results},null,2)+'\n');
console.log(JSON.stringify({mode,results:results.map(({beforeB,...r})=>r)},null,2));
