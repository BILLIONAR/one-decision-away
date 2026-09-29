#!/usr/bin/env node
/**
 * Validates store/ (App Store metadata) against App Store Connect limits.
 *   node scripts/check-store-metadata.mjs            # errors fail (exit 1), TODOs only warn
 *   node scripts/check-store-metadata.mjs --strict   # TODO placeholders fail too (use before upload)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'store');
const strict = process.argv.includes('--strict');
const LOCALES = ['en-US', 'tr', 'es-ES', 'es-MX'];
const REQUIRED = ['name', 'subtitle', 'keywords', 'promotional_text', 'description', 'release_notes', 'privacy_url', 'marketing_url', 'support_url'];
// Store limits: [unit, max]. Keywords are limited in UTF-8 bytes, everything else in characters.
const LIMITS = { name: ['chars', 30], subtitle: ['chars', 30], keywords: ['bytes', 100], promotional_text: ['chars', 170], description: ['chars', 4000], release_notes: ['chars', 4000] };
// Brand/competitor names that must not appear in keywords or names (extend as needed).
const BLOCKED = ['headspace', 'calm', 'noom', 'fabulous', 'habitica', 'streaks', 'finch', 'insight timer', 'bearable', 'todoist', 'notion', 'apple', 'iphone', 'ios', 'android', 'google'];

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const len = (s, unit) => (unit === 'bytes' ? Buffer.byteLength(s, 'utf8') : [...s].length);
const read = (loc, k) => {
  const f = path.join(root, 'metadata', loc, `${k}.txt`);
  if (!fs.existsSync(f)) { err(`${loc}/${k}.txt: missing`); return null; }
  return fs.readFileSync(f, 'utf8').replace(/\r?\n$/, '');
};

for (const loc of LOCALES) {
  const v = {};
  for (const k of REQUIRED) v[k] = read(loc, k);
  for (const [k, [unit, max]] of Object.entries(LIMITS)) {
    if (v[k] == null) continue;
    const n = len(v[k], unit);
    if (v[k].trim() === '') err(`${loc}/${k}: empty`);
    if (n > max) err(`${loc}/${k}: ${n} ${unit} > ${max}`);
  }
  if (v.keywords != null) {
    if (/,\s|\s,/.test(v.keywords)) err(`${loc}/keywords: spaces around commas waste bytes`);
    if (v.keywords.startsWith(',') || v.keywords.endsWith(',') || /,,/.test(v.keywords)) err(`${loc}/keywords: empty term`);
    const terms = v.keywords.split(',').map((t) => t.toLowerCase());
    if (new Set(terms).size !== terms.length) err(`${loc}/keywords: duplicate term`);
    for (const t of terms) if (BLOCKED.includes(t) || BLOCKED.some((b) => b.includes(' ') && t.includes(b))) err(`${loc}/keywords: blocked brand/competitor term "${t}"`);
    const own = `${v.name ?? ''} ${v.subtitle ?? ''}`.toLowerCase();
    for (const t of terms) if (own.split(/[^\p{L}]+/u).includes(t)) warnings.push(`${loc}/keywords: "${t}" already in name/subtitle (wasted bytes)`);
  }
  for (const k of ['privacy_url', 'marketing_url']) {
    if (v[k] != null && !/^https:\/\/\S+$/.test(v[k])) err(`${loc}/${k}: must be an https URL`);
  }
  if (v.support_url != null) {
    if (/\bTODO\b/.test(v.support_url) || !/^https:\/\/\S+$/.test(v.support_url)) (strict ? err : (m) => warnings.push(m))(`${loc}/support_url: still a TODO placeholder`);
  }
  for (const k of ['description', 'promotional_text', 'release_notes']) {
    if (v[k] && (/\bTODO\b/.test(v[k]) || /lorem ipsum/i.test(v[k]))) err(`${loc}/${k}: contains a placeholder marker`);
  }
  if (v.description && /\b(cure|treat(s|ment of)|therapy|diagnos)/i.test(v.description) && !/not a substitute|sustituye|yerine geçmez/i.test(v.description)) err(`${loc}/description: medical wording without disclaimer`);
  if (v.description && !/(substitute for professional care|no sustituye la atención profesional|profesyonel desteğin yerine geçmez)/i.test(v.description)) err(`${loc}/description: missing "not a substitute for professional care" line`);
}

// Subscriptions: display name <= 30, description <= 45 characters.
const subFile = path.join(root, 'subscriptions.json');
try {
  const s = JSON.parse(fs.readFileSync(subFile, 'utf8'));
  const check = (where, l) => {
    for (const loc of LOCALES) {
      const e = l?.[loc];
      if (!e) { err(`subscriptions.json ${where}: missing locale ${loc}`); continue; }
      if (!e.name || len(e.name, 'chars') > 30) err(`subscriptions.json ${where} ${loc}: name must be 1-30 chars (${e.name ? len(e.name, 'chars') : 0})`);
      if ('description' in e && (!e.description || len(e.description, 'chars') > 45)) err(`subscriptions.json ${where} ${loc}: description must be 1-45 chars (${e.description ? len(e.description, 'chars') : 0})`);
    }
  };
  check('group', s.group?.localizations);
  const ids = (s.subscriptions ?? []).map((x) => x.productId).sort().join(',');
  if (ids !== 'oda_pro_annual,oda_pro_monthly') err(`subscriptions.json: expected oda_pro_annual and oda_pro_monthly, got "${ids}"`);
  for (const x of s.subscriptions ?? []) check(x.productId, x.localizations);
} catch (e) { err(`subscriptions.json: ${e.message}`); }

for (const w of warnings) console.warn(`WARN  ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`FAIL  ${e}`);
  console.error(`\nstore metadata check FAILED: ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`store metadata OK (${LOCALES.length} locales, 2 subscriptions${warnings.length ? `, ${warnings.length} warning(s)` : ''}${strict ? ', strict' : ''})`);
