import test from 'node:test';
import assert from 'node:assert/strict';
import { PurchasesService, type PurchasesSDK } from '../src/services/purchases';
import { isLessonLocked, isSoundLocked } from '../src/services/entitlements';

type Method = 'configure' | 'logIn' | 'logOut' | 'getAppUserID' | 'isAnonymous'
  | 'getCustomerInfo' | 'getOfferings' | 'checkTrialOrIntroductoryPriceEligibility'
  | 'purchasePackage' | 'restorePurchases';
type Info = { originalAppUserId: string; entitlements: { active: Record<string, { expirationDate: string | null }> } };
type Call = { method: Method; appUserID: string; requestedId?: string; settled: boolean };
type Gate = { started: Call | null; release: () => void; reject: (error: unknown) => void; wait: Promise<void> };
type Plan = { gate?: Gate; error?: unknown };

const ANONYMOUS = '$RCAnonymousID:synthetic-test';
const productId = 'oda_pro_annual' as const;
const info = (id: string, tier: 'free' | 'essentials' | 'pro' | 'coach' = 'free', originalAppUserId = id): Info => ({
  originalAppUserId,
  entitlements: { active: tier === 'free' ? {} : { [tier]: { expirationDate: '2027-01-01' } } },
});
const offering = (price = '$49.99') => ({ current: { availablePackages: [{
  identifier: '$rc_annual', packageType: 'ANNUAL', product: {
    identifier: productId, priceString: price, price: 49.99, pricePerMonthString: '$4.17',
    introPrice: { price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1, cycles: 1 },
  },
}] }, all: {} });

function gate(): Gate {
  let release!: () => void;
  let reject!: (error: unknown) => void;
  const wait = new Promise<void>((resolve, fail) => { release = resolve; reject = fail; });
  return { started: null, release, reject, wait };
}

const turn = () => new Promise<void>(resolve => setImmediate(resolve));
async function until(predicate: () => boolean, message: string) {
  for (let i = 0; i < 40; i++) {
    if (predicate()) return;
    await turn();
  }
  assert.fail(message);
}

