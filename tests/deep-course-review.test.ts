import assert from 'node:assert/strict';
import test from 'node:test';
import { coursesFor } from '../src/data/courses';
import { APP_DATA_STORAGE_KEY, COURSE_PROGRESS_STORAGE_KEY } from '../src/services/storageKeys';
import { EMPTY_PROGRESS, completeLesson, getLessonProgress, mutateCourseProgress, nextLessonIndex, normalizeCourseProgress, saveCourseProgress, subscribeCourseProgress, updateLessonProgress, type CourseProgress } from '../src/services/courseProgress';
import { localPracticeDate, practiceDateAfter, updateCourseExperiment } from '../src/services/courseLearning';
import { createCourseProgressSession, getCourseProgressSession } from '../src/services/courseProgressDraft';
import { REPLACEMENT_EPOCH_KEY } from '../src/services/dataSnapshots';
import { queueDataWrite } from '../src/services/dataWrites';

test('every localized course can complete and carry its notes into the other editions', () => {
  for (const locale of ['en', 'tr', 'es']) for (const course of coursesFor(locale)) {
    let state: CourseProgress = EMPTY_PROGRESS;
    for (const [index, lesson] of course.lessons.entries()) {
      state = updateLessonProgress(state, lesson, { checked: lesson.practice.map(() => true), answer: lesson.correct, reflection: `${locale}/${lesson.id}` });
      state = completeLesson(state, course, index);
      assert.equal(getLessonProgress(state, lesson).completed, true, `${locale}/${lesson.id}`);
    }
    state = normalizeCourseProgress(JSON.parse(JSON.stringify(state)));
    for (const otherLocale of ['en', 'tr', 'es']) {
      const other = coursesFor(otherLocale).find(item => item.id === course.id)!;
      assert.equal(nextLessonIndex(state, other), other.lessons.length, `${locale} -> ${otherLocale}/${course.id}`);
      assert.equal(getLessonProgress(state, other.lessons[0]).reflection, `${locale}/${course.lessons[0].id}`);
    }
  }
});

test('practice calendar keeps the local day across UTC midnight and daylight-saving weeks', () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'Pacific/Kiritimati';
    assert.equal(localPracticeDate(new Date('2026-12-31T11:30:00Z')), '2027-01-01');
    process.env.TZ = 'America/Los_Angeles';
    assert.equal(localPracticeDate(new Date('2027-01-01T01:30:00Z')), '2026-12-31');
    assert.equal(practiceDateAfter(7, new Date('2026-10-30T23:30:00-07:00')), '2026-11-06');
    assert.equal(practiceDateAfter(7, new Date('2027-03-12T23:30:00-08:00')), '2027-03-19');
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

async function withStorage(storage: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void }, run: () => Promise<void>) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  try { await run(); } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
}

function savedCourse() {
  const course = coursesFor('en')[0];
  const lesson = course.lessons[0];
  let progress = updateLessonProgress(EMPTY_PROGRESS, lesson, { checked: lesson.practice.map(() => true), answer: lesson.correct, reflection: 'Already saved private lesson reflection' });
  progress = completeLesson(progress, course, 0);
  return { course, lesson, progress };
}

