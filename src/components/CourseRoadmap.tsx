import React, { useId } from 'react';
import { Check, ChevronDown, ChevronRight, LockKeyhole } from 'lucide-react';
import { useLocale } from '../i18n';
import '../styles/courses.css';

export interface CourseRoadmapProps {
  lessons: { id: string; title: string; minutes: number; goal?: string }[];
  completedLessonIds: string[];
  currentLessonId?: string;
  availableLessonIds?: string[];
  onOpenLesson?: (id: string) => void;
  compact?: boolean;
  language?: string;
}

const labels = {
  en: { name: 'Course roadmap', completed: 'Completed', current: 'Next lesson', later: 'Not available yet', cue: 'Follow the numbered lessons in order', scroll: 'Scroll to see all lessons', lesson: 'Lesson' },
  tr: { name: 'Kurs yol haritası', completed: 'Tamamlandı', current: 'Sonraki ders', later: 'Henüz açılmadı', cue: 'Numaralı dersleri sırayla izle', scroll: 'Tüm dersleri görmek için kaydır', lesson: 'Ders' },
  es: { name: 'Mapa del curso', completed: 'Completada', current: 'Siguiente lección', later: 'Todavía no disponible', cue: 'Sigue las lecciones numeradas en orden', scroll: 'Desplázate para ver todas las lecciones', lesson: 'Lección' },
};

/** Real lesson sequence. Compact mode stays horizontal; mobile adapts to a vertical path. */
export function CourseRoadmap({ lessons, completedLessonIds, currentLessonId, availableLessonIds, onOpenLesson, compact = false, language }: CourseRoadmapProps) {
  const [locale] = useLocale();
  const copy = labels[locale] ?? labels.en;
  const cueId = useId();
  const completed = new Set(completedLessonIds);
  return <div className={`oda-course-roadmap${compact ? ' oda-course-roadmap--compact' : ''}`}>
    <p id={cueId} className="oda-course-roadmap-cue">{compact ? <ChevronRight size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}{compact ? copy.scroll : copy.cue}</p>
    <ol aria-label={copy.name} aria-describedby={cueId}>
      {lessons.map((lesson, index) => {
        const done = completed.has(lesson.id);
        const current = lesson.id === currentLessonId;
        const unlocked = !availableLessonIds || availableLessonIds.includes(lesson.id);
        const status = done ? copy.completed : current ? copy.current : !unlocked ? copy.later : '';
        const body = <><span className="oda-course-roadmap-number" aria-hidden="true">{done ? <Check size={17} /> : index + 1}</span><span className="oda-course-roadmap-copy"><span className="oda-course-roadmap-title" lang={language}>{lesson.title}</span><span className="oda-course-roadmap-meta"><span>{lesson.minutes} min</span>{status && <span> · {status}</span>}</span>{!compact && lesson.goal && <span className="oda-course-roadmap-goal" lang={language}>{lesson.goal}</span>}</span>{!unlocked && <LockKeyhole size={14} className="oda-course-roadmap-lock" aria-hidden="true" />}</>;
        return <li key={lesson.id} data-course-roadmap-lesson={lesson.id} data-course-overview-lesson={!compact ? lesson.id : undefined} data-completed={done} data-current={current}>
          {onOpenLesson ? <button type="button" disabled={!unlocked} aria-current={current ? 'step' : undefined} aria-label={`${copy.lesson} ${index + 1}: ${lesson.title}, ${lesson.minutes} min${status ? `, ${status}` : ''}`} onClick={() => onOpenLesson(lesson.id)}>{body}</button> : <div aria-current={current ? 'step' : undefined}>{body}</div>}
        </li>;
      })}
    </ol>
  </div>;
}
