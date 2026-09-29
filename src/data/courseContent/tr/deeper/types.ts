import type { LessonExample, LessonSection } from '../../../courses';

/** Turkish deepening for an existing Turkish lesson: merged onto the lesson by id. */
export interface LessonExtra {
  deeper: LessonSection[];
  example: LessonExample;
  /** Extra source ids the deeper sections rely on (added to the lesson's own list). */
  sources?: string[];
}
