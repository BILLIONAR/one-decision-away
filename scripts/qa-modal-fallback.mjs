/** Feature-absence simulation on a built preview; this is not an iOS device test. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { getInitialDemoState } from '../src/services/repository.ts';

const base = process.env.ODA_QA_URL || 'http://localhost:4173';
const output = process.env.ODA_MODAL_QA_OUT || 'artifacts/modal-fallback';
const key = 'one_decision_away_app_data_v1';
const report = { at: new Date().toISOString(), base, checks: [], accessibility: [], errors: [] };
mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });
const pass = message => { report.checks.push(message); console.log(`PASS ${message}`); };
const scenarios = [
  { name: 'missing-showModal', missing: ['showModal'], mobile: false },
  { name: 'missing-close', missing: ['close'], mobile: true },
  { name: 'missing-dialog-and-inert', missing: ['showModal', 'close'], missingInert: true, mobile: false },
  { name: 'native-dialog', missing: [], mobile: false },
];
try {
  for (const scenario of scenarios) {
    const seed = getInitialDemoState();
    seed.profile.onboardingStep = 'completed'; seed.profile.displayName = 'Maya'; seed.profile.locale = 'en';
    const context = await browser.newContext({ viewport: scenario.mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.addInitScript(({ key, seed, scenario }) => {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
      localStorage.setItem('oda_locale', 'en');
      for (const method of scenario.missing) HTMLDialogElement.prototype[method] = undefined;
      if (scenario.missingInert) delete HTMLElement.prototype.inert;
    }, { key, seed, scenario });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(`${scenario.name}: ${error.message}`));
    await page.goto(`${base}/app`);
    await page.locator('#today-decision-input').waitFor();
    await page.evaluate(() => { document.body.style.overflow = 'auto'; });
    await page.locator('#today-decision-input').fill('Read the next two pages');
    await page.getByRole('button', { name: 'Set decision', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    const native = scenario.missing.length === 0;
    assert.equal(await dialog.evaluate(element => element.tagName), native ? 'DIALOG' : 'DIV');
    assert.equal(await dialog.getAttribute('aria-modal'), native ? null : 'true');
    assert.ok(await dialog.getAttribute('aria-labelledby'));
    const saved = await page.evaluate(key => localStorage.getItem(key), key);
    assert.ok(JSON.parse(saved).missions.some(mission => mission.title === 'Read the next two pages'));
    if (!native) assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    pass(`${scenario.name}: setting a decision opens an identified dialog and preserves the saved decision`);

    for (const command of ['Tab', 'Shift+Tab']) {
      for (let count = 0; count < 16; count += 1) {
        await page.keyboard.press(command);
        assert.ok(await dialog.evaluate(element => element.contains(document.activeElement)), `${command} escaped ${scenario.name}`);
      }
    }
    if (!native) {
      await page.evaluate(() => document.querySelector('.oda-sidebar button')?.focus());
      assert.ok(await dialog.evaluate(element => element.contains(document.activeElement)), 'background focus escaped');
      assert.equal(await page.locator('.oda-sidebar').getAttribute('aria-hidden'), 'true');
    }
    pass(`${scenario.name}: forward/backward Tab and background focus stay contained`);

    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    report.accessibility.push({ scenario: scenario.name, violations: axe.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })) });
    assert.deepEqual(axe.violations, [], `${scenario.name} accessibility failures`);
    await page.screenshot({ path: `${output}/${scenario.name}.png` });
    await page.keyboard.press('Escape');
    assert.equal(await dialog.count(), 0);
    if (!native) {
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'auto');
      assert.equal(await page.locator('.oda-sidebar').getAttribute('aria-hidden'), null);
    }

    const trigger = page.getByRole('button', { name: /Plan for obstacles/ });
    await trigger.focus(); await trigger.click(); await dialog.waitFor();
    await page.keyboard.press('Escape');
    assert.equal(await dialog.count(), 0);
    assert.ok(await trigger.evaluate(element => element === document.activeElement));
    await trigger.click(); await dialog.waitFor();
    await page.mouse.click(5, 5);
    assert.equal(await dialog.count(), 0);
    assert.ok(await trigger.evaluate(element => element === document.activeElement));
    await trigger.click(); await dialog.waitFor();
    await dialog.getByRole('button', { name: 'Close', exact: true }).click();
    assert.equal(await dialog.count(), 0);
    assert.ok(await trigger.evaluate(element => element === document.activeElement));
    assert.equal(await page.evaluate(key => localStorage.getItem(key), key), saved);
    if (!native) assert.equal(await page.evaluate(() => document.body.style.overflow), 'auto');
    pass(`${scenario.name}: Escape, backdrop and close button survive reopening, restore focus/scroll and keep data unchanged`);
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  pass('no uncaught errors across feature-absence and native-dialog checks');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = String(error.stack || error); console.error(error); process.exitCode = 1;
} finally {
  writeFileSync(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
