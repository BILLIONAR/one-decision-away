/**
 * Browser persistence failure regressions against a source Vite server.
 * Disposable contexts contain only synthetic records; external requests are blocked.
 * ODA_QA_URL=http://127.0.0.1:3031 node --import tsx scripts/qa-data-authority.mjs
 */
import assert from 'node:assert/strict';
import { dirname } from 'node:path';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
import { getInitialDemoState } from '../src/services/repository.ts';

const base = (process.env.ODA_QA_URL || 'http://127.0.0.1:3031').replace(/\/$/, '');
const origin = new URL(base).origin;
const output = process.env.ODA_DATA_AUTHORITY_QA_OUT || 'artifacts/verification/data-authority-final.json';
const appKey = 'one_decision_away_app_data_v1';
const legacyKey = 'oda_course_progress_v1';
const databaseName = 'oda_personal_record_v1';
const report = { base, at: new Date().toISOString(), checks: [], observations: [], errors: [] };
assert.ok(!existsSync(output), `Evidence already exists: ${output}; select a new ODA_DATA_AUTHORITY_QA_OUT path`);
mkdirSync(dirname(output), { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.ODA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'] });

const experiment = action => ({ cue: 'After synthetic tea', action, fallback: '', evidence: '', reviewOn: null, attempts: [], review: { recall: '', nextAction: '', reviewedOn: null } });
const seedFor = () => {
  const seed = getInitialDemoState();
  seed.profile = { ...seed.profile, displayName: 'Synthetic authority review', locale: 'en', onboardingStep: 'completed', theme: 'light' };
  seed.courseProgress = { version: 1, lessons: {}, experiments: { procrastination: experiment('Original synthetic action') } };
  return seed;
};
const legacy = { version: 1, lessons: {}, experiments: { procrastination: experiment('Legacy synthetic private course text') } };
const pass = name => { report.checks.push(name); console.log(`PASS ${name}`); };

async function fixture(apiMissing) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    if (url.pathname === '/__oda_authority_review') return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Synthetic ODA authority review</title>' });
    return route.continue();
  });
  await context.addInitScript(({ appKey, legacyKey, databaseName, seed, legacy, apiMissing }) => {
    if (!localStorage.getItem(appKey)) localStorage.setItem(appKey, JSON.stringify(seed));
    if (!localStorage.getItem(legacyKey)) localStorage.setItem(legacyKey, JSON.stringify(legacy));
    localStorage.setItem('oda_locale', 'en');
    window.__odaAuthorityReview = { cloudSchedules: 0, notifications: 0, aborts: [], abortNext: false, skipAbortPuts: 0, storageEvents: [], blockRollback: false, rollbackRaw: null, rollbackFailures: 0, holdAbortNext: false, releaseAbort: false, holdCommitNext: false, skipHoldPuts: 0, releaseCommit: false, holding: false };
    window.addEventListener('oda:course-progress-changed', () => { window.__odaAuthorityReview.notifications++; });
    window.addEventListener('storage', event => {
      if (event.key === appKey) window.__odaAuthorityReview.storageEvents.push(event.newValue);
    });
    const originalSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      const state = window.__odaAuthorityReview;
      if (key === appKey && state.blockRollback && state.aborts.length && value === state.rollbackRaw) {
        state.blockRollback = false;
        state.rollbackFailures++;
        throw new DOMException('Synthetic blocked projection recovery', 'QuotaExceededError');
      }
      return originalSet.call(this, key, value);
    };
    const originalPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function(...args) {
      const request = originalPut.apply(this, args);
      const state = window.__odaAuthorityReview;
      const authorityStore = this.transaction.db.name === databaseName && this.name === 'record';
      const holdingArmed = (state.holdAbortNext || state.holdCommitNext) && authorityStore;
      const holdThisPut = holdingArmed && state.skipHoldPuts === 0;
      if (holdingArmed && state.skipHoldPuts > 0) state.skipHoldPuts--;
      if (holdThisPut) {
        const finishWithAbort = state.holdAbortNext;
        state.holdAbortNext = false;
        state.holdCommitNext = false;
        state.holding = true;
        const store = this;
        // Keep the real readwrite transaction open with requests until the test
        // creates a session in the other tab; no elapsed-time guess is needed.
        const keepAlive = () => {
          const pending = store.get('current');
          pending.onsuccess = () => {
            if (finishWithAbort ? state.releaseAbort : state.releaseCommit) {
              state.holding = false;
              if (finishWithAbort) {
                state.aborts.push({ appRaw: localStorage.getItem(appKey), legacyRaw: localStorage.getItem(legacyKey) });
                store.transaction.abort();
              }
            } else keepAlive();
          };
        };
        keepAlive();
      }
      if (state.abortNext && authorityStore) {
        if (state.skipAbortPuts > 0) state.skipAbortPuts--;
        else {
          state.abortNext = false;
          state.aborts.push({ appRaw: localStorage.getItem(appKey), legacyRaw: localStorage.getItem(legacyKey) });
          this.transaction.abort();
        }
      }
      return request;
    };
    if (apiMissing === 'indexedDB') Object.defineProperty(window, 'indexedDB', { configurable: true, value: undefined });
    if (apiMissing === 'locks') Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined });
  }, { appKey, legacyKey, databaseName, seed: seedFor(), legacy, apiMissing });
  const page = await newPage(context, !apiMissing);
  return { context, page };
}

