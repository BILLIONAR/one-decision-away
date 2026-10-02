import test from 'node:test';
import assert from 'node:assert/strict';
import { bindPurchaseIdentity, refreshPurchaseIdentity } from '../src/services/purchaseIdentityBinding';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(done => { resolve = done; });
  return { promise, resolve };
}
function fixture() {
  let id: string | null = null;
  let revision = 0;
  let ready = false;
  const listeners = new Set<() => void>();
  const hydrated = deferred<void>();
  const calls: Array<string | null> = [];
  const source = {
    init: () => hydrated.promise,
    isSessionReady: () => ready,
    getState: () => ({ session: id ? { user: { id } } : null, scopeRevision: revision }),
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  };
  const target = {
    deferIdentity: () => { calls.push('defer'); },
    identify: async (user: string | null) => { calls.push(user); },
    init: async () => { calls.push('init'); },
  };
  const emit = (user: string | null, isReady = true) => {
    if (id !== user) revision++;
    id = user; ready = isReady;
    listeners.forEach(listener => listener());
  };
  return { source, target, calls, hydrated, emit };
}

test('startup waits for restored account rather than temporarily identifying anonymous', async () => {
  const f = fixture(); const binding = bindPurchaseIdentity(f.source, f.target);
  assert.deepEqual(f.calls, ['defer']);
  f.emit('A', false); assert.ok(!f.calls.includes('A') && !f.calls.includes(null));
  f.emit('A'); f.hydrated.resolve(); await binding.ready;
  assert.ok(f.calls.indexOf('A') < f.calls.indexOf('init'));
  assert.ok(!f.calls.includes(null)); binding.dispose();
});

test('known sign-out and rapid identity changes are announced immediately, same-ID retry events remain usable', async () => {
  const f = fixture(); f.emit('A'); f.hydrated.resolve();
  const binding = bindPurchaseIdentity(f.source, f.target); await binding.ready;
  f.calls.length = 0;
  f.emit('B'); f.emit('B'); f.emit(null); f.emit('A');
  assert.deepEqual(f.calls, ['B', 'B', null, 'A']);
  binding.dispose(); f.emit('C'); assert.deepEqual(f.calls, ['B', 'B', null, 'A']);
});

test('failed authentication hydration stays unbound and never identifies anonymous or reads SDK entitlement', async () => {
  const f = fixture(); const binding = bindPurchaseIdentity(f.source, f.target);
  f.hydrated.resolve(); await binding.ready;
  assert.ok(f.calls.every(call => call === 'defer'));
  f.emit('A'); assert.equal(f.calls.at(-1), 'A');
  binding.dispose();
});

test('dispose during initial hydration prevents any late entitlement initialization', async () => {
  const f = fixture(); const binding = bindPurchaseIdentity(f.source, f.target);
  binding.dispose(); f.emit('A'); f.hydrated.resolve(); await binding.ready;
  assert.deepEqual(f.calls, ['defer']);
});

test('retry hydrates a currently unknown account before requesting identity or offerings', async () => {
  const f = fixture(); const pending = refreshPurchaseIdentity(f.source, f.target);
  assert.deepEqual(f.calls, ['defer']);
  f.emit('B'); f.hydrated.resolve(); await pending;
  assert.deepEqual(f.calls, ['defer', 'B', 'init']);
});

test('retry with failed hydration cannot bind anonymous or make a subscription request', async () => {
  const f = fixture(); f.hydrated.resolve();
  await refreshPurchaseIdentity(f.source, f.target);
  assert.deepEqual(f.calls, ['defer', 'defer']);
});

test('cloud initialization callers share the real restoration promise and never finish early', async () => {
  const { cloudSync } = await import('../src/services/cloudSync');
  const source = new (cloudSync.constructor as new () => typeof cloudSync)();
  const held = deferred<{ data: { session: { user: { id: string } } } }>();
  let reads = 0;
  const client = { auth: {
    getSession: () => { reads++; return held.promise; },
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  } };
  Object.assign(source, { config: { url: 'https://fixture.example', anonKey: 'synthetic-public-fixture' }, client });
  const first = source.init(); const second = source.init(); assert.equal(first, second);
  let finished = false; void second.then(() => { finished = true; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(reads, 1); assert.equal(finished, false); assert.equal(source.isSessionReady(), false);
  held.resolve({ data: { session: { user: { id: 'A' } } } }); await Promise.all([first, second]);
  assert.equal(source.isSessionReady(), true); assert.equal(source.getState().session?.user.id, 'A');
});

test('actual failed cloud restoration remains unknown and a later retry can establish the same account', async () => {
  const { cloudSync } = await import('../src/services/cloudSync');
  const source = new (cloudSync.constructor as new () => typeof cloudSync)();
  let reads = 0;
  const client = { auth: {
    getSession: async () => { if (++reads === 1) throw new Error('synthetic offline hydration'); return { data: { session: { user: { id: 'A' } } } }; },
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  } };
  Object.assign(source, { config: { url: 'https://fixture.example', anonKey: 'synthetic-public-fixture' }, client });
  const f = fixture(); const binding = bindPurchaseIdentity(source, f.target); await binding.ready;
  assert.equal(source.isSessionReady(), false); assert.equal(f.calls.filter(call => call !== 'defer').length, 0);
  await refreshPurchaseIdentity(source, f.target);
  assert.equal(reads, 2); assert.equal(source.isSessionReady(), true);
  assert.ok(f.calls.includes('A')); assert.ok(!f.calls.includes(null)); binding.dispose();
});

test('a resolved auth error is unknown identity rather than a verified anonymous account', async () => {
  const { cloudSync } = await import('../src/services/cloudSync');
  const source = new (cloudSync.constructor as new () => typeof cloudSync)();
  const client = { auth: {
    getSession: async () => ({ data: { session: null }, error: new Error('synthetic resolved auth error') }),
    onAuthStateChange: () => { throw new Error('must not subscribe an unverified session'); },
  } };
  Object.assign(source, { config: { url: 'https://fixture.example', anonKey: 'synthetic-public-fixture' }, client });
  const f = fixture(); const binding = bindPurchaseIdentity(source, f.target); await binding.ready;
  assert.equal(source.isSessionReady(), false);
  assert.equal(source.getState().error, 'synthetic resolved auth error');
  assert.ok(f.calls.every(call => call === 'defer'));
  binding.dispose();
});
