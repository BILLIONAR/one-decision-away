import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { computeLedgerBalance } from '../services/economy';
import { LifeBudgetCategory } from '../types/models';
import { useT } from '../i18n';

export const Budget: React.FC = () => {
  const { data, saveLifeBudget, openQuickJournal } = useApp();
  const t = useT();

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');
  const balance = data ? computeLedgerBalance(data.transactions) : 100;

  const defaultCategories: LifeBudgetCategory[] = [
    { id: 'b1', name: t('Sanctuary & Home'), percentage: 20, description: t('Living spaces and comfort') },
    { id: 'b2', name: t('Enterprise & Tools'), percentage: 15, description: t('Workstation and hardware') },
    { id: 'b3', name: t('Health & Vitality'), percentage: 15, description: t('Nutrition and recovery') },
    { id: 'b4', name: t('Mastery & Learning'), percentage: 10, description: t('Mentors and masterclasses') },
    { id: 'b5', name: t('Expeditions & Travel'), percentage: 15, description: t('Horizons and retreats') },
    { id: 'b6', name: t('Sovereign Capital'), percentage: 10, description: t('Security and reserves') },
    { id: 'b7', name: t('Contributions & Giving'), percentage: 10, description: t('Generosity and community') },
    { id: 'b8', name: t('Rituals & Experiences'), percentage: 5, description: t('Shared memories and craft') },
  ];

  const [categories, setCategories] = useState<LifeBudgetCategory[]>(
    data?.lifeBudget?.categories && data.lifeBudget.categories.length > 0
      ? data.lifeBudget.categories
      : defaultCategories
  );

  const monthlyBurnD = 18200; // Projected monthly simulation burn in D$

  if (!data) return null;

  const totalPercentage = categories.reduce((sum, c) => sum + c.percentage, 0);
  const isValid = totalPercentage === 100;

  const handlePercentageChange = (id: string, newPct: number) => {
    setCategories(
      categories.map((c) => (c.id === id ? { ...c, percentage: Math.max(0, Math.min(100, newPct)) } : c))
    );
  };

  const handleSave = async () => {
    if (!isValid) return;
    await saveLifeBudget({
      totalAllocatedPct: totalPercentage,
      categories,
    });
  };

  // Segment colors matching Variation 3 allocation bar
  const segmentColors = [
    '#708879',
    '#263238',
    '#E07A5F',
    '#5C6A72',
    '#8A969C',
    '#D4A373',
    '#4A5D52',
    '#B56550',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-8 lg:gap-12 items-start max-w-6xl mx-auto py-2">
      {/* Center Column — Sliders */}
      <div className="space-y-8 pr-0 lg:pr-6 lg:border-r border-[var(--border)]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-faint)] font-sans font-medium block mb-2">
            {t('Life OS / Simulation')}
          </span>
          <h1 className="font-display italic font-semibold text-4xl sm:text-5xl lg:text-[3.25rem] text-[var(--ink)] leading-none mb-3">
            {t('Simulation Budget')}
          </h1>
          <p className="text-base sm:text-lg text-[var(--ink-faint)] leading-relaxed max-w-xl font-sans font-normal">
            {t('Design how your ideal monthly effort and resources are distributed across life.')}
          </p>
        </div>

        <div className="flex flex-col divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="grid grid-cols-1 sm:grid-cols-[180px_1fr_60px] md:grid-cols-[210px_1fr_70px] items-center gap-4 sm:gap-6 py-5"
            >
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-[var(--ink)] leading-tight">{cat.name}</h3>
                <p className="text-xs text-[var(--ink-faint)] leading-normal">{cat.description}</p>
              </div>

              <div className="relative py-2">
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={cat.percentage}
                  onChange={(e) => handlePercentageChange(cat.id, parseInt(e.target.value) || 0)}
                  className="variation3-slider"
                  aria-label={t('{name} percentage', { name: cat.name })}
                />
              </div>

              <div className="font-mono text-sm text-[var(--ink)] text-left sm:text-right font-medium">
                {cat.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column — Summary Panel */}
      <aside className="bg-[var(--bg-elevated)] border border-[var(--border)] p-6 sm:p-7 flex flex-col space-y-7 lg:sticky lg:top-8">
        {/* Bank Badge */}
        <div className="bg-[var(--bg)] border border-[var(--border)] p-4 text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)] block mb-1 font-sans">
            {t('Bank Balance')}
          </span>
          <div className="font-display text-[1.8rem] leading-none text-[var(--ink)]">
            D$ {balance.toLocaleString()}
          </div>
        </div>

        {/* Quick Journal Trigger */}
        <div
          onClick={openQuickJournal}
          className="border border-dashed border-[var(--border)] p-4 flex justify-between items-center text-xs text-[var(--ink)] hover:border-[var(--accent)] cursor-pointer transition-colors"
          title={t('Open Quick Dream Journal ({shortcut})', { shortcut: isMac ? '⌘K' : 'Ctrl+K' })}
        >
          <span className="font-medium">{t('Quick Journal')}</span>
          <span className="opacity-40 font-mono text-xs">{isMac ? '⌘K' : 'Ctrl+K'}</span>
        </div>

        {/* Total Allocation Stat */}
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)] block mb-1.5 font-sans">
            {t('Total Allocation')}
          </span>
          <div className="font-display text-4xl leading-none text-[var(--ink)]">
            {totalPercentage}%
          </div>
          <div className={`text-xs mt-1.5 font-sans ${isValid ? 'text-[var(--ink-faint)]' : 'text-[var(--accent)] font-medium'}`}>
            {isValid ? t('Allocation is Balanced') : totalPercentage < 100 ? t('Needs +{n}% to balance', { n: 100 - totalPercentage }) : t('Exceeds 100% by +{n}%', { n: totalPercentage - 100 })}
          </div>
        </div>

        {/* Multi-Segment Allocation Bar */}
        <div className="h-10 w-full bg-[var(--bg)] border border-[var(--border)] flex overflow-hidden">
          {categories.map((cat, idx) => {
            if (cat.percentage <= 0) return null;
            return (
              <div
                key={cat.id}
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: segmentColors[idx % segmentColors.length],
                }}
                className="h-full transition-all duration-150"
                title={`${cat.name}: ${cat.percentage}%`}
              />
            );
          })}
          {totalPercentage < 100 && (
            <div
              style={{ width: `${100 - totalPercentage}%` }}
              className="h-full bg-[var(--bg-muted)] opacity-60"
              title={t('Unallocated: {n}%', { n: 100 - totalPercentage })}
            />
          )}
        </div>

        {/* Projected Burn Stat */}
        <div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)] block mb-1.5 font-sans">
            {t('Projected Burn')}
          </span>
          <div className="font-display text-3xl leading-none text-[var(--ink)]">
            D$ {monthlyBurnD.toLocaleString()}{' '}
            <span className="text-xs font-sans text-[var(--ink-faint)]">{t('/mo')}</span>
          </div>
        </div>

        {/* Save Allocation Action Button */}
        <button
          onClick={handleSave}
          disabled={!isValid}
          className={`w-full py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all cursor-pointer ${
            isValid
              ? 'bg-[var(--ink)] text-[var(--bg)] hover:bg-[var(--accent)] shadow-sm'
              : 'bg-[var(--bg-muted)] text-[var(--ink-faint)] border border-[var(--border)] cursor-not-allowed'
          }`}
        >
          {t('Save Allocation')}
        </button>

        {/* Note Footer */}
        <p className="text-[11px] text-[var(--ink-faint)] leading-relaxed pt-5 border-t border-[var(--border)] font-sans">
          <strong className="text-[var(--ink)]">{t('Note:')}</strong> {t('The Life Simulation Budget is a design blueprint to align your intentions with how you spend your energy, focus, and time.')}
        </p>
      </aside>
    </div>
  );
};
