/**
 * The thin layer between ODA and the iPhone app shell (Capacitor). Everything
 * here is a no-op on the web, so the same build logic serves both.
 */
import { Capacitor } from '@capacitor/core';

export const isNative = (): boolean => Capacitor.isNativePlatform();
export const nativePlatform = (): string => Capacitor.getPlatform();

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
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide({ fadeOutDuration: 250 });
  } catch { /* no splash plugin */ }
}

/** Opens an Apple-hosted page (subscriptions, App Store review) outside the app. */
export function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener');
}
