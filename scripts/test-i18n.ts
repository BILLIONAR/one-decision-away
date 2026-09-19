import assert from 'node:assert/strict';
import { LOCALES, detectLocale, isLocale, setLocale, ensureLocaleLoaded, getLocale, t } from '../src/i18n/index';

assert.deepEqual(LOCALES.map(locale => locale.code), ['en', 'tr', 'es']);
for (const unsupported of ['de', 'fr', 'it', 'ru', '', null]) assert.equal(isLocale(unsupported), false);
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
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
  assert.equal(t('Two Futures'), expected);
  assert.equal(t('Unrecognized user-written journal content'), 'Unrecognized user-written journal content');
  const message = t('🔥 {n}-day active streak! Completed across {n} consecutive calendar days.', { n: 17 });
  assert.equal((message.match(/17/g) || []).length, 2);
  assert.equal(message.includes('{n}'), false);
}
setLocale('en');
assert.equal(t('Settings'), 'Settings');
console.log('EN/TR/ES runtime loading, switching, fallback and repeated placeholders passed.');
