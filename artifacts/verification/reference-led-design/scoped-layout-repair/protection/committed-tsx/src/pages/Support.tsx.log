import React from 'react';
import { ArrowLeft, ArrowUpRight, Mail } from 'lucide-react';
import { useApp } from '../store/useApp';
import { useLocale } from '../i18n';
import { LanguagePicker } from '../components/LanguagePicker';
import { SUPPORT, SUPPORT_EMAIL, supportEmailHref } from '../data/support';

/** Public, account-free help; also available from the native app while offline. */
export const Support: React.FC = () => {
  const [locale] = useLocale();
  const copy = SUPPORT[locale];
  const { data, setActiveRoute } = useApp();
  const backRoute = data?.profile.onboardingStep === 'completed' ? '/app/settings' : '/';

  return (
    <main className="min-h-screen text-[var(--fg)]">
      <div className="max-w-[760px] mx-auto px-5 sm:px-8 pt-[max(env(safe-area-inset-top),20px)] pb-[max(env(safe-area-inset-bottom),48px)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button type="button" onClick={() => setActiveRoute(backRoute)} className="min-h-11 inline-flex items-center gap-2 text-[14px] text-[var(--fg-muted)] hover:text-[var(--fg)]">
            <ArrowLeft size={18} aria-hidden="true" />{copy.back}
          </button>
          <LanguagePicker variant="compact" />
        </div>
        <header className="pt-12 pb-9 space-y-4">
          <p className="oda-kicker text-[var(--brand-burgundy)]">ODA · ONE DECISION AWAY</p>
          <h1 className="oda-display text-[38px] sm:text-[52px] leading-[1.08] max-w-[600px] text-balance">{copy.title}</h1>
          <p className="text-[16px] leading-relaxed text-[var(--fg-muted)] max-w-[600px]">{copy.intro}</p>
        </header>
        <section aria-labelledby="support-contact" className="oda-card p-6 sm:p-8 space-y-4">
          <h2 id="support-contact" className="oda-display text-[27px]">{copy.contact}</h2>
          <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">{copy.contactIntro}</p>
          <a href={supportEmailHref(locale)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 bg-[var(--accent)] text-[var(--bg)] text-[14px] font-semibold"><Mail size={17} aria-hidden="true" />{copy.emailAction}</a>
          <p><a href={`mailto:${SUPPORT_EMAIL}`} className="text-[14px] underline underline-offset-4 break-all">{SUPPORT_EMAIL}</a></p>
          <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{copy.include}</p>
          <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{copy.privacyNote}</p>
        </section>
        <section aria-labelledby="support-answers" className="mt-12">
          <h2 id="support-answers" className="oda-display text-[30px] mb-4">{copy.quickHelp}</h2>
          <div className="divide-y divide-[var(--border)]">
            {copy.topics.map(topic => (
              <details key={topic.id} className="group py-2">
                <summary className="min-h-14 py-4 cursor-pointer text-[16px] font-medium leading-snug">{topic.title}</summary>
                <div className="space-y-3 pb-5 text-[14px] sm:text-[15px] leading-relaxed text-[var(--fg-muted)]">
                  {topic.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  {topic.route && <button type="button" onClick={() => setActiveRoute(topic.route!)} className="min-h-11 inline-flex gap-2 items-center underline underline-offset-4 text-[var(--accent)]">{topic.action}<ArrowUpRight size={16} aria-hidden="true" /></button>}
                </div>
              </details>
            ))}
          </div>
        </section>
        <nav aria-label={copy.contact} className="mt-8 pt-5 border-t border-[var(--border)] flex flex-wrap gap-x-6">
          <button type="button" onClick={() => setActiveRoute('/privacy')} className="min-h-11 underline underline-offset-4 text-[14px] text-[var(--fg-muted)]">{copy.privacy}</button>
          <button type="button" onClick={() => setActiveRoute('/terms')} className="min-h-11 underline underline-offset-4 text-[14px] text-[var(--fg-muted)]">{copy.terms}</button>
        </nav>
      </div>
    </main>
  );
};
