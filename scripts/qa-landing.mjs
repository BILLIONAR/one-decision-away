/** Start the web app, then run `node scripts/qa-landing.mjs`. No real user data is used. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.ODA_QA_URL || 'http://localhost:3000';
const out = process.env.ODA_LANDING_QA_OUT || 'artifacts/landing';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });
const report = { at: new Date().toISOString(), base, checks: [], screenshots: [], accessibility: [], pageErrors: [] };
const expected = {
  en: { title: 'Make room for', demo: 'Read two pages after breakfast.', reflect: 'Two pages. A little more space.', course: 'Preview course' },
  tr: { title: 'Önem verdiğine', demo: 'Kahvaltıdan sonra iki sayfa oku.', reflect: 'İki sayfa. Kendime biraz alan.', course: 'Kursu incele' },
  es: { title: 'Haz espacio para', demo: 'Leer dos páginas después del desayuno.', reflect: 'Dos páginas. Un poco más de espacio.', course: 'Ver el curso' },
};
const pass = message => { report.checks.push(message); console.log(`PASS ${message}`); };

try {
  for (const locale of ['en', 'tr', 'es']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.addInitScript(value => localStorage.setItem('oda_locale', value), locale);
    const page = await context.newPage();
    page.on('pageerror', error => report.pageErrors.push(error.message));
    await page.goto(base);
    await page.locator('.oda-landing-title').waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.ok((await page.locator('h1').textContent()).includes(expected[locale].title));
    const before = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
    const controls = page.locator('.oda-landing-preview-controls button');
    await controls.nth(1).focus();
    await page.keyboard.press('Enter');
    assert.equal(await controls.nth(1).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.oda-landing-preview-title').textContent(), expected[locale].demo);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Space');
    assert.equal(await controls.nth(2).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.oda-landing-preview-title').textContent(), expected[locale].reflect);
    assert.deepEqual(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage))), before, 'demo must not write to personal practice');
    pass(`${locale}: keyboard preview changes steps without changing stored data`);
    const faq = page.locator('.oda-landing-faq summary').first();
    await faq.focus(); await page.keyboard.press('Enter');
    assert.notEqual(await faq.locator('..').getAttribute('open'), null);
    await page.keyboard.press('Enter');
    assert.equal(await faq.locator('..').getAttribute('open'), null);
    pass(`${locale}: FAQ expands and closes with the keyboard`);
    for (const width of locale === 'en' ? [320, 390, 768, 1440] : [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), `${locale} ${width}px horizontal overflow`);
      for (const node of await page.locator('.oda-landing-preview-controls button, .oda-landing-hero-actions button, .oda-landing-nav-actions button').all()) {
        const box = await node.boundingBox();
        if (box) assert.ok(box.height >= 44, `${locale} ${width}px small interactive target`);
      }
    }
    pass(`${locale}: responsive layouts have no overflow and primary controls reach 44px`);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await controls.first().click();
      const name = `landing-${locale}-${width}.png`;
      await page.screenshot({ path: `${out}/${name}`, fullPage: true }); report.screenshots.push(name);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
      const violations = result.violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target) }));
      report.accessibility.push({ locale, width, theme: 'light', violations });
      assert.equal(violations.length, 0, `${locale} ${width}px: ${JSON.stringify(violations)}`);
    }
    pass(`${locale}: mobile and desktop have zero axe WCAG A/AA findings`);
    await page.locator('.oda-landing-course button').first().click();
    assert.equal(await page.evaluate(() => localStorage.getItem('oda_course_selection_v1')), 'turning-day');
    await page.waitForURL('**/app/courses');
    pass(`${locale}: preview CTA chooses the real course and enters the app`);
    await context.close();
  }
  const darkContext = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark', reducedMotion: 'reduce', serviceWorkers: 'block' });
  const darkPage = await darkContext.newPage();
  await darkPage.goto(base);
  await darkPage.locator('.oda-landing-title').waitFor();
  await darkPage.evaluate(() => document.fonts.ready);
  assert.equal(await darkPage.locator('html').getAttribute('data-theme'), 'dark');
  const darkAxe = await new AxeBuilder({ page: darkPage }).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  report.accessibility.push({ theme: 'dark', violations: darkAxe.violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target) })) });
  assert.equal(darkAxe.violations.length, 0, JSON.stringify(report.accessibility.at(-1)));
  await darkPage.screenshot({ path: `${out}/landing-dark-mobile.png`, fullPage: true }); report.screenshots.push('landing-dark-mobile.png');
  assert.equal(report.pageErrors.length, 0, JSON.stringify(report.pageErrors));
  pass('dark mode and reduced-motion preference: zero axe findings, zero page errors');
  await darkContext.close();
} finally {
  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
