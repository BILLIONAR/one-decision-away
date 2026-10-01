/** Synthetic Chromium regressions. Sources are bundled fresh; every request is intercepted. */
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const output = process.env.ODA_ACCOUNT_FENCES_OUT || 'artifacts/verification/independent-account-fences-after.json';
assert.ok(!existsSync(output), `Evidence already exists: ${output}; select a new ODA_ACCOUNT_FENCES_OUT path`);
const bundle = await build({
  stdin: {
    contents: `import { LocalDemoRepository, getInitialDemoState } from './src/services/repository.ts';
      import { cloudSync } from './src/services/cloudSync.ts';
      import { mutateCourseProgress, subscribeCourseProgress } from './src/services/courseProgress.ts';
      import { updateCourseExperiment } from './src/services/courseLearning.ts';
      import { queueDataWrite } from './src/services/dataWrites.ts';
      window.__fences = { LocalDemoRepository, getInitialDemoState, cloudSync, mutateCourseProgress, subscribeCourseProgress, updateCourseExperiment, queueDataWrite };`,
    resolveDir: process.cwd(),
  },
  bundle: true, write: false, format: 'iife', platform: 'browser', target: 'es2022',
  define: { 'import.meta.env': '{}' }, logLevel: 'silent',
});
const report = { at: new Date().toISOString(), source: 'fresh in-memory bundle of current checkout', realProviderRequests: 0, checks: [], observations: [], errors: [] };
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });

