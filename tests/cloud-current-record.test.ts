import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { afterEach, beforeEach, test } from 'node:test';
import type { UserData } from '../src/types/models';
import { APP_DATA_STORAGE_KEY } from '../src/services/storageKeys';
import { cloudCrudFixture } from './helpers/cloudCrudFixture';

class MemoryStorage {
  values = new Map<string, string>();
  failKey: string | null = null;
  failGetKey: string | null = null;
  getItem(key: string) {
    if (key === this.failGetKey) throw new Error('Synthetic storage read failure');
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (key === this.failKey) throw new Error('Synthetic durable write failure');
    this.values.set(key, value);
  }
  removeItem(key: string) { this.values.delete(key); }
}
const storage = new MemoryStorage();
const events = new EventTarget();
const timers = new Map<number, () => void>();
let timerId = 0;
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto });
Object.defineProperty(globalThis, 'window', { configurable: true, value: {
  // No document: the service/repository use the actual non-browser durable queue
  // without pretending that this is IndexedDB, a simulator or native hardware.
  setTimeout: (callback: () => void) => { const id = ++timerId; timers.set(id, callback); return id; },
  clearTimeout: (id: number) => { timers.delete(id); },
  addEventListener: events.addEventListener.bind(events),
  removeEventListener: events.removeEventListener.bind(events),
  dispatchEvent: events.dispatchEvent.bind(events),
} });
let fetchCalls = 0;
Object.defineProperty(globalThis, 'fetch', { configurable: true, value: async () => {
  fetchCalls++; throw new Error('No network is permitted in current-record tests');
} });
const { cloudSync } = await import('../src/services/cloudSync');
const { getInitialDemoState, LocalDemoRepository } = await import('../src/services/repository');
const { saveCourseProgress } = await import('../src/services/courseProgress');
const { courseCatalogFor } = await import('../src/data/courseCatalog');
const { queueDataWrite } = await import('../src/services/dataWrites');
const courseLesson = courseCatalogFor('en')[0].lessons[0];
const internal = cloudSync as unknown as Record<string, any>;
type CurrentState = ReturnType<typeof cloudSync.getState> & {
  currentDocumentConfirmed: boolean; lastSuccessfulSyncAt: string | null;
};
const state = () => cloudSync.getState() as CurrentState;
const project = 'https://current-record.example';
const session = (id = 'A') => ({ user: { id }, access_token: `synthetic-${id}` });
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const raw = () => storage.getItem(APP_DATA_STORAGE_KEY)!;
const saved = () => JSON.parse(raw()) as UserData;
const store = (data: UserData) => storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
const owner = () => JSON.parse(storage.getItem('oda_cloud_last_sync:local_scope') || 'null');
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
};
function fixture() {
  const reads: string[] = [];
  const writes: UserData[] = [];
  const hooks: { read?: () => Promise<void>; write?: () => Promise<void> } = {};
  const f = cloudCrudFixture({
    read: async id => { reads.push(id); if (hooks.read) await hooks.read(); return { data: clone(f.rows.get(id) ?? null), error: null }; },
    write: async incoming => { writes.push(clone(incoming.data)); if (hooks.write) await hooks.write(); return { error: null }; },
  });
  const client = { ...f.client, auth: {
    getSession: async () => ({ data: { session: internal.session }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }),
  } };
  internal.client = client;
  return { ...f, client, reads, writes, hooks };
}
async function setupConfirmed() {
  const f = fixture(); const repository = new LocalDemoRepository();
  await cloudSync.init(); await repository.load();
  assert.equal(await cloudSync.push(saved()), true);
  f.reads.length = 0; f.writes.length = 0;
  return { f, repository, history: owner().remoteVersion as string };
}
function assertDirty(history: string) {
  assert.equal(state().currentDocumentConfirmed, false, 'current durable record must be shown as unconfirmed');
  assert.equal(state().lastSyncAt, null, 'historical cloud time cannot label a changed device document as backed up');
  assert.equal(state().lastSuccessfulSyncAt, history, 'last successful sync remains available as historical evidence');
}
async function waitForCurrentConfirmation(service: typeof cloudSync) {
  if ((service.getState() as CurrentState).currentDocumentConfirmed) return;
  await new Promise<void>((resolve, reject) => {
    const deadline = setTimeout(() => { unsubscribe(); reject(new Error('Current document confirmation was not published after hydration')); }, 2000);
    const unsubscribe = service.subscribe(value => {
      if (!(value as CurrentState).currentDocumentConfirmed) return;
      clearTimeout(deadline); unsubscribe(); resolve();
    });
  });
}
function holdDigest() {
  const started = deferred<void>(); const release = deferred<'resolve' | 'reject'>();
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {
    randomUUID: webcrypto.randomUUID.bind(webcrypto),
    subtle: { digest: async (algorithm: AlgorithmIdentifier, bytes: BufferSource) => {
      started.resolve();
      if (await release.promise === 'reject') throw new Error('Synthetic delayed fingerprint failure');
      return webcrypto.subtle.digest(algorithm, bytes as NodeJS.ArrayBufferView);
    } },
  } });
  return { started, release };
}
async function setupPendingCloudRestore() {
  const setup = await setupConfirmed(); const remote = clone(saved());
  remote.profile.displayName = 'Newer reviewed cloud writing';
  setup.f.rows.set('A', { user_id: 'A', data: remote, updated_at: '2045-01-01T00:00:00.000Z' });
  const reviewed = await cloudSync.pullIfNewer(saved(), { forReview: true });
  assert.ok(reviewed);
  assert.equal(await setup.repository.replaceAll(reviewed, original => cloudSync.canApplyRemote(reviewed, original)), true);
  return { ...setup, reviewed };
}

