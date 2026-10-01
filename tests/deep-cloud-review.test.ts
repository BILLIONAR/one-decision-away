import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { APP_DATA_STORAGE_KEY } from '../src/services/storageKeys';

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
const { readContextConsent, sendToCloudCoach, writeContextConsent } = await import('../src/services/cloudCoach');
const internal = cloudSync as unknown as Record<string, any>;
const session = (id: string) => ({ access_token: `fixture-${id}`, user: { id } });
const config = (url = 'https://project-a.example') => ({ url, anonKey: 'public-fixture' });
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
};

beforeEach(() => {
  storage.values.clear();
  Object.assign(internal, { session: session('A'), config: config(), client: {}, scopeRevision: 0, syncing: false, error: null, pushTimer: null, pushQueue: Promise.resolve(false) });
});

test('an earlier account sync timestamp cannot hide another account cloud record', async () => {
  const local = structuredClone(getInitialDemoState());
  local.profile.lastOpenedAt = '2020-01-01T00:00:00Z';
  local.profile.displayName = 'Account A local record';
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(local));
  internal.client = { from: () => ({ upsert: async () => ({ error: null }) }) };
  assert.equal(await cloudSync.push(local), true);
  const accountATimestamp = cloudSync.getState().lastSyncAt;
  assert.ok(accountATimestamp);
  internal.setSession(session('B'));
  const remote = structuredClone(local);
  remote.profile.displayName = 'Account B cloud record';
  internal.client = { from: () => ({ select: () => ({ eq: (_key: string, userId: string) => ({ maybeSingle: async () => {
    assert.equal(userId, 'B');
    return { data: { data: remote, updated_at: '2021-01-01T00:00:00Z' }, error: null };
  } }) }) }) };
  assert.equal(cloudSync.getState().lastSyncAt, null);
  const pulled = await cloudSync.pullIfNewer(local);
  assert.equal(pulled?.profile.displayName, remote.profile.displayName);
  internal.setSession(session('A'));
  assert.equal(cloudSync.getState().lastSyncAt, accountATimestamp);
});

test('a legacy unscoped timestamp is not proof that this account is synchronized', async () => {
  const local = structuredClone(getInitialDemoState());
  local.profile.lastOpenedAt = '2040-01-01T00:00:00Z';
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(local));
  storage.setItem('oda_cloud_last_sync', '2040-01-01T00:00:00Z');
  internal.client = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({
    data: { data: local, updated_at: '2021-01-01T00:00:00Z' }, error: null,
  }) }) }) }) };
  assert.equal(cloudSync.getState().lastSyncAt, null);
  assert.ok(await cloudSync.pullIfNewer(local));
});

test('an account deletion response cannot sign out a later signed-in account', async () => {
  const result = deferred<{ error: null }>();
  const started = deferred<void>();
  const signedOut: string[] = [];
  internal.client = {
    functions: { invoke: (_name: string, options: { headers: Record<string, string> }) => {
      assert.equal(options.headers.Authorization, 'Bearer fixture-A');
      started.resolve(); return result.promise;
    } },
    auth: { signOut: async () => { signedOut.push(internal.session?.user.id); } },
  };
  const pending = cloudSync.deleteAccount();
  await started.promise;
  internal.setSession(session('B'));
  result.resolve({ error: null });
  assert.equal((await pending).ok, true); // the authorized deletion of A succeeded
  assert.equal(cloudSync.getState().session?.user.id, 'B');
  assert.deepEqual(signedOut, []);
});

test('an account deletion response cannot clear a new project connection', async () => {
  const result = deferred<{ error: null }>();
  const started = deferred<void>();
  let signedOut = 0;
  internal.client = {
    functions: { invoke: () => { started.resolve(); return result.promise; } },
    auth: { signOut: async () => { signedOut++; } },
  };
  const pending = cloudSync.deleteAccount();
  await started.promise;
  Object.assign(internal, { client: {}, config: config('https://project-b.example') });
  internal.setSession(session('B'));
  result.resolve({ error: null });
  assert.equal((await pending).ok, true);
  assert.equal(cloudSync.getState().session?.user.id, 'B');
  assert.equal(signedOut, 0);
});

