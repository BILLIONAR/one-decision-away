/**
 * The thin layer between ODA and the iPhone app shell (Capacitor). Everything
 * here is a no-op on the web, so the same build logic serves both.
 */
import { Capacitor } from '@capacitor/core';

export const isNative = (): boolean => Capacitor.isNativePlatform();
export const nativePlatform = (): string => Capacitor.getPlatform();

/** Only a foreground transition should refresh permissions, dates and reminders. */
export function watchNativeResume(onResume: () => void): () => void {
  if (!isNative()) return () => undefined;
  let disposed = false;
  let remove: (() => Promise<void>) | undefined;
  void import('@capacitor/app').then(async ({ App }) => {
    const handle = await App.addListener('appStateChange', ({ isActive }) => {
      if (isActive && !disposed) onResume();
    });
    if (disposed) await handle.remove();
    else remove = () => handle.remove();
  }).catch(() => { /* The browser build and older shells remain usable. */ });
  return () => { disposed = true; void remove?.().catch(() => {}); };
}

type HapticKind = 'tap' | 'select' | 'success' | 'warning';

/** Light, meaningful haptics: a tap for choices, a success pulse for kept decisions. */
export async function haptic(kind: HapticKind = 'tap'): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    if (kind === 'success') await Haptics.notification({ type: NotificationType.Success });
    else if (kind === 'warning') await Haptics.notification({ type: NotificationType.Warning });
    else if (kind === 'select') await Haptics.selectionChanged();
    else await Haptics.impact({ style: ImpactStyle.Light });
  } catch { /* haptics are a nicety */ }
}

/** Status bar text follows the resolved theme (dark text on paper, light on night). */
export async function syncStatusBar(theme: 'light' | 'dark'): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
  } catch { /* older shells */ }
}

/** Called once the first screen has rendered, so the splash fades straight into the app. */
export async function nativeReady(): Promise<void> {
  if (!isNative()) return;
  document.documentElement.classList.add('oda-native');
  // Waiting for window.load can keep the splash over an otherwise usable app
  // while a remote image or font is slow. Give React a chance to paint instead.
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    await SplashScreen.hide({ fadeOutDuration: reducedMotion ? 0 : 250 });
  } catch { /* no splash plugin */ }
}

/** Opens an Apple-hosted page (subscriptions, App Store review) outside the app. */
export function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener');
}
