import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Check, AlertCircle, type LucideIcon } from 'lucide-react';
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

export const smallLabel = 'text-xs text-[var(--fg-muted)]';
export const quietButton = 'min-h-[44px] inline-flex items-center text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 cursor-pointer disabled:opacity-40';
export const cardCls = 'bg-[var(--bg-muted)] rounded-[var(--radius-md)] min-w-0 overflow-hidden';
export const primaryBtn = 'h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';
export const secondaryBtn = 'h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap';
export const inputCls = 'w-full h-11 px-3 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-[var(--fg)] placeholder:text-[var(--fg-subtle)] disabled:opacity-60';
export const textareaCls = 'w-full p-3 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-[var(--fg)] placeholder:text-[var(--fg-subtle)] resize-y min-h-[100px] leading-relaxed disabled:opacity-60';

export const NField: React.FC<{ id: string; label: string; helper?: string; error?: string; required?: boolean; children: React.ReactNode; className?: string }> = ({ id, label, helper, error, required, children, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label htmlFor={id} className="block text-sm text-[var(--fg-muted)]">{label}{required && <span className="text-[var(--danger)]"> *</span>}</label>
    {children}
    {helper && !error && <p className="text-xs text-[var(--fg-subtle)]">{helper}</p>}
    {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
  </div>
);

export const NInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }> = ({ className = '', hasError, ...props }) => (
  <input className={`${inputCls} ${hasError ? '!border-[var(--danger)]' : ''} ${className}`} {...props} />
);

export const NTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }> = ({ className = '', hasError, ...props }) => (
  <textarea className={`${textareaCls} ${hasError ? '!border-[var(--danger)]' : ''} ${className}`} {...props} />
);

export const NSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }> = ({ options, className = '', ...props }) => (
  <select className={`${inputCls} ${className}`} {...props}>{options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
);

export const NButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; isLoading?: boolean; icon?: LucideIcon }> = ({ variant = 'primary', isLoading, icon: Icon, className = '', children, disabled, ...props }) => {
  const base = variant === 'primary' ? primaryBtn : variant === 'secondary' ? secondaryBtn : 'h-11 px-3 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] text-sm font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer disabled:opacity-40';
  return <button className={`${base} ${className}`} disabled={disabled || isLoading} {...props}>
    {isLoading ? <span className="inline-block w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" /> : Icon && <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} />}
    <span>{children}</span>
  </button>;
};

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
