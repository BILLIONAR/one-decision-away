import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { COURSES, coursesFor, type ContentLocale } from '../src/data/courses';
import { courseCatalogFor } from '../src/data/courseCatalog';
import { categoryForCourse, courseLearningCopy } from '../src/data/courseLearningCopy';
import { practiceGuideFor } from '../src/data/coursePracticeContent';
import { CoursePracticeStudio } from '../src/components/CoursePracticeStudio';
import { addCoursePracticeAttempt, coursePracticeText, emptyCourseExperiment, getCourseExperiment, hasPracticePlan, isCourseReviewDue, isPracticeDate, localPracticeDate, MAX_PLAN_TEXT, MAX_PRACTICE_ATTEMPTS, MAX_PRACTICE_NOTE, normalizeCourseExperiments, practiceDateAfter, removeCoursePracticeAttempt, updateCourseExperiment } from '../src/services/courseLearning';
import { completeLesson, EMPTY_PROGRESS, getLessonProgress, normalizeCourseProgress, updateLessonProgress } from '../src/services/courseProgress';

const id = 'procrastination';
const locales: ContentLocale[] = ['en', 'tr', 'es'];
const plan = { cue: 'After lunch', action: 'Write one rough sentence', fallback: 'Write only the title', evidence: 'A sentence on the page', reviewOn: '2026-10-07' };
const attempt = { id: 'first', date: '2026-09-30', outcome: 'tried' as const, note: 'I opened the draft. The first sentence was easier after finding the notes.' };

test('all 18 courses have distinct, actionable guides in every supported language', () => {
  const ids = courseCatalogFor('en').map(course => course.id);
  assert.equal(ids.length, 18);
  for (const locale of locales) {
    const experiments = ids.map(courseId => practiceGuideFor(courseId, locale).experiment);
    assert.equal(new Set(experiments).size, ids.length, `${locale}: course-specific experiments`);
    for (const courseId of ids) {
      const guide = practiceGuideFor(courseId, locale);
      for (const field of ['experiment', 'cue', 'action', 'fallback', 'evidence', 'transfer'] as const) {
        assert.ok(guide[field].trim().length > 25, `${locale}/${courseId}/${field}`);
        assert.equal(guide[field], guide[field].trim());
      }
      assert.equal(guide.milestones.length, 3);
      assert.equal(new Set(guide.milestones).size, 3);
      assert.ok(['courage', 'attention', 'perspective'].includes(categoryForCourse(courseId)));
    }
  }
});

test('studio is optional and initially collapsed; completed courses open their transfer practice', () => {
  for (const locale of locales) {
    const course = coursesFor(locale).find(item => item.id === id)!;
    const copy = courseLearningCopy(locale);
    const initial = renderToStaticMarkup(React.createElement(CoursePracticeStudio, { course, locale, completed: 0, experiments: undefined, onUpdate: async () => true }));
    assert.ok(initial.includes(copy.studio));
    assert.ok(initial.includes(copy.optional));
    assert.ok(initial.includes(copy.noNotification));
    assert.match(initial, /id="course-practice-studio"[^>]*>/);
    assert.doesNotMatch(initial, /id="course-practice-studio"[^>]*\bopen=/);
    const completed = renderToStaticMarkup(React.createElement(CoursePracticeStudio, { course, locale, completed: course.lessons.length, experiments: undefined, onUpdate: async () => true }));
    assert.match(completed, /id="course-practice-studio"[^>]*\bopen=/);
  }
});

test('new plans preserve optionality and keep an independent copy of private fields', () => {
  assert.equal(hasPracticePlan(emptyCourseExperiment()), false);
  let experiments = updateCourseExperiment(undefined, id, { action: plan.action });
  assert.equal(hasPracticePlan(getCourseExperiment(experiments, id)), false);
  experiments = updateCourseExperiment(experiments, id, plan);
  assert.equal(hasPracticePlan(getCourseExperiment(experiments, id)), true);
  const view = getCourseExperiment(experiments, id);
  view.action = 'Changed view';
  view.review.recall = 'Changed view';
  assert.equal(experiments[id].action, plan.action);
  assert.equal(experiments[id].review.recall, '');
});

