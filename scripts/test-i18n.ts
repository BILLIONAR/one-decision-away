import assert from 'node:assert/strict';
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
} });
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { language: 'tr-TR', languages: ['tr-TR', 'es-ES'] } });
const { LOCALES, DEFAULT_LOCALE, detectLocale, isLocale, setLocale, ensureLocaleLoaded, getLocale, t } = await import('../src/i18n/index');
const { getInitialDemoState } = await import('../src/services/repository');
assert.equal(DEFAULT_LOCALE, 'en');
assert.equal(getLocale(), 'en', 'a fresh Turkish/Spanish browser starts in English');
assert.equal(getInitialDemoState().profile.locale, 'en', 'seed profile must not switch startup back to the browser language');

assert.deepEqual(LOCALES.map(locale => locale.code), ['en', 'tr', 'es']);
for (const unsupported of ['de', 'fr', 'it', 'ru', '', null]) assert.equal(isLocale(unsupported), false);
try {
  for (const [language, expected] of [['en-US', 'en'], ['tr-TR', 'tr'], ['es-ES', 'es'], ['de-DE', 'en'], ['ru-RU', 'en']]) {
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { language, languages: [language] } });
    assert.equal(detectLocale(), expected);
  }
} finally {
  if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
  else Reflect.deleteProperty(globalThis, 'navigator');
}
for (const [locale, expected] of [['en', 'Two Futures'], ['tr', 'İki Gelecek'], ['es', 'Dos Futuros']] as const) {
  setLocale(locale);
  await ensureLocaleLoaded(locale);
  assert.equal(getLocale(), locale);
  assert.equal(values.get('oda_locale'), locale);
  assert.equal(getInitialDemoState().profile.locale, locale, 'new profiles respect an explicit device choice');
  assert.equal(t('Two Futures'), expected);
  assert.equal(t('Unrecognized user-written journal content'), 'Unrecognized user-written journal content');
  const message = t('🔥 {n}-day active streak! Completed across {n} consecutive calendar days.', { n: 17 });
  assert.equal((message.match(/17/g) || []).length, 2);
  assert.equal(message.includes('{n}'), false);
}
setLocale('en');
assert.equal(t('Settings'), 'Settings');
console.log('English-first startup, saved choices, EN/TR/ES switching, fallback and repeated placeholders passed.');
