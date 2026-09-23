import React from 'react';
import { ArrowDown, ArrowRight, BookOpen, Feather, MessageCircle, Sparkle } from 'lucide-react';
import { useApp } from '../store/useApp';
import { Logo, LogoLockup } from '../components/Logo';
import { LanguagePicker } from '../components/LanguagePicker';
import { useLocale } from '../i18n';
import { landingCopy } from '../data/landingCopy';
import '../styles/landing.css';

/** Original diagram: a direction, a small ascent, and a path to return to. */
const IntentionPath: React.FC<{ label: string }> = ({ label }) => (
  <svg className="oda-landing-path" viewBox="0 0 360 216" role="img" aria-label={label}>
    <path d="M22 181H338" fill="none" stroke="var(--border)" />
    <path d="M42 161C69 161 67 129 99 129H130C152 129 148 99 175 99H203C227 99 223 67 251 67H296" fill="none" stroke="currentColor" strokeWidth="2.5" />
    <path d="M44 172H97V140H151V110H226V78H299" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
    <circle cx="43" cy="160" r="8" fill="var(--bg-elevated)" stroke="currentColor" strokeWidth="2" />
    <circle cx="173" cy="99" r="8" fill="var(--bg-elevated)" stroke="var(--brand-burgundy)" strokeWidth="2" />
    <path d="M170 99L172 101L177 96" fill="none" stroke="var(--brand-burgundy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M285 67V37A17 17 0 0 1 319 37V67" fill="var(--brand-burgundy-soft)" stroke="var(--brand-burgundy)" strokeWidth="2" />
    <path d="M302 67V42M297 48L302 42L307 48" fill="none" stroke="var(--brand-burgundy)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M287 94C305 134 270 184 191 190C122 196 67 193 43 183" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="3 5" />
    <path d="M46 190L42 183L51 182" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="84" cy="49" r="22" fill="var(--accent-soft)" />
    <path d="M76 49H92M84 41V57" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M217 28H225M221 24V32" stroke="var(--brand-burgundy)" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

export const Landing: React.FC = () => {
  const { setActiveRoute } = useApp();
  const [locale] = useLocale();
  const c = landingCopy(locale);
  const steps = [
    { title: c.stepOneTitle, text: c.stepOneBody },
    { title: c.stepTwoTitle, text: c.stepTwoBody },
    { title: c.stepThreeTitle, text: c.stepThreeBody },
  ];
  const resources = [
    { icon: BookOpen, title: c.quoteTitle, text: c.quoteBody, path: '/app/inspiration' },
    { icon: MessageCircle, title: c.coachTitle, text: c.coachBody, path: '/app/coach', tag: c.coachTag },
    { icon: Feather, title: c.notebookTitle, text: c.notebookBody, path: '/app/notebook' },
    { icon: Sparkle, title: c.dreamsTitle, text: c.dreamsBody, path: '/app/dreams' },
  ];

  return (
    <div className="oda-landing" lang={locale}>
      <header className="oda-landing-shell oda-landing-nav">
        <LogoLockup className="oda-landing-wordmark" />
        <nav className="oda-landing-nav-actions" aria-label={c.mainNavigation}>
          <LanguagePicker />
          <button type="button" onClick={() => setActiveRoute('/app')} className="oda-landing-button oda-landing-button-plain">{c.open}<ArrowRight size={15} aria-hidden="true" /></button>
        </nav>
      </header>

      <main>
        <section className="oda-landing-shell oda-landing-hero" aria-labelledby="landing-title">
          <div>
            <p className="oda-landing-kicker">{c.eyebrow}</p>
            <h1 id="landing-title" className="oda-display oda-landing-title">{c.title}<span>{c.titleAccent}</span></h1>
            <p className="oda-landing-introduction">{c.introduction}</p>
            <div className="oda-landing-hero-actions">
              <button type="button" onClick={() => setActiveRoute('/app')} className="oda-landing-button oda-landing-button-primary">{c.start}<ArrowRight size={17} aria-hidden="true" /></button>
              <button type="button" onClick={() => document.getElementById('oda-discover')?.scrollIntoView({ block: 'start' })} className="oda-landing-link">{c.explore}<ArrowDown size={15} aria-hidden="true" /></button>
            </div>
            <p className="oda-landing-privacy">{c.privacy}</p>
          </div>
          <figure className="oda-landing-page">
            <div className="oda-landing-page-top"><p>{c.pageTitle}</p><span className="oda-landing-page-date" aria-hidden="true">01 / ODA</span></div>
            <IntentionPath label={c.illustration} />
            <div className="oda-landing-example"><p className="oda-landing-example-label">{c.exampleLabel}</p><p className="oda-landing-example-text">{c.example}</p></div>
            <ol className="oda-landing-mini-path">
              {[c.intention, c.action, c.repeat].map((label, i) => <li key={label}><span aria-hidden="true">0{i + 1}</span>{label}</li>)}
            </ol>
            <figcaption className="oda-landing-page-note">{c.pageNote}</figcaption>
          </figure>
        </section>

        <div className="oda-landing-shell oda-landing-principle"><p>{c.principle}</p><Logo className="w-7 h-7" /></div>

        <section className="oda-landing-shell oda-landing-method" aria-labelledby="landing-method-title">
          <p className="oda-landing-kicker">{c.methodLabel}</p>
          <h2 id="landing-method-title" className="oda-display oda-landing-section-heading">{c.methodTitle}</h2>
          <div className="oda-landing-steps">{steps.map((step, i) => <article key={step.title} className="oda-landing-step"><span className="oda-landing-step-number" aria-hidden="true">0{i + 1}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
        </section>

        <section id="oda-discover" className="oda-landing-discover scroll-mt-6" aria-labelledby="landing-discover-title">
          <div className="oda-landing-shell">
            <div className="oda-landing-discover-header"><div><p className="oda-landing-kicker">{c.discoverLabel}</p><h2 id="landing-discover-title" className="oda-display oda-landing-section-heading">{c.discoverTitle}</h2></div><p>{c.discoverBody}</p></div>
            <article className="oda-landing-course">
              <div><p className="oda-landing-course-label">{c.courseLabel}</p><h3 className="oda-display">{c.courseTitle}</h3><button type="button" onClick={() => setActiveRoute('/app/courses')} className="oda-landing-link">{c.courseCta}<ArrowRight size={17} aria-hidden="true" /></button></div>
              <div><p className="oda-landing-course-meta">{c.courseMeta}</p><p>{c.courseBody}</p><p className="oda-landing-course-note">{c.courseNote}</p></div>
            </article>
            <div className="oda-landing-resources">{resources.map(({ icon: Icon, title, text, path, tag }) => <button key={path} type="button" onClick={() => setActiveRoute(path)} className="oda-landing-resource"><Icon size={22} strokeWidth={1.5} className="oda-landing-resource-icon" aria-hidden="true" /><span className="oda-landing-resource-copy"><span className="oda-landing-resource-title">{title}</span><span className="oda-landing-resource-body">{text}</span>{tag && <span className="oda-landing-resource-tag">{tag}</span>}</span><ArrowRight size={17} className="oda-landing-resource-arrow" aria-hidden="true" /></button>)}</div>
          </div>
        </section>

        <section className="oda-landing-shell oda-landing-closing" aria-labelledby="landing-closing-title">
          <div><p className="oda-landing-kicker">{c.closingLabel}</p><h2 id="landing-closing-title" className="oda-display oda-landing-section-heading">{c.closingTitle}</h2><p>{c.closingBody}</p></div>
          <div className="oda-landing-closing-actions"><button type="button" onClick={() => setActiveRoute('/app')} className="oda-landing-button">{c.start}<ArrowRight size={17} aria-hidden="true" /></button></div>
        </section>
      </main>

      <footer className="oda-landing-shell oda-landing-footer"><div className="oda-landing-footer-brand"><Logo className="w-5 h-5" /><span>{c.footer}</span></div><p>{c.footerNote}</p></footer>
    </div>
  );
};
