import test from 'node:test';
import assert from 'node:assert/strict';
import type { Mission, NotebookEntry, NotebookMutationResult, UserData } from '../src/types/models';
import { availableReviewWeek, courseContinuation, dailyReflection, DAILY_REFLECTION_PROMPT, todayDecision, weekEvidence } from '../src/services/dailyLoop';
import { applyNotebookAction, normalizeNotebook } from '../src/services/notebook';
import { dailyLoopCopy } from '../src/i18n/dailyLoop';

const at = (day: string, hour = 12) => new Date(`${day}T${String(hour).padStart(2, '0')}:00:00`);
let counter = 0;
const mission = (patch: Partial<Mission> = {}): Mission => ({ id: `m${counter++}`, userId: 'u', title: 'Send the draft', type: 'daily_quest', area: 'Work', difficulty: 'easy', isOneDecision: true, status: 'active', createdAt: at('2026-09-23').toISOString(), ...patch });
const entry = (patch: Partial<NotebookEntry> = {}): NotebookEntry => ({ id: `e${counter++}`, kind: 'journal', title: 'Reflection', content: 'I started with one sentence.', dateKey: '2026-09-30', createdAt: at('2026-09-30').toISOString(), updatedAt: at('2026-09-30').toISOString(), promptId: DAILY_REFLECTION_PROMPT, ...patch });
const fixture = (patch: Partial<UserData> = {}): UserData => ({ profile: { id: 'u' }, missions: [], transactions: [], completions: [], dreamJournal: [], checkIns: [], notebook: normalizeNotebook(), ...patch } as UserData);

test('a decision kept today takes priority over array order and an older active carry-over', () => {
  const old = mission({ scheduledFor: '2026-09-23' });
  const done = mission({ status: 'completed', scheduledFor: '2026-09-29', completedAt: at('2026-09-30').toISOString() });
  const later = mission({ scheduledFor: '2026-09-30', createdAt: at('2026-09-30').toISOString() });
  assert.equal(todayDecision([old, later, done], at('2026-09-30'))?.id, done.id);
  assert.equal(todayDecision([old, later], at('2026-09-30'))?.id, later.id);
  assert.equal(todayDecision([old], at('2026-09-30'))?.id, old.id);
});

test('a newly chosen decision after a kept one remains actionable today', () => {
  const done = mission({ status: 'completed', completedAt: at('2026-09-30', 12).toISOString() });
  const next = mission({ scheduledFor: '2026-09-30', createdAt: at('2026-09-30', 13).toISOString() });
  assert.equal(todayDecision([done, next], at('2026-09-30', 14))?.id, next.id);
});

test('yesterday’s completion, archived decisions, invalid timestamps and future plans never masquerade as today', () => {
  assert.equal(todayDecision([
    mission({ status: 'completed', completedAt: at('2026-09-29').toISOString(), scheduledFor: '2026-09-30' }),
    mission({ status: 'completed', completedAt: 'invalid' }),
    mission({ status: 'archived', scheduledFor: '2026-09-30' }),
    mission({ scheduledFor: '2026-10-01' }),
  ], at('2026-09-30')), undefined);
});

test('daily decisions use the local calendar around UTC midnight in both timezone directions', () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'Europe/Istanbul';
    const done = mission({ status: 'completed', completedAt: '2026-09-29T22:10:00Z' });
    assert.equal(todayDecision([done], new Date('2026-09-29T22:30:00Z'))?.id, done.id);
    process.env.TZ = 'America/Los_Angeles';
    const west = mission({ status: 'completed', completedAt: '2026-09-30T01:10:00Z' });
    assert.equal(todayDecision([west], new Date('2026-09-30T01:30:00Z'))?.id, west.id);
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});

test('a missed weekly review remains available on Wednesday and follows local Sunday boundaries', () => {
  assert.equal(availableReviewWeek(at('2026-09-27')), '2026-09-27');
  assert.equal(availableReviewWeek(at('2026-09-28')), '2026-09-27');
  assert.equal(availableReviewWeek(at('2026-09-30')), '2026-09-27');
  assert.equal(availableReviewWeek(at('2026-10-04')), '2026-10-04');
  assert.equal(availableReviewWeek(at('2027-01-01')), '2026-12-27');
});

