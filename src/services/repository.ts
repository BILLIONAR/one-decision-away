/**
 * One Decision Away — Data Repository Interface & Factory
 * Implements clean repository pattern for seamless local demo vs. production Supabase backend.
 */

import { UserData, WalletTransaction, Mission, Purchase, RealityBridge, LifeScoreRecord, Goal } from '../types/models';
import { SEED_INITIAL_GOALS, SEED_INITIAL_MISSIONS, DEFAULT_BUDGET, SEED_MARKET_ITEMS, SEED_SEASONS, SEED_MICRO_HABITS, SEED_CUSTOM_CATEGORIES } from '../data/seed';
import { computeLedgerBalance, evaluateMissionReward, ECONOMY_CONSTANTS } from './economy';
import { checkAndApplyDailyMicroHabitRollover } from './microHabitsService';
import { cloudSync } from './cloudSync';
import { getLocale, N_, t } from '../i18n';
import { applyNotebookAction, normalizeNotebook, preserveNotebookWrites } from './notebook';
import type { NotebookAction, NotebookUpdateResult } from './notebook';

export interface DataRepository {
  readonly mode: 'demo' | 'server';
  load(): Promise<UserData>;
  save(data: UserData): Promise<void>;
  replaceAll(data: UserData): Promise<void>;
  clear(): Promise<void>;
  mutateNotebook(action: NotebookAction): Promise<NotebookUpdateResult>;
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

// Shared by repository instances; Web Locks also serialize notebook writes across tabs.
let dataWriteQueue: Promise<unknown> = Promise.resolve();
function queueDataWrite<T>(operation: () => Promise<T>): Promise<T> {
  const run = () => typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('oda-data-writes', operation)
    : operation();
  const result = dataWriteQueue.then(run, run);
  dataWriteQueue = result.then(() => undefined, () => undefined);
  return result;
}

export function getInitialDemoState(): UserData {
  const now = new Date().toISOString();
  const initialTransaction: WalletTransaction = {
    id: 'tx-welcome-grant',
    walletId: 'wallet-demo',
    userId: 'demo-user',
    kind: 'welcome_grant',
    amount: ECONOMY_CONSTANTS.WELCOME_GRANT,
    dayKey: now.slice(0, 10),
    memo: N_('Welcome grant for beginning your journey'),
    createdAt: now,
  };

  // A new user starts with an empty personal record: no scores, answers,
  // journal entries or check-ins that they did not write themselves.
  // Structural seeds (dreams catalogue, seasons, missions, budget, default
  // habits and categories) stay so the app has something to work with.
  return {
    profile: {
      id: 'demo-user',
      displayName: '',
      onboardingStep: 'welcome',
      locale: getLocale(),
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
    lifeScores: [],
    twoFutures: {
      allowingAnswers: {},
      buildingAnswers: {},
      antiVision: '',
      vision: '',
      buildingVotes: 0,
      allowingVotes: 0,
      updatedAt: now,
    },
    futureSelf: {
      title: '',
      coreValues: [],
      dailyStandards: [],
      habits: [],
      skills: [],
      boundaries: [],
      noLongerDoes: [],
      identityStatement: '',
      oldSelfBehaviors: [],
      oldSelfExcuses: [],
      oldSelfPatterns: [],
      oldSelfLabels: [],
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
    inVisionItemIds: [],
    archivedMarketItemIds: [],
    archivedMarketRecords: [],
    dreamJournal: [],
    notebook: normalizeNotebook(),
    microHabits: getFreshMicroHabits(),
    customHabitCategories: SEED_CUSTOM_CATEGORIES,
    checkIns: [],
    dailyPrimaryGoals: [],
    lastActiveDateKey: now.slice(0, 10),
    lastDailyResetTimestamp: now,
    offlineQueue: [],
  };
}

/** Default habits (max 3) with no completion history — a new user has not done anything yet. */
function getFreshMicroHabits() {
  return SEED_MICRO_HABITS.slice(0, 3).map((h) => ({
    ...h,
    completedDates: [],
    streakCount: 0,
    bestStreak: 0,
  }));
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
        parsed.notebook = normalizeNotebook(parsed.notebook);
        if (!parsed.microHabits) {
          parsed.microHabits = getFreshMicroHabits();
        } else {
          // Guard against undefined completedDates; never invent completion history.
          parsed.microHabits = parsed.microHabits.map((h) => ({
            ...h,
            completedDates: Array.isArray(h.completedDates) ? h.completedDates : [],
          }));
        }
        if (!parsed.lifeScores) parsed.lifeScores = [];
        if (!parsed.checkIns) parsed.checkIns = [];
        if (!parsed.customHabitCategories || parsed.customHabitCategories.length === 0) {
          parsed.customHabitCategories = SEED_CUSTOM_CATEGORIES;
        }
        if (!parsed.dailyPrimaryGoals) parsed.dailyPrimaryGoals = [];
        if (!parsed.profile.onboardingStep) parsed.profile.onboardingStep = 'completed';

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
      // Do not overwrite unreadable or unwritable existing records with demo data.
      throw new Error(t('Could not read saved data. Your existing records were not replaced.'), { cause: e });
    }
    const initial = getInitialDemoState();
    await this.save(initial);
    return initial;
  }

  async save(data: UserData): Promise<void> {
    await queueDataWrite(async () => { this.saveCurrent(data); });
  }

  /** Synchronous commit, called only while holding the shared data-write lock. */
  private saveCurrent(data: UserData): void {
    let saved: UserData;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) as UserData : null;
      saved = preserveNotebookWrites(data, stored);
      saved.notebook = normalizeNotebook(saved.notebook);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {
      throw new Error(t('Your changes could not be saved. Free some device storage and try again.'), { cause: e });
    }
    // Existing callers publish this object to React after saving; include protected newer data.
    Object.assign(data, saved);
    // Optional cloud backup (no-op unless signed in)
    cloudSync.schedulePush(saved);
  }

