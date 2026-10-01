/** Synthetic Chromium regressions; feature absence and a short viewport are not iOS device tests. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';
import { getInitialDemoState } from '../src/services/repository.ts';

const base = process.env.ODA_QA_URL || 'http://127.0.0.1:3022';
const output = process.env.ODA_DEEP_MODAL_DATE_OUT || 'artifacts/verification/deep-modal-date-after.json';
const key = 'one_decision_away_app_data_v1';
const report = { at: new Date().toISOString(), base, engine: 'installed Chromium', checks: [], errors: [] };
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });
const pass = message => { report.checks.push(message); console.log(`PASS ${message}`); };
const seed = () => {
  const data = getInitialDemoState();
  data.profile.onboardingStep = 'completed'; data.profile.displayName = 'Test'; data.profile.soundMuted = true;
  data.profile.firstOpenedAt = '2026-08-01T12:00:00Z'; data.missions = [];
  return data;
};
const open = async (data, timezoneId, at, fallback = false) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, timezoneId, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.addInitScript(({ key, data, fallback }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem('oda_locale', 'en');
    if (fallback) { HTMLDialogElement.prototype.showModal = undefined; HTMLDialogElement.prototype.close = undefined; }
  }, { key, data, fallback });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.clock.setFixedTime(new Date(at));
  await page.goto(`${base}/app`);
  await page.locator('h1').first().waitFor();
  return { context, page };
};
const saved = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
const press = async (page, button, expected) => {
  await button.click();
  await page.waitForFunction(({ title, expected }) => [...document.querySelectorAll('button')].some(button => button.textContent.trim() === title && button.getAttribute('aria-pressed') === expected), { title: await button.innerText(), expected });
};
try {
  for (const scenario of [
    { zone: 'Europe/Istanbul', at: '2026-09-30T21:30:00Z', day: '2026-10-01', rewardDay: '2026-09-30' },
    { zone: 'America/Los_Angeles', at: '2026-10-01T00:30:00Z', day: '2026-09-30', rewardDay: '2026-10-01' },
  ]) {
    const data = seed(); data.microHabits = data.microHabits.slice(0, 1);
    const { context, page } = await open(data, scenario.zone, scenario.at);
    const button = page.getByRole('button', { name: data.microHabits[0].title, exact: true }).first();
    await press(page, button, 'true');
    let record = await saved(page);
    assert.deepEqual(record.microHabits[0].completedDates, [scenario.day]);
    assert.equal(record.transactions.find(tx => tx.kind === 'micro_habit_reward').dayKey, scenario.rewardDay);
    await press(page, button, 'false'); await press(page, button, 'true');
    await page.reload(); await button.waitFor();
    await press(page, button, 'false'); await press(page, button, 'true');
    record = await saved(page);
    assert.equal(record.transactions.filter(tx => tx.kind === 'micro_habit_reward').length, 1);
    pass(`${scenario.zone}: Today completes the local day; undo, recheck and reload retain one UTC ledger reward`);
    await context.close();
  }

  {
    const { context, page } = await open(seed(), 'Europe/Istanbul', '2026-09-30T21:30:00Z');
    await page.getByRole('button', { name: 'Energy: Good, 4 / 5', exact: true }).click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).checkIns.length === 1, key);
    await page.getByRole('button', { name: /Daily rituals/ }).click();
    await page.getByRole('button', { name: 'Update', exact: true }).click();
    await page.locator('#checkin-notes').fill('One synthetic check-in, edited from the full form.');
    await page.getByRole('button', { name: 'Update check-in', exact: true }).click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).checkIns[0].notes.includes('synthetic'), key);
    const record = await saved(page);
    assert.deepEqual(record.checkIns.map(entry => entry.dateKey), ['2026-10-01']);
    assert.deepEqual(record.transactions.filter(tx => tx.kind === 'check_in_reward').map(tx => tx.dayKey), ['2026-09-30']);
    pass('arrival and the full daily check-in edit one local-day record and retain one UTC ledger reward');
    await context.close();
  }

  {
    const data = seed();
    data.transactions.push({ id: 'near-daily-cap', walletId: 'wallet-demo', userId: data.profile.id, kind: 'mission_reward', amount: 2490, dayKey: '2026-09-30', memo: 'Synthetic reward cap fixture', createdAt: '2026-09-30T20:30:00Z' });
    const { context, page } = await open(data, 'Europe/Istanbul', '2026-09-30T21:30:00Z');
    await page.getByRole('button', { name: 'Energy: Good, 4 / 5', exact: true }).click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).checkIns.length === 1, key);
    const record = await saved(page);
    assert.equal(record.transactions.find(tx => tx.kind === 'check_in_reward').amount, 10);
    assert.equal(record.transactions.filter(tx => tx.dayKey === '2026-09-30' && tx.amount > 0 && tx.kind !== 'welcome_grant').reduce((sum, tx) => sum + tx.amount, 0), 2500);
    pass('a new local-day check-in uses only the remaining UTC daily reward budget');
    await context.close();
  }

  for (const fallback of [true, false]) {
    const data = seed(); const timestamp = '2026-10-01T12:00:00Z';
    data.profile.firstOpenedAt = timestamp;
    data.missions = [{ id: `modal-race-${fallback}`, userId: data.profile.id, title: 'Read two pages', type: 'daily_quest', area: 'Work', difficulty: 'easy', isOneDecision: true, status: 'active', scheduledFor: '2026-10-01', createdAt: timestamp }];
    const { context, page } = await open(data, 'Europe/Istanbul', timestamp, fallback);
    await page.locator('.oda-decision-done').click();
    await page.waitForTimeout(850);
    const dialog = page.getByRole('dialog');
    assert.equal(await dialog.count(), 1);
    assert.match(await dialog.innerText(), /Complete today's decision/);
    assert.ok(await dialog.evaluate(root => root.contains(document.activeElement)));
    for (const key of ['Tab', 'Shift+Tab']) {
      for (let index = 0; index < 12; index += 1) {
        await page.keyboard.press(key);
        assert.ok(await dialog.evaluate(root => root.contains(document.activeElement)));
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(850);
    assert.equal(await dialog.count(), 1);
    assert.match(await dialog.innerText(), /Make it doable/);
    assert.ok(await dialog.evaluate(root => root.contains(document.activeElement)));
    // A short viewport checks layout/focus reachability, without emulating an OS keyboard.
    await page.setViewportSize({ width: 390, height: 420 });
    await page.locator('#plan-then').fill('Start with one page.');
    const save = dialog.getByRole('button', { name: 'Save plan', exact: true });
    await save.scrollIntoViewIfNeeded();
    assert.ok(await save.isVisible());
    await save.click(); await dialog.waitFor({ state: 'detached' });
    assert.equal((await saved(page)).missions[0].plan.ifThen, 'Start with one page.');
    pass(`${fallback ? 'dialog API absence' : 'native dialog'}: auto-plan waits for completion dialog, contains keyboard focus, retries after dismissal and saves in a short viewport`);
    await context.close();
  }
  assert.deepEqual(report.errors, []); report.status = 'passed';
} catch (error) {
  report.status = 'failed'; report.failure = String(error.stack || error); console.error(error); process.exitCode = 1;
} finally {
  mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, JSON.stringify(report, null, 2)); await browser.close();
}
