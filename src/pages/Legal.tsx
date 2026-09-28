import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../store/useApp';
import { useLocale, useT } from '../i18n';
import { LEGAL_COMPANY, PRIVACY, TERMS, type LegalDoc } from '../data/legal';

/** Privacy policy and terms, readable without an account or network. */
export const Legal: React.FC<{ kind: 'privacy' | 'terms' }> = ({ kind }) => {
  const t = useT();
  const [locale] = useLocale();
  const { data, setActiveRoute } = useApp();
  const doc: LegalDoc = (kind === 'privacy' ? PRIVACY : TERMS)[locale];
  const other = kind === 'privacy' ? '/terms' : '/privacy';
  const back = () => {
    if (window.history.length > 1) window.history.back();
    else setActiveRoute(data?.profile.onboardingStep === 'completed' ? '/app/settings' : '/');
  };

  return (
    <div className="min-h-screen text-[var(--fg)]">
      <div className="max-w-[680px] mx-auto px-5 sm:px-8 pt-[max(env(safe-area-inset-top),20px)] pb-16">
        <button type="button" onClick={back} className="min-h-11 -ml-2 px-2 inline-flex items-center gap-2 text-[15px] text-[var(--fg-muted)] hover:text-[var(--fg)]">
          <ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />{t('Back')}
        </button>
        <header className="mt-8 space-y-3 pb-8 border-b border-[var(--border)]">
          <p className="oda-kicker text-[var(--brand-burgundy)]">One Decision Away · {LEGAL_COMPANY}</p>
          <h1 className="oda-display text-[38px] sm:text-[46px] leading-[1.08]">{doc.title}</h1>
          <p className="text-[13px] text-[var(--fg-muted)]">{doc.updated}</p>
          <p className="text-[16px] leading-relaxed text-[var(--fg-muted)]">{doc.intro}</p>
        </header>
        <div className="divide-y divide-[var(--border)]">
          {doc.sections.map(section => (
            <section key={section.heading} className="py-7 space-y-3">
              <h2 className="oda-display text-[23px] leading-snug font-normal">{section.heading}</h2>
              {section.body.map((p, i) => <p key={i} className="text-[15.5px] leading-[1.7] text-[var(--fg)]/90">{p}</p>)}
            </section>
          ))}
        </div>
        <p className="pt-6 border-t border-[var(--border)] text-[14px]">
          <button type="button" onClick={() => setActiveRoute(other)} className="min-h-11 underline underline-offset-4 decoration-[var(--border-strong)] text-[var(--fg-muted)] hover:text-[var(--fg)]">
            {kind === 'privacy' ? TERMS[locale].title : PRIVACY[locale].title}
          </button>
        </p>
      </div>
    </div>
  );
};
