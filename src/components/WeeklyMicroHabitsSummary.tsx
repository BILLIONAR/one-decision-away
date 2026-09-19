import React, { useMemo, useState } from 'react';
import { useApp } from '../store/useApp';
import { Folder } from 'lucide-react';
import { MicroHabit, MicroHabitCategory } from '../types/models';
import { PREDEFINED_CATEGORIES, CategoryConfig, HabitBestStreakIndicator } from './DailyMicroHabits';
import { calculateBestMicroHabitStreak } from '../services/microHabitsService';
import { resolveCategoryConfig } from '../utils/categoryHelpers';
import { useT, N_, getSpeechLang } from '../i18n';

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
  const { data } = useApp();
  const t = useT();
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

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
      const dayLabel = d.toLocaleDateString(getSpeechLang(), { weekday: 'short' });
      const fullDateLabel = d.toLocaleDateString(getSpeechLang(), {
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
  }, [data, t]);

  if (!data || !data.microHabits || data.microHabits.length === 0) {
    return (
      <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-2">
        <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Weekly Micro-Habit Trends')}</h3>
        <p className="text-[13px] text-[var(--fg-muted)]">
          {t('No micro-habits found. Create your first 5-minute habit on the Home page to start tracking weekly category trends.')}
        </p>
      </div>
    );
  }

  const selectedDayData = selectedDayKey
    ? sevenDays.find((d) => d.dateKey === selectedDayKey) || null
    : null;

  const filteredCategories =
    selectedCategoryFilter === 'ALL'
      ? categoryStats
      : categoryStats.filter((c) => c.config.id === selectedCategoryFilter);

  const getStatusLabel = (status: CategoryConsistencyStat['status']) => {
    switch (status) {
      case 'anchor':
        return t('Anchor Domain');
      case 'strong':
        return t('Strong Rhythm');
      case 'building':
        return t('Building Momentum');
      default:
        return t('Developing');
    }
  };

  const chipClass = (active: boolean) =>
    `h-11 px-3 rounded-[var(--radius-sm)] text-[13px] font-medium cursor-pointer transition-colors border shrink-0 ${
      active
        ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
        : 'bg-transparent text-[var(--fg-muted)] hover:text-[var(--fg)] border-[var(--border-strong)]'
    }`;

  return (
    <div id="weekly-micro-habits-trends-view" className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Weekly Micro-Habit Trends')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
            {t('Which habit areas you kept up this week, over the last 7 days.')}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[22px] font-semibold text-[var(--accent)] leading-none">{overallConsistencyPct}%</div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-1">{t('Weekly Consistency')}</div>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">{totalWeeklyCompletions}</div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Total Wins (7d)')}</div>
        </div>
        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
            {activeDaysCount}
            <span className="text-[13px] font-normal text-[var(--fg-muted)] ml-1">/ 7</span>
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Active Days')}</div>
        </div>
        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">{avgDailyCompletions}</div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Habits per day')}</div>
        </div>
        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">{totalHabitsCount}</div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Tracked Routines:')}</div>
        </div>
      </div>

      {/* Leading domains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div id="spotlight-most-consistent-category" className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4 space-y-3">
          <div className="text-[12px] text-[var(--fg-muted)]">{t('Most Consistent Domain')}</div>
          {mostConsistentCategory ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
                  <mostConsistentCategory.config.icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-[15px] font-semibold text-[var(--fg)] truncate">
                      {t(mostConsistentCategory.config.label)}
                    </h4>
                    {mostConsistentCategory.config.isCustom && (
                      <span className="text-[12px] text-[var(--fg-muted)]">{t('Custom')}</span>
                    )}
                  </div>
                  <div className="text-[12px] text-[var(--fg-muted)]">
                    {mostConsistentCategory.habits.length === 1 ? t('1 active routine') : t('{n} active routines', { n: mostConsistentCategory.habits.length })}
                    {' · '}
                    {t('{n} of 7 days active', { n: mostConsistentCategory.daysActiveCount })}
                  </div>
                </div>
                <span className="text-[22px] font-semibold text-[var(--accent)] shrink-0">
                  {mostConsistentCategory.consistencyPct}%
                </span>
              </div>
              <p className="text-[13px] text-[var(--fg-muted)]">
                {t('Your anchor execution pillar. Pair developing routines directly after these habits for seamless habit stacking.')}
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--fg-muted)]">
              {t('Complete your daily micro-habits to calculate your leading category.')}
            </p>
          )}
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4 space-y-3">
          <div className="text-[12px] text-[var(--fg-muted)]">{t('Secondary Domain')}</div>
          {runnerUpCategory ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-muted)] flex items-center justify-center shrink-0">
                  <runnerUpCategory.config.icon className="w-5 h-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-[15px] font-semibold text-[var(--fg)] truncate">
                      {t(runnerUpCategory.config.label)}
                    </h4>
                    {runnerUpCategory.config.isCustom && (
                      <span className="text-[12px] text-[var(--fg-muted)]">{t('Custom')}</span>
                    )}
                  </div>
                  <div className="text-[12px] text-[var(--fg-muted)]">
                    {t('{n} executions across 7 days', { n: runnerUpCategory.totalCompletedInWeek })}
                  </div>
                </div>
                <span className="text-[22px] font-semibold text-[var(--fg)] shrink-0">
                  {runnerUpCategory.consistencyPct}%
                </span>
              </div>
              <p className="text-[13px] text-[var(--fg-muted)]">
                {t('Strong momentum. A few additional executions this week can elevate this to anchor status.')}
              </p>
            </div>
          ) : (
            <p className="text-[13px] text-[var(--fg-muted)]">
              {t('Add habits in a second category to compare cross-domain momentum.')}
            </p>
          )}
        </div>
      </div>

      {/* Day by day */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-[15px] font-semibold text-[var(--fg)]">{t('Day by day')}</h4>
            <p className="text-[13px] text-[var(--fg-muted)]">
              {t('Habits completed each day. Click a day to see which ones.')}
            </p>
          </div>
          {selectedDayKey && (
            <button
              type="button"
              onClick={() => setSelectedDayKey(null)}
              className="h-11 px-2 text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg)] self-start sm:self-auto cursor-pointer"
            >
              {t('Clear day filter (Showing {day})', { day: selectedDayData?.dayLabel ?? '' })}
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {sevenDays.map((day) => {
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
                className={`flex flex-col items-center gap-1 py-3 px-1 rounded-[var(--radius-sm)] border transition-colors cursor-pointer select-none text-center ${
                  isSelected
                    ? 'bg-[var(--bg)] border-[var(--fg)]'
                    : 'bg-[var(--bg)] border-transparent hover:border-[var(--border-strong)]'
                }`}
              >
                <div className={`text-[12px] ${day.isToday ? 'font-semibold text-[var(--fg)]' : 'text-[var(--fg-muted)]'}`}>
                  {day.dayLabel}
                </div>
                <div className="w-2 h-12 my-1 bg-[var(--bg-inset)] rounded-full overflow-hidden flex flex-col justify-end">
                  <div
                    className={`w-full rounded-full transition-all duration-300 ${
                      hasActivity
                        ? day.completedCount >= totalHabitsCount
                          ? 'bg-[var(--accent)]'
                          : 'bg-[var(--fg-muted)]'
                        : 'bg-transparent'
                    }`}
                    style={{ height: hasActivity ? `${Math.max(18, fillHeightPct)}%` : '0%' }}
                  />
                </div>
                <div className="text-[15px] font-semibold text-[var(--fg)] leading-none">{day.completedCount}</div>
              </button>
            );
          })}
        </div>

        {selectedDayData && (
          <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-semibold text-[var(--fg)]">
                {t('Completed on {date} ({n} micro-actions)', { date: selectedDayData.fullDateLabel, n: selectedDayData.completedCount })}
              </span>
              <button
                type="button"
                onClick={() => setSelectedDayKey(null)}
                className="h-11 px-2 text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer shrink-0"
              >
                {t('Close')}
              </button>
            </div>

            {selectedDayData.completedHabits.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedDayData.completedHabits.map((habit) => {
                  const hConfig = resolveCategoryConfig(
                    habit.customCategoryId || habit.category,
                    data.customHabitCategories
                  );
                  return (
                    <div
                      key={habit.id}
                      className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] flex items-center justify-between gap-3 text-[13px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0 bg-[var(--accent)]" />
                        <span className="font-medium text-[var(--fg)] truncate">{habit.title}</span>
                      </div>
                      <span className="text-[12px] text-[var(--fg-muted)] shrink-0">{t(hConfig.label)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--fg-muted)]">
                {t('No micro-habits were recorded on this day.')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Category rankings */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-[15px] font-semibold text-[var(--fg)]">{t('Category Consistency Rankings')}</h4>
            <p className="text-[13px] text-[var(--fg-muted)]">
              {t('Ranked by 7-day completion rate across all defined micro-routines.')}
            </p>
          </div>

          {categoryStats.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('ALL')}
                className={chipClass(selectedCategoryFilter === 'ALL')}
              >
                {t('All ({n})', { n: categoryStats.length })}
              </button>
              {categoryStats.map((c) => (
                <button
                  key={c.config.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(c.config.id)}
                  className={chipClass(selectedCategoryFilter === c.config.id)}
                >
                  {t(c.config.label)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          {filteredCategories.map((cat, idx) => {
            const Icon = cat.config.icon;
            const isTopRanked = idx === 0 && selectedCategoryFilter === 'ALL';

            return (
              <div
                key={cat.config.id}
                id={`category-rank-row-${cat.config.id.toLowerCase()}`}
                className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[12px] text-[var(--fg-muted)] w-5 shrink-0">{idx + 1}</span>
                    <span
                      className={`w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 ${
                        isTopRanked ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-[var(--bg-muted)] text-[var(--fg-muted)]'
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[15px] font-semibold text-[var(--fg)]">{t(cat.config.label)}</span>
                        <span className={`text-[12px] ${cat.status === 'anchor' ? 'text-[var(--accent)]' : 'text-[var(--fg-muted)]'}`}>
                          {getStatusLabel(cat.status)}
                        </span>
                        {cat.config.isCustom && (
                          <span className="text-[12px] text-[var(--fg-muted)]">{t('Custom Domain')}</span>
                        )}
                      </div>
                      <p className="text-[12px] text-[var(--fg-muted)] truncate mt-0.5">
                        {cat.habits.length === 1 ? t('1 routine') : t('{n} routines', { n: cat.habits.length })} · {t(cat.config.description)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="flex items-center gap-1" title={t('7-day completion rhythm')}>
                      {cat.dayCompletions.map((done, dayIdx) => (
                        <div
                          key={dayIdx}
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                            done ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-muted)] text-[var(--fg-subtle)]'
                          }`}
                          title={`${sevenDays[dayIdx]?.dayLabel}: ${done ? t('Completed') : t('Not completed')}`}
                        >
                          {done ? '' : sevenDays[dayIdx]?.dayLabel.charAt(0)}
                        </div>
                      ))}
                    </div>

                    <div className="w-24 text-right">
                      <div className="text-[13px] font-semibold text-[var(--fg)]">
                        {cat.consistencyPct}%
                        <span className="text-[12px] text-[var(--fg-muted)] font-normal ml-1">
                          ({cat.totalCompletedInWeek}/{cat.totalExpectedInWeek})
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[var(--bg-inset)] rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                          style={{ width: `${cat.consistencyPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px]">
                  {cat.habits.map((h) => {
                    const isDoneToday = Array.isArray(h.completedDates) && h.completedDates.includes(sevenDays[6]?.dateKey);
                    return (
                      <div
                        key={h.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isDoneToday ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'
                            }`}
                          />
                          <span className="font-medium text-[var(--fg)] truncate">{h.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 text-[12px] text-[var(--fg-muted)]">
                          <span>{t('{n}d streak', { n: h.streakCount })}</span>
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

      {/* Takeaway */}
      <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4 space-y-1">
        <div className="text-[13px] font-semibold text-[var(--fg)]">{t('Takeaway')}</div>
        <p className="text-[13px] text-[var(--fg-muted)] leading-relaxed">
          {mostConsistentCategory ? (
            <>
              {t('Your highest-momentum life domain this week is')}{' '}
              <strong className="text-[var(--fg)] font-medium">{t(mostConsistentCategory.config.label)}</strong>{' '}{t('with a')}{' '}
              <strong className="text-[var(--accent)] font-medium">{t('{pct}% execution rate', { pct: mostConsistentCategory.consistencyPct })}</strong>{' '}{t('across {n} days. To eliminate friction in lower-frequency categories, attach a 2-minute version of that action immediately after completing your daily {label} routine.', { n: mostConsistentCategory.daysActiveCount, label: t(mostConsistentCategory.config.label) })}
            </>
          ) : (
            t('Micro-habits are designed to be too small to fail (under 5 minutes). Consistent daily wins across multiple life domains compound into massive directional trajectory.')
          )}
        </p>
      </div>
    </div>
  );
};
