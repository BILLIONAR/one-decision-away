/** Synthetic browser save failures: feedback, retained form values, retry and theme rollback. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { getInitialDemoState } from '../src/services/repository.ts';
const base = (process.env.ODA_QA_URL || 'http://127.0.0.1:3029').replace(/\/$/, '');
const output = process.env.ODA_DEEP_SETTINGS_OUT || 'artifacts/verification/deep-settings-after.json';
const origin = new URL(base).origin;
const key = 'one_decision_away_app_data_v1';
const report = { at: new Date().toISOString(), base, checks: [], errors: [] };
const seed = getInitialDemoState();
seed.profile = { ...seed.profile, onboardingStep: 'completed', displayName: 'Synthetic saved profile', theme: 'light', soundMuted: true };
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
await context.addInitScript(({ key, seed }) => {
  if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(seed));
  localStorage.setItem('oda_locale', 'en');
}, { key, seed });
const page = await context.newPage();
page.on('pageerror', error => report.errors.push(error.message));
const pass = text => { report.checks.push(text); console.log(`PASS ${text}`); };
try {
  await page.goto(`${base}/app/settings`);
  await page.locator('#profile-name').fill('Synthetic retained unsaved profile');
  await page.evaluate(() => {
    window.__odaSettingsOriginalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === 'one_decision_away_app_data_v1') throw new DOMException('Synthetic storage failure', 'QuotaExceededError');
      return window.__odaSettingsOriginalSet.call(this, key, value);
    };
  });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('status').filter({ hasText: /could not be saved|were not saved|storage is unavailable/i }).waitFor();
  assert.equal(await page.locator('#profile-name').inputValue(), 'Synthetic retained unsaved profile');
  assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).profile.displayName, key), seed.profile.displayName);
  assert.deepEqual(report.errors, []);
  pass('Failed profile save reports an accessible error, preserves the form and keeps the saved profile');
  await page.locator('#appearance').getByRole('button', { name: 'Dark', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#appearance button[aria-pressed="true"]')?.textContent.includes('Light'));
  assert.equal(await page.evaluate(() => document.documentElement.classList.contains('dark')), false);
  assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).profile.theme, key), 'light');
  assert.deepEqual(report.errors, []);
  pass('Failed theme save restores the selection and keeps the saved light theme active');
  await page.evaluate(() => { Storage.prototype.setItem = window.__odaSettingsOriginalSet; });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).profile.displayName === 'Synthetic retained unsaved profile', key);
  assert.deepEqual(report.errors, []);
  await page.reload();
  await page.locator('#profile-name').waitFor();
  assert.equal(await page.locator('#profile-name').inputValue(), 'Synthetic retained unsaved profile');
  pass('Retry saves the retained profile and reload restores the committed value');
  report.status = 'passed';
} catch (error) { report.status = 'failed'; report.failure = String(error.stack || error); process.exitCode = 1; }
finally {
  mkdirSync(output.slice(0, output.lastIndexOf('/')), { recursive: true });
  writeFileSync(output, JSON.stringify(report, null, 2));
  await browser.close();
}
