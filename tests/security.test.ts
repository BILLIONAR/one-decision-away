// Guards for the web security baseline (see docs/SECURITY.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const html = readFileSync('index.html', 'utf8');

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) files(p, out); else if (/\.(tsx?|jsx?)$/.test(name)) out.push(p);
  }
  return out;
}
const src = files('src').map(p => [p, readFileSync(p, 'utf8')] as const);

test('a strict Content Security Policy ships with the page', () => {
  const m = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/);
  assert.ok(m, 'CSP meta tag present');
  const csp = m![1];
  for (const d of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) assert.ok(csp.includes(d), d);
  const script = csp.split(';').find(d => d.trim().startsWith('script-src'))!;
  assert.ok(!script.includes("'unsafe-inline'") && !script.includes("'unsafe-eval'") && !script.includes('*'), 'no inline/eval/wildcard scripts');
});

test('index.html has no inline scripts (the CSP forbids them)', () => {
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].filter(m => m[1].trim());
  assert.equal(inline.length, 0);
});

test('no raw HTML or eval sinks in the app code', () => {
  for (const [p, s] of src) {
    assert.ok(!/dangerouslySetInnerHTML|\.innerHTML\s*=|\beval\(|new Function\(/.test(s), p);
  }
});

test('links that open a new tab cannot reach back into ODA', () => {
  for (const [p, s] of src) {
    for (const m of s.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.ok(/rel="[^"]*noopener/.test(m[0]), `${p}: ${m[0].slice(0, 80)}`);
  }
});

test('no secret keys in the shipped code', () => {
  for (const [p, s] of src) {
    assert.ok(!/service_role|sk_live_|sk_test_|-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(s.replace(/\/\/.*$/gm, '')), p);
  }
});

test('production builds carry no source maps', () => {
  const cfg = readFileSync('vite.config.ts', 'utf8');
  assert.ok(!/sourcemap:\s*true/.test(cfg));
});
