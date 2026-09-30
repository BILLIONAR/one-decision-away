import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeOnboardingDraft } from '../src/services/onboardingDraft';

test('interrupted setup restores fields without allowing a nameless final step', () => {
  const draft = { version: 1, step: 4, name: 'Maya', intent: 'focus', dreamId: 'explore-grow-book', decision: 'Open my outline' };
  assert.deepEqual(normalizeOnboardingDraft(draft), { step: 4, name: 'Maya', intent: 'focus', dreamId: 'explore-grow-book', decision: 'Open my outline' });
  assert.equal(normalizeOnboardingDraft({ ...draft, name: '' })?.step, 1);
});
test('unknown, malformed and oversized setup drafts are safely bounded', () => {
  for (const value of [null, [], 'text', { version: 2 }]) assert.equal(normalizeOnboardingDraft(value), null);
  const draft = normalizeOnboardingDraft({ version: 1, step: 90, name: 'a'.repeat(100), decision: 'b'.repeat(900), intent: 'unknown' });
  assert.equal(draft?.step, 0);
  assert.equal(draft?.name.length, 80);
  assert.equal(draft?.decision.length, 500);
  assert.equal(draft?.intent, null);
});
