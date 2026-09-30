import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { useLocale, useT } from '../../i18n';
import { dailyLoopCopy } from '../../i18n/dailyLoop';
import { weekEvidence } from '../../services/dailyLoop';
import { getNotebookDraftResetVersion, readNotebookDraft, subscribeNotebookDraftReset, writeNotebookDraft } from '../../services/notebookDrafts';

export const WeeklyOutcomeReview: React.FC<{ weekKey: string }> = ({ weekKey }) => {
  const { data, saveWeeklyReview } = useApp();
  const [locale] = useLocale();
  const t = useT();
  const c = dailyLoopCopy(locale);
  const existing = data?.weeklyReviews?.find(review => review.weekKey === weekKey);
  const draftKey = `oda-notebook-draft-v1:${data?.profile.id}:weekly-review:${weekKey}`;
  const resetVersion = useSyncExternalStore(subscribeNotebookDraftReset, getNotebookDraftResetVersion, getNotebookDraftResetVersion);
  const readFields = () => {
    const draft = readNotebookDraft<Record<string, unknown>>(draftKey);
    return { helped: typeof draft.value?.helped === 'string' ? draft.value.helped : existing?.helped ?? '', blocked: typeof draft.value?.blocked === 'string' ? draft.value.blocked : existing?.blocked ?? '', change: typeof draft.value?.change === 'string' ? draft.value.change : existing?.change ?? '' };
  };
  const [fields, setFields] = useState(readFields);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const saving = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstField = useRef<HTMLTextAreaElement>(null);
  const close = () => { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); };
  useEffect(() => { setFields(readFields()); setSaved(false); setError(''); }, [draftKey, resetVersion]);
  if (!data) return null;
  const evidence = weekEvidence(data, weekKey);
  if (!evidence.hasActivity && !existing) return null;
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(`${weekKey}T12:00:00`));
  const update = (key: keyof typeof fields, value: string) => {
    const next = { ...fields, [key]: value };
    setFields(next); writeNotebookDraft(draftKey, next); setError(''); setSaved(false);
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving.current) return;
    if (!Object.values(fields).some(value => value.trim())) { setError(c.reviewRequired); return; }
    saving.current = true; setBusy(true); setError('');
    try {
      await saveWeeklyReview({ weekKey, kept: evidence.keptDays, helped: fields.helped.trim() || undefined, blocked: fields.blocked.trim() || undefined, change: fields.change.trim() || undefined });
      writeNotebookDraft(draftKey, null);
      setSaved(true); close();
    } catch { setError(c.saveError); }
    finally { saving.current = false; setBusy(false); }
  };
  return <section className="oda-weekly-outcome" aria-labelledby="weekly-outcome-title">
    <div className="oda-loop-heading"><div><p className="oda-kicker">{c.reviewWeek} {date}</p><h2 id="weekly-outcome-title">{c.weekly}</h2><p>{c.weeklyHint}</p></div></div>
    <dl className="oda-weekly-facts">{[
      { value: evidence.keptDays, label: c.keptDays }, { value: evidence.reflectionDays, label: c.reflectionDays }, { value: evidence.checkInDays, label: c.checkinDays },
    ].map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}<span aria-hidden="true"> / 7</span></dd></div>)}</dl>
    {existing?.change && !open && <p className="oda-weekly-adjustment"><span>{c.weekAdjustment}</span>{existing.change}</p>}
    {saved && <p role="status" className="oda-loop-notice"><Check size={15} aria-hidden="true" />{c.reviewSaved}</p>}
    {!open ? <button ref={trigger} type="button" className="oda-loop-link" onClick={() => { setFields(readFields()); setOpen(true); requestAnimationFrame(() => firstField.current?.focus()); }} aria-expanded={false} aria-controls="weekly-outcome-form">{existing ? c.reviewEdit : c.reviewOpen}<ArrowRight size={15} aria-hidden="true" /></button> : <form id="weekly-outcome-form" className="oda-loop-form" onSubmit={submit} aria-busy={busy}>
      <div className="oda-weekly-evidence"><p>{c.weeklyEvidence}</p>{evidence.decisions.length ? <ul>{evidence.decisions.slice(0, 7).map(mission => <li key={mission.id}><Check size={14} aria-hidden="true" /><span>{t(mission.title)}</span></li>)}</ul> : <p className="oda-loop-help">{c.nothingKept}</p>}</div>
      {([{ key: 'helped', label: c.helped, placeholder: c.helpedPlaceholder }, { key: 'blocked', label: c.blocked, placeholder: c.blockedPlaceholder }, { key: 'change', label: c.change, placeholder: c.changePlaceholder }] as const).map(field => <div key={field.key}><label htmlFor={`weekly-outcome-${field.key}`}>{field.label}</label><textarea ref={field.key === 'helped' ? firstField : undefined} id={`weekly-outcome-${field.key}`} value={fields[field.key]} onChange={event => update(field.key, event.target.value)} placeholder={field.placeholder} maxLength={400} rows={2} disabled={busy} /></div>)}
      {error && <p role="alert" className="oda-loop-error">{error}</p>}
      <div className="oda-loop-actions"><button type="submit" disabled={busy} className="oda-loop-primary">{c.saveReview}<Check size={16} aria-hidden="true" /></button><button type="button" disabled={busy} className="oda-loop-link" onClick={close}>{c.hide}<ChevronDown size={15} aria-hidden="true" /></button></div>
    </form>}
  </section>;
};
