import assert from 'node:assert/strict';
import test from 'node:test';
import { sentenceCaseLabel } from '../src/utils/sentenceCaseLabel';
import { notebookHybridCopy } from '../src/i18n/notebookHybrid';

test('interface sentence case changes only the first letter after whitespace and punctuation', () => {
  assert.equal(sentenceCaseLabel('  “read two pages with NASA and AI”', 'en'), '  “Read two pages with NASA and AI”');
  assert.equal(sentenceCaseLabel('\t¿leer dos páginas?\n', 'es'), '\t¿Leer dos páginas?\n');
  assert.equal(sentenceCaseLabel('then I will read two pages', 'en'), 'Then I will read two pages');
});
test('Turkish sentence case handles dotted and dotless I without changing the remaining text', () => {
  assert.equal(sentenceCaseLabel('“iki sayfa oku”', 'tr'), '“İki sayfa oku”');
  assert.equal(sentenceCaseLabel('  ıslık çal', 'tr'), '  Islık çal');
  assert.equal(sentenceCaseLabel('İki sayfa oku', 'tr'), 'İki sayfa oku');
});
test('sentence labels preserve acronyms, mixed-case names, numeric starts and empty input', () => {
  for (const value of ['NASA and AI', 'iPhone settings', 'eBay listing', '2 pages with AI', '', ' \n…', '🙂']) {
    assert.equal(sentenceCaseLabel(value, 'en'), value);
  }
});
test('interface plan formatting leaves its user-authored payload and source unchanged', () => {
  const plan = '  read NASA notes, then iPhone settings';
  const text = `then I will ${plan}`;
  assert.equal(sentenceCaseLabel(text, 'en'), `Then I will ${plan}`);
  assert.equal(text, `then I will ${plan}`);
  assert.equal(plan, '  read NASA notes, then iPhone settings');
});
test('Notebook English writing counts use singular only for one', () => {
  assert.deepEqual([0, 1, 2].map(notebookHybridCopy('en').writingDays), ['0 days written', '1 day written', '2 days written']);
});
test('Notebook Spanish writing counts and streaks agree with singular and plural days', () => {
  const copy = notebookHybridCopy('es');
  assert.deepEqual([0, 1, 2].map(copy.writingDays), ['0 días escritos', '1 día escrito', '2 días escritos']);
  assert.deepEqual([0, 1, 2].map(copy.streak), ['Racha de 0 días', 'Racha de 1 día', 'Racha de 2 días']);
});
test('Notebook Turkish count forms remain unchanged for zero, one and multiple days', () => {
  const copy = notebookHybridCopy('tr');
  assert.deepEqual([0, 1, 2].map(copy.writingDays), ['0 gün yazıldı', '1 gün yazıldı', '2 gün yazıldı']);
  assert.deepEqual([0, 1, 2].map(copy.streak), ['0 günlük seri', '1 günlük seri', '2 günlük seri']);
});
