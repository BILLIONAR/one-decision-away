/**
 * Approved growth/catalogue acceptance checks against a dev or built preview.
 * Run: node --import tsx scripts/qa-growth-design.mjs
 * ODA_QA_URL supports a root origin or a deployment subpath/hash URL.
 * ODA_GROWTH_ENGINE=chromium|webkit; ODA_GROWTH_QA_OUT overrides artifacts.
 * Uses disposable local records. Linux WebKit is not real-device iPhone QA.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { platform, release } from 'node:os';
import { chromium, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { getInitialDemoState } from '../src/services/repository.ts';
import { coursesFor } from '../src/data/courses.ts';
import { categoryForCourse, courseLearningCopy } from '../src/data/courseLearningCopy.ts';
import { patchPersonalRecordFixture, readPersonalRecordFixture } from './qa-personal-record-fixtures.mjs';

const require = createRequire(import.meta.url);
const requestedUrl = new URL(process.env.ODA_QA_URL || 'http://localhost:3000');
const hashRoutes = Boolean(requestedUrl.hash) || requestedUrl.pathname !== '/';
requestedUrl.hash = ''; requestedUrl.search = '';
const base = requestedUrl.href.replace(/\/$/, '');
const routeUrl = path => hashRoutes ? `${base}/#${path}` : `${base}${path}`;
const engineName = process.env.ODA_GROWTH_ENGINE || 'chromium';
assert.ok(['chromium', 'webkit'].includes(engineName), 'ODA_GROWTH_ENGINE must be chromium or webkit');
const engine = engineName === 'webkit' ? webkit : chromium;
const out = process.env.ODA_GROWTH_QA_OUT || `artifacts/verification/approved-growth-${engineName}`;
const key = 'one_decision_away_app_data_v1';
const selectionKey = 'oda_course_selection_v1';
const now = new Date('2026-10-01T12:00:00Z');
const day = offset => new Date(now.getTime() - offset * 86_400_000).toISOString().slice(0, 10);
const treeManifest = JSON.parse(readFileSync('public/assets/oda/trees/manifest.json', 'utf8'));
const coverManifest = JSON.parse(readFileSync('public/assets/oda/course-covers/manifest.json', 'utf8'));
const deliveryManifest = JSON.parse(readFileSync('public/assets/oda/delivery/manifest.json', 'utf8'));
const stages = ['seedling', 'sapling', 'young', 'fuller', 'mature', 'flowering'];
const expectedStage = count => count === 0 ? 0 : count < 10 ? 1 : count < 30 ? 2 : count < 60 ? 3 : count === 60 ? 4 : 5;
const expectedLeaves = count => Math.min(count, 60);
const expectedBlossoms = count => Math.min(Math.max(count - 60, 0), 30);
const englishCourses = coursesFor('en');
const continuationCourse = englishCourses.find(course => course.id === 'focus');
assert.ok(continuationCourse && continuationCourse.lessons.length >= 3, 'Fixture needs the real focus course');

mkdirSync(out, { recursive: true });
const report = {
  at: new Date().toISOString(), base, hashRoutes, engine: engineName,
  host: { platform: platform(), release: release(), node: process.version },
  playwrightVersion: require('playwright/package.json').version,
  executablePath: process.env.ODA_CHROMIUM && engineName === 'chromium' ? process.env.ODA_CHROMIUM : engine.executablePath(),
  localDependencyLaunch: engineName === 'webkit' && process.env.ODA_WEBKIT_LOCAL_DEPS === '1',
  fixtureDate: now.toISOString(), scope: 'Disposable synthetic local records; no signed-in account or purchase APIs',
  limits: ['Browser viewport/touch emulation is not real-device iPhone, native iOS or VoiceOver validation.', 'No live Supabase account or production user data is exercised.'],
  checks: [], failures: [], screenshots: [], treeGeometry: [], layouts: [], accessibility: [], runtimeErrors: [], blockedPrivateRequests: [],
};
let browser;
let activePage;
let activeCase = 'startup';
const pass = name => { report.checks.push(name); console.log(`PASS ${name}`); };
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const screenshot = async (page, name, fullPage = false) => {
  const file = `${slug(name)}.png`;
  await page.screenshot({ path: `${out}/${file}`, fullPage });
  report.screenshots.push(file);
};
const loadCatalogueCovers = async page => {
  const coverSources = new Set();
  for (const row of await page.locator('.oda-course-row').all()) {
    await row.scrollIntoViewIfNeeded();
    const image = row.locator('.oda-course-photo img');
    assert.equal(await image.count(), 1, 'Every catalogue row uses an original editorial cover');
    const info = await image.evaluate(async image => { await image.decode(); return { src: image.currentSrc, width: image.naturalWidth, height: image.naturalHeight }; });
    const imagePath = new URL(info.src).pathname;
    assert.ok(imagePath.includes('/assets/oda/course-covers/') || imagePath.includes('/assets/oda/delivery/course-covers/'), `Unexpected catalogue source: ${imagePath}`);
    assert.ok(info.width > 0 && info.height > 0); coverSources.add(imagePath);
  }
  return coverSources;
};
const screenshotCatalogue = async (page, name) => {
  // Screenshots alone do not force lazy off-screen images to decode.
  await loadCatalogueCovers(page);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    window.scrollTo(0, 0);
    const main = document.getElementById('oda-main');
    if (main) main.scrollTop = 0;
  });
  await screenshot(page, name, true);
  await screenshot(page, `${name}-top`);
};
const ready = async page => {
  await page.locator('h1').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
};
const dismiss = async page => {
  for (let i = 0; i < 4 && await page.getByRole('dialog').count(); i++) {
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
  }
};
const mission = (id, title, overrides = {}) => ({
  id, userId: 'demo-user', title, type: 'daily_mission', area: 'Custom', difficulty: 'easy',
  isOneDecision: true, status: 'completed', scheduledFor: day(0),
  createdAt: `${day(0)}T08:00:00Z`, completedAt: `${day(0)}T10:00:00Z`, ...overrides,
});
const missionsFor = (count, offsets) => [
  ...Array.from({ length: count }, (_, index) => {
    const offset = offsets ? offsets[index % offsets.length] : index % 12;
    return mission(`growth-kept-${index}`, `Synthetic kept promise ${index + 1}`, {
      scheduledFor: day(offset), createdAt: `${day(offset)}T08:00:00Z`, completedAt: `${day(offset)}T10:${String(index % 60).padStart(2, '0')}:00Z`,
    });
  }),
  mission('growth-not-one-decision', 'Synthetic ordinary mission must not grow the tree', { isOneDecision: false }),
  mission('growth-no-completion-date', 'Synthetic undated mission must not grow the tree', { completedAt: undefined }),
  mission('growth-archived', 'Synthetic archived choice must not grow the tree', { status: 'archived' }),
  mission('growth-active', 'Synthetic decision: make one visible start', {
    status: 'active', completedAt: undefined, createdAt: `${day(0)}T11:59:00Z`, plan: { ifThen: 'After tea, write one line' },
  }),
];
const seedFor = ({ count = 30, locale = 'en', theme = 'light', offsets } = {}) => {
  const seed = getInitialDemoState();
  seed.profile = {
    ...seed.profile, displayName: 'Growth QA', locale, theme, onboardingStep: 'completed', intent: 'finish', simpleModeOff: true,
    firstOpenedAt: '2026-07-01T00:00:00Z', createdAt: '2026-07-01T00:00:00Z',
    twoWeekCheckIn: { answeredAt: '2026-09-01T12:00:00Z', answer: 'yes' },
  };
  seed.missions = missionsFor(count, offsets);
  seed.completions = [];
  const first = continuationCourse.lessons[0];
  const second = continuationCourse.lessons[1];
  seed.courseProgress = { version: 1, lessons: {
    [first.id]: { checked: first.practice.map(() => true), answer: first.correct, reflection: 'Synthetic completed learning', completed: true },
    [second.id]: { checked: second.practice.map(() => false), answer: null, reflection: 'Synthetic unfinished learning', completed: false },
  } };
  return seed;
};
const runCase = async (name, options, fn) => {
  activeCase = name;
  let context;
  const started = Date.now();
  try {
    context = await browser.newContext({
      viewport: options.viewport || { width: 390, height: 844 }, timezoneId: 'UTC', reducedMotion: 'reduce',
      colorScheme: options.theme === 'dark' ? 'dark' : 'light', serviceWorkers: 'block',
      ignoreHTTPSErrors: requestedUrl.protocol === 'https:' && ['localhost', '127.0.0.1'].includes(requestedUrl.hostname),
    });
    await context.route('**/*', route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== requestedUrl.origin && /(?:supabase\.(?:co|in)|revenuecat\.com)$/.test(url.hostname)) {
        report.blockedPrivateRequests.push({ case: name, origin: url.origin, path: url.pathname });
        return route.abort();
      }
      return route.continue();
    });
    const seed = seedFor(options);
    await context.addInitScript(({ key, selectionKey, seed, locale }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
      localStorage.setItem('oda_locale', locale);
      // Deliberately suggest a different course: the started focus course must win.
      if (!sessionStorage.getItem('growth-qa-initialized')) {
        localStorage.setItem(selectionKey, 'procrastination');
        sessionStorage.setItem('growth-qa-initialized', '1');
      }
    }, { key, selectionKey, seed, locale: options.locale || 'en' });
    const page = await context.newPage(); activePage = page;
    await page.clock.install({ time: now });
    page.on('pageerror', error => report.runtimeErrors.push({ case: name, message: error.message }));
    await fn(page, context, seed);
    pass(name);
  } catch (error) {
    const failure = { name, error: String(error.stack || error), durationMs: Date.now() - started };
    report.failures.push(failure);
    console.error(`FAIL ${name}: ${error.message}`);
    if (activePage && !activePage.isClosed()) {
      try { await screenshot(activePage, `failure-${name}`, true); } catch (captureError) { failure.screenshotError = String(captureError); }
      try { writeFileSync(`${out}/failure-${slug(name)}.html`, await activePage.content()); } catch { /* Original failure remains authoritative. */ }
    }
  } finally {
    if (context) await context.close();
    activePage = undefined;
  }
};
const layout = async (page, name, include) => {
  const geometry = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth }));
  report.layouts.push({ name, ...geometry });
  assert.ok(geometry.document <= geometry.viewport + 1, `${name}: horizontal overflow ${JSON.stringify(geometry)}`);
  if (include) {
    const result = await new AxeBuilder({ page }).include(include).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const violations = result.violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target) }));
    report.accessibility.push({ name, violations });
    assert.equal(violations.filter(item => ['serious', 'critical'].includes(item.impact)).length, 0, `${name}: ${JSON.stringify(violations)}`);
  }
};
const assertTree = async (page, count, name) => {
  const tree = page.locator('.oda-evidence-tree').first();
  await tree.waitFor({ state: 'visible' });
  const index = expectedStage(count);
  const asset = treeManifest.assets[index];
  assert.equal(await tree.getAttribute('role'), 'img', 'Tree must expose an accessible image role');
  assert.equal(await tree.getAttribute('data-tree-stage'), stages[index]);
  assert.equal(await tree.getAttribute('data-kept-count'), String(count), 'Exact evidence count must not be inferred from the coarse tree picture');
  assert.equal(await tree.getAttribute('data-leaves'), String(expectedLeaves(count)));
  assert.equal(await tree.getAttribute('data-blossoms'), String(expectedBlossoms(count)));
  const accessibleName = await tree.getAttribute('aria-label');
  assert.match(accessibleName || '', new RegExp(`(^|\\D)${count}(\\D|$)`), 'Accessible label must include the real total');
  const image = tree.locator('img');
  assert.equal(await image.count(), 1, 'Default tree must display the approved prerendered asset');
  await image.evaluate(async image => image.decode());
  const selectedSrc = new URL(await image.evaluate(image => image.currentSrc)).pathname;
  const delivery = deliveryManifest.assets[`assets/oda/trees/${asset.file}`].variants.find(variant => selectedSrc.endsWith(`/${variant.src}`));
  const selectedAsset = delivery || asset;
  const geometry = await tree.evaluate((element, asset) => {
    const image = element.querySelector('img');
    const parent = element.getBoundingClientRect();
    const rect = image.getBoundingClientRect();
    const [left, top, right, bottom] = asset.visibleBBoxAlphaAbove128;
    const visible = { left: rect.left + left / asset.width * rect.width, right: rect.left + right / asset.width * rect.width,
      top: rect.top + top / asset.height * rect.height, bottom: rect.top + bottom / asset.height * rect.height };
    return { src: image.currentSrc, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
      square: { left: parent.left, right: parent.right, top: parent.top, bottom: parent.bottom, width: parent.width, height: parent.height },
      visible, baselinePercent: (rect.top + (bottom - 1) / asset.height * rect.height - parent.top) / parent.height * 100,
      normalizedVisibleHeightPercent: (visible.bottom - visible.top) / parent.height * 100,
      transform: getComputedStyle(image).transform, transformOrigin: getComputedStyle(image).transformOrigin,
    };
  }, selectedAsset);
  report.treeGeometry.push({ name, count, stage: stages[index], ...geometry });
  assert.ok(delivery || new URL(geometry.src).pathname.split('/').at(-1) === asset.file, 'Selected image must belong to the approved stage');
  if (!delivery) { assert.equal(geometry.naturalWidth, asset.width); assert.equal(geometry.naturalHeight, asset.height); }
  else { assert.ok(geometry.naturalWidth > 0 && geometry.naturalHeight > 0); assert.ok(Math.abs(geometry.naturalWidth / geometry.naturalHeight - selectedAsset.width / selectedAsset.height) < 0.005); }
  assert.ok(geometry.square.width > 0 && Math.abs(geometry.square.width - geometry.square.height) <= 1, 'Tree uses a fixed square canvas');
  assert.ok(Math.abs(geometry.baselinePercent - treeManifest.targetBaselinePercent) <= 0.6, `Root baseline: ${geometry.baselinePercent}%`);
  assert.ok(Math.abs(geometry.normalizedVisibleHeightPercent - asset.normalizedVisibleHeightPercent) <= 0.6, 'Stage height must follow approved asset normalization');
  assert.ok(geometry.visible.left >= geometry.square.left - 1 && geometry.visible.right <= geometry.square.right + 1
    && geometry.visible.top >= geometry.square.top - 1 && geometry.visible.bottom <= geometry.square.bottom + 1, `Visible tree is clipped: ${JSON.stringify(geometry)}`);
  return tree;
};
const assertWeek = async (page, count, offsets) => {
  const expected = new Set(Array.from({ length: count }, (_, index) => offsets ? offsets[index % offsets.length] : index % 12).filter(offset => offset <= 6)).size;
  const week = page.locator('.oda-growth-week');
  assert.equal(await week.getAttribute('data-kept-days'), String(expected), 'Weekly progress counts distinct kept days, not decisions');
  assert.match(await week.innerText(), new RegExp(`(^|\\D)${expected}(\\D|$)`), 'Weekly text must display the actual count');
};
const assertContinuing = async page => {
  const panel = page.locator('.oda-course-next-step');
  await panel.waitFor();
  assert.ok((await panel.innerText()).includes(continuationCourse.title), 'Today must show the started focus course rather than the intent suggestion');
  assert.match(await panel.innerText(), /2\s+(?:of|\/)\s*\d+/);
  assert.ok((await page.locator('#set-one-decision').innerText()).includes('Synthetic decision: make one visible start'), 'Today displays the current saved decision');
};
const openEvidence = async page => {
  // Exercise the dashboard's discoverable evidence entry instead of synthesizing a route.
  const link = page.locator('.oda-growth-dashboard').getByRole('button').filter({ hasText: /evidence|kept decision|kept promise/i }).first();
  const anchor = page.locator('.oda-growth-dashboard a[href*="evidence"]').first();
  if (await link.count()) await link.click();
  else { assert.equal(await anchor.count(), 1, 'Growth dashboard needs a discoverable evidence entry'); await anchor.click(); }
  await page.locator('h1').filter({ hasText: 'Proof that you keep your word' }).waitFor();
  assert.ok(page.url().includes('/app/evidence'), 'Evidence route remains preserved');
};
const navigateClient = async (page, path) => {
  await page.evaluate(path => {
    const current = new URL(location.href);
    if (current.hash || current.pathname !== '/app' && !current.pathname.startsWith('/app/')) current.hash = path;
    else current.pathname = path;
    history.pushState({}, '', current.href);
    dispatchEvent(new PopStateEvent('popstate'));
  }, path);
  await ready(page);
};

