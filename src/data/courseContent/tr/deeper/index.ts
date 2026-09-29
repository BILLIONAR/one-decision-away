import type { CourseSource } from '../../../courses';
import type { LessonExtra } from './types';
import * as turning_day from './turning_day';
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

const MODULES = [turning_day, procrastination, confidence, adhd, motivation, faith, manifest, focus, sleep, calm, meditation, suggestion];
export const TR_LESSON_EXTRAS: Record<string, LessonExtra> = Object.assign({}, ...MODULES.map(m => m.EXTRAS));
export const TR_EXTRA_DEEPER_SOURCES: CourseSource[] = MODULES.flatMap(m => m.SOURCES);
export type { LessonExtra };
