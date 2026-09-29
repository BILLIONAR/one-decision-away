/**
 * What each ODA level unlocks. One place, so the paywall copy, the locks and
 * the tests agree. The daily decision, evidence tree, notebook and account
 * backup are never locked. Locks apply only where a subscription can actually
 * be bought (the iPhone app with purchases configured); on the web everything
 * stays open.
 *
 * Levels: free < essentials < pro < coach.
 */

export type Tier = 'free' | 'essentials' | 'pro' | 'coach';
export type PaidTier = Exclude<Tier, 'free'>;

/** Lowest to highest. */
export const TIER_ORDER: readonly Tier[] = ['free', 'essentials', 'pro', 'coach'];

export function tierRank(tier: Tier): number {
  return TIER_ORDER.indexOf(tier);
}

/** True when `tier` is `min` or higher. */
export function tierAtLeast(tier: Tier, min: Tier): boolean {
  return tierRank(tier) >= tierRank(min);
}

/** A whole course that stays free: the one-day starter course. */
export const FREE_COURSES = new Set(['turning-day']);
/** The first lessons of every other course stay free, so anyone can try the method. */
export const FREE_LESSONS_PER_COURSE = 2;
/** The first sounds of every Sound Room category stay free. */
export const FREE_SOUNDS_PER_CATEGORY = 2;
/** Courses that Essentials opens in full (Turning Day is free for everyone). */
export const ESSENTIAL_COURSES: ReadonlySet<string> = new Set(['procrastination', 'focus', 'sleep', 'calm', 'confidence', 'motivation']);

/** AI coach messages per calendar month. The top level is a fair-use ceiling. */
export const AI_MONTHLY_MESSAGES: Record<Tier, number> = { free: 30, essentials: 150, pro: 600, coach: 3000 };

/** The lowest level that opens every lesson of a course (free for the starter course). */
export function courseUnlockTier(courseId: string): Tier {
  if (FREE_COURSES.has(courseId)) return 'free';
  return ESSENTIAL_COURSES.has(courseId) ? 'essentials' : 'pro';
}

type GateOptions = { gating: boolean; tier: Tier };

export function isLessonLocked(courseId: string, lessonIndex: number, opts: GateOptions): boolean {
  if (!opts.gating) return false;
  if (lessonIndex < FREE_LESSONS_PER_COURSE) return false;
  return !tierAtLeast(opts.tier, courseUnlockTier(courseId));
}

export function isSoundLocked(indexInCategory: number, opts: GateOptions): boolean {
  if (!opts.gating || tierAtLeast(opts.tier, 'essentials')) return false;
  return indexInCategory >= FREE_SOUNDS_PER_CATEGORY;
}
