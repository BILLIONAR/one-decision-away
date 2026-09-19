import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { Logo } from './Logo';
import { useApp } from '../store/useApp';
import { LOCALES, ensureLocaleLoaded, useLocale, useT, type Locale } from '../i18n';
import { EXPLORE_DREAM_ITEMS, type ExploreDreamItem } from '../data/exploreDreams';
import { ECONOMY_CONSTANTS } from '../services/economy';

const ONBOARDING_LOCALES: Locale[] = ['en', 'tr', 'es'];

/** Six varied, affordable starter dreams from the Explore catalogue (by id). */
const STARTER_DREAM_IDS = [
  'explore-travel-paris-week',
  'explore-ws-home-library',
  'explore-exp-scuba',
  'explore-exp-surf-camp',
  'explore-ws-minimal-desk',
  'explore-travel-iceland-aurora',
];

type Step = 1 | 2 | 3;

const primaryButton =
  'w-full h-12 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] font-semibold text-[15px] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';

export const Onboarding: React.FC = () => {
  const t = useT();
  const { completeOnboarding, showToast } = useApp();
  const [locale, setLocale] = useLocale();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [dreamId, setDreamId] = useState<string | null>(null);
  const [decision, setDecision] = useState('');
  const [saving, setSaving] = useState(false);

  const starterDreams = useMemo<ExploreDreamItem[]>(
    () =>
      STARTER_DREAM_IDS.map((id) => EXPLORE_DREAM_ITEMS.find((d) => d.id === id)).filter(
        (d): d is ExploreDreamItem => !!d
      ),
    []
  );

  const languages = LOCALES.filter((l) => ONBOARDING_LOCALES.includes(l.code));

  const chooseLanguage = (code: Locale) => {
    setLocale(code);
    void ensureLocaleLoaded(code);
  };

  const go = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const finish = async () => {
    if (!name.trim() || !decision.trim() || saving) return;
    setSaving(true);
    try {
      const dream = starterDreams.find((d) => d.id === dreamId);
      await completeOnboarding({
        displayName: name,
        locale,
        dream: dream
          ? {
              id: dream.id,
              name: dream.name,
              category: dream.category,
              realPriceUsd: dream.realPriceUsd,
              dreamDollarPrice: dream.dreamDollarPrice,
              description: dream.description,
              imageUrl: dream.imageUrl,
              whyWanted: dream.whyWanted,
              firstRealStep: dream.firstRealStep,
            }
          : undefined,
        decision,
      });
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('Something went wrong. Please try again.'), 'error');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] font-sans flex flex-col">
      {/* Top bar */}
      <header className="px-4 sm:px-6 h-16 flex items-center justify-between max-w-lg w-full mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <Logo className="w-6 h-6 shrink-0" />
          <span className="text-[15px] font-semibold tracking-tight truncate">{t('One Decision Away')}</span>
        </div>
        <div className="flex items-center gap-1.5" aria-label={t('Step {current} of {total}', { current: step, total: 3 })}>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                n === step ? 'w-6 bg-[var(--fg)]' : 'w-2 bg-[var(--border-strong)]'
              }`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 pb-10 pt-6 sm:pt-12 flex flex-col">
        {step > 1 && (
          <button
            type="button"
            onClick={() => go((step - 1) as Step)}
            className="self-start inline-flex items-center gap-1.5 h-11 -ml-1 pr-2 text-[14px] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={1.8} />
            {t('Back')}
          </button>
        )}

        {step === 1 && (
          <section key="step-1" className="space-y-6 onboarding-step">
            <div className="space-y-2">
              <h1 className="text-[32px] sm:text-[36px] font-semibold tracking-tight leading-tight">
                {t('What should we call you?')}
              </h1>
              <p className="text-[15px] text-[var(--fg-muted)] leading-relaxed">
                {t('No account needed. Everything stays on your phone until you choose to sync.')}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="onboarding-name" className="sr-only">
                {t('Your name')}
              </label>
              <input
                id="onboarding-name"
                type="text"
                autoComplete="given-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) go(2);
                }}
                placeholder={t('Your name')}
                className="w-full h-[52px] px-4 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[18px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] outline-none focus:ring-2 focus:ring-[var(--fg)]"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[15px] font-semibold">{t('Language')}</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((l) => {
                  const active = l.code === locale;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => chooseLanguage(l.code)}
                      aria-pressed={active}
                      className={`h-11 px-4 rounded-full text-[14px] font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-[var(--fg)] text-[var(--bg)]'
                          : 'bg-[var(--bg-muted)] text-[var(--fg)] hover:bg-[var(--border)]'
                      }`}
                    >
                      {l.nativeName}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button type="button" disabled={!name.trim()} onClick={() => go(2)} className={primaryButton}>
                {t('Continue')}
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section key="step-2" className="space-y-6 onboarding-step">
            <div className="space-y-2">
              <h1 className="text-[32px] sm:text-[36px] font-semibold tracking-tight leading-tight">
                {t('Pick one dream to start with.')}
              </h1>
              <p className="text-[15px] text-[var(--fg-muted)] leading-relaxed">
                {t('Every decision you keep earns Dream Dollars, and Dream Dollars buy your dreams.')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t('Starter dreams')}>
              {starterDreams.map((d) => {
                const selected = d.id === dreamId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setDreamId(selected ? null : d.id)}
                    className={`relative text-left rounded-[var(--radius-md)] overflow-hidden bg-[var(--bg-muted)] transition-shadow cursor-pointer ${
                      selected ? 'ring-2 ring-[var(--accent)]' : 'ring-0'
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--border)]">
                      <img
                        src={d.imageUrl}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-[14px] font-semibold leading-snug line-clamp-2">{t(d.name)}</p>
                      <p className="text-[13px] text-[var(--fg-muted)]">
                        D$ {d.dreamDollarPrice.toLocaleString()}
                      </p>
                    </div>
                    {selected && (
                      <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--accent)] text-[var(--bg)] flex items-center justify-center">
                        <Check size={16} strokeWidth={2.2} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 space-y-3">
              <button type="button" disabled={!dreamId} onClick={() => go(3)} className={primaryButton}>
                {t('Continue')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDreamId(null);
                  go(3);
                }}
                className="w-full h-11 text-[14px] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
              >
                {t('Skip for now')}
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section key="step-3" className="space-y-6 onboarding-step">
            <div className="space-y-2">
              <h1 className="text-[32px] sm:text-[36px] font-semibold tracking-tight leading-tight">
                {t('What is your one decision for today?')}
              </h1>
              <p className="text-[15px] text-[var(--fg-muted)] leading-relaxed">
                {t('One thing you will do today, no matter what. Keep it small enough to finish.')}
              </p>
            </div>

            <div>
              <label htmlFor="onboarding-decision" className="sr-only">
                {t('Your one decision for today')}
              </label>
              <textarea
                id="onboarding-decision"
                autoFocus
                rows={3}
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder={t('Today I will…')}
                className="w-full p-4 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[20px] font-medium leading-snug text-[var(--fg)] placeholder:text-[var(--fg-subtle)] outline-none resize-none focus:ring-2 focus:ring-[var(--fg)]"
              />
            </div>

            <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 text-[14px] text-[var(--fg-muted)] leading-relaxed">
              {t('Welcome gift: D$ {amount} lands in your wallet when you finish.', {
                amount: ECONOMY_CONSTANTS.WELCOME_GRANT.toLocaleString(),
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                disabled={!decision.trim() || saving}
                onClick={() => void finish()}
                className={primaryButton}
              >
                {saving ? t('Setting up…') : t('Start my day')}
              </button>
            </div>
          </section>
        )}
      </main>

      <style>{`
        .onboarding-step { animation: onboarding-in 260ms ease-out both; }
        @keyframes onboarding-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .onboarding-step { animation: none; }
        }
      `}</style>
    </div>
  );
};
