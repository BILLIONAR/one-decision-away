import test from 'node:test';
import assert from 'node:assert/strict';
import { EN_EDITION, ES_EDITION, ES_SOURCES, sourcesFor } from '../src/data/courses';

const en = new Map(EN_EDITION.map(course => [course.id, course]));
const known = new Set(sourcesFor('es').map(source => source.id));

test('Spanish editions mirror the English structure', () => {
  for (const course of ES_EDITION) {
    const base = en.get(course.id);
    assert.ok(base, `${course.id} has no English edition`);
    assert.equal(course.lang, 'es');
    assert.deepEqual(course.lessons.map(l => l.id), base.lessons.map(l => l.id), `${course.id} lesson ids`);
    course.lessons.forEach((lesson, i) => {
      const b = base.lessons[i];
      assert.equal(lesson.correct, b.correct, `${lesson.id} correct`);
      assert.equal(lesson.options.length, b.options.length, `${lesson.id} options`);
      assert.equal(lesson.practice.length, 3, `${lesson.id} practice`);
      assert.equal(lesson.reading.length, 2, `${lesson.id} reading`);
      assert.equal(lesson.visual?.kind, b.visual?.kind, `${lesson.id} visual kind`);
      assert.equal((lesson.deeper ?? []).length, (b.deeper ?? []).length, `${lesson.id} deeper`);
      assert.ok(lesson.example?.text, `${lesson.id} example`);
      assert.equal(lesson.photo?.id, b.photo?.id, `${lesson.id} photo`);
      for (const id of lesson.sources) assert.ok(known.has(id), `${lesson.id} cites unknown source ${id}`);
    });
  }
});

test('Spanish source ids are unique', () => {
  const ids = ES_SOURCES.map(s => s.id);
  assert.equal(new Set(ids).size, ids.length, `duplicates: ${ids.filter((x, i) => ids.indexOf(x) !== i)}`);
});
