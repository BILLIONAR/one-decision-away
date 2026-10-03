import assert from 'node:assert/strict';
import { test } from 'node:test';
import { QUOTE_COLLECTION } from '../src/data/quoteCollection';
import { filterSourcedQuotes, notebookWeekDates, quoteSourceHref, shiftNotebookWeek } from '../src/services/notebookHybrid';

test('archive weeks cross month/year and leap-day boundaries without changing stored entries', () => {
  assert.deepEqual(notebookWeekDates('2026-10-03'), ['2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
  assert.deepEqual(notebookWeekDates('2028-02-29'), ['2028-02-28', '2028-02-29', '2028-03-01', '2028-03-02', '2028-03-03', '2028-03-04', '2028-03-05']);
  assert.equal(shiftNotebookWeek('2026-01-01', -1), '2025-12-25');
  assert.equal(shiftNotebookWeek(shiftNotebookWeek('2026-10-03', -1), 1), '2026-10-03');
  assert.throws(() => notebookWeekDates('2026-02-30'), RangeError);
  assert.throws(() => notebookWeekDates('not-a-date'), RangeError);
  assert.throws(() => shiftNotebookWeek('2026-10-03', .5), RangeError);
});

test('all sourced passages remain reachable through their actual categories', () => {
  assert.equal(QUOTE_COLLECTION.length, 600);
  const actual = new Set<string>();
  const before = JSON.stringify(QUOTE_COLLECTION);
  for (const category of ['faith', 'society', 'science', 'philosophy'] as const) {
    const matches = filterSourcedQuotes(QUOTE_COLLECTION, category, '', 'en');
    assert.ok(matches.length > 0);
    assert.ok(matches.every(quote => quote.category === category));
    for (const quote of matches) actual.add(quote.id);
  }
  assert.equal(actual.size, 600);
  assert.deepEqual(filterSourcedQuotes(QUOTE_COLLECTION, 'all', '', 'es'), QUOTE_COLLECTION);
  assert.equal(JSON.stringify(QUOTE_COLLECTION), before);
});

test('search finds real English/Turkish text, sources and references and combines with category', () => {
  const sample = QUOTE_COLLECTION.find(quote => quote.reference && quote.tags?.length)!;
  assert.ok(filterSourcedQuotes(QUOTE_COLLECTION, sample.category, sample.text, 'en').includes(sample));
  assert.ok(filterSourcedQuotes(QUOTE_COLLECTION, sample.category, sample.tr.toLocaleUpperCase('tr'), 'tr').includes(sample));
  assert.ok(filterSourcedQuotes(QUOTE_COLLECTION, 'all', sample.source, 'es').includes(sample));
  assert.ok(filterSourcedQuotes(QUOTE_COLLECTION, 'all', sample.reference!, 'en').includes(sample));
  assert.equal(filterSourcedQuotes(QUOTE_COLLECTION, 'all', 'this-query-does-not-exist-oda-739452', 'en').length, 0);
});

test('catalogue sources use allowed web protocols and cannot execute app/script URLs', () => {
  for (const quote of QUOTE_COLLECTION) assert.ok(quoteSourceHref(quote.sourceUrl), quote.id);
  for (const href of ['javascript:alert(1)', 'data:text/html,hello', 'file:///private', '/app/notebook', 'invalid']) assert.equal(quoteSourceHref(href), undefined);
  assert.equal(quoteSourceHref('https://example.org/source'), 'https://example.org/source');
});
