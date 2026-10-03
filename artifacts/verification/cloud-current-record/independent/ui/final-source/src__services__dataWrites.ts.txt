import { getLocale } from '../i18n';
import { APP_DATA_STORAGE_KEY, COURSE_PROGRESS_STORAGE_KEY } from './storageKeys';

/** One queue for every reader/writer of the personal record. */
let writeQueue: Promise<unknown> = Promise.resolve();
let afterCommit: Array<() => void> | null = null;
let commitValidations: Array<() => boolean> | null = null;
let committedSnapshot: RecordSnapshot | undefined;
const recoveryListeners = new Set<() => void>();
const committedListeners = new Set<() => void>();
const DATABASE_NAME = 'oda_personal_record_v1';
const STORE_NAME = 'record';
const RECORD_KEY = 'current';

interface RecordSnapshot {
  version: 1;
  appData: string | null;
  legacyCourse: string | null;
}
type AuthorityRecord = RecordSnapshot & { pendingPrevious?: RecordSnapshot };

function isSnapshot(value: unknown): value is RecordSnapshot {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const snapshot = value as Record<string, unknown>;
  return snapshot.version === 1
    && (snapshot.appData === null || typeof snapshot.appData === 'string')
    && (snapshot.legacyCourse === null || typeof snapshot.legacyCourse === 'string');
}

function storageError(cause: unknown): Error {
  const locale = getLocale();
  const message = locale === 'tr'
    ? 'Kayıt depolama alanına erişilemiyor. Değişikliklerin kaydedilmedi. Tekrar dene.'
    : locale === 'es'
      ? 'No se puede acceder al almacenamiento. Tus cambios no se guardaron. Inténtalo de nuevo.'
      : 'Record storage is unavailable. Your changes were not saved. Try again.';
  return new Error(message, { cause });
}

function readProjection(): RecordSnapshot {
  return {
    version: 1,
    appData: localStorage.getItem(APP_DATA_STORAGE_KEY),
    legacyCourse: localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY),
  };
}

function sameSnapshot(left: RecordSnapshot, right: RecordSnapshot): boolean {
  return left.appData === right.appData && left.legacyCourse === right.legacyCourse;
}

/** Only write changed keys: coherent reads must not generate storage-event loops. */
function hydrateProjection(snapshot: RecordSnapshot): void {
  for (const [key, raw] of [
    [APP_DATA_STORAGE_KEY, snapshot.appData],
    [COURSE_PROGRESS_STORAGE_KEY, snapshot.legacyCourse],
  ] as const) {
    if (localStorage.getItem(key) === raw) continue;
    if (raw === null) localStorage.removeItem(key);
    else localStorage.setItem(key, raw);
  }
}

/** Attempt both keys even when one projection cannot currently be restored. */
function recoverProjection(snapshot: RecordSnapshot): void {
  const errors: unknown[] = [];
  for (const [key, raw] of [
    [APP_DATA_STORAGE_KEY, snapshot.appData],
    [COURSE_PROGRESS_STORAGE_KEY, snapshot.legacyCourse],
  ] as const) {
    try {
      let unchanged = false;
      try { unchanged = localStorage.getItem(key) === raw; } catch { /* The authoritative value is still known. */ }
      if (unchanged) continue;
      if (raw === null) localStorage.removeItem(key);
      else localStorage.setItem(key, raw);
    } catch (error) { errors.push(error); }
  }
  if (errors.length) throw new AggregateError(errors, 'Personal record projection recovery failed');
}

function openAuthority(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    let settled = false;
    const fail = (error: unknown) => { settled = true; reject(error); };
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onerror = () => fail(request.error);
    request.onblocked = () => fail(new Error('Personal record database is blocked'));
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      if (settled) database.close();
      else { settled = true; resolve(database); }
    };
  });
}

function readAuthority(database: IDBDatabase): Promise<RecordSnapshot | null> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(RECORD_KEY);
    transaction.onabort = () => reject(transaction.error ?? new Error('Personal record read aborted'));
    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => {
      const value: unknown = request.result;
      if (value === undefined) { resolve(null); return; }
      if (!isSnapshot(value)) {
        reject(new Error('Unreadable personal record authority')); return;
      }
      if (Object.prototype.hasOwnProperty.call(value, 'pendingPrevious')) {
        const previous = (value as AuthorityRecord).pendingPrevious;
        if (!isSnapshot(previous) || Object.prototype.hasOwnProperty.call(previous, 'pendingPrevious')) {
          reject(new Error('Unreadable pending personal record authority')); return;
        }
        // An interrupted or rejected reviewed replacement is never authoritative,
        // even after a reload or if a later cleanup/write is unavailable.
        resolve(previous);
      } else resolve(value);
    };
  });
}

function commitAuthority(database: IDBDatabase, snapshot: AuthorityRecord): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.onabort = () => reject(transaction.error ?? new Error('Personal record commit aborted'));
    transaction.onerror = () => reject(transaction.error);
    // A put request succeeding does not mean its transaction committed.
    transaction.oncomplete = () => resolve();
    transaction.objectStore(STORE_NAME).put(snapshot, RECORD_KEY);
  });
}

/** Stage caller publication, cloud scheduling and draft resets until durable commit. */
export function afterDataWriteCommit(callback: () => void): void {
  if (!afterCommit) throw new Error('Data commit callback must be registered inside the record queue');
  afterCommit.push(callback);
}