  /** Replaces the whole local dataset (used by Restore from backup and cloud pull). */
  async replaceAll(data: UserData): Promise<void> {
    await queueDataWrite(async () => {
      const restored = { ...data, notebook: normalizeNotebook(data.notebook) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(restored));
    });
  }

  async clear(): Promise<void> {
    await queueDataWrite(async () => { localStorage.removeItem(STORAGE_KEY); });
  }

  /** Re-read at commit time: a previous asynchronous load is never a write baseline. */
  private readCurrent(): UserData {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current: UserData = raw ? JSON.parse(raw) : getInitialDemoState();
    current.notebook = normalizeNotebook(current.notebook);
    return current;
  }

  async mutateNotebook(action: NotebookAction): Promise<NotebookUpdateResult> {
    await this.load(); // initializes/migrates outside the lock; load may itself save a rollover
    return queueDataWrite(async () => {
      const current = this.readCurrent();
      const update = applyNotebookAction(current, action);
      if (update.data !== current) this.saveCurrent(update.data);
      return update;
    });
  }

  async completeMission(params: {
    missionId: string;
    method: 'self' | 'timer' | 'photo';
    focusMinutes?: number;
    note?: string;
    reflection?: { completedSummary: string; resistanceNoticed: string; nextStep: string };
  }): Promise<{ data: UserData; rewardAmount: number; message: string }> {
    await this.load();
    return queueDataWrite(async () => {
      const data = this.readCurrent();
      const mission = data.missions.find((m) => m.id === params.missionId);
      if (!mission) {
        throw new Error(t('Mission not found'));
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
            ? t('One Decision completed: {title}', { title: mission.title })
            : t('Mission completed: {title}', { title: mission.title }),
          createdAt: now,
        });
      }

      // Update Two Futures Trajectory Vote
      data.twoFutures.buildingVotes = (data.twoFutures.buildingVotes || 0) + 1;

      this.saveCurrent(data);

      let message = t('Mission completed!');
      if (evalResult.rewardAmount > 0) {
        message += ' ' + t('Earned D${amount}.', { amount: evalResult.rewardAmount.toLocaleString() });
      }
      if (evalResult.reason) {
        message += ` (${evalResult.reason})`;
      }

      return { data, rewardAmount: evalResult.rewardAmount, message };
    });
  }

  async purchaseItem(itemId: string): Promise<{ data: UserData; purchase: Purchase; message: string }> {
    const data = await this.load();
    const allItems = [...SEED_MARKET_ITEMS, ...data.customMarketItems];
    const item = allItems.find((i) => i.id === itemId);

    if (!item) {
      throw new Error(t('Item not found in Dream Market'));
    }

    // Check if already purchased
    const alreadyOwned = data.purchases.some((p) => p.itemId === itemId);
    if (alreadyOwned) {
      throw new Error(t('You already own this dream in My Future Life'));
    }

    const currentBalance = computeLedgerBalance(data.transactions);
    if (currentBalance < item.dreamDollarPrice) {
      throw new Error(
        t('Insufficient Dream Dollars. You have D${balance}, but this requires D${price}', { balance: currentBalance.toLocaleString(), price: item.dreamDollarPrice.toLocaleString() })
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
      memo: t('Purchased dream: {name}', { name: item.name }),
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
      message: t('Successfully purchased {name}! Added to My Future Life.', { name: item.name }),
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
          note: t('Initial Reality Bridge baseline'),
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
      throw new Error(t('Reality Bridge not found'));
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
      note: note || t('Savings progress update'),
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
