import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trialDaysOf } from '../src/services/purchases';
import { planReminders, reminderId, REMINDER_ID_BASE } from '../src/services/nativeNotifications';

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
