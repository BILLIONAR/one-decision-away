import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { COURSES } from '../src/data/courses';
import { APP_DATA_STORAGE_KEY, COURSE_PROGRESS_STORAGE_KEY } from '../src/services/storageKeys';
import { EMPTY_PROGRESS, completeLesson, mutateCourseProgress, readCourseProgress, saveCourseProgress, updateLessonProgress, type CourseProgress } from '../src/services/courseProgress';
import { addCoursePracticeAttempt, updateCourseExperiment } from '../src/services/courseLearning';
import { queueDataWrite } from '../src/services/dataWrites';
import { localDayKey } from '../src/services/momentum';
import { createBackupSnapshot, InvalidBackupError, prepareBackupRestore, summarizeBackup } from '../src/services/backup';
import type { UserData } from '../src/types/models';

class MemoryStorage {
  values = new Map<string, string>();
  failWrites = false;
  writes: string[] = [];
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error('QuotaExceededError');
    this.writes.push(key);
    this.values.set(key, value);
  }
  removeItem(key: string) { this.values.delete(key); }
}
const storage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
const { LocalDemoRepository, getInitialDemoState } = await import('../src/services/repository');
const { cloudSync } = await import('../src/services/cloudSync');
beforeEach(() => { storage.values.clear(); storage.writes = []; storage.failWrites = false; });

const course = COURSES[0];
const lesson = course.lessons[0];
function progress(): CourseProgress {
  let result = updateLessonProgress(EMPTY_PROGRESS, lesson, {
    checked: lesson.practice.map(() => true), answer: lesson.correct, reflection: 'My own note\nA next step.',
  });
  result = completeLesson(result, course, 0);
  result.experiments = updateCourseExperiment(undefined, course.id, { cue: 'After my tea', action: 'Write two sentences', fallback: 'Write one word', evidence: 'A dated draft', reviewOn: '2026-10-07' });
  result.experiments = addCoursePracticeAttempt(result.experiments, course.id, { id: 'practice-one', date: '2026-09-30', outcome: 'adapted', note: 'One sentence was manageable.' });
  return result;
}
const fixture = () => structuredClone(getInitialDemoState());
const put = (data: UserData) => storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));

test('legacy course storage migrates into the personal record without changing other data', async () => {
  const data = fixture();
  delete data.courseProgress;
  data.profile.displayName = 'A real person';
  put(data);
  const legacy = progress();
  storage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(legacy));
  const repo = new LocalDemoRepository();
  const loaded = await repo.load();
  assert.deepEqual(loaded.courseProgress, legacy);
  assert.deepEqual(createBackupSnapshot(loaded).courseProgress, legacy);
  assert.equal(await saveCourseProgress(legacy), true);
  const saved = JSON.parse(storage.getItem(APP_DATA_STORAGE_KEY)!);
  assert.deepEqual(saved, { ...data, courseProgress: legacy });
  assert.deepEqual(readCourseProgress(), legacy);
});

test('course edits, completion, experiment plans and logs roundtrip through JSON backup', async () => {
  const repo = new LocalDemoRepository();
  const data = fixture();
  data.dreamJournal = [{ id: 'journal-one', userId: data.profile.id, title: 'An ordinary day', content: 'Full text\nwith lines', photoDataUrl: 'data:image/png;base64,AA==', createdAt: '2026-09-30T10:00:00Z' }];
  put(data);
  const saved = progress();
  assert.equal(await saveCourseProgress(saved), true);
  // The caller is deliberately stale: export captures course work saved later.
  const json = JSON.stringify(createBackupSnapshot(data));
  const backup = prepareBackupRestore(JSON.parse(json));
  await repo.replaceAll({ ...fixture(), profile: { ...data.profile, displayName: 'Different record' } });
  await repo.replaceAll(backup);
  const restored = await repo.load();
  assert.deepEqual(restored.courseProgress, saved);
  assert.deepEqual(readCourseProgress(), saved);
  assert.deepEqual(restored.dreamJournal, data.dreamJournal);
  assert.deepEqual(summarizeBackup(restored), { decisions: data.missions.filter(mission => mission.isOneDecision).length, notebookEntries: 1, courseLessons: 1, courseNotes: 1, practiceRecords: 1 });
});

test('a stale save from another feature retains newer lesson notes and practice logs', async () => {
  const repo = new LocalDemoRepository();
  put(fixture());
  const stale = await repo.load();
  const saved = progress();
  assert.equal(await saveCourseProgress(saved), true);
  stale.profile.displayName = 'New profile name';
  await repo.save(stale);
  assert.deepEqual((await repo.load()).courseProgress, saved);
  assert.deepEqual(stale.courseProgress, saved);
  assert.equal((await repo.load()).profile.displayName, 'New profile name');
});

