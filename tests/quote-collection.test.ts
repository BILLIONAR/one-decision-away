import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { QUOTE_COLLECTION, getScheduledQuote, localCalendarDay } from '../src/data/quoteCollection';
import { DAILY_QUOTES, getDailyQuote } from '../src/data/dailyQuotes';
import { FAITH_QUOTES } from '../src/data/quoteExpansionFaith';
import { THINKER_QUOTES } from '../src/data/quoteExpansionThinkers';
import { FAITH_QUOTES_MORE } from '../src/data/quoteExpansionFaithMore';
import { SCIENCE_QUOTES_MORE } from '../src/data/quoteExpansionScienceMore';
import { PHILOSOPHY_QUOTES_MORE } from '../src/data/quoteExpansionPhilosophyMore';
import { NUDGE_SLOTS, getNudgeLine, normaliseNudgeTimes, isNudgeTime } from '../src/data/dailyNudges';
import { scheduledQuoteIndex } from '../supabase/functions/send-nudges/core';
import trDictionary from '../src/i18n/locales/tr';
import { setLocale } from '../src/i18n';
const normalise = (text: string) => text.toLocaleLowerCase('tr').normalize('NFKD').replace(/[^\p{L}\p{N}]/gu, '');

test('preserves the first 300 passages and appends exactly 100 each from faith, science and philosophy in order', () => {
  assert.equal(FAITH_QUOTES.length, 150);
  assert.equal(THINKER_QUOTES.length, 150);
  for (let index = 0; index < 150; index++) {
    assert.deepEqual(QUOTE_COLLECTION[index * 2], FAITH_QUOTES[index]);
    assert.deepEqual(QUOTE_COLLECTION[index * 2 + 1], THINKER_QUOTES[index]);
  }
  for (const collection of [FAITH_QUOTES_MORE, SCIENCE_QUOTES_MORE, PHILOSOPHY_QUOTES_MORE]) {
    assert.equal(collection.length, 100);
  }
  for (let index = 0; index < 100; index++) {
    assert.deepEqual(QUOTE_COLLECTION.slice(300 + index * 3, 303 + index * 3), [
      FAITH_QUOTES_MORE[index], SCIENCE_QUOTES_MORE[index], PHILOSOPHY_QUOTES_MORE[index],
    ]);
  }
  assert.equal(QUOTE_COLLECTION.slice(300).length, 300);
  assert.equal(DAILY_QUOTES.length, 1018);
  assert.deepEqual(DAILY_QUOTES.slice(418), QUOTE_COLLECTION);
});

test('all 600 sourced passages have unique IDs and bilingual text without recycling legacy lines', () => {
  assert.equal(QUOTE_COLLECTION.length, 600);
  assert.equal(new Set(QUOTE_COLLECTION.map(q => q.id)).size, 600);
  const old = DAILY_QUOTES.slice(0, 418);
  const oldLines = new Set(old.flatMap(q => [q.text, trDictionary[q.text] || q.text]).map(normalise));
  for (const field of ['text', 'tr'] as const) {
    assert.equal(new Set(QUOTE_COLLECTION.map(q => normalise(q[field]))).size, 600);
    for (const q of QUOTE_COLLECTION) assert(!oldLines.has(normalise(q[field])), `Reused ${field}: ${q[field]}`);
  }
  assert.equal(new Set(QUOTE_COLLECTION.flatMap(q => [q.text, q.tr]).map(normalise)).size, 1200);
  for (const q of QUOTE_COLLECTION) {
    assert(q.source && q.sourceTr && q.reference && q.text && q.tr, q.id);
    assert.equal(new URL(q.sourceUrl).protocol, 'https:');
    assert(['translation', 'adaptation'].includes(q.kind));
  }
  assert(QUOTE_COLLECTION.filter(q => q.tags?.some(tag => /fear|courage/.test(tag))).length >= 50);
  assert.deepEqual(new Set(QUOTE_COLLECTION.map(q => q.category)), new Set(['faith', 'philosophy', 'science', 'society']));
});

