interface LessonEvidence {
  completed: boolean;
  checked: boolean[];
  answer: number | null;
  reflection: string;
}
interface CourseEvidence { lessons: Record<string, LessonEvidence> }

/** Viewing a course or opening its first lesson does not manufacture saved learning. */
export function hasLessonLearningProgress(lesson?: LessonEvidence): boolean {
  return Boolean(lesson && (lesson.completed === true || lesson.checked.some(value => value === true)
    || lesson.answer != null || lesson.reflection.trim().length > 0));
}

export function hasCourseLearningProgress(lessonIds: readonly string[], progress: CourseEvidence): boolean {
  return lessonIds.some(id => Object.hasOwn(progress.lessons, id) && hasLessonLearningProgress(progress.lessons[id]));
}

/** A returning learner resumes the first incomplete lesson; a completed course stays rereadable. */
export function courseEntryFor(course: { lessons: readonly { id: string }[] }, progress: CourseEvidence) {
  const ids = course.lessons.map(lesson => lesson.id);
  const started = hasCourseLearningProgress(ids, progress);
  const incomplete = ids.findIndex(id => progress.lessons[id]?.completed !== true);
  return { started, mode: started ? 'lesson' as const : 'overview' as const, index: incomplete < 0 ? Math.max(0, ids.length - 1) : incomplete };
}

export interface CourseEntryScope { recordId: string | undefined; replacementEpoch: unknown }
/** Ordinary saves retain the current view; a restore or account replacement invalidates it. */
export function sameCourseEntryScope(left: CourseEntryScope, right: CourseEntryScope): boolean {
  return left.recordId === right.recordId && Object.is(left.replacementEpoch, right.replacementEpoch);
}
