import { getLocale } from '../i18n';
import type { UserData, WalletTransaction } from '../types/models';

/** Stored in the same atomic document so restores invalidate snapshots in every tab. */
export const REPLACEMENT_EPOCH_KEY = '_odaReplacementEpoch';
const BASELINE = Symbol('oda saved snapshot');
interface Baseline { snapshot: UserData; raw: string | null; epoch: unknown }
type TrackedData = UserData & { [BASELINE]?: Baseline };
const conflictListeners = new Set<() => void>();

function conflictMessage(): string {
  const locale = getLocale();
  if (locale === 'tr') return 'Kayıtların değişti. Güncel verilerle tekrar dene.';
  if (locale === 'es') return 'Tus datos guardados cambiaron. Inténtalo de nuevo con los datos actuales.';
  return 'Your saved data changed. Try again with the latest data.';
}

export class DataSaveConflictError extends Error {
  constructor(public readonly field: string) {
    super(conflictMessage());
    this.name = 'DataSaveConflictError';
  }
}

/** Refresh the visible snapshot when an edit conflicts with a newer saved value. */
export function subscribeDataSaveConflicts(listener: () => void): () => void {
  conflictListeners.add(listener);
  return () => { conflictListeners.delete(listener); };
}

function conflict(field: string): never {
  for (const listener of conflictListeners) {
    try { listener(); } catch { /* A UI listener cannot replace the save error. */ }
  }
  throw new DataSaveConflictError(field);
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const ownValue = (record: Record<string, unknown>, key: string): unknown =>
  Object.prototype.hasOwnProperty.call(record, key) ? record[key] : undefined;

function same(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((item, index) => same(item, right[index]));
  }
  if (!isRecord(left) || !isRecord(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key =>
    Object.prototype.hasOwnProperty.call(right, key) && same(left[key], right[key]));
}

/** Arrays are intentional ordered replacements; concurrent edits to them conflict. */
function mergeValue(base: unknown, incoming: unknown, stored: unknown, path: string): unknown {
  if (same(incoming, base)) return stored;
  if (same(stored, base) || same(incoming, stored)) return incoming;
  if (isRecord(base) && isRecord(incoming) && isRecord(stored)) {
    const keys = new Set([...Object.keys(base), ...Object.keys(incoming), ...Object.keys(stored)]);
    return Object.fromEntries([...keys].flatMap(key => {
      const result = mergeValue(ownValue(base, key), ownValue(incoming, key), ownValue(stored, key), `${path}.${key}`);
      return result === undefined ? [] : [[key, result]];
    }));
  }
  return conflict(path);
}

/** Symbol metadata survives normal UI spreads, while JSON backups never contain it. */
export function trackDataSnapshot(data: UserData, raw: string | null): UserData {
  const snapshot = raw === null ? JSON.parse(JSON.stringify(data)) : JSON.parse(raw);
  Object.defineProperty(data, BASELINE, {
    configurable: true, enumerable: true, writable: true,
    value: { snapshot, raw, epoch: snapshot[REPLACEMENT_EPOCH_KEY] } satisfies Baseline,
  });
  return data;
}

/** Update callers only after a successful commit, including deletion of stale keys. */
export function publishDataSnapshot(target: UserData, source: UserData, raw: string): void {
  for (const key of Object.keys(target)) if (!Object.prototype.hasOwnProperty.call(source, key)) Reflect.deleteProperty(target, key);
  // defineProperty keeps unknown imported keys such as __proto__ as inert data.
  for (const [key, value] of Object.entries(source)) Object.defineProperty(target, key, {
    configurable: true, enumerable: true, writable: true, value,
  });
  trackDataSnapshot(target, raw);
}

function ordinaryTransactions(transactions: WalletTransaction[] | undefined): WalletTransaction[] {
  return (transactions ?? []).filter(transaction => transaction.kind !== 'notebook_reward');
}

/** Apply only edits relative to the caller's immutable baseline. Never union wallets. */
export function mergeDataSnapshot(incoming: UserData, stored: UserData | null, raw: string | null): UserData {
  const baseline = (incoming as TrackedData)[BASELINE];
  if (!baseline || raw === baseline.raw) return incoming;
  if (!stored || (stored as unknown as Record<string, unknown>)[REPLACEMENT_EPOCH_KEY] !== baseline.epoch) conflict('document');
  const base = baseline.snapshot;
  const keys = new Set([...Object.keys(base), ...Object.keys(incoming), ...Object.keys(stored)]);
  const result = Object.fromEntries([...keys].flatMap(key => {
    // These branches already have command/revision-based preservation in the repository.
    if (['notebook', 'courseProgress', 'dreamJournal'].includes(key)) return [[key, (incoming as any)[key]]];
    if (key === REPLACEMENT_EPOCH_KEY) return [[key, (stored as any)[key]]];
    if (key === 'transactions') {
      const merged = mergeValue(ordinaryTransactions(base.transactions), ordinaryTransactions(incoming.transactions), ordinaryTransactions(stored.transactions), key);
      if (same(merged, ordinaryTransactions(incoming.transactions))) return [[key, incoming.transactions]];
      const storedTransactions = stored.transactions ?? [];
      const storedIds = new Set(storedTransactions.map(transaction => transaction.id));
      const newNotebookRewards = incoming.transactions.filter(transaction => transaction.kind === 'notebook_reward' && !storedIds.has(transaction.id));
      return [[key, [...newNotebookRewards, ...storedTransactions]]];
    }
    const merged = mergeValue(ownValue(base as unknown as Record<string, unknown>, key), ownValue(incoming as unknown as Record<string, unknown>, key), ownValue(stored as unknown as Record<string, unknown>, key), key);
    return merged === undefined ? [] : [[key, merged]];
  }));
  return result as unknown as UserData;
}

export function newReplacementEpoch(): string {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
