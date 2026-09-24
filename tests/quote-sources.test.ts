import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { THINKER_QUOTES } from '../src/data/quoteExpansionThinkers';

const dir = new URL('../docs/quote-sources/', import.meta.url);
const ebookOf = (url: string) => url.match(/(?:epub|files)\/(\d+)\//)?.[1];

test('every thinker passage links to a Gutenberg book whose text is kept in docs/quote-sources', () => {
  const kept = new Map<string, string>();
  for (const file of readdirSync(dir).filter(name => name.endsWith('.txt'))) {
    const text = readFileSync(new URL(file, dir), 'utf8');
    const id = text.match(/eBook #(\d+)/)?.[1];
    assert.ok(id, `${file} has no Gutenberg eBook number`);
    assert.match(text, /\*\*\* START OF/, `${file} is missing the Gutenberg header`);
    assert.match(text, /\*\*\* END OF/, `${file} is missing the Gutenberg footer`);
    kept.set(id, file);
  }
  const used = new Set(THINKER_QUOTES.map(quote => ebookOf(quote.sourceUrl)));
  for (const id of used) assert.ok(id && kept.has(id), `No source text kept for eBook #${id}`);
  assert.deepEqual([...kept.keys()].sort(), [...used].sort());
  for (const quote of THINKER_QUOTES) assert.ok(quote.reference?.trim(), `${quote.id} needs a chapter reference`);
});
