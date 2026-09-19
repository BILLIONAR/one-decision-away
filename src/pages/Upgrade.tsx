import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { PageHeader, Button, Card, Badge, Disclaimer } from '../components/ui';
import { Check, ShieldCheck, Sparkles, HeartHandshake } from 'lucide-react';
import { useT } from '../i18n';

export const Upgrade: React.FC = () => {
  const { data, toggleProPlan } = useApp();
  const t = useT();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!data) return null;

  const isPro = data.profile.isPro;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={t('Pro Plan & Fair Support')}
        subtitle={t('One Decision Away is built with ethical pricing. No pay-to-win mechanics, no selling user data, and transparent value.')}
      />

      {/* Pricing Card */}
      <Card padding="lg" className="border-2 border-[var(--color-sage)]/50 bg-[var(--bg-elevated)] space-y-6 text-center">
        {/* Toggle */}
        <div className="inline-flex p-1 bg-[var(--bg-muted)] rounded-full border border-[var(--border)]">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {t('Monthly ($6.99 / mo)')}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              billingCycle === 'yearly'
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {t('Yearly ($49 / yr · Save 42%)')}
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-4xl sm:text-5xl font-bold font-display text-[var(--fg)]">
            {billingCycle === 'yearly' ? '$49' : '$6.99'}
            <span className="text-base text-[var(--fg-muted)] font-normal">
              {billingCycle === 'yearly' ? t(' / year') : t(' / month')}
            </span>
          </div>
          <p className="text-xs text-[var(--fg-muted)]">
            {t('Includes all current and future life simulation tools.')}
          </p>
        </div>

        {/* Feature comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4 border-t border-[var(--border)]">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-sage)]">
              {t('Core Free Features')}
            </span>
            <ul className="space-y-2 text-xs text-[var(--fg)]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-sage)] shrink-0" />
                <span>{t("Today's One Decision workflow")}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-sage)] shrink-0" />
                <span>{t('Two Futures Compass questionnaire')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-sage)] shrink-0" />
                <span>{t('Basic Dream Market & Bank ledger')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-sage)] shrink-0" />
                <span>{t('1 Reality Bridge connection')}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-coral)]">
              {t('Pro Member Superpowers')}
            </span>
            <ul className="space-y-2 text-xs text-[var(--fg)]">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-coral)] shrink-0" />
                <span>{t('Unlimited Reality Bridges & Savings trackers')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-coral)] shrink-0" />
                <span>{t('Custom Dream creation with image generation')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-coral)] shrink-0" />
                <span>{t('30-Day Seasonal Sprints & Cosmetic Badges')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--color-coral)] shrink-0" />
                <span>{t('High-resolution canvas receipt downloads')}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Demo Simulation Toggle */}
        <div className="pt-6 border-t border-[var(--border)] flex flex-col items-center gap-3">
          <Button
            variant={isPro ? 'outline' : 'accent'}
            size="lg"
            icon={isPro ? Check : Sparkles}
            onClick={toggleProPlan}
            className="w-full sm:w-auto"
          >
            {isPro ? t('Deactivate Pro (Demo Mode)') : t('Activate Pro Membership (Demo)')}
          </Button>

          <span className="text-[11px] text-[var(--fg-subtle)]">
            {t('Clicking this button toggles Pro features instantly for testing and demo evaluation.')}
          </span>
        </div>
      </Card>

      {/* Ethical Pledge */}
      <Card padding="md" className="space-y-3 bg-[var(--bg-muted)] border border-[var(--border)]">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--fg)]">
          <HeartHandshake className="w-4 h-4 text-[var(--color-sage)]" />
          <span>{t('Our Ethical Commerce Pledge')}</span>
        </div>
        <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
          {t('We believe personal growth software should never use manipulative streaks, pay-to-win shortcuts, or disguised real-money gambling. Dream Dollars is strictly earned through real-world actions.')}
        </p>
      </Card>
    </div>
  );
};
