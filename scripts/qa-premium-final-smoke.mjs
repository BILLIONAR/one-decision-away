/** Bind the final rebuild to a small real-browser smoke after narrow audio/label fixes. */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { chromium, webkit } from 'playwright';
import { getInitialDemoState } from '../src/services/repository.ts';
import { rewardsCopy } from '../src/i18n/rewards.ts';

const out = 'artifacts/verification/premium-final-smoke';
mkdirSync(out, { recursive: true });
const key = 'one_decision_away_app_data_v1';
const hash = value => createHash('sha256').update(value).digest('hex');
const report = { at: new Date().toISOString(), buildIndexSHA256: hash(readFileSync('dist/index.html')), cases: [], errors: [], failures: [], limits: ['Final local rebuilt preview; synthetic signed-out records, no provider or purchase calls.', 'Linux browser emulation; audio perceptual quality and physical devices are unverified.'] };
for (const engineName of ['chromium', 'webkit']) {
  const engine = engineName === 'webkit' ? webkit : chromium;
  const base = engineName === 'webkit' ? 'https://127.0.0.1:4185/one-decision-away/' : 'http://127.0.0.1:4182/one-decision-away/';
  const browser = await engine.launch({ executablePath: engineName === 'webkit' ? engine.executablePath() : '/usr/bin/chromium' });
  try {
    for (const locale of ['en', 'tr', 'es']) {
      const seed = getInitialDemoState();
      seed.profile = { ...seed.profile, displayName: 'Final QA', locale, theme: 'light', onboardingStep: 'completed', simpleModeOff: true };
      seed.missions = []; seed.completions = []; seed.courseProgress = { version: 1, lessons: {} };
      const context = await browser.newContext({ viewport: { width: 320, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block', ignoreHTTPSErrors: engineName === 'webkit' });
      await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin && ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort());
      await context.addInitScript(({ key, seed, locale }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed)); localStorage.setItem('oda_locale', locale); }, { key, seed, locale });
      const page = await context.newPage();
      page.on('pageerror', error => report.errors.push({ engineName, locale, message: error.message }));
      try {
        await page.goto(`${base}#/app/bank`); await page.locator('h1').waitFor(); await page.evaluate(() => document.fonts.ready);
        await page.locator('.goal-label').waitFor();
        await page.waitForFunction(() => {
          const label = document.querySelector('.goal-label'), svg = label?.closest('svg');
          const overlay = svg?.querySelector('.interactive-overlay');
          if (!label?.textContent.startsWith('D$ ') || !svg || !overlay) return false;
          const innerWidth = Math.max(100, svg.getBoundingClientRect().width - 84);
          // Wait for ResizeObserver and the reduced-motion D3 tick before measuring geometry.
          return Math.abs(Number(overlay.getAttribute('width')) - innerWidth) < 1
            && Math.abs(Number(label.getAttribute('x')) - (innerWidth - 6)) < 1
            && !Array.from(svg.querySelectorAll('*')).some(node => node.__transition);
        });
        const bank = await page.evaluate(() => {
          const label = document.querySelector('.goal-label').getBoundingClientRect(), svg = document.querySelector('.goal-label').closest('svg').getBoundingClientRect();
          const main = document.getElementById('oda-main');
          return { goal: document.querySelector('.goal-label').textContent, goalBounds: { left: label.left, right: label.right }, svgBounds: { left: svg.left, right: svg.right }, mainClient: main.clientWidth, mainScroll: main.scrollWidth, body: main.textContent };
        });
        assert.ok(bank.goalBounds.left >= bank.svgBounds.left - 1 && bank.goalBounds.right <= bank.svgBounds.right + 1, JSON.stringify(bank.goalBounds));
        assert.ok(bank.mainScroll <= bank.mainClient + 1);
        assert.match(bank.body, /0\s*\/\s*7/); // Welcome money cannot create kept-decision days.
        assert.ok(bank.body.includes(rewardsCopy(locale).kindLabels.welcome_grant));
        await page.screenshot({ path: `${out}/bank-${engineName}-${locale}-320.png` });
        await page.locator('svg:has(.goal-label)').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${out}/bank-goal-${engineName}-${locale}-320.png` });
        await page.goto(`${base}#/app`); await page.locator('.oda-quote').waitFor();
        assert.equal(await page.locator('.oda-quote').count(), 1); assert.equal(await page.locator('.oda-evidence-tree').first().getAttribute('data-kept-count'), '0');
        await page.goto(`${base}#/app/sound`); await page.locator('h1').waitFor();
        report.cases.push({ engineName, locale, bank, today: 'zero evidence with quote', sound: 'route renders', shellSHA256: hash(await (await context.request.get(base)).body()) });
      } catch (error) { report.failures.push({ engineName, locale, error: String(error.stack || error) }); }
      await context.close();
    }
  } finally { await browser.close(); }
}
writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
assert.equal(report.errors.length, 0); assert.equal(report.failures.length, 0);
console.log(`PASS final rebuilt smoke: ${report.cases.length} engine/locale cases`);