test('untrusted backup data cannot introduce unknown courses, malformed dates, duplicate entries, or oversized notes', () => {
  const raw = JSON.parse(JSON.stringify({
    unknown: plan,
    constructor: plan,
    [id]: {
      ...plan, cue: 'x'.repeat(MAX_PLAN_TEXT + 20), action: 5, reviewOn: '2026-02-30',
      attempts: [attempt, attempt, { ...attempt, id: 'bad-date', date: 'yesterday' }, { ...attempt, id: 'bad-state', outcome: 'won' }, { ...attempt, id: 'large', note: 'a'.repeat(MAX_PRACTICE_NOTE + 20) }],
      review: { recall: ['not text'], nextAction: 'a'.repeat(MAX_PLAN_TEXT + 20), reviewedOn: '2026-13-01' }, injected: true,
    },
  }));
  const clean = normalizeCourseExperiments(raw);
  assert.deepEqual(Object.keys(clean), [id]);
  assert.equal(clean[id].cue.length, MAX_PLAN_TEXT);
  assert.equal(clean[id].action, '');
  assert.equal(clean[id].reviewOn, null);
  assert.equal(clean[id].attempts.length, 2);
  assert.equal(clean[id].attempts[1].note.length, MAX_PRACTICE_NOTE);
  assert.equal(clean[id].review.recall, '');
  assert.equal(clean[id].review.nextAction.length, MAX_PLAN_TEXT);
  assert.equal(clean[id].review.reviewedOn, null);
  assert.ok(!('injected' in clean[id]));
});

test('retrying the same journal entry is idempotent; paused and adapted entries retain honest observations', () => {
  const before = updateCourseExperiment({}, id, plan);
  const once = addCoursePracticeAttempt(before, id, attempt);
  const twice = addCoursePracticeAttempt(once, id, attempt);
  assert.deepEqual(twice, once);
  assert.equal(before[id].attempts.length, 0);
  const paused = addCoursePracticeAttempt(twice, id, { ...attempt, id: 'pause', outcome: 'paused', note: 'I needed the missing document.' });
  const adapted = addCoursePracticeAttempt(paused, id, { ...attempt, id: 'small', outcome: 'adapted', note: 'I wrote the title instead.' });
  assert.equal(adapted[id].attempts[1].outcome, 'paused');
  assert.equal(adapted[id].attempts[2].outcome, 'adapted');
  assert.equal(removeCoursePracticeAttempt(adapted, id, 'pause')[id].attempts.length, 2);
  assert.equal(adapted[id].attempts.length, 3);
});

test('journal keeps the most recent bounded entries and does not mutate input during normalization', () => {
  const attempts = Array.from({ length: MAX_PRACTICE_ATTEMPTS + 5 }, (_, i) => ({ ...attempt, id: `entry-${i}` }));
  const clean = normalizeCourseExperiments({ [id]: { ...plan, attempts } });
  assert.equal(clean[id].attempts.length, MAX_PRACTICE_ATTEMPTS);
  assert.equal(clean[id].attempts[0].id, 'entry-5');
  assert.equal(attempts.length, MAX_PRACTICE_ATTEMPTS + 5);
  for (const raw of [null, [], 'text', { [id]: [] }, { [id]: null }]) assert.deepEqual(normalizeCourseExperiments(raw), {});
  assert.deepEqual(updateCourseExperiment(clean, 'unknown', plan), clean);
});

