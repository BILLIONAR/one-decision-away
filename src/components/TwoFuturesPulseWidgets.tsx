import React, { useMemo, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Badge } from './ui';
import { Columns, ArrowRight, Footprints, Check, X, ShieldCheck } from 'lucide-react';
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
    <Card padding="md" className="space-y-3 bg-[var(--bg-elevated)] border border-[#9A8F86]/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 shrink-0 rounded-full bg-[#9A8F86]/20 text-[#9A8F86] flex items-center justify-center">
            <Columns className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">{t('Weekly Two Futures Review')}</h3>
              <Badge variant="subtle">{daysSince >= 99 ? t('never reviewed') : t('{n} days ago', { n: daysSince })}</Badge>
            </div>
            <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">
              {t("Re-read the life you're allowing and the life you're building. Two minutes, once a week, keeps every One Decision pointed the right way.")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button size="sm" variant="primary" onClick={() => setActiveRoute('/app/two-futures')}>
            {t('Review now')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => saveDefaultFuture({})} title={t('I already reviewed it')}>
            <Check className="w-3.5 h-3.5 mr-1" /> {t('Done')}
          </Button>
        </div>
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
    <Card padding="md" className="space-y-3 bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#9A8F86]/20 text-[#9A8F86] flex items-center justify-center">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">{t('Evening Drift Check')}</h3>
            <p className="text-[11px] text-[var(--fg-muted)]">{t('Did the default future get a vote today? Honest answer, no judgment.')}</p>
          </div>
        </div>
        <button type="button" onClick={dismiss} className="p-1.5 text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer" title={t('Not now')}>
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={dismiss}
          className="px-3 py-1.5 rounded-full text-xs font-bold border bg-[var(--color-sage)]/15 text-[var(--color-sage)] border-[var(--color-sage)]/40 hover:bg-[var(--color-sage)]/25 cursor-pointer flex items-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5" /> {t('Clean day — no drift')}
        </button>
        {signals.map((sig) => (
          <button
            key={sig}
            type="button"
            onClick={() => logDriftSignal(sig)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border bg-[var(--bg-muted)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)] hover:border-[#9A8F86] cursor-pointer"
          >
            {t(sig)}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setActiveRoute('/app/two-futures')}
          className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--fg-subtle)] underline cursor-pointer"
        >
          {t('Something else…')}
        </button>
      </div>
    </Card>
  );
};
