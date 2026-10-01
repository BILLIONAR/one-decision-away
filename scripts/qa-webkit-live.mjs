/** Post-deployment core smoke: public TLS is strict; all records are fresh synthetic local data. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { platform, release } from 'node:os';
import { webkit, devices } from 'playwright';
import { coursesFor } from '../src/data/courses.ts';
import { courseLearningCopy } from '../src/data/courseLearningCopy.ts';

const BASE = 'https://billionar.github.io/one-decision-away/';
const ORIGIN = new URL(BASE).origin;
const OUT = process.env.ODA_LIVE_QA_OUT || 'artifacts/verification/webkit-live';
const KEY = 'one_decision_away_app_data_v1';
const require = createRequire(import.meta.url);
const sha256 = value => createHash('sha256').update(value).digest('hex');
mkdirSync(OUT, { recursive: true });
const report = {
  at: new Date().toISOString(), base: BASE, engine: 'webkit', expectedReleaseSha: process.env.ODA_RELEASE_SHA || null,
  host: { platform: platform(), release: release(), node: process.version },
  playwrightVersion: require('playwright/package.json').version, executablePath: webkit.executablePath(),
  localDependencyLaunch: process.env.ODA_WEBKIT_LOCAL_DEPS === '1', ignoreHTTPSErrors: false,
  checks: [], assets: [], screenshots: [], downloads: [], errors: [], blockedRequests: [],
  limits: ['Linux WebKit with mobile/touch emulation; no physical iPhone, real keyboard or native testing.',
    'Fresh signed-out local records only; no account signup, production database, payment or provider validation.',
    'No offline emulation. Expected release SHA is supplied by the caller; CI/deployment evidence separately binds it to publication.'],
};
let browser, context, page;
let phase = 'WebKit launch';
const assetMap = new Map();
const pass = name => { report.checks.push(name); console.log(`PASS ${name}`); };
const ready = async () => { await page.locator('h1').first().waitFor(); await page.evaluate(() => document.fonts.ready); };
const navigate = async path => { await page.goto(`${BASE}#${path}`); await ready(); };
const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key) || 'null'), KEY);
const persist = (predicate, args = {}) => page.waitForFunction(predicate, { key: KEY, ...args }, { timeout: 10000 });
const dismiss = async () => {
  for (let i = 0; i < 4 && await page.getByRole('dialog').count(); i++) {
    await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({ state: 'hidden' });
  }
};
const layout = async name => {
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  assert.equal(dimensions.width, 390); assert.ok(dimensions.scroll <= dimensions.width + 1, JSON.stringify(dimensions));
  pass(`${name}: 390px reflow`);
};
const screenshot = async name => { await page.screenshot({ path: `${OUT}/${name}.png` }); report.screenshots.push(`${name}.png`); };
const openWorkbook = async () => {
  const workbook = page.locator('#course-practice-studio');
  if (!await workbook.evaluate(element => element.open)) await workbook.locator('summary').tap();
  assert.equal(await workbook.evaluate(element => element.open), true);
};
const openCourse = async locale => {
  const course = coursesFor(locale).find(item => item.id === 'procrastination');
  await navigate('/app/courses');
  await page.locator('.oda-course-row, .oda-course-lesson-title').first().waitFor();
  if (await page.locator('.oda-course-row').count()) {
    await page.locator('#course-search').fill(course.title); assert.equal(await page.locator('.oda-course-row').count(), 1);
    await page.locator('.oda-course-row').tap();
  }
  await page.locator('.oda-course-lesson-title').waitFor();
  assert.equal(await page.locator('.oda-course-lesson-title').textContent(), course.lessons[0].title);
  return course;
};
try {
  if (report.expectedReleaseSha) assert.match(report.expectedReleaseSha, /^[a-f0-9]{40}$/);
  browser = await webkit.launch(report.localDependencyLaunch ? { executablePath: report.executablePath } : {});
  report.browserVersion = browser.version();
  const options = { ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, locale: 'en-US',
    timezoneId: 'America/New_York', reducedMotion: 'reduce', serviceWorkers: 'block', ignoreHTTPSErrors: false };
  context = await browser.newContext(options); report.context = { descriptor: 'iPhone 13', ...options };
  const initialStorage = await context.storageState(); assert.deepEqual(initialStorage, { cookies: [], origins: [] });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    const read = ['GET', 'HEAD'].includes(request.method());
    const allowed = read && url.protocol === 'https:' && (url.origin === ORIGIN || ['images.unsplash.com', 'plus.unsplash.com'].includes(url.hostname));
    if (allowed) await route.continue();
    else { report.blockedRequests.push({ method: request.method(), origin: url.origin, path: url.pathname }); await route.abort('blockedbyclient'); }
  });
  page = await context.newPage();
  page.on('pageerror', error => report.errors.push({ phase, message: error.message }));
  page.on('response', response => { const url = new URL(response.url());
    if (url.origin === ORIGIN && url.pathname.startsWith('/one-decision-away/assets/')) assetMap.set(url.href, { url: url.href, status: response.status() }); });
  phase = 'public English first use';
  const response = await page.goto(BASE); assert.equal(response.status(), 200); await ready();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  report.shell = { status: response.status(), url: response.url(), sha256: sha256(await response.body()),
    scripts: await page.locator('script[src]').evaluateAll(elements => elements.map(element => element.src)) };
  assert.ok(report.shell.scripts.some(url => url.startsWith(`${BASE}assets/`)));
  const mark = page.locator('.oda-brand-mark').first(); assert.ok(await mark.isVisible());
  assert.equal(await mark.locator('image').getAttribute('href'), '/one-decision-away/brand/oda-c4.png');
  const brand = await context.request.get(`${BASE}brand/oda-c4.png`); assert.equal(brand.status(), 200);
  report.brand = { url: brand.url(), status: brand.status(), sha256: sha256(await brand.body()) };
  assert.equal(report.brand.sha256, sha256(readFileSync(new URL('../public/brand/oda-c4.png', import.meta.url))));
  pass('public HTTPS shell starts in English and serves the original C4 image'); await layout('landing'); await screenshot('landing-live-390');
  await navigate('/app'); await page.getByRole('button', { name: 'Skip the demo', exact: true }).tap();
  await page.locator('#onboarding-name').fill('Synthetic Live QA');
  await page.getByRole('button', { name: 'Continue', exact: true }).tap(); await page.getByRole('radio').first().tap();
  await page.getByRole('button', { name: 'Continue', exact: true }).tap(); await page.getByRole('button', { name: 'Skip for now', exact: true }).tap();
  const decision = 'Write one synthetic live QA sentence', reflection = 'A synthetic first step was enough.';
  await page.locator('#onboarding-decision').fill(decision); await page.getByRole('button', { name: 'Start my day', exact: true }).tap();
  await page.locator('#set-one-decision').waitFor(); await page.getByRole('dialog').waitFor({ timeout: 5000 }); await dismiss();
  await persist(({ key }) => JSON.parse(localStorage.getItem(key))?.profile?.onboardingStep === 'completed');
  const mission = (await saved()).missions.find(item => item.isOneDecision && item.title === decision); assert.ok(mission);
  pass('fresh touch onboarding saves the selected local decision');
  await page.getByRole('button', { name: 'Write a reflection', exact: true }).tap(); await page.locator('#daily-reflection-writing').fill(reflection);
  await page.getByRole('button', { name: 'Save to my notebook', exact: true }).tap();
  await persist(({ key, reflection }) => JSON.parse(localStorage.getItem(key))?.notebook?.entries?.some(item => item.content === reflection), { reflection });
  assert.equal((await saved()).completions.filter(item => item.missionId === mission.id).length, 0);
  await page.locator('.oda-decision-done').tap(); await page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).tap();
  await persist(({ key, id }) => JSON.parse(localStorage.getItem(key))?.completions?.filter(item => item.missionId === id).length === 1, { id: mission.id });
  await page.getByRole('dialog').waitFor({ state: 'hidden' }); const completed = await saved();
  await page.reload(); await ready(); await dismiss(); const reloaded = await saved();
  assert.equal(reloaded.completions.filter(item => item.missionId === mission.id).length, 1);
  assert.deepEqual(reloaded.transactions, completed.transactions); assert.ok(reloaded.notebook.entries.some(item => item.content === reflection));
  assert.equal(await page.locator('.oda-decision-done').count(), 0);
  pass('reflection and one completion survive reload with unchanged rewards'); await layout('Today'); await screenshot('today-live-390');
  phase = 'public English workbook and local exports';
  const course = await openCourse('en'), copy = courseLearningCopy('en'); await openWorkbook();
  for (const [field, value] of Object.entries({ cue: 'After opening this synthetic test', action: 'Write one synthetic sentence', fallback: 'Write a heading', evidence: 'A synthetic sentence exists' })) await page.locator(`#practice-procrastination-${field}`).fill(value);
  await page.locator('#practice-procrastination-outcome').selectOption('adapted'); await page.locator('#practice-procrastination-note').fill('Synthetic live QA observation');
  await page.getByRole('button', { name: copy.addAttempt, exact: true }).tap(); await page.getByText(copy.entryAdded, { exact: true }).waitFor();
  await page.locator('#course-reflection').fill('An observable synthetic first step.');
  await page.locator('#practice-procrastination-recall').fill('Name a small observable step'); await page.locator('#practice-procrastination-next').fill('Keep the synthetic step small');
  await page.getByRole('button', { name: copy.saveReview, exact: true }).tap(); await page.getByText(copy.reviewSaved, { exact: true }).waitFor();
  await persist(({ key, id }) => { const progress = JSON.parse(localStorage.getItem(key))?.courseProgress;
    return progress?.lessons?.[id]?.reflection === 'An observable synthetic first step.' && progress.experiments?.procrastination?.attempts?.length === 1 && progress.experiments.procrastination.review.reviewedOn; }, { id: course.lessons[0].id });
  await page.reload(); await ready(); await openWorkbook();
  assert.equal(await page.locator('#practice-procrastination-action').inputValue(), 'Write one synthetic sentence');
  assert.equal(await page.locator('#practice-procrastination-next').inputValue(), 'Keep the synthetic step small');
  assert.equal(await page.locator('.oda-practice-journal li').count(), 1); assert.equal(await page.locator('.oda-course-step').nth(1).isDisabled(), true);
  pass('English workbook, adapted attempt and review survive reload without unlocking lesson two'); await layout('workbook'); await screenshot('workbook-live-390');
  const notesEvent = page.waitForEvent('download'); await page.getByRole('button', { name: copy.export, exact: true }).tap(); const notes = await notesEvent;
  const notesText = readFileSync(await notes.path(), 'utf8');
  for (const value of ['Write one synthetic sentence', 'Synthetic live QA observation', 'Keep the synthetic step small']) assert.ok(notesText.includes(value));
  assert.match(notes.suggestedFilename(), /^oda-procrastination-practice-\d{4}-\d{2}-\d{2}\.txt$/);
  writeFileSync(`${OUT}/practice-notes.txt`, notesText); report.downloads.push({ name: notes.suggestedFilename(), evidence: 'practice-notes.txt' });
  await navigate('/app/settings'); const backupEvent = page.waitForEvent('download'); await page.getByRole('button', { name: 'Download backup', exact: true }).tap();
  const backupDownload = await backupEvent, backupText = readFileSync(await backupDownload.path(), 'utf8'), backup = JSON.parse(backupText);
  assert.deepEqual(backup.courseProgress, (await saved()).courseProgress); assert.ok(backup.notebook.entries.some(item => item.content === reflection));
  assert.equal(backup.completions.filter(item => item.missionId === mission.id).length, 1);
  writeFileSync(`${OUT}/synthetic-backup.json`, backupText); report.downloads.push({ name: backupDownload.suggestedFilename(), evidence: 'synthetic-backup.json' });
  pass('live text and JSON downloads contain the actual saved synthetic records');
  for (const [locale, nativeName] of [['tr', 'Türkçe'], ['es', 'Español'], ['en', 'English']]) {
    phase = `public ${locale} locale switch`; await navigate('/app/settings');
    await page.locator('#language').getByRole('button', { name: new RegExp(nativeName) }).tap();
    await page.waitForFunction(locale => document.documentElement.lang === locale && localStorage.getItem('oda_locale') === locale, locale);
    await persist(({ key, locale }) => JSON.parse(localStorage.getItem(key))?.profile?.locale === locale, { locale });
    await openCourse(locale); await page.reload(); await ready(); assert.equal(await page.locator('html').getAttribute('lang'), locale);
    assert.equal(await page.locator('.oda-course-lesson-title').textContent(), coursesFor(locale).find(item => item.id === 'procrastination').lessons[0].title);
    await layout(`${locale} lesson`); pass(`${locale}: UI language selection and localized lesson survive reload`);
  }
  report.auth = await page.evaluate(() => ({ authTokenPresent: Object.keys(localStorage).some(key => /^sb-.*-auth-token$/.test(key) && JSON.parse(localStorage.getItem(key) || 'null')?.access_token) }));
  assert.equal(report.auth.authTokenPresent, false); assert.deepEqual(report.blockedRequests, []); assert.deepEqual(report.errors, []);
  assert.ok([...assetMap.values()].length > 0); assert.ok([...assetMap.values()].every(asset => asset.status === 304 || asset.status >= 200 && asset.status < 300));
  pass('all live checks remain signed out, request no provider writes and have no uncaught browser errors'); report.status = 'passed';
} catch (error) {
  report.status = browser ? 'failed' : 'blocked'; report.failurePhase = phase; report.failure = String(error.stack || error); process.exitCode = 1; console.error(error);
  if (page && !page.isClosed()) try { await screenshot('failure-live'); } catch (captureError) { report.captureError = String(captureError); }
} finally {
  report.assets = [...assetMap.values()]; writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  if (browser) await browser.close();
}