test('a transient personal-record read failure cannot replace already saved course work with an empty fallback', async () => {
  const { lesson, progress } = savedCourse();
  let raw = JSON.stringify({ profile: { id: 'synthetic-review-user' }, courseProgress: progress, unrelated: 'preserve' });
  const before = raw;
  let failOnce = true;
  await withStorage({
    getItem(key) {
      if (key === APP_DATA_STORAGE_KEY && failOnce) { failOnce = false; throw new Error('Synthetic transient storage read failure'); }
      return key === APP_DATA_STORAGE_KEY ? raw : null;
    },
    setItem(key, value) { assert.equal(key, APP_DATA_STORAGE_KEY); raw = value; },
  }, async () => {
    let updates = 0;
    const update = (latest: CourseProgress) => {
      updates++;
      return { ...latest, experiments: updateCourseExperiment(latest.experiments, 'focus', { cue: 'At my desk', action: 'Move the phone' }) };
    };
    const result = await mutateCourseProgress(update);
    assert.equal(result, null, 'An unreadable mutation baseline must fail and preserve the UI draft for retry');
    assert.equal(updates, 0, 'No updater may run over a guessed empty baseline');
    assert.equal(raw, before, 'The stored document must remain byte-for-byte unchanged');
    assert.equal(JSON.parse(raw).courseProgress.lessons[lesson.id].reflection, 'Already saved private lesson reflection');
    assert.ok(await mutateCourseProgress(update));
    assert.equal(JSON.parse(raw).courseProgress.lessons[lesson.id].reflection, 'Already saved private lesson reflection');
    assert.equal(JSON.parse(raw).courseProgress.experiments.focus.action, 'Move the phone');
  });
});

test('a blocked-save session retains private edits and warning after its only view unmounts, then retries successfully', async () => {
  let available = false;
  let stored: CourseProgress = EMPTY_PROGRESS;
  const session = createCourseProgressSession(stored, async update => {
    if (!available) return null;
    stored = update(stored);
    return stored;
  });
  let firstRenders = 0;
  const unmount = session.subscribe(() => { firstRenders++; });
  assert.equal(await session.update(latest => ({ ...latest, experiments: updateCourseExperiment(latest.experiments, 'focus', { cue: 'At my desk', action: 'The private unsaved action' }) })), false);
  unmount();
  const previousRenders = firstRenders;
  let remounted: CourseProgress | undefined;
  let warning = false;
  const unmountAgain = session.subscribe((progress, failed) => { remounted = progress; warning = failed; });
  assert.equal(remounted?.experiments?.focus.action, 'The private unsaved action');
  assert.equal(warning, true);
  available = true;
  assert.equal(await session.retry(), true);
  assert.equal(stored.experiments?.focus.action, 'The private unsaved action');
  assert.equal(warning, false);
  assert.equal(firstRenders, previousRenders, 'An unmounted page receives no subsequent draft notifications');
  unmountAgain();
});

test('explicit replacement cancels a queued old draft while allowing new edits to save after the lock releases', async () => {
  let stored: CourseProgress = EMPTY_PROGRESS;
  let release: (() => void) | undefined;
  let writes = 0;
  const session = createCourseProgressSession(stored, async update => {
    if (++writes === 1) await new Promise<void>(resolve => { release = resolve; });
    stored = update(stored);
    return stored;
  });
  const oldSave = session.update(latest => ({ ...latest, experiments: updateCourseExperiment(latest.experiments, 'focus', { cue: 'Old private cue', action: 'Old private action' }) }));
  const replacement = { ...EMPTY_PROGRESS, experiments: updateCourseExperiment(undefined, 'sleep', { cue: 'The imported cue', action: 'The imported action' }) };
  stored = replacement;
  session.reset(replacement);
  const newSave = session.update(latest => ({ ...latest, experiments: updateCourseExperiment(latest.experiments, 'confidence', { cue: 'New cue', action: 'New action' }) }));
  release!();
  await Promise.all([oldSave, newSave]);
  assert.equal(stored.experiments?.focus, undefined, 'The old private draft must never reappear in the new record');
  assert.equal(stored.experiments?.sleep.action, 'The imported action');
  assert.equal(stored.experiments?.confidence.action, 'New action');
  assert.deepEqual(session.read(), stored);
  assert.equal(session.saveFailed(), false);
});