/** Mutable native SDK double. Each response belongs to the identity at call entry. */
function fixture(initialId = ANONYMOUS) {
  let currentId = initialId;
  let anonymous = initialId.startsWith('$RCAnonymousID:');
  let logoutCount = 0;
  let listener: ((customerInfo: unknown) => unknown) | undefined;
  let activeMutations = 0;
  let maxActiveMutations = 0;
  const calls: Call[] = [];
  const plans = new Map<Method, Plan[]>();
  const hooks = new Map<Method, (call: Call) => void>();
  const customers = new Map<string, Info>();
  const offerings = new Map<string, ReturnType<typeof offering>>();
  const eligibility = new Map<string, number>();
  const restoreTiers = new Map<string, 'free' | 'essentials' | 'pro' | 'coach'>();
  const mutations = new Set<Method>(['configure', 'logIn', 'logOut', 'purchasePackage', 'restorePurchases']);
  const enqueue = (method: Method, plan: Plan) => plans.set(method, [...(plans.get(method) ?? []), plan]);
  const customer = (id: string) => structuredClone(customers.get(id) ?? info(id));

  async function invoke<T>(method: Method, work: () => T, requestedId?: string): Promise<T> {
    const call: Call = { method, appUserID: currentId, requestedId, settled: false };
    calls.push(call);
    const plan = plans.get(method)?.shift();
    if (mutations.has(method)) maxActiveMutations = Math.max(maxActiveMutations, ++activeMutations);
    try {
      if (plan?.gate) { plan.gate.started = call; await plan.gate.wait; }
      if (plan && 'error' in plan) throw plan.error;
      const result = work();
      hooks.get(method)?.(call);
      return result;
    } finally {
      call.settled = true;
      if (mutations.has(method)) activeMutations--;
    }
  }

  const sdk = {
    configure: (options: { apiKey: string; appUserID?: string }) => invoke('configure', () => {
      // An unbound configure preserves the SDK's cached native account.
      if (typeof options.appUserID === 'string') { currentId = options.appUserID; anonymous = false; }
    }, options.appUserID),
    addCustomerInfoUpdateListener: async (fn: (customerInfo: unknown) => unknown) => {
      listener = fn;
      return 'synthetic-listener';
    },
    getAppUserID: () => {
      const id = currentId;
      return invoke('getAppUserID', () => ({ appUserID: id }));
    },
    isAnonymous: () => {
      const value = anonymous;
      return invoke('isAnonymous', () => ({ isAnonymous: value }));
    },
    logIn: ({ appUserID }: { appUserID: string }) => invoke('logIn', () => {
      currentId = appUserID;
      anonymous = false;
      return { customerInfo: customer(appUserID), created: false };
    }, appUserID),
    logOut: () => invoke('logOut', () => {
      currentId = `${ANONYMOUS}:logout:${++logoutCount}`;
      anonymous = true;
      return { customerInfo: customer(currentId) };
    }),
    getCustomerInfo: () => {
      const snapshot = customer(currentId);
      return invoke('getCustomerInfo', () => ({ customerInfo: snapshot }));
    },
    getOfferings: () => {
      const snapshot = structuredClone(offerings.get(currentId) ?? offering());
      return invoke('getOfferings', () => snapshot);
    },
    checkTrialOrIntroductoryPriceEligibility: ({ productIdentifiers }: { productIdentifiers: string[] }) => {
      const status = eligibility.get(currentId) ?? 0;
      return invoke('checkTrialOrIntroductoryPriceEligibility', () => Object.fromEntries(
        productIdentifiers.map(id => [id, { status, description: 'Synthetic eligibility' }])
      ));
    },
    purchasePackage: () => {
      const owner = currentId;
      return invoke('purchasePackage', () => {
        const purchased = info(owner, 'pro');
        customers.set(owner, purchased);
        return { customerInfo: structuredClone(purchased), productIdentifier: productId };
      });
    },
    restorePurchases: () => {
      const owner = currentId;
      const snapshot = restoreTiers.has(owner) ? info(owner, restoreTiers.get(owner)!) : customer(owner);
      return invoke('restorePurchases', () => {
        customers.set(owner, snapshot);
        return { customerInfo: structuredClone(snapshot) };
      });
    },
  } as unknown as PurchasesSDK;

  const service = new PurchasesService({ native: () => true, key: () => 'synthetic-not-a-provider-key', sdk: async () => sdk });
  return {
    service, calls,
    identity: () => currentId,
    driftNativeIdentity(id: string) { currentId = id; anonymous = id.startsWith('$RCAnonymousID:'); },
    maxActiveMutations: () => maxActiveMutations,
    count: (method: Method) => calls.filter(call => call.method === method).length,
    holdNext(method: Method) { const held = gate(); enqueue(method, { gate: held }); return held; },
    failNext: (method: Method, error: unknown = new Error(`Synthetic ${method} failure`)) => enqueue(method, { error }),
    failAfter(method: Method, successfulReads: number) {
      for (let i = 0; i < successfulReads; i++) enqueue(method, {});
      enqueue(method, { error: new Error(`Synthetic later ${method} failure`) });
    },
    onCall: (method: Method, hook: (call: Call) => void) => hooks.set(method, hook),
    setCustomer: (id: string, tier: Parameters<typeof info>[1], original = id) => customers.set(id, info(id, tier, original)),
    setOffering: (id: string, price: string) => offerings.set(id, offering(price)),
    setEligibility: (id: string, status: number) => eligibility.set(id, status),
    setRestoreTier: (id: string, tier: 'free' | 'essentials' | 'pro' | 'coach') => restoreTiers.set(id, tier),
    emitCustomer(payload: Info) { assert.ok(listener, 'SDK listener must be attached'); return listener(payload); },
  };
}

function locked(service: PurchasesService) {
  const state = service.getState();
  assert.equal(state.tier, 'free');
  assert.equal(state.isPro, false);
  assert.equal(state.renewsAt, null);
  assert.equal(state.identityConfirmed, false);
  assert.ok(Object.values(state.products).every(product => product?.trialEligibility === 'unknown'));
}

function watchAfterSwitch(service: PurchasesService) {
  const states: ReturnType<PurchasesService['getState']>[] = [];
  const unsubscribe = service.subscribe(() => states.push(service.getState()));
  return { states, unsubscribe };
}

