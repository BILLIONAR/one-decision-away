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
    { id: 'b1', name: t('Home'), percentage: 20, description: t('Living space and comfort') },
    { id: 'b2', name: t('Work'), percentage: 15, description: t('Tools and workspace') },
    { id: 'b3', name: t('Health'), percentage: 15, description: t('Food, movement, rest') },
    { id: 'b4', name: t('Learning'), percentage: 10, description: t('Courses and mentors') },
    { id: 'b5', name: t('Travel'), percentage: 15, description: t('Trips and retreats') },
    { id: 'b6', name: t('Savings'), percentage: 10, description: t('Security and reserves') },
    { id: 'b7', name: t('Giving'), percentage: 10, description: t('Generosity and community') },
    { id: 'b8', name: t('Experiences'), percentage: 5, description: t('Shared memories') },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Budget')}</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">{t('How you want your effort spread across life.')}</p>
      </div>

      <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs text-[var(--fg-muted)]">{t('Allocated')}</div>
            <div className="text-3xl font-semibold tracking-tight text-[var(--fg)] mt-1">{totalPercentage}%</div>
            <div className={`text-xs mt-1 ${isValid ? 'text-[var(--fg-muted)]' : 'text-[var(--danger)]'}`}>
              {isValid
                ? t('Balanced')
                : totalPercentage < 100
                ? t('{n}% left to place', { n: 100 - totalPercentage })
                : t('{n}% over', { n: totalPercentage - 100 })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[var(--fg-muted)]">{t('Balance')}</div>
            <div className="text-lg font-semibold tracking-tight text-[var(--accent)] mt-1">
              D$ {balance.toLocaleString()}
            </div>
            <div className="text-xs text-[var(--fg-subtle)] mt-1">
              {t('D$ {n}/month planned', { n: monthlyBurnD.toLocaleString() })}
            </div>
          </div>
        </div>

        <div className="h-2 w-full bg-[var(--border-strong)] rounded-full flex overflow-hidden gap-px">
          {categories.map((cat) => {
            if (cat.percentage <= 0) return null;
            return (
              <div
                key={cat.id}
                style={{ width: `${cat.percentage}%` }}
                className="h-full bg-[var(--accent)] transition-all duration-150"
                title={`${t(cat.name)}: ${cat.percentage}%`}
              />
            );
          })}
        </div>
      </div>

      <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
        {categories.map((cat) => (
          <div key={cat.id} className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="font-medium text-[var(--fg)]">{t(cat.name)}</div>
                <div className="text-xs text-[var(--fg-muted)]">{t(cat.description)}</div>
              </div>
              <span className="text-[var(--fg)] font-medium shrink-0">{cat.percentage}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              value={cat.percentage}
              onChange={(e) => handlePercentageChange(cat.id, parseInt(e.target.value) || 0)}
              className="w-full accent-[var(--accent)] cursor-pointer"
              aria-label={t('{name} percentage', { name: t(cat.name) })}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!isValid}
        className="w-full h-12 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] font-semibold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t('Save')}
      </button>

      <button
        type="button"
        onClick={openQuickJournal}
        className="w-full min-h-[52px] px-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] flex justify-between items-center text-sm text-[var(--fg)]"
        title={t('Open quick journal ({shortcut})', { shortcut: isMac ? '⌘K' : 'Ctrl+K' })}
      >
        <span className="font-medium">{t('Quick journal')}</span>
        <span className="text-[var(--fg-subtle)] text-xs">{isMac ? '⌘K' : 'Ctrl+K'}</span>
      </button>

      <p className="text-xs text-[var(--fg-subtle)]">
        {t('This is a plan for your energy and attention, not a real bank budget.')}
      </p>
    </div>
  );
};
