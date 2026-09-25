import test from 'node:test';
import assert from 'node:assert/strict';
import type { Mission, Profile } from '../src/types/models';
import {
  comebackState, daysBetween, evidenceSummary, freshStart, isSimpleMode, keptDecisions,
  localDayKey, twoWeekCheckInDue, usageStats,
} from '../src/services/momentum';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h);
let n = 0;
const decision = (completedAt?: Date, extra: Partial<Mission> = {}): Mission => ({
  id: `d${n++}`, userId: 'u', title: 'Send the email', type: 'daily_quest', area: 'Work', difficulty: 'easy',
  isOneDecision: true, status: completedAt ? 'completed' : 'active', createdAt: (completedAt ?? at(2026, 9, 1)).toISOString(),
  ...(completedAt ? { completedAt: completedAt.toISOString() } : {}), ...extra,
});
const profile = (firstOpenedAt: Date, extra: Partial<Profile> = {}) => ({
  id: 'u', displayName: 'Ü', onboardingStep: 'done', locale: 'en', theme: 'light',
  firstOpenedAt: firstOpenedAt.toISOString(), lastOpenedAt: firstOpenedAt.toISOString(), createdAt: firstOpenedAt.toISOString(), ...extra,
}) as Profile;

test('local day keys and day gaps follow the calendar, not UTC', () => {
  assert.equal(localDayKey(at(2026, 9, 24, 1)), '2026-09-24');
  assert.equal(daysBetween(at(2026, 9, 22, 23), at(2026, 9, 24, 0)), 2);
  assert.equal(daysBetween(at(2026, 3, 28), at(2026, 3, 30)), 2); // across a DST change
});

test('evidence lists kept decisions newest first and counts the last seven days', () => {
  const missions = [decision(at(2026, 9, 20)), decision(at(2026, 9, 24), { plan: { ifThen: 'start anyway', plannedAt: '' }, startedAt: 'x' }), decision(), decision(at(2026, 9, 10))];
  const kept = keptDecisions(missions);
  assert.deepEqual(kept.map(e => e.dayKey), ['2026-09-24', '2026-09-20', '2026-09-10']);
  assert.equal(kept[0].planned, true);
  assert.equal(kept[0].started, true);
  const s = evidenceSummary(missions, at(2026, 9, 24));
  assert.equal(s.total, 3);
  assert.equal(s.last7, 2);
  assert.equal(s.weekDays.length, 7);
  assert.equal(s.weekDays.at(-1)?.dayKey, '2026-09-24');
});

test('comeback is kind after a lapse and silent otherwise', () => {
  const now = at(2026, 9, 24);
  assert.equal(comebackState([], now), null, 'brand-new members get no lapse message');
  assert.equal(comebackState([decision(at(2026, 9, 23))], now), null);
  assert.equal(comebackState([decision(at(2026, 9, 24))], now), null);
  assert.deepEqual(comebackState([decision(at(2026, 9, 22))], now), { kind: 'missed-once', gap: 2 });
  assert.deepEqual(comebackState([decision(at(2026, 9, 18))], now), { kind: 'welcome-back', gap: 6 });
});

test('fresh starts land on the first of the month and on Mondays', () => {
  assert.equal(freshStart(at(2026, 10, 1)), 'month');
  assert.equal(freshStart(at(2026, 9, 21)), 'week'); // Monday
  assert.equal(freshStart(at(2026, 9, 24)), null);
});

test('simple mode lasts a week or until three kept decisions, and can be switched off', () => {
  const now = at(2026, 9, 24);
  assert.equal(isSimpleMode({ profile: profile(at(2026, 9, 22)), missions: [] }, now), true);
  assert.equal(isSimpleMode({ profile: profile(at(2026, 9, 10)), missions: [] }, now), false);
  assert.equal(isSimpleMode({ profile: profile(at(2026, 9, 22)), missions: [decision(at(2026, 9, 22)), decision(at(2026, 9, 23)), decision(at(2026, 9, 24))] }, now), false);
  assert.equal(isSimpleMode({ profile: profile(at(2026, 9, 22), { simpleModeOff: true }), missions: [] }, now), false);
});

test('the day-14 question appears once, only for people who used decisions', () => {
  const now = at(2026, 9, 24);
  assert.equal(twoWeekCheckInDue({ profile: profile(at(2026, 9, 10)), missions: [decision()] }, now), true);
  assert.equal(twoWeekCheckInDue({ profile: profile(at(2026, 9, 11)), missions: [decision()] }, now), false);
  assert.equal(twoWeekCheckInDue({ profile: profile(at(2026, 9, 1)), missions: [] }, now), false);
  assert.equal(twoWeekCheckInDue({ profile: profile(at(2026, 9, 1), { twoWeekCheckIn: { answer: 'yes', at: '' } }), missions: [decision()] }, now), false);
  const stats = usageStats({ profile: profile(at(2026, 9, 10)), missions: [decision(at(2026, 9, 12), { startedAt: 'x' }), decision()] }, now);
  assert.deepEqual(stats, { daysSinceStart: 14, decisionsSet: 2, decisionsKept: 1, plansMade: 0, twoMinuteStarts: 1 });
});

