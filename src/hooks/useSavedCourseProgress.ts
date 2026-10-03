import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { UserData } from '../types/models';
import { normalizeCourseProgress, readCourseProgress, subscribeCourseProgress } from '../services/courseProgress';
import { queueDataWrite, readCommittedAppData } from '../services/dataWrites';
import { REPLACEMENT_EPOCH_KEY } from '../services/dataSnapshots';
import { sameCourseEntryScope } from '../services/courseEntry';
import { cloudSync } from '../services/cloudSync';

const accountRevision = () => cloudSync.getState().scopeRevision;
const subscribeAccount = (changed: () => void) => cloudSync.subscribe(() => changed());
const epochOf = (record: unknown) => typeof record === 'object' && record !== null && Object.hasOwn(record, REPLACEMENT_EPOCH_KEY)
  ? Reflect.get(record, REPLACEMENT_EPOCH_KEY) : undefined;

/** Subscribe to committed course changes, not the editor's unsaved optimistic draft. */
export function useSavedCourseProgress(record: UserData | null | undefined) {
  const revision = useSyncExternalStore(subscribeAccount, accountRevision, accountRevision);
  const recordId = record?.profile.id;
  const replacementEpoch = epochOf(record);
  const scope = useMemo(() => ({ recordId, replacementEpoch, revision }), [recordId, replacementEpoch, revision]);
  const seed = useMemo(() => normalizeCourseProgress(record?.courseProgress), [record?.courseProgress]);
  const generation = useMemo(() => ({ scope, seed }), [scope, seed]);
  const [saved, setSaved] = useState(() => ({ generation, progress: seed }));
  const currentGeneration = useRef(generation);
  currentGeneration.current = generation;
  // A new owner must never render the previous owner's asynchronous result.
  const progress = saved.generation === generation ? saved.progress : seed;
  const confirmed = useRef(progress);
  confirmed.current = progress;
  useEffect(() => {
    let active = true;
    let pending = false;
    let again = false;
    const isCurrent = () => active && currentGeneration.current === generation && accountRevision() === scope.revision;
    const update = (canSync?: () => boolean) => {
      if (!isCurrent() || (canSync && !canSync())) return;
      if (pending) { again = true; return; }
      pending = true;
      void queueDataWrite(() => {
        if (!isCurrent() || (canSync && !canSync())) return null;
        const raw = readCommittedAppData();
        const durable = raw ? JSON.parse(raw) : null;
        if (!sameCourseEntryScope(scope, { recordId: durable?.profile?.id, replacementEpoch: epochOf(durable) })) return null;
        return readCourseProgress(confirmed.current);
      }).then(next => {
        if (next && isCurrent() && (!canSync || canSync())) setSaved({ generation, progress: next });
      }).catch(() => { /* Retain the last confirmed progress when the authoritative read fails. */ })
        .finally(() => {
          pending = false;
          if (again && isCurrent()) { again = false; update(); }
        });
    };
    const unsubscribe = subscribeCourseProgress(update);
    const onFocus = () => update();
    window.addEventListener('focus', onFocus);
    update();
    return () => { active = false; unsubscribe(); window.removeEventListener('focus', onFocus); };
  }, [generation]);
  return progress;
}
