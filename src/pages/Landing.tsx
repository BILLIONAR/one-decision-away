import React from 'react';
import { ArrowRight, Check, CircleDot, Layers, Target } from 'lucide-react';
import { useApp } from '../store/useApp';
import { Logo, LogoLockup } from '../components/Logo';
import { LanguagePicker } from '../components/LanguagePicker';
import { useT, useLocale } from '../i18n';
import { companionCopy } from '../i18n/companion';
import { ECONOMY_CONSTANTS } from '../services/economy';

export const Landing: React.FC = () => {
  const { setActiveRoute } = useApp();
  const t = useT();
  const [locale] = useLocale();
  const c = companionCopy(locale);

  const steps = [
    {
      icon: Target,
      title: t('Decide'),
      text: t('Each morning, write the one thing that would make today count.'),
    },
    {
      icon: Check,
      title: t('Keep'),
      text: t('Do it, mark it done, and earn Dream Dollars for keeping your word.'),
    },
    {
      icon: Layers,
      title: t('Build'),
      text: t('Spend them on the dreams you chose and watch a different year take shape.'),
    },
  ];

  const features = [
    { title: c.coach, text: c.talkHint },
    { title: c.inspiration, text: c.collection },
    { title: c.courses, text: c.courseHint },
    { title: t('Dreams'), text: t('A vision board with a price tag, funded by what you actually do.') },
    { title: t('Notebook'), text: t('Journal, gratitude and written practices, all in one quiet place.') },
    { title: t('Meditations'), text: t('Short guided sessions and focus timers for the work that matters.') },
    { title: t('Two Futures'), text: t('See the life you are building next to the one you are allowing.') },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans flex flex-col">
      {/* Nav */}
      <header className="w-full">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 min-h-24 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <LogoLockup className="w-12 h-18 shrink-0" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguagePicker />
            <button
              type="button"
              onClick={() => setActiveRoute('/app')}
              className="h-11 px-4 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-[14px] font-semibold cursor-pointer"
            >
              {t('Open app')}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 sm:pt-24 pb-16 sm:pb-24">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-[44px] sm:text-[64px] font-semibold tracking-tight leading-[1.02]">
              {t('One decision a day. A different life in a year.')}
            </h1>
            <p className="text-[17px] sm:text-[19px] text-[var(--fg-muted)] leading-relaxed max-w-xl">
              {t('A calm daily practice that turns the things you say you will do into a life you can point to.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveRoute('/app')}
                className="h-12 px-6 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] font-semibold text-[15px] inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {t('Start free')}
                <ArrowRight size={18} strokeWidth={1.8} />
              </button>
              <a
                href="#how-it-works"
                className="h-12 px-6 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] font-semibold text-[15px] inline-flex items-center justify-center"
              >
                {t('See how it works')}
              </a>
            </div>
            <p className="text-[13px] text-[var(--fg-subtle)]">
              {t('No account needed. Your data stays on your device.')}
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 scroll-mt-16">
          <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-tight mb-8">{t('How it works')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-3">
                <span className="w-10 h-10 rounded-full bg-[var(--bg)] flex items-center justify-center text-[var(--accent)]">
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <p className="text-[17px] font-semibold">{title}</p>
                <p className="text-[15px] text-[var(--fg-muted)] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Preview */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4 md:order-1">
              <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-tight">{t('Your day, on one screen.')}</h2>
              <p className="text-[15px] sm:text-[17px] text-[var(--fg-muted)] leading-relaxed">
                {t('Today shows one decision, three small habits and the dream you are funding. Nothing else competes for your attention.')}
              </p>
            </div>

            <div className="flex justify-center md:order-2">
              <div
                className="w-full max-w-[340px] rounded-[40px] border border-[var(--border-strong)] bg-[var(--bg)] p-3"
                aria-hidden="true"
              >
                <div className="rounded-[30px] bg-[var(--bg)] overflow-hidden px-4 pt-6 pb-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] text-[var(--fg-muted)]">{t('Tuesday, 14 October')}</p>
                      <p className="text-[24px] font-semibold tracking-tight leading-tight">{t('Good morning, Ada')}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 h-9 px-3 rounded-full bg-[var(--bg-muted)] text-[13px] text-[var(--fg-muted)]">
                      D$ <span className="font-semibold text-[var(--accent)]">2,150</span>
                    </span>
                  </div>

                  <div className="bg-[var(--fg)] text-[var(--bg)] rounded-[var(--radius-lg)] p-5 space-y-4">
                    <div className="flex items-center justify-between text-[12px] opacity-70">
                      <span>{t("Today's one decision")}</span>
                      <span>{t('{n} days', { n: 12 })}</span>
                    </div>
                    <p className="text-[19px] font-medium leading-snug">{t('Send the proposal before lunch.')}</p>
                    <div className="w-full h-11 rounded-[var(--radius-sm)] bg-[var(--bg)] text-[var(--fg)] font-semibold text-[14px] flex items-center justify-center">
                      {t('Done · +D$ {amount}', { amount: ECONOMY_CONSTANTS.ONE_DECISION_REWARD.toLocaleString() })}
                    </div>
                  </div>

                  <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-4 space-y-3">
                    <p className="text-[14px] font-semibold">{t('Small habits')}</p>
                    {[t('Ten minutes of reading'), t('Walk outside'), t('No phone before nine')].map((h, i) => (
                      <div key={h} className="flex items-center gap-3 text-[14px]">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            i === 0 ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border-strong)]'
                          }`}
                        >
                          {i === 0 && <Check size={13} strokeWidth={2.2} />}
                        </span>
                        <span className={i === 0 ? 'text-[var(--fg-muted)] line-through' : ''}>{h}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-4 flex items-center gap-3">
                    <span className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                      <CircleDot size={18} strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-semibold truncate">{t('Paris Slow Week')}</p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                        <div className="h-full w-[62%] bg-[var(--accent)]" />
                      </div>
                    </div>
                    <span className="text-[13px] text-[var(--fg-muted)] shrink-0">62%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <h2 className="text-[26px] sm:text-[32px] font-semibold tracking-tight mb-8">{t('What you get')}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <li key={f.title} className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-1">
                <p className="text-[17px] font-semibold">{f.title}</p>
                <p className="text-[15px] text-[var(--fg-muted)] leading-relaxed">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing CTA */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="bg-[var(--fg)] text-[var(--bg)] rounded-[var(--radius-lg)] p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-[24px] sm:text-[28px] font-semibold tracking-tight">{t('Start with today.')}</p>
              <p className="text-[15px] opacity-70">{t('Three questions and you are in. Takes a minute.')}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveRoute('/app')}
              className="h-12 px-6 rounded-[var(--radius-sm)] bg-[var(--bg)] text-[var(--fg)] font-semibold text-[15px] inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              {t('Start free')}
              <ArrowRight size={18} strokeWidth={1.8} />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] text-[var(--fg-muted)]">
          <div className="flex items-center gap-2">
            <Logo className="w-5 h-5" />
            <span>{t('One Decision Away by AurelyStudio')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>{t('Your data stays on your device unless you turn on sync.')}</span>
            <button
              type="button"
              onClick={() => setActiveRoute('/two-futures')}
              className="text-[var(--fg-muted)] hover:text-[var(--fg)] underline underline-offset-4 cursor-pointer"
            >
              {t('Two Futures')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
