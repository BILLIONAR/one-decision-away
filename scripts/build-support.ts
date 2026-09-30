import { mkdirSync, writeFileSync } from 'node:fs';
import { SUPPORT, SUPPORT_EMAIL, supportEmailHref } from '../src/data/support';

const langs = [{ code: 'en', label: 'English' }, { code: 'tr', label: 'Türkçe' }, { code: 'es', label: 'Español' }] as const;
const esc = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A real support destination that needs neither JavaScript nor an app account. */
export function renderSupportPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#F7F3EA">
<meta name="description" content="ODA support: contact, backups, courses, reminders and subscriptions in English, Türkçe and Español.">
<title>ODA · Support / Destek / Ayuda</title>
<style>
:root{--bg:#F7F3EA;--fg:#173E35;--muted:#56675E;--line:#D9DED5;--card:#FFFDFA;--accent:#8A3042}
@media(prefers-color-scheme:dark){:root{--bg:#12271F;--fg:#F7F3EA;--muted:#BACABE;--line:#345046;--card:#1A332A;--accent:#EAB2BE}}
*{box-sizing:border-box}html{scroll-padding-top:24px}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.7 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:760px;margin:auto;padding:max(24px,env(safe-area-inset-top)) 20px max(64px,env(safe-area-inset-bottom))}a{color:var(--accent);text-underline-offset:4px}a:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:4px;border-radius:4px}nav{display:flex;flex-wrap:wrap;gap:8px 24px}nav a{display:inline-flex;align-items:center;min-height:44px}article{padding:48px 0;border-top:1px solid var(--line)}.kicker{font-size:12px;letter-spacing:.16em;font-weight:650}h1{font:400 clamp(36px,6vw,52px)/1.08 Georgia,serif;max-width:620px;margin:12px 0 20px;text-wrap:balance}h2{font:400 28px/1.2 Georgia,serif;margin:0 0 16px}.intro,p{color:var(--muted)}.contact{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:24px;margin:32px 0 48px}.contact a{overflow-wrap:anywhere}.cta{display:inline-flex;align-items:center;min-height:48px;padding:8px 24px;background:var(--fg);color:var(--bg);border-radius:99px;font-weight:600;text-decoration:none}details{border-bottom:1px solid var(--line);padding:4px 0}summary{padding:16px 0;min-height:56px;cursor:pointer;font-weight:600}details p{margin:4px 0 20px}.legal{margin-top:24px}p{margin:12px 0}
</style>
</head>
<body>
<main>
<nav aria-label="Support language">${langs.map(lang => `<a href="#${lang.code}" lang="${lang.code}">${lang.label}</a>`).join('')}<a href="./">ODA</a></nav>
${langs.map(({ code }) => {
    const c = SUPPORT[code];
    return `<article id="${code}" lang="${code}">
<p class="kicker">ODA · ONE DECISION AWAY</p>
<h1>${esc(c.title)}</h1>
<p class="intro">${esc(c.intro)}</p>
<section class="contact" aria-labelledby="contact-${code}">
<h2 id="contact-${code}">${esc(c.contact)}</h2>
<p>${esc(c.contactIntro)}</p>
<a class="cta" href="${esc(supportEmailHref(code))}">${esc(c.emailAction)}</a>
<p><a href="mailto:${esc(SUPPORT_EMAIL)}">${esc(SUPPORT_EMAIL)}</a></p>
<p>${esc(c.include)}</p>
<p>${esc(c.privacyNote)}</p>
</section>
<section aria-labelledby="answers-${code}">
<h2 id="answers-${code}">${esc(c.quickHelp)}</h2>
${c.topics.map(topic => `<details id="${code}-${topic.id}"><summary>${esc(topic.title)}</summary>${topic.paragraphs.map(paragraph => `<p>${esc(paragraph)}</p>`).join('')}</details>`).join('\n')}
</section>
<nav class="legal" aria-label="${esc(c.contact)}"><a href="legal/privacy.html#${code}">${esc(c.privacy)}</a><a href="legal/terms.html#${code}">${esc(c.terms)}</a><a href="./">${esc(c.back)}</a></nav>
</article>`;
  }).join('\n')}
</main>
</body>
</html>
`;
}

if (process.argv[1]?.endsWith('build-support.ts')) {
  mkdirSync('public', { recursive: true });
  writeFileSync('public/support.html', renderSupportPage());
  console.log('wrote public/support.html');
}
