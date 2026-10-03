import type { UserData } from '../types/models';
import { normalizeNotebook } from './notebook';
import { normalizeCourseProgress, readCourseProgress, type CourseProgress } from './courseProgress';
import { isPracticeDate } from './courseLearning';

type RecordValue = Record<string, unknown>;
const isRecord = (value: unknown): value is RecordValue => typeof value === 'object' && value !== null && !Array.isArray(value);
const own = (value: RecordValue, key: string) => Object.prototype.hasOwnProperty.call(value, key);

/** Invalid backups are rejected before touching the saved personal record. */
export class InvalidBackupError extends Error {
  constructor(public readonly field: string) {
    super(`Invalid One Decision Away backup: ${field}`);
    this.name = 'InvalidBackupError';
  }
}

function record(value: unknown, path: string): RecordValue {
  if (!isRecord(value)) throw new InvalidBackupError(path);
  return value;
}

function strings(value: unknown, path: string): void {
  if (!Array.isArray(value) || !value.every(item => typeof item === 'string')) throw new InvalidBackupError(path);
}

function fields(value: RecordValue, path: string, keys: string[], kind: 'string' | 'number' | 'boolean'): void {
  for (const key of keys) {
    if (typeof value[key] !== kind || (kind === 'number' && !Number.isFinite(value[key]))) throw new InvalidBackupError(`${path}.${key}`);
  }
}

function optionalFields(value: RecordValue, path: string, keys: string[], kind: 'string' | 'number' | 'boolean'): void {
  fields(value, path, keys.filter(key => own(value, key)), kind);
}

function calendarDay(value: unknown, path: string): void {
  if (!isPracticeDate(value)) throw new InvalidBackupError(path);
}

function instant(value: unknown, path: string): void {
  if (typeof value !== 'string' || !Number.isFinite(new Date(value).getTime())) throw new InvalidBackupError(path);
}

function marketItem(value: unknown, path: string): void {
  const item = record(value, path);
  fields(item, path, ['id', 'name', 'category', 'description', 'illustrationKey', 'createdAt'], 'string');
  fields(item, path, ['dreamDollarPrice', 'realPriceUsd'], 'number');
  optionalFields(item, path, ['customImageUrl', 'targetDate', 'whyWanted', 'linkedGoal', 'firstRealStep', 'archivedAt', 'archiveReason'], 'string');
  optionalFields(item, path, ['isCustom', 'isSeed', 'isArchived'], 'boolean');
}

function missionReflection(value: unknown, path: string): void {
  fields(record(value, path), path, ['completedSummary', 'resistanceNoticed', 'nextStep'], 'string');
}

function collection(root: RecordValue, key: string, required: boolean, validate?: (item: RecordValue, path: string) => void): void {
  if (!own(root, key) && !required) return;
  if (!Array.isArray(root[key])) throw new InvalidBackupError(key);
  for (const [index, item] of (root[key] as unknown[]).entries()) {
    const path = `${key}[${index}]`;
    const entry = record(item, path);
    validate?.(entry, path);
  }
}

function validateCourseProgress(value: unknown): void {
  const progress = record(value, 'courseProgress');
  if (progress.version !== 1) throw new InvalidBackupError('courseProgress.version');
  const lessons = record(progress.lessons, 'courseProgress.lessons');
  for (const [id, raw] of Object.entries(lessons)) {
    const path = `courseProgress.lessons.${id}`;
    const lesson = record(raw, path);
    if (!Array.isArray(lesson.checked) || !lesson.checked.every(item => typeof item === 'boolean')) throw new InvalidBackupError(`${path}.checked`);
    if (lesson.answer !== null && (!Number.isInteger(lesson.answer) || (lesson.answer as number) < 0)) throw new InvalidBackupError(`${path}.answer`);
    fields(lesson, path, ['reflection'], 'string');
    fields(lesson, path, ['completed'], 'boolean');
  }
  if (own(progress, 'experiments')) {
    const experiments = record(progress.experiments, 'courseProgress.experiments');
    for (const [id, raw] of Object.entries(experiments)) {
      const path = `courseProgress.experiments.${id}`;
      const experiment = record(raw, path);
      for (const key of ['cue', 'action', 'fallback', 'evidence']) if (own(experiment, key)) fields(experiment, path, [key], 'string');
      if (own(experiment, 'reviewOn') && experiment.reviewOn !== null) calendarDay(experiment.reviewOn, `${path}.reviewOn`);
      if (own(experiment, 'attempts')) {
        collection(experiment, 'attempts', true, (attempt, itemPath) => {
          fields(attempt, itemPath, ['id', 'date', 'outcome', 'note'], 'string');
          // Import must not report success after normalization discards a private log.
          calendarDay(attempt.date, `${path}.${itemPath}.date`);
          if (!['tried', 'adapted', 'paused'].includes(attempt.outcome as string)) throw new InvalidBackupError(`${path}.attempts.outcome`);
        });
      }
      if (own(experiment, 'review')) {
        const review = record(experiment.review, `${path}.review`);
        fields(review, `${path}.review`, ['recall', 'nextAction'], 'string');
        if (review.reviewedOn !== null) calendarDay(review.reviewedOn, `${path}.review.reviewedOn`);
      }
    }
  }
}