test('unbound init leaves cached native A untouched and exposes prices without personal claims', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'coach');
  h.setEligibility('A', 2);
  await h.service.init();
  assert.equal(h.identity(), 'A');
  assert.equal(h.count('logIn'), 0);
  assert.equal(h.count('logOut'), 0);
  assert.equal(h.count('getCustomerInfo'), 0);
  assert.equal(h.count('checkTrialOrIntroductoryPriceEligibility'), 0);
  assert.equal(h.service.getState().products[productId]?.price, '$49.99');
  assert.equal(h.service.getState().available, true);
  locked(h.service);
  assert.equal(await h.service.purchase(productId), 'failed');
  assert.equal(await h.service.restore(), 'failed');
  assert.equal(h.count('purchasePackage'), 0);
  assert.equal(h.count('restorePurchases'), 0);
});

test('explicitly binding cached A confirms it without login or logout', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'pro');
  h.setEligibility('A', 2);
  await h.service.identify('A');
  assert.equal(h.identity(), 'A');
  assert.equal(h.count('logIn'), 0);
  assert.equal(h.count('logOut'), 0);
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.service.getState().tier, 'pro');
  assert.equal(h.service.getState().products[productId]?.trialEligibility, 'eligible');
});

test('desired B is recorded during native setup before any cached A customer read', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'coach');
  const configure = h.holdNext('configure');
  const unboundInit = h.service.init();
  await until(() => Boolean(configure.started), 'Native configure should be pending');
  const binding = h.service.identify('B');
  locked(h.service);
  const latestInit = h.service.init();
  assert.equal(latestInit, h.service.init(), 'Current desired generation must share one init promise');
  assert.equal(h.count('getCustomerInfo'), 0);
  configure.release();
  await Promise.all([unboundInit, binding, latestInit]);
  assert.equal(h.identity(), 'B');
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.service.getState().tier, 'free');
  assert.equal(h.count('configure'), 1);
  assert.ok(h.calls.filter(call => call.method === 'getCustomerInfo').every(call => call.appUserID === 'B'));
});

test('failed logout clears A claims synchronously and leaves purchase and restore denied', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'coach');
  h.setEligibility('A', 2);
  await h.service.identify('A');
  assert.equal(h.service.getState().tier, 'coach');
  const logout = h.holdNext('logOut');
  const transition = h.service.identify(null);
  locked(h.service);
  assert.equal(h.service.getState().available, true, 'Store capability is separate from identity trust');
  assert.equal(h.service.getState().ready, false);
  await until(() => Boolean(logout.started), 'Logout should start once the previous account load finishes');
  logout.reject(new Error('Synthetic offline logout'));
  await transition;
  locked(h.service);
  assert.equal(h.identity(), 'A');
  assert.equal(await h.service.purchase(productId), 'failed');
  assert.equal(await h.service.restore(), 'failed');
  assert.equal(h.count('purchasePackage'), 0);
  assert.equal(h.count('restorePurchases'), 0);
  await h.service.identify(null);
  assert.equal(h.count('logOut'), 2, 'Explicit anonymous binding must retry the failed logout');
  assert.ok(h.identity().startsWith('$RCAnonymousID:'));
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.service.getState().tier, 'free');
});

test('staged A, B, A login requests serialize native identity mutation', async () => {
  const h = fixture();
  h.setCustomer('A', 'pro');
  h.setCustomer('B', 'free');
  await h.service.identify(null);
  const firstA = h.holdNext('logIn');
  const nextB = h.holdNext('logIn');
  const lastA = h.holdNext('logIn');
  const a1 = h.service.identify('A');
  await until(() => Boolean(firstA.started), 'First A login should start');
  const b = h.service.identify('B');
  locked(h.service);
  await turn();
  assert.equal(nextB.started, null, 'B cannot mutate the SDK while A login is held');
  firstA.release();
  await until(() => Boolean(nextB.started), 'B login should follow settled A login');
  const a2 = h.service.identify('A');
  await turn();
  assert.equal(lastA.started, null, 'Latest A cannot mutate the SDK while B login is held');
  nextB.release();
  await until(() => Boolean(lastA.started), 'Latest A login should follow settled B login');
  lastA.release();
  await Promise.all([a1, b, a2]);
  assert.deepEqual(h.calls.filter(call => call.method === 'logIn').map(call => call.requestedId), ['A', 'B', 'A']);
  assert.equal(h.maxActiveMutations(), 1);
  assert.equal(h.identity(), 'A');
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.service.getState().tier, 'pro');
});

