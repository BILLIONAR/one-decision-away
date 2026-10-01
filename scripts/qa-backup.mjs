/** White-box backup checks: start Vite with DISABLE_HMR=true. Production restore flows are in qa-browser.mjs. */
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE = process.env.ODA_QA_URL || 'http://localhost:3000';
const OUT = process.env.ODA_BACKUP_QA_OUT || 'artifacts/backup-qa';
const APP_KEY = 'one_decision_away_app_data_v1';
mkdirSync(OUT, { recursive: true });
const report = { base: BASE, at: new Date().toISOString(), checks: [], screenshots: [], errors: [], accessibility: [] };
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
const page = await context.newPage();
page.on('pageerror', error => report.errors.push(error.message));
const check = name => { report.checks.push(name); console.log(`PASS ${name}`); };
const saved = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)), APP_KEY);
const upload = value => page.locator('input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'oda-reviewed-backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
const review = () => page.getByRole('dialog', { name: 'Review the record to restore' });
const confirm = async () => {
  await review().getByRole('button', { name: 'Replace saved record', exact: true }).click();
  await review().waitFor({ state: 'hidden' });
};

try {
  const moduleResponse = await page.request.get(`${BASE}/src/services/repository.ts`);
  assert.match(moduleResponse.headers()['content-type'] || '', /javascript/, 'qa:backup requires the development server (DISABLE_HMR=true npm run dev); use test:browser for production restore checks');
  await page.goto(`${BASE}/`);
  await page.waitForFunction(() => !!localStorage.getItem('one_decision_away_app_data_v1'));
  const initial = await page.evaluate(async () => {
    const { getInitialDemoState } = await import('/src/services/repository.ts');
    const { courseCatalogFor } = await import('/src/data/courseCatalog.ts');
    const { queueDataWrite } = await import('/src/services/dataWrites.ts');
    const record = getInitialDemoState();
    record.profile = { ...record.profile, onboardingStep: 'completed', displayName: 'Local record', locale: 'en' };
    const course = courseCatalogFor('en')[0];
    const lesson = course.lessons[0];
    record.courseProgress = {
      version: 1,
      lessons: { [lesson.id]: { checked: Array(lesson.practiceCount).fill(true), answer: lesson.correct, reflection: 'Private lesson reflection\nMy practical next step.', completed: true } },
      experiments: { [course.id]: { cue: 'After tea', action: 'Open the document', fallback: 'Write one word', evidence: 'A dated draft', reviewOn: '2026-10-07', attempts: [{ id: 'attempt-browser', date: '2026-09-30', outcome: 'tried', note: 'A small start happened.' }], review: { recall: 'Make the step observable', nextAction: 'Try the same cue', reviewedOn: '2026-09-30' } } },
    };
    localStorage.setItem('oda_locale', 'en');
    await queueDataWrite(() => localStorage.setItem('one_decision_away_app_data_v1', JSON.stringify(record)));
    return record;
  });
  await page.goto(`${BASE}/app/settings`);
  await page.getByRole('heading', { name: 'Backup and sync', exact: true }).waitFor();
  const original = await saved();
  const modern = structuredClone(original);
  modern.profile.displayName = 'Reviewed imported record';
  modern.courseProgress.lessons[Object.keys(modern.courseProgress.lessons)[0]].reflection = 'Imported reflection';
  await upload(modern);
  await review().waitFor();
  await page.evaluate(() => document.fonts.ready);
  assert.equal((await saved()).profile.displayName, 'Local record');
  assert.equal(await review().getByText('Lesson reflections', { exact: true }).count(), 1);
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press('Tab');
    assert.ok(await review().evaluate(dialog => dialog.contains(document.activeElement)), 'Focus must stay inside the restore review');
  }
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  report.accessibility = axe.violations.map(issue => ({ id: issue.id, impact: issue.impact, nodes: issue.nodes.map(node => node.target) }));
  assert.equal(report.accessibility.filter(issue => ['serious', 'critical'].includes(issue.impact)).length, 0);
  await page.screenshot({ path: `${OUT}/backup-review-mobile.png` });
  report.screenshots.push('backup-review-mobile.png');
  check('validated restore review is mobile accessible and traps keyboard focus before changing data');
  await page.keyboard.press('Escape');
  await review().waitFor({ state: 'hidden' });
  assert.deepEqual(await saved(), original);
  check('cancelling a file restore leaves the entire saved record intact');

  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup', exact: true }).click();
  const download = await downloadEvent;
  await download.saveAs(`${OUT}/downloaded-backup.json`);
  const exported = JSON.parse(readFileSync(`${OUT}/downloaded-backup.json`, 'utf8'));
  assert.deepEqual(exported.courseProgress, original.courseProgress);
  check('downloaded JSON includes current course reflections, completion, plans and practice logs');

  await upload(modern); await confirm();
  await page.getByText('Backup restored. Welcome back.', { exact: true }).waitFor();
  assert.equal((await saved()).profile.displayName, modern.profile.displayName);
  assert.deepEqual((await saved()).courseProgress, modern.courseProgress);
  await page.reload();
  await page.getByRole('heading', { name: 'Backup and sync', exact: true }).waitFor();
  assert.deepEqual((await saved()).courseProgress, modern.courseProgress);
  check('confirmed modern restore and course work survive a full reload');

  const legacy = structuredClone(original);
  legacy.profile.displayName = 'Legacy import';
  delete legacy.courseProgress;
  await upload(legacy); await confirm();
  assert.equal((await saved()).profile.displayName, 'Legacy import');
  assert.deepEqual((await saved()).courseProgress, modern.courseProgress);
  check('restoring an older backup preserves course work already on the device');

  const beforeInvalid = await saved();
  await upload({ profile: { displayName: 'Malformed record' }, transactions: [] });
  await page.getByText('That file is not a One Decision Away backup.', { exact: true }).waitFor();
  assert.equal(await review().count(), 0);
  assert.deepEqual(await saved(), beforeInvalid);
  check('malformed backups are rejected before review or any personal-data write');

  await page.evaluate(key => {
    const originalSetItem = Storage.prototype.setItem;
    window.odaRestoreSetItem = originalSetItem;
    Storage.prototype.setItem = function (storageKey, value) {
      if (storageKey === key) throw new DOMException('Test quota failure', 'QuotaExceededError');
      return originalSetItem.call(this, storageKey, value);
    };
  }, APP_KEY);
  await upload(modern); await confirm();
  await page.getByText('Could not read the backup file.', { exact: true }).waitFor();
  assert.deepEqual(await saved(), beforeInvalid);
  await page.evaluate(() => { Storage.prototype.setItem = window.odaRestoreSetItem; delete window.odaRestoreSetItem; });
  check('quota failure leaves the previous personal record and course work intact');

  // A second tab saves a course after the Settings page loaded its data.
  const second = await context.newPage();
  await second.goto(`${BASE}/app/settings`);
  await second.getByRole('heading', { name: 'Backup and sync', exact: true }).waitFor();
  const newerReflection = 'Updated from the second tab';
  await second.evaluate(async reflection => {
    const { readCourseProgress, saveCourseProgress } = await import('/src/services/courseProgress.ts');
    const state = readCourseProgress();
    state.lessons[Object.keys(state.lessons)[0]].reflection = reflection;
    if (!await saveCourseProgress(state)) throw new Error('Second-tab save failed');
  }, newerReflection);
  await page.waitForFunction(({ key, reflection }) => Object.values(JSON.parse(localStorage.getItem(key)).courseProgress.lessons).some(lesson => lesson.reflection === reflection), { key: APP_KEY, reflection: newerReflection });
  const secondDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup', exact: true }).click();
  await (await secondDownload).saveAs(`${OUT}/cross-tab-backup.json`);
  assert.ok(Object.values(JSON.parse(readFileSync(`${OUT}/cross-tab-backup.json`, 'utf8')).courseProgress.lessons).some(lesson => lesson.reflection === newerReflection));
  check('cross-tab course saves are included in an export from an already-open Settings screen');

  await second.evaluate(async () => {
    const { queueDataWrite } = await import('/src/services/dataWrites.ts');
    window.odaNotebookLock = queueDataWrite(async () => {
      const snapshot = JSON.parse(localStorage.getItem('one_decision_away_app_data_v1'));
      window.odaNotebookLockHeld = true;
      await new Promise(resolve => { window.odaReleaseNotebookLock = resolve; });
      snapshot.notebook.entries.push({ id: 'locked-cross-tab-note', kind: 'journal', title: 'Concurrent notebook writing', content: 'The notebook writer must survive a course save.', dateKey: '2026-09-30', createdAt: '2026-09-30T10:00:00Z', updatedAt: '2026-09-30T10:00:00Z' });
      localStorage.setItem('one_decision_away_app_data_v1', JSON.stringify(snapshot));
    });
  });
  await second.waitForFunction(() => window.odaNotebookLockHeld === true);
  const courseMutation = page.evaluate(async () => {
    const { mutateCourseProgress } = await import('/src/services/courseProgress.ts');
    return mutateCourseProgress(current => ({ ...current, lessons: { ...current.lessons, [Object.keys(current.lessons)[0]]: { ...Object.values(current.lessons)[0], reflection: 'Course mutation after the other tab releases its notebook lock' } } }));
  });
  await page.waitForTimeout(100);
  assert.ok(Object.values((await saved()).courseProgress.lessons).some(lesson => lesson.reflection === newerReflection));
  await second.evaluate(() => window.odaReleaseNotebookLock());
  assert.ok(await courseMutation);
  assert.ok((await saved()).notebook.entries.some(entry => entry.id === 'locked-cross-tab-note'));
  assert.ok(Object.values((await saved()).courseProgress.lessons).some(lesson => lesson.reflection === 'Course mutation after the other tab releases its notebook lock'));
  await second.close();
  check('a real cross-tab Web Lock preserves both a delayed notebook write and the queued course mutation');

  // Simulate the existing optional connector without network calls or credentials.
  const cloudRecord = structuredClone(await saved());
  cloudRecord.profile.displayName = 'Reviewed cloud record';
  await page.evaluate(async remote => {
    for (const key of Object.keys(localStorage)) if (key.startsWith('oda_cloud_pending_restore')) localStorage.removeItem(key);
    localStorage.removeItem('oda_cloud_last_sync');
    const loadedModule = performance.getEntriesByType('resource').filter(item => item.name.includes('/src/services/cloudSync.ts')).at(-1);
    const { cloudSync } = await import(loadedModule?.name ?? '/src/services/cloudSync.ts');
    window.odaCloudUploads = 0;
    Object.assign(cloudSync, {
      config: { url: 'https://project.example', anonKey: 'test-only' }, session: { user: { id: 'simulated-account', email: 'example@example.test' } },
      client: { from: () => ({ upsert: async () => { window.odaCloudUploads++; return { error: null }; }, select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { data: remote, updated_at: '2030-01-01T00:00:00Z' }, error: null }) }) }) }) },
    });
    cloudSync.emit();
  }, cloudRecord);
  await page.getByRole('button', { name: 'Sync now', exact: true }).click();
  await review().waitFor();
  await review().getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.notEqual((await saved()).profile.displayName, cloudRecord.profile.displayName);
  assert.equal(await page.evaluate(() => window.odaCloudUploads), 0);
  assert.equal(await page.evaluate(() => localStorage.getItem('oda_cloud_last_sync')), null);
  await page.getByRole('button', { name: 'Sync now', exact: true }).click();
  await review().waitFor();
  await confirm();
  await page.getByText('Synced from cloud.', { exact: true }).waitFor();
  assert.equal((await saved()).profile.displayName, cloudRecord.profile.displayName);
  assert.deepEqual((await saved()).courseProgress, cloudRecord.courseProgress);
  check('manual cloud cancellation neither uploads local data nor marks a sync; retry reviews and restores successfully');

  const beforeScopeRace = await saved();
  const staleAccountRecord = structuredClone(beforeScopeRace);
  staleAccountRecord.profile.displayName = 'Stale account A response';
  const changedMessage = 'Your account or saved record changed during review. Your current data was kept. Sync again to review the latest backup.';
  await page.evaluate(async remote => {
    const loadedModule = performance.getEntriesByType('resource').filter(item => item.name.includes('/src/services/cloudSync.ts')).at(-1);
    const { cloudSync } = await import(loadedModule?.name ?? '/src/services/cloudSync.ts');
    window.odaCloudForRace = cloudSync;
    window.odaCloudUploads = 0;
    localStorage.removeItem('oda_cloud_last_sync');
    Object.assign(cloudSync, {
      config: { url: 'https://scope-a.example', anonKey: 'public-test-only' }, session: { user: { id: 'scope-a', email: 'a@example.test' } },
      client: { from: () => ({ upsert: async () => { window.odaCloudUploads++; return { error: null }; }, select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { data: remote, updated_at: '2030-01-01T00:00:00Z' }, error: null }) }) }) }) },
    });
    cloudSync.emit();
  }, staleAccountRecord);
  await page.getByRole('button', { name: 'Sync now', exact: true }).click();
  await review().waitFor();
  await page.evaluate(() => {
    Object.assign(window.odaCloudForRace, { config: { url: 'https://scope-b.example', anonKey: 'public-test-only' }, session: { user: { id: 'scope-b', email: 'b@example.test' } } });
    window.odaCloudForRace.emit();
  });
  await confirm();
  await page.getByText(changedMessage, { exact: true }).waitFor();
  assert.deepEqual(await saved(), beforeScopeRace);
  assert.equal(await page.evaluate(() => window.odaCloudUploads), 0);
  assert.equal(await page.evaluate(() => localStorage.getItem('oda_cloud_last_sync')), null);
  check('changing account/project during an open cloud review keeps local data and does not mark or upload the stale record');

  await page.evaluate(remote => {
    const cloudSync = window.odaCloudForRace;
    window.odaRaceReadStarted = false;
    Object.assign(cloudSync, {
      config: { url: 'https://scope-a.example', anonKey: 'public-test-only' }, session: { user: { id: 'scope-a', email: 'a@example.test' } },
      client: { from: () => ({ upsert: async () => { window.odaCloudUploads++; return { error: null }; }, select: () => ({ eq: () => ({ maybeSingle: () => {
        window.odaRaceReadStarted = true;
        return new Promise(resolve => { window.odaResolveRaceRead = () => resolve({ data: { data: remote, updated_at: '2030-01-01T00:00:00Z' }, error: null }); });
      } }) }) }) },
    });
    cloudSync.emit();
  }, staleAccountRecord);
  await page.getByRole('button', { name: 'Sync now', exact: true }).click();
  await page.waitForFunction(() => window.odaRaceReadStarted === true);
  await page.evaluate(() => {
    Object.assign(window.odaCloudForRace, { config: { url: 'https://scope-b.example', anonKey: 'public-test-only' }, session: { user: { id: 'scope-b', email: 'b@example.test' } } });
    window.odaCloudForRace.emit(); window.odaResolveRaceRead();
  });
  await page.waitForTimeout(250);
  assert.equal(await review().count(), 0);
  assert.deepEqual(await saved(), beforeScopeRace);
  assert.equal(await page.evaluate(() => window.odaCloudUploads), 0);
  assert.equal(await page.evaluate(() => localStorage.getItem('oda_cloud_last_sync')), null);
  check('manual sync with a late previous-account SELECT does not fall back to uploading local data into the new account');

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('heading', { name: 'Backup and sync', exact: true }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${OUT}/settings-backup-desktop.png` });
  report.screenshots.push('settings-backup-desktop.png');
  assert.equal(report.errors.length, 0, report.errors.join('\n'));
  check('desktop backup controls render without browser exceptions');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = error.message;
  await page.screenshot({ path: `${OUT}/failure.png`, fullPage: true }).catch(() => undefined);
  throw error;
} finally {
  writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
