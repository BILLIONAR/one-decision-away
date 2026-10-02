import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { beforeEach, test } from 'node:test';
import type { UserData } from '../src/types/models';
import { APP_DATA_STORAGE_KEY } from '../src/services/storageKeys';

// The real CloudSync singleton runs against an injected, local-only PostgREST
// contract. No auth request, provider, database or network is used in this file.
class MemoryStorage {
  values = new Map<string, string>();
  failKey: string | null = null;
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) {
    if (key === this.failKey) throw new Error('Synthetic storage quota failure');
    this.values.set(key, value);
  }
  removeItem(key: string) { this.values.delete(key); }
}
const storage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto });
let fetchCalls = 0;
Object.defineProperty(globalThis, 'fetch', { configurable: true, value: async () => {
  fetchCalls++;
  throw new Error('Network is forbidden in cloud-upload-readiness tests');
} });
const { cloudSync } = await import('../src/services/cloudSync');
const { getInitialDemoState, LocalDemoRepository } = await import('../src/services/repository');
const internal = cloudSync as unknown as Record<string, any>;
const OWNER_KEY = 'oda_cloud_last_sync:local_scope';
const project = 'https://project-a.example';
const accountKey = (id = 'A') => `oda_cloud_last_sync:${encodeURIComponent(project)}:${id}`;
const importKey = (id = 'A') => `oda_cloud_pending_restore:${encodeURIComponent(project)}:${id}`;
const session = (id: string) => ({ access_token: `synthetic-${id}`, user: { id } });
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
};
const clone = <T>(value: T): T => structuredClone(value);
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
const fingerprint = (value: unknown) => createHash('sha256').update(canonical(value)).digest('hex');
const makeData = (name: string): UserData => {
  const data = clone(getInitialDemoState());
  data.profile.displayName = name;
  data.profile.lastOpenedAt = '2020-01-01T00:00:00Z';
  return data;
};
const storeData = (data: UserData) => storage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify(data));
const savedData = () => JSON.parse(storage.getItem(APP_DATA_STORAGE_KEY)!) as UserData;
const owner = () => JSON.parse(storage.getItem(OWNER_KEY) || 'null');
const forReview = (local: UserData) => (cloudSync.pullIfNewer as unknown as
  (local: UserData, options: { forReview: true }) => Promise<UserData | null>)(local, { forReview: true });