for (const cancelled of [false, true]) {
  test(`an A purchase settling after desired B ${cancelled ? 'cancellation' : 'success'} cannot grant B`, async () => {
    const h = fixture('A');
    await h.service.identify('A');
    const purchase = h.holdNext('purchasePackage');
    const purchaseResult = h.service.purchase(productId);
    await until(() => Boolean(purchase.started), 'A purchase should be held inside the SDK');
    const watch = watchAfterSwitch(h.service);
    const binding = h.service.identify('B');
    locked(h.service);
    assert.equal(await h.service.purchase(productId), 'failed');
    assert.equal(await h.service.restore(), 'failed');
    await turn();
    assert.equal(h.calls.filter(call => call.method === 'logIn' && call.requestedId === 'B').length, 0);
    if (cancelled) purchase.reject({ userCancelled: true });
    else purchase.release();
    assert.equal(await purchaseResult, 'failed', 'A superseded transaction is failed for the current app account');
    await binding;
    watch.unsubscribe();
    assert.equal(h.identity(), 'B');
    assert.equal(h.service.getState().identityConfirmed, true);
    assert.equal(h.service.getState().tier, 'free');
    assert.ok(watch.states.every(state => state.tier === 'free'), 'A entitlement must never flash after desired B');
    assert.equal(h.maxActiveMutations(), 1);
  });
}

test('a failed same-ID login can retry without treating desired ID as confirmed ID', async () => {
  const h = fixture();
  h.setCustomer('A', 'pro');
  await h.service.identify(null);
  h.failNext('logIn');
  await h.service.identify('A');
  locked(h.service);
  assert.equal(h.identity(), ANONYMOUS);
  await h.service.identify('A');
  assert.equal(h.calls.filter(call => call.method === 'logIn' && call.requestedId === 'A').length, 2);
  assert.equal(h.identity(), 'A');
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.service.getState().tier, 'pro');
});

test('an offline refresh for confirmed same A preserves its verified entitlement', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'pro');
  await h.service.identify('A');
  const canonicalRead = h.holdNext('getCustomerInfo');
  h.emitCustomer(info('A', 'free'));
  await until(() => Boolean(canonicalRead.started), 'Listener invalidation should request canonical customer info');
  canonicalRead.reject(new Error('Synthetic offline customer refresh'));
  await turn(); await turn();
  assert.equal(h.service.getState().tier, 'pro');
  assert.equal(h.service.getState().identityConfirmed, true);
  await h.service.identify('A');
  assert.equal(h.identity(), 'A');
  assert.equal(h.service.getState().tier, 'pro');
  assert.equal(h.count('logIn'), 0);
  assert.equal(h.count('logOut'), 0);
});

test('listener payload is only invalidation and canonical aliases do not impersonate another account', async () => {
  const h = fixture('B');
  h.setCustomer('B', 'essentials', 'old-original-A-alias');
  await h.service.identify('B');
  assert.equal(h.service.getState().tier, 'essentials');
  const before = h.count('getCustomerInfo');
  h.emitCustomer(info('A', 'coach', 'B'));
  await until(() => h.count('getCustomerInfo') > before, 'A stale payload must cause a canonical read');
  await turn();
  assert.equal(h.service.getState().tier, 'essentials');
  assert.equal(h.service.getState().identityConfirmed, true);
  h.setCustomer('B', 'free', 'old-original-A-alias');
  const second = h.count('getCustomerInfo');
  h.emitCustomer(info('A', 'coach', 'A'));
  await until(() => h.count('getCustomerInfo') > second, 'Canonical revocation must be refreshed');
  await until(() => h.service.getState().tier === 'free', 'B canonical revocation should replace the old entitlement');
  assert.equal(h.identity(), 'B');
  assert.equal(h.service.getState().identityConfirmed, true);
});

