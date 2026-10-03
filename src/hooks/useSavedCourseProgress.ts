import { useEffect, useState } from 'react';
import { readCourseProgress, subscribeCourseProgress } from '../services/courseProgress';

/** Subscribe to committed course changes, not the editor's unsaved optimistic draft. */
export function useSavedCourseProgress(replacement: unknown) {
  const [progress, setProgress] = useState(readCourseProgress);
  useEffect(() => {
    const update = (canSync?: () => boolean) => { if (!canSync || canSync()) setProgress(readCourseProgress()); };
    const unsubscribe = subscribeCourseProgress(update);
    const onFocus = () => update();
    window.addEventListener('focus', onFocus);
    return () => { unsubscribe(); window.removeEventListener('focus', onFocus); };
  }, []);
  useEffect(() => { setProgress(readCourseProgress()); }, [replacement]);
  return progress;
}