try {
  for (const asset of treeManifest.assets) {
    const hash = createHash('sha256').update(readFileSync(`public/assets/oda/trees/${asset.file}`)).digest('hex');
    assert.equal(hash, asset.sha256, `Original tree bytes changed: ${asset.file}`);
  }
  pass('All six approved tree files retain manifest SHA-256 bytes');
  for (const asset of coverManifest.assets) {
    const hash = createHash('sha256').update(readFileSync(`public/assets/oda/course-covers/${asset.filename}`)).digest('hex');
    assert.equal(hash, asset.sha256, `Original course cover bytes changed: ${asset.filename}`);
  }
  pass('All four approved course covers retain manifest SHA-256 bytes');
  const chromiumPath = process.env.ODA_CHROMIUM || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  report.executablePath = engineName === 'chromium' && chromiumPath ? chromiumPath : engine.executablePath();
  browser = await engine.launch(engineName === 'chromium' ? { executablePath: chromiumPath, args: ['--no-sandbox'] }
    : report.localDependencyLaunch ? { executablePath: report.executablePath } : {});
  report.actualBrowserVersion = browser.version();
  for (const count of [0, 1, 9, 10, 29, 30, 59, 60, 61, 89, 90, 120]) {
    await runCase(`Tree stage and truthful evidence at ${count}`, { count }, async page => {
      await page.goto(routeUrl('/app')); await ready(page); await dismiss(page);
      await assertTree(page, count, `Today ${count}`); await assertWeek(page, count); await assertContinuing(page);
      await layout(page, `Today ${count}`);
      if ([0, 1, 10, 30, 60, 61, 120].includes(count)) await screenshot(page, `today-390-kept-${count}`);
      await openEvidence(page);
      await assertTree(page, count, `Evidence ${count}`);
      assert.equal(await page.getByText(/^Synthetic kept promise \d+$/, { exact: true }).count(), count, 'Evidence ledger preserves every kept record beyond the canopy/blossom cap');
      assert.equal(await page.getByText(/must not grow the tree/, { exact: false }).count(), 0, 'Ordinary/archived/undated missions must not count as kept One Decisions');
      await layout(page, `Evidence ${count}`);
      if (count === 120) await screenshot(page, 'evidence-120-ledger', true);
    });
  }
  await runCase('Same-day duplicates increase evidence but not distinct weekly days', { count: 12, offsets: [0, 0, 1, 3, 8] }, async page => {
    await page.goto(routeUrl('/app')); await ready(page); await dismiss(page);
    await assertTree(page, 12, 'Same-day duplicates'); await assertWeek(page, 12, [0, 0, 1, 3, 8]);
    await screenshot(page, 'today-distinct-days');
  });
  for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    for (const theme of ['light', 'dark']) {
      await runCase(`Responsive ${viewport.width}px ${theme} reduced motion`, { count: 61, viewport, theme }, async page => {
        await page.goto(routeUrl('/app')); await ready(page); await dismiss(page);
        await assertTree(page, 61, `${viewport.width}px ${theme}`); await assertContinuing(page);
        assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
        const motion = await page.locator('.oda-evidence-tree').evaluate(element => ({
          reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
          animations: element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length,
        }));
        assert.equal(motion.reduced, true); assert.equal(motion.animations, 0, 'Reduced-motion static tree must not run animations');
        await layout(page, `Today ${viewport.width}px ${theme}`, '.oda-growth-dashboard');
        await screenshot(page, `today-${viewport.width}-${theme}`);
      });
    }
  }
  await runCase('Unavailable WebP tree retries the untouched approved PNG', { count: 120 }, async (page, context) => {
    await context.route('**/assets/oda/delivery/trees/*.webp', route => route.abort());
    await page.goto(routeUrl('/app')); await ready(page);
    const tree = page.locator('.oda-evidence-tree').first();
    await page.waitForFunction(filename => { const image = document.querySelector('.oda-evidence-tree img'); return image?.currentSrc.endsWith(`/${filename}`) && image.complete && image.naturalWidth > 0; }, treeManifest.assets[5].file);
    await tree.locator('img').evaluate(image => image.decode());
    assert.ok((await tree.locator('img').evaluate(image => image.currentSrc)).endsWith(`/${treeManifest.assets[5].file}`));
    assert.equal(await tree.getAttribute('data-kept-count'), '120');
    assert.equal(await tree.getAttribute('data-image-failed'), 'false');
  });

  await runCase('Unavailable tree image retains accurate evidence and usable fallback', { count: 120 }, async (page, context) => {
    await context.route('**/assets/oda/trees/*.png', route => route.abort());
    await context.route('**/assets/oda/delivery/trees/*.webp', route => route.abort());
    await page.goto(routeUrl('/app')); await ready(page); await dismiss(page);
    const tree = page.locator('.oda-evidence-tree').first();
    await tree.waitFor({ state: 'visible' });
    await tree.locator('.oda-tree-unavailable, .oda-evidence-tree-fallback, svg').first().waitFor({ state: 'visible' });
    assert.equal(await tree.getAttribute('data-kept-count'), '120');
    assert.equal(await tree.getAttribute('data-leaves'), '60'); assert.equal(await tree.getAttribute('data-blossoms'), '30');
    assert.match(await tree.getAttribute('aria-label') || '', /120/);
    assert.ok(await tree.locator('svg, .oda-tree-unavailable, .oda-evidence-tree-fallback').count() > 0, 'Image failure must render a useful fallback');
    await assertWeek(page, 120); await assertContinuing(page); await screenshot(page, 'tree-image-failure');
    await openEvidence(page);
    assert.equal(await page.getByText(/^Synthetic kept promise \d+$/, { exact: true }).count(), 120);
  });
  for (const locale of ['en', 'tr', 'es']) {
    await runCase(`${locale} catalogue inventory, local covers, filters and navigation`, { locale, count: 30 }, async page => {
      const copy = courseLearningCopy(locale);
      const courses = coursesFor(locale);
      assert.equal(courses.length, 18); assert.equal(courses.reduce((sum, course) => sum + course.lessons.length, 0), 103);
      await page.goto(routeUrl('/app/courses')); await ready(page);
      // Dismiss the persisted selection by the actual catalogue back control.
      if (await page.locator('.oda-course-lesson-title').count()) await page.locator('.oda-courses > button').first().click();
      assert.equal(await page.locator('.oda-course-row').count(), 18);
      const coverSources = await loadCatalogueCovers(page);
      assert.equal(coverSources.size, 4, 'Catalogue retains the four approved original cover families');
      for (const category of ['courage', 'attention', 'perspective']) {
        await page.getByRole('button', { name: copy[category], exact: true }).click();
        assert.equal(await page.locator('.oda-course-row').count(), courses.filter(course => categoryForCourse(course.id) === category).length);
      }
      await page.getByRole('button', { name: copy.all, exact: true }).click();
      await page.locator('#course-search').fill('synthetic-no-match-oda');
      assert.equal(await page.locator('.oda-course-row').count(), 0);
      await page.getByRole('button', { name: copy.clearSearch, exact: true }).click();
      assert.equal(await page.locator('.oda-course-row').count(), 18);
      await layout(page, `${locale} catalogue 390px`, '.oda-courses');
      await screenshotCatalogue(page, `catalogue-${locale}-390`);
      const target = courses.find(course => course.id === 'procrastination');
      await page.locator('#course-search').fill(target.title);
      assert.equal(await page.locator('.oda-course-row').count(), 1);
      await page.locator('.oda-course-row').click(); await page.locator('.oda-course-lesson-title').waitFor();
      assert.equal(await page.locator('.oda-course-lesson-title').innerText(), target.lessons[0].title);
      assert.equal(await page.locator('#course-practice-studio').count(), 1, 'Course workbook remains available');
      assert.equal(await page.locator('.oda-course-steps button').count(), target.lessons.length);
      if (locale === 'en') {
        await page.locator('#course-reflection').fill('Synthetic persisted reflection');
        await page.locator('.oda-course-practice input').first().check();
        await page.waitForFunction(({ key, lessonId }) => {
          const lesson = JSON.parse(localStorage.getItem(key) || '{}').courseProgress?.lessons?.[lessonId];
          return lesson?.reflection === 'Synthetic persisted reflection' && lesson?.checked?.[0] === true;
        }, { key, lessonId: target.lessons[0].id });
        await page.reload(); await ready(page);
        assert.equal(await page.locator('#course-reflection').inputValue(), 'Synthetic persisted reflection');
        assert.equal(await page.locator('.oda-course-practice input').first().isChecked(), true);
        await page.locator('#course-practice-studio summary').first().click();
        await page.locator('#practice-procrastination-action').fill('Synthetic interrupted course plan');
        // Leave immediately, while the shared persistence queue may still be pending.
        await navigateClient(page, '/app'); await page.locator('.oda-growth-dashboard').waitFor();
        await navigateClient(page, '/app/courses'); await page.locator('.oda-course-lesson-title').waitFor();
        await page.locator('#course-practice-studio summary').first().click();
        assert.equal(await page.locator('#practice-procrastination-action').inputValue(), 'Synthetic interrupted course plan');
        const record = await readPersonalRecordFixture(page);
        assert.equal(record.courseProgress.lessons[target.lessons[0].id].reflection, 'Synthetic persisted reflection');
      }
      await page.setViewportSize({ width: 320, height: 740 }); await layout(page, `${locale} lesson 320px`);
      if (locale === 'en') await screenshot(page, 'course-workbook-320', true);
      await page.locator('.oda-courses > button').first().click();
      await page.locator('#course-search').fill(''); await layout(page, `${locale} catalogue 320px`);
      if (locale === 'en') {
        await screenshotCatalogue(page, 'catalogue-320');
        await page.setViewportSize({ width: 1440, height: 1000 }); await layout(page, 'Catalogue desktop', '.oda-courses');
        await screenshotCatalogue(page, 'catalogue-desktop');
        await patchPersonalRecordFixture(page, [{ path: ['profile', 'theme'], value: 'dark' }]);
        await page.reload(); await ready(page); await layout(page, 'Catalogue dark desktop', '.oda-courses');
        await screenshotCatalogue(page, 'catalogue-dark-desktop');
      }
    });
  }
  await runCase('Repeated Today/course/evidence navigation and Back/Forward retain exact record', { count: 61 }, async page => {
    await page.goto(routeUrl('/app')); await ready(page); await dismiss(page);
    const original = await readPersonalRecordFixture(page);
    for (let iteration = 0; iteration < 3; iteration++) {
      await assertTree(page, 61, `History Today ${iteration}`); await assertContinuing(page);
      await page.locator('.oda-course-next-step button').click(); await page.locator('.oda-course-lesson-title').waitFor();
      assert.equal(await page.locator('.oda-course-lesson-title').innerText(), continuationCourse.lessons[1].title);
      assert.equal(await page.locator('.oda-course-step[aria-current="step"]').innerText(), '2');
      assert.equal(await page.locator('.oda-course-step').nth(2).isDisabled(), true, 'Sequential course access stays intact');
      await page.goBack(); await page.locator('.oda-growth-dashboard').waitFor();
      await assertContinuing(page);
      await page.goForward(); await page.locator('.oda-course-lesson-title').waitFor();
      assert.equal(await page.locator('.oda-course-lesson-title').innerText(), continuationCourse.lessons[1].title);
      await page.goBack(); await page.locator('.oda-growth-dashboard').waitFor();
      await openEvidence(page); await assertTree(page, 61, `History Evidence ${iteration}`);
      await page.goBack(); await page.locator('.oda-growth-dashboard').waitFor();
      await page.goForward(); await page.locator('h1').filter({ hasText: 'Proof that you keep your word' }).waitFor();
      await page.goBack(); await page.locator('.oda-growth-dashboard').waitFor();
    }
    await page.reload(); await ready(page); await assertTree(page, 61, 'Reload persisted Today');
    const record = await readPersonalRecordFixture(page);
    assert.deepEqual(record.missions, original.missions, 'Viewing/navigating must never add evidence or replace the daily decision');
    assert.deepEqual(record.courseProgress, original.courseProgress, 'Navigation must not complete lessons or lose prior progress');
    await screenshot(page, 'today-after-history-reload');
  });
  await runCase('Me miniature and evidence entry expose accurate capped counts at 120', { count: 120 }, async page => {
    await page.goto(routeUrl('/app/me')); await ready(page);
    const tree = await assertTree(page, 120, 'Me miniature 120');
    const name = await tree.getAttribute('aria-label');
    assert.match(name, /60 leaves/); assert.match(name, /30 blossoms/);
    const entry = tree.locator('xpath=..');
    assert.equal(await entry.evaluate(element => element.tagName), 'BUTTON');
    assert.match(await entry.getAttribute('aria-label') || '', /120/);
    await layout(page, 'Me miniature 390px'); await screenshot(page, 'me-120-miniature');
    await entry.click();
    await page.locator('h1').filter({ hasText: 'Proof that you keep your word' }).waitFor();
    assert.ok(page.url().includes('/app/evidence'));
    assert.equal(await page.getByText(/^Synthetic kept promise \d+$/, { exact: true }).count(), 120);
  });
} catch (error) {
  report.failures.push({ name: activeCase, error: String(error.stack || error) });
  console.error(error);
} finally {
  report.status = report.failures.length || report.runtimeErrors.length ? 'failed' : 'passed';
  report.completedAt = new Date().toISOString();
  writeFileSync(`${out}/growth-browser-report.json`, JSON.stringify(report, null, 2));
  if (browser) await browser.close();
}
console.log(`${report.status.toUpperCase()}: ${report.checks.length} checks; ${report.failures.length} failures; ${report.runtimeErrors.length} runtime errors. Report: ${out}/growth-browser-report.json`);
if (report.status !== 'passed') process.exitCode = 1;
