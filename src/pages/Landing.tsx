import React from 'react';
import { useApp } from '../store/useApp';
import { Button, Card, Disclaimer } from '../components/ui';
import { ArrowRight, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { LanguagePicker } from '../components/LanguagePicker';
import { useT } from '../i18n';

export const Landing: React.FC = () => {
  const { setActiveRoute } = useApp();
  const t = useT();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col justify-between selection:bg-[var(--fg)] selection:text-[var(--bg)]">
      {/* Editorial Navigation */}
      <header className="border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-baseline justify-between">
          <div className="flex items-baseline gap-4">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--fg-subtle)]">
              {t('Issue No. 01 — Blueprint')}
            </span>
          </div>

          <div className="flex items-center space-x-6 sm:space-x-10 font-sans text-[10px] font-semibold uppercase tracking-[0.25em]">
            <LanguagePicker className="normal-case tracking-normal" />
            <button
              onClick={() => setActiveRoute('/two-futures')}
              className="hover:opacity-50 transition-opacity cursor-pointer text-[var(--fg)]"
            >
              {t('Two Futures')}
            </button>
            <button
              onClick={() => setActiveRoute('/app')}
              className="hover:opacity-50 transition-opacity cursor-pointer text-[var(--fg)]"
            >
              {t('Open Life OS')}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveRoute('/app')}
            >
              {t('Enter System')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
        {/* Left Vertical volume tag */}
        <div className="hidden lg:flex lg:col-span-1 flex-col justify-end pb-8">
          <span className="vertical-text font-sans text-[9px] uppercase tracking-[0.5em] opacity-40">
            {t('VOLUME TWENTY SIX — SPECIFICATION')}
          </span>
        </div>

        {/* Center Main Headline */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-left">
          <div className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.25em] text-[var(--fg-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-sage)]" />
            <span>{t('A Personal Transformation & Future Life OS')}</span>
          </div>

          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.92] font-black italic tracking-tight text-[var(--fg)]">
            {t('The Silence Of Intent')}
          </h1>

          <p className="font-sans text-sm sm:text-base leading-relaxed max-w-lg text-[var(--fg-muted)]">
            {t('Turn decisive daily action into Dream Dollars, furnish your future life in a symbolic economy, and connect every dream to an actionable real-world bridge.')}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => setActiveRoute('/app')}
            >
              {t('Design My Future')}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => setActiveRoute('/two-futures')}
            >
              {t('Examine Two Futures')}
            </Button>
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <div className="w-12 h-[1px] bg-[var(--fg)] opacity-60" />
            <span className="font-sans text-[9px] uppercase font-semibold tracking-widest text-[var(--fg-subtle)]">
              {t('Symbolic Economy & Reality Bridges')}
            </span>
          </div>
        </div>

        {/* Right Hero Figure Frame */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="w-full aspect-[4/5] bg-[var(--bg-muted)] asymmetric-border flex flex-col items-center justify-center p-8 overflow-hidden relative shadow-[var(--shadow-md)]">
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="opacity-15 absolute inset-0 pointer-events-none">
              <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="0.5" />
              <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" />
            </svg>

            <div className="bg-[var(--bg-elevated)]/90 backdrop-blur-xs p-6 border border-black/10 text-center max-w-xs space-y-3 z-10">
              <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[var(--fg-subtle)] block">
                {t('Fig. 01 — The Fork')}
              </span>
              <div className="font-display italic text-2xl font-bold text-[var(--fg)]">
                {t('One Decision Away')}
              </div>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed font-sans">
                {t('"Between stimulus and response, there is a space. In that space is our power to choose our future."')}
              </p>
            </div>
          </div>

          {/* Date stamp box */}
          <div className="absolute -top-3 -right-3 w-20 h-20 border border-[var(--fg)] flex flex-col items-center justify-center bg-[var(--bg)] shadow-xs">
            <span className="font-display text-2xl font-black text-[var(--fg)]">01</span>
            <span className="font-sans text-[8px] uppercase tracking-wider text-[var(--fg-muted)]">{t('Decision')}</span>
          </div>
        </div>
      </main>

      {/* 3 Principles / Editorial Columns */}
      <section className="max-w-6xl mx-auto px-6 py-12 border-t border-[var(--border)] w-full">
        <div className="flex items-baseline justify-between mb-8">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--fg-subtle)]">
            {t('Section 02 — Systematic Architecture')}
          </span>
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--fg-subtle)]">
            {t('Philosophy')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 relative">
            <span className="font-sans text-[9px] font-bold tracking-[0.25em] text-[var(--color-sage)] uppercase">
              {t('Module 01')}
            </span>
            <h3 className="font-bold font-display text-xl text-[var(--fg)]">
              {t('Complete High-Leverage Missions')}
            </h3>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed font-sans">
              {t('Choose one high-leverage decision each day that truly moves your needle. Finish it, honor your boundaries, and lock in the identity shift.')}
            </p>
          </div>

          <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 relative">
            <span className="font-sans text-[9px] font-bold tracking-[0.25em] text-[var(--color-coral)] uppercase">
              {t('Module 02')}
            </span>
            <h3 className="font-bold font-display text-xl text-[var(--fg)]">
              {t('Earn Transparent Dream Dollars')}
            </h3>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed font-sans">
              {t('Every completed mission deposits D$ into your ledger in the Dream Bank. No fake math, no pay-to-win mechanics, and anti-binge caps.')}
            </p>
          </div>

          <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border)] space-y-3 relative">
            <span className="font-sans text-[9px] font-bold tracking-[0.25em] text-[var(--fg-subtle)] uppercase">
              {t('Module 03')}
            </span>
            <h3 className="font-bold font-display text-xl text-[var(--fg)]">
              {t('Furnish & Bridge Future Life')}
            </h3>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed font-sans">
              {t('Spend D$ in the Dream Market, curate your 2D life gallery in My Future Life, and connect every aspiration to a concrete financial reality bridge.')}
            </p>
          </div>
        </div>

        {/* Contrast Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
          <div className="p-6 bg-[var(--bg-muted)] border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold font-display text-[var(--fg)]">
              <CheckCircle className="w-4 h-4 text-[var(--color-sage)] shrink-0" />
              <span>{t('Not a generic to-do checklist')}</span>
            </div>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed font-sans">
              {t('To-do lists accumulate friction and endless trivial checkboxes. One Decision Away centers entirely on identity conviction, strategic milestones, and calm directional focus.')}
            </p>
          </div>

          <div className="p-6 bg-[var(--bg-muted)] border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold font-display text-[var(--fg)]">
              <ShieldCheck className="w-4 h-4 text-[var(--color-coral)] shrink-0" />
              <span>{t('Not a real currency or casino')}</span>
            </div>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed font-sans">
              {t('Dream Dollars (D$) are symbolic simulation tokens that cannot be purchased, gambled, or withdrawn. They act as a behavioral mirror for where your daily energy is invested.')}
            </p>
          </div>
        </div>

        <div className="pt-8 max-w-xl mx-auto text-center">
          <Disclaimer text={t('Dream Dollars (D$) is a virtual simulation economy with no cash value. Purchases and allocations are symbolic representations of your life design.')} />
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="mt-auto border-t border-[var(--border)] py-8 px-6 bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-baseline gap-6">
          <div className="flex space-x-12 sm:space-x-16">
            <div className="flex flex-col">
              <span className="font-sans text-[9px] uppercase tracking-widest opacity-50 mb-1">{t('Edition')}</span>
              <span className="font-sans text-[11px] font-semibold">{t('Volume 01 — 2026')}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-[9px] uppercase tracking-widest opacity-50 mb-1">{t('Curator')}</span>
              <span className="font-sans text-[11px] font-semibold">AurelyStudio</span>
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-[9px] uppercase tracking-widest opacity-50 mb-1">{t('System')}</span>
              <span className="font-sans text-[11px] font-semibold">{t('One Decision Away')}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[10px] uppercase tracking-widest font-semibold text-[var(--fg-muted)]">
            <button onClick={() => setActiveRoute('/two-futures')} className="hover:text-[var(--fg)] cursor-pointer">
              {t('Two Futures')}
            </button>
            <button onClick={() => setActiveRoute('/app/settings')} className="hover:text-[var(--fg)] cursor-pointer">
              {t('Disclaimers')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
