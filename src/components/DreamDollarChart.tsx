import React, { useEffect, useMemo, useState } from 'react';
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
import { ECONOMY_CONSTANTS } from '../services/economy';
import { getSpeechLang, useT } from '../i18n';

/* ----------------------------- Chart palette ----------------------------- */
const readVar = (name: string, fallback: string): string => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

const readChartColors = () => ({
  accent: readVar('--accent', '#1F5F3F'),
  secondary: readVar('--border-strong', '#C9C9C6'),
  tertiary: readVar('--fg-muted', '#6F6F6C'),
  grid: readVar('--border', '#E4E4E1'),
  text: readVar('--fg-muted', '#6F6F6C'),
  fg: readVar('--fg', '#111111'),
});

const useChartColors = () => {
  const [colors, setColors] = useState(readChartColors);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => setColors(readChartColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => observer.disconnect();
  }, []);
  return colors;
};

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

  const row = (label: string, amount: number) => (
    <div className="flex items-center justify-between gap-4 text-[var(--fg-muted)]">
      <span>{label}</span>
      <span className="text-[var(--fg)] font-medium">+D$ {amount.toLocaleString()}</span>
    </div>
  );

  return (
    <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[12px] p-3 min-w-[200px] pointer-events-none">
      <div className="flex items-center justify-between gap-3 pb-2 mb-2 border-b border-[var(--border)]">
        <div>
          <span className="font-semibold text-[var(--fg)] block">{d.fullWeekday}</span>
          <span className="text-[var(--fg-muted)]">{d.dateLabel}</span>
        </div>
        {d.isToday && <span className="text-[var(--accent)] font-medium">{t('Today')}</span>}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[var(--fg-muted)]">{t('Total Earned:')}</span>
          <span className="font-semibold text-[var(--accent)]">+D$ {d.earnings.toLocaleString()}</span>
        </div>

        {d.earnings > 0 ? (
          <div className="space-y-1 pt-1">
            {d.missionsEarned > 0 && row(t('Missions & Decisions:'), d.missionsEarned)}
            {d.habitsEarned > 0 && row(t('Micro-Habits:'), d.habitsEarned)}
            {d.focusEarned > 0 && row(t('Focus Deep Work:'), d.focusEarned)}
            {d.checkInsEarned > 0 && row(t('Check-In Reflection:'), d.checkInsEarned)}
            {d.bonusesEarned > 0 && row(t('Streaks & Grants:'), d.bonusesEarned)}
            <div className="text-[var(--fg-subtle)] pt-1">
              {d.txCount === 1 ? t('1 deposit transaction') : t('{n} deposit transactions', { n: d.txCount })}
            </div>
          </div>
        ) : (
          <div className="text-[var(--fg-subtle)] py-1">{t('Nothing earned on this day.')}</div>
        )}

        {d.spent > 0 && (
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-[var(--border)] text-[var(--fg-muted)]">
            <span>{t('Spent:')}</span>
            <span className="text-[var(--fg)] font-medium">-D$ {d.spent.toLocaleString()}</span>
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
  const colors = useChartColors();
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

  const breakdownRows = [
    { label: t('Missions & OD'), amount: metrics.breakdown.missions },
    { label: t('Micro-Habits'), amount: metrics.breakdown.habits },
    { label: t('Focus Work'), amount: metrics.breakdown.focus },
    { label: t('Check-ins & Bonus'), amount: metrics.breakdown.checkIns + metrics.breakdown.bonuses },
  ];

  return (
    <div className={`bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Earnings')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">{t('Dream Dollars earned each day, last 7 days.')}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[22px] font-semibold text-[var(--accent)] leading-none">
            +D$ {metrics.totalEarned.toLocaleString()}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-1">{t('7-Day Total')}</div>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--accent)] leading-none">
            +D$ {metrics.todayData.earnings.toLocaleString()}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t("Today's Output")}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {metrics.todayData.txCount === 1
              ? t('1 action logged today')
              : t('{n} actions logged today', { n: metrics.todayData.txCount })}
          </div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
            +D$ {metrics.dailyAvg.toLocaleString()}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Daily Average')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">{t('Paced across 7 days')}</div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
            +D$ {metrics.peakDay.earnings.toLocaleString()}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Best Day')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {metrics.peakDay.earnings > 0
              ? `${metrics.peakDay.weekday} (${metrics.peakDay.dateLabel})`
              : t('No activity yet')}
          </div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
            {t('{n} / 7 Days', { n: metrics.activeDays })}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Consistency')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('{pct}% weekly execution rate', { pct: Math.round((metrics.activeDays / 7) * 100) })}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 8, left: -4, bottom: 0 }}
            onMouseMove={(state) => {
              if (state && state.activeTooltipIndex !== undefined) {
                setHoveredIndex(Number(state.activeTooltipIndex));
              }
            }}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <CartesianGrid vertical={false} stroke={colors.grid} />

            <XAxis
              dataKey="weekday"
              axisLine={{ stroke: colors.grid }}
              tickLine={false}
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
                      fill={isCurrent ? colors.fg : colors.text}
                      fontSize={11}
                      fontFamily="var(--font-sans)"
                      fontWeight={isCurrent ? 600 : 400}
                    >
                      {payload.value}
                    </text>
                    {item && (
                      <text
                        x={0}
                        y={0}
                        dy={27}
                        textAnchor="middle"
                        fill={colors.text}
                        fontSize={10}
                        fontFamily="var(--font-sans)"
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
              tick={{ fill: colors.text, fontSize: 11, fontFamily: 'var(--font-sans)' }}
              width={54}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.grid, opacity: 0.5 }} />

            {metrics.dailyAvg > 0 && (
              <ReferenceLine y={metrics.dailyAvg} stroke={colors.tertiary} strokeWidth={1} />
            )}

            <Bar dataKey="earnings" radius={[4, 4, 0, 0]} maxBarSize={44} animationDuration={500}>
              {chartData.map((entry, index) => {
                const isHovered = hoveredIndex === index;
                let fillColor = colors.accent;
                let opacity = 0.75;

                if (entry.earnings === 0) {
                  fillColor = colors.secondary;
                  opacity = 0.6;
                } else if (entry.isToday || isHovered) {
                  opacity = 1;
                }

                return <Cell key={`cell-${entry.dayKey}`} fill={fillColor} fillOpacity={opacity} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Source breakdown */}
      <div className="space-y-3">
        <h4 className="text-[15px] font-semibold text-[var(--fg)]">{t('By source')}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {breakdownRows.map((rowItem) => (
            <div key={rowItem.label} className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
              <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
                +D$ {rowItem.amount.toLocaleString()}
              </div>
              <div className="text-[12px] text-[var(--fg-muted)] mt-2">{rowItem.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
