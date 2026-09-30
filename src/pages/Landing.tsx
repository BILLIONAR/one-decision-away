import React, { useState } from 'react';
import { ArrowDown, ArrowRight, BookOpen, Check, ChevronDown, Compass, Feather, Focus, MessageCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../store/useApp';
import { Logo } from '../components/Logo';
import { LanguagePicker } from '../components/LanguagePicker';
import { useLocale } from '../i18n';
import { landingCopy, landingCount } from '../data/landingCopy';
import { courseCatalogFor } from '../data/courseCatalog';
import { LEGAL_COMPANY, PRIVACY, TERMS } from '../data/legal';
import '../styles/landing.css';

/** An interactive example, never written to the visitor's personal record. */
const DailyPreview: React.FC<{ copy: ReturnType<typeof landingCopy> }> = ({ copy: c }) => {
  const [step, setStep] = useState(0);
  const current = c.preview[step];
  return (
    <figure className="oda-landing-preview">
      <div className="oda-landing-preview-stage">
        <div className="oda-landing-doorway" aria-hidden="true"><span /><span /></div>
        <div className="oda-landing-preview-caption"><span>{c.previewLabel}</span><Logo className="oda-landing-preview-logo" /></div>
        <div className="oda-landing-preview-card">
          <div className="oda-landing-preview-card-top"><p>{current.label}</p><span aria-hidden="true">ODA</span></div>
          <div id="oda-preview-content" className="oda-landing-preview-content" aria-live="polite" aria-atomic="true">
            <h2 className="oda-landing-preview-title">{current.title}</h2>
            <div className="oda-landing-preview-answer"><p>{current.prompt}</p><p>{current.answer}</p></div>
            <p className="oda-landing-preview-detail">{current.detail}</p>
            <div className="oda-landing-preview-time"><span className={step === 2 ? 'is-complete' : ''} aria-hidden="true">{step === 2 ? <Check size={15} /> : <span />}</span>{current.time}</div>
          </div>
          <div className="oda-landing-preview-controls" role="group" aria-label={c.previewHint}>
            {c.previewSteps.map((label, i) => <button key={label} type="button" aria-pressed={i === step} aria-controls="oda-preview-content" onClick={() => setStep(i)}><span aria-hidden="true">0{i + 1}</span>{label}</button>)}
          </div>
        </div>
        <span className="oda-landing-preview-coordinate" aria-hidden="true">01 — ∞</span>
      </div>
      <figcaption>{c.previewNote}</figcaption>
    </figure>
  );
};

export const Landing: React.FC = () => {
  const { setActiveRoute } = useApp();
  const [locale] = useLocale();
  const c = landingCopy(locale);
  const catalog = courseCatalogFor(locale);
  const featured = ['turning-day', 'procrastination', 'focus'].map(id => catalog.find(course => course.id === id)).filter(course => course !== undefined);
  const lessons = catalog.reduce((sum, course) => sum + course.lessonCount, 0);
  const steps = [
    { title: c.stepOneTitle, text: c.stepOneBody, note: c.stepOneNote, icon: Compass },
    { title: c.stepTwoTitle, text: c.stepTwoBody, note: c.stepTwoNote, icon: ArrowRight },
    { title: c.stepThreeTitle, text: c.stepThreeBody, note: c.stepThreeNote, icon: Feather },
  ];
  const resources = [
    { icon: Feather, title: c.notebookTitle, text: c.notebookBody, path: '/app/notebook' },
    { icon: Compass, title: c.dreamsTitle, text: c.dreamsBody, path: '/app/dreams' },
    { icon: Focus, title: c.focusTitle, text: c.focusBody, path: '/app/focus' },
    { icon: MessageCircle, title: c.coachTitle, text: c.coachBody, path: '/app/coach', tag: c.coachTag },
  ];
  const moveTo = (id: string) => {
    const target = document.getElementById(id);
    target?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    target?.focus({ preventScroll: true });
  };
  const openCourse = (id: string) => {
    try { localStorage.setItem('oda_course_selection_v1', id); } catch { /* The library still opens if storage is unavailable. */ }
    setActiveRoute('/app/courses');
  };

  return (
    <div className="oda-landing" lang={locale}>
      <button type="button" onClick={() => moveTo('oda-landing-main')} className="oda-landing-skip">{c.skip}</button>
      <header className="oda-landing-shell oda-landing-nav">
        <div className="oda-landing-brand"><Logo className="oda-landing-brand-mark" /><div><span>ODA</span><span>ONE DECISION AWAY</span></div></div>
        <nav className="oda-landing-nav-actions" aria-label={c.mainNavigation}>
          <button type="button" onClick={() => moveTo('oda-method')} className="oda-landing-nav-link">{c.methodNav}</button>
          <button type="button" onClick={() => moveTo('oda-discover')} className="oda-landing-nav-link">{c.coursesNav}</button>
          <LanguagePicker />
          <button type="button" onClick={() => setActiveRoute('/app')} className="oda-landing-button oda-landing-button-plain">{c.open}<ArrowRight size={15} aria-hidden="true" /></button>
        </nav>
      </header>

      <main id="oda-landing-main" tabIndex={-1}>
        <section className="oda-landing-shell oda-landing-hero" aria-labelledby="landing-title">
          <div className="oda-landing-hero-copy">
            <p className="oda-landing-kicker"><span aria-hidden="true" />{c.eyebrow}</p>
            <h1 id="landing-title" className="oda-landing-title">{c.title} <em>{c.titleAccent}</em></h1>
            <p className="oda-landing-introduction">{c.introduction}</p>
            <div className="oda-landing-hero-actions">
              <button type="button" onClick={() => setActiveRoute('/app')} className="oda-landing-button oda-landing-button-primary">{c.start}<ArrowRight size={18} aria-hidden="true" /></button>
              <button type="button" onClick={() => moveTo('oda-method')} className="oda-landing-link">{c.explore}<ArrowDown size={15} aria-hidden="true" /></button>
            </div>
            <p className="oda-landing-privacy"><ShieldCheck size={15} aria-hidden="true" />{c.privacy}</p>
          </div>
          <DailyPreview copy={c} />
        </section>

        <div className="oda-landing-shell oda-landing-principle"><p>{c.principle}</p><span>{c.principleNote}<Logo className="oda-landing-principle-mark" /></span></div>

        <section id="oda-method" tabIndex={-1} className="oda-landing-shell oda-landing-method" aria-labelledby="landing-method-title">
          <div className="oda-landing-section-intro"><p className="oda-landing-kicker">{c.methodLabel}</p><h2 id="landing-method-title" className="oda-landing-section-heading">{c.methodTitle}</h2></div>
          <div className="oda-landing-steps">{steps.map(({ title, text, note, icon: Icon }, i) => <article key={title} className="oda-landing-step"><div className="oda-landing-step-top"><span className="oda-landing-step-number" aria-hidden="true">0{i + 1}</span><Icon size={22} strokeWidth={1.4} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p><p className="oda-landing-step-note"><Check size={14} aria-hidden="true" />{note}</p></article>)}</div>
        </section>

        <section id="oda-discover" tabIndex={-1} className="oda-landing-discover" aria-labelledby="landing-discover-title">
          <div className="oda-landing-shell">
            <div className="oda-landing-discover-header"><div><p className="oda-landing-kicker">{c.discoverLabel}</p><h2 id="landing-discover-title" className="oda-landing-section-heading">{c.discoverTitle}</h2></div><div><p>{c.discoverBody}</p><p className="oda-landing-course-count"><span>{landingCount(c.courseCount, 'courses', catalog.length, locale)}</span><span aria-hidden="true">/</span><span>{landingCount(c.lessonCount, 'lessons', lessons, locale)}</span></p></div></div>
            <div className="oda-landing-course-grid">{featured.map((course, i) => <article key={course.id} className={`oda-landing-course oda-landing-course-${i}`}>
              <div className="oda-landing-course-art" aria-hidden="true"><span /><span /><span /><span /><span className="oda-landing-course-art-number">0{i + 1}</span></div>
              <div className="oda-landing-course-content"><p className="oda-landing-course-label">{c.courseThemes[i]}</p><h3 lang={course.lang}>{course.title}</h3><p className="oda-landing-course-meta">{landingCount(c.lessonUnit, 'count', course.lessonCount, locale)}<span aria-hidden="true"> · </span>{landingCount(c.minutesUnit, 'count', course.minutes, locale)}</p><p className="oda-landing-course-outcome-label">{c.courseOutcome}</p><p lang={course.lang} className="oda-landing-course-outcome">{course.outcome}</p><button type="button" onClick={() => openCourse(course.id)} className="oda-landing-link" aria-label={`${c.courseOpen}: ${course.title}`}>{c.courseOpen}<ArrowRight size={17} aria-hidden="true" /></button></div>
            </article>)}</div>
            <div className="oda-landing-course-bottom"><p>{c.courseNote}</p><button type="button" onClick={() => setActiveRoute('/app/courses')} className="oda-landing-button oda-landing-button-plain">{c.courseCta}<BookOpen size={17} aria-hidden="true" /></button></div>
          </div>
        </section>

        <section className="oda-landing-shell oda-landing-library" aria-labelledby="landing-library-title">
          <div className="oda-landing-library-intro"><p className="oda-landing-kicker">{c.libraryLabel}</p><h2 id="landing-library-title" className="oda-landing-section-heading">{c.libraryTitle}</h2><div className="oda-landing-library-emblem" aria-hidden="true"><Logo className="oda-landing-library-mark" /><span>ODA</span></div></div>
          <div className="oda-landing-resources">{resources.map(({ icon: Icon, title, text, path, tag }) => <button key={path} type="button" onClick={() => setActiveRoute(path)} className="oda-landing-resource"><span className="oda-landing-resource-icon"><Icon size={23} strokeWidth={1.4} aria-hidden="true" /></span><span className="oda-landing-resource-copy"><span className="oda-landing-resource-title">{title}</span><span className="oda-landing-resource-body">{text}</span>{tag && <span className="oda-landing-resource-tag">{tag}</span>}</span><ArrowRight size={18} className="oda-landing-resource-arrow" aria-hidden="true" /></button>)}</div>
        </section>

        <section className="oda-landing-trust" aria-labelledby="landing-trust-title"><div className="oda-landing-shell"><p className="oda-landing-kicker">{c.trustLabel}</p><h2 id="landing-trust-title" className="oda-landing-section-heading">{c.trustTitle}</h2><div className="oda-landing-trust-items">{c.trustItems.map((item, i) => <article key={item.title}><span aria-hidden="true">0{i + 1}</span><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></div></section>

        <section className="oda-landing-shell oda-landing-faq" aria-labelledby="landing-faq-title"><h2 id="landing-faq-title" className="oda-landing-section-heading">{c.faqTitle}</h2><div>{c.faqs.map(faq => <details key={faq.question}><summary>{faq.question}<ChevronDown size={18} aria-hidden="true" /></summary><p>{faq.answer}</p></details>)}</div></section>

        <section className="oda-landing-shell oda-landing-closing" aria-labelledby="landing-closing-title">
          <Logo className="oda-landing-closing-mark" />
          <p className="oda-landing-kicker">{c.closingLabel}</p><h2 id="landing-closing-title">{c.closingTitle} <em>{c.closingAccent}</em></h2><p className="oda-landing-closing-copy">{c.closingBody}</p><button type="button" onClick={() => setActiveRoute('/app')} className="oda-landing-button oda-landing-button-primary">{c.start}<ArrowRight size={18} aria-hidden="true" /></button>
        </section>
      </main>

      <footer className="oda-landing-shell oda-landing-footer"><div className="oda-landing-footer-brand"><Logo className="oda-landing-footer-mark" /><div><span>{c.footer}</span><span>{c.signature}</span></div></div><p>{c.footerNote}</p><div className="oda-landing-legal"><button type="button" onClick={() => setActiveRoute('/privacy')}>{PRIVACY[locale].title}</button><button type="button" onClick={() => setActiveRoute('/terms')}>{TERMS[locale].title}</button><span>© {new Date().getFullYear()} {LEGAL_COMPANY}</span></div></footer>
    </div>
  );
};
