import { appRouteHref, publicAssetPath } from '../utils/routing';
/**
 * Local notification scheduler for daily nudges.
 * Runs while the app (or its installed PWA) is open — including background tabs.
 * True server push (app fully closed) needs a Web Push backend; see README notes.
 */
import { NudgeSlot, NUDGE_SLOTS, DEFAULT_NUDGE_TIMES, NUDGE_TITLES, getNudgeLine, normaliseNudgeTimes } from '../data/dailyNudges';
import { t } from '../i18n';
import { isPushActive } from './pushNotifications';
import { voiceLine } from '../data/odaVoice';
import { isNative, watchNativeResume } from './native';
import { nativePermission, planReminders, replaceNativeReminders, requestNativePermission, showNativeReminderPreview, type NativePermission } from './nativeNotifications';

const FIRED_KEY = 'oda_nudges_fired';
const CATCH_UP_MINUTES = 90;

export interface NudgePrefs {
  enabled: boolean;
  times: Record<NudgeSlot, string>; // HH:MM local
  /**
   * Smart mode: at most two reminders a day, and only when useful — a morning
   * nudge to choose (skipped once a decision exists) and one follow-through
   * about 30 minutes before the member usually keeps their decision (skipped
   * once it is kept). Mirrors Duolingo's behaviour-timed, capped reminders.
   */
  smart?: { followUp: string | null };
}

/** Slots where an open decision is worth more than a quote: nudge action, not inspiration. */
const FOLLOW_THROUGH_SLOTS: NudgeSlot[] = ['afternoon', 'evening'];
const CHOOSE_SLOTS: NudgeSlot[] = ['lateMorning', 'midday'];

class NotificationScheduler {
  private timer: number | null = null;
  private decision: { title: string | null; done: boolean } = { title: null, done: false };
  private prefs: NudgePrefs = { enabled: false, times: { ...DEFAULT_NUDGE_TIMES } };
  private onVisible = () => { if (document.visibilityState === 'visible') this.tick(); };
  /** iPhone app: cached permission and a debounced reschedule of the week ahead. */
  private nativePerm: NativePermission = 'default';
  private nativeTimer: number | null = null;

  constructor() {
    if (isNative()) {
      void this.refreshNativePermission();
      // Returning from Settings may change notification permission; reopening
      // after a few days also needs a new seven-day schedule.
      const stopResume = watchNativeResume(() => { void this.refreshNativePermission(); });
      if (import.meta.hot) import.meta.hot.dispose(stopResume);
    }
  }

  private async refreshNativePermission() {
    this.nativePerm = await nativePermission();
    this.queueNativeSync();
  }

  private todayKey(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  public isSupported(): boolean {
    if (isNative()) return true;
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public permission(): NotificationPermission | 'unsupported' {
    if (isNative()) return this.nativePerm;
    return this.isSupported() ? Notification.permission : 'unsupported';
  }

  public async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (isNative()) {
      this.nativePerm = await requestNativePermission();
      this.queueNativeSync();
      return this.nativePerm;
    }
    if (!this.isSupported()) return 'unsupported';
    try {
      return await Notification.requestPermission();
    } catch {
      return Notification.permission;
    }
  }

  /** Today's One Decision, so reminders can point at the actual next step. */
  public setDecision(title: string | null, done: boolean) {
    const changed = this.decision.title !== title || this.decision.done !== done;
    this.decision = { title, done };
    if (changed) this.queueNativeSync();
  }

  private queueNativeSync() {
    if (!isNative()) return;
    if (this.nativeTimer) window.clearTimeout(this.nativeTimer);
    this.nativeTimer = window.setTimeout(() => { this.nativeTimer = null; void this.syncNative(); }, 400);
  }

  /** Today follows the live decision; the next six days use the plain plan. */
  private async syncNative() {
    if (!this.prefs.enabled || this.nativePerm !== 'granted') { await replaceNativeReminders([]); return; }
    const today = this.schedule();
    const later: [NudgeSlot, string][] = this.prefs.smart
      ? [['morning', this.prefs.times.morning || DEFAULT_NUDGE_TIMES.morning], ['evening', this.prefs.smart.followUp || this.prefs.times.evening || DEFAULT_NUDGE_TIMES.evening]]
      : NUDGE_SLOTS.map(slot => [slot, this.prefs.times[slot] || DEFAULT_NUDGE_TIMES[slot]]);
    const reminders = planReminders({
      now: new Date(),
      days: 7,
      slotsFor: day => (day === 0 ? today : later),
      slotIndex: slot => NUDGE_SLOTS.indexOf(slot),
      textFor: (slot, day) => ({
        title: t(NUDGE_TITLES[slot]),
        body: day === 0
          ? (this.actionLine(slot) || t(getNudgeLine(slot)))
          : (this.prefs.smart && slot === 'morning' ? t(voiceLine('choose')) : t(getNudgeLine(slot, new Date(Date.now() + day * 86_400_000)))),
      }),
    });
    await replaceNativeReminders(reminders);
  }

  private actionLine(slot: NudgeSlot): string | undefined {
    const { title, done } = this.decision;
    if (done) return undefined;
    if (title && FOLLOW_THROUGH_SLOTS.includes(slot)) {
      return t(voiceLine('followThrough'), { title: t(title) });
    }
    if (!title && (CHOOSE_SLOTS.includes(slot) || (this.prefs.smart && slot === 'morning'))) {
      return t(voiceLine('choose'));
    }
    return undefined;
  }

  /** Which slots fire today and when; smart mode keeps two and drops the ones with nothing to say. */
  private schedule(): [NudgeSlot, string][] {
    const times = this.prefs.times;
    if (!this.prefs.smart) return NUDGE_SLOTS.map(slot => [slot, times[slot] || DEFAULT_NUDGE_TIMES[slot]]);
    const { title, done } = this.decision;
    const plan: [NudgeSlot, string][] = [];
    if (!title) plan.push(['morning', times.morning || DEFAULT_NUDGE_TIMES.morning]);
    if (!done) plan.push(['evening', this.prefs.smart.followUp || times.evening || DEFAULT_NUDGE_TIMES.evening]);
    return plan;
  }

  public configure(prefs: NudgePrefs) {
    this.prefs = { enabled: prefs.enabled, times: normaliseNudgeTimes(prefs.times), smart: prefs.smart };
    this.start();
  }

  private start() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    if (isNative()) { this.queueNativeSync(); return; }
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
    this.schedule().forEach(([slot, time]) => {
      if (fired.has(slot)) return;
      const [h, m] = time.split(':').map((n) => parseInt(n, 10));
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
    // The preview uses the native plugin, never the browser-only Notification
    // global (which may not exist inside WKWebView).
    if (isNative()) {
      if (this.nativePerm !== 'granted') return;
      await showNativeReminderPreview({ title: t(NUDGE_TITLES[slot]), body: customBody || this.actionLine(slot) || t(getNudgeLine(slot)) });
      return;
    }
    if (!this.isSupported() || Notification.permission !== 'granted') return;
    const body = customBody || this.actionLine(slot) || t(getNudgeLine(slot));
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