test('late A offerings cannot install A packages or personal claims into desired B', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'coach');
  h.setOffering('A', '$99.00');
  h.setOffering('B', '$19.00');
  const offers = h.holdNext('getOfferings');
  const a = h.service.identify('A');
  await until(() => Boolean(offers.started), 'A offerings should be pending');
  const watch = watchAfterSwitch(h.service);
  const b = h.service.identify('B');
  locked(h.service);
  await turn();
  assert.equal(h.calls.filter(call => call.method === 'logIn' && call.requestedId === 'B').length, 0);
  offers.release();
  await Promise.all([a, b]);
  watch.unsubscribe();
  assert.equal(h.identity(), 'B');
  assert.equal(h.service.getState().products[productId]?.price, '$19.00');
  assert.equal(h.service.getState().tier, 'free');
  assert.ok(watch.states.every(state => state.tier === 'free'));
});

test('late A trial eligibility cannot restore a free-trial claim during a B transition', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'pro');
  h.setEligibility('A', 2);
  h.setEligibility('B', 1);
  const eligibility = h.holdNext('checkTrialOrIntroductoryPriceEligibility');
  const a = h.service.identify('A');
  await until(() => Boolean(eligibility.started), 'A eligibility should be pending');
  const watch = watchAfterSwitch(h.service);
  const b = h.service.identify('B');
  locked(h.service);
  eligibility.release();
  await Promise.all([a, b]);
  watch.unsubscribe();
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.service.getState().products[productId]?.trialEligibility, 'ineligible');
  assert.ok(watch.states.every(state => state.products[productId]?.trialEligibility !== 'eligible'));
  assert.ok(watch.states.every(state => state.tier === 'free'));
});

test('a held A customer load from initialization cannot overwrite a later desired B', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'coach');
  const read = h.holdNext('getCustomerInfo');
  const a = h.service.identify('A');
  await until(() => Boolean(read.started), 'A customer load should be pending');
  const watch = watchAfterSwitch(h.service);
  const b = h.service.identify('B');
  locked(h.service);
  read.release();
  await Promise.all([a, b]);
  watch.unsubscribe();
  assert.equal(h.identity(), 'B');
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.service.getState().tier, 'free');
  assert.ok(watch.states.every(state => state.tier === 'free'));
});

test('an A restore settling after desired B fails without applying A customer info', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'pro');
  h.setRestoreTier('A', 'coach');
  await h.service.identify('A');
  const restore = h.holdNext('restorePurchases');
  const restored = h.service.restore();
  await until(() => Boolean(restore.started), 'A restore should be pending');
  const watch = watchAfterSwitch(h.service);
  const b = h.service.identify('B');
  locked(h.service);
  await turn();
  assert.equal(h.calls.filter(call => call.method === 'logIn' && call.requestedId === 'B').length, 0);
  restore.release();
  assert.equal(await restored, 'failed');
  await b;
  watch.unsubscribe();
  assert.equal(h.identity(), 'B');
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.service.getState().tier, 'free');
  assert.ok(watch.states.every(state => state.tier === 'free'));
  assert.equal(h.maxActiveMutations(), 1);
});

test('defer during a held purchase drops trust without native calls and explicit cached-A rebind refreshes it', async () => {
  const h = fixture('A');
  await h.service.identify('A');
  const purchase = h.holdNext('purchasePackage');
  const result = h.service.purchase(productId);
  await until(() => Boolean(purchase.started), 'A purchase should be pending');
  const callCount = h.calls.length;
  const revision = h.service.getState().identityRevision;
  const guard = h.service.currentIdentityGuard();
  h.service.deferIdentity();
  locked(h.service);
  assert.equal(h.service.getState().available, true);
  assert.equal(h.service.getState().ready, true);
  assert.equal(h.service.getState().identityRevision, revision + 1);
  assert.equal(guard(), false);
  assert.equal(h.calls.length, callCount, 'Deferring cloud identity must never mutate the native SDK');
  purchase.release();
  assert.equal(await result, 'failed');
  locked(h.service);
  assert.equal(h.identity(), 'A');
  await h.service.identify('A');
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.service.getState().tier, 'pro', 'Only the explicit rebind may publish the completed native purchase');
  assert.equal(h.count('logIn'), 0);
  assert.equal(h.count('logOut'), 0);
});

