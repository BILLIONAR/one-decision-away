import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { useT, getSpeechLang } from '../../i18n';
import { useApp } from '../../store/useApp';
import { readNotebookDraft, writeNotebookDraft, subscribeNotebookDraftReset, getNotebookDraftResetVersion } from '../../services/notebookDrafts';
import type { NotebookMutationResult } from '../../types/models';

export function localDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function dateLabel(dateKey: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }): string {
  return new Intl.DateTimeFormat(getSpeechLang(), options).format(localDate(dateKey));
}

export function useNotebookAction() {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [notice, setNotice] = useState<{ error: boolean; message: string } | null>(null);
  const run = useCallback(async <T,>(action: () => Promise<T>, message = 'Saved to your notebook.'): Promise<T | undefined> => {
    if (pending.current) return undefined;
    pending.current = true;
    setBusy(true);
    setNotice(null);
    try {
      const result = await action();
      const reward = (result as NotebookMutationResult | undefined)?.rewardAmount || 0;
      setNotice({ error: false, message: reward > 0 ? t('Saved. Your first writing today earned D$ {amount}.', { amount: reward }) : t(message) });
      return result;
    } catch {
      setNotice({ error: true, message: t('Could not save this change. Your writing is still here; please try again.') });
      return undefined;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }, [t]);
  return { busy, notice, run, setNotice };
}

export const ActionNotice: React.FC<{ notice: { error: boolean; message: string } | null }> = ({ notice }) => {
  if (!notice) return null;
  const Icon = notice.error ? AlertCircle : Check;
  return <p role={notice.error ? 'alert' : 'status'} className={`flex items-start gap-2 text-sm leading-relaxed ${notice.error ? 'text-[var(--danger)]' : 'text-[var(--fg-muted)]'}`}>
    <Icon className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />{notice.message}
  </p>;
};

export const smallLabel = 'text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--fg-muted)]';
export const quietButton = 'text-xs text-[var(--fg-muted)] underline underline-offset-4 hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 cursor-pointer disabled:opacity-40';

// Unsubmitted writing survives route/language changes. Session storage keeps it on
// this device for this tab; the memory fallback also survives blocked storage.
export function useSessionDraft<T>(key: string, initial: T | (() => T)) {
  const { data } = useApp();
  const storageKey = `oda-notebook-draft-v1:${data?.profile.id || 'anonymous'}:${key}`;
  const resetVersion = useSyncExternalStore(subscribeNotebookDraftReset, getNotebookDraftResetVersion, getNotebookDraftResetVersion);
  const identity = `${resetVersion}:${storageKey}`;
  const read = (): T => {
    const saved = readNotebookDraft<T>(storageKey);
    if (saved.found) return saved.value as T;
    return typeof initial === 'function' ? (initial as () => T)() : initial;
  };
  const [state, setState] = useState<{ key: string; value: T }>(() => ({ key: identity, value: read() }));
  // A profile/key change must read its own draft before any persistence effect.
  // Updating this component during render avoids a frame with another user's text.
  let value = state.value;
  if (state.key !== identity) {
    value = read();
    setState({ key: identity, value });
  }
  const setValue: React.Dispatch<React.SetStateAction<T>> = next => setState(previous => {
    const previousValue = previous.key === identity ? previous.value : read();
    return { key: identity, value: typeof next === 'function' ? (next as (value: T) => T)(previousValue) : next };
  });
  useEffect(() => {
    if (state.key !== identity) return;
    writeNotebookDraft(storageKey, state.value);
  }, [storageKey, identity, state]);
  return [value, setValue] as const;
}

export function useDraftGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
}