type Row = { user_id?: string; data: UserData; updated_at: string };
type Reply = { data?: unknown; error: unknown };
type Mutation = { kind: 'insert' | 'update' | 'upsert'; row: Row; filters: Map<string, unknown> };
function fixture(initial: Row | null = null) {
  const rows = new Map<string, Row>();
  if (initial) rows.set('A', clone(initial));
  const mutations: Mutation[] = [];
  const reads: string[] = [];
  const hooks: {
    read?: (id: string) => Promise<Reply> | Reply;
    write?: (mutation: Mutation) => Promise<Reply> | Reply;
    beforeWrite?: (mutation: Mutation) => Promise<void> | void;
    afterWrite?: (mutation: Mutation) => Promise<void> | void;
  } = {};
  let authCallback: ((event: string, value: any) => void) | undefined;
  let authSession: any = session('A');
  let verificationAccount = 'A';
  const apply = async (mutation: Mutation): Promise<Reply> => {
    mutations.push(mutation);
    if (hooks.beforeWrite) await hooks.beforeWrite(mutation);
    if (hooks.write) return hooks.write(mutation);
    const id = String(mutation.filters.get('user_id') ?? mutation.row.user_id);
    if (mutation.kind === 'insert' && rows.has(id)) return { data: null, error: { code: '23505', message: 'Synthetic duplicate key' } };
    if (mutation.kind === 'update') {
      const current = rows.get(id);
      if (!current || current.updated_at !== mutation.filters.get('updated_at')) return { data: [], error: null };
    }
    const written = clone({ ...mutation.row, user_id: id });
    rows.set(id, written);
    if (hooks.afterWrite) await hooks.afterWrite(mutation);
    return mutation.kind === 'upsert' ? { error: null } : { data: [clone(written)], error: null };
  };
  const query = (kind: 'insert' | 'update', value: Row) => {
    const mutation: Mutation = { kind, row: clone(value), filters: new Map() };
    const builder = {
      eq: (key: string, filter: unknown) => { mutation.filters.set(key, filter); return builder; },
      select: (_columns: string) => apply(mutation),
    };
    return builder;
  };
  const client = {
    auth: {
      getSession: async () => ({ data: { session: authSession }, error: null }),
      onAuthStateChange: (callback: typeof authCallback) => { authCallback = callback; return { data: { subscription: { unsubscribe() {} } } }; },
      verifyOtp: async () => { authSession = session(verificationAccount); authCallback?.('SIGNED_IN', authSession); return { error: null }; },
      signOut: async () => { authSession = null; authCallback?.('SIGNED_OUT', null); return { error: null }; },
    },
    from: (table: string) => {
      assert.equal(table, 'oda_user_data');
      return {
        select: (_columns: string) => ({ eq: (key: string, id: string) => {
          assert.equal(key, 'user_id');
          return { maybeSingle: async () => {
            reads.push(id);
            if (hooks.read) return hooks.read(id);
            return { data: clone(rows.get(id) ?? null), error: null };
          } };
        } }),
        insert: (value: Row) => query('insert', value),
        update: (value: Row) => query('update', value),
        // Original code is deliberately supported to expose destructive upsert
        // behavior as assertion failures, rather than a mock-method exception.
        upsert: (value: Row) => apply({ kind: 'upsert', row: clone(value), filters: new Map() }),
      };
    },
  };
  internal.client = client;
  return { rows, reads, mutations, hooks, client,
    setAuthSession: (value: any) => { authSession = value; },
    setVerificationAccount: (id: string) => { verificationAccount = id; },
  };
}
const row = (name = 'Existing cloud work', updated_at = '2030-01-01T00:00:00.000Z'): Row => ({ data: makeData(name), updated_at });
async function acceptCloud(f: ReturnType<typeof fixture>) {
  const reviewed = await forReview(savedData());
  assert.ok(reviewed, 'manual review must expose the cloud record');
  assert.equal(await new LocalDemoRepository().replaceAll(reviewed, raw => cloudSync.canApplyRemote(reviewed, raw)), true);
  await cloudSync.markRemoteApplied(reviewed);
  assert.deepEqual(f.mutations, [], 'accepting a review never uploads');
  return reviewed;
}
function assertNoAcknowledgement() {
  assert.equal(storage.getItem(OWNER_KEY), null);
  assert.equal(storage.getItem(accountKey()), null);
}
function assertHeld(f: ReturnType<typeof fixture>, raw: string, remote: Row) {
  assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), raw, 'exact device bytes must remain saved');
  assert.deepEqual(f.rows.get('A'), remote, 'existing cloud document must remain unchanged');
  assert.deepEqual(f.mutations, [], 'unacknowledged cloud data must not be mutated');
  assert.ok(cloudSync.getState().error, 'blocked upload needs an honest visible status');
}

beforeEach(() => {
  storage.values.clear(); storage.failKey = null; fetchCalls = 0;
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto });
  Object.assign(internal, {
    session: session('A'), config: { url: project, anonKey: 'public-synthetic-fixture' }, client: null,
    scopeRevision: 0, syncing: false, error: null, uploadBlocked: false, pushTimer: null,
    initialized: false, initializing: null, sessionHydrated: false,
    pushQueue: Promise.resolve(false), pendingPulls: new WeakMap(), authSubscription: null,
  });
  storeData(makeData('Shared device work'));
});

test('fresh OTP sign-in cannot overwrite existing cloud work on the first ordinary save', async () => {
  const remote = row(); const f = fixture(remote);
  internal.setSession(null); f.setAuthSession(null);
  await cloudSync.init();
  assert.equal((await cloudSync.verifyEmailCode('synthetic@example.invalid', '123456')).ok, true);
  assert.equal(cloudSync.getState().session?.user.id, 'A');
  const raw = storage.getItem(APP_DATA_STORAGE_KEY)!;
  assert.equal(await cloudSync.push(savedData()), false);
  assertHeld(f, raw, remote); assertNoAcknowledgement(); assert.equal(fetchCalls, 0);
});