test('six notifications stay distinct for 100 full days, then repeat, and match the server snapshot across a year boundary', () => {
  const seen = new Set<string>();
  const server = JSON.parse(readFileSync(new URL('../supabase/functions/send-nudges/quotes.json', import.meta.url), 'utf8'));
  assert.equal(server.length, 600);
  for (let d = 0; d < 100; d++) {
    const date = new Date(2026, 11, 15 + d, 10);
    const dayString = new Date(localCalendarDay(date) * 86400000).toISOString().slice(0, 10);
    for (let slot = 0; slot < 6; slot++) {
      const quote = getScheduledQuote(slot, date);
      assert(!seen.has(quote.id)); seen.add(quote.id);
      assert.equal(server[scheduledQuoteIndex(dayString, slot, 600)].id, quote.id);
      const { id, text, tr, source, sourceTr, kind } = quote;
      assert.deepEqual(server[scheduledQuoteIndex(dayString, slot, 600)], { id, text, tr, source, sourceTr, kind });
    }
  }
  assert.equal(seen.size, 600);
  for (let slot = 0; slot < 6; slot++) {
    assert.deepEqual(getScheduledQuote(slot, new Date(2026, 11, 115, 10)), getScheduledQuote(slot, new Date(2026, 11, 15, 10)));
  }
});

test('local day remains stable from morning to evening; six-time migration preserves existing preferences', () => {
  const morning = new Date(2026, 8, 22, 0, 1), evening = new Date(2026, 8, 22, 23, 59);
  assert.equal(localCalendarDay(morning), localCalendarDay(evening));
  assert.equal(getDailyQuote(morning), getDailyQuote(evening));
  const times = normaliseNudgeTimes({ morning: '07:15', midday: '12:15', evening: '19:45' });
  assert.equal(Object.keys(times).length, 6);
  assert.equal(times.morning, '07:15'); assert.equal(times.evening, '19:45');
  assert.equal(isNudgeTime('25:00'), false); assert.equal(isNudgeTime('09:72'), false);
  assert.equal(normaliseNudgeTimes({ morning: 'bad' }).morning, '08:00');
  setLocale('tr');
  const lines = NUDGE_SLOTS.map(slot => getNudgeLine(slot, morning));
  assert.equal(new Set(lines).size, 6);
  assert(lines.every(line => /—.+\((uyarlama|çeviri)\)$/.test(line)));
});

test('legacy three-reminder profiles keep their evening time and gain six distinct reminders', () => {
  const legacy = { morning: '08:00', midday: '13:00', evening: '20:30' };
  const times = normaliseNudgeTimes(legacy);
  assert.equal(times.morning, legacy.morning);
  assert.equal(times.midday, legacy.midday);
  assert.equal(times.evening, legacy.evening);
  assert.equal(times.night, '21:30');
  assert.equal(new Set(Object.values(times)).size, 6);
  assert.deepEqual(normaliseNudgeTimes(times), times);
});

test('migration resolves default collisions only in missing slots and reserves later saved slots first', () => {
  const profiles = [
    { morning: '10:30', midday: '15:30', evening: '21:30' },
    { morning: '10:30', midday: '11:00', evening: '11:30' },
    { midday: '08:00', evening: '15:30', night: '10:30' },
  ];
  for (const saved of profiles) {
    const times = normaliseNudgeTimes(saved);
    assert.equal(Object.keys(times).length, 6);
    assert.equal(new Set(Object.values(times)).size, 6);
    assert(Object.values(times).every(isNudgeTime));
    for (const [slot, value] of Object.entries(saved)) {
      assert.equal(times[slot as keyof typeof times], value, `Moved saved ${slot}: ${value}`);
    }
    assert.deepEqual(normaliseNudgeTimes(times), times);
  }
});
