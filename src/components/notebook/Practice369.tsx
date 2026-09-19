import React, { useState } from 'react';
import { Archive, Check, Moon, Plus, Repeat2, Sun, Sunrise } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { N_, useT } from '../../i18n';
import { get369Progress, normalizeNotebook, matches369Intention, NOTEBOOK_369_SLOT_COUNTS } from '../../services/notebook';
import type { Notebook369Practice, Notebook369Slot } from '../../types/models';
import { Button, Card, Field, Input, Progress } from '../ui';
import { ActionNotice, dateLabel, quietButton, smallLabel, useNotebookAction, useSessionDraft, useDraftGuard } from './shared';

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
    <fieldset disabled={busy} className="space-y-2"><legend className="sr-only">{t(label)} — {t('Written repetitions')}</legend>{lines.map((line, index) => <div key={index} className="flex gap-3 items-center"><span aria-hidden="true" className="font-mono text-[11px] text-[var(--fg-muted)] w-4 shrink-0">{String(index + 1).padStart(2, '0')}</span><label className="sr-only" htmlFor={`369-${slot}-${index}`}>{t('{slot} repetition {n}', { slot: t(label), n: index + 1 })}</label><Input id={`369-${slot}-${index}`} value={line} onChange={e => { const value = e.target.value; setLines(previous => previous.map((item, i) => i === index ? value : item)); setInvalid(false); }} autoComplete="off" placeholder={t('Write your intention here')} hasError={invalid && Boolean(line.trim()) && !matches369Intention(line, practice.intention)} aria-invalid={invalid && Boolean(line.trim()) && !matches369Intention(line, practice.intention)} /></div>)}</fieldset>
    {invalid && <p role="alert" className="text-sm text-[var(--danger)]">{mismatched ? t('Each written line must match your intention. Empty lines can be saved for later.') : t('Write your intention at least once before saving.')}</p>}
    <ActionNotice notice={notice} />
    <Button type="submit" size="sm" isLoading={busy}>{t('Save {slot}', { slot: t(label) })}</Button>
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
  return <Card padding="none" className="min-w-0 overflow-hidden lg:col-span-2">
    <div className="p-5 sm:p-6 border-b border-[var(--border)] flex flex-wrap justify-between items-start gap-4"><div><p className={smallLabel}>03</p><h2 className="font-display text-3xl mt-2">{t('The 3–6–9 practice')}</h2><p className="text-sm text-[var(--fg-muted)] mt-2 leading-relaxed max-w-2xl">{t('One intention, written three times in the morning, six at midday, and nine in the evening. Return for 33 days.')}</p></div><Repeat2 className="w-5 h-5 text-[var(--color-coral)]" aria-hidden="true" /></div>
    <div className="p-5 sm:p-6 space-y-5">
      {active && progress && <>
        <div className="flex flex-wrap justify-between items-start gap-4"><div className="min-w-0"><p className={smallLabel}>{t('Your intention')}</p><blockquote className="font-display text-2xl sm:text-3xl leading-snug mt-2 break-words">{active.intention}</blockquote></div><span className="text-[11px] text-[var(--fg-muted)]">{t('Started {date}', { date: dateLabel(active.startDateKey) })}</span></div>
        <div className="grid sm:grid-cols-[minmax(0,1fr)_auto] gap-3 items-center"><div><div className="flex justify-between flex-wrap gap-2 text-xs mb-2"><span>{t('{n} / 33 consecutive days', { n: progress.currentStreak })}</span><span className="text-[var(--fg-muted)]">{t('{n} complete days in total', { n: progress.totalCompletedDays })}</span></div><Progress value={progress.progressPercent} showLabel={false} variant="sage" /></div>{progress.targetReached && <span className="flex gap-1.5 text-xs text-[var(--color-sage)] items-center"><Check className="w-4 h-4" />{t('33-day milestone reached')}</span>}</div>
        <p className="text-xs text-[var(--fg-muted)]">{progress.completedToday ? t('All three sessions are saved for today.') : t('Progress counts saved matching repetitions, never taps or listening.')}</p>
        <div className="flex flex-wrap items-end gap-3"><div className="max-w-[200px]"><Field id="369-writing-date" label={t('Writing date')}><Input id="369-writing-date" type="date" min={active.startDateKey} max={today} value={selectedDate} onChange={e => { if (e.target.value && e.target.value <= today && e.target.value >= active.startDateKey) setWritingDate(e.target.value); }} /></Field></div>{selectedDate !== today && <button type="button" className={`${quietButton} mb-3`} onClick={() => setWritingDate(today)}>{t('Back to today')}</button>}</div>
        {selectedDate !== today && <p className="text-xs text-[var(--fg-muted)]">{t('You are revisiting a past day. Editing it does not earn another reward.')}</p>}
        <div className="grid sm:grid-cols-[200px_minmax(0,1fr)] gap-5 border-t border-[var(--border)] pt-5">
          <div className="space-y-2"><p className={`${smallLabel} mb-3`}>{dateLabel(selectedDate)}</p><div role="group" aria-label={t('Writing session')} className="grid grid-cols-3 sm:grid-cols-1 gap-2">{SLOTS.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={slot === id} onClick={() => setSlot(id)} className={`p-3 border rounded-[var(--radius-sm)] text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${slot === id ? 'border-[var(--fg)] bg-[var(--bg-muted)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'}`}><Icon className="w-4 h-4 text-[var(--fg-muted)] mb-2" aria-hidden="true" /><span className="block text-xs font-semibold">{t(label)}</span><span className="block text-[11px] mt-1 text-[var(--fg-muted)]">{(active.days[selectedDate]?.[id] || []).filter(line => matches369Intention(line, active.intention)).length} / {NOTEBOOK_369_SLOT_COUNTS[id]}{(active.days[selectedDate]?.[id] || []).filter(line => matches369Intention(line, active.intention)).length === NOTEBOOK_369_SLOT_COUNTS[id] ? ' ✓' : ''}</span></button>)}</div></div>
          <div className="min-w-0">{SLOTS.map(({ id }) => <RepetitionEditor key={`${active.id}:${selectedDate}:${id}`} practice={active} today={selectedDate} slot={id} hidden={slot !== id} />)}</div>
        </div>
        <div className="flex flex-wrap gap-4 pt-3"><button type="button" className={`${quietButton} flex items-center gap-1.5`} onClick={() => setShowNew(!showNew)} aria-expanded={showNew}><Plus className="w-3.5 h-3.5" />{t('Start a different intention')}</button><button type="button" className={`${quietButton} flex items-center gap-1.5`} onClick={archive} disabled={busy}><Archive className="w-3.5 h-3.5" />{t('Archive practice')}</button></div>
      </>}
      {(!active || showNew) && <form onSubmit={start} className="space-y-4"><Field id="369-intention" label={t('A short intention you can return to')} required error={invalid ? t('Write an intention to begin.') : undefined}><Input id="369-intention" value={intention} onChange={e => { setIntention(e.target.value); setInvalid(false); }} disabled={busy} placeholder={t('I am consistent with the work that matters to me.')} maxLength={500} /></Field><p className="text-xs text-[var(--fg-muted)]">{t('Choose words that feel meaningful to you. A new intention starts a new practice and keeps the old one in history.')}</p><Button type="submit" size="sm" icon={Plus} isLoading={busy}>{t('Begin practice')}</Button></form>}
      <ActionNotice notice={notice} />
    </div>
    <details className="border-t border-[var(--border)]"><summary className="p-5 sm:px-6 cursor-pointer text-xs font-semibold text-[var(--fg-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset">{t('Practice history ({n})', { n: practices.length })}</summary><div className="px-5 sm:px-6 pb-5 space-y-3 max-h-[600px] overflow-y-auto">{practices.length === 0 ? <p className="text-sm text-[var(--fg-muted)]">{t('Your intentions and written repetitions will be kept here.')}</p> : practices.map(practice => <details key={practice.id} className="border border-[var(--border)] rounded-sm p-4"><summary className="cursor-pointer"><span className="text-sm font-semibold break-words">{practice.intention}</span><span className="block text-[11px] text-[var(--fg-muted)] mt-1">{dateLabel(practice.startDateKey)} · {practice.archivedAt ? t('Archived') : t('Active')}</span></summary><div className="mt-4 space-y-4">{Object.keys(practice.days).length === 0 ? <p className="text-xs text-[var(--fg-muted)]">{t('No repetitions saved yet.')}</p> : Object.entries(practice.days).sort(([a], [b]) => b.localeCompare(a)).map(([day, saved]) => <section key={day}><h3 className={`${smallLabel} border-b border-[var(--border)] pb-2`}>{dateLabel(day)}</h3><div className="grid sm:grid-cols-3 gap-4 mt-3">{SLOTS.map(({ id, label }) => <div key={id}><h4 className="text-xs font-semibold mb-2">{t(label)}</h4><ol className="list-decimal pl-5 text-xs text-[var(--fg-muted)] space-y-1.5">{saved[id].map((line, i) => <li key={i} className="whitespace-pre-wrap break-words">{line || t('Not written')}</li>)}</ol>{saved[id].length === 0 && <p className="text-xs text-[var(--fg-muted)]">{t('Not written')}</p>}</div>)}</div></section>)}</div></details>)}</div></details>
  </Card>;
};
