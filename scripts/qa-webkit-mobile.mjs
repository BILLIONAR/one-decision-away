/**
 * Cloud WebKit + mobile/touch regression checks against a production preview.
 * Run: PLAYWRIGHT_BROWSERS_PATH=... node --import tsx scripts/qa-webkit-mobile.mjs
 * This uses the official Playwright WebKit engine on Linux. Device descriptors
 * and a shortened viewport do not constitute iOS, Xcode, or a real keyboard test.
 */
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { platform, release } from 'node:os';
import { createRequire } from 'node:module';
import { webkit, devices } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { getInitialDemoState } from '../src/services/repository.ts';
import { coursesFor } from '../src/data/courses.ts';
import { courseLearningCopy } from '../src/data/courseLearningCopy.ts';

const BASE = (process.env.ODA_QA_URL || 'http://localhost:4173').replace(/\/$/, '');
const HASH_ROUTES = new URL(BASE).pathname !== '/';
const routeUrl = path => HASH_ROUTES ? `${BASE}/#${path}` : `${BASE}${path}`;
const OUT = process.env.ODA_WEBKIT_QA_OUT || 'artifacts/webkit-mobile';
const KEY = 'one_decision_away_app_data_v1';
const require = createRequire(import.meta.url);
mkdirSync(OUT, { recursive: true });
const report = {
  at: new Date().toISOString(), base: BASE, hashRoutes: HASH_ROUTES, engine: 'webkit',
  host: { platform: platform(), release: release(), node: process.version },
  playwrightVersion: require('playwright/package.json').version,
  plannedCoverage: [
    'English first-use touch onboarding, interrupted draft, user-local date and successful setup',
    'Daily decision completion, reflection edit, reload and duplicate reward prevention',
    '390px/320px reflow, relevant 44px targets, light/dark and reduced-motion preferences',
    'Shortened viewport with focused textarea: space approximation only, not an iOS keyboard',
    'EN/TR/ES course reading, partial practice, saved plans, adapted attempts, review and text download',
    'Blocked storage draft retention/retry, sequential lesson carry-forward and JSON backup/restore',
    'Native and missing-dialog/inert fallback focus containment/return and accessible modal controls',
    'Detected service-worker capability, downloaded offline app/course persistence, backup and support',
    'Mobile axe serious/critical findings and uncaught runtime errors',
  ],
  limits: [
    'Linux WebKit engine with mobile/touch emulation; not Apple Safari or a real iPhone.',
    'Viewport shortening approximates available space; no real iOS software keyboard was exercised.',
    'No Xcode compilation, physical device, VoiceOver, StoreKit, or live cloud account was tested.',
  ],
  checks: [], contexts: [], accessibility: [], touchTargets: [], capabilities: [], screenshots: [], errors: [],
};
const pass = name => { report.checks.push(name); console.log(`PASS ${name}`); };
let browser;
let activePage;
let phase = 'WebKit launch';
const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), KEY);
const persist = (page, predicate, argument = {}) => page.waitForFunction(predicate, { key: KEY, ...argument }, { timeout: 10_000 });
const ready = async page => {
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
};
const navigate = async (page, path) => { await page.goto(routeUrl(path)); await ready(page); };
const dismiss = async page => {
  for (let count = 0; count < 4 && await page.getByRole('dialog').count(); count++) {
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
  }
};
const screenshot = async (page, name, fullPage = false) => {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  report.screenshots.push(`${name}.png`);
};
const layout = async (page, name, scan = true) => {
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(dimensions.scroll <= dimensions.width + 1, `${name}: overflow ${JSON.stringify(dimensions)}`);
  if (scan) {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const violations = result.violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target) }));
    report.accessibility.push({ name, violations });
    assert.equal(violations.filter(item => ['serious', 'critical'].includes(item.impact)).length, 0, `${name}: ${JSON.stringify(violations)}`);
  }
  pass(`${name}: reflow${scan ? ' and no serious/critical axe findings' : ''}`);
};
const targets = async (page, name, locators) => {
  const measured = [];
  for (const locator of locators) {
    for (const item of await locator.all()) {
      assert.ok(await item.isVisible(), `${name}: expected touch target is hidden`);
      const box = await item.boundingBox();
      const label = await item.getAttribute('aria-label') || (await item.innerText()).trim();
      measured.push({ label, width: box?.width, height: box?.height });
      assert.ok(box && box.width >= 43.5 && box.height >= 43.5, `${name}: touch target below 44px ${JSON.stringify(measured.at(-1))}`);
    }
  }
  assert.ok(measured.length > 0, `${name}: no targets measured`);
  report.touchTargets.push({ name, measured });
  pass(`${name}: relevant touch targets at least 44px`);
};
const context = async ({ name, seed, locale = 'en', width = 390, serviceWorkers = 'block', missingModal = false } = {}) => {
  const options = {
    ...devices['iPhone 13'], viewport: { width, height: width === 320 ? 740 : 844 },
    locale: 'en-US', timezoneId: 'America/New_York', reducedMotion: 'reduce', serviceWorkers,
  };
  const result = await browser.newContext(options);
  if (seed || locale !== 'en' || missingModal) await result.addInitScript(({ key, seed, locale, missingModal }) => {
    if (seed && !localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
    if (seed || locale !== 'en') localStorage.setItem('oda_locale', locale);
    if (missingModal) {
      HTMLDialogElement.prototype.showModal = undefined;
      HTMLDialogElement.prototype.close = undefined;
      delete HTMLElement.prototype.inert;
    }
  }, { key: KEY, seed, locale, missingModal });
  const page = await result.newPage(); activePage = page;
  page.on('pageerror', error => report.errors.push({ phase, message: error.message }));
  await page.goto(`${BASE}/`);
  const observed = await page.evaluate(() => ({
    userAgent: navigator.userAgent, width: innerWidth, height: innerHeight,
    maxTouchPoints: navigator.maxTouchPoints, coarsePointer: matchMedia('(pointer: coarse)').matches,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  }));
  assert.ok(observed.maxTouchPoints > 0 && observed.coarsePointer, 'Expected actual touch-enabled mobile context');
  assert.equal(observed.width, width);
  assert.equal(observed.reducedMotion, true);
  report.contexts.push({ name, descriptor: 'iPhone 13', isMobile: options.isMobile, hasTouch: options.hasTouch, viewport: options.viewport, locale: options.locale, timezoneId: options.timezoneId, serviceWorkers, observed });
  return { context: result, page };
};
const completedSeed = (locale = 'en', theme = 'light') => {
  const seed = getInitialDemoState();
  seed.profile = { ...seed.profile, displayName: 'WebKit QA', onboardingStep: 'completed', locale, theme, intent: 'finish', simpleModeOff: true, firstOpenedAt: '2026-08-01T00:00:00.000Z', createdAt: '2026-08-01T00:00:00.000Z' };
  return seed;
};
const openCourse = async (page, locale) => {
  const course = coursesFor(locale).find(item => item.id === 'procrastination');
  await navigate(page, '/app/courses');
  if (await page.locator('.oda-course-row').count()) {
    await page.locator('#course-search').waitFor();
    await page.locator('#course-search').fill(course.title);
    assert.equal(await page.locator('.oda-course-row').count(), 1);
    await page.locator('.oda-course-row').tap();
  }
  await page.locator('.oda-course-lesson-title').waitFor();
  return course;
};
const openWorkbook = async page => {
  const workbook = page.locator('#course-practice-studio');
  if (!await workbook.evaluate(element => element.open)) await workbook.locator('summary').first().tap();
  assert.equal(await workbook.evaluate(element => element.open), true);
};
const trapFocus = async (page, dialog) => {
  for (const key of ['Tab', 'Shift+Tab']) for (let index = 0; index < 12; index++) {
    await page.keyboard.press(key);
    assert.ok(await dialog.evaluate(element => element.contains(document.activeElement)), `${key} escaped the dialog`);
  }
};

try {
  // No Chromium fallback: engine unavailability is a blocking result.
  browser = await webkit.launch();
  report.browserVersion = browser.version();
  pass('official Playwright WebKit engine launched on the recorded cloud host');

  phase = 'English first use and daily practice';
  const first = await context({ name: 'fresh English iPhone-sized first use' });
  const page = first.page;
  await ready(page);
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  await layout(page, 'English landing 390px');
  await screenshot(page, 'landing-webkit-390');
  await navigate(page, '/app');
  await page.getByRole('button', { name: 'Skip the demo', exact: true }).tap();
  await page.locator('#onboarding-name').fill('Alex');
  await targets(page, 'onboarding', [page.getByRole('button', { name: 'Continue', exact: true })]);
  await page.getByRole('button', { name: 'Continue', exact: true }).tap();
  await page.getByRole('radio').first().tap();
  await page.getByRole('button', { name: 'Continue', exact: true }).tap();
  await page.getByRole('button', { name: 'Skip for now', exact: true }).tap();
  await page.locator('#onboarding-decision').fill('Open my draft and write one sentence');
  await persist(page, () => JSON.parse(localStorage.getItem('oda_onboarding_draft_v1'))?.decision === 'Open my draft and write one sentence');
  await page.reload(); await ready(page);
  assert.equal(await page.locator('#onboarding-decision').inputValue(), 'Open my draft and write one sentence');
  await page.getByText('Your setup was saved on this device.', { exact: false }).waitFor();
  pass('touch onboarding restores interrupted name/intention/decision draft');
  await layout(page, 'resumed onboarding 390px');
  await page.getByRole('button', { name: 'Start my day', exact: true }).tap();
  await page.locator('#set-one-decision').waitFor();
  await persist(page, ({ key }) => JSON.parse(localStorage.getItem(key))?.profile?.onboardingStep === 'completed');
  // The first-plan prompt is scheduled by the product after successful setup.
  await page.getByRole('dialog').waitFor({ timeout: 5000 });
  await dismiss(page);
  const initial = await saved(page);
  assert.equal(initial.profile.displayName, 'Alex');
  assert.equal(await page.evaluate(() => localStorage.getItem('oda_onboarding_draft_v1')), null);
  const mission = initial.missions.find(item => item.isOneDecision && item.title === 'Open my draft and write one sentence');
  assert.ok(mission);
  assert.equal(mission.scheduledFor, await page.evaluate(() => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`; }));
  pass('successful setup persists one chosen decision using the configured user-local day');
  await targets(page, 'Today 390px', [page.locator('.oda-tabbar button'), page.locator('.oda-decision-done'), page.locator('.oda-decision-action')]);
  await page.getByRole('button', { name: 'Write a reflection', exact: true }).tap();
  const reflection = page.locator('#daily-reflection-writing');
  await reflection.tap();
  await page.setViewportSize({ width: 390, height: 430 });
  await reflection.scrollIntoViewIfNeeded();
  assert.ok(await reflection.evaluate(element => element === document.activeElement));
  await reflection.fill('One sentence made this workable.');
  await layout(page, 'shortened viewport while reflection is focused', false);
  await page.getByRole('button', { name: 'Save to my notebook', exact: true }).tap();
  await persist(page, ({ key }) => JSON.parse(localStorage.getItem(key))?.notebook?.entries?.some(entry => entry.content === 'One sentence made this workable.'));
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal((await saved(page)).completions.filter(item => item.missionId === mission.id).length, 0);
  pass('focused textarea remains usable in shortened viewport; reflection saves without completing the decision');
  await page.locator('.oda-decision-done').tap();
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).tap();
  await persist(page, ({ key, id }) => JSON.parse(localStorage.getItem(key))?.completions?.filter(item => item.missionId === id).length === 1, { id: mission.id });
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  const once = await saved(page);
  await page.reload(); await ready(page); await dismiss(page);
  const reloaded = await saved(page);
  assert.equal(reloaded.completions.filter(item => item.missionId === mission.id).length, 1);
  assert.deepEqual(reloaded.transactions, once.transactions);
  assert.ok(reloaded.notebook.entries.some(entry => entry.content === 'One sentence made this workable.'));
  assert.equal(await page.locator('.oda-decision-done').count(), 0);
  await page.getByRole('button', { name: 'Edit reflection', exact: true }).tap();
  await reflection.fill('A sentence was enough to restart.');
  await page.getByRole('button', { name: 'Save to my notebook', exact: true }).tap();
  await persist(page, ({ key }) => JSON.parse(localStorage.getItem(key))?.notebook?.entries?.some(entry => entry.content === 'A sentence was enough to restart.'));
  assert.equal((await saved(page)).notebook.entries.filter(entry => entry.promptId === reloaded.notebook.entries.find(item => item.content === 'One sentence made this workable.').promptId).length, 1);
  assert.deepEqual((await saved(page)).transactions, once.transactions);
  pass('touch completion/reload/reflection edit preserves one completion, one writing record and unchanged rewards');
  await layout(page, 'Today light 390px');
  await screenshot(page, 'today-webkit-390', true);
  await page.setViewportSize({ width: 320, height: 740 });
  await layout(page, 'Today light 320px');
  await targets(page, 'mobile navigation 320px', [page.locator('.oda-tabbar button')]);
  await screenshot(page, 'today-webkit-320');
  await first.context.close();

  for (const locale of ['en', 'tr', 'es']) {
    phase = `${locale} course/workbook persistence`;
    const copy = courseLearningCopy(locale);
    const current = await context({ name: `${locale} course touch 390px`, seed: completedSeed(locale, locale === 'es' ? 'dark' : 'light'), locale });
    const page = current.page;
    const course = await openCourse(page, locale);
    assert.equal(await page.locator('.oda-course-lesson-title').textContent(), course.lessons[0].title);
    await layout(page, `${locale} reading 390px`);
    await openWorkbook(page);
    await page.locator('#practice-procrastination-cue').fill('After my morning tea');
    await page.locator('#practice-procrastination-action').fill('Write one sentence');
    await page.locator('#practice-procrastination-fallback').fill('Write a heading');
    await page.locator('#practice-procrastination-evidence').fill('A heading or sentence exists');
    await page.locator('#practice-procrastination-outcome').selectOption('adapted');
    await page.locator('#practice-procrastination-note').fill('I wrote a heading and stopped.');
    await page.getByRole('button', { name: copy.addAttempt, exact: true }).tap();
    await page.getByText(copy.entryAdded, { exact: true }).waitFor();
    await page.locator('#course-reflection').fill('Make the start observable.');
    await page.locator('.oda-course-practice input[type=checkbox]').first().check();
    await persist(page, ({ key, id }) => {
      const progress = JSON.parse(localStorage.getItem(key))?.courseProgress;
      return progress?.lessons?.[id]?.checked?.[0] && progress.lessons[id].reflection === 'Make the start observable.' && progress.experiments?.procrastination?.action === 'Write one sentence' && progress.experiments.procrastination.attempts.length === 1;
    }, { id: course.lessons[0].id });
    await page.reload(); await ready(page);
    await page.locator('#course-reflection').waitFor();
    assert.equal(await page.locator('#course-reflection').inputValue(), 'Make the start observable.');
    assert.equal(await page.locator('.oda-course-practice input[type=checkbox]').first().isChecked(), true);
    assert.equal(await page.locator('.oda-course-step').nth(1).isDisabled(), true);
    await openWorkbook(page);
    assert.equal(await page.locator('#practice-procrastination-action').inputValue(), 'Write one sentence');
    assert.equal(await page.locator('.oda-practice-journal li').count(), 1);
    pass(`${locale}: partial lesson, personal plan and ungraded adapted attempt survive reload without unlocking the next lesson`);
    await page.locator('#practice-procrastination-recall').fill('Name an observable first step');
    await page.locator('#practice-procrastination-next').fill('Put my notes beside the draft');
    await page.getByRole('button', { name: copy.saveReview, exact: true }).tap();
    await page.getByText(copy.reviewSaved, { exact: true }).waitFor();
    await persist(page, ({ key }) => {
      const review = JSON.parse(localStorage.getItem(key))?.courseProgress?.experiments?.procrastination?.review;
      return Boolean(review?.reviewedOn) && review.nextAction === 'Put my notes beside the draft';
    });
    const notesEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: copy.export, exact: true }).tap();
    const notes = await notesEvent;
    const text = readFileSync(await notes.path(), 'utf8');
    assert.match(notes.suggestedFilename(), /^oda-procrastination-practice-\d{4}-\d{2}-\d{2}\.txt$/);
    for (const value of ['Write one sentence', 'I wrote a heading and stopped.', 'Put my notes beside the draft']) assert.ok(text.includes(value));
    await page.reload(); await ready(page); await openWorkbook(page);
    assert.equal(await page.locator('#practice-procrastination-next').inputValue(), 'Put my notes beside the draft');
    pass(`${locale}: review persists and downloaded private notes contain the actual saved plan/attempt/adjustment`);
    await targets(page, `${locale} workbook`, [page.getByRole('button', { name: copy.addAttempt, exact: true }), page.getByRole('button', { name: copy.saveReview, exact: true }), page.getByRole('button', { name: copy.export, exact: true })]);
    await layout(page, `${locale} workbook 390px${locale === 'es' ? ' dark' : ''}`);
    if (locale === 'en') {
      await page.locator('#practice-procrastination-plan').evaluate(element => element.scrollIntoView({ block: 'start' }));
      await screenshot(page, 'workbook-webkit-390');
      await page.setViewportSize({ width: 320, height: 740 });
      await layout(page, 'workbook 320px');
      await screenshot(page, 'workbook-webkit-320');
      await page.setViewportSize({ width: 390, height: 844 });
      const before = await saved(page);
      await page.evaluate(key => {
        window.odaWebKitOriginalSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function(storageKey, value) {
          if (storageKey === key) throw new DOMException('Synthetic WebKit storage failure', 'QuotaExceededError');
          return window.odaWebKitOriginalSetItem.call(this, storageKey, value);
        };
      }, KEY);
      await page.locator('#practice-procrastination-action').fill('A draft retained after blocked storage');
      await page.getByRole('button', { name: copy.retrySave, exact: true }).waitFor();
      assert.equal(await page.locator('#practice-procrastination-action').inputValue(), 'A draft retained after blocked storage');
      assert.deepEqual((await saved(page)).courseProgress, before.courseProgress);
      await page.evaluate(() => { Storage.prototype.setItem = window.odaWebKitOriginalSetItem; delete window.odaWebKitOriginalSetItem; });
      await page.getByRole('button', { name: copy.retrySave, exact: true }).tap();
      await persist(page, ({ key }) => JSON.parse(localStorage.getItem(key))?.courseProgress?.experiments?.procrastination?.action === 'A draft retained after blocked storage');
      pass('WebKit blocked storage preserves the old record and visible draft; retry commits after storage recovers');
      for (const checkbox of await page.locator('.oda-course-practice input[type=checkbox]').all()) await checkbox.check();
      await page.locator(`input[name="answer-${course.lessons[0].id}"]`).nth(course.lessons[0].correct).check();
      await page.getByRole('button', { name: 'Complete lesson', exact: true }).tap();
      await persist(page, ({ key, id }) => JSON.parse(localStorage.getItem(key))?.courseProgress?.lessons?.[id]?.completed === true, { id: course.lessons[0].id });
      await page.getByRole('button', { name: 'Go to the next lesson', exact: true }).tap();
      assert.equal(await page.locator('.oda-course-step[aria-current=step]').innerText(), '2');
      await openWorkbook(page);
      assert.equal(await page.locator('#practice-procrastination-action').inputValue(), 'A draft retained after blocked storage');
      pass('touch sequential lesson progression carries the saved real-life workbook forward');
      phase = 'WebKit backup/restore touch flow';
      await navigate(page, '/app/settings');
      const backupEvent = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Download backup', exact: true }).tap();
      const backup = JSON.parse(readFileSync(await (await backupEvent).path(), 'utf8'));
      assert.equal(backup.courseProgress.experiments.procrastination.attempts.length, 1);
      assert.equal(backup.courseProgress.lessons[course.lessons[0].id].completed, true);
      const beforeImport = await saved(page);
      await page.locator('input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
      await page.getByText('Could not read the backup file.', { exact: true }).waitFor();
      assert.deepEqual(await saved(page), beforeImport);
      const restored = structuredClone(backup); restored.profile.displayName = 'Reviewed WebKit import';
      const upload = () => page.locator('input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'oda-reviewed.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(restored)) });
      await upload(); await page.getByRole('dialog').waitFor(); await trapFocus(page, page.getByRole('dialog'));
      await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'hidden' });
      assert.deepEqual(await saved(page), beforeImport);
      await upload(); await page.getByRole('dialog').getByRole('button', { name: 'Replace saved record', exact: true }).tap();
      await persist(page, ({ key }) => JSON.parse(localStorage.getItem(key))?.profile?.displayName === 'Reviewed WebKit import');
      await page.getByText('Backup restored. Welcome back.', { exact: true }).waitFor();
      await page.reload(); await ready(page);
      assert.deepEqual((await saved(page)).courseProgress, restored.courseProgress);
      pass('WebKit JSON download, malformed/cancelled restore and confirmed replacement preserve course work through reload');
    }
    await current.context.close();
  }

  for (const fallback of [false, true]) {
    phase = fallback ? 'WebKit missing-dialog/inert fallback' : 'WebKit native dialog';
    const current = await context({ name: phase, seed: completedSeed(), width: fallback ? 320 : 390, missingModal: fallback });
    const page = current.page;
    await navigate(page, '/app');
    await page.locator('#today-decision-input').fill('Read two pages');
    await page.getByRole('button', { name: 'Set decision', exact: true }).tap();
    const dialog = page.getByRole('dialog'); await dialog.waitFor();
    assert.equal(await dialog.evaluate(element => element.tagName), fallback ? 'DIV' : 'DIALOG');
    await persist(page, ({ key }) => JSON.parse(localStorage.getItem(key))?.missions?.some(item => item.title === 'Read two pages'));
    await trapFocus(page, dialog);
    await layout(page, `${fallback ? 'fallback' : 'native'} dialog ${fallback ? 320 : 390}px`);
    await targets(page, `${fallback ? 'fallback' : 'native'} modal close`, [dialog.getByRole('button', { name: 'Close', exact: true })]);
    await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
    const trigger = page.getByRole('button', { name: /Plan for obstacles/ });
    await trigger.focus(); await trigger.tap(); await dialog.waitFor();
    await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
    assert.ok(await trigger.evaluate(element => element === document.activeElement));
    await trigger.tap(); await dialog.waitFor();
    await dialog.getByRole('button', { name: 'Close', exact: true }).tap();
    await dialog.waitFor({ state: 'hidden' });
    assert.ok(await trigger.evaluate(element => element === document.activeElement));
    assert.ok((await saved(page)).missions.some(item => item.title === 'Read two pages'));
    if (fallback) assert.equal(await page.locator('.oda-sidebar').getAttribute('aria-hidden'), null);
    pass(`${fallback ? 'fallback' : 'native'} WebKit modal contains forward/backward focus, reopens, closes and restores focus without changing the decision`);
    await current.context.close();
  }

  phase = 'WebKit offline and service worker capability';
  const offline = await context({ name: 'WebKit offline mobile', seed: completedSeed(), serviceWorkers: 'allow' });
  const pageOffline = offline.page;
  const capabilities = await pageOffline.evaluate(() => ({ serviceWorker: 'serviceWorker' in navigator, cacheStorage: 'caches' in window, webLocks: 'locks' in navigator }));
  report.capabilities.push({ name: 'WebKit offline', ...capabilities });
  if (!capabilities.serviceWorker || !capabilities.cacheStorage) {
    report.limits.push('This WebKit runtime does not expose service workers/cache storage; offline reload could not be exercised.');
    pass('WebKit offline capability is explicitly detected and reported without substituting another engine');
  } else {
    await navigate(pageOffline, '/app');
    await pageOffline.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 20_000 });
    await pageOffline.reload(); await ready(pageOffline);
    await openCourse(pageOffline, 'en');
    await navigate(pageOffline, '/app/settings');
    await pageOffline.getByRole('button', { name: 'Download backup', exact: true }).waitFor();
    await navigate(pageOffline, '/app/support'); await pageOffline.locator('#support-contact').waitFor();
    await offline.context.setOffline(true);
    await navigate(pageOffline, '/app');
    await pageOffline.locator('#today-decision-input').fill('Open my saved notes offline');
    await pageOffline.getByRole('button', { name: 'Set decision', exact: true }).tap();
    await persist(pageOffline, ({ key }) => JSON.parse(localStorage.getItem(key))?.missions?.some(item => item.title === 'Open my saved notes offline'));
    await dismiss(pageOffline); await pageOffline.reload(); await ready(pageOffline);
    await pageOffline.getByText('Open my saved notes offline', { exact: true }).waitFor();
    await openCourse(pageOffline, 'en');
    await pageOffline.locator('#course-reflection').fill('An offline first step stays small.');
    const firstLesson = coursesFor('en').find(item => item.id === 'procrastination').lessons[0];
    await persist(pageOffline, ({ key, id }) => JSON.parse(localStorage.getItem(key))?.courseProgress?.lessons?.[id]?.reflection === 'An offline first step stays small.', { id: firstLesson.id });
    await pageOffline.reload(); await ready(pageOffline);
    assert.equal(await pageOffline.locator('#course-reflection').inputValue(), 'An offline first step stays small.');
    pass('WebKit downloaded app/course reload offline and retain a new decision and lesson reflection');
    await navigate(pageOffline, '/app/settings');
    const offlineBackup = pageOffline.waitForEvent('download');
    await pageOffline.getByRole('button', { name: 'Download backup', exact: true }).tap();
    const offlineRecord = JSON.parse(readFileSync(await (await offlineBackup).path(), 'utf8'));
    assert.equal(offlineRecord.courseProgress.lessons[firstLesson.id].reflection, 'An offline first step stays small.');
    await navigate(pageOffline, '/app/support'); await pageOffline.locator('#support-contact').waitFor();
    await pageOffline.goto(`${BASE}/support.html`); await pageOffline.locator('#contact-en').waitFor();
    await pageOffline.goto(routeUrl('/app')); await pageOffline.locator('#set-one-decision').waitFor();
    await pageOffline.getByText('Open my saved notes offline', { exact: true }).waitFor();
    await screenshot(pageOffline, 'today-webkit-offline');
    pass('WebKit offline backup and both support routes work without overwriting the cached app shell');
  }
  await offline.context.close();
  assert.deepEqual(report.errors, [], 'Unexpected WebKit runtime errors');
  pass('all exercised mobile/touch WebKit flows have no uncaught runtime errors');
  report.status = 'passed';
} catch (error) {
  report.status = browser ? 'failed' : 'blocked'; report.failurePhase = phase; report.failure = String(error.stack || error);
  if (!browser) report.blockingReason = 'The required WebKit engine could not launch. No application checks were run and no alternate browser was substituted.';
  if (activePage && !activePage.isClosed()) {
    try { await screenshot(activePage, 'failure', true); } catch (captureError) { report.captureError = String(captureError); }
  }
  console.error(error); process.exitCode = 1;
} finally {
  writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  if (browser) await browser.close();
}
