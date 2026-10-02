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
  /** The SDK's current identity has been verified against the explicitly bound ODA account. */
  identityConfirmed: boolean;
  /** Changes synchronously when the desired ODA account changes. */
  identityRevision: number;
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

export type PurchasesSDK = Pick<PurchasesPlugin, 'configure' | 'addCustomerInfoUpdateListener' | 'getCustomerInfo' | 'getOfferings' | 'checkTrialOrIntroductoryPriceEligibility' | 'purchasePackage' | 'restorePurchases' | 'logIn' | 'logOut' | 'getAppUserID' | 'isAnonymous'>;
type PurchasesDependencies = { native: () => boolean; key: () => string; sdk: () => Promise<PurchasesSDK> };
type Identity = { revision: number; userId: string | null | undefined };
class SupersededIdentity extends Error {}
class IdentityCheckFailed extends Error {}

export class PurchasesService {
  private state: PurchasesState = { available: false, ready: true, identityConfirmed: false, identityRevision: 0, tier: 'free', isPro: false, renewsAt: null, products: {}, error: null };
  private listeners = new Set<Listener>();
  private packages = new Map<ProductId, RCPackage>();
  private configuredSDK: PurchasesSDK | null = null;
  private customerListenerAttached = false;
  /** Undefined means cloud identity has not hydrated yet; null explicitly means anonymous. */
  private desiredIdentity: string | null | undefined;
  private confirmedRevision: number | null = null;
  private queue: Promise<void> = Promise.resolve();
  private loading: { revision: number; promise: Promise<void> } | null = null;
  private dependencies: PurchasesDependencies;

  constructor(dependencies: Partial<PurchasesDependencies> = {}) {
    this.dependencies = {
      native: dependencies.native ?? isNative,
      key: dependencies.key ?? apiKey,
      sdk: dependencies.sdk ?? (async () => (await import('@revenuecat/purchases-capacitor')).Purchases),
    };
    // Native locks depend on purchase capability, even before auth or SDK startup.
    const available = this.dependencies.native() && Boolean(this.dependencies.key());
    this.state = { ...this.state, available, ready: !available };
  }

  getState = (): PurchasesState => this.state;
  subscribe = (fn: Listener) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private set(patch: Partial<PurchasesState>) { this.state = { ...this.state, ...patch }; this.listeners.forEach(fn => fn()); }

  private identity(): Identity { return { revision: this.state.identityRevision, userId: this.desiredIdentity }; }
  private isCurrent(identity: Identity): boolean { return identity.revision === this.state.identityRevision; }
  private isConfirmed(identity: Identity): boolean {
    return identity.userId !== undefined && this.isCurrent(identity) && this.confirmedRevision === identity.revision && this.state.identityConfirmed;
  }
  private requireCurrent(identity: Identity) { if (!this.isCurrent(identity)) throw new SupersededIdentity(); }
  /** Also lets UI callers suppress feedback from a completed operation for an old account. */
  currentIdentityGuard = (): (() => boolean) => { const identity = this.identity(); return () => this.isConfirmed(identity); };

