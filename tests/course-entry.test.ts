import assert from 'node:assert/strict';
import test from 'node:test';
import { coursesFor } from '../src/data/courses';
import { courseCatalogFor } from '../src/data/courseCatalog';
import { courseEntryCopy } from '../src/data/courseEntryCopy';
import { courseEntryFor, hasLessonLearningProgress, sameCourseEntryScope } from '../src/services/courseEntry';
import { completeLesson, EMPTY_PROGRESS, parseCourseProgress, updateLessonProgress, type CourseProgress } from '../src/services/courseProgress';
import { emptyCourseExperiment, isCourseReviewDue } from '../src/services/courseLearning';
import { courseContinuation } from '../src/services/dailyLoop';

const locales = ['en', 'tr', 'es'] as const;

test('every untouched course previews its real edition without creating saved learning', () => {
  for (const locale of locales) for (const course of coursesFor(locale)) {
    const before = JSON.stringify(EMPTY_PROGRESS);
    assert.deepEqual(courseEntryFor(course, EMPTY_PROGRESS), { started: false, mode: 'overview', index: 0 });
    assert.equal(JSON.stringify(EMPTY_PROGRESS), before);
    const emptyRecord = updateLessonProgress(EMPTY_PROGRESS, course.lessons[0], { reflection: ' \n\t ', checked: course.lessons[0].practice.map(() => false), answer: null });
    assert.equal(courseEntryFor(course, emptyRecord).mode, 'overview', 'an empty saved draft is still untouched');
  }
});

test('a saved tick, answer zero, reflection or completion constitutes learning, unlike a blank record', () => {
  const blank = { completed: false, checked: [false], answer: null, reflection: '' };
  assert.equal(hasLessonLearningProgress(undefined), false);
  assert.equal(hasLessonLearningProgress({ ...blank, reflection: '\n \t' }), false);
  for (const saved of [{ checked: [true] }, { answer: 0 }, { reflection: 'My next small step.' }, { completed: true }]) {
    assert.equal(hasLessonLearningProgress({ ...blank, ...saved }), true);
  }
  for (const locale of locales) for (const course of coursesFor(locale)) {
    for (const saved of [{ checked: [true] }, { answer: 0 }, { reflection: 'My next small step.' }]) {
      const progress = updateLessonProgress(EMPTY_PROGRESS, course.lessons[0], saved);
      assert.deepEqual(courseEntryFor(course, progress), { started: true, mode: 'lesson', index: 0 });
    }
  }
});

test('saved progress resumes each of the 103 actual lessons across all three editions and Today agrees', () => {
  for (const locale of locales) for (const course of coursesFor(locale)) {
    let progress: CourseProgress = EMPTY_PROGRESS;
    for (let index = 0; index < course.lessons.length; index++) {
      const lesson = course.lessons[index];
      progress = updateLessonProgress(progress, lesson, { reflection: `Saved step ${index + 1}` });
      const restored = parseCourseProgress(JSON.stringify(progress));
      assert.deepEqual(courseEntryFor(course, restored), { started: true, mode: 'lesson', index });
      const next = courseContinuation(courseCatalogFor(locale), restored, 'focus', course.id);
      assert.equal(next?.course.id, course.id);
      assert.equal(next?.index, index);
      assert.equal(next?.started, true);
      assert.equal(next?.course.lessons[index].title, lesson.title);
      assert.equal(next?.course.lessons[index].minutes, lesson.minutes);
      assert.equal(next?.course.lessons[index].goal, lesson.goal);
      progress = updateLessonProgress(progress, lesson, { checked: lesson.practice.map(() => true), answer: lesson.correct });
      progress = completeLesson(progress, course, index);
    }
    assert.deepEqual(courseEntryFor(course, progress), { started: true, mode: 'lesson', index: course.lessons.length - 1 });
    assert.equal(courseContinuation(courseCatalogFor(locale).filter(item => item.id === course.id), progress), null);
  }
});

test('a later draft cannot skip unfinished prerequisite lessons', () => {
  for (const course of coursesFor('en')) {
    const progress = updateLessonProgress(EMPTY_PROGRESS, course.lessons.at(-1)!, { reflection: 'Saved for a later lesson.' });
    assert.deepEqual(courseEntryFor(course, progress), { started: true, mode: 'lesson', index: 0 });
  }
});

test('workbook-only plans stay available for review without inventing lesson progress', () => {
  const course = coursesFor('en')[0];
  const experiment = { ...emptyCourseExperiment(), cue: 'After tea', action: 'Write a heading', reviewOn: '2026-10-01' };
  const progress: CourseProgress = { version: 1, lessons: {}, experiments: { [course.id]: experiment } };
  const before = JSON.stringify(progress);
  assert.equal(isCourseReviewDue(experiment, '2026-10-02'), true);
  assert.equal(courseEntryFor(course, progress).mode, 'overview');
  assert.equal(JSON.stringify(progress), before);
});

test('ordinary saves retain an explicit view while account and same-account backup replacement invalidate it', () => {
  const current = { recordId: 'reader', replacementEpoch: 'original' };
  assert.equal(sameCourseEntryScope(current, { ...current }), true);
  assert.equal(sameCourseEntryScope(current, { recordId: 'reader', replacementEpoch: 'restored' }), false);
  assert.equal(sameCourseEntryScope(current, { recordId: 'other', replacementEpoch: 'original' }), false);
  assert.equal(sameCourseEntryScope(current, { recordId: 'reader', replacementEpoch: undefined }), false);
});

test('course entry instructions have matching localized keys and keep the actual lesson-number placeholder', () => {
  const english = courseEntryCopy('en');
  for (const locale of locales) {
    const copy = courseEntryCopy(locale);
    assert.deepEqual(Object.keys(copy).sort(), Object.keys(english).sort());
    assert.ok(Object.values(copy).every(value => value.trim().length > 0));
    assert.match(copy.continueLesson, /\{number\}/);
    if (locale !== 'en') assert.notEqual(copy.startFirst, english.startFirst);
  }
});