test('a late cloud coach reply cannot be accepted in another account scope', async context => {
  const response = deferred<Response>();
  const started = deferred<void>();
  context.mock.method(globalThis, 'fetch', async (_url: unknown, request: RequestInit) => {
    assert.equal((request.headers as Record<string, string>).Authorization, 'Bearer fixture-A');
    started.resolve();
    return response.promise;
  });
  const pending = sendToCloudCoach([{ role: 'user', content: 'Synthetic A private topic' }], 'en');
  await started.promise;
  internal.setSession(session('B'));
  response.resolve(Response.json({ reply: 'A reply', remaining: 29, limit: 30, tier: 'free' }));
  await assert.rejects(pending, (error: Error) => error.name === 'AbortError');
});

test('account deletion cannot start with another account after awaiting the client', async () => {
  let invoked = false;
  internal.client = { functions: { invoke: () => { invoked = true; return { error: null }; } } };
  const pending = cloudSync.deleteAccount();
  internal.setSession(session('B'));
  assert.equal((await pending).ok, false);
  assert.equal(invoked, false);
  assert.equal(cloudSync.getState().session?.user.id, 'B');
});

test('cloud coach context consent is isolated between accounts and projects', () => {
  storage.setItem('oda_coach_share_context', '1'); // the legacy device-wide consent is ambiguous
  assert.equal(readContextConsent(), false);
  writeContextConsent(true);
  assert.equal(readContextConsent(), true);
  internal.setSession(session('B'));
  assert.equal(readContextConsent(), false);
  internal.setSession(session('A'));
  assert.equal(readContextConsent(), true);
  internal.config = config('https://project-b.example');
  assert.equal(readContextConsent(), false);
  writeContextConsent(true);
  writeContextConsent(false);
  assert.equal(readContextConsent(), false);
});

test('a token refresh keeps the current account coach request valid', async context => {
  const response = deferred<Response>();
  const started = deferred<void>();
  context.mock.method(globalThis, 'fetch', async () => { started.resolve(); return response.promise; });
  const pending = sendToCloudCoach([{ role: 'user', content: 'Synthetic A topic' }], 'en');
  await started.promise;
  internal.setSession({ ...session('A'), access_token: 'fixture-A-refreshed' });
  response.resolve(Response.json({ reply: 'Current reply', remaining: 29, limit: 30, tier: 'free' }));
  assert.equal((await pending).reply, 'Current reply');
});

test('a project change while reading a coach response also expires its content', async context => {
  const payload = deferred<any>();
  const reading = deferred<void>();
  context.mock.method(globalThis, 'fetch', async () => ({ status: 200, json: () => { reading.resolve(); return payload.promise; } }) as Response);
  const pending = sendToCloudCoach([{ role: 'user', content: 'Synthetic A topic' }], 'en');
  await reading.promise;
  internal.config = config('https://project-b.example');
  payload.resolve({ reply: 'Old project reply', remaining: 29, limit: 30, tier: 'free' });
  await assert.rejects(pending, (error: Error) => error.name === 'AbortError');
});

test('stopping the coach cancels a response body still being downloaded', async context => {
  const payload = deferred<any>();
  const reading = deferred<void>();
  let requestSignal!: AbortSignal;
  context.mock.method(globalThis, 'fetch', async (_url: unknown, request: RequestInit) => {
    requestSignal = request.signal!;
    return { status: 200, json: () => { reading.resolve(); return payload.promise; } } as Response;
  });
  const controller = new AbortController();
  const pending = sendToCloudCoach([{ role: 'user', content: 'Synthetic A topic' }], 'en', null, controller.signal);
  await reading.promise;
  controller.abort();
  const bodyWasCancelled = requestSignal.aborted;
  payload.resolve({ reply: 'An unwanted reply', remaining: 29, limit: 30, tier: 'free' });
  await assert.rejects(pending, (error: Error) => error.name === 'AbortError');
  assert.equal(bodyWasCancelled, true);
});

test('a queued backup cannot upload a local document rolled back while it waited', async () => {
  const initial = structuredClone(getInitialDemoState());
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(initial));
  const firstUpload = deferred<{ error: null }>();
  const uploading = deferred<void>();
  const uploads: string[] = [];
  internal.client = { from: () => ({ upsert: (row: { data: { profile: { displayName: string } } }) => {
    uploads.push(row.data.profile.displayName);
    if (uploads.length === 1) { uploading.resolve(); return firstUpload.promise; }
    return Promise.resolve({ error: null });
  } }) };
  const pendingFirst = cloudSync.push(initial);
  await uploading.promise;
  const uncommitted = structuredClone(initial);
  uncommitted.profile.displayName = 'A document whose commit failed';
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(uncommitted));
  const queued = cloudSync.push(uncommitted);
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(initial));
  firstUpload.resolve({ error: null });
  assert.equal(await pendingFirst, true);
  assert.equal(await queued, false);
  assert.deepEqual(uploads, [initial.profile.displayName]);
});

