import React, { useState } from 'react';
import { ArrowDownToLine, ArrowRight, CalendarDays, Check, NotebookPen, RotateCcw, Trash2 } from 'lucide-react';
import type { ContentLocale, GuidedCourse } from '../data/courses';
import { courseLearningCopy } from '../data/courseLearningCopy';
import { practiceGuideFor } from '../data/coursePracticeContent';
import { addCoursePracticeAttempt, coursePracticeText, getCourseExperiment, hasPracticePlan, isCourseReviewDue, localPracticeDate, MAX_PLAN_TEXT, MAX_PRACTICE_ATTEMPTS, MAX_PRACTICE_NOTE, practiceDateAfter, removeCoursePracticeAttempt, updateCourseExperiment, type CourseExperiments, type PracticeOutcome } from '../services/courseLearning';

interface Props {
  course: GuidedCourse;
  locale: ContentLocale;
  experiments: CourseExperiments | undefined;
  completed: number;
  onUpdate: (update: (current: CourseExperiments | undefined) => CourseExperiments) => Promise<boolean>;
}

export function CoursePracticeStudio({ course, locale, experiments, completed, onUpdate }: Props) {
  const copy = courseLearningCopy(locale);
  const guide = practiceGuideFor(course.id, locale);
  const experiment = getCourseExperiment(experiments, course.id);
  const [date, setDate] = useState(localPracticeDate);
  const [outcome, setOutcome] = useState<PracticeOutcome>('tried');
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState<'entry' | 'review' | null>(null);
  const prefix = `practice-${course.id}`;
  const ready = hasPracticePlan(experiment);
  const reviewDue = isCourseReviewDue(experiment);
  const outcomeLabels = { tried: copy.tried, adapted: copy.adapted, paused: copy.paused };
  const update = (patch: Parameters<typeof updateCourseExperiment>[2]) => onUpdate(current => updateCourseExperiment(current, course.id, patch));
  const updatePlan = (field: 'cue' | 'action' | 'fallback' | 'evidence', value: string) => update({ [field]: value, reviewOn: experiment.reviewOn ?? practiceDateAfter(7) });
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`));
  const download = () => {
    const body = coursePracticeText(course.title, experiment, { cue: copy.cue, action: copy.action, fallback: copy.fallback, evidence: copy.evidence, review: copy.reviewDate, attempts: copy.attempts, recall: copy.recall, nextAction: copy.nextAction, outcomes: outcomeLabels });
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `oda-${course.id}-practice-${localPracticeDate()}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section className="oda-practice" aria-labelledby={`${prefix}-heading`}>
    <div className="oda-practice-heading"><p className="oda-course-eyebrow">{copy.roadmap}</p><h2 id={`${prefix}-heading`} className="oda-display">{copy.studio}</h2><p>{copy.studioIntro}</p></div>
    <ol className="oda-practice-roadmap">
      {[copy.notice, copy.try, copy.transfer].map((label, i) => <li key={label} data-current={i === (completed === course.lessons.length ? 2 : completed > 0 ? 1 : 0)}><span aria-hidden="true">0{i + 1}</span><div><h3>{label}</h3><p>{guide.milestones[i]}</p></div></li>)}
    </ol>
    <details id="course-practice-studio" className="oda-practice-workbook" open={completed === course.lessons.length || reviewDue}>
      <summary><NotebookPen size={20} aria-hidden="true" /><span><strong>{copy.experiment}</strong><span>{guide.experiment}</span></span><ArrowRight size={18} aria-hidden="true" /></summary>
      <div className="oda-practice-workbook-body">
        <p className="oda-practice-optional">{copy.optional}</p>
        <section aria-labelledby={`${prefix}-plan`}>
          <h3 id={`${prefix}-plan`} className="oda-display">{copy.plan}</h3><p className="oda-practice-help">{copy.planIntro}</p>
          {!ready && <button type="button" className="oda-practice-example" onClick={() => { void onUpdate(current => {
            const latest = getCourseExperiment(current, course.id);
            return updateCourseExperiment(current, course.id, {
              cue: latest.cue.trim() ? latest.cue : guide.cue,
              action: latest.action.trim() ? latest.action : guide.action,
              fallback: latest.fallback.trim() ? latest.fallback : guide.fallback,
              evidence: latest.evidence.trim() ? latest.evidence : guide.evidence,
              reviewOn: latest.reviewOn ?? practiceDateAfter(7),
            });
          }); }}>{copy.useExample}<ArrowRight size={15} aria-hidden="true" /></button>}
          <div className="oda-practice-fields">
            {(['cue', 'action', 'fallback', 'evidence'] as const).map(field => <label key={field} htmlFor={`${prefix}-${field}`}><span>{copy[field]}</span><textarea id={`${prefix}-${field}`} value={experiment[field]} placeholder={guide[field]} rows={2} maxLength={MAX_PLAN_TEXT} onChange={event => updatePlan(field, event.target.value)} /></label>)}
            <label htmlFor={`${prefix}-review-date`}><span><CalendarDays size={15} aria-hidden="true" />{copy.reviewDate}</span><input id={`${prefix}-review-date`} type="date" value={experiment.reviewOn ?? ''} onChange={event => update({ reviewOn: event.target.value || null })} aria-describedby={`${prefix}-date-note`} /></label>
          </div>
          <p id={`${prefix}-date-note`} className="oda-practice-help">{copy.noNotification}</p><p className="oda-practice-plan-status">{ready && <Check size={15} aria-hidden="true" />}{ready ? copy.planReady : copy.planDraft}</p>
        </section>
        <section aria-labelledby={`${prefix}-try`}>
          <h3 id={`${prefix}-try`} className="oda-display">{copy.practice}</h3><p className="oda-practice-help">{copy.practiceIntro}</p>
          <form onSubmit={async event => {
            event.preventDefault();
            if (busy) return;
            setBusy('entry');
            const id = globalThis.crypto?.randomUUID?.() ?? `practice-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            const result = onUpdate(current => addCoursePracticeAttempt(current, course.id, { id, date, outcome, note }));
            setNote('');
            const saved = await result;
            setNotice(saved ? copy.entryAdded : copy.savingFailed);
            setBusy(null);
          }}>
            <div className="oda-practice-fields oda-practice-entry-fields"><label htmlFor={`${prefix}-date`}><span>{copy.date}</span><input id={`${prefix}-date`} type="date" required max={localPracticeDate()} value={date} onChange={event => setDate(event.target.value)} /></label><label htmlFor={`${prefix}-outcome`}><span>{copy.outcome}</span><select id={`${prefix}-outcome`} value={outcome} onChange={event => setOutcome(event.target.value as PracticeOutcome)}>{(['tried', 'adapted', 'paused'] as const).map(value => <option value={value} key={value}>{outcomeLabels[value]}</option>)}</select></label></div>
            <label className="oda-practice-note" htmlFor={`${prefix}-note`}><span>{copy.note}</span><textarea id={`${prefix}-note`} maxLength={MAX_PRACTICE_NOTE} rows={3} value={note} placeholder={copy.notePlaceholder} onChange={event => setNote(event.target.value)} /></label>
            <button type="submit" className="oda-course-primary" disabled={busy !== null}>{busy === 'entry' ? copy.saving : copy.addAttempt}<Check size={16} aria-hidden="true" /></button>
          </form>
          <div className="oda-practice-journal" aria-labelledby={`${prefix}-journal`}><h4 id={`${prefix}-journal`}>{copy.attempts} <span>({experiment.attempts.length})</span></h4>{experiment.attempts.length ? <ul>{[...experiment.attempts].reverse().map(attempt => <li key={attempt.id}><div><p className="oda-practice-entry-meta"><time dateTime={attempt.date}>{formatDate(attempt.date)}</time><span>{outcomeLabels[attempt.outcome]}</span></p>{attempt.note && <p className="oda-practice-entry-note">{attempt.note}</p>}</div><button type="button" aria-label={`${copy.removeEntry}: ${formatDate(attempt.date)}`} onClick={async () => {
            const saved = await onUpdate(current => removeCoursePracticeAttempt(current, course.id, attempt.id));
            setNotice(saved ? copy.entryRemoved : copy.savingFailed);
          }}><Trash2 size={16} aria-hidden="true" /></button></li>)}</ul> : <p className="oda-practice-help">{copy.emptyAttempts}</p>}{experiment.attempts.length >= MAX_PRACTICE_ATTEMPTS && <p className="oda-practice-help">{copy.recentLimit}</p>}</div>
        </section>
        <section aria-labelledby={`${prefix}-review`}>
          <h3 id={`${prefix}-review`} className="oda-display">{copy.review}</h3><p className="oda-practice-help">{copy.reviewIntro}</p><p className="oda-practice-transfer">{guide.transfer}</p>
          <div className="oda-practice-fields"><label htmlFor={`${prefix}-recall`}><span>{copy.recall}</span><textarea id={`${prefix}-recall`} rows={3} maxLength={MAX_PRACTICE_NOTE} value={experiment.review.recall} placeholder={copy.recallPlaceholder} onChange={event => update({ review: { recall: event.target.value } })} /></label><label htmlFor={`${prefix}-next`}><span>{copy.nextAction}</span><textarea id={`${prefix}-next`} rows={2} maxLength={MAX_PLAN_TEXT} value={experiment.review.nextAction} placeholder={copy.nextPlaceholder} onChange={event => update({ review: { nextAction: event.target.value } })} /></label></div>
          {experiment.review.reviewedOn && <p className="oda-practice-help">{copy.reviewed}: <time dateTime={experiment.review.reviewedOn}>{formatDate(experiment.review.reviewedOn)}</time></p>}
          <button type="button" disabled={busy !== null || !experiment.review.recall.trim() || !experiment.review.nextAction.trim()} className="oda-course-primary" onClick={async () => {
            setBusy('review');
            const saved = await update({ reviewOn: practiceDateAfter(7), review: { reviewedOn: localPracticeDate() } });
            setNotice(saved ? copy.reviewSaved : copy.savingFailed);
            setBusy(null);
          }}>{busy === 'review' ? copy.saving : copy.saveReview}<RotateCcw size={16} aria-hidden="true" /></button>
        </section>
        <p role="status" className="oda-practice-notice">{notice}</p>
        <div className="oda-practice-export"><button type="button" disabled={!ready && !experiment.attempts.length && !experiment.review.recall.trim()} onClick={download}><ArrowDownToLine size={16} aria-hidden="true" />{copy.export}</button><p>{copy.exportNote}</p></div>
        <details className="oda-practice-sources"><summary>{copy.sourceLimits}</summary><h4>{copy.sourceTitle}</h4><p>{copy.sourceText}</p>{[
          ['https://cancercontrol.cancer.gov/brp/research/constructs/implementation-intentions', copy.planningSource, copy.planningLimit],
          ['https://pubmed.ncbi.nlm.nih.gov/26479070/', copy.monitoringSource, copy.monitoringLimit],
          ['https://ies.ed.gov/ncee/wwc/PracticeGuide/1', copy.reviewSource, copy.reviewLimit],
        ].map(([url, title, limit]) => <article key={url}><a href={url} target="_blank" rel="noopener noreferrer">{title}<ArrowRight size={13} aria-hidden="true" /></a><p>{limit}</p></article>)}</details>
      </div>
    </details>
  </section>;
}
