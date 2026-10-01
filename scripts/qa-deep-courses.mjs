/**
 * Focused persistence regressions against a source Vite server.
 * Uses disposable browser contexts with synthetic records and blocks all
 * requests outside the selected local origin. No account or native SDK is used.
 * ODA_QA_URL=http://127.0.0.1:3021 node --import tsx scripts/qa-deep-courses.mjs
 */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { getInitialDemoState } from '../src/services/repository.ts';
import { coursesFor } from '../src/data/courses.ts';

const base = (process.env.ODA_QA_URL || 'http://127.0.0.1:3021').replace(/\/$/, '');
const origin = new URL(base).origin;
const out = process.env.ODA_DEEP_COURSE_QA_OUT || 'artifacts/verification/deep-courses';
const raceRepeats = Number(process.env.ODA_DEEP_COURSE_RACE_REPEATS || 8);
assert.ok(Number.isInteger(raceRepeats) && raceRepeats >= 1 && raceRepeats <= 50, 'Race repeat count must be between 1 and 50');
const key = 'one_decision_away_app_data_v1';
const course = coursesFor('en').find(item => item.id === 'procrastination');
const report = { base, at: new Date().toISOString(), raceRepeats, checks: [], observations: [], errors: [] };
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });

const pass = name => { report.checks.push(name); console.log(`PASS ${name}`); };
const seedFor = (completed = 0) => {
  const seed = getInitialDemoState();
  seed.profile = { ...seed.profile, displayName: 'Synthetic persistence review', locale: 'en', onboardingStep: 'completed', theme: 'light', intent: 'finish', simpleModeOff: true, firstOpenedAt: '2026-08-01T00:00:00.000Z', createdAt: '2026-08-01T00:00:00.000Z' };
  seed.courseProgress = {
    version: 1,
    lessons: Object.fromEntries(course.lessons.slice(0, completed).map(lesson => [lesson.id, { checked: lesson.practice.map(() => true), answer: lesson.correct, reflection: '', completed: true }])),
  };
  return seed;
};
const ready = async page => {
  await page.locator('.oda-course-lesson-title').waitFor();
  for (let i = 0; i < 3; i++) {
    if (!await page.getByRole('dialog').count()) break;
    await page.keyboard.press('Escape');
  }
};
const newPage = async context => {
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(`${base}/app/courses`);
  await ready(page);
  return page;
};
const fixture = async (completed = 0, patchSeed) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  const seed = seedFor(completed);
  patchSeed?.(seed);
  await context.addInitScript(({ key, seed }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
    localStorage.setItem('oda_locale', 'en');
    localStorage.setItem('oda_course_selection_v1', 'procrastination');
  }, { key, seed });
  const page = await newPage(context);
  return { context, page };
};
const openWorkbook = async page => {
  const studio = page.locator('#course-practice-studio');
  if (!await studio.evaluate(element => element.open)) await studio.locator('summary').first().click();
};
const blockWrites = async page => page.evaluate(key => {
  window.__odaDeepReviewSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(storageKey, value) {
    if (storageKey === key) throw new DOMException('Synthetic blocked save', 'QuotaExceededError');
    return window.__odaDeepReviewSetItem.call(this, storageKey, value);
  };
}, key);
const restoreWrites = async page => page.evaluate(() => { Storage.prototype.setItem = window.__odaDeepReviewSetItem; });
const internalRoute = async (page, route) => page.evaluate(route => {
  history.pushState({}, '', route);
  dispatchEvent(new PopStateEvent('popstate'));
}, route);
const holdDataLock = async page => page.evaluate(async () => {
  let acquired;
  const ready = new Promise(resolve => { acquired = resolve; });
  window.__odaDeepReviewLock = navigator.locks.request('oda-data-writes', async () => {
    acquired();
    await new Promise(resolve => { window.__odaDeepReviewReleaseLock = resolve; });
  });
  await ready;
});
const releaseDataLock = async page => page.evaluate(async () => {
  window.__odaDeepReviewReleaseLock();
  await window.__odaDeepReviewLock;
});
const traceStorage = async page => page.evaluate(({ key, lessonId }) => {
  window.__odaDeepReviewTrace = [];
  const originalGet = Storage.prototype.getItem;
  const originalSet = Storage.prototype.setItem;
  const record = (operation, raw) => {
    const checked = raw ? JSON.parse(raw)?.courseProgress?.lessons?.[lessonId]?.checked ?? null : null;
    window.__odaDeepReviewTrace.push({ operation, at: Date.now(), checked, stack: new Error().stack });
  };
  Storage.prototype.getItem = function(storageKey) {
    const value = originalGet.call(this, storageKey);
    if (storageKey === key) record('get', value);
    return value;
  };
  Storage.prototype.setItem = function(storageKey, value) {
    if (storageKey === key) record('set', value);
    return originalSet.call(this, storageKey, value);
  };
}, { key, lessonId: course.lessons[0].id });

