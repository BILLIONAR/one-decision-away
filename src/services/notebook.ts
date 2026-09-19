import type {
  DreamJournalEntry, Notebook369Day, Notebook369Practice, Notebook369Slot,
  NotebookData, NotebookEntryInput, NotebookEntryKind, NotebookMutationResult,
  UserData, WalletTransaction,
} from '../types/models';
import { ECONOMY_CONSTANTS, getNotebookRewardAmount } from './economy';
import { N_, t } from '../i18n';

export const NOTEBOOK_DAILY_REWARD = ECONOMY_CONSTANTS.NOTEBOOK_DAILY_REWARD;
export const NOTEBOOK_369_TARGET_DAYS = 33;
export const NOTEBOOK_369_SLOT_COUNTS: Record<Notebook369Slot, number> = {
  morning: 3, midday: 6, evening: 9,
};

export function getNotebookDateKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function validDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00`);
  return !Number.isNaN(parsed.getTime()) && getNotebookDateKey(parsed) === value;
}

function previousDay(value: string): string {
  const day = new Date(`${value}T12:00:00`);
  day.setDate(day.getDate() - 1);
  return getNotebookDateKey(day);
}

function dayFromInstant(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : getNotebookDateKey(date);
}

export function normalizeNotebook(value?: Partial<NotebookData> | null): NotebookData {
  return {
    ...value,
    version: 1,
    revision: Number.isSafeInteger(value?.revision) && value!.revision! >= 0 ? value!.revision! : 0,
    entries: Array.isArray(value?.entries) ? value.entries : [],
    practices369: Array.isArray(value?.practices369) ? value.practices369.map((practice) => ({
      ...practice,
      days: practice.days && typeof practice.days === 'object' && !Array.isArray(practice.days)
        ? Object.fromEntries(Object.entries(practice.days).map(([key, day]) => [key, {
          ...day,
          morning: Array.isArray(day?.morning) ? day.morning : [],
          midday: Array.isArray(day?.midday) ? day.midday : [],
          evening: Array.isArray(day?.evening) ? day.evening : [],
        }])) : {},
    })) : [],
    gratitudeDays: Array.isArray(value?.gratitudeDays) ? value.gratitudeDays : [],
    affirmations: Array.isArray(value?.affirmations) ? value.affirmations : [],
    activityDays: Array.isArray(value?.activityDays) ? value.activityDays : [],
  };
}

export interface NotebookDisplayEntry {
  source: 'notebook' | 'dream';
  id: string;
  viewId: string;
  kind: NotebookEntryKind;
  title: string;
  content: string;
  dateKey: string;
  mood?: string;
  promptId?: string;
  photoDataUrl?: string;
  dreamId?: string;
  dreamName?: string;
  createdAt: string;
  updatedAt?: string;
}

export function getNotebookEntries(
  data: UserData,
  options: { kinds?: NotebookEntryKind[]; query?: string; dateKey?: string } = {},
): NotebookDisplayEntry[] {
  const notebookEntries: NotebookDisplayEntry[] = normalizeNotebook(data.notebook).entries.map((entry) => ({
    ...entry, source: 'notebook', viewId: `notebook:${entry.id}`,
  }));
  const dreams: NotebookDisplayEntry[] = (data.dreamJournal || []).map((entry) => ({
    ...entry, source: 'dream', viewId: `dream:${entry.id}`, kind: 'journal', dateKey: dayFromInstant(entry.createdAt),
  }));
  const query = (options.query || '').trim().toLocaleLowerCase();
  return [...notebookEntries, ...dreams]
    .filter((entry) => (!options.kinds || options.kinds.includes(entry.kind))
      && (!options.dateKey || entry.dateKey === options.dateKey)
      && (!query || [entry.title, entry.content, entry.dreamName || '']
        .some((text) => text.toLocaleLowerCase().includes(query) || t(text).toLocaleLowerCase().includes(query))))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.viewId.localeCompare(b.viewId));
}

function streaks(dates: string[], today: string): { currentStreak: number; bestStreak: number } {
  const ordered = [...new Set(dates.filter((date) => validDateKey(date) && date <= today))].sort();
  const available = new Set(ordered);
  let currentStreak = 0;
  let cursor = available.has(today) ? today : previousDay(today);
  while (available.has(cursor)) {
    currentStreak += 1;
    cursor = previousDay(cursor);
  }
  let bestStreak = 0;
  let run = 0;
  let last = '';
  for (const day of ordered) {
    run = previousDay(day) === last ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    last = day;
  }
  return { currentStreak, bestStreak };
}

export interface NotebookStats {
  currentStreak: number;
  bestStreak: number;
  totalWritingDays: number;
  writtenToday: boolean;
  rewardedToday: number;
  activityDateKeys: string[];
}

export function getNotebookStats(data: UserData, now = new Date()): NotebookStats {
  const notebook = normalizeNotebook(data.notebook);
  const today = getNotebookDateKey(now);
  // Legacy entries are included in continuity without manufacturing historical reward claims.
  const activityDateKeys = [...new Set([
    ...notebook.activityDays.map((day) => day.dateKey),
    ...(data.dreamJournal || []).filter((entry) => entry.content.trim()).map((entry) => dayFromInstant(entry.createdAt)),
  ].filter((date) => validDateKey(date) && date <= today))].sort();
  return {
    ...streaks(activityDateKeys, today), activityDateKeys,
    totalWritingDays: activityDateKeys.length,
    writtenToday: activityDateKeys.includes(today),
    rewardedToday: notebook.activityDays.find((day) => day.dateKey === today)?.rewardAmount || 0,
  };
}

export interface Notebook369Progress {
  todayDateKey: string;
  counts: Record<Notebook369Slot, number>;
  completedSlots: Record<Notebook369Slot, boolean>;
  completedToday: boolean;
  completedDateKeys: string[];
  totalCompletedDays: number;
  currentStreak: number;
  bestStreak: number;
  targetDays: number;
  progressPercent: number;
  targetReached: boolean;
}

function countLines(lines?: string[]): number {
  return (lines || []).filter((line) => typeof line === 'string' && line.trim()).length;
}

export function normalize369Text(text: string): string {
  return text.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Accept default and Turkish case pairs without discarding accents or depending on UI locale. */
export function matches369Intention(text: string, intention: string): boolean {
  if (normalize369Text(text) === normalize369Text(intention)) return true;
  const turkishFold = (value: string) => value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr');
  return turkishFold(text) === turkishFold(intention);
}

function countRepetitions(lines: string[] | undefined, intention: string): number {
  return (lines || []).filter((line) => typeof line === 'string' && !!line.trim() && matches369Intention(line, intention)).length;
}

export function get369Progress(practice: Notebook369Practice, now = new Date()): Notebook369Progress {
  const todayDateKey = getNotebookDateKey(now);
  const day = practice.days?.[todayDateKey];
  const counts = { morning: countRepetitions(day?.morning, practice.intention), midday: countRepetitions(day?.midday, practice.intention), evening: countRepetitions(day?.evening, practice.intention) };
  const completedSlots = { morning: counts.morning === 3, midday: counts.midday === 6, evening: counts.evening === 9 };
  const completedDateKeys = Object.entries(practice.days || {})
    .filter(([key, value]) => validDateKey(key) && key <= todayDateKey
      && countRepetitions(value.morning, practice.intention) === 3 && countRepetitions(value.midday, practice.intention) === 6 && countRepetitions(value.evening, practice.intention) === 9)
    .map(([key]) => key).sort();
  const streak = streaks(completedDateKeys, todayDateKey);
  return {
    todayDateKey, counts, completedSlots, completedDateKeys, ...streak,
    completedToday: completedSlots.morning && completedSlots.midday && completedSlots.evening,
    totalCompletedDays: completedDateKeys.length,
    targetDays: NOTEBOOK_369_TARGET_DAYS,
    progressPercent: Math.min(100, streak.currentStreak / NOTEBOOK_369_TARGET_DAYS * 100),
    targetReached: streak.bestStreak >= NOTEBOOK_369_TARGET_DAYS,
  };
}

type DreamPatch = Partial<Pick<DreamJournalEntry, 'title' | 'content' | 'mood' | 'photoDataUrl' | 'dreamId' | 'dreamName'>>;
export type NotebookAction =
  | { type: 'save_entry'; input: NotebookEntryInput }
  | { type: 'delete_entry'; id: string }
  | { type: 'add_dream'; input: Omit<DreamJournalEntry, 'id' | 'createdAt' | 'userId'> }
  | { type: 'update_dream'; id: string; patch: DreamPatch }
  | { type: 'delete_dream'; id: string }
  | { type: 'start_369'; intention: string }
  | { type: 'archive_369'; id: string }
  | { type: 'save_369'; practiceId: string; dateKey: string; slot: Notebook369Slot; writtenLines: string[] }
  | { type: 'save_gratitude'; dateKey: string; items: string[] }
  | { type: 'save_affirmation'; input: { id?: string; text: string } }
  | { type: 'delete_affirmation'; id: string };

export interface NotebookUpdateResult {
  data: UserData;
  result: NotebookMutationResult | Notebook369Practice | undefined;
}

function requireText(value: string): void {
  if (typeof value !== 'string' || !value.trim()) throw new Error(t('Write something before saving.'));
}

function requireDate(dateKey: string, today: string): void {
  if (!validDateKey(dateKey)) throw new Error(t('Choose a valid calendar date.'));
  if (dateKey > today) throw new Error(t('Future dates cannot be recorded yet.'));
}

function requireLines(lines: string[], max: number): void {
  if (!Array.isArray(lines) || lines.length > max || lines.some((line) => typeof line !== 'string')) {
    throw new Error(t('This practice has a fixed number of writing spaces.'));
  }
}

let idSequence = 0;
function newId(): string {
  return globalThis.crypto?.randomUUID?.() || `notebook-${Date.now()}-${++idSequence}-${Math.random().toString(36).slice(2)}`;
}

/** Pure atomic command: callers persist the returned document once, inside the repository queue. */
export function applyNotebookAction(data: UserData, action: NotebookAction, now = new Date()): NotebookUpdateResult {
  const notebook = normalizeNotebook(data.notebook);
  const next = { ...notebook };
  const timestamp = now.toISOString();
  const today = getNotebookDateKey(now);
  let dreams = data.dreamJournal || [];
  let savedId = '';
  let newWritingToday = false;
  let changed = true;
  let practiceResult: Notebook369Practice | undefined;
  const missing = () => { throw new Error(t('This notebook record no longer exists.')); };

  switch (action.type) {
    case 'save_entry': {
      const input = action.input;
      requireText(input.content);
      if (!['journal', 'scripting', 'future_letter'].includes(input.kind)) throw new Error(t('Choose a valid notebook entry type.'));
      const old = input.id ? next.entries.find((entry) => entry.id === input.id) : undefined;
      if (input.id && !old) missing();
      savedId = old?.id || newId();
      const entry = {
        ...old, id: savedId, kind: input.kind, title: input.title ?? old?.title ?? '', content: input.content,
        mood: input.mood, promptId: input.promptId, dateKey: old?.dateKey || today,
        createdAt: old?.createdAt || timestamp, updatedAt: timestamp,
      };
      if (entry.mood === undefined) delete entry.mood;
      if (entry.promptId === undefined) delete entry.promptId;
      changed = !old || JSON.stringify({ ...entry, updatedAt: old.updatedAt }) !== JSON.stringify(old);
      if (changed) next.entries = old ? next.entries.map((item) => item.id === savedId ? entry : item) : [entry, ...next.entries];
      newWritingToday = !old;
      break;
    }
    case 'delete_entry':
      savedId = action.id;
      next.entries = next.entries.filter((entry) => entry.id !== action.id);
      changed = next.entries.length !== notebook.entries.length;
      break;
    case 'add_dream': {
      requireText(action.input.content);
      savedId = newId();
      dreams = [{ ...action.input, id: savedId, userId: data.profile.id, createdAt: timestamp, updatedAt: timestamp }, ...dreams];
      newWritingToday = true;
      break;
    }
    case 'update_dream': {
      const old = dreams.find((entry) => entry.id === action.id);
      if (!old) missing();
      requireText(action.patch.content ?? old!.content);
      savedId = action.id;
      const entry = { ...old!, ...action.patch, updatedAt: timestamp };
      changed = JSON.stringify({ ...entry, updatedAt: old!.updatedAt }) !== JSON.stringify(old);
      if (changed) dreams = dreams.map((item) => item.id === savedId ? entry : item);
      break;
    }
    case 'delete_dream':
      savedId = action.id;
      dreams = dreams.filter((entry) => entry.id !== action.id);
      changed = dreams.length !== (data.dreamJournal || []).length;
      break;
    case 'start_369':
      requireText(action.intention);
      savedId = newId();
      practiceResult = { id: savedId, intention: action.intention, startDateKey: today, days: {}, createdAt: timestamp, updatedAt: timestamp };
      next.practices369 = [practiceResult, ...next.practices369.map((practice) => practice.archivedAt ? practice : { ...practice, archivedAt: timestamp, updatedAt: timestamp })];
      break;
    case 'archive_369':
      savedId = action.id;
      if (!next.practices369.some((practice) => practice.id === action.id)) missing();
      changed = next.practices369.some((practice) => practice.id === action.id && !practice.archivedAt);
      next.practices369 = next.practices369.map((practice) => practice.id === action.id && !practice.archivedAt ? { ...practice, archivedAt: timestamp, updatedAt: timestamp } : practice);
      break;
    case 'save_369': {
      requireDate(action.dateKey, today);
      if (!Object.hasOwn(NOTEBOOK_369_SLOT_COUNTS, action.slot)) throw new Error(t('Choose a valid writing session.'));
      requireLines(action.writtenLines, NOTEBOOK_369_SLOT_COUNTS[action.slot]);
      const practice = next.practices369.find((item) => item.id === action.practiceId);
      if (!practice) missing();
      if (practice!.archivedAt) throw new Error(t('This intention is archived. Start a new practice to write again.'));
      if (action.writtenLines.some((line) => line.trim() && !matches369Intention(line, practice!.intention))) {
        throw new Error(t('Each repetition must match your chosen intention.'));
      }
      if (action.dateKey < practice!.startDateKey) throw new Error(t('This date is before the practice began.'));
      savedId = action.practiceId;
      const priorDay = practice!.days[action.dateKey];
      if (!priorDay && action.dateKey !== today) throw new Error(t('Past days can be edited, but new records belong to today.'));
      const day: Notebook369Day = priorDay || { morning: [], midday: [], evening: [], updatedAt: timestamp };
      changed = JSON.stringify(day[action.slot]) !== JSON.stringify(action.writtenLines)
        && (!!priorDay || countLines(action.writtenLines) > 0);
      newWritingToday = action.dateKey === today && countLines(action.writtenLines) > 0
        && !countLines(day.morning) && !countLines(day.midday) && !countLines(day.evening);
      if (changed) next.practices369 = next.practices369.map((item) => item.id === action.practiceId ? {
        ...item, updatedAt: timestamp,
        days: { ...item.days, [action.dateKey]: { ...day, [action.slot]: [...action.writtenLines], updatedAt: timestamp } },
      } : item);
      break;
    }
    case 'save_gratitude': {
      requireDate(action.dateKey, today);
      requireLines(action.items, 5);
      savedId = `gratitude:${action.dateKey}`;
      const old = next.gratitudeDays.find((day) => day.dateKey === action.dateKey);
      if (!old && action.dateKey !== today) throw new Error(t('Past days can be edited, but new records belong to today.'));
      changed = JSON.stringify(old?.items || []) !== JSON.stringify(action.items)
        && (!!old || countLines(action.items) > 0);
      newWritingToday = !countLines(old?.items) && countLines(action.items) > 0 && action.dateKey === today;
      const day = { dateKey: action.dateKey, items: [...action.items], createdAt: old?.createdAt || timestamp, updatedAt: timestamp };
      if (changed) next.gratitudeDays = old ? next.gratitudeDays.map((item) => item.dateKey === action.dateKey ? day : item) : [day, ...next.gratitudeDays];
      break;
    }
    case 'save_affirmation': {
      requireText(action.input.text);
      const old = action.input.id ? next.affirmations.find((item) => item.id === action.input.id) : undefined;
      if (action.input.id && !old) missing();
      savedId = old?.id || newId();
      changed = !old || old.text !== action.input.text;
      const affirmation = { id: savedId, text: action.input.text, createdAt: old?.createdAt || timestamp, updatedAt: timestamp };
      if (changed) next.affirmations = old ? next.affirmations.map((item) => item.id === savedId ? affirmation : item) : [affirmation, ...next.affirmations];
      newWritingToday = !old;
      break;
    }
    case 'delete_affirmation':
      savedId = action.id;
      next.affirmations = next.affirmations.filter((item) => item.id !== action.id);
      changed = next.affirmations.length !== notebook.affirmations.length;
      break;
  }

  const result: NotebookMutationResult = { savedId, rewardAmount: 0, firstActivityToday: false };
  if (!changed) return { data, result };
  let transactions = data.transactions;
  if (newWritingToday && !next.activityDays.some((day) => day.dateKey === today)) {
    const transactionId = `notebook:${data.profile.id}:${today}`;
    const existingTransaction = transactions.find((transaction) => transaction.id === transactionId);
    const rewardAmount = existingTransaction ? 0 : getNotebookRewardAmount(transactions, now);
    const activity = {
      dateKey: today, firstRecordedAt: timestamp, economyDayKey: timestamp.slice(0, 10),
      rewardAmount: existingTransaction?.amount ?? rewardAmount,
      ...(rewardAmount > 0 || existingTransaction ? { transactionId } : {}),
    };
    next.activityDays = [...next.activityDays, activity];
    result.rewardAmount = rewardAmount;
    result.firstActivityToday = !existingTransaction;
    if (rewardAmount > 0) {
      const transaction: WalletTransaction = {
        id: transactionId, walletId: data.transactions[0]?.walletId || 'wallet-demo', userId: data.profile.id,
        kind: 'notebook_reward', amount: rewardAmount, dayKey: timestamp.slice(0, 10),
        refType: 'notebook', refId: today, memo: N_('Daily notebook writing'), createdAt: timestamp,
      };
      transactions = [transaction, ...transactions];
    }
  }
  next.revision = notebook.revision + 1;
  return {
    data: { ...data, notebook: next, dreamJournal: dreams, transactions },
    result: practiceResult || (action.type.startsWith('delete_') || action.type === 'archive_369' || action.type === 'update_dream' ? undefined : result),
  };
}

/** Keep new Notebook writes/claims (and associated legacy journal changes) out of stale whole-document saves. */
export function preserveNotebookWrites(incoming: UserData, stored: UserData | null): UserData {
  if (!stored || stored.profile?.id !== incoming.profile?.id || !stored.notebook) return incoming;
  const storedRevision = normalizeNotebook(stored.notebook).revision;
  const incomingRevision = normalizeNotebook(incoming.notebook).revision;
  const newerStored = storedRevision > incomingRevision;
  const existingRewardIds = new Set(incoming.transactions.map((transaction) => transaction.id));
  const missingRewards = stored.transactions.filter((transaction) => transaction.kind === 'notebook_reward' && !existingRewardIds.has(transaction.id));
  return {
    ...incoming,
    notebook: newerStored ? stored.notebook : incoming.notebook,
    dreamJournal: newerStored ? stored.dreamJournal : incoming.dreamJournal,
    transactions: [...missingRewards, ...incoming.transactions],
  };
}
