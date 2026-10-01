import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JournalWorkspace } from '../src/components/notebook/JournalWorkspace';
import { dateLabel } from '../src/components/notebook/shared';
import { COURSES } from '../src/data/courses';
import { InvalidBackupError, prepareBackupRestore } from '../src/services/backup';
import { emptyCourseExperiment } from '../src/services/courseLearning';
import { LocalDemoRepository, getInitialDemoState } from '../src/services/repository';
import { APP_DATA_STORAGE_KEY, COURSE_PROGRESS_STORAGE_KEY } from '../src/services/storageKeys';
import { AppContext } from '../src/store/AppContext';
import type { AppContextType } from '../src/store/useApp';
import type { UserData } from '../src/types/models';

const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  },
});
beforeEach(() => values.clear());

const timestamp = '2026-09-30T12:00:00Z';
const courseId = COURSES[0].id;
function fixture(): UserData {
  const data = structuredClone(getInitialDemoState());
  data.notebook!.entries = [{ id: 'my-page', kind: 'journal', title: 'A private page', content: 'Keep the complete writing.', mood: 'calm', promptId: 'my-prompt', dateKey: '2026-09-30', createdAt: timestamp, updatedAt: timestamp }];
  data.notebook!.gratitudeDays = [{ dateKey: '2026-09-30', items: ['A friend called.'], createdAt: timestamp, updatedAt: timestamp }];
  data.notebook!.activityDays = [{ dateKey: '2026-09-30', economyDayKey: '2026-09-30', firstRecordedAt: timestamp, rewardAmount: 0 }];
  data.notebook!.practices369 = [{ id: 'my-intention', intention: 'I keep showing up.', startDateKey: '2026-09-30', createdAt: timestamp, updatedAt: timestamp, days: { '2026-09-30': { morning: ['I keep showing up.'], midday: [], evening: [], updatedAt: timestamp } } }];
  data.dreamJournal = [{ id: 'legacy-dream', userId: data.profile.id, title: 'An old page', content: 'Every original line\nremains here.', mood: 'visionary', createdAt: timestamp, photoDataUrl: 'data:image/png;base64,AA==' }];
  const experiment = emptyCourseExperiment();
  experiment.cue = 'After my tea';
  experiment.action = 'Write one line';
  experiment.attempts = [{ id: 'my-real-attempt', date: '2026-09-30', outcome: 'tried', note: 'I finally started the thing I was avoiding.' }];
  data.courseProgress = { version: 1, lessons: {}, experiments: { [courseId]: experiment } };
  return data;
}

