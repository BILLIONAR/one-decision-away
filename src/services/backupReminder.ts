import type { UserData } from '../types/models';

export const BACKUP_REMINDER_DAYS = 14;
const DAY_MS = 86_400_000;
const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export interface BackupReminderCloudStatus {
  configured: boolean;
  signedIn: boolean;
  /** Use CloudSync.getState(): it verifies the current account, project and local record scope. */
  lastSyncAt: string | null;
  error: string | null;
}

/** Saved personal work qualifies immediately; catalogue seeds and empty editor shells do not. */
export function hasMeaningfulBackupWork(data: Partial<UserData> | null | undefined): boolean {
  if (!data) return false;
  if (data.completions?.some(item => hasText(item.missionId) && hasText(item.completedAt))
    || data.missions?.some(item => item.isOneDecision && item.status === 'completed' && hasText(item.completedAt))
    || data.inVisionItemIds?.some(hasText)
    || hasText(data.twoFutures?.vision)
    || data.dreamJournal?.some(entry => hasText(entry.content) || hasText(entry.photoDataUrl))
    || data.weeklyReviews?.some(review => hasText(review.helped) || hasText(review.blocked) || hasText(review.change)
      || Number.isFinite(review.kept) && review.kept > 0)) return true;

  const notebook = data.notebook;
  if (notebook?.entries?.some(entry => hasText(entry.content))
    || notebook?.gratitudeDays?.some(day => day.items?.some(hasText))
    || notebook?.affirmations?.some(item => hasText(item.text))
    || notebook?.practices369?.some(practice => hasText(practice.intention)
      || Object.values(practice.days ?? {}).some(day => [day.morning, day.midday, day.evening].some(lines => lines?.some(hasText))))) return true;

  const courses = data.courseProgress;
  return Object.values(courses?.lessons ?? {}).some(lesson => lesson.completed === true
    || lesson.checked?.some(checked => checked === true)
    || Number.isInteger(lesson.answer) && lesson.answer !== null && lesson.answer >= 0
    || hasText(lesson.reflection))
    || Object.values(courses?.experiments ?? {}).some(experiment => [experiment.cue, experiment.action, experiment.fallback, experiment.evidence, experiment.reviewOn,
      experiment.review?.recall, experiment.review?.nextAction, experiment.review?.reviewedOn].some(hasText)
      || experiment.attempts?.some(attempt => hasText(attempt.id) && hasText(attempt.date)));
}

/** Only explicit, valid ISO instants at or before now can establish backup freshness. */
export function backupAgeDays(timestamp: string | null | undefined, now = Date.now()): number | null {
  if (typeof timestamp !== 'string' || !Number.isFinite(now)) return null;
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(timestamp);
  if (!match || Number(match[2]) > 23 || Number(match[3]) > 59 || Number(match[4]) > 59) return null;
  const calendarDay = new Date(`${match[1]}T00:00:00Z`);
  if (!Number.isFinite(calendarDay.getTime()) || calendarDay.toISOString().slice(0, 10) !== match[1]) return null;
  const savedAt = Date.parse(timestamp);
  if (!Number.isFinite(savedAt) || savedAt > now) return null;
  return Math.floor((now - savedAt) / DAY_MS);
}

export function hasRecentCloudBackup(cloud: BackupReminderCloudStatus | null | undefined, now = Date.now()): boolean {
  if (!cloud?.configured || !cloud.signedIn || cloud.error !== null) return false;
  const age = backupAgeDays(cloud.lastSyncAt, now);
  return age !== null && age < BACKUP_REMINDER_DAYS;
}

export function shouldShowBackupReminder({ data, dismissed = false, lastBackupAt, cloud, now = Date.now() }: {
  data: Partial<UserData> | null | undefined;
  dismissed?: boolean;
  lastBackupAt?: string | null;
  cloud?: BackupReminderCloudStatus | null;
  now?: number;
}): boolean {
  if (dismissed || !hasMeaningfulBackupWork(data)) return false;
  const exportAge = backupAgeDays(lastBackupAt, now);
  return !(exportAge !== null && exportAge < BACKUP_REMINDER_DAYS) && !hasRecentCloudBackup(cloud, now);
}
