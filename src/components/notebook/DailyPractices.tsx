import React, { useEffect, useRef, useState } from 'react';
import { Headphones, Pencil, Square, Trash2 } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { useT } from '../../i18n';
import { normalizeNotebook } from '../../services/notebook';
import { voiceGuide } from '../../utils/voiceGuide';
import { ActionNotice, dateLabel, quietButton, smallLabel, cardCls, NButton, NField, NInput, NTextarea, useNotebookAction, useSessionDraft, useDraftGuard } from './shared';

const summaryCls = 'px-5 py-4 min-h-[52px] flex items-center cursor-pointer text-sm font-medium text-[var(--fg-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset';

export const GratitudePractice: React.FC<{ today: string }> = ({ today }) => {
  const t = useT();
  const { data, saveGratitudeDay } = useApp();
  const { busy, notice, run, setNotice } = useNotebookAction();
  const days = normalizeNotebook(data?.notebook).gratitudeDays;
  const [date, setDate] = useSessionDraft('gratitude:date', today);
  const initial = () => Array.from({ length: 5 }, (_, i) => days.find(day => day.dateKey === date)?.items[i] || '');
  const [items, setItems] = useSessionDraft<string[]>('gratitude:items', initial);
  const [baseline, setBaseline] = useSessionDraft('gratitude:baseline', () => initial().join('\u0000'));
  const [invalid, setInvalid] = useState(false);
  const dirty = items.join('\u0000') !== baseline;
  useDraftGuard(dirty);
  const pickDate = (value: string) => {
    if (!value || value > today || busy || (dirty && !window.confirm(t('Discard your unsaved changes?')))) return;
    const saved = days.find(day => day.dateKey === value);
    const next = Array.from({ length: 5 }, (_, i) => saved?.items[i] || '');
    setDate(value); setItems(next); setBaseline(next.join('\u0000')); setInvalid(false); setNotice(null);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.some(item => item.trim())) { setInvalid(true); return; }
    const result = await run(() => saveGratitudeDay(date, items));
    if (result !== undefined) setBaseline(items.join('\u0000'));
  };
  return <div className={cardCls}>
    <div className="p-5"><h2 className="text-lg font-semibold tracking-tight">{t('Gratitude')}</h2><p className="text-sm text-[var(--fg-muted)] leading-relaxed mt-1">{t('Five things you are grateful for. Small and specific is enough.')}</p></div>
    <form onSubmit={save} className="px-5 pb-5 space-y-4">
      <div className="flex flex-wrap items-end gap-3"><div className="w-full max-w-[200px]"><NField id="gratitude-date" label={t('Date')}><NInput id="gratitude-date" type="date" max={today} value={date} disabled={busy} onChange={e => pickDate(e.target.value)} /></NField></div>{date !== today && <button type="button" className={quietButton} onClick={() => pickDate(today)} disabled={busy}>{t('Back to today')}</button>}</div>
      {date !== today && <p className="text-xs text-[var(--fg-muted)]">{t('You are revisiting a past day. Editing it does not earn another reward.')}</p>}
      <fieldset disabled={busy} className="space-y-3"><legend className="sr-only">{t('Five gratitude notes')}</legend>{items.map((item, index) => <div key={index} className="flex items-start gap-3"><span className="text-sm text-[var(--fg-muted)] mt-3 w-4 shrink-0" aria-hidden="true">{index + 1}</span><label className="sr-only" htmlFor={`gratitude-${index}`}>{t('Gratitude {n}', { n: index + 1 })}</label><NTextarea id={`gratitude-${index}`} rows={2} className="!min-h-[64px]" value={item} onChange={e => { const value = e.target.value; setItems(previous => previous.map((text, i) => i === index ? value : text)); setInvalid(false); }} placeholder={index === 0 ? t('A person, a moment, something small') : t('Something you appreciate')} /></div>)}</fieldset>
      {invalid && <p role="alert" className="text-sm text-[var(--danger)]">{t('Write at least one thing you are grateful for.')}</p>}
      <ActionNotice notice={notice} />
      <div className="flex flex-wrap items-center justify-between gap-3"><NButton type="submit" isLoading={busy}>{t('Save')}</NButton><span className="text-xs text-[var(--fg-muted)]">{t('{n} / 5', { n: items.filter(item => item.trim()).length })}</span></div>
    </form>
    <details className="border-t border-[var(--border)]"><summary className={summaryCls}>{t('History ({n})', { n: days.length })}</summary><div className="px-5 pb-5 max-h-[480px] overflow-y-auto space-y-4">{days.length === 0 ? <p className="text-sm text-[var(--fg-muted)]">{t('Your gratitude notes will be kept here.')}</p> : [...days].sort((a, b) => b.dateKey.localeCompare(a.dateKey)).map(day => <article key={day.dateKey} className="border-t border-[var(--border)] pt-4"><h3 className={smallLabel}>{dateLabel(day.dateKey)}</h3><ol className="list-decimal pl-5 text-sm leading-relaxed text-[var(--fg)] space-y-1.5 mt-2">{day.items.map((item, i) => <li key={i} className="whitespace-pre-wrap break-words">{item || <span className="text-[var(--fg-subtle)]">{t('Not written')}</span>}</li>)}</ol><button type="button" onClick={() => pickDate(day.dateKey)} disabled={busy} className={quietButton}>{t('Revisit this day')}</button></article>)}</div></details>
  </div>;
};