test('a legacy backup keeps local courses; an explicit empty course backup clears them', async () => {
  const repo = new LocalDemoRepository();
  const local = fixture();
  local.courseProgress = progress();
  put(local);
  storage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(progress()));
  const legacy = fixture();
  delete legacy.courseProgress;
  await repo.replaceAll(legacy);
  assert.deepEqual(readCourseProgress(), progress());
  const explicit = fixture();
  await repo.replaceAll(explicit);
  assert.deepEqual(readCourseProgress(), EMPTY_PROGRESS);
  assert.deepEqual((await repo.load()).courseProgress, EMPTY_PROGRESS);
  // Old side-store content can never resurrect after an intentional replacement.
  assert.ok(storage.getItem(COURSE_PROGRESS_STORAGE_KEY));
});

test('validation rejects malformed personal, notebook and course data before any storage write', async () => {
  const repo = new LocalDemoRepository();
  const local = fixture();
  local.courseProgress = progress();
  put(local);
  const invalid: unknown[] = [null, [], {}, { profile: {}, transactions: [] }];
  const damaged = (mutate: (value: Record<string, any>) => void) => { const value = fixture(); mutate(value); invalid.push(value); };
  damaged(value => { value.missions = [null]; });
  damaged(value => { value.microHabits[0].completedDates = [null]; });
  damaged(value => { value.futureSelf.coreValues = {}; });
  damaged(value => { value.weeklyReviews = [{ weekKey: '2026-09-27', createdAt: '2026-09-30T10:00:00Z', kept: 1, change: { malformed: true } }]; });
  damaged(value => { value.checkIns = [{ id: 'bad', dateKey: '2026-09-30', createdAt: '2026-09-30T10:00:00Z', focus: 2, energy: {}, mood: 3 }]; });
  damaged(value => { value.notebook.entries = [{ content: 'A note without a usable ID' }]; });
  damaged(value => { value.courseProgress = { version: 2, lessons: {} }; });
  damaged(value => { value.courseProgress = { version: 1, lessons: { [lesson.id]: { checked: ['yes'], answer: 0, reflection: 42, completed: true } } }; });
  damaged(value => { value.courseProgress = { ...progress(), experiments: { [course.id]: { attempts: [null] } } }; });
  const original = new Map(storage.values);
  for (const value of invalid) {
    await assert.rejects(repo.replaceAll(value as UserData), InvalidBackupError);
    assert.deepEqual(storage.values, original);
  }
});

test('quota failures keep the entire previous record and legacy key intact, and a retry succeeds', async () => {
  const repo = new LocalDemoRepository();
  const local = fixture();
  local.courseProgress = progress();
  put(local);
  storage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(progress()));
  const previous = new Map(storage.values);
  const replacement = fixture();
  replacement.profile.displayName = 'Imported record';
  storage.failWrites = true;
  await assert.rejects(repo.replaceAll(replacement), /QuotaExceededError/);
  assert.deepEqual(storage.values, previous);
  assert.equal(await saveCourseProgress(EMPTY_PROGRESS), false);
  assert.deepEqual(storage.values, previous);
  storage.failWrites = false;
  storage.writes = [];
  await repo.replaceAll(replacement);
  assert.deepEqual(storage.writes, [APP_DATA_STORAGE_KEY]);
  assert.equal((await repo.load()).profile.displayName, 'Imported record');
  assert.deepEqual(readCourseProgress(), EMPTY_PROGRESS);
});

test('unreadable main data is never replaced by a course-only save', async () => {
  storage.setItem(APP_DATA_STORAGE_KEY, '{broken');
  storage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(progress()));
  const original = new Map(storage.values);
  assert.equal(await saveCourseProgress(progress()), false);
  assert.deepEqual(storage.values, original);
});

test('lesson edits and re-completion retain the real-world experiment history', () => {
  const saved = progress();
  const draft = updateLessonProgress(saved, lesson, { reflection: 'Updated lesson reflection' });
  assert.deepEqual(draft.experiments, saved.experiments);
  assert.deepEqual(completeLesson(draft, course, 0).experiments, saved.experiments);
});

test('course mutations wait for the shared write lock and rebase onto a concurrent notebook commit', async () => {
  put(fixture());
  let release!: () => void;
  let started!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const acquired = new Promise<void>(resolve => { started = resolve; });
  const notebookWrite = queueDataWrite(async () => {
    const current = JSON.parse(storage.getItem(APP_DATA_STORAGE_KEY)!);
    started();
    await gate;
    current.notebook.entries.push({ id: 'concurrent-note', kind: 'journal', title: 'A concurrent note', content: 'Never lose this text.', dateKey: '2026-09-30', createdAt: '2026-09-30T10:00:00Z', updatedAt: '2026-09-30T10:00:00Z' });
    put(current);
  });
  await acquired;
  const mutation = mutateCourseProgress(current => updateLessonProgress(current, lesson, { reflection: 'A course saved while the notebook writer held the lock.' }));
  assert.deepEqual(readCourseProgress(), EMPTY_PROGRESS);
  release();
  await notebookWrite;
  assert.ok(await mutation);
  const saved = await new LocalDemoRepository().load();
  assert.equal(saved.notebook!.entries[0].content, 'Never lose this text.');
  assert.equal(saved.courseProgress!.lessons[lesson.id].reflection, 'A course saved while the notebook writer held the lock.');
});