test('an absent cloud row is inserted once and acknowledges the returned server version and exact data', async () => {
  const f = fixture(); const raw = storage.getItem(APP_DATA_STORAGE_KEY)!;
  assert.equal(await cloudSync.push(savedData()), true);
  assert.deepEqual(f.mutations.map(value => value.kind), ['insert']);
  assert.deepEqual(f.reads, ['A']);
  const stored = f.rows.get('A')!;
  assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), raw);
  assert.equal(owner().key, accountKey());
  assert.equal(owner().remoteVersion, stored.updated_at);
  assert.equal(owner().remoteFingerprint, fingerprint(stored.data));
  assert.equal(storage.getItem(accountKey()), stored.updated_at);
});

for (const failure of ['throws', 'resolved'] as const) test(`offline SELECT ${failure} and reconnect retain both records`, async () => {
  const remote = row(); const f = fixture(remote); const raw = storage.getItem(APP_DATA_STORAGE_KEY)!;
  f.hooks.read = () => { if (failure === 'throws') throw new Error('Synthetic offline'); return { data: null, error: new Error('Synthetic offline') }; };
  assert.equal(await cloudSync.push(savedData()), false);
  assert.deepEqual(f.mutations, []); assertNoAcknowledgement();
  f.hooks.read = undefined;
  assert.equal(await cloudSync.push(savedData()), false);
  assertHeld(f, raw, remote); assert.equal(f.reads.length, 2);
});

test('shared device A→B→A cannot reuse the historical acknowledgement of A after B owns the record', async () => {
  const f = fixture(row('A cloud')); await acceptCloud(f);
  const aOwner = owner(); assert.ok(aOwner.remoteFingerprint);
  internal.setSession(session('B'));
  f.rows.set('B', row('B cloud'));
  const beforeB = storage.getItem(APP_DATA_STORAGE_KEY)!;
  assert.equal(await cloudSync.push(savedData()), false);
  assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), beforeB);
  await acceptCloud(f);
  assert.equal(owner().key, accountKey('B'));
  const sharedB = storage.getItem(APP_DATA_STORAGE_KEY)!;
  internal.setSession(session('A'));
  assert.equal(await cloudSync.push(savedData()), false);
  assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), sharedB);
  assert.equal(owner().key, accountKey('B'));
  assert.deepEqual(f.mutations, []);
});

for (const name of ['account', 'project', 'logout-return', 'local-edit', 'import'] as const) test(`a stale upload SELECT after ${name} cannot write or alter current-scope status`, async () => {
  const f = fixture(row()); const read = deferred<Reply>(); const started = deferred<void>();
  f.hooks.read = () => { started.resolve(); return read.promise; };
  const pending = cloudSync.push(savedData());
  // Baseline upsert does not SELECT: fail without leaving an unresolved test.
  await Promise.race([started.promise, pending]);
  assert.equal(f.reads.length, 1, 'every upload must SELECT before mutating');
  if (name === 'account') internal.setSession(session('B'));
  if (name === 'project') internal.config = { url: 'https://project-b.example', anonKey: 'public-synthetic-fixture' };
  if (name === 'logout-return') { internal.setSession(null); internal.setSession(session('A')); }
  if (name === 'local-edit') { const data = savedData(); data.profile.displayName = 'Newer local text'; storeData(data); }
  if (name === 'import') cloudSync.markLocalRestore();
  internal.error = 'Current-scope status';
  const before = new Map(storage.values);
  read.resolve({ data: row(), error: null });
  assert.equal(await pending, false);
  assert.deepEqual(f.mutations, []); assert.deepEqual(storage.values, before);
  assert.equal(cloudSync.getState().error, 'Current-scope status');
});

test('same-version remote content changed at the fresh read cannot authorize overwrite', async () => {
  const f = fixture(row()); await acceptCloud(f);
  const acknowledged = clone(owner());
  const changed = clone(f.rows.get('A')!); changed.data.profile.displayName = 'A second device changed this without advancing the timestamp';
  f.rows.set('A', changed);
  const data = savedData(); data.profile.displayName = 'New local writing'; storeData(data);
  const raw = storage.getItem(APP_DATA_STORAGE_KEY)!;
  assert.equal(await cloudSync.push(data), false);
  assertHeld(f, raw, changed); assert.deepEqual(owner(), { ...acknowledged, updatedAt: null });
  assert.equal(cloudSync.getState().currentDocumentConfirmed, false);
  assert.equal(cloudSync.getState().lastSuccessfulSyncAt, acknowledged.remoteVersion);
});