test('weekly evidence counts actual distinct days and bounds entries to the reviewed calendar week', () => {
  const data = fixture({
    missions: [mission({ status: 'completed', completedAt: at('2026-09-21').toISOString() }), mission({ status: 'completed', completedAt: at('2026-09-21', 18).toISOString() }), mission({ status: 'completed', completedAt: at('2026-09-27').toISOString() }), mission({ status: 'completed', completedAt: at('2026-09-28').toISOString() })],
    notebook: normalizeNotebook({ entries: [entry({ dateKey: '2026-09-25' }), entry({ dateKey: '2026-09-25' }), entry({ dateKey: '2026-09-26', promptId: 'some-other-prompt' }), entry({ dateKey: '2026-09-28' })] }),
    checkIns: [{ dateKey: '2026-09-22' }, { dateKey: '2026-09-22' }, { dateKey: '2026-09-28' }] as UserData['checkIns'],
  });
  const original = JSON.stringify(data);
  const evidence = weekEvidence(data, '2026-09-27');
  assert.deepEqual(evidence.dayKeys, ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27']);
  assert.equal(evidence.keptDays, 2);
  assert.equal(evidence.decisions.length, 3);
  assert.equal(evidence.reflectionDays, 1);
  assert.equal(evidence.checkInDays, 1);
  assert.equal(evidence.hasActivity, true);
  assert.equal(JSON.stringify(data), original);
});

test('an unfinished decision can be reviewed without inventing completed progress', () => {
  const evidence = weekEvidence(fixture({ missions: [mission({ scheduledFor: '2026-09-25' })] }), '2026-09-27');
  assert.equal(evidence.hasActivity, true);
  assert.equal(evidence.keptDays, 0);
  assert.equal(weekEvidence(fixture(), '2026-09-27').hasActivity, false);
  assert.equal(weekEvidence(fixture(), '2026-02-30').hasActivity, false);
});

test('saving and editing a daily reflection preserves other pages, rewards once, and survives JSON backup replacement', () => {
  const existing = entry({ promptId: 'existing-page', content: 'Do not replace this page.' });
  const data = fixture({ notebook: normalizeNotebook({ entries: [existing] }) });
  const saved = applyNotebookAction(data, { type: 'save_entry', input: { kind: 'journal', title: 'My reflection', content: 'I sent the draft.', promptId: DAILY_REFLECTION_PROMPT } }, at('2026-09-30'));
  const note = dailyReflection(saved.data, '2026-09-30');
  assert.ok(note);
  assert.equal((saved.result as NotebookMutationResult).rewardAmount, 25);
  const edited = applyNotebookAction(saved.data, { type: 'save_entry', input: { id: note.id, kind: 'journal', title: note.title, content: 'I sent the draft, then asked for feedback.', promptId: DAILY_REFLECTION_PROMPT } }, at('2026-09-30', 20));
  assert.equal((edited.result as NotebookMutationResult).rewardAmount, 0);
  assert.equal(edited.data.notebook?.entries.length, 2);
  assert.equal(edited.data.notebook?.entries.find(e => e.id === existing.id)?.content, existing.content);
  const restored = JSON.parse(JSON.stringify(edited.data)) as UserData;
  assert.equal(dailyReflection(restored, '2026-09-30')?.content, 'I sent the draft, then asked for feedback.');
  assert.equal(dailyReflection(restored, '2026-10-01'), undefined);
});

const courses = [{ id: 'first', lessonIds: ['a', 'b'], lessonCount: 2 }, { id: 'second', lessonIds: ['c', 'd'], lessonCount: 2 }];
const progress = (patch = {}) => ({ lessons: patch });
const lesson = (patch = {}) => ({ completed: false, checked: [false], answer: null, reflection: '', ...patch });

test('course continuation resumes selected work before the suggested course and advances to the actual incomplete lesson', () => {
  const next = courseContinuation(courses, progress({ c: lesson({ completed: true }) }), 'first', 'second');
  assert.equal(next?.course.id, 'second');
  assert.equal(next?.index, 1);
  assert.equal(next?.completed, 1);
  assert.equal(next?.started, true);
});

test('course continuation recognizes an interrupted first answer of zero and never offers an already completed course', () => {
  assert.equal(courseContinuation(courses, progress({ c: lesson({ answer: 0 }) }), 'first')?.course.id, 'second');
  assert.equal(courseContinuation(courses, progress({ a: lesson({ completed: true }), b: lesson({ completed: true }) }), 'first')?.course.id, 'second');
  assert.equal(courseContinuation(courses, progress({ a: lesson({ completed: true }), b: lesson({ completed: true }), c: lesson({ completed: true }), d: lesson({ completed: true }) })), null);
});

test('daily loop copy has explicit matching nonempty English, Turkish and Spanish strings', () => {
  const english = dailyLoopCopy('en');
  for (const locale of ['tr', 'es'] as const) {
    const translated = dailyLoopCopy(locale);
    assert.deepEqual(Object.keys(translated).sort(), Object.keys(english).sort());
    assert.ok(Object.values(translated).every(value => value.trim().length > 0));
  }
});