test('the weekly look-back is offered on Sunday and Monday, once per week, and its change lasts a week', async () => {
  const { reviewWeekKey, keptInWeek, weeklyReviewDue, weeklyFocus } = await import('../src/services/momentum');
  const sunday = at(2026, 9, 27), monday = at(2026, 9, 28), wednesday = at(2026, 9, 30);
  assert.equal(reviewWeekKey(sunday), '2026-09-27');
  assert.equal(reviewWeekKey(monday), '2026-09-27');
  assert.equal(reviewWeekKey(wednesday), null);
  const missions = [decision(at(2026, 9, 21)), decision(at(2026, 9, 25)), decision(at(2026, 9, 27)), decision(at(2026, 9, 20))];
  assert.equal(keptInWeek(missions, '2026-09-27'), 3);
  assert.equal(weeklyReviewDue({ missions, weeklyReviews: [] }, sunday), '2026-09-27');
  assert.equal(weeklyReviewDue({ missions: [], weeklyReviews: [] }, sunday), null);
  const reviews = [{ weekKey: '2026-09-27', kept: 3, change: 'Decide the night before', createdAt: '' }];
  assert.equal(weeklyReviewDue({ missions, weeklyReviews: reviews }, monday), null);
  assert.equal(weeklyFocus({ weeklyReviews: reviews }, sunday), null, 'the new change starts with the new week');
  assert.equal(weeklyFocus({ weeklyReviews: reviews }, wednesday), 'Decide the night before');
  assert.equal(weeklyFocus({ weeklyReviews: reviews }, at(2026, 10, 5)), null);
});

test('the chain forgives one missed day a week, but not two in a row or two in a week', async () => {
  const { decisionChain } = await import('../src/services/momentum');
  const now = at(2026, 9, 24, 20);
  assert.deepEqual(decisionChain([], now), { days: 0, graceUsed: false, atRisk: false });
  // 20, 21, 22 kept; 23 missed; today open → chain alive, yesterday was the flex day.
  const lapsed = [decision(at(2026, 9, 20)), decision(at(2026, 9, 21)), decision(at(2026, 9, 22))];
  assert.deepEqual(decisionChain(lapsed, now), { days: 3, graceUsed: true, atRisk: true });
  // Keeping today closes the gap.
  assert.deepEqual(decisionChain([...lapsed, decision(at(2026, 9, 24))], now), { days: 4, graceUsed: true, atRisk: false });
  // Two missed days in a row end the chain.
  assert.equal(decisionChain([decision(at(2026, 9, 20)), decision(at(2026, 9, 21))], now).days, 0);
  // Two separate misses inside one week: the older part is cut off.
  const twoGaps = [decision(at(2026, 9, 18)), decision(at(2026, 9, 20)), decision(at(2026, 9, 22)), decision(at(2026, 9, 23)), decision(at(2026, 9, 24))];
  assert.equal(decisionChain(twoGaps, now).days, 4);
  // Misses a week apart are both forgiven.
  const spaced = [decision(at(2026, 9, 10)), decision(at(2026, 9, 12)), decision(at(2026, 9, 13)), decision(at(2026, 9, 14)), decision(at(2026, 9, 15)), decision(at(2026, 9, 16)), decision(at(2026, 9, 17)), decision(at(2026, 9, 18)), decision(at(2026, 9, 20)), decision(at(2026, 9, 21)), decision(at(2026, 9, 22)), decision(at(2026, 9, 23)), decision(at(2026, 9, 24))];
  assert.equal(decisionChain(spaced, now).days, 13);
});

test('smart reminders aim 30 minutes before the usual kept time, once there is enough history', async () => {
  const { usualReminderTime } = await import('../src/services/momentum');
  assert.equal(usualReminderTime([decision(at(2026, 9, 20, 21)), decision(at(2026, 9, 21, 21))]), null);
  const evenings = [decision(new Date(2026, 8, 20, 21, 10)), decision(new Date(2026, 8, 21, 20, 50)), decision(new Date(2026, 8, 22, 23, 55))];
  assert.equal(usualReminderTime(evenings), '20:40');
  const early = [decision(new Date(2026, 8, 20, 6, 0)), decision(new Date(2026, 8, 21, 6, 10)), decision(new Date(2026, 8, 22, 6, 5))];
  assert.equal(usualReminderTime(early), '07:00');
});

test('every sign-up intent points at a real course and offers three easy decisions', async () => {
  const { INTENTS, easyDecisions, courseForIntent, COMEBACK_DECISIONS } = await import('../src/data/starterDecisions');
  const { COURSES } = await import('../src/data/courses');
  const ids = new Set(COURSES.map(course => course.id));
  for (const item of INTENTS) {
    assert.ok(ids.has(courseForIntent(item.key)!), item.key);
    assert.equal(easyDecisions(item.key).length, 3);
  }
  assert.equal(easyDecisions(null).length, 3);
  assert.equal(COMEBACK_DECISIONS.length, 3);
});

test('the reminder voice keeps one line per day and never threatens a streak', async () => {
  const { VOICE, voiceLine } = await import('../src/data/odaVoice');
  const day = new Date(2026, 8, 24, 9);
  assert.equal(voiceLine('choose', day), voiceLine('choose', new Date(2026, 8, 24, 22)));
  for (const lines of Object.values(VOICE)) for (const line of lines) assert.doesNotMatch(line, /streak|lose|fail|excuse/i);
});
