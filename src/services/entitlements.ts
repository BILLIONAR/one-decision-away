/**
 * What ODA Pro unlocks. One place, so the paywall copy, the locks and the
 * tests agree. The daily decision, evidence tree, notebook, coach and account
 * backup are never locked. Locks apply only where Pro can actually be bought
 * (the iPhone app with purchases configured); on the web everything stays open.
 */

/** A whole course that stays free: the one-day starter course. */
export const FREE_COURSES = new Set(['turning-day']);
/** The first lessons of every other course stay free, so anyone can try the method. */
export const FREE_LESSONS_PER_COURSE = 2;
/** The first sounds of every Sound Room category stay free. */
export const FREE_SOUNDS_PER_CATEGORY = 2;

export function isLessonLocked(courseId: string, lessonIndex: number, opts: { gating: boolean; pro: boolean }): boolean {
  if (!opts.gating || opts.pro) return false;
  if (FREE_COURSES.has(courseId)) return false;
  return lessonIndex >= FREE_LESSONS_PER_COURSE;
}

export function isSoundLocked(indexInCategory: number, opts: { gating: boolean; pro: boolean }): boolean {
  if (!opts.gating || opts.pro) return false;
  return indexInCategory >= FREE_SOUNDS_PER_CATEGORY;
}