test('the latest queued backup still uploads after a preceding slower backup', async () => {
  const initial = structuredClone(getInitialDemoState());
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(initial));
  const firstUpload = deferred<{ error: null }>();
  const uploading = deferred<void>();
  const uploads: string[] = [];
  internal.client = { from: () => ({ upsert: (row: { data: { profile: { displayName: string } } }) => {
    uploads.push(row.data.profile.displayName);
    if (uploads.length === 1) { uploading.resolve(); return firstUpload.promise; }
    return Promise.resolve({ error: null });
  } }) };
  const pendingFirst = cloudSync.push(initial);
  await uploading.promise;
  const latest = structuredClone(initial);
  latest.profile.displayName = 'The newest committed document';
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(latest));
  const queued = cloudSync.push(latest);
  firstUpload.resolve({ error: null });
  assert.equal(await pendingFirst, true);
  assert.equal(await queued, true);
  assert.deepEqual(uploads, [initial.profile.displayName, latest.profile.displayName]);
});

test('returning to an earlier account cannot reuse its timestamp for another account local record', async () => {
  const recordA = structuredClone(getInitialDemoState());
  recordA.profile.displayName = 'Account A synchronized record';
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(recordA));
  internal.client = { from: () => ({ upsert: async () => ({ error: null }) }) };
  assert.equal(await cloudSync.push(recordA), true);
  const accountATimestamp = cloudSync.getState().lastSyncAt!;
  const recordB = structuredClone(recordA);
  recordB.profile.displayName = 'Account B synchronized record';
  internal.client = { from: () => ({ select: () => ({ eq: (_key: string, userId: string) => ({ maybeSingle: async () => ({
    data: { data: userId === 'A' ? recordA : recordB, updated_at: userId === 'A' ? accountATimestamp : '2030-01-01T00:00:00Z' }, error: null,
  }) }) }) }) };
  internal.setSession(session('B'));
  const remoteB = await cloudSync.pullIfNewer(recordA);
  assert.ok(remoteB);
  assert.equal(await new LocalDemoRepository().replaceAll(remoteB, originalRecord => cloudSync.canApplyRemote(remoteB, originalRecord)), true);
  cloudSync.markRemoteApplied(remoteB);
  internal.setSession(session('A'));
  const remoteA = await cloudSync.pullIfNewer(remoteB);
  assert.equal(remoteA?.profile.displayName, recordA.profile.displayName);
});

test('a replaced dataset cannot inherit this account historical synchronization proof', async () => {
  const original = structuredClone(getInitialDemoState());
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(original));
  internal.client = { from: () => ({ upsert: async () => ({ error: null }) }) };
  assert.equal(await cloudSync.push(original), true);
  assert.ok(cloudSync.getState().lastSyncAt);
  const replacement = structuredClone(original);
  replacement.profile.displayName = 'A different restored dataset';
  await new LocalDemoRepository().replaceAll(replacement);
  assert.equal(cloudSync.getState().lastSyncAt, null);
});

test('an owner-metadata quota failure cannot advertise a newer synchronized local record', async context => {
  context.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-01T00:00:00Z').getTime() });
  const initial = structuredClone(getInitialDemoState());
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(initial));
  internal.client = { from: () => ({ upsert: async () => ({ error: null }) }) };
  assert.equal(await cloudSync.push(initial), true);
  assert.ok(cloudSync.getState().lastSyncAt);
  context.mock.timers.tick(5000);
  const next = structuredClone(initial);
  next.profile.displayName = 'The newer local record';
  storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(next));
  const setItem = storage.setItem.bind(storage);
  context.mock.method(storage, 'setItem', (key: string, value: string) => {
    if (key === 'oda_cloud_last_sync:local_scope') throw new DOMException('Metadata quota exceeded', 'QuotaExceededError');
    setItem(key, value);
  });
  assert.equal(await cloudSync.push(next), false);
  assert.equal(cloudSync.getState().lastSyncAt, null);
});
