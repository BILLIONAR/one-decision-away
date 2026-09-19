import type { Locale } from '../i18n';
/**
 * One Decision Away — Domain Models & Type Definitions
 * by AurelyStudio
 */

export type OnboardingStep = 'life_score' | 'two_futures' | 'future_self' | 'completed';

export interface Profile {
  id: string;
  displayName: string;
  email?: string;
  isPro?: boolean;
  onboardingStep: OnboardingStep;
  locale: Locale;
  theme: 'light' | 'dark';
  soundMuted?: boolean;
  focusTabBlinkEnabled?: boolean;
  focusScreenPulseEnabled?: boolean;
  reminderTime?: string;
  dailyWisdomEnabled?: boolean;
  dailyWisdomTime?: string;
  /** Daily motivational nudges (2–3 notifications a day) */
  nudgesEnabled?: boolean;
  nudgeTimes?: { morning: string; midday: string; evening: string };
  firstOpenedAt: string;
  lastOpenedAt: string;
  createdAt: string;
}

export interface LifeScoreCategories {
  money: number;
  workAndPurpose: number;
  health: number;
  relationships: number;
  discipline: number;
  environment: number;
  learning: number;
  personalMeaning: number;
}

export interface LifeScoreRecord {
  id: string;
  userId: string;
  scores: LifeScoreCategories;
  totalScore: number;
  lowestAreas: string[];
  interpretation: string;
  createdAt: string;
}

/** A recurring default-future habit and what it quietly costs. */
export interface DriftCostItem {
  id: string;
  label: string;
  minutesPerDay: number;
  dollarsPerMonth?: number;
}

/** One moment the user noticed themselves sliding toward the default future. */
export interface DriftLogEntry {
  id: string;
  dateKey: string; // YYYY-MM-DD
  signal: string;
  createdAt: string;
}

/** The enriched "life you're allowing" — the future you're running from. */
export interface DefaultFutureData {
  oneYear?: string;
  threeYears?: string;
  tenYears?: string;
  letterFromDefaultSelf?: string;
  costs?: DriftCostItem[];
  driftLog?: DriftLogEntry[];
  lastReviewedAt?: string;
}

export interface TwoFuturesData {
  allowingAnswers: Record<string, string>;
  buildingAnswers: Record<string, string>;
  antiVision: string;
  vision: string;
  buildingVotes: number;
  allowingVotes: number;
  defaultFuture?: DefaultFutureData;
  updatedAt: string;
}

export interface FutureSelfData {
  title: string;
  coreValues: string[];
  dailyStandards: string[];
  habits: string[];
  skills: string[];
  boundaries: string[];
  noLongerDoes: string[];
  identityStatement: string;
  oldSelfBehaviors: string[];
  oldSelfExcuses: string[];
  oldSelfPatterns: string[];
  oldSelfLabels: string[];
  updatedAt: string;
}

export type MissionType =
  | 'daily_quest'
  | 'weekly_mission'
  | 'monthly_boss_fight'
  | 'one_year_mission'
  | 'constraint';

export type MissionArea =
  | 'Work'
  | 'Money'
  | 'Health'
  | 'Learning'
  | 'Relationships'
  | 'Environment'
  | 'Personal Meaning'
  | 'Custom';

export type MissionDifficulty = 'easy' | 'medium' | 'hard';

export interface MissionReflection {
  completedSummary: string;
  resistanceNoticed: string;
  nextStep: string;
}

export interface Mission {
  id: string;
  userId: string;
  goalId?: string;
  purchaseId?: string;
  title: string;
  type: MissionType;
  area: MissionArea;
  difficulty: MissionDifficulty;
  estimatedMinutes?: number;
  isOneDecision: boolean;
  scheduledFor?: string; // YYYY-MM-DD
  recurring?: 'daily' | 'weekly';
  status: 'active' | 'completed' | 'archived';
  focusMinutesSpent?: number;
  note?: string;
  reflection?: MissionReflection;
  photoUrl?: string;
  createdAt: string;
  completedAt?: string;
}

export interface MissionCompletion {
  id: string;
  missionId: string;
  userId: string;
  completedAt: string;
  method: 'self' | 'timer' | 'photo';
  focusMinutes?: number;
  note?: string;
  reflection?: MissionReflection;
  rewardAmount: number;
  streakBonus: number;
}

