import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CRISIS_REPLIES, TIER_LIMITS, buildSystemPrompt, isCacheFresh, isCrisisText, parseRequest, tierFromSubscriber,
} from '../supabase/functions/coach-chat/logic';
import { readFileSync } from 'node:fs';

test('levels and monthly limits match the plan', () => {
  assert.deepEqual(TIER_LIMITS, { free: 30, essentials: 150, pro: 600, coach: 3000 });
});

test('the highest active RevenueCat entitlement wins; expired ones do not count', () => {
  const now = Date.parse('2026-09-29T12:00:00Z');
  const sub = (entitlements: Record<string, unknown>) => ({ subscriber: { entitlements } });
  assert.equal(tierFromSubscriber(sub({}), now), 'free');
  assert.equal(tierFromSubscriber(null, now), 'free');
  assert.equal(tierFromSubscriber(sub({ pro: { expires_date: '2026-10-29T00:00:00Z' } }), now), 'pro');
  assert.equal(tierFromSubscriber(sub({ essentials: { expires_date: '2026-10-01T00:00:00Z' }, pro: { expires_date: '2026-10-29T00:00:00Z' }, coach: { expires_date: '2026-09-01T00:00:00Z' } }), now), 'pro');
  assert.equal(tierFromSubscriber(sub({ coach: { expires_date: null } }), now), 'coach');
  assert.equal(tierFromSubscriber(sub({ coach: { expires_date: '2026-09-28T00:00:00Z', grace_period_expires_date: '2026-10-02T00:00:00Z' } }), now), 'coach');
  assert.equal(tierFromSubscriber(sub({ gold: { expires_date: null } }), now), 'free');
});

test('the tier cache is fresh for ten minutes', () => {
  const now = Date.parse('2026-09-29T12:00:00Z');
  assert.equal(isCacheFresh('2026-09-29T11:52:00Z', now), true);
  assert.equal(isCacheFresh('2026-09-29T11:49:00Z', now), false);
  assert.equal(isCacheFresh(null, now), false);
  assert.equal(isCacheFresh('garbage', now), false);
});

test('requests are validated, trimmed and may be empty for a status check', () => {
  assert.equal(parseRequest(null).ok, false);
  assert.equal(parseRequest({ messages: 'x' }).ok, false);
  assert.equal(parseRequest({ messages: [{ role: 'system', content: 'x' }] }).ok, false);
  assert.equal(parseRequest({ messages: [{ role: 'assistant', content: 'x' }] }).ok, false);
  const status = parseRequest({ messages: [], locale: 'fr' });
  assert.ok(status.ok && status.messages.length === 0 && status.locale === 'en');
  const big = parseRequest({
    messages: Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: i === 28 ? 'x'.repeat(5000) : `m${i}` })).concat([{ role: 'user', content: 'last' }]),
    locale: 'es', context: { todayDecision: 'd'.repeat(999), recentKept: ['a', '', 'b'], journalSnippets: 'no' },
  });
  assert.ok(big.ok);
  if (big.ok) {
    assert.equal(big.messages.length, 12);
    assert.ok(big.messages.every(m => m.content.length <= 1500));
    assert.equal(big.locale, 'es');
    assert.equal(big.context.todayDecision?.length, 200);
    assert.deepEqual(big.context.recentKept, ['a', 'b']);
    assert.deepEqual(big.context.journalSnippets, []);
  }
});

test('crisis words in English, Turkish and Spanish are caught; everyday worry is not', () => {
  for (const text of [
    'I want to kill myself', 'thinking about suicide', 'i dont want to live anymore', 'he hits me when he drinks', 'I am in danger right now', 'I have been self-harming',
    'Kendimi öldürmek istiyorum', 'INTİHAR etmeyi düşünüyorum', 'yaşamak istemiyorum artık', 'kendime zarar veriyorum', 'kocam bana şiddet uyguluyor', 'tehlikedeyim',
    'quiero morirme', 'pienso en el suicidio', 'no quiero vivir más', 'me pega cuando bebe', 'estoy en peligro', 'me hago autolesiones',
  ]) assert.equal(isCrisisText(text), true, text);
  for (const text of [
    'I keep putting this off because it has to be perfect.', 'It suddenly hits me that I have not started', 'I will cut myself some slack today',
    'Bugün ödevime başlayamıyorum', 'Çok yoruldum ve erteliyorum', 'Hoy me cuesta empezar', 'voy a cortarme el pelo', 'my goals are in danger of slipping',
  ]) assert.equal(isCrisisText(text), false, text);
  for (const locale of ['en', 'tr', 'es'] as const) assert.match(CRISIS_REPLIES[locale], /112|911/);
  assert.match(CRISIS_REPLIES.tr, /112/);
  assert.match(CRISIS_REPLIES.en, /911/);
});

test('the prompt sets the persona, safety rules and reply language; context reaches only the coach level', () => {
  const ctx = { todayDecision: 'Write the first paragraph', recentKept: ['Walked ten minutes'], journalSnippets: ['I felt stuck'] };
  const free = buildSystemPrompt('tr', 'free', ctx);
  for (const needle of ['ODA coach', 'implementation intentions', 'WOOP', 'self-compassion', '2-minute', 'not a therapist', 'medical, legal or financial', '112 in Türkiye', '911 in the US', 'Turkish']) {
    assert.ok(free.includes(needle), needle);
  }
  for (const tier of ['free', 'essentials', 'pro'] as const) {
    const prompt = buildSystemPrompt('en', tier, ctx);
    assert.ok(!prompt.includes('Write the first paragraph') && !prompt.includes('I felt stuck'), tier);
  }
  const coach = buildSystemPrompt('es', 'coach', ctx);
  assert.ok(coach.includes('Write the first paragraph') && coach.includes('I felt stuck') && coach.includes('Spanish'));
  assert.ok(!buildSystemPrompt('en', 'coach', {}).includes('chose to share'));
});

test('the function keeps secrets and message text out of code and logs', () => {
  const source = readFileSync('supabase/functions/coach-chat/index.ts', 'utf8');
  assert.ok(!/sk-[A-Za-z0-9]{10,}/.test(source));
  assert.ok(source.includes("Deno.env.get('OPENAI_API_KEY')") && source.includes("Deno.env.get('REVENUECAT_SECRET_KEY')"));
  for (const line of source.split('\n').filter(l => /console\.(log|error|warn|info)/.test(l))) {
    assert.ok(!/content|messages|context|text|body|json/i.test(line.replace('coach-chat provider failure:', '')), line);
  }
  assert.ok(source.includes('ALLOWED_ORIGINS') && source.includes('auth.getUser(token)'));
});

test('no AI provider secret is referenced from the app bundle code', async () => {
  const { readdirSync, statSync } = await import('node:fs');
  const walk = (dir: string): string[] => readdirSync(dir).flatMap(n => { const p = `${dir}/${n}`; return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|jsx?)$/.test(n) ? [p] : []; });
  for (const p of walk('src')) {
    const s = readFileSync(p, 'utf8');
    assert.ok(!/OPENAI_API_KEY|REVENUECAT_SECRET_KEY|VITE_OPENAI|api\.openai\.com/.test(s), p);
  }
});
