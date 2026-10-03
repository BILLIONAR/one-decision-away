import { courseCatalogFor } from '../data/courseCatalog';
import type { GuidedCourse } from '../data/courses';
import { nextLessonIndex, type CourseProgress } from './courseProgress';
import { isLessonLocked, type Tier } from './entitlements';
import { APP_DATA_STORAGE_KEY } from './storageKeys';
import { readCommittedAppData } from './dataWrites';
import { REPLACEMENT_EPOCH_KEY } from './dataSnapshots';

export interface CourseNavigationIntent { courseId: string; mode: 'overview' | 'lesson'; lessonId?: string }
export const COURSE_NAVIGATION_INTENT_KEY = 'oda_course_navigation_intent_v1';
const SELECTION_KEY = 'oda_course_selection_v1';
const catalog = courseCatalogFor('en');
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));

function validate(value: unknown): CourseNavigationIntent | null {
  if (!isRecord(value) || typeof value.courseId !== 'string' || (value.mode !== 'overview' && value.mode !== 'lesson')) return null;
  const course = catalog.find(item => item.id === value.courseId);
  if (!course || (value.lessonId !== undefined && (typeof value.lessonId !== 'string' || !course.lessonIds.includes(value.lessonId)))) return null;
  return { courseId: course.id, mode: value.mode as CourseNavigationIntent['mode'], ...(value.mode === 'lesson' && typeof value.lessonId === 'string' ? { lessonId: value.lessonId } : {}) };
}

function currentScope(): string | null {
  try {
    const committed = readCommittedAppData();
    const raw = committed !== undefined ? committed : globalThis.localStorage.getItem(APP_DATA_STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || !isRecord(data.profile) || typeof data.profile.id !== 'string') return null;
    return JSON.stringify([data.profile.id, data[REPLACEMENT_EPOCH_KEY] ?? null]);
  } catch { return null; }
}

/** Returns false when navigation storage is unavailable; no learning progress is written. */
export function requestCourseNavigation(value: CourseNavigationIntent): boolean {
  const intent = validate(value);
  if (!intent) return false;
  try {
    globalThis.sessionStorage.removeItem(COURSE_NAVIGATION_INTENT_KEY);
    globalThis.localStorage.setItem(SELECTION_KEY, intent.courseId);
    globalThis.sessionStorage.setItem(COURSE_NAVIGATION_INTENT_KEY, JSON.stringify({ version: 1, intent, scope: currentScope() }));
    return true;
  } catch { return false; }
}

/** One-use intent. Invalid, stale-account and replaced-record requests are discarded. */
export function consumeCourseNavigation(): CourseNavigationIntent | null {
  try {
    const raw = globalThis.sessionStorage.getItem(COURSE_NAVIGATION_INTENT_KEY);
    globalThis.sessionStorage.removeItem(COURSE_NAVIGATION_INTENT_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1 || (value.scope !== null && value.scope !== currentScope())) return null;
    return validate(value.intent);
  } catch { return null; }
}

/** Navigation cannot unlock a prerequisite or paid lesson, or mark any lesson complete. */
export function resolveCourseNavigation(intent: CourseNavigationIntent, course: GuidedCourse, progress: CourseProgress, access: { gating: boolean; tier: Tier }) {
  const available = Math.min(nextLessonIndex(progress, course), course.lessons.length - 1);
  const index = intent.lessonId ? course.lessons.findIndex(lesson => lesson.id === intent.lessonId) : available;
  if (!validate(intent) || intent.courseId !== course.id || index < 0) return { mode: 'overview' as const, index: available, reason: 'invalid' as const };
  if (intent.mode === 'overview') return { mode: 'overview' as const, index: available, reason: null };
  if (index > available) return { mode: 'overview' as const, index: available, reason: 'prerequisite' as const };
  if (isLessonLocked(course.id, index, access)) return { mode: 'overview' as const, index: available, reason: 'entitlement' as const };
  return { mode: 'lesson' as const, index, reason: null };
}
