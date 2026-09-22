import assert from 'node:assert/strict';
import test from 'node:test';
import { COURSES, type CourseLesson } from '../src/data/courses';
import {
  COURSE_PROGRESS_STORAGE_KEY,
  EMPTY_PROGRESS,
  MAX_COURSE_REFLECTION_LENGTH,
  canCompleteLesson,
  completeLesson,
  getLessonProgress,
  nextLessonIndex,
  parseCourseProgress,
  readCourseProgress,
  saveCourseProgress,
  updateLessonProgress,
  type CourseProgress,
  type LessonProgress,
} from '../src/services/courseProgress';

const course = COURSES[0];
const first = course.lessons[0];
const second = course.lessons[1];
const ready = (lesson: CourseLesson): LessonProgress => ({
  checked: lesson.practice.map(() => true), answer: lesson.correct, reflection: 'Kendi küçük adımım.', completed: false,
});
const encoded = (lessons: Record<string, unknown>) => JSON.stringify({ version: 1, lessons });

test('malformed and unsupported records recover to separate empty states', () => {
  for (const raw of [null, '', '{', 'null', '[]', '{}', '{"version":2,"lessons":{}}', '{"version":1,"lessons":[]}']) {
    assert.deepEqual(parseCourseProgress(raw), EMPTY_PROGRESS);
    assert.notEqual(parseCourseProgress(raw), EMPTY_PROGRESS);
  }
});

test('unknown IDs and properties are discarded; checklists are resized with strict booleans', () => {
  const state = parseCourseProgress(encoded({
    unknown: ready(first),
    constructor: ready(first),
    [first.id]: { checked: [true, 'true', 1, true, true], answer: first.correct, reflection: 42, completed: 'true', injected: true },
    [second.id]: { checked: [true] },
  }));
  assert.deepEqual(Object.keys(state.lessons), [first.id, second.id]);
  assert.deepEqual(state.lessons[first.id].checked, first.practice.map((_, i) => i === 0 || i >= 3));
  assert.deepEqual(state.lessons[second.id].checked, second.practice.map((_, i) => i === 0));
  assert.equal(state.lessons[first.id].completed, false);
  assert.equal(state.lessons[first.id].reflection, '');
  assert.deepEqual(Object.keys(state.lessons[first.id]).sort(), ['answer', 'checked', 'completed', 'reflection']);
});

test('negative, fractional, nonnumeric and out-of-range answers do not satisfy a lesson', () => {
  for (const answer of [-1, 0.5, first.options.length, '1', true, null]) {
    const progress = parseCourseProgress(encoded({ [first.id]: { ...ready(first), answer, completed: true } })).lessons[first.id];
    assert.equal(progress.answer, null);
    assert.equal(progress.completed, false);
    assert.equal(canCompleteLesson(progress, first), false);
  }
  for (const answer of [NaN, Infinity, -Infinity]) {
    const state = updateLessonProgress(EMPTY_PROGRESS, first, { ...ready(first), answer });
    assert.equal(state.lessons[first.id].answer, null);
  }
});

test('notes are bounded while their newlines and ordinary content survive', () => {
  const reflection = `Birinci satır\n${'a'.repeat(MAX_COURSE_REFLECTION_LENGTH + 100)}`;
  const state = parseCourseProgress(encoded({ [first.id]: { ...ready(first), reflection } }));
  assert.equal(state.lessons[first.id].reflection.length, MAX_COURSE_REFLECTION_LENGTH);
  assert.equal(state.lessons[first.id].reflection, reflection.slice(0, MAX_COURSE_REFLECTION_LENGTH));
});

test('tampered completion cannot bypass the exercise, answer or preceding lessons', () => {
  const incomplete = { ...ready(first), checked: first.practice.map(() => false), completed: true };
  const missingPractice = parseCourseProgress(encoded({ [first.id]: incomplete, [second.id]: { ...ready(second), completed: true } }));
  assert.equal(missingPractice.lessons[first.id].completed, false);
  assert.equal(missingPractice.lessons[second.id].completed, false);
  const missingPrevious = parseCourseProgress(encoded({ [second.id]: { ...ready(second), completed: true } }));
  assert.equal(missingPrevious.lessons[second.id].completed, false);
  const wrongAnswer = parseCourseProgress(encoded({ [first.id]: { ...ready(first), answer: (first.correct + 1) % first.options.length, completed: true } }));
  assert.equal(wrongAnswer.lessons[first.id].completed, false);
});

test('valid completed prefixes survive independently for different courses', () => {
  const other = COURSES[1].lessons[0];
  const state = parseCourseProgress(encoded({
    [first.id]: { ...ready(first), completed: true },
    [second.id]: { ...ready(second), completed: true },
    [other.id]: { ...ready(other), completed: true },
  }));
  assert.equal(nextLessonIndex(state, course), 2);
  assert.equal(nextLessonIndex(state, COURSES[1]), 1);
});

