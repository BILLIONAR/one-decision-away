import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const repo = process.env.ODA_QA_REPO || '/workspace/one-decision-away';
const require = createRequire(`${repo}/package.json`);
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const { getInitialDemoState } = await import(`${repo}/src/services/repository.ts`);
const { firstRunCopy } = await import(`${repo}/src/i18n/firstRun.ts`);
const { coursesFor } = await import(`${repo}/src/data/courses.ts`);
const { courseCatalogFor } = await import(`${repo}/src/data/courseCatalog.ts`);
const { readPersonalRecordFixture } = await import(`${repo}/scripts/qa-personal-record-fixtures.mjs`);
const base = process.env.ODA_QA_URL || 'http://127.0.0.1:4182/one-decision-away/#';
const out = resolve(process.env.ODA_QA_OUT || `${repo}/artifacts/verification/english-guidance-first-use/browser/independent-first-use`);
const APP_KEY = 'one_decision_away_app_data_v1';
const DRAFT_KEY = 'oda_onboarding_draft_v1';
mkdirSync(out, { recursive: true });
const report = {
  syntheticFixtures: true,
  noProductionOrExternalWrites: true,
  base, repo, at: new Date().toISOString(),
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
const goto = async (page, route = '/app') => { await page.goto(`${base}${route}`); await ready(page); };
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
  for (const locale of ['en', 'tr', 'es']) {
    const { page, context } = await create({ locale }); active = page;
    const copy = firstRunCopy(locale);
    await goto(page);
    assert.ok(await page.getByText(copy.previewLabel, { exact: true }).isVisible());
    assert.ok(await page.getByText(copy.previewHelp, { exact: true }).isVisible());
    for (const [width, height] of [[320, 844], [390, 844], [1440, 1000]]) {
      await page.setViewportSize({ width, height });
      await layout(page, `${locale} preview ${width}`, '.oda-onboarding');
      await capture(page, `${locale}-onboarding-preview-${width}`, width < 400);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    const before = snapshot(await record(page));
    const choice = page.locator('[data-onboarding-preview="pick"] button').first();
    const chosen = await choice.innerText();
    await choice.click();
    await page.getByRole('button', { name: copy.previewStart, exact: true }).click();
    assert.ok(await page.getByText(copy.previewFastForward, { exact: true }).isVisible());
    await page.getByRole('button', { name: copy.previewKept, exact: true }).click();
    assert.equal(await page.locator('[data-onboarding-preview="proof"] [data-leaves]').getAttribute('data-leaves'), '1');
    assert.ok(await page.getByText(copy.previewProof, { exact: true }).isVisible());
    assert.deepEqual(snapshot(await record(page)), before);
    pass(`${locale}: preview fast-forwards and shows a synthetic leaf without a real completion or reward`);
    for (const [width, height] of [[320, 844], [390, 844], [1440, 1000]]) {
      await page.setViewportSize({ width, height });
      const bounds = await page.evaluate(() => {
        const proof = document.querySelector('[data-onboarding-preview="proof"]');
        const caption = proof.querySelector('p:last-child');
        const tree = proof.querySelector('.oda-evidence-tree');
        const rect = el => { const r = el.getBoundingClientRect(); return { left:r.left, right:r.right, width:r.width, height:r.height }; };
        return { proof:rect(proof), caption:rect(caption), tree:rect(tree) };
      });
      assert.ok(bounds.caption.right <= bounds.proof.right + 1, `${locale} proof ${width}: caption lies outside the card ${JSON.stringify(bounds)}`);
      report.layouts.push({ name:`${locale} proof bounds ${width}`, ...bounds });
      await layout(page, `${locale} proof ${width}`, '.oda-onboarding');
      await capture(page, `${locale}-onboarding-proof-${width}`, width < 400);
    }
    await page.setViewportSize({ width:390, height:844 });
    await toFinal(page);
    assert.equal(await page.locator('#onboarding-decision').inputValue(), chosen);
    await page.reload(); await ready(page);
    assert.equal(await page.locator('#onboarding-decision').inputValue(), chosen);
    pass(`${locale}: fresh demo choice carries into the final field and survives reload`);
    await capture(page, `${locale}-onboarding-final-390`, true);
    await context.close();

    const course = coursesFor(locale).find(c => c.id === 'procrastination');
    const courseContext = await create({ locale, completed: true }); active = courseContext.page;
    await goto(courseContext.page, '/app/courses');
    await courseContext.page.locator('#course-search').fill(course.title);
    await courseContext.page.locator('.oda-course-row').click();
    await courseContext.page.locator('.oda-course-overview').waitFor();
    assert.equal(await courseContext.page.locator('#course-overview-title').textContent(), course.title);
    assert.ok(await courseContext.page.getByText(course.description, { exact: true }).isVisible());
    assert.ok(await courseContext.page.getByText(course.outcome, { exact: true }).isVisible());
    assert.equal(await courseContext.page.locator('[data-course-overview-lesson]').count(), course.lessons.length);
    for (const lesson of course.lessons) {
      const row = courseContext.page.locator(`[data-course-overview-lesson="${lesson.id}"]`);
      assert.ok(await row.getByText(lesson.title, { exact: true }).isVisible());
      assert.ok(await row.getByText(`${lesson.minutes} min`, { exact: true }).isVisible());
    }
    for (const [width, height] of [[320, 844], [390, 844], [1440, 1000]]) {
      await courseContext.page.setViewportSize({ width, height });
      await layout(courseContext.page, `${locale} overview ${width}`, '.oda-courses');
      await capture(courseContext.page, `${locale}-course-overview-${width}`, width < 400);
    }
    assert.equal(await courseContext.page.locator('.oda-course-lesson-title').count(), 0);
    pass(`${locale}: overview shows the actual description, outcome, titles and minutes before lesson 1`);
    await courseContext.context.close();
  }

  for (const savedText of ['A saved draft must stay exactly as written.  ', '', '   ']) {
    const { page, context } = await create({ draft: { step: 0, name: 'Saved QA', intent: null, dreamId: null, decision: savedText } }); active = page;
    await goto(page);
    await page.locator('[data-onboarding-preview="pick"] button').first().click();
    await toFinal(page);
    assert.equal(await page.locator('#onboarding-decision').inputValue(), savedText);
    await page.reload(); await ready(page);
    assert.equal(await page.locator('#onboarding-decision').inputValue(), savedText);
    pass(`saved draft ${JSON.stringify(savedText)} is preserved through preview and reload`);
    await context.close();
  }

  const manual = await create(); active = manual.page;
  await goto(manual.page); await toFinal(manual.page);
  const manualText = 'My own unfinished decision stays.  ';
  await manual.page.locator('#onboarding-decision').fill(manualText);
  for (let index = 0; index < 4; index++) await manual.page.getByRole('button', { name: 'Back', exact: true }).click();
  await manual.page.locator('[data-onboarding-preview="pick"] button').last().click();
  await toFinal(manual.page);
  assert.equal(await manual.page.locator('#onboarding-decision').inputValue(), manualText);
  await manual.page.reload(); await ready(manual.page);
  assert.equal(await manual.page.locator('#onboarding-decision').inputValue(), manualText);
  pass('manually typed decision survives returning to the preview and reload without replacement');
  await manual.context.close();

  const today = await create({ completed: true }); active = today.page;
  await goto(today.page);
  await today.page.locator('#today-decision-input').fill('Synthetic QA: write one useful sentence');
  await today.page.getByRole('button', { name: 'Set decision', exact: true }).click();
  const initial = await waitRecord(today.page, data => data.missions.some(m => m.isOneDecision && m.status === 'active'));
  const mission = initial.missions.find(m => m.isOneDecision && m.status === 'active');
  await delay(1000);
  assert.equal(await today.page.getByRole('dialog').count(), 0);
  assert.ok(await today.page.getByRole('button', { name: firstRunCopy('en').optionalPlan, exact: true }).isVisible());
  await today.page.reload(); await ready(today.page); await delay(1000);
  assert.equal(await today.page.getByRole('dialog').count(), 0);
  await goto(today.page, '/app/courses'); await goto(today.page); await delay(1000);
  assert.equal(await today.page.getByRole('dialog').count(), 0);
  pass('setting, reloading and returning to Today never automatically open obstacle planning after 700 ms');
  await today.page.getByRole('button', { name: firstRunCopy('en').optionalPlan, exact: true }).click();
  await today.page.locator('#plan-obstacle').fill('I might reach for my phone');
  await today.page.locator('#plan-then').fill('I will leave it aside and write one sentence');
  await today.page.getByRole('button', { name: 'Save plan', exact: true }).click();
  await waitRecord(today.page, data => data.missions.find(m => m.id === mission.id)?.plan?.ifThen === 'I will leave it aside and write one sentence');
  await today.page.reload(); await ready(today.page); await delay(1000);
  assert.equal(await today.page.getByRole('dialog').count(), 0);
  assert.ok((await today.page.locator('.oda-decision-plan').innerText()).includes('I will leave it aside and write one sentence'));
  pass('optional obstacle planning opens by explicit action and persists without reopening itself');
  await layout(today.page, 'Today optional planning 390', '#set-one-decision');
  await capture(today.page, 'en-today-optional-plan-390', true);

  const beforeTimer = snapshot(await record(today.page));
  const realNow = Date.now();
  await today.page.clock.install({ time: new Date(realNow) });
  await today.page.clock.pauseAt(new Date(realNow + 1000));
  await today.page.getByRole('button', { name: 'Start · just 2 minutes', exact: true }).click();
  await today.page.clock.runFor(100);
  assert.ok((await today.page.getByRole('timer').innerText()).includes('2:00'));
  await today.page.clock.runFor(118900);
  assert.ok((await today.page.getByRole('timer').innerText()).includes('0:01'));
  assert.equal(await today.page.getByRole('button', { name: 'I did it — mark as done', exact: true }).count(), 0);
  assert.deepEqual(snapshot(await record(today.page)), beforeTimer);
  await today.page.clock.runFor(1000);
  assert.ok(await today.page.getByRole('button', { name: 'I did it — mark as done', exact: true }).isVisible());
  assert.deepEqual(snapshot(await record(today.page)), beforeTimer);
  pass('real two-minute timer is unfinished at 119 seconds and finished at 120 seconds without automatic completion or reward');
  await capture(today.page, 'en-two-minute-expired-390', false);
  await today.page.getByRole('button', { name: 'I did it — mark as done', exact: true }).click();
  await today.page.clock.runFor(100);
  assert.deepEqual(snapshot(await record(today.page)), beforeTimer);
  await today.page.getByRole('dialog').getByRole('button', { name: 'Confirm', exact: true }).evaluate(button => {
    button.click(); button.click(); button.click();
  });
  const completed = await waitRecord(today.page, data => data.missions.find(m => m.id === mission.id)?.status === 'completed');
  assert.equal(completed.completions.filter(c => c.missionId === mission.id).length, 1);
  assert.equal(completed.transactions.filter(t => t.kind === 'one_decision_reward').length, 1);
  assert.equal(completed.missions.filter(m => m.isOneDecision && m.status === 'completed').length, 1);
  await today.page.clock.resume();
  await today.page.reload(); await ready(today.page);
  const afterReload = await record(today.page);
  assert.equal(afterReload.completions.filter(c => c.missionId === mission.id).length, 1);
  assert.equal(afterReload.transactions.filter(t => t.kind === 'one_decision_reward').length, 1);
  assert.equal(await today.page.locator('.oda-growth-panel .oda-evidence-tree').getAttribute('data-kept-count'), '1');
  assert.equal(await today.page.locator('.oda-growth-panel .oda-evidence-tree').getAttribute('data-leaves'), '1');
  assert.equal(await today.page.locator('.oda-decision-done').count(), 0);
  report.rewardEvidence = { missionId: mission.id, beforeTimer, afterRepeatConfirm: snapshot(completed), afterReload: snapshot(afterReload), repeatConfirmClicks: 3, leaf: 1, timerSeconds: 120 };
  pass('three rapid confirmation taps produce exactly one completion, one reward and one leaf, retained after reload');
  await capture(today.page, 'en-real-kept-one-leaf-390', true);
  await today.context.close();

  const course = coursesFor('en').find(c => c.id === 'procrastination');
  const metadata = courseCatalogFor('en').find(c => c.id === course.id);
  const resumedSeed = fixture('en', true);
  resumedSeed.courseProgress = { version: 1, lessons: {
    [course.lessons[0].id]: { checked: Array(metadata.lessons[0].practiceCount).fill(true), answer: metadata.lessons[0].correct, reflection: 'Synthetic completed first lesson', completed: true },
    [course.lessons[1].id]: { checked: Array(metadata.lessons[1].practiceCount).fill(false), answer: null, reflection: 'My saved lesson two reflection', completed: false },
  }};
  const resumed = await create({ seed: resumedSeed, completed: true }); active = resumed.page;
  await resumed.context.addInitScript(() => localStorage.setItem('oda_course_selection_v1', 'procrastination'));
  await goto(resumed.page);
  assert.equal(await resumed.page.locator('[data-next-lesson-title]').textContent(), course.lessons[1].title);
  assert.equal(await resumed.page.locator('[data-next-lesson-goal]').textContent(), course.lessons[1].goal);
  assert.ok((await resumed.page.locator('.oda-course-next-step').innerText()).includes(`${course.lessons[1].minutes} min`));
  const todayPayloadRequests = resumed.localRequests.filter(url => /\/Courses-[^/]+\.js/.test(url));
  assert.deepEqual(todayPayloadRequests, [], 'Today must not fetch the full Courses lesson payload');
  report.todayMetadataEvidence = { title: course.lessons[1].title, minutes: course.lessons[1].minutes, goal: course.lessons[1].goal, fullCoursePayloadRequests: todayPayloadRequests };
  await capture(resumed.page, 'en-today-real-next-lesson-390', true);
  await resumed.page.locator('.oda-course-next-step button').click();
  await resumed.page.locator('.oda-course-lesson-title').waitFor();
  assert.equal(await resumed.page.locator('.oda-course-overview').count(), 0);
  assert.equal(await resumed.page.locator('.oda-course-lesson-title').textContent(), course.lessons[1].title);
  assert.equal(await resumed.page.locator('#course-reflection').inputValue(), 'My saved lesson two reflection');
  pass('Today shows real next-lesson metadata without the Courses payload and continuation resumes saved lesson two directly');
  await capture(resumed.page, 'en-resumed-lesson-two-390', true);
  await resumed.context.close();

  assert.deepEqual(report.pageErrors, []);
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = String(error.stack || error);
  if (active && !active.isClosed()) await capture(active, 'failure', true).catch(() => {});
  throw error;
} finally {
  report.finishedAt = new Date().toISOString();
  writeFileSync(`${out}/independent-first-use-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
