import type { CourseLesson, GuidedCourse } from '../data/courses';
import { courseCatalogFor } from '../data/courseCatalog';
import { normalizeCourseExperiments, type CourseExperiment } from './courseLearning';
import { APP_DATA_STORAGE_KEY, COURSE_PROGRESS_STORAGE_KEY } from './storageKeys';
import { queueDataWrite } from './dataWrites';

export { COURSE_PROGRESS_STORAGE_KEY } from './storageKeys';

export interface LessonProgress {
  checked: boolean[];
  answer: number | null;
  reflection: string;
  completed: boolean;
}

export interface CourseProgress {
  version: 1;
  lessons: Record<string, LessonProgress>;
  experiments?: Record<string, CourseExperiment>;
}

const CHANGE_EVENT = 'oda:course-progress-changed';
export const MAX_COURSE_REFLECTION_LENGTH = 2000;
export const EMPTY_PROGRESS: CourseProgress = Object.freeze({
  version: 1,
  lessons: Object.freeze({}),
});

const catalog = courseCatalogFor('en');
type ValidationLesson = (typeof catalog)[number]['lessons'][number];
const knownLessons = new Map(catalog.flatMap(course => course.lessons.map(lesson => [lesson.id, lesson] as const)));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function emptyProgress(): CourseProgress {
  return { version: 1, lessons: {} };
}

function emptyLesson(lesson?: ValidationLesson): LessonProgress {
  return { checked: Array(lesson?.practiceCount ?? 0).fill(false), answer: null, reflection: '', completed: false };
}

function cleanLesson(value: unknown, lesson: ValidationLesson): LessonProgress {
  if (!isRecord(value)) return emptyLesson(lesson);
  const checked = Array.isArray(value.checked) ? value.checked : [];
  const answer = typeof value.answer === 'number'
    && Number.isInteger(value.answer)
    && value.answer >= 0
    && value.answer < lesson.optionCount
    ? value.answer
    : null;
  return {
    checked: Array.from({ length: lesson.practiceCount }, (_, index) => checked[index] === true),
    answer,
    reflection: typeof value.reflection === 'string' ? value.reflection.slice(0, MAX_COURSE_REFLECTION_LENGTH) : '',
    completed: value.completed === true,
  };
}

/** Eligibility only; completeLesson also checks the preceding lessons. */
export function canCompleteLesson(progress: LessonProgress, lesson: Pick<CourseLesson, 'id'> & Partial<CourseLesson>): boolean {
  const expected = knownLessons.get(lesson.id);
  return Boolean(expected)
    && Array.isArray(progress?.checked)
    && progress.checked.length === expected!.practiceCount
    && progress.checked.every(checked => checked === true)
    && Number.isInteger(progress.answer)
    && progress.answer === expected!.correct;
}

/** Revalidate completion in course order, including after edits to an earlier lesson. */
export function normalizeCourseProgress(value: unknown): CourseProgress {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.lessons)) return emptyProgress();
  const lessons: Record<string, LessonProgress> = {};
  for (const course of catalog) {
    let previousComplete = true;
    for (const lesson of course.lessons) {
      const raw = Object.prototype.hasOwnProperty.call(value.lessons, lesson.id) ? value.lessons[lesson.id] : undefined;
      if (!isRecord(raw)) {
        previousComplete = false;
        continue;
      }
      const progress = cleanLesson(raw, lesson);
      progress.completed = previousComplete && progress.completed && canCompleteLesson(progress, lesson);
      lessons[lesson.id] = progress;
      previousComplete = progress.completed;
    }
  }
  const experiments = normalizeCourseExperiments(value.experiments);
  return { version: 1, lessons, ...(Object.keys(experiments).length ? { experiments } : {}) };
}

export function getLessonProgress(state: CourseProgress, lesson: CourseLesson): LessonProgress {
  return normalizeCourseProgress(state).lessons[lesson.id] ?? emptyLesson(knownLessons.get(lesson.id));
}

