import React, { useState, useMemo } from 'react';
import { useApp } from '../store/useApp';
import { Card, Badge, Button } from './ui';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  BarChart,
} from 'recharts';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Flame,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Clock,
  Layers,
  Award,
  Crown,
  Shield,
  Trophy,
  Zap,
  Download,
  Share2,
} from 'lucide-react';
import { DailyPrimaryGoal } from '../types/models';
import { ExportProgressModal } from './ExportProgressModal';
import { useT, t, getSpeechLang } from '../i18n';

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

export const getStreakMilestone = (streak: number): GoalMilestone | null => {
  if (streak === 5) {
    return {
      streakDays: 5,
      level: 'bronze',
      label: t('5-Day Streak'),
      title: t('5-Day Momentum Milestone'),
      description: t('5 consecutive days of locked-in daily primary goal focus.'),
      badgeBg: '#FEF3C7',
      badgeBorder: '#D97706',
      badgeColor: '#92400E',
      nodeStroke: '#D97706',
      nodeFill: '#F59E0B',
      haloColor: 'rgba(245, 158, 11, 0.35)',
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
      badgeBg: '#D1FAE5',
      badgeBorder: '#059669',
      badgeColor: '#065F46',
      nodeStroke: '#059669',
      nodeFill: '#10B981',
      haloColor: 'rgba(16, 185, 129, 0.35)',
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
      badgeBg: '#DBEAFE',
      badgeBorder: '#2563EB',
      badgeColor: '#1E40AF',
      nodeStroke: '#2563EB',
      nodeFill: '#3B82F6',
      haloColor: 'rgba(59, 130, 246, 0.35)',
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
      badgeBg: '#EDE9FE',
      badgeBorder: '#7C3AED',
      badgeColor: '#5B21B6',
      nodeStroke: '#7C3AED',
      nodeFill: '#8B5CF6',
      haloColor: 'rgba(139, 92, 246, 0.35)',
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
      badgeBg: '#FEF3C7',
      badgeBorder: '#B45309',
      badgeColor: '#78350F',
      nodeStroke: '#B45309',
      nodeFill: '#FBBF24',
      haloColor: 'rgba(251, 191, 36, 0.4)',
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
    // Normal day node: subtle small dot if goal completed
    if (payload.isCompleted) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={2}
          fill="var(--bg-elevated)"
          stroke="var(--primary)"
          strokeWidth={1.2}
          opacity={0.3}
        />
      );
    }
    return null;
  }

  const isSelected = selectedDateKey === payload.dateKey;
  const streak = milestone.streakDays;

  return (
    <g
      key={`milestone-node-${payload.dateKey}`}
      className="cursor-pointer transition-transform duration-150"
      onClick={() => onSelectMilestone?.(payload.dateKey)}
    >
      {/* Ambient Pulsing Halo for key milestone */}
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 18 : 13}
        fill={milestone.haloColor}
        className={isSelected ? 'animate-pulse' : ''}
      />

      {/* Main Node Circle with distinct milestone color */}
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 11 : 9}
        fill={milestone.nodeFill}
        stroke={milestone.nodeStroke}
        strokeWidth={isSelected ? 3 : 2}
      />

      {/* Center Icon / Glyph inside the circular node */}
      {streak === 5 && (
        /* Flame / Fire Icon */
        <path
          d={`M ${cx} ${cy - 4} C ${cx + 1.5} ${cy - 2} ${cx + 2.2} ${cy + 0.2} ${cx + 1.2} ${cy + 2.2} C ${cx + 0.6} ${cy + 3.2} ${cx - 0.6} ${cy + 3.2} ${cx - 1.2} ${cy + 2.2} C ${cx - 2.2} ${cy + 0.2} ${cx - 1.5} ${cy - 2} ${cx} ${cy - 4} Z`}
          fill="#ffffff"
        />
      )}
      {streak === 10 && (
        /* Shield Icon */
        <path
          d={`M ${cx} ${cy - 4} L ${cx + 3.2} ${cy - 2.2} L ${cx + 3.2} ${cy + 0.5} C ${cx + 3.2} ${cy + 2.8} ${cx} ${cy + 4.2} ${cx} ${cy + 4.2} C ${cx} ${cy + 4.2} ${cx - 3.2} ${cy + 2.8} ${cx - 3.2} ${cy + 0.5} L ${cx - 3.2} ${cy - 2.2} Z`}
          fill="#ffffff"
        />
      )}
      {streak === 15 && (
        /* Star / Trophy Icon */
        <path
          d={`M ${cx} ${cy - 3.6} L ${cx + 1} ${cy - 1} L ${cx + 3.6} ${cy - 1} L ${cx + 1.5} ${cy + 0.6} L ${cx + 2.2} ${cy + 3} L ${cx} ${cy + 1.6} L ${cx - 2.2} ${cy + 3} L ${cx - 1.5} ${cy + 0.6} L ${cx - 3.6} ${cy - 1} L ${cx - 1} ${cy - 1} Z`}
          fill="#ffffff"
        />
      )}
      {streak >= 20 && (
        /* Crown Icon */
        <path
          d={`M ${cx - 3.2} ${cy + 2.8} L ${cx + 3.2} ${cy + 2.8} L ${cx + 3.2} ${cy - 1.2} L ${cx + 1.6} ${cy + 0.6} L ${cx} ${cy - 3.2} L ${cx - 1.6} ${cy + 0.6} L ${cx - 3.2} ${cy - 1.2} Z`}
          fill="#ffffff"
        />
      )}

      {/* Distinct Floating Milestone Pin Tag above the node */}
      <g filter="url(#milestone-tag-shadow)">
        <rect
          x={cx - 14}
          y={cy - 28}
          width={28}
          height={16}
          rx={4}
          fill={milestone.nodeStroke}
        />
        {/* Pointed triangle facing downward into the node */}
        <polygon
          points={`${cx - 3.5},${cy - 12} ${cx + 3.5},${cy - 12} ${cx},${cy - 8}`}
          fill={milestone.nodeStroke}
        />
        <text
          x={cx}
          y={cy - 16.5}
          textAnchor="middle"
          fill="#ffffff"
          fontSize="9"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.02em"
        >
          {streak}D
        </text>
      </g>
    </g>
  );
};

