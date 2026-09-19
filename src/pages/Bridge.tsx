import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { X } from 'lucide-react';
import { RealityBridge } from '../types/models';
import { useT } from '../i18n';

export const Bridge: React.FC = () => {
  const {
    data,
    updateRealityBridgeSavings,
    addMission,
    setActiveRoute,
  } = useApp();
  const t = useT();

  const [loggingBridge, setLoggingBridge] = useState<RealityBridge | null>(null);
  const [savingsInput, setSavingsInput] = useState<number>(150);
  const [savingsNote, setSavingsNote] = useState<string>('');

  if (!data) return null;

  const handleRecordSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingBridge || savingsInput <= 0) return;
    await updateRealityBridgeSavings(loggingBridge.id, savingsInput, savingsNote);
    setLoggingBridge(null);
    setSavingsInput(150);
    setSavingsNote('');
  };

  const handleCreateMissionFromBridge = async (bridge: RealityBridge) => {
    const purchase = data.purchases.find((p) => p.id === bridge.purchaseId);
    const itemName = t(purchase?.itemSnapshot.name || 'Dream Item');

    await addMission({
      title: bridge.nextMilestone || t('Execute next milestone for {itemName}', { itemName }),
      note: t('Linked Reality Bridge: {itemName}. Target: ${cost}.', { itemName, cost: bridge.realCostUsd.toLocaleString() }),
      area: 'Money',
      type: 'weekly_mission',
      difficulty: 'medium',
      isOneDecision: false,
    });
  };

  const primaryBtn =
    'h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-sm font-semibold';
  const secondaryBtn =
    'h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] text-sm font-medium';
  const inputCls =
    'w-full h-11 px-3 bg-[var(--bg-muted)] text-[var(--fg)] rounded-[var(--radius-sm)] text-sm focus:outline-none placeholder:text-[var(--fg-subtle)]';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Bridges')}</h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">{t('Real savings plans for the dreams you bought.')}</p>
        </div>
        <button type="button" onClick={() => setActiveRoute('/app/life')} className={`${secondaryBtn} shrink-0`}>
          {t('My life')}
        </button>
      </div>

      {data.realityBridges.length > 0 ? (
        <div className="space-y-4">
          {data.realityBridges.map((bridge) => {
            const purchase = data.purchases.find((p) => p.id === bridge.purchaseId);
            const remaining = Math.max(0, bridge.realCostUsd - bridge.currentSavingsUsd);
            const pct = Math.min(100, Math.max(0, bridge.realProgressPct));

            return (
              <div key={bridge.id} className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold tracking-tight text-[var(--fg)]">
                    {t(purchase?.itemSnapshot.name || 'Dream')}
                  </h3>
                  <span className="text-sm text-[var(--accent)] font-medium shrink-0">{pct}%</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--fg-muted)]">{t('Saved')}</span>
                    <span className="font-medium text-[var(--fg)]">
                      ${bridge.currentSavingsUsd.toLocaleString()} / ${bridge.realCostUsd.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[var(--border-strong)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--fg-subtle)]">
                    <span>{t('${n} left', { n: remaining.toLocaleString() })}</span>
                    <span>{t('By {date}', { date: bridge.targetDate })}</span>
                  </div>
                </div>

                <div className="divide-y divide-[var(--border)] text-sm border-t border-[var(--border)]">
                  <div className="py-3 flex justify-between gap-3">
                    <span className="text-[var(--fg-muted)]">{t('Per month')}</span>
                    <span className="text-[var(--fg)] text-right">
                      {t('${n}', { n: bridge.requiredMonthlySavingsUsd.toLocaleString() })}
                    </span>
                  </div>
                  <div className="py-3 flex justify-between gap-3">
                    <span className="text-[var(--fg-muted)] shrink-0">{t('Funded by')}</span>
                    <span className="text-[var(--fg)] text-right">{t(bridge.incomeProject)}</span>
                  </div>
                  <div className="py-3 flex justify-between gap-3">
                    <span className="text-[var(--fg-muted)] shrink-0">{t('Next step')}</span>
                    <span className="text-[var(--fg)] text-right">{t(bridge.nextMilestone)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => handleCreateMissionFromBridge(bridge)} className={secondaryBtn}>
                    {t('Make a mission')}
                  </button>
                  <button type="button" onClick={() => setLoggingBridge(bridge)} className={primaryBtn}>
                    {t('Log savings')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 text-center">
          <p className="text-[15px] font-semibold text-[var(--fg)]">{t('No bridges yet')}</p>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            {t('Buy a dream, then open it in My life to build a savings plan.')}
          </p>
          <button type="button" onClick={() => setActiveRoute('/app/life')} className={`${primaryBtn} mt-4`}>
            {t('Go to My life')}
          </button>
        </div>
      )}

      <p className="text-xs text-[var(--fg-subtle)]">
        {t('Bridges do the maths only. Nothing moves in your real bank account.')}
      </p>

      {loggingBridge && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
          onClick={() => setLoggingBridge(null)}
        >
          <div
            className="w-full max-w-md bg-[var(--bg)] rounded-[var(--radius-lg)] p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-[var(--fg)]">{t('Log savings')}</h3>
                <p className="text-sm text-[var(--fg-muted)] mt-0.5">{t('Money you set aside in your real account.')}</p>
              </div>
              <button
                type="button"
                onClick={() => setLoggingBridge(null)}
                aria-label={t('Close')}
                className="w-11 h-11 -mr-2 -mt-2 flex items-center justify-center text-[var(--fg-muted)]"
              >
                <X className="w-5 h-5" strokeWidth={1.8} />
              </button>
            </div>

            <form onSubmit={handleRecordSavings} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="savings-val" className="block text-sm text-[var(--fg-muted)]">
                  {t('Amount ($)')}
                </label>
                <input
                  id="savings-val"
                  type="number"
                  min={1}
                  value={savingsInput}
                  onChange={(e) => setSavingsInput(parseInt(e.target.value) || 0)}
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="savings-note-input" className="block text-sm text-[var(--fg-muted)]">
                  {t('Note')}
                </label>
                <input
                  id="savings-note-input"
                  value={savingsNote}
                  onChange={(e) => setSavingsNote(e.target.value)}
                  placeholder={t('Optional')}
                  className={inputCls}
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setLoggingBridge(null)} className={secondaryBtn}>
                  {t('Cancel')}
                </button>
                <button type="submit" className={primaryBtn}>
                  {t('Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
