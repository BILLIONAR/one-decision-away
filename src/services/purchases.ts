/**
 * ODA subscriptions through Apple, verified by RevenueCat. Only the iPhone app
 * with VITE_REVENUECAT_IOS_KEY set can sell them; everywhere else `available`
 * is false, nothing is locked and the paywall says where they can be bought.
 * No fake purchases, no demo toggles.
 *
 * Levels (see entitlements.ts): essentials < pro < coach. RevenueCat
 * entitlements 'essentials', 'pro' and 'coach'; the highest active one wins.
 * Apple subscription group "ODA": coach = level 1, pro = 2, essentials = 3.
 */
import { useSyncExternalStore } from 'react';
import { isNative } from './native';
import { tierAtLeast, type PaidTier, type Tier } from './entitlements';
import type { PurchasesPlugin } from '@revenuecat/purchases-capacitor';
import { purchaseErrorResult, trialEligibilityOf, type PurchaseResult, type RestoreResult, type TrialEligibility } from './purchaseStatus';
export type { PurchaseResult, RestoreResult, TrialEligibility } from './purchaseStatus';

export const PRO_ENTITLEMENT = 'pro';
/** RevenueCat entitlement identifier per paid level. */
export const ENTITLEMENT_IDS: Record<PaidTier, string> = { essentials: 'essentials', pro: 'pro', coach: 'coach' };
export const MANAGE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export type PlanId = 'annual' | 'monthly';
export const PRODUCT_IDS = [
  'oda_essentials_monthly', 'oda_essentials_annual',
  'oda_pro_monthly', 'oda_pro_annual',
  'oda_coach_monthly', 'oda_coach_annual',
] as const;
export type ProductId = (typeof PRODUCT_IDS)[number];

export function productIdFor(tier: PaidTier, plan: PlanId): ProductId {
  return `oda_${tier}_${plan}` as ProductId;
}
export function describeProduct(id: string): { tier: PaidTier; plan: PlanId } | null {
  const m = /^oda_(essentials|pro|coach)_(monthly|annual)$/.exec(id);
  return m ? { tier: m[1] as PaidTier, plan: m[2] as PlanId } : null;
}

export type ProductPrice = {
  id: ProductId;
  tier: PaidTier;
  plan: PlanId;
  /** Localised price from the App Store, e.g. "$49.99". */
  price: string;
  /** Numeric price in the store currency, for comparing plans. */
  amount: number | null;
  /** Localised price per month (annual products only). */
  perMonth: string | null;
  trialDays: number | null;
  /** A free intro price alone does not establish this customer's eligibility. */
  trialEligibility: TrialEligibility;
};
export type PurchasesState = {
  /** Subscriptions can be bought here (iPhone app with purchases configured). */
  available: boolean;
  /** Offerings and customer info have loaded (or failed). */
  ready: boolean;
  /** The highest active level. */
  tier: Tier;
  /** Compatibility: Pro or higher. */
  isPro: boolean;
  /** When the active period ends or renews, if known. */
  renewsAt: string | null;
  /** Products found in the store offerings, by product id. Missing products are simply absent. */
  products: Partial<Record<ProductId, ProductPrice>>;
  error: string | null;
};

const apiKey = (): string => (import.meta.env?.VITE_REVENUECAT_IOS_KEY as string | undefined)?.trim() ?? '';

/** Highest active level from RevenueCat's active entitlements (coach > pro > essentials > free). */
export function resolveTier(active: Record<string, { expirationDate?: string | null } | undefined>): { tier: Tier; renewsAt: string | null } {
  for (const tier of ['coach', 'pro', 'essentials'] as const) {
    const entry = active[ENTITLEMENT_IDS[tier]];
    if (entry) return { tier, renewsAt: entry.expirationDate ?? null };
  }
  return { tier: 'free', renewsAt: null };
}

/** How much cheaper the annual price is than twelve months, in whole percent; null if unknown or not cheaper. */
export function annualSavingPercent(monthly: number | null | undefined, annual: number | null | undefined): number | null {
  if (!monthly || !annual || monthly <= 0 || annual <= 0) return null;
  const pct = Math.round((1 - annual / (monthly * 12)) * 100);
  return pct > 0 ? pct : null;
}