async function newPage(context, load = true) {
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.goto(`${base}/__oda_authority_review`);
  await page.evaluate(async load => {
    const { LocalDemoRepository } = await import('/src/services/repository.ts');
    const { cloudSync } = await import('/src/services/cloudSync.ts');
    window.__odaAuthorityRepository = new LocalDemoRepository();
    cloudSync.schedulePush = () => { window.__odaAuthorityReview.cloudSchedules++; };
    if (load) await window.__odaAuthorityRepository.load();
  }, load);
  return page;
}

async function drain(page) {
  await page.evaluate(async () => {
    const { queueDataWrite } = await import('/src/services/dataWrites.ts');
    await queueDataWrite(() => undefined);
  });
}

async function failedDraft(page, action) {
  const result = await page.evaluate(async action => {
    const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
    const { updateCourseExperiment } = await import('/src/services/courseLearning.ts');
    const session = getCourseProgressSession();
    window.__odaAuthorityReview.abortNext = true;
    const saved = await session.update(current => ({ ...current, experiments: updateCourseExperiment(current.experiments, 'procrastination', { action }) }));
    return { saved, action: session.read().experiments?.procrastination?.action, failed: session.saveFailed() };
  }, action);
  assert.equal(result.saved, false);
  assert.equal(result.action, action);
  assert.equal(result.failed, true, 'A retained private draft must keep its failed-save warning state');
  await drain(page);
  return result;
}

