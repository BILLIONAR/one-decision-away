import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../../../public/sw.js', import.meta.url), 'utf8');

function setup() {
  const listeners = new Map<string, (event: unknown) => void>();
  const shown: { title: string; options: Record<string, unknown> }[] = [];
  const self = {
    registration: { scope: 'https://example.github.io/one-decision-away/', showNotification: async (title: string, options: Record<string, unknown>) => { shown.push({ title, options }); } },
    addEventListener: (type: string, handler: (event: unknown) => void) => listeners.set(type, handler),
  };
  vm.runInNewContext(source, { self, URL });
  return { shown, async push(data: unknown) {
    let completion: Promise<unknown>;
    listeners.get('push')!({ data: { json: () => data }, waitUntil: (promise: Promise<unknown>) => { completion = promise; } });
    await completion!;
  } };
}

test('push event displays the real server payload without an open client', async () => {
  const { shown, push } = setup();
  await push({ title: 'ODA · Sabahın sözü', body: 'Şimdi küçük bir adım at.\n— Kaynak · yorumlama', tag: 'oda-nudge-morning', url: '/app' });
  assert.equal(shown[0].title, 'ODA · Sabahın sözü');
  assert.equal(shown[0].options.body, 'Şimdi küçük bir adım at.\n— Kaynak · yorumlama');
  assert.equal(shown[0].options.icon, 'https://example.github.io/one-decision-away/brand/v3/oda-app-v3-192.png');
  assert.equal(shown[0].options.tag, 'oda-nudge-morning');
});

test('unexpected push fields cannot become arbitrary notification options', async () => {
  const { shown, push } = setup();
  await push({ title: {}, body: null, icon: 'https://outside.example/tracker.png', vibrate: [999], actions: [{ action: 'evil' }] });
  assert.equal(shown[0].title, 'ODA');
  assert.equal(shown[0].options.icon, 'https://example.github.io/one-decision-away/brand/v3/oda-app-v3-192.png');
  assert.equal(shown[0].options.actions, undefined);
  assert.equal(shown[0].options.vibrate, undefined);
});
