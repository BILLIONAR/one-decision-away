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
  for (let day = 0; day < input.days; day++) {
    for (const [slot, time] of input.slotsFor(day)) {
      const [h, m] = time.split(':').map(n => parseInt(n, 10));
      if (!Number.isFinite(h) || !Number.isFinite(m)) continue;
      const at = new Date(input.now.getFullYear(), input.now.getMonth(), input.now.getDate() + day, h, m, 0, 0);
      if (at.getTime() <= input.now.getTime() + 30_000) continue;
      out.push({ id: reminderId(day, input.slotIndex(slot)), at, ...input.textFor(slot, day) });
    }
  }
  return out;
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
export async function replaceNativeReminders(reminders: NativeReminder[]): Promise<void> {
  try {
    const ln = await plugin();
    const { notifications } = await ln.getPending();
    const ours = notifications.filter(n => n.id >= REMINDER_ID_BASE && n.id < REMINDER_ID_BASE + 100).map(n => ({ id: n.id }));
    if (ours.length) await ln.cancel({ notifications: ours });
    if (!reminders.length) return;
    await ln.schedule({
      notifications: reminders.map(r => ({ id: r.id, title: r.title, body: r.body, schedule: { at: r.at, allowWhileIdle: true }, extra: { route: '/app' } })),
    });
  } catch { /* permission revoked or plugin missing: nothing to schedule */ }
}