test('canonical acknowledgement treats reordered object keys as equal, but retains array order', async () => {
  const remote = row(); remote.data.futureSelf.coreValues = ['First', 'Second'];
  const f = fixture(remote); await acceptCloud(f);
  const reorder = (value: unknown): any => Array.isArray(value) ? value.map(reorder) : value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).reverse().map(([key, item]) => [key, reorder(item)])) : value;
  f.rows.set('A', { ...remote, data: reorder(remote.data) });
  assert.equal(await cloudSync.push(savedData()), true);
  assert.equal(f.mutations[0].kind, 'update');
  const afterSuccess = clone(owner());
  const stored = clone(f.rows.get('A')!); stored.data.futureSelf.coreValues.reverse(); f.rows.set('A', stored);
  const count = f.mutations.length;
  assert.equal(await cloudSync.push(savedData()), false);
  assert.equal(f.mutations.length, count); assert.deepEqual(owner(), afterSuccess);
});

test('a changed remote version between SELECT and UPDATE yields zero rows and never acknowledges success', async () => {
  const f = fixture(row()); await acceptCloud(f);
  const ack = clone(owner()); const originalLocal = storage.getItem(APP_DATA_STORAGE_KEY)!;
  const winner = row('Concurrent winner', '2030-01-02T00:00:00.000Z');
  f.hooks.beforeWrite = () => { f.rows.set('A', clone(winner)); };
  assert.equal(await cloudSync.push(savedData()), false);
  assert.deepEqual(f.rows.get('A'), winner);
  assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), originalLocal);
  assert.deepEqual(owner(), ack);
  assert.equal(f.mutations[0].kind, 'update');
  assert.equal(f.mutations[0].filters.get('updated_at'), ack.remoteVersion);
  assert.ok(cloudSync.getState().error);
});

test('an absent-row insert race preserves the winning cloud record and holds the import token', async () => {
  const f = fixture(); cloudSync.markLocalRestore(); const token = storage.getItem(importKey());
  const winner = row('Racing cloud insert');
  f.hooks.beforeWrite = () => { f.rows.set('A', clone(winner)); };
  const raw = storage.getItem(APP_DATA_STORAGE_KEY)!;
  assert.equal(await cloudSync.push(savedData()), false);
  assert.deepEqual(f.rows.get('A'), winner); assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), raw);
  assert.equal(storage.getItem(importKey()), token); assertNoAcknowledgement();
  assert.deepEqual(f.mutations.map(value => value.kind), ['insert']);
});

for (const [name, result] of [
  ['empty', { data: [], error: null }], ['missing', { error: null }],
  ['invalid-data', { data: [{ data: {}, updated_at: '2030-01-01T00:00:00Z' }], error: null }],
  ['invalid-version', { data: [{ data: makeData('Valid document'), updated_at: 'not-a-date' }], error: null }],
  ['multiple', { data: [row(), row()], error: null }],
] as const) test(`${name} returned write representation never acknowledges or clears import intent`, async () => {
  const f = fixture(); cloudSync.markLocalRestore(); const token = storage.getItem(importKey());
  f.hooks.write = () => result;
  const raw = storage.getItem(APP_DATA_STORAGE_KEY)!;
  assert.equal(await cloudSync.push(savedData()), false);
  assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), raw); assert.equal(storage.getItem(importKey()), token);
  assertNoAcknowledgement(); assert.ok(cloudSync.getState().error);
});

test('a legacy timestamp-only acknowledgement cannot authorize an existing-row upload', async () => {
  const remote = row(); const f = fixture(remote);
  storage.setItem(accountKey(), remote.updated_at);
  storage.setItem(OWNER_KEY, JSON.stringify({ key: accountKey(), epoch: null, updatedAt: remote.updated_at }));
  const before = new Map(storage.values);
  assert.equal(await cloudSync.push(savedData()), false);
  assert.deepEqual(f.mutations, []); assert.deepEqual(storage.values, before); assert.deepEqual(f.rows.get('A'), remote);
});

