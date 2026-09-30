import assert from 'node:assert/strict';
import test from 'node:test';
import { coursesFor } from '../src/data/courses';
import { courseCatalogFor } from '../src/data/courseCatalog';

test('lightweight course previews and restore metadata match each real edition', () => {
  for (const locale of ['en', 'tr', 'es']) {
    const catalog = courseCatalogFor(locale);
    const courses = coursesFor(locale);
    assert.equal(catalog.length, courses.length);
    courses.forEach((course, index) => {
      const item = catalog[index];
      assert.equal(item.id, course.id);
      assert.equal(item.title, course.title);
      assert.equal(item.outcome, course.outcome);
      assert.equal(item.minutes, course.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0));
      assert.deepEqual(item.lessonIds, course.lessons.map(lesson => lesson.id));
      assert.deepEqual(item.lessons, course.lessons.map(lesson => ({ id: lesson.id, practiceCount: lesson.practice.length, optionCount: lesson.options.length, correct: lesson.correct })));
    });
  }
});
