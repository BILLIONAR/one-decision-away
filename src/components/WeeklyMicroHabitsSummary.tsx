import React, { useMemo, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Badge, Progress as ProgressBar, Button } from './ui';
import {
  TrendingUp,
  Target,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  Zap,
  Filter,
  Check,
  Folder,
  Tag,
} from 'lucide-react';
import { MicroHabit, MicroHabitCategory } from '../types/models';
import { PREDEFINED_CATEGORIES, CategoryConfig, HabitBestStreakIndicator } from './DailyMicroHabits';
import { calculateBestMicroHabitStreak } from '../services/microHabitsService';
import { resolveCategoryConfig } from '../utils/categoryHelpers';
import { useT, N_ } from '../i18n';

interface DayHabitStats {
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // e.g., "Mon"
  fullDateLabel: string; // e.g., "Mon, Sep 7"
  isToday: boolean;
  completedHabits: MicroHabit[];
  completedCount: number;
  categoriesActive: MicroHabitCategory[];
}

interface CategoryConsistencyStat {
  config: CategoryConfig;
  habits: MicroHabit[];
  totalExpectedInWeek: number; // habits.length * 7
  totalCompletedInWeek: number;
  consistencyPct: number; // (completedInWeek / totalExpectedInWeek) * 100
  daysActiveCount: number; // 0 to 7
  daysPresencePct: number; // (daysActiveCount / 7) * 100
  bestStreak: number;
  dayCompletions: boolean[]; // 7 booleans for the 7 rolling days
  status: 'anchor' | 'strong' | 'building' | 'developing';
}