  /** SDK identity mutations and customer-context operations must never overlap. */
  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.queue.then(operation);
    this.queue = result.then(() => undefined, () => undefined);
    return result;
  }

  private unknownProducts(products = this.state.products): PurchasesState['products'] {
    return Object.fromEntries(Object.entries(products).map(([id, product]) => [id, { ...product, trialEligibility: 'unknown' as const }]));
  }
  private clearCustomer() {
    this.confirmedRevision = null;
    this.set({ identityConfirmed: false, tier: 'free', isPro: false, renewsAt: null, products: this.unknownProducts() });
  }

  /** Called only inside the queue; successful setup is retained even after a superseded load. */
  private async configureSDK(identity: Identity): Promise<PurchasesSDK> {
    this.requireCurrent(identity);
    const sdk = this.configuredSDK ?? await this.dependencies.sdk();
    this.requireCurrent(identity);
    if (!this.configuredSDK) {
      await sdk.configure({ apiKey: this.dependencies.key() });
      this.configuredSDK = sdk;
    }
    this.requireCurrent(identity);
    if (!this.customerListenerAttached) {
      // Event payloads can belong to an earlier SDK identity or contain aliased IDs.
      await sdk.addCustomerInfoUpdateListener(() => this.customerChanged());
      this.customerListenerAttached = true;
    }
    this.requireCurrent(identity);
    return sdk;
  }

  private async matchesSDKIdentity(sdk: PurchasesSDK, identity: Identity): Promise<boolean> {
    try {
      this.requireCurrent(identity);
      const { appUserID } = await sdk.getAppUserID();
      this.requireCurrent(identity);
      const { isAnonymous } = await sdk.isAnonymous();
      this.requireCurrent(identity);
      return identity.userId === null ? isAnonymous : identity.userId !== undefined && !isAnonymous && appUserID === identity.userId;
    } catch (error) {
      if (error instanceof SupersededIdentity) throw error;
      throw new IdentityCheckFailed();
    }
  }

  private async verifyIdentity(sdk: PurchasesSDK, identity: Identity) {
    const matches = await this.matchesSDKIdentity(sdk, identity);
    this.requireCurrent(identity);
    if (!matches) {
      this.clearCustomer();
      this.requireCurrent(identity);
      this.set({ error: 'identity-unconfirmed' });
      throw new Error('identity-unconfirmed');
    }
  }

  private async confirmIdentity(sdk: PurchasesSDK, identity: Identity) {
    const matches = await this.matchesSDKIdentity(sdk, identity);
    this.requireCurrent(identity);
    if (!matches) {
      this.clearCustomer();
      this.requireCurrent(identity);
      if (identity.userId === null) await sdk.logOut();
      else if (identity.userId !== undefined) await sdk.logIn({ appUserID: identity.userId });
      this.requireCurrent(identity);
      await this.verifyIdentity(sdk, identity);
    }
    this.requireCurrent(identity);
    this.confirmedRevision = identity.revision;
    this.set({ identityConfirmed: true });
  }

  private customerChanged() {
    const identity = this.identity();
    if (!this.isConfirmed(identity)) return;
    void this.enqueue(async () => {
      if (!this.isConfirmed(identity)) return;
      try {
        const sdk = this.configuredSDK!;
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        const { customerInfo } = await sdk.getCustomerInfo();
        this.requireCurrent(identity);
        await this.verifyIdentity(sdk, identity);
        if (this.isConfirmed(identity)) this.applyCustomer(customerInfo as unknown as RCCustomerInfo);
      } catch { /* A failed refresh retains only this already-confirmed account's entitlement. */ }
    });
  }

  private applyCustomer(info: RCCustomerInfo) {
    const { tier, renewsAt } = resolveTier(info.entitlements.active);
    this.set({ tier, isPro: tierAtLeast(tier, 'pro'), renewsAt });
  }

  /** Finds our six products in the current offering first, then in any other offering. */
  private collectProducts(offerings: { current: unknown; all?: Record<string, unknown> }) {
    const lists: RCOffering[] = [offerings.current as RCOffering | null, ...Object.values(offerings.all ?? {}) as RCOffering[]].filter(Boolean) as RCOffering[];
    const products: Partial<Record<ProductId, ProductPrice>> = {};
    const packages = new Map<ProductId, RCPackage>();
    for (const offering of lists) {
      const pkgs = [...(offering.availablePackages ?? []), offering.annual, offering.monthly].filter(Boolean) as RCPackage[];
      for (const pkg of pkgs) {
        const id = pkg.product?.identifier;
        const info = id ? describeProduct(id) : null;
        if (!id || !info || products[id as ProductId]) continue;
        packages.set(id as ProductId, pkg);
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
    return { products, packages };
  }

  private async checkEligibility(sdk: PurchasesSDK, products: PurchasesState['products']): Promise<PurchasesState['products']> {
    const unknownProducts = this.unknownProducts(products);
    const identifiers = Object.values(unknownProducts).filter(product => product?.trialDays).map(product => product!.id);
    if (!identifiers.length) return unknownProducts;
    try {
      const result = await sdk.checkTrialOrIntroductoryPriceEligibility({ productIdentifiers: identifiers });
      return Object.fromEntries(Object.entries(unknownProducts).map(([id, product]) => [id, { ...product, trialEligibility: trialEligibilityOf(result[id]?.status) }]));
    } catch { return unknownProducts; } // Unknown means regular pricing, never a promised free trial.
  }

  /** Failed plan loads may retry; concurrent calls share one SDK setup and load. */
  init(): Promise<void> {
    const identity = this.identity();
    const wasConfirmed = this.isConfirmed(identity);
    if (this.loading?.revision === identity.revision) return this.loading.promise;
    if (!this.dependencies.native() || !this.dependencies.key()) return Promise.resolve();
    if (this.state.available && this.state.ready && !this.state.error && (identity.userId === undefined || this.isConfirmed(identity))) return Promise.resolve();
    this.set({ available: true, ready: false, error: null, products: this.unknownProducts() });
    const promise = this.enqueue(async () => { try {
      const sdk = await this.configureSDK(identity);
      this.requireCurrent(identity);
      if (identity.userId !== undefined) {
        await this.confirmIdentity(sdk, identity);
        this.requireCurrent(identity);
        const { customerInfo } = await sdk.getCustomerInfo();
        this.requireCurrent(identity);
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        this.applyCustomer(customerInfo as unknown as RCCustomerInfo);
      }
      // Before cloud hydration, only account-independent store prices may load.
      this.requireCurrent(identity);
      const offerings = await sdk.getOfferings();
      this.requireCurrent(identity);
      const collected = this.collectProducts(offerings as unknown as { current: unknown; all?: Record<string, unknown> });
      let products = collected.products;
      if (identity.userId !== undefined) {
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        products = await this.checkEligibility(sdk, products);
        this.requireCurrent(identity);
        await this.verifyIdentity(sdk, identity);
      }
      this.requireCurrent(identity);
      this.packages = collected.packages;
      this.set({ products, ready: true, error: Object.keys(products).length ? null : 'no-plans' });
    } catch (error) {
      if (!this.isCurrent(identity)) return;
      // A first load cannot retain a partially verified identity after a later
      // ID lookup fails. Previously confirmed same-account offline reads may.
      if (error instanceof IdentityCheckFailed && !wasConfirmed) this.clearCustomer();
      if (!this.isCurrent(identity)) return;
      if (identity.userId !== undefined && !this.isConfirmed(identity)) {
        this.clearCustomer();
        this.set({ ready: true, error: 'identity-unconfirmed' });
      } else {
        this.packages.clear();
        this.set({ products: {}, ready: true, error: 'unavailable' });
      }
    } }).finally(() => { if (this.loading?.promise === promise) this.loading = null; });
    this.loading = { revision: identity.revision, promise };
    return promise;
  }

  /** Ties purchases to the ODA account so the level follows the member to a new phone. */
  identify(userId: string | null): Promise<void> {
    if (this.desiredIdentity !== userId) {
      this.desiredIdentity = userId;
      this.confirmedRevision = null;
      this.set({ identityRevision: this.state.identityRevision + 1, identityConfirmed: false, tier: 'free', isPro: false, renewsAt: null,
        products: this.unknownProducts(), ready: false, error: null });
    }
    // Register desired identity before any asynchronous setup or cached-tier read.
    if (!this.dependencies.native() || !this.dependencies.key()) {
      this.set({ ready: true });
      return Promise.resolve();
    }
    return this.init();
  }

  /** Unknown cloud auth must not assert either a cached account or anonymity. No SDK calls. */
  deferIdentity(): void {
    const changed = this.desiredIdentity !== undefined;
    this.desiredIdentity = undefined;
    this.confirmedRevision = null;
    this.set({ available: this.dependencies.native() && Boolean(this.dependencies.key()),
      identityRevision: this.state.identityRevision + (changed ? 1 : 0), identityConfirmed: false,
      tier: 'free', isPro: false, renewsAt: null, products: this.unknownProducts(), ready: true, error: null });
  }

  async purchase(productId: ProductId): Promise<PurchaseResult> {
    const identity = this.identity();
    const pkg = this.packages.get(productId);
    const info = describeProduct(productId);
    if (!this.state.available || !this.state.ready || !this.isConfirmed(identity) || !pkg || !info) return 'failed';
    return this.enqueue(async () => {
      if (!this.state.ready || !this.isConfirmed(identity)) return 'failed';
      try {
        const sdk = this.configuredSDK!;
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        const { customerInfo } = await sdk.purchasePackage({ aPackage: pkg as never });
        this.requireCurrent(identity);
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        this.applyCustomer(customerInfo as unknown as RCCustomerInfo);
        return tierAtLeast(this.state.tier, info.tier) ? 'purchased' : 'unconfirmed';
      } catch (error) {
        return this.isConfirmed(identity) ? purchaseErrorResult(error) : 'failed';
      }
    });
  }

  /** Distinguish a successful check with no plan from a failed store check. */
  async restore(): Promise<RestoreResult> {
    const identity = this.identity();
    if (!this.state.available || !this.state.ready || !this.isConfirmed(identity)) return 'failed';
    return this.enqueue(async () => {
      if (!this.state.ready || !this.isConfirmed(identity)) return 'failed';
      try {
        const sdk = this.configuredSDK!;
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        const { customerInfo } = await sdk.restorePurchases();
        this.requireCurrent(identity);
        await this.verifyIdentity(sdk, identity);
        this.requireCurrent(identity);
        this.applyCustomer(customerInfo as unknown as RCCustomerInfo);
        return this.state.tier !== 'free' ? 'restored' : 'not-found';
      } catch {
        return 'failed';
      }
    });
  }
}

export const purchases = new PurchasesService();

/** Live level for components. `gating` is true only where subscriptions can be bought. `isPro` = Pro or higher. */
export function usePro(): PurchasesState & { gating: boolean } {
  const state = useSyncExternalStore(purchases.subscribe, purchases.getState, purchases.getState);
  return { ...state, gating: state.available };
}
