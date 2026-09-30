/** Real browser regression checks. Start `npm run dev`, or set ODA_QA_URL to a preview server. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { courseCatalogFor } from '../src/data/courseCatalog.ts';

const BASE = process.env.ODA_QA_URL || 'http://localhost:3000';
const OUT = process.env.ODA_QA_OUT || 'artifacts/qa';
const APP_KEY = 'one_decision_away_app_data_v1';
const COURSE_KEY = 'oda_course_progress_v1';
mkdirSync(OUT, { recursive: true });
const report = { base: BASE, at: new Date().toISOString(), checks: [], accessibility: [], errors: [], screenshots: [] };
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
const check = (name) => { report.checks.push(name); console.log(`PASS ${name}`); };
const createPage = async (options = {}) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', timezoneId: 'Europe/Istanbul', serviceWorkers: 'block', ...options });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  return { page, context };
};
const stable = async page => {
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
};
const navigate = async (page, route) => {
  await page.goto(`${BASE}${route}`);
  await stable(page);
};
const noOverflow = async (page, name) => {
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(dimensions.scroll <= dimensions.width + 1, `${name}: horizontal overflow ${JSON.stringify(dimensions)}`);
  check(`${name}: no horizontal overflow`);
};
const capture = async (page, name, fullPage = false) => {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  report.screenshots.push(`${name}.png`);
};
const accessibility = async (page, name) => {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const violations = result.violations.map(item => ({ id: item.id, impact: item.impact, description: item.description, targets: item.nodes.map(node => node.target) }));
  report.accessibility.push({ name, violations });
  assert.equal(violations.filter(item => ['serious', 'critical'].includes(item.impact)).length, 0, `${name}: accessibility violations ${JSON.stringify(violations)}`);
  check(`${name}: no serious/critical axe findings`);
};
const data = async page => page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), APP_KEY);
const dismissDialogs = async page => {
  for (let index = 0; index < 4; index++) {
    if (!await page.getByRole('dialog').count()) break;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
  }
};

let activePage;
try {
  const { page, context } = await createPage(); activePage = page;
  await page.clock.setFixedTime(new Date('2026-09-30T21:30:00Z'));
  await navigate(page, '/');
  await capture(page, 'landing-mobile', true);
  await noOverflow(page, 'landing mobile');
  await accessibility(page, 'landing mobile');
  await navigate(page, '/app');
  await page.getByRole('button', { name: 'Skip the demo', exact: true }).click();
  await page.locator('#onboarding-name').fill('Maya');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const intention = page.getByRole('radio').first();
  await intention.focus(); await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('radio', { checked: true }).count(), 1);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  await page.locator('#onboarding-decision').fill('Open my outline and write one sentence');
  await page.reload(); await stable(page);
  assert.equal(await page.locator('#onboarding-decision').inputValue(), 'Open my outline and write one sentence');
  assert.ok(await page.getByText('Your setup was saved on this device.', { exact: false }).isVisible());
  check('interrupted onboarding restores name, intention and first decision');
  await capture(page, 'onboarding-mobile');
  await accessibility(page, 'onboarding final step');
  await page.getByRole('button', { name: 'Start my day', exact: true }).click();
  await page.locator('#set-one-decision').waitFor();
  await page.waitForTimeout(850);
  if (!await page.getByRole('dialog').count()) await page.getByRole('button', { name: /Plan for obstacles/ }).click();
  const dialog = page.getByRole('dialog');
  if (await dialog.count()) {
    const before = await page.evaluate(() => document.activeElement?.tagName);
    assert.ok(before);
    for (let index = 0; index < 15; index++) {
      await page.keyboard.press('Tab');
      assert.ok(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog[open]'))), 'modal focus escaped');
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    check('modal contains keyboard focus and Escape dismisses');
  }
  assert.equal((await data(page)).profile.displayName, 'Maya');
  assert.equal(await page.evaluate(() => localStorage.getItem('oda_onboarding_draft_v1')), null);
  assert.equal((await data(page)).missions.find(mission => mission.isOneDecision && mission.status === 'active').scheduledFor, '2026-10-01');
  check('onboarding decision uses local calendar date across UTC midnight');
  check('first decision saved and setup draft removed only after success');
  await page.getByRole('button', { name: 'Write a reflection', exact: true }).click();
  await page.locator('#daily-reflection-writing').fill('Starting with one sentence made the task manageable.');
  await page.getByRole('button', { name: 'Save to my notebook', exact: true }).click();
  await page.getByRole('button', { name: 'Edit reflection', exact: true }).waitFor();
  await page.reload(); await stable(page); await dismissDialogs(page);
  assert.ok((await data(page)).notebook.entries.some(entry => entry.content === 'Starting with one sentence made the task manageable.'));
  check('daily reflection survives reload and remains editable');
  await noOverflow(page, 'Today mobile');
  await accessibility(page, 'Today mobile');
  await capture(page, 'today-mobile', true);
  await page.locator('.oda-decision-done').click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('dialog').getByRole('button', { name: /Confirm|Complete|Keep/i }).last().click();
  await page.waitForTimeout(250);
  const completed = await data(page);
  const keptMission = completed.missions.find(mission => mission.isOneDecision && mission.status === 'completed');
  assert.ok(keptMission);
  assert.equal(completed.completions.filter(item => item.missionId === keptMission.id).length, 1);
  await page.reload(); await stable(page); await dismissDialogs(page);
  assert.equal((await data(page)).completions.filter(item => item.missionId === keptMission.id).length, 1);
  check('decision completion persists once across reload without duplicate reward');

  await navigate(page, '/app/courses');
  await page.locator('#course-search').fill('procrastination');
  assert.equal(await page.locator('.oda-course-row').count(), 1);
  await page.locator('.oda-course-row').click();
  await page.locator('.oda-course-lesson-title').waitFor();
  const studio = page.locator('.oda-practice details').first();
  if (!await studio.getAttribute('open')) await studio.locator('summary').first().click();
  await page.locator('#practice-procrastination-cue').fill('After I make my morning tea');
  await page.locator('#practice-procrastination-action').fill('Open my document and write one line');
  await page.locator('#practice-procrastination-fallback').fill('Open the document and add a heading');
  await page.locator('#practice-procrastination-evidence').fill('A line or heading exists in the document');
  await page.locator('#practice-procrastination-note').fill('I used the smaller version and started.');
  await page.locator('.oda-practice form').getByRole('button', { name: /Save|Record|Add/i }).click();
  await page.locator('#course-reflection').fill('An observable small start is useful to me.');
  const boxes = page.locator('.oda-course-practice input[type=checkbox]');
  await boxes.first().check();
  await page.reload(); await stable(page);
  // Selection is intentionally not stored in the URL; the catalog offers real continuation.
  if (await page.locator('.oda-course-row').count()) await page.locator('.oda-course-resume button').click();
  await page.locator('#course-reflection').waitFor();
  assert.equal(await page.locator('#course-reflection').inputValue(), 'An observable small start is useful to me.');
  assert.ok(await page.locator('.oda-course-practice input[type=checkbox]').first().isChecked());
  const progressBefore = (await data(page)).courseProgress;
  assert.equal(progressBefore.experiments.procrastination.action, 'Open my document and write one line');
  assert.equal(progressBefore.experiments.procrastination.attempts.length, 1);
  check('course plan, attempt, reflection and partial practice survive interruption');
  assert.ok(await page.locator('.oda-course-step').nth(1).isDisabled());
  for (const box of await page.locator('.oda-course-practice input[type=checkbox]').all()) await box.check();
  const lesson = courseCatalogFor('en').find(course => course.id === 'procrastination').lessons[0];
  await page.locator(`input[name="answer-${lesson.id}"]`).nth(lesson.correct).check();
  await page.getByRole('button', { name: 'Complete lesson', exact: true }).click();
  await page.getByRole('button', { name: 'Go to the next lesson', exact: true }).click();
  assert.equal(await page.locator('.oda-course-step[aria-current=step]').innerText(), '2');
  const snapshot = await data(page);
  assert.equal(snapshot.courseProgress.lessons[lesson.id].completed, true);
  assert.equal(snapshot.courseProgress.experiments.procrastination.attempts.length, 1);
  check('sequential course progression preserves plan in unified backup record');
  await capture(page, 'lesson-mobile', true);
  await noOverflow(page, 'lesson mobile');
  await accessibility(page, 'lesson mobile');

  await navigate(page, '/app/settings');
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup', exact: true }).click();
  const downloaded = await downloadEvent;
  const path = await downloaded.path();
  const backup = JSON.parse(readFileSync(path, 'utf8'));
  assert.equal(backup.courseProgress.experiments.procrastination.attempts.length, 1);
  assert.ok(backup.notebook.entries.some(entry => entry.content.includes('manageable')));
  check('downloaded backup contains course plan, attempts, progression and notebook');
  const beforeInvalid = await data(page);
  await page.locator('input[type=file]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await page.waitForTimeout(200);
  assert.deepEqual(await data(page), beforeInvalid);
  check('malformed restore leaves existing data intact');
  await page.locator('input[type=file]').setInputFiles({ name: 'oda-verified.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await page.getByRole('dialog').waitFor();
  await page.keyboard.press('Escape');
  assert.deepEqual(await data(page), beforeInvalid);
  check('cancelled restore leaves existing data intact');
  await page.locator('input[type=file]').setInputFiles({ name: 'oda-verified.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await page.getByRole('dialog').waitFor();
  await page.getByRole('dialog').getByRole('button', { name: /Replace|Restore|restore/i }).last().click();
  await page.waitForTimeout(250);
  assert.equal((await data(page)).courseProgress.experiments.procrastination.attempts.length, 1);
  check('confirmed backup restore retains applied course work');
  const storage = await context.storageState();
  await context.close();

  const { page: recovery, context: recoveryContext } = await createPage({ storageState: storage }); activePage = recovery;
  await recovery.goto(`${BASE}/app/support`);
  await recovery.evaluate(key => { const saved = JSON.parse(localStorage.getItem(key)); saved.lifeScores = [{}, {}]; localStorage.setItem(key, JSON.stringify(saved)); }, APP_KEY);
  await recovery.goto(`${BASE}/app/me`);
  await recovery.getByRole('button', { name: 'Download a recovery copy', exact: true }).waitFor();
  const retained = await data(recovery);
  assert.deepEqual(retained.lifeScores, [{}, {}]);
  assert.ok(retained.notebook.entries.some(entry => entry.content.includes('manageable')));
  const recoveryDownload = recovery.waitForEvent('download');
  await recovery.getByRole('button', { name: 'Download a recovery copy', exact: true }).click();
  const recoveryFile = await recoveryDownload;
  const recovered = JSON.parse(readFileSync(await recoveryFile.path(), 'utf8'));
  assert.deepEqual(JSON.parse(recovered.appRecord), retained);
  await recovery.getByRole('link', { name: 'Help and support', exact: true }).click();
  await recovery.locator('h1').first().waitFor();
  assert.equal(await recovery.getByRole('button', { name: 'Download a recovery copy', exact: true }).count(), 0);
  check('unexpected legacy rendering errors preserve data, offer recovery download and reach support');
  await recovery.evaluate(key => { const saved = JSON.parse(localStorage.getItem(key)); saved.missions = {}; localStorage.setItem(key, JSON.stringify(saved)); }, APP_KEY);
  const providerRecord = await data(recovery);
  await recovery.goto(`${BASE}/app`);
  await recovery.getByRole('button', { name: 'Download a recovery copy', exact: true }).waitFor();
  await recovery.getByRole('link', { name: 'Help and support', exact: true }).click();
  assert.ok(recovery.url().endsWith('/support.html'));
  await recovery.locator('h1').first().waitFor();
  assert.deepEqual(await data(recovery), providerRecord);
  assert.equal(await recovery.getByRole('button', { name: 'Download a recovery copy', exact: true }).count(), 0);
  check('support remains reachable outside the application when legacy data breaks provider initialization');
  await recoveryContext.close();

  for (const width of [320, 1440]) {
    const { page: layout, context: layoutContext } = await createPage({ viewport: { width, height: width === 320 ? 740 : 960 }, storageState: storage }); activePage = layout;
    await navigate(layout, '/app'); await dismissDialogs(layout);
    await noOverflow(layout, `Today ${width}px`);
    assert.equal(await layout.locator('.oda-tabbar').isVisible(), width < 768);
    check(`correct primary navigation at ${width}px`);
    await capture(layout, width === 320 ? 'today-320' : 'today-desktop');
    await navigate(layout, '/app/courses');
    await noOverflow(layout, `courses ${width}px`);
    await capture(layout, width === 320 ? 'courses-320' : 'courses-desktop');
    await navigate(layout, '/');
    await noOverflow(layout, `landing ${width}px`);
    if (width === 1440) { await capture(layout, 'landing-desktop', true); await accessibility(layout, 'landing desktop'); }
    await layout.evaluate(() => { localStorage.setItem('oda_theme', 'dark'); localStorage.setItem('oda_locale', 'tr'); });
    await navigate(layout, '/app/courses');
    if (await layout.locator('.oda-course-resume button').count()) await layout.locator('.oda-course-resume button').click();
    await layout.locator('.oda-course-lesson-title').waitFor();
    await noOverflow(layout, `Turkish dark lesson ${width}px`);
    await accessibility(layout, `Turkish dark lesson ${width}px`);
    if (width === 1440) await capture(layout, 'lesson-dark-desktop');
    await layout.evaluate(() => localStorage.setItem('oda_locale', 'es'));
    await navigate(layout, '/app/support');
    assert.equal(await layout.locator('html').getAttribute('lang'), 'es');
    await noOverflow(layout, `Spanish support ${width}px`);
    await accessibility(layout, `Spanish support ${width}px`);
    await layoutContext.close();
  }
  assert.deepEqual(report.errors, []);
  check('no uncaught browser errors across tested flows');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = String(error.stack || error);
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({ path: `${OUT}/failure.png`, fullPage: true }).catch(() => {});
    writeFileSync(`${OUT}/failure-body.txt`, await activePage.locator('body').innerText().catch(() => ''));
  }
  console.error(error);
  process.exitCode = 1;
} finally {
  writeFileSync(`${OUT}/browser-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
