import test from 'node:test';
import assert from 'node:assert/strict';
import { PurchasesService, trialDaysOf, type PurchasesSDK } from '../src/services/purchases';
import { confirmedTrialDays, purchaseErrorResult } from '../src/services/purchaseStatus';
import { purchaseCopy, purchaseFeedback } from '../src/i18n/purchases';

const customer = (active: Record<string, { expirationDate: string | null }> = {}) => ({ entitlements: { active } });
const packageFixture = {
  identifier: '$rc_annual', packageType: 'ANNUAL', product: {
    identifier: 'oda_pro_annual', priceString: '$49.99', price: 49.99, pricePerMonthString: '$4.17',
    introPrice: { price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1, cycles: 1 },
  },
};
const offerings = { current: { availablePackages: [packageFixture] }, all: {} };

function setup(overrides: Record<string, unknown> = {}, eligibility = 2) {
  const calls = { load: 0, configure: 0, listener: 0, offerings: 0, eligibility: 0, purchase: 0 };
  let listener: ((info: unknown) => void) | undefined;
  let currentId = '$RCAnonymousID:readiness', anonymous = true, currentCustomer = customer();
  const sdk = {
    configure: async () => { calls.configure++; },
    addCustomerInfoUpdateListener: async (fn: (info: unknown) => void) => { calls.listener++; listener = fn; return 'mock-listener'; },
    getCustomerInfo: async () => ({ customerInfo: currentCustomer }),
    getOfferings: async () => { calls.offerings++; return offerings; },
    checkTrialOrIntroductoryPriceEligibility: async ({ productIdentifiers }: { productIdentifiers: string[] }) => {
      calls.eligibility++; assert.deepEqual(productIdentifiers, ['oda_pro_annual']);
      return { oda_pro_annual: { status: eligibility, description: 'mock status' } };
    },
    purchasePackage: async () => { calls.purchase++; currentCustomer = customer({ pro: { expirationDate: null } }); return { customerInfo: currentCustomer }; },
    restorePurchases: async () => ({ customerInfo: customer() }),
    logIn: async ({ appUserID }: { appUserID: string }) => { currentId = appUserID; anonymous = false; currentCustomer = customer(); return { customerInfo: currentCustomer }; },
    logOut: async () => { currentId = '$RCAnonymousID:readiness'; anonymous = true; currentCustomer = customer(); return { customerInfo: currentCustomer }; },
    getAppUserID: async () => ({ appUserID: currentId }), isAnonymous: async () => ({ isAnonymous: anonymous }),
    ...overrides,
  } as unknown as PurchasesSDK;
  const service = new PurchasesService({ native: () => true, key: () => 'mock-key-not-a-provider-key', sdk: async () => { calls.load++; return sdk; } });
  // These plan/purchase fixtures explicitly model an anonymous ODA account.
  // The production default remains unbound until cloud hydration completes.
  const init = service.init.bind(service);
  let bound = false;
  service.init = () => { if (!bound) { bound = true; return service.identify(null); } return init(); };
  return { service, sdk, calls, emitCustomer: async (info: ReturnType<typeof customer>) => {
    currentCustomer = info; listener!(info);
    await new Promise(resolve => setImmediate(resolve));
  } };
}

test('offerings failure is retryable without configuring or listening twice', async () => {
  let attempts = 0;
  const { service, calls } = setup({ getOfferings: async () => { if (++attempts === 1) throw new Error('mock network interruption'); return offerings; } });
  await service.init();
  assert.equal(service.getState().ready, true); assert.equal(service.getState().error, 'unavailable'); assert.deepEqual(service.getState().products, {});
  await service.init();
  assert.equal(service.getState().error, null); assert.equal(service.getState().products.oda_pro_annual?.price, '$49.99');
  assert.equal(attempts, 2); assert.equal(calls.configure, 1); assert.equal(calls.listener, 1); assert.equal(calls.load, 1);
});

test('concurrent initialization shares one pending configure and plan load', async () => {
  let release!: () => void; const held = new Promise<void>(resolve => { release = resolve; }); let configurations = 0;
  const { service, calls } = setup({ configure: async () => { configurations++; await held; } });
  const first = service.init(); const second = service.init(); assert.equal(first, second);
  await new Promise(resolve => setImmediate(resolve)); assert.equal(configurations, 1); assert.equal(service.getState().ready, false);
  release(); await Promise.all([first, second, service.init()]);
  assert.equal(calls.listener, 1); assert.equal(calls.offerings, 1); assert.equal(calls.eligibility, 1); assert.equal(calls.load, 1);
});

test('failed configuration can retry, while a completed setup remains single', async () => {
  let attempts = 0;
  const { service, calls } = setup({ configure: async () => { if (++attempts === 1) throw new Error('mock configure failure'); } });
  await service.init(); await service.init(); await service.init();
  assert.equal(attempts, 2); assert.equal(calls.listener, 1); assert.equal(service.getState().error, null);
});

test('listener setup failure retries the listener without configuring again', async () => {
  let attempts = 0;
  const { service, calls } = setup({ addCustomerInfoUpdateListener: async () => { if (++attempts === 1) throw new Error('mock listener failure'); return 'mock-listener'; } });
  await service.init(); await service.init();
  assert.equal(calls.configure, 1); assert.equal(calls.load, 1); assert.equal(attempts, 2); assert.equal(service.getState().error, null);
});

test('a successful empty offering may retry when plans become available', async () => {
  let attempts = 0; const { service, calls } = setup({ getOfferings: async () => ++attempts === 1 ? { current: null, all: {} } : offerings });
  await service.init(); assert.equal(service.getState().error, 'no-plans');
  await service.init(); assert.equal(service.getState().error, null); assert.equal(calls.configure, 1);
});