async function fixture() {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('**/*', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Synthetic account fences</title>' }));
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto('http://127.0.0.1:9876/__fences');
  await page.addScriptTag({ content: bundle.outputFiles[0].text });
  await page.evaluate(async () => {
    const services = window.__fences;
    const repo = new services.LocalDemoRepository();
    const initial = services.getInitialDemoState();
    initial.profile.displayName = 'Synthetic account A record';
    initial.courseProgress = { version: 1, lessons: {}, experiments: {} };
    localStorage.setItem('one_decision_away_app_data_v1', JSON.stringify(initial));
    await repo.load();
    const state = { repo, uploads: [], timers: [], notifications: [], release: false, held: false };
    services.cloudSync.config = { url: 'https://synthetic.invalid', anonKey: 'fixture' };
    services.cloudSync.client = { from: () => ({ upsert: async record => { state.uploads.push({ user: record.user_id, name: record.data.profile.displayName }); return { error: null }; } }) };
    services.cloudSync.setSession({ user: { id: 'A' }, access_token: 'fixture-A' });
    state.switchTo = id => services.cloudSync.setSession({ user: { id }, access_token: `fixture-${id}` });
    window.setTimeout = callback => { state.timers.push(callback); return state.timers.length; };
    window.clearTimeout = id => { state.timers[id - 1] = null; };
    state.arm = () => {
      state.holdSignal = new Promise(resolve => { state.signal = resolve; });
      state.release = false;
      state.holdNext = true;
    };
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(...args) {
      const request = put.apply(this, args);
      if (state.holdNext && this.transaction.db.name === 'oda_personal_record_v1') {
        state.holdNext = false;
        state.held = true;
        state.signal();
        const store = this;
        const keepAlive = () => {
          const pending = store.get('current');
          pending.onsuccess = () => { if (!state.release) keepAlive(); };
        };
        keepAlive();
      }
      return request;
    };
    state.drain = async () => {
      await services.queueDataWrite(() => undefined);
      for (const callback of state.timers.splice(0)) callback?.();
      await services.cloudSync.pushQueue;
    };
    window.__state = state;
  });
  return { context, page };
}

try {
  {
    const { context, page } = await fixture();
    try {
      const observation = await page.evaluate(async () => {
        const { cloudSync, getInitialDemoState } = window.__fences;
        const state = window.__state;
        const original = localStorage.getItem('one_decision_away_app_data_v1');
        const remote = getInitialDemoState(); remote.profile.displayName = 'Synthetic remote account A record';
        cloudSync.client = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { data: remote, updated_at: '2030-01-01T00:00:00Z' }, error: null }) }) }) }) };
        const pending = await cloudSync.pullIfNewer(await state.repo.load());
        state.arm();
        const replacement = state.repo.replaceAll(pending, originalRaw => cloudSync.canApplyRemote(pending, originalRaw));
        await state.holdSignal;
        state.switchTo('B');
        state.release = true;
        const applied = await replacement;
        const canonical = await state.repo.load();
        return { applied, activeUser: cloudSync.getState().session.user.id, originalPreserved: localStorage.getItem('one_decision_away_app_data_v1') === original, targetPublished: pending.profile.displayName === canonical.profile.displayName };
      });
      assert.equal(observation.applied, false);
      assert.equal(observation.activeUser, 'B');
      assert.equal(observation.originalPreserved, true);
      assert.equal(observation.targetPublished, false);
      report.observations.push({ case: 'remote replacement expires during durable commit', ...observation });
      report.checks.push('Expired account replacement restores the exact prior canonical record without publication');
    } finally { await context.close(); }
  }
  for (const command of ['settings', 'notebook']) {
    const { context, page } = await fixture();
    try {
      const observation = await page.evaluate(async command => {
        const state = window.__state;
        const data = await state.repo.load();
        data.profile = { ...data.profile, soundMuted: true };
        state.arm();
        const operation = command === 'settings'
          ? state.repo.save(data)
          : state.repo.mutateNotebook({ type: 'save_entry', input: { kind: 'journal', content: 'Synthetic account A writing' } });
        await state.holdSignal;
        state.switchTo('B');
        state.release = true;
        await operation;
        await state.drain();
        const current = await state.repo.load();
        return { uploads: state.uploads, localSaved: command === 'settings' ? current.profile.soundMuted : current.notebook.entries.some(entry => entry.content === 'Synthetic account A writing') };
      }, command);
      assert.deepEqual(observation.uploads, []);
      assert.equal(observation.localSaved, true);
      report.observations.push({ case: `${command} save account expires during durable commit`, ...observation });
      report.checks.push(`${command} save succeeds locally and cannot schedule another account's backup`);
    } finally { await context.close(); }
  }
  for (const expires of [true, false]) {
    const { context, page } = await fixture();
    try {
      const observation = await page.evaluate(async expires => {
        const services = window.__fences;
        const state = window.__state;
        const off = services.subscribeCourseProgress(canSync => {
          state.notifications.push({ guarded: typeof canSync === 'function', current: canSync?.() ?? null });
          void state.repo.load().then(latest => { if (canSync?.()) services.cloudSync.schedulePush(latest); });
        });
        state.arm();
        const saving = services.mutateCourseProgress(current => ({ ...current, experiments: services.updateCourseExperiment(current.experiments, 'procrastination', { action: 'Synthetic course action' }) }));
        await state.holdSignal;
        if (expires) state.switchTo('B');
        state.release = true;
        const saved = await saving;
        await state.drain();
        const uploadsAfterLocalEvent = state.uploads.slice();
        window.dispatchEvent(new StorageEvent('storage', { key: 'one_decision_away_app_data_v1' }));
        await state.drain();
        off();
        return { saved: !!saved, notifications: state.notifications, uploadsAfterLocalEvent, uploadsAfterStorageEvent: state.uploads };
      }, expires);
      assert.equal(observation.saved, true);
      assert.deepEqual(observation.notifications, [{ guarded: true, current: !expires }, { guarded: false, current: null }]);
      assert.equal(observation.uploadsAfterLocalEvent.length, expires ? 0 : 1);
      if (!expires) assert.equal(observation.uploadsAfterLocalEvent[0].user, 'A');
      assert.deepEqual(observation.uploadsAfterStorageEvent, observation.uploadsAfterLocalEvent);
      report.observations.push({ case: `course event ${expires ? 'expired' : 'current'} during durable commit`, ...observation });
      report.checks.push(`${expires ? 'Expired' : 'Current'} course event keeps its origin guard; other-tab refresh never schedules an upload`);
    } finally { await context.close(); }
  }
  assert.deepEqual(report.errors, []);
} catch (error) {
  report.failure = String(error.stack || error);
  throw error;
} finally {
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}
console.log(`PASS ${report.checks.length} independent account-fencing browser checks; ${output}`);
