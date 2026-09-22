import assert from 'node:assert/strict';
import test from 'node:test';
import { isAllowedPushEndpoint, matchesSecret, payloadForNudge, scheduledQuoteIndex, type DueNudge, type PushQuote } from './core.ts';

const quotes: PushQuote[] = Array.from({ length: 600 }, (_, i) => ({ id: `q-${i}`, text: `Take step ${i}`, tr: `Adım ${i}`, source: 'A verified work', sourceTr: 'Doğrulanmış eser', kind: i % 2 ? 'translation' : 'adaptation' }));
const nudge: DueNudge = {
  subscription_id: 'example', endpoint: 'https://fcm.googleapis.com/fcm/send/example',
  p256dh: '', auth: '', locale: 'tr', local_date: '2026-09-22', slot: 'morning', slot_index: 0, due_at: '2026-09-22T06:00:00Z',
};

test('600 scheduled selections are unique across 100 local calendar days and repeat only in the next cycle', () => {
  const selected = [];
  for (let day = 0; day < 100; day += 1) {
    const date = new Date(Date.UTC(2026, 2, 20 + day)).toISOString().slice(0, 10);
    const six = Array.from({ length: 6 }, (_, slot) => scheduledQuoteIndex(date, slot, 600));
    assert.equal(new Set(six).size, 6);
    selected.push(...six);
  }
  assert.equal(new Set(selected).size, 600);
  const nextCycle = new Date(Date.UTC(2026, 2, 120)).toISOString().slice(0, 10);
  for (let slot = 0; slot < 6; slot++) {
    assert.equal(scheduledQuoteIndex(nextCycle, slot, 600), selected[slot]);
  }
});

test('calendar-day index is independent of server timezone, DST boundaries and midnight UTC', () => {
  for (const date of ['2026-03-29', '2026-10-25', '2028-02-29', '2026-12-31']) {
    const expected = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000) * 6;
    assert.equal(scheduledQuoteIndex(date, 5, 600), ((expected + 5) % 600 + 600) % 600);
  }
  assert.throws(() => scheduledQuoteIndex('2026-02-30', 0, 600));
  assert.throws(() => scheduledQuoteIndex('2026-09-22', 6, 600));
});

test('sender blocks private-network endpoints, embedded credentials, lookalike hosts and unexpected ports', () => {
  for (const url of [
    'http://fcm.googleapis.com/send', 'https://127.0.0.1/push', 'https://localhost/push',
    'https://fcm.googleapis.com.evil.example/push', 'https://fcm.googleapis.com@evil.example/push',
    'https://user:password@fcm.googleapis.com/push', 'https://fcm.googleapis.com:8443/push',
    'https://evil.example/redirect?to=https://web.push.apple.com', 'https://web.push.apple.com/#ignored',
  ]) assert.equal(isAllowedPushEndpoint(url), false, url);
  for (const url of ['https://fcm.googleapis.com/fcm/send/example', 'https://updates.push.services.mozilla.com/wpush/v2/example', 'https://web.push.apple.com/example', 'https://wns2-par02p.notify.windows.com/w/?token=example']) {
    assert.equal(isAllowedPushEndpoint(url), true, url);
  }
});

test('payload identifies adaptation/translation and routes stay valid for root and project hosting', () => {
  const project = payloadForNudge(nudge, quotes, 'https://example.github.io/one-decision-away/');
  assert.equal(project.url, 'https://example.github.io/one-decision-away/#/app');
  assert.equal(project.tag, 'oda-nudge-morning');
  assert.match(project.body, /Doğrulanmış eser · (çeviri|yorumlama)/);
  const root = payloadForNudge({ ...nudge, locale: 'en' }, quotes, 'https://example.com/');
  assert.equal(root.url, 'https://example.com/app');
  assert.match(root.body, /A verified work · (translation|adaptation)/);
  assert.throws(() => payloadForNudge(nudge, [], 'https://example.com/'));
  assert.throws(() => payloadForNudge(nudge, quotes.slice(0, 300), 'https://example.com/'), /600-quote server snapshot/);
  assert.throws(() => payloadForNudge(nudge, [...quotes.slice(1), quotes[1]], 'https://example.com/'), /600-quote server snapshot/);
  assert.throws(() => payloadForNudge(nudge, quotes, 'http://example.com/'));
  assert.throws(() => payloadForNudge(nudge, quotes.map(quote => ({ ...quote, tr: 'a'.repeat(4000) })), 'https://example.com/'));
});

test('cron authenticator requires a substantial matching secret', async () => {
  const secret = 'a'.repeat(64);
  assert.equal(await matchesSecret(secret, secret), true);
  assert.equal(await matchesSecret(`${secret.slice(0, -1)}b`, secret), false);
  assert.equal(await matchesSecret('', secret), false);
  assert.equal(await matchesSecret('short', 'short'), false);
});
