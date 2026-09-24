import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store/useApp';
import { Button } from './ui';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  BarChart,
} from 'recharts';
import { Download } from 'lucide-react';
import { DailyPrimaryGoal } from '../types/models';
import { ExportProgressModal } from './ExportProgressModal';
import { useT, t, getSpeechLang } from '../i18n';

/* ----------------------------- Chart palette ----------------------------- */
const CHART_FALLBACK = {
  accent: '#1F5F3F',
  secondary: '#C9C9C6',
  tertiary: '#6F6F6C',
  grid: '#E4E4E1',
  text: '#6F6F6C',
  bg: '#FFFFFF',
};

const readVar = (name: string, fallback: string): string => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

const readChartColors = () => ({
  accent: readVar('--accent', CHART_FALLBACK.accent),
  secondary: readVar('--border-strong', CHART_FALLBACK.secondary),
  tertiary: readVar('--fg-muted', CHART_FALLBACK.tertiary),
  grid: readVar('--border', CHART_FALLBACK.grid),
  text: readVar('--fg-muted', CHART_FALLBACK.text),
  bg: readVar('--bg', CHART_FALLBACK.bg),
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

export interface GoalMilestone {
  streakDays: number;
  level: 'bronze' | 'silver' | 'gold' | 'diamond' | 'master';
  label: string;
  title: string;
  description: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  nodeStroke: string;
  nodeFill: string;
  haloColor: string;
  iconName: 'flame' | 'shield' | 'trophy' | 'crown' | 'sparkles';
}

const MILESTONE_COLORS = {
  badgeBg: 'var(--accent-soft)',
  badgeBorder: 'var(--accent)',
  badgeColor: 'var(--accent)',
  nodeStroke: 'var(--accent)',
  nodeFill: 'var(--accent)',
  haloColor: 'var(--accent-soft)',
};

export const getStreakMilestone = (streak: number): GoalMilestone | null => {
  if (streak === 5) {
    return {
      streakDays: 5,
      level: 'bronze',
      label: t('5-Day Streak'),
      title: t('5-Day Momentum Milestone'),
      description: t('5 consecutive days of locked-in daily primary goal focus.'),
      ...MILESTONE_COLORS,
      iconName: 'flame',
    };
  }
  if (streak === 10) {
    return {
      streakDays: 10,
      level: 'silver',
      label: t('10-Day Streak'),
      title: t('10-Day Consistency Milestone'),
      description: t('Double-digit streak! 10 unbroken days of high-leverage execution.'),
      ...MILESTONE_COLORS,
      iconName: 'shield',
    };
  }
  if (streak === 15) {
    return {
      streakDays: 15,
      level: 'gold',
      label: t('15-Day Streak'),
      title: t('15-Day Discipline Milestone'),
      description: t('15 consecutive days of sustained excellence and focus momentum.'),
      ...MILESTONE_COLORS,
      iconName: 'trophy',
    };
  }
  if (streak === 20) {
    return {
      streakDays: 20,
      level: 'diamond',
      label: t('20-Day Streak'),
      title: t('20-Day Mastery Milestone'),
      description: t('20 consecutive days of goal completion! Elite top-tier consistency.'),
      ...MILESTONE_COLORS,
      iconName: 'crown',
    };
  }
  if (streak === 25 || streak === 30) {
    return {
      streakDays: streak,
      level: 'master',
      label: t('{n}-Day Streak', { n: streak }),
      title: t('{n}-Day Legendary Milestone', { n: streak }),
      description: t('{n} consecutive days of world-class discipline and execution velocity.', { n: streak }),
      ...MILESTONE_COLORS,
      iconName: 'crown',
    };
  }
  return null;
};

interface DayGoalDataPoint {
  dateKey: string;
  displayDate: string;
  fullDate: string;
  dayOfWeek: string;
  goal?: DailyPrimaryGoal;
  hasGoal: number; // 1 or 0
  isCompleted: number; // 1 or 0
  isIncomplete: number; // 1 or 0
  status: 'completed' | 'incomplete' | 'none';
  title: string;
  rollingRate: number; // 7-day rolling % (0 - 100)
  consecutiveStreak: number;
  milestone: GoalMilestone | null;
}

interface WeeklyAggregatePoint {
  weekLabel: string;
  daysWithGoal: number;
  completedGoals: number;
  incompleteGoals: number;
  completionRate: number;
}

interface MilestoneDotProps {
  cx?: number;
  cy?: number;
  payload?: DayGoalDataPoint;
  showMilestones?: boolean;
  selectedDateKey?: string | null;
  onSelectMilestone?: (dateKey: string) => void;
}

export const MilestoneDot: React.FC<MilestoneDotProps> = ({
  cx,
  cy,
  payload,
  showMilestones = true,
  selectedDateKey,
  onSelectMilestone,
}) => {
  if (cx == null || isNaN(cx) || cy == null || isNaN(cy) || !payload) {
    return null;
  }

  const milestone = payload.milestone;

  if (!showMilestones || !milestone) {
    return null;
  }

  const isSelected = selectedDateKey === payload.dateKey;
  const streak = milestone.streakDays;

  return (
    <g
      key={`milestone-node-${payload.dateKey}`}
      className="cursor-pointer"
      onClick={() => onSelectMilestone?.(payload.dateKey)}
    >
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 6 : 5}
        fill="var(--bg)"
        stroke="var(--accent)"
        strokeWidth={isSelected ? 2.5 : 2}
      />
      <rect x={cx - 13} y={cy - 26} width={26} height={16} rx={4} fill="var(--accent)" />
      <text
        x={cx}
        y={cy - 14.5}
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="9"
        fontWeight="600"
        fontFamily="var(--font-sans)"
      >
        {t('{n}d', { n: streak })}
      </text>
    </g>
  );
};

export const DailyPrimaryGoalsChart: React.FC<{
  className?: string;
  onExportPng?: () => void;
}> = ({ className = '', onExportPng }) => {
  const { data } = useApp();
  const t = useT();
  const colors = useChartColors();
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [showMilestones, setShowMilestones] = useState<boolean>(true);
  const [selectedMilestoneDateKey, setSelectedMilestoneDateKey] = useState<string | null>(null);
  const [showInternalExportModal, setShowInternalExportModal] = useState<boolean>(false);

  const handleExportClick = () => {
    if (onExportPng) {
      onExportPng();
    } else {
      setShowInternalExportModal(true);
    }
  };

  const dailyGoals = data?.dailyPrimaryGoals ?? [];
  const missions = data?.missions || [];
  const goalsMap = useMemo(() => {
    const map = new Map<string, DailyPrimaryGoal>();
    dailyGoals.forEach((g) => {
      map.set(g.dateKey, g);
    });

    // Enrich from One Decision missions if not explicitly present
    missions.forEach((m) => {
      if (m.isOneDecision) {
        const dateKey = m.scheduledFor || (m.completedAt ? m.completedAt.slice(0, 10) : m.createdAt.slice(0, 10));
        if (!map.has(dateKey)) {
          map.set(dateKey, {
            id: m.id,
            dateKey,
            title: m.title,
            completed: m.status === 'completed',
            notes: m.note || m.reflection?.completedSummary,
            completedAt: m.completedAt,
          });
        }
      }
    });

    return map;
  }, [dailyGoals, missions]);

  // Construct 30-day chronological dataset
  const { timelineData, weeklyData, stats } = useMemo(() => {
    const points: DayGoalDataPoint[] = [];
    const now = new Date();
    // 30 days window: from 29 days ago to today
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateKey = d.toISOString().slice(0, 10);
      const goal = goalsMap.get(dateKey);

      const isCompleted = goal?.completed ? 1 : 0;
      const isIncomplete = goal && !goal.completed ? 1 : 0;
      const hasGoal = goal ? 1 : 0;
      const status: 'completed' | 'incomplete' | 'none' = goal
        ? goal.completed
          ? 'completed'
          : 'incomplete'
        : 'none';

      points.push({
        dateKey,
        displayDate: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fullDate: d.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        dayOfWeek: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
        goal,
        hasGoal,
        isCompleted,
        isIncomplete,
        status,
        title: goal?.title || t('No Primary Goal Set'),
        rollingRate: 0,
        consecutiveStreak: 0,
        milestone: null,
      });
    }

    // Calculate rolling 7-day moving average completion rate
    for (let idx = 0; idx < points.length; idx++) {
      const windowStart = Math.max(0, idx - 6);
      const windowItems = points.slice(windowStart, idx + 1);
      const goalsSetInWindow = windowItems.filter((p) => p.hasGoal === 1);
      const completedInWindow = windowItems.filter((p) => p.isCompleted === 1);
      const rate =
        goalsSetInWindow.length > 0
          ? Math.round((completedInWindow.length / goalsSetInWindow.length) * 100)
          : 0;
      points[idx].rollingRate = rate;
    }

    // Calculate consecutive streaks and detect key milestones (like 5, 10, 15, 20 consecutive days)
    let runningStreak = 0;
    const thirtyDaysAgoTime = now.getTime() - 30 * 86400000;
    let checkTime = thirtyDaysAgoTime;
    for (let b = 0; b < 60; b++) {
      const prevDateKey = new Date(checkTime).toISOString().slice(0, 10);
      const prevGoal = goalsMap.get(prevDateKey);
      if (prevGoal?.completed) {
        runningStreak++;
        checkTime -= 86400000;
      } else {
        break;
      }
    }

    for (let idx = 0; idx < points.length; idx++) {
      if (points[idx].isCompleted === 1) {
        runningStreak++;
      } else {
        runningStreak = 0;
      }
      points[idx].consecutiveStreak = runningStreak;
      points[idx].milestone = getStreakMilestone(runningStreak);
    }

    // Aggregate into 4 rolling weekly buckets
    const weekly: WeeklyAggregatePoint[] = [];
    for (let w = 0; w < 4; w++) {
      const startIdx = w * 7;
      const endIdx = Math.min(points.length, startIdx + 7);
      const chunk = points.slice(startIdx, endIdx);
      const daysWithGoal = chunk.filter((p) => p.hasGoal === 1).length;
      const completedGoals = chunk.filter((p) => p.isCompleted === 1).length;
      const incompleteGoals = chunk.filter((p) => p.isIncomplete === 1).length;
      const rate = daysWithGoal > 0 ? Math.round((completedGoals / daysWithGoal) * 100) : 0;

      const firstDate = chunk[0]?.displayDate || '';
      const lastDate = chunk[chunk.length - 1]?.displayDate || '';

      weekly.push({
        weekLabel: t('Wk {n} ({from} - {to})', { n: w + 1, from: firstDate, to: lastDate }),
        daysWithGoal,
        completedGoals,
        incompleteGoals,
        completionRate: rate,
      });
    }

    // High level stats
    const totalDays = points.length;
    const totalSet = points.filter((p) => p.hasGoal === 1).length;
    const totalCompleted = points.filter((p) => p.isCompleted === 1).length;
    const setFrequencyPct = totalDays > 0 ? Math.round((totalSet / totalDays) * 100) : 0;
    const completionRatePct = totalSet > 0 ? Math.round((totalCompleted / totalSet) * 100) : 0;

    // Calculate streaks
    let currentStreak = 0;
    for (let i = points.length - 1; i >= 0; i--) {
      if (points[i].isCompleted === 1) {
        currentStreak++;
      } else {
        // Allow today if today hasn't been completed yet
        if (i === points.length - 1 && points[i].hasGoal === 1 && !points[i].isCompleted) {
          continue;
        }
        break;
      }
    }

    let longestStreak = 0;
    let tempStreak = 0;
    points.forEach((p) => {
      if (p.isCompleted === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    });

    // 15-Day Completion Growth Rate Trend Analysis
    // points is ordered chronologically: index 0 (29 days ago) to index 29 (today)
    const prev15 = points.slice(0, 15);
    const recent15 = points.slice(15);

    const prev15Set = prev15.filter((p) => p.hasGoal === 1).length;
    const prev15Completed = prev15.filter((p) => p.isCompleted === 1).length;
    const prev15Rate = prev15Set > 0 ? Math.round((prev15Completed / prev15Set) * 100) : 0;
    const prev15RangeLabel = `${prev15[0]?.displayDate || ''} – ${prev15[prev15.length - 1]?.displayDate || ''}`;

    const recent15Set = recent15.filter((p) => p.hasGoal === 1).length;
    const recent15Completed = recent15.filter((p) => p.isCompleted === 1).length;
    const recent15Rate = recent15Set > 0 ? Math.round((recent15Completed / recent15Set) * 100) : 0;
    const recent15RangeLabel = `${recent15[0]?.displayDate || ''} – ${recent15[recent15.length - 1]?.displayDate || ''}`;

    const pointDelta = recent15Rate - prev15Rate;
    let growthRatePct = 0;
    let growthDirection: 'up' | 'down' | 'neutral' = 'neutral';

    if (prev15Rate === 0) {
      if (recent15Rate > 0) {
        growthRatePct = 100;
        growthDirection = 'up';
      } else {
        growthRatePct = 0;
        growthDirection = 'neutral';
      }
    } else {
      const diff = recent15Rate - prev15Rate;
      growthRatePct = Math.round((diff / prev15Rate) * 100);
      if (growthRatePct > 0) growthDirection = 'up';
      else if (growthRatePct < 0) growthDirection = 'down';
      else growthDirection = 'neutral';
    }

    return {
      timelineData: points,
      weeklyData: weekly,
      stats: {
        totalDays,
        totalSet,
        totalCompleted,
        setFrequencyPct,
        completionRatePct,
        currentStreak,
        longestStreak,
        milestoneCount: points.filter((p) => p.milestone !== null).length,
        highestMilestone: (() => {
          const ml = points.filter((p) => p.milestone !== null);
          return ml.length > 0 ? ml[ml.length - 1].milestone : null;
        })(),
        comparison15d: {
          prev15Set,
          prev15Completed,
          prev15Rate,
          prev15RangeLabel,
          recent15Set,
          recent15Completed,
          recent15Rate,
          recent15RangeLabel,
          pointDelta,
          growthRatePct,
          growthDirection,
        },
      },
    };
  }, [goalsMap, t]);

  const achievedMilestones = useMemo(() => {
    return timelineData.filter((p) => p.milestone !== null);
  }, [timelineData]);

  const selectedMilestonePoint = useMemo(() => {
    if (!selectedMilestoneDateKey) return null;
    return timelineData.find((p) => p.dateKey === selectedMilestoneDateKey) || null;
  }, [timelineData, selectedMilestoneDateKey]);

  const growthLabel =
    stats.comparison15d.growthRatePct > 0
      ? `+${stats.comparison15d.growthRatePct}%`
      : `${stats.comparison15d.growthRatePct}%`;

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: DayGoalDataPoint = payload[0].payload;
      const goal = dataPoint.goal;
      const milestone = dataPoint.milestone;

      return (
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[12px] p-3 max-w-xs space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-[var(--fg)]">{dataPoint.fullDate}</span>
            <span className={dataPoint.status === 'completed' ? 'text-[var(--accent)] font-medium' : 'text-[var(--fg-muted)]'}>
              {dataPoint.status === 'completed'
                ? t('Accomplished')
                : dataPoint.status === 'incomplete'
                ? t('Set & Incomplete')
                : t('No Goal Defined')}
            </span>
          </div>

          {milestone && (
            <div className="text-[var(--accent)] font-medium">
              {milestone.title}
            </div>
          )}

          {goal ? (
            <div className="space-y-1">
              <p className="font-medium text-[var(--fg)] leading-snug">{t(goal.title)}</p>
              {goal.notes && (
                <p className="text-[var(--fg-muted)]">{t(goal.notes)}</p>
              )}
              {goal.completedAt && (
                <p className="text-[var(--fg-muted)]">
                  {t('Completed at {time}', { time: new Date(goal.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[var(--fg-muted)]">
              {t('No primary focus was set on this day.')}
            </p>
          )}

          <div className="pt-2 border-t border-[var(--border)] space-y-1 text-[var(--fg-muted)]">
            <div className="flex justify-between gap-3">
              <span>{t('Consecutive Streak:')}</span>
              <span className="text-[var(--fg)] font-medium">{t('{n} days', { n: dataPoint.consecutiveStreak })}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>{t('7-Day Rolling Rate:')}</span>
              <span className="text-[var(--fg)] font-medium">{dataPoint.rollingRate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const segmentClass = (active: boolean) =>
    `h-11 px-3 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors cursor-pointer ${
      active ? 'bg-[var(--bg)] text-[var(--fg)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
    }`;

  return (
    <div
      id="daily-primary-goals-visualization-card"
      className={`bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-6 relative ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Daily goals')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
            {t('How often you set and finished your one goal in the last 30 days.')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[var(--bg-inset)] p-1 rounded-[var(--radius-sm)]">
            <button
              id="chart-toggle-daily-btn"
              type="button"
              onClick={() => setViewMode('daily')}
              className={segmentClass(viewMode === 'daily')}
            >
              {t('Daily')}
            </button>
            <button
              id="chart-toggle-weekly-btn"
              type="button"
              onClick={() => setViewMode('weekly')}
              className={segmentClass(viewMode === 'weekly')}
            >
              {t('Weekly')}
            </button>
          </div>

          <Button
            id="chart-card-export-png-btn"
            variant="secondary"
            size="sm"
            icon={Download}
            data-no-export="true"
            onClick={handleExportClick}
            title={t('Export this progress visualization as a PNG image for sharing')}
          >
            {t('Export PNG')}
          </Button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">{stats.setFrequencyPct}%</div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Setting Frequency')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('{set} of {total} days defined', { set: stats.totalSet, total: stats.totalDays })}
          </div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-semibold text-[var(--accent)] leading-none">{stats.completionRatePct}%</span>
            <span className="text-[12px] text-[var(--fg-muted)]">{growthLabel}</span>
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Completion Rate')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('{completed} achieved of {set} set', { completed: stats.totalCompleted, set: stats.totalSet })}
          </div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
            {t('{n} Days', { n: stats.currentStreak })}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Current Streak')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('Best run: {n} consecutive days', { n: stats.longestStreak })}
          </div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-semibold text-[var(--fg)] leading-none">{stats.milestoneCount}</span>
            {stats.highestMilestone && (
              <span className="text-[12px] text-[var(--fg-muted)]">
                {t('Top: {n}d', { n: stats.highestMilestone.streakDays })}
              </span>
            )}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Milestones Reached')}</div>
        </div>
      </div>

      {/* 15d vs 15d comparison */}
      <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-semibold text-[var(--fg)] leading-none">{growthLabel}</span>
            <span className="text-[12px] text-[var(--fg-muted)]">
              {stats.comparison15d.pointDelta > 0
                ? t('+{n}% pts', { n: stats.comparison15d.pointDelta })
                : stats.comparison15d.pointDelta < 0
                ? t('{n}% pts', { n: stats.comparison15d.pointDelta })
                : t('0% pts')}
            </span>
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">
            {stats.comparison15d.growthDirection === 'up'
              ? t('growth in accomplishment rate over the last 15 days')
              : stats.comparison15d.growthDirection === 'down'
              ? t('reduction in accomplishment rate over the last 15 days')
              : t('steady execution velocity over the last 15 days')}
          </div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('Comparing the last 15 days ({recent}) against the baseline of the previous 15 days ({prev}).', { recent: stats.comparison15d.recent15RangeLabel, prev: stats.comparison15d.prev15RangeLabel })}
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0">
          <div>
            <div className="text-[15px] font-semibold text-[var(--fg)]">{stats.comparison15d.prev15Rate}%</div>
            <div className="text-[12px] text-[var(--fg-muted)]">{t('Previous 15 Days')}</div>
            <div className="text-[12px] text-[var(--fg-subtle)]">
              {t('{completed} / {set} completed', { completed: stats.comparison15d.prev15Completed, set: stats.comparison15d.prev15Set })}
            </div>
          </div>
          <div>
            <div className="text-[15px] font-semibold text-[var(--accent)]">{stats.comparison15d.recent15Rate}%</div>
            <div className="text-[12px] text-[var(--fg-muted)]">{t('Last 15 Days')}</div>
            <div className="text-[12px] text-[var(--fg-subtle)]">
              {t('{completed} / {set} completed', { completed: stats.comparison15d.recent15Completed, set: stats.comparison15d.recent15Set })}
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="text-[15px] font-semibold text-[var(--fg)]">{t('Streak milestones')}</h4>
            <p className="text-[13px] text-[var(--fg-muted)]">{t('5, 10, 15 and 20 consecutive days, marked on the line.')}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowMilestones((prev) => !prev)}
            className={`h-11 px-3 rounded-[var(--radius-sm)] text-[13px] font-medium border cursor-pointer transition-colors shrink-0 ${
              showMilestones
                ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                : 'bg-transparent text-[var(--fg)] border-[var(--border-strong)]'
            }`}
          >
            {showMilestones ? t('Milestones Visible') : t('Milestones Hidden')}
          </button>
        </div>

        {achievedMilestones.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {achievedMilestones.map((point) => {
              const m = point.milestone!;
              const isSelected = selectedMilestoneDateKey === point.dateKey;
              return (
                <button
                  key={`milestone-badge-${point.dateKey}`}
                  type="button"
                  onClick={() =>
                    setSelectedMilestoneDateKey((prev) =>
                      prev === point.dateKey ? null : point.dateKey
                    )
                  }
                  className={`h-11 px-3 rounded-[var(--radius-sm)] text-[13px] font-medium border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--bg)] text-[var(--fg)] border-transparent hover:border-[var(--border-strong)]'
                  }`}
                  title={t('{title} achieved on {date}', { title: t(m.title), date: point.fullDate })}
                >
                  {t('{n}-Day Milestone', { n: m.streakDays })}
                  <span className={`ml-1.5 text-[12px] ${isSelected ? 'text-white/80' : 'text-[var(--fg-muted)]'}`}>
                    {point.displayDate}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-[var(--fg-muted)]">
            {t('No milestones yet. Finish your goal on consecutive days to earn one.')}
          </p>
        )}

        {selectedMilestonePoint && selectedMilestonePoint.milestone && (
          <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[13px] font-semibold text-[var(--fg)]">
                {selectedMilestonePoint.milestone.title} · {selectedMilestonePoint.fullDate}
              </div>
              <p className="text-[13px] text-[var(--fg-muted)]">
                {selectedMilestonePoint.milestone.description}
              </p>
              {selectedMilestonePoint.goal && (
                <p className="text-[13px] text-[var(--fg-muted)]">
                  {t('Goal completed on this milestone day: “{title}”', { title: t(selectedMilestonePoint.goal.title) })}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMilestoneDateKey(null)}
              className="self-start sm:self-auto"
            >
              {t('Clear Focus')}
            </Button>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="w-full">
        {viewMode === 'daily' ? (
          <div className="space-y-3">
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={timelineData}
                  margin={{ top: 32, right: 12, left: -20, bottom: 8 }}
                >
                  <CartesianGrid vertical={false} stroke={colors.grid} />
                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={{ stroke: colors.grid }}
                    tick={{ fill: colors.text, fontSize: 11 }}
                    interval={3}
                  />
                  <YAxis
                    yAxisId="status"
                    domain={[0, 1.2]}
                    ticks={[0, 1]}
                    tickFormatter={(val) => (val === 1 ? t('Focus') : t('None'))}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: colors.text, fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="rate"
                    orientation="right"
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: colors.text, fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: colors.grid, opacity: 0.5 }} />

                  <Bar
                    yAxisId="status"
                    dataKey="isCompleted"
                    name={t('Completed Goal')}
                    stackId="goal"
                    fill={colors.accent}
                    radius={[2, 2, 0, 0]}
                    maxBarSize={14}
                  >
                    {timelineData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.status === 'completed'
                            ? colors.accent
                            : entry.status === 'incomplete'
                            ? colors.tertiary
                            : colors.secondary
                        }
                      />
                    ))}
                  </Bar>

                  <Line
                    yAxisId="rate"
                    type="monotone"
                    dataKey="rollingRate"
                    name={t('7-Day Rolling Completion Rate (%)')}
                    stroke={colors.tertiary}
                    strokeWidth={2}
                    dot={(dotProps: any) => (
                      <MilestoneDot
                        {...dotProps}
                        showMilestones={showMilestones}
                        selectedDateKey={selectedMilestoneDateKey}
                        onSelectMilestone={(dateKey: string) =>
                          setSelectedMilestoneDateKey((prev) => (prev === dateKey ? null : dateKey))
                        }
                      />
                    )}
                    activeDot={{ r: 4, stroke: colors.tertiary, strokeWidth: 2, fill: colors.bg }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--fg-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[var(--accent)]" />
                <span>{t('Completed Goal')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 rounded-full bg-[var(--fg-muted)]" />
                <span>{t('7-Day Rolling Completion Rate (%)')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-[var(--accent)] bg-[var(--bg)]" />
                <span>{t('Milestone')}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 8 }}
                >
                  <CartesianGrid vertical={false} stroke={colors.grid} />
                  <XAxis
                    dataKey="weekLabel"
                    tickLine={false}
                    axisLine={{ stroke: colors.grid }}
                    tick={{ fill: colors.text, fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 7]}
                    ticks={[0, 2, 4, 6, 7]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: colors.text, fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      t('{n} days', { n: value }),
                      name === 'completedGoals' ? t('Goals Accomplished') : t('Goals Incomplete'),
                    ]}
                    cursor={{ fill: colors.grid, opacity: 0.5 }}
                    contentStyle={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      color: 'var(--fg)',
                    }}
                  />
                  <Bar
                    dataKey="completedGoals"
                    name={t('Accomplished Focus')}
                    fill={colors.accent}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="incompleteGoals"
                    name={t('Incomplete Focus')}
                    fill={colors.secondary}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--fg-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[var(--accent)]" />
                <span>{t('Accomplished Focus')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[var(--border-strong)]" />
                <span>{t('Incomplete Focus')}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {weeklyData.map((wk, i) => (
                <div key={i} className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
                  <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">{wk.completionRate}%</div>
                  <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Week {n}', { n: i + 1 })}</div>
                  <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
                    {t('{completed}/{total} goals', { completed: wk.completedGoals, total: wk.daysWithGoal })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--fg-subtle)]">
        <span>{t('One Decision Away')}</span>
        <span>{t('Record generated {date}', { date: new Date().toLocaleDateString(getSpeechLang(), { month: 'short', day: 'numeric', year: 'numeric' }) })}</span>
      </div>

      <ExportProgressModal
        isOpen={showInternalExportModal}
        onClose={() => setShowInternalExportModal(false)}
        targetElementId="daily-primary-goals-visualization-card"
      />
    </div>
  );
};
