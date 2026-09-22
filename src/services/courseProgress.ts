import { COURSES, type CourseLesson, type GuidedCourse } from '../data/courses';

export interface LessonProgress {
  checked: boolean[];
  answer: number | null;
  reflection: string;
  completed: boolean;
}

export interface CourseProgress {
  version: 1;
  lessons: Record<string, LessonProgress>;
}

export const COURSE_PROGRESS_STORAGE_KEY = 'oda_course_progress_v1';
export const MAX_COURSE_REFLECTION_LENGTH = 2000;
export const EMPTY_PROGRESS: CourseProgress = Object.freeze({
  version: 1,
  lessons: Object.freeze({}),
});

const knownLessons = new Map(COURSES.flatMap(course => course.lessons.map(lesson => [lesson.id, lesson] as const)));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function emptyProgress(): CourseProgress {
  return { version: 1, lessons: {} };
}

function emptyLesson(lesson?: CourseLesson): LessonProgress {
  return { checked: Array(lesson?.practice.length ?? 0).fill(false), answer: null, reflection: '', completed: false };
}

function cleanLesson(value: unknown, lesson: CourseLesson): LessonProgress {
  if (!isRecord(value)) return emptyLesson(lesson);
  const checked = Array.isArray(value.checked) ? value.checked : [];
  const answer = typeof value.answer === 'number'
    && Number.isInteger(value.answer)
    && value.answer >= 0
    && value.answer < lesson.options.length
    ? value.answer
    : null;
  return {
    checked: lesson.practice.map((_, index) => checked[index] === true),
    answer,
    reflection: typeof value.reflection === 'string' ? value.reflection.slice(0, MAX_COURSE_REFLECTION_LENGTH) : '',
    completed: value.completed === true,
  };
}

/** Eligibility only; completeLesson also checks the preceding lessons. */
export function canCompleteLesson(progress: LessonProgress, lesson: CourseLesson): boolean {
  const expected = knownLessons.get(lesson.id);
  return Boolean(expected)
    && Array.isArray(progress?.checked)
    && progress.checked.length === expected!.practice.length
    && progress.checked.every(checked => checked === true)
    && Number.isInteger(progress.answer)
    && progress.answer === expected!.correct;
}

/** Revalidate completion in course order, including after edits to an earlier lesson. */
function normalizeProgress(value: unknown): CourseProgress {
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.lessons)) return emptyProgress();
  const lessons: Record<string, LessonProgress> = {};
  for (const course of COURSES) {
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
  return { version: 1, lessons };
}

export function getLessonProgress(state: CourseProgress, lesson: CourseLesson): LessonProgress {
  return normalizeProgress(state).lessons[lesson.id] ?? emptyLesson(knownLessons.get(lesson.id));
}

export function parseCourseProgress(raw: string | null): CourseProgress {
  if (typeof raw !== 'string') return emptyProgress();
  try {
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function readCourseProgress(): CourseProgress {
  try {
    return parseCourseProgress(globalThis.localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY));
  } catch {
    return emptyProgress();
  }
}

/** A false result lets the UI retain the draft and explain that saving failed. */
export function saveCourseProgress(state: CourseProgress): boolean {
  try {
    globalThis.localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(normalizeProgress(state)));
    return true;
  } catch {
    return false;
  }
}

export function updateLessonProgress(
  state: CourseProgress,
  lesson: CourseLesson,
  patch: Partial<LessonProgress>,
): CourseProgress {
  const clean = normalizeProgress(state);
  const expected = knownLessons.get(lesson.id);
  if (!expected) return clean;
  const current = clean.lessons[expected.id] ?? emptyLesson(expected);
  const updated = cleanLesson({
    ...current,
    ...patch,
    // Marking a lesson complete is reserved for completeLesson's sequence check.
    completed: current.completed && patch.completed !== false,
  }, expected);
  return normalizeProgress({ version: 1, lessons: { ...clean.lessons, [expected.id]: updated } });
}

export function completeLesson(state: CourseProgress, course: GuidedCourse, lessonIndex: number): CourseProgress {
  const clean = normalizeProgress(state);
  const expected = COURSES.find(item => item.id === course.id);
  if (!expected || !Number.isInteger(lessonIndex) || lessonIndex < 0 || lessonIndex >= expected.lessons.length) return clean;
  const lesson = expected.lessons[lessonIndex];
  const progress = clean.lessons[lesson.id] ?? emptyLesson(lesson);
  const previousComplete = expected.lessons.slice(0, lessonIndex).every(item => clean.lessons[item.id]?.completed === true);
  if (!previousComplete || !canCompleteLesson(progress, lesson)) return clean;
  return normalizeProgress({
    version: 1,
    lessons: { ...clean.lessons, [lesson.id]: { ...progress, completed: true } },
  });
}

/** Returns course.lessons.length when every lesson has been completed. */
export function nextLessonIndex(state: CourseProgress, course: GuidedCourse): number {
  const expected = COURSES.find(item => item.id === course.id);
  if (!expected) return 0;
  const clean = normalizeProgress(state);
  const firstIncomplete = expected.lessons.findIndex(lesson => clean.lessons[lesson.id]?.completed !== true);
  return firstIncomplete === -1 ? expected.lessons.length : firstIncomplete;
}
