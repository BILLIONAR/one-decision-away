/**
 * Writes the static privacy policy and terms pages from src/data/legal.ts:
 *   public/legal/privacy.html, public/legal/terms.html
 * These are the URLs given to App Store Connect. Run: npx tsx scripts/build-legal.ts
 * (tests/legal.test.ts fails when the committed pages are out of date).
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { PRIVACY, TERMS, LEGAL_COMPANY, type LegalDoc, type LegalLang } from '../src/data/legal';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const LANGS: { code: LegalLang; name: string }[] = [{ code: 'tr', name: 'Türkçe' }, { code: 'en', name: 'English' }, { code: 'es', name: 'Español' }];

export function renderLegalPage(kind: 'privacy' | 'terms'): string {
  const docs = kind === 'privacy' ? PRIVACY : TERMS;
  const otherHref = kind === 'privacy' ? 'terms.html' : 'privacy.html';
  const other = kind === 'privacy' ? TERMS : PRIVACY;
  const section = (lang: LegalLang, doc: LegalDoc) => `
<article id="${lang}" lang="${lang}">
  <p class="kicker">One Decision Away · ${esc(LEGAL_COMPANY)}</p>
  <h1>${esc(doc.title)}</h1>
  <p class="meta">${esc(doc.updated)}</p>
  <p class="intro">${esc(doc.intro)}</p>
${doc.sections.map(s => `  <section>\n    <h2>${esc(s.heading)}</h2>\n${s.body.map(p => `    <p>${esc(p)}</p>`).join('\n')}\n  </section>`).join('\n')}
  <p class="other"><a href="${otherHref}#${lang}">${esc(other[lang].title)}</a></p>
</article>`;
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(docs.tr.title)} · ${esc(docs.en.title)} — One Decision Away</title>
<meta name="robots" content="index,follow">
<style>
:root{--bg:#F6F4EE;--fg:#1C201D;--muted:#62645D;--line:#E3DFD5;--accent:#843D4B}
@media (prefers-color-scheme:dark){:root{--bg:#121513;--fg:#ECEBE5;--muted:#AAACA3;--line:#2F3530;--accent:#E4A4AC}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.7 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:680px;margin:0 auto;padding:32px 20px 80px}
nav{display:flex;gap:18px;font-size:14px;padding-bottom:12px;border-bottom:1px solid var(--line)}
nav a,.other a{color:var(--muted);text-underline-offset:4px}
article{padding:40px 0;border-bottom:1px solid var(--line)}
.kicker{margin:0;font:italic 16px/1.4 "New York",ui-serif,Georgia,serif;color:var(--accent)}
h1{margin:8px 0 6px;font:400 40px/1.1 "New York",ui-serif,Georgia,serif;letter-spacing:-.01em}
h2{margin:32px 0 8px;font:400 22px/1.3 "New York",ui-serif,Georgia,serif}
.meta{margin:0;font-size:13px;color:var(--muted)}
.intro{color:var(--muted)}
p{margin:10px 0}
</style>
</head>
<body>
<main>
<nav aria-label="Language">${LANGS.map(l => `<a href="#${l.code}">${l.name}</a>`).join('')}</nav>
${LANGS.map(l => section(l.code, docs[l.code])).join('\n')}
</main>
</body>
</html>
`;
}

if (process.argv[1] && process.argv[1].endsWith('build-legal.ts')) {
  mkdirSync('public/legal', { recursive: true });
  writeFileSync('public/legal/privacy.html', renderLegalPage('privacy'));
  writeFileSync('public/legal/terms.html', renderLegalPage('terms'));
  console.log('wrote public/legal/privacy.html and public/legal/terms.html');
}
