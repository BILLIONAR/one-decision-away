/**
 * One Decision Away — Data Repository Interface & Factory
 * Implements clean repository pattern for seamless local demo vs. production Supabase backend.
 */

import { UserData, WalletTransaction, Mission, Purchase, RealityBridge, LifeScoreRecord, Goal } from '../types/models';
import { SEED_INITIAL_GOALS, SEED_INITIAL_MISSIONS, DEFAULT_BUDGET, SEED_MARKET_ITEMS, SEED_SEASONS, SEED_MICRO_HABITS, SEED_CUSTOM_CATEGORIES } from '../data/seed';
import { computeLedgerBalance, evaluateMissionReward, ECONOMY_CONSTANTS } from './economy';
import { checkAndApplyDailyMicroHabitRollover, getCurrentDateKey } from './microHabitsService';
import { cloudSync } from './cloudSync';
import { getLocale, N_, t } from '../i18n';
import { firstRunCopy } from '../i18n/firstRun';
import { applyNotebookAction, normalizeNotebook, preserveNotebookWrites } from './notebook';
import type { NotebookAction, NotebookUpdateResult } from './notebook';
import { EMPTY_PROGRESS, normalizeCourseProgress, readCourseProgress, notifyCourseProgressChanged } from './courseProgress';
import { prepareBackupRestore } from './backup';
import { APP_DATA_STORAGE_KEY, COURSE_PROGRESS_STORAGE_KEY } from './storageKeys';
import { afterDataWriteCommit, DataWriteCancelledError, queueDataWrite, validateDataWriteCommit } from './dataWrites';
import { DataSaveConflictError, mergeDataSnapshot, newReplacementEpoch, publishDataSnapshot, REPLACEMENT_EPOCH_KEY, trackDataSnapshot } from './dataSnapshots';
import { resetCourseProgressSession } from './courseProgressDraft';
import { clearNotebookDrafts } from './notebookDrafts';
import { createRecordId } from '../utils/recordId';

