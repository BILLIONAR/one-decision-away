import assert from 'node:assert/strict';
import test from 'node:test';
import { getInitialDemoState } from '../src/services/repository';
import { applyNotebookAction, normalizeNotebook } from '../src/services/notebook';
import { EMPTY_PROGRESS, normalizeCourseProgress, updateLessonProgress } from '../src/services/courseProgress';
import { addCoursePracticeAttempt, emptyCourseExperiment, updateCourseExperiment } from '../src/services/courseLearning';
import { COURSES } from '../src/data/courses';
import { backupAgeDays, hasMeaningfulBackupWork, hasRecentCloudBackup, shouldShowBackupReminder, type BackupReminderCloudStatus } from '../src/services/backupReminder';
import { backupReminderCopy } from '../src/i18n/backupReminder';
import type { UserData } from '../src/types/models';

const NOW = Date.parse('2026-10-01T12:00:00Z');
const DAY = 86_400_000;
const stamp = (days: number) => new Date(NOW - days * DAY).toISOString();
const fixture = (): UserData => structuredClone(getInitialDemoState());
const written = () => applyNotebookAction(fixture(), { type: 'save_entry', input: { kind: 'journal', content: 'One saved sentence is worth keeping.' } }, new Date(NOW)).data;
const cloud = (patch: Partial<BackupReminderCloudStatus> = {}): BackupReminderCloudStatus => ({ configured: true, signedIn: true, lastSyncAt: stamp(1), error: null, ...patch });
const eligible = (data: UserData, options: Partial<Omit<Parameters<typeof shouldShowBackupReminder>[0], 'data'>> = {}) => shouldShowBackupReminder({ data, now: NOW, ...options });

test('fresh startup seeds and absent records do not prompt for a backup', () => {
  const fresh = fixture();
  assert.ok(fresh.missions.length > 0 && fresh.microHabits!.length > 0 && fresh.transactions.length > 0);
  assert.equal(hasMeaningfulBackupWork(fresh), false);
  assert.equal(eligible(fresh), false);
  assert.equal(shouldShowBackupReminder({ data: null, now: NOW }), false);
  assert.equal(hasMeaningfulBackupWork({}), false);
});

test('empty notebook, lesson, experiment and weekly-review shells are not saved personal work', () => {
  const data = fixture();
  data.notebook = normalizeNotebook({
    entries: [{ id: 'shell', kind: 'journal', title: 'Journal', content: ' \n ', dateKey: '2026-10-01', createdAt: stamp(0), updatedAt: stamp(0) }],
    practices369: [{ id: 'shell', intention: ' ', startDateKey: '2026-10-01', days: { '2026-10-01': { morning: [' '], midday: [], evening: [], updatedAt: stamp(0) } }, createdAt: stamp(0), updatedAt: stamp(0) }],
    gratitudeDays: [{ dateKey: '2026-10-01', items: ['', ' '], createdAt: stamp(0), updatedAt: stamp(0) }],
    affirmations: [{ id: 'shell', text: ' ', createdAt: stamp(0), updatedAt: stamp(0) }],
    activityDays: [{ dateKey: '2026-10-01', firstRecordedAt: stamp(0), economyDayKey: '2026-10-01', rewardAmount: 0 }],
  });
  data.courseProgress = normalizeCourseProgress({ version: 1, lessons: { [COURSES[0].lessons[0].id]: { checked: [false, false, false], answer: null, reflection: ' ', completed: false } }, experiments: { [COURSES[0].id]: emptyCourseExperiment() } });
  data.weeklyReviews = [{ weekKey: '2026-09-27', kept: 0, helped: ' ', blocked: '', change: '', createdAt: stamp(1) }];
  assert.equal(eligible(data), false);
});

test('the first saved journal, scripting or future letter qualifies without three older records', () => {
  for (const kind of ['journal', 'scripting', 'future_letter'] as const) {
    const data = applyNotebookAction(fixture(), { type: 'save_entry', input: { kind, content: 'A personal first sentence.' } }, new Date(NOW)).data;
    assert.equal(data.completions.length + data.inVisionItemIds.length + data.dreamJournal!.length, 0);
    assert.equal(eligible(data), true, kind);
  }
});

test('a saved intention, gratitude note or affirmation qualifies before any decision completion', () => {
  const actions = [
    { type: 'start_369', intention: 'I can take a small step.' },
    { type: 'save_gratitude', dateKey: '2026-10-01', items: ['A kind message'] },
    { type: 'save_affirmation', input: { text: 'I keep my next step manageable.' } },
  ] as const;
  for (const action of actions) {
    const data = applyNotebookAction(fixture(), action.type === 'save_gratitude' ? { ...action, items: [...action.items] } : action, new Date(NOW)).data;
    assert.equal(eligible(data), true, action.type);
  }
});

test('an interrupted first lesson answer of zero, practice checkbox or reflection qualifies', () => {
  for (const patch of [{ answer: 0 }, { checked: [true, false, false] }, { reflection: 'Make the first step observable.' }]) {
    const data = fixture();
    data.courseProgress = updateLessonProgress(EMPTY_PROGRESS, COURSES[0].lessons[0], patch);
    assert.equal(eligible(data), true, JSON.stringify(patch));
  }
});

