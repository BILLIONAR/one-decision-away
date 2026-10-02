import { isIntent, type Intent } from '../data/starterDecisions';

export const ONBOARDING_DRAFT_KEY = 'oda_onboarding_draft_v1';
export interface OnboardingDraft {
  step: 0 | 1 | 2 | 3 | 4;
  name: string;
  intent: Intent | null;
  dreamId: string | null;
  decision: string;
}

export function normalizeOnboardingDraft(value: unknown): OnboardingDraft | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const draft = value as Record<string, unknown>;
  if (draft.version !== 1) return null;
  const name = typeof draft.name === 'string' ? draft.name.slice(0, 80) : '';
  const requested = typeof draft.step === 'number' && Number.isInteger(draft.step) && draft.step >= 0 && draft.step <= 4 ? draft.step : 0;
  return {
    step: (requested > 1 && !name.trim() ? 1 : requested) as OnboardingDraft['step'],
    name,
    intent: isIntent(draft.intent) ? draft.intent : null,
    dreamId: typeof draft.dreamId === 'string' ? draft.dreamId.slice(0, 120) : null,
    decision: typeof draft.decision === 'string' ? draft.decision.slice(0, 500) : '',
  };
}

export function readOnboardingDraft(): OnboardingDraft | null {
  try { return normalizeOnboardingDraft(JSON.parse(localStorage.getItem(ONBOARDING_DRAFT_KEY) || 'null')); }
  catch { return null; }
}
export function writeOnboardingDraft(draft: OnboardingDraft): void {
  try { localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify({ version: 1, ...draft })); }
  catch { /* The current setup still works when persistent storage is unavailable. */ }
}
export function clearOnboardingDraft(): void {
  try { localStorage.removeItem(ONBOARDING_DRAFT_KEY); } catch { /* Optional draft storage. */ }
}

/** A fresh preview may seed setup; restored or already typed text always wins. */
export function decisionFromPreview(current: string, chosen: string, hasSavedDraft: boolean): string {
  return hasSavedDraft || current.length > 0 ? current : chosen;
}