function validateNotebook(value: unknown): void {
  const notebook = record(value, 'notebook');
  if (notebook.version !== undefined && notebook.version !== 1) throw new InvalidBackupError('notebook.version');
  collection(notebook, 'entries', false, (entry, path) => {
    fields(entry, path, ['id', 'kind', 'title', 'content', 'dateKey', 'createdAt', 'updatedAt'], 'string');
    optionalFields(entry, path, ['mood', 'promptId'], 'string');
    calendarDay(entry.dateKey, `${path}.dateKey`);
    if (!['journal', 'scripting', 'future_letter'].includes(entry.kind as string)) throw new InvalidBackupError(`${path}.kind`);
  });
  collection(notebook, 'affirmations', false, (entry, path) => fields(entry, path, ['id', 'text', 'createdAt', 'updatedAt'], 'string'));
  collection(notebook, 'gratitudeDays', false, (entry, path) => {
    fields(entry, path, ['dateKey', 'createdAt', 'updatedAt'], 'string'); strings(entry.items, `${path}.items`);
    calendarDay(entry.dateKey, `${path}.dateKey`);
  });
  collection(notebook, 'activityDays', false, (entry, path) => {
    fields(entry, path, ['dateKey', 'firstRecordedAt', 'economyDayKey'], 'string'); fields(entry, path, ['rewardAmount'], 'number');
    optionalFields(entry, path, ['transactionId'], 'string');
    calendarDay(entry.dateKey, `${path}.dateKey`); calendarDay(entry.economyDayKey, `${path}.economyDayKey`);
  });
  collection(notebook, 'practices369', false, (entry, path) => {
    fields(entry, path, ['id', 'intention', 'startDateKey', 'createdAt', 'updatedAt'], 'string');
    optionalFields(entry, path, ['archivedAt'], 'string');
    calendarDay(entry.startDateKey, `${path}.startDateKey`);
    const days = record(entry.days, `${path}.days`);
    for (const [key, raw] of Object.entries(days)) {
      calendarDay(key, `${path}.days.${key}`);
      const day = record(raw, `${path}.days.${key}`);
      optionalFields(day, `${path}.days.${key}`, ['updatedAt'], 'string');
      for (const slot of ['morning', 'midday', 'evening']) if (own(day, slot)) strings(day[slot], `${path}.days.${key}.${slot}`);
    }
  });
}

