import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createHash } from 'node:crypto';

const repo = process.env.ODA_QA_REPO || '/workspace/oda-purchase-identity-fix';
const require = createRequire(`${repo}/package.json`);
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const { getInitialDemoState } = await import(`${repo}/src/services/repository.ts`);
const { firstRunCopy } = await import(`${repo}/src/i18n/firstRun.ts`);
const { coursesFor } = await import(`${repo}/src/data/courses.ts`);
const { courseCatalogFor } = await import(`${repo}/src/data/courseCatalog.ts`);
const { readPersonalRecordFixture, patchPersonalRecordFixture } = await import(`${repo}/scripts/qa-personal-record-fixtures.mjs`);
const base = process.env.ODA_QA_URL || 'http://127.0.0.1:4188/one-decision-away/#';
const out = resolve(process.env.ODA_QA_OUT || '/workspace/scratch/oda-purchase-identity-browser');
assert.ok(['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname), 'This QA is local only.');
const relevantSource = ['src/main.tsx','src/services/cloudSync.ts','src/services/purchases.ts','src/services/purchaseIdentityBinding.ts','src/pages/Upgrade.tsx','src/i18n/purchases.ts','src/services/native.ts'];
const hashSources = () => relevantSource.map(file => ({ file, sha256:createHash('sha256').update(readFileSync(`${repo}/${file}`)).digest('hex') }));
const sourceAtStart = hashSources();
const APP_KEY = 'one_decision_away_app_data_v1';
const DRAFT_KEY = 'oda_onboarding_draft_v1';
mkdirSync(out, { recursive: true });
const report = {
  syntheticFixtures: true,
  scope:'Bounded local web boot/course continuity after purchase identity fix; no native SDK/payment tests',
  sourceAtStart,
  noProductionOrExternalWrites: true,
  base, repo, at: new Date().toISOString(),
  entryChecks: [],
  buildIndex: readFileSync(`${repo}/dist/index.html`, 'utf8').match(/assets\/index-[^" ]+\.js/)?.[0],
  checks: [], screenshots: [], accessibility: [], layouts: [], pageErrors: [], blockedExternalRequests: [],
};
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox'] });
const pass = name => { report.checks.push(name); console.log(`PASS ${name}`); };
const fixture = (locale = 'en', completed = false) => {
  const seed = getInitialDemoState();
  seed.profile = { ...seed.profile, locale, theme: 'light', displayName: completed ? 'Synthetic QA' : '',
    onboardingStep: completed ? 'completed' : 'welcome', intent: 'finish', simpleModeOff: true,
    reminderAskedAt: new Date().toISOString() };
  seed.missions = seed.missions.filter(m => !m.isOneDecision);
  seed.completions = [];
  seed.transactions = seed.transactions.filter(t => t.kind === 'welcome_grant');
  return seed;
};
const create = async ({ locale = 'en', completed = false, draft, seed = fixture(locale, completed) } = {}) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'UTC', reducedMotion: 'reduce', serviceWorkers: 'block' });
  const localRequests = [];
  await context.route('**/*', async route => {
    const url = route.request().url();
    const host = new URL(url).hostname;
    if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) {
      report.blockedExternalRequests.push(url); await route.abort(); return;
    }
    localRequests.push(url); await route.continue();
  });
  await context.addInitScript(({ APP_KEY, DRAFT_KEY, locale, seed, draft }) => {
    if (!localStorage.getItem(APP_KEY)) localStorage.setItem(APP_KEY, JSON.stringify(seed));
    localStorage.setItem('oda_locale', locale);
    if (draft !== undefined && !localStorage.getItem(DRAFT_KEY)) localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, ...draft }));
  }, { APP_KEY, DRAFT_KEY, locale, seed, draft });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => report.pageErrors.push(error.message));
  return { page, context, localRequests };
};
const ready = async page => {
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await delay(100);
};
const goto = async (page, route = '/app') => {
  const response = await page.goto(`${base}${route}`);
  let entry;
  if (response) {
    assert.equal(response.status(),200,'Local preview entry must return 200');
    const html = await response.text();
    entry = html.match(/assets\/index-[^" ]+\.js/)?.[0];
  } else {
    const script = await page.locator('script[type=module][src]').first().getAttribute('src');
    entry = script?.match(/assets\/index-[^" ]+\.js/)?.[0];
  }
  assert.equal(entry,report.buildIndex,'Preview must serve the fresh local build');
  report.entryChecks.push({route,entry,navigation:response ? 'document' : 'same-document hash',status:response?.status() ?? null});
  await ready(page);
};
const record = page => readPersonalRecordFixture(page);
const waitRecord = async (page, predicate) => {
  const limit = Date.now() + 6000;
  let snapshot;
  do { snapshot = await record(page); if (predicate(snapshot)) return snapshot; await delay(100); } while (Date.now() < limit);
  throw new Error(`Personal record condition was not reached: ${JSON.stringify(snapshot)}`);
};
const snapshot = data => ({
  completions: data.completions.length,
  decisionRewards: data.transactions.filter(t => t.kind === 'one_decision_reward').length,
  kept: data.missions.filter(m => m.isOneDecision && m.status === 'completed').length,
});
const capture = async (page, name, fullPage = false) => {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${out}/${name}.png`, fullPage }); report.screenshots.push(`${name}.png`);
};
const layout = async (page, name, scope) => {
  const result = await page.evaluate(scope => {
    const width = document.documentElement.clientWidth;
    const root = document.querySelector(scope);
    const outside = [...root.querySelectorAll('button,input,textarea,[data-course-overview-lesson]')].flatMap(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > width + 1)
        ? [{ tag: el.tagName, text: el.textContent?.trim().slice(0, 100), left: rect.left, right: rect.right }] : [];
    });
    return { width, scrollWidth: document.documentElement.scrollWidth, outside };
  }, scope);
  report.layouts.push({ name, ...result });
  assert.ok(result.scrollWidth <= result.width + 1, `${name}: document overflows ${JSON.stringify(result)}`);
  assert.deepEqual(result.outside, [], `${name}: a control or lesson row is clipped`);
  const axe = await new AxeBuilder({ page }).include(scope).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const violations = axe.violations.map(v => ({ id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) }));
  report.accessibility.push({ name, violations });
  assert.equal(violations.filter(v => ['serious', 'critical'].includes(v.impact)).length, 0, `${name}: ${JSON.stringify(violations)}`);
  pass(`${name}: controls fit and no serious/critical axe findings`);
};
const next = page => page.locator('.onboarding-step > .pt-2 > button').first().click();
const toFinal = async (page, name = 'Synthetic QA') => {
  await next(page);
  await page.locator('#onboarding-name').fill(name);
  await next(page);
  await page.getByRole('radio').first().click();
  await next(page);
  await page.locator('.onboarding-step > .pt-2 > button').last().click();
  await page.locator('#onboarding-decision').waitFor();
};

let active;
try {
  for (const locale of ['en','tr','es']) {
    const welcome = await create({ locale }); active = welcome.page;
    await goto(welcome.page);
    assert.ok(await welcome.page.getByText(firstRunCopy(locale).previewLabel, { exact:true }).isVisible());
    assert.deepEqual(snapshot(await record(welcome.page)), { completions:0, decisionRewards:0, kept:0 });
    for (const width of [320,390]) {
      await welcome.page.setViewportSize({ width,height:844 });
      await layout(welcome.page,`${locale} web welcome ${width}`,'.oda-onboarding');
      await capture(welcome.page,`${locale}-web-welcome-${width}`,true);
    }
    pass(`${locale}: a fresh web record boots to the real onboarding preview`);
    await welcome.context.close();

    const course = coursesFor(locale).find(c => c.id === 'procrastination');
    const metadata = courseCatalogFor(locale).find(c => c.id === course.id);
    const learning = await create({ locale,completed:true }); active = learning.page;
    await learning.context.addInitScript(() => localStorage.setItem('oda_course_selection_v1','procrastination'));
    await goto(learning.page);
    assert.equal(await learning.page.locator('[data-next-lesson-title]').textContent(),course.lessons[0].title);
    assert.deepEqual(learning.localRequests.filter(url => /\/Courses-[^/]+\.js/.test(url)),[]);
    pass(`${locale}: signed-out Today boots with real lightweight lesson metadata`);
    await learning.page.locator('.oda-course-next-step button').click();
    await learning.page.locator('.oda-course-overview').waitFor();
    assert.equal(await learning.page.locator('.oda-course-lesson-title').count(),0);
    assert.equal(await learning.page.locator('#course-overview-title').textContent(),course.title);
    assert.ok(await learning.page.getByText(course.description,{exact:true}).isVisible());
    assert.ok(await learning.page.getByText(course.outcome,{exact:true}).isVisible());
    assert.equal(await learning.page.locator('[data-course-overview-lesson]').count(),course.lessons.length);
    for (const width of [320,390]) {
      await learning.page.setViewportSize({width,height:844});
      await layout(learning.page,`${locale} untouched overview ${width}`,'.oda-courses');
      await capture(learning.page,`${locale}-untouched-course-${width}`,true);
    }
    await learning.page.locator('#course-start-lesson').click();
    await learning.page.locator('.oda-course-lesson-title').waitFor();
    assert.equal(await learning.page.locator('.oda-course-lesson-title').textContent(),course.lessons[0].title);
    await learning.page.locator('#course-reflection').fill('Synthetic local note retained across startup');
    await learning.page.locator('.oda-course-practice input[type=checkbox]').first().check();
    await waitRecord(learning.page,data => data.courseProgress?.lessons[course.lessons[0].id]?.reflection === 'Synthetic local note retained across startup');
    await learning.page.reload(); await ready(learning.page);
    assert.equal(await learning.page.locator('.oda-course-overview').count(),0);
    assert.equal(await learning.page.locator('.oda-course-lesson-title').textContent(),course.lessons[0].title);
    assert.equal(await learning.page.locator('#course-reflection').inputValue(),'Synthetic local note retained across startup');
    assert.ok(await learning.page.locator('.oda-course-practice input[type=checkbox]').first().isChecked());
    pass(`${locale}: explicit Start and saved partial lesson/reflection survive web startup`);

    const progress = { version:1,lessons:{
      [course.lessons[0].id]:{ checked:Array(metadata.lessons[0].practiceCount).fill(true),answer:metadata.lessons[0].correct,reflection:'Synthetic completed lesson one',completed:true },
      [course.lessons[1].id]:{ checked:Array(metadata.lessons[1].practiceCount).fill(false),answer:null,reflection:'Synthetic saved lesson two',completed:false },
    }};
    await patchPersonalRecordFixture(learning.page,[{path:['courseProgress'],value:progress}]);
    await learning.page.reload(); await ready(learning.page);
    assert.equal(await learning.page.locator('.oda-course-overview').count(),0);
    assert.equal(await learning.page.locator('.oda-course-lesson-title').textContent(),course.lessons[1].title);
    assert.equal(await learning.page.locator('#course-reflection').inputValue(),'Synthetic saved lesson two');
    for (const width of [320,390]) {
      await learning.page.setViewportSize({width,height:844});
      await layout(learning.page,`${locale} returning lesson ${width}`,'.oda-courses');
      await capture(learning.page,`${locale}-returning-lesson-two-${width}`,true);
    }
    await goto(learning.page);
    assert.equal(await learning.page.locator('[data-next-lesson-title]').textContent(),course.lessons[1].title);
    assert.equal(await learning.page.locator('[data-next-lesson-goal]').textContent(),course.lessons[1].goal);
    assert.ok((await learning.page.locator('.oda-course-next-step').innerText()).includes(`${course.lessons[1].minutes} min`));
    await learning.page.locator('.oda-course-next-step button').click();
    await learning.page.locator('.oda-course-lesson-title').waitFor();
    assert.equal(await learning.page.locator('.oda-course-overview').count(),0);
    assert.equal(await learning.page.locator('.oda-course-lesson-title').textContent(),course.lessons[1].title);
    pass(`${locale}: saved lesson two resumes directly and Today continuation retains actual metadata`);

    if (locale === 'en') {
      await goto(learning.page,'/app/upgrade');
      assert.ok(await learning.page.getByText('Here on the web every course and sound is open to you, free.',{exact:true}).isVisible());
      assert.equal(await learning.page.getByRole('button',{name:'Restore purchases',exact:true}).count(),0);
      assert.equal(await learning.page.getByRole('button',{name:/^Subscribe to |^Start \d+ days free/}).count(),0);
      for (const width of [320,390]) {
        await learning.page.setViewportSize({width,height:844});
        const dimensions = await learning.page.evaluate(() => ({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
        assert.ok(dimensions.scroll <= dimensions.width+1,`web Upgrade ${width} overflow: ${JSON.stringify(dimensions)}`);
        await capture(learning.page,`en-web-upgrade-${width}`,true);
      }
      pass('web Upgrade remains informational with no purchase/restore controls or SDK/payment interaction');
    }
    await learning.context.close();
  }
  assert.deepEqual(report.pageErrors,[]);
  report.sourceAtEnd = hashSources();
  assert.deepEqual(report.sourceAtEnd,report.sourceAtStart,'Relevant source changed during local QA');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = String(error.stack || error);
  if (active && !active.isClosed()) await capture(active,'failure',true).catch(() => {});
  throw error;
} finally {
  report.finishedAt = new Date().toISOString();
  writeFileSync(`${out}/local-continuity-report.json`,JSON.stringify(report,null,2));
  await browser.close();
}
