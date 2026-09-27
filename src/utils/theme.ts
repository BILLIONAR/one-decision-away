/**
 * Theme preference: 'system' follows the phone's light/dark setting; 'light'
 * and 'dark' pin it. Also keeps the browser/iOS status bar colour in step and
 * remembers the choice so index.html can apply it before React loads (no flash).
 */
export type ThemePref = 'light' | 'dark' | 'system';
export const THEME_KEY = 'oda_theme';
import { syncStatusBar } from '../services/native';

const BAR = { light: '#F6F4EE', dark: '#121513' } as const;

const media = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null);

export function resolveTheme(pref: ThemePref | undefined | null): 'light' | 'dark' {
  if (pref === 'light' || pref === 'dark') return pref;
  return media()?.matches ? 'dark' : 'light';
}

export function applyTheme(pref: ThemePref | undefined | null): 'light' | 'dark' {
  const resolved = resolveTheme(pref ?? 'light');
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', BAR[resolved]));
  try { localStorage.setItem(THEME_KEY, pref ?? 'light'); } catch { /* private mode */ }
  void syncStatusBar(resolved);
  return resolved;
}

/** Re-apply when the phone switches between light and dark (only matters for 'system'). */
export function watchSystemTheme(pref: ThemePref | undefined | null): () => void {
  const mq = media();
  if (!mq || pref !== 'system') return () => undefined;
  const onChange = () => applyTheme('system');
  mq.addEventListener?.('change', onChange);
  return () => mq.removeEventListener?.('change', onChange);
}
