import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3, ExternalLink, LockKeyhole } from 'lucide-react';
import { COURSES, COURSE_SOURCES, type GuidedCourse } from '../data/courses';
import { canCompleteLesson, completeLesson, getLessonProgress, nextLessonIndex, readCourseProgress, saveCourseProgress, updateLessonProgress } from '../services/courseProgress';
import { CourseArtwork } from '../components/CourseArtwork';
import { useLocale } from '../i18n';
import '../styles/courses.css';

const SELECTION_KEY = 'oda_course_selection_v1';
function readSelection() {
  try { const id = localStorage.getItem(SELECTION_KEY); return COURSES.some(course => course.id === id) ? id : null; } catch { return null; }
}

export const Courses: React.FC = () => {
  const [locale] = useLocale();
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

  const commit = (next: typeof state) => { setState(next); setStorageError(!saveCourseProgress(next)); };
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
  const languageNote = locale !== 'tr' && <p lang={locale} className="text-xs text-[var(--fg-muted)] mt-3">{locale === 'es' ? 'Los cursos están disponibles en turco por ahora.' : 'Course lessons are currently available in Turkish.'}</p>;
  const storageNote = <p className={`text-xs leading-relaxed ${storageError ? 'text-[var(--brand-burgundy)]' : 'text-[var(--fg-muted)]'}`} role={storageError ? 'alert' : undefined}>{storageError ? 'Bu tarayıcı şu an ilerlemeyi kaydedemiyor. Sayfayı kapatırsan bu oturumdaki değişiklikler kaybolabilir.' : 'İlerlemen ve isteğe bağlı notların bu tarayıcıda saklanır. Buluta gönderilmez; tarayıcı verileri silinirse kaybolur. Ortak cihaz kullanıyorsan kişisel not bırakmamayı seçebilirsin.'}</p>;

  if (!course) return <div lang="tr" className="oda-courses">
    <header className="oda-course-intro">
      <div>
        <p className="oda-course-eyebrow">ODA / Yönlendirmeli kurslar</p>
        <h1 ref={titleRef} tabIndex={-1} className="oda-display oda-course-title outline-none scroll-mt-16">Korksan da<br /><span className="text-[var(--accent)]">başlayabilirsin.</span></h1>
        <p className="oda-course-intro-copy">Bazen bir söz cesaret verir. Bazen de sıradaki adımı birlikte görmek gerekir. Kendine bir konu seç; kısa derslerle, kendi hızında ilerle.</p>
        {languageNote}
      </div>
      <div className="oda-course-method">
        <p className="oda-course-method-path"><span>Anla</span><ArrowRight size={13} aria-hidden="true" /><span>Dene</span><ArrowRight size={13} aria-hidden="true" /><span>Pekiştir</span></p>
        <p>{COURSES.length} kurs · {COURSES.reduce((sum, item) => sum + item.lessons.length, 0)} ders<br />Her derste kendine ayıracağın 6–8 dakika.</p>
        <button type="button" onClick={() => { researchRef.current?.scrollIntoView({ block: 'start' }); researchRef.current?.focus(); }} className="oda-course-research-link">{researchSources.length} bilimsel yayına dayanan içerik<ArrowRight size={13} aria-hidden="true" /></button>
      </div>
    </header>

    {resumeCourse && <section className="oda-course-resume" aria-label="Başladığın kursa devam et">
      <div>
        <p className="oda-course-eyebrow">Kaldığın yerden</p>
        <h2 className="oda-display">{resumeCourse.title}</h2>
        <p className="text-sm leading-relaxed text-[var(--fg-muted)]">Ders {nextLessonIndex(state, resumeCourse) + 1} · {resumeCourse.lessons[nextLessonIndex(state, resumeCourse)].title}</p>
        <p className="text-xs text-[var(--fg-muted)] mt-2">{countCompleted(resumeCourse)}/{resumeCourse.lessons.length} ders tamamlandı</p>
      </div>
      <button type="button" onClick={() => open(resumeCourse)} className="oda-course-primary shrink-0">Devam et<ArrowRight size={16} aria-hidden="true" /></button>
    </section>}

    <section aria-labelledby="course-list-title">
      <div className="oda-course-section-heading"><h2 id="course-list-title" className="oda-display">{resumeCourse ? 'Diğer yolları da keşfet' : 'Bugün hangi konu sana yakın?'}</h2><p>Bir konu seç. Bir küçük adımla başla.</p></div>
      <div className="oda-course-list">{COURSES.map((item, i) => {
        const completed = countCompleted(item);
        const hasStarted = started(item);
        return <button key={item.id} type="button" onClick={() => open(item)} className="oda-course-row">
          <span className="oda-course-art-wrap"><span className="oda-course-row-number" aria-hidden="true">0{i + 1}</span><CourseArtwork courseId={item.id} /></span>
          <span className="oda-course-row-content">
            <span className="oda-display oda-course-row-title">{item.title}</span>
            <span className="oda-course-row-subtitle">{item.subtitle}</span>
            <span className="oda-course-row-description">{item.description}</span>
            <span className="oda-course-row-meta"><span>{item.lessons.length} ders · {item.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0)} dk</span><span className="oda-course-row-state">{completed === item.lessons.length ? 'Tamamlandı · tekrar bak' : hasStarted ? `${completed}/${item.lessons.length} tamamlandı · devam et` : 'Kursa başla'}</span></span>
            {completed > 0 && <span role="progressbar" aria-label={`${item.title} ilerlemesi`} aria-valuenow={completed} aria-valuemin={0} aria-valuemax={item.lessons.length} className="oda-course-progress"><span className="oda-course-progress-fill" style={{ width: `${completed / item.lessons.length * 100}%` }} /></span>}
          </span>
          <ChevronRight className="oda-course-row-arrow" size={20} aria-hidden="true" />
        </button>;
      })}</div>
    </section>
    <div className="oda-course-storage">{storageNote}</div>
    <section ref={researchRef} id="course-research" tabIndex={-1} aria-labelledby="course-research-title" className="oda-course-research">
      <div className="oda-course-research-intro"><p className="oda-course-eyebrow mb-2">Merak edersen</p><h2 id="course-research-title" className="oda-display">Bu dersler neye dayanıyor?</h2><p className="text-sm text-[var(--fg-muted)] leading-relaxed mt-3 mb-5">Dersler yazılmadan önce altı bilimsel yayın incelendi. Araştırma bulguları, özgün günlük alıştırmalara uyarlandı. ODA kurslarının kendisi klinik olarak sınanmadı; eğitim ve kişisel çalışma içindir.</p></div>
      {researchSources.map(source => <details key={source.id} className="py-2"><summary className="min-h-11 py-3 cursor-pointer text-sm font-medium">{source.title}</summary><p className="text-sm leading-relaxed text-[var(--fg-muted)]">{source.finding}</p><p className="text-xs leading-relaxed mt-2 text-[var(--fg-muted)]">{source.limitation}</p><a href={source.url} target="_blank" rel="noopener noreferrer" className="oda-course-research-link">Yayını oku<ExternalLink size={12} aria-hidden="true" /></a></details>)}
    </section>
  </div>;

  const lesson = course.lessons[index];
  const progress = getLessonProgress(state, lesson);
  const completed = countCompleted(course);
  const eligible = canCompleteLesson(progress, lesson);
  const answerCorrect = progress.answer === lesson.correct;
  const goNext = () => { setIndex(value => Math.min(value + 1, course.lessons.length - 1)); setNotice(''); };
  const patch = (value: Parameters<typeof updateLessonProgress>[2]) => { commit(updateLessonProgress(state, lesson, value)); setNotice(''); };

  return <div lang="tr" className="oda-courses oda-course-lesson space-y-7">
    <button type="button" onClick={() => open()} className="inline-flex items-center gap-2 min-h-11 text-sm text-[var(--fg-muted)] cursor-pointer"><ArrowLeft size={16} aria-hidden="true" />Tüm kurslar</button>
    <header className="oda-course-lesson-header">
      <div className="oda-course-lesson-header-copy"><p className="oda-course-eyebrow">{course.title} / Ders {index + 1} / {course.lessons.length}</p><h1 ref={titleRef} tabIndex={-1} className="oda-display oda-course-lesson-title outline-none scroll-mt-16">{lesson.title}</h1><p className="flex items-center gap-2 text-xs text-[var(--fg-muted)]"><Clock3 size={14} aria-hidden="true" />Yaklaşık {lesson.minutes} dakika · kendi hızında</p>{languageNote}</div>
      <CourseArtwork courseId={course.id} />
    </header>
    <nav aria-label="Ders sırası" className="oda-course-steps">{course.lessons.map((item, i) => {
      const done = getLessonProgress(state, item).completed;
      const unlocked = i === 0 || getLessonProgress(state, course.lessons[i - 1]).completed;
      return <button key={item.id} type="button" disabled={!unlocked} data-completed={done} aria-current={i === index ? 'step' : undefined} aria-label={`Ders ${i + 1}: ${item.title}${done ? ', tamamlandı' : !unlocked ? ', önceki dersi tamamla' : ''}`} onClick={() => { setIndex(i); setNotice(''); }} className="oda-course-step">{done ? <Check size={15} aria-hidden="true" /> : !unlocked ? <LockKeyhole size={12} aria-hidden="true" /> : null}{i + 1}</button>;
    })}</nav>
    <p className="text-xs leading-relaxed text-[var(--fg-muted)]">{course.scope}</p>
    <section className="oda-course-goal"><p className="text-xs font-semibold text-[var(--accent)]">Bu dersin küçük hedefi</p><p>{lesson.goal}</p></section>

    <section className="oda-course-stage" aria-labelledby="course-understand-title">
      <h2 id="course-understand-title" className="oda-course-stage-title"><span className="oda-course-stage-number" aria-hidden="true">01</span><span className="oda-display">Anla</span></h2>
      <div className="oda-course-reading">{lesson.reading.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
    </section>

    <section className="oda-course-stage" aria-labelledby="course-practice-title">
      <h2 id="course-practice-title" className="oda-course-stage-title"><span className="oda-course-stage-number" aria-hidden="true">02</span><span className="oda-display">Dene</span></h2>
      <p className="text-sm text-[var(--fg-muted)] mt-3 leading-relaxed">Şimdi birlikte deneyelim. Her adımı denedikten sonra işaretle. İstediğin zaman ara verebilirsin.</p>
      <div className="oda-course-practice">{lesson.practice.map((step, i) => <label key={step} className="oda-course-practice-step" data-checked={progress.checked[i] ?? false}><input type="checkbox" checked={progress.checked[i] ?? false} disabled={progress.completed} onChange={event => patch({ checked: lesson.practice.map((_, j) => i === j ? event.target.checked : !!progress.checked[j]) })} /><span><span className="font-semibold mr-1">{i + 1}.</span>{step}</span></label>)}</div>
    </section>

    <section className="oda-course-reflection"><label htmlFor="course-reflection" className="block text-sm font-semibold leading-relaxed">{lesson.reflection}</label><p id="reflection-note" className="text-xs text-[var(--fg-muted)] mt-2 leading-relaxed">Not bırakmak isteğe bağlı; yanıtını yalnızca kendin için tutabilirsin.</p><textarea id="course-reflection" aria-describedby="reflection-note" value={progress.reflection} onChange={event => patch({ reflection: event.target.value })} maxLength={2000} rows={3} placeholder="Kendime küçük bir not…" /></section>

    <fieldset aria-describedby="lesson-question" className="oda-course-quiz space-y-3"><legend className="oda-course-stage-title pr-3"><span className="oda-course-stage-number" aria-hidden="true">03</span><span className="oda-display">Pekiştir</span></legend><p className="text-xs text-[var(--fg-muted)]">Kısa bir kontrol</p><p id="lesson-question" className="text-base leading-relaxed pb-1">{lesson.question}</p>{lesson.options.map((option, i) => <label key={option} className="oda-course-option" data-selected={progress.answer === i}><input type="radio" name={`answer-${lesson.id}`} checked={progress.answer === i} disabled={progress.completed} onChange={() => patch({ answer: i })} /><span>{option}</span></label>)}{progress.answer !== null && <div role="status" className={`text-sm leading-relaxed p-4 border-l-2 ${answerCorrect ? 'border-[var(--accent)]' : 'border-[var(--brand-burgundy)]'}`}><p className="font-semibold mb-1">{answerCorrect ? 'Evet, bu yaklaşım dersin amacına uygun.' : 'Bir kez daha düşünelim.'}</p>{lesson.feedback}{!answerCorrect && <p className="mt-2 text-xs">Açıklamaya dönüp başka bir yanıt seçebilirsin.</p>}</div>}</fieldset>

    <details className="border-y border-[var(--border)] py-2"><summary className="min-h-11 py-3 text-sm font-semibold cursor-pointer">Bu dersin kaynakları ve sınırları</summary><div className="space-y-4 py-3">{lesson.sources.map(id => COURSE_SOURCES.find(source => source.id === id)!).map(source => <article key={source.id}><p className="text-[11px] uppercase tracking-wide text-[var(--accent)]">{source.type === 'research' ? 'Bilimsel yayın' : source.type === 'religious' ? 'Dinî kaynak' : 'Resmî sağlık rehberi'}</p><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-11 text-sm font-medium underline underline-offset-4">{source.title}<ExternalLink size={12} className="shrink-0" aria-hidden="true" /></a><p className="text-xs leading-relaxed text-[var(--fg-muted)]">{source.finding}</p><p className="text-xs leading-relaxed text-[var(--fg-muted)] mt-2">{source.limitation}</p></article>)}</div></details>
    {progress.completed ? <section className="oda-course-finish space-y-3"><p className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"><Check size={18} aria-hidden="true" />{completed === course.lessons.length ? 'Kurs tamamlandı' : 'Bu ders tamamlandı'}</p><p className="oda-display text-2xl leading-relaxed">{lesson.takeaway}</p>{completed === course.lessons.length && <p className="text-sm text-[var(--fg-muted)] leading-relaxed">Yanına alacağın şey: {course.outcome} Dersleri dilediğinde tekrar okuyabilirsin.</p>}<button type="button" onClick={index < course.lessons.length - 1 ? goNext : () => open()} className="oda-course-primary">{index < course.lessons.length - 1 ? 'Sonraki derse geç' : 'Kurslara dön'}<ArrowRight size={16} aria-hidden="true" /></button></section> : <div className="space-y-3"><p className="text-xs text-[var(--fg-muted)] leading-relaxed">Dersi tamamlamak için üç uygulama adımını işaretle ve sorunun uygun yanıtını seç. Kişisel not zorunlu değildir.</p><button type="button" disabled={!eligible} onClick={() => { commit(completeLesson(state, course, index)); setNotice('Ders tamamlandı. Hazır olduğunda sonraki adıma geçebilirsin.'); }} className="oda-course-primary w-full">Dersi tamamla<Check size={16} aria-hidden="true" /></button></div>}
    <p role="status" className="text-xs text-[var(--accent)]">{notice}</p>{storageNote}
  </div>;
};
