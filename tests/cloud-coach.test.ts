import assert from 'node:assert/strict';
import test from 'node:test';
import { CLOUD_MAX_MESSAGES, CLOUD_MAX_MESSAGE_CHARS, CloudCoachError, buildCoachContext, buildRequestBody, interpretResponse } from '../src/services/cloudCoach';
import { MAX_MESSAGES, MAX_MESSAGE_CHARS } from '../supabase/functions/coach-chat/logic';
import type { UserData } from '../src/types/models';

test('client and server agree on the message limits', () => {
  assert.equal(CLOUD_MAX_MESSAGES, MAX_MESSAGES);
  assert.equal(CLOUD_MAX_MESSAGE_CHARS, MAX_MESSAGE_CHARS);
});

test('the request keeps the last 12 messages, trims each to 1500 characters and drops empty ones', () => {
  const many = Array.from({ length: 20 }, (_, i) => ({ role: (i % 2 ? 'assistant' : 'user') as 'user' | 'assistant', content: `m${i}` }));
  const body = buildRequestBody([...many, { role: 'user', content: '   ' }], 'tr');
  assert.equal(body.messages.length, 12);
  assert.equal(body.messages[body.messages.length - 1].content, 'm19');
  assert.equal(body.locale, 'tr');
  assert.equal(buildRequestBody([{ role: 'user', content: 'x'.repeat(4000) }], 'es').messages[0].content.length, 1500);
  assert.equal(buildRequestBody([{ role: 'user', content: 'hi' }], 'de').locale, 'en');
});

test('context is sent only when there is something to send, and is trimmed', () => {
  assert.equal('context' in buildRequestBody([{ role: 'user', content: 'hi' }], 'en'), false);
  assert.equal('context' in buildRequestBody([{ role: 'user', content: 'hi' }], 'en', {}), false);
  const body = buildRequestBody([{ role: 'user', content: 'hi' }], 'en', {
    todayDecision: 'Call the bank', recentKept: Array.from({ length: 9 }, (_, i) => `k${i}`), journalSnippets: ['a'.repeat(900)],
  });
  assert.equal(body.context?.recentKept?.length, 5);
  assert.equal(body.context?.journalSnippets?.[0].length, 300);
});

test('responses map to a result or a typed error', () => {
  assert.deepEqual(interpretResponse(200, { reply: 'Hi', remaining: 29, limit: 30, tier: 'free' }), { reply: 'Hi', remaining: 29, limit: 30, tier: 'free', crisis: false });
  assert.equal(interpretResponse(200, { remaining: 30, limit: 30, tier: 'free' }).reply, undefined);
  const kind = (status: number, body: unknown = {}) => { try { interpretResponse(status, body); } catch (e) { return (e as CloudCoachError).kind; } return 'none'; };
  assert.equal(kind(401), 'not-signed-in');
  assert.equal(kind(429, { remaining: 0, limit: 150, tier: 'essentials' }), 'quota');
  assert.equal(kind(404), 'unavailable');
  assert.equal(kind(503), 'unavailable');
  assert.equal(kind(502), 'server');
  assert.equal(kind(500), 'server');
  assert.equal(kind(200, { nonsense: true }), 'server');
  try { interpretResponse(429, { limit: 150, tier: 'essentials' }); } catch (e) { assert.deepEqual((e as CloudCoachError).info, { limit: 150, tier: 'essentials' }); }
});

test('the shared context holds only today, the last kept decisions and short journal lines', () => {
  const today = new Date().toISOString().slice(0, 10);
  const mission = (id: string, title: string, over: object) => ({ id, title, isOneDecision: true, status: 'completed', ...over });
  const data = {
    missions: [
      mission('a', 'Today one', { status: 'active', scheduledFor: today }),
      ...Array.from({ length: 7 }, (_, i) => mission(`k${i}`, `Kept ${i}`, { completedAt: `2026-09-0${i + 1}T10:00:00Z` })),
      { id: 'x', title: 'Not a decision', isOneDecision: false, status: 'completed', completedAt: '2026-09-09T10:00:00Z' },
    ],
    notebook: { entries: [
      { id: '1', kind: 'journal', content: 'Older line', createdAt: '2026-09-01T00:00:00Z' },
      { id: '2', kind: 'scripting', content: 'Not journal', createdAt: '2026-09-05T00:00:00Z' },
      { id: '3', kind: 'journal', content: `Newest   line ${'z'.repeat(400)}`, createdAt: '2026-09-04T00:00:00Z' },
    ] },
  } as unknown as UserData;
  const ctx = buildCoachContext(data);
  assert.equal(ctx.todayDecision, 'Today one');
  assert.deepEqual(ctx.recentKept, ['Kept 6', 'Kept 5', 'Kept 4', 'Kept 3', 'Kept 2']);
  assert.equal(ctx.journalSnippets?.length, 2);
  assert.ok(ctx.journalSnippets![0].startsWith('Newest line z') && ctx.journalSnippets![0].length === 300);
  assert.deepEqual(buildCoachContext(null), {});
});
