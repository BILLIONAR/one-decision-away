import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { WalletTransaction } from '../types/models';
import { Card, Badge } from './ui';
import {
  TrendingUp,
  Coins,
  Sparkles,
  Calendar,
  Zap,
  Target,
  CheckCircle2,
  Clock,
  Flame,
} from 'lucide-react';
import { ECONOMY_CONSTANTS } from '../services/economy';
import { getSpeechLang, useT } from '../i18n';

export interface DreamDollarChartProps {
  transactions: WalletTransaction[];
  className?: string;
  dailyCap?: number;
}

interface DayEarningsData {
  dayKey: string;
  date: Date;
  weekday: string;
  fullWeekday: string;
  dateLabel: string;
  earnings: number;
  spent: number;
  net: number;
  txCount: number;
  missionsEarned: number;
  habitsEarned: number;
  focusEarned: number;
  checkInsEarned: number;
  bonusesEarned: number;
  isToday: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: DayEarningsData;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  const t = useT();
  if (!active || !payload || !payload.length || !payload[0]?.payload) {
    return null;
  }

  const d = payload[0].payload as DayEarningsData;

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-strong)] shadow-[var(--shadow-md)] rounded-[var(--radius-sm)] p-3 text-xs min-w-[200px] pointer-events-none transition-all duration-75">
      {/* Date Header */}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-1.5 mb-2 font-sans">
        <div>
          <span className="font-bold text-[var(--fg)] text-xs block">
            {d.fullWeekday}
          </span>
          <span className="text-[10px] text-[var(--fg-subtle)]">
            {d.dateLabel} ({d.dayKey})
          </span>
        </div>
        {d.isToday && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[var(--color-sage)] text-white">
            {t('Today')}
          </span>
        )}
      </div>

      {/* Total Earnings */}
      <div className="space-y-1.5 font-sans">
        <div className="flex items-center justify-between text-xs pb-1 border-b border-[var(--border)]">
          <span className="text-[var(--fg-muted)] font-medium">{t('Total Earned:')}</span>
          <span className="font-mono font-bold text-[var(--color-sage)] text-sm">
            + D$ {d.earnings.toLocaleString()}
          </span>
        </div>

        {/* Source breakdown if earnings > 0 */}
        {d.earnings > 0 ? (
          <div className="space-y-1 pt-0.5 text-[11px]">
            {d.missionsEarned > 0 && (
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-[var(--color-sage)] shrink-0" />
                  <span>{t('Missions & Decisions:')}</span>
                </span>
                <span className="font-mono font-semibold text-[var(--fg)]">
                  +D$ {d.missionsEarned.toLocaleString()}
                </span>
              </div>
            )}

            {d.habitsEarned > 0 && (
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>{t('Micro-Habits:')}</span>
                </span>
                <span className="font-mono font-semibold text-[var(--fg)]">
                  +D$ {d.habitsEarned.toLocaleString()}
                </span>
              </div>
            )}

            {d.focusEarned > 0 && (
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-500 shrink-0" />
                  <span>{t('Focus Deep Work:')}</span>
                </span>
                <span className="font-mono font-semibold text-[var(--fg)]">
                  +D$ {d.focusEarned.toLocaleString()}
                </span>
              </div>
            )}

            {d.checkInsEarned > 0 && (
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-teal-500 shrink-0" />
                  <span>{t('Check-In Reflection:')}</span>
                </span>
                <span className="font-mono font-semibold text-[var(--fg)]">
                  +D$ {d.checkInsEarned.toLocaleString()}
                </span>
              </div>
            )}

            {d.bonusesEarned > 0 && (
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[var(--color-coral)] shrink-0" />
                  <span>{t('Streaks & Grants:')}</span>
                </span>
                <span className="font-mono font-semibold text-[var(--fg)]">
                  +D$ {d.bonusesEarned.toLocaleString()}
                </span>
              </div>
            )}

            <div className="text-[10px] text-[var(--fg-subtle)] pt-1 text-right">
              {d.txCount === 1 ? t('1 deposit transaction') : t('{n} deposit transactions', { n: d.txCount })}
            </div>
          </div>
        ) : (
          <div className="text-[11px] text-[var(--fg-subtle)] py-1 italic">
            {t('Zero currency generated on this date.')}
          </div>
        )}

        {/* Spent info if any */}
        {d.spent > 0 && (
          <div className="flex items-center justify-between pt-1.5 border-t border-[var(--border)] text-[11px] text-[var(--color-coral)]">
            <span>{t('Marketplace Outflow:')}</span>
            <span className="font-mono font-semibold">- D$ {d.spent.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const DreamDollarChart: React.FC<DreamDollarChartProps> = ({
  transactions,
  className = '',
  dailyCap = ECONOMY_CONSTANTS.DAILY_REWARD_CAP,
}) => {
  const t = useT();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute 7-day chronological data array (6 days ago to today)
  const chartData = useMemo<DayEarningsData[]>(() => {
    const result: DayEarningsData[] = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);

      const weekdayShort = d.toLocaleDateString(getSpeechLang(), { weekday: 'short' });
      const fullWeekday = d.toLocaleDateString(getSpeechLang(), { weekday: 'long' });
      const dateFormatted = d.toLocaleDateString(getSpeechLang(), { month: 'short', day: 'numeric' });

      const dayTxs = transactions.filter((t) => t.dayKey === dayKey);
      const earnTxs = dayTxs.filter((t) => t.amount > 0);
      const totalEarned = earnTxs.reduce((sum, t) => sum + t.amount, 0);

      const missionsEarned = earnTxs
        .filter((t) => t.kind === 'mission_reward' || t.kind === 'one_decision_reward')
        .reduce((sum, t) => sum + t.amount, 0);

      const habitsEarned = earnTxs
        .filter((t) => t.kind === 'micro_habit_reward')
        .reduce((sum, t) => sum + t.amount, 0);

      const focusEarned = earnTxs
        .filter((t) => t.kind === 'focus_reward')
        .reduce((sum, t) => sum + t.amount, 0);

      const checkInsEarned = earnTxs
        .filter((t) => t.kind === 'check_in_reward' || t.kind === 'notebook_reward')
        .reduce((sum, t) => sum + t.amount, 0);

      const bonusesEarned = earnTxs
        .filter(
          (t) =>
            t.kind === 'streak_bonus' ||
            t.kind === 'season_reward' ||
            t.kind === 'welcome_grant'
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const spendTxs = dayTxs.filter((t) => t.amount < 0);
      const totalSpent = spendTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);

      result.push({
        dayKey,
        date: d,
        weekday: weekdayShort,
        fullWeekday,
        dateLabel: dateFormatted,
        earnings: totalEarned,
        spent: totalSpent,
        net: totalEarned - totalSpent,
        txCount: earnTxs.length,
        missionsEarned,
        habitsEarned,
        focusEarned,
        checkInsEarned,
        bonusesEarned,
        isToday: i === 0,
      });
    }

    return result;
  }, [transactions, t]);

  // Aggregate metrics over the 7 days
  const metrics = useMemo(() => {
    const totalEarned = chartData.reduce((sum, d) => sum + d.earnings, 0);
    const dailyAvg = Math.round(totalEarned / 7);
    const activeDays = chartData.filter((d) => d.earnings > 0).length;

    let peakDay = chartData[0];
    chartData.forEach((d) => {
      if (d.earnings > peakDay.earnings) {
        peakDay = d;
      }
    });

    // Breakdown totals across 7 days
    const totalMissions = chartData.reduce((sum, d) => sum + d.missionsEarned, 0);
    const totalHabits = chartData.reduce((sum, d) => sum + d.habitsEarned, 0);
    const totalFocus = chartData.reduce((sum, d) => sum + d.focusEarned, 0);
    const totalCheckIns = chartData.reduce((sum, d) => sum + d.checkInsEarned, 0);
    const totalBonuses = chartData.reduce((sum, d) => sum + d.bonusesEarned, 0);

    const todayData = chartData[chartData.length - 1];

    return {
      totalEarned,
      dailyAvg,
      activeDays,
      peakDay,
      todayData,
      breakdown: {
        missions: totalMissions,
        habits: totalHabits,
        focus: totalFocus,
        checkIns: totalCheckIns,
        bonuses: totalBonuses,
      },
    };
  }, [chartData]);

  // Max value for Y scale with comfortable headroom
  const maxY = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.earnings), 250);
    return Math.max(Math.ceil((maxVal * 1.2) / 100) * 100, 300);
  }, [chartData]);

  return (
    <Card padding="md" className={`space-y-4 ${className}`}>
      {/* Header & Quick Velocity Overview */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-sans text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--color-sage)]">
              {t('Fig. 01 — 7-Day Output')}
            </span>
            <Badge variant="sage">{t('Recharts Engine')}</Badge>
          </div>
          <h3 className="text-xl font-bold font-display text-[var(--fg)] flex items-center gap-2">
            <Coins className="w-5 h-5 text-[var(--color-sage)]" />
            {t('7-Day Dream Dollar Earnings')}
          </h3>
          <p className="text-xs text-[var(--fg-muted)] font-sans">
            {t('Daily distribution of symbolic currency earned through focus sessions, missions, and identity votes.')}
          </p>
        </div>

        {/* 7-Day Total Tag */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[var(--bg-muted)] border border-[var(--border)] px-3 py-1.5 rounded-[var(--radius-sm)]">
          <TrendingUp className="w-4 h-4 text-[var(--color-sage)]" />
          <div className="text-right">
            <span className="text-[9px] uppercase tracking-wider text-[var(--fg-subtle)] font-bold block">
              {t('7-Day Total')}
            </span>
            <span className="font-mono font-bold text-sm text-[var(--fg)]">
              + D$ {metrics.totalEarned.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-sm)]">
        <div className="space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--fg-subtle)] flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[var(--color-sage)]" /> {t("Today's Output")}
          </span>
          <div className="text-lg font-bold font-display text-[var(--color-sage)]">
            + D$ {metrics.todayData.earnings.toLocaleString()}
          </div>
          <span className="text-[10px] text-[var(--fg-subtle)] font-sans">
            {metrics.todayData.txCount === 1
              ? t('1 action logged today')
              : t('{n} actions logged today', { n: metrics.todayData.txCount })}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--fg-subtle)] flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[var(--fg-muted)]" /> {t('Daily Average')}
          </span>
          <div className="text-lg font-bold font-display text-[var(--fg)]">
            + D$ {metrics.dailyAvg.toLocaleString()}
          </div>
          <span className="text-[10px] text-[var(--fg-subtle)] font-sans">
            {t('Paced across 7 days')}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--fg-subtle)] flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> {t('Best Day')}
          </span>
          <div className="text-lg font-bold font-display text-[var(--fg)]">
            + D$ {metrics.peakDay.earnings.toLocaleString()}
          </div>
          <span className="text-[10px] text-[var(--fg-subtle)] font-sans">
            {metrics.peakDay.earnings > 0
              ? `${metrics.peakDay.weekday} (${metrics.peakDay.dateLabel})`
              : t('No activity yet')}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--fg-subtle)] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[var(--color-sage)]" /> {t('Consistency')}
          </span>
          <div className="text-lg font-bold font-display text-[var(--fg)]">
            {t('{n} / 7 Days', { n: metrics.activeDays })}
          </div>
          <span className="text-[10px] text-[var(--fg-subtle)] font-sans">
            {t('{pct}% weekly execution rate', { pct: Math.round((metrics.activeDays / 7) * 100) })}
          </span>
        </div>
      </div>

      {/* Recharts Bar Chart Visualization */}
      <div className="w-full h-56 pt-2 pb-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 18, right: 12, left: -4, bottom: 0 }}
            onMouseMove={(state) => {
              if (state && state.activeTooltipIndex !== undefined) {
                setHoveredIndex(state.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              opacity={0.7}
            />

            <XAxis
              dataKey="weekday"
              axisLine={{ stroke: 'var(--border-strong)' }}
              tickLine={{ stroke: 'var(--border)' }}
              tick={({ x, y, payload }) => {
                const item = chartData.find((d) => d.weekday === payload.value);
                const isCurrent = item?.isToday;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={14}
                      textAnchor="middle"
                      fill={isCurrent ? 'var(--color-sage)' : 'var(--fg-subtle)'}
                      fontSize={11}
                      fontFamily="var(--font-sans)"
                      fontWeight={isCurrent ? 700 : 500}
                    >
                      {payload.value}
                    </text>
                    {item && (
                      <text
                        x={0}
                        y={0}
                        dy={26}
                        textAnchor="middle"
                        fill="var(--fg-subtle)"
                        fontSize={9}
                        fontFamily="var(--font-mono)"
                        opacity={0.75}
                      >
                        {item.date.getDate()}
                      </text>
                    )}
                  </g>
                );
              }}
            />

            <YAxis
              domain={[0, maxY]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `D$ ${val}`}
              tick={{
                fill: 'var(--fg-subtle)',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
              }}
              width={54}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'var(--border)', opacity: 0.18 }}
            />

            {/* Daily Average Reference Line */}
            {metrics.dailyAvg > 0 && (
              <ReferenceLine
                y={metrics.dailyAvg}
                stroke="var(--color-sage)"
                strokeDasharray="4 4"
                strokeWidth={1.2}
                opacity={0.8}
              />
            )}

            <Bar
              dataKey="earnings"
              radius={[4, 4, 0, 0]}
              maxBarSize={44}
              animationDuration={700}
            >
              {chartData.map((entry, index) => {
                const isHovered = hoveredIndex === index;
                // Color assignment: today gets solid sage, active days get sage with subtle tonal step
                let fillColor = 'var(--color-sage)';
                let opacity = 0.85;

                if (entry.earnings === 0) {
                  fillColor = 'var(--border-strong)';
                  opacity = 0.45;
                } else if (entry.isToday) {
                  fillColor = 'var(--color-sage)';
                  opacity = 1;
                } else if (isHovered) {
                  opacity = 1;
                }

                return (
                  <Cell
                    key={`cell-${entry.dayKey}`}
                    fill={fillColor}
                    fillOpacity={opacity}
                    stroke={entry.isToday ? 'var(--fg)' : undefined}
                    strokeWidth={entry.isToday ? 1.5 : 0}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 7-Day Source Breakdown Chips */}
      <div className="pt-2 border-t border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--fg-subtle)] font-sans">
          <span>{t('7-Day Earnings by Contribution Source')}</span>
          <span className="flex items-center gap-1 text-[var(--color-sage)]">
            <Sparkles className="w-3 h-3" />
            {t('Immutable Ledger Data')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Missions & Decisions */}
          <div className="p-2 rounded-[var(--radius-xs)] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <div className="w-2 h-2 rounded-full bg-[var(--color-sage)] shrink-0" />
              <span className="text-[11px] text-[var(--fg-muted)] truncate">{t('Missions & OD')}</span>
            </div>
            <span className="font-mono font-bold text-[11px] text-[var(--fg)] shrink-0 pl-1">
              +D$ {metrics.breakdown.missions.toLocaleString()}
            </span>
          </div>

          {/* Micro-Habits */}
          <div className="p-2 rounded-[var(--radius-xs)] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="text-[11px] text-[var(--fg-muted)] truncate">{t('Micro-Habits')}</span>
            </div>
            <span className="font-mono font-bold text-[11px] text-[var(--fg)] shrink-0 pl-1">
              +D$ {metrics.breakdown.habits.toLocaleString()}
            </span>
          </div>

          {/* Focus Sessions */}
          <div className="p-2 rounded-[var(--radius-xs)] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
              <span className="text-[11px] text-[var(--fg-muted)] truncate">{t('Focus Work')}</span>
            </div>
            <span className="font-mono font-bold text-[11px] text-[var(--fg)] shrink-0 pl-1">
              +D$ {metrics.breakdown.focus.toLocaleString()}
            </span>
          </div>

          {/* Check-ins & Streaks */}
          <div className="p-2 rounded-[var(--radius-xs)] bg-[var(--bg)] border border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <div className="w-2 h-2 rounded-full bg-[var(--color-coral)] shrink-0" />
              <span className="text-[11px] text-[var(--fg-muted)] truncate">{t('Check-ins & Bonus')}</span>
            </div>
            <span className="font-mono font-bold text-[11px] text-[var(--fg)] shrink-0 pl-1">
              +D$ {(metrics.breakdown.checkIns + metrics.breakdown.bonuses).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