/** The owner of a reviewed replacement can expire while IndexedDB commits. */
export class DataWriteCancelledError extends Error {
  constructor() { super('The reviewed record changed before its write committed'); this.name = 'DataWriteCancelledError'; }
}

export function validateDataWriteCommit(isCurrent: () => boolean): void {
  if (!commitValidations) throw new Error('Data commit validation must be registered inside the record queue');
  commitValidations.push(isCurrent);
}

/**
 * The last confirmed browser record, for synchronous draft initialization.
 * localStorage may currently contain another tab's uncommitted replacement.
 * Undefined means this module has not yet completed an authoritative read.
 */
export function readCommittedAppData(): string | null | undefined {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined'
    ? committedSnapshot?.appData : undefined;
}

/** A failed provisional write was rolled back; refresh visible data from the queue. */
export function subscribeDataWriteRecovery(listener: () => void): () => void {
  recoveryListeners.add(listener);
  return () => { recoveryListeners.delete(listener); };
}

/** Observes durable writes and authoritative hydration, independently of cloud scheduling. */
export function subscribeDataCommitted(listener: () => void): () => void {
  committedListeners.add(listener);
  return () => { committedListeners.delete(listener); };
}

function notifyRecovery(): void {
  for (const listener of recoveryListeners) {
    try { listener(); } catch { /* A subscriber cannot replace the storage failure. */ }
  }
}

async function runOperation<T>(operation: () => Promise<T> | T): Promise<T> {
  // Node tests and server-side helpers use an in-process storage implementation.
  // A browser must not silently fall back to a queue that cannot protect other tabs.
  const browser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  let database: IDBDatabase | null = null;
  let previous: RecordSnapshot | null = null;
  let operationStarted = false;
  let operationCompleted = false;
  const callbacks: Array<() => void> = [];
  const validations: Array<() => boolean> = [];
  const ownerIsCurrent = () => {
    try { return validations.every(isCurrent => isCurrent()); }
    catch { return false; } // An unreadable/expired owner cannot authorize publication.
  };
  try {
    if (browser) {
      if (typeof indexedDB === 'undefined') throw new Error('IndexedDB is unavailable');
      database = await openAuthority();
      previous = await readAuthority(database);
      if (!previous) {
        previous = readProjection();
        await commitAuthority(database, previous);
      }
      committedSnapshot = previous;
      // Chromium can keep a tab-local localStorage cache after another tab
      // releases a Web Lock. IndexedDB transaction reads are the shared authority.
      hydrateProjection(previous);
    } else if (typeof localStorage !== 'undefined') {
      previous = readProjection();
    }
    afterCommit = callbacks;
    commitValidations = validations;
    operationStarted = true;
    const result = await operation();
    operationCompleted = true;
    if (!ownerIsCurrent()) throw new DataWriteCancelledError();
    if (database && previous) {
      const next = readProjection();
      if (!sameSnapshot(previous, next)) {
        if (validations.length) {
          // Persist a recoverable candidate before checking its owner after
          // the asynchronous transaction. Readers keep using the prior record
          // until finalization succeeds; rejected candidates need no rollback
          // transaction that could itself fail and expose private data.
          await commitAuthority(database, { ...next, pendingPrevious: previous });
          if (!ownerIsCurrent()) throw new DataWriteCancelledError();
          // This synchronous validation is the replacement's authorization
          // point. A later account change follows the accepted local restore;
          // origin-bound cloud uploads remain separately guarded.
        }
        await commitAuthority(database, next);
      }
      committedSnapshot = next;
    }
    afterCommit = null;
    commitValidations = null;
    for (const listener of committedListeners) {
      try { listener(); } catch { /* Backup status cannot turn a durable save into a failure. */ }
    }
    // Keep the cross-tab lock until publication/reset is complete. Consumer
    // refresh errors cannot turn an already durable write into a failed save.
    for (const callback of callbacks) {
      try { callback(); } catch { /* The durable record remains available to the next queued read. */ }
    }
    return result;
  } catch (error) {
    afterCommit = null;
    commitValidations = null;
    if (previous) {
      let changed = operationStarted;
      try { changed = !sameSnapshot(previous, readProjection()); } catch { /* Attempt rollback despite a failed projection read. */ }
      try { recoverProjection(previous); }
      catch (rollbackError) {
        if (operationStarted && changed) notifyRecovery();
        throw storageError(new AggregateError([error, rollbackError], 'Personal record projection recovery failed'));
      }
      if (operationStarted && changed) notifyRecovery();
    }
    if (error instanceof DataWriteCancelledError) throw error;
    if (browser && (!operationStarted || operationCompleted)) throw storageError(error);
    throw error;
  } finally {
    afterCommit = null;
    commitValidations = null;
    database?.close();
  }
}

export function queueDataWrite<T>(operation: () => Promise<T> | T): Promise<T> {
  const run = () => {
    const browser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    if (typeof navigator !== 'undefined' && navigator.locks) {
      return navigator.locks.request('oda-data-writes', () => runOperation(operation));
    }
    if (browser) return Promise.reject(storageError(new Error('Cross-tab record locking is unavailable')));
    return runOperation(operation);
  };
  const result = writeQueue.then(run, run);
  writeQueue = result.then(() => undefined, () => undefined);
  return result;
}