export const DailyPrimaryGoalsChart: React.FC<{
  className?: string;
  onExportPng?: () => void;
}> = ({ className = '', onExportPng }) => {
  const { data } = useApp();
  const t = useT();
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

  // Custom chart tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: DayGoalDataPoint = payload[0].payload;
      const goal = dataPoint.goal;
      const milestone = dataPoint.milestone;

      return (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-3 rounded-[var(--radius-md)] shadow-lg max-w-xs text-xs space-y-2 z-50">
          <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-1">
            <span className="font-bold text-[var(--fg)]">{dataPoint.fullDate}</span>
            <Badge
              variant={
                dataPoint.status === 'completed'
                  ? 'sage'
                  : dataPoint.status === 'incomplete'
                  ? 'coral'
                  : 'neutral'
              }
              className="text-[9px] py-0"
            >
              {dataPoint.status === 'completed'
                ? t('Accomplished')
                : dataPoint.status === 'incomplete'
                ? t('Set & Incomplete')
                : t('No Goal Defined')}
            </Badge>
          </div>

          {/* Key Milestone Callout Banner */}
          {milestone && (
            <div
              className="p-2 rounded-[var(--radius-sm)] border text-white space-y-0.5"
              style={{
                backgroundColor: milestone.nodeStroke,
                borderColor: milestone.badgeBorder,
              }}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {milestone.iconName === 'flame' && <Flame className="w-3.5 h-3.5" />}
                {milestone.iconName === 'shield' && <Shield className="w-3.5 h-3.5" />}
                {milestone.iconName === 'trophy' && <Trophy className="w-3.5 h-3.5" />}
                {milestone.iconName === 'crown' && <Crown className="w-3.5 h-3.5" />}
                <span>{milestone.title}</span>
              </div>
              <p className="text-[10px] text-white/95 leading-tight">
                {milestone.description} {t('({n} consecutive days unlocked!)', { n: milestone.streakDays })}
              </p>
            </div>
          )}

          {goal ? (
            <div className="space-y-1">
              <p className="font-semibold text-sm text-[var(--fg)] font-display leading-tight">
                {t(goal.title)}
              </p>
              {goal.notes && (
                <p className="text-[11px] text-[var(--fg-muted)] italic">
                  &ldquo;{t(goal.notes)}&rdquo;
                </p>
              )}
              {goal.completedAt && (
                <p className="text-[10px] text-[var(--color-sage)] font-medium">
                  {t('Completed at {time}', { time: new Date(goal.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-[var(--fg-subtle)]">
              {t('No primary focus was set on this day.')}
            </p>
          )}

          <div className="pt-1.5 border-t border-[var(--border)] space-y-1 text-[10px]">
            <div className="flex justify-between text-[var(--fg-subtle)]">
              <span>{t('Consecutive Streak:')}</span>
              <span className="font-bold text-[var(--fg)]">{t('{n} days', { n: dataPoint.consecutiveStreak })}</span>
            </div>
            <div className="flex justify-between text-[var(--fg-subtle)]">
              <span>{t('7-Day Rolling Rate:')}</span>
              <span className="font-bold text-[var(--fg)]">{dataPoint.rollingRate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      id="daily-primary-goals-visualization-card"
      padding="md"
      className={`space-y-5 border border-[var(--border)] bg-[var(--bg-elevated)] relative ${className}`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-[var(--primary)]/15 text-[var(--primary)]">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold font-display text-[var(--fg)]">
              {t('Primary Daily Goals (Last 30 Days)')}
            </h3>
            <Badge variant="primary" className="text-[10px] uppercase">
              {t('Recharts Analytics')}
            </Badge>
          </div>
          <p className="text-xs text-[var(--fg-muted)] mt-1">
            {t('Tracking commitment frequency and accomplishment status of your single daily focus over the past 30 days.')}
          </p>
        </div>

        {/* View Toggle & Export Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-1 bg-[var(--bg-muted)] p-1 rounded-[var(--radius-sm)] border border-[var(--border)]">
            <button
              id="chart-toggle-daily-btn"
              type="button"
              onClick={() => setViewMode('daily')}
              className={`text-xs px-3 py-1 rounded-[var(--radius-sm)] font-medium transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {t('30-Day Daily Timeline')}
            </button>
            <button
              id="chart-toggle-weekly-btn"
              type="button"
              onClick={() => setViewMode('weekly')}
              className={`text-xs px-3 py-1 rounded-[var(--radius-sm)] font-medium transition-all cursor-pointer ${
                viewMode === 'weekly'
                  ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
              }`}
            >
              {t('Weekly Rollup')}
            </button>
          </div>

          <Button
            id="chart-card-export-png-btn"
            variant="secondary"
            size="sm"
            icon={Download}
            data-no-export="true"
            onClick={handleExportClick}
            className="text-xs border-[var(--border)] hover:border-[var(--fg-muted)]"
            title={t('Export this progress visualization as a PNG image for sharing')}
          >
            {t('Export PNG')}
          </Button>
        </div>
      </div>

      {/* 4-Stat Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)]">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-1">
            <span>{t('Setting Frequency')}</span>
            <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
          </div>
          <div className="text-xl font-bold font-display text-[var(--fg)]">
            {stats.setFrequencyPct}%
          </div>
          <p className="text-[10px] text-[var(--fg-subtle)] mt-0.5">
            {t('{set} of {total} days defined', { set: stats.totalSet, total: stats.totalDays })}
          </p>
        </div>

        <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)]">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-1">
            <span>{t('Completion Rate')}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-sage)]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-display text-[var(--color-sage)]">
              {stats.completionRatePct}%
            </span>
            <span
              className={`text-[11px] font-semibold flex items-center gap-0.5 ${
                stats.comparison15d.growthDirection === 'up'
                  ? 'text-[var(--color-sage)]'
                  : stats.comparison15d.growthDirection === 'down'
                  ? 'text-[var(--color-coral)]'
                  : 'text-[var(--fg-muted)]'
              }`}
            >
              {stats.comparison15d.growthDirection === 'up' && <TrendingUp className="w-3 h-3" />}
              {stats.comparison15d.growthDirection === 'down' && <TrendingDown className="w-3 h-3" />}
              {stats.comparison15d.growthDirection === 'neutral' && <Minus className="w-3 h-3" />}
              {stats.comparison15d.growthRatePct > 0
                ? `+${stats.comparison15d.growthRatePct}%`
                : `${stats.comparison15d.growthRatePct}%`}
            </span>
          </div>
          <p className="text-[10px] text-[var(--fg-subtle)] mt-0.5">
            {t('{completed} achieved of {set} set', { completed: stats.totalCompleted, set: stats.totalSet })}
          </p>
        </div>

        <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)]">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-1">
            <span>{t('Current Streak')}</span>
            <Flame className="w-3.5 h-3.5 text-[var(--color-coral)]" />
          </div>
          <div className="text-xl font-bold font-display text-[var(--fg)]">
            {t('{n} Days', { n: stats.currentStreak })}
          </div>
          <p className="text-[10px] text-[var(--fg-subtle)] mt-0.5">
            {t('Active daily focus momentum')}
          </p>
        </div>

        <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)]">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-1">
            <span>{t('Milestones Reached')}</span>
            <Award className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-display text-[var(--fg)]">
              {stats.milestoneCount}
            </span>
            {stats.highestMilestone && (
              <Badge variant="warning" className="text-[9px] py-0 px-1 font-bold">
                {t('Top: {n}d', { n: stats.highestMilestone.streakDays })}
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-[var(--fg-subtle)] mt-0.5">
            {t('Best run: {n} consecutive days', { n: stats.longestStreak })}
          </p>
        </div>
      </div>

      {/* Completion Growth Rate Percentage Trend Banner (Last 15 Days vs Previous 15 Days) */}
      <div className="p-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)]/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 rounded-[var(--radius-sm)] ${
                stats.comparison15d.growthDirection === 'up'
                  ? 'bg-[#2A6F4E]/15 text-[#2A6F4E]'
                  : stats.comparison15d.growthDirection === 'down'
                  ? 'bg-[#C2593F]/15 text-[#C2593F]'
                  : 'bg-[var(--bg-elevated)] text-[var(--fg-muted)]'
              }`}
            >
              {stats.comparison15d.growthDirection === 'up' && <TrendingUp className="w-4 h-4" />}
              {stats.comparison15d.growthDirection === 'down' && <TrendingDown className="w-4 h-4" />}
              {stats.comparison15d.growthDirection === 'neutral' && <Minus className="w-4 h-4" />}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t('Completion Growth Rate (15d vs 15d Trend)')}
            </span>
            <Badge
              variant={
                stats.comparison15d.growthDirection === 'up'
                  ? 'sage'
                  : stats.comparison15d.growthDirection === 'down'
                  ? 'coral'
                  : 'neutral'
              }
              className="text-[10px] font-bold"
            >
              {stats.comparison15d.pointDelta > 0
                ? t('+{n}% pts', { n: stats.comparison15d.pointDelta })
                : stats.comparison15d.pointDelta < 0
                ? t('{n}% pts', { n: stats.comparison15d.pointDelta })
                : t('0% pts')}
            </Badge>
          </div>

          <div className="flex items-baseline gap-2.5 pt-0.5">
            <span
              className={`text-2xl sm:text-3xl font-bold font-display tracking-tight ${
                stats.comparison15d.growthDirection === 'up'
                  ? 'text-[#2A6F4E]'
                  : stats.comparison15d.growthDirection === 'down'
                  ? 'text-[#C2593F]'
                  : 'text-[var(--fg)]'
              }`}
            >
              {stats.comparison15d.growthRatePct > 0
                ? `+${stats.comparison15d.growthRatePct}%`
                : `${stats.comparison15d.growthRatePct}%`}
            </span>
            <span className="text-xs text-[var(--fg-muted)] font-medium">
              {stats.comparison15d.growthDirection === 'up'
                ? t('growth in accomplishment rate over the last 15 days')
                : stats.comparison15d.growthDirection === 'down'
                ? t('reduction in accomplishment rate over the last 15 days')
                : t('steady execution velocity over the last 15 days')}
            </span>
          </div>

          <p className="text-[11px] text-[var(--fg-subtle)] leading-relaxed">
            {t('Comparing the last 15 days ({recent}) against the baseline of the previous 15 days ({prev}).', { recent: stats.comparison15d.recent15RangeLabel, prev: stats.comparison15d.prev15RangeLabel })}
          </p>
        </div>

        {/* 15d vs 15d Comparison Breakdown Tiles */}
        <div className="flex items-center gap-2 sm:gap-3 bg-[var(--bg-elevated)] p-2.5 sm:p-3 rounded-[var(--radius-sm)] border border-[var(--border)] shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="text-left space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[var(--fg-subtle)] tracking-wider block">
              {t('Previous 15 Days')}
            </span>
            <div className="text-base font-bold font-display text-[var(--fg)]">
              {stats.comparison15d.prev15Rate}%
            </div>
            <span className="text-[10px] text-[var(--fg-muted)] block">
              {t('{completed} / {set} completed', { completed: stats.comparison15d.prev15Completed, set: stats.comparison15d.prev15Set })}
            </span>
          </div>

          <div className="px-1 text-[var(--fg-subtle)] flex flex-col items-center">
            <ArrowRight className="w-4 h-4" />
            <span className="text-[9px] font-mono text-[var(--fg-subtle)] mt-0.5">{t('vs')}</span>
          </div>

          <div className="text-left space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[var(--fg-subtle)] tracking-wider block">
              {t('Last 15 Days')}
            </span>
            <div
              className={`text-base font-bold font-display ${
                stats.comparison15d.growthDirection === 'up'
                  ? 'text-[#2A6F4E]'
                  : stats.comparison15d.growthDirection === 'down'
                  ? 'text-[#C2593F]'
                  : 'text-[var(--fg)]'
              }`}
            >
              {stats.comparison15d.recent15Rate}%
            </div>
            <span className="text-[10px] text-[var(--fg-muted)] block">
              {t('{completed} / {set} completed', { completed: stats.comparison15d.recent15Completed, set: stats.comparison15d.recent15Set })}
            </span>
          </div>
        </div>
      </div>

      {/* Key Milestone Markers Header & Filter Strip */}
      <div className="p-3.5 bg-[var(--bg-muted)]/50 rounded-[var(--radius-md)] border border-[var(--border)] space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-sm bg-amber-500/15 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                {t('Goal Completion Streak Milestones')}
              </span>
              <span className="text-[11px] text-[var(--fg-muted)] block">
                {t('Key consistency thresholds (5, 10, 20 consecutive days) highlighted directly on the line graph')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowMilestones((prev) => !prev)}
              className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-[11px] font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                showMilestones
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                  : 'bg-[var(--bg-elevated)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{showMilestones ? t('Milestones Visible') : t('Milestones Hidden')}</span>
            </button>
          </div>
        </div>

        {/* Achieved Milestones Badges */}
        {achievedMilestones.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--border)]/60">
            <span className="text-[11px] font-semibold text-[var(--fg-subtle)] mr-1">
              {t('Milestones Reached:')}
            </span>
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
                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-offset-1 scale-105'
                      : 'hover:opacity-90 hover:scale-102'
                  }`}
                  style={{
                    backgroundColor: m.badgeBg,
                    borderColor: m.badgeBorder,
                    color: m.badgeColor,
                  }}
                  title={t('{title} achieved on {date}', { title: m.title, date: point.fullDate })}
                >
                  {m.iconName === 'flame' && <Flame className="w-3.5 h-3.5" />}
                  {m.iconName === 'shield' && <Shield className="w-3.5 h-3.5" />}
                  {m.iconName === 'trophy' && <Trophy className="w-3.5 h-3.5" />}
                  {m.iconName === 'crown' && <Crown className="w-3.5 h-3.5" />}
                  <span>{t('{n}-Day Milestone', { n: m.streakDays })}</span>
                  <span className="text-[10px] font-normal opacity-80">({point.displayDate})</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-[var(--fg-subtle)] italic pt-1 border-t border-[var(--border)]/60">
            {t('No 5, 10, or 20-day milestones reached yet in this 30-day window. Complete daily primary goals consecutively to unlock milestone markers!')}
          </p>
        )}

        {/* Active Milestone Highlight Card */}
        {selectedMilestonePoint && selectedMilestonePoint.milestone && (
          <div
            className="p-3 rounded-[var(--radius-sm)] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200"
            style={{
              backgroundColor: selectedMilestonePoint.milestone.badgeBg,
              borderColor: selectedMilestonePoint.milestone.badgeBorder,
            }}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs" style={{ color: selectedMilestonePoint.milestone.badgeColor }}>
                  🏆 {selectedMilestonePoint.milestone.title} ({selectedMilestonePoint.fullDate})
                </span>
                <Badge
                  variant="neutral"
                  className="text-[9px] font-bold"
                  style={{ color: selectedMilestonePoint.milestone.badgeColor }}
                >
                  {t('{n} Consecutive Days', { n: selectedMilestonePoint.milestone.streakDays })}
                </Badge>
              </div>
              <p className="text-xs font-medium text-[var(--fg-muted)]">
                {selectedMilestonePoint.milestone.description}
              </p>
              {selectedMilestonePoint.goal && (
                <p className="text-[11px] text-[var(--fg)] italic pt-0.5">
                  {t('Goal completed on this milestone day: “{title}”', { title: selectedMilestonePoint.goal.title })}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMilestoneDateKey(null)}
              className="text-[11px] self-start sm:self-auto h-7 px-2"
            >
              {t('Clear Focus')}
            </Button>
          </div>
        )}
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="w-full pt-2">
        {viewMode === 'daily' ? (
          /* 30-Day Daily Timeline Chart */
          <div className="space-y-2">
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={timelineData}
                  margin={{ top: 32, right: 12, left: -20, bottom: 20 }}
                >
                  <defs>
                    <filter id="milestone-tag-shadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'var(--fg-subtle)', fontSize: 10 }}
                    interval={3}
                  />
                  <YAxis
                    yAxisId="status"
                    domain={[0, 1.2]}
                    ticks={[0, 1]}
                    tickFormatter={(val) => (val === 1 ? t('Focus') : t('None'))}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--fg-subtle)', fontSize: 10 }}
                  />
                  <YAxis
                    yAxisId="rate"
                    orientation="right"
                    domain={[0, 100]}
                    ticks={[0, 50, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--fg-subtle)', fontSize: 10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                  />

                  {/* Primary Daily Goal Status Bar */}
                  <Bar
                    yAxisId="status"
                    dataKey="isCompleted"
                    name={t('Completed Goal')}
                    stackId="goal"
                    fill="var(--color-sage)"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={14}
                  >
                    {timelineData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.status === 'completed'
                            ? '#2A6F4E' // Deep Sage Green
                            : entry.status === 'incomplete'
                            ? '#C2593F' // Coral / Amber
                            : '#D4CDC3' // Muted / No Goal
                        }
                      />
                    ))}
                  </Bar>

                  {/* 7-Day Rolling Completion Moving Average with Custom Milestone Nodes */}
                  <Line
                    yAxisId="rate"
                    type="monotone"
                    dataKey="rollingRate"
                    name={t('7-Day Rolling Completion Rate (%)')}
                    stroke="var(--primary)"
                    strokeWidth={2.5}
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
                    activeDot={{ r: 5, stroke: 'var(--primary)', strokeWidth: 2, fill: 'var(--bg-elevated)' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Visual Legend Guide */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-[11px] text-[var(--fg-muted)]">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#2A6F4E]" />
                  <span>{t('Accomplished (100% completed)')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#C2593F]" />
                  <span>{t('Set, but Incomplete')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#D4CDC3]" />
                  <span>{t('No Goal Set')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="flex items-center -space-x-1">
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-[#D97706] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#10B981] border border-[#059669] inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#8B5CF6] border border-[#7C3AED] inline-block" />
                  </span>
                  <span className="font-semibold text-[var(--fg)]">{t('Key Milestones (5, 10, 20 Days)')}</span>
                </span>
              </div>
              <span className="italic text-[10px] text-[var(--fg-subtle)]">
                {t('*Click milestone nodes or badges to highlight achievement details; hover bars for goals')}
              </span>
            </div>
          </div>
        ) : (
          /* Weekly Rollup Chart */
          <div className="space-y-2">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--border)"
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="weekLabel"
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    tick={{ fill: 'var(--fg-subtle)', fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 7]}
                    ticks={[0, 2, 4, 6, 7]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'var(--fg-subtle)', fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      t('{n} days', { n: value }),
                      name === 'completedGoals' ? t('Goals Accomplished') : t('Goals Incomplete'),
                    ]}
                    contentStyle={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                  />
                  <Bar
                    dataKey="completedGoals"
                    name={t('Accomplished Focus')}
                    fill="var(--color-sage)"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="incompleteGoals"
                    name={t('Incomplete Focus')}
                    fill="var(--color-coral)"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border)] text-xs">
              {weeklyData.map((wk, i) => (
                <div key={i} className="p-2 rounded bg-[var(--bg-muted)] border border-[var(--border)]">
                  <span className="font-semibold block text-[11px] text-[var(--fg)]">{t('Week {n}', { n: i + 1 })}</span>
                  <div className="flex justify-between items-center text-[10px] text-[var(--fg-muted)] mt-1">
                    <span>{t('Rate:')} <strong className="text-[var(--color-sage)]">{wk.completionRate}%</strong></span>
                    <span>{t('{completed}/{total} goals', { completed: wk.completedGoals, total: wk.daysWithGoal })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export / Brand Watermark Footer */}
      <div className="pt-2 border-t border-[var(--border)]/50 flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--fg-subtle)] font-sans">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[var(--fg-muted)]">{t('One Decision Away')}</span>
          <span>•</span>
          <span>{t('30-Day Goal Trajectory & Streak Milestones')}</span>
        </div>
        <span>{t('Record generated {date}', { date: new Date().toLocaleDateString(getSpeechLang(), { month: 'short', day: 'numeric', year: 'numeric' }) })}</span>
      </div>

      {/* Internal Export Progress Modal if triggered from chart */}
      <ExportProgressModal
        isOpen={showInternalExportModal}
        onClose={() => setShowInternalExportModal(false)}
        targetElementId="daily-primary-goals-visualization-card"
      />
    </Card>
  );
};
