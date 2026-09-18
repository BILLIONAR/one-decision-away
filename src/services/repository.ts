/**
 * One Decision Away — Data Repository Interface & Factory
 * Implements clean repository pattern for seamless local demo vs. production Supabase backend.
 */

import { UserData, WalletTransaction, Mission, Purchase, RealityBridge, LifeScoreRecord, Goal } from '../types/models';
import { SEED_INITIAL_GOALS, SEED_INITIAL_MISSIONS, DEFAULT_BUDGET, SEED_MARKET_ITEMS, SEED_SEASONS, SEED_MICRO_HABITS, SEED_CHECK_INS, SEED_CUSTOM_CATEGORIES, SEED_DAILY_PRIMARY_GOALS } from '../data/seed';
import { computeLedgerBalance, evaluateMissionReward, ECONOMY_CONSTANTS } from './economy';
import { checkAndApplyDailyMicroHabitRollover } from './microHabitsService';
import { cloudSync } from './cloudSync';

export interface DataRepository {
  readonly mode: 'demo' | 'server';
  load(): Promise<UserData>;
  save(data: UserData): Promise<void>;
  replaceAll(data: UserData): Promise<void>;
  clear(): Promise<void>;
  completeMission(params: {
    missionId: string;
    method: 'self' | 'timer' | 'photo';
    focusMinutes?: number;
    note?: string;
    reflection?: { completedSummary: string; resistanceNoticed: string; nextStep: string };
  }): Promise<{ data: UserData; rewardAmount: number; message: string }>;
  purchaseItem(itemId: string): Promise<{ data: UserData; purchase: Purchase; message: string }>;
  createRealityBridge(bridgeData: Omit<RealityBridge, 'id' | 'createdAt' | 'updatedAt' | 'savingsLogs'>): Promise<{ data: UserData; bridge: RealityBridge }>;
  updateRealityBridgeSavings(bridgeId: string, addedAmount: number, note?: string): Promise<{ data: UserData; bridge: RealityBridge }>;
}

const STORAGE_KEY = 'one_decision_away_app_data_v1';