test('defer during first native setup cancels the old A load and leaves cached A for an explicit rebind', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'coach');
  const configure = h.holdNext('configure');
  const binding = h.service.identify('A');
  await until(() => Boolean(configure.started), 'Native setup should be held');
  const callCount = h.calls.length;
  h.service.deferIdentity();
  locked(h.service);
  assert.equal(h.calls.length, callCount);
  configure.release();
  await binding;
  locked(h.service);
  assert.equal(h.count('getCustomerInfo'), 0, 'Superseded setup must not read or publish cached A');
  assert.equal(h.identity(), 'A');
  await h.service.identify('A');
  assert.equal(h.service.getState().tier, 'coach');
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.count('configure'), 1);
  assert.equal(h.count('logIn'), 0);
  assert.equal(h.count('logOut'), 0);
});

test('defer and immediate same-A rebind cannot accept the older held A customer snapshot', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'coach');
  const read = h.holdNext('getCustomerInfo');
  const original = h.service.identify('A');
  await until(() => Boolean(read.started), 'Original A customer load should be held');
  h.service.deferIdentity();
  locked(h.service);
  const watch = watchAfterSwitch(h.service);
  h.setCustomer('A', 'free');
  const latestRead = h.holdNext('getCustomerInfo');
  const rebound = h.service.identify('A');
  locked(h.service);
  await turn();
  assert.equal(h.count('getCustomerInfo'), 1, 'The fresh rebind must wait for the old customer read');
  read.release();
  await until(() => Boolean(latestRead.started), 'Replacement A load should start after the old read settles');
  await original;
  assert.equal(h.service.init(), rebound, 'The old finally must not clear the replacement load’s shared promise');
  assert.equal(h.service.init(), rebound);
  latestRead.release();
  await Promise.all([original, rebound]);
  watch.unsubscribe();
  assert.equal(h.service.getState().identityConfirmed, true);
  assert.equal(h.service.getState().tier, 'free');
  assert.ok(watch.states.every(state => state.tier === 'free'), 'Same ID text must not revive the old revision’s coach snapshot');
  assert.equal(h.count('getCustomerInfo'), 2);
  assert.equal(h.count('logIn'), 0);
  assert.equal(h.count('logOut'), 0);
});

test('canonical A listener refresh rejects its held snapshot if native identity externally drifts to B', async () => {
  const h = fixture('A');
  h.setCustomer('A', 'pro');
  await h.service.identify('A');
  h.setCustomer('A', 'coach');
  const read = h.holdNext('getCustomerInfo');
  h.emitCustomer(info('A', 'coach'));
  await until(() => Boolean(read.started), 'Canonical A refresh should be held');
  h.driftNativeIdentity('B');
  read.release();
  await until(() => !h.service.getState().identityConfirmed, 'Post-read native mismatch must revoke A confirmation');
  locked(h.service);
  assert.equal(h.identity(), 'B');
  assert.equal(await h.service.purchase(productId), 'failed');
  assert.equal(await h.service.restore(), 'failed');
  assert.equal(h.count('purchasePackage'), 0);
  assert.equal(h.count('restorePurchases'), 0);
});

for (const method of ['getAppUserID', 'isAnonymous'] as const) {
  for (const read of [1, 2, 3, 4]) {
    test(`initial ${method} failure at verification read ${read} leaves A unconfirmed/free and retryable`, async () => {
      const h = fixture('A');
      h.setCustomer('A', 'coach');
      h.setEligibility('A', 2);
      h.failAfter(method, read - 1);
      await h.service.identify('A');
      assert.equal(h.count(method), read, 'The failure must land at the specified initial verification boundary');
      locked(h.service);
      assert.equal(h.service.getState().error, 'identity-unconfirmed');
      assert.equal(await h.service.purchase(productId), 'failed');
      assert.equal(await h.service.restore(), 'failed');
      assert.equal(h.count('purchasePackage'), 0);
      assert.equal(h.count('restorePurchases'), 0);
      await h.service.identify('A');
      assert.equal(h.service.getState().tier, 'coach');
      assert.equal(h.service.getState().identityConfirmed, true);
      assert.equal(h.count('logIn'), 0);
      assert.equal(h.count('logOut'), 0);
    });
  }
}

