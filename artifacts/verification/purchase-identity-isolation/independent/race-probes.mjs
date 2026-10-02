import assert from 'node:assert/strict';
import { writeFileSync, readFileSync } from 'node:fs';
import { isLessonLocked, isSoundLocked } from './entitlements.mjs';
const mode = process.argv[2] ?? 'baseline';
const { PurchasesService } = await import(`./${mode}.mjs`);
const product = 'oda_pro_annual';
const ci = (tier = 'free', originalAppUserId = 'aliased-original') => ({ originalAppUserId, entitlements: { active: tier === 'free' ? {} : { [tier]: { expirationDate: '2030-01-01' } } } });
const offer = { current: { availablePackages: [{ identifier: 'annual', packageType: 'ANNUAL', product: { identifier: product, priceString: '$49.99', price: 49.99, pricePerMonthString: '$4.17', introPrice: { price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1 } } }] }, all: {} };
const gate = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const tick = () => new Promise(resolve => setImmediate(resolve));
const settle = async () => { for (let i=0;i<16;i++) await tick(); };
const until = async (fn, label) => { for (let i=0;i<80;i++) { if (fn()) return; await tick(); } throw new Error(`Bounded wait failed: ${label}`); };
const bounded = (p, label) => Promise.race([p, new Promise((_, reject) => { const t=setTimeout(() => reject(new Error(`Timeout: ${label}`)), 1000); t.unref(); })]);
const results=[];
function fixture(overrides = {}) {
  const f = { identity: '$RCAnonymous:review', anonymous: true, customer: ci(), calls: [], events: [], emit: null };
  const sdk = {
    configure: async () => { f.calls.push('configure'); },
    addCustomerInfoUpdateListener: async cb => { f.emit=cb; f.calls.push('listener'); return 'fake'; },
    getAppUserID: async () => { f.calls.push(`id:${f.identity}`); return { appUserID: f.identity }; },
    isAnonymous: async () => { f.calls.push(`anonymous:${f.anonymous}`); return { isAnonymous: f.anonymous }; },
    getCustomerInfo: async () => { f.calls.push(`customer:${f.identity}`); return { customerInfo: f.customer }; },
    getOfferings: async () => { f.calls.push('offerings'); return offer; },
    checkTrialOrIntroductoryPriceEligibility: async () => { f.calls.push('eligibility'); return { [product]: { status: 2 } }; },
    logIn: async ({ appUserID }) => { f.calls.push(`login:${appUserID}`); f.identity=appUserID; f.anonymous=false; f.customer=ci(); return { customerInfo:f.customer }; },
    logOut: async () => { f.calls.push('logout'); f.identity='$RCAnonymous:next'; f.anonymous=true; f.customer=ci(); return { customerInfo:f.customer }; },
    purchasePackage: async () => { f.calls.push('purchase'); f.customer=ci('pro'); return { customerInfo:f.customer }; },
    restorePurchases: async () => { f.calls.push('restore'); return { customerInfo:f.customer }; },
  };
  Object.assign(sdk, typeof overrides === 'function' ? overrides(f, sdk) : overrides);
  f.service = new PurchasesService({ native: () => true, key: () => 'synthetic-no-provider-key', sdk: async () => sdk });
  f.service.subscribe(() => f.events.push(structuredClone(f.service.getState())));
  return f;
}
async function probe(name, run) {
  let f;
  try { f=await run(() => f); results.push({ name, passed:true, ...(f ? { state:f.service.getState(), calls:f.calls, observations:f.observations } : {}) }); }
  catch(error) { results.push({ name, passed:false, error:error.message, ...(error.fixture ? { state:error.fixture.service.getState(), calls:error.fixture.calls, observations:error.fixture.observations } : {}) }); }
}
const check = (f, fn) => { try { fn(); } catch(e) { e.fixture=f; throw e; } };
const initialize = async f => { const loading=f.service.init(); const binding=f.service.identify(null); await Promise.all([loading,binding]); };
await probe('logout rejection cannot retain previous account Pro as ready for null identity', async () => {
  const f=fixture(f => ({ getCustomerInfo:async()=>({customerInfo:ci('pro')}), isAnonymous:async()=>({isAnonymous:false}), logOut:async()=>{f.calls.push('logout');throw new Error('offline');} }));
  await f.service.init(); await f.service.identify(null);
  check(f,()=>{ assert.equal(f.service.getState().tier,'free'); assert.equal(f.service.getState().identityConfirmed,false); assert.ok(f.service.getState().error); }); return f;
});
await probe('A then B held login serializes, invalidates A synchronously, and cannot publish A late', async () => {
  const a=gate(), b=gate(); const f=fixture(f=>({ logIn:async({appUserID})=>{f.calls.push(`login:${appUserID}`); await (appUserID==='A'?a.promise:b.promise); f.identity=appUserID;f.anonymous=false;f.customer=ci(appUserID==='A'?'pro':'free');return {customerInfo:f.customer};} }));
  await initialize(f); const pa=f.service.identify('A'); await until(()=>f.calls.includes('login:A'),'A login');
  const mark=f.events.length; const pb=f.service.identify('B'); await settle();
  const serialized=!f.calls.includes('login:B'); b.resolve(); await settle(); const beforeA=structuredClone(f.service.getState()); a.resolve(); await until(()=>f.calls.includes('login:B'),'B login'); await bounded(Promise.all([pa,pb]),'both identities');
  f.observations={BStartedBeforeAResolved:!serialized,tierAfterBResolvedBeforeA:beforeA.tier,finalSDKIdentity:f.identity,finalTier:f.service.getState().tier};
  check(f,()=>{assert.ok(serialized,'B SDK login started while A SDK mutation was outstanding'); assert.equal(f.service.getState().tier,'free'); assert.equal(f.identity,'B'); assert.ok(f.events.slice(mark).every(s=>s.tier==='free'),'old A published after B desired');}); return f;
});
await probe('held A purchase cannot grant B or return purchased after B desired', async () => {
  const hold=gate(); const f=fixture(f=>({ purchasePackage:async()=>{f.calls.push('purchase');await hold.promise;f.customer=ci('pro');return{customerInfo:f.customer};} }));
  await initialize(f); await f.service.identify('A'); const pp=f.service.purchase(product); await until(()=>f.calls.includes('purchase'),'purchase');
  const mark=f.events.length; const pb=f.service.identify('B'); await settle(); const serialized=!f.calls.includes('login:B'); hold.resolve(); const result=await bounded(pp,'purchase completion'); await bounded(pb,'B identity');f.observations={BStartedBeforePurchaseResolved:!serialized,purchaseResult:result};
  check(f,()=>{assert.ok(serialized,'B login started during purchase mutation');assert.equal(result,'failed');assert.equal(f.service.getState().tier,'free');assert.ok(f.events.slice(mark).every(s=>s.tier==='free'),'A purchase entitlement published after B desired');}); return f;
});
await probe('desired A before init cannot briefly expose cached prior SDK Pro', async () => {
  const f=fixture(f=>({ getCustomerInfo:async()=>{f.calls.push(`customer:${f.identity}`);return{customerInfo:f.customer};} })); f.customer=ci('pro'); f.identity='old-account';f.anonymous=false;
  const p=f.service.identify('A'); await bounded(Promise.all([p,f.service.init()]),'desired before init');
  check(f,()=>{assert.equal(f.identity,'A');assert.equal(f.service.getState().identityConfirmed,true);assert.equal(f.service.getState().tier,'free');assert.ok(f.events.every(s=>s.tier==='free'),'cached previous account emitted');});return f;
});
await probe('late initial customer read cannot publish old account after A desired', async () => {
  const hold=gate(); let reads=0;const f=fixture(f=>({ getCustomerInfo:async()=>{f.calls.push(`customer:${f.identity}`);return ++reads===1?hold.promise:{customerInfo:f.customer};} }));
  const pi=Promise.all([f.service.identify(null),f.service.init()]);await until(()=>reads===1,'initial read');const mark=f.events.length;const pa=f.service.identify('A'); hold.resolve({customerInfo:ci('coach')});await bounded(Promise.all([pi,pa]),'late init');
  check(f,()=>{assert.equal(f.identity,'A');assert.equal(f.service.getState().tier,'free');assert.ok(f.events.slice(mark).every(s=>s.tier==='free'),'late init old customer emitted');});return f;
});
await probe('late offerings/eligibility cannot restore previous eligible trial after B desired', async () => {
  const hold=gate(); let checks=0;const f=fixture(f=>({ checkTrialOrIntroductoryPriceEligibility:async()=>{f.calls.push('eligibility');return ++checks===1?hold.promise:{[product]:{status:1}};} }));
  const pi=initialize(f);await until(()=>checks===1,'eligibility held'); const mark=f.events.length;const pb=f.service.identify('B');hold.resolve({[product]:{status:2}});await bounded(Promise.all([pi,pb]),'eligibility transition');
  check(f,()=>{assert.equal(f.identity,'B');assert.equal(f.service.getState().products[product]?.trialEligibility,'ineligible');assert.ok(f.events.slice(mark).every(s=>s.products[product]?.trialEligibility!=='eligible'),'old trial status emitted');});return f;
});
await probe('late A restore cannot grant B or return restored', async () => {
  const hold=gate(); const f=fixture(f=>({restorePurchases:async()=>{f.calls.push('restore');await hold.promise;return{customerInfo:ci('coach')};} }));await initialize(f);await f.service.identify('A');const pr=f.service.restore();await until(()=>f.calls.includes('restore'),'restore');const mark=f.events.length;const pb=f.service.identify('B');await settle();const serialized=!f.calls.includes('login:B');hold.resolve();const result=await bounded(pr,'restore complete');await bounded(pb,'restore B');
  check(f,()=>{assert.ok(serialized,'B login overlapped restore');assert.equal(result,'failed');assert.equal(f.service.getState().tier,'free');assert.ok(f.events.slice(mark).every(s=>s.tier==='free'),'A restore applied after B desired');});return f;
});
await probe('listener ignores aliased stale payload and reads verified current SDK customer', async () => {
  const f=fixture();await initialize(f);await f.service.identify('B');f.customer=ci();f.emit(ci('coach','B'));await settle();
  check(f,()=>{assert.equal(f.service.getState().tier,'free');assert.ok(f.calls.some(s=>s==='customer:B'),'canonical current customer not read');});return f;
});
await probe('listener can refresh valid current B even when originalAppUserId names an alias', async () => {
  const f=fixture();await initialize(f);await f.service.identify('B');f.customer=ci('pro','old-aliased-A');f.emit(f.customer);await settle();
  check(f,()=>{assert.equal(f.service.getState().tier,'pro');assert.equal(f.service.getState().identityConfirmed,true);});return f;
});
await probe('listener canonical read held across B transition cannot publish A snapshot', async () => {
  const hold=gate();let holdRead=false;const f=fixture(f=>({getCustomerInfo:async()=>{f.calls.push(`customer:${f.identity}`);return holdRead?hold.promise:{customerInfo:f.customer};}}));await initialize(f);await f.service.identify('A');holdRead=true;const before=f.calls.length;f.emit(ci('pro'));await settle();const listenerReading=f.calls.slice(before).includes('customer:A');const mark=f.events.length;const pb=f.service.identify('B');holdRead=false;hold.resolve({customerInfo:ci('pro')});await bounded(pb,'listener B');await settle();
  check(f,()=>{assert.ok(listenerReading,'listener did not queue canonical read');assert.equal(f.service.getState().tier,'free');assert.ok(f.events.slice(mark).every(s=>s.tier==='free'),'held listener A snapshot emitted after B desired');});return f;
});
await probe('same requested identity can retry failed login and confirm successful second login', async () => {
  let attempts=0;const f=fixture(f=>({logIn:async({appUserID})=>{f.calls.push(`login:${appUserID}`);if(++attempts===1)throw new Error('offline');f.identity=appUserID;f.anonymous=false;f.customer=ci('pro');return{customerInfo:f.customer};}}));await initialize(f);await f.service.identify('A');const failed=structuredClone(f.service.getState());await f.service.identify('A');
  check(f,()=>{assert.equal(failed.tier,'free');assert.equal(failed.identityConfirmed,false);assert.ok(failed.error);assert.equal(attempts,2);assert.equal(f.service.getState().identityConfirmed,true);assert.equal(f.service.getState().tier,'pro');});return f;
});
await probe('confirmed A cached entitlement survives same-account offline refresh but is cleared for B', async () => {
  let fail=false;const f=fixture(f=>({logIn:async({appUserID})=>{f.calls.push(`login:${appUserID}`);if(fail)throw new Error('offline');f.identity=appUserID;f.anonymous=false;f.customer=ci('pro');return{customerInfo:f.customer};},getCustomerInfo:async()=>{f.calls.push(`customer:${f.identity}`);if(fail)throw new Error('offline');return{customerInfo:f.customer};}}));await initialize(f);await f.service.identify('A');fail=true;await f.service.identify('A');const same=structuredClone(f.service.getState());await f.service.identify('B');
  check(f,()=>{assert.equal(same.tier,'pro','confirmed same-account offline entitlement erased');assert.equal(same.identityConfirmed,true);assert.equal(f.service.getState().tier,'free');assert.equal(f.service.getState().identityConfirmed,false);assert.ok(f.service.getState().error);});return f;
});
await probe('A entitlement is cleared synchronously before B SDK login begins', async () => {
  const hold=gate();const f=fixture(f=>({logIn:async({appUserID})=>{f.calls.push(`login:${appUserID}`);if(appUserID==='B')await hold.promise;f.identity=appUserID;f.anonymous=false;f.customer=ci(appUserID==='A'?'coach':'free');return{customerInfo:f.customer};}}));await initialize(f);await f.service.identify('A');const pb=f.service.identify('B');const synchronous=structuredClone(f.service.getState());hold.resolve();await bounded(pb,'B immediate');
  check(f,()=>{assert.equal(synchronous.tier,'free');assert.equal(synchronous.renewsAt,null);assert.equal(synchronous.identityConfirmed,false);assert.ok(Object.values(synchronous.products).every(p=>p.trialEligibility==='unknown'));});return f;
});
await probe('purchase initiated while identity is unconfirmed never invokes SDK purchase', async () => {
  const hold=gate();const f=fixture(f=>({logIn:async({appUserID})=>{f.calls.push(`login:${appUserID}`);await hold.promise;f.identity=appUserID;f.anonymous=false;f.customer=ci();return{customerInfo:f.customer};}}));await initialize(f);const pb=f.service.identify('B');const pp=f.service.purchase(product);await settle();const earlyPurchase=f.calls.includes('purchase');hold.resolve();await bounded(pb,'confirm B');const result=await bounded(pp,'blocked purchase');
  check(f,()=>{assert.ok(!earlyPurchase,'SDK purchase started while B unconfirmed');assert.equal(result,'failed');assert.ok(!f.calls.includes('purchase'));});return f;
});
await probe('unbound init loads prices without reading, logging out, or publishing cached SDK identity', async () => {
  const f=fixture();f.identity='cached-A';f.anonymous=false;f.customer=ci('coach');await f.service.init();
  check(f,()=>{assert.equal(f.identity,'cached-A');assert.equal(f.service.getState().tier,'free');assert.equal(f.service.getState().identityConfirmed,false);assert.ok(f.service.getState().products[product]);assert.ok(!f.calls.some(c=>c.startsWith('customer:')||c==='logout'||c==='eligibility'));});return f;
});
await probe('unbound restore cannot call SDK or publish cached prior account', async () => {
  const f=fixture();f.identity='cached-A';f.anonymous=false;f.customer=ci('coach');await f.service.init();const result=await f.service.restore();
  check(f,()=>{assert.equal(result,'failed');assert.ok(!f.calls.includes('restore'));assert.equal(f.service.getState().tier,'free');});return f;
});
await probe('explicit startup A verifies matching cached SDK identity without logout/login', async () => {
  const f=fixture();f.identity='A';f.anonymous=false;f.customer=ci('pro');await bounded(Promise.all([f.service.identify('A'),f.service.init()]),'cached A startup');
  check(f,()=>{assert.equal(f.service.getState().tier,'pro');assert.equal(f.service.getState().identityConfirmed,true);assert.ok(!f.calls.some(c=>c==='logout'||c.startsWith('login:')));});return f;
});
await probe('listener customer completion after SDK identity drift cannot confirm old desired A', async () => {
  const hold=gate();let held=false;const f=fixture(f=>({getCustomerInfo:async()=>{f.calls.push(`customer:${f.identity}`);return held?hold.promise:{customerInfo:f.customer};}}));await initialize(f);await f.service.identify('A');held=true;const before=f.calls.length;f.emit(ci('coach'));await settle();const canonical=f.calls.slice(before).includes('customer:A');f.identity='external-B';f.anonymous=false;f.customer=ci('coach');held=false;hold.resolve({customerInfo:ci('coach')});await settle();
  check(f,()=>{assert.ok(canonical);assert.equal(f.service.getState().tier,'free');assert.equal(f.service.getState().identityConfirmed,false);});return f;
});
await probe('cached same-account startup lookup failure cannot grant unconfirmed Pro', async () => {
  const f=fixture(f=>({getAppUserID:async()=>{f.calls.push('id:failed');throw new Error('offline identity');}}));f.identity='A';f.anonymous=false;f.customer=ci('pro');await bounded(Promise.all([f.service.identify('A'),f.service.init()]),'failed startup identity');
  check(f,()=>{assert.equal(f.service.getState().tier,'free');assert.equal(f.service.getState().identityConfirmed,false);assert.ok(f.service.getState().error);});return f;
});
await probe('late offerings completion cannot publish prior personal trial after B transition', async () => {
  const hold=gate();let offers=0;const f=fixture(f=>({getOfferings:async()=>{f.calls.push('offerings');return ++offers===1?hold.promise:offer;},checkTrialOrIntroductoryPriceEligibility:async()=>{f.calls.push(`eligibility:${f.identity}`);return{[product]:{status:f.identity==='B'?1:2}};}}));const pi=initialize(f);await until(()=>offers===1,'offerings held');const mark=f.events.length;const pb=f.service.identify('B');hold.resolve(offer);await bounded(Promise.all([pi,pb]),'late offerings');
  check(f,()=>{assert.equal(f.identity,'B');assert.equal(f.service.getState().products[product]?.trialEligibility,'ineligible');assert.ok(f.events.slice(mark).every(s=>s.products[product]?.trialEligibility!=='eligible'));});return f;
});
await probe('confirmed A offline SDK identity lookup cannot start purchase or restore mutation', async () => {
  let offline=false;const f=fixture(f=>({getAppUserID:async()=>{f.calls.push(`id:${f.identity}`);if(offline)throw new Error('offline SDK identity');return{appUserID:f.identity};}}));await initialize(f);await f.service.identify('A');f.customer=ci('pro');f.emit(f.customer);await settle();offline=true;const bought=await f.service.purchase(product);const restored=await f.service.restore();
  check(f,()=>{assert.equal(bought,'failed');assert.equal(restored,'failed');assert.ok(!f.calls.includes('purchase'));assert.ok(!f.calls.includes('restore'));assert.equal(f.service.getState().tier,'pro','confirmed A access lost on offline lookup');});return f;
});
await probe('failed explicit signout retries same null request and succeeds without old account claims', async () => {
  let attempts=0;const f=fixture(f=>({logOut:async()=>{f.calls.push('logout');if(++attempts===1)throw new Error('offline');f.identity='$RCAnonymous:retry';f.anonymous=true;f.customer=ci();return{customerInfo:f.customer};}}));await initialize(f);await f.service.identify('A');f.customer=ci('pro');f.emit(f.customer);await settle();await f.service.identify(null);const failed=structuredClone(f.service.getState());await f.service.identify(null);
  check(f,()=>{assert.equal(failed.tier,'free');assert.equal(failed.identityConfirmed,false);assert.ok(failed.error);assert.equal(attempts,2);assert.equal(f.service.getState().tier,'free');assert.equal(f.service.getState().identityConfirmed,true);assert.equal(f.service.getState().error,null);});return f;
});
await probe('unknown cloud identity cancels held A purchase without SDK logout or stale tier', async () => {
  const hold=gate();const f=fixture(f=>({purchasePackage:async()=>{f.calls.push('purchase');await hold.promise;return{customerInfo:ci('pro')};}}));await initialize(f);await f.service.identify('A');const current=f.service.currentIdentityGuard();const pp=f.service.purchase(product);await until(()=>f.calls.includes('purchase'),'held deferred purchase');const mark=f.events.length;f.service.deferIdentity();const synchronous=structuredClone(f.service.getState());hold.resolve();const result=await bounded(pp,'deferred purchase');await settle();
  check(f,()=>{assert.equal(result,'failed');assert.equal(synchronous.tier,'free');assert.equal(synchronous.identityConfirmed,false);assert.equal(current(),false);assert.ok(!f.calls.includes('logout'));assert.ok(f.events.slice(mark).every(s=>s.tier==='free'));});return f;
});
await probe('unknown cloud identity during SDK configure suppresses all account operations', async () => {
  const hold=gate();const f=fixture(f=>({configure:async()=>{f.calls.push('configure');await hold.promise;}}));const pa=f.service.identify('A');await until(()=>f.calls.includes('configure'),'held configure');f.service.deferIdentity();hold.resolve();await bounded(pa,'deferred configure');await settle();
  check(f,()=>{assert.equal(f.service.getState().tier,'free');assert.equal(f.service.getState().identityConfirmed,false);assert.ok(!f.calls.some(c=>c.startsWith('customer:')||c.startsWith('login:')||c==='logout'||c==='eligibility'));});return f;
});
await probe('current identity guard stays invalid after A to B to A roundtrip', async () => {
  const f=fixture();await initialize(f);await f.service.identify('A');const old=f.service.currentIdentityGuard();assert.equal(old(),true);await f.service.identify('B');await f.service.identify('A');
  check(f,()=>{assert.equal(old(),false);assert.equal(f.service.currentIdentityGuard()(),true);});return f;
});
await probe('configured native unknown auth retains paid content gates without loading SDK', async () => {
  let sdkLoads=0;const service=new PurchasesService({native:()=>true,key:()=> 'synthetic-key',sdk:async()=>{sdkLoads++;throw new Error('SDK must not load');}});service.deferIdentity();const state=service.getState();
  assert.equal(state.available,true,'native purchase capability missing while authentication unknown');assert.equal(state.identityConfirmed,false);assert.equal(state.tier,'free');assert.equal(sdkLoads,0);assert.equal(isLessonLocked('belief',2,{gating:state.available,tier:state.tier}),true);assert.equal(isSoundLocked(2,{gating:state.available,tier:state.tier}),true);
});
await probe('web and unconfigured native defer retain open content without loading SDK', async () => {
  for(const options of [{native:()=>false,key:()=> 'synthetic-key'},{native:()=>true,key:()=>''}]){let sdkLoads=0;const service=new PurchasesService({...options,sdk:async()=>{sdkLoads++;throw new Error('SDK must not load');}});service.deferIdentity();await service.init();const state=service.getState();assert.equal(state.available,false);assert.equal(sdkLoads,0);assert.equal(isLessonLocked('belief',2,{gating:state.available,tier:state.tier}),false);assert.equal(isSoundLocked(2,{gating:state.available,tier:state.tier}),false);}
});
for(const method of ['getAppUserID','isAnonymous'])await probe(`first bound load late ${method} failure cannot retain partially confirmed Pro`, async () => {
  let reads=0;const f=fixture(f=>({logIn:async({appUserID})=>{f.calls.push(`login:${appUserID}`);f.identity=appUserID;f.anonymous=false;f.customer=ci('pro');return{customerInfo:f.customer};},[method]:async()=>{f.calls.push(`${method}:${++reads}`);if(reads===4)throw new Error('late initial identity lookup failed');return method==='getAppUserID'?{appUserID:f.identity}:{isAnonymous:f.anonymous};}}));await bounded(Promise.all([f.service.identify('A'),f.service.init()]),'late first identity verification');
  check(f,()=>{assert.ok(reads>=4);assert.equal(f.service.getState().tier,'free');assert.equal(f.service.getState().identityConfirmed,false);assert.ok(f.service.getState().error);});return f;
});
const report={mode, timestamp:new Date().toISOString(), source:JSON.parse(readFileSync(new URL(`./${mode}-source.json`,import.meta.url),'utf8')), total:results.length, passed:results.filter(r=>r.passed).length, failed:results.filter(r=>!r.passed).length, results};
writeFileSync(new URL(`./${mode}-report.json`,import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({mode,total:report.total,passed:report.passed,failed:report.failed,results:results.map(({name,passed,error})=>({name,passed,...(error?{error}:{})}))},null,2));
process.exitCode=mode==='baseline'?0:(report.failed?1:0);