test('a transient legacy-course read failure cannot overwrite the previous separate course record', async () => {
  const { progress } = savedCourse();
  let raw = JSON.stringify(progress);
  const before = raw;
  let failOnce = true;
  await withStorage({
    getItem(key) {
      if (key === COURSE_PROGRESS_STORAGE_KEY && failOnce) { failOnce = false; throw new Error('Synthetic transient legacy read failure'); }
      return key === COURSE_PROGRESS_STORAGE_KEY ? raw : null;
    },
    setItem(key, value) { assert.equal(key, COURSE_PROGRESS_STORAGE_KEY); raw = value; },
  }, async () => {
    const result = await mutateCourseProgress(latest => updateLessonProgress(latest, coursesFor('en')[1].lessons[0], { reflection: 'A new note' }));
    assert.equal(result, null, 'Legacy mutation must fail when the baseline could not be read');
    assert.equal(raw, before);
  });
});

test('a different tab replacement discards old private draft before replay even when its storage event has not arrived', async () => {
  let raw = JSON.stringify({ profile: { id: 'synthetic-review-user' }, courseProgress: EMPTY_PROGRESS, [REPLACEMENT_EPOCH_KEY]: 'old-record' });
  let blocked = true;
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const window = new EventTarget();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: window });
  try {
    await withStorage({
      getItem: key => key === APP_DATA_STORAGE_KEY ? raw : null,
      setItem(key, value) {
        assert.equal(key, APP_DATA_STORAGE_KEY);
        if (blocked) throw new Error('Synthetic blocked storage');
        raw = value;
      },
    }, async () => {
      const session = getCourseProgressSession();
      const oldDraft = (latest: CourseProgress) => ({ ...latest, experiments: updateCourseExperiment(latest.experiments, 'focus', { cue: 'Old private cue', action: 'Old private action' }) });
      assert.equal(await session.update(oldDraft), false);
      const replacement = { ...EMPTY_PROGRESS, experiments: updateCourseExperiment(undefined, 'sleep', { cue: 'New imported cue', action: 'New imported action' }) };
      raw = JSON.stringify({ profile: { id: 'synthetic-review-user' }, courseProgress: replacement, [REPLACEMENT_EPOCH_KEY]: 'new-record' });
      blocked = false;
      await session.retry();
      assert.equal(JSON.parse(raw).courseProgress.experiments?.focus, undefined);
      assert.equal(JSON.parse(raw).courseProgress.experiments?.sleep.action, 'New imported action');
      assert.deepEqual(session.read(), replacement);
      assert.equal(session.saveFailed(), false);
      // A subsequent replacement delivered through the ordinary browser event
      // must cancel pending edits before the reader can request another save.
      blocked = true;
      assert.equal(await session.update(oldDraft), false);
      raw = JSON.stringify({ profile: { id: 'synthetic-review-user' }, courseProgress: EMPTY_PROGRESS, [REPLACEMENT_EPOCH_KEY]: 'third-record' });
      const event = new Event('storage');
      Object.defineProperty(event, 'key', { value: APP_DATA_STORAGE_KEY });
      window.dispatchEvent(event);
      await queueDataWrite(() => undefined);
      assert.deepEqual(session.read(), EMPTY_PROGRESS);
      assert.equal(session.saveFailed(), false);
    });
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('other-tab provisional replacement notifications wait for rollback before inspecting epochs or discarding private drafts', async () => {
  const canonical = JSON.stringify({ profile: { id: 'synthetic-review-user' }, courseProgress: EMPTY_PROGRESS, [REPLACEMENT_EPOCH_KEY]: 'canonical-record' });
  let raw = canonical;
  let stored: CourseProgress = EMPTY_PROGRESS;
  let available = false;
  const draft = createCourseProgressSession(stored, async update => {
    if (!available) return null;
    stored = update(stored);
    return stored;
  });
  assert.equal(await draft.update(latest => ({ ...latest, experiments: updateCourseExperiment(latest.experiments, 'focus', { cue: 'Private cue', action: 'Retained unsaved action' }) })), false);
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const window = new EventTarget();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: window });
  let unsubscribe: (() => void) | undefined;
  try {
    await withStorage({
      getItem: key => key === APP_DATA_STORAGE_KEY ? raw : null,
      setItem: () => { throw new Error('This regression is read-only'); },
    }, async () => {
      let refreshes = 0;
      unsubscribe = subscribeCourseProgress(() => {
        refreshes++;
        const record = JSON.parse(raw);
        if (record[REPLACEMENT_EPOCH_KEY] !== 'canonical-record') draft.reset(record.courseProgress);
        else draft.receive(record.courseProgress);
      });
      let start: (() => void) | undefined;
      const started = new Promise<void>(resolve => { start = resolve; });
      let release: (() => void) | undefined;
      const held = queueDataWrite(async () => {
        raw = JSON.stringify({ profile: { id: 'synthetic-review-user' }, courseProgress: EMPTY_PROGRESS, [REPLACEMENT_EPOCH_KEY]: 'provisional-replacement' });
        const event = new Event('storage');
        Object.defineProperty(event, 'key', { value: APP_DATA_STORAGE_KEY });
        window.dispatchEvent(event);
        window.dispatchEvent(event); // Coalesce multiple provisional notifications.
        start!();
        await new Promise<void>(resolve => { release = resolve; });
        raw = canonical;
        throw new Error('Synthetic authority transaction abort after projection rollback');
      });
      await started;
      assert.equal(refreshes, 0, 'Provisional projection must remain invisible to subscribers');
      release!();
      await assert.rejects(held, /Synthetic authority transaction abort/);
      await queueDataWrite(() => undefined);
      assert.equal(refreshes, 1);
      assert.equal(draft.read().experiments?.focus.action, 'Retained unsaved action');
      assert.equal(draft.saveFailed(), true);
      available = true;
      assert.equal(await draft.retry(), true);
      assert.equal(stored.experiments?.focus.action, 'Retained unsaved action');
    });
  } finally {
    unsubscribe?.();
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
  }
});

