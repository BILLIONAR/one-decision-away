import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { APP_DATA_STORAGE_KEY } from '../src/services/storageKeys';
import { queueDataWrite } from '../src/services/dataWrites';
import { cloudCrudFixture } from './helpers/cloudCrudFixture';

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}
const storage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
const { cloudSync } = await import('../src/services/cloudSync');
const { getInitialDemoState, LocalDemoRepository } = await import('../src/services/repository');
const internal = cloudSync as unknown as Record<string, any>;
const session = (id: string) => ({ user: { id } });
const config = (url = 'https://project-a.example') => ({ url, anonKey: 'public-test-fixture' });
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
};

beforeEach(() => {
  storage.values.clear();
  Object.assign(internal, { session: session('account-a'), config: config(), scopeRevision: 0, syncing: false, error: null, pushTimer: null, pushQueue: Promise.resolve(false) });
});

function setup() {
  const local = structuredClone(getInitialDemoState());
  local.profile.displayName = 'Keep this local record';
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(local));
  const remote = structuredClone(local);
  remote.profile.displayName = 'Account A remote record';
  const read = deferred<any>();
  const started = deferred<void>();
  const uploads: any[] = [];
  const crud = cloudCrudFixture({
    read: async userId => { assert.equal(userId, 'account-a'); started.resolve(); return read.promise; },
    write: async row => { uploads.push(row); return { error: null }; },
  });
  internal.client = { ...crud.client, auth: { signOut: async () => undefined } };
  const respond = () => read.resolve({ data: { data: remote, updated_at: '2030-01-01T00:00:00Z' }, error: null });
  return { local, remote, read, started, uploads, respond };
}

const mutations = [
  ['account switch', async () => { internal.session = session('account-b'); }],
  ['project switch', async () => { internal.config = config('https://project-b.example'); }],
  ['logout and reauthentication as the same account', async () => { await cloudSync.signOut(); internal.session = session('account-a'); }],
  ['an explicit local import barrier', async () => { cloudSync.markLocalRestore(); }],
  ['newer saved personal writing', async () => {
    const data = JSON.parse(storage.getItem(APP_DATA_STORAGE_KEY)!);
    data.notebook.entries.push({ id: 'new-writing', kind: 'journal', title: 'A newer entry', content: 'Save this while the remote read waits.', dateKey: '2026-09-30', createdAt: '2026-09-30T10:00:00Z', updatedAt: '2026-09-30T10:00:00Z' });
    storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
  }],
] as const;

for (const [name, mutate] of mutations) test(`a pending cloud SELECT cannot replace data after ${name}`, async () => {
  const fixture = setup();
  const pending = cloudSync.pullIfNewer(fixture.local);
  await fixture.started.promise;
  await mutate();
  const previous = new Map(storage.values);
  fixture.respond();
  assert.equal(await pending, null);
  assert.deepEqual(storage.values, previous);
  assert.equal(fixture.uploads.length, 0);
});

for (const [name, mutate] of mutations) test(`a reviewed cloud restore is checked inside the write lock after ${name}`, async () => {
  const fixture = setup();
  const pending = cloudSync.pullIfNewer(fixture.local);
  await fixture.started.promise; fixture.respond();
  const reviewed = await pending;
  assert.ok(reviewed);
  assert.equal(cloudSync.canApplyRemote(reviewed), true);
  // This is the same boundary as a user accepting an open review while another
  // tab holds the data lock. A pre-lock check alone would overwrite the record.
  const held = deferred<void>();
  const release = deferred<void>();
  const lock = queueDataWrite(async () => { held.resolve(); await release.promise; });
  await held.promise;
  const replacement = new LocalDemoRepository().replaceAll(reviewed, originalRecord => cloudSync.canApplyRemote(reviewed, originalRecord));
  await mutate();
  const previous = new Map(storage.values);
  release.resolve(); await lock;
  assert.equal(await replacement, false);
  cloudSync.markRemoteApplied(reviewed);
  assert.equal(storage.getItem('oda_cloud_last_sync'), null);
  assert.deepEqual(storage.values, previous);
});

test('an unchanged reviewed cloud record commits once and records its scoped sync', async () => {
  const fixture = setup();
  const pending = cloudSync.pullIfNewer(fixture.local);
  await fixture.started.promise; fixture.respond();
  const reviewed = (await pending)!;
  assert.equal(await new LocalDemoRepository().replaceAll(reviewed, originalRecord => cloudSync.canApplyRemote(reviewed, originalRecord)), true);
  cloudSync.markRemoteApplied(reviewed);
  assert.equal(JSON.parse(storage.getItem(APP_DATA_STORAGE_KEY)!).profile.displayName, fixture.remote.profile.displayName);
  assert.equal(cloudSync.getState().lastSyncAt, '2030-01-01T00:00:00Z');
});

test('manual sync cannot fall back to uploading a captured previous-account snapshot', async () => {
  const fixture = setup();
  const current = cloudSync.currentOperationGuard();
  const pending = cloudSync.pullIfNewer(fixture.local);
  await fixture.started.promise;
  internal.session = session('account-b');
  fixture.respond();
  const remote = await pending;
  // Mirrors the guarded fallback in BackupAndCloudSettings.handleSyncNow.
  if (!remote && current()) await cloudSync.push(fixture.local);
  assert.equal(remote, null);
  assert.equal(current(), false);
  assert.deepEqual(fixture.uploads, []);
  assert.equal(JSON.parse(storage.getItem(APP_DATA_STORAGE_KEY)!).profile.displayName, fixture.local.profile.displayName);
});

test('a delayed automatic backup remains bound to its original account', async () => {
  const fixture = setup();
  let scheduled: (() => void) | undefined;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { setTimeout: (callback: () => void) => { scheduled = callback; return 1; }, clearTimeout: () => undefined } });
  try {
    cloudSync.schedulePush(fixture.local);
    internal.session = session('account-b');
    scheduled!();
    await Promise.resolve(); await Promise.resolve();
    assert.deepEqual(fixture.uploads, []);
  } finally { delete (globalThis as any).window; }
});

for (const error of [null, new Error('Account A upload failed')]) test(`an old upload ${error ? 'failure' : 'success'} cannot mark or emit the new cloud scope`, async () => {
  const fixture = setup();
  const upload = deferred<any>();
  const started = deferred<void>();
  internal.client = cloudCrudFixture({ write: async () => { started.resolve(); return upload.promise; } }).client;
  let notifications = 0;
  const unsubscribe = cloudSync.subscribe(() => { notifications++; });
  try {
    const pending = cloudSync.push(fixture.local);
    await started.promise;
    assert.equal(notifications, 1);
    Object.assign(internal, { session: session('account-b'), config: config('https://project-b.example'), syncing: true, error: 'Current account status' });
    upload.resolve({ error });
    assert.equal(await pending, false);
    assert.equal(notifications, 1);
    assert.equal(cloudSync.getState().error, 'Current account status');
    assert.equal(cloudSync.getState().syncing, true);
    assert.equal(storage.getItem('oda_cloud_last_sync'), null);
  } finally { unsubscribe(); }
});
