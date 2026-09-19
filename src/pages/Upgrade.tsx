import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Check } from 'lucide-react';
import { useT } from '../i18n';

export const Upgrade: React.FC = () => {
  const { data, toggleProPlan } = useApp();
  const t = useT();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (!data) return null;

  const isPro = data.profile.isPro;

  const freeFeatures = [
    t("Today's one decision"),
    t('Two futures'),
    t('Dreams and bank'),
    t('One bridge'),
  ];

  const proFeatures = [
    t('Unlimited bridges'),
    t('Custom dreams with images'),
    t('Seasons and badges'),
    t('High-resolution exports'),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Pro')}</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">{t('One plan. Cancel any time.')}</p>
      </div>

      <div className="flex p-1 bg-[var(--bg-muted)] rounded-[var(--radius-sm)]">
        <button
          type="button"
          onClick={() => setBillingCycle('monthly')}
          className={`flex-1 h-10 rounded-[var(--radius-xs)] text-sm font-medium transition-colors ${
            billingCycle === 'monthly' ? 'bg-[var(--bg)] text-[var(--fg)]' : 'text-[var(--fg-muted)]'
          }`}
        >
          {t('Monthly')}
        </button>
        <button
          type="button"
          onClick={() => setBillingCycle('yearly')}
          className={`flex-1 h-10 rounded-[var(--radius-xs)] text-sm font-medium transition-colors ${
            billingCycle === 'yearly' ? 'bg-[var(--bg)] text-[var(--fg)]' : 'text-[var(--fg-muted)]'
          }`}
        >
          {t('Yearly')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4">
          <div>
            <div className="text-[15px] font-semibold text-[var(--fg)]">{t('Free')}</div>
            <div className="text-2xl font-semibold tracking-tight text-[var(--fg)] mt-1">$0</div>
          </div>
          <ul className="space-y-2 text-sm text-[var(--fg)]">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--fg-muted)] shrink-0" strokeWidth={1.8} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4">
          <div>
            <div className="text-[15px] font-semibold text-[var(--fg)]">{t('Pro')}</div>
            <div className="text-2xl font-semibold tracking-tight text-[var(--fg)] mt-1">
              {billingCycle === 'yearly' ? '$49' : '$6.99'}
              <span className="text-sm text-[var(--fg-muted)] font-normal">
                {billingCycle === 'yearly' ? t(' / year') : t(' / month')}
              </span>
            </div>
            {billingCycle === 'yearly' && (
              <div className="text-xs text-[var(--accent)] mt-0.5">{t('Save 42%')}</div>
            )}
          </div>
          <ul className="space-y-2 text-sm text-[var(--fg)]">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[var(--accent)] shrink-0" strokeWidth={1.8} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={toggleProPlan}
            className={`w-full h-12 rounded-[var(--radius-sm)] font-semibold text-[15px] ${
              isPro
                ? 'border border-[var(--border-strong)] bg-transparent text-[var(--fg)]'
                : 'bg-[var(--fg)] text-[var(--bg)]'
            }`}
          >
            {isPro ? t('Turn off Pro (demo)') : t('Turn on Pro (demo)')}
          </button>
        </div>
      </div>

      <div className="text-sm text-[var(--fg-muted)] space-y-1">
        <p>{t('No pay-to-win. D$ is only earned by doing.')}</p>
        <p>{t('No selling your data.')}</p>
        <p>{t('No manipulative streaks or fake urgency.')}</p>
      </div>
    </div>
  );
};
