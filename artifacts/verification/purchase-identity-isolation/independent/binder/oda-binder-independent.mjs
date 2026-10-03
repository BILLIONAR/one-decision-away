import fs from 'node:fs';
import crypto from 'node:crypto';

// Every storage entry, account and auth adapter below is synthetic and in memory.
const storage = new Map();
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
let fetchCalls = 0;
globalThis.fetch = async () => { fetchCalls++; throw new Error('Network prohibited in independent synthetic probe'); };
const { cloudSync } = await import('/workspace/oda-purchase-identity-fix/src/services/cloudSync.ts');
const { bindPurchaseIdentity, refreshPurchaseIdentity } = await import('/workspace/oda-purchase-identity-fix/src/services/purchaseIdentityBinding.ts');
const CloudSync = cloudSync.constructor;
const deferred = () => { let resolve, reject; const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; }); return { promise, resolve, reject }; };
const flush = async () => { for (let i = 0; i < 24; i++) await Promise.resolve(); };
const session = id => id === null ? null : { user: { id } };
function fixture() {
  const source = new CloudSync();
  Object.assign(source, { config: { url: 'https://synthetic-project-a.invalid', anonKey: 'synthetic-public-fixture' }, client: null, session: null, initialized: false, initializing: null, scopeRevision: 0, error: null });
  const calls = [], sdk = { cachedIdentity: 'synthetic-cached-old-account' };
  const target = { deferIdentity: () => { calls.push({ action: 'defer' }); }, identify: async id => { calls.push({ action: 'identify', id }); sdk.cachedIdentity = id; }, init: async () => { calls.push({ action: 'purchase-init', cachedIdentity: sdk.cachedIdentity }); } };
  const adapters = new Map();
  source.getClient = async () => {
    const key = source.config.url;
    if (!adapters.has(key)) { const gate = deferred(); const client = { auth: { getSession: () => gate.promise, onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } }; adapters.set(key, { gate, client }); }
    const item = adapters.get(key); source.client = item.client; return item.client;
  };
  const emit = id => { source.setSession(session(id)); source.emit(); };
  return { source, target, sdk, calls, adapters, emit };
}

