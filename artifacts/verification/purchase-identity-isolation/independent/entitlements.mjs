// src/services/entitlements.ts
var TIER_ORDER = ["free", "essentials", "pro", "coach"];
function tierRank(tier) {
  return TIER_ORDER.indexOf(tier);
}
function tierAtLeast(tier, min) {
  return tierRank(tier) >= tierRank(min);
}
var FREE_COURSES = /* @__PURE__ */ new Set(["turning-day"]);
var FREE_LESSONS_PER_COURSE = 2;
var FREE_SOUNDS_PER_CATEGORY = 2;
var ESSENTIAL_COURSES = /* @__PURE__ */ new Set(["procrastination", "focus", "sleep", "calm", "confidence", "motivation"]);
var AI_MONTHLY_MESSAGES = { free: 30, essentials: 150, pro: 600, coach: 3e3 };
function courseUnlockTier(courseId) {
  if (FREE_COURSES.has(courseId)) return "free";
  return ESSENTIAL_COURSES.has(courseId) ? "essentials" : "pro";
}
function isLessonLocked(courseId, lessonIndex, opts) {
  if (!opts.gating) return false;
  if (lessonIndex < FREE_LESSONS_PER_COURSE) return false;
  return !tierAtLeast(opts.tier, courseUnlockTier(courseId));
}
function isSoundLocked(indexInCategory, opts) {
  if (!opts.gating || tierAtLeast(opts.tier, "essentials")) return false;
  return indexInCategory >= FREE_SOUNDS_PER_CATEGORY;
}
export {
  AI_MONTHLY_MESSAGES,
  ESSENTIAL_COURSES,
  FREE_COURSES,
  FREE_LESSONS_PER_COURSE,
  FREE_SOUNDS_PER_CATEGORY,
  TIER_ORDER,
  courseUnlockTier,
  isLessonLocked,
  isSoundLocked,
  tierAtLeast,
  tierRank
};
