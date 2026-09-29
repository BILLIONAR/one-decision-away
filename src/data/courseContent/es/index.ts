import type { CourseSource, GuidedCourse } from '../../courses';
import * as adhd from './adhd';
import * as calm from './calm';
import * as compassion from './compassion';
import * as confidence from './confidence';
import * as faith from './faith';
import * as focus from './focus';
import * as identity from './identity';
import * as manifest from './manifest';
import * as meaning from './meaning';
import * as meditation from './meditation';
import * as motivation from './motivation';
import * as optimism from './optimism';
import * as procrastination from './procrastination';
import * as sleep from './sleep';
import * as state from './state';
import * as stoic from './stoic';
import * as suggestion from './suggestion';
import * as turning_day from './turning-day';

/** Spanish editions, translated from the English editions (Sep 2026). Empty stubs are skipped. */
const MODULES = [adhd, calm, compassion, confidence, faith, focus, identity, manifest, meaning, meditation, motivation, optimism, procrastination, sleep, state, stoic, suggestion, turning_day];
export const ES_COURSES: GuidedCourse[] = MODULES.map(m => m.COURSE).filter(course => course.lessons.length > 0);
export const ES_SOURCES: CourseSource[] = MODULES.flatMap(m => m.SOURCES);
