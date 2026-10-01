import test from 'node:test';
import assert from 'node:assert/strict';
import type { Mission, WalletTransaction } from '../src/types/models';
import { bankPracticeSummary, rewardUnlockStatus } from '../src/services/bankPractice';
import { computeLedgerBalance, estimateDailyEarningPace } from '../src/services/economy';
import { rewardUnlockLabel, rewardsCopy } from '../src/i18n/rewards';

const now = new Date(2026, 9, 1, 12);
const mission = (id: string, day: number, extra: Partial<Mission> = {}): Mission => ({
  id, userId: 'test', title: 'A kept decision', type: 'daily_quest', area: 'Work', difficulty: 'easy',
  createdAt: new Date(2026, 8, day, 9).toISOString(), completedAt: new Date(2026, 8, day, 12).toISOString(),
  isOneDecision: true, status: 'completed', ...extra,
});
const grant: WalletTransaction = { id: 'grant', userId: 'test', walletId: 'test-wallet', amount: 500, kind: 'welcome_grant', dayKey: '2026-10-01', createdAt: now.toISOString(), memo: 'Welcome' };

test('a welcome grant preserves the balance and supplies zero practice evidence', () => {
  assert.equal(computeLedgerBalance([grant]), 500);
  assert.deepEqual(bankPracticeSummary([], now), { daysLast7: 0, keptToday: 0 });
  const pace = estimateDailyEarningPace([grant]);
  assert.equal(pace.isBaseline, true);
  assert.deepEqual(rewardUnlockStatus(1000, 500, pace), { kind: 'symbolic' });
});

test('mixed financial deposits cannot inflate distinct kept days or completed decisions', () => {
  const missions = [mission('one', 30), mission('two', 30), mission('old', 24), mission('ordinary', 29, { isOneDecision: false }), mission('unfinished', 29, { status: 'active' }), mission('missing', 29, { completedAt: undefined })];
  assert.deepEqual(bankPracticeSummary(missions, now), { daysLast7: 1, keptToday: 0 });
  const today = mission('today', 30, { completedAt: now.toISOString() });
  assert.deepEqual(bankPracticeSummary([...missions, today], now), { daysLast7: 2, keptToday: 1 });
  assert.equal(computeLedgerBalance([grant, { ...grant, id: 'earned', kind: 'one_decision_reward', amount: 200 }, { ...grant, id: 'spent', kind: 'purchase', amount: -100 }]), 600);
});

test('practice week follows local calendar boundaries and repeated days count once', () => {
  const missions = [mission('six', 25), mission('outside', 24), mission('today', 30, { completedAt: new Date(2026, 9, 1, 1).toISOString() }), mission('same-day', 30, { completedAt: new Date(2026, 9, 1, 23).toISOString() })];
  assert.deepEqual(bankPracticeSummary(missions, now), { daysLast7: 2, keptToday: 2 });
});

test('reward labels distinguish symbolic unlocking from actual D$ pace estimates in every locale', () => {
  assert.deepEqual(rewardUnlockStatus(500, 500, { perDay: 200, isBaseline: true }), { kind: 'ready' });
  assert.deepEqual(rewardUnlockStatus(1000, 500, { perDay: 200, isBaseline: false }), { kind: 'estimate', days: 3 });
  assert.deepEqual(rewardUnlockStatus(1000, 500, { perDay: Number.NaN, isBaseline: false }), { kind: 'symbolic' });
  for (const locale of ['en', 'tr', 'es'] as const) {
    const copy = rewardsCopy(locale);
    assert.equal(rewardUnlockLabel(locale, 1000, 500, { perDay: 200, isBaseline: true }), copy.symbolic);
    assert.equal(rewardUnlockLabel(locale, 1000, 500, { perDay: 200, isBaseline: false }), copy.estimate(3));
    assert.equal(rewardUnlockLabel(locale, 500, 500, { perDay: 200, isBaseline: true }), copy.ready);
    assert.ok(copy.explanation.includes('D$'));
  }
});
