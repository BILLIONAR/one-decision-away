/**
 * Behaviour-change helpers for the daily One Decision.
 *
 * Grounded in: implementation intentions / mental contrasting (Gollwitzer &
 * Sheeran 2006; Oettingen's WOOP), procrastination as mood repair (Sirois &
 * Pychyl 2013), self-forgiveness after a lapse (Wohl, Pychyl & Bennett 2010),
 * the "fresh start effect" (Dai, Milkman & Riis 2014) and habit formation,
 * where one missed day did not derail progress (Lally et al. 2010).
 *
 * Pure functions only: dates are local calendar days so the UI and tests agree.
 */
import type { Mission, UserData } from '../types/models';
import { N_ } from '../i18n';

export type DecisionFeeling = 'overwhelming' | 'boring' | 'scary' | 'unclear' | 'fine';

export const FEELINGS: { key: DecisionFeeling; label: string; tip: string }[] = [
  { key: 'overwhelming', label: N_('Too big'), tip: N_('Make it smaller. What is the first piece you could finish in two minutes?') },
  { key: 'boring', label: N_('Boring'), tip: N_('Boring is allowed. Pair it with something you enjoy, or promise yourself only two minutes.') },
  { key: 'scary', label: N_('Scary'), tip: N_('Fear often means it matters. You don’t need to feel ready to take one small step.') },
  { key: 'unclear', label: N_('Unclear'), tip: N_('Unclear tasks stall. Write down the very first physical action, like opening the file.') },
  { key: 'fine', label: N_('I’m okay'), tip: N_('Good. Protect this moment and start before the feeling changes.') },
];

export const TWO_MINUTES = 120;
const DAY = 86_400_000;

export function localDayKey(date: Date | string | number = new Date()): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Whole local calendar days from `from` to `to` (DST-safe). */
export function daysBetween(from: Date | string, to: Date | string = new Date()): number {
  const a = new Date(from); const b = new Date(to);
  return Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / DAY);
}

export type EvidenceEntry = { id: string; title: string; dayKey: string; completedAt: string; planned: boolean; started: boolean };

/** Every kept One Decision, newest first: the user's "evidence" that they keep their word. */
export function keptDecisions(missions: Mission[]): EvidenceEntry[] {
  return missions
    .filter(m => m.isOneDecision && m.status === 'completed' && m.completedAt)
    .map(m => ({ id: m.id, title: m.title, dayKey: localDayKey(m.completedAt!), completedAt: m.completedAt!, planned: Boolean(m.plan?.ifThen?.trim()), started: Boolean(m.startedAt) }))
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

export type EvidenceSummary = { total: number; days: number; last7: number; weekDays: { dayKey: string; kept: boolean }[] };

export function evidenceSummary(missions: Mission[], now = new Date()): EvidenceSummary {
  const kept = keptDecisions(missions);
  const keptDays = new Set(kept.map(e => e.dayKey));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dayKey = localDayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - i)));
    return { dayKey, kept: keptDays.has(dayKey) };
  });
  return { total: kept.length, days: keptDays.size, last7: weekDays.filter(d => d.kept).length, weekDays };
}

export type Comeback = { kind: 'missed-once' | 'welcome-back'; gap: number } | null;

/**
 * A kind return after a lapse. Nothing for brand-new users, nothing if the
 * user kept yesterday's or today's decision.
 */
export function comebackState(missions: Mission[], now = new Date()): Comeback {
  const kept = keptDecisions(missions);
  if (!kept.length) return null;
  const gap = daysBetween(kept[0].completedAt, now);
  if (gap <= 1) return null;
  return gap === 2 ? { kind: 'missed-once', gap } : { kind: 'welcome-back', gap };
}

export type FreshStart = 'month' | 'week' | null;
/** Temporal landmarks make starting over feel natural. */
export function freshStart(now = new Date()): FreshStart {
  if (now.getDate() === 1) return 'month';
  if (now.getDay() === 1) return 'week';
  return null;
}

/** New members see only the essentials until they keep 3 decisions or a week passes. */
export const SIMPLE_MODE_DAYS = 7;
export const SIMPLE_MODE_KEPT = 3;
export function isSimpleMode(data: Pick<UserData, 'profile' | 'missions'>, now = new Date()): boolean {
  if (data.profile.simpleModeOff) return false;
  const since = data.profile.firstOpenedAt || data.profile.createdAt;
  if (!since || daysBetween(since, now) >= SIMPLE_MODE_DAYS) return false;
  return keptDecisions(data.missions).length < SIMPLE_MODE_KEPT;
}

export const CHECK_IN_DAY = 14;
export function twoWeekCheckInDue(data: Pick<UserData, 'profile' | 'missions'>, now = new Date()): boolean {
  if (data.profile.twoWeekCheckIn) return false;
  const since = data.profile.firstOpenedAt || data.profile.createdAt;
  return Boolean(since) && daysBetween(since, now) >= CHECK_IN_DAY && data.missions.some(m => m.isOneDecision);
}

export type CheckInAnswer = 'yes' | 'a-little' | 'not-yet';

export function usageStats(data: Pick<UserData, 'profile' | 'missions'>, now = new Date()) {
  const decisions = data.missions.filter(m => m.isOneDecision);
  const since = data.profile.firstOpenedAt || data.profile.createdAt;
  return {
    daysSinceStart: since ? daysBetween(since, now) : 0,
    decisionsSet: decisions.length,
    decisionsKept: keptDecisions(data.missions).length,
    plansMade: decisions.filter(m => m.plan?.ifThen?.trim()).length,
    twoMinuteStarts: decisions.filter(m => m.startedAt).length,
  };
}