export interface DataRepository {
  readonly mode: 'demo' | 'server';
  load(): Promise<UserData>;
  save(data: UserData): Promise<void>;
  replaceAll(data: UserData, canReplace?: (originalRaw?: string | null) => boolean): Promise<boolean>;
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

const STORAGE_KEY = APP_DATA_STORAGE_KEY;

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
      theme: 'system',
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
    courseProgress: normalizeCourseProgress(EMPTY_PROGRESS),
    microHabits: getFreshMicroHabits(),
    customHabitCategories: SEED_CUSTOM_CATEGORIES,
    checkIns: [],
    dailyPrimaryGoals: [],
    lastActiveDateKey: getCurrentDateKey(new Date(now)),
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
    const cloudScopeIsCurrent = cloudSync.currentAccountGuard();
    return queueDataWrite(() => this.loadCurrent(cloudScopeIsCurrent));
  }

  /** Reads/migrations share the same authority as writers, without nesting the queue. */
  private async loadCurrent(cloudScopeIsCurrent: () => boolean): Promise<UserData> {
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
        parsed.courseProgress = Object.prototype.hasOwnProperty.call(parsed, 'courseProgress')
          ? normalizeCourseProgress(parsed.courseProgress) : readCourseProgress();
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

        // Preserve the immutable read baseline through ordinary UI object spreads.
        trackDataSnapshot(parsed, stored);

        // Check upon application load if dateKey has changed since last app usage
        // Automatically resets uncompleted daily micro-habits and recalculates broken streaks
        const rollover = checkAndApplyDailyMicroHabitRollover(parsed);
        if (rollover.hasChanged || !parsed.lastActiveDateKey) {
          parsed = rollover.updatedData;
          this.saveCurrent(parsed, cloudScopeIsCurrent);
        }

        return parsed;
      }
    } catch (e) {
      // Do not overwrite unreadable or unwritable existing records with demo data.
      throw new Error(t('Could not read saved data. Your existing records were not replaced.'), { cause: e });
    }
    const initial = getInitialDemoState();
    Object.defineProperty(initial, REPLACEMENT_EPOCH_KEY, {
      configurable: true, enumerable: true, writable: true, value: newReplacementEpoch(),
    });
    this.saveCurrent(initial, cloudScopeIsCurrent);
    return initial;
  }

  async save(data: UserData): Promise<void> {
    const cloudScopeIsCurrent = cloudSync.currentAccountGuard();
    await queueDataWrite(async () => { this.saveCurrent(data, cloudScopeIsCurrent); });
  }

  /** Synchronous commit, called only while holding the shared data-write lock. */
  private saveCurrent(data: UserData, cloudScopeIsCurrent: () => boolean): void {
    let saved: UserData;
    let committed: string;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? JSON.parse(raw) as UserData : null;
      if (stored && !stored.transactions) stored.transactions = [];
      // Legacy records can have no notebook; preservation then returns the
      // caller itself. Normalize a copy so failed authority commits cannot
      // publish protected fields into an unsaved caller.
      saved = { ...preserveNotebookWrites(mergeDataSnapshot(data, stored, raw), stored) };
      saved.notebook = normalizeNotebook(saved.notebook);
      // A course can be saved after this caller loaded its personal-data snapshot.
      // Prefer the freshly read course work so another feature cannot roll it back.
      saved.courseProgress = stored && Object.prototype.hasOwnProperty.call(stored, 'courseProgress')
        ? normalizeCourseProgress(stored.courseProgress)
        : normalizeCourseProgress(data.courseProgress ?? readCourseProgress());
      committed = JSON.stringify(saved);
      localStorage.setItem(STORAGE_KEY, committed);
    } catch (e) {
      if (e instanceof DataSaveConflictError) throw e;
      throw new Error(t('Your changes could not be saved. Free some device storage and try again.'), { cause: e });
    }
    afterDataWriteCommit(() => {
      // Existing callers publish this object to React after saving; include protected newer data.
      publishDataSnapshot(data, saved, committed);
      // Optional cloud backup (no-op unless signed in).
      if (cloudScopeIsCurrent()) cloudSync.schedulePush(saved);
    });
  }

  /** Replaces the whole local dataset (used by Restore from backup and cloud pull). */
  async replaceAll(data: UserData, canReplace?: (originalRaw?: string | null) => boolean): Promise<boolean> {
    try { return await queueDataWrite(() => {
      // Optional cloud restore identity must be checked after acquiring the lock,
      // before validation or any write. It can expire while queued or under review.
      const originalRaw = localStorage.getItem(STORAGE_KEY);
      if (canReplace && !canReplace(originalRaw)) return false;
      if (canReplace) validateDataWriteCommit(() => canReplace(originalRaw));
      const restored = prepareBackupRestore(data);
      Object.defineProperty(restored, REPLACEMENT_EPOCH_KEY, {
        configurable: true, enumerable: true, writable: true, value: newReplacementEpoch(),
      });
      // Course work is part of the same JSON document: validation and quota
      // failures leave every previous record intact, with no partial side-store writes.
      const committed = JSON.stringify(restored);
      localStorage.setItem(STORAGE_KEY, committed);
      afterDataWriteCommit(() => {
        publishDataSnapshot(data, restored, committed);
        resetCourseProgressSession();
        clearNotebookDrafts();
        notifyCourseProgressChanged();
      });
      return true;
    }); } catch (error) {
      if (error instanceof DataWriteCancelledError) return false;
      throw error;
    }
  }

  async clear(): Promise<void> {
    await queueDataWrite(() => {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COURSE_PROGRESS_STORAGE_KEY);
      afterDataWriteCommit(() => {
        resetCourseProgressSession();
        clearNotebookDrafts();
        notifyCourseProgressChanged();
      });
    });
  }

  /** Re-read at commit time: a previous asynchronous load is never a write baseline. */
  private readCurrent(): UserData {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current: UserData = raw ? JSON.parse(raw) : getInitialDemoState();
    current.notebook = normalizeNotebook(current.notebook);
    current.courseProgress = Object.prototype.hasOwnProperty.call(current, 'courseProgress')
      ? normalizeCourseProgress(current.courseProgress) : readCourseProgress();
    return trackDataSnapshot(current, raw);
  }

  async mutateNotebook(action: NotebookAction): Promise<NotebookUpdateResult> {
    const cloudScopeIsCurrent = cloudSync.currentAccountGuard();
    await this.load(); // Initializes/migrates in its own coherent queue operation.
    return queueDataWrite(async () => {
      const current = this.readCurrent();
      const update = applyNotebookAction(current, action);
      if (update.data !== current) this.saveCurrent(update.data, cloudScopeIsCurrent);
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
    const cloudScopeIsCurrent = cloudSync.currentAccountGuard();
    await this.load();
    return queueDataWrite(async () => {
      const data = this.readCurrent();
      const mission = data.missions.find((m) => m.id === params.missionId);
      if (!mission) {
        throw new Error(t('Mission not found'));
      }

      // A repeated submission of the same daily decision must not add evidence,
      // minutes, or another reward. Ordinary repeatable quests retain their rules.
      if (mission.isOneDecision && mission.status === 'completed') {
        return { data, rewardAmount: 0, message: firstRunCopy(getLocale()).alreadyKept };
      }

      // Ledger limits keep their existing UTC day contract; personal decision
      // scheduling and evidence use the user's local calendar separately.
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
        id: createRecordId('comp'),
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
          id: createRecordId('tx'),
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

      this.saveCurrent(data, cloudScopeIsCurrent);

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
    const cloudScopeIsCurrent = cloudSync.currentAccountGuard();
    await this.load();
    return queueDataWrite(() => {
      const data = this.readCurrent();
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
        id: createRecordId('tx-purchase'),
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
        id: createRecordId('purch'),
      userId: data.profile.id,
      itemId: item.id,
      dreamDollarPaid: item.dreamDollarPrice,
      itemSnapshot: item,
      purchasedAt: now,
    };

    data.purchases.unshift(newPurchase);

    this.saveCurrent(data, cloudScopeIsCurrent);

    return {
      data,
      purchase: newPurchase,
      message: t('Successfully purchased {name}! Added to My Future Life.', { name: item.name }),
    };
    });
  }

  async createRealityBridge(
    bridgeData: Omit<RealityBridge, 'id' | 'createdAt' | 'updatedAt' | 'savingsLogs'>
  ): Promise<{ data: UserData; bridge: RealityBridge }> {
    const cloudScopeIsCurrent = cloudSync.currentAccountGuard();
    await this.load();
    return queueDataWrite(() => {
      const data = this.readCurrent();
      const now = new Date().toISOString();

      // Generate real actionable mission if requested
      let generatedMissionId: string | undefined;
      if (bridgeData.firstRealAction) {
        const newMission: Mission = {
          id: createRecordId('mission-bridge'),
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
        id: createRecordId('bridge'),
        ...bridgeData,
        generatedMissionId,
        realProgressPct,
        savingsLogs: [
          {
            id: createRecordId('log'),
            date: now.slice(0, 10),
            amountUsd: bridgeData.currentSavingsUsd,
            note: t('Initial Reality Bridge baseline'),
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      data.realityBridges.unshift(newBridge);
      this.saveCurrent(data, cloudScopeIsCurrent);

      return { data, bridge: newBridge };
    });
  }

  async updateRealityBridgeSavings(
    bridgeId: string,
    addedAmount: number,
    note?: string
  ): Promise<{ data: UserData; bridge: RealityBridge }> {
    const cloudScopeIsCurrent = cloudSync.currentAccountGuard();
    await this.load();
    return queueDataWrite(() => {
      const data = this.readCurrent();
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
        id: createRecordId('log'),
        date: now.slice(0, 10),
        amountUsd: addedAmount,
        note: note || t('Savings progress update'),
    });
    bridge.updatedAt = now;

    this.saveCurrent(data, cloudScopeIsCurrent);
    return { data, bridge };
    });
  }
}

/**
 * Creates the appropriate repository based on environment configuration.
 */
export function createRepository(): DataRepository {
  // Can expand to SupabaseRepository if configured in env, with seamless LocalDemoRepository fallback
  return new LocalDemoRepository();
}
