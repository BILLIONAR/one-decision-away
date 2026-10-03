import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Capacitor } from '@capacitor/core';
import { registerHooks } from 'node:module';
import { AppContext } from '../src/store/AppContext';
import { cloudSync, type CloudState } from '../src/services/cloudSync';
import { accountCopy } from '../src/i18n/account';
import { ensureLocaleLoaded, setLocale } from '../src/i18n';
import { getInitialDemoState } from '../src/services/repository';

// Node renders semantic markup here; the browser suite checks the real built CSS.
const css = registerHooks({ load(url, context, nextLoad) {
  if (url.endsWith('/components/momentum/EvidenceTree.tsx')) return { format: 'module', source: 'export const EvidenceTree = () => null;', shortCircuit: true };
  return url.endsWith('.css') ? { format: 'module', source: 'export {};', shortCircuit: true } : nextLoad(url, context);
} });
const { BackupAndCloudSettings } = await import('../src/components/BackupAndCloudSettings');
const { Account } = await import('../src/pages/Account');
css.deregister();

const cloud: CloudState = { configured: true, session: null, lastSyncAt: null, currentDocumentConfirmed: false, lastSuccessfulSyncAt: null, syncing: false, error: null, scopeRevision: 0 };
function render(component: React.FC, native: boolean, state = cloud) {
  const previous = { native: Capacitor.isNativePlatform, state: cloudSync.getState, config: cloudSync.getConfig };
  Capacitor.isNativePlatform = () => native;
  cloudSync.getState = () => state;
  cloudSync.getConfig = () => null;
  const value = { data: getInitialDemoState(), showToast() {}, setActiveRoute() {}, exportDataJson() {}, importDataJson() {}, syncFromCloud() {} } as unknown as React.ContextType<typeof AppContext>;
  try { return renderToStaticMarkup(React.createElement(AppContext.Provider, { value }, React.createElement(component))); }
  finally { Capacitor.isNativePlatform = previous.native; cloudSync.getState = previous.state; cloudSync.getConfig = previous.config; }
}

for (const locale of ['en', 'tr', 'es'] as const) {
  test(`native Settings and Account use the shared code flow with device copy in ${locale}`, async () => {
    setLocale(locale); await ensureLocaleLoaded(locale);
    const copy = accountCopy(locale);
    const settings = render(BackupAndCloudSettings, true);
    assert.ok(settings.includes(copy.continue)); assert.ok(settings.includes(copy.settingsHint));
    assert.doesNotMatch(settings, /id="cloud-email"/);
    const account = render(Account, true);
    assert.ok(account.includes(copy.back)); assert.ok(account.includes(copy.request));
    assert.ok(account.includes(copy.summary)); assert.ok(account.includes(copy.local));
    assert.doesNotMatch(account, /Email me a sign-in link|tap the link we email|only in this browser/);
    setLocale('en');
  });
}

test('web backup keeps its inline magic-link form and Account keeps link copy', () => {
  setLocale('en');
  const settings = render(BackupAndCloudSettings, false);
  assert.match(settings, /id="cloud-email"/); assert.match(settings, /Send link/); assert.match(settings, /magic link/);
  assert.doesNotMatch(settings, /Sign in with a code/);
  const account = render(Account, false);
  assert.match(account, /Email me a sign-in link/); assert.match(account, /tap the link we email/);
  assert.doesNotMatch(account, /Back to Settings|Email me a sign-in code/);
});

test('native configured signed-in backup retains sync and sign-out actions', () => {
  const state = { ...cloud, session: { user: { id: 'synthetic-existing', email: 'existing@example.test' } } } as CloudState;
  const html = render(BackupAndCloudSettings, true, state);
  assert.match(html, /existing@example.test/); assert.match(html, /Sync now/); assert.match(html, /Sign out/);
  assert.doesNotMatch(html, /Sign in with a code|id="cloud-email"/);
});

test('unconfigured native cloud does not offer a sign-in request', () => {
  const html = render(BackupAndCloudSettings, true, { ...cloud, configured: false });
  assert.match(html, /Not connected to a cloud project yet/);
  assert.doesNotMatch(html, /Sign in with a code|id="cloud-email"/);
});

test('actual cloud request and verification use one injected auth adapter and trim input', async () => {
  const Source = cloudSync.constructor as new () => typeof cloudSync;
  const source = new Source();
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { origin: 'http://localhost:4190' } } });
  const calls: unknown[] = [];
  const client = { auth: {
    signInWithOtp: async (input: unknown) => { calls.push(input); return { error: null }; },
    verifyOtp: async (input: unknown) => { calls.push(input); return { error: null }; },
  } };
  Object.assign(source, { config: { url: 'https://synthetic.invalid', anonKey: 'synthetic-public' }, client });
  try {
    assert.equal((await source.signInWithEmail('  existing@example.test  ')).ok, true);
    assert.equal((await source.verifyEmailCode('  existing@example.test ', ' 123456 ')).ok, true);
    assert.deepEqual(calls, [
      { email: 'existing@example.test', options: { emailRedirectTo: 'http://localhost:4190/' } },
      { email: 'existing@example.test', token: '123456', type: 'email' },
    ]);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow); else Reflect.deleteProperty(globalThis, 'window');
  }
});
