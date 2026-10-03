import React, { useMemo, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button } from './ui';
import { ArrowRight, Check, X } from 'lucide-react';
import { useT, N_ } from '../i18n';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DISMISS_KEY = 'oda_drift_check_dismissed';

const DEFAULT_SIGNALS = [
  N_('Scrolled instead of starting'),
  N_('Said "tomorrow" to the hard thing'),
  N_('Chose comfort over the plan'),
  N_('Complained without acting'),
];

/**
 * Weekly Two Futures review reminder — appears when the Two Futures / Default Future
 * haven't been looked at for 7+ days. Reading them weekly is what keeps daily decisions aligned.
 */
export const WeeklyTwoFuturesReview: React.FC = () => {
  const t = useT();
  const { data, setActiveRoute, saveDefaultFuture } = useApp();
  if (!data) return null;

  const lastReviewed = data.twoFutures.defaultFuture?.lastReviewedAt || data.twoFutures.updatedAt;
  const lastMs = lastReviewed ? new Date(lastReviewed).getTime() : 0;
  const daysSince = lastMs ? Math.floor((Date.now() - lastMs) / (24 * 60 * 60 * 1000)) : 99;
  if (Date.now() - lastMs < WEEK_MS) return null;

  return (
    <Card padding="md" className="space-y-4">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Weekly review')}</h3>
        <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
          {daysSince >= 99 ? t('Never reviewed.') : t('Last reviewed {n} days ago.', { n: daysSince })}{' '}
          {t("Re-read the life you're allowing and the life you're building. Two minutes keeps every decision pointed the right way.")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="primary" icon={ArrowRight} iconPosition="right" onClick={() => setActiveRoute('/app/two-futures')}>
          {t('Review now')}
        </Button>
        <Button size="sm" variant="ghost" icon={Check} onClick={() => saveDefaultFuture({})} title={t('I already reviewed it')}>
          {t('Done')}
        </Button>
      </div>
    </Card>
  );
};

/**
 * Evening drift check — from 18:00, if nothing was logged today, asks once whether the day drifted.
 * A clean day is recorded too, so the 14-day strip on Two Futures stays honest.
 */
export const EveningDriftCheck: React.FC = () => {
  const t = useT();
  const { data, logDriftSignal, setActiveRoute } = useApp();
  const todayKey = new Date().toISOString().slice(0, 10);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === todayKey;
    } catch {
      return false;
    }
  });

  const signals = useMemo(() => {
    const fs = data?.futureSelf;
    const own = [...(fs?.oldSelfBehaviors || []), ...(fs?.oldSelfPatterns || [])].map((s) => s.trim()).filter(Boolean);
    return Array.from(new Set([...own, ...DEFAULT_SIGNALS])).slice(0, 6);
  }, [data?.futureSelf]);

  if (!data) return null;
  const hour = new Date().getHours();
  if (hour < 18 || dismissed) return null;
  const loggedToday = (data.twoFutures.defaultFuture?.driftLog || []).some((e) => e.dateKey === todayKey);
  if (loggedToday) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, todayKey);
    } catch {
      /* ignore */
    }
  };

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Evening check')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">{t('Did the default future get a vote today? Honest answer, no judgment.')}</p>
        </div>
        <button type="button" onClick={dismiss} className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-inset)] cursor-pointer shrink-0" title={t('Not now')} aria-label={t('Not now')}>
          <X className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="h-10 px-4 rounded-full text-[13px] font-medium bg-[var(--fg)] text-[var(--bg)] cursor-pointer"
        >
          {t('Clean day')}
        </button>
        {signals.map((sig) => (
          <button
            key={sig}
            type="button"
            onClick={() => logDriftSignal(sig)}
            className="h-10 px-4 rounded-full text-[13px] font-medium bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
          >
            {t(sig)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setActiveRoute('/app/two-futures')}
          className="h-10 px-3 rounded-full text-[13px] font-medium text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
        >
          {t('Something else…')}
        </button>
      </div>
    </Card>
  );
};