/** Trial length in days from an intro offer, when it is free. */
export function trialDaysOf(intro: { price: number; periodUnit: string; periodNumberOfUnits: number; cycles?: number } | null | undefined): number | null {
  if (!intro || intro.price !== 0) return null;
  const units = intro.periodNumberOfUnits; const cycles = intro.cycles ?? 1;
  if (!Number.isInteger(units) || units <= 0 || !Number.isInteger(cycles) || cycles <= 0) return null;
  const n = units * cycles;
  switch (intro.periodUnit) {
    case 'DAY': return n;
    case 'WEEK': return n * 7;
    // A calendar month is not necessarily 30 days; let the store state its duration.
    default: return null;
  }
}

type Listener = () => void;
type RCIntro = { price: number; periodUnit: string; periodNumberOfUnits: number; cycles?: number } | null;
type RCPackage = { packageType: string; identifier: string; product: { identifier: string; price?: number; priceString: string; pricePerMonthString: string | null; introPrice: RCIntro } };
type RCOffering = { availablePackages?: RCPackage[]; annual?: RCPackage | null; monthly?: RCPackage | null };
type RCCustomerInfo = { entitlements: { active: Record<string, { expirationDate: string | null } | undefined> } };

export type PurchasesSDK = Pick<PurchasesPlugin, 'configure' | 'addCustomerInfoUpdateListener' | 'getCustomerInfo' | 'getOfferings' | 'checkTrialOrIntroductoryPriceEligibility' | 'purchasePackage' | 'restorePurchases' | 'logIn' | 'logOut' | 'isAnonymous'>;
type PurchasesDependencies = { native: () => boolean; key: () => string; sdk: () => Promise<PurchasesSDK> };

export class PurchasesService {
  private state: PurchasesState = { available: false, ready: true, tier: 'free', isPro: false, renewsAt: null, products: {}, error: null };
  private listeners = new Set<Listener>();
  private packages = new Map<ProductId, RCPackage>();
  private configuredSDK: PurchasesSDK | null = null;
  private customerListenerAttached = false;
  private configuring: Promise<PurchasesSDK> | null = null;
  private loading: Promise<void> | null = null;
  private dependencies: PurchasesDependencies;

  constructor(dependencies: Partial<PurchasesDependencies> = {}) {
    this.dependencies = {
      native: dependencies.native ?? isNative,
      key: dependencies.key ?? apiKey,
      sdk: dependencies.sdk ?? (async () => (await import('@revenuecat/purchases-capacitor')).Purchases),
    };
  }

  getState = (): PurchasesState => this.state;
  subscribe = (fn: Listener) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private set(patch: Partial<PurchasesState>) { this.state = { ...this.state, ...patch }; this.listeners.forEach(fn => fn()); }

  /** Share setup across callers; only successfully completed setup is retained. */
  private configureSDK(): Promise<PurchasesSDK> {
    if (this.configuring) return this.configuring;
    if (this.configuredSDK && this.customerListenerAttached) return Promise.resolve(this.configuredSDK);
    this.configuring = (async () => {
      const sdk = this.configuredSDK ?? await this.dependencies.sdk();
      if (!this.configuredSDK) { await sdk.configure({ apiKey: this.dependencies.key() }); this.configuredSDK = sdk; }
      if (!this.customerListenerAttached) {
        await sdk.addCustomerInfoUpdateListener(info => this.applyCustomer(info as unknown as RCCustomerInfo));
        this.customerListenerAttached = true;
      }
      return sdk;
    })().finally(() => { this.configuring = null; });
    return this.configuring;
  }

  private applyCustomer(info: RCCustomerInfo) {
    const { tier, renewsAt } = resolveTier(info.entitlements.active);
    this.set({ tier, isPro: tierAtLeast(tier, 'pro'), renewsAt });
  }

  /** Finds our six products in the current offering first, then in any other offering. */
  private collectProducts(offerings: { current: unknown; all?: Record<string, unknown> }): Partial<Record<ProductId, ProductPrice>> {
    const lists: RCOffering[] = [offerings.current as RCOffering | null, ...Object.values(offerings.all ?? {}) as RCOffering[]].filter(Boolean) as RCOffering[];
    const products: Partial<Record<ProductId, ProductPrice>> = {};
    this.packages.clear();
    for (const offering of lists) {
      const pkgs = [...(offering.availablePackages ?? []), offering.annual, offering.monthly].filter(Boolean) as RCPackage[];
      for (const pkg of pkgs) {
        const id = pkg.product?.identifier;
        const info = id ? describeProduct(id) : null;
        if (!id || !info || products[id as ProductId]) continue;
        this.packages.set(id as ProductId, pkg);
        products[id as ProductId] = {
          id: id as ProductId, tier: info.tier, plan: info.plan,
          price: pkg.product.priceString,
          amount: typeof pkg.product.price === 'number' ? pkg.product.price : null,
          perMonth: info.plan === 'annual' ? pkg.product.pricePerMonthString ?? null : null,
          trialDays: trialDaysOf(pkg.product.introPrice),
          trialEligibility: 'unknown',
        };
      }
    }
    return products;
  }