test('previewing or declining a cloud restore creates no acknowledgement and later saves remain held', async () => {
  const remote = row(); const f = fixture(remote); const raw = storage.getItem(APP_DATA_STORAGE_KEY)!;
  const preview = await forReview(savedData()); assert.ok(preview);
  await cloudSync.markRemoteApplied(preview); // A caller cannot acknowledge before commit.
  assertNoAcknowledgement();
  assert.equal(await cloudSync.push(savedData()), false);
  assertHeld(f, raw, remote); assertNoAcknowledgement();
});

test('accepted cloud restore acknowledges the raw fetched JSON, including omitted legacy course data', async () => {
  const remote = row(); delete (remote.data as Partial<UserData>).courseProgress;
  const f = fixture(remote); await acceptCloud(f);
  assert.ok(savedData().courseProgress, 'normalization retains local course data');
  assert.equal(owner().remoteFingerprint, fingerprint(remote.data));
  assert.equal(owner().remoteVersion, remote.updated_at);
  assert.notEqual(owner().remoteFingerprint, fingerprint(savedData()), 'normalized local data is not the fetched cloud baseline');
  assert.equal(await cloudSync.push(savedData()), true);
  assert.equal(f.mutations[0].kind, 'update');
});

test('an explicit import facing unacknowledged existing cloud keeps bytes/token and cannot bypass review protection', async () => {
  const remote = row(); const f = fixture(remote); cloudSync.markLocalRestore();
  const raw = storage.getItem(APP_DATA_STORAGE_KEY)!; const token = storage.getItem(importKey());
  assert.equal(await forReview(savedData()), null, 'the existing import barrier continues to block cloud replacement');
  assert.equal(await cloudSync.push(savedData()), false);
  assertHeld(f, raw, remote); assert.equal(storage.getItem(importKey()), token); assertNoAcknowledgement();
});

test('an explicit import into absent cloud can insert and clear only its still-current token', async () => {
  const f = fixture(); cloudSync.markLocalRestore(); assert.ok(storage.getItem(importKey()));
  const raw = storage.getItem(APP_DATA_STORAGE_KEY)!;
  assert.equal(await cloudSync.push(savedData()), true);
  assert.equal(storage.getItem(importKey()), null); assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), raw);
  assert.deepEqual(f.mutations.map(value => value.kind), ['insert']); assert.ok(owner().remoteFingerprint);
});

test('a late write response cannot acknowledge a new account or clear a newer import token', async () => {
  const f = fixture(); cloudSync.markLocalRestore();
  const result = deferred<void>(); const started = deferred<void>();
  f.hooks.afterWrite = async () => { started.resolve(); await result.promise; };
  const pending = cloudSync.push(savedData()); await started.promise;
  internal.setSession(session('B')); cloudSync.markLocalRestore();
  const before = new Map(storage.values); internal.error = 'Current B status';
  result.resolve(); assert.equal(await pending, false);
  assert.deepEqual(storage.values, before); assert.equal(cloudSync.getState().error, 'Current B status');
  assert.equal(storage.getItem(accountKey('B')), null); assert.equal(storage.getItem(OWNER_KEY), null);
});

test('a write response cannot clear an import created while that same account upload waited', async () => {
  const f = fixture(); cloudSync.markLocalRestore(); const earlier = storage.getItem(importKey());
  const result = deferred<void>(); const started = deferred<void>();
  f.hooks.afterWrite = async () => { started.resolve(); await result.promise; };
  const pending = cloudSync.push(savedData()); await started.promise;
  cloudSync.markLocalRestore(); const newer = storage.getItem(importKey()); assert.notEqual(newer, earlier);
  result.resolve(); assert.equal(await pending, false);
  assert.equal(storage.getItem(importKey()), newer); assertNoAcknowledgement();
});

test('acknowledgement storage failure does not report sync success or clear imported intent', async () => {
  const f = fixture(); cloudSync.markLocalRestore(); const token = storage.getItem(importKey());
  storage.failKey = OWNER_KEY;
  assert.equal(await cloudSync.push(savedData()), false);
  assert.equal(storage.getItem(importKey()), token); assert.equal(storage.getItem(OWNER_KEY), null);
  assert.equal(f.mutations.length, 1); assert.ok(cloudSync.getState().error);
});

