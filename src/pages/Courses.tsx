import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3, ExternalLink, LockKeyhole } from 'lucide-react';
import { COURSES, COURSE_SOURCES, type GuidedCourse } from '../data/courses';
import { canCompleteLesson, completeLesson, getLessonProgress, nextLessonIndex, readCourseProgress, saveCourseProgress, updateLessonProgress } from '../services/courseProgress';
import { CourseArtwork } from '../components/CourseArtwork';
import { useLocale, useT } from '../i18n';
import '../styles/courses.css';

const SELECTION_KEY = 'oda_course_selection_v1';
function readSelection() {
  try { const id = localStorage.getItem(SELECTION_KEY); return COURSES.some(course => course.id === id) ? id : null; } catch { return null; }
}

export const Courses: React.FC = () => {
  const [locale] = useLocale();
  const t = useT();
  const content = locale === 'tr' ? undefined : 'tr';
  const [state, setState] = useState(readCourseProgress);
  const [selected, setSelected] = useState<string | null>(readSelection);
  const [lastVisited, setLastVisited] = useState<string | null>(selected);
  const course = COURSES.find(item => item.id === selected);
  const [index, setIndex] = useState(() => course ? Math.min(nextLessonIndex(state, course), course.lessons.length - 1) : 0);
  const [storageError, setStorageError] = useState(false);
  const [notice, setNotice] = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const researchRef = useRef<HTMLElement>(null);
  const didMount = useRef(false);
  useEffect(() => {
    if (didMount.current) { titleRef.current?.focus(); titleRef.current?.scrollIntoView({ block: 'start' }); }
    didMount.current = true;
  }, [selected, index]);

  // Another tab may have saved progress since this page rendered; merge onto the latest stored copy.
  const commit = (update: (current: typeof state) => typeof state) => {
    const next = update(readCourseProgress());
    setState(next);
    setStorageError(!saveCourseProgress(next));
  };
  const open = (item?: GuidedCourse) => {
    setSelected(item?.id ?? null);
    if (item) setLastVisited(item.id);
    setIndex(item ? Math.min(nextLessonIndex(state, item), item.lessons.length - 1) : 0);
    setNotice('');
    try { if (item) localStorage.setItem(SELECTION_KEY, item.id); else localStorage.removeItem(SELECTION_KEY); } catch { /* Course remains usable. */ }
  };
  const countCompleted = (item: GuidedCourse) => item.lessons.filter(lesson => getLessonProgress(state, lesson).completed).length;
  const started = (item: GuidedCourse) => item.lessons.some(lesson => {
    const progress = getLessonProgress(state, lesson);
    return progress.completed || progress.checked.some(Boolean) || progress.answer !== null || progress.reflection.trim().length > 0;
  });
  const inProgress = COURSES.filter(item => started(item) && countCompleted(item) < item.lessons.length);
  const resumeCourse = inProgress.find(item => item.id === lastVisited) ?? inProgress[0];
  const researchSources = COURSE_SOURCES.filter(source => source.type === 'research');
  const languageNote = locale !== 'tr' && <p lang={locale} className="text-xs text-[var(--fg-muted)] mt-3">{t('Course lessons are currently available in Turkish.')}</p>;
  const storageNote = <p className={`text-xs leading-relaxed ${storageError ? 'text-[var(--brand-burgundy)]' : 'text-[var(--fg-muted)]'}`} role={storageError ? 'alert' : undefined}>{storageError ? t("This browser can't save your progress right now. If you close the page, changes from this session may be lost.") : t('Your progress and optional notes are stored in this browser. They are not sent to the cloud and will be lost if browser data is cleared. On a shared device, you may prefer not to leave personal notes.')}</p>;

  if (!course) return <div className="oda-courses">
    <header className="oda-course-intro">
      <div>
        <p className="oda-course-eyebrow">{t('ODA / Guided courses')}</p>
        <h1 ref={titleRef} tabIndex={-1} className="oda-display oda-course-title outline-none scroll-mt-16">{t("Even if you're afraid,")}<br /><span className="text-[var(--accent)]">{t('you can still begin.')}</span></h1>
        <p className="oda-course-intro-copy">{t('Sometimes a quote gives you courage. Sometimes you need to see the next step together. Pick a topic and move at your own pace with short lessons.')}</p>
        {languageNote}
      </div>
      <div className="oda-course-method">
        <p className="oda-course-method-path"><span>{t('Understand')}</span><ArrowRight size={13} aria-hidden="true" /><span>{t('Try')}</span><ArrowRight size={13} aria-hidden="true" /><span>{t('Reinforce')}</span></p>
        <p>{t('{courses} courses · {lessons} lessons', { courses: COURSES.length, lessons: COURSES.reduce((sum, item) => sum + item.lessons.length, 0) })}<br />{t('6–8 minutes for yourself in each lesson.')}</p>
        <button type="button" onClick={() => { researchRef.current?.scrollIntoView({ block: 'start' }); researchRef.current?.focus(); }} className="oda-course-research-link">{t('Content based on {count} scientific publications', { count: researchSources.length })}<ArrowRight size={13} aria-hidden="true" /></button>
      </div>
    </header>

    {resumeCourse && <section className="oda-course-resume" aria-label={t('Continue the course you started')}>
      <div>
        <p className="oda-course-eyebrow">{t('Where you left off')}</p>
        <h2 lang={content} className="oda-display">{resumeCourse.title}</h2>
        <p className="text-sm leading-relaxed text-[var(--fg-muted)]">{t('Lesson {number}', { number: nextLessonIndex(state, resumeCourse) + 1 })} · <span lang={content}>{resumeCourse.lessons[nextLessonIndex(state, resumeCourse)].title}</span></p>
        <p className="text-xs text-[var(--fg-muted)] mt-2">{t('{done}/{total} lessons completed', { done: countCompleted(resumeCourse), total: resumeCourse.lessons.length })}</p>
      </div>
      <button type="button" onClick={() => open(resumeCourse)} className="oda-course-primary shrink-0">{t('Continue')}<ArrowRight size={16} aria-hidden="true" /></button>
    </section>}

    <section aria-labelledby="course-list-title">
      <div className="oda-course-section-heading"><h2 id="course-list-title" className="oda-display">{resumeCourse ? t('Explore the other paths too') : t('Which topic feels close to you today?')}</h2><p>{t('Pick a topic. Start with one small step.')}</p></div>
      <div className="oda-course-list">{COURSES.map((item, i) => {
        const completed = countCompleted(item);
        const hasStarted = started(item);
        return <button key={item.id} type="button" onClick={() => open(item)} className="oda-course-row">
          <span className="oda-course-art-wrap"><span className="oda-course-row-number" aria-hidden="true">0{i + 1}</span><CourseArtwork courseId={item.id} /></span>
          <span className="oda-course-row-content">
            <span lang={content} className="oda-display oda-course-row-title">{item.title}</span>
            <span lang={content} className="oda-course-row-subtitle">{item.subtitle}</span>
            <span lang={content} className="oda-course-row-description">{item.description}</span>
            <span className="oda-course-row-meta"><span>{t('{lessons} lessons · {minutes} min', { lessons: item.lessons.length, minutes: item.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0) })}</span><span className="oda-course-row-state">{completed === item.lessons.length ? t('Completed · review again') : hasStarted ? t('{done}/{total} completed · continue', { done: completed, total: item.lessons.length }) : t('Start course')}</span></span>
            {completed > 0 && <span role="progressbar" aria-label={t('{title} progress', { title: item.title })} aria-valuenow={completed} aria-valuemin={0} aria-valuemax={item.lessons.length} className="oda-course-progress"><span className="oda-course-progress-fill" style={{ width: `${completed / item.lessons.length * 100}%` }} /></span>}
          </span>
          <ChevronRight className="oda-course-row-arrow" size={20} aria-hidden="true" />
        </button>;
      })}</div>
    </section>
    <div className="oda-course-storage">{storageNote}</div>
    <section ref={researchRef} id="course-research" tabIndex={-1} aria-labelledby="course-research-title" className="oda-course-research">
      <div className="oda-course-research-intro"><p className="oda-course-eyebrow mb-2">{t("If you're curious")}</p><h2 id="course-research-title" className="oda-display">{t('What are these lessons based on?')}</h2><p className="text-sm text-[var(--fg-muted)] leading-relaxed mt-3 mb-5">{t('Six scientific publications were reviewed before the lessons were written. Research findings were adapted into original daily exercises. ODA courses themselves have not been clinically tested; they are for education and personal practice.')}</p></div>
      {researchSources.map(source => <details key={source.id} lang={content} className="py-2"><summary className="min-h-11 py-3 cursor-pointer text-sm font-medium">{source.title}</summary><p className="text-sm leading-relaxed text-[var(--fg-muted)]">{source.finding}</p><p className="text-xs leading-relaxed mt-2 text-[var(--fg-muted)]">{source.limitation}</p><a href={source.url} target="_blank" rel="noopener noreferrer" className="oda-course-research-link" lang={locale}>{t('Read the publication')}<ExternalLink size={12} aria-hidden="true" /></a></details>)}
    </section>
  </div>;

  const lesson = course.lessons[index];
  const progress = getLessonProgress(state, lesson);
  const completed = countCompleted(course);
  const eligible = canCompleteLesson(progress, lesson);
  const answerCorrect = progress.answer === lesson.correct;
  const goNext = () => { setIndex(value => Math.min(value + 1, course.lessons.length - 1)); setNotice(''); };
  const patch = (value: Parameters<typeof updateLessonProgress>[2]) => { commit(current => updateLessonProgress(current, lesson, value)); setNotice(''); };

  return <div className="oda-courses oda-course-lesson space-y-7">
    <button type="button" onClick={() => open()} className="inline-flex items-center gap-2 min-h-11 text-sm text-[var(--fg-muted)] cursor-pointer"><ArrowLeft size={16} aria-hidden="true" />{t('All courses')}</button>
    <header className="oda-course-lesson-header">
      <div className="oda-course-lesson-header-copy"><p className="oda-course-eyebrow"><span lang={content}>{course.title}</span> / {t('Lesson {number} / {total}', { number: index + 1, total: course.lessons.length })}</p><h1 lang={content} ref={titleRef} tabIndex={-1} className="oda-display oda-course-lesson-title outline-none scroll-mt-16">{lesson.title}</h1><p className="flex items-center gap-2 text-xs text-[var(--fg-muted)]"><Clock3 size={14} aria-hidden="true" />{t('About {minutes} minutes · at your own pace', { minutes: lesson.minutes })}</p>{languageNote}</div>
      <CourseArtwork courseId={course.id} />
    </header>
    <nav aria-label={t('Lesson order')} className="oda-course-steps">{course.lessons.map((item, i) => {
      const done = getLessonProgress(state, item).completed;
      const unlocked = i === 0 || getLessonProgress(state, course.lessons[i - 1]).completed;
      return <button key={item.id} type="button" disabled={!unlocked} data-completed={done} aria-current={i === index ? 'step' : undefined} aria-label={done ? t('Lesson {number}: {title}, completed', { number: i + 1, title: item.title }) : !unlocked ? t('Lesson {number}: {title}, complete the previous lesson first', { number: i + 1, title: item.title }) : t('Lesson {number}: {title}', { number: i + 1, title: item.title })} onClick={() => { setIndex(i); setNotice(''); }} className="oda-course-step">{done ? <Check size={15} aria-hidden="true" /> : !unlocked ? <LockKeyhole size={12} aria-hidden="true" /> : null}{i + 1}</button>;
    })}</nav>
    <p lang={content} className="text-xs leading-relaxed text-[var(--fg-muted)]">{course.scope}</p>
    <section className="oda-course-goal"><p className="text-xs font-semibold text-[var(--accent)]">{t("This lesson's small goal")}</p><p lang={content}>{lesson.goal}</p></section>

    <section className="oda-course-stage" aria-labelledby="course-understand-title">
      <h2 id="course-understand-title" className="oda-course-stage-title"><span className="oda-course-stage-number" aria-hidden="true">01</span><span className="oda-display">{t('Understand')}</span></h2>
      <div lang={content} className="oda-course-reading">{lesson.reading.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    </section>

    <section className="oda-course-stage" aria-labelledby="course-practice-title">
      <h2 id="course-practice-title" className="oda-course-stage-title"><span className="oda-course-stage-number" aria-hidden="true">02</span><span className="oda-display">{t('Try')}</span></h2>
      <p className="text-sm text-[var(--fg-muted)] mt-3 leading-relaxed">{t("Let's try it together now. Check off each step after you try it. You can pause anytime.")}</p>
      <div lang={content} className="oda-course-practice">{lesson.practice.map((step, i) => <label key={step} className="oda-course-practice-step" data-checked={progress.checked[i] ?? false}><input type="checkbox" checked={progress.checked[i] ?? false} disabled={progress.completed} onChange={event => patch({ checked: lesson.practice.map((_, j) => i === j ? event.target.checked : !!progress.checked[j]) })} /><span><span className="font-semibold mr-1">{i + 1}.</span>{step}</span></label>)}</div>
    </section>

    <section className="oda-course-reflection"><label htmlFor="course-reflection" lang={content} className="block text-sm font-semibold leading-relaxed">{lesson.reflection}</label><p id="reflection-note" className="text-xs text-[var(--fg-muted)] mt-2 leading-relaxed">{t('Leaving a note is optional; you can keep your answer just for yourself.')}</p><textarea id="course-reflection" aria-describedby="reflection-note" value={progress.reflection} onChange={event => patch({ reflection: event.target.value })} maxLength={2000} rows={3} placeholder={t('A small note to myself…')} /></section>

    <fieldset aria-describedby="lesson-question" className="oda-course-quiz space-y-3"><legend className="oda-course-stage-title pr-3"><span className="oda-course-stage-number" aria-hidden="true">03</span><span className="oda-display">{t('Reinforce')}</span></legend><p className="text-xs text-[var(--fg-muted)]">{t('A quick check')}</p><p id="lesson-question" lang={content} className="text-base leading-relaxed pb-1">{lesson.question}</p>{lesson.options.map((option, i) => <label key={option} className="oda-course-option" data-selected={progress.answer === i}><input type="radio" name={`answer-${lesson.id}`} checked={progress.answer === i} disabled={progress.completed} onChange={() => patch({ answer: i })} /><span lang={content}>{option}</span></label>)}{progress.answer !== null && <div role="status" className={`text-sm leading-relaxed p-4 border-l-2 ${answerCorrect ? 'border-[var(--accent)]' : 'border-[var(--brand-burgundy)]'}`}><p className="font-semibold mb-1">{answerCorrect ? t('Yes, this approach fits the goal of the lesson.') : t("Let's think about it once more.")}</p><span lang={content}>{lesson.feedback}</span>{!answerCorrect && <p className="mt-2 text-xs">{t('You can go back to the explanation and choose another answer.')}</p>}</div>}</fieldset>

    <details className="border-y border-[var(--border)] py-2"><summary className="min-h-11 py-3 text-sm font-semibold cursor-pointer">{t('Sources and limits of this lesson')}</summary><div className="space-y-4 py-3">{lesson.sources.map(id => COURSE_SOURCES.find(source => source.id === id)!).map(source => <article key={source.id}><p className="text-[11px] uppercase tracking-wide text-[var(--accent)]">{source.type === 'research' ? t('Scientific publication') : source.type === 'religious' ? t('Religious source') : t('Official health guidance')}</p><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-11 text-sm font-medium underline underline-offset-4">{source.title}<ExternalLink size={12} className="shrink-0" aria-hidden="true" /></a><p className="text-xs leading-relaxed text-[var(--fg-muted)]">{source.finding}</p><p className="text-xs leading-relaxed text-[var(--fg-muted)] mt-2">{source.limitation}</p></article>)}</div></details>
    {progress.completed ? <section className="oda-course-finish space-y-3"><p className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"><Check size={18} aria-hidden="true" />{completed === course.lessons.length ? t('Course completed') : t('Lesson completed')}</p><p lang={content} className="oda-display text-2xl leading-relaxed">{lesson.takeaway}</p>{completed === course.lessons.length && <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{t('What you take with you: {outcome} You can reread the lessons whenever you like.', { outcome: course.outcome })}</p>}<button type="button" onClick={index < course.lessons.length - 1 ? goNext : () => open()} className="oda-course-primary">{index < course.lessons.length - 1 ? t('Go to the next lesson') : t('Back to courses')}<ArrowRight size={16} aria-hidden="true" /></button></section> : <div className="space-y-3"><p className="text-xs text-[var(--fg-muted)] leading-relaxed">{t('To complete the lesson, check the three practice steps and choose the right answer to the question. A personal note is optional.')}</p><button type="button" disabled={!eligible} onClick={() => { commit(current => completeLesson(current, course, index)); setNotice(t("Lesson completed. When you're ready, you can move to the next step.")); }} className="oda-course-primary w-full">{t('Complete lesson')}<Check size={16} aria-hidden="true" /></button></div>}
    <p role="status" className="text-xs text-[var(--accent)]">{notice}</p>{storageNote}
  </div>;
};
