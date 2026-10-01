/** Built-preview backup reminder integration; fresh synthetic local records only. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { getInitialDemoState } from '../src/services/repository.ts';
import { applyNotebookAction } from '../src/services/notebook.ts';
import { courseCatalogFor } from '../src/data/courseCatalog.ts';
import { dailyLoopCopy } from '../src/i18n/dailyLoop.ts';
import { backupReminderCopy } from '../src/i18n/backupReminder.ts';
import { readPersonalRecordFixture } from './qa-personal-record-fixtures.mjs';

const requested = new URL(process.env.ODA_QA_URL || 'http://127.0.0.1:4182/one-decision-away/');
requested.hash = ''; requested.search = '';
const base = requested.href.replace(/\/$/, '');
const hashRoutes = requested.pathname !== '/';
const routeUrl = path => hashRoutes ? `${base}/#${path}` : `${base}${path}`;
const out = process.env.ODA_BACKUP_PROTECTION_OUT || 'artifacts/verification/premium-backup';
const key = 'one_decision_away_app_data_v1';
const now = new Date('2026-10-01T12:00:00Z');
const journalText = 'Synthetic backup check: one saved sentence is worth keeping.';
const caseFilter = process.env.ODA_BACKUP_PROTECTION_CASE || '';
const report = {
  at: new Date().toISOString(), base, engine: 'chromium', fixtureDate: now.toISOString(),
  scope: 'Fresh signed-out browser contexts and synthetic local records; all provider and write requests blocked.',
  limits: ['Chromium viewport checks only; no real iPhone, native iOS or WebKit claim.', 'No account, cloud synchronization or production user data tested.'],
  caseFilter: caseFilter || null,
  checks: [], cases: [], failures: [], errors: [], blockedRequests: [], layouts: [], accessibility: [], screenshots: [],
};
mkdirSync(out, { recursive: true });
const hash = value => createHash('sha256').update(value).digest('hex');
report.sourceFiles = Object.fromEntries(['src/components/BackupReminder.tsx', 'src/services/backupReminder.ts', 'src/i18n/backupReminder.ts', 'src/pages/Today.tsx'].map(file => [file, hash(readFileSync(file))]));
const pass = name => { report.checks.push(name); console.log(`PASS ${name}`); };
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const seedFor = ({ locale = 'en', chosen = false, priorChoice = false, written = false, returning = false } = {}) => {
  let seed = structuredClone(getInitialDemoState());
  seed.profile = { ...seed.profile, onboardingStep: 'completed', displayName: 'Synthetic Backup QA', locale, theme: 'light', simpleModeOff: false, firstOpenedAt: returning ? '2026-08-01T12:00:00Z' : now.toISOString(), createdAt: now.toISOString(), lastOpenedAt: now.toISOString() };
  if (chosen || priorChoice) seed.missions.push({ id: 'backup-qa-choice', userId: seed.profile.id, title: 'Synthetic decision: write one line', type: 'daily_quest', area: 'Custom', difficulty: 'easy', isOneDecision: true, status: 'active', scheduledFor: priorChoice ? '2026-09-25' : '2026-10-01', createdAt: priorChoice ? '2026-09-25T10:00:00Z' : now.toISOString() });
  if (written) seed = applyNotebookAction(seed, { type: 'save_entry', input: { kind: 'journal', content: journalText } }, now).data;
  return seed;
};
let browser, activePage, activeCase = 'startup';
const ready = async page => {
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
};
const goto = async (page, path) => { await page.goto(routeUrl(path)); await ready(page); };
const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), key);
const persist = (page, predicate, fields = {}) => page.waitForFunction(predicate, { key, ...fields });
const screenshot = async (page, name, panel = false) => {
  const file = `${slug(name)}.png`;
  await (panel ? page.locator('.oda-backup-reminder') : page).screenshot({ path: `${out}/${file}` });
  report.screenshots.push(file);
};
const assertReminder = async page => {
  const reminder = page.locator('.oda-backup-reminder');
  await reminder.waitFor({ state: 'visible' });
  assert.equal(await reminder.count(), 1);
  assert.equal((await saved(page)).profile.simpleModeOff, false);
  const placement = await reminder.evaluate(element => ({
    inClosedDetails: Boolean(element.closest('details:not([open])')),
    afterWeek: element.previousElementSibling === document.querySelector('.oda-growth-week'),
    beforePractice: element.nextElementSibling === document.querySelector('.oda-daily-practice'),
  }));
  assert.deepEqual(placement, { inClosedDetails: false, afterWeek: true, beforePractice: true });
  const rituals = page.locator('section > button[aria-expanded]').filter({ has: page.locator('h2') });
  const count = await rituals.count();
  assert.ok(count <= 1);
  if (count) {
    assert.equal(await rituals.getAttribute('aria-expanded'), 'false');
    assert.equal(await rituals.evaluate(button => button.closest('section').contains(document.querySelector('.oda-backup-reminder'))), false);
  } else assert.equal((await saved(page)).profile.firstOpenedAt, now.toISOString(), 'Only the first-week fixture should hide the ritual controls entirely');
};
const runCase = async (name, options, testCase) => {
  if (caseFilter && !name.includes(caseFilter)) return;
  activeCase = name;
  const started = Date.now();
  let context;
  try {
    context = await browser.newContext({ viewport: { width: options.width || 390, height: 844 }, timezoneId: 'UTC', reducedMotion: 'reduce', serviceWorkers: 'block' });
    await context.route('**/*', route => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin === requested.origin && ['GET', 'HEAD'].includes(request.method())) return route.continue();
      report.blockedRequests.push({ case: name, method: request.method(), origin: url.origin, path: url.pathname });
      return route.abort('blockedbyclient');
    });
    const seed = seedFor(options);
    await context.addInitScript(({ key, seed, locale }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
      localStorage.setItem('oda_locale', locale);
      localStorage.setItem('oda_rituals_open', '0');
      localStorage.setItem('oda_plan_prompted', 'backup-qa-choice');
    }, { key, seed, locale: options.locale || 'en' });
    const page = await context.newPage(); activePage = page;
    page.setDefaultTimeout(8000); page.setDefaultNavigationTimeout(15000);
    await page.clock.setFixedTime(now);
    page.on('pageerror', error => report.errors.push({ case: name, message: error.message }));
    await testCase(page, context);
    report.cases.push({ name, status: 'passed', durationMs: Date.now() - started });
    pass(name);
  } catch (error) {
    const failure = { name, error: String(error.stack || error), durationMs: Date.now() - started };
    report.failures.push(failure); report.cases.push({ name, status: 'failed', durationMs: failure.durationMs });
    console.error(`FAIL ${name}: ${error.message}`);
    if (activePage && !activePage.isClosed()) {
      try { await screenshot(activePage, `failure-${name}`); } catch { /* Preserve the original failure. */ }
      try {
        const projection = await saved(activePage), canonical = await readPersonalRecordFixture(activePage);
        failure.savedWeeklyReviews = projection?.weeklyReviews ?? null;
        failure.canonicalWeeklyReviews = canonical?.weeklyReviews ?? null;
        failure.weeklyText = await activePage.locator('.oda-weekly-outcome').count() ? await activePage.locator('.oda-weekly-outcome').innerText() : null;
      } catch { /* Preserve the original failure. */ }
    }
  } finally { if (context) await context.close(); activePage = undefined; }
};

