import assert from 'node:assert/strict';
import test from 'node:test';
import { COURSES, COURSE_SOURCES } from '../src/data/courses';

const lessons = COURSES.flatMap(course => course.lessons);
const normalise = (text: string) => text.normalize('NFKC').toLocaleLowerCase('tr').replace(/\s+/gu, ' ').trim();

function assertText(value: unknown, label: string): asserts value is string {
  assert.equal(typeof value, 'string', `${label} must be text`);
  assert.match(value as string, /\p{L}/u, `${label} must contain readable content`);
  assert.equal(value, (value as string).trim(), `${label} must not have surrounding whitespace`);
}

function assertDistinctText(values: string[], count: number, label: string): void {
  assert.ok(Array.isArray(values), `${label} must be an array`);
  assert.equal(values.length, count, `${label} must contain ${count} entries`);
  values.forEach((value, index) => assertText(value, `${label}[${index}]`));
  assert.equal(new Set(values.map(normalise)).size, count, `${label} must not repeat an entry`);
}

test('five stable course IDs retain five ordered lesson IDs each for stored progress', () => {
  // These IDs are persisted in the browser; renaming them needs an explicit migration.
  const stableIds = ['confidence', 'adhd', 'motivation', 'faith', 'manifest'];
  assert.equal(COURSES.length, 5);
  assert.deepEqual(COURSES.map(course => course.id).sort(), [...stableIds].sort());
  assert.equal(lessons.length, 25);
  assert.equal(new Set(lessons.map(lesson => lesson.id)).size, 25);
  for (const course of COURSES) {
    assert.equal(course.lessons.length, 5, course.id);
    course.lessons.forEach((lesson, index) => {
      assert.equal(lesson.id, `${course.id}-${index + 1}`, `${course.id} lesson order must preserve its storage IDs`);
    });
  }
});

test('every course states its purpose, scope and outcome, with usable lesson durations', () => {
  for (const course of COURSES) {
    for (const field of ['title', 'subtitle', 'description', 'scope', 'outcome'] as const) {
      assertText(course[field], `${course.id}.${field}`);
    }
    for (const lesson of course.lessons) {
      assert.ok(Number.isInteger(lesson.minutes) && lesson.minutes > 0, `${lesson.id}.minutes must be a positive integer`);
      for (const field of ['title', 'goal'] as const) assertText(lesson[field], `${lesson.id}.${field}`);
    }
  }
});

test('the bibliography distinguishes six research sources and includes usable HTTPS references and limitations', () => {
  assert.equal(COURSE_SOURCES.filter(source => source.type === 'research').length, 6);
  assert.equal(new Set(COURSE_SOURCES.map(source => source.id)).size, COURSE_SOURCES.length);
  for (const source of COURSE_SOURCES) {
    assert.match(source.id, /^[a-z]+(?:-[a-z]+)*$/, `Invalid source ID: ${source.id}`);
    assert.ok(['research', 'guidance', 'religious'].includes(source.type), source.id);
    for (const field of ['title', 'finding', 'limitation'] as const) assertText(source[field], `${source.id}.${field}`);
    const url = new URL(source.url);
    assert.equal(url.protocol, 'https:', source.id);
    assert.ok(url.hostname.includes('.'), `${source.id} must reference a public host`);
    assert.equal(url.username, '', source.id);
    assert.equal(url.password, '', source.id);
  }
});

test('every lesson cites existing sources and every advertised research source is used', () => {
  const known = new Set(COURSE_SOURCES.map(source => source.id));
  const used = new Set<string>();
  for (const lesson of lessons) {
    assert.ok(Array.isArray(lesson.sources) && lesson.sources.length > 0, `${lesson.id} needs a source`);
    assert.equal(new Set(lesson.sources).size, lesson.sources.length, `${lesson.id} repeats a source`);
    for (const id of lesson.sources) {
      assert.ok(known.has(id), `${lesson.id} cites unknown source ${id}`);
      used.add(id);
    }
  }
  for (const source of COURSE_SOURCES.filter(source => source.type === 'research')) {
    assert.ok(used.has(source.id), `${source.id} is advertised but never used in a lesson`);
  }
});

test('each lesson has two reading paragraphs, three distinct practice instructions and reflection support', () => {
  for (const lesson of lessons) {
    assertDistinctText(lesson.reading, 2, `${lesson.id}.reading`);
    assertDistinctText(lesson.practice, 3, `${lesson.id}.practice`);
    for (const instruction of lesson.practice) {
      assert.ok(instruction.trim().split(/\s+/u).length >= 3, `${lesson.id} needs an instruction, not a practice label`);
    }
    for (const field of ['reflection', 'takeaway'] as const) assertText(lesson[field], `${lesson.id}.${field}`);
  }
});

test('each lesson offers three distinct answers, one valid correct index and explanatory feedback', () => {
  for (const lesson of lessons) {
    assertText(lesson.question, `${lesson.id}.question`);
    assertDistinctText(lesson.options, 3, `${lesson.id}.options`);
    assert.ok(Number.isInteger(lesson.correct), `${lesson.id}.correct must be an integer`);
    assert.ok(lesson.correct >= 0 && lesson.correct < lesson.options.length, `${lesson.id}.correct must identify an existing option`);
    assertText(lesson.feedback, `${lesson.id}.feedback`);
  }
});
