/** Actual UI regression for the three selected mobile core defects.
 * Run: node --import tsx scripts/qa-mobile-core-quality.mjs
 * All records and capability failures are synthetic; external requests are blocked.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { getInitialDemoState } from '../src/services/repository.ts';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.env.ODA_QA_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const output = path.resolve(process.env.ODA_MOBILE_CORE_QA_OUT || 'artifacts/mobile-core-quality');
const origin = new URL(base).origin;
const key = 'one_decision_away_app_data_v1';
const photoFixturePath = 'public/assets/oda/trees/tree-00-seedling-0.png';
const photoFixture = fs.readFileSync(path.join(repo, photoFixturePath));
const files = [
  'src/components/FocusLockView.tsx', 'src/components/notebook/JournalWorkspace.tsx',
  'src/utils/useDialogAccessibility.ts', 'src/components/ui.tsx',
  'src/components/AppErrorBoundary.tsx', 'scripts/qa-mobile-core-quality.mjs',
];
const hash = file => createHash('sha256').update(fs.readFileSync(path.join(repo, file))).digest('hex');
const report = {
  at: new Date().toISOString(), base, browser: '', checks: [], errors: [], externalBlocked: [],
  contexts: [], screenshots: [], sourceHashes: Object.fromEntries(files.map(file => [file, hash(file)])),
  syntheticPhotoFixture: { path: photoFixturePath, bytes: photoFixture.length, sha256: createHash('sha256').update(photoFixture).digest('hex') },
  limits: [
    'Actual app, AppProvider, repository and UI handlers in cloud Chromium; synthetic local records and capability failures only.',
    'Native dialog and fullscreen success exercise actual Chromium APIs. Method absence, missing inert, and denial are explicit simulations.',
    'All requests outside the preview origin are blocked. No provider, payment, cloud account, physical native device, or audio-quality claim.',
  ],
};
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium' });
report.browser = await browser.version();
let currentPage;

const check = (name, evidence) => {
  report.checks.push({ name, evidence });
  console.log(`PASS: ${name}`);
};
const saved = page => page.evaluate(storageKey => localStorage.getItem(storageKey), key);
const seed = () => {
  const data = getInitialDemoState();
  Object.assign(data.profile, {
    displayName: 'Synthetic keyboard QA', onboardingStep: 'completed', locale: 'en', soundMuted: true,
    nudgesEnabled: false, dailyWisdomEnabled: false, focusTabBlinkEnabled: false,
    focusScreenPulseEnabled: false, firstOpenedAt: new Date().toISOString(),
  });
  data.missions = [];
  data.dreamJournal = [{
    id: 'synthetic-photo-entry', userId: data.profile.id, title: 'Synthetic photo entry',
    content: 'A synthetic saved reflection with an owned image fixture.', mood: 'focused',
    createdAt: new Date().toISOString(),
    photoDataUrl: `data:image/png;base64,${photoFixture.toString('base64')}`,
  }];
  return data;
};
const open = async (name, options = {}) => {
  const context = await browser.newContext({
    viewport: { width: options.width || 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block',
  });
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin === origin) return route.continue();
    report.externalBlocked.push({ case: name, url: route.request().url(), resourceType: route.request().resourceType() });
    return route.abort();
  });
  await context.addInitScript(({ storageKey, data, options }) => {
    if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify(data));
    localStorage.setItem('oda_locale', 'en');
    for (const method of options.missing || []) HTMLDialogElement.prototype[method] = undefined;
    if (options.missingInert) delete HTMLElement.prototype.inert;
    if (options.fullscreen === 'missing') Element.prototype.requestFullscreen = undefined;
    if (options.fullscreen === 'denied') {
      window.__qaOriginalFullscreen = Element.prototype.requestFullscreen;
      window.__qaFullscreenDeniedCalls = 0;
      Element.prototype.requestFullscreen = () => {
        window.__qaFullscreenDeniedCalls += 1;
        return Promise.reject(new DOMException('Synthetic permission denial', 'NotAllowedError'));
      };
    }
  }, { storageKey: key, data: seed(), options });
  const page = await context.newPage();
  currentPage = page;
  page.on('pageerror', error => report.errors.push({ case: name, message: error.message }));
  report.contexts.push({ name, options });
  return { context, page };
};
const capture = async (page, name) => {
  await page.screenshot({ path: path.join(output, name), fullPage: false, animations: 'disabled' });
  report.screenshots.push(name);
};
const focusInside = dialog => dialog.evaluate(element => element.contains(document.activeElement));
const returned = async (page, trigger) => {
  await page.waitForFunction(element => document.activeElement === element, await trigger.elementHandle());
};
const trap = async (page, dialog) => {
  const positions = [];
  for (const keyName of ['Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab']) {
    await page.keyboard.press(keyName);
    positions.push({ key: keyName, inside: await focusInside(dialog) });
  }
  assert.ok(positions.every(item => item.inside), JSON.stringify(positions));
  return positions;
};
const startFocus = async page => {
  await page.goto(`${base}/app/focus`);
  await page.getByRole('heading', { name: 'Focus', exact: true, level: 1 }).waitFor();
  await page.getByRole('button', { name: 'Ambient', exact: true }).click();
  await page.getByRole('button', { name: /^Silence/ }).click();
  await page.getByPlaceholder('What will you focus on? Optional').fill('Synthetic silent keyboard focus');
  await page.getByRole('button', { name: 'Start 25 min', exact: true }).click();
  await page.getByRole('button', { name: 'End early', exact: true }).waitFor();
};

try {
  for (const missingInert of [false, true]) {
    const name = missingInert ? 'focus-no-inert' : 'focus-normal';
    const { context, page } = await open(name, { missingInert, width: missingInert ? 320 : 390 });
    await startFocus(page);
    const before = await saved(page);
    const priorOverflow = await page.evaluate(() => document.body.style.overflow);
    const trigger = page.getByRole('button', { name: 'End early', exact: true });
    const pause = await page.getByRole('button', { name: 'Pause', exact: true }).elementHandle();
    const dialog = page.getByRole('dialog', { name: 'End early?', exact: true });
    const show = async () => {
      await trigger.focus();
      await page.keyboard.press('Enter');
      await dialog.waitFor();
    };
    const closed = async () => {
      await dialog.waitFor({ state: 'hidden' });
      await returned(page, trigger);
      assert.equal(await page.evaluate(() => document.body.style.overflow), priorOverflow);
    };
    await show();
    assert.equal(await dialog.getAttribute('aria-modal'), 'true');
    assert.equal(await focusInside(dialog), true);
    assert.equal(await dialog.getByRole('button', { name: 'Keep going', exact: true }).evaluate(el => el === document.activeElement), true);
    check(`${name}: named modal focuses Keep going`, { role: 'dialog', ariaModal: 'true' });
    check(`${name}: forward and reverse Tab stay inside`, await trap(page, dialog));
    await pause.evaluate(element => element.focus());
    assert.equal(await focusInside(dialog), true);
    assert.equal(await page.getByRole('button', { name: 'Pause', exact: true }).count(), 0);
    assert.equal(await page.getByText('Paused', { exact: true }).count(), 0);
    check(`${name}: background Pause is isolated and cannot take focus`);
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    await capture(page, `${name}-confirmation.png`);
    await page.keyboard.press('Escape');
    await closed();
    assert.equal(await page.getByRole('button', { name: 'Pause', exact: true }).isVisible(), true);
    check(`${name}: Escape cancels only confirmation and restores trigger/scroll`);
    await show();
    await dialog.getByRole('button', { name: 'Keep going', exact: true }).click();
    await closed();
    check(`${name}: reopen and Keep going restore trigger/scroll`);
    await show();
    await page.mouse.click(2, 2);
    await closed();
    check(`${name}: backdrop dismisses reopened confirmation`);
    await show();
    await dialog.getByRole('button', { name: 'End session', exact: true }).click();
    await trigger.waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Start 25 min', exact: true }).waitFor();
    assert.equal(await saved(page), before);
    assert.equal(await page.evaluate(() => document.body.style.overflow), priorOverflow);
    check(`${name}: explicit cancel ends session without completion/reward/data changes`);
    await context.close();
  }

  const photos = [
    { name: 'photo-native', missing: [], width: 390 },
    { name: 'photo-native-320', missing: [], width: 320 },
    { name: 'photo-no-showModal', missing: ['showModal'], width: 320 },
    { name: 'photo-no-close', missing: ['close'], width: 390 },
    { name: 'photo-no-methods-or-inert', missing: ['showModal', 'close'], missingInert: true, width: 320 },
  ];
  for (const scenario of photos) {
    const { context, page } = await open(scenario.name, scenario);
    await page.goto(`${base}/app`);
    await page.locator('#set-one-decision').waitFor();
    const before = await saved(page);
    await page.goto(`${base}/app/notebook`);
    await page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Download a recovery copy', exact: true }).count(), 0);
    check(`${scenario.name}: Notebook mounts without whole-app recovery`);
    await page.getByRole('button', { name: /Synthetic photo entry/ }).click();
    await page.evaluate(() => { document.body.style.overflow = 'auto'; });
    const trigger = page.getByRole('button', { name: 'View journal photo', exact: true });
    const background = await page.getByRole('heading', { name: 'Notebook', exact: true }).elementHandle();
    const dialog = page.getByRole('dialog', { name: 'Journal photo', exact: true });
    const show = async () => { await trigger.focus(); await page.keyboard.press('Enter'); await dialog.waitFor(); };
    const closed = async () => {
      await dialog.waitFor({ state: 'hidden' });
      await returned(page, trigger);
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'auto');
      assert.equal(await saved(page), before);
    };
    await show();
    assert.equal(await dialog.evaluate(el => el.tagName), scenario.missing.length ? 'DIV' : 'DIALOG');
    assert.equal(await focusInside(dialog), true);
    assert.equal(await dialog.getByRole('img', { name: 'Journal photo', exact: true }).evaluate(el => el.complete && el.naturalWidth > 0), true);
    check(`${scenario.name}: actual saved photo loads and dialog receives focus`);
    const geometry = await dialog.evaluate(el => {
      const panel = el.getBoundingClientRect();
      const image = el.querySelector('img').getBoundingClientRect();
      const close = el.querySelector('button').getBoundingClientRect();
      const fits = rect => rect.left >= -1 && rect.top >= -1 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1;
      return { viewport: [innerWidth, innerHeight], panelFits: fits(panel), imageFits: fits(image), closeFits: fits(close) };
    });
    assert.ok(geometry.panelFits && geometry.imageFits && geometry.closeFits, JSON.stringify(geometry));
    check(`${scenario.name}: owned synthetic image and Close control fit viewport`, geometry);
    check(`${scenario.name}: forward and reverse Tab stay inside`, await trap(page, dialog));
    await background.evaluate(el => { el.setAttribute('tabindex', '0'); el.focus(); });
    assert.equal(await focusInside(dialog), true);
    check(`${scenario.name}: programmatic background focus stays inside`);
    await capture(page, `${scenario.name}.png`);
    await page.keyboard.press('Escape');
    await closed();
    check(`${scenario.name}: Escape restores photo trigger/scroll/exact data`);
    await show();
    await dialog.getByRole('button', { name: 'Close photo', exact: true }).click();
    await closed();
    await show();
    await page.mouse.click(2, 2);
    await closed();
    check(`${scenario.name}: repeated Close and backdrop restore photo trigger/exact data`);
    await page.reload();
    await page.getByRole('heading', { name: 'Notebook', exact: true }).waitFor();
    assert.equal(await saved(page), before);
    check(`${scenario.name}: reload preserves usable Notebook and exact photo data`);
    await context.close();
  }

  {
    const { context, page } = await open('fullscreen-unsupported', { fullscreen: 'missing' });
    await startFocus(page);
    const button = page.getByRole('button', { name: 'Fullscreen', exact: true });
    assert.equal(await button.isDisabled(), true);
    assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), false);
    assert.equal(await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).count(), 0);
    await capture(page, 'fullscreen-unsupported.png');
    check('fullscreen: unsupported control is disabled without false state or thrown handler');
    await context.close();
  }
  {
    const { context, page } = await open('fullscreen-denied-recover', { fullscreen: 'denied' });
    await startFocus(page);
    const enter = page.getByRole('button', { name: 'Fullscreen', exact: true });
    const exit = page.getByRole('button', { name: 'Exit fullscreen', exact: true });
    await enter.click();
    await page.waitForFunction(() => window.__qaFullscreenDeniedCalls === 1);
    await enter.waitFor();
    assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), false);
    assert.equal(await exit.count(), 0);
    await capture(page, 'fullscreen-denied.png');
    check('fullscreen: denied request leaves truthful label and working session');
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.getByRole('button', { name: 'Resume', exact: true }).click();
    check('fullscreen: focus Pause/Resume recover after denial');
    await page.evaluate(() => { Element.prototype.requestFullscreen = window.__qaOriginalFullscreen; });
    await enter.click();
    await page.waitForFunction(() => Boolean(document.fullscreenElement));
    await exit.waitFor();
    await capture(page, 'fullscreen-actual-success.png');
    check('fullscreen: restored supported API genuinely enters Chromium fullscreen');
    await page.evaluate(() => document.exitFullscreen());
    await enter.waitFor();
    assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), false);
    check('fullscreen: external browser API exit updates visible label');
    await enter.click();
    await exit.waitFor();
    await exit.click();
    await enter.waitFor();
    assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), false);
    check('fullscreen: reentry and explicit exit track actual document state');
    await context.close();
  }
  assert.deepEqual(report.errors, [], 'Selected fixes must not emit browser page errors');
  check('all isolated synthetic scenarios complete without page errors', { externalBlocked: report.externalBlocked.length });
} catch (error) {
  report.failure = String(error.stack || error);
  console.error(report.failure);
  if (currentPage && !currentPage.isClosed()) {
    try { await capture(currentPage, 'failure.png'); } catch { /* Retain the actual failure even if screenshot fails. */ }
  }
  process.exitCode = 1;
} finally {
  report.sourceUnchanged = files.every(file => hash(file) === report.sourceHashes[file]);
  if (!report.sourceUnchanged) { report.failure ||= 'Source changed during acceptance'; process.exitCode = 1; }
  await browser.close();
  report.artifactHashes = Object.fromEntries(report.screenshots.map(file => [file, createHash('sha256').update(fs.readFileSync(path.join(output, file))).digest('hex')]));
  fs.writeFileSync(path.join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output, checks: report.checks.length, errors: report.errors.length, externalBlocked: report.externalBlocked.length, sourceUnchanged: report.sourceUnchanged, failure: report.failure || null }));
}
