import React from 'react';
import { useApp } from '../store/useApp';
import { Card } from './ui';
import { ArrowRight } from 'lucide-react';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { EXPLORE_DREAM_ITEMS } from '../data/exploreDreams';
import { computeLedgerBalance, estimateDailyEarningPace, daysToAfford, calculateOneDecisionStreakData } from '../services/economy';
import { useT } from '../i18n';

/** Saturday/Sunday: a 30-second look back at the week and forward at the closest dream. */
export const WeekendSummary: React.FC = () => {
  const t = useT();
  const { data, setActiveRoute } = useApp();
  if (!data) return null;
  const day = new Date().getDay();
  if (day !== 0 && day !== 6) return null;

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekKey = weekAgo.toISOString().slice(0, 10);
  const earned = data.transactions.filter((t) => t.amount > 0 && t.kind !== 'welcome_grant' && t.dayKey >= weekKey).reduce((a, t) => a + t.amount, 0);
  const decisions = data.missions.filter((m) => m.isOneDecision && m.status === 'completed' && (m.completedAt || '') >= weekKey).length;
  const focusMin = data.completions.filter((c) => c.completedAt >= weekKey).reduce((a, c) => a + (c.focusMinutes || 0), 0);
  const streak = calculateOneDecisionStreakData(data);
  const balance = computeLedgerBalance(data.transactions);
  const pace = estimateDailyEarningPace(data.transactions);

  const all = [...SEED_MARKET_ITEMS, ...(data.customMarketItems || [])];
  const closest = (data.inVisionItemIds || [])
    .map((id) => all.find((i) => i.id === id) || EXPLORE_DREAM_ITEMS.find((i) => i.id === id))
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => a.dreamDollarPrice - b.dreamDollarPrice)[0];
  const daysLeft = closest ? daysToAfford(closest.dreamDollarPrice, balance, pace.perDay) : null;

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('This week')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">{t('Just the numbers, no judgment.')}</p>
        </div>
        <span className={`text-[15px] font-semibold tabular-nums shrink-0 ${earned > 0 ? 'text-[var(--accent)]' : 'text-[var(--fg-muted)]'}`}>
          + D$ {earned.toLocaleString()}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-[var(--bg)] rounded-[var(--radius-sm)]">
          <div className="text-[12px] text-[var(--fg-subtle)]">{t('Decisions')}</div>
          <div className="text-[17px] font-semibold text-[var(--fg)] tabular-nums">{decisions}</div>
        </div>
        <div className="p-3 bg-[var(--bg)] rounded-[var(--radius-sm)]">
          <div className="text-[12px] text-[var(--fg-subtle)]">{t('Focus minutes')}</div>
          <div className="text-[17px] font-semibold text-[var(--fg)] tabular-nums">{focusMin}</div>
        </div>
        <div className="p-3 bg-[var(--bg)] rounded-[var(--radius-sm)]">
          <div className="text-[12px] text-[var(--fg-subtle)]">{t('Day streak')}</div>
          <div className="text-[17px] font-semibold text-[var(--fg)] tabular-nums">{streak.currentStreak}</div>
        </div>
      </div>
      {closest && (
        <button type="button" onClick={() => setActiveRoute('/app/life')} className="w-full text-left flex items-center justify-between gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--bg)] hover:bg-[var(--bg-inset)] transition-colors cursor-pointer min-h-[44px]">
          <div className="text-[14px] min-w-0">
            <span className="text-[var(--fg-muted)]">{t('Closest dream:')} </span>
            <span className="text-[var(--fg)] font-medium">{closest.name}</span>
            <span className="text-[var(--fg-muted)]"> — {daysLeft === 0 ? t('affordable now') : t('~{n} days at this pace', { n: daysLeft ?? 0 })}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-[var(--fg-subtle)] shrink-0" strokeWidth={1.8} />
        </button>
      )}
    </Card>
  );
};