test('the first course plan, paused attempt or saved review qualifies independently of lesson completion', () => {
  const id = COURSES[0].id;
  const examples = [
    updateCourseExperiment(undefined, id, { action: 'Open the outline.' }),
    addCoursePracticeAttempt(undefined, id, { id: 'attempt', date: '2026-10-01', outcome: 'paused', note: '' }),
    updateCourseExperiment(undefined, id, { review: { recall: 'A smaller first step helps.' } }),
    updateCourseExperiment(undefined, id, { reviewOn: '2026-10-08' }),
  ];
  for (const experiments of examples) {
    assert.equal(eligible({ ...fixture(), courseProgress: { version: 1, lessons: {}, experiments } }), true);
  }
});

test('one saved weekly review with no kept decisions qualifies', () => {
  const data = fixture();
  data.weeklyReviews = [{ weekKey: '2026-09-27', kept: 0, change: 'Choose a smaller step next week.', createdAt: stamp(1) }];
  assert.equal(eligible(data), true);
});

test('one completion, kept decision, vision choice or dream-journal entry preserves existing eligibility', () => {
  const completion = { id: 'completion', missionId: 'mission', userId: 'demo-user', completedAt: stamp(0), method: 'self' as const, rewardAmount: 0, streakBonus: 0 };
  const cases: Partial<UserData>[] = [
    { completions: [completion] },
    { missions: [{ ...fixture().missions[0], isOneDecision: true, status: 'completed', completedAt: stamp(0) }] },
    { inVisionItemIds: ['a-selected-dream'] },
    { twoFutures: { ...fixture().twoFutures, vision: 'A calmer routine.' } },
    { dreamJournal: [{ id: 'dream-note', userId: 'demo-user', title: 'Today', content: 'I made a small start.', createdAt: stamp(0) }] },
  ];
  for (const patch of cases) assert.equal(eligible({ ...fixture(), ...patch }), true, Object.keys(patch)[0]);
});

test('a valid downloaded backup suppresses until the exact fourteen-day boundary', () => {
  const data = written();
  assert.equal(eligible(data, { lastBackupAt: stamp(0) }), false);
  assert.equal(eligible(data, { lastBackupAt: new Date(NOW - 14 * DAY + 1).toISOString() }), false);
  assert.equal(eligible(data, { lastBackupAt: stamp(14) }), true);
  assert.equal(eligible(data, { lastBackupAt: stamp(20) }), true);
});

test('invalid, absent and future export or cloud timestamps never suppress protection', () => {
  const data = written();
  for (const timestamp of [null, '', 'not-a-date', '2026-10-01', '2026-09-31T12:00:00Z', '2026-10-01T24:00:00Z', '2026-10-01T12:60:00Z', '2026-10-01T12:00:00+25:00', new Date(NOW + 1).toISOString()]) {
    assert.equal(backupAgeDays(timestamp, NOW), null, String(timestamp));
    assert.equal(eligible(data, { lastBackupAt: timestamp }), true, String(timestamp));
    assert.equal(eligible(data, { cloud: cloud({ lastSyncAt: timestamp }) }), true, String(timestamp));
  }
});

test('freshness compares actual ISO instants and accepts leap days without calendar normalization', () => {
  assert.equal(backupAgeDays('2026-10-01T15:00:00+03:00', NOW), 0);
  assert.equal(backupAgeDays('2026-10-01T05:00:00-07:00', NOW), 0);
  assert.equal(backupAgeDays('2024-02-29T12:00:00Z', Date.parse('2024-03-01T12:00:00Z')), 1);
  assert.equal(backupAgeDays('2026-02-29T12:00:00Z', NOW), null);
  assert.equal(backupAgeDays(stamp(0), Number.NaN), null);
});

test('only configured, signed-in, recent scoped cloud success with no error suppresses the reminder', () => {
  const data = written();
  assert.equal(hasRecentCloudBackup(cloud(), NOW), true);
  assert.equal(eligible(data, { cloud: cloud() }), false);
  for (const patch of [{ configured: false }, { signedIn: false }, { lastSyncAt: null }, { lastSyncAt: stamp(14) }, { error: 'Upload failed' }, { error: '' }]) {
    assert.equal(eligible(data, { cloud: cloud(patch) }), true, JSON.stringify(patch));
  }
  // CloudSync.getState() returns null for a different account/project or replacement epoch.
  assert.equal(eligible(data, { cloud: cloud({ signedIn: true, lastSyncAt: null }) }), true);
});

test('a recent export still protects work when cloud sync fails, and session dismissal remains respected', () => {
  const data = written();
  const failed = cloud({ error: 'Upload failed', lastSyncAt: null });
  assert.equal(eligible(data, { cloud: failed }), true);
  assert.equal(eligible(data, { cloud: failed, lastBackupAt: stamp(1) }), false);
  assert.equal(eligible(data, { cloud: failed, dismissed: true }), false);
  assert.equal(eligible(data, { cloud: failed, dismissed: false }), true);
});

test('eligibility does not alter saved work or cloud status, and all three locales explain protection without promising sync', () => {
  const data = written();
  const state = cloud({ error: 'Upload failed' });
  const before = JSON.stringify({ data, state });
  assert.equal(eligible(data, { cloud: state }), true);
  assert.equal(JSON.stringify({ data, state }), before);
  for (const locale of ['en', 'tr', 'es'] as const) {
    const copy = backupReminderCopy(locale);
    for (const field of ['label', 'title', 'local', 'cloudUnconfirmed', 'cloudError', 'download', 'cloudSync', 'dismiss'] as const) assert.ok(copy[field].trim());
    assert.ok(copy.lastExport(14).includes('14'));
  }
  assert.notEqual(backupReminderCopy('tr').cloudError, backupReminderCopy('en').cloudError);
  assert.notEqual(backupReminderCopy('es').cloudError, backupReminderCopy('en').cloudError);
});
