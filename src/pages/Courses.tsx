import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3, ExternalLink, GraduationCap, LockKeyhole } from 'lucide-react';
import { COURSES, COURSE_SOURCES, type GuidedCourse } from '../data/courses';
import { canCompleteLesson, completeLesson, getLessonProgress, nextLessonIndex, readCourseProgress, saveCourseProgress, updateLessonProgress } from '../services/courseProgress';
import { useLocale } from '../i18n';

const SELECTION_KEY = 'oda_course_selection_v1';
function readSelection() {
  try { const id = localStorage.getItem(SELECTION_KEY); return COURSES.some(course => course.id === id) ? id : null; } catch { return null; }
}

export const Courses: React.FC = () => {
  const [locale] = useLocale();
  const [state, setState] = useState(readCourseProgress);
  const [selected, setSelected] = useState<string | null>(readSelection);
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
    setSelected(item?.id ?? null); setIndex(item ? Math.min(nextLessonIndex(state, item), item.lessons.length - 1) : 0); setNotice('');
    try { if (item) localStorage.setItem(SELECTION_KEY, item.id); else localStorage.removeItem(SELECTION_KEY); } catch { /* Course remains usable. */ }
  };
  const countCompleted = (item: GuidedCourse) => item.lessons.filter(lesson => getLessonProgress(state, lesson).completed).length;
  const languageNote = locale !== 'tr' && <p lang={locale} className="text-xs text-[var(--fg-muted)]">{locale === 'es' ? 'Los cursos están disponibles en turco por ahora.' : 'Course lessons are currently available in Turkish.'}</p>;
  const storageNote = <p className={`text-xs leading-relaxed ${storageError ? 'text-[var(--danger)]' : 'text-[var(--fg-muted)]'}`} role={storageError ? 'alert' : undefined}>{storageError ? 'Bu tarayıcı şu an ilerlemeyi kaydedemiyor. Sayfayı kapatırsan bu oturumdaki değişiklikler kaybolabilir.' : 'İlerlemen ve isteğe bağlı notların bu tarayıcıda saklanır. Buluta gönderilmez; tarayıcı verileri silinirse kaybolur. Ortak cihaz kullanıyorsan kişisel not bırakmamayı seçebilirsin.'}</p>;

  if (!course) return <div lang="tr" className="space-y-7">
    <header className="space-y-3"><p className="text-xs font-semibold tracking-[0.12em] text-[var(--accent)]">ODA / YÖNLENDİRMELİ KURSLAR</p><h1 ref={titleRef} tabIndex={-1} className="text-3xl sm:text-4xl font-semibold leading-tight tracking-tight outline-none scroll-mt-16">Korksan da<br /><span className="text-[var(--accent)]">başlayabilirsin.</span></h1><p className="text-sm leading-relaxed text-[var(--fg-muted)] max-w-lg">Bazen bir söz cesaret verir. Bazen de sıradaki adımı birlikte görmek gerekir. Kendine bir konu seç; kısa derslerle, kendi hızında ilerle.</p>{languageNote}</header>
    <section className="bg-[#173e35] text-[#f7f3ea] rounded-[var(--radius-lg)] p-5 sm:p-6 flex items-start gap-4"><GraduationCap size={26} className="shrink-0 mt-1" /><div><h2 className="font-semibold">Oku. Dene. Kendine göre uyarla.</h2><p className="text-sm leading-relaxed mt-2 text-[#dce6df]">5 kurs · 25 ders · her derste yaklaşık 6–8 dakika.<br />Uygulamanı yap, kısa soruyla pekiştir ve sonraki adıma geç.</p><button type="button" onClick={() => { researchRef.current?.scrollIntoView({ block: 'start' }); researchRef.current?.focus(); }} className="inline-flex items-center gap-2 min-h-11 text-xs underline underline-offset-4">6 bilimsel yayına dayanan içerik<ArrowRight size={13} /></button></div></section>
    <section aria-label="Kurs seç" className="divide-y divide-[var(--border)] border-y border-[var(--border)]">{COURSES.map((item, i) => {
      const completed = countCompleted(item);
      return <button key={item.id} type="button" onClick={() => open(item)} className="group w-full text-left py-6 flex gap-4 items-start rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]">
        <span className="text-xs pt-1 font-semibold tabular-nums text-[#8a3042]">0{i + 1}</span><span className="flex-1 min-w-0"><span className="block text-xl font-semibold tracking-tight">{item.title}</span><span className="block text-sm font-medium mt-1 text-[var(--accent)]">{item.subtitle}</span><span className="block text-sm leading-relaxed mt-2 text-[var(--fg-muted)]">{item.description}</span><span className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-[var(--fg-muted)]"><span>{item.lessons.length} ders · {item.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0)} dk</span><span className="font-semibold text-[var(--accent)]">{completed === item.lessons.length ? 'Tamamlandı · tekrar bak' : completed ? `${completed}/${item.lessons.length} tamamlandı · devam et` : 'Kursa başla'}</span></span>{completed > 0 && <span role="progressbar" aria-label={`${item.title} ilerlemesi`} aria-valuenow={completed} aria-valuemin={0} aria-valuemax={item.lessons.length} className="block mt-3 h-1 rounded-full bg-[var(--bg-muted)]"><span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${completed / item.lessons.length * 100}%` }} /></span>}</span><ChevronRight className="shrink-0 mt-1 text-[var(--accent)] group-hover:translate-x-1 transition-transform motion-reduce:transition-none" size={20} /></button>;
    })}</section>
    {storageNote}
    <section ref={researchRef} id="course-research" tabIndex={-1} aria-label="Bilimsel kaynaklar" className="scroll-mt-16 space-y-4"><div><h2 className="text-xl font-semibold">Bu dersler neye dayanıyor?</h2><p className="text-sm text-[var(--fg-muted)] leading-relaxed mt-2">Dersler yazılmadan önce altı bilimsel yayın incelendi. Araştırma bulguları, özgün günlük alıştırmalara uyarlandı. ODA kurslarının kendisi klinik olarak sınanmadı; eğitim ve kişisel çalışma içindir.</p></div>{COURSE_SOURCES.filter(source => source.type === 'research').map(source => <details key={source.id} className="border-b border-[var(--border)] pb-3"><summary className="min-h-11 py-3 cursor-pointer text-sm font-medium">{source.title}</summary><p className="text-sm leading-relaxed text-[var(--fg-muted)]">{source.finding}</p><p className="text-xs leading-relaxed mt-2 text-[var(--fg-muted)]">{source.limitation}</p><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] min-h-11 underline underline-offset-4">Yayını oku<ExternalLink size={12} /></a></details>)}</section>
  </div>;

  const lesson = course.lessons[index];
  const progress = getLessonProgress(state, lesson);
  const completed = countCompleted(course);
  const eligible = canCompleteLesson(progress, lesson);
  const answerCorrect = progress.answer === lesson.correct;
  const goNext = () => { setIndex(value => Math.min(value + 1, course.lessons.length - 1)); setNotice(''); };
  const patch = (value: Parameters<typeof updateLessonProgress>[2]) => { commit(updateLessonProgress(state, lesson, value)); setNotice(''); };

  return <div lang="tr" className="space-y-6">
    <button type="button" onClick={() => open()} className="inline-flex items-center gap-2 min-h-11 text-sm text-[var(--fg-muted)]"><ArrowLeft size={16} />Tüm kurslar</button>
    <header className="space-y-2"><p className="text-xs font-semibold tracking-wide text-[var(--accent)]">{course.title} / Ders {index + 1} / {course.lessons.length}</p><h1 ref={titleRef} tabIndex={-1} className="text-3xl sm:text-4xl leading-tight font-semibold tracking-tight outline-none scroll-mt-16">{lesson.title}</h1><p className="flex items-center gap-2 text-xs text-[var(--fg-muted)]"><Clock3 size={14} />Yaklaşık {lesson.minutes} dakika · kendi hızında</p>{languageNote}</header>
    <nav aria-label="Ders sırası" className="grid grid-cols-5 gap-2">{course.lessons.map((item, i) => {
      const done = getLessonProgress(state, item).completed;
      const unlocked = i === 0 || getLessonProgress(state, course.lessons[i - 1]).completed;
      return <button key={item.id} type="button" disabled={!unlocked} aria-current={i === index ? 'step' : undefined} aria-label={`Ders ${i + 1}: ${item.title}${done ? ', tamamlandı' : !unlocked ? ', önceki dersi tamamla' : ''}`} onClick={() => { setIndex(i); setNotice(''); }} className={`min-h-11 flex items-center justify-center gap-1.5 rounded-full border text-sm disabled:opacity-45 ${i === index ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border)]'}`}>{done ? <Check size={15} /> : !unlocked ? <LockKeyhole size={12} /> : null}{i + 1}</button>;
    })}</nav>
    <p className="text-xs leading-relaxed text-[var(--fg-muted)]">{course.scope}</p>
    <section className="rounded-[var(--radius-lg)] bg-[#173e35] p-5 sm:p-6 text-[#f7f3ea]"><p className="text-xs text-[#dce6df] mb-2">Bu dersin küçük hedefi</p><p className="text-lg leading-relaxed font-medium">{lesson.goal}</p></section>
    <section className="space-y-4" aria-label="Ders açıklaması">{lesson.reading.map(paragraph => <p key={paragraph} className="text-[16px] leading-[1.8]">{paragraph}</p>)}</section>
    <section className="border-t border-[var(--border)] pt-6 space-y-4"><div><h2 className="text-xl font-semibold">Şimdi birlikte deneyelim</h2><p className="text-sm text-[var(--fg-muted)] mt-1">Her adımı denedikten sonra işaretle. İstediğin zaman ara verebilirsin.</p></div>{lesson.practice.map((step, i) => <label key={step} className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] cursor-pointer"><input type="checkbox" checked={progress.checked[i] ?? false} disabled={progress.completed} onChange={event => patch({ checked: lesson.practice.map((_, j) => i === j ? event.target.checked : !!progress.checked[j]) })} className="mt-1 w-5 h-5 shrink-0 accent-[var(--accent)]" /><span className="text-sm leading-relaxed"><span className="font-semibold mr-1">{i + 1}.</span>{step}</span></label>)}</section>
    <section className="space-y-2"><label htmlFor="course-reflection" className="block font-semibold">{lesson.reflection}</label><p id="reflection-note" className="text-xs text-[var(--fg-muted)]">Not bırakmak isteğe bağlı; yanıtını yalnızca kendin için tutabilirsin.</p><textarea id="course-reflection" aria-describedby="reflection-note" value={progress.reflection} onChange={event => patch({ reflection: event.target.value })} maxLength={2000} rows={3} placeholder="Kendime küçük bir not…" className="w-full rounded-[var(--radius-md)] border border-[var(--border)] p-4 bg-[var(--bg)] text-sm resize-y focus:outline-[var(--accent)]" /></section>
    <fieldset aria-describedby="lesson-question" className="space-y-3 border-t border-[var(--border)] pt-6"><legend className="text-xl font-semibold pt-5">Kısa bir kontrol</legend><p id="lesson-question" className="text-sm leading-relaxed">{lesson.question}</p>{lesson.options.map((option, i) => <label key={option} className={`flex gap-3 items-start p-4 rounded-[var(--radius-md)] border cursor-pointer ${progress.answer === i ? 'border-[var(--accent)] bg-[var(--bg-muted)]' : 'border-[var(--border)]'}`}><input type="radio" name={`answer-${lesson.id}`} checked={progress.answer === i} disabled={progress.completed} onChange={() => patch({ answer: i })} className="w-4 h-4 mt-1 shrink-0 accent-[var(--accent)]" /><span className="text-sm leading-relaxed">{option}</span></label>)}{progress.answer !== null && <div role="status" className={`text-sm leading-relaxed p-4 border-l-2 ${answerCorrect ? 'border-[var(--accent)]' : 'border-[#8a3042]'}`}><p className="font-semibold mb-1">{answerCorrect ? 'Evet, bu yaklaşım dersin amacına uygun.' : 'Bir kez daha düşünelim.'}</p>{lesson.feedback}{!answerCorrect && <p className="mt-2 text-xs">Açıklamaya dönüp başka bir yanıt seçebilirsin.</p>}</div>}</fieldset>
    <details className="border-y border-[var(--border)] py-2"><summary className="min-h-11 py-3 text-sm font-semibold cursor-pointer">Bu dersin kaynakları ve sınırları</summary><div className="space-y-4 py-3">{lesson.sources.map(id => COURSE_SOURCES.find(source => source.id === id)!).map(source => <article key={source.id}><p className="text-[11px] uppercase tracking-wide text-[var(--accent)]">{source.type === 'research' ? 'Bilimsel yayın' : source.type === 'religious' ? 'Dinî kaynak' : 'Resmî sağlık rehberi'}</p><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 min-h-11 text-sm font-medium underline underline-offset-4">{source.title}<ExternalLink size={12} className="shrink-0" /></a><p className="text-xs leading-relaxed text-[var(--fg-muted)]">{source.finding}</p><p className="text-xs leading-relaxed text-[var(--fg-muted)] mt-2">{source.limitation}</p></article>)}</div></details>
    {progress.completed ? <section className="rounded-[var(--radius-lg)] bg-[var(--bg-muted)] p-5 space-y-3"><p className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]"><Check size={18} />{completed === course.lessons.length ? 'Kurs tamamlandı' : 'Bu ders tamamlandı'}</p><p className="text-lg font-medium leading-relaxed">{lesson.takeaway}</p>{completed === course.lessons.length && <p className="text-sm text-[var(--fg-muted)] leading-relaxed">Yanına alacağın şey: {course.outcome} Dersleri dilediğinde tekrar okuyabilirsin.</p>}<button type="button" onClick={index < course.lessons.length - 1 ? goNext : () => open()} className="inline-flex items-center gap-2 min-h-12 px-5 rounded-full bg-[#8a3042] text-white text-sm font-semibold">{index < course.lessons.length - 1 ? 'Sonraki derse geç' : 'Kurslara dön'}<ArrowRight size={16} /></button></section> : <div className="space-y-3"><p className="text-xs text-[var(--fg-muted)]">Dersi tamamlamak için üç uygulama adımını işaretle ve sorunun uygun yanıtını seç. Kişisel not zorunlu değildir.</p><button type="button" disabled={!eligible} onClick={() => { commit(completeLesson(state, course, index)); setNotice('Ders tamamlandı. Hazır olduğunda sonraki adıma geçebilirsin.'); }} className="w-full min-h-12 px-5 rounded-full bg-[#8a3042] text-white font-semibold text-sm disabled:opacity-45 disabled:cursor-not-allowed">Dersi tamamla</button></div>}
    <p role="status" className="text-xs text-[var(--accent)]">{notice}</p>{storageNote}
  </div>;
};
