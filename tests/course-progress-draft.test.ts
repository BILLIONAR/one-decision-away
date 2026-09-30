import assert from 'node:assert/strict';
import test from 'node:test';
import { createCourseProgressDraft } from '../src/services/courseProgressDraft';
import { EMPTY_PROGRESS, type CourseProgress } from '../src/services/courseProgress';
import { getCourseExperiment, updateCourseExperiment } from '../src/services/courseLearning';

const patch = (id: string, value: Parameters<typeof updateCourseExperiment>[2]) => (state: CourseProgress): CourseProgress => ({ ...state, experiments: updateCourseExperiment(state.experiments, id, value) });
const tick = () => new Promise(resolve => setImmediate(resolve));

test('rapid edits remain visible and are replayed in order under serialized persistence', async () => {
  let stored = EMPTY_PROGRESS;
  let shown = stored;
  let active = 0;
  let peak = 0;
  const saves: boolean[] = [];
  const draft = createCourseProgressDraft(stored, async update => {
    active++; peak = Math.max(peak, active);
    await tick();
    stored = update(stored);
    active--;
    return stored;
  }, next => { shown = next; }, saved => saves.push(saved));
  const first = draft.update(patch('procrastination', { cue: 'After tea' }));
  const second = draft.update(patch('procrastination', { action: 'Write one word' }));
  const third = draft.update(patch('procrastination', { action: 'Write one sentence' }));
  assert.equal(getCourseExperiment(shown.experiments, 'procrastination').action, 'Write one sentence');
  assert.deepEqual(await Promise.all([first, second, third]), [true, true, true]);
  assert.equal(peak, 1);
  assert.equal(stored.experiments?.procrastination.cue, 'After tea');
  assert.equal(stored.experiments?.procrastination.action, 'Write one sentence');
  assert.deepEqual(shown, stored);
  assert.ok(saves.every(Boolean));
});

test('failed drafts survive later edits and a retry rebases them over unrelated saved work', async () => {
  let stored = EMPTY_PROGRESS;
  let shown = stored;
  let available = false;
  const status: boolean[] = [];
  const draft = createCourseProgressDraft(stored, async update => {
    if (!available) return null;
    stored = update(stored); return stored;
  }, next => { shown = next; }, saved => status.push(saved));
  assert.equal(await draft.update(patch('procrastination', { cue: 'After tea', action: 'Open my notes' })), false);
  assert.equal(await draft.update(patch('procrastination', { fallback: 'Find one question' })), false);
  stored = patch('focus', { cue: 'At my desk', action: 'Move my phone' })(stored);
  draft.receive(stored);
  assert.equal(shown.experiments?.procrastination.action, 'Open my notes');
  assert.equal(shown.experiments?.focus.action, 'Move my phone');
  available = true;
  assert.equal(await draft.retry(), true);
  assert.equal(stored.experiments?.procrastination.cue, 'After tea');
  assert.equal(stored.experiments?.procrastination.fallback, 'Find one question');
  assert.equal(stored.experiments?.focus.action, 'Move my phone');
  assert.deepEqual(shown, stored);
  assert.deepEqual(status, [false, false, true]);
});

test('same-tab save notifications retain newer input while an earlier batch is committing', async () => {
  let stored = EMPTY_PROGRESS;
  let shown = stored;
  let release: (() => void) | undefined;
  let writes = 0;
  let draft: ReturnType<typeof createCourseProgressDraft>;
  draft = createCourseProgressDraft(stored, async update => {
    if (++writes === 1) await new Promise<void>(resolve => { release = resolve; });
    stored = update(stored);
    draft.receive(stored); // Equivalent to the persistence service's successful-write event.
    return stored;
  }, next => { shown = next; }, () => undefined);
  const first = draft.update(patch('procrastination', { action: 'First draft' }));
  const newer = draft.update(patch('procrastination', { action: 'Newer draft' }));
  stored = patch('procrastination', { evidence: 'Another tab saved this field' })(stored);
  draft.receive(stored);
  assert.equal(shown.experiments?.procrastination.action, 'Newer draft');
  assert.equal(shown.experiments?.procrastination.evidence, 'Another tab saved this field');
  release!();
  assert.deepEqual(await Promise.all([first, newer]), [true, true]);
  assert.equal(stored.experiments?.procrastination.action, 'Newer draft');
  assert.equal(stored.experiments?.procrastination.evidence, 'Another tab saved this field');
  assert.deepEqual(shown, stored);
});

test('unexpected persistence exceptions preserve private work and allow a later successful save', async () => {
  let throwOnce = true;
  let stored = EMPTY_PROGRESS;
  const draft = createCourseProgressDraft(stored, async update => {
    if (throwOnce) { throwOnce = false; throw new Error('temporary storage error'); }
    stored = update(stored); return stored;
  }, () => undefined, () => undefined);
  assert.equal(await draft.update(patch('confidence', { action: 'Ask one prepared question' })), false);
  assert.equal(draft.read().experiments?.confidence.action, 'Ask one prepared question');
  assert.equal(await draft.retry(), true);
  assert.equal(stored.experiments?.confidence.action, 'Ask one prepared question');
});

test('retry clicked while a failed write is settling starts a fresh persistence attempt', async () => {
  let release: (() => void) | undefined;
  let writes = 0;
  let stored = EMPTY_PROGRESS;
  const draft = createCourseProgressDraft(stored, async update => {
    if (++writes === 1) {
      await new Promise<void>(resolve => { release = resolve; });
      return null;
    }
    stored = update(stored); return stored;
  }, () => undefined, () => undefined);
  const first = draft.update(patch('confidence', { action: 'Ask one question' }));
  const retry = draft.retry();
  release!();
  assert.equal(await first, false);
  assert.equal(await retry, true);
  assert.equal(writes, 2);
  assert.equal(stored.experiments?.confidence.action, 'Ask one question');
});
