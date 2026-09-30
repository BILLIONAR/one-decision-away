import type { Mission, NotebookEntry, UserData } from '../types/models';
import { localDayKey } from './momentum';

export const DAILY_REFLECTION_PROMPT = 'oda-daily-reflection-v1';

function dayOf(instant?: string): string | null {
  if (!instant) return null;
  const date = new Date(instant);
  return Number.isNaN(date.getTime()) ? null : localDayKey(date);
}

/** The most recent choice/completion today wins; an older unfinished decision remains available as a carry-over. */
export function todayDecision(missions: Mission[], now = new Date()): Mission | undefined {
  const day = localDayKey(now);
  const decisions = missions.filter(m => m.isOneDecision && m.status !== 'archived');
  const current = decisions.filter(m => (m.status === 'completed' && dayOf(m.completedAt) === day)
    || (m.status === 'active' && m.scheduledFor === day));
  const eventTime = (m: Mission) => Date.parse(m.status === 'completed' ? m.completedAt ?? m.createdAt : m.createdAt) || 0;
  const latest = [...current].sort((a, b) => eventTime(b) - eventTime(a) || Number(b.status === 'completed') - Number(a.status === 'completed'))[0];
  return latest ?? [...decisions].filter(m => m.status === 'active' && (!m.scheduledFor || m.scheduledFor <= day))
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0];
}

export function dailyReflection(data: Pick<UserData, 'notebook'>, dayKey: string): NotebookEntry | undefined {
  return [...(data.notebook?.entries ?? [])]
    .filter(entry => entry.kind === 'journal' && entry.promptId === DAILY_REFLECTION_PROMPT && entry.dateKey === dayKey)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

/** Sunday closes the week; a missed Sunday review remains reachable throughout the following week. */
export function availableReviewWeek(now = new Date()): string {
  const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay(), 12);
  return localDayKey(sunday);
}

export interface WeekEvidence {
  weekKey: string;
  dayKeys: string[];
  keptDays: number;
  reflectionDays: number;
  checkInDays: number;
  decisions: Mission[];
  hasActivity: boolean;
}

export function weekEvidence(data: Pick<UserData, 'missions' | 'notebook' | 'checkIns'>, weekKey: string): WeekEvidence {
  const end = new Date(`${weekKey}T12:00:00`);
  if (Number.isNaN(end.getTime()) || localDayKey(end) !== weekKey) return { weekKey, dayKeys: [], keptDays: 0, reflectionDays: 0, checkInDays: 0, decisions: [], hasActivity: false };
  const dayKeys = Array.from({ length: 7 }, (_, i) => localDayKey(new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6 + i, 12)));
  const days = new Set(dayKeys);
  const decisions = data.missions.filter(m => m.isOneDecision && m.status === 'completed' && days.has(dayOf(m.completedAt) ?? ''))
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));
  const keptDays = new Set(decisions.map(m => dayOf(m.completedAt))).size;
  const reflectionDays = new Set((data.notebook?.entries ?? []).filter(e => e.promptId === DAILY_REFLECTION_PROMPT && e.kind === 'journal' && e.content.trim() && days.has(e.dateKey)).map(e => e.dateKey)).size;
  const checkInDays = new Set((data.checkIns ?? []).filter(c => days.has(c.dateKey)).map(c => c.dateKey)).size;
  const chosen = data.missions.some(m => m.isOneDecision && days.has(m.scheduledFor ?? dayOf(m.createdAt) ?? ''));
  return { weekKey, dayKeys, keptDays, reflectionDays, checkInDays, decisions, hasActivity: chosen || keptDays + reflectionDays + checkInDays > 0 };
}

/** Progress is already normalized by the course store; catalog metadata keeps lesson text off Today. */
export function courseContinuation<T extends { id: string; lessonIds: string[]; lessonCount: number }>(
  courses: T[],
  progress: { lessons: Record<string, { completed: boolean; checked: boolean[]; answer: number | null; reflection: string }> },
  suggestedId?: string | null,
  selectedId?: string | null,
): { course: T; index: number; completed: number; started: boolean } | null {
  const items = courses.map(course => {
    const index = course.lessonIds.findIndex(id => progress.lessons[id]?.completed !== true);
    const completed = course.lessonIds.filter(id => progress.lessons[id]?.completed === true).length;
    const started = course.lessonIds.some(id => {
      const lesson = progress.lessons[id];
      return Boolean(lesson && (lesson.completed || lesson.checked.some(Boolean) || lesson.answer !== null || lesson.reflection.trim()));
    });
    return { course, index, completed, started };
  }).filter(item => item.index >= 0);
  return items.find(item => item.started && item.course.id === selectedId)
    ?? items.find(item => item.started)
    ?? items.find(item => item.course.id === suggestedId)
    ?? items[0]
    ?? null;
}
