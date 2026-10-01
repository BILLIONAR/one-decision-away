/** Disposable local UI evidence for the premium/protection review branch. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { getInitialDemoState } from '../src/services/repository.ts';
import { coursesFor } from '../src/data/courses.ts';
import { rewardsCopy } from '../src/i18n/rewards.ts';
import { getDailyQuote } from '../src/data/dailyQuotes.ts';

const base = process.env.ODA_QA_URL || 'http://127.0.0.1:4182/one-decision-away/';
const out = process.env.ODA_PREMIUM_QA_OUT || 'artifacts/verification/premium-ui';
const engineName = process.env.ODA_PREMIUM_ENGINE || 'chromium';
const engine = engineName === 'webkit' ? webkit : chromium;
const key = 'one_decision_away_app_data_v1';
const now = new Date('2026-10-01T12:00:00Z');
const quote = getDailyQuote(now);
const report = { at: new Date().toISOString(), base, engine: engineName, checks: [], cases: [], screenshots: [], violations: [], errors: [], blockedRequests: [], failures: [], limits: ['Synthetic signed-out local records; no account, payment or provider calls.', 'Linux browser and viewport emulation; no physical iPhone/native validation.', '200% zoom uses CSS layout zoom on the local app, not an operating-system browser zoom setting.', 'External dream photos are blocked to keep the review deterministic; existing image fallback is exercised.'] };
mkdirSync(out, { recursive: true });
const routes = [['today', '/app'], ['catalogue', '/app/courses'], ['lesson', '/app/courses'], ['dreams', '/app/dreams'], ['notebook', '/app/notebook'], ['me', '/app/me'], ['bank', '/app/bank']];
const pass = name => { report.checks.push(name); console.log(`PASS ${name}`); };
const seedFor = (locale, theme, count = 30) => {
  const seed = getInitialDemoState();
  seed.profile = { ...seed.profile, displayName: 'Review Member', locale, theme, onboardingStep: 'completed', simpleModeOff: true, firstOpenedAt: '2026-07-01T12:00:00Z', createdAt: '2026-07-01T12:00:00Z', twoWeekCheckIn: { answer: 'yes', answeredAt: '2026-09-01T12:00:00Z' } };
  seed.missions = Array.from({ length: count }, (_, i) => ({ id: `review-${i}`, userId: seed.profile.id, title: 'A synthetic kept decision', type: 'daily_quest', area: 'Work', difficulty: 'easy', isOneDecision: true, status: 'completed', createdAt: new Date(now.getTime() - (i % 12) * 86400000).toISOString(), completedAt: new Date(now.getTime() - (i % 12) * 86400000).toISOString() }));
  seed.completions = [];
  seed.courseProgress = { version: 1, lessons: {} };
  return seed;
};
const ready = async page => {
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (let i = 0; i < 4 && await page.getByRole('dialog').count(); i++) await page.keyboard.press('Escape');
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
};
const screenshot = async (page, name) => {
  await page.screenshot({ path: `${out}/${name}.png` }); report.screenshots.push(`${name}.png`);
};
let browser;
try {
  browser = await engine.launch(engineName === 'webkit' ? { executablePath: engine.executablePath() } : { executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium' });
  report.browserVersion = browser.version();
  for (const locale of ['en', 'tr', 'es']) for (const theme of ['light', 'dark']) for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 }, timezoneId: 'UTC', serviceWorkers: 'block', reducedMotion: 'reduce', colorScheme: theme });
    await context.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin === new URL(base).origin && ['GET', 'HEAD'].includes(request.method())) return route.continue();
      if (!['images.unsplash.com', 'plus.unsplash.com'].includes(url.hostname)) report.blockedRequests.push({ method: request.method(), origin: url.origin, path: url.pathname });
      return route.abort();
    });
    const seed = seedFor(locale, theme);
    await context.addInitScript(({ key, seed, locale }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed)); localStorage.setItem('oda_locale', locale); }, { key, seed, locale });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push({ locale, theme, width, message: error.message }));
    await page.clock.install({ time: now });
    for (const [name, route] of routes) {
      const label = `${name}-${locale}-${theme}-${width}`;
      try {
        await page.goto(`${base}#${route}`); await ready(page);
        if (name === 'catalogue' || name === 'lesson') {
          if (await page.locator('.oda-course-lesson-title').count()) { await page.evaluate(() => localStorage.removeItem('oda_course_selection_v1')); await page.reload(); await ready(page); }
          await page.locator('.oda-course-row').first().waitFor();
          if (name === 'catalogue') assert.equal(await page.locator('.oda-course-row').count(), 18);
          else { await page.locator('.oda-course-row').first().click(); await page.locator('.oda-course-lesson-title').waitFor(); }
        }
        await page.waitForFunction(locale => document.documentElement.lang === locale, locale);
        const geometry = await page.evaluate(() => {
          const main = document.getElementById('oda-main');
          const rect = element => { const r = element.getBoundingClientRect(); return { width: r.width, height: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right }; };
          const logo = [...document.querySelectorAll('[data-brand="v5"]')].filter(element => element.getBoundingClientRect().width > 0);
          const tabs = [...document.querySelectorAll('.oda-tab')].map(rect);
          return { viewport: innerWidth, document: document.documentElement.scrollWidth, main: { client: main.clientWidth, scroll: main.scrollWidth }, logos: logo.map(element => ({ ...rect(element), variant: element.getAttribute('data-brand-variant'), paths: element.querySelectorAll('path').length, filter: getComputedStyle(element).filter })), tabs };
        });
        assert.ok(geometry.document <= width + 1 && geometry.main.scroll <= geometry.main.client + 1, `${label}: horizontal overflow ${JSON.stringify(geometry)}`);
        for (const logo of geometry.logos) { assert.ok(logo.paths >= 3); assert.equal(logo.filter, 'none'); }
        if (width === 1440) { assert.ok(geometry.logos.some(logo => logo.width === 192 && logo.height === 64 && logo.variant === 'inverted')); }
        else { assert.equal(geometry.tabs.length, 5); for (const tab of geometry.tabs) assert.ok(tab.width >= 44 && tab.height >= 44); }
        if (name === 'today') {
          assert.equal(await page.locator('.oda-quote').count(), 1);
          const order = await page.locator('.oda-quote').evaluate(element => { const quote = element.getBoundingClientRect(), growth = document.querySelector('.oda-growth-dashboard').getBoundingClientRect(); return { quoteBottom: quote.bottom, growthTop: growth.top }; });
          assert.ok(order.quoteBottom <= order.growthTop);
          if (quote.sourceUrl) assert.equal(await page.locator('.oda-quote figcaption a').getAttribute('href'), quote.sourceUrl);
          if (locale === 'tr' && quote.tr) assert.equal((await page.locator('.oda-quote blockquote').textContent()).trim(), quote.tr);
        }
        if (name === 'dreams') assert.equal((await page.locator('[data-symbolic-rewards]').textContent()).trim(), rewardsCopy(locale).explanation);
        if (width !== 320) {
          const axe = await new AxeBuilder({ page }).include('#oda-main').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
          const violations = axe.violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target), detail: item.nodes.map(node => node.failureSummary) }));
          report.violations.push({ label, violations });
          assert.equal(violations.filter(item => ['serious', 'critical'].includes(item.impact)).length, 0, JSON.stringify(violations));
        }
        report.cases.push({ label, ...geometry });
        await screenshot(page, label); pass(label);
      } catch (error) { report.failures.push({ label, error: String(error.stack || error) }); await screenshot(page, `failure-${label}`); console.error(`FAIL ${label}: ${error.message}`); }
    }
    if (locale === 'en' && theme === 'light' && width === 1440) {
      for (const [name, route] of routes) {
        await page.goto(`${base}#${route}`); await ready(page); await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
        const geometry = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, mainClient: document.getElementById('oda-main').clientWidth, mainScroll: document.getElementById('oda-main').scrollWidth }));
        if (geometry.scroll > geometry.client + 1 || geometry.mainScroll > geometry.mainClient + 1) report.failures.push({ label: `zoom-${name}`, geometry });
        else pass(`200%-layout-zoom-${name}`);
        await screenshot(page, `zoom-200-${name}`); await page.evaluate(() => { document.documentElement.style.zoom = ''; });
      }
    }
    await context.close();
  }
  assert.equal(coursesFor('en').reduce((sum, course) => sum + course.lessons.length, 0), 103);
  pass('18 courses and 103 lessons retain their inventory');
  assert.equal(report.errors.length, 0); assert.equal(report.blockedRequests.length, 0); assert.equal(report.failures.length, 0);
} catch (error) { report.failure = String(error.stack || error); console.error(report.failure); process.exitCode = 1; }
finally { if (browser) await browser.close(); writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2)); }