test('same-tab course publication runs under the lock before another tab can project a provisional replacement', async () => {
  const canonical = JSON.stringify({ profile: { id: 'synthetic-review-user' }, courseProgress: EMPTY_PROGRESS, [REPLACEMENT_EPOCH_KEY]: 'canonical-record' });
  let raw = canonical;
  const draft = createCourseProgressSession(EMPTY_PROGRESS, async () => null);
  assert.equal(await draft.update(latest => ({ ...latest, experiments: updateCourseExperiment(latest.experiments, 'focus', { action: 'Retained unsaved action' }) })), false);
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: new EventTarget() });
  let observedEpoch: string | undefined;
  let unsubscribe: (() => void) | undefined;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {
    locks: { request: async (_name: string, callback: () => Promise<unknown>) => {
      const result = await callback();
      // Deterministic handoff: the next tab begins a restore before this
      // caller resumes its await. The restore later fails and rolls back.
      raw = JSON.stringify({ profile: { id: 'synthetic-review-user' }, courseProgress: EMPTY_PROGRESS, [REPLACEMENT_EPOCH_KEY]: 'provisional-replacement' });
      return result;
    } },
  } });
  try {
    await withStorage({
      getItem: key => key === APP_DATA_STORAGE_KEY ? raw : null,
      setItem: (key, value) => { assert.equal(key, APP_DATA_STORAGE_KEY); raw = value; },
    }, async () => {
      unsubscribe = subscribeCourseProgress(() => {
        const record = JSON.parse(raw);
        observedEpoch = record[REPLACEMENT_EPOCH_KEY];
        if (observedEpoch !== 'canonical-record') draft.reset(record.courseProgress);
        else draft.receive(record.courseProgress);
      });
      assert.equal(await saveCourseProgress(EMPTY_PROGRESS), true);
      assert.equal(observedEpoch, 'canonical-record');
      assert.equal(draft.read().experiments?.focus.action, 'Retained unsaved action');
      assert.equal(draft.saveFailed(), true);
      raw = canonical;
    });
  } finally {
    unsubscribe?.();
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (previousNavigator) Object.defineProperty(globalThis, 'navigator', previousNavigator);
    else Reflect.deleteProperty(globalThis, 'navigator');
  }
});
