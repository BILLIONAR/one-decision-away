import type { CourseSource, GuidedCourse } from '../../courses';
import * as identity from './identity';
import * as state from './state';
import * as optimism from './optimism';
import * as meaning from './meaning';
import * as stoic from './stoic';
import * as compassion from './compassion';

/** Turkish editions of courses first written in English (Sep 2026). Empty stubs are skipped. */
const MODULES = [identity, state, optimism, meaning, stoic, compassion];
export const TR_EXTRA_COURSES: GuidedCourse[] = MODULES.map(m => m.COURSE).filter(course => course.lessons.length > 0);
export const TR_EXTRA_SOURCES: CourseSource[] = MODULES.flatMap(m => m.SOURCES);