export function getInitialDemoState(): UserData {
  const now = new Date().toISOString();
  const initialTransaction: WalletTransaction = {
    id: 'tx-welcome-grant',
    walletId: 'wallet-demo',
    userId: 'demo-user',
    kind: 'welcome_grant',
    amount: ECONOMY_CONSTANTS.WELCOME_GRANT,
    dayKey: now.slice(0, 10),
    memo: 'Welcome grant for beginning your journey',
    createdAt: now,
  };

  return {
    profile: {
      id: 'demo-user',
      displayName: 'Dream Builder',
      onboardingStep: 'completed',
      locale: 'en',
      theme: 'light',
      soundMuted: false,
      focusTabBlinkEnabled: true,
      focusScreenPulseEnabled: true,
      reminderTime: '08:00',
      dailyWisdomEnabled: true,
      dailyWisdomTime: '08:30',
      firstOpenedAt: now,
      lastOpenedAt: now,
      createdAt: now,
    },
    lifeScores: [
      {
        id: 'initial-score',
        userId: 'demo-user',
        scores: {
          money: 6,
          workAndPurpose: 7,
          health: 8,
          relationships: 6,
          discipline: 6,
          environment: 7,
          learning: 8,
          personalMeaning: 7,
        },
        totalScore: 69,
        lowestAreas: ['Money', 'Discipline'],
        interpretation: 'Some areas are carrying you; others are quietly asking for attention. A single daily decision can shift the balance.',
        createdAt: now,
      },
    ],
    twoFutures: {
      allowingAnswers: {
        q1: 'Quietly accepting that evening tiredness dictates what gets worked on.',
        q2: 'Complaining about lack of time while spending an hour scrolling.',
        q3: 'Wake up rushed, commute with friction, do reactive tasks, return drained.',
        q4: 'The ability to build my own business or travel for a month freely.',
        q5: 'Not having given my true ideas a dedicated year of consistent focus.',
        q6: 'The version that waits for perfect certainty before publishing.',
        q7: 'Fear of putting out work and having it meet total silence.',
        q8: 'Years of postponement and staying in a comfortable plateau.',
      },
      buildingAnswers: {
        q1: 'Wake up with a clear calendar, two hours of deep creation, afternoon training, evening reading.',
        q2: 'Known for craftsmanship, consistency, and clear systems by peers and clients.',
        q3: 'Saying no to frantic projects, rush hours, and misaligned requests.',
        q4: 'Present, calm, and generous with family and close collaborators.',
      },
      antiVision: 'I refuse to become someone who leaves their best ideas in notes and lets distraction decide their life.',
      vision: 'I am building a life of creative sovereignty, calm energy, and meaningful craftsmanship.',
      buildingVotes: 14,
      allowingVotes: 4,
      updatedAt: now,
    },
    futureSelf: {
      title: 'The Finisher',
      coreValues: ['Craftsmanship', 'Calm Autonomy', 'Relentless Focus', 'Honesty'],
      dailyStandards: ['First 90 minutes dedicated to high leverage work', 'No digital noise at meals', 'Daily physical movement'],
      habits: ['Daily One Decision', 'Evening workspace reset', 'Weekly retrospective'],
      skills: ['System Design', 'Writing & Clarity', 'Deep Work Endurance'],
      boundaries: ['No morning meetings before 11:00 AM', 'Strict bedtime at 10:30 PM'],
      noLongerDoes: ['Endless bookmarking without execution', 'Checking email first thing in bed'],
      identityStatement: 'I am someone who finishes important work, protects my attention, and acts before I feel ready.',
      oldSelfBehaviors: ['Starting 5 projects and finishing zero', 'Postponing tough outreach'],
      oldSelfExcuses: ['"I need more research first"', '"I will start next Monday"'],
      oldSelfPatterns: ['Cleaning the desk when hard thinking is required'],
      oldSelfLabels: ['The perfectionist procrastinator'],
      updatedAt: now,
    },
    goals: SEED_INITIAL_GOALS,
    missions: SEED_INITIAL_MISSIONS,
    completions: [],
    transactions: [initialTransaction],
    customMarketItems: [],
    purchases: [],
    realityBridges: [],
    budget: DEFAULT_BUDGET,
    seasonProgress: [
      {
        seasonId: 'season-finish',
        completedMissionIds: [],
        isCompleted: false,
      },
    ],
    subscription: {
      userId: 'demo-user',
      plan: 'free',
      status: 'active',
      cancelAtPeriodEnd: false,
      updatedAt: now,
    },
    inVisionItemIds: ['seed-morning-ritual', 'seed-work-machine'],
    archivedMarketItemIds: [],
    archivedMarketRecords: [],
    dreamJournal: [
      {
        id: 'journal-seed-1',
        userId: 'demo-user',
        title: 'Morning Focus & Sanctuary Awakening',
        content: 'Woke up at 6:00 AM without hitting snooze. Sat in quiet stillness with black coffee before looking at any screens. Visualized walking into the morning light of the waterfront villa—felt the standard of the day elevate immediately.',
        dreamId: 'seed-lake-como-villa',
        dreamName: 'Lake Como Waterfront Modernist Villa',
        mood: 'focused',
        photoDataUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'journal-seed-2',
        userId: 'demo-user',
        title: 'Locked In: 90-Minute Pure Deep Work Sprint',
        content: 'Finished the core architecture milestone ahead of schedule. When the urge to open social media hit at minute 40, I remembered my Future Self identity. Refused to yield.',
        dreamId: 'seed-work-machine',
        dreamName: 'Bespoke Executive Studio & Work Machine',
        mood: 'triumphant',
        photoDataUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
    microHabits: SEED_MICRO_HABITS,
    customHabitCategories: SEED_CUSTOM_CATEGORIES,
    checkIns: SEED_CHECK_INS,
    dailyPrimaryGoals: SEED_DAILY_PRIMARY_GOALS,
    lastActiveDateKey: now.slice(0, 10),
    lastDailyResetTimestamp: now,
    offlineQueue: [],
  };
}

export class LocalDemoRepository implements DataRepository {
  readonly mode = 'demo' as const;

  async load(): Promise<UserData> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsed: UserData = JSON.parse(stored);
        // Ensure transactions and collections exist
        if (!parsed.transactions) parsed.transactions = [];
        if (!parsed.missions) parsed.missions = [];
        if (!parsed.goals || parsed.goals.length === 0) parsed.goals = SEED_INITIAL_GOALS;
        if (!parsed.purchases) parsed.purchases = [];
        if (!parsed.realityBridges) parsed.realityBridges = [];
        if (!parsed.customMarketItems) parsed.customMarketItems = [];
        if (!parsed.inVisionItemIds) parsed.inVisionItemIds = [];
        if (!parsed.archivedMarketItemIds) parsed.archivedMarketItemIds = [];
        if (!parsed.archivedMarketRecords) parsed.archivedMarketRecords = [];
        if (!parsed.dreamJournal) parsed.dreamJournal = [];
        if (!parsed.microHabits || parsed.microHabits.length === 0) {
          parsed.microHabits = SEED_MICRO_HABITS;
        } else {
          // Guard against undefined completedDates
          parsed.microHabits = parsed.microHabits.map((h) => ({
            ...h,
            completedDates: Array.isArray(h.completedDates) ? h.completedDates : [],
          }));
          // If every habit has zero completions, populate with seed completions for demo richness
          const totalCompletions = parsed.microHabits.reduce((acc, h) => acc + h.completedDates.length, 0);
          if (totalCompletions === 0) {
            parsed.microHabits = SEED_MICRO_HABITS;
          }
        }
        if (!parsed.checkIns || parsed.checkIns.length === 0) parsed.checkIns = SEED_CHECK_INS;
        if (!parsed.customHabitCategories || parsed.customHabitCategories.length === 0) {
          parsed.customHabitCategories = SEED_CUSTOM_CATEGORIES;
        }
        if (!parsed.dailyPrimaryGoals || parsed.dailyPrimaryGoals.length === 0) {
          parsed.dailyPrimaryGoals = SEED_DAILY_PRIMARY_GOALS;
        }

        // Check upon application load if dateKey has changed since last app usage
        // Automatically resets uncompleted daily micro-habits and recalculates broken streaks
        const rollover = checkAndApplyDailyMicroHabitRollover(parsed);
        if (rollover.hasChanged || !parsed.lastActiveDateKey) {
          parsed = rollover.updatedData;
          await this.save(parsed);
        }

        return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using seed demo state', e);
    }
    const initial = getInitialDemoState();
    await this.save(initial);
    return initial;
  }

  async save(data: UserData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    // Optional cloud backup (no-op unless signed in)
    cloudSync.schedulePush(data);
  }

  /** Replaces the whole local dataset (used by Restore from backup and cloud pull). */
  async replaceAll(data: UserData): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY);
  }

  async completeMission(params: {
    missionId: string;
    method: 'self' | 'timer' | 'photo';
    focusMinutes?: number;
    note?: string;
    reflection?: { completedSummary: string; resistanceNoticed: string; nextStep: string };
  }): Promise<{ data: UserData; rewardAmount: number; message: string }> {
    const data = await this.load();
    const mission = data.missions.find((m) => m.id === params.missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayTransactions = data.transactions.filter((t) => t.dayKey === todayStr);
    const todayPaidQuestsCount = data.completions.filter(
      (c) => c.completedAt.slice(0, 10) === todayStr && c.rewardAmount > 0
    ).length;

    const lastCompletion = data.completions
      .filter((c) => c.missionId === params.missionId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];

    const evalResult = evaluateMissionReward({
      mission,
      todayTransactions,
      todayPaidQuestsCount,
      lastMissionCompletionTime: lastCompletion?.completedAt,
    });

    const now = new Date().toISOString();

    // Mark mission as completed
    mission.status = 'completed';
    mission.completedAt = now;
    mission.focusMinutesSpent = (mission.focusMinutesSpent || 0) + (params.focusMinutes || 0);
    if (params.note) mission.note = params.note;
    if (params.reflection) mission.reflection = params.reflection;

    // Record completion
    data.completions.unshift({
      id: `comp-${Date.now()}`,
      missionId: mission.id,
      userId: data.profile.id,
      completedAt: now,
      method: params.method,
      focusMinutes: params.focusMinutes,
      note: params.note,
      reflection: params.reflection,
      rewardAmount: evalResult.rewardAmount,
      streakBonus: 0,
    });

    // Record transaction in ledger if reward > 0
    if (evalResult.rewardAmount > 0) {
      data.transactions.unshift({
        id: `tx-${Date.now()}`,
        walletId: 'wallet-demo',
        userId: data.profile.id,
        kind: mission.isOneDecision ? 'one_decision_reward' : 'mission_reward',
        amount: evalResult.rewardAmount,
        dayKey: todayStr,
        refType: 'mission',
        refId: mission.id,
        memo: mission.isOneDecision
          ? `One Decision completed: ${mission.title}`
          : `Mission completed: ${mission.title}`,
        createdAt: now,
      });
    }

    // Update Two Futures Trajectory Vote
    data.twoFutures.buildingVotes = (data.twoFutures.buildingVotes || 0) + 1;

    await this.save(data);

    let message = `Mission completed!`;
    if (evalResult.rewardAmount > 0) {
      message += ` Earned D$${evalResult.rewardAmount.toLocaleString()}.`;
    }
    if (evalResult.reason) {
      message += ` (${evalResult.reason})`;
    }

    return { data, rewardAmount: evalResult.rewardAmount, message };
  }

  async purchaseItem(itemId: string): Promise<{ data: UserData; purchase: Purchase; message: string }> {
    const data = await this.load();
    const allItems = [...SEED_MARKET_ITEMS, ...data.customMarketItems];
    const item = allItems.find((i) => i.id === itemId);

    if (!item) {
      throw new Error('Item not found in Dream Market');
    }

    // Check if already purchased
    const alreadyOwned = data.purchases.some((p) => p.itemId === itemId);
    if (alreadyOwned) {
      throw new Error('You already own this dream in My Future Life');
    }

    const currentBalance = computeLedgerBalance(data.transactions);
    if (currentBalance < item.dreamDollarPrice) {
      throw new Error(
        `Insufficient Dream Dollars. You have D$${currentBalance.toLocaleString()}, but this requires D$${item.dreamDollarPrice.toLocaleString()}`
      );
    }

    const now = new Date().toISOString();
    const todayStr = now.slice(0, 10);

    // Atomic negative ledger insertion
    data.transactions.unshift({
      id: `tx-purchase-${Date.now()}`,
      walletId: 'wallet-demo',
      userId: data.profile.id,
      kind: 'purchase',
      amount: -item.dreamDollarPrice,
      dayKey: todayStr,
      refType: 'purchase',
      refId: item.id,
      memo: `Purchased dream: ${item.name}`,
      createdAt: now,
    });

    const newPurchase: Purchase = {
      id: `purch-${Date.now()}`,
      userId: data.profile.id,
      itemId: item.id,
      dreamDollarPaid: item.dreamDollarPrice,
      itemSnapshot: item,
      purchasedAt: now,
    };

    data.purchases.unshift(newPurchase);

    await this.save(data);

    return {
      data,
      purchase: newPurchase,
      message: `Successfully purchased ${item.name}! Added to My Future Life.`,
    };
  }

  async createRealityBridge(
    bridgeData: Omit<RealityBridge, 'id' | 'createdAt' | 'updatedAt' | 'savingsLogs'>
  ): Promise<{ data: UserData; bridge: RealityBridge }> {
    const data = await this.load();
    const now = new Date().toISOString();

    // Generate real actionable mission if requested
    let generatedMissionId: string | undefined;
    if (bridgeData.firstRealAction) {
      const newMission: Mission = {
        id: `mission-bridge-${Date.now()}`,
        userId: data.profile.id,
        purchaseId: bridgeData.purchaseId,
        title: bridgeData.firstRealAction,
        type: 'weekly_mission',
        area: 'Money',
        difficulty: 'medium',
        estimatedMinutes: 60,
        isOneDecision: false,
        status: 'active',
        createdAt: now,
      };
      data.missions.unshift(newMission);
      generatedMissionId = newMission.id;
    }

    const realProgressPct =
      bridgeData.realCostUsd > 0
        ? Math.min(100, Math.round((bridgeData.currentSavingsUsd / bridgeData.realCostUsd) * 100))
        : 0;

    const newBridge: RealityBridge = {
      id: `bridge-${Date.now()}`,
      ...bridgeData,
      generatedMissionId,
      realProgressPct,
      savingsLogs: [
        {
          id: `log-${Date.now()}`,
          date: now.slice(0, 10),
          amountUsd: bridgeData.currentSavingsUsd,
          note: 'Initial Reality Bridge baseline',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    data.realityBridges.unshift(newBridge);
    await this.save(data);

    return { data, bridge: newBridge };
  }

  async updateRealityBridgeSavings(
    bridgeId: string,
    addedAmount: number,
    note?: string
  ): Promise<{ data: UserData; bridge: RealityBridge }> {
    const data = await this.load();
    const bridge = data.realityBridges.find((b) => b.id === bridgeId);
    if (!bridge) {
      throw new Error('Reality Bridge not found');
    }

    const now = new Date().toISOString();
    bridge.currentSavingsUsd += addedAmount;
    bridge.realProgressPct = Math.min(
      100,
      Math.round((bridge.currentSavingsUsd / bridge.realCostUsd) * 100)
    );
    bridge.savingsLogs.unshift({
      id: `log-${Date.now()}`,
      date: now.slice(0, 10),
      amountUsd: addedAmount,
      note: note || 'Savings progress update',
    });
    bridge.updatedAt = now;

    await this.save(data);
    return { data, bridge };
  }
}

/**
 * Creates the appropriate repository based on environment configuration.
 */
export function createRepository(): DataRepository {
  // Can expand to SupabaseRepository if configured in env, with seamless LocalDemoRepository fallback
  return new LocalDemoRepository();
}
