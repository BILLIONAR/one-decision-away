import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function worker(scope: string, keys: string[] = []) {
  const listeners = new Map<string, (event: any) => void>();
  const deleted: string[] = [];
  const installed: string[] = [];
  const opened: string[] = [];
  const cache = { addAll: async (urls: string[]) => { installed.push(...urls); } };
  vm.runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    URL, Response,
    self: {
      registration: { scope },
      addEventListener: (name: string, fn: (event: any) => void) => listeners.set(name, fn),
      skipWaiting: async () => {},
      clients: { claim: async () => {}, matchAll: async () => [], openWindow: async (url: string) => { opened.push(url); } },
    },
    caches: { keys: async () => keys, delete: async (key: string) => { deleted.push(key); }, open: async () => cache },
  });
  const dispatch = async (name: string, event: any = {}) => {
    const pending: Promise<unknown>[] = [];
    listeners.get(name)!({ ...event, waitUntil: (promise: Promise<unknown>) => pending.push(promise) });
    await Promise.all(pending);
  };
  return { dispatch, deleted, installed, opened };
}

test('service worker precaches only its project directory', async () => {
  const app = worker('https://example.github.io/repo/');
  await app.dispatch('install');
  assert.ok(app.installed.length > 0);
  assert.ok(app.installed.every(url => url.startsWith('https://example.github.io/repo/')));
  assert.ok(app.installed.includes('https://example.github.io/repo/index.html'));
});

test('activation preserves sibling apps and this version media cache', async () => {
  const app = worker('https://example.github.io/repo/', ['oda:%2Frepo%2F:v1', 'oda:%2Frepo%2F:v2', 'oda:%2Frepo%2F:v2:media', 'oda:%2Fother%2F:v1', 'another-app-cache']);
  await app.dispatch('activate');
  assert.deepEqual(app.deleted, ['oda:%2Frepo%2F:v1']);
});

test('notification defaults and legacy targets open the project hash route', async () => {
  const app = worker('https://example.github.io/repo/');
  await app.dispatch('notificationclick', { notification: { close() {}, data: {} } });
  await app.dispatch('notificationclick', { notification: { close() {}, data: { url: '/app/notebook' } } });
  assert.deepEqual(app.opened, ['https://example.github.io/repo/#/app', 'https://example.github.io/repo/#/app/notebook']);
});