test('free intro pricing is advertised only for confirmed eligible customers', async () => {
  for (const [status, expected, days] of [[2, 'eligible', 7], [1, 'ineligible', null], [0, 'unknown', null], [3, 'ineligible', null]] as const) {
    const { service } = setup({}, status); await service.init(); const product = service.getState().products.oda_pro_annual!;
    assert.equal(product.trialEligibility, expected); assert.equal(confirmedTrialDays(product), days); assert.equal(product.price, '$49.99');
  }
});

test('missing or failed eligibility checks keep regular prices and unknown trial status', async () => {
  for (const method of [undefined, async () => ({}), async () => { throw new Error('mock eligibility interruption'); }]) {
    const { service } = setup({ checkTrialOrIntroductoryPriceEligibility: method }); await service.init();
    assert.equal(service.getState().error, null); const product = service.getState().products.oda_pro_annual!;
    assert.equal(product.trialEligibility, 'unknown'); assert.equal(confirmedTrialDays(product), null); assert.equal(product.price, '$49.99');
  }
});

test('an interrupted eligibility refresh after identity change clears the earlier free-trial claim', async () => {
  let checks = 0;
  const { service, calls } = setup({ checkTrialOrIntroductoryPriceEligibility: async () => {
    if (++checks > 1) throw new Error('mock eligibility refresh interruption');
    return { oda_pro_annual: { status: 2, description: 'mock eligible' } };
  } });
  await service.init(); assert.equal(confirmedTrialDays(service.getState().products.oda_pro_annual), 7);
  await service.identify('mock-user');
  assert.equal(service.getState().products.oda_pro_annual?.trialEligibility, 'unknown');
  assert.equal(confirmedTrialDays(service.getState().products.oda_pro_annual), null); assert.equal(calls.configure, 1);
});

test('cancelled, pending and failed purchase errors remain distinct and never grant access', async () => {
  for (const [error, expected] of [[{ code: '1' }, 'cancelled'], [{ userCancelled: true }, 'cancelled'], [{ code: 20 }, 'pending'], [{ code: '10' }, 'failed']] as const) {
    const { service } = setup({ purchasePackage: async () => { throw error; } }); await service.init();
    assert.equal(await service.purchase('oda_pro_annual'), expected); assert.equal(service.getState().tier, 'free');
  }
  assert.equal(purchaseErrorResult(null), 'failed');
});

test('a successful store response without the requested entitlement remains unconfirmed', async () => {
  const { service } = setup({ purchasePackage: async () => ({ customerInfo: customer({ essentials: { expirationDate: null } }) }) });
  await service.init(); assert.equal(await service.purchase('oda_pro_annual'), 'unconfirmed'); assert.equal(service.getState().tier, 'essentials');
});

test('confirmed entitlement grants access and later SDK updates retain the real highest level', async () => {
  const { service, emitCustomer, calls } = setup(); await service.init();
  assert.equal(await service.purchase('oda_pro_annual'), 'purchased'); assert.equal(service.getState().isPro, true);
  await emitCustomer(customer({ coach: { expirationDate: '2027-01-01' } })); assert.equal(service.getState().tier, 'coach'); assert.equal(service.getState().renewsAt, '2027-01-01');
  assert.equal(calls.configure, 1); assert.equal(calls.listener, 1);
});

test('restore distinguishes store failure, successful no-plan check, and active entitlement', async () => {
  for (const [method, expected] of [[async () => { throw new Error('mock store interruption'); }, 'failed'], [async () => ({ customerInfo: customer() }), 'not-found'], [async () => ({ customerInfo: customer({ pro: { expirationDate: null } }) }), 'restored']] as const) {
    const { service } = setup({ restorePurchases: method }); await service.init(); assert.equal(await service.restore(), expected);
  }
});

test('web and unconfigured native flows never load a purchase SDK or create a purchase', async () => {
  for (const options of [{ native: () => false, key: () => 'mock-key' }, { native: () => true, key: () => '' }]) {
    let loads = 0; const service = new PurchasesService({ ...options, sdk: async () => { loads++; throw new Error('must not load'); } });
    await service.init(); await service.init(); assert.equal(await service.purchase('oda_pro_annual'), 'failed'); assert.equal(await service.restore(), 'failed');
    assert.equal(loads, 0); assert.equal(service.getState().available, false); assert.equal(service.getState().ready, true);
  }
});

test('free duration uses valid store units and cycles, without inventing 30-day months', () => {
  assert.equal(trialDaysOf({ price: 0, periodUnit: 'DAY', periodNumberOfUnits: 7, cycles: 2 }), 14);
  assert.equal(trialDaysOf({ price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1 }), 7);
  assert.equal(trialDaysOf({ price: 0, periodUnit: 'MONTH', periodNumberOfUnits: 1 }), null);
  for (const periodNumberOfUnits of [0, -1, 1.5, Infinity]) assert.equal(trialDaysOf({ price: 0, periodUnit: 'DAY', periodNumberOfUnits }), null);
});

test('scoped EN/TR/ES uncertain purchase feedback makes no charge or reminder guarantee', () => {
  for (const locale of ['en', 'tr', 'es'] as const) {
    for (const result of ['cancelled', 'pending', 'unconfirmed', 'failed'] as const) assert.ok(purchaseFeedback(result, locale).length > 15);
    assert.ok(purchaseCopy(locale).unknownTrial.includes('App Store'));
  }
  assert.doesNotMatch(purchaseFeedback('failed', 'en'), /not charged|no charge/i);
  assert.doesNotMatch(purchaseCopy('en').trialEndBody, /remind/i);
});
