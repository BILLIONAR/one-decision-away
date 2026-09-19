import React, { useState } from 'react';
import { Archive, Check, Moon, Plus, Sun, Sunrise } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { N_, useT } from '../../i18n';
import { get369Progress, normalizeNotebook, matches369Intention, NOTEBOOK_369_SLOT_COUNTS } from '../../services/notebook';
import type { Notebook369Practice, Notebook369Slot } from '../../types/models';
import { ActionNotice, dateLabel, quietButton, smallLabel, cardCls, NButton, NField, NInput, useNotebookAction, useSessionDraft, useDraftGuard } from './shared';

const SLOTS: { id: Notebook369Slot; label: string; icon: typeof Sun }[] = [
  { id: 'morning', label: N_('Morning'), icon: Sunrise },
  { id: 'midday', label: N_('Midday'), icon: Sun },
  { id: 'evening', label: N_('Evening'), icon: Moon },
];

const RepetitionEditor: React.FC<{ practice: Notebook369Practice; today: string; slot: Notebook369Slot; hidden: boolean }> = ({ practice, today, slot, hidden }) => {
  const t = useT();
  const { save369Slot } = useApp();
  const { busy, notice, run } = useNotebookAction();
  const count = NOTEBOOK_369_SLOT_COUNTS[slot];
  const [lines, setLines] = useSessionDraft<string[]>(`369:${practice.id}:${today}:${slot}`, () => Array.from({ length: count }, (_, i) => practice.days[today]?.[slot]?.[i] || ''));
  const [invalid, setInvalid] = useState(false);
  useDraftGuard(lines.some((line, i) => line !== (practice.days[today]?.[slot]?.[i] || '')));
  const label = SLOTS.find(item => item.id === slot)!.label;
  const mismatched = lines.some(line => line.trim() && !matches369Intention(line, practice.intention));
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatched || !lines.some(line => line.trim())) { setInvalid(true); return; }
    await run(() => save369Slot(practice.id, today, slot, lines));
  };
  return <form hidden={hidden} onSubmit={save} className="space-y-3">
    <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{t('Write the same intention {n} times. Save whenever you want to pause.', { n: count })}</p>
    <fieldset disabled={busy} className="space-y-2"><legend className="sr-only">{t(label)} — {t('Written repetitions')}</legend>{lines.map((line, index) => <div key={index} className="flex gap-3 items-center"><span aria-hidden="true" className="text-xs text-[var(--fg-muted)] w-4 shrink-0 text-right">{index + 1}</span><label className="sr-only" htmlFor={`369-${slot}-${index}`}>{t('{slot} repetition {n}', { slot: t(label), n: index + 1 })}</label><NInput id={`369-${slot}-${index}`} value={line} onChange={e => { const value = e.target.value; setLines(previous => previous.map((item, i) => i === index ? value : item)); setInvalid(false); }} autoComplete="off" placeholder={t('Write your intention here')} hasError={invalid && Boolean(line.trim()) && !matches369Intention(line, practice.intention)} aria-invalid={invalid && Boolean(line.trim()) && !matches369Intention(line, practice.intention)} /></div>)}</fieldset>
    {invalid && <p role="alert" className="text-sm text-[var(--danger)]">{mismatched ? t('Each written line must match your intention. Empty lines can be saved for later.') : t('Write your intention at least once before saving.')}</p>}
    <ActionNotice notice={notice} />
    <NButton type="submit" isLoading={busy}>{t('Save {slot}', { slot: t(label) })}</NButton>
  </form>;
};

