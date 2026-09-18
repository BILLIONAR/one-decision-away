import React from 'react';
import { useApp } from '../store/useApp';
import { Card, Badge } from './ui';
import { CalendarCheck, Flame, Target } from 'lucide-react';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { EXPLORE_DREAM_ITEMS } from '../data/exploreDreams';
import { computeLedgerBalance, estimateDailyEarningPace, daysToAfford, calculateOneDecisionStreakData } from '../services/economy';

/** Saturday/Sunday: a 30-second look back at the week and forward at the closest dream. */
export const WeekendSummary: React.FC = () => {
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
    <Card padding="md" className="space-y-3 bg-[var(--bg-elevated)] border border-[var(--color-sage)]/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-sage)]/15 text-[var(--color-sage)] flex items-center justify-center">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">This Week, In 30 Seconds</h3>
            <p className="text-[11px] text-[var(--fg-muted)]">Weekend review — no judgment, just the numbers.</p>
          </div>
        </div>
        <Badge variant={earned > 0 ? 'sage' : 'subtle'}>+ D$ {earned.toLocaleString()}</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 bg-[var(--bg-muted)]/60 rounded-[var(--radius-sm)]">
          <div className="text-xl font-bold font-display text-[var(--fg)]">{decisions}</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">One Decisions</div>
        </div>
        <div className="p-3 bg-[var(--bg-muted)]/60 rounded-[var(--radius-sm)]">
          <div className="text-xl font-bold font-display text-[var(--fg)]">{focusMin}</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">Focus minutes</div>
        </div>
        <div className="p-3 bg-[var(--bg-muted)]/60 rounded-[var(--radius-sm)]">
          <div className="text-xl font-bold font-display text-[var(--fg)] flex items-center justify-center gap-1"><Flame className="w-4 h-4 text-[var(--color-coral)]" />{streak.currentStreak}</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">Day streak</div>
        </div>
      </div>
      {closest && (
        <button type="button" onClick={() => setActiveRoute('/app/life')} className="w-full text-left flex items-center gap-3 p-3 rounded-[var(--radius-sm)] border border-[var(--border)] hover:border-[var(--color-sage)] cursor-pointer">
          <Target className="w-4 h-4 text-[var(--color-sage)] shrink-0" />
          <div className="text-xs">
            <span className="text-[var(--fg-muted)]">Closest dream: </span>
            <strong className="text-[var(--fg)]">{closest.name}</strong>
            <span className="text-[var(--fg-muted)]"> — {daysLeft === 0 ? 'affordable now' : `~${daysLeft} days at this pace`}</span>
          </div>
        </button>
      )}
    </Card>
  );
};