try {
  for (const expire of [false, true]) {
    const { context, page } = await fixture();
    try {
      await failedDraft(page, 'Synthetic pending private course action before guarded restore');
      const replacement = seedFor();
      replacement.profile.displayName = 'Synthetic guarded replacement record';
      replacement.courseProgress.experiments.procrastination = experiment('Synthetic guarded replacement action');
      await page.evaluate(async ({ replacement, appKey, legacyKey }) => {
        const { writeNotebookDraft } = await import('/src/services/notebookDrafts.ts');
        const draftKey = 'oda-notebook-draft-v1:synthetic-authority';
        writeNotebookDraft(draftKey, 'Synthetic notebook draft before ownership expiry');
        const state = window.__odaAuthorityReview;
        Object.assign(state, { holdCommitNext: true, scopeCurrent: true, guardCalls: [], beforeRaw: { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) }, beforeCaller: JSON.stringify(replacement), replacement, beforeNotifications: state.notifications });
        window.__odaAuthorityGuardedFlight = window.__odaAuthorityRepository.replaceAll(replacement, originalRaw => {
          state.guardCalls.push({ originalMatches: originalRaw === state.beforeRaw.app, provisionalProjection: localStorage.getItem(appKey) !== state.beforeRaw.app, scopeCurrent: state.scopeCurrent });
          return state.scopeCurrent && originalRaw === state.beforeRaw.app;
        }).then(value => ({ value, rejected: false }), error => ({ rejected: true, error: String(error) }));
      }, { replacement, appKey, legacyKey });
      await page.waitForFunction(() => window.__odaAuthorityReview.holding);
      const result = await page.evaluate(async ({ expire, appKey, legacyKey }) => {
        const state = window.__odaAuthorityReview;
        if (expire) state.scopeCurrent = false;
        state.releaseCommit = true;
        const outcome = await window.__odaAuthorityGuardedFlight;
        const afterRaw = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        const loaded = await window.__odaAuthorityRepository.load();
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        const { readNotebookDraft } = await import('/src/services/notebookDrafts.ts');
        const session = getCourseProgressSession();
        return { outcome, beforeRaw: state.beforeRaw, afterRaw, beforeCaller: state.beforeCaller, afterCaller: JSON.stringify(state.replacement),
          savedName: loaded.profile.displayName, notifications: state.notifications - state.beforeNotifications, guardCalls: state.guardCalls,
          draftAction: session.read().experiments?.procrastination?.action, warning: session.saveFailed(), notebookDraft: readNotebookDraft('oda-notebook-draft-v1:synthetic-authority') };
      }, { expire, appKey, legacyKey });
      report.observations.push({ case: expire ? 'restore owner expires during real authority commit' : 'restore owner remains current during real authority commit', ...result });
      assert.equal(result.outcome.rejected, false);
      assert.equal(result.outcome.value, !expire);
      assert.ok(result.guardCalls.length >= 3, 'Restore ownership must be checked before staging and after asynchronous commit');
      assert.ok(result.guardCalls.every(call => call.originalMatches), 'The guard must keep the original raw baseline despite a provisional projection');
      assert.ok(result.guardCalls.some(call => call.provisionalProjection));
      if (expire) {
        assert.deepEqual(result.afterRaw, result.beforeRaw);
        assert.equal(result.savedName, 'Synthetic authority review');
        assert.equal(result.afterCaller, result.beforeCaller);
        assert.equal(result.notifications, 0);
        assert.equal(result.draftAction, 'Synthetic pending private course action before guarded restore');
        assert.equal(result.warning, true);
        assert.deepEqual(result.notebookDraft, { found: true, value: 'Synthetic notebook draft before ownership expiry' });
        pass('Owner expiry during authority commit returns false and preserves canonical records, caller, course and notebook drafts');
      } else {
        assert.equal(result.savedName, replacement.profile.displayName);
        assert.equal(result.notifications, 1);
        assert.equal(result.draftAction, 'Synthetic guarded replacement action');
        assert.equal(result.warning, false);
        assert.deepEqual(result.notebookDraft, { found: false });
        pass('An unchanged restore owner passes the original-record guard while the local projection is provisional');
      }
    } finally { await context.close(); }
  }
  {
    const { context, page } = await fixture();
    try {
      const replacement = seedFor();
      replacement.profile.displayName = 'Synthetic expired prepared replacement';
      await page.evaluate(({ replacement, appKey, legacyKey }) => {
        const state = window.__odaAuthorityReview;
        Object.assign(state, { holdCommitNext: true, scopeCurrent: true, beforeRaw: { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) }, beforeCaller: JSON.stringify(replacement), replacement, beforeNotifications: state.notifications });
        window.__odaAuthorityGuardedFlight = window.__odaAuthorityRepository.replaceAll(replacement, originalRaw => state.scopeCurrent && originalRaw === state.beforeRaw.app)
          .then(value => ({ value, rejected: false }), error => ({ rejected: true, error: String(error) }));
      }, { replacement, appKey, legacyKey });
      await page.waitForFunction(() => window.__odaAuthorityReview.holding);
      const result = await page.evaluate(async ({ appKey, legacyKey }) => {
        const state = window.__odaAuthorityReview;
        Object.assign(state, { scopeCurrent: false, abortNext: true, releaseCommit: true });
        const outcome = await window.__odaAuthorityGuardedFlight;
        const afterRaw = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        const loaded = await window.__odaAuthorityRepository.load();
        return { outcome, beforeRaw: state.beforeRaw, afterRaw,
          afterLoadRaw: { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) },
          loadedName: loaded.profile.displayName, aborts: state.aborts.length, notifications: state.notifications - state.beforeNotifications,
          beforeCaller: state.beforeCaller, afterCaller: JSON.stringify(state.replacement) };
      }, { appKey, legacyKey });
      const second = await newPage(context);
      const otherTab = await second.evaluate(async ({ appKey, legacyKey }) => {
        const loaded = await window.__odaAuthorityRepository.load();
        return { loadedName: loaded.profile.displayName, raw: { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) } };
      }, { appKey, legacyKey });
      await page.reload();
      const afterReload = await page.evaluate(async ({ appKey, legacyKey }) => {
        const { LocalDemoRepository } = await import('/src/services/repository.ts');
        const loaded = await new LocalDemoRepository().load();
        return { loadedName: loaded.profile.displayName, raw: { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) } };
      }, { appKey, legacyKey });
      report.observations.push({ case: 'expired prepared restore needs no compensating transaction', ...result, otherTab, afterReload });
      assert.equal(result.outcome.rejected, false);
      assert.equal(result.outcome.value, false, 'An expired prepared restore must never be acknowledged as saved');
      assert.equal(result.aborts, 0, 'Expiry must preserve prior data without relying on a second compensating transaction');
      assert.equal(result.notifications, 0);
      assert.equal(result.afterCaller, result.beforeCaller);
      assert.deepEqual(result.afterRaw, result.beforeRaw);
      assert.equal(result.loadedName, 'Synthetic authority review', 'An expired replacement must not become readable when its compensating authority transaction fails');
      assert.deepEqual(result.afterLoadRaw, result.beforeRaw);
      assert.equal(otherTab.loadedName, 'Synthetic authority review');
      assert.deepEqual(otherTab.raw, result.beforeRaw);
      assert.equal(afterReload.loadedName, 'Synthetic authority review');
      assert.deepEqual(afterReload.raw, result.beforeRaw);
      pass('Expired prepared data needs no compensating transaction and stays hidden from all tabs and reloads');
    } finally { await context.close(); }
  }
  {
    const { context, page } = await fixture();
    try {
      await failedDraft(page, 'Synthetic pending private action before failed finalization');
      const replacement = seedFor();
      replacement.profile.displayName = 'Synthetic aborted finalization record';
      const result = await page.evaluate(async ({ replacement, appKey, legacyKey }) => {
        const { writeNotebookDraft, readNotebookDraft } = await import('/src/services/notebookDrafts.ts');
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        const session = getCourseProgressSession();
        const draftKey = 'oda-notebook-draft-v1:synthetic-authority';
        writeNotebookDraft(draftKey, 'Synthetic notebook draft before failed finalization');
        const state = window.__odaAuthorityReview;
        const beforeRaw = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        const beforeCaller = JSON.stringify(replacement);
        const beforeNotifications = state.notifications;
        const beforeAborts = state.aborts.length;
        Object.assign(state, { abortNext: true, skipAbortPuts: 1 });
        let error = null;
        try { await window.__odaAuthorityRepository.replaceAll(replacement, originalRaw => originalRaw === beforeRaw.app); }
        catch (failure) { error = String(failure); }
        const afterRaw = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        const loaded = await window.__odaAuthorityRepository.load();
        return { rejected: error !== null, error, beforeRaw, afterRaw, loadedName: loaded.profile.displayName,
          canonicalRaw: { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) }, beforeCaller, afterCaller: JSON.stringify(replacement),
          aborts: state.aborts.length - beforeAborts, notifications: state.notifications - beforeNotifications,
          draftAction: session.read().experiments?.procrastination?.action, warning: session.saveFailed(), notebookDraft: readNotebookDraft(draftKey) };
      }, { replacement, appKey, legacyKey });
      report.observations.push({ case: 'prepared authority finalization transaction aborts', ...result });
      assert.equal(result.rejected, true);
      assert.equal(result.aborts, 1, 'The second authority transaction must actually abort');
      assert.deepEqual(result.afterRaw, result.beforeRaw);
      assert.deepEqual(result.canonicalRaw, result.beforeRaw);
      assert.equal(result.loadedName, 'Synthetic authority review');
      assert.equal(result.afterCaller, result.beforeCaller);
      assert.equal(result.notifications, 0);
      assert.equal(result.draftAction, 'Synthetic pending private action before failed finalization');
      assert.equal(result.warning, true);
      assert.deepEqual(result.notebookDraft, { found: true, value: 'Synthetic notebook draft before failed finalization' });
      pass('Aborted finalization keeps prepared data hidden and preserves caller, course draft and notebook draft');
    } finally { await context.close(); }
  }
  {
    const { context, page } = await fixture();
    try {
      await failedDraft(page, 'Synthetic pending private action before authorized finalization');
      const replacement = seedFor();
      replacement.profile.displayName = 'Synthetic authorized account A replacement';
      replacement.courseProgress.experiments.procrastination = experiment('Synthetic accepted account A course action');
      await page.evaluate(async ({ replacement, appKey }) => {
        const { cloudSync } = await import('/src/services/cloudSync.ts');
        const { writeNotebookDraft } = await import('/src/services/notebookDrafts.ts');
        cloudSync.config = { url: 'https://synthetic-authority.example', anonKey: 'synthetic-public-key' };
        cloudSync.setSession({ user: { id: 'synthetic-account-a' } });
        const owner = cloudSync.currentAccountGuard();
        const state = window.__odaAuthorityReview;
        const beforeRaw = localStorage.getItem(appKey);
        writeNotebookDraft('oda-notebook-draft-v1:synthetic-authority', 'Synthetic notebook draft before authorized finalization');
        Object.assign(state, { holdCommitNext: true, skipHoldPuts: 1, beforeNotifications: state.notifications, beforeCloudSchedules: state.cloudSchedules, owner, guardCalls: [] });
        window.__odaAuthorityGuardedFlight = window.__odaAuthorityRepository.replaceAll(replacement, originalRaw => {
          state.guardCalls.push({ ownerCurrent: owner(), originalMatches: originalRaw === beforeRaw });
          return owner() && originalRaw === beforeRaw;
        }).then(value => ({ value, rejected: false }), error => ({ rejected: true, error: String(error) }));
      }, { replacement, appKey });
      await page.waitForFunction(() => window.__odaAuthorityReview.holding);
      const beforeFinalization = await page.evaluate(async () => {
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        const { readNotebookDraft } = await import('/src/services/notebookDrafts.ts');
        const session = getCourseProgressSession();
        return { action: session.read().experiments?.procrastination?.action, warning: session.saveFailed(), notebookDraft: readNotebookDraft('oda-notebook-draft-v1:synthetic-authority'), notifications: window.__odaAuthorityReview.notifications - window.__odaAuthorityReview.beforeNotifications };
      });
      const result = await page.evaluate(async appKey => {
        const { cloudSync } = await import('/src/services/cloudSync.ts');
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        const { readNotebookDraft } = await import('/src/services/notebookDrafts.ts');
        const state = window.__odaAuthorityReview;
        cloudSync.setSession({ user: { id: 'synthetic-account-b' } });
        state.releaseCommit = true;
        const outcome = await window.__odaAuthorityGuardedFlight;
        const session = getCourseProgressSession();
        return { outcome, ownerStillCurrent: state.owner(), currentAccount: cloudSync.getState().session?.user.id,
          savedName: JSON.parse(localStorage.getItem(appKey)).profile.displayName, draftAction: session.read().experiments?.procrastination?.action,
          warning: session.saveFailed(), notebookDraft: readNotebookDraft('oda-notebook-draft-v1:synthetic-authority'),
          notifications: state.notifications - state.beforeNotifications, cloudSchedules: state.cloudSchedules - state.beforeCloudSchedules, guardCalls: state.guardCalls };
      }, appKey);
      report.observations.push({ case: 'account changes after restore authorization while finalization remains pending', beforeFinalization, ...result });
      assert.equal(beforeFinalization.action, 'Synthetic pending private action before authorized finalization');
      assert.equal(beforeFinalization.warning, true);
      assert.deepEqual(beforeFinalization.notebookDraft, { found: true, value: 'Synthetic notebook draft before authorized finalization' });
      assert.equal(beforeFinalization.notifications, 0);
      assert.deepEqual(result.outcome, { value: true, rejected: false });
      assert.equal(result.ownerStillCurrent, false);
      assert.equal(result.currentAccount, 'synthetic-account-b');
      assert.ok(result.guardCalls.every(call => call.ownerCurrent && call.originalMatches), 'All authorization checks must precede the irrevocable finalization decision');
      assert.equal(result.savedName, replacement.profile.displayName);
      assert.equal(result.draftAction, 'Synthetic accepted account A course action');
      assert.equal(result.warning, false);
      assert.deepEqual(result.notebookDraft, { found: false });
      assert.equal(result.notifications, 1);
      assert.equal(result.cloudSchedules, 0, 'Applying account A restore must never auto-schedule an upload into account B');
      pass('Account change after restore authorization keeps the accepted local restore, clears drafts after finalization and schedules no upload');
    } finally { await context.close(); }
  }
  {
    const { context, page: first } = await fixture();
    try {
      const second = await newPage(context);
      const replacement = seedFor();
      replacement.profile.displayName = 'Synthetic held provisional replacement';
      replacement.courseProgress.experiments.procrastination = experiment('Synthetic held provisional course action');
      await second.evaluate(replacement => {
        window.__odaAuthorityReview.holdAbortNext = true;
        window.__odaAuthorityReplacementFlight = window.__odaAuthorityRepository.replaceAll(replacement)
          .then(() => ({ rejected: false }), error => ({ rejected: true, error: String(error) }));
      }, replacement);
      await second.waitForFunction(() => window.__odaAuthorityReview.holding);
      await first.waitForFunction(appKey => JSON.parse(localStorage.getItem(appKey)).profile.displayName === 'Synthetic held provisional replacement', appKey);
      const initial = await first.evaluate(async () => {
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        const { updateCourseExperiment } = await import('/src/services/courseLearning.ts');
        const session = getCourseProgressSession();
        const initialAction = session.read().experiments?.procrastination?.action;
        window.__odaAuthorityFirstSessionFlight = session.update(current => ({ ...current, experiments: updateCourseExperiment(current.experiments, 'procrastination', { action: 'Synthetic input typed during failed restore' }) }));
        return { initialAction, typedAction: session.read().experiments?.procrastination?.action };
      });
      const replaceResult = await second.evaluate(async () => {
        window.__odaAuthorityReview.releaseAbort = true;
        return window.__odaAuthorityReplacementFlight;
      });
      assert.equal(replaceResult.rejected, true);
      const retained = await first.evaluate(async appKey => {
        const saved = await window.__odaAuthorityFirstSessionFlight;
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        const session = getCourseProgressSession();
        return { saved, action: session.read().experiments?.procrastination?.action, warning: session.saveFailed(), savedAction: JSON.parse(localStorage.getItem(appKey)).courseProgress?.experiments?.procrastination?.action };
      }, appKey);
      await drain(first);
      report.observations.push({ case: 'first course session created during aborted provisional replacement', initial, replaceResult, retained });
      assert.equal(initial.typedAction, 'Synthetic input typed during failed restore');
      assert.equal(retained.action, initial.typedAction, 'A newly created session must preserve input typed while another tab exposes an uncommitted replacement');
      assert.equal(retained.savedAction, initial.typedAction);
      assert.equal(retained.warning, false);
      pass('A course session first opened during an aborted replacement preserves and saves newly typed private work');
    } finally { await context.close(); }
  }
  {
    const { context, page } = await fixture();
    try {
      const result = await page.evaluate(async ({ appKey, legacyKey }) => {
        const repository = window.__odaAuthorityRepository;
        const caller = await repository.load();
        const { mutateCourseProgress } = await import('/src/services/courseProgress.ts');
        const { updateCourseExperiment } = await import('/src/services/courseLearning.ts');
        await mutateCourseProgress(current => ({ ...current, experiments: updateCourseExperiment(current.experiments, 'procrastination', { cue: 'Newer synthetic saved cue' }) }));
        caller.profile = { ...caller.profile, soundMuted: true };
        const beforeCaller = JSON.stringify(caller);
        const beforeRaw = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        const beforeCloud = window.__odaAuthorityReview.cloudSchedules;
        window.__odaAuthorityReview.abortNext = true;
        let error = null;
        try { await repository.save(caller); } catch (failure) { error = String(failure); }
        return {
          rejected: error !== null, error, beforeCaller, afterCaller: JSON.stringify(caller), beforeRaw,
          afterRaw: { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) },
          cloudSchedules: window.__odaAuthorityReview.cloudSchedules - beforeCloud,
          staged: window.__odaAuthorityReview.aborts.at(-1),
        };
      }, { appKey, legacyKey });
      assert.equal(result.rejected, true, 'An aborted authority transaction must reject repository.save');
      assert.equal(result.afterCaller, result.beforeCaller, 'A failed commit must not publish newer course fields into its caller');
      assert.deepEqual(result.afterRaw, result.beforeRaw, 'Both previous storage values must survive authority commit failure');
      assert.equal(result.cloudSchedules, 0, 'Failed authority commits must never schedule an upload');
      assert.equal(JSON.parse(result.staged.appRaw).profile.soundMuted, true, 'Abort injection must occur after the staged personal-record write');
      report.observations.push({ case: 'save authority abort after local write', ...result });
      pass('Authority abort rejects save, restores both storage values, and prevents caller publication and cloud scheduling');
    } finally { await context.close(); }
  }
  {
    const { context, page } = await fixture();
    try {
      const result = await page.evaluate(async ({ appKey, legacyKey }) => {
        const repository = window.__odaAuthorityRepository;
        const caller = await repository.load();
        caller.profile = { ...caller.profile, displayName: 'Synthetic uncommitted projection' };
        const beforeCaller = JSON.stringify(caller);
        const previousRaw = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        const beforeCloud = window.__odaAuthorityReview.cloudSchedules;
        Object.assign(window.__odaAuthorityReview, { abortNext: true, blockRollback: true, rollbackRaw: previousRaw.app });
        let error = null;
        try { await repository.save(caller); } catch (failure) { error = String(failure); }
        const failed = { rejected: error !== null, error, beforeCaller, afterCaller: JSON.stringify(caller),
          projectionName: JSON.parse(localStorage.getItem(appKey)).profile.displayName,
          cloudSchedules: window.__odaAuthorityReview.cloudSchedules - beforeCloud,
          rollbackFailures: window.__odaAuthorityReview.rollbackFailures };
        const recovered = await repository.load();
        const recoveredRaw = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        const next = { ...recovered, profile: { ...recovered.profile, soundMuted: true } };
        await repository.save(next);
        const saved = await repository.load();
        return { failed, previousRaw, recoveredRaw, recoveredName: recovered.profile.displayName, nextSaved: saved.profile.soundMuted };
      }, { appKey, legacyKey });
      assert.equal(result.failed.rejected, true);
      assert.equal(result.failed.rollbackFailures, 1, 'The test must actually block the first rollback projection write');
      assert.equal(result.failed.projectionName, 'Synthetic uncommitted projection', 'The aborted provisional projection must remain until permissions recover');
      assert.equal(result.failed.afterCaller, result.failed.beforeCaller);
      assert.equal(result.failed.cloudSchedules, 0);
      assert.deepEqual(result.recoveredRaw, result.previousRaw, 'A queued read must recover the prior authoritative record after projection rollback fails');
      assert.equal(result.recoveredName, 'Synthetic authority review');
      assert.equal(result.nextSaved, true);
      report.observations.push({ case: 'authority abort with blocked projection rollback and later recovery', ...result });
      pass('Blocked projection rollback rejects without cloud publication; the next permitted read recovers authority and later edits save');
    } finally { await context.close(); }
  }
  {
    const { context, page } = await fixture();
    try {
      await failedDraft(page, 'Synthetic unsaved authority draft');
      const result = await page.evaluate(async ({ appKey, legacyKey }) => {
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        const session = getCourseProgressSession();
        const retrySaved = await session.retry();
        return { retrySaved, failed: session.saveFailed(), draftAction: session.read().experiments?.procrastination?.action,
          savedAction: JSON.parse(localStorage.getItem(appKey)).courseProgress?.experiments?.procrastination?.action,
          legacyRaw: localStorage.getItem(legacyKey), aborts: window.__odaAuthorityReview.aborts.length };
      }, { appKey, legacyKey });
      assert.equal(result.retrySaved, true);
      assert.equal(result.failed, false);
      assert.equal(result.draftAction, 'Synthetic unsaved authority draft');
      assert.equal(result.savedAction, result.draftAction);
      assert.equal(result.aborts, 1);
      report.observations.push({ case: 'course authority abort and retry', ...result });
      pass('An aborted course write retains the private draft and warning; retry saves it and clears the warning');
    } finally { await context.close(); }
  }
  {
    const { context, page } = await fixture();
    try {
      await failedDraft(page, 'Synthetic pending draft before replacement');
      const replacement = seedFor();
      replacement.profile.displayName = 'Synthetic replacement record';
      replacement.courseProgress.experiments.procrastination = experiment('Synthetic restored course action');
      const result = await page.evaluate(async ({ replacement, appKey, legacyKey }) => {
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        const { writeNotebookDraft, readNotebookDraft, getNotebookDraftResetVersion } = await import('/src/services/notebookDrafts.ts');
        const session = getCourseProgressSession();
        const draftKey = 'oda-notebook-draft-v1:synthetic-authority';
        writeNotebookDraft(draftKey, 'Synthetic unsubmitted notebook text before replacement');
        const notebookResetVersion = getNotebookDraftResetVersion();
        const beforeCaller = JSON.stringify(replacement);
        const beforeRaw = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        const beforeNotify = window.__odaAuthorityReview.notifications;
        window.__odaAuthorityReview.abortNext = true;
        let error = null;
        try { await window.__odaAuthorityRepository.replaceAll(replacement); } catch (failure) { error = String(failure); }
        const failed = { rejected: error !== null, beforeCaller, afterCaller: JSON.stringify(replacement), beforeRaw,
          afterRaw: { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) },
          notifications: window.__odaAuthorityReview.notifications - beforeNotify,
          draftAction: session.read().experiments?.procrastination?.action, warning: session.saveFailed(),
          notebookDraft: readNotebookDraft(draftKey), notebookResetDelta: getNotebookDraftResetVersion() - notebookResetVersion };
        const replaced = await window.__odaAuthorityRepository.replaceAll(replacement);
        return { failed, replaced, successAction: session.read().experiments?.procrastination?.action,
          successWarning: session.saveFailed(), savedName: JSON.parse(localStorage.getItem(appKey)).profile.displayName,
          notebookDraftAfterSuccess: readNotebookDraft(draftKey), notebookResetDeltaAfterSuccess: getNotebookDraftResetVersion() - notebookResetVersion };
      }, { replacement, appKey, legacyKey });
      assert.equal(result.failed.rejected, true);
      assert.equal(result.failed.afterCaller, result.failed.beforeCaller, 'A failed replacement must not publish a new record epoch');
      assert.deepEqual(result.failed.afterRaw, result.failed.beforeRaw);
      assert.equal(result.failed.notifications, 0, 'A failed replacement must not broadcast success');
      assert.equal(result.failed.draftAction, 'Synthetic pending draft before replacement');
      assert.equal(result.failed.warning, true, 'An unsuccessful replacement must retain the previous draft warning');
      assert.deepEqual(result.failed.notebookDraft, { found: true, value: 'Synthetic unsubmitted notebook text before replacement' });
      assert.equal(result.failed.notebookResetDelta, 0, 'A failed replacement must not reset the notebook draft session');
      assert.equal(result.replaced, true);
      assert.equal(result.successAction, 'Synthetic restored course action');
      assert.equal(result.successWarning, false);
      assert.equal(result.savedName, replacement.profile.displayName);
      assert.deepEqual(result.notebookDraftAfterSuccess, { found: false });
      assert.equal(result.notebookResetDeltaAfterSuccess, 1);
      report.observations.push({ case: 'same-tab replacement authority abort and success', ...result });
      pass('Failed replacement preserves caller, course and notebook drafts; successful replacement publishes and resets drafts');
    } finally { await context.close(); }
  }
  {
    const { context, page: first } = await fixture();
    try {
      await failedDraft(first, 'Synthetic other-tab private pending draft');
      const second = await newPage(context);
      const replacement = seedFor();
      replacement.profile.displayName = 'Synthetic aborted other-tab replacement';
      replacement.courseProgress.experiments.procrastination = experiment('Synthetic provisional replacement action');
      const replaceResult = await second.evaluate(async replacement => {
        window.__odaAuthorityReview.abortNext = true;
        let error = null;
        try { await window.__odaAuthorityRepository.replaceAll(replacement); } catch (failure) { error = String(failure); }
        return { rejected: error !== null, aborts: window.__odaAuthorityReview.aborts.length };
      }, replacement);
      assert.equal(replaceResult.rejected, true);
      assert.equal(replaceResult.aborts, 1);
      await first.waitForFunction(() => {
        const names = window.__odaAuthorityReview.storageEvents.map(raw => raw && JSON.parse(raw).profile.displayName);
        const provisional = names.indexOf('Synthetic aborted other-tab replacement');
        return provisional !== -1 && names.slice(provisional + 1).includes('Synthetic authority review');
      });
      await drain(first);
      const retained = await first.evaluate(async () => {
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        const session = getCourseProgressSession();
        return { action: session.read().experiments?.procrastination?.action, warning: session.saveFailed(), storageEvents: window.__odaAuthorityReview.storageEvents.length };
      });
      assert.equal(retained.action, 'Synthetic other-tab private pending draft', 'Provisional storage events from an aborted other-tab replacement must not discard private work');
      assert.equal(retained.warning, true);
      const retry = await first.evaluate(async () => {
        const { getCourseProgressSession } = await import('/src/services/courseProgressDraft.ts');
        return getCourseProgressSession().retry();
      });
      assert.equal(retry, true);
      report.observations.push({ case: 'other-tab failed replacement retains private draft', replaceResult, retained, retry });
      pass('An aborted other-tab replacement cannot discard a pending private course draft through provisional storage events');
    } finally { await context.close(); }
  }
  {
    const { context, page } = await fixture();
    try {
      const result = await page.evaluate(async ({ appKey, legacyKey }) => {
        const { writeNotebookDraft, readNotebookDraft, getNotebookDraftResetVersion } = await import('/src/services/notebookDrafts.ts');
        const draftKey = 'oda-notebook-draft-v1:synthetic-authority';
        writeNotebookDraft(draftKey, 'Synthetic unsubmitted notebook text before clear');
        const notebookResetVersion = getNotebookDraftResetVersion();
        const beforeRaw = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        window.__odaAuthorityReview.abortNext = true;
        let error = null;
        try { await window.__odaAuthorityRepository.clear(); } catch (failure) { error = String(failure); }
        const failed = { rejected: error !== null, beforeRaw, afterRaw: { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) },
          notebookDraft: readNotebookDraft(draftKey), notebookResetDelta: getNotebookDraftResetVersion() - notebookResetVersion };
        await window.__odaAuthorityRepository.clear();
        const cleared = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        const loaded = await window.__odaAuthorityRepository.load();
        const { queueDataWrite } = await import('/src/services/dataWrites.ts');
        await queueDataWrite(() => undefined);
        const restoredCourseText = Object.values(loaded.courseProgress?.experiments ?? {}).map(item => item.action);
        return { failed, cleared, legacyAfterLoad: localStorage.getItem(legacyKey), restoredCourseText,
          notebookDraftAfterSuccess: readNotebookDraft(draftKey), notebookResetDeltaAfterSuccess: getNotebookDraftResetVersion() - notebookResetVersion };
      }, { appKey, legacyKey });
      assert.equal(result.failed.rejected, true);
      assert.deepEqual(result.failed.afterRaw, result.failed.beforeRaw);
      assert.deepEqual(result.failed.notebookDraft, { found: true, value: 'Synthetic unsubmitted notebook text before clear' });
      assert.equal(result.failed.notebookResetDelta, 0);
      assert.deepEqual(result.cleared, { app: null, legacy: null }, 'Successful clear must erase both personal data stores');
      assert.equal(result.legacyAfterLoad, null, 'Authority hydration must never resurrect erased legacy private course work');
      assert.deepEqual(result.restoredCourseText, []);
      assert.deepEqual(result.notebookDraftAfterSuccess, { found: false });
      assert.equal(result.notebookResetDeltaAfterSuccess, 1);
      report.observations.push({ case: 'clear authority abort and privacy-safe success', ...result });
      pass('Failed clear preserves records and notebook drafts; successful clear resets drafts and prevents private course resurrection');
    } finally { await context.close(); }
  }
  for (const apiMissing of ['indexedDB', 'locks']) {
    const { context, page } = await fixture(apiMissing);
    try {
      const result = await page.evaluate(async ({ appKey, legacyKey }) => {
        const beforeRaw = { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) };
        const current = JSON.parse(beforeRaw.app);
        current.profile.displayName = 'Synthetic unsupported-browser mutation';
        let saveError = null;
        let loadError = null;
        try { await window.__odaAuthorityRepository.load(); } catch (failure) { loadError = String(failure); }
        try { await window.__odaAuthorityRepository.save(current); } catch (failure) { saveError = String(failure); }
        const { saveCourseProgress } = await import('/src/services/courseProgress.ts');
        const courseSaved = await saveCourseProgress({ version: 1, lessons: {} });
        return { loadError, saveError, courseSaved, beforeRaw, afterRaw: { app: localStorage.getItem(appKey), legacy: localStorage.getItem(legacyKey) }, cloudSchedules: window.__odaAuthorityReview.cloudSchedules };
      }, { appKey, legacyKey });
      assert.ok(result.loadError, `Browser without ${apiMissing} must reject a read without shared authority`);
      assert.ok(result.saveError, `Browser without ${apiMissing} must reject unsafe saves`);
      assert.equal(result.courseSaved, false);
      assert.deepEqual(result.afterRaw, result.beforeRaw);
      assert.equal(result.cloudSchedules, 0);
      report.observations.push({ case: `unsupported browser: ${apiMissing}`, ...result });
      pass(`Missing browser ${apiMissing} rejects writes and preserves existing private records`);
    } finally { await context.close(); }
  }
  assert.deepEqual(report.errors, [], 'The regression suite must leave no uncaught browser errors');
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.failure = String(error.stack || error);
  throw error;
} finally {
  writeFileSync(output, JSON.stringify(report, null, 2), { flag: 'wx' });
  await browser.close();
}