test('ledger and notebook rewards retain one UTC ceiling when the local decision day differs', async context => {
  const previousZone = process.env.TZ;
  process.env.TZ = 'America/Los_Angeles';
  context.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-01T00:30:00Z').getTime() });
  try {
    assert.equal(localDayKey(), '2026-09-30');
    const data = fixture();
    assert.equal(data.transactions[0].dayKey, '2026-10-01');
    assert.equal(data.lastActiveDateKey, '2026-10-01');
    data.missions = [{ id: 'utc-cap-task', userId: data.profile.id, title: 'A local-day decision', type: 'daily_quest', area: 'Work', difficulty: 'easy', isOneDecision: true, scheduledFor: localDayKey(), status: 'active', createdAt: new Date().toISOString() }];
    data.transactions.push({ id: 'prior-credit', userId: data.profile.id, walletId: 'wallet-demo', kind: 'mission_reward', amount: 2475, dayKey: '2026-10-01', memo: 'Earlier work', createdAt: new Date().toISOString() });
    put(data);
    const repo = new LocalDemoRepository();
    const mission = await repo.completeMission({ missionId: 'utc-cap-task', method: 'self' });
    assert.equal(mission.rewardAmount, 25);
    assert.equal(mission.data.transactions[0].dayKey, '2026-10-01');
    const notebook = await repo.mutateNotebook({ type: 'save_entry', input: { kind: 'journal', content: 'Local-day writing without a second reward ceiling.' } });
    assert.equal((notebook.result as { rewardAmount: number }).rewardAmount, 0);
  } finally {
    context.mock.timers.reset();
    if (previousZone === undefined) delete process.env.TZ; else process.env.TZ = previousZone;
  }
});

test('cloud upload captures current courses and invalid cloud backups leave local storage untouched', async () => {
  const local = fixture();
  put(local);
  assert.equal(await saveCourseProgress(progress()), true);
  let uploaded: UserData | undefined;
  const invalid = { ...fixture(), courseProgress: { version: 9, lessons: {} } };
  const mockClient = { from: () => ({
    upsert: async (row: { data: UserData }) => { uploaded = row.data; return { error: null }; },
    select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { data: invalid, updated_at: '2030-01-01T00:00:00Z' }, error: null }) }) }),
  }) };
  const internal = cloudSync as unknown as Record<string, unknown>;
  const previous = { client: internal.client, session: internal.session, config: internal.config };
  Object.assign(internal, { client: mockClient, session: { user: { id: 'backup-user' } }, config: { url: 'https://project.example', anonKey: 'test' } });
  try {
    assert.equal(await cloudSync.push(local), true);
    assert.deepEqual(uploaded?.courseProgress, progress());
    const beforePull = new Map(storage.values);
    assert.equal(await cloudSync.pullIfNewer(local), null);
    assert.deepEqual(storage.values, beforePull);
    assert.ok(cloudSync.getState().error?.includes('courseProgress.version'));
  } finally { Object.assign(internal, previous); }
});

test('cloud previews do not change last-sync or local data until the reviewed record is committed', async () => {
  const local = fixture();
  put(local);
  const remote = { ...fixture(), profile: { ...local.profile, displayName: 'Reviewed cloud record' }, courseProgress: progress() };
  const mockClient = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { data: remote, updated_at: '2030-01-01T00:00:00Z' }, error: null }) }) }) }) };
  const internal = cloudSync as unknown as Record<string, unknown>;
  const previous = { client: internal.client, session: internal.session, config: internal.config };
  Object.assign(internal, { client: mockClient, session: { user: { id: 'review-user' } }, config: { url: 'https://project.example', anonKey: 'test' } });
  try {
    const original = new Map(storage.values);
    assert.ok(await cloudSync.pullIfNewer(local)); // preview declined
    assert.deepEqual(storage.values, original);
    const retry = await cloudSync.pullIfNewer(local);
    assert.ok(retry); // declining never makes the remote copy disappear on retry
    assert.deepEqual(storage.values, original);
    await new LocalDemoRepository().replaceAll(retry!);
    cloudSync.markRemoteApplied(retry!);
    assert.equal(storage.getItem('oda_cloud_last_sync'), '2030-01-01T00:00:00Z');
    assert.equal(await cloudSync.pullIfNewer(await new LocalDemoRepository().load()), null);
    assert.deepEqual(readCourseProgress(), progress());
  } finally { Object.assign(internal, previous); }
});