export const AffirmationPractice: React.FC<{ active: boolean }> = ({ active }) => {
  const t = useT();
  const { data, saveNotebookAffirmation, deleteNotebookAffirmation } = useApp();
  const { busy, notice, run, setNotice } = useNotebookAction();
  const affirmations = normalizeNotebook(data?.notebook).affirmations;
  const [text, setText] = useSessionDraft('affirmation:text', '');
  const [editingId, setEditingId] = useSessionDraft<string | null>('affirmation:editing', null);
  useDraftGuard(Boolean(text.trim()));
  const [invalid, setInvalid] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ownsVoice = useRef(false);
  const supported = voiceGuide.isSupported();
  const stop = () => { if (ownsVoice.current) voiceGuide.stop(); ownsVoice.current = false; setPlaying(false); };
  useEffect(() => {
    const unsubscribe = voiceGuide.onSpeakingChange(speaking => { if (ownsVoice.current) { setPlaying(speaking); if (!speaking) ownsVoice.current = false; } });
    return () => { unsubscribe(); if (ownsVoice.current) voiceGuide.stop(); };
  }, []);
  useEffect(() => { if (!active) stop(); }, [active]);
  const play = (words: string) => {
    if (ownsVoice.current) stop();
    if (voiceGuide.speakBrowserOnly(words)) { ownsVoice.current = true; setPlaying(true); }
    else setNotice({ error: true, message: t('Voice playback is not available in this browser.') });
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) { setInvalid(true); return; }
    const result = await run(() => saveNotebookAffirmation({ id: editingId || undefined, text }));
    if (result !== undefined) { setText(''); setEditingId(null); setInvalid(false); }
  };
  const remove = async (id: string) => {
    if (!window.confirm(t('Delete this affirmation?'))) return;
    stop();
    const result = await run(async () => { await deleteNotebookAffirmation(id); return true; }, 'Affirmation deleted.');
    if (result && editingId === id) { setEditingId(null); setText(''); }
  };
  return <div className={cardCls}>
    <div className="p-5"><h2 className="text-lg font-semibold tracking-tight">{t('Affirmations')}</h2><p className="text-sm text-[var(--fg-muted)] leading-relaxed mt-1">{t('The qualities you are choosing to practise. Read them, or hear them in your device voice.')}</p></div>
    <div className="px-5 pb-5 space-y-5">
      <form onSubmit={save} className="space-y-3"><NField id="affirmation-text" label={editingId ? t('Edit affirmation') : t('Your affirmation')} required error={invalid ? t('Write an affirmation before saving.') : undefined}><NTextarea id="affirmation-text" rows={3} value={text} onChange={e => { setText(e.target.value); setInvalid(false); }} disabled={busy} placeholder={t('I am becoming someone who keeps promises to myself.')} hasError={invalid} aria-invalid={invalid} /></NField><div className="flex flex-wrap gap-3 items-center"><NButton type="submit" isLoading={busy}>{editingId ? t('Save') : t('Add')}</NButton>{editingId && <button type="button" disabled={busy} className={quietButton} onClick={() => { setEditingId(null); setText(''); setInvalid(false); }}>{t('Cancel')}</button>}</div></form>
      <ActionNotice notice={notice} />
      <div className="flex flex-wrap justify-between gap-3 items-center border-t border-[var(--border)] pt-4"><h3 className="text-[15px] font-semibold">{t('Your words')} <span className="text-[var(--fg-muted)] font-normal">({affirmations.length})</span></h3>{playing ? <NButton type="button" variant="secondary" icon={Square} onClick={stop}>{t('Stop')}</NButton> : <NButton type="button" variant="secondary" icon={Headphones} disabled={!supported || affirmations.length === 0} onClick={() => play(affirmations.map(item => item.text).join('\n\n'))}>{t('Listen to all')}</NButton>}</div>
      {!supported && <p className="text-xs text-[var(--fg-muted)]">{t('Voice playback is not available in this browser. Your words are always here to read.')}</p>}
      {affirmations.length === 0 ? <p className="py-2 text-sm text-[var(--fg-muted)] leading-relaxed">{t('One honest sentence is a good beginning.')}</p> : <ul className="divide-y divide-[var(--border)]">{affirmations.map(item => <li key={item.id} className="py-4 first:pt-0"><p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{item.text}</p><div className="flex flex-wrap gap-4 mt-1"><button type="button" className={`${quietButton} gap-1.5`} disabled={!supported} onClick={() => play(item.text)}><Headphones className="w-4 h-4" strokeWidth={1.8} />{t('Listen')}</button><button type="button" className={`${quietButton} gap-1.5`} disabled={busy} onClick={() => { if (text.trim() && !window.confirm(t('Discard your unsaved changes?'))) return; setEditingId(item.id); setText(item.text); setNotice(null); document.getElementById('affirmation-text')?.focus(); }}><Pencil className="w-4 h-4" strokeWidth={1.8} />{t('Edit')}</button><button type="button" className={`${quietButton} gap-1.5`} disabled={busy} onClick={() => remove(item.id)}><Trash2 className="w-4 h-4" strokeWidth={1.8} />{t('Delete')}</button></div></li>)}</ul>}
    </div>
  </div>;
};