export type FocusSoundTrack =
  | 'silence'
  | 'binaural'
  | 'rain'
  | 'waves'
  | 'brown_noise'
  | 'fireplace'
  | 'meditation_432hz'
  | 'solfeggio_528hz'
  | 'theta_meditation'
  | 'tibetan_bowls'
  | 'solfeggio_396hz'
  | 'solfeggio_639hz';

export interface ActiveFocusSession {
  id: string;
  missionId?: string;
  missionTitle: string;
  missionType?: MissionType;
  missionArea?: MissionArea;
  durationMinutes: number;
  remainingSeconds: number;
  totalSeconds: number;
  isPaused: boolean;
  soundTrack: FocusSoundTrack;
  volume: number;
  startedAt: string;
  distractionNotes: string[];
  /** Set when the session is a voice-guided meditation (see data/guidedMeditations.ts) */
  guidedMeditationId?: string;
}

export type TransactionKind =
  | 'mission_reward'
  | 'one_decision_reward'
  | 'focus_reward'
  | 'micro_habit_reward'
  | 'check_in_reward'
  | 'streak_bonus'
  | 'welcome_grant'
  | 'purchase'
  | 'season_reward'
  | 'adjustment';

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  kind: TransactionKind;
  amount: number; // positive = credit, negative = debit
  dayKey: string; // YYYY-MM-DD
  refType?: string;
  refId?: string;
  memo: string;
  createdAt: string;
}

export type MarketCategory =
  | 'Homes'
  | 'Cars & Mobility'
  | 'Luxury Watches'
  | 'Yachts & Aviation'
  | 'Travel'
  | 'Dream Workspace'
  | 'Technology'
  | 'Education'
  | 'Business'
  | 'Health & Wellness'
  | 'Experiences'
  | 'Giving'
  | 'Custom';

export type ArchiveReason =
  | 'completed'
  | 'acquired'
  | 'outgrown'
  | 'replaced'
  | 'no_longer_relevant'
  | 'other';

export interface ArchivedMarketRecord {
  id: string;
  itemId: string;
  itemSnapshot: MarketItem;
  archivedAt: string;
  reason: ArchiveReason;
  note?: string;
  wasOwned?: boolean;
  wasInVision?: boolean;
}

export interface MarketItem {
  id: string;
  name: string;
  category: MarketCategory;
  dreamDollarPrice: number;
  realPriceUsd: number;
  description: string;
  illustrationKey: string;
  customImageUrl?: string;
  isCustom?: boolean;
  isSeed?: boolean;
  targetDate?: string;
  whyWanted?: string;
  linkedGoal?: string;
  firstRealStep?: string;
  isArchived?: boolean;
  archivedAt?: string;
  archiveReason?: ArchiveReason;
  createdAt: string;
}

export interface Purchase {
  id: string;
  userId: string;
  itemId: string;
  dreamDollarPaid: number;
  itemSnapshot: MarketItem;
  purchasedAt: string;
}

export interface SavingsLogEntry {
  id: string;
  date: string;
  amountUsd: number;
  note?: string;
}

export interface RealityBridge {
  id: string;
  userId: string;
  purchaseId: string;
  realCostUsd: number;
  currentSavingsUsd: number;
  targetDate: string; // YYYY-MM-DD
  requiredMonthlySavingsUsd: number;
  requiredMonthlyIncomeUsd?: number;
  incomeProject: string;
  firstRealAction: string;
  nextMilestone: string;
  generatedMissionId?: string;
  realProgressPct: number;
  savingsLogs: SavingsLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  area: MissionArea;
  targetDate?: string;
  status: 'active' | 'achieved' | 'archived';
  createdAt: string;
}

export interface BudgetAllocations {
  housing: number;
  health: number;
  education: number;
  business: number;
  travel: number;
  savings: number;
  giving: number;
  lifestyle: number;
}

export interface LifeBudgetCategory {
  id: string;
  name: string;
  percentage: number;
  description: string;
}

export interface LifeBudgetData {
  totalAllocatedPct: number;
  categories: LifeBudgetCategory[];
}

