/** Values verified against installed RevenueCat Capacitor 13.6.1 types. */
export type TrialEligibility = 'eligible' | 'ineligible' | 'unknown';
export type PurchaseResult = 'purchased' | 'cancelled' | 'pending' | 'unconfirmed' | 'failed';
export type RestoreResult = 'restored' | 'not-found' | 'failed';

export function trialEligibilityOf(status: unknown): TrialEligibility {
  if (status === 2) return 'eligible';
  if (status === 1 || status === 3) return 'ineligible';
  return 'unknown';
}

export function confirmedTrialDays(product: { trialDays: number | null; trialEligibility: TrialEligibility } | null | undefined): number | null {
  return product?.trialEligibility === 'eligible' ? product.trialDays : null;
}

export function purchaseErrorResult(error: unknown): Exclude<PurchaseResult, 'purchased' | 'unconfirmed'> {
  const e = error as { code?: string | number; userCancelled?: boolean | null } | null;
  const code = String(e?.code ?? '');
  if (e?.userCancelled || ['1', 'PURCHASE_CANCELLED_ERROR', 'PURCHASE_CANCELLED'].includes(code)) return 'cancelled';
  if (['20', 'PAYMENT_PENDING_ERROR', 'PAYMENT_PENDING'].includes(code)) return 'pending';
  return 'failed';
}