export const WeeklyMicroHabitsSummary: React.FC = () => {
  const { data, startFocusSession } = useApp();
  const t = useT();
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [showHabitDetails, setShowHabitDetails] = useState<boolean>(false);

  // Compute 7-day rolling window stats
  const {
    sevenDays,
    categoryStats,
    mostConsistentCategory,
    runnerUpCategory,
    totalWeeklyCompletions,
    overallConsistencyPct,
    activeDaysCount,
    avgDailyCompletions,
    totalHabitsCount,
  } = useMemo(() => {
    if (!data || !data.microHabits || data.microHabits.length === 0) {
      return {
        sevenDays: [],
        categoryStats: [],
        mostConsistentCategory: null,
        runnerUpCategory: null,
        totalWeeklyCompletions: 0,
        overallConsistencyPct: 0,
        activeDaysCount: 0,
        avgDailyCompletions: 0,
        totalHabitsCount: 0,
      };
    }

    const habits = data.microHabits;
    const now = new Date();
    const days: DayHabitStats[] = [];

    // Construct chronological 7-day array (6 days ago -> today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const isToday = i === 0;
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDateLabel = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      const dayCompleted = habits.filter(
        (h) => Array.isArray(h.completedDates) && h.completedDates.includes(dateKey)
      );

      const activeCats: MicroHabitCategory[] = Array.from(
        new Set(dayCompleted.map((h) => h.category))
      );

      days.push({
        dateKey,
        dayLabel,
        fullDateLabel,
        isToday,
        completedHabits: dayCompleted,
        completedCount: dayCompleted.length,
        categoriesActive: activeCats,
      });
    }

    const sevenDayKeys = days.map((d) => d.dateKey);

    // Group & analyze habits by category (both predefined and custom)
    const catStatsList: CategoryConsistencyStat[] = [];
    const customCategories = data.customHabitCategories || [];

    // 1. Predefined standard categories
    PREDEFINED_CATEGORIES.forEach((config) => {
      const catHabits = habits.filter((h) => h.category === config.id && !h.customCategoryId);
      if (catHabits.length === 0) return;

      const totalExpected = catHabits.length * 7;
      let totalCompleted = 0;
      const dayCompletions: boolean[] = [];

      days.forEach((day) => {
        const completedOnThisDay = catHabits.filter(
          (h) => Array.isArray(h.completedDates) && h.completedDates.includes(day.dateKey)
        );
        totalCompleted += completedOnThisDay.length;
        dayCompletions.push(completedOnThisDay.length > 0);
      });

      const daysActive = dayCompletions.filter(Boolean).length;
      const consistencyPct =
        totalExpected > 0 ? Math.min(100, Math.round((totalCompleted / totalExpected) * 100)) : 0;
      const daysPresencePct = Math.round((daysActive / 7) * 100);
      const bestStreak = Math.max(
        0,
        ...catHabits.map((h) =>
          calculateBestMicroHabitStreak(h.completedDates || [], h.streakCount || 0, h.bestStreak || 0)
        )
      );

      let status: 'anchor' | 'strong' | 'building' | 'developing' = 'developing';
      if (consistencyPct >= 75 || daysActive >= 6) {
        status = 'anchor';
      } else if (consistencyPct >= 50 || daysActive >= 4) {
        status = 'strong';
      } else if (consistencyPct >= 25 || daysActive >= 2) {
        status = 'building';
      }

      catStatsList.push({
        config,
        habits: catHabits,
        totalExpectedInWeek: totalExpected,
        totalCompletedInWeek: totalCompleted,
        consistencyPct,
        daysActiveCount: daysActive,
        daysPresencePct,
        bestStreak,
        dayCompletions,
        status,
      });
    });

    // 2. Custom Categories defined by the user
    customCategories.forEach((cc) => {
      const resolved = resolveCategoryConfig(cc.id, customCategories);
      const catConfig: CategoryConfig = {
        id: resolved.id as MicroHabitCategory,
        label: resolved.label,
        icon: resolved.icon,
        color: resolved.color,
        glowColor: resolved.glowColor,
        secondaryColor: resolved.secondaryColor,
        isCustom: true,
        customCategory: resolved.customCategory,
        badgeVariant: resolved.badgeVariant,
        description: resolved.description,
        colorClass: resolved.colorClass,
        bgClass: resolved.bgClass,
        borderClass: resolved.borderClass,
        soundCueName: resolved.soundCueName,
        soundCueDetail: resolved.soundCueDetail,
        hapticDetail: resolved.hapticDetail,
      };

      const catHabits = habits.filter(
        (h) =>
          h.customCategoryId === cc.id ||
          (h.category && h.category.toLowerCase() === cc.name.toLowerCase())
      );
      if (catHabits.length === 0) return;

      const totalExpected = catHabits.length * 7;
      let totalCompleted = 0;
      const dayCompletions: boolean[] = [];

      days.forEach((day) => {
        const completedOnThisDay = catHabits.filter(
          (h) => Array.isArray(h.completedDates) && h.completedDates.includes(day.dateKey)
        );
        totalCompleted += completedOnThisDay.length;
        dayCompletions.push(completedOnThisDay.length > 0);
      });

      const daysActive = dayCompletions.filter(Boolean).length;
      const consistencyPct =
        totalExpected > 0 ? Math.min(100, Math.round((totalCompleted / totalExpected) * 100)) : 0;
      const daysPresencePct = Math.round((daysActive / 7) * 100);
      const bestStreak = Math.max(
        0,
        ...catHabits.map((h) =>
          calculateBestMicroHabitStreak(h.completedDates || [], h.streakCount || 0, h.bestStreak || 0)
        )
      );

      let status: 'anchor' | 'strong' | 'building' | 'developing' = 'developing';
      if (consistencyPct >= 75 || daysActive >= 6) {
        status = 'anchor';
      } else if (consistencyPct >= 50 || daysActive >= 4) {
        status = 'strong';
      } else if (consistencyPct >= 25 || daysActive >= 2) {
        status = 'building';
      }

      catStatsList.push({
        config: catConfig,
        habits: catHabits,
        totalExpectedInWeek: totalExpected,
        totalCompletedInWeek: totalCompleted,
        consistencyPct,
        daysActiveCount: daysActive,
        daysPresencePct,
        bestStreak,
        dayCompletions,
        status,
      });
    });

    // 3. Any leftover habits not in predefined or custom categories
    const knownIds = new Set([
      ...PREDEFINED_CATEGORIES.map((c) => c.id.toLowerCase()),
      ...customCategories.map((c) => c.id.toLowerCase()),
      ...customCategories.map((c) => c.name.toLowerCase()),
    ]);
    const otherHabits = habits.filter((h) => {
      if (h.customCategoryId) {
        return !customCategories.some((c) => c.id === h.customCategoryId);
      }
      return !knownIds.has((h.category || '').toLowerCase());
    });

    if (otherHabits.length > 0) {
      const otherConfig: CategoryConfig = {
        id: 'Mindset' as MicroHabitCategory,
        label: N_('Other Routines'),
        icon: Folder,
        badgeVariant: 'slate',
        description: N_('Other user micro-habits'),
        colorClass: 'text-[var(--fg-muted)]',
        bgClass: 'bg-[var(--bg-muted)]',
        borderClass: 'border-[var(--border)]',
        soundCueName: N_('Standard Chime'),
        soundCueDetail: N_('Clean completion tone'),
        hapticDetail: N_('Confirmation tap [30ms]'),
      };

      const totalExpected = otherHabits.length * 7;
      let totalCompleted = 0;
      const dayCompletions: boolean[] = [];

      days.forEach((day) => {
        const completedOnThisDay = otherHabits.filter(
          (h) => Array.isArray(h.completedDates) && h.completedDates.includes(day.dateKey)
        );
        totalCompleted += completedOnThisDay.length;
        dayCompletions.push(completedOnThisDay.length > 0);
      });

      const daysActive = dayCompletions.filter(Boolean).length;
      const consistencyPct =
        totalExpected > 0 ? Math.min(100, Math.round((totalCompleted / totalExpected) * 100)) : 0;

      catStatsList.push({
        config: otherConfig,
        habits: otherHabits,
        totalExpectedInWeek: totalExpected,
        totalCompletedInWeek: totalCompleted,
        consistencyPct,
        daysActiveCount: daysActive,
        daysPresencePct: Math.round((daysActive / 7) * 100),
        bestStreak: Math.max(0, ...otherHabits.map((h) => h.streakCount || 0)),
        dayCompletions,
        status: consistencyPct >= 70 ? 'anchor' : consistencyPct >= 40 ? 'strong' : 'building',
      });
    }

    // Sort categories: highest consistency first, then by total completed
    catStatsList.sort((a, b) => {
      if (b.consistencyPct !== a.consistencyPct) {
        return b.consistencyPct - a.consistencyPct;
      }
      return b.totalCompletedInWeek - a.totalCompletedInWeek;
    });

    const totalWeeklyCompletions = catStatsList.reduce(
      (acc, c) => acc + c.totalCompletedInWeek,
      0
    );
    const totalWeeklyExpected = catStatsList.reduce(
      (acc, c) => acc + c.totalExpectedInWeek,
      0
    );
    const overallConsistencyPct =
      totalWeeklyExpected > 0
        ? Math.min(100, Math.round((totalWeeklyCompletions / totalWeeklyExpected) * 100))
        : 0;

    const activeDaysCount = days.filter((d) => d.completedCount > 0).length;
    const avgDailyCompletions = Number((totalWeeklyCompletions / 7).toFixed(1));

    const mostConsistent = catStatsList.length > 0 && catStatsList[0].totalCompletedInWeek > 0 ? catStatsList[0] : null;
    const runnerUp = catStatsList.length > 1 && catStatsList[1].totalCompletedInWeek > 0 ? catStatsList[1] : null;

    return {
      sevenDays: days,
      categoryStats: catStatsList,
      mostConsistentCategory: mostConsistent,
      runnerUpCategory: runnerUp,
      totalWeeklyCompletions,
      overallConsistencyPct,
      activeDaysCount,
      avgDailyCompletions,
      totalHabitsCount: habits.length,
    };
  }, [data]);

  if (!data || !data.microHabits || data.microHabits.length === 0) {
    return (
      <Card padding="md" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-sage)]" />
          <h3 className="text-base font-bold font-display text-[var(--fg)]">
            {t('Weekly Micro-Habit Trends')}
          </h3>
        </div>
        <p className="text-xs text-[var(--fg-muted)]">
          {t('No micro-habits found. Create your first 5-minute habit on the Home page to start tracking weekly category trends.')}
        </p>
      </Card>
    );
  }

  const selectedDayData = selectedDayKey
    ? sevenDays.find((d) => d.dateKey === selectedDayKey) || null
    : null;

  const filteredCategories =
    selectedCategoryFilter === 'ALL'
      ? categoryStats
      : categoryStats.filter((c) => c.config.id === selectedCategoryFilter);

  const getStatusBadge = (status: CategoryConsistencyStat['status']) => {
    switch (status) {
      case 'anchor':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-[var(--color-sage)]/15 text-[var(--color-sage)] border border-[var(--color-sage)]/30">
            <CheckCircle2 className="w-3 h-3" /> {t('Anchor Domain')}
          </span>
        );
      case 'strong':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-[var(--color-navy)]/10 text-[var(--color-navy)] border border-[var(--color-navy)]/30">
            <TrendingUp className="w-3 h-3" /> {t('Strong Rhythm')}
          </span>
        );
      case 'building':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight bg-[var(--color-coral)]/10 text-[var(--color-coral)] border border-[var(--color-coral)]/30">
            <Flame className="w-3 h-3" /> {t('Building Momentum')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-tight bg-[var(--bg-muted)] text-[var(--fg-muted)] border border-[var(--border)]">
            {t('Developing')}
          </span>
        );
    }
  };

  return (
    <Card
      id="weekly-micro-habits-trends-view"
      padding="lg"
      className="space-y-6 border border-[var(--border)] relative overflow-hidden bg-[var(--bg-elevated)]"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[var(--color-sage)]/10 via-[var(--color-coral)]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--color-sage)]/15 text-[var(--color-sage)] shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-[var(--fg)] flex items-center gap-2">
                {t('Weekly Micro-Habit Trends')}
                <Badge variant="sage" className="text-[10px] uppercase tracking-wider font-bold">
                  {t('Rolling 7 Days')}
                </Badge>
              </h3>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                {t('Multi-category consistency analysis identifying your strongest foundational habits and execution rhythms.')}
              </p>
            </div>
          </div>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t('Weekly Consistency')}
            </div>
            <div className="text-sm font-bold font-display text-[var(--color-sage)]">
              {t('{pct}% Rate', { pct: overallConsistencyPct })}
            </div>
          </div>
        </div>
      </div>

      {/* Top Highlight Cards Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Highlight Most Consistent Category */}
        <div
          id="spotlight-most-consistent-category"
          className="p-4 rounded-[var(--radius-md)] border-2 border-[var(--color-sage)]/40 bg-gradient-to-br from-[var(--color-sage)]/10 via-[var(--bg-muted)] to-[var(--bg)] space-y-3 relative overflow-hidden shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--color-sage)] text-white shadow-xs">
              <Award className="w-3 h-3" /> {t('Most Consistent Domain')}
            </span>
            <span className="text-[11px] font-mono font-bold text-[var(--color-sage)]">
              {t('#1 Domain')}
            </span>
          </div>

          {mostConsistentCategory ? (
            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 border ${
                    mostConsistentCategory.config.color
                      ? ''
                      : `${mostConsistentCategory.config.bgClass} ${mostConsistentCategory.config.colorClass} ${mostConsistentCategory.config.borderClass}`
                  }`}
                  style={
                    mostConsistentCategory.config.color
                      ? {
                          backgroundColor: `${mostConsistentCategory.config.color}20`,
                          borderColor: `${mostConsistentCategory.config.color}45`,
                          color: mostConsistentCategory.config.color,
                        }
                      : undefined
                  }
                >
                  <mostConsistentCategory.config.icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-base font-bold font-display text-[var(--fg)] truncate">
                      {t(mostConsistentCategory.config.label)}
                    </h4>
                    {mostConsistentCategory.config.isCustom && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                        style={{
                          backgroundColor: `${mostConsistentCategory.config.color}15`,
                          borderColor: `${mostConsistentCategory.config.color}35`,
                          color: mostConsistentCategory.config.color,
                        }}
                      >
                        {t('Custom')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[var(--fg-muted)] flex items-center gap-2">
                    <span>{mostConsistentCategory.habits.length === 1 ? t('1 active routine') : t('{n} active routines', { n: mostConsistentCategory.habits.length })}</span>
                    <span>•</span>
                    <span className="text-[var(--color-sage)] font-semibold">
                      {t('{n} of 7 days active', { n: mostConsistentCategory.daysActiveCount })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--fg-muted)]">{t('Domain Consistency Score:')}</span>
                <span className="font-bold text-sm text-[var(--color-sage)]">
                  {mostConsistentCategory.consistencyPct}%
                </span>
              </div>
              <p className="text-[11px] text-[var(--fg-subtle)] mt-1.5 leading-relaxed">
                {t('Your anchor execution pillar. Pair developing routines directly after these habits for seamless habit stacking.')}
              </p>
            </div>
          ) : (
            <p className="text-xs text-[var(--fg-muted)] py-2">
              {t('Complete your daily micro-habits to calculate your leading category.')}
            </p>
          )}
        </div>

        {/* Card 2: Runner Up or Secondary Rhythm */}
        <div className="p-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)] flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[var(--color-coral)]" /> {t('Secondary Domain')}
            </span>
            {runnerUpCategory && (
              <span className="text-[11px] font-mono font-bold text-[var(--fg-muted)]">
                {t('#2 Domain')}
              </span>
            )}
          </div>

          {runnerUpCategory ? (
            <div>
              <div className="flex items-center gap-3">
                <span
                  className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 border ${
                    runnerUpCategory.config.color
                      ? ''
                      : `${runnerUpCategory.config.bgClass} ${runnerUpCategory.config.colorClass} ${runnerUpCategory.config.borderClass}`
                  }`}
                  style={
                    runnerUpCategory.config.color
                      ? {
                          backgroundColor: `${runnerUpCategory.config.color}20`,
                          borderColor: `${runnerUpCategory.config.color}45`,
                          color: runnerUpCategory.config.color,
                        }
                      : undefined
                  }
                >
                  <runnerUpCategory.config.icon className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-sm font-bold font-display text-[var(--fg)] truncate">
                      {t(runnerUpCategory.config.label)}
                    </h4>
                    {runnerUpCategory.config.isCustom && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                        style={{
                          backgroundColor: `${runnerUpCategory.config.color}15`,
                          borderColor: `${runnerUpCategory.config.color}35`,
                          color: runnerUpCategory.config.color,
                        }}
                      >
                        {t('Custom')}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[var(--fg-muted)]">
                    {t('{n} executions across 7 days', { n: runnerUpCategory.totalCompletedInWeek })}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--fg-muted)]">{t('Consistency Rate:')}</span>
                <span className="font-bold text-[var(--fg)]">
                  {runnerUpCategory.consistencyPct}%
                </span>
              </div>
              <p className="text-[11px] text-[var(--fg-subtle)] mt-1.5 leading-relaxed">
                {t('Strong momentum. A few additional executions this week can elevate this to anchor status.')}
              </p>
            </div>
          ) : (
            <div className="text-xs text-[var(--fg-muted)] py-3">
              {t('Add habits in a second category to compare cross-domain momentum.')}
            </div>
          )}
        </div>

        {/* Card 3: Weekly Output & Daily Rhythm */}
        <div className="p-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-muted)] space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)] block">
            {t('Weekly Execution Rhythm')}
          </span>

          <div className="grid grid-cols-2 gap-3 pt-0.5">
            <div>
              <div className="text-2xl font-bold font-display text-[var(--fg)]">
                {totalWeeklyCompletions}
              </div>
              <div className="text-[11px] text-[var(--fg-muted)]">{t('Total Wins (7d)')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-[var(--color-coral)]">
                {activeDaysCount} <span className="text-xs font-normal text-[var(--fg-muted)]">/ 7</span>
              </div>
              <div className="text-[11px] text-[var(--fg-muted)]">{t('Active Days')}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)]">{t('Daily Average:')}</span>
            <span className="font-semibold text-[var(--fg)]">{t('{n} habits/day', { n: avgDailyCompletions })}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--fg-muted)]">{t('Tracked Routines:')}</span>
            <span className="font-semibold text-[var(--fg)]">{t('{n} active', { n: totalHabitsCount })}</span>
          </div>
        </div>
      </div>

      {/* Day-by-Day 7-Day Visual Rhythm Bar */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-sage)]" />
              {t('7-Day Daily Completion Breakdown')}
            </h4>
            <p className="text-[11px] text-[var(--fg-muted)]">
              {t('Daily habit completions across the week. Click any day to inspect completed actions.')}
            </p>
          </div>

          {selectedDayKey && (
            <button
              type="button"
              onClick={() => setSelectedDayKey(null)}
              className="text-[11px] text-[var(--color-coral)] hover:underline self-start sm:self-auto cursor-pointer"
            >
              {t('Clear day filter (Showing {day})', { day: selectedDayData?.dayLabel ?? '' })}
            </button>
          )}
        </div>

        {/* 7-Day Interactive Columns Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
          {sevenDays.map((day, idx) => {
            const isSelected = selectedDayKey === day.dateKey;
            const hasActivity = day.completedCount > 0;
            const maxDailyHabits = Math.max(1, totalHabitsCount);
            const fillHeightPct = Math.min(100, Math.round((day.completedCount / maxDailyHabits) * 100));

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedDayKey(isSelected ? null : day.dateKey)}
                aria-pressed={isSelected}
                className={`flex flex-col items-center justify-between p-2 rounded-[var(--radius-sm)] border transition-all cursor-pointer select-none text-center ${
                  isSelected
                    ? 'border-[var(--color-sage)] bg-[var(--color-sage)]/15 ring-2 ring-[var(--color-sage)]/40 shadow-xs'
                    : day.isToday
                    ? 'border-[var(--color-coral)]/60 bg-[var(--bg-muted)] shadow-xs'
                    : 'border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--bg-muted)]/70'
                }`}
              >
                <div className="text-[11px] font-bold text-[var(--fg)] flex items-center gap-1">
                  <span>{day.dayLabel}</span>
                  {day.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-coral)]" title={t('Today')} />
                  )}
                </div>
                <div className="text-[10px] text-[var(--fg-subtle)] font-mono">
                  {day.dateKey.slice(8, 10)}
                </div>

                {/* Vertical Bar Visual Indicator */}
                <div className="w-full h-12 my-2 bg-[var(--bg-muted)] rounded-full overflow-hidden flex flex-col justify-end p-0.5 border border-[var(--border)]">
                  <div
                    className={`w-full rounded-full transition-all duration-300 ${
                      hasActivity
                        ? day.completedCount >= totalHabitsCount
                          ? 'bg-[var(--color-sage)]'
                          : 'bg-[var(--color-coral)]'
                        : 'bg-transparent'
                    }`}
                    style={{ height: hasActivity ? `${Math.max(18, fillHeightPct)}%` : '0%' }}
                  />
                </div>

                <div className="text-xs font-bold text-[var(--fg)]">
                  {day.completedCount}
                </div>

                <div className="text-[9px] text-[var(--fg-muted)] leading-none mt-0.5">
                  {day.completedCount === 1 ? t('habit') : t('habits')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Day Drilldown Box */}
        {selectedDayData && (
          <div className="p-3 sm:p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-2.5 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-sage)]" />
                {t('Completed on {date} ({n} micro-actions)', { date: selectedDayData.fullDateLabel, n: selectedDayData.completedCount })}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDayKey(null)}
                className="text-[11px] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
              >
                {t('Close')}
              </button>
            </div>

            {selectedDayData.completedHabits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {selectedDayData.completedHabits.map((habit) => {
                  const hConfig = resolveCategoryConfig(
                    habit.customCategoryId || habit.category,
                    data.customHabitCategories
                  );
                  const HIcon = hConfig.icon;
                  return (
                    <div
                      key={habit.id}
                      className="p-2 rounded bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: hConfig.color || 'var(--color-sage)' }}
                        />
                        <span className="font-medium text-[var(--fg)] truncate">{habit.title}</span>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border shrink-0 ml-2 font-medium"
                        style={
                          hConfig.color
                            ? {
                                backgroundColor: `${hConfig.color}15`,
                                borderColor: `${hConfig.color}40`,
                                color: hConfig.color,
                              }
                            : undefined
                        }
                      >
                        <HIcon className="w-2.5 h-2.5" />
                        <span>{t(hConfig.label)}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[var(--fg-muted)]">
                {t('No micro-habits were recorded on this day.')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Category Consistency Rankings Table & Deep-Dive */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[var(--color-coral)]" />
              {t('Category Consistency Rankings')}
            </h4>
            <p className="text-[11px] text-[var(--fg-muted)]">
              {t('Ranked by 7-day completion rate across all defined micro-routines.')}
            </p>
          </div>

          {/* Category Filter Switcher */}
          {categoryStats.length > 1 && (
            <div className="flex items-center gap-1 overflow-x-auto text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('ALL')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border shrink-0 ${
                  selectedCategoryFilter === 'ALL'
                    ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                    : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)] border-[var(--border)]'
                }`}
              >
                {t('All ({n})', { n: categoryStats.length })}
              </button>
              {categoryStats.map((c) => (
                <button
                  key={c.config.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(c.config.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border shrink-0 ${
                    selectedCategoryFilter === c.config.id
                      ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                      : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)] border-[var(--border)]'
                  }`}
                >
                  {c.config.color && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: c.config.color }}
                    />
                  )}
                  <span>{t(c.config.label)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category Consistency Rows */}
        <div className="space-y-3">
          {filteredCategories.map((cat, idx) => {
            const Icon = cat.config.icon;
            const isTopRanked = idx === 0 && selectedCategoryFilter === 'ALL';

            return (
              <div
                key={cat.config.id}
                id={`category-rank-row-${cat.config.id.toLowerCase()}`}
                className={`p-3.5 sm:p-4 rounded-[var(--radius-md)] border transition-all ${
                  isTopRanked
                    ? 'bg-[var(--color-sage)]/5 border-[var(--color-sage)]/40 shadow-xs'
                    : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Category Title & Icon */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold ${
                          isTopRanked
                            ? 'bg-[var(--color-sage)] text-white shadow-xs'
                            : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] border border-[var(--border)]'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span
                        className={`w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center border ${
                          cat.config.color
                            ? ''
                            : `${cat.config.bgClass} ${cat.config.colorClass} ${cat.config.borderClass}`
                        }`}
                        style={
                          cat.config.color
                            ? {
                                backgroundColor: `${cat.config.color}20`,
                                borderColor: `${cat.config.color}45`,
                                color: cat.config.color,
                              }
                            : undefined
                        }
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[var(--fg)]">
                          {t(cat.config.label)}
                        </span>
                        {cat.config.isCustom && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                            style={{
                              backgroundColor: `${cat.config.color}15`,
                              borderColor: `${cat.config.color}35`,
                              color: cat.config.color,
                            }}
                          >
                            {t('Custom Domain')}
                          </span>
                        )}
                        {getStatusBadge(cat.status)}
                        {isTopRanked && (
                          <Badge variant="sage" className="text-[10px]">
                            {t('Most Consistent')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--fg-muted)] truncate mt-0.5">
                        {cat.habits.length === 1 ? t('1 routine') : t('{n} routines', { n: cat.habits.length })} • {t(cat.config.description)}
                      </p>
                    </div>
                  </div>

                  {/* 7-Day Day-by-Day Bubbles */}
                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="flex items-center gap-1" title={t('7-day completion rhythm')}>
                      {cat.dayCompletions.map((done, dayIdx) => (
                        <div
                          key={dayIdx}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition-all ${
                            done
                              ? cat.config.color
                                ? 'text-white font-semibold shadow-2xs'
                                : `${cat.config.bgClass} ${cat.config.colorClass} ${cat.config.borderClass} font-semibold shadow-2xs`
                              : 'bg-[var(--bg-muted)] text-[var(--fg-subtle)] border-[var(--border)] opacity-60'
                          }`}
                          style={
                            done && cat.config.color
                              ? {
                                  backgroundColor: cat.config.color,
                                  borderColor: cat.config.color,
                                }
                              : undefined
                          }
                          title={`${sevenDays[dayIdx]?.dayLabel}: ${done ? t('Completed') : t('Not completed')}`}
                        >
                          {done ? '✓' : sevenDays[dayIdx]?.dayLabel.charAt(0)}
                        </div>
                      ))}
                    </div>

                    {/* Consistency Percentage & Progress Bar */}
                    <div className="w-24 text-right">
                      <div className="text-xs font-bold text-[var(--fg)] flex items-center justify-end gap-1">
                        <span>{cat.consistencyPct}%</span>
                        <span className="text-[10px] text-[var(--fg-muted)] font-normal">
                          ({cat.totalCompletedInWeek}/{cat.totalExpectedInWeek})
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden mt-1 border border-[var(--border)]">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            cat.consistencyPct >= 70
                              ? 'bg-[var(--color-sage)]'
                              : cat.consistencyPct >= 40
                              ? 'bg-[var(--color-coral)]'
                              : 'bg-[var(--color-slate)]'
                          }`}
                          style={{ width: `${cat.consistencyPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional Mini Habit List for this category */}
                <div className="mt-3 pt-2.5 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {cat.habits.map((h) => {
                    const isDoneToday = Array.isArray(h.completedDates) && h.completedDates.includes(sevenDays[6]?.dateKey);
                    return (
                      <div
                        key={h.id}
                        className="flex items-center justify-between p-2 rounded bg-[var(--bg-elevated)] border border-[var(--border)]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isDoneToday ? 'bg-[var(--color-sage)]' : 'bg-[var(--border-strong)]'
                            }`}
                          />
                          <span className="font-medium text-[var(--fg)] truncate">{h.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-[var(--fg-muted)] ml-2">
                          <Flame
                            className={`w-3 h-3 ${
                              h.streakCount > 0 ? 'text-[var(--color-coral)] fill-[var(--color-coral)]' : 'text-[var(--fg-subtle)]'
                            }`}
                          />
                          <span>{h.streakCount}d</span>
                          <HabitBestStreakIndicator habit={h} todayStr={sevenDays[6]?.dateKey} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit Stacking & Behavioral Insight Callout */}
      <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-sage)]" />
          {t('Behavioral Trend Takeaway & Habit Stacking Insight')}
        </div>
        <p className="text-xs text-[var(--fg-subtle)] leading-relaxed">
          {mostConsistentCategory ? (
            <>
              {t('Your highest-momentum life domain this week is')}{' '}
              <strong className="text-[var(--fg)]">{t(mostConsistentCategory.config.label)}</strong>{' '}{t('with a')}{' '}
              <strong className="text-[var(--color-sage)]">{t('{pct}% execution rate', { pct: mostConsistentCategory.consistencyPct })}</strong>{' '}{t('across {n} days. To eliminate friction in lower-frequency categories, attach a 2-minute version of that action immediately after completing your daily {label} routine.', { n: mostConsistentCategory.daysActiveCount, label: t(mostConsistentCategory.config.label) })}
            </>
          ) : (
            t('Micro-habits are designed to be too small to fail (under 5 minutes). Consistent daily wins across multiple life domains compound into massive directional trajectory.')
          )}
        </p>
      </div>
    </Card>
  );
};
