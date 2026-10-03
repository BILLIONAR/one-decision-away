import assert from 'node:assert/strict';
import test from 'node:test';
import { coursesFor } from '../src/data/courses';
import { courseCatalogFor } from '../src/data/courseCatalog';

test('lightweight course previews and restore metadata match each real edition', () => {
  for (const locale of ['en', 'tr', 'es']) {
    const catalog = courseCatalogFor(locale);
    const courses = coursesFor(locale);
    assert.equal(catalog.length, 18);
    assert.equal(catalog.reduce((sum, item) => sum + item.lessonCount, 0), 103);
    assert.equal(catalog.length, courses.length);
    courses.forEach((course, index) => {
      const item = catalog[index];
      assert.equal(item.id, course.id);
      assert.equal(item.title, course.title);
      assert.equal(item.outcome, course.outcome);
      assert.equal(item.minutes, course.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0));
      assert.deepEqual(item.lessonIds, course.lessons.map(lesson => lesson.id));
      assert.deepEqual(item.lessons, course.lessons.map(lesson => ({ id: lesson.id, title: lesson.title, minutes: lesson.minutes, goal: lesson.goal, practiceCount: lesson.practice.length, optionCount: lesson.options.length, correct: lesson.correct })));
      for (const lesson of item.lessons) {
        assert.equal(Object.hasOwn(lesson, 'reading'), false, 'Today metadata must not include reading paragraphs');
        assert.equal(Object.hasOwn(lesson, 'practice'), false, 'Today metadata must not include exercise text');
        assert.equal(Object.hasOwn(lesson, 'deeper'), false, 'Today metadata must not include full lesson content');
        assert.equal(Object.hasOwn(lesson, 'options'), false, 'Today metadata must not include quiz answers');
      }
    });
  }
});
