import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trialDaysOf } from '../src/services/purchases';
import { createReminderReplacer, planReminders, reminderId, REMINDER_ID_BASE, REMINDER_PREVIEW_ID } from '../src/services/nativeNotifications';

test('trial length comes only from a free intro offer', () => {
  assert.equal(trialDaysOf({ price: 0, periodUnit: 'DAY', periodNumberOfUnits: 7 }), 7);
  assert.equal(trialDaysOf({ price: 0, periodUnit: 'WEEK', periodNumberOfUnits: 1 }), 7);
  assert.equal(trialDaysOf({ price: 0.99, periodUnit: 'WEEK', periodNumberOfUnits: 1 }), null);
  assert.equal(trialDaysOf(null), null);
});

test('native reminders: a week ahead, past times skipped, stable ids', () => {
  const now = new Date(2026, 8, 27, 12, 0, 0);
  const plan = planReminders({
    now, days: 7,
    slotsFor: day => (day === 0 ? [['evening', '20:30']] : [['morning', '08:30'], ['evening', '20:30']]),
    slotIndex: slot => (slot === 'morning' ? 0 : 4),
    textFor: (slot, day) => ({ title: slot, body: `d${day}` }),
  });
  assert.equal(plan.length, 1 + 6 * 2);
  assert.equal(plan[0].id, reminderId(0, 4));
  assert.equal(plan[0].at.getHours(), 20);
  assert.ok(plan.every(r => r.at > now && r.id >= REMINDER_ID_BASE && r.id < REMINDER_ID_BASE + 100));
  assert.equal(new Set(plan.map(r => r.id)).size, plan.length);
  const late = planReminders({ now: new Date(2026, 8, 27, 21, 0), days: 1, slotsFor: () => [['evening', '20:30']], slotIndex: () => 4, textFor: () => ({ title: '', body: '' }) });
  assert.equal(late.length, 0);
});

test('native planner rejects malformed times and keeps a bounded week inside its namespace', () => {
  const base = {
    now: new Date(2026, 8, 27, 7, 0), days: 365,
    slotsFor: () => [['morning', '25:00'], ['morning', '08:99'], ['morning', '08:30extra'], ['morning', '08:30']] as ['morning', string][],
    slotIndex: () => 0, textFor: () => ({ title: '', body: '' }),
  };
  const plan = planReminders(base);
  assert.equal(plan.length, 7);
  assert.equal(plan[0].at.getHours(), 8);
  assert.ok(plan.every(item => item.id >= REMINDER_ID_BASE && item.id < REMINDER_ID_BASE + 100));
  assert.deepEqual(planReminders({ ...base, slotIndex: () => -1 }), []);
  assert.deepEqual(planReminders({ ...base, days: Infinity }), []);
  assert.deepEqual(planReminders({ ...base, now: new Date(NaN) }), []);
});

test('interrupted native scheduling leaves the newest state and preserves other notifications', async () => {
  let scheduled = [{ id: 12 }, { id: REMINDER_PREVIEW_ID }];
  let release: () => void;
  const interrupted = new Promise<void>(resolve => { release = resolve; });
  let first = true;
  const calls: string[] = [];
  const fakePlugin = {
    getPending: async () => ({ notifications: scheduled }),
    cancel: async ({ notifications }: { notifications: { id: number }[] }) => {
      calls.push('cancel');
      scheduled = scheduled.filter(item => !notifications.some(deleted => deleted.id === item.id));
    },
    schedule: async ({ notifications }: { notifications: { id: number }[] }) => {
      calls.push('schedule');
      if (first) { first = false; await interrupted; }
      scheduled.push(...notifications);
    },
  };
  const replace = createReminderReplacer(async () => fakePlugin as any);
  const firstSave = replace([{ id: reminderId(0, 0), at: new Date(Date.now() + 60_000), title: 'choose', body: '' }]);
  const newestSave = replace([]); // Decision kept while the first schedule is in flight.
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(calls, ['schedule']);
  release!();
  await Promise.all([firstSave, newestSave]);
  assert.deepEqual(scheduled.map(item => item.id), [12, REMINDER_PREVIEW_ID]);
  assert.deepEqual(calls, ['schedule', 'cancel']);
});

test('a native plugin error does not prevent the next reminder replacement', async () => {
  let attempts = 0;
  let saved = false;
  const replace = createReminderReplacer(async () => {
    if (++attempts === 1) throw new Error('temporary interruption');
    return {
      getPending: async () => ({ notifications: [] }),
      schedule: async () => { saved = true; },
    } as any;
  });
  const reminder = { id: reminderId(0, 0), at: new Date(Date.now() + 60_000), title: 'choose', body: '' };
  await replace([reminder]);
  await replace([reminder]);
  assert.equal(saved, true);
});
