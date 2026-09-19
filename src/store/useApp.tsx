import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  UserData,
  LifeScoreCategories,
  TwoFuturesData,
  DefaultFutureData,
  DriftLogEntry,
  FutureSelfData,
  Goal,
  Mission,
  MarketItem,
  MarketCategory,
  ArchiveReason,
  ArchivedMarketRecord,
  BudgetAllocations,
  LifeBudgetData,
  Season,
  RealityBridge,
  Profile,
  WalletTransaction,
  DreamJournalEntry,
  ActiveFocusSession,
  FocusSoundTrack,
  MissionType,
  MissionArea,
  MicroHabit,
  MicroHabitCategory,
  CustomHabitCategory,
  DailyCheckIn,
  DailyMicroHabitRolloverSummary,
} from '../types/models';
import { createRepository, DataRepository } from '../services/repository';
import { cloudSync } from '../services/cloudSync';
import { notificationScheduler } from '../services/notificationScheduler';
import { getBaseReward, isExemptFromDailyCap, ECONOMY_CONSTANTS } from '../services/economy';
import {
  checkAndApplyDailyMicroHabitRollover,
  getCurrentDateKey,
  DailyMicroHabitRolloverResult,
  calculateBestMicroHabitStreak,
} from '../services/microHabitsService';
import { triggerMissionConfetti, triggerBigRewardConfetti, triggerGoldConfetti, triggerSmallConfetti } from '../utils/confetti';
import { SEED_MARKET_ITEMS } from '../data/seed';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { voiceGuide } from '../utils/voiceGuide';
import { getGuidedMeditation } from '../data/guidedMeditations';
import { t, getLocale, setLocale, isLocale, hasStoredLocale, ensureLocaleLoaded } from '../i18n';

interface AppContextType {
  data: UserData | null;
  isLoading: boolean;
  error: string | null;
  activeRoute: string;
  toast: { message: string; type?: 'success' | 'info' | 'error' } | null;
  activeFocusSession: ActiveFocusSession | null;
  isFocusLocked: boolean;
  setActiveRoute: (route: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  hideToast: () => void;
  refreshData: () => Promise<void>;
  startFocusSession: (params: {
    missionId?: string;
    missionTitle?: string;
    missionType?: MissionType;
    missionArea?: MissionArea;
    durationMinutes: number;
    soundTrack?: FocusSoundTrack;
    volume?: number;
    guidedMeditationId?: string;
  }) => void;
  /** Index of the guided-meditation cue currently being spoken/shown (-1 before the first cue) */
  activeGuidedCueIndex: number;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  setFocusSoundTrack: (track: FocusSoundTrack) => void;
  setFocusVolume: (volume: number) => void;
  addDistractionNote: (note: string) => void;
  cancelFocusSession: () => void;
  finishFocusSessionEarly: () => void;
  completeFocusSession: (reflection?: { completedSummary: string; resistanceNoticed: string; nextStep: string }) => Promise<void>;
  completeMission: (params: {
    missionId: string;
    method: 'self' | 'timer' | 'photo';
    focusMinutes?: number;
    note?: string;
    reflection?: { completedSummary: string; resistanceNoticed: string; nextStep: string };
  }) => Promise<void>;
  purchaseItem: (itemId: string) => Promise<void>;
  createRealityBridge: (bridgeData: Omit<RealityBridge, 'id' | 'createdAt' | 'updatedAt' | 'savingsLogs'>) => Promise<void>;
  updateRealityBridgeSavings: (bridgeId: string, amount: number, note?: string) => Promise<void>;
  saveLifeScores: (scores: LifeScoreCategories) => Promise<void>;
  saveTwoFutures: (twoFuturesData: Partial<TwoFuturesData>) => Promise<void>;
  saveDefaultFuture: (defaultFuture: Partial<DefaultFutureData>) => Promise<void>;
  /** Record a drift signal for today (counts as one quiet vote for the default future). */
  logDriftSignal: (signal: string) => Promise<void>;
  removeDriftEntry: (entryId: string) => Promise<void>;
  saveFutureSelf: (futureSelfData: Partial<FutureSelfData>) => Promise<void>;
  addMission: (mission: Omit<Mission, 'id' | 'createdAt' | 'status' | 'userId'>) => Promise<void>;
  setOneDecision: (title: string, goalId?: string, estimatedMinutes?: number) => Promise<void>;
  addCustomDream: (
    item: Omit<MarketItem, 'id' | 'createdAt' | 'isCustom'>,
    pinToVision?: boolean
  ) => Promise<MarketItem | undefined>;
  pinExploreDream: (
    exploreItem: {
      id: string;
      name: string;
      category: MarketCategory;
      realPriceUsd: number;
      dreamDollarPrice: number;
      description: string;
      imageUrl: string;
      whyWanted?: string;
      firstRealStep?: string;
    },
    pin?: boolean
  ) => Promise<MarketItem | undefined>;
  grantSimulationBonus: (amount?: number, memo?: string) => Promise<void>;
  toggleInVision: (itemId: string) => Promise<void>;
  reorderVisionItems: (orderedItemIds: string[]) => Promise<void>;
  archiveMarketItem: (itemId: string, reason?: ArchiveReason, note?: string) => Promise<void>;
  restoreMarketItem: (itemId: string, andPinToVision?: boolean) => Promise<void>;
  deleteArchivedRecord: (recordId: string) => Promise<void>;
  updateBudget: (budget: BudgetAllocations) => Promise<void>;
  saveLifeBudget: (lifeBudget: LifeBudgetData) => Promise<void>;
  addDreamJournalEntry: (entry: Omit<DreamJournalEntry, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  deleteDreamJournalEntry: (entryId: string) => Promise<void>;
  isQuickJournalOpen: boolean;
  openQuickJournal: () => void;
  closeQuickJournal: () => void;
  toggleQuickJournal: () => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'userId'>) => Promise<Goal | undefined>;
  updateGoal: (goalId: string, updates: Partial<Omit<Goal, 'id' | 'userId'>>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  toggleMicroHabit: (habitId: string) => Promise<void>;
  addMicroHabit: (params: {
    title: string;
    category: MicroHabitCategory;
    customCategoryId?: string;
    goalId?: string;
    durationMinutes?: number;
    description?: string;
  }) => Promise<void>;
  updateMicroHabit: (
    habitId: string,
    updates: Partial<Omit<MicroHabit, 'id' | 'createdAt'>>
  ) => Promise<void>;
  deleteMicroHabit: (habitId: string) => Promise<void>;
  addCustomHabitCategory: (params: {
    name: string;
    icon: string;
    color: string;
    description?: string;
  }) => Promise<CustomHabitCategory | null>;
  deleteCustomHabitCategory: (categoryId: string) => Promise<void>;
  updateCustomHabitCategory: (
    categoryId: string,
    params: { name?: string; icon?: string; color?: string; description?: string }
  ) => Promise<void>;
  resetMicroHabitsToday: () => Promise<void>;
  checkDailyMicroHabitsRollover: (force?: boolean) => Promise<DailyMicroHabitRolloverResult | null>;
  simulateDateKeyChange: (simulatedDateKey?: string) => Promise<void>;
  lastRolloverSummary: DailyMicroHabitRolloverSummary | null;
  saveDailyCheckIn: (checkIn: {
    focus: number;
    energy: number;
    mood: number;
    notes?: string;
    dateKey?: string;
  }) => Promise<void>;
  deleteDailyCheckIn: (checkInId: string) => Promise<void>;
  joinSeason: (season: Season) => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  toggleSoundMute: () => Promise<void>;
  setSoundMuted: (muted: boolean) => Promise<void>;
  toggleFocusTabBlink: () => Promise<void>;
  toggleFocusScreenPulse: () => Promise<void>;
  simulateFocusTimerAlert: () => void;
  isSimulatingFocusAlert: boolean;
  upgradeToPro: () => Promise<void>;
  toggleProPlan: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resetToDemo: () => Promise<void>;
  resetAllData: () => Promise<void>;
  exportDataJson: () => void;
  importDataJson: (file: File) => Promise<void>;
  /** Pull newest data from cloud (if signed in) and reload */
  syncFromCloud: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | null>(null);

const repository: DataRepository = createRepository();

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRoute, setActiveRouteState] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null);
  const [activeFocusSession, setActiveFocusSession] = useState<ActiveFocusSession | null>(null);
  const [activeGuidedCueIndex, setActiveGuidedCueIndex] = useState<number>(-1);
  const [isQuickJournalOpen, setIsQuickJournalOpen] = useState<boolean>(false);
  const [isSimulatingFocusAlert, setIsSimulatingFocusAlert] = useState<boolean>(false);
  const [lastRolloverSummary, setLastRolloverSummary] = useState<DailyMicroHabitRolloverSummary | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const openQuickJournal = useCallback(() => {
    setIsQuickJournalOpen(true);
    soundSynthesizer.playTapChime();
  }, []);