test('hash failure cannot mutate cloud or acknowledge the local record', async () => {
  const remote = row(); const f = fixture(remote); await acceptCloud(f); const before = clone(owner());
  let digestCalls = 0;
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { randomUUID: webcrypto.randomUUID.bind(webcrypto), subtle: { digest: async () => { digestCalls++; throw new Error('Synthetic digest failure'); } } } });
  assert.equal(await cloudSync.push(savedData()), false);
  assert.ok(digestCalls > 0); assert.deepEqual(f.mutations, []); assert.deepEqual(f.rows.get('A'), remote); assert.deepEqual(owner(), before);
});

for (const name of ['account', 'local-edit', 'import'] as const) test(`awaited remote fingerprint after ${name} cannot authorize a stale write`, async () => {
  const f = fixture(row()); await acceptCloud(f);
  const digest = deferred<void>(); const started = deferred<void>();
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {
    randomUUID: webcrypto.randomUUID.bind(webcrypto),
    subtle: { digest: async (algorithm: AlgorithmIdentifier, value: BufferSource) => {
      started.resolve(); await digest.promise;
      return webcrypto.subtle.digest(algorithm, value as NodeJS.ArrayBufferView);
    } },
  } });
  const pending = cloudSync.push(savedData());
  await Promise.race([started.promise, pending]);
  assert.equal(f.reads.length, 2, 'the upload must hash a freshly selected remote record');
  if (name === 'account') internal.setSession(session('B'));
  if (name === 'local-edit') { const data = savedData(); data.profile.displayName = 'Writing saved during digest'; storeData(data); }
  if (name === 'import') cloudSync.markLocalRestore();
  internal.error = 'Current status during fingerprint'; const before = new Map(storage.values);
  digest.resolve(); assert.equal(await pending, false);
  assert.deepEqual(f.mutations, []); assert.deepEqual(storage.values, before);
  assert.equal(cloudSync.getState().error, 'Current status during fingerprint');
});

for (const [name, remote] of [
  ['malformed-data', { data: {}, updated_at: '2030-01-01T00:00:00Z' }],
  ['invalid-version', { data: makeData('Remote'), updated_at: 'invalid-date' }],
] as const) test(`a ${name} SELECT pauses upload without choosing a winner`, async () => {
  const f = fixture(); f.hooks.read = () => ({ data: remote, error: null });
  const before = new Map(storage.values);
  assert.equal(await cloudSync.push(savedData()), false);
  assert.deepEqual(f.mutations, []); assert.deepEqual(storage.values, before); assert.ok(cloudSync.getState().error);
});

test('successful upload acknowledges the actual returned server version rather than the attempted client timestamp', async () => {
  const f = fixture(); const serverVersion = '2041-01-01T00:00:00.000987+00:00';
  f.hooks.write = mutation => {
    const represented = { ...clone(mutation.row), updated_at: serverVersion };
    f.rows.set('A', represented);
    return { data: [represented], error: null };
  };
  assert.equal(await cloudSync.push(savedData()), true);
  assert.notEqual(f.mutations[0].row.updated_at, serverVersion);
  assert.equal(owner().remoteVersion, serverVersion); assert.equal(storage.getItem(accountKey()), serverVersion);
  assert.equal(owner().remoteFingerprint, fingerprint(f.rows.get('A')!.data));
});

test('a rejected reviewed restore cannot establish cloud acknowledgement', async () => {
  const f = fixture(row()); const reviewed = await forReview(savedData()); assert.ok(reviewed);
  const newer = savedData(); newer.profile.displayName = 'New text written while preview was open'; storeData(newer);
  const before = new Map(storage.values);
  assert.equal(await new LocalDemoRepository().replaceAll(reviewed, raw => cloudSync.canApplyRemote(reviewed, raw)), false);
  await cloudSync.markRemoteApplied(reviewed);
  assert.deepEqual(storage.values, before); assertNoAcknowledgement();
  assert.equal(await cloudSync.push(savedData()), false); assert.deepEqual(f.mutations, []);
});

for (const version of ['2040-01-01T00:00:00.999999Z', '2040-01-01T00:00:00.000001+00:00']) test(`a regressed clock advances the conditional write beyond remote microseconds ${version}`, async context => {
  const f = fixture(row('Future remote', version)); await acceptCloud(f);
  context.mock.method(Date, 'now', () => Date.parse('2020-01-01T00:00:00Z'));
  assert.equal(await cloudSync.push(savedData()), true);
  assert.equal(f.mutations[0].kind, 'update');
  // JavaScript loses microseconds. One millisecond beyond its truncated parse
  // must still be strictly later than the server's fractional timestamp.
  assert.ok(Date.parse(f.mutations[0].row.updated_at) >= Date.parse(version) + 1);
  assert.equal(owner().remoteVersion, f.rows.get('A')!.updated_at);
});