const cases = [], failures = [];
const mutations = calls => calls.filter(item => item.action !== 'defer');
for (const id of [null, 'synthetic-A']) {
  const f = fixture(), binding = bindPurchaseIdentity(f.source, f.target);
  await flush();
  const untouchedWhileHydrationPending = mutations(f.calls).length === 0 && f.sdk.cachedIdentity === 'synthetic-cached-old-account';
  f.source.emit();
  const transientIgnored = mutations(f.calls).length === 0;
  f.adapters.get('https://synthetic-project-a.invalid').gate.resolve({ data: { session: session(id) } });
  await binding.ready; await flush();
  const initialMutations = mutations(f.calls);
  const firstPurchase = initialMutations.findIndex(item => item.action === 'purchase-init');
  const currentIdentityAfterHydration = firstPurchase > 0 && initialMutations.slice(0, firstPurchase).every(item => item.action === 'identify' && item.id === id);
  f.emit('synthetic-B'); f.emit('synthetic-B'); f.emit(null); await flush();
  const sameIdRetryNotDropped = f.calls.filter(item => item.action === 'identify' && item.id === 'synthetic-B').length === 2;
  binding.dispose(); f.emit('synthetic-after-dispose'); await flush();
  const disposedIgnored = !f.calls.some(item => item.id === 'synthetic-after-dispose');
  const item = { case: `hydrate-${id === null ? 'null' : 'A'}`, untouchedWhileHydrationPending, transientIgnored, currentIdentityAfterHydration, sameIdRetryNotDropped, disposedIgnored, calls: f.calls };
  for (const key of ['untouchedWhileHydrationPending', 'transientIgnored', 'currentIdentityAfterHydration', 'sameIdRetryNotDropped', 'disposedIgnored']) if (!item[key]) failures.push({ case: item.case, failure: key });
  cases.push(item);
}
{
  const f = fixture(), binding = bindPurchaseIdentity(f.source, f.target); await flush();
  f.adapters.get('https://synthetic-project-a.invalid').gate.reject(new Error('Synthetic hydration failure'));
  let rejected = false; try { await binding.ready; } catch { rejected = true; } await flush();
  const noSDKIdentityMutationAfterHydrationFailure = mutations(f.calls).length === 0;
  cases.push({ case: 'actual-cloud-init-catches-hydration-failure', cloudError: f.source.getState().error, readyRejected: rejected, noSDKIdentityMutationAfterHydrationFailure, calls: f.calls });
  if (!noSDKIdentityMutationAfterHydrationFailure) failures.push({ case: 'actual-cloud-init-catches-hydration-failure', failure: 'Binder trusts fulfilled initialization even when cloud auth hydration failed' });
  f.adapters.get('https://synthetic-project-a.invalid').client.auth.getSession = async () => ({ data: { session: session('synthetic-retry-A') } });
  await refreshPurchaseIdentity(f.source, f.target); await flush();
  const retryRestoresCorrectIdentity = f.calls.some(item => item.action === 'identify' && item.id === 'synthetic-retry-A') && f.source.isSessionReady();
  cases.push({ case: 'retry-after-thrown-hydration-error', retryRestoresCorrectIdentity, calls: f.calls });
  if (!retryRestoresCorrectIdentity) failures.push({ case: 'retry-after-thrown-hydration-error', failure: 'same-source explicit retry did not restore identity' });
  binding.dispose();
}
{
  const f = fixture(), binding = bindPurchaseIdentity(f.source, f.target); await flush();
  f.adapters.get('https://synthetic-project-a.invalid').gate.resolve({ data: { session: null }, error: new Error('Synthetic returned auth error') });
  await binding.ready; await flush();
  const returnedErrorCannotAssertAnonymous = mutations(f.calls).length === 0;
  cases.push({ case: 'getSession-returns-error-result', returnedErrorCannotAssertAnonymous, isSessionReady: f.source.isSessionReady(), cloudError: f.source.getState().error, calls: f.calls });
  if (!returnedErrorCannotAssertAnonymous) failures.push({ case: 'getSession-returns-error-result', failure: 'Cloud auth returned an error result but binder asserted anonymous and initialized purchases' });
  binding.dispose();
}
{
  const f = fixture(), binding = bindPurchaseIdentity(f.source, f.target); await flush();
  const old = f.adapters.get('https://synthetic-project-a.invalid');
  f.source.setConfig('https://synthetic-project-b.invalid', 'synthetic-public-fixture');
  const currentInit = f.source.init(); await flush();
  old.gate.resolve({ data: { session: session('synthetic-obsolete-A') } });
  await flush();
  const callsBeforeCurrentScopeHydrated = structuredClone(f.calls);
  const obsoleteScopeCannotBind = mutations(f.calls).length === 0;
  f.adapters.get('https://synthetic-project-b.invalid').gate.resolve({ data: { session: session('synthetic-B') } });
  await currentInit; try { await binding.ready; } catch {} await flush();
  cases.push({ case: 'obsolete-hydration-resolves-before-new-scope', obsoleteScopeCannotBind, callsBeforeCurrentScopeHydrated, neverBoundOldA: !f.calls.some(item => item.id === 'synthetic-obsolete-A'), finalCalls: f.calls });
  if (!obsoleteScopeCannotBind) failures.push({ case: 'obsolete-hydration-resolves-before-new-scope', failure: 'Old scope completion announced an identity before current scope hydration finished' });
  binding.dispose();
}
{
  const f = fixture(), binding = bindPurchaseIdentity(f.source, f.target); await flush(); binding.dispose();
  f.adapters.get('https://synthetic-project-a.invalid').gate.resolve({ data: { session: session('synthetic-A') } });
  await binding.ready; await flush();
  const noMutationAfterDispose = mutations(f.calls).length === 0;
  cases.push({ case: 'dispose-before-hydration', noMutationAfterDispose, calls: f.calls });
  if (!noMutationAfterDispose) failures.push({ case: 'dispose-before-hydration', failure: 'disposed binder still mutated target' });
}
console.log(JSON.stringify({ evidence: 'Actual binding helper plus actual CloudSync initialization in Node, synthetic in-memory auth adapters only. No provider/native SDK/account data.', sourceSha256: Object.fromEntries(['src/main.tsx', 'src/services/purchaseIdentityBinding.ts', 'src/services/cloudSync.ts'].map(path => [path, crypto.createHash('sha256').update(fs.readFileSync(`/workspace/oda-purchase-identity-fix/${path}`)).digest('hex')])), fetchCalls, cases, failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
