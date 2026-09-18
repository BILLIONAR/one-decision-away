/**
 * Daily Micro-Habits Rollover & Background Synchronization Service
 * 
 * Automatically monitors dateKey changes across application sessions and active runtime,
 * resetting uncompleted micro-habits, recalculating broken streaks, and preparing
 * a fresh daily checklist when midnight crosses or when the app loads on a new calendar day.
 */

import { UserData, MicroHabit } from '../types/models';

/**
 * Returns a standardized YYYY-MM-DD date key in ISO representation.
 */
export function getCurrentDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Returns the date key for the day prior to the reference date.
 */
export function getYesterdayDateKey(date = new Date()): string {
  const yesterday = new Date(date.getTime() - 86400000);
  return yesterday.toISOString().slice(0, 10);
}

/**
 * Calculates current active streak of consecutive days for a micro-habit.
 * If neither today nor yesterday is in completedDates, the active streak is broken (0).
 * Otherwise, counts backwards day-by-day to find the consecutive chain.
 */
export function calculateMicroHabitStreak(
  completedDates: string[],
  referenceDate = new Date()
): number {
  if (!Array.isArray(completedDates) || completedDates.length === 0) return 0;

  const todayStr = getCurrentDateKey(referenceDate);
  const yesterdayStr = getYesterdayDateKey(referenceDate);

  const uniqueDays = new Set(completedDates.map((d) => d.slice(0, 10)));

  // If the habit was neither completed today nor yesterday, the streak is 0
  if (!uniqueDays.has(todayStr) && !uniqueDays.has(yesterdayStr)) {
    return 0;
  }

  // Count backwards starting from today (if completed today) or yesterday
  let streak = 0;
  const startFromToday = uniqueDays.has(todayStr);
  let checkDate = new Date(startFromToday ? referenceDate : new Date(referenceDate.getTime() - 86400000));

  for (let i = 0; i < 365; i++) {
    const key = checkDate.toISOString().slice(0, 10);
    if (uniqueDays.has(key)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates the all-time best streak achieved from historical completion dates.
 * Analyzes chronological consecutive calendar day sequences in completedDates,
 * taking into account current streak and any previously recorded best streak.
 */
export function calculateBestMicroHabitStreak(
  completedDates: string[],
  currentStreak = 0,
  storedBest = 0
): number {
  if (!Array.isArray(completedDates) || completedDates.length === 0) {
    return Math.max(0, currentStreak, storedBest);
  }

  // 1. Extract unique date keys YYYY-MM-DD and sort chronologically
  const uniqueDates = Array.from(
    new Set(completedDates.map((d) => d.slice(0, 10)).filter(Boolean))
  ).sort();

  if (uniqueDates.length === 0) {
    return Math.max(0, currentStreak, storedBest);
  }

  let maxStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(`${uniqueDates[i - 1]}T00:00:00Z`);
    const currDate = new Date(`${uniqueDates[i]}T00:00:00Z`);

    // Difference in calendar days
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / 86400000);

    if (diffDays === 1) {
      currentRun++;
      if (currentRun > maxStreak) {
        maxStreak = currentRun;
      }
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  return Math.max(maxStreak, currentStreak, storedBest);
}

export interface DailyMicroHabitRolloverResult {
  hasChanged: boolean;
  previousDateKey?: string;
  currentDateKey: string;
  resetHabitsCount: number;
  brokenStreaksCount: number;
  preservedStreaksCount: number;
  resetHabitTitles: string[];
  updatedData: UserData;
}

/**
 * Inspects whether the app dateKey has changed since the last app usage.
 * If changed, automatically:
 * 1. Resets uncompleted daily habits for today's fresh checklist.
 * 2. Recalculates streak counts (resetting to 0 any habit not completed yesterday).
 * 3. Preserves valid consecutive streaks for habits completed yesterday.
 * 4. Records lastActiveDateKey and lastDailyResetTimestamp on the UserData.
 */
export function checkAndApplyDailyMicroHabitRollover(
  data: UserData,
  referenceDate = new Date(),
  forceCheck = false
): DailyMicroHabitRolloverResult {
  const currentDateKey = getCurrentDateKey(referenceDate);
  const previousDateKey = data.lastActiveDateKey || data.profile?.lastOpenedAt?.slice(0, 10);

  // If this is the initial load with no recorded dateKey, record current dateKey and validate streaks
  if (!previousDateKey) {
    const habits = data.microHabits || [];
    const sanitizedHabits = habits.map((h) => {
      const dates = Array.isArray(h.completedDates) ? h.completedDates : [];
      const streak = calculateMicroHabitStreak(dates, referenceDate);
      const best = calculateBestMicroHabitStreak(dates, streak, h.bestStreak);
      return {
        ...h,
        completedDates: dates,
        streakCount: streak,
        bestStreak: best,
      };
    });

    return {
      hasChanged: false,
      currentDateKey,
      resetHabitsCount: 0,
      brokenStreaksCount: 0,
      preservedStreaksCount: sanitizedHabits.filter((h) => h.streakCount > 0).length,
      resetHabitTitles: [],
      updatedData: {
        ...data,
        microHabits: sanitizedHabits,
        lastActiveDateKey: currentDateKey,
        lastDailyResetTimestamp: referenceDate.toISOString(),
      },
    };
  }

  // If date has not changed and forceCheck is not requested, return unchanged
  if (previousDateKey === currentDateKey && !forceCheck) {
    return {
      hasChanged: false,
      previousDateKey,
      currentDateKey,
      resetHabitsCount: 0,
      brokenStreaksCount: 0,
      preservedStreaksCount: (data.microHabits || []).filter((h) => (h.streakCount || 0) > 0).length,
      resetHabitTitles: [],
      updatedData: data,
    };
  }

  // DateKey HAS changed since last app usage!
  const habits = data.microHabits || [];
  const yesterdayKey = getYesterdayDateKey(referenceDate);
  const resetHabitTitles: string[] = [];
  let brokenStreaksCount = 0;
  let preservedStreaksCount = 0;

  const updatedHabits = habits.map((habit) => {
    const completedDates = Array.isArray(habit.completedDates) ? [...habit.completedDates] : [];
    const isDoneToday = completedDates.includes(currentDateKey);
    const wasDoneYesterday = completedDates.includes(yesterdayKey);

    // Calculate streak for the new day
    const updatedStreak = calculateMicroHabitStreak(completedDates, referenceDate);
    const updatedBestStreak = calculateBestMicroHabitStreak(completedDates, updatedStreak, habit.bestStreak);

    if (habit.streakCount > 0 && updatedStreak === 0) {
      brokenStreaksCount++;
    } else if (updatedStreak > 0) {
      preservedStreaksCount++;
    }

    if (!isDoneToday) {
      resetHabitTitles.push(habit.title);
    }

    return {
      ...habit,
      completedDates,
      streakCount: updatedStreak,
      bestStreak: updatedBestStreak,
    };
  });

  const nowIso = referenceDate.toISOString();

  const updatedData: UserData = {
    ...data,
    microHabits: updatedHabits,
    lastActiveDateKey: currentDateKey,
    lastDailyResetTimestamp: nowIso,
    profile: {
      ...data.profile,
      lastOpenedAt: nowIso,
    },
  };

  return {
    hasChanged: true,
    previousDateKey,
    currentDateKey,
    resetHabitsCount: resetHabitTitles.length,
    brokenStreaksCount,
    preservedStreaksCount,
    resetHabitTitles,
    updatedData,
  };
}