export const Practice369: React.FC<{ today: string }> = ({ today }) => {
  const t = useT();
  const { data, start369Practice, archive369Practice } = useApp();
  const { busy, notice, run } = useNotebookAction();
  const [intention, setIntention] = useSessionDraft('369:new-intention', '');
  const [writingDate, setWritingDate] = useSessionDraft('369:writing-date', today);
  useDraftGuard(Boolean(intention.trim()));
  const [invalid, setInvalid] = useState(false);
  const [slot, setSlot] = useState<Notebook369Slot>(() => new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'midday' : 'evening');
  const [showNew, setShowNew] = useState(false);
  const practices = normalizeNotebook(data?.notebook).practices369;
  const active = practices.find(practice => !practice.archivedAt);
  const progress = active ? get369Progress(active) : null;
  const selectedDate = active && writingDate < active.startDateKey ? active.startDateKey : writingDate > today ? today : writingDate;
  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intention.trim()) { setInvalid(true); return; }
    if (active && !window.confirm(t('Start a new practice? Your current practice will be kept in history. Save any unfinished repetitions first.'))) return;
    const result = await run(() => start369Practice(intention), 'Your new practice is ready.');
    if (result) { setIntention(''); setWritingDate(today); setInvalid(false); setShowNew(false); }
  };
  const archive = async () => {
    if (!active || !window.confirm(t('Archive this practice? All saved repetitions will stay in history.'))) return;
    await run(async () => { await archive369Practice(active.id); return true; }, 'Practice archived.');
  };
  const doneCount = (id: Notebook369Slot) => (active?.days[selectedDate]?.[id] || []).filter(line => matches369Intention(line, active!.intention)).length;
  return <div className={cardCls}>
    <div className="p-5"><h2 className="text-lg font-semibold tracking-tight">{t('3-6-9')}</h2><p className="text-sm text-[var(--fg-muted)] mt-1 leading-relaxed">{t('One intention, written three times in the morning, six at midday, nine in the evening. For 33 days.')}</p></div>
    <div className="px-5 pb-5 space-y-5">
      {active && progress && <>
        <div className="min-w-0"><p className={smallLabel}>{t('Your intention')}</p><p className="text-[15px] font-medium leading-relaxed mt-1 break-words">{active.intention}</p><p className="text-xs text-[var(--fg-subtle)] mt-1">{t('Started {date}', { date: dateLabel(active.startDateKey) })}</p></div>
        <div className="space-y-2"><div className="flex justify-between flex-wrap gap-2 text-sm"><span>{t('{n} / 33 days', { n: progress.currentStreak })}</span><span className="text-[var(--fg-muted)]">{t('{n} complete days', { n: progress.totalCompletedDays })}</span></div><div className="h-1.5 w-full bg-[var(--border-strong)] rounded-full overflow-hidden"><div className="h-full bg-[var(--accent)] rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, progress.progressPercent))}%` }} /></div>{progress.targetReached && <span className="flex gap-1.5 text-sm text-[var(--accent)] items-center"><Check className="w-4 h-4" strokeWidth={1.8} />{t('33 days reached')}</span>}</div>
        <p className="text-xs text-[var(--fg-muted)]">{progress.completedToday ? t('All three sessions are saved for today.') : t('Progress counts saved matching repetitions only.')}</p>
        <div className="flex flex-wrap items-end gap-3"><div className="w-full max-w-[200px]"><NField id="369-writing-date" label={t('Date')}><NInput id="369-writing-date" type="date" min={active.startDateKey} max={today} value={selectedDate} onChange={e => { if (e.target.value && e.target.value <= today && e.target.value >= active.startDateKey) setWritingDate(e.target.value); }} /></NField></div>{selectedDate !== today && <button type="button" className={quietButton} onClick={() => setWritingDate(today)}>{t('Back to today')}</button>}</div>
        {selectedDate !== today && <p className="text-xs text-[var(--fg-muted)]">{t('You are revisiting a past day. Editing it does not earn another reward.')}</p>}
        <div className="space-y-4 border-t border-[var(--border)] pt-4">
          <div role="group" aria-label={t('Writing session')} className="flex p-1 bg-[var(--bg)] rounded-[var(--radius-sm)]">{SLOTS.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={slot === id} onClick={() => setSlot(id)} className={`flex-1 h-11 rounded-[var(--radius-xs)] flex items-center justify-center gap-1.5 text-sm cursor-pointer focus-visible:outline focus-visible:outline-2 ${slot === id ? 'bg-[var(--fg)] text-[var(--bg)] font-medium' : 'text-[var(--fg-muted)]'}`}><Icon className="w-4 h-4" strokeWidth={1.8} aria-hidden="true" /><span>{t(label)}</span><span className="opacity-70">{doneCount(id)}/{NOTEBOOK_369_SLOT_COUNTS[id]}</span></button>)}</div>
          <div className="min-w-0">{SLOTS.map(({ id }) => <RepetitionEditor key={`${active.id}:${selectedDate}:${id}`} practice={active} today={selectedDate} slot={id} hidden={slot !== id} />)}</div>
        </div>
        <div className="flex flex-wrap gap-4"><button type="button" className={`${quietButton} gap-1.5`} onClick={() => setShowNew(!showNew)} aria-expanded={showNew}><Plus className="w-4 h-4" strokeWidth={1.8} />{t('New intention')}</button><button type="button" className={`${quietButton} gap-1.5`} onClick={archive} disabled={busy}><Archive className="w-4 h-4" strokeWidth={1.8} />{t('Archive')}</button></div>
      </>}
      {(!active || showNew) && <form onSubmit={start} className="space-y-4"><NField id="369-intention" label={t('A short intention')} required error={invalid ? t('Write an intention to begin.') : undefined}><NInput id="369-intention" value={intention} onChange={e => { setIntention(e.target.value); setInvalid(false); }} disabled={busy} placeholder={t('I am consistent with the work that matters to me.')} maxLength={500} /></NField><p className="text-xs text-[var(--fg-muted)]">{t('A new intention starts a new practice and keeps the old one in history.')}</p><NButton type="submit" icon={Plus} isLoading={busy}>{t('Begin')}</NButton></form>}
      <ActionNotice notice={notice} />
    </div>
    <details className="border-t border-[var(--border)]"><summary className="px-5 py-4 min-h-[52px] flex items-center cursor-pointer text-sm font-medium text-[var(--fg-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset">{t('History ({n})', { n: practices.length })}</summary><div className="px-5 pb-5 space-y-3 max-h-[600px] overflow-y-auto">{practices.length === 0 ? <p className="text-sm text-[var(--fg-muted)]">{t('Your intentions and written repetitions will be kept here.')}</p> : practices.map(practice => <details key={practice.id} className="border-t border-[var(--border)] pt-3"><summary className="cursor-pointer min-h-[44px]"><span className="text-sm font-medium break-words">{practice.intention}</span><span className="block text-xs text-[var(--fg-muted)] mt-0.5">{dateLabel(practice.startDateKey)} · {practice.archivedAt ? t('Archived') : t('Active')}</span></summary><div className="mt-3 space-y-4">{Object.keys(practice.days).length === 0 ? <p className="text-xs text-[var(--fg-muted)]">{t('No repetitions saved yet.')}</p> : Object.entries(practice.days).sort(([a], [b]) => b.localeCompare(a)).map(([day, saved]) => <section key={day}><h3 className={smallLabel}>{dateLabel(day)}</h3><div className="grid sm:grid-cols-3 gap-4 mt-2">{SLOTS.map(({ id, label }) => <div key={id}><h4 className="text-xs font-medium mb-1">{t(label)}</h4><ol className="list-decimal pl-5 text-xs text-[var(--fg-muted)] space-y-1">{saved[id].map((line, i) => <li key={i} className="whitespace-pre-wrap break-words">{line || t('Not written')}</li>)}</ol>{saved[id].length === 0 && <p className="text-xs text-[var(--fg-muted)]">{t('Not written')}</p>}</div>)}</div></section>)}</div></details>)}</div></details>
  </div>;
};