beforeEach(() => {
  storage.values.clear(); storage.failKey = null; storage.failGetKey = null; timers.clear(); fetchCalls = 0;
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto });
  Object.assign(internal, {
    session: session(), config: { url: project, anonKey: 'public-synthetic-fixture' }, client: null,
    scopeRevision: 0, syncing: false, error: null, pushTimer: null,
    initialized: false, initializing: null, sessionHydrated: false,
    pushQueue: Promise.resolve(false), pendingPulls: new WeakMap(), authSubscription: null,
    // These reset fields are optional implementation caches; bootstrap must
    // establish confirmation from actual persisted metadata, never the test.
    confirmedLocalRecord: undefined, confirmedLocalFingerprint: undefined, confirmationProbe: null, confirmationBootstrap: null,
  });
  const data = clone(getInitialDemoState()); data.profile.displayName = 'Current durable writing'; store(data);
});
afterEach(() => assert.equal(fetchCalls, 0, 'all tests stay local'));

test('a matching current durable document uploads and records current plus historical confirmation', async () => {
  const { f, history } = await setupConfirmed();
  assert.equal(state().currentDocumentConfirmed, true);
  assert.equal(state().lastSyncAt, history); assert.equal(state().lastSuccessfulSyncAt, history);
  assert.equal(await cloudSync.push(saved()), true);
  assert.equal(f.reads.length, 1); assert.equal(f.writes.length, 1);
  assert.equal(state().currentDocumentConfirmed, true);
});

for (const field of ['profile', 'notebook', 'futureSelf'] as const) test(`a stale rendered ${field} payload cannot roll acknowledged cloud work backward`, async () => {
  const { f } = await setupConfirmed(); const current = raw(); const remote = clone(f.rows.get('A'));
  const stale = saved();
  if (field === 'profile') stale.profile.displayName = 'An earlier screen value';
  if (field === 'notebook') stale.notebook.affirmations.push({ id: 'stale-affirmation', text: 'Earlier draft', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' });
  if (field === 'futureSelf') stale.futureSelf.identityStatement = 'An earlier statement';
  assert.equal(await cloudSync.push(stale), false);
  assert.deepEqual(f.reads, [], 'mismatched payload is rejected before SELECT');
  assert.deepEqual(f.writes, []); assert.deepEqual(f.rows.get('A'), remote); assert.equal(raw(), current);
});

for (const authority of ['missing', 'invalid-json', 'invalid-document'] as const) test(`${authority} authoritative local record rejects a push before any cloud query`, async () => {
  const { f } = await setupConfirmed(); const caller = saved(); const remote = clone(f.rows.get('A'));
  if (authority === 'missing') storage.removeItem(APP_DATA_STORAGE_KEY);
  if (authority === 'invalid-json') storage.setItem(APP_DATA_STORAGE_KEY, '{broken');
  if (authority === 'invalid-document') storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify({ profile: { displayName: 'Not a complete record' } }));
  const authoritative = storage.getItem(APP_DATA_STORAGE_KEY);
  assert.equal(await cloudSync.push(caller), false);
  assert.deepEqual(f.reads, []); assert.deepEqual(f.writes, []); assert.deepEqual(f.rows.get('A'), remote);
  assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), authoritative);
});