test('draft updates are immutable and cannot mark a lesson complete', () => {
  const checkboxes = first.practice.map(() => true);
  const state = updateLessonProgress(EMPTY_PROGRESS, first, { checked: checkboxes, answer: first.correct, completed: true });
  checkboxes[0] = false;
  assert.equal(state.lessons[first.id].checked[0], true);
  assert.equal(state.lessons[first.id].completed, false);
  assert.deepEqual(EMPTY_PROGRESS.lessons, {});
  const view = getLessonProgress(state, first);
  view.checked[0] = false;
  assert.equal(state.lessons[first.id].checked[0], true);
  const emptyView = getLessonProgress(EMPTY_PROGRESS, first);
  emptyView.checked[0] = true;
  assert.equal(getLessonProgress(EMPTY_PROGRESS, first).checked[0], false);
});

test('completion follows the real course in order and is idempotent', () => {
  let state: CourseProgress = EMPTY_PROGRESS;
  state = updateLessonProgress(state, second, ready(second));
  assert.equal(completeLesson(state, course, 1).lessons[second.id].completed, false);
  for (const index of [-1, 0.5, course.lessons.length, NaN]) assert.deepEqual(completeLesson(state, course, index), state);
  for (let i = 0; i < course.lessons.length; i++) {
    const lesson = course.lessons[i];
    assert.equal(nextLessonIndex(state, course), i);
    state = updateLessonProgress(state, lesson, ready(lesson));
    const before = JSON.stringify(state);
    const completed = completeLesson(state, course, i);
    assert.equal(JSON.stringify(state), before);
    assert.equal(completed.lessons[lesson.id].completed, true);
    assert.deepEqual(completeLesson(completed, course, i), completed);
    state = completed;
  }
  assert.equal(nextLessonIndex(state, course), course.lessons.length);
});

test('editing a completed prerequisite revalidates later lessons without losing drafts', () => {
  let state: CourseProgress = EMPTY_PROGRESS;
  for (let i = 0; i < 2; i++) {
    state = updateLessonProgress(state, course.lessons[i], ready(course.lessons[i]));
    state = completeLesson(state, course, i);
  }
  const changed = updateLessonProgress(state, first, { checked: first.practice.map(() => false) });
  assert.equal(changed.lessons[first.id].completed, false);
  assert.equal(changed.lessons[second.id].completed, false);
  assert.equal(changed.lessons[second.id].reflection, ready(second).reflection);
  assert.equal(state.lessons[second.id].completed, true);
  assert.equal(nextLessonIndex(changed, course), 0);
});

test('caller-supplied lesson and course objects cannot change the answer or bypass a course', () => {
  const wrong = (first.correct + 1) % first.options.length;
  const state = updateLessonProgress(EMPTY_PROGRESS, first, { ...ready(first), answer: wrong });
  assert.equal(canCompleteLesson(state.lessons[first.id], { ...first, correct: wrong }), false);
  assert.equal(completeLesson(state, { ...course, lessons: [{ ...first, correct: wrong }] }, 0).lessons[first.id].completed, false);
  assert.deepEqual(updateLessonProgress(state, { ...first, id: 'unknown' }, ready(first)), state);
  assert.deepEqual(completeLesson(state, { ...course, id: 'unknown' }, 0), state);
});

function withStorage(descriptor: PropertyDescriptor, run: () => void): void {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, ...descriptor });
  try { run(); } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
}

test('saving and reloading preserve a completed lesson and an unfinished draft', () => {
  const entries = new Map<string, string>();
  withStorage({ value: { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => entries.set(key, value) } }, () => {
    assert.deepEqual(readCourseProgress(), EMPTY_PROGRESS);
    let state = updateLessonProgress(EMPTY_PROGRESS, first, ready(first));
    state = completeLesson(state, course, 0);
    state = updateLessonProgress(state, second, { reflection: 'Yarın sürdüreceğim.', checked: second.practice.map((_, i) => i === 0) });
    assert.equal(saveCourseProgress(state), true);
    assert.ok(entries.has(COURSE_PROGRESS_STORAGE_KEY));
    assert.deepEqual(readCourseProgress(), state);
    assert.deepEqual(parseCourseProgress(JSON.stringify(readCourseProgress())), state);
    assert.equal(nextLessonIndex(readCourseProgress(), course), 1);
  });
});

test('blocked storage and quota failures are reported without throwing', () => {
  withStorage({ get: () => { throw new Error('Storage blocked'); } }, () => {
    assert.deepEqual(readCourseProgress(), EMPTY_PROGRESS);
    assert.equal(saveCourseProgress(EMPTY_PROGRESS), false);
  });
  withStorage({ value: { getItem: () => '{invalid', setItem: () => { throw new Error('QuotaExceededError'); } } }, () => {
    assert.deepEqual(readCourseProgress(), EMPTY_PROGRESS);
    assert.equal(saveCourseProgress(EMPTY_PROGRESS), false);
  });
});