test('a valid returned document differing from the sent snapshot cannot establish upload permission', async () => {
  const f = fixture(); cloudSync.markLocalRestore(); const token = storage.getItem(importKey());
  const raw = storage.getItem(APP_DATA_STORAGE_KEY);
  f.hooks.write = mutation => {
    const represented = { ...clone(mutation.row), data: makeData('Unexpected valid server work') };
    f.rows.set('A', represented);
    return { data: [represented], error: null };
  };
  assert.equal(await cloudSync.push(savedData()), false);
  assert.equal(owner(), null); assert.equal(storage.getItem(importKey()), token); assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), raw);
  f.hooks.write = undefined;
  assert.equal(await cloudSync.push(savedData()), false);
  assert.equal(f.mutations.length, 1, 'unexpected represented content stays unacknowledged on retry');
  assert.equal(f.rows.get('A')!.data.profile.displayName, 'Unexpected valid server work');
});

test('a represented conditional write that fails to advance its version cannot be acknowledged', async () => {
  const remote = row(); const f = fixture(remote); await acceptCloud(f); const acknowledged = clone(owner());
  const edited = savedData(); edited.profile.displayName = 'A newer device edit'; storeData(edited);
  f.hooks.write = mutation => {
    const represented = { ...clone(mutation.row), updated_at: remote.updated_at };
    f.rows.set('A', represented); return { data: [represented], error: null };
  };
  assert.equal(await cloudSync.push(savedData()), false);
  assert.deepEqual(owner(), { ...acknowledged, updatedAt: null }); assert.ok(cloudSync.getState().error);
  assert.equal(cloudSync.getState().currentDocumentConfirmed, false);
  assert.equal(cloudSync.getState().lastSuccessfulSyncAt, acknowledged.remoteVersion);
});

test('an absent-row insert is not attempted when payload hashing is unavailable', async () => {
  const f = fixture(); cloudSync.markLocalRestore(); const token = storage.getItem(importKey());
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { subtle: { digest: async () => { throw new Error('Synthetic digest unavailable'); } } } });
  assert.equal(await cloudSync.push(savedData()), false);
  assert.deepEqual(f.mutations, []); assert.equal(f.rows.size, 0); assert.equal(storage.getItem(importKey()), token); assertNoAcknowledgement();
});

test('another owner recorded during hashing invalidates an earlier acknowledgement without changing device bytes', async () => {
  const f = fixture(row()); await acceptCloud(f);
  const digest = deferred<void>(); const started = deferred<void>();
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: {
    subtle: { digest: async (algorithm: AlgorithmIdentifier, value: BufferSource) => {
      started.resolve(); await digest.promise; return webcrypto.subtle.digest(algorithm, value as NodeJS.ArrayBufferView);
    } },
  } });
  const pending = cloudSync.push(savedData()); await started.promise;
  storage.setItem(OWNER_KEY, JSON.stringify({ ...owner(), key: accountKey('B') }));
  internal.error = 'New owner status'; const before = new Map(storage.values);
  digest.resolve(); assert.equal(await pending, false);
  assert.deepEqual(f.mutations, []); assert.deepEqual(storage.values, before); assert.equal(cloudSync.getState().error, 'New owner status');
});

test('another owner recorded during an upload response cannot be overwritten by its late acknowledgement', async () => {
  const f = fixture(); cloudSync.markLocalRestore(); const token = storage.getItem(importKey());
  const release = deferred<void>(); const started = deferred<void>();
  f.hooks.afterWrite = async () => { started.resolve(); await release.promise; };
  const pending = cloudSync.push(savedData()); await started.promise;
  const newerOwner = JSON.stringify({ key: accountKey('B'), epoch: null, updatedAt: null, remoteVersion: '2030-01-01T00:00:00Z', remoteFingerprint: '0'.repeat(64) });
  storage.setItem(OWNER_KEY, newerOwner); internal.error = 'New owner status';
  release.resolve(); assert.equal(await pending, false);
  assert.equal(storage.getItem(OWNER_KEY), newerOwner); assert.equal(storage.getItem(importKey()), token); assert.equal(storage.getItem(accountKey()), null);
  assert.equal(cloudSync.getState().error, 'New owner status');
});