test('calendar validation handles leap days, impossible dates, and week/month/year transitions', () => {
  assert.equal(isPracticeDate('2028-02-29'), true);
  for (const value of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-9-30', '2026-09-30T00:00:00Z', null]) assert.equal(isPracticeDate(value), false);
  assert.equal(localPracticeDate(new Date(2026, 8, 30, 23, 59)), '2026-09-30');
  assert.equal(practiceDateAfter(7, new Date(2026, 11, 28, 23, 59)), '2027-01-04');
  assert.equal(practiceDateAfter(7, new Date(2028, 1, 25, 23, 59)), '2028-03-03');
});

test('due review needs a usable plan; completing review sets a fresh revisit without losing reflection', () => {
  let experiments = updateCourseExperiment({}, id, { ...plan, review: { recall: 'Make starting visible', nextAction: 'Put my notes next to the draft' } });
  assert.equal(isCourseReviewDue(experiments[id], '2026-10-06'), false);
  assert.equal(isCourseReviewDue(experiments[id], '2026-10-07'), true);
  assert.equal(isCourseReviewDue(experiments[id], '2026-10-08'), true);
  assert.equal(isCourseReviewDue({ ...experiments[id], action: '' }, '2026-10-08'), false);
  experiments = updateCourseExperiment(experiments, id, { review: { reviewedOn: '2026-10-08' }, reviewOn: '2026-10-15' });
  assert.equal(isCourseReviewDue(experiments[id], '2026-10-08'), false);
  assert.equal(isCourseReviewDue(experiments[id], '2026-10-15'), true);
  assert.equal(experiments[id].review.recall, 'Make starting visible');
  assert.equal(experiments[id].review.nextAction, 'Put my notes next to the draft');
});

test('course progress saves and completed lessons keep the plan, journal, and review after an interrupted round trip', () => {
  const course = COURSES.find(item => item.id === id)!;
  const lesson = course.lessons[0];
  let state = { ...EMPTY_PROGRESS, experiments: addCoursePracticeAttempt(updateCourseExperiment({}, id, plan), id, attempt) };
  state = updateLessonProgress(state, lesson, { checked: [true, false, false], reflection: 'A small next step\nfor tomorrow.' }) as typeof state;
  const reopened = normalizeCourseProgress(JSON.parse(JSON.stringify(state)));
  assert.equal(getLessonProgress(reopened, lesson).checked[0], true);
  assert.equal(getLessonProgress(reopened, lesson).completed, false);
  assert.deepEqual(reopened.experiments, state.experiments);
  const ready = updateLessonProgress(reopened, lesson, { checked: lesson.practice.map(() => true), answer: lesson.correct });
  const finished = completeLesson(ready, course, 0);
  assert.equal(getLessonProgress(finished, lesson).completed, true);
  assert.deepEqual(finished.experiments, state.experiments);
  assert.deepEqual(normalizeCourseProgress(JSON.parse(JSON.stringify(finished))).experiments, state.experiments);
});

test('a practice plan cannot unlock lessons or manufacture completion', () => {
  const course = COURSES.find(item => item.id === id)!;
  const state = { ...EMPTY_PROGRESS, experiments: updateCourseExperiment({}, id, plan) };
  const result = completeLesson(state, course, 1);
  assert.equal(getLessonProgress(result, course.lessons[1]).completed, false);
  assert.deepEqual(result.lessons, {});
});

test('a localized portable artifact retains ordinary private text without embedding executable HTML', () => {
  const copy = courseLearningCopy('tr');
  const experiments = addCoursePracticeAttempt(updateCourseExperiment({}, id, { ...plan, review: { recall: 'A smaller first move', nextAction: 'Keep the notes nearby' } }), id, { ...attempt, note: 'First line\nSecond line <script>ordinary text</script>' });
  const body = coursePracticeText('ODA practice', experiments[id], { cue: copy.cue, action: copy.action, fallback: copy.fallback, evidence: copy.evidence, review: copy.reviewDate, attempts: copy.attempts, recall: copy.recall, nextAction: copy.nextAction, outcomes: { tried: copy.tried, adapted: copy.adapted, paused: copy.paused } });
  assert.ok(body.includes(copy.tried));
  assert.ok(body.includes('First line\nSecond line <script>ordinary text</script>'));
  assert.ok(body.includes('Keep the notes nearby'));
});
