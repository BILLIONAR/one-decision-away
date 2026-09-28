import type { CourseSource, GuidedCourse } from '../../courses';
import * as turning_day from './turning-day';
import * as procrastination from './procrastination';
import * as confidence from './confidence';
import * as adhd from './adhd';
import * as motivation from './motivation';
import * as faith from './faith';
import * as manifest from './manifest';
import * as focus from './focus';
import * as sleep from './sleep';
import * as calm from './calm';
import * as meditation from './meditation';
import * as suggestion from './suggestion';
import * as identity from './identity';
import * as state from './state';
import * as optimism from './optimism';
import * as meaning from './meaning';
import * as stoic from './stoic';
import * as compassion from './compassion';

/**
 * English course editions. Each file exports COURSE and SOURCES. Existing
 * courses keep their lesson IDs; new courses are written in English first.
 * See docs/COURSE_WRITING_GUIDE.md.
 */
const EDITIONS: { COURSE: GuidedCourse; SOURCES: CourseSource[] }[] = [
  turning_day, procrastination, confidence, adhd, motivation, faith, manifest, focus, sleep, calm, meditation, suggestion, identity, state, optimism, meaning, stoic, compassion,
];

export const EN_COURSES: GuidedCourse[] = EDITIONS.map(e => e.COURSE).filter(course => course.lessons.length > 0);
export const EN_SOURCES: CourseSource[] = EDITIONS.flatMap(e => e.SOURCES);
