/**
 * One Decision Away — i18n core
 *
 * Gettext-style: the English source string IS the key.
 *   t('Set One Decision')                      → translated string (falls back to English)
 *   t('~{n} days at your pace', { n: 3 })      → interpolated
 *
 * Dictionaries live in ./locales/<code>.ts and map English → target language.
 * Use `useT()` inside React components (re-renders on locale change) and the
 * plain `t()` export in non-React code (services, utils, data helpers).
 */
import { useMemo, useSyncExternalStore } from 'react';

export type Locale = 'en' | 'tr' | 'es' | 'de' | 'fr' | 'it' | 'ru';

export const LOCALES: { code: Locale; name: string; nativeName: string; flag: string; speech: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', speech: 'en-US' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', speech: 'tr-TR' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', speech: 'es-ES' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', speech: 'de-DE' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', speech: 'fr-FR' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', speech: 'it-IT' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', speech: 'ru-RU' },
];

export const LOCALE_CODES = LOCALES.map((l) => l.code);

const STORAGE_KEY = 'oda_locale';

type Dictionary = Record<string, string>;

const dictionaries: Partial<Record<Locale, Dictionary>> = {};
const loading: Partial<Record<Locale, Promise<Dictionary>>> = {};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALE_CODES as string[]).includes(value);
}

/** Best guess from the browser on first run. */
export function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const candidates = [...(navigator.languages || []), navigator.language].filter(Boolean);
  for (const lang of candidates) {
    const short = lang.toLowerCase().slice(0, 2);
    if (isLocale(short)) return short;
  }
  return 'en';
}

function readStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLocale(v) ? v : null;
  } catch {
    return null;
  }
}

export function hasStoredLocale(): boolean {
  return readStoredLocale() !== null;
}

let currentLocale: Locale = readStoredLocale() ?? detectLocale();
let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  listeners.forEach((l) => l());
}

async function loadDictionary(locale: Locale): Promise<Dictionary> {
  if (locale === 'en') return {};
  if (dictionaries[locale]) return dictionaries[locale]!;
  if (!loading[locale]) {
    loading[locale] = import(`./locales/${locale}.ts`)
      .then((m) => {
        const dict: Dictionary = m.default ?? m[locale] ?? {};
        dictionaries[locale] = dict;
        emit();
        return dict;
      })
      .catch((err) => {
        console.warn(`[i18n] could not load dictionary for ${locale}`, err);
        dictionaries[locale] = {};
        return {};
      });
  }
  return loading[locale]!;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function getLocaleMeta(locale: Locale = currentLocale) {
  return LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
}

/** BCP-47 tag for speech synthesis / Intl. */
export function getSpeechLang(locale: Locale = currentLocale): string {
  return getLocaleMeta(locale).speech;
}

export function setLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  currentLocale = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  if (typeof document !== 'undefined') document.documentElement.lang = locale;
  emit();
  void loadDictionary(locale);
}

/** Resolves once the dictionary for the current locale is in memory. */
export function ensureLocaleLoaded(locale: Locale = currentLocale): Promise<void> {
  return loadDictionary(locale).then(() => undefined);
}

export function isLocaleReady(locale: Locale = currentLocale): boolean {
  return locale === 'en' || !!dictionaries[locale];
}

export type TParams = Record<string, string | number>;

function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in params ? String(params[key]) : match));
}

/**
 * Translate an English source string into the active locale.
 * Unknown keys fall back to the English source, so the app never breaks.
 */
export function t(source: string, params?: TParams): string {
  const dict = currentLocale === 'en' ? undefined : dictionaries[currentLocale];
  const translated = dict?.[source] ?? source;
  return interpolate(translated, params);
}

export type TFunction = typeof t;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return version;
}

/**
 * React hook. Returns a `t` bound to the current locale and re-renders the
 * component when the locale (or its dictionary) changes.
 */
export function useT(): TFunction {
  const v = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  // New function identity per locale/dictionary version so memo deps on `t` recompute.
  return useMemo<TFunction>(() => (source, params) => t(source, params), [v]);
}

export function useLocale(): [Locale, (l: Locale) => void] {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return [currentLocale, setLocale];
}

/** Locale-aware number formatting (Dream Dollars etc.). */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  try {
    return new Intl.NumberFormat(getSpeechLang(), options).format(value);
  } catch {
    return String(value);
  }
}

/** Locale-aware date formatting. */
export function formatDate(value: string | number | Date, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  try {
    return new Intl.DateTimeFormat(getSpeechLang(), options).format(new Date(value));
  } catch {
    return String(value);
  }
}

// Initial load
if (typeof document !== 'undefined') document.documentElement.lang = currentLocale;
void loadDictionary(currentLocale);

/**
 * Marks a string in static data (seed missions, catalog items, meditation cues…)
 * as translatable WITHOUT translating it at definition time. Returns the source
 * unchanged; the consumer renders it through `t(value)`. The extraction script
 * collects `N_('…')` calls the same way as `t('…')`.
 */
export const N_ = (source: string): string => source;
