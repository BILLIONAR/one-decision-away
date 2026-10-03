import assert from 'node:assert/strict';
import test from 'node:test';
import { timerFocusEvidence } from '../src/services/focusEvidence';
import type { MissionCompletion } from '../src/types/models';

const record = (day: string, patch: Partial<MissionCompletion> = {}): MissionCompletion => ({
  id: day, missionId: day, userId: 'u', completedAt: `${day}T12:00:00Z`, method: 'timer',
  focusMinutes: 12, rewardAmount: 0, streakBonus: 0, ...patch,
});
const now = new Date('2026-10-03T14:00:00Z');
test('focus streak counts distinct real timer days, not estimates, duplicates or future records', () => {
  const records = [record('2026-10-01'), record('2026-10-02'), record('2026-10-03'),
    record('2026-10-03', { id: 'other', missionId: 'other', focusMinutes: 5 }),
    record('2026-10-03', { id: 'duplicate' }), record('2026-10-04'),
    record('2026-09-30', { method: 'photo' }), record('2026-09-29', { method: 'self' }),
    record('2026-09-28', { focusMinutes: 0 }), record('2026-09-27', { focusMinutes: NaN }),
    record('2026-09-26', { completedAt: 'invalid' })];
  const before = JSON.stringify(records);
  const evidence = timerFocusEvidence(records, now);
  assert.equal(evidence.streak, 3);
  assert.equal(evidence.todayMinutes, 17);
  assert.equal(evidence.days.length, 7);
  assert.equal(evidence.days[0].dayKey, '2026-09-27');
  assert.equal(JSON.stringify(records), before);
});
test('yesterday continues a streak until today ends; missing yesterday ends it', () => {
  assert.equal(timerFocusEvidence([record('2026-10-01'), record('2026-10-02')], now).streak, 2);
  assert.equal(timerFocusEvidence([record('2026-10-01')], now).streak, 0);
  assert.equal(timerFocusEvidence([], now).streak, 0);
});
test('UTC boundary is explicit and later repeatable-quest sessions remain evidence', () => {
  const evidence = timerFocusEvidence([record('2026-10-01', { completedAt: '2026-10-02T01:00:00+03:00' }),
    record('2026-10-03', { missionId: '2026-10-01' })], now);
  assert.equal(evidence.streak, 1);
  assert.equal(evidence.days.find(day => day.dayKey === '2026-10-01')?.minutes, 12);
  assert.equal(evidence.todayMinutes, 12);
});
test('canonical IDs and exact events dedup without losing spaced completions of the same quest', () => {
  const records = [record('2026-10-01', { id: 'session-1', missionId: 'repeatable' }),
    record('2026-10-02', { id: 'session-2', missionId: 'repeatable' }),
    record('2026-10-03', { id: 'session-3', missionId: 'repeatable', focusMinutes: 10 }),
    record('2026-10-03', { id: 'session-4', missionId: 'repeatable', completedAt: '2026-10-03T14:00:00Z', focusMinutes: 5 }),
    record('2026-10-03', { id: 'session-4', missionId: 'repeatable', completedAt: '2026-10-03T14:00:00Z', focusMinutes: 5 }),
    record('2026-10-03', { id: 'duplicate-event', missionId: 'repeatable', completedAt: '2026-10-03T17:00:00+03:00', focusMinutes: 5 })];
  const evidence = timerFocusEvidence(records, now);
  assert.equal(evidence.streak, 3);
  assert.equal(evidence.todayMinutes, 15);
  assert.deepEqual(evidence.days.slice(-3).map(day => day.minutes), [12, 12, 15]);
});
