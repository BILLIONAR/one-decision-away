/** Cold-context approved-image requests, actual selection, and fallback checks.
 * node --import tsx scripts/qa-image-delivery.mjs
 * Baseline: immutable exact-main artifact on4180; updated app on4181, same base.
 */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { getInitialDemoState } from '../src/services/repository.ts';

const before = process.env.ODA_IMAGE_BASELINE || 'http://127.0.0.1:4180/one-decision-away/';
const after = process.env.ODA_IMAGE_AFTER || 'http://127.0.0.1:4181/one-decision-away/';
const out = process.env.ODA_IMAGE_OUT || 'artifacts/verification/image-delivery';
mkdirSync(out, { recursive: true });
const key = 'one_decision_away_app_data_v1';
const report = { before, after, cohort: 'Approved local ODA course covers and tree image response-body bytes; excludes fonts, scripts, logos, HTTP headers, and unrelated images.',
  cache: 'Fresh browser context per route/viewport/DPR, service workers blocked, browser cache disabled by request routing.', measurements: [], fallbacks: [], screenshots: [], errors: [] };
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });

function fixture(count = 90) {
  const seed = getInitialDemoState();
  seed.profile = { ...seed.profile, displayName: 'Image QA', locale: 'en', theme: 'light', onboardingStep: 'completed', intent: 'finish', simpleModeOff: true,
    firstOpenedAt: '2026-07-01T00:00:00Z', createdAt: '2026-07-01T00:00:00Z', twoWeekCheckIn: { answeredAt: '2026-09-01T12:00:00Z', answer: 'yes' } };
  seed.missions = Array.from({ length: count }, (_, index) => ({ id: `image-kept-${index}`, userId: seed.profile.id, title: 'Synthetic kept decision', type: 'daily_mission', area: 'Custom', difficulty: 'easy',
    isOneDecision: true, status: 'completed', scheduledFor: '2026-10-01', createdAt: '2026-10-01T08:00:00Z', completedAt: '2026-10-01T10:00:00Z' }));
  seed.completions = [];
  return seed;
}

async function setup(base, width, dpr, abort = '') {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: dpr, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(base).origin) return route.abort();
    if (abort === 'webp' && url.pathname.endsWith('.webp')) return route.abort();
    if (abort === 'all' && url.pathname.includes('/assets/oda/') && /\.(?:png|webp)$/.test(url.pathname)) return route.abort();
    return route.continue();
  });
  await context.addInitScript(({ key, seed }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
    localStorage.setItem('oda_locale', 'en'); localStorage.setItem('oda_theme', 'light'); localStorage.removeItem('oda_course_selection_v1');
  }, { key, seed: fixture() });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(String(error)));
  return { page, context };
}

async function dismiss(page) {
  for (let i = 0; i < 4 && await page.getByRole('dialog').count(); i++) await page.keyboard.press('Escape');
}

async function measure(version, base, width, dpr, route) {
  const { page, context } = await setup(base, width, dpr);
  const responses = [];
  page.on('response', response => {
    if (response.url().includes('/assets/oda/') && /\.(?:png|webp)(?:\?|$)/.test(response.url()))
      responses.push(response.body().then(bytes => ({ url: response.url(), bytes: bytes.length, status: response.status() })));
  });
  await page.goto(`${base}#${route}`);
  await page.locator(route.endsWith('courses') ? '#course-search' : '.oda-evidence-tree').waitFor();
  await dismiss(page);
  if (route.endsWith('courses')) {
    assert.equal(await page.locator('.oda-course-row').count(), 18);
    for (const row of await page.locator('.oda-course-row').all()) {
      await row.scrollIntoViewIfNeeded();
      await row.locator('.oda-course-photo img').evaluate(img => img.decode());
    }
  } else {
    assert.equal(await page.locator('.oda-evidence-tree').getAttribute('data-tree-stage'), 'flowering');
    await page.locator('.oda-evidence-tree img').evaluate(img => img.decode());
  }
  const selected = await page.locator(route.endsWith('courses') ? '.oda-course-photo img' : '.oda-evidence-tree img').evaluateAll(images => images.map(img => ({
    currentSrc: img.currentSrc, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
    renderedWidth: img.getBoundingClientRect().width, renderedHeight: img.getBoundingClientRect().height,
    objectPosition: getComputedStyle(img).objectPosition, transform: getComputedStyle(img).transform,
  })));
  const transfers = await Promise.all(responses);
  const unique = [...new Map(transfers.map(transfer => [transfer.url, transfer])).values()];
  assert.ok(unique.length > 0);
  assert.ok(unique.every(transfer => transfer.status === 200));
  report.measurements.push({ version, route, viewport: width, dpr, imageBytes: transfers.reduce((total, transfer) => total + transfer.bytes, 0), uniqueImageBytes: unique.reduce((total, transfer) => total + transfer.bytes, 0), transfers, selected });
  if ((width === 390 && dpr === 2) || (width === 1440 && dpr === 1)) {
    await page.evaluate(() => { document.querySelector('#oda-main')?.scrollTo(0, 0); window.scrollTo(0, 0); });
    const path = `${out}/${version}-${route.endsWith('courses') ? 'courses' : 'tree'}-${width}-dpr${dpr}.png`;
    await page.screenshot({ path, fullPage: false }); report.screenshots.push(path);
  }
  await context.close();
}

try {
  for (const width of [320, 390, 1440]) for (const dpr of [1, 2]) for (const route of ['/app', '/app/courses']) {
    await measure('before', before, width, dpr, route);
    await measure('after', after, width, dpr, route);
    console.log(`Measured ${route} ${width}px DPR${dpr}`);
  }
  for (const abort of ['webp', 'all']) for (const route of ['/app', '/app/courses']) {
    const { page, context } = await setup(after, 390, 2, abort);
    await page.goto(`${after}#${route}`); await page.locator(route.endsWith('courses') ? '#course-search' : '.oda-evidence-tree').waitFor(); await dismiss(page);
    const selector = route.endsWith('courses') ? '.oda-course-row:first-child .oda-course-cover' : '.oda-evidence-tree';
    const element = page.locator(selector);
    if (abort === 'webp') {
      await page.waitForFunction(selector => { const img = document.querySelector(selector)?.querySelector('img'); return img?.currentSrc.endsWith('.png') && img.complete && img.naturalWidth > 0; }, selector);
      await element.locator('img').evaluate(img => img.decode());
      assert.ok((await element.locator('img').evaluate(img => img.currentSrc)).endsWith('.png'));
      assert.equal(await element.getAttribute('data-image-failed'), 'false');
    } else {
      await page.waitForFunction(selector => document.querySelector(selector)?.getAttribute('data-image-failed') === 'true', selector);
      assert.equal(await element.locator('img').count(), 0);
      if (route === '/app') assert.equal(await element.locator('.oda-tree-unavailable').count(), 1);
    }
    report.fallbacks.push({ route, abort, passed: true }); await context.close();
  }
  assert.deepEqual(report.errors, []);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = String(error.stack || error); throw error;
} finally {
  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2)); await browser.close();
}
