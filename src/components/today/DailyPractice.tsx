import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, PenLine } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { useLocale } from '../../i18n';
import { dailyLoopCopy } from '../../i18n/dailyLoop';
import { dailyReflection, DAILY_REFLECTION_PROMPT } from '../../services/dailyLoop';
import { getNotebookDraftResetVersion, readNotebookDraft, subscribeNotebookDraftReset, writeNotebookDraft } from '../../services/notebookDrafts';
import type { Mission } from '../../types/models';

export const DailyPractice: React.FC<{ mission?: Mission; dayKey: string }> = ({ mission, dayKey }) => {
  const { data } = useApp();
  const [locale] = useLocale();
  const c = dailyLoopCopy(locale);
  const reflected = Boolean(data && dailyReflection(data, dayKey));
  const chosen = Boolean(mission);
  const kept = mission?.status === 'completed';
  const current = !chosen ? 0 : !kept ? 1 : !reflected ? 2 : -1;
  const steps = [
    { title: c.choose, done: chosen, status: chosen ? c.chosen : c.ready },
    { title: c.act, done: kept, status: kept ? c.kept : mission?.startedAt ? c.started : c.ready },
    { title: c.reflect, done: reflected, status: reflected ? c.saved : c.optional },
  ];
  return <div className="oda-daily-practice" role="group" aria-label={c.path}>
    <ol>
      {steps.map((step, index) => <li key={step.title} aria-current={current === index ? 'step' : undefined} data-done={step.done}>
        <span className="oda-practice-number" aria-hidden="true">{step.done ? <Check size={13} strokeWidth={2.4} /> : String(index + 1).padStart(2, '0')}</span>
        <span><span className="oda-practice-title">{step.title}</span><span className="oda-practice-status">{step.status}</span></span>
      </li>)}
    </ol>
  </div>;
};

/** A dedicated notebook entry is the source of truth, so backup/restore and revisiting work without a device-only flag. */
export const DailyReflection: React.FC<{ mission?: Mission; dayKey: string }> = ({ mission, dayKey }) => {
  const { data, saveNotebookEntry, setActiveRoute } = useApp();
  const [locale] = useLocale();
  const c = dailyLoopCopy(locale);
  const entry = data ? dailyReflection(data, dayKey) : undefined;
  const draftKey = `oda-notebook-draft-v1:${data?.profile.id}:daily-reflection:${dayKey}`;
  const resetVersion = useSyncExternalStore(subscribeNotebookDraftReset, getNotebookDraftResetVersion, getNotebookDraftResetVersion);
  const readText = () => {
    const draft = readNotebookDraft<unknown>(draftKey);
    return draft.found && typeof draft.value === 'string' ? draft.value : entry?.content ?? '';
  };
  const [text, setText] = useState(readText);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState(false);
  const saving = useRef(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); };
  useEffect(() => { setText(readText()); setNotice(false); setError(false); }, [draftKey, resetVersion, entry?.id]);
  if (!data || (!mission && !entry)) return null;

  const edit = () => { setOpen(true); requestAnimationFrame(() => input.current?.focus()); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim() || saving.current) return;
    saving.current = true;
    setBusy(true);
    setError(false);
    try {
      await saveNotebookEntry({ id: entry?.id, kind: 'journal', title: entry?.title || c.reflectionTitle, content: text.trim(), promptId: DAILY_REFLECTION_PROMPT, mood: entry?.mood });
      writeNotebookDraft(draftKey, text.trim());
      setNotice(true);
      close();
    } catch { setError(true); }
    finally { saving.current = false; setBusy(false); }
  };
  return <section className="oda-daily-reflection" aria-labelledby="daily-reflection-title">
    <div className="oda-loop-heading">
      <span className="oda-loop-icon" aria-hidden="true"><PenLine size={19} strokeWidth={1.7} /></span>
      <div><h2 id="daily-reflection-title">{c.reflection}</h2><p>{c.reflectionHint}</p></div>
    </div>
    {entry && !open && <blockquote className="oda-reflection-excerpt">{entry.content}</blockquote>}
    {notice && <p role="status" className="oda-loop-notice"><Check size={15} aria-hidden="true" />{c.savedReflection}</p>}
    {!open ? <div className="oda-loop-actions">
      <button ref={trigger} type="button" onClick={edit} className="oda-loop-link">{entry ? c.editReflection : c.reflectNow}<ArrowRight size={15} aria-hidden="true" /></button>
      {entry && <button type="button" onClick={() => setActiveRoute('/app/notebook')} className="oda-loop-link"><BookOpen size={15} aria-hidden="true" />{c.notebook}</button>}
    </div> : <form onSubmit={submit} className="oda-loop-form" aria-busy={busy}>
      <label htmlFor="daily-reflection-writing" className="sr-only">{c.reflection}</label>
      <textarea ref={input} id="daily-reflection-writing" value={text} onChange={event => { setText(event.target.value); writeNotebookDraft(draftKey, event.target.value); setNotice(false); setError(false); }} maxLength={1200} rows={4} placeholder={c.reflectionPlaceholder} disabled={busy} aria-describedby="daily-reflection-help" />
      <p id="daily-reflection-help" className="oda-loop-help">{mission?.status !== 'completed' ? c.reflectionHelp : c.draftHint}</p>
      {error && <p role="alert" className="oda-loop-error">{c.saveError}</p>}
      <div className="oda-loop-actions"><button type="submit" className="oda-loop-primary" disabled={!text.trim() || busy}>{c.saveReflection}<Check size={16} aria-hidden="true" /></button><button type="button" disabled={busy} className="oda-loop-link" onClick={close}>{c.hide}<ChevronDown size={15} aria-hidden="true" /></button></div>
    </form>}
  </section>;
};
