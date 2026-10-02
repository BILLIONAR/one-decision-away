import type { Mission } from '../types/models';
import { evidenceSummary, keptDecisions, localDayKey } from './momentum';

/** Practice evidence uses the same kept One Decisions as Today and Evidence. */
export function bankPracticeSummary(missions: Mission[], now = new Date()) {
  const evidence = evidenceSummary(missions, now);
  const today = localDayKey(now);
  return {
    daysLast7: evidence.last7,
    keptToday: keptDecisions(missions).filter(entry => entry.dayKey === today).length,
  };
}

/** A currency estimate is available only after actual earning history exists. */
export function rewardUnlockStatus(price: number, balance: number, pace: { perDay: number; isBaseline: boolean }) {
  if (balance >= price) return { kind: 'ready' as const };
  if (pace.isBaseline || !Number.isFinite(pace.perDay) || pace.perDay <= 0) return { kind: 'symbolic' as const };
  return { kind: 'estimate' as const, days: Math.max(1, Math.ceil((price - balance) / pace.perDay)) };
}