  const closeQuickJournal = useCallback(() => {
    setIsQuickJournalOpen(false);
  }, []);

  const toggleQuickJournal = useCallback(() => {
    setIsQuickJournalOpen((prev) => {
      const next = !prev;
      if (next) soundSynthesizer.playTapChime();
      return next;
    });
  }, []);

  // Global Keyboard Shortcut: Cmd + K or Ctrl + K for Quick Dream Journal
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        e.stopPropagation();
        setIsQuickJournalOpen((prev) => {
          const next = !prev;
          if (next) soundSynthesizer.playTapChime();
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, []);

  // Focus Timer countdown interval
  useEffect(() => {
    if (!activeFocusSession || activeFocusSession.isPaused) return;

    const interval = setInterval(() => {
      setActiveFocusSession((prev) => {
        if (!prev || prev.isPaused) return prev;
        if (prev.remainingSeconds <= 1) {
          // Completed countdown
          soundSynthesizer.stopAmbient();
          voiceGuide.stop();
          soundSynthesizer.playFocusCompleteChime();
          return {
            ...prev,
            remainingSeconds: 0,
            isPaused: true,
          };
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeFocusSession?.isPaused]);

  // Guided meditation voice cues — fire each cue once when elapsed time crosses its timestamp
  useEffect(() => {
    if (!activeFocusSession?.guidedMeditationId) {
      if (activeGuidedCueIndex !== -1) setActiveGuidedCueIndex(-1);
      return;
    }
    if (activeFocusSession.isPaused) return;
    const meditation = getGuidedMeditation(activeFocusSession.guidedMeditationId);
    if (!meditation) return;
    const elapsed = activeFocusSession.totalSeconds - activeFocusSession.remainingSeconds;
    let dueIndex = -1;
    for (let i = 0; i < meditation.cues.length; i++) {
      if (meditation.cues[i].atSeconds <= elapsed) dueIndex = i;
      else break;
    }
    if (dueIndex !== activeGuidedCueIndex) {
      setActiveGuidedCueIndex(dueIndex);
      if (dueIndex >= 0) voiceGuide.speak(t(meditation.cues[dueIndex].text));
      // Keep the next two cues warm so natural-voice playback starts on time
      voiceGuide.prefetch(meditation.cues.slice(dueIndex + 1, dueIndex + 3).map((c) => t(c.text)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFocusSession?.remainingSeconds, activeFocusSession?.isPaused, activeFocusSession?.guidedMeditationId]);

  // Daily nudges: (re)configure the local notification scheduler whenever prefs change
  useEffect(() => {
    if (!data) return;
    notificationScheduler.configure({
      enabled: data.profile.nudgesEnabled === true,
      times: {
        morning: data.profile.nudgeTimes?.morning || '08:00',
        midday: data.profile.nudgeTimes?.midday || '13:30',
        evening: data.profile.nudgeTimes?.evening || '20:30',
      },
    });
  }, [data?.profile.nudgesEnabled, data?.profile.nudgeTimes?.morning, data?.profile.nudgeTimes?.midday, data?.profile.nudgeTimes?.evening]);

  // Tab Title synchronization during Focus Mode & Alert Simulation
  useEffect(() => {
    // If user is previewing / testing timer 0 alert in settings
    if (isSimulatingFocusAlert) {
      let toggle = false;
      const titleA = t('✨ [Finished!] Focus Session Simulation — Claim Reward');
      const titleB = t("🔔 TIME'S UP! [00:00] — Return to Claim D$");
      document.title = titleA;
      const simTimer = setInterval(() => {
        toggle = !toggle;
        document.title = toggle ? titleB : titleA;
      }, 850);
      return () => {
        clearInterval(simTimer);
        document.title = t('One Decision Away — Life OS & Future Self');
      };
    }

    if (!activeFocusSession) {
      document.title = t('One Decision Away — Life OS & Future Self');
      return;
    }

    const tabBlinkEnabled = data?.profile?.focusTabBlinkEnabled !== false;
    const mins = Math.floor(activeFocusSession.remainingSeconds / 60);
    const secs = activeFocusSession.remainingSeconds % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (activeFocusSession.remainingSeconds === 0) {
      if (!tabBlinkEnabled) {
        document.title = t('✨ [Finished!] {title} — One Decision Away', { title: activeFocusSession.missionTitle });
        return;
      }

      // Visual Blinking Animation across browser tab title bar
      let toggle = false;
      const titleA = t('✨ [Finished!] {title} — Claim Reward', { title: activeFocusSession.missionTitle });
      const titleB = t("🔔 TIME'S UP! [00:00] — Return to Claim D$");
      document.title = titleA;
      const blinkTimer = setInterval(() => {
        toggle = !toggle;
        document.title = toggle ? titleB : titleA;
      }, 850);

      return () => {
        clearInterval(blinkTimer);
      };
    } else if (activeFocusSession.isPaused) {
      document.title = t('⏸️ [Paused {time}] {title} — One Decision Away', { time: timeStr, title: activeFocusSession.missionTitle });
    } else {
      document.title = t('⏱️ [{time}] {title} — One Decision Away', { time: timeStr, title: activeFocusSession.missionTitle });
    }
  }, [
    isSimulatingFocusAlert,
    activeFocusSession?.remainingSeconds,
    activeFocusSession?.isPaused,
    activeFocusSession?.missionTitle,
    data?.profile?.focusTabBlinkEnabled,
  ]);

  const startFocusSession = useCallback(
    (params: {
      missionId?: string;
      missionTitle?: string;
      missionType?: MissionType;
      missionArea?: MissionArea;
      durationMinutes: number;
      soundTrack?: FocusSoundTrack;
      volume?: number;
      guidedMeditationId?: string;
    }) => {
      const duration = Math.max(1, params.durationMinutes);
      const totalSecs = duration * 60;
      const soundTrack: FocusSoundTrack = params.soundTrack || 'binaural';
      // Guided sessions keep the ambience quieter so the voice sits on top
      const volume = params.volume ?? (params.guidedMeditationId ? 0.35 : 0.5);

      const newSession: ActiveFocusSession = {
        id: `focus-${Date.now()}`,
        missionId: params.missionId,
        missionTitle: params.missionTitle || t('Deep Work Sprint'),
        missionType: params.missionType,
        missionArea: params.missionArea,
        durationMinutes: duration,
        remainingSeconds: totalSecs,
        totalSeconds: totalSecs,
        isPaused: false,
        soundTrack,
        volume,
        startedAt: new Date().toISOString(),
        distractionNotes: [],
        guidedMeditationId: params.guidedMeditationId,
      };

      voiceGuide.stop();
      setActiveGuidedCueIndex(-1);
      if (params.guidedMeditationId) {
        const med = getGuidedMeditation(params.guidedMeditationId);
        if (med) voiceGuide.prefetch(med.cues.slice(0, 3).map((c) => t(c.text)));
      }
      setActiveFocusSession(newSession);
      soundSynthesizer.setVolume(volume);
      soundSynthesizer.playFocusStartGong();
      if (soundTrack !== 'silence') {
        soundSynthesizer.playAmbient(soundTrack);
      }
      showToast(
        params.guidedMeditationId
          ? t('Guided meditation started: {title} ({minutes}m)', { title: newSession.missionTitle, minutes: duration })
          : t('Locked into Deep Work: {title} ({minutes}m)', { title: newSession.missionTitle, minutes: duration }),
        'info'
      );
    },
    [showToast]
  );

  const pauseFocusSession = useCallback(() => {
    setActiveFocusSession((prev) => {
      if (!prev) return null;
      soundSynthesizer.stopAmbient();
      voiceGuide.pause();
      return { ...prev, isPaused: true };
    });
  }, []);

  const resumeFocusSession = useCallback(() => {
    setActiveFocusSession((prev) => {
      if (!prev) return null;
      if (prev.soundTrack !== 'silence') {
        soundSynthesizer.playAmbient(prev.soundTrack);
      }
      voiceGuide.resume();
      return { ...prev, isPaused: false };
    });
  }, []);

  const setFocusSoundTrack = useCallback((track: FocusSoundTrack) => {
    setActiveFocusSession((prev) => {
      if (!prev) return null;
      if (!prev.isPaused) {
        soundSynthesizer.playAmbient(track);
      }
      return { ...prev, soundTrack: track };
    });
  }, []);

  const setFocusVolume = useCallback((vol: number) => {
    soundSynthesizer.setVolume(vol);
    setActiveFocusSession((prev) => (prev ? { ...prev, volume: vol } : null));
  }, []);

  const addDistractionNote = useCallback((note: string) => {
    if (!note.trim()) return;
    setActiveFocusSession((prev) => {
      if (!prev) return null;
      return { ...prev, distractionNotes: [...prev.distractionNotes, note.trim()] };
    });
  }, []);

  const cancelFocusSession = useCallback(() => {
    soundSynthesizer.stopAmbient();
    voiceGuide.stop();
    setActiveFocusSession(null);
    showToast(t('Deep work focus session ended.'), 'info');
  }, [showToast]);

  const finishFocusSessionEarly = useCallback(() => {
    setActiveFocusSession((prev) => {
      if (!prev) return null;
      soundSynthesizer.stopAmbient();
      voiceGuide.stop();
      soundSynthesizer.playFocusCompleteChime();
      return { ...prev, remainingSeconds: 0, isPaused: true };
    });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const setActiveRoute = useCallback((route: string) => {
    setActiveRouteState(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser back/forward
  useEffect(() => {
    const handlePop = () => {
      setActiveRouteState(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      let loaded = await repository.load();
      // Cloud: if signed in and the cloud copy is newer, prefer it
      try {
        await cloudSync.init();
        const remote = await cloudSync.pullIfNewer(loaded);
        if (remote) {
          await repository.replaceAll(remote);
          loaded = await repository.load();
        }
      } catch {
        /* cloud is optional */
      }
      // Language: the explicit device choice (localStorage) wins; otherwise follow the profile.
      // Wait for the dictionary so the first paint is already translated.
      try {
        if (!hasStoredLocale() && isLocale(loaded.profile.locale) && loaded.profile.locale !== getLocale()) {
          setLocale(loaded.profile.locale);
        }
        await ensureLocaleLoaded();
      } catch {
        /* i18n is best-effort */
      }
      setData(loaded);

      if (loaded.lastActiveDateKey) {
        setLastRolloverSummary({
          hasChanged: false,
          currentDateKey: loaded.lastActiveDateKey,
          resetHabitsCount: (loaded.microHabits || []).filter(
            (h) => !h.completedDates.includes(loaded.lastActiveDateKey!)
          ).length,
          brokenStreaksCount: 0,
          timestamp: loaded.lastDailyResetTimestamp || new Date().toISOString(),
        });
      }

      setError(null);
    } catch (e: any) {
      setError(e?.message || t('Failed to load app data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const completeMission = useCallback(
    async (params: {
      missionId: string;
      method: 'self' | 'timer' | 'photo';
      focusMinutes?: number;
      note?: string;
      reflection?: { completedSummary: string; resistanceNoticed: string; nextStep: string };
    }) => {
      try {
        const result = await repository.completeMission(params);
        setData(result.data);
        showToast(result.message, result.rewardAmount > 0 ? 'success' : 'info');

        // Trigger celebratory confetti animation
        if (result.rewardAmount >= 400) {
          triggerBigRewardConfetti();
        } else {
          triggerMissionConfetti();
        }
      } catch (err: any) {
        showToast(err?.message || t('Failed to complete mission'), 'error');
        throw err;
      }
    },
    [showToast]
  );

  const completeFocusSession = useCallback(
    async (reflection?: { completedSummary: string; resistanceNoticed: string; nextStep: string }) => {
      if (!activeFocusSession || !data) return;

      soundSynthesizer.stopAmbient();
      const session = activeFocusSession;
      const actualMinutesSpent =
        Math.max(1, Math.round((session.totalSeconds - session.remainingSeconds) / 60)) || session.durationMinutes;

      if (session.missionId) {
        // Complete linked mission
        await completeMission({
          missionId: session.missionId,
          method: 'timer',
          focusMinutes: actualMinutesSpent,
          note: session.distractionNotes.length > 0 ? t('Parking lot notes: {notes}', { notes: session.distractionNotes.join('; ') }) : undefined,
          reflection: reflection || {
            completedSummary: t('Deep Work Completed: {title}', { title: session.missionTitle }),
            resistanceNoticed:
              session.distractionNotes.length > 0
                ? t('Parked {n} thoughts in distraction lot.', { n: session.distractionNotes.length })
                : t('Protected flow without checking distractions.'),
            nextStep: t('Continue next high-leverage block.'),
          },
        });
      } else {
        // Standalone Focus Session reward
        const rewardRate = Math.min(300, Math.max(60, Math.round(session.durationMinutes * 4)));
        const now = new Date().toISOString();
        const todayStr = now.slice(0, 10);

        const focusTx: WalletTransaction = {
          id: `tx-focus-${Date.now()}`,
          walletId: 'wallet-demo',
          userId: data.profile.id,
          kind: 'focus_reward',
          amount: rewardRate,
          dayKey: todayStr,
          memo: t('Deep Work Session: {title} ({minutes}m)', { title: session.missionTitle, minutes: actualMinutesSpent }),
          createdAt: now,
        };

        const updated: UserData = {
          ...data,
          transactions: [focusTx, ...data.transactions],
          completions: [
            {
              id: `comp-focus-${Date.now()}`,
              missionId: session.id,
              userId: data.profile.id,
              completedAt: now,
              method: 'timer',
              focusMinutes: actualMinutesSpent,
              note: session.distractionNotes.join('; '),
              reflection: reflection || {
                completedSummary: t('Deep Work Sprint: {title}', { title: session.missionTitle }),
                resistanceNoticed:
                  session.distractionNotes.length > 0
                    ? t('Noticed {n} resistance thoughts.', { n: session.distractionNotes.length })
                    : t('Maintained uninterrupted deep focus.'),
                nextStep: t('Hydrate, reflect, and reset.'),
              },
              rewardAmount: rewardRate,
              streakBonus: 0,
            },
            ...data.completions,
          ],
        };

        await repository.save(updated);
        setData(updated);
        showToast(t('Deep Work verified! + D${amount} added to Dream Bank.', { amount: rewardRate.toLocaleString() }), 'success');
        triggerBigRewardConfetti();
      }

      setActiveFocusSession(null);
    },
    [activeFocusSession, data, completeMission, showToast]
  );

  const purchaseItem = useCallback(
    async (itemId: string) => {
      try {
        const result = await repository.purchaseItem(itemId);
        setData(result.data);
        showToast(result.message, 'success');
        triggerGoldConfetti();
      } catch (err: any) {
        showToast(err?.message || t('Purchase failed'), 'error');
        throw err;
      }
    },
    [showToast]
  );

  const createRealityBridge = useCallback(
    async (bridgeData: Omit<RealityBridge, 'id' | 'createdAt' | 'updatedAt' | 'savingsLogs'>) => {
      try {
        const result = await repository.createRealityBridge(bridgeData);
        setData(result.data);
        showToast(t('Reality Bridge established with real action plan!'), 'success');
      } catch (err: any) {
        showToast(err?.message || t('Failed to create bridge'), 'error');
        throw err;
      }
    },
    [showToast]
  );

  const updateRealityBridgeSavings = useCallback(
    async (bridgeId: string, amount: number, note?: string) => {
      try {
        const result = await repository.updateRealityBridgeSavings(bridgeId, amount, note);
        setData(result.data);
        showToast(t('Logged ${amount} in real savings progress.', { amount: amount.toLocaleString() }), 'success');
      } catch (err: any) {
        showToast(err?.message || t('Failed to update savings'), 'error');
        throw err;
      }
    },
    [showToast]
  );

  const saveLifeScores = useCallback(
    async (scores: LifeScoreCategories) => {
      if (!data) return;
      const values = Object.values(scores);
      const totalScore = Math.round((values.reduce((a, b) => a + b, 0) / (values.length * 10)) * 100);

      const areaLabels: Record<keyof LifeScoreCategories, string> = {
        money: t('Money'),
        workAndPurpose: t('Work & Purpose'),
        health: t('Health'),
        relationships: t('Relationships'),
        discipline: t('Discipline'),
        environment: t('Environment'),
        learning: t('Learning'),
        personalMeaning: t('Personal Meaning'),
      };

      const sorted = (Object.keys(scores) as (keyof LifeScoreCategories)[]).sort(
        (a, b) => scores[a] - scores[b]
      );
      const lowestAreas = [areaLabels[sorted[0]], areaLabels[sorted[1]]];

      let interpretation = '';
      if (totalScore >= 75) {
        interpretation =
          t('Your current actions are largely supporting the future you want. The work now is protecting what works.');
      } else if (totalScore >= 50) {
        interpretation =
          t('Some areas are carrying you; others are quietly asking for attention. A single daily decision can shift the balance.');
      } else {
        interpretation = t('Your Future Life Score is {score}/100. Your current actions are not yet supporting the future you described. That is information, not a verdict — and it is exactly what this app is for.', { score: totalScore });
      }

      const now = new Date().toISOString();
      const newScoreRecord = {
        id: `score-${Date.now()}`,
        userId: data.profile.id,
        scores,
        totalScore,
        lowestAreas,
        interpretation,
        createdAt: now,
      };

      const updated: UserData = {
        ...data,
        lifeScores: [newScoreRecord, ...data.lifeScores],
      };

      await repository.save(updated);
      setData(updated);
      showToast(t('Future Life Score recorded.'), 'success');
    },
    [data, showToast]
  );

  const saveTwoFutures = useCallback(
    async (twoFuturesData: Partial<TwoFuturesData>) => {
      if (!data) return;
      const updated: UserData = {
        ...data,
        twoFutures: {
          ...data.twoFutures,
          ...twoFuturesData,
          updatedAt: new Date().toISOString(),
        },
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Two Futures vision updated.'), 'success');
    },
    [data, showToast]
  );

  const saveDefaultFuture = useCallback(
    async (defaultFuture: Partial<DefaultFutureData>) => {
      if (!data) return;
      const updated: UserData = {
        ...data,
        twoFutures: {
          ...data.twoFutures,
          defaultFuture: {
            ...(data.twoFutures.defaultFuture || {}),
            ...defaultFuture,
            lastReviewedAt: new Date().toISOString(),
          },
          updatedAt: new Date().toISOString(),
        },
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Default Future updated.'), 'success');
    },
    [data, showToast]
  );

  const logDriftSignal = useCallback(
    async (signal: string) => {
      if (!data || !signal.trim()) return;
      const now = new Date();
      const dateKey = now.toISOString().slice(0, 10);
      const existing = data.twoFutures.defaultFuture?.driftLog || [];
      if (existing.some((e) => e.dateKey === dateKey && e.signal === signal)) {
        showToast(t('Already logged for today. Awareness noted.'), 'info');
        return;
      }
      const entry: DriftLogEntry = {
        id: `drift-${now.getTime()}`,
        dateKey,
        signal,
        createdAt: now.toISOString(),
      };
      const updated: UserData = {
        ...data,
        twoFutures: {
          ...data.twoFutures,
          allowingVotes: (data.twoFutures.allowingVotes || 0) + 1,
          defaultFuture: {
            ...(data.twoFutures.defaultFuture || {}),
            driftLog: [entry, ...existing].slice(0, 365),
          },
          updatedAt: now.toISOString(),
        },
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Drift noticed. Noticing is the first vote back.'), 'info');
    },
    [data, showToast]
  );

  const removeDriftEntry = useCallback(
    async (entryId: string) => {
      if (!data) return;
      const existing = data.twoFutures.defaultFuture?.driftLog || [];
      if (!existing.some((e) => e.id === entryId)) return;
      const updated: UserData = {
        ...data,
        twoFutures: {
          ...data.twoFutures,
          allowingVotes: Math.max(0, (data.twoFutures.allowingVotes || 0) - 1),
          defaultFuture: {
            ...(data.twoFutures.defaultFuture || {}),
            driftLog: existing.filter((e) => e.id !== entryId),
          },
          updatedAt: new Date().toISOString(),
        },
      };
      await repository.save(updated);
      setData(updated);
    },
    [data]
  );

  const saveFutureSelf = useCallback(
    async (futureSelfData: Partial<FutureSelfData>) => {
      if (!data) return;
      const updated: UserData = {
        ...data,
        futureSelf: {
          ...data.futureSelf,
          ...futureSelfData,
          updatedAt: new Date().toISOString(),
        },
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Future Self profile saved.'), 'success');
    },
    [data, showToast]
  );

  const addMission = useCallback(
    async (missionData: Omit<Mission, 'id' | 'createdAt' | 'status' | 'userId'>) => {
      if (!data) return;
      const now = new Date().toISOString();
      const newMission: Mission = {
        ...missionData,
        id: `mission-${Date.now()}`,
        userId: data.profile.id,
        status: 'active',
        createdAt: now,
      };

      const updated: UserData = {
        ...data,
        missions: [newMission, ...data.missions],
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Mission created.'), 'success');
    },
    [data, showToast]
  );

  const setOneDecision = useCallback(
    async (title: string, goalId?: string, estimatedMinutes: number = 45) => {
      if (!data) return;
      const todayStr = new Date().toISOString().slice(0, 10);
      const difficulty = estimatedMinutes < 45 ? 'easy' : estimatedMinutes < 120 ? 'medium' : 'hard';

      // Archive any previous unfinished one_decision for today
      const updatedMissions = data.missions.map((m) => {
        if (m.isOneDecision && m.status === 'active') {
          return { ...m, status: 'archived' as const };
        }
        return m;
      });

      const newOneDecision: Mission = {
        id: `one-decision-${Date.now()}`,
        userId: data.profile.id,
        goalId,
        title,
        type: 'daily_quest',
        area: 'Work',
        difficulty,
        estimatedMinutes,
        isOneDecision: true,
        scheduledFor: todayStr,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const updated: UserData = {
        ...data,
        missions: [newOneDecision, ...updatedMissions],
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Today’s One Decision is locked in. Complete it to earn D$500!'), 'success');
    },
    [data, showToast]
  );

  const addCustomDream = useCallback(
    async (
      itemData: Omit<MarketItem, 'id' | 'createdAt' | 'isCustom'>,
      pinToVision: boolean = false
    ) => {
      if (!data) return undefined;
      const newItemId = `custom-dream-${Date.now()}`;
      const newItem: MarketItem = {
        ...itemData,
        id: newItemId,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      const currentInVision = data.inVisionItemIds || [];
      const updatedInVision = pinToVision
        ? Array.from(new Set([newItemId, ...currentInVision]))
        : currentInVision;

      const updated: UserData = {
        ...data,
        customMarketItems: [newItem, ...data.customMarketItems],
        inVisionItemIds: updatedInVision,
      };
      await repository.save(updated);
      setData(updated);
      showToast(
        pinToVision
          ? t('"{name}" added to your Vision Board and Market.', { name: newItem.name })
          : t('Custom dream "{name}" added to your Dream Market.', { name: newItem.name }),
        'success'
      );
      return newItem;
    },
    [data, showToast]
  );

  const pinExploreDream = useCallback(
    async (
      exploreItem: {
        id: string;
        name: string;
        category: MarketCategory;
        realPriceUsd: number;
        dreamDollarPrice: number;
        description: string;
        imageUrl: string;
        whyWanted?: string;
        firstRealStep?: string;
      },
      pin: boolean = true
    ) => {
      if (!data) return undefined;

      const currentInVision = data.inVisionItemIds || [];
      const currentCustoms = data.customMarketItems || [];

      // Check if existing custom dream already matches this ID or image URL
      const existingCustom = currentCustoms.find(
        (c) => c.id === exploreItem.id || (exploreItem.imageUrl && c.customImageUrl === exploreItem.imageUrl)
      );

      let targetItemId = existingCustom?.id || exploreItem.id;
      let updatedCustoms = [...currentCustoms];
      let targetItem: MarketItem;

      if (existingCustom) {
        targetItem = existingCustom;
      } else {
        targetItem = {
          id: exploreItem.id,
          name: exploreItem.name,
          category: exploreItem.category,
          realPriceUsd: exploreItem.realPriceUsd,
          dreamDollarPrice: exploreItem.dreamDollarPrice,
          description: exploreItem.description,
          illustrationKey: 'custom_dream',
          customImageUrl: exploreItem.imageUrl,
          whyWanted: exploreItem.whyWanted || t('High standard of sovereign living and deep focus.'),
          firstRealStep: exploreItem.firstRealStep || t('Define concrete execution milestone.'),
          isCustom: true,
          createdAt: new Date().toISOString(),
        };
        updatedCustoms = [targetItem, ...updatedCustoms];
      }

      let updatedInVision: string[];
      if (pin) {
        updatedInVision = Array.from(new Set([targetItemId, ...currentInVision]));
      } else {
        updatedInVision = currentInVision.filter((id) => id !== targetItemId && id !== exploreItem.id);
      }

      const updated: UserData = {
        ...data,
        customMarketItems: updatedCustoms,
        inVisionItemIds: updatedInVision,
      };

      await repository.save(updated);
      setData(updated);

      if (pin) {
        showToast(t('"{name}" added to your Vision Board and Dream Market! ⭐', { name: exploreItem.name }), 'success');
        triggerGoldConfetti();
      } else {
        showToast(t('"{name}" removed from your Vision Board.', { name: exploreItem.name }), 'info');
      }

      return targetItem;
    },
    [data, showToast]
  );

  const grantSimulationBonus = useCallback(
    async (amount: number = 25000, memo: string = t('Executive Life Simulation Grant')) => {
      if (!data) return;
      const now = new Date().toISOString();
      const newTx: WalletTransaction = {
        id: `tx-grant-${Date.now()}`,
        walletId: 'wallet-demo',
        userId: data.profile.id,
        kind: 'welcome_grant',
        amount,
        dayKey: now.slice(0, 10),
        memo,
        createdAt: now,
      };
      const updated: UserData = {
        ...data,
        transactions: [newTx, ...data.transactions],
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('+D$ {amount} added to your ledger for luxury acquisitions!', { amount: amount.toLocaleString() }), 'success');
      triggerGoldConfetti();
    },
    [data, showToast]
  );

  const toggleInVision = useCallback(
    async (itemId: string) => {
      if (!data) return;
      const current = data.inVisionItemIds || [];
      const updatedList = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];

      const updated: UserData = {
        ...data,
        inVisionItemIds: updatedList,
      };
      await repository.save(updated);
      setData(updated);
    },
    [data]
  );

  const reorderVisionItems = useCallback(
    async (orderedItemIds: string[]) => {
      if (!data) return;
      const current = data.inVisionItemIds || [];
      const orderedSet = new Set(orderedItemIds);
      const remaining = current.filter((id) => !orderedSet.has(id));
      const finalList = [...orderedItemIds, ...remaining];

      const updated: UserData = {
        ...data,
        inVisionItemIds: finalList,
      };
      await repository.save(updated);
      setData(updated);
    },
    [data]
  );

  const archiveMarketItem = useCallback(
    async (
      itemId: string,
      reason: ArchiveReason = 'no_longer_relevant',
      note?: string
    ) => {
      if (!data) return;

      const allItems: MarketItem[] = [...SEED_MARKET_ITEMS, ...data.customMarketItems];
      const targetItem = allItems.find((i) => i.id === itemId);
      if (!targetItem) {
        showToast(t('Nothing found to archive.'), 'error');
        return;
      }

      const wasOwned = data.purchases.some((p) => p.itemId === itemId);
      const wasInVision = (data.inVisionItemIds || []).includes(itemId);
      const now = new Date().toISOString();

      const newRecord: ArchivedMarketRecord = {
        id: `arch-${Date.now()}`,
        itemId,
        itemSnapshot: {
          ...targetItem,
          isArchived: true,
          archivedAt: now,
          archiveReason: reason,
        },
        archivedAt: now,
        reason,
        note: note?.trim() || undefined,
        wasOwned,
        wasInVision,
      };

      // Remove from active vision board & record in archive collections
      const updatedInVision = (data.inVisionItemIds || []).filter((id) => id !== itemId);
      const updatedArchivedIds = Array.from(new Set([...(data.archivedMarketItemIds || []), itemId]));
      const currentRecords = data.archivedMarketRecords || [];
      const updatedRecords = [newRecord, ...currentRecords.filter((r) => r.itemId !== itemId)];

      const updatedCustoms = data.customMarketItems.map((c) =>
        c.id === itemId
          ? { ...c, isArchived: true, archivedAt: now, archiveReason: reason }
          : c
      );

      const updated: UserData = {
        ...data,
        customMarketItems: updatedCustoms,
        inVisionItemIds: updatedInVision,
        archivedMarketItemIds: updatedArchivedIds,
        archivedMarketRecords: updatedRecords,
      };

      await repository.save(updated);
      setData(updated);

      const reasonLabel =
        reason === 'completed' || reason === 'acquired'
          ? t('archived as completed / acquired')
          : reason === 'outgrown'
          ? t('archived as outgrown')
          : reason === 'replaced'
          ? t('archived as replaced by a new goal')
          : t('archived');

      showToast(
        t('"{name}" {reason} and removed from the active Vision Board.', { name: targetItem.name, reason: reasonLabel }),
        'info'
      );
    },
    [data, showToast]
  );

  const restoreMarketItem = useCallback(
    async (itemId: string, andPinToVision: boolean = false) => {
      if (!data) return;

      const allItems: MarketItem[] = [...SEED_MARKET_ITEMS, ...data.customMarketItems];
      const targetItem =
        allItems.find((i) => i.id === itemId) ||
        data.archivedMarketRecords?.find((r) => r.itemId === itemId)?.itemSnapshot;

      const updatedArchivedIds = (data.archivedMarketItemIds || []).filter((id) => id !== itemId);
      const currentInVision = data.inVisionItemIds || [];
      const updatedInVision = andPinToVision
        ? Array.from(new Set([itemId, ...currentInVision]))
        : currentInVision;

      const updatedRecords = (data.archivedMarketRecords || []).filter((r) => r.itemId !== itemId);
      const updatedCustoms = data.customMarketItems.map((c) =>
        c.id === itemId
          ? { ...c, isArchived: false, archivedAt: undefined, archiveReason: undefined }
          : c
      );

      const updated: UserData = {
        ...data,
        customMarketItems: updatedCustoms,
        inVisionItemIds: updatedInVision,
        archivedMarketItemIds: updatedArchivedIds,
        archivedMarketRecords: updatedRecords,
      };

      await repository.save(updated);
      setData(updated);

      const itemName = targetItem?.name || t('Item');
      showToast(
        andPinToVision
          ? t('"{name}" restored from the archive to your Vision Board.', { name: itemName })
          : t('"{name}" restored from the archive to the Market.', { name: itemName }),
        'success'
      );
    },
    [data, showToast]
  );

  const deleteArchivedRecord = useCallback(
    async (recordId: string) => {
      if (!data) return;
      const targetRecord = data.archivedMarketRecords?.find((r) => r.id === recordId);
      const updatedRecords = (data.archivedMarketRecords || []).filter((r) => r.id !== recordId);
      let updatedArchivedIds = data.archivedMarketItemIds || [];
      if (targetRecord) {
        updatedArchivedIds = updatedArchivedIds.filter((id) => id !== targetRecord.itemId);
      }
      const updated: UserData = {
        ...data,
        archivedMarketItemIds: updatedArchivedIds,
        archivedMarketRecords: updatedRecords,
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Archive record deleted.'), 'info');
    },
    [data, showToast]
  );

  const updateBudget = useCallback(
    async (budget: BudgetAllocations) => {
      if (!data) return;
      const updated: UserData = {
        ...data,
        budget,
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Life simulation budget updated.'), 'success');
    },
    [data, showToast]
  );

  const saveLifeBudget = useCallback(
    async (lifeBudget: LifeBudgetData) => {
      if (!data) return;
      const updated: UserData = {
        ...data,
        lifeBudget,
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Life simulation allocation saved.'), 'success');
    },
    [data, showToast]
  );

  const addDreamJournalEntry = useCallback(
    async (entry: Omit<DreamJournalEntry, 'id' | 'createdAt' | 'userId'>) => {
      if (!data) return;
      const now = new Date().toISOString();
      const newEntry: DreamJournalEntry = {
        ...entry,
        id: `journal-${Date.now()}`,
        userId: data.profile.id,
        createdAt: now,
      };
      const existingJournal = data.dreamJournal || [];
      const updated: UserData = {
        ...data,
        dreamJournal: [newEntry, ...existingJournal],
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Dream Journal entry documented in your timeline!'), 'success');
    },
    [data, showToast]
  );

  const deleteDreamJournalEntry = useCallback(
    async (entryId: string) => {
      if (!data) return;
      const existingJournal = data.dreamJournal || [];
      const updated: UserData = {
        ...data,
        dreamJournal: existingJournal.filter((e) => e.id !== entryId),
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Journal entry removed.'), 'info');
    },
    [data, showToast]
  );

  const toggleMicroHabit = useCallback(
    async (habitId: string) => {
      if (!data) return;
      const todayStr = new Date().toISOString().slice(0, 10);
      const habits = data.microHabits || [];
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;

      const isCompletedToday = habit.completedDates.includes(todayStr);
      let updatedDates: string[];
      let updatedStreak = habit.streakCount;
      let newTransactions = [...data.transactions];

      if (isCompletedToday) {
        // Toggle off
        updatedDates = habit.completedDates.filter((d) => d !== todayStr);
        updatedStreak = Math.max(0, updatedStreak - 1);
        soundSynthesizer.playMicroHabitCue(habit.category, 'undo');
        showToast(t('Untoggled: {title}', { title: habit.title }), 'info');
      } else {
        // Toggle on
        updatedDates = [...habit.completedDates, todayStr];
        updatedStreak = updatedStreak + 1;
        
        // Play category-differentiated acoustic synthesis & haptic pulse (Health / Learning / Discipline / Mindset)
        soundSynthesizer.playMicroHabitCue(habit.category, 'complete');

        // Check if this completes the last remaining micro-habit of the day
        const otherUncompletedHabits = habits.filter(
          (h) => h.id !== habitId && !h.completedDates.includes(todayStr)
        );
        const isLastRemaining = habits.length > 0 && otherUncompletedHabits.length === 0;

        if (isLastRemaining) {
          triggerSmallConfetti();
          setTimeout(() => {
            soundSynthesizer.playFocusCompleteChime();
          }, 450);
        }

        // Award a 25 D$ micro-momentum reward
        const now = new Date().toISOString();
        const habitTx: WalletTransaction = {
          id: `tx-habit-${Date.now()}`,
          walletId: 'wallet-demo',
          userId: data.profile.id,
          kind: 'micro_habit_reward',
          amount: 25,
          dayKey: todayStr,
          memo: t('5-Min Micro-Habit Momentum: {title}', { title: habit.title }),
          createdAt: now,
        };
        newTransactions = [habitTx, ...newTransactions];

        if (isLastRemaining) {
          showToast(t('✨ All micro-habits completed today! Full momentum secured! (+ D$25)'), 'success');
        } else {
          showToast(t('✓ Micro-Habit completed: "{title}"! (+ D$25 momentum)', { title: habit.title }), 'success');
        }
      }

      const bestStreak = calculateBestMicroHabitStreak(
        updatedDates,
        updatedStreak,
        habit.bestStreak
      );

      const updatedHabits = habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completedDates: updatedDates,
              streakCount: updatedStreak,
              bestStreak,
            }
          : h
      );

      const updated: UserData = {
        ...data,
        microHabits: updatedHabits,
        transactions: newTransactions,
      };

      await repository.save(updated);
      setData(updated);
    },
    [data, showToast]
  );

  const addGoal = useCallback(
    async (goalData: Omit<Goal, 'id' | 'createdAt' | 'userId'>): Promise<Goal | undefined> => {
      if (!data || !goalData.title.trim()) return undefined;
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        userId: data.profile.id || 'demo-user',
        title: goalData.title.trim(),
        description: goalData.description?.trim(),
        area: goalData.area,
        targetDate: goalData.targetDate,
        status: goalData.status || 'active',
        createdAt: new Date().toISOString(),
      };
      const existing = data.goals || [];
      const updated: UserData = {
        ...data,
        goals: [...existing, newGoal],
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Created goal: "{title}"', { title: newGoal.title }), 'success');
      return newGoal;
    },
    [data, showToast]
  );

  const updateGoal = useCallback(
    async (goalId: string, updates: Partial<Omit<Goal, 'id' | 'userId'>>) => {
      if (!data) return;
      const existing = data.goals || [];
      const updatedGoals = existing.map((g) =>
        g.id === goalId ? { ...g, ...updates } : g
      );
      const updated: UserData = {
        ...data,
        goals: updatedGoals,
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Goal updated.'), 'info');
    },
    [data, showToast]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      if (!data) return;
      const existing = data.goals || [];
      const goalToDelete = existing.find((g) => g.id === goalId);
      const updatedGoals = existing.filter((g) => g.id !== goalId);
      const updatedHabits = (data.microHabits || []).map((h) =>
        h.goalId === goalId ? { ...h, goalId: undefined } : h
      );
      const updatedMissions = (data.missions || []).map((m) =>
        m.goalId === goalId ? { ...m, goalId: undefined } : m
      );
      const updated: UserData = {
        ...data,
        goals: updatedGoals,
        microHabits: updatedHabits,
        missions: updatedMissions,
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Goal "{title}" removed.', { title: goalToDelete?.title || '' }), 'info');
    },
    [data, showToast]
  );

  const addMicroHabit = useCallback(
    async (params: {
      title: string;
      category: MicroHabitCategory;
      customCategoryId?: string;
      goalId?: string;
      durationMinutes?: number;
      description?: string;
    }) => {
      if (!data || !params.title.trim()) return;
      const now = new Date().toISOString();
      const newHabit: MicroHabit = {
        id: `habit-${Date.now()}`,
        title: params.title.trim(),
        category: params.category,
        customCategoryId: params.customCategoryId,
        goalId: params.goalId,
        durationMinutes: params.durationMinutes || 5,
        description: params.description?.trim(),
        completedDates: [],
        streakCount: 0,
        bestStreak: 0,
        createdAt: now,
      };

      const existingHabits = data.microHabits || [];
      const updated: UserData = {
        ...data,
        microHabits: [...existingHabits, newHabit],
      };

      await repository.save(updated);
      setData(updated);
      showToast(t('Added 5-minute micro-habit: "{title}"', { title: newHabit.title }), 'success');
    },
    [data, showToast]
  );

  const updateMicroHabit = useCallback(
    async (
      habitId: string,
      updates: Partial<Omit<MicroHabit, 'id' | 'createdAt'>>
    ) => {
      if (!data) return;
      const existingHabits = data.microHabits || [];
      const habitIndex = existingHabits.findIndex((h) => h.id === habitId);
      if (habitIndex === -1) return;

      const targetHabit = existingHabits[habitIndex];
      const updatedHabit: MicroHabit = {
        ...targetHabit,
        ...updates,
      };

      const updatedHabits = [...existingHabits];
      updatedHabits[habitIndex] = updatedHabit;

      const updated: UserData = {
        ...data,
        microHabits: updatedHabits,
      };

      await repository.save(updated);
      setData(updated);
      showToast(t('Updated micro-habit: "{title}"', { title: updatedHabit.title }), 'success');
    },
    [data, showToast]
  );

  const deleteMicroHabit = useCallback(
    async (habitId: string) => {
      if (!data) return;
      const existingHabits = data.microHabits || [];
      const updated: UserData = {
        ...data,
        microHabits: existingHabits.filter((h) => h.id !== habitId),
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Micro-habit removed.'), 'info');
    },
    [data, showToast]
  );

  const addCustomHabitCategory = useCallback(
    async (params: {
      name: string;
      icon: string;
      color: string;
      description?: string;
    }): Promise<CustomHabitCategory | null> => {
      if (!data || !params.name.trim()) return null;
      const cleanName = params.name.trim();
      const existingCats = data.customHabitCategories || [];

      // Check if duplicate category name exists
      const duplicate = existingCats.find(
        (c) => c.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (duplicate) {
        showToast(t('Category "{name}" already exists.', { name: cleanName }), 'info');
        return duplicate;
      }

      const id = `cat-${Date.now()}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const newCategory: CustomHabitCategory = {
        id,
        name: cleanName,
        icon: params.icon || 'Folder',
        color: params.color || '#6366f1',
        description: params.description?.trim(),
        createdAt: new Date().toISOString(),
      };

      const updated: UserData = {
        ...data,
        customHabitCategories: [...existingCats, newCategory],
      };

      await repository.save(updated);
      setData(updated);
      showToast(t('Created custom category: "{name}"', { name: newCategory.name }), 'success');
      return newCategory;
    },
    [data, showToast]
  );

  const deleteCustomHabitCategory = useCallback(
    async (categoryId: string) => {
      if (!data) return;
      const existingCats = data.customHabitCategories || [];
      const catToDelete = existingCats.find((c) => c.id === categoryId);
      if (!catToDelete) return;

      const updatedCats = existingCats.filter((c) => c.id !== categoryId);
      const existingHabits = data.microHabits || [];
      // Reassign habits using this category to 'Mindset' fallback
      const updatedHabits = existingHabits.map((h) => {
        if (
          h.customCategoryId === categoryId ||
          h.category === catToDelete.name ||
          h.category === categoryId
        ) {
          return {
            ...h,
            category: 'Mindset' as const,
            customCategoryId: undefined,
          };
        }
        return h;
      });

      const updated: UserData = {
        ...data,
        customHabitCategories: updatedCats,
        microHabits: updatedHabits,
      };

      await repository.save(updated);
      setData(updated);
      showToast(t('Custom category "{name}" removed.', { name: catToDelete.name }), 'info');
    },
    [data, showToast]
  );

  const updateCustomHabitCategory = useCallback(
    async (
      categoryId: string,
      params: { name?: string; icon?: string; color?: string; description?: string }
    ) => {
      if (!data) return;
      const existingCats = data.customHabitCategories || [];
      const catIndex = existingCats.findIndex((c) => c.id === categoryId);
      if (catIndex === -1) return;

      const oldCat = existingCats[catIndex];
      const updatedCat: CustomHabitCategory = {
        ...oldCat,
        name: params.name ? params.name.trim() : oldCat.name,
        icon: params.icon || oldCat.icon,
        color: params.color || oldCat.color,
        description:
          params.description !== undefined ? params.description.trim() : oldCat.description,
      };

      const updatedCats = [...existingCats];
      updatedCats[catIndex] = updatedCat;

      // If category name or ID updated, synchronize habits
      const existingHabits = data.microHabits || [];
      const updatedHabits = existingHabits.map((h) => {
        if (h.customCategoryId === categoryId || h.category === oldCat.name) {
          return {
            ...h,
            category: updatedCat.name,
            customCategoryId: categoryId,
          };
        }
        return h;
      });

      const updated: UserData = {
        ...data,
        customHabitCategories: updatedCats,
        microHabits: updatedHabits,
      };

      await repository.save(updated);
      setData(updated);
      showToast(t('Updated category "{name}"', { name: updatedCat.name }), 'success');
    },
    [data, showToast]
  );

  const resetMicroHabitsToday = useCallback(async () => {
    if (!data) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const existingHabits = data.microHabits || [];
    const updatedHabits = existingHabits.map((h) => ({
      ...h,
      completedDates: h.completedDates.filter((d) => d !== todayStr),
    }));
    const updated: UserData = {
      ...data,
      microHabits: updatedHabits,
    };
    await repository.save(updated);
    setData(updated);
    showToast(t('Reset today’s micro-habits.'), 'info');
  }, [data, showToast]);

  const checkDailyMicroHabitsRollover = useCallback(
    async (force = false): Promise<DailyMicroHabitRolloverResult | null> => {
      if (!data) return null;

      const currentDateKey = getCurrentDateKey();
      const previousDateKey = data.lastActiveDateKey || data.profile?.lastOpenedAt?.slice(0, 10);

      // If date hasn't changed and not forced, nothing to reset
      if (previousDateKey === currentDateKey && !force) {
        return null;
      }

      const result = checkAndApplyDailyMicroHabitRollover(data, new Date(), force);

      if (result.hasChanged || force) {
        await repository.save(result.updatedData);
        setData(result.updatedData);

        const summary: DailyMicroHabitRolloverSummary = {
          hasChanged: true,
          previousDateKey: result.previousDateKey,
          currentDateKey: result.currentDateKey,
          resetHabitsCount: result.resetHabitsCount,
          brokenStreaksCount: result.brokenStreaksCount,
          timestamp: new Date().toISOString(),
        };
        setLastRolloverSummary(summary);

        if (result.brokenStreaksCount > 0) {
          showToast(
            t('🌅 New day ({date}): {reset} micro-habits reset. {broken} missed streak(s) reset to 0.', { date: result.currentDateKey, reset: result.resetHabitsCount, broken: result.brokenStreaksCount }),
            'info'
          );
        } else {
          showToast(
            t('🌅 New day started ({date}): Daily micro-habits reset for today!', { date: result.currentDateKey }),
            'info'
          );
        }
      }

      return result;
    },
    [data, showToast]
  );

  const simulateDateKeyChange = useCallback(
    async (simulatedDateKey?: string) => {
      if (!data) return;
      let nextDateKey = simulatedDateKey;
      if (!nextDateKey) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        nextDateKey = d.toISOString().slice(0, 10);
      }

      const simulatedRefDate = new Date(`${nextDateKey}T10:00:00Z`);
      const result = checkAndApplyDailyMicroHabitRollover(data, simulatedRefDate, true);

      await repository.save(result.updatedData);
      setData(result.updatedData);

      const summary: DailyMicroHabitRolloverSummary = {
        hasChanged: true,
        previousDateKey: data.lastActiveDateKey,
        currentDateKey: nextDateKey,
        resetHabitsCount: result.resetHabitsCount,
        brokenStreaksCount: result.brokenStreaksCount,
        timestamp: new Date().toISOString(),
      };
      setLastRolloverSummary(summary);

      showToast(
        t('🗓️ DateKey rollover simulated to {date}: Daily micro-habits reset for today!', { date: nextDateKey }),
        'success'
      );
    },
    [data, showToast]
  );

  // Scheduled background job: automatically monitors dateKey changes
  // Runs periodically every 30 seconds and checks when window/document regains focus or visibility
  useEffect(() => {
    if (!data) return;

    const performBackgroundDateCheck = () => {
      const todayKey = getCurrentDateKey();
      const lastKey = data.lastActiveDateKey;

      if (lastKey && lastKey !== todayKey) {
        console.log(`[Scheduled Background Job] DateKey rollover detected from ${lastKey} to ${todayKey}. Resetting uncompleted micro-habits...`);
        checkDailyMicroHabitsRollover(false);
      }
    };

    // Periodic scheduled interval (every 30 seconds)
    const interval = setInterval(performBackgroundDateCheck, 30000);

    // Event listeners for immediate check when user returns to app tab or device wakes up
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performBackgroundDateCheck();
      }
    };

    const handleWindowFocus = () => {
      performBackgroundDateCheck();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [data?.lastActiveDateKey, checkDailyMicroHabitsRollover]);

  const saveDailyCheckIn = useCallback(
    async (checkIn: {
      focus: number;
      energy: number;
      mood: number;
      notes?: string;
      dateKey?: string;
    }) => {
      if (!data) return;
      const todayStr = checkIn.dateKey || new Date().toISOString().slice(0, 10);
      const existingCheckIns = data.checkIns || [];
      const existingIndex = existingCheckIns.findIndex((c) => c.dateKey === todayStr);

      const now = new Date().toISOString();
      let updatedCheckIns: DailyCheckIn[];
      let isFirstToday = false;

      if (existingIndex >= 0) {
        const updatedEntry: DailyCheckIn = {
          ...existingCheckIns[existingIndex],
          focus: checkIn.focus,
          energy: checkIn.energy,
          mood: checkIn.mood,
          notes: checkIn.notes?.trim() || '',
          updatedAt: now,
        };
        updatedCheckIns = [...existingCheckIns];
        updatedCheckIns[existingIndex] = updatedEntry;
      } else {
        isFirstToday = true;
        const newEntry: DailyCheckIn = {
          id: `checkin-${Date.now()}`,
          dateKey: todayStr,
          focus: checkIn.focus,
          energy: checkIn.energy,
          mood: checkIn.mood,
          notes: checkIn.notes?.trim() || '',
          createdAt: now,
        };
        updatedCheckIns = [newEntry, ...existingCheckIns];
      }

      let newTransactions = data.transactions || [];
      if (isFirstToday) {
        soundSynthesizer.playSuccessChord();
        triggerMissionConfetti();
        const checkInTx: WalletTransaction = {
          id: `tx-checkin-${Date.now()}`,
          walletId: 'wallet-demo',
          userId: data.profile.id,
          kind: 'check_in_reward',
          amount: 50,
          dayKey: todayStr,
          memo: t('Daily Check-in (Focus: {focus}/10, Energy: {energy}/10, Mood: {mood}/10)', { focus: checkIn.focus, energy: checkIn.energy, mood: checkIn.mood }),
          createdAt: now,
        };
        newTransactions = [checkInTx, ...newTransactions];
        showToast('✓ Daily Check-in recorded! (+ D$50 Focus Fuel)', 'success');
      } else {
        soundSynthesizer.playTapChime();
        showToast(t('Daily Check-in updated.'), 'info');
      }

      const updated: UserData = {
        ...data,
        checkIns: updatedCheckIns,
        transactions: newTransactions,
      };

      await repository.save(updated);
      setData(updated);
    },
    [data, showToast]
  );

  const deleteDailyCheckIn = useCallback(
    async (checkInId: string) => {
      if (!data) return;
      const existingCheckIns = data.checkIns || [];
      const updated: UserData = {
        ...data,
        checkIns: existingCheckIns.filter((c) => c.id !== checkInId),
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Daily check-in removed.'), 'info');
    },
    [data, showToast]
  );

  const joinSeason = useCallback(
    async (season: Season) => {
      if (!data) return;
      const updated: UserData = {
        ...data,
        activeSeason: season,
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Enrolled in 30-Day Season: {title}!', { title: season.title }), 'success');
    },
    [data, showToast]
  );

  // Synchronize document theme attribute and classes with current profile theme
  useEffect(() => {
    const theme = data?.profile?.theme || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data?.profile?.theme]);

  // Synchronize soundSynthesizer mute state with current profile preference
  useEffect(() => {
    const isMuted = !!data?.profile?.soundMuted;
    soundSynthesizer.setMuted(isMuted);
  }, [data?.profile?.soundMuted]);

  const updateProfile = useCallback(
    async (profileData: Partial<Profile>) => {
      if (!data) return;
      if (profileData.theme) {
        document.documentElement.setAttribute('data-theme', profileData.theme);
        if (profileData.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      if (profileData.soundMuted !== undefined) {
        soundSynthesizer.setMuted(profileData.soundMuted);
      }
      const updated: UserData = {
        ...data,
        profile: {
          ...data.profile,
          ...profileData,
        },
      };
      await repository.save(updated);
      setData(updated);
      showToast(t('Profile updated.'), 'success');
    },
    [data, showToast]
  );

  const toggleSoundMute = useCallback(async () => {
    if (!data) return;
    const currentMuted = !!data.profile.soundMuted;
    const nextMuted = !currentMuted;
    soundSynthesizer.setMuted(nextMuted);
    if (!nextMuted) {
      soundSynthesizer.playTapChime();
    }

    const updated: UserData = {
      ...data,
      profile: {
        ...data.profile,
        soundMuted: nextMuted,
      },
    };
    await repository.save(updated);
    setData(updated);
    showToast(
      nextMuted ? '🔇 Audio muted (UI sounds silent)' : '🔊 Audio enabled (UI chimes active)',
      'info'
    );
  }, [data, showToast]);

  const setSoundMuted = useCallback(
    async (muted: boolean) => {
      if (!data) return;
      if (data.profile.soundMuted === muted) return;
      soundSynthesizer.setMuted(muted);
      if (!muted) {
        soundSynthesizer.playTapChime();
      }

      const updated: UserData = {
        ...data,
        profile: {
          ...data.profile,
          soundMuted: muted,
        },
      };
      await repository.save(updated);
      setData(updated);
      showToast(
        muted ? '🔇 Audio muted (UI sounds silent)' : '🔊 Audio enabled (UI chimes active)',
        'info'
      );
    },
    [data, showToast]
  );

  const toggleFocusTabBlink = useCallback(async () => {
    if (!data) return;
    const current = data.profile.focusTabBlinkEnabled !== false;
    const nextVal = !current;
    const updated: UserData = {
      ...data,
      profile: {
        ...data.profile,
        focusTabBlinkEnabled: nextVal,
      },
    };
    await repository.save(updated);
    setData(updated);
    soundSynthesizer.playTapChime();
    showToast(
      nextVal
        ? '🔔 Tab title blink animation enabled for timer 0 alerts'
        : '🔕 Tab title blink animation disabled',
      'info'
    );
  }, [data, showToast]);

  const toggleFocusScreenPulse = useCallback(async () => {
    if (!data) return;
    const current = data.profile.focusScreenPulseEnabled !== false;
    const nextVal = !current;
    const updated: UserData = {
      ...data,
      profile: {
        ...data.profile,
        focusScreenPulseEnabled: nextVal,
      },
    };
    await repository.save(updated);
    setData(updated);
    soundSynthesizer.playTapChime();
    showToast(
      nextVal
        ? '✨ Screen edge pulsing border enabled for timer 0 alerts'
        : '🚫 Screen edge pulsing border disabled',
      'info'
    );
  }, [data, showToast]);

  const simulateFocusTimerAlert = useCallback(() => {
    setIsSimulatingFocusAlert(true);
    if (!data?.profile?.soundMuted) {
      soundSynthesizer.playFocusCompleteChime();
    }
    showToast(
      '🔔 Previewing Timer 0 Alert: Browser Tab Title Blink & Screen Border Pulse active for 5s',
      'info'
    );
    setTimeout(() => {
      setIsSimulatingFocusAlert(false);
    }, 5000);
  }, [data?.profile?.soundMuted, showToast]);

  const toggleTheme = useCallback(async () => {
    if (!data) return;
    const currentTheme = data.profile.theme || 'light';
    const newTheme: 'light' | 'dark' = currentTheme === 'dark' ? 'light' : 'dark';
    soundSynthesizer.playTapChime();

    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const updated: UserData = {
      ...data,
      profile: {
        ...data.profile,
        theme: newTheme,
      },
    };
    await repository.save(updated);
    setData(updated);
    showToast(
      newTheme === 'dark'
        ? '🌙 Switched to Midnight Dark theme'
        : '☀️ Switched to Editorial Light theme',
      'info'
    );
  }, [data, showToast]);

  const setTheme = useCallback(
    async (newTheme: 'light' | 'dark') => {
      if (!data) return;
      if (data.profile.theme === newTheme) return;
      soundSynthesizer.playTapChime();

      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const updated: UserData = {
        ...data,
        profile: {
          ...data.profile,
          theme: newTheme,
        },
      };
      await repository.save(updated);
      setData(updated);
      showToast(
        newTheme === 'dark'
          ? '🌙 Switched to Midnight Dark theme'
          : '☀️ Switched to Editorial Light theme',
        'info'
      );
    },
    [data, showToast]
  );

  const upgradeToPro = useCallback(async () => {
    if (!data) return;
    const updated: UserData = {
      ...data,
      profile: {
        ...data.profile,
        isPro: true,
      },
      subscription: {
        ...data.subscription,
        plan: 'pro',
        status: 'active',
        updatedAt: new Date().toISOString(),
      },
    };
    await repository.save(updated);
    setData(updated);
    showToast(t('Upgraded to One Decision Pro!'), 'success');
  }, [data, showToast]);

  const toggleProPlan = useCallback(async () => {
    if (!data) return;
    const nextIsPro = !data.profile.isPro;
    const updated: UserData = {
      ...data,
      profile: {
        ...data.profile,
        isPro: nextIsPro,
      },
      subscription: {
        ...data.subscription,
        plan: nextIsPro ? 'pro' : 'free',
        status: nextIsPro ? 'active' : 'inactive',
        updatedAt: new Date().toISOString(),
      },
    };
    await repository.save(updated);
    setData(updated);
    showToast(
      nextIsPro ? t('Pro membership activated (Demo).') : t('Switched to Free plan.'),
      'info'
    );
  }, [data, showToast]);

  const cancelSubscription = useCallback(async () => {
    if (!data) return;
    const updated: UserData = {
      ...data,
      profile: {
        ...data.profile,
        isPro: false,
      },
      subscription: {
        ...data.subscription,
        plan: 'free',
        status: 'inactive',
        updatedAt: new Date().toISOString(),
      },
    };
    await repository.save(updated);
    setData(updated);
    showToast(t('Pro subscription cancelled.'), 'info');
  }, [data, showToast]);

  const resetToDemo = useCallback(async () => {
    await repository.clear();
    await refreshData();
    showToast(t('Reset to clean initial state.'), 'info');
  }, [refreshData, showToast]);

  const resetAllData = useCallback(async () => {
    await repository.clear();
    await refreshData();
    showToast(t('All local data cleared and reset.'), 'info');
  }, [refreshData, showToast]);

  const importDataJson = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text) as UserData;
        if (!parsed || !parsed.profile || !Array.isArray(parsed.transactions)) {
          showToast(t('That file is not a One Decision Away backup.'), 'error');
          return;
        }
        await repository.replaceAll(parsed);
        await refreshData();
        showToast(t('Backup restored. Welcome back.'), 'success');
      } catch {
        showToast(t('Could not read the backup file.'), 'error');
      }
    },
    [refreshData, showToast]
  );

  const syncFromCloud = useCallback(async () => {
    const remote = await cloudSync.pullIfNewer(data);
    if (remote) {
      await repository.replaceAll(remote);
      await refreshData();
      showToast(t('Synced from cloud.'), 'success');
      return true;
    }
    return false;
  }, [data, refreshData, showToast]);

  const exportDataJson = useCallback(() => {
    if (!data) return;
    try {
      localStorage.setItem('oda_last_backup', new Date().toISOString());
    } catch {
      /* ignore */
    }
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `one-decision-away-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('Data exported to JSON file.'), 'success');
  }, [data, showToast]);

  const value: AppContextType = {
    data,
    isLoading,
    error,
    activeRoute,
    toast,
    activeFocusSession,
    activeGuidedCueIndex,
    isFocusLocked: activeFocusSession !== null,
    setActiveRoute,
    showToast,
    hideToast,
    refreshData,
    startFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    setFocusSoundTrack,
    setFocusVolume,
    addDistractionNote,
    cancelFocusSession,
    finishFocusSessionEarly,
    completeFocusSession,
    completeMission,
    purchaseItem,
    createRealityBridge,
    updateRealityBridgeSavings,
    saveLifeScores,
    saveTwoFutures,
    saveDefaultFuture,
    logDriftSignal,
    removeDriftEntry,
    saveFutureSelf,
    addMission,
    setOneDecision,
    addCustomDream,
    pinExploreDream,
    grantSimulationBonus,
    toggleInVision,
    reorderVisionItems,
    archiveMarketItem,
    restoreMarketItem,
    deleteArchivedRecord,
    updateBudget,
    saveLifeBudget,
    addDreamJournalEntry,
    deleteDreamJournalEntry,
    isQuickJournalOpen,
    openQuickJournal,
    closeQuickJournal,
    toggleQuickJournal,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleMicroHabit,
    addMicroHabit,
    updateMicroHabit,
    deleteMicroHabit,
    addCustomHabitCategory,
    deleteCustomHabitCategory,
    updateCustomHabitCategory,
    resetMicroHabitsToday,
    checkDailyMicroHabitsRollover,
    simulateDateKeyChange,
    lastRolloverSummary,
    saveDailyCheckIn,
    deleteDailyCheckIn,
    joinSeason,
    updateProfile,
    toggleTheme,
    setTheme,
    toggleSoundMute,
    setSoundMuted,
    toggleFocusTabBlink,
    toggleFocusScreenPulse,
    simulateFocusTimerAlert,
    isSimulatingFocusAlert,
    upgradeToPro,
    toggleProPlan,
    cancelSubscription,
    resetToDemo,
    resetAllData,
    exportDataJson,
    importDataJson,
    syncFromCloud,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
