import assert from 'node:assert/strict';
import test from 'node:test';
import { formatDate, getLocale, setLocale } from '../src/i18n';
import { getInitialDemoState } from '../src/services/repository';
import { calculateMicroHabitStreak, checkAndApplyDailyMicroHabitRollover, getCurrentDateKey, getYesterdayDateKey } from '../src/services/microHabitsService';
import { getDailyRewardAmount, getMicroHabitRewardAmount, microHabitRewardId } from '../src/services/economy';
import type { WalletTransaction } from '../src/types/models';

function inZone(zone: string, run: () => void) {
  const previous = process.env.TZ;
  process.env.TZ = zone;
  try { run(); }
  finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
}

test('habit completion dates agree with the local Today calendar on either side of UTC midnight', () => {
  inZone('Europe/Istanbul', () => {
    const now = new Date('2026-09-30T21:30:00Z');
    assert.equal(getCurrentDateKey(now), '2026-10-01');
    assert.equal(getYesterdayDateKey(now), '2026-09-30');
    assert.equal(calculateMicroHabitStreak(['2026-09-30', '2026-10-01'], now), 2);
  });
  inZone('America/Los_Angeles', () => {
    const now = new Date('2026-10-01T00:30:00Z');
    assert.equal(getCurrentDateKey(now), '2026-09-30');
    assert.equal(getYesterdayDateKey(now), '2026-09-29');
    assert.equal(calculateMicroHabitStreak(['2026-09-29', '2026-09-30'], now), 2);
  });
});

test('habit yesterday and streaks count actual calendar dates through both DST changes', () => {
  inZone('America/Los_Angeles', () => {
    // After a 23-hour day, elapsed 24-hour subtraction would skip March 8.
    const spring = new Date('2026-03-09T00:15:00-07:00');
    assert.equal(getYesterdayDateKey(spring), '2026-03-08');
    assert.equal(calculateMicroHabitStreak(['2026-03-07', '2026-03-08', '2026-03-09'], spring), 3);
    const fall = new Date('2026-11-02T00:15:00-08:00');
    assert.equal(getYesterdayDateKey(fall), '2026-11-01');
    assert.equal(calculateMicroHabitStreak(['2026-10-31', '2026-11-01', '2026-11-02'], fall), 3);
    assert.equal(calculateMicroHabitStreak(['2026-10-30', '2026-10-31'], fall), 0);
  });
});

test('habits roll over at local midnight and keep the previous local day history', () => {
  inZone('Europe/Istanbul', () => {
    const data = getInitialDemoState();
    data.lastActiveDateKey = '2026-09-30';
    data.microHabits = [{ ...data.microHabits![0], completedDates: ['2026-09-29', '2026-09-30'], streakCount: 2, bestStreak: 2 }];
    const midnight = checkAndApplyDailyMicroHabitRollover(data, new Date('2026-09-30T21:01:00Z'));
    assert.equal(midnight.hasChanged, true);
    assert.equal(midnight.currentDateKey, '2026-10-01');
    assert.equal(midnight.updatedData.microHabits![0].streakCount, 2);
    assert.deepEqual(midnight.updatedData.microHabits![0].completedDates, ['2026-09-29', '2026-09-30']);
    const utcMidnight = checkAndApplyDailyMicroHabitRollover(midnight.updatedData, new Date('2026-10-01T00:01:00Z'));
    assert.equal(utcMidnight.hasChanged, false);
    assert.equal(utcMidnight.updatedData, midnight.updatedData);
  });
});

test('rollover fallback converts the last-opened instant to its local day', () => {
  inZone('Europe/Istanbul', () => {
    const data = getInitialDemoState();
    delete data.lastActiveDateKey;
    data.profile.lastOpenedAt = '2026-09-30T21:10:00Z';
    assert.equal(checkAndApplyDailyMicroHabitRollover(data, new Date('2026-09-30T22:00:00Z')).hasChanged, false);
  });
});

test('date-only values display their saved day while timestamps retain instant conversion', () => {
  const previous = getLocale();
  setLocale('en');
  try {
    inZone('America/Los_Angeles', () => {
      assert.equal(formatDate('2026-10-01'), 'Oct 1');
      assert.equal(formatDate('2026-03-08'), 'Mar 8');
      assert.equal(formatDate('2026-11-01'), 'Nov 1');
      assert.equal(formatDate('2026-10-01T00:30:00Z'), 'Sep 30');
    });
    inZone('Pacific/Kiritimati', () => {
      assert.equal(formatDate('2026-10-01'), 'Oct 1');
      assert.equal(formatDate('2026-09-30T23:30:00Z'), 'Oct 1');
    });
  } finally { setLocale(previous); }
});

test('calendar formatting rejects normalized impossible days and keeps invalid values readable', () => {
  for (const value of ['2026-02-30', '2026-13-01', '2026-00-01', '2026-04-31', 'not-a-date']) {
    assert.equal(formatDate(value), value);
  }
});

const credit = (patch: Partial<WalletTransaction> = {}): WalletTransaction => ({ id: 'previous-credit', walletId: 'wallet-demo', userId: 'u', kind: 'micro_habit_reward', amount: 25, dayKey: '2026-09-30', memo: 'Private writing is not an identifier', createdAt: '2026-09-30T21:30:00Z', ...patch });

test('habit reward identity survives undo, reload and UTC midnight without paying the same local day twice', () => {
  const first = credit({ id: microHabitRewardId('habit:a', '2026-10-01'), refType: 'micro_habit', refId: 'habit:a' });
  const rewards = JSON.parse(JSON.stringify([first])) as WalletTransaction[];
  assert.equal(getMicroHabitRewardAmount(rewards, 'habit:a', '2026-10-01', new Date('2026-09-30T21:31:00Z')), 0);
  assert.equal(getMicroHabitRewardAmount(rewards, 'habit:a', '2026-10-01', new Date('2026-10-01T00:31:00Z')), 0);
  assert.equal(getMicroHabitRewardAmount(rewards, 'habit:b', '2026-10-01', new Date('2026-09-30T21:31:00Z')), 25);
});

test('local midnight cannot earn the same habit twice in the UTC reward day', () => {
  const first = credit({ id: microHabitRewardId('habit:a', '2026-09-30'), refType: 'micro_habit', refId: 'habit:a' });
  assert.equal(getMicroHabitRewardAmount([first], 'habit:a', '2026-10-01', new Date('2026-09-30T21:31:00Z')), 0);
  assert.equal(getMicroHabitRewardAmount([first], 'habit:a', '2026-10-01', new Date('2026-10-01T21:31:00Z')), 25);
});

test('habit and check-in rewards share the notebook UTC ceiling, including partial and exhausted budgets', () => {
  const now = new Date('2026-09-30T21:30:00Z');
  const earnings = [credit({ kind: 'mission_reward', amount: 2490 }), credit({ kind: 'welcome_grant', amount: 250 }), credit({ kind: 'purchase', amount: -100 })];
  assert.equal(getDailyRewardAmount(earnings, 50, now), 10);
  assert.equal(getMicroHabitRewardAmount(earnings, 'new-habit', '2026-10-01', now), 10);
  const exhausted = [...earnings, credit({ id: 'last-10', kind: 'check_in_reward', amount: 10 })];
  assert.equal(getDailyRewardAmount(exhausted, 50, now), 0);
  assert.equal(getDailyRewardAmount(exhausted, 50, new Date('2026-10-01T00:01:00Z')), 50);
});
