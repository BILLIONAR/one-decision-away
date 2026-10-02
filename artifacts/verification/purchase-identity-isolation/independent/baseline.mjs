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
var PurchasesService = class {
  state = { available: false, ready: true, tier: "free", isPro: false, renewsAt: null, products: {}, error: null };
  listeners = /* @__PURE__ */ new Set();
  packages = /* @__PURE__ */ new Map();
  configuredSDK = null;
  customerListenerAttached = false;
  configuring = null;
  loading = null;
  dependencies;
  constructor(dependencies = {}) {
    this.dependencies = {
      native: dependencies.native ?? isNative,
      key: dependencies.key ?? apiKey,
      sdk: dependencies.sdk ?? (async () => (await Promise.resolve().then(() => (init_purchases_capacitor(), purchases_capacitor_exports))).Purchases)
    };
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
  /** Share setup across callers; only successfully completed setup is retained. */
  configureSDK() {
    if (this.configuring) return this.configuring;
    if (this.configuredSDK && this.customerListenerAttached) return Promise.resolve(this.configuredSDK);
    this.configuring = (async () => {
      const sdk = this.configuredSDK ?? await this.dependencies.sdk();
      if (!this.configuredSDK) {
        await sdk.configure({ apiKey: this.dependencies.key() });
        this.configuredSDK = sdk;
      }
      if (!this.customerListenerAttached) {
        await sdk.addCustomerInfoUpdateListener((info) => this.applyCustomer(info));
        this.customerListenerAttached = true;
      }
      return sdk;
    })().finally(() => {
      this.configuring = null;
    });
    return this.configuring;
  }
  applyCustomer(info) {
    const { tier, renewsAt } = resolveTier(info.entitlements.active);
    this.set({ tier, isPro: tierAtLeast(tier, "pro"), renewsAt });
  }
  /** Finds our six products in the current offering first, then in any other offering. */
  collectProducts(offerings) {
    const lists = [offerings.current, ...Object.values(offerings.all ?? {})].filter(Boolean);
    const products = {};
    this.packages.clear();
    for (const offering of lists) {
      const pkgs = [...offering.availablePackages ?? [], offering.annual, offering.monthly].filter(Boolean);
      for (const pkg of pkgs) {
        const id = pkg.product?.identifier;
        const info = id ? describeProduct(id) : null;
        if (!id || !info || products[id]) continue;
        this.packages.set(id, pkg);
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
    return products;
  }
  async checkEligibility(sdk, products) {
    const unknownProducts = Object.fromEntries(Object.entries(products).map(([id, product]) => [id, { ...product, trialEligibility: "unknown" }]));
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
    if (this.loading) return this.loading;
    if (!this.dependencies.native() || !this.dependencies.key()) return Promise.resolve();
    if (this.state.available && this.state.ready && !this.state.error) return Promise.resolve();
    this.set({ available: true, ready: false });
    this.loading = (async () => {
      try {
        const Purchases2 = await this.configureSDK();
        const [{ customerInfo }, offerings] = await Promise.all([Purchases2.getCustomerInfo(), Purchases2.getOfferings()]);
        this.applyCustomer(customerInfo);
        const products = await this.checkEligibility(Purchases2, this.collectProducts(offerings));
        this.set({ products, ready: true, error: Object.keys(products).length ? null : "no-plans" });
      } catch {
        this.packages.clear();
        this.set({ products: {}, ready: true, error: "unavailable" });
      }
    })().finally(() => {
      this.loading = null;
    });
    return this.loading;
  }
  /** Ties purchases to the ODA account so the level follows the member to a new phone. */
  async identify(userId) {
    if (!this.state.available) return;
    try {
      this.set({ products: Object.fromEntries(Object.entries(this.state.products).map(([id, product]) => [id, { ...product, trialEligibility: "unknown" }])) });
      const Purchases2 = await this.configureSDK();
      if (userId) this.applyCustomer((await Purchases2.logIn({ appUserID: userId })).customerInfo);
      else if (!(await Purchases2.isAnonymous()).isAnonymous) this.applyCustomer((await Purchases2.logOut()).customerInfo);
      this.set({ products: await this.checkEligibility(Purchases2, this.state.products) });
    } catch {
    }
  }
  async purchase(productId) {
    const pkg = this.packages.get(productId);
    const info = describeProduct(productId);
    if (!this.state.available || !pkg || !info) return "failed";
    try {
      const Purchases2 = await this.configureSDK();
      const { customerInfo } = await Purchases2.purchasePackage({ aPackage: pkg });
      this.applyCustomer(customerInfo);
      return tierAtLeast(this.state.tier, info.tier) ? "purchased" : "unconfirmed";
    } catch (error) {
      return purchaseErrorResult(error);
    }
  }
  /** Distinguish a successful check with no plan from a failed store check. */
  async restore() {
    if (!this.state.available) return "failed";
    try {
      const Purchases2 = await this.configureSDK();
      const { customerInfo } = await Purchases2.restorePurchases();
      this.applyCustomer(customerInfo);
      return this.state.tier !== "free" ? "restored" : "not-found";
    } catch {
      return "failed";
    }
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
