import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PRIVACY, TERMS, LEGAL_COMPANY } from '../src/data/legal';
import { renderLegalPage } from '../scripts/build-legal';

test('static legal pages match src/data/legal.ts (run npx tsx scripts/build-legal.ts)', () => {
  assert.equal(readFileSync('public/legal/privacy.html', 'utf8'), renderLegalPage('privacy'));
  assert.equal(readFileSync('public/legal/terms.html', 'utf8'), renderLegalPage('terms'));
});

test('every language has the same sections and names the company', () => {
  for (const docs of [PRIVACY, TERMS]) {
    const n = docs.en.sections.length;
    for (const lang of ['tr', 'en', 'es'] as const) {
      assert.equal(docs[lang].sections.length, n, lang);
      assert.ok(docs[lang].intro.includes(LEGAL_COMPANY), lang);
    }
  }
});

test('privacy policy covers what App Review checks', () => {
  const text = JSON.stringify(PRIVACY.en).toLowerCase();
  for (const phrase of ['delete my account', 'revenuecat', 'supabase', 'no tracking', 'children', 'openai', 'api data policy', 'does not store your messages']) assert.ok(text.includes(phrase), phrase);
  const terms = JSON.stringify(TERMS.en).toLowerCase();
  for (const phrase of ['renew automatically', '24 hours', 'no monetary value', 'not a substitute for treatment']) assert.ok(terms.includes(phrase), phrase);
});