export interface SeasonMission {
  id: string;
  title: string;
  area: MissionArea;
  difficulty: MissionDifficulty;
  rewardDreamDollar?: number;
}

export interface Season {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  theme?: string;
  durationDays?: number;
  startDate: string;
  endDate: string;
  badgeName: string;
  rewardBadgeTitle?: string;
  cosmeticReward: string;
  missions: SeasonMission[];
}

export interface SeasonProgress {
  seasonId: string;
  completedMissionIds: string[];
  isCompleted: boolean;
  completedAt?: string;
}

export interface Subscription {
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: 'free' | 'pro';
  status: 'active' | 'inactive' | 'grace_period';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  updatedAt: string;
}

export interface DreamJournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  photoDataUrl?: string;
  dreamId?: string;
  dreamName?: string;
  mood?: 'triumphant' | 'focused' | 'grateful' | 'visionary' | 'breakthrough';
  createdAt: string;
  updatedAt?: string;
}

export interface OfflineAction {
  id: string;
  action: 'complete_mission' | 'purchase_item';
  payload: Record<string, unknown>;
  createdAt: string;
}

export type StandardMicroHabitCategory =
  | 'Health'
  | 'Learning'
  | 'Discipline'
  | 'Mindset'
  | 'Clarity'
  | 'Craft'
  | 'Environment'
  | 'Wealth';

export type MicroHabitCategory = StandardMicroHabitCategory | string;

export interface CustomHabitCategory {
  id: string; // unique ID or slug, e.g. "custom-cat-deep-work"
  name: string; // User-facing name, e.g. "Deep Work", "Creativity"
  icon: string; // Lucide icon identifier name, e.g. "Zap", "Palette", "Dumbbell"
  color: string; // Unique hex color identifier, e.g. "#6366f1"
  description?: string;
  createdAt: string;
}

export interface MicroHabit {
  id: string;
  title: string;
  category: MicroHabitCategory;
  customCategoryId?: string; // Optional reference if tied to a custom category ID
  goalId?: string; // Optional reference linking this micro-habit to an overarching Life Goal ID
  durationMinutes: number; // e.g. 5m
  description?: string;
  completedDates: string[]; // YYYY-MM-DD
  streakCount: number;
  bestStreak?: number; // All-time best consecutive streak achieved from history
  createdAt: string;
}

export interface DailyCheckIn {
  id: string;
  dateKey: string; // YYYY-MM-DD
  focus: number; // 1 to 10
  energy: number; // 1 to 10
  mood: number; // 1 to 10
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserData {
  profile: Profile;
  lifeScores: LifeScoreRecord[];
  twoFutures: TwoFuturesData;
  futureSelf: FutureSelfData;
  goals: Goal[];
  missions: Mission[];
  completions: MissionCompletion[];
  transactions: WalletTransaction[];
  customMarketItems: MarketItem[];
  purchases: Purchase[];
  realityBridges: RealityBridge[];
  budget: BudgetAllocations;
  lifeBudget?: LifeBudgetData;
  activeSeason?: Season;
  seasonProgress: SeasonProgress[];
  subscription: Subscription;
  inVisionItemIds: string[];
  archivedMarketItemIds?: string[];
  archivedMarketRecords?: ArchivedMarketRecord[];
  dreamJournal?: DreamJournalEntry[];
  microHabits?: MicroHabit[];
  customHabitCategories?: CustomHabitCategory[];
  dailyPrimaryGoals?: DailyPrimaryGoal[];
  checkIns?: DailyCheckIn[];
  lastActiveDateKey?: string; // YYYY-MM-DD representing the last dateKey the app was active
  lastDailyResetTimestamp?: string; // ISO string of when daily habit auto-reset last executed
  offlineQueue: OfflineAction[];
}

export interface DailyPrimaryGoal {
  id?: string;
  dateKey: string; // YYYY-MM-DD
  title: string;
  completed: boolean;
  notes?: string;
  completedAt?: string;
}

export interface DailyMicroHabitRolloverSummary {
  hasChanged: boolean;
  previousDateKey?: string;
  currentDateKey: string;
  resetHabitsCount: number;
  brokenStreaksCount: number;
  timestamp: string;
}
