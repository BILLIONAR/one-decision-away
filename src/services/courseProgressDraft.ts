import type { CourseProgress } from './courseProgress';

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
  const apply = (base: CourseProgress, updates: CourseProgressUpdate[]) => updates.reduce((state, update) => update(state), base);
  const receive = (stored: CourseProgress) => {
    current = apply(stored, pending);
    onChange(current);
  };
  const flush = (): Promise<boolean> => {
    if (flight) return flight.then(saved => saved && pending.length ? flush() : saved);
    if (!pending.length) return Promise.resolve(true);
    const batch = pending.slice();
    const run = (async () => {
      let stored: CourseProgress | null = null;
      try { stored = await persist(latest => apply(latest, batch)); } catch { /* Retain the optimistic draft for retry. */ }
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