const cases: { name: string; field: string; corrupt: (data: UserData) => void }[] = [
  { name: 'unparseable notebook day', field: 'entries[0].dateKey', corrupt: data => { data.notebook!.entries[0].dateKey = 'not-a-date'; } },
  { name: 'impossible calendar day', field: 'entries[0].dateKey', corrupt: data => { data.notebook!.entries[0].dateKey = '2026-02-30'; } },
  { name: 'object mood rendered in journal', field: 'entries[0].mood', corrupt: data => { Object.assign(data.notebook!.entries[0], { mood: { malformed: true } }); } },
  { name: 'object prompt assigned to editor', field: 'entries[0].promptId', corrupt: data => { Object.assign(data.notebook!.entries[0], { promptId: { malformed: true } }); } },
  { name: 'unknown kind hidden by every writing surface', field: 'entries[0].kind', corrupt: data => { Object.assign(data.notebook!.entries[0], { kind: 'unknown-writing' }); } },
  { name: 'unparseable gratitude day', field: 'gratitudeDays[0].dateKey', corrupt: data => { data.notebook!.gratitudeDays[0].dateKey = ''; } },
  { name: 'invalid writing activity day', field: 'activityDays[0].dateKey', corrupt: data => { data.notebook!.activityDays[0].dateKey = 'yesterday'; } },
  { name: 'invalid ledger day', field: 'activityDays[0].economyDayKey', corrupt: data => { data.notebook!.activityDays[0].economyDayKey = '2026-13-01'; } },
  { name: 'object activity transaction reference', field: 'activityDays[0].transactionId', corrupt: data => { Object.assign(data.notebook!.activityDays[0], { transactionId: {} }); } },
  { name: 'invalid 369 start day', field: 'practices369[0].startDateKey', corrupt: data => { data.notebook!.practices369[0].startDateKey = 'invalid'; } },
  { name: 'invalid 369 history day', field: 'practices369[0].days.invalid', corrupt: data => { data.notebook!.practices369[0].days = { invalid: data.notebook!.practices369[0].days['2026-09-30'] }; } },
  { name: 'object archive marker hiding a practice', field: 'practices369[0].archivedAt', corrupt: data => { Object.assign(data.notebook!.practices369[0], { archivedAt: {} }); } },
  { name: 'object 369 day timestamp', field: 'practices369[0].days.2026-09-30.updatedAt', corrupt: data => { Object.assign(data.notebook!.practices369[0].days['2026-09-30'], { updatedAt: {} }); } },
  { name: 'dream instant producing an invalid display day', field: 'dreamJournal[0].createdAt', corrupt: data => { data.dreamJournal![0].createdAt = 'not-a-date'; } },
  { name: 'invalid course attempt day silently dropping a note', field: `courseProgress.experiments.${courseId}.attempts[0].date`, corrupt: data => { data.courseProgress!.experiments![courseId].attempts[0].date = '2026-02-30'; } },
  { name: 'invalid course review due date', field: `courseProgress.experiments.${courseId}.reviewOn`, corrupt: data => { data.courseProgress!.experiments![courseId].reviewOn = 'yesterday'; } },
  { name: 'invalid course review completion date', field: `courseProgress.experiments.${courseId}.review.reviewedOn`, corrupt: data => { data.courseProgress!.experiments![courseId].review.reviewedOn = '2026-13-01'; } },
];

for (const scenario of cases) {
  test(`deep backup safety: reject ${scenario.name} before replacing any storage`, async () => {
    const previous = fixture();
    previous.profile.displayName = 'Keep my current data';
    values.set(APP_DATA_STORAGE_KEY, JSON.stringify(previous));
    values.set(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(previous.courseProgress));
    const before = new Map(values);
    const damaged = fixture();
    scenario.corrupt(damaged);
    const expectedError = (error: unknown) => error instanceof InvalidBackupError && error.field.endsWith(scenario.field);
    assert.throws(() => prepareBackupRestore(damaged), expectedError);
    await assert.rejects(new LocalDemoRepository().replaceAll(damaged), expectedError);
    assert.deepEqual(values, before, 'Every previous record and side-store must survive rejection');
  });
}

test('deep backup safety: legitimate exported writing, legacy moods, and leap days roundtrip and render', async () => {
  const original = fixture();
  original.notebook!.entries.push({ ...original.notebook!.entries[0], id: 'leap-day', kind: 'scripting', dateKey: '2028-02-29', content: 'A leap day stays a leap day.' });
  const restored = prepareBackupRestore(JSON.parse(JSON.stringify(original)));
  assert.deepEqual(restored.notebook, original.notebook);
  assert.deepEqual(restored.dreamJournal, original.dreamJournal);
  assert.deepEqual(restored.courseProgress, original.courseProgress);
  assert.doesNotThrow(() => dateLabel(restored.notebook!.entries[1].dateKey));
  const html = renderToStaticMarkup(React.createElement(AppContext.Provider, {
    value: { data: restored } as AppContextType,
  }, React.createElement(JournalWorkspace, { today: '2026-10-01' })));
  assert.ok(html.includes('Keep the complete writing.'));
  assert.ok(html.includes('Every original line'));
  await new LocalDemoRepository().replaceAll(restored);
  assert.deepEqual(JSON.parse(values.get(APP_DATA_STORAGE_KEY)!).notebook, original.notebook);
});

test('deep backup safety: legacy backups without a notebook retain dream fields and local courses', () => {
  const legacy = fixture();
  delete legacy.notebook;
  delete legacy.courseProgress;
  const localCourses = fixture().courseProgress!;
  const restored = prepareBackupRestore(legacy, localCourses);
  assert.deepEqual(restored.dreamJournal, legacy.dreamJournal);
  assert.deepEqual(restored.courseProgress, localCourses);
  assert.equal(restored.notebook!.entries.length, 0);
});