test('a course-only stale caller uses the existing latest-course normalization and can upload', async () => {
  const { f } = await setupConfirmed(); const stale = saved();
  const course = clone(stale.courseProgress); course.lessons[courseLesson.id] = { checked: Array(courseLesson.practiceCount).fill(true), answer: courseLesson.correct, reflection: 'A saved course note', completed: false };
  assert.equal(await saveCourseProgress(course), true);
  const currentCourses = saved().courseProgress;
  assert.notDeepEqual(stale.courseProgress, currentCourses);
  assert.equal(await cloudSync.push(stale), true);
  assert.deepEqual(f.rows.get('A')!.data.courseProgress, currentCourses);
  assert.equal(state().currentDocumentConfirmed, true);
});

test('an ordinary repository save invalidates current confirmation immediately and retains history', async () => {
  const { repository, history, f } = await setupConfirmed(); const data = await repository.load();
  data.profile.displayName = 'A new durable profile value'; await repository.save(data);
  assertDirty(history); assert.deepEqual(f.reads, []); assert.deepEqual(f.writes, []);
  assert.equal(saved().profile.displayName, data.profile.displayName);
});

test('a durable Notebook action invalidates confirmation without waiting for its debounce', async () => {
  const { repository, history, f } = await setupConfirmed();
  await repository.mutateNotebook({ type: 'save_affirmation', input: { text: 'A new durable Notebook thought' } });
  assert.ok(saved().notebook.affirmations.some(item => item.text === 'A new durable Notebook thought'));
  assertDirty(history); assert.deepEqual(f.reads, []); assert.deepEqual(f.writes, []);
});

test('a durable course save invalidates confirmation without requiring the AppProvider event listener', async () => {
  const { history, f } = await setupConfirmed(); const course = clone(saved().courseProgress);
  course.lessons[courseLesson.id] = { checked: Array(courseLesson.practiceCount).fill(true), answer: null, reflection: 'Saved lesson work', completed: false };
  assert.equal(await saveCourseProgress(course), true);
  assertDirty(history); assert.deepEqual(f.reads, []); assert.deepEqual(f.writes, []);
});

test('a save suppressed by its account guard still makes the current durable document dirty', async () => {
  const { repository, history, f } = await setupConfirmed(); const data = await repository.load();
  const held = deferred<void>(); const release = deferred<void>();
  const lock = queueDataWrite(async () => { held.resolve(); await release.promise; }); await held.promise;
  data.profile.displayName = 'Saved while the captured account guard expired';
  const pending = repository.save(data);
  internal.setSession(null); internal.setSession(session());
  release.resolve(); await lock; await pending;
  assertDirty(history); assert.equal(saved().profile.displayName, data.profile.displayName);
  assert.deepEqual(f.reads, []); assert.deepEqual(f.writes, []); assert.equal(timers.size, 0);
});

for (const kind of ['repository', 'notebook', 'course'] as const) test(`a failed durable ${kind} write preserves previous current confirmation`, async () => {
  const { repository, history } = await setupConfirmed(); const original = raw(); storage.failKey = APP_DATA_STORAGE_KEY;
  if (kind === 'repository') { const data = await repository.load(); data.profile.displayName = 'Unsaved value'; await assert.rejects(repository.save(data)); }
  if (kind === 'notebook') await assert.rejects(repository.mutateNotebook({ type: 'save_affirmation', input: { text: 'Unsaved thought' } }));
  if (kind === 'course') { const course = clone(saved().courseProgress); course.lessons[courseLesson.id] = { checked: [], answer: null, reflection: 'Unsaved note', completed: false }; assert.equal(await saveCourseProgress(course), false); }
  assert.equal(raw(), original); assert.equal(state().currentDocumentConfirmed, true);
  assert.equal(state().lastSyncAt, history); assert.equal(state().lastSuccessfulSyncAt, history);
});

test('dirty startup does not automatically restore the same acknowledged cloud baseline over newer device work', async () => {
  const { repository, history, f } = await setupConfirmed(); const data = await repository.load();
  data.profile.displayName = 'Device work that has not uploaded'; await repository.save(data);
  const current = raw(); await cloudSync.init(); await repository.load();
  assert.equal(await cloudSync.pullIfNewer(saved()), null);
  assert.equal(raw(), current); assertDirty(history); assert.deepEqual(f.writes, []);
});

