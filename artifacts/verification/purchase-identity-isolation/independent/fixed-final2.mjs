var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// <define:import.meta.env>
var define_import_meta_env_default;
var init_define_import_meta_env = __esm({
  "<define:import.meta.env>"() {
    define_import_meta_env_default = {};
  }
});

// mock:@revenuecat/purchases-capacitor
var purchases_capacitor_exports = {};
__export(purchases_capacitor_exports, {
  Purchases: () => Purchases
});
var Purchases;
var init_purchases_capacitor = __esm({
  "mock:@revenuecat/purchases-capacitor"() {
    init_define_import_meta_env();
    Purchases = new Proxy({}, { get() {
      throw new Error("Real RevenueCat SDK prohibited in synthetic review");
    } });
  }
});

// src/services/purchases.ts
init_define_import_meta_env();

// mock:react
init_define_import_meta_env();
var useSyncExternalStore = () => {
  throw new Error("Hook unavailable in synthetic review");
};

// mock:./native
init_define_import_meta_env();
var isNative = () => false;

// src/services/entitlements.ts
init_define_import_meta_env();
var TIER_ORDER = ["free", "essentials", "pro", "coach"];
function tierRank(tier) {
  return TIER_ORDER.indexOf(tier);
}
function tierAtLeast(tier, min) {
  return tierRank(tier) >= tierRank(min);
}

// src/services/purchaseStatus.ts
init_define_import_meta_env();
function trialEligibilityOf(status) {
  if (status === 2) return "eligible";
  if (status === 1 || status === 3) return "ineligible";
  return "unknown";
}
function purchaseErrorResult(error) {
  const e = error;
  const code = String(e?.code ?? "");
  if (e?.userCancelled || ["1", "PURCHASE_CANCELLED_ERROR", "PURCHASE_CANCELLED"].includes(code)) return "cancelled";
  if (["20", "PAYMENT_PENDING_ERROR", "PAYMENT_PENDING"].includes(code)) return "pending";
  return "failed";
}

