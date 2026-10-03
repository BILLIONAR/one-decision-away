import assert from 'node:assert/strict';
import test from 'node:test';
import { coursesFor } from '../src/data/courses';
import { completeLesson, EMPTY_PROGRESS, updateLessonProgress } from '../src/services/courseProgress';
import { consumeCourseNavigation, requestCourseNavigation, resolveCourseNavigation, COURSE_NAVIGATION_INTENT_KEY } from '../src/services/courseNavigationIntent';

const course = coursesFor('en').find(item => item.id === 'focus')!;
const access = { gating: false, tier: 'free' as const };
const storage = () => {
  const values = new Map<string, string>();
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
};
function withStores(run: (session: ReturnType<typeof storage>, local: ReturnType<typeof storage>) => void) {
  const session = storage(), local = storage();
  const previous = ['sessionStorage', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  Object.defineProperty(globalThis, 'sessionStorage', { value: session, configurable: true });
  Object.defineProperty(globalThis, 'localStorage', { value: local, configurable: true });
  try { run(session, local); } finally {
    for (const [key, descriptor] of previous) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
  }
}
function prefix(count: number) {
  let progress = EMPTY_PROGRESS;
  for (let i = 0; i < count; i++) {
    const lesson = course.lessons[i];
    progress = updateLessonProgress(progress, lesson, { checked: lesson.practice.map(() => true), answer: lesson.correct });
    progress = completeLesson(progress, course, i);
  }
  return progress;
}

test('overview and lesson requests are distinct, single-use and never write learning progress', () => withStores((session, local) => {
  for (const mode of ['overview', 'lesson'] as const) {
    const intent = { courseId: course.id, mode };
    assert.equal(requestCourseNavigation(intent), true);
    assert.equal(local.getItem('oda_course_selection_v1'), course.id);
    assert.deepEqual(consumeCourseNavigation(), intent);
    assert.equal(consumeCourseNavigation(), null);
    assert.equal(session.getItem(COURSE_NAVIGATION_INTENT_KEY), null);
    assert.deepEqual([...local.values.keys()], ['oda_course_selection_v1']);
  }
}));

test('malformed, unknown-course, cross-course lesson and unsupported version requests are discarded', () => withStores((session, local) => {
  assert.equal(requestCourseNavigation({ courseId: 'constructor', mode: 'overview' }), false);
  assert.equal(requestCourseNavigation({ courseId: course.id, mode: 'lesson', lessonId: 'sleep-1' }), false);
  assert.equal(local.values.size, 0);
  for (const raw of ['{', '{}', 'null', JSON.stringify({ version: 2, scope: null, intent: { courseId: course.id, mode: 'lesson' } }), JSON.stringify({ version: 1, scope: null, intent: { courseId: course.id, mode: 'unknown' } }), JSON.stringify({ version: 1, scope: null, intent: { courseId: course.id, mode: ['lesson'] } })]) {
    session.setItem(COURSE_NAVIGATION_INTENT_KEY, raw);
    assert.equal(consumeCourseNavigation(), null);
    assert.equal(session.getItem(COURSE_NAVIGATION_INTENT_KEY), null);
  }
}));

test('requests belonging to a different account or restored record cannot be consumed', () => withStores((session, local) => {
  local.setItem('one_decision_away_app_data_v1', JSON.stringify({ profile: { id: 'reader' }, _odaReplacementEpoch: 'original' }));
  assert.equal(requestCourseNavigation({ courseId: course.id, mode: 'overview' }), true);
  local.setItem('one_decision_away_app_data_v1', JSON.stringify({ profile: { id: 'reader' }, _odaReplacementEpoch: 'restore' }));
  assert.equal(consumeCourseNavigation(), null);
  assert.equal(requestCourseNavigation({ courseId: course.id, mode: 'lesson' }), true);
  local.setItem('one_decision_away_app_data_v1', JSON.stringify({ profile: { id: 'another' }, _odaReplacementEpoch: 'restore' }));
  assert.equal(consumeCourseNavigation(), null);
}));

test('an explicit overview stays overview after saved progress arrives; Continue resumes actual incomplete lesson', () => {
  const saved = prefix(2);
  assert.deepEqual(resolveCourseNavigation({ courseId: course.id, mode: 'overview' }, course, saved, access), { mode: 'overview', index: 2, reason: null });
  assert.deepEqual(resolveCourseNavigation({ courseId: course.id, mode: 'lesson' }, course, saved, access), { mode: 'lesson', index: 2, reason: null });
  assert.deepEqual(resolveCourseNavigation({ courseId: course.id, mode: 'lesson', lessonId: course.lessons[0].id }, course, saved, access), { mode: 'lesson', index: 0, reason: null });
});

test('roadmap requests cannot skip prerequisites, open unknown lessons or bypass existing subscription gates', () => {
  const original = JSON.stringify(EMPTY_PROGRESS);
  assert.equal(resolveCourseNavigation({ courseId: course.id, mode: 'lesson', lessonId: course.lessons[1].id }, course, EMPTY_PROGRESS, access).reason, 'prerequisite');
  assert.equal(resolveCourseNavigation({ courseId: course.id, mode: 'lesson', lessonId: 'unknown' }, course, EMPTY_PROGRESS, access).reason, 'invalid');
  const saved = prefix(2);
  assert.equal(resolveCourseNavigation({ courseId: course.id, mode: 'lesson' }, course, saved, { gating: true, tier: 'free' }).reason, 'entitlement');
  assert.equal(resolveCourseNavigation({ courseId: course.id, mode: 'lesson' }, course, saved, { gating: true, tier: 'essentials' }).mode, 'lesson');
  assert.equal(JSON.stringify(EMPTY_PROGRESS), original);
});

test('completed courses remain rereadable and blocked navigation storage is reported without throwing', () => {
  assert.equal(resolveCourseNavigation({ courseId: course.id, mode: 'lesson' }, course, prefix(course.lessons.length), access).index, course.lessons.length - 1);
  withStores((session) => {
    session.setItem = () => { throw new Error('Storage blocked'); };
    assert.equal(requestCourseNavigation({ courseId: course.id, mode: 'overview' }), false);
    assert.equal(consumeCourseNavigation(), null);
  });
});