/** Legacy exports omit courseProgress; restoring them keeps existing course work. */
export function prepareBackupRestore(value: unknown, existingCourses: CourseProgress = readCourseProgress()): UserData {
  const backup = record(value, 'document');
  const profile = record(backup.profile, 'profile');
  fields(profile, 'profile', ['id', 'displayName', 'createdAt', 'firstOpenedAt', 'lastOpenedAt'], 'string');
  optionalFields(profile, 'profile', ['email', 'locale', 'theme', 'onboardingStep', 'reminderTime', 'dailyWisdomTime', 'intent', 'nudgeMode', 'reminderAskedAt'], 'string');
  optionalFields(profile, 'profile', ['isPro', 'soundMuted', 'focusTabBlinkEnabled', 'focusScreenPulseEnabled', 'dailyWisdomEnabled', 'nudgesEnabled', 'simpleModeOff'], 'boolean');
  if (own(profile, 'nudgeTimes')) {
    const times = record(profile.nudgeTimes, 'profile.nudgeTimes');
    optionalFields(times, 'profile.nudgeTimes', ['morning', 'lateMorning', 'midday', 'afternoon', 'evening', 'night'], 'string');
  }
  if (own(profile, 'nextDecisionDraft')) fields(record(profile.nextDecisionDraft, 'profile.nextDecisionDraft'), 'profile.nextDecisionDraft', ['text', 'forDay'], 'string');
  if (own(profile, 'twoWeekCheckIn')) {
    const review = record(profile.twoWeekCheckIn, 'profile.twoWeekCheckIn');
    fields(review, 'profile.twoWeekCheckIn', ['answer', 'at'], 'string');
    optionalFields(review, 'profile.twoWeekCheckIn', ['note'], 'string');
  }
  const futures = record(backup.twoFutures, 'twoFutures');
  fields(futures, 'twoFutures', ['antiVision', 'vision', 'updatedAt'], 'string');
  fields(futures, 'twoFutures', ['buildingVotes', 'allowingVotes'], 'number');
  for (const key of ['allowingAnswers', 'buildingAnswers']) {
    const answers = record(futures[key], `twoFutures.${key}`);
    if (!Object.values(answers).every(item => typeof item === 'string')) throw new InvalidBackupError(`twoFutures.${key}`);
  }
  if (own(futures, 'defaultFuture')) {
    const future = record(futures.defaultFuture, 'twoFutures.defaultFuture');
    optionalFields(future, 'twoFutures.defaultFuture', ['oneYear', 'threeYears', 'tenYears', 'letterFromDefaultSelf', 'lastReviewedAt'], 'string');
    collection(future, 'costs', false, (item, path) => { fields(item, path, ['id', 'label'], 'string'); fields(item, path, ['minutesPerDay'], 'number'); optionalFields(item, path, ['dollarsPerMonth'], 'number'); });
    collection(future, 'driftLog', false, (item, path) => fields(item, path, ['id', 'dateKey', 'signal', 'createdAt'], 'string'));
  }
  const futureSelf = record(backup.futureSelf, 'futureSelf');
  fields(futureSelf, 'futureSelf', ['title', 'identityStatement', 'updatedAt'], 'string');
  for (const key of ['coreValues', 'dailyStandards', 'habits', 'skills', 'boundaries', 'noLongerDoes', 'oldSelfBehaviors', 'oldSelfExcuses', 'oldSelfPatterns', 'oldSelfLabels']) strings(futureSelf[key], `futureSelf.${key}`);
  fields(record(backup.budget, 'budget'), 'budget', ['housing', 'health', 'education', 'business', 'travel', 'savings', 'giving', 'lifestyle'], 'number');
  const subscription = record(backup.subscription, 'subscription');
  fields(subscription, 'subscription', ['userId', 'plan', 'status', 'updatedAt'], 'string');
  fields(subscription, 'subscription', ['cancelAtPeriodEnd'], 'boolean');
  collection(backup, 'transactions', true, (entry, path) => { fields(entry, path, ['id', 'walletId', 'userId', 'kind', 'dayKey', 'createdAt'], 'string'); fields(entry, path, ['amount'], 'number'); optionalFields(entry, path, ['memo', 'refType', 'refId'], 'string'); });
  collection(backup, 'missions', false, (entry, path) => {
    fields(entry, path, ['id', 'title', 'createdAt', 'status'], 'string'); fields(entry, path, ['isOneDecision'], 'boolean');
    optionalFields(entry, path, ['userId', 'goalId', 'purchaseId', 'type', 'area', 'difficulty', 'scheduledFor', 'recurring', 'note', 'photoUrl', 'completedAt', 'startedAt'], 'string');
    optionalFields(entry, path, ['estimatedMinutes', 'focusMinutesSpent'], 'number');
    if (own(entry, 'reflection')) missionReflection(entry.reflection, `${path}.reflection`);
    if (own(entry, 'plan')) optionalFields(record(entry.plan, `${path}.plan`), `${path}.plan`, ['feeling', 'obstacle', 'ifThen', 'plannedAt'], 'string');
  });
  collection(backup, 'completions', true, (entry, path) => {
    fields(entry, path, ['id', 'missionId', 'completedAt'], 'string'); fields(entry, path, ['rewardAmount'], 'number');
    optionalFields(entry, path, ['userId', 'method', 'note'], 'string'); optionalFields(entry, path, ['focusMinutes', 'streakBonus'], 'number');
    if (own(entry, 'reflection')) missionReflection(entry.reflection, `${path}.reflection`);
  });
  collection(backup, 'goals', false, (entry, path) => { fields(entry, path, ['id', 'title', 'status'], 'string'); optionalFields(entry, path, ['userId', 'description', 'area', 'targetDate', 'createdAt'], 'string'); });
  collection(backup, 'microHabits', false, (entry, path) => {
    fields(entry, path, ['id', 'title', 'createdAt'], 'string'); strings(entry.completedDates, `${path}.completedDates`);
    optionalFields(entry, path, ['category', 'customCategoryId', 'goalId', 'description'], 'string'); optionalFields(entry, path, ['durationMinutes', 'streakCount', 'bestStreak'], 'number');
  });
  collection(backup, 'dailyPrimaryGoals', false, (entry, path) => { fields(entry, path, ['dateKey', 'title'], 'string'); fields(entry, path, ['completed'], 'boolean'); optionalFields(entry, path, ['id', 'notes', 'completedAt'], 'string'); });
  collection(backup, 'dreamJournal', false, (entry, path) => {
    fields(entry, path, ['id', 'title', 'content', 'createdAt'], 'string'); optionalFields(entry, path, ['userId', 'photoDataUrl', 'dreamId', 'dreamName', 'mood', 'updatedAt'], 'string');
    instant(entry.createdAt, `${path}.createdAt`);
  });
  collection(backup, 'seasonProgress', true, (entry, path) => { fields(entry, path, ['seasonId'], 'string'); strings(entry.completedMissionIds, `${path}.completedMissionIds`); fields(entry, path, ['isCompleted'], 'boolean'); });
  collection(backup, 'weeklyReviews', false, (entry, path) => { fields(entry, path, ['weekKey', 'createdAt'], 'string'); fields(entry, path, ['kept'], 'number'); optionalFields(entry, path, ['helped', 'blocked', 'change'], 'string'); });
  collection(backup, 'checkIns', false, (entry, path) => { fields(entry, path, ['id', 'dateKey', 'createdAt'], 'string'); fields(entry, path, ['focus', 'energy', 'mood'], 'number'); optionalFields(entry, path, ['notes', 'updatedAt'], 'string'); });
  collection(backup, 'customHabitCategories', false, (entry, path) => { fields(entry, path, ['id', 'name', 'icon', 'color', 'createdAt'], 'string'); optionalFields(entry, path, ['description'], 'string'); });
  collection(backup, 'lifeScores', false, (entry, path) => {
    fields(entry, path, ['id', 'userId', 'interpretation', 'createdAt'], 'string'); fields(entry, path, ['totalScore'], 'number'); strings(entry.lowestAreas, `${path}.lowestAreas`);
    fields(record(entry.scores, `${path}.scores`), `${path}.scores`, ['money', 'workAndPurpose', 'health', 'relationships', 'discipline', 'environment', 'learning', 'personalMeaning'], 'number');
  });
  collection(backup, 'customMarketItems', false, marketItem);
  collection(backup, 'purchases', false, (entry, path) => { fields(entry, path, ['id', 'userId', 'itemId', 'purchasedAt'], 'string'); fields(entry, path, ['dreamDollarPaid'], 'number'); marketItem(entry.itemSnapshot, `${path}.itemSnapshot`); });
  collection(backup, 'archivedMarketRecords', false, (entry, path) => { fields(entry, path, ['id', 'itemId', 'archivedAt', 'reason'], 'string'); optionalFields(entry, path, ['note'], 'string'); optionalFields(entry, path, ['wasOwned', 'wasInVision'], 'boolean'); marketItem(entry.itemSnapshot, `${path}.itemSnapshot`); });
  collection(backup, 'realityBridges', false, (entry, path) => {
    fields(entry, path, ['id', 'userId', 'purchaseId', 'targetDate', 'incomeProject', 'firstRealAction', 'nextMilestone', 'createdAt', 'updatedAt'], 'string');
    fields(entry, path, ['realCostUsd', 'currentSavingsUsd', 'requiredMonthlySavingsUsd', 'realProgressPct'], 'number'); optionalFields(entry, path, ['requiredMonthlyIncomeUsd'], 'number'); optionalFields(entry, path, ['generatedMissionId'], 'string');
    collection(entry, 'savingsLogs', true, (log, logPath) => { fields(log, logPath, ['id', 'date'], 'string'); fields(log, logPath, ['amountUsd'], 'number'); optionalFields(log, logPath, ['note'], 'string'); });
  });
  collection(backup, 'offlineQueue', true, (entry, path) => { fields(entry, path, ['id', 'action', 'createdAt'], 'string'); record(entry.payload, `${path}.payload`); });
  if (own(backup, 'dreamPlans')) for (const [id, raw] of Object.entries(record(backup.dreamPlans, 'dreamPlans'))) {
    const plan = record(raw, `dreamPlans.${id}`); fields(plan, `dreamPlans.${id}`, ['updatedAt'], 'string'); optionalFields(plan, `dreamPlans.${id}`, ['obstacle', 'step'], 'string');
  }
  if (own(backup, 'lifeBudget')) {
    const budget = record(backup.lifeBudget, 'lifeBudget'); fields(budget, 'lifeBudget', ['totalAllocatedPct'], 'number');
    collection(budget, 'categories', true, (category, path) => { fields(category, path, ['id', 'name', 'description'], 'string'); fields(category, path, ['percentage'], 'number'); });
  }
  if (own(backup, 'activeSeason')) {
    const season = record(backup.activeSeason, 'activeSeason');
    fields(season, 'activeSeason', ['id', 'title', 'subtitle', 'description', 'startDate', 'endDate', 'badgeName', 'cosmeticReward'], 'string');
    optionalFields(season, 'activeSeason', ['theme', 'rewardBadgeTitle'], 'string'); optionalFields(season, 'activeSeason', ['durationDays'], 'number');
    collection(season, 'missions', true, (mission, path) => { fields(mission, path, ['id', 'title', 'area', 'difficulty'], 'string'); optionalFields(mission, path, ['rewardDreamDollar'], 'number'); });
  }
  optionalFields(backup, 'document', ['lastActiveDateKey', 'lastDailyResetTimestamp'], 'string');
  for (const key of ['inVisionItemIds', 'archivedMarketItemIds']) if (own(backup, key)) strings(backup[key], key);
  if (own(backup, 'notebook')) validateNotebook(backup.notebook);
  if (own(backup, 'courseProgress')) validateCourseProgress(backup.courseProgress);
  const courses = own(backup, 'courseProgress') ? backup.courseProgress : existingCourses;
  return {
    ...backup,
    notebook: normalizeNotebook(backup.notebook as UserData['notebook']),
    courseProgress: normalizeCourseProgress(courses),
  } as unknown as UserData;
}

/** Always capture the latest saved course work, even if a React screen has an older snapshot. */
export function createBackupSnapshot(data: UserData): UserData {
  return { ...data, notebook: normalizeNotebook(data.notebook), courseProgress: readCourseProgress(data.courseProgress) };
}

export function summarizeBackup(data: UserData) {
  const courses = normalizeCourseProgress(data.courseProgress);
  const notebook = normalizeNotebook(data.notebook);
  return {
    decisions: (data.missions ?? []).filter(mission => mission.isOneDecision).length,
    notebookEntries: notebook.entries.length + notebook.gratitudeDays.length + notebook.affirmations.length + (data.dreamJournal?.length ?? 0),
    courseLessons: Object.values(courses.lessons).filter(lesson => lesson.completed).length,
    courseNotes: Object.values(courses.lessons).filter(lesson => lesson.reflection.trim().length > 0).length,
    practiceRecords: Object.values(courses.experiments ?? {}).reduce((total, experiment) => total + experiment.attempts.length, 0),
  };
}