  private async checkEligibility(sdk: PurchasesSDK, products: PurchasesState['products']): Promise<PurchasesState['products']> {
    const unknownProducts: PurchasesState['products'] = Object.fromEntries(Object.entries(products).map(([id, product]) => [id, { ...product, trialEligibility: 'unknown' as const }]));
    const identifiers = Object.values(unknownProducts).filter(product => product?.trialDays).map(product => product!.id);
    if (!identifiers.length) return unknownProducts;
    try {
      const result = await sdk.checkTrialOrIntroductoryPriceEligibility({ productIdentifiers: identifiers });
      return Object.fromEntries(Object.entries(unknownProducts).map(([id, product]) => [id, { ...product, trialEligibility: trialEligibilityOf(result[id]?.status) }]));
    } catch { return unknownProducts; } // Unknown means regular pricing, never a promised free trial.
  }

  /** Failed plan loads may retry; concurrent calls share one SDK setup and load. */
  init(): Promise<void> {
    if (this.loading) return this.loading;
    if (!this.dependencies.native() || !this.dependencies.key()) return Promise.resolve();
    if (this.state.available && this.state.ready && !this.state.error) return Promise.resolve();
    this.set({ available: true, ready: false });
    this.loading = (async () => { try {
      const Purchases = await this.configureSDK();
      const [{ customerInfo }, offerings] = await Promise.all([Purchases.getCustomerInfo(), Purchases.getOfferings()]);
      this.applyCustomer(customerInfo as unknown as RCCustomerInfo);
      const products = await this.checkEligibility(Purchases, this.collectProducts(offerings as unknown as { current: unknown; all?: Record<string, unknown> }));
      this.set({ products, ready: true, error: Object.keys(products).length ? null : 'no-plans' });
    } catch {
      this.packages.clear(); this.set({ products: {}, ready: true, error: 'unavailable' });
    } })().finally(() => { this.loading = null; });
    return this.loading;
  }

  /** Ties purchases to the ODA account so the level follows the member to a new phone. */
  async identify(userId: string | null): Promise<void> {
    if (!this.state.available) return;
    try {
      // An account transition must not keep a previous eligibility claim visible.
      this.set({ products: Object.fromEntries(Object.entries(this.state.products).map(([id, product]) => [id, { ...product, trialEligibility: 'unknown' as const }])) });
      const Purchases = await this.configureSDK();
      if (userId) this.applyCustomer((await Purchases.logIn({ appUserID: userId })).customerInfo as unknown as RCCustomerInfo);
      else if (!(await Purchases.isAnonymous()).isAnonymous) this.applyCustomer((await Purchases.logOut()).customerInfo as unknown as RCCustomerInfo);
      this.set({ products: await this.checkEligibility(Purchases, this.state.products) });
    } catch { /* keep the current entitlement */ }
  }

  async purchase(productId: ProductId): Promise<PurchaseResult> {
    const pkg = this.packages.get(productId);
    const info = describeProduct(productId);
    if (!this.state.available || !pkg || !info) return 'failed';
    try {
      const Purchases = await this.configureSDK();
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg as never });
      this.applyCustomer(customerInfo as unknown as RCCustomerInfo);
      return tierAtLeast(this.state.tier, info.tier) ? 'purchased' : 'unconfirmed';
    } catch (error) {
      return purchaseErrorResult(error);
    }
  }

  /** Distinguish a successful check with no plan from a failed store check. */
  async restore(): Promise<RestoreResult> {
    if (!this.state.available) return 'failed';
    try {
      const Purchases = await this.configureSDK();
      const { customerInfo } = await Purchases.restorePurchases();
      this.applyCustomer(customerInfo as unknown as RCCustomerInfo);
      return this.state.tier !== 'free' ? 'restored' : 'not-found';
    } catch {
      return 'failed';
    }
  }
}

export const purchases = new PurchasesService();

/** Live level for components. `gating` is true only where subscriptions can be bought. `isPro` = Pro or higher. */
export function usePro(): PurchasesState & { gating: boolean } {
  const state = useSyncExternalStore(purchases.subscribe, purchases.getState, purchases.getState);
  return { ...state, gating: state.available };
}
