/**
 * One Decision Away — Economy & Pacing Rules
 * Pure calculation engine shared between client simulation and server functions.
 */

import { Mission, MissionDifficulty, MissionType, WalletTransaction } from '../types/models';
import { t, getSpeechLang } from '../i18n';

export const ECONOMY_CONSTANTS = {
  DAILY_REWARD_CAP: 2500,
  MAX_PAID_DAILY_QUESTS: 5,
  REPEAT_COOLDOWN_HOURS: 2,
  WELCOME_GRANT: 250,
  STREAK_BONUS_AMOUNT: 700,
  STREAK_BONUS_30D_CAP: 2000,
  ONE_DECISION_REWARD: 500,
  NOTEBOOK_DAILY_REWARD: 25,
} as const;

/** Notebook uses local days for writing, but shares the existing UTC economy ceiling. */
export function getNotebookRewardAmount(transactions: WalletTransaction[], now = new Date()): number {
  const economyDay = now.toISOString().slice(0, 10);
  const earned = transactions
    .filter((tx) => tx.dayKey === economyDay && tx.amount > 0 && tx.kind !== 'welcome_grant')
    .reduce((total, tx) => total + tx.amount, 0);
  return Math.min(ECONOMY_CONSTANTS.NOTEBOOK_DAILY_REWARD, Math.max(0, ECONOMY_CONSTANTS.DAILY_REWARD_CAP - earned));
}

export function getBaseReward(type: MissionType, difficulty: MissionDifficulty, isOneDecision: boolean): number {
  if (isOneDecision) {
    return ECONOMY_CONSTANTS.ONE_DECISION_REWARD;
  }

  switch (type) {
    case 'daily_quest':
      if (difficulty === 'easy') return 50;
      if (difficulty === 'medium') return 150;
      if (difficulty === 'hard') return 400;
      return 50;

    case 'weekly_mission':
      return 1000;

    case 'monthly_boss_fight':
      if (difficulty === 'easy') return 5000;
      if (difficulty === 'medium') return 7500;
      if (difficulty === 'hard') return 10000;
      return 7500;

    case 'one_year_mission':
      return 25000;

    case 'constraint':
      // Constraints are the rules of the game; they earn no D$, protecting the missions that do.
      return 0;

    default:
      return 50;
  }
}

export function isExemptFromDailyCap(type: MissionType): boolean {
  return type === 'weekly_mission' || type === 'monthly_boss_fight' || type === 'one_year_mission';
}

export interface RewardEvaluation {
  rewardAmount: number;
  isCapped: boolean;
  reason?: string;
  isDuplicateCooldown?: boolean;
}

export function evaluateMissionReward(params: {
  mission: Mission;
  todayTransactions: WalletTransaction[];
  todayPaidQuestsCount: number;
  lastMissionCompletionTime?: string;
}): RewardEvaluation {
  const { mission, todayTransactions, todayPaidQuestsCount, lastMissionCompletionTime } = params;

  if (mission.type === 'constraint') {
    return {
      rewardAmount: 0,
      isCapped: false,
      reason: t('Constraints are personal rules that protect your focus — they record consistency without currency rewards.'),
    };
  }

  // Anti-repeat check (2 hours)
  if (lastMissionCompletionTime) {
    const lastTime = new Date(lastMissionCompletionTime).getTime();
    const now = Date.now();
    const diffHours = (now - lastTime) / (1000 * 60 * 60);
    if (diffHours < ECONOMY_CONSTANTS.REPEAT_COOLDOWN_HOURS) {
      return {
        rewardAmount: 0,
        isCapped: true,
        isDuplicateCooldown: true,
        reason: t('This mission was completed less than 2 hours ago. Your consistency is noted, but repeat rewards require spaced action.'),
      };
    }
  }

  const base = getBaseReward(mission.type, mission.difficulty, mission.isOneDecision);

  // Daily quest count limit
  if (mission.type === 'daily_quest' && !mission.isOneDecision) {
    if (todayPaidQuestsCount >= ECONOMY_CONSTANTS.MAX_PAID_DAILY_QUESTS) {
      return {
        rewardAmount: 0,
        isCapped: true,
        reason: t("You've reached today's 5 paid daily quests. Mission completed and recorded toward your Future Life!"),
      };
    }
  }

  // If exempt from daily cap (weekly, boss, 1-year)
  if (isExemptFromDailyCap(mission.type)) {
    return {
      rewardAmount: base,
      isCapped: false,
    };
  }

  // Calculate today's earned from standard missions
  const todayEarned = todayTransactions
    .filter((t) => t.amount > 0 && t.kind !== 'welcome_grant')
    .reduce((sum, t) => sum + t.amount, 0);

  const remainingCap = Math.max(0, ECONOMY_CONSTANTS.DAILY_REWARD_CAP - todayEarned);

  if (remainingCap <= 0) {
    return {
      rewardAmount: 0,
      isCapped: true,
      reason: t("Daily reward cap of D${cap} reached. Your vote for the Future You're Building is saved!", { cap: ECONOMY_CONSTANTS.DAILY_REWARD_CAP.toLocaleString() }),
    };
  }

  if (base > remainingCap) {
    return {
      rewardAmount: remainingCap,
      isCapped: true,
      reason: t("Adjusted to D${amount} to stay within today's D${cap} ceiling.", { amount: remainingCap, cap: ECONOMY_CONSTANTS.DAILY_REWARD_CAP.toLocaleString() }),
    };
  }

  return {
    rewardAmount: base,
    isCapped: false,
  };
}