test('an old in-flight upload retains its remote baseline while the latest durable document remains dirty', async () => {
  const { repository, f } = await setupConfirmed(); const data = await repository.load();
  data.profile.displayName = 'First saved edit'; await repository.save(data);
  const write = deferred<void>(); const started = deferred<void>();
  f.hooks.write = async () => { started.resolve(); await write.promise; };
  const first = cloudSync.push(saved()); await started.promise;
  const newer = await repository.load(); newer.profile.displayName = 'Latest durable edit'; await repository.save(newer);
  const current = raw(); write.resolve(); assert.equal(await first, true);
  assert.equal(raw(), current); assert.equal(f.rows.get('A')!.data.profile.displayName, 'First saved edit');
  assertDirty(owner().remoteVersion);
  assert.equal(owner().remoteVersion, f.rows.get('A')!.updated_at, 'remote baseline remains usable by the next queued update');
});

test('the latest queued durable payload updates after an older in-flight upload without reverting cloud or device', async () => {
  const { repository, f } = await setupConfirmed(); const firstData = await repository.load(); firstData.profile.displayName = 'First queued edit'; await repository.save(firstData);
  const write = deferred<void>(); const started = deferred<void>();
  let writeCount = 0; f.hooks.write = async () => { if (++writeCount === 1) { started.resolve(); await write.promise; } };
  const first = cloudSync.push(saved()); await started.promise;
  const latest = await repository.load(); latest.profile.displayName = 'Latest queued edit'; await repository.save(latest);
  const second = cloudSync.push(saved()); write.resolve();
  assert.equal(await first, true); assert.equal(await second, true);
  assert.equal(f.rows.get('A')!.data.profile.displayName, 'Latest queued edit'); assert.equal(saved().profile.displayName, 'Latest queued edit');
  assert.equal(state().currentDocumentConfirmed, true); assert.equal(state().lastSyncAt, f.rows.get('A')!.updated_at);
});

// Additional regressions added after the implementation existed. These are not
// included in, or claimed as failures in, the immutable 21-case baseline log.
for (const drift of ['account', 'project', 'local-record'] as const) {
  for (const outcome of ['resolve', 'reject'] as const) test(`a cloud-restore fingerprint ${outcome} after ${drift} drift returns false without publishing obsolete status`, async () => {
    const { repository, reviewed, f } = await setupPendingCloudRestore();
    const digest = holdDigest(); const pending = cloudSync.markRemoteApplied(reviewed);
    await digest.started.promise;
    if (drift === 'account') internal.setSession(session('B'));
    if (drift === 'project') internal.config = { url: 'https://changed-current-record.example', anonKey: 'public-synthetic-fixture' };
    if (drift === 'local-record') {
      const latest = await repository.load(); latest.profile.displayName = 'Newer durable writing during restore acknowledgement';
      await repository.save(latest);
    }
    const currentRaw = raw(); const before = new Map(storage.values); internal.error = 'A newer current-scope status';
    let emissions = 0; const unsubscribe = cloudSync.subscribe(() => { emissions++; });
    try {
      digest.release.resolve(outcome);
      assert.equal(await pending, false);
      assert.equal(raw(), currentRaw); assert.deepEqual(storage.values, before);
      assert.equal(state().error, 'A newer current-scope status'); assert.equal(emissions, 0);
      assert.deepEqual(f.writes, []);
    } finally { unsubscribe(); }
  });
}

test('a rejected current cloud-restore fingerprint returns false, preserves durable data and reports unconfirmed backup', async () => {
  const { reviewed, f } = await setupPendingCloudRestore(); const currentRaw = raw(); const previousOwner = clone(owner());
  const digest = holdDigest(); const pending = cloudSync.markRemoteApplied(reviewed); await digest.started.promise;
  digest.release.resolve('reject'); assert.equal(await pending, false);
  assert.equal(raw(), currentRaw); assert.deepEqual(owner(), previousOwner);
  assert.equal(state().currentDocumentConfirmed, false); assert.ok(state().error); assert.deepEqual(f.writes, []);
});

