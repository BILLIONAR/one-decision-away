import { courseCatalogFor } from '../data/courseCatalog';

export type PracticeOutcome = 'tried' | 'adapted' | 'paused';
export interface CoursePracticeAttempt {
  id: string;
  date: string;
  outcome: PracticeOutcome;
  note: string;
}
export interface CourseExperiment {
  cue: string;
  action: string;
  fallback: string;
  evidence: string;
  reviewOn: string | null;
  attempts: CoursePracticeAttempt[];
  review: { recall: string; nextAction: string; reviewedOn: string | null };
}
export type CourseExperiments = Record<string, CourseExperiment>;
export const MAX_PRACTICE_ATTEMPTS = 60;
export const MAX_PLAN_TEXT = 500;
export const MAX_PRACTICE_NOTE = 1000;
const knownCourses = new Set(courseCatalogFor('en').map(course => course.id));
const outcomes: PracticeOutcome[] = ['tried', 'adapted', 'paused'];
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, max = MAX_PLAN_TEXT) => typeof value === 'string' ? value.slice(0, max) : '';

/** Calendar dates stay in the user's local day; never convert a local date to UTC. */
export function localPracticeDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function practiceDateAfter(days: number, date = new Date()): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return localPracticeDate(next);
}
export function isPracticeDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}
export function emptyCourseExperiment(): CourseExperiment {
  return { cue: '', action: '', fallback: '', evidence: '', reviewOn: null, attempts: [], review: { recall: '', nextAction: '', reviewedOn: null } };
}
function normalizeExperiment(value: unknown): CourseExperiment {
  if (!isRecord(value)) return emptyCourseExperiment();
  const review = isRecord(value.review) ? value.review : {};
  const seen = new Set<string>();
  const attempts: CoursePracticeAttempt[] = [];
  for (const raw of Array.isArray(value.attempts) ? value.attempts : []) {
    if (!isRecord(raw) || typeof raw.id !== 'string' || !raw.id.trim() || raw.id.length > 100 || !isPracticeDate(raw.date) || !outcomes.includes(raw.outcome as PracticeOutcome) || seen.has(raw.id)) continue;
    seen.add(raw.id);
    attempts.push({ id: raw.id, date: raw.date, outcome: raw.outcome as PracticeOutcome, note: text(raw.note, MAX_PRACTICE_NOTE) });
  }
  return {
    cue: text(value.cue), action: text(value.action), fallback: text(value.fallback), evidence: text(value.evidence),
    reviewOn: isPracticeDate(value.reviewOn) ? value.reviewOn : null,
    attempts: attempts.slice(-MAX_PRACTICE_ATTEMPTS),
    review: { recall: text(review.recall, MAX_PRACTICE_NOTE), nextAction: text(review.nextAction), reviewedOn: isPracticeDate(review.reviewedOn) ? review.reviewedOn : null },
  };
}

/** Whitelist course IDs and bound private text before persistence or backup import. */
export function normalizeCourseExperiments(value: unknown): CourseExperiments {
  if (!isRecord(value)) return {};
  const clean: CourseExperiments = {};
  for (const id of knownCourses) {
    if (Object.prototype.hasOwnProperty.call(value, id) && isRecord(value[id])) clean[id] = normalizeExperiment(value[id]);
  }
  return clean;
}
export function getCourseExperiment(value: unknown, courseId: string): CourseExperiment {
  return normalizeCourseExperiments(value)[courseId] ?? emptyCourseExperiment();
}
export function hasPracticePlan(experiment: CourseExperiment): boolean {
  return !!experiment.cue.trim() && !!experiment.action.trim();
}
export function updateCourseExperiment(value: unknown, courseId: string, patch: Partial<Omit<CourseExperiment, 'review'>> & { review?: Partial<CourseExperiment['review']> }): CourseExperiments {
  const clean = normalizeCourseExperiments(value);
  if (!knownCourses.has(courseId)) return clean;
  const current = clean[courseId] ?? emptyCourseExperiment();
  return { ...clean, [courseId]: normalizeExperiment({ ...current, ...patch, review: { ...current.review, ...patch.review } }) };
}
export function addCoursePracticeAttempt(value: unknown, courseId: string, attempt: CoursePracticeAttempt): CourseExperiments {
  const clean = normalizeCourseExperiments(value);
  if (!knownCourses.has(courseId) || !isPracticeDate(attempt.date) || !outcomes.includes(attempt.outcome) || !attempt.id?.trim() || attempt.id.length > 100) return clean;
  const current = clean[courseId] ?? emptyCourseExperiment();
  // A double-click or retry of the same entry must not create duplicate records.
  if (current.attempts.some(item => item.id === attempt.id)) return clean;
  return updateCourseExperiment(clean, courseId, { attempts: [...current.attempts, attempt] });
}
export function removeCoursePracticeAttempt(value: unknown, courseId: string, id: string): CourseExperiments {
  const clean = normalizeCourseExperiments(value);
  if (!clean[courseId]) return clean;
  return updateCourseExperiment(clean, courseId, { attempts: clean[courseId].attempts.filter(item => item.id !== id) });
}
export function isCourseReviewDue(experiment: CourseExperiment, today = localPracticeDate()): boolean {
  return hasPracticePlan(experiment) && isPracticeDate(today) && !!experiment.reviewOn && experiment.reviewOn <= today
    && (!experiment.review.reviewedOn || experiment.review.reviewedOn < experiment.reviewOn);
}
/** Readable user-owned artifact; plain text carries no HTML or executable content. */
export function coursePracticeText(title: string, experiment: CourseExperiment, labels: { cue: string; action: string; fallback: string; evidence: string; review: string; attempts: string; recall: string; nextAction: string; outcomes?: Record<PracticeOutcome, string> }): string {
  return [title, '', `${labels.cue}: ${experiment.cue}`, `${labels.action}: ${experiment.action}`, `${labels.fallback}: ${experiment.fallback}`, `${labels.evidence}: ${experiment.evidence}`, `${labels.review}: ${experiment.reviewOn ?? ''}`, '', labels.attempts, ...experiment.attempts.map(item => `${item.date} · ${labels.outcomes?.[item.outcome] ?? item.outcome}\n${item.note}`), '', `${labels.recall}: ${experiment.review.recall}`, `${labels.nextAction}: ${experiment.review.nextAction}`].join('\n');
}
