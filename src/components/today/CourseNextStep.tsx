import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import { courseCatalogFor } from '../../data/courseCatalog';
import { courseForIntent } from '../../data/starterDecisions';
import { useApp } from '../../store/useApp';
import { useLocale } from '../../i18n';
import { dailyLoopCopy } from '../../i18n/dailyLoop';
import { courseContinuation } from '../../services/dailyLoop';
import { readCourseProgress, COURSE_PROGRESS_STORAGE_KEY } from '../../services/courseProgress';

const COURSE_SELECTION = 'oda_course_selection_v1';
const readSelected = () => { try { return localStorage.getItem(COURSE_SELECTION); } catch { return null; } };

export const CourseNextStep: React.FC = () => {
  const { data, setActiveRoute } = useApp();
  const [locale] = useLocale();
  const c = dailyLoopCopy(locale);
  const [progress, setProgress] = useState(readCourseProgress);
  useEffect(() => {
    const update = () => setProgress(readCourseProgress());
    const storage = (event: StorageEvent) => { if (event.key === COURSE_PROGRESS_STORAGE_KEY || event.key === null) update(); };
    window.addEventListener('storage', storage); window.addEventListener('focus', update);
    return () => { window.removeEventListener('storage', storage); window.removeEventListener('focus', update); };
  }, []);
  // Data replacement (including restoring a backup) can update the side store in this tab.
  useEffect(() => { setProgress(readCourseProgress()); }, [data?.courseProgress]);
  const next = courseContinuation(courseCatalogFor(locale), progress, courseForIntent(data?.profile.intent), readSelected());
  if (!next) return null;
  const open = () => {
    try { localStorage.setItem(COURSE_SELECTION, next.course.id); } catch { /* The course catalog remains available if storage is blocked. */ }
    setActiveRoute('/app/courses');
  };
  return <section className="oda-course-next-step" aria-labelledby="course-next-step-title">
    <div className="oda-loop-heading"><span className="oda-loop-icon" aria-hidden="true"><BookOpen size={20} strokeWidth={1.7} /></span><div><p className="oda-kicker">{next.started ? c.continueCourse : c.startCourse}</p><h2 id="course-next-step-title" className="oda-display">{next.course.title}</h2><p>{c.lesson} {next.index + 1} {c.of} {next.course.lessonCount} · {next.completed}/{next.course.lessonCount} {c.lessonsComplete}</p></div></div>
    <p className="oda-loop-help">{c.learningHint}</p>
    <button type="button" onClick={open} className="oda-loop-link">{next.started ? c.continue : c.begin}<ArrowRight size={16} aria-hidden="true" /></button>
  </section>;
};