test('an acknowledgement storage-read failure after durable restore returns false and preserves the restored record', async context => {
  const f = fixture(row()); const reviewed = await forReview(savedData()); assert.ok(reviewed);
  assert.equal(await new LocalDemoRepository().replaceAll(reviewed, raw => cloudSync.canApplyRemote(reviewed, raw)), true);
  const committed = storage.getItem(APP_DATA_STORAGE_KEY);
  const originalGet = storage.getItem.bind(storage);
  context.mock.method(storage, 'getItem', key => {
    if (key === APP_DATA_STORAGE_KEY) throw new Error('Synthetic postcommit read failure');
    return originalGet(key);
  });
  assert.equal(await cloudSync.markRemoteApplied(reviewed), false);
  assert.equal(originalGet(APP_DATA_STORAGE_KEY), committed); assert.equal(originalGet(OWNER_KEY), null);
  assert.ok(cloudSync.getState().error);
});

test('a rejected SELECT after a newer local save cannot replace that newer status', async () => {
  const f = fixture(row()); const release = deferred<void>(); const started = deferred<void>();
  f.hooks.read = async () => { started.resolve(); await release.promise; throw new Error('Synthetic old SELECT rejection'); };
  const pending = cloudSync.push(savedData()); await started.promise;
  const edited = savedData(); edited.profile.displayName = 'Newer writing'; storeData(edited); internal.error = 'Newer device status';
  const before = new Map(storage.values); release.resolve(); assert.equal(await pending, false);
  assert.deepEqual(f.mutations, []); assert.deepEqual(storage.values, before); assert.equal(cloudSync.getState().error, 'Newer device status');
});

test('a manual preview stays paused without acknowledging cloud work until an accepted commit', async () => {
  const remote = row(); const f = fixture(remote); const raw = storage.getItem(APP_DATA_STORAGE_KEY)!;
  const reviewed = await forReview(savedData()); assert.ok(reviewed);
  assert.ok(cloudSync.getState().error?.includes('paused')); assertNoAcknowledgement();
  // Cancelling the user review performs no commit or acknowledgement.
  assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), raw); assert.deepEqual(f.rows.get('A'), remote); assert.deepEqual(f.mutations, []);
  assert.equal(await cloudSync.push(savedData()), false); assertHeld(f, raw, remote);
});

for (const advance of [-1000, 0, 1000]) test(`manual review exposes unacknowledged/changed cloud at ${advance}ms while default startup policy remains unchanged`, async () => {
  const f = fixture(row()); await acceptCloud(f);
  const previous = clone(owner());
  const changed = row('Cloud content requiring review', new Date(Date.parse(previous.remoteVersion) + advance).toISOString());
  f.rows.set('A', changed);
  const raw = storage.getItem(APP_DATA_STORAGE_KEY)!;
  assert.equal(await cloudSync.pullIfNewer(savedData()), null, 'default startup retains its existing timestamp policy');
  assert.ok(await forReview(savedData()), 'manual review must not leave a held user stranded by timestamp tolerance');
  assert.equal(storage.getItem(APP_DATA_STORAGE_KEY), raw); assert.deepEqual(owner(), previous); assert.deepEqual(f.mutations, []);
});

test('known limitation: a legacy same-version mutation after SELECT can pass timestamp-only CAS', async () => {
  const f = fixture(row()); await acceptCloud(f);
  let legacyMutationObserved = false;
  f.hooks.beforeWrite = () => {
    const legacy = clone(f.rows.get('A')!); legacy.data.profile.displayName = 'Legacy write retaining the selected timestamp';
    f.rows.set('A', legacy); legacyMutationObserved = true;
  };
  assert.equal(await cloudSync.push(savedData()), true);
  assert.equal(legacyMutationObserved, true);
  assert.notEqual(f.rows.get('A')!.data.profile.displayName, 'Legacy write retaining the selected timestamp');
  assert.equal(f.mutations[0].kind, 'update');
  assert.equal(fetchCalls, 0);
});
