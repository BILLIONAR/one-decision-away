/**
 * ODA Pro purchases through Apple, verified by RevenueCat. Only the iPhone app
 * with VITE_REVENUECAT_IOS_KEY set can sell Pro; everywhere else `available`
 * is false, nothing is locked and the paywall says where Pro can be bought.
 * No fake purchases, no demo toggles.
 */
import { useSyncExternalStore } from 'react';
import { isNative } from './native';

export const PRO_ENTITLEMENT = 'pro';
export const MANAGE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export type PlanId = 'annual' | 'monthly';
export type ProPlan = { id: PlanId; price: string; perMonth: string | null; trialDays: number | null };
export type PurchasesState = {
  /** Pro can be bought here (iPhone app with purchases configured). */
  available: boolean;
  /** Offerings and customer info have loaded (or failed). */
  ready: boolean;
  isPro: boolean;
  /** When the active Pro period ends or renews, if known. */
  renewsAt: string | null;
  plans: ProPlan[];
  error: string | null;
};

export type PurchaseResult = 'purchased' | 'cancelled' | 'failed';

const apiKey = (): string => (import.meta.env?.VITE_REVENUECAT_IOS_KEY as string | undefined)?.trim() ?? '';

/** Trial length in days from an intro offer, when it is free. */
export function trialDaysOf(intro: { price: number; periodUnit: string; periodNumberOfUnits: number } | null | undefined): number | null {
  if (!intro || intro.price !== 0) return null;
  const n = intro.periodNumberOfUnits;
  switch (intro.periodUnit) {
    case 'DAY': return n;
    case 'WEEK': return n * 7;
    case 'MONTH': return n * 30;
    default: return null;
  }
}

type Listener = () => void;
type RCPackage = { packageType: string; identifier: string; product: { priceString: string; pricePerMonthString: string | null; introPrice: { price: number; periodUnit: string; periodNumberOfUnits: number } | null } };
type RCCustomerInfo = { entitlements: { active: Record<string, { expirationDate: string | null } | undefined> } };

class PurchasesService {
  private state: PurchasesState = { available: false, ready: true, isPro: false, renewsAt: null, plans: [], error: null };
  private listeners = new Set<Listener>();
  private packages = new Map<PlanId, RCPackage>();
  private started = false;

  getState = (): PurchasesState => this.state;
  subscribe = (fn: Listener) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private set(patch: Partial<PurchasesState>) { this.state = { ...this.state, ...patch }; this.listeners.forEach(fn => fn()); }

  private async sdk() {
    const { Purchases } = await import('@revenuecat/purchases-capacitor');
    return Purchases;
  }

  private applyCustomer(info: RCCustomerInfo) {
    const active = info.entitlements.active[PRO_ENTITLEMENT];
    this.set({ isPro: Boolean(active), renewsAt: active?.expirationDate ?? null });
  }

  /** Safe to call more than once; does nothing outside the iPhone app. */
  async init(): Promise<void> {
    if (this.started) return;
    this.started = true;
    if (!isNative() || !apiKey()) return;
    this.set({ available: true, ready: false });
    try {
      const Purchases = await this.sdk();
      await Purchases.configure({ apiKey: apiKey() });
      await Purchases.addCustomerInfoUpdateListener(info => this.applyCustomer(info as unknown as RCCustomerInfo));
      const [{ customerInfo }, offerings] = await Promise.all([Purchases.getCustomerInfo(), Purchases.getOfferings()]);
      this.applyCustomer(customerInfo as unknown as RCCustomerInfo);
      const current = offerings.current as unknown as { annual: RCPackage | null; monthly: RCPackage | null } | null;
      const plans: ProPlan[] = [];
      for (const [id, pkg] of [['annual', current?.annual], ['monthly', current?.monthly]] as const) {
        if (!pkg) continue;
        this.packages.set(id, pkg);
        plans.push({ id, price: pkg.product.priceString, perMonth: id === 'annual' ? pkg.product.pricePerMonthString : null, trialDays: trialDaysOf(pkg.product.introPrice) });
      }
      this.set({ plans, ready: true, error: plans.length ? null : 'no-plans' });
    } catch {
      this.set({ ready: true, error: 'unavailable' });
    }
  }

  /** Ties purchases to the ODA account so Pro follows the member to a new phone. */
  async identify(userId: string | null): Promise<void> {
    if (!this.state.available) return;
    try {
      const Purchases = await this.sdk();
      if (userId) this.applyCustomer((await Purchases.logIn({ appUserID: userId })).customerInfo as unknown as RCCustomerInfo);
      else if (!(await Purchases.isAnonymous()).isAnonymous) this.applyCustomer((await Purchases.logOut()).customerInfo as unknown as RCCustomerInfo);
    } catch { /* keep the current entitlement */ }
  }

  async purchase(plan: PlanId): Promise<PurchaseResult> {
    const pkg = this.packages.get(plan);
    if (!this.state.available || !pkg) return 'failed';
    try {
      const Purchases = await this.sdk();
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg as never });
      this.applyCustomer(customerInfo as unknown as RCCustomerInfo);
      return this.state.isPro ? 'purchased' : 'failed';
    } catch (error) {
      const e = error as { code?: string | number; userCancelled?: boolean | null };
      return e?.userCancelled || String(e?.code) === '1' || e?.code === 'PURCHASE_CANCELLED' ? 'cancelled' : 'failed';
    }
  }

  async restore(): Promise<boolean> {
    if (!this.state.available) return false;
    try {
      const Purchases = await this.sdk();
      const { customerInfo } = await Purchases.restorePurchases();
      this.applyCustomer(customerInfo as unknown as RCCustomerInfo);
      return this.state.isPro;
    } catch {
      return false;
    }
  }
}

export const purchases = new PurchasesService();

/** Live Pro state for components. `gating` is true only where Pro can be bought. */
export function usePro(): PurchasesState & { gating: boolean } {
  const state = useSyncExternalStore(purchases.subscribe, purchases.getState, purchases.getState);
  return { ...state, gating: state.available };
}