export function computeLedgerBalance(transactions: WalletTransaction[]): number {
  return transactions.reduce((acc, t) => acc + t.amount, 0);
}

export function computeLifetimeEarned(transactions: WalletTransaction[]): number {
  return transactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0);
}

export function computeLifetimeSpent(transactions: WalletTransaction[]): number {
  return transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0);
}

export function computeTodayEarnings(transactions: WalletTransaction[]): number {
  const todayStr = new Date().toISOString().slice(0, 10);
  return transactions
    .filter((t) => t.amount > 0 && t.dayKey === todayStr && t.kind !== 'welcome_grant')
    .reduce((acc, t) => acc + t.amount, 0);
}

/**
 * Calculates current active streak of consecutive days with at least one completed mission.
 */
export function calculateCurrentStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;

  const uniqueDays = Array.from(
    new Set(completedDates.map((d) => d.slice(0, 10)))
  ).sort().reverse();

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (!uniqueDays.includes(today) && !uniqueDays.includes(yesterday)) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(uniqueDays.includes(today) ? today : yesterday);

  for (let i = 0; i < 365; i++) {
    const key = checkDate.toISOString().slice(0, 10);
    if (uniqueDays.includes(key)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

export function estimateMissionsFor(missingD$: number, avgReward = 250): number {
  if (missingD$ <= 0) return 0;
  return Math.ceil(missingD$ / avgReward);
}

export interface OneDecisionDayHistory {
  date: string; // YYYY-MM-DD
  dayLabel: string; // 'Mon', 'Tue', etc.
  dayNumber: number; // 1-31
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
  title?: string;
}

export interface OneDecisionStreakData {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  totalRewardEarned: number;
  completedToday: boolean;
  completedYesterday: boolean;
  last7Days: OneDecisionDayHistory[];
  tier: {
    name: string;
    level: number;
    icon: string;
    nextMilestone: number;
    prevMilestone: number;
    description: string;
  };
  milestoneProgress: number; // 0 to 100%
  daysToNextMilestone: number;
  multiplier: number;
}

/**
 * Calculates detailed streak analytics specifically for the Daily 'One Decision' feature.
 */
export function calculateOneDecisionStreakData(userData: {
  missions: Mission[];
  completions?: any[];
  transactions?: WalletTransaction[];
}): OneDecisionStreakData {
  const dayMap: Record<string, { count: number; title?: string; reward: number }> = {};

  // 1. Scan completed missions marked as One Decision
  (userData.missions || []).forEach((m) => {
    if (m.isOneDecision && m.status === 'completed' && m.completedAt) {
      const dayKey = m.completedAt.slice(0, 10);
      if (!dayMap[dayKey]) {
        dayMap[dayKey] = { count: 0, title: m.title, reward: 500 };
      }
      dayMap[dayKey].count += 1;
      if (!dayMap[dayKey].title) dayMap[dayKey].title = m.title;
    }
  });

  // 2. Scan transactions with one_decision_reward
  (userData.transactions || []).forEach((t) => {
    if (t.kind === 'one_decision_reward') {
      const dayKey = t.dayKey || t.createdAt.slice(0, 10);
      if (!dayMap[dayKey]) {
        dayMap[dayKey] = { count: 0, title: t.memo, reward: t.amount };
      }
      dayMap[dayKey].count += 1;
      dayMap[dayKey].reward += t.amount;
    }
  });

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const completedToday = Boolean(dayMap[today] && dayMap[today].count > 0);
  const completedYesterday = Boolean(dayMap[yesterday] && dayMap[yesterday].count > 0);

  const uniqueDays = Object.keys(dayMap).sort(); // ascending
  const uniqueDaysSet = new Set(uniqueDays);

  // Compute Current Streak
  let currentStreak = 0;
  if (completedToday || completedYesterday) {
    let checkTime = completedToday ? Date.now() : Date.now() - 86400000;
    for (let i = 0; i < 365; i++) {
      const key = new Date(checkTime).toISOString().slice(0, 10);
      if (uniqueDaysSet.has(key)) {
        currentStreak++;
        checkTime -= 86400000;
      } else {
        break;
      }
    }
  }

  // Compute Longest Streak in history
  let longestStreak = 0;
  if (uniqueDays.length > 0) {
    let tempStreak = 0;
    let prevDate: Date | null = null;

    for (const dayStr of uniqueDays) {
      const currDate = new Date(dayStr + 'T00:00:00Z');
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      prevDate = currDate;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  // Total Completed & Total Rewards
  const totalCompleted = Object.values(dayMap).reduce((sum, d) => sum + d.count, 0);
  const totalRewardEarned = Object.values(dayMap).reduce((sum, d) => sum + d.reward, 0);

  // Last 7 Days Timeline
  const last7Days: OneDecisionDayHistory[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString(getSpeechLang(), { weekday: 'short' });
    const dayNumber = d.getDate();
    const isCompleted = Boolean(dayMap[dateStr]);
    const isCurrentDay = dateStr === today;

    last7Days.push({
      date: dateStr,
      dayLabel,
      dayNumber,
      isCompleted,
      isToday: isCurrentDay,
      isFuture: false,
      title: dayMap[dateStr]?.title,
    });
  }

  // Tiers and Milestones
  let tier = {
    name: t('Baseline'),
    level: 0,
    icon: '🎯',
    nextMilestone: 1,
    prevMilestone: 0,
    description: t('Set and execute today’s One Decision to ignite your streak.'),
  };

  let multiplier = 1.0;

  if (currentStreak >= 30) {
    tier = {
      name: t('Sovereignty'),
      level: 5,
      icon: '👑',
      nextMilestone: 60,
      prevMilestone: 30,
      description: t('Legendary discipline. Your daily execution is now second nature.'),
    };
    multiplier = 2.0;
  } else if (currentStreak >= 14) {
    tier = {
      name: t('Mastery'),
      level: 4,
      icon: '⚡',
      nextMilestone: 30,
      prevMilestone: 14,
      description: t('Exceptional consistency. Two solid weeks of daily high-leverage decisions.'),
    };
    multiplier = 1.5;
  } else if (currentStreak >= 7) {
    tier = {
      name: t('Flow State'),
      level: 3,
      icon: '🌊',
      nextMilestone: 14,
      prevMilestone: 7,
      description: t('One full week completed. Your momentum is carrying you forward effortlessly.'),
    };
    multiplier = 1.25;
  } else if (currentStreak >= 3) {
    tier = {
      name: t('Momentum'),
      level: 2,
      icon: '🔥',
      nextMilestone: 7,
      prevMilestone: 3,
      description: t('3+ days in a row! You have broken through initial inertia.'),
    };
    multiplier = 1.1;
  } else if (currentStreak >= 1) {
    tier = {
      name: t('Ignition'),
      level: 1,
      icon: '✨',
      nextMilestone: 3,
      prevMilestone: 1,
      description: t('Streak ignited. Protect this momentum tomorrow.'),
    };
    multiplier = 1.0;
  }

  const daysToNextMilestone = Math.max(0, tier.nextMilestone - currentStreak);
  const milestoneRange = Math.max(1, tier.nextMilestone - tier.prevMilestone);
  const milestoneProgress = Math.min(
    100,
    Math.max(0, Math.round(((currentStreak - tier.prevMilestone) / milestoneRange) * 100))
  );

  return {
    currentStreak,
    longestStreak,
    totalCompleted,
    totalRewardEarned,
    completedToday,
    completedYesterday,
    last7Days,
    tier,
    milestoneProgress,
    daysToNextMilestone,
    multiplier,
  };
}


/**
 * Estimates how many Dream Dollars the user earns per day, based on the last 14 days of credits.
 * Falls back to one One Decision per day (the baseline habit) when there is not enough history.
 */
export function estimateDailyEarningPace(transactions: WalletTransaction[]): { perDay: number; isBaseline: boolean } {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const recent = transactions.filter((t) => t.amount > 0 && t.kind !== 'welcome_grant' && t.dayKey >= cutoffKey);
  if (recent.length === 0) return { perDay: ECONOMY_CONSTANTS.ONE_DECISION_REWARD, isBaseline: true };
  const days = new Set(recent.map((t) => t.dayKey));
  const firstDay = [...days].sort()[0];
  const spanDays = Math.max(1, Math.round((Date.now() - new Date(firstDay).getTime()) / 86400000) + 1);
  const total = recent.reduce((a, t) => a + t.amount, 0);
  return { perDay: Math.max(50, Math.round(total / Math.min(14, spanDays))), isBaseline: false };
}

/** Days until an item is affordable at the given pace (0 if already affordable). */
export function daysToAfford(price: number, balance: number, perDay: number): number {
  if (price <= balance) return 0;
  return Math.max(1, Math.ceil((price - balance) / Math.max(1, perDay)));
}
