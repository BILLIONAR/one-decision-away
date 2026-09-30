/**
 * Daily reminders in the iPhone app. The web scheduler checks every minute
 * while a tab is open; an app that is closed cannot, so here the next seven
 * days are scheduled ahead with iOS local notifications and rescheduled
 * whenever today's decision or the reminder settings change. Nothing leaves
 * the device.
 */
import type { NudgeSlot } from '../data/dailyNudges';

export type NativeReminder = { id: number; at: Date; title: string; body: string };
export type NativePermission = 'granted' | 'denied' | 'default';

/** ids 7100–7199 belong to ODA reminders: day offset × 10 + slot index. */
export const REMINDER_ID_BASE = 7100;
/** Separate from planned daily reminders so preview cannot overwrite them. */
export const REMINDER_PREVIEW_ID = 7200;
export const reminderId = (dayOffset: number, slotIndex: number) => REMINDER_ID_BASE + dayOffset * 10 + slotIndex;

/** Pure planner, tested without a device: which reminders to schedule from `now`. */
export function planReminders(input: {
  now: Date;
  days: number;
  slotsFor: (dayOffset: number) => [NudgeSlot, string][];
  slotIndex: (slot: NudgeSlot) => number;
  textFor: (slot: NudgeSlot, dayOffset: number) => { title: string; body: string };
}): NativeReminder[] {
  const out: NativeReminder[] = [];
  if (!Number.isFinite(input.now.getTime())) return out;
  // The reserved namespace supports ten days; ODA intentionally plans a week.
  const days = Number.isFinite(input.days) ? Math.max(0, Math.min(7, Math.floor(input.days))) : 0;
  for (let day = 0; day < days; day++) {
    for (const [slot, time] of input.slotsFor(day)) {
      if (!/^\d{2}:\d{2}$/.test(time)) continue;
      const [h, m] = time.split(':').map(n => parseInt(n, 10));
      if (!Number.isFinite(h) || !Number.isFinite(m) || h > 23 || m > 59) continue;
      const index = input.slotIndex(slot);
      if (!Number.isInteger(index) || index < 0 || index > 9) continue;
      const at = new Date(input.now.getFullYear(), input.now.getMonth(), input.now.getDate() + day, h, m, 0, 0);
      if (at.getTime() <= input.now.getTime() + 30_000) continue;
      out.push({ id: reminderId(day, index), at, ...input.textFor(slot, day) });
    }
  }
  return out;
}

/** Explicit user-triggered preview; does not replace their seven-day schedule. */
export async function showNativeReminderPreview(text: { title: string; body: string }): Promise<void> {
  try {
    const ln = await plugin();
    await ln.schedule({ notifications: [{ id: REMINDER_PREVIEW_ID, ...text, schedule: { at: new Date(Date.now() + 1500) }, extra: { route: '/app' } }] });
  } catch { /* Permission can be revoked between checking and scheduling. */ }
}

async function plugin() {
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  return LocalNotifications;
}

export async function nativePermission(): Promise<NativePermission> {
  try {
    const { display } = await (await plugin()).checkPermissions();
    return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'default';
  } catch { return 'default'; }
}

export async function requestNativePermission(): Promise<NativePermission> {
  try {
    const { display } = await (await plugin()).requestPermissions();
    return display === 'granted' ? 'granted' : display === 'denied' ? 'denied' : 'default';
  } catch { return 'denied'; }
}

/** Replaces every pending ODA reminder with `reminders` (an empty list clears them). */
export function createReminderReplacer(getPlugin: typeof plugin): (reminders: NativeReminder[]) => Promise<void> {
  let pending = Promise.resolve();
  return (reminders: NativeReminder[]) => {
    // Preference and decision changes can overlap while native calls are in
    // flight. Serialize replacements so the newest state always wins last.
    const snapshot = reminders.map(reminder => ({ ...reminder, at: new Date(reminder.at) }));
    pending = pending.then(async () => {
      try {
        const ln = await getPlugin();
        const { notifications } = await ln.getPending();
        const ours = notifications.filter(n => n.id >= REMINDER_ID_BASE && n.id < REMINDER_ID_BASE + 100).map(n => ({ id: n.id }));
        if (ours.length) await ln.cancel({ notifications: ours });
        if (!snapshot.length) return;
        await ln.schedule({
          notifications: snapshot.map(r => ({ id: r.id, title: r.title, body: r.body, schedule: { at: r.at, allowWhileIdle: true }, extra: { route: '/app' } })),
        });
      } catch { /* permission revoked or plugin missing: nothing to schedule */ }
    });
    return pending;
  };
}

export const replaceNativeReminders = createReminderReplacer(plugin);
