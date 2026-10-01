import { EMPTY_PROGRESS, mutateCourseProgress, normalizeCourseProgress, readCourseProgress, subscribeCourseProgress, type CourseProgress } from './courseProgress';
import { REPLACEMENT_EPOCH_KEY } from './dataSnapshots';
import { APP_DATA_STORAGE_KEY } from './storageKeys';
import { queueDataWrite, readCommittedAppData } from './dataWrites';

export type CourseProgressUpdate = (current: CourseProgress) => CourseProgress;
type PersistUpdate = (update: CourseProgressUpdate) => Promise<CourseProgress | null>;

/**
 * Immediate input feedback with serialized, rebasable writes. Keep updater
 * functions until persistence succeeds so a quota failure or another tab's
 * edit cannot silently discard private work.
 */
export function createCourseProgressDraft(initial: CourseProgress, persist: PersistUpdate, onChange: (draft: CourseProgress) => void, onSave: (saved: boolean) => void) {
  let current = initial;
  const pending: CourseProgressUpdate[] = [];
  let flight: Promise<boolean> | null = null;
  let revision = 0;
  const apply = (base: CourseProgress, updates: CourseProgressUpdate[]) => updates.reduce((state, update) => update(state), base);
  const receive = (stored: CourseProgress) => {
    current = apply(stored, pending);
    onChange(current);
  };
  const flush = (): Promise<boolean> => {
    if (flight) return flight.then(saved => saved && pending.length ? flush() : saved);
    if (!pending.length) return Promise.resolve(true);
    const batch = pending.slice();
    const batchRevision = revision;
    const run = (async () => {
      let stored: CourseProgress | null = null;
      try { stored = await persist(latest => batchRevision === revision ? apply(latest, batch) : latest); } catch { /* Retain the optimistic draft for retry. */ }
      // Explicit reset/import cancels the old draft even if its write was waiting for the lock.
      if (batchRevision !== revision) return true;
      if (!stored) { onSave(false); return false; }
      pending.splice(0, batch.length);
      receive(stored);
      onSave(true);
      return true;
    })();
    flight = run;
    void run.finally(() => { if (flight === run) flight = null; });
    return run.then(saved => saved && pending.length ? flush() : saved);
  };
  return {
    receive,
    reset: (stored: CourseProgress) => {
      revision++;
      pending.splice(0);
      current = stored;
      onChange(current);
      onSave(true);
    },
    read: () => current,
    // A retry requested while a failed write is still settling must start a
    // fresh attempt once that write finishes, rather than inherit its failure.
    retry: () => flight ? flight.then(() => flush()) : flush(),
    update: (update: CourseProgressUpdate): Promise<boolean> => {
      pending.push(update);
      current = update(current);
      onChange(current);
      return flush();
    },
  };
}

/** The page may unmount while storage is blocked; its private draft lives for the browser session. */
export function createCourseProgressSession(initial: CourseProgress, persist: PersistUpdate) {
  let current = initial;
  let saveFailed = false;
  const listeners = new Set<(progress: CourseProgress, failed: boolean) => void>();
  const notify = () => listeners.forEach(listener => listener(current, saveFailed));
  const draft = createCourseProgressDraft(initial, persist, next => {
    current = next;
    notify();
  }, saved => {
    saveFailed = !saved;
    notify();
  });
  return {
    ...draft,
    saveFailed: () => saveFailed,
    subscribe: (listener: (progress: CourseProgress, failed: boolean) => void) => {
      listeners.add(listener);
      listener(current, saveFailed);
      return () => { listeners.delete(listener); };
    },
  };
}

let session: ReturnType<typeof createCourseProgressSession> | null = null;
let recordRevision: { exists: boolean; epoch: unknown } | null = null;
function revisionFromRaw(raw: string | null) {
  return { exists: raw !== null, epoch: raw === null ? undefined : JSON.parse(raw)?.[REPLACEMENT_EPOCH_KEY] };
}
function readRecordRevision() {
  return revisionFromRaw(globalThis.localStorage.getItem(APP_DATA_STORAGE_KEY));
}
function isReplaced(next: ReturnType<typeof readRecordRevision>) {
  return recordRevision !== null && (next.exists !== recordRevision.exists || next.epoch !== recordRevision.epoch);
}
export function getCourseProgressSession() {
  if (!session) {
    const browser = typeof window !== 'undefined' && typeof window.document !== 'undefined';
    let initial: CourseProgress = EMPTY_PROGRESS;
    if (browser) {
      // Another tab may currently project an uncommitted restore. Initial
      // ownership and visible saved work come only from the confirmed cache.
      const committed = readCommittedAppData();
      if (committed !== undefined) {
        try {
          recordRevision = revisionFromRaw(committed);
          initial = normalizeCourseProgress(committed === null ? undefined : JSON.parse(committed)?.courseProgress);
        } catch { /* The queued authoritative read will recover a valid baseline. */ }
      }
    } else {
      try { recordRevision = readRecordRevision(); } catch { /* Preserve input when storage is unavailable. */ }
      initial = readCourseProgress();
    }
    session = createCourseProgressSession(initial, update => mutateCourseProgress(latest => {
      // The storage event can arrive after another tab obtains the lock. Check
      // the replacement revision inside the locked mutation as well.
      const nextRevision = readRecordRevision();
      const replaced = isReplaced(nextRevision);
      recordRevision = nextRevision;
      if (replaced) {
        session!.reset(latest);
        return latest;
      }
      return update(latest);
    }));
    if (browser) {
      // Establish a canonical baseline before the first queued mutation, also
      // for legacy devices or a session opened before any confirmed read.
      void queueDataWrite(() => {
        const nextRevision = readRecordRevision();
        const replaced = isReplaced(nextRevision);
        recordRevision = nextRevision;
        if (replaced) session!.reset(readCourseProgress());
        else session!.receive(readCourseProgress());
      }).catch(() => { /* Keep pending private input for a later save retry. */ });
    }
    subscribeCourseProgress(() => {
      try {
        const nextRevision = readRecordRevision();
        const replaced = isReplaced(nextRevision);
        recordRevision = nextRevision;
        if (replaced) session!.reset(readCourseProgress());
        else session!.receive(readCourseProgress());
      } catch { /* A read failure must retain the private draft and its warning. */ }
    });
  }
  return session;
}

/** Explicit replacement must discard private drafts belonging to the previous local record. */
export function resetCourseProgressSession() {
  try { recordRevision = readRecordRevision(); } catch { /* The successful replacement already owns the reset. */ }
  session?.reset(readCourseProgress());
}
