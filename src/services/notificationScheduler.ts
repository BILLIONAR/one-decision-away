import { appRouteHref, publicAssetPath } from '../utils/routing';
/**
 * Local notification scheduler for daily nudges.
 * Runs while the app (or its installed PWA) is open — including background tabs.
 * True server push (app fully closed) needs a Web Push backend; see README notes.
 */
import { NudgeSlot, NUDGE_SLOTS, DEFAULT_NUDGE_TIMES, NUDGE_TITLES, getNudgeLine, normaliseNudgeTimes } from '../data/dailyNudges';
import { t } from '../i18n';
import { isPushActive } from './pushNotifications';

const FIRED_KEY = 'oda_nudges_fired';
const CATCH_UP_MINUTES = 90;

export interface NudgePrefs {
  enabled: boolean;
  times: Record<NudgeSlot, string>; // HH:MM local
}

class NotificationScheduler {
  private timer: number | null = null;
  private prefs: NudgePrefs = { enabled: false, times: { ...DEFAULT_NUDGE_TIMES } };
  private onVisible = () => { if (document.visibilityState === 'visible') this.tick(); };

  private todayKey(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public permission(): NotificationPermission | 'unsupported' {
    return this.isSupported() ? Notification.permission : 'unsupported';
  }

  public async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.isSupported()) return 'unsupported';
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  }

  public configure(prefs: NudgePrefs) {
    this.prefs = { enabled: prefs.enabled, times: normaliseNudgeTimes(prefs.times) };
    this.start();
  }

  private start() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    document.removeEventListener('visibilitychange', this.onVisible);
    if (!this.prefs.enabled || !this.isSupported()) return;
    this.tick();
    this.timer = window.setInterval(() => this.tick(), 60 * 1000);
    document.addEventListener('visibilitychange', this.onVisible);
  }

  private firedToday(): Set<string> {
    const today = this.todayKey();
    try {
      const raw = JSON.parse(localStorage.getItem(FIRED_KEY) || '{}');
      if (raw.date !== today) return new Set();
      return new Set<string>(raw.slots || []);
    } catch {
      return new Set();
    }
  }

  private markFired(slot: NudgeSlot) {
    const today = this.todayKey();
    const slots = [...this.firedToday(), slot];
    try {
      localStorage.setItem(FIRED_KEY, JSON.stringify({ date: today, slots }));
    } catch {
      /* ignore */
    }
  }

  private tick() {
    if (!this.prefs.enabled || Notification.permission !== 'granted' || isPushActive()) return;
    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const fired = this.firedToday();
    NUDGE_SLOTS.forEach((slot) => {
      if (fired.has(slot)) return;
      const [h, m] = (this.prefs.times[slot] || DEFAULT_NUDGE_TIMES[slot]).split(':').map((n) => parseInt(n, 10));
      const slotMinutes = h * 60 + m;
      // fire at the exact minute, or catch up if the app was opened shortly after
      if (minutesNow >= slotMinutes && minutesNow - slotMinutes <= CATCH_UP_MINUTES) {
        const deliver = () => {
          if (!this.prefs.enabled || isPushActive() || this.firedToday().has(slot)) return;
          this.markFired(slot);
          void this.show(slot);
        };
        // An open second tab must not send the same scheduled notification again.
        if (navigator.locks) void navigator.locks.request(`oda-nudge-${this.todayKey()}-${slot}`, { ifAvailable: true }, lock => { if (lock) deliver(); });
        else deliver();
      }
    });
  }

  public async show(slot: NudgeSlot, customBody?: string) {
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    const body = customBody || t(getNudgeLine(slot));
    const title = t(NUDGE_TITLES[slot]);
    const opts: NotificationOptions = {
      body,
      icon: publicAssetPath('brand/oda-app-c4-v1-192.png'),
      badge: publicAssetPath('brand/oda-app-c4-v1-192.png'),
      tag: `oda-nudge-${slot}`,
      data: { url: appRouteHref('/app') },
    };
    try {
      const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, opts);
        return;
      }
    } catch {
      /* fall through */
    }
    try {
      const n = new Notification(title, opts);
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch {
      /* ignore */
    }
  }
}

export const notificationScheduler = new NotificationScheduler();
