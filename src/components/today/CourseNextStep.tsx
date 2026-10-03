import React from 'react';
import { ArrowRight } from 'lucide-react';
import { courseCatalogFor } from '../../data/courseCatalog';
import { courseEntryCopy } from '../../data/courseEntryCopy';
import { courseForIntent } from '../../data/starterDecisions';
import { useApp } from '../../store/useApp';
import { useLocale } from '../../i18n';
import { dailyLoopCopy } from '../../i18n/dailyLoop';
import { courseContinuation } from '../../services/dailyLoop';
import { useSavedCourseProgress } from '../../hooks/useSavedCourseProgress';
import { CourseRoadmap } from '../CourseRoadmap';
import { requestCourseNavigation } from '../../services/courseNavigationIntent';
import { dashboardHybridCopy } from '../../i18n/dashboardHybrid';

const COURSE_SELECTION = 'oda_course_selection_v1';
const readSelected = () => { try { return localStorage.getItem(COURSE_SELECTION); } catch { return null; } };

export const CourseNextStep: React.FC = () => {
  const { data, setActiveRoute } = useApp();
  const [locale] = useLocale();
  const c = dailyLoopCopy(locale);
  const entryCopy = courseEntryCopy(locale);
  const hybrid = dashboardHybridCopy(locale);
  const progress = useSavedCourseProgress(data);
  const catalog = courseCatalogFor(locale);
  const selected = readSelected();
  const suggested = courseForIntent(data?.profile.intent);
  const continuation = courseContinuation(catalog, progress, suggested, selected);
  const finishedCourse = !continuation && (catalog.find(course => course.id === selected) ?? catalog.find(course => course.id === suggested) ?? catalog[0]);
  const next = continuation ?? (finishedCourse ? { course: finishedCourse, index: finishedCourse.lessonCount - 1, completed: finishedCourse.lessonCount, started: true } : null);
  if (!next) return null;
  const lesson = next.course.lessons[next.index];
  if (!lesson) return null;
  const contentLanguage = next.course.lang !== locale ? next.course.lang : undefined;
  const completedIds = next.course.lessonIds.filter(id => progress.lessons[id]?.completed === true);
  const open = (mode: 'overview' | 'lesson', lessonId?: string) => {
    requestCourseNavigation({ courseId: next.course.id, mode, ...(lessonId ? { lessonId } : {}) });
    setActiveRoute('/app/courses');
  };
  return <section className="oda-course-next-step oda-hybrid-mission" aria-labelledby="course-next-step-title">
    <div className="oda-loop-heading"><div><p className="oda-kicker">{next.started ? hybrid.mission : hybrid.suggested}</p><h2 id="course-next-step-title" lang={contentLanguage} className="oda-display">{next.course.title}</h2><p>{next.completed}/{next.course.lessonCount} {c.lessonsComplete}</p></div><strong className="oda-hybrid-mission-percent" aria-hidden="true">{Math.round(next.completed / next.course.lessonCount * 100)}%</strong></div>
    <div className="oda-growth-course-progress" role="progressbar" aria-label={next.course.title} aria-valuenow={next.completed} aria-valuemin={0} aria-valuemax={next.course.lessonCount}><span style={{ width: `${next.completed / next.course.lessonCount * 100}%` }} /></div>
    <CourseRoadmap lessons={next.course.lessons} completedLessonIds={completedIds} currentLessonId={continuation ? lesson.id : undefined} availableLessonIds={[...completedIds, ...(continuation ? [lesson.id] : [])]} onOpenLesson={id => open('lesson', id)} compact language={contentLanguage} />
    {continuation ? <div className="oda-hybrid-next-lesson"><p className="oda-kicker">{hybrid.next} · {lesson.minutes} min</p><h3 lang={contentLanguage} className="text-base leading-snug font-semibold" data-next-lesson-title>{lesson.title}</h3><p className="oda-loop-help"><span className="font-semibold">{entryCopy.nextGoal}: </span><span lang={contentLanguage} data-next-lesson-goal>{lesson.goal}</span></p></div> : <p className="oda-loop-help">{hybrid.complete}</p>}
    <div className="oda-hybrid-mission-actions"><button type="button" onClick={() => open('overview')} className="oda-loop-link">{hybrid.roadmap}<ArrowRight size={16} aria-hidden="true" /></button>{continuation && <button type="button" onClick={() => open(next.started ? 'lesson' : 'overview')} className="oda-loop-link">{next.started ? c.continue : entryCopy.previewCourse}<ArrowRight size={16} aria-hidden="true" /></button>}</div>
  </section>;
};