// src/services/purchases.ts
var PRO_ENTITLEMENT = "pro";
var ENTITLEMENT_IDS = { essentials: "essentials", pro: "pro", coach: "coach" };
var MANAGE_SUBSCRIPTIONS_URL = "https://apps.apple.com/account/subscriptions";
var PRODUCT_IDS = [
  "oda_essentials_monthly",
  "oda_essentials_annual",
  "oda_pro_monthly",
  "oda_pro_annual",
  "oda_coach_monthly",
  "oda_coach_annual"
];
function productIdFor(tier, plan) {
  return `oda_${tier}_${plan}`;
}
function describeProduct(id) {
  const m = /^oda_(essentials|pro|coach)_(monthly|annual)$/.exec(id);
  return m ? { tier: m[1], plan: m[2] } : null;
}
var apiKey = () => define_import_meta_env_default?.VITE_REVENUECAT_IOS_KEY?.trim() ?? "";
function resolveTier(active) {
  for (const tier of ["coach", "pro", "essentials"]) {
    const entry = active[ENTITLEMENT_IDS[tier]];
    if (entry) return { tier, renewsAt: entry.expirationDate ?? null };
  }
  return { tier: "free", renewsAt: null };
}
function annualSavingPercent(monthly, annual) {
  if (!monthly || !annual || monthly <= 0 || annual <= 0) return null;
  const pct = Math.round((1 - annual / (monthly * 12)) * 100);
  return pct > 0 ? pct : null;
}
function trialDaysOf(intro) {
  if (!intro || intro.price !== 0) return null;
  const units = intro.periodNumberOfUnits;
  const cycles = intro.cycles ?? 1;
  if (!Number.isInteger(units) || units <= 0 || !Number.isInteger(cycles) || cycles <= 0) return null;
  const n = units * cycles;
  switch (intro.periodUnit) {
    case "DAY":
      return n;
    case "WEEK":
      return n * 7;
    // A calendar month is not necessarily 30 days; let the store state its duration.
    default:
      return null;
  }
}
var SupersededIdentity = class extends Error {
};
var IdentityCheckFailed = class extends Error {
};
var PurchasesService = class {
  state = { available: false, ready: true, identityConfirmed: false, identityRevision: 0, tier: "free", isPro: false, renewsAt: null, products: {}, error: null };
  listeners = /* @__PURE__ */ new Set();
  packages = /* @__PURE__ */ new Map();
  configuredSDK = null;
  customerListenerAttached = false;
  /** Undefined means cloud identity has not hydrated yet; null explicitly means anonymous. */
  desiredIdentity;
  confirmedRevision = null;
  queue = Promise.resolve();
  loading = null;
  dependencies;
  constructor(dependencies = {}) {
    this.dependencies = {
      native: dependencies.native ?? isNative,
      key: dependencies.key ?? apiKey,
      sdk: dependencies.sdk ?? (async () => (await Promise.resolve().then(() => (init_purchases_capacitor(), purchases_capacitor_exports))).Purchases)
    };
    const available = this.dependencies.native() && Boolean(this.dependencies.key());
    this.state = { ...this.state, available, ready: !available };
  }
  getState = () => this.state;
  subscribe = (fn) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };
  set(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
  }
  identity() {
    return { revision: this.state.identityRevision, userId: this.desiredIdentity };
  }
  isCurrent(identity) {
    return identity.revision === this.state.identityRevision;
  }
  isConfirmed(identity) {
    return identity.userId !== void 0 && this.isCurrent(identity) && this.confirmedRevision === identity.revision && this.state.identityConfirmed;
  }
  requireCurrent(identity) {
    if (!this.isCurrent(identity)) throw new SupersededIdentity();
  }
  /** Also lets UI callers suppress feedback from a completed operation for an old account. */
  currentIdentityGuard = () => {
    const identity = this.identity();
    return () => this.isConfirmed(identity);
  };
  /** SDK identity mutations and customer-context operations must never overlap. */
  enqueue(operation) {
    const result = this.queue.then(operation);
    this.queue = result.then(() => void 0, () => void 0);
    return result;
  }
  unknownProducts(products = this.state.products) {
    return Object.fromEntries(Object.entries(products).map(([id, product]) => [id, { ...product, trialEligibility: "unknown" }]));
  }
  clearCustomer() {
    this.confirmedRevision = null;
    this.set({ identityConfirmed: false, tier: "free", isPro: false, renewsAt: null, products: this.unknownProducts() });
  }
  /** Called only inside the queue; successful setup is retained even after a superseded load. */
  async configureSDK(identity) {
    this.requireCurrent(identity);
    const sdk = this.configuredSDK ?? await this.dependencies.sdk();
    this.requireCurrent(identity);
    if (!this.configuredSDK) {
      await sdk.configure({ apiKey: this.dependencies.key() });
      this.configuredSDK = sdk;
    }
    this.requireCurrent(identity);
    if (!this.customerListenerAttached) {
      await sdk.addCustomerInfoUpdateListener(() => this.customerChanged());
      this.customerListenerAttached = true;
    }
    this.requireCurrent(identity);
    return sdk;
  }
  async matchesSDKIdentity(sdk, identity) {
    try {
      this.requireCurrent(identity);
      const { appUserID } = await sdk.getAppUserID();
      this.requireCurrent(identity);
      const { isAnonymous } = await sdk.isAnonymous();
      this.requireCurrent(identity);
      return identity.userId === null ? isAnonymous : identity.userId !== void 0 && !isAnonymous && appUserID === identity.userId;
    } catch (error) {
      if (error instanceof SupersededIdentity) throw error;
      throw new IdentityCheckFailed();
    }
  }
  async verifyIdentity(sdk, identity) {
    const matches = await this.matchesSDKIdentity(sdk, identity);
    this.requireCurrent(identity);
    if (!matches) {
      this.clearCustomer();
      this.requireCurrent(identity);
      this.set({ error: "identity-unconfirmed" });
      throw new Error("identity-unconfirmed");
    }
  }
  async confirmIdentity(sdk, identity) {
    const matches = await this.matchesSDKIdentity(sdk, identity);
    this.requireCurrent(identity);
    if (!matches) {
      this.clearCustomer();
      this.requireCurrent(identity);
      if (identity.userId === null) await sdk.logOut();
      else if (identity.userId !== void 0) await sdk.logIn({ appUserID: identity.userId });
      this.requireCurrent(identity);
      await this.verifyIdentity(sdk, identity);
    }
    this.requireCurrent(identity);
    this.confirmedRevision = identity.revision;
    this.set({ identityConfirmed: true });
  }
  customerChanged() {
    const identity = this.identity();
    if (!this.isConfirmed(identity)) return;
    void this.enqueue(async () => {
      if (!this.isConfirmed(identity)) return;
      try {
        const sdk = this.configuredSDK;
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        const { customerInfo } = await sdk.getCustomerInfo();
        this.requireCurrent(identity);
        await this.verifyIdentity(sdk, identity);
        if (this.isConfirmed(identity)) this.applyCustomer(customerInfo);
      } catch {
      }
    });
  }
  applyCustomer(info) {
    const { tier, renewsAt } = resolveTier(info.entitlements.active);
    this.set({ tier, isPro: tierAtLeast(tier, "pro"), renewsAt });
  }
  /** Finds our six products in the current offering first, then in any other offering. */
  collectProducts(offerings) {
    const lists = [offerings.current, ...Object.values(offerings.all ?? {})].filter(Boolean);
    const products = {};
    const packages = /* @__PURE__ */ new Map();
    for (const offering of lists) {
      const pkgs = [...offering.availablePackages ?? [], offering.annual, offering.monthly].filter(Boolean);
      for (const pkg of pkgs) {
        const id = pkg.product?.identifier;
        const info = id ? describeProduct(id) : null;
        if (!id || !info || products[id]) continue;
        packages.set(id, pkg);
        products[id] = {
          id,
          tier: info.tier,
          plan: info.plan,
          price: pkg.product.priceString,
          amount: typeof pkg.product.price === "number" ? pkg.product.price : null,
          perMonth: info.plan === "annual" ? pkg.product.pricePerMonthString ?? null : null,
          trialDays: trialDaysOf(pkg.product.introPrice),
          trialEligibility: "unknown"
        };
      }
    }
    return { products, packages };
  }
  async checkEligibility(sdk, products) {
    const unknownProducts = this.unknownProducts(products);
    const identifiers = Object.values(unknownProducts).filter((product) => product?.trialDays).map((product) => product.id);
    if (!identifiers.length) return unknownProducts;
    try {
      const result = await sdk.checkTrialOrIntroductoryPriceEligibility({ productIdentifiers: identifiers });
      return Object.fromEntries(Object.entries(unknownProducts).map(([id, product]) => [id, { ...product, trialEligibility: trialEligibilityOf(result[id]?.status) }]));
    } catch {
      return unknownProducts;
    }
  }
  /** Failed plan loads may retry; concurrent calls share one SDK setup and load. */
  init() {
    const identity = this.identity();
    const wasConfirmed = this.isConfirmed(identity);
    if (this.loading?.revision === identity.revision) return this.loading.promise;
    if (!this.dependencies.native() || !this.dependencies.key()) return Promise.resolve();
    if (this.state.available && this.state.ready && !this.state.error && (identity.userId === void 0 || this.isConfirmed(identity))) return Promise.resolve();
    this.set({ available: true, ready: false, error: null, products: this.unknownProducts() });
    const promise = this.enqueue(async () => {
      try {
        const sdk = await this.configureSDK(identity);
        this.requireCurrent(identity);
        if (identity.userId !== void 0) {
          await this.confirmIdentity(sdk, identity);
          this.requireCurrent(identity);
          const { customerInfo } = await sdk.getCustomerInfo();
          this.requireCurrent(identity);
          await this.verifyIdentity(sdk, identity);
          this.requireCurrent(identity);
          this.applyCustomer(customerInfo);
        }
        this.requireCurrent(identity);
        const offerings = await sdk.getOfferings();
        this.requireCurrent(identity);
        const collected = this.collectProducts(offerings);
        let products = collected.products;
        if (identity.userId !== void 0) {
          await this.verifyIdentity(sdk, identity);
          this.requireCurrent(identity);
          products = await this.checkEligibility(sdk, products);
          this.requireCurrent(identity);
          await this.verifyIdentity(sdk, identity);
        }
        this.requireCurrent(identity);
        this.packages = collected.packages;
        this.set({ products, ready: true, error: Object.keys(products).length ? null : "no-plans" });
      } catch (error) {
        if (!this.isCurrent(identity)) return;
        if (error instanceof IdentityCheckFailed && !wasConfirmed) this.clearCustomer();
        if (!this.isCurrent(identity)) return;
        if (identity.userId !== void 0 && !this.isConfirmed(identity)) {
          this.clearCustomer();
          this.set({ ready: true, error: "identity-unconfirmed" });
        } else {
          this.packages.clear();
          this.set({ products: {}, ready: true, error: "unavailable" });
        }
      }
    }).finally(() => {
      if (this.loading?.promise === promise) this.loading = null;
    });
    this.loading = { revision: identity.revision, promise };
    return promise;
  }
  /** Ties purchases to the ODA account so the level follows the member to a new phone. */
  identify(userId) {
    if (this.desiredIdentity !== userId) {
      this.desiredIdentity = userId;
      this.confirmedRevision = null;
      this.set({
        identityRevision: this.state.identityRevision + 1,
        identityConfirmed: false,
        tier: "free",
        isPro: false,
        renewsAt: null,
        products: this.unknownProducts(),
        ready: false,
        error: null
      });
    }
    if (!this.dependencies.native() || !this.dependencies.key()) {
      this.set({ ready: true });
      return Promise.resolve();
    }
    return this.init();
  }
  /** Unknown cloud auth must not assert either a cached account or anonymity. No SDK calls. */
  deferIdentity() {
    const changed = this.desiredIdentity !== void 0;
    this.desiredIdentity = void 0;
    this.confirmedRevision = null;
    this.set({
      available: this.dependencies.native() && Boolean(this.dependencies.key()),
      identityRevision: this.state.identityRevision + (changed ? 1 : 0),
      identityConfirmed: false,
      tier: "free",
      isPro: false,
      renewsAt: null,
      products: this.unknownProducts(),
      ready: true,
      error: null
    });
  }
  async purchase(productId) {
    const identity = this.identity();
    const pkg = this.packages.get(productId);
    const info = describeProduct(productId);
    if (!this.state.available || !this.state.ready || !this.isConfirmed(identity) || !pkg || !info) return "failed";
    return this.enqueue(async () => {
      if (!this.state.ready || !this.isConfirmed(identity)) return "failed";
      try {
        const sdk = this.configuredSDK;
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        const { customerInfo } = await sdk.purchasePackage({ aPackage: pkg });
        this.requireCurrent(identity);
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        this.applyCustomer(customerInfo);
        return tierAtLeast(this.state.tier, info.tier) ? "purchased" : "unconfirmed";
      } catch (error) {
        return this.isConfirmed(identity) ? purchaseErrorResult(error) : "failed";
      }
    });
  }
  /** Distinguish a successful check with no plan from a failed store check. */
  async restore() {
    const identity = this.identity();
    if (!this.state.available || !this.state.ready || !this.isConfirmed(identity)) return "failed";
    return this.enqueue(async () => {
      if (!this.state.ready || !this.isConfirmed(identity)) return "failed";
      try {
        const sdk = this.configuredSDK;
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        const { customerInfo } = await sdk.restorePurchases();
        this.requireCurrent(identity);
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        this.applyCustomer(customerInfo);
        return this.state.tier !== "free" ? "restored" : "not-found";
      } catch {
        return "failed";
      }
    });
  }
};
var purchases = new PurchasesService();
function usePro() {
  const state = useSyncExternalStore(purchases.subscribe, purchases.getState, purchases.getState);
  return { ...state, gating: state.available };
}
export {
  ENTITLEMENT_IDS,
  MANAGE_SUBSCRIPTIONS_URL,
  PRODUCT_IDS,
  PRO_ENTITLEMENT,
  PurchasesService,
  annualSavingPercent,
  describeProduct,
  productIdFor,
  purchases,
  resolveTier,
  trialDaysOf,
  usePro
};