export function parseCourseProgress(raw: string | null): CourseProgress {
  if (typeof raw !== 'string') return emptyProgress();
  try {
    return normalizeCourseProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function readCourseProgress(fallback: CourseProgress = EMPTY_PROGRESS): CourseProgress {
  try {
    const raw = globalThis.localStorage.getItem(APP_DATA_STORAGE_KEY);
    if (raw) {
      const stored: unknown = JSON.parse(raw);
      if (isRecord(stored) && Object.prototype.hasOwnProperty.call(stored, 'courseProgress')) {
        return normalizeCourseProgress(stored.courseProgress);
      }
    }
    // Existing devices used a separate key. It is read only until the next save.
    const legacy = globalThis.localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY);
    return legacy === null ? normalizeCourseProgress(fallback) : parseCourseProgress(legacy);
  } catch {
    return normalizeCourseProgress(fallback);
  }
}

/** Only call while holding the shared personal-data lock. */
function persistCurrentProgress(state: CourseProgress): void {
  const progress = normalizeCourseProgress(state);
  const raw = globalThis.localStorage.getItem(APP_DATA_STORAGE_KEY);
  if (raw) {
    const stored: unknown = JSON.parse(raw);
    // An unreadable personal record is never replaced just to save a course.
    if (!isRecord(stored) || !isRecord(stored.profile)) throw new Error('Unreadable personal record');
    globalThis.localStorage.setItem(APP_DATA_STORAGE_KEY, JSON.stringify({ ...stored, courseProgress: progress }));
  } else {
    globalThis.localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  }
}

/** A false result lets the UI retain the draft and explain that saving failed. */
export async function saveCourseProgress(state: CourseProgress): Promise<boolean> {
  try {
    await queueDataWrite(() => persistCurrentProgress(state));
  } catch { return false; }
  notifyCourseProgressChanged();
  return true;
}

/** Re-read inside the shared lock so queued edits never use a stale personal-data snapshot. */
export async function mutateCourseProgress(update: (latest: CourseProgress) => CourseProgress): Promise<CourseProgress | null> {
  let next: CourseProgress;
  try {
    next = await queueDataWrite(() => {
      const updated = normalizeCourseProgress(update(readCourseProgress()));
      persistCurrentProgress(updated);
      return updated;
    });
  } catch { return null; }
  notifyCourseProgressChanged();
  return next;
}

/** Same-tab edits/restores and other-tab saves refresh any open learning surface. */
export function subscribeCourseProgress(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const storageListener = (event: StorageEvent) => {
    if (event.key === null || event.key === APP_DATA_STORAGE_KEY || event.key === COURSE_PROGRESS_STORAGE_KEY) listener();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener('storage', storageListener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener('storage', storageListener);
  };
}

export function notifyCourseProgressChanged(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function updateLessonProgress(
  state: CourseProgress,
  lesson: CourseLesson,
  patch: Partial<LessonProgress>,
): CourseProgress {
  const clean = normalizeCourseProgress(state);
  const expected = knownLessons.get(lesson.id);
  if (!expected) return clean;
  const current = clean.lessons[expected.id] ?? emptyLesson(expected);
  const updated = cleanLesson({
    ...current,
    ...patch,
    // Marking a lesson complete is reserved for completeLesson's sequence check.
    completed: current.completed && patch.completed !== false,
  }, expected);
  return normalizeCourseProgress({ ...clean, lessons: { ...clean.lessons, [expected.id]: updated } });
}

export function completeLesson(state: CourseProgress, course: GuidedCourse, lessonIndex: number): CourseProgress {
  const clean = normalizeCourseProgress(state);
  const expected = catalog.find(item => item.id === course.id);
  if (!expected || !Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= expected.lessons.length) return clean;
  const lesson = expected.lessons[lessonIndex];
  const progress = clean.lessons[lesson.id] ?? emptyLesson(lesson);
  const previousComplete = expected.lessons.slice(0, lessonIndex).every(item => clean.lessons[item.id]?.completed === true);
  if (!previousComplete || !canCompleteLesson(progress, lesson)) return clean;
  return normalizeCourseProgress({
    ...clean,
    lessons: { ...clean.lessons, [lesson.id]: { ...progress, completed: true } },
  });
}

/** Returns course.lessons.length when every lesson has been completed. */
export function nextLessonIndex(state: CourseProgress, course: GuidedCourse): number {
  const expected = catalog.find(item => item.id === course.id);
  if (!expected) return 0;
  const clean = normalizeCourseProgress(state);
  const firstIncomplete = expected.lessons.findIndex(lesson => clean.lessons[lesson.id]?.completed !== true);
  return firstIncomplete === -1 ? expected.lessons.length : firstIncomplete;
}
