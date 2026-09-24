import React, { useEffect, useState } from 'react';
import { useApp } from '../../store/useApp';
import { useT } from '../../i18n';
import type { MarketItem } from '../../types/models';

/**
 * Mental contrasting for a dream: only picturing the goal can drain the energy
 * to pursue it, so pair it with what stands in the way and a next small step,
 * which can become today's decision.
 */
export const DreamRealityCheck: React.FC<{ item: MarketItem; onDecisionSet?: () => void }> = ({ item, onDecisionSet }) => {
  const t = useT();
  const { data, saveDreamPlan, showToast } = useApp();
  const saved = data?.dreamPlans?.[item.id];
  const [obstacle, setObstacle] = useState('');
  const [step, setStep] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setObstacle(saved?.obstacle ?? '');
    setStep(saved?.step ?? (item.firstRealStep ? t(item.firstRealStep) : ''));
    // Re-seed when another dream is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  if (!data) return null;
  const todayStr = new Date().toISOString().slice(0, 10);
  const hasTodayDecision = data.missions.some(m => m.isOneDecision && (m.scheduledFor === todayStr || m.status === 'active'));
  const field = 'w-full min-h-12 px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-[16px] text-[var(--fg)] outline-none focus:border-[var(--accent)]';

  const save = async () => {
    setBusy(true);
    try {
      await saveDreamPlan(item.id, { obstacle: obstacle.trim() || undefined, step: step.trim() || undefined });
      showToast(t('Saved.'), 'success');
    } finally { setBusy(false); }
  };
  const makeDecision = async () => {
    if (!step.trim()) return;
    setBusy(true);
    try {
      await saveDreamPlan(item.id, { obstacle: obstacle.trim() || undefined, step: step.trim() }, true);
      onDecisionSet?.();
    } finally { setBusy(false); }
  };

  return (
    <section aria-labelledby={`reality-${item.id}`} className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-4 space-y-3">
      <div>
        <h3 id={`reality-${item.id}`} className="text-[15px] font-semibold text-[var(--fg)]">{t('Make it real')}</h3>
        <p className="text-[13px] leading-relaxed text-[var(--fg-muted)]">{t('Picturing a dream feels good, but on its own it can drain the energy to act. Name what’s in the way, then take one small step.')}</p>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`obstacle-${item.id}`} className="block text-[13px] font-medium text-[var(--fg)]">{t('What stands between you and this?')}</label>
        <input id={`obstacle-${item.id}`} value={obstacle} onChange={e => setObstacle(e.target.value)} maxLength={140} className={field} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`step-${item.id}`} className="block text-[13px] font-medium text-[var(--fg)]">{t('Your next small step')}</label>
        <input id={`step-${item.id}`} value={step} onChange={e => setStep(e.target.value)} maxLength={140} className={field} />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button type="button" disabled={busy || !step.trim() || hasTodayDecision} onClick={() => void makeDecision()} className="h-12 flex-1 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg)] text-[15px] font-semibold disabled:opacity-40">
          {t('Make it today’s decision')}
        </button>
        <button type="button" disabled={busy} onClick={() => void save()} className="h-12 px-5 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border)] text-[15px] font-semibold text-[var(--fg)]">
          {t('Save')}
        </button>
      </div>
      {hasTodayDecision && <p className="text-[12px] text-[var(--fg-muted)]">{t('You already have a decision for today. Save this step for tomorrow.')}</p>}
    </section>
  );
};