try {
  browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });
  report.browserVersion = browser.version();
  await runCase('Blank startup seeds show no reminder', {}, async page => {
    const response = await page.goto(routeUrl('/app')); assert.equal(response.status(), 200); await ready(page);
    report.shell = { status: response.status(), sha256: hash(await response.body()), scripts: await page.locator('script[src]').evaluateAll(items => items.map(item => item.src)) };
    assert.equal(await page.locator('.oda-backup-reminder').count(), 0);
    const record = await saved(page);
    assert.equal(record.notebook.entries.length, 0); assert.equal(Object.keys(record.courseProgress.lessons).length, 0);
  });
  await runCase('First journal save shows one reminder outside closed rituals in simple mode', { chosen: true }, async page => {
    await goto(page, '/app'); assert.equal(await page.locator('.oda-backup-reminder').count(), 0);
    await page.getByRole('button', { name: dailyLoopCopy('en').reflectNow, exact: true }).click();
    await page.locator('#daily-reflection-writing').fill(journalText);
    await page.getByRole('button', { name: dailyLoopCopy('en').saveReflection, exact: true }).click();
    await persist(page, ({ key, journalText }) => JSON.parse(localStorage.getItem(key)).notebook.entries.some(entry => entry.content === journalText), { journalText });
    await assertReminder(page); await screenshot(page, 'first-journal-reminder', true);
  });
  await runCase('First course reflection qualifies without notebook or decision completions', {}, async page => {
    await goto(page, '/app'); assert.equal(await page.locator('.oda-backup-reminder').count(), 0);
    await goto(page, '/app/courses');
    await page.locator('#course-search').fill('procrastination'); await page.locator('.oda-course-row').click();
    const text = 'Synthetic course reflection: choose an observable first step.';
    await page.locator('#course-reflection').fill(text);
    const lessonId = courseCatalogFor('en').find(course => course.id === 'procrastination').lessons[0].id;
    await persist(page, ({ key, lessonId, text }) => JSON.parse(localStorage.getItem(key)).courseProgress.lessons[lessonId]?.reflection === text, { lessonId, text });
    await goto(page, '/app'); await assertReminder(page);
    const record = await saved(page); assert.equal(record.notebook.entries.length, 0); assert.equal(record.completions.length, 0);
  });
  await runCase('First weekly review qualifies with zero kept decisions', { priorChoice: true }, async page => {
    await goto(page, '/app'); assert.equal(await page.locator('.oda-backup-reminder').count(), 0);
    await page.getByRole('button', { name: dailyLoopCopy('en').reviewOpen, exact: true }).click();
    const change = 'Synthetic weekly adjustment: choose one smaller step.';
    await page.locator('#weekly-outcome-change').fill(change);
    await page.getByRole('button', { name: dailyLoopCopy('en').saveReview, exact: true }).click();
    await persist(page, ({ key, change }) => JSON.parse(localStorage.getItem(key)).weeklyReviews?.some(review => review.change === change && review.kept === 0), { change });
    await assertReminder(page); await screenshot(page, 'first-weekly-reminder', true);
  });
  for (const locale of ['en', 'tr', 'es']) for (const width of [320, 390]) {
    await runCase(`${locale} reminder at ${width}px has localized copy and no overflow`, { locale, width, written: true, returning: width === 390 }, async page => {
      await goto(page, '/app'); await assertReminder(page);
      const reminder = page.locator('.oda-backup-reminder'), copy = backupReminderCopy(locale);
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      assert.ok((await reminder.innerText()).includes(copy.title)); assert.ok((await reminder.innerText()).includes(copy.local));
      for (const label of [copy.download, copy.cloudSync, copy.dismiss]) {
        const button = reminder.getByRole('button', { name: label, exact: true });
        const box = await button.boundingBox(); assert.ok(box && box.width >= 43.5 && box.height >= 43.5, `${label}: ${JSON.stringify(box)}`);
      }
      const geometry = await reminder.evaluate(element => ({ viewport: document.documentElement.clientWidth, pageScroll: document.documentElement.scrollWidth, panelWidth: element.clientWidth, panelScroll: element.scrollWidth }));
      report.layouts.push({ locale, width, ...geometry });
      assert.equal(geometry.viewport, width); assert.ok(geometry.pageScroll <= width + 1); assert.ok(geometry.panelScroll <= geometry.panelWidth + 1);
      if (locale === 'en' && width === 320 || locale === 'es' && width === 390) {
        const results = await new AxeBuilder({ page }).include('.oda-backup-reminder').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        report.accessibility.push({ locale, width, violations: results.violations });
        assert.equal(results.violations.filter(issue => ['serious', 'critical'].includes(issue.impact)).length, 0);
      }
      await screenshot(page, `reminder-${locale}-${width}`, true);
    });
  }
  await runCase('Real JSON export contains saved work, writes freshness marker and hides reminder', { written: true }, async page => {
    await goto(page, '/app'); await assertReminder(page);
    const event = page.waitForEvent('download');
    await page.locator('.oda-backup-reminder').getByRole('button', { name: backupReminderCopy('en').download, exact: true }).click();
    const download = await event; await download.saveAs(`${out}/synthetic-export.json`);
    assert.match(download.suggestedFilename(), /^one-decision-away-backup-\d{4}-\d{2}-\d{2}\.json$/);
    const exported = JSON.parse(readFileSync(`${out}/synthetic-export.json`, 'utf8'));
    assert.ok(exported.notebook.entries.some(entry => entry.content === journalText));
    await page.waitForFunction(() => localStorage.getItem('oda_last_backup') !== null);
    assert.equal(await page.evaluate(() => localStorage.getItem('oda_last_backup')), now.toISOString());
    await page.locator('.oda-backup-reminder').waitFor({ state: 'detached' });
    await page.reload(); await ready(page); assert.equal(await page.locator('.oda-backup-reminder').count(), 0);
  });
  await runCase('Session dismissal survives routes and reload while a new tab remains eligible', { written: true }, async (page, context) => {
    await goto(page, '/app'); await assertReminder(page);
    await page.locator('.oda-backup-reminder').getByRole('button', { name: backupReminderCopy('en').dismiss, exact: true }).click();
    await page.locator('.oda-backup-reminder').waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => sessionStorage.getItem('oda_backup_nudge_hidden')), '1');
    await goto(page, '/app/courses'); await page.locator('#course-search').waitFor();
    await goto(page, '/app'); assert.equal(await page.locator('.oda-backup-reminder').count(), 0);
    await page.reload(); await ready(page); assert.equal(await page.locator('.oda-backup-reminder').count(), 0);
    const second = await context.newPage(); second.setDefaultTimeout(8000); second.on('pageerror', error => report.errors.push({ case: activeCase, message: error.message }));
    await second.clock.setFixedTime(now); await goto(second, '/app'); await assertReminder(second); await second.close();
  });
  await runCase('Reminder Cloud sync action reaches working Settings backup controls', { written: true }, async page => {
    await goto(page, '/app'); await assertReminder(page);
    await page.locator('.oda-backup-reminder').getByRole('button', { name: backupReminderCopy('en').cloudSync, exact: true }).click();
    await page.locator('#language').waitFor(); assert.ok(page.url().includes('/app/settings'));
    assert.equal(await page.getByRole('button', { name: 'Download backup', exact: true }).count(), 1);
    await screenshot(page, 'settings-from-reminder');
  });
  assert.deepEqual(report.errors, []); pass('No uncaught runtime errors across exercised backup flows');
  assert.equal(report.blockedRequests.filter(request => !['GET', 'HEAD'].includes(request.method) || /supabase|revenuecat/.test(request.origin)).length, 0);
  pass('Fresh contexts attempt no provider or write requests');
} catch (error) {
  report.failures.push({ name: activeCase, error: String(error.stack || error) }); console.error(error);
} finally {
  report.status = report.failures.length || report.errors.length ? 'failed' : 'passed'; report.completedAt = new Date().toISOString();
  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
  if (browser) await browser.close();
}
console.log(`${report.status.toUpperCase()}: ${report.checks.length} checks, ${report.failures.length} failures. ${out}/report.json`);
if (report.status !== 'passed') process.exitCode = 1;