try {
  {
    const { context, page } = await fixture();
    try {
      await openWorkbook(page);
      await blockWrites(page);
      await page.locator('#practice-procrastination-action').fill('Synthetic unsaved action');
      await page.locator('#practice-procrastination-fallback').fill('Synthetic unsaved fallback');
      await page.locator('.oda-course-save-note [role="alert"]').waitFor();
      await internalRoute(page, '/app');
      await page.locator('.oda-courses').waitFor({ state: 'detached' });
      await internalRoute(page, '/app/courses');
      await ready(page);
      await openWorkbook(page);
      const returned = {
        action: await page.locator('#practice-procrastination-action').inputValue(),
        fallback: await page.locator('#practice-procrastination-fallback').inputValue(),
        alerts: await page.locator('.oda-course-save-note [role="alert"]').count(),
      };
      report.observations.push({ case: 'failed draft after internal route return', ...returned });
      assert.equal(returned.action, 'Synthetic unsaved action', 'Internal route changes must retain the failed draft');
      assert.equal(returned.fallback, 'Synthetic unsaved fallback');
      assert.equal(returned.alerts, 1, 'Retained unsaved work must keep its save warning');
      await restoreWrites(page);
      await page.locator('.oda-course-save-note button').click();
      await page.waitForFunction(key => {
        const plan = JSON.parse(localStorage.getItem(key)).courseProgress?.experiments?.procrastination;
        return plan?.action === 'Synthetic unsaved action' && plan?.fallback === 'Synthetic unsaved fallback';
      }, key);
      pass('Failed private draft and warning survive app route changes; retry persists all fields');
    } finally { await context.close(); }
  }
  {
    const { context, page } = await fixture(2);
    try {
      // Simulates a free entitlement snapshot in this disposable web page.
      // It never initializes RevenueCat or invokes a purchase/native API.
      await page.evaluate(async () => {
        const { purchases } = await import('/src/services/purchases.ts');
        purchases.set({ available: true, ready: true, tier: 'free' });
      });
      await page.locator('#course-pro-title').waitFor();
      await openWorkbook(page);
      await blockWrites(page);
      await page.locator('#practice-procrastination-action').fill('Synthetic locked unsaved action');
      await page.locator('.oda-course-save-note [role="alert"]').waitFor({ timeout: 5000 });
      const visible = {
        locked: await page.locator('#course-pro-title').isVisible(),
        alerts: await page.locator('.oda-course-save-note [role="alert"]').count(),
        retryButtons: await page.locator('.oda-course-save-note button').count(),
      };
      report.observations.push({ case: 'locked lesson save warning', ...visible });
      assert.equal(visible.alerts, 1);
      assert.equal(visible.retryButtons, 1, 'Editable workbook needs retry on locked lessons');
      await restoreWrites(page);
      await page.locator('.oda-course-save-note button').click();
      await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).courseProgress?.experiments?.procrastination?.action === 'Synthetic locked unsaved action', key);
      pass('Locked lesson keeps workbook save warnings and a working retry');
    } finally { await context.close(); }
  }
  for (let iteration = 1; iteration <= raceRepeats; iteration++) {
    const { context, page: first } = await fixture();
    try {
      const second = await newPage(context);
      await traceStorage(first);
      await traceStorage(second);
      await holdDataLock(second);
      await first.locator('.oda-course-practice input').nth(0).check();
      await second.locator('.oda-course-practice input').nth(1).check();
      await releaseDataLock(second);
      await first.waitForFunction(({ key, lessonId }) => JSON.parse(localStorage.getItem(key)).courseProgress?.lessons?.[lessonId]?.checked?.[1] === true, { key, lessonId: course.lessons[0].id });
      const checked = await first.evaluate(({ key, lessonId }) => JSON.parse(localStorage.getItem(key)).courseProgress.lessons[lessonId].checked, { key, lessonId: course.lessons[0].id });
      report.observations.push({
        case: 'independent two-tab checkbox edits', iteration, checked,
        firstTrace: await first.evaluate(() => window.__odaDeepReviewTrace),
        secondTrace: await second.evaluate(() => window.__odaDeepReviewTrace),
      });
      assert.deepEqual(checked, [true, true, false], 'Checking a different step must preserve the other tab\'s step');
      pass(`Two-tab independent practice steps both persist under queued writes (${iteration}/${raceRepeats})`);
    } finally { await context.close(); }
  }
  {
    const { context, page: first } = await fixture();
    try {
      const second = await newPage(context);
      await openWorkbook(first);
      await blockWrites(first);
      await first.locator('#practice-procrastination-action').fill('Old private synthetic draft');
      await first.locator('.oda-course-save-note [role="alert"]').waitFor();
      const restored = seedFor();
      restored.courseProgress.experiments = { procrastination: { cue: 'Restored synthetic cue', action: 'Restored synthetic plan', fallback: '', evidence: '', reviewOn: null, attempts: [], review: { recall: '', nextAction: '', reviewedOn: null } } };
      const replaced = await second.evaluate(async restored => {
        const { createRepository } = await import('/src/services/repository.ts');
        return createRepository().replaceAll(restored);
      }, restored);
      assert.equal(replaced, true);
      await first.waitForFunction(key => JSON.parse(localStorage.getItem(key)).courseProgress?.experiments?.procrastination?.action === 'Restored synthetic plan', key);
      await first.waitForFunction(() => document.querySelector('#practice-procrastination-action')?.value === 'Restored synthetic plan');
      const replacedState = {
        action: await first.locator('#practice-procrastination-action').inputValue(),
        alerts: await first.locator('.oda-course-save-note [role="alert"]').count(),
      };
      report.observations.push({ case: 'successful other-tab replacement discards previous private draft', ...replacedState });
      assert.equal(replacedState.alerts, 0, 'Successful replacement must clear the discarded draft\'s save warning');
      await restoreWrites(first);
      await first.evaluate(async () => {
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        await getCourseProgressSession().retry();
      });
      const actionAfterRetry = await first.evaluate(key => JSON.parse(localStorage.getItem(key)).courseProgress.experiments.procrastination.action, key);
      assert.equal(actionAfterRetry, 'Restored synthetic plan', 'Retry must never resurrect private work from the replaced record');
      pass('Successful other-tab replacement discards the old draft and prevents retry resurrection');
    } finally { await context.close(); }
  }
  {
    const { context, page: first } = await fixture(0, seed => {
      seed.courseProgress.experiments = { procrastination: { cue: '', action: '', fallback: '', evidence: '', reviewOn: '2026-10-02', attempts: [], review: { recall: '', nextAction: '', reviewedOn: null } } };
    });
    try {
      const second = await newPage(context);
      await openWorkbook(first);
      await openWorkbook(second);
      await holdDataLock(second);
      await second.locator('#practice-procrastination-review-date').fill('2027-01-01');
      await first.locator('#practice-procrastination-cue').fill('Synthetic independent cue');
      await releaseDataLock(second);
      await first.waitForFunction(key => JSON.parse(localStorage.getItem(key)).courseProgress?.experiments?.procrastination?.cue === 'Synthetic independent cue', key);
      const experiment = await first.evaluate(key => JSON.parse(localStorage.getItem(key)).courseProgress.experiments.procrastination, key);
      report.observations.push({ case: 'independent two-tab cue and review date', cue: experiment.cue, reviewOn: experiment.reviewOn });
      assert.equal(experiment.reviewOn, '2027-01-01', 'A plan field edit must preserve the other tab\'s newer review date');
      pass('Queued plan edits preserve independently updated review dates');
    } finally { await context.close(); }
  }
  assert.deepEqual(report.errors, []);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = String(error.stack || error);
  throw error;
} finally {
  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
