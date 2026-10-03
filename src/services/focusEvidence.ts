import type { MissionCompletion } from '../types/models';

const DAY_MS = 86_400_000;
const utcDay = (time: number) => new Date(time).toISOString().slice(0, 10);

/** Timer completions are evidence; self/photo estimates and active timers are not. */
export function timerFocusEvidence(completions: MissionCompletion[], now = new Date()) {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const unique = new Map<string, MissionCompletion>();
  for (const record of completions) {
    const time = Date.parse(record.completedAt);
    if (record.method !== 'timer' || !Number.isFinite(record.focusMinutes) || record.focusMinutes! <= 0
      || !Number.isFinite(time) || time > now.getTime()) continue;
    const previous = unique.get(record.id);
    if (!previous || time < Date.parse(previous.completedAt)) unique.set(record.id, record);
  }
  const minutesByDay = new Map<string, number>();
  const events = new Set<string>();
  for (const record of unique.values()) {
    const time = Date.parse(record.completedAt);
    // A repeatable quest can have many genuine completions. Only a repeated
    // completion ID or the exact same recorded event is a duplicate.
    const event = JSON.stringify([record.userId, record.missionId, time]);
    if (events.has(event)) continue;
    events.add(event);
    const day = utcDay(time);
    minutesByDay.set(day, (minutesByDay.get(day) ?? 0) + record.focusMinutes!);
  }
  // Yesterday's chain remains current until today has ended, without grace days.
  let cursor = minutesByDay.has(utcDay(end)) ? end : end - DAY_MS;
  let streak = 0;
  while (minutesByDay.has(utcDay(cursor))) { streak++; cursor -= DAY_MS; }
  const days = Array.from({ length: 7 }, (_, index) => {
    const dayKey = utcDay(end - (6 - index) * DAY_MS);
    return { dayKey, minutes: minutesByDay.get(dayKey) ?? 0 };
  });
  return { streak, days, todayMinutes: minutesByDay.get(utcDay(end)) ?? 0 };
}