for (const failure of ['owner-quota', 'document-read'] as const) test(`cloud-restore acknowledgement ${failure} failure returns a boolean and keeps the durable restored record`, async () => {
  const { reviewed, f } = await setupPendingCloudRestore(); const currentRaw = raw();
  const previousOwner = storage.values.get('oda_cloud_last_sync:local_scope');
  if (failure === 'owner-quota') storage.failKey = 'oda_cloud_last_sync:local_scope';
  if (failure === 'document-read') storage.failGetKey = APP_DATA_STORAGE_KEY;
  const result = await cloudSync.markRemoteApplied(reviewed);
  assert.equal(result, false); assert.equal(typeof result, 'boolean');
  assert.equal(storage.values.get(APP_DATA_STORAGE_KEY), currentRaw);
  assert.equal(storage.values.get('oda_cloud_last_sync:local_scope'), previousOwner);
  assert.deepEqual(f.writes, []);
});

for (const outcome of ['resolve', 'reject'] as const) test(`a clean-reload confirmation fingerprint ${outcome} after account B cannot publish account A status`, async () => {
  const { f } = await setupConfirmed(); const currentRaw = raw(); const persistedOwner = storage.values.get('oda_cloud_last_sync:local_scope');
  // Reset the actual singleton's in-memory confirmation to model reload while
  // retaining its one durable-observer subscription. Fresh-instance reload is
  // exercised separately below; this is the generation/timing regression.
  Object.assign(internal, { initialized: false, initializing: null, sessionHydrated: false,
    confirmedLocalRecord: undefined, confirmedLocalFingerprint: undefined, confirmationProbe: null, confirmationBootstrap: null });
  const digest = holdDigest(); const pending = cloudSync.init(); await digest.started.promise;
  assert.equal(state().currentDocumentConfirmed, false, 'a delayed hash must stay conservatively unconfirmed');
  internal.setSession(session('B')); internal.error = 'Current account B status';
  let emissions = 0; const unsubscribe = cloudSync.subscribe(() => { emissions++; });
  try {
    digest.release.resolve(outcome); await pending;
    assert.equal(state().session?.user.id, 'B'); assert.equal(state().error, 'Current account B status');
    assert.equal(state().currentDocumentConfirmed, false); assert.equal(state().lastSyncAt, null);
    assert.equal(emissions, 0); assert.equal(raw(), currentRaw);
    assert.equal(storage.values.get('oda_cloud_last_sync:local_scope'), persistedOwner);
    assert.deepEqual(f.reads, []); assert.deepEqual(f.writes, []);
  } finally { unsubscribe(); }
});

test('confirmation bootstrap after a clean reload is tied to the actual persisted document', async () => {
  const { history, f } = await setupConfirmed();
  // A separate service instance models module reload without fabricating an
  // acknowledgement or deriving confidence from the old singleton's cache.
  const Reloaded = cloudSync.constructor as new () => typeof cloudSync;
  const reloaded = new Reloaded();
  Object.assign(reloaded, { config: { url: project, anonKey: 'public-synthetic-fixture' }, session: session(), client: f.client });
  await reloaded.init(); await new LocalDemoRepository().load();
  await waitForCurrentConfirmation(reloaded);
  const current = reloaded.getState() as CurrentState;
  assert.equal(current.currentDocumentConfirmed, true); assert.equal(current.lastSyncAt, history); assert.equal(current.lastSuccessfulSyncAt, history);
});

test('confirmation bootstrap after a dirty reload preserves device work and historical cloud time', async () => {
  const { repository, history, f } = await setupConfirmed(); const data = await repository.load();
  data.profile.displayName = 'Unuploaded work persisted before restart'; await repository.save(data); const current = raw();
  const Reloaded = cloudSync.constructor as new () => typeof cloudSync; const reloaded = new Reloaded();
  Object.assign(reloaded, { config: { url: project, anonKey: 'public-synthetic-fixture' }, session: session(), client: f.client });
  await reloaded.init(); await repository.load();
  assert.equal((reloaded.getState() as CurrentState).currentDocumentConfirmed, false);
  assert.equal(reloaded.getState().lastSyncAt, null); assert.equal((reloaded.getState() as CurrentState).lastSuccessfulSyncAt, history);
  assert.equal(await reloaded.pullIfNewer(saved()), null); assert.equal(raw(), current);
});

test('a coherently hydrated external-tab edit cannot inherit another tab’s current-document confirmation', async () => {
  const { history } = await setupConfirmed();
  const external = saved(); external.profile.displayName = 'Another tab durable edit';
  // This node test models the authoritative document *after* hydration. It
  // does not claim to exercise real browser IndexedDB or Web Locks.
  await queueDataWrite(() => store(external)); await new LocalDemoRepository().load();
  assertDirty(history); assert.equal(saved().profile.displayName, external.profile.displayName);
});