test('native paid gates apply before SDK init and after defer while the free samples stay open', async () => {
  const h = fixture('A');
  const assertFreeNativeGates = () => {
    locked(h.service);
    const state = h.service.getState();
    const gates = { gating: state.available, tier: state.tier };
    assert.equal(state.available, true);
    assert.equal(isLessonLocked('focus', 2, gates), true);
    assert.equal(isSoundLocked(2, gates), true);
    for (const index of [0, 1]) {
      assert.equal(isLessonLocked('focus', index, gates), false);
      assert.equal(isSoundLocked(index, gates), false);
    }
    assert.equal(isLessonLocked('turning-day', 2, gates), false);
  };
  assertFreeNativeGates();
  assert.equal(h.service.getState().ready, false);
  assert.equal(h.calls.length, 0);
  h.service.deferIdentity();
  assertFreeNativeGates();
  assert.equal(h.service.getState().ready, true);
  assert.equal(h.calls.length, 0);
});

test('web and keyless native gates stay open before init and after defer without loading an SDK', async () => {
  for (const options of [{ native: () => false, key: () => 'synthetic-key' }, { native: () => true, key: () => '' }]) {
    let loads = 0;
    const service = new PurchasesService({ ...options, sdk: async () => { loads++; throw new Error('SDK must stay unloaded'); } });
    for (const deferred of [false, true]) {
      if (deferred) service.deferIdentity();
      const state = service.getState();
      const gates = { gating: state.available, tier: state.tier };
      assert.equal(state.available, false);
      assert.equal(state.ready, true);
      assert.equal(isLessonLocked('focus', 2, gates), false);
      assert.equal(isSoundLocked(2, gates), false);
      assert.equal(isLessonLocked('turning-day', 2, gates), false);
    }
    await service.init();
    await service.identify('A');
    assert.equal(await service.purchase(productId), 'failed');
    assert.equal(await service.restore(), 'failed');
    assert.equal(loads, 0);
  }
});

function nestedMicrotask(depth: number, callback: () => void) {
  queueMicrotask(() => depth > 1 ? nestedMicrotask(depth - 1, callback) : callback());
}

for (const operation of ['purchase', 'restore', 'init'] as const) {
  for (const depth of [2, 3]) {
    test(`${operation} cannot commit A after desired B arrives in nested verification microtask depth ${depth}`, async () => {
      const h = fixture('A');
      if (operation === 'init') h.failNext('getOfferings'); // A remains confirmed but needs a plan-load retry.
      await h.service.identify('A');
      h.setRestoreTier('A', 'pro');
      if (operation === 'init') h.setCustomer('A', 'pro');
      const guard = h.service.currentIdentityGuard();
      const bLogin = h.holdNext('logIn');
      let checks = 0;
      let switched = false;
      let binding: Promise<void> | undefined;
      const afterDesiredB: ReturnType<PurchasesService['getState']>[] = [];
      const unsubscribe = h.service.subscribe(() => { if (switched) afterDesiredB.push(h.service.getState()); });
      h.onCall('isAnonymous', () => {
        if (++checks === 2) nestedMicrotask(depth, () => {
          switched = true;
          binding = h.service.identify('B');
        });
      });
      const result = await (operation === 'purchase' ? h.service.purchase(productId)
        : operation === 'restore' ? h.service.restore() : h.service.init());
      await until(() => Boolean(bLogin.started), 'Nested switch must happen before the old operation returns');
      try {
        assert.equal(switched, true, 'The requested nested callback schedule must run');
        assert.equal(guard(), false);
        if (operation !== 'init') assert.equal(result, 'failed', 'Superseded transactions must not report success');
        locked(h.service);
        assert.ok(afterDesiredB.length > 0);
        assert.ok(afterDesiredB.every(state => state.tier === 'free'), 'No old A entitlement may publish after B is desired');
        assert.ok(afterDesiredB.every(state => !state.identityConfirmed), 'B must not be falsely confirmed before its held native login');
      } finally {
        bLogin.release();
        await binding;
        unsubscribe();
      }
      assert.equal(h.identity(), 'B');
      assert.equal(h.service.getState().identityConfirmed, true);
      assert.equal(h.service.getState().tier, 'free');
    });
  }
}
