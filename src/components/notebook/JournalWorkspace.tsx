import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Plus, Search, Trash2, X } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { N_, useT } from '../../i18n';
import { getNotebookEntries, type NotebookDisplayEntry } from '../../services/notebook';
import type { DreamJournalEntry, NotebookMood } from '../../types/models';
import { NotebookCalendar } from './NotebookCalendar';
import { ActionNotice, dateLabel, quietButton, smallLabel, cardCls, NButton, NField, NInput, NSelect, NTextarea, useNotebookAction, useSessionDraft } from './shared';

const MOODS = [
  ['joyful', N_('Joyful')], ['calm', N_('Calm')], ['grateful', N_('Grateful')],
  ['focused', N_('Focused')], ['tired', N_('Tired')], ['anxious', N_('Anxious')],
] as const;
const LEGACY_MOODS = [['triumphant', N_('Triumphant')], ['focused', N_('Focused')], ['grateful', N_('Grateful')], ['visionary', N_('Visionary')], ['breakthrough', N_('Breakthrough')]] as const;
const moodLabel = (mood: string) => [...MOODS, ...LEGACY_MOODS].find(([id]) => id === mood)?.[1] || mood;
const SEED_TEXT: Record<string, Record<string, string>> = {
  'journal-seed-1': {
    title: 'Morning Focus & Sanctuary Awakening',
    content: 'Woke up at 6:00 AM without hitting snooze. Sat in quiet stillness with black coffee before looking at any screens. Visualized walking into the morning light of the waterfront villa—felt the standard of the day elevate immediately.',
    dreamName: 'Lake Como Waterfront Modernist Villa',
  },
  'journal-seed-2': {
    title: 'Locked In: 90-Minute Pure Deep Work Sprint',
    content: 'Finished the core architecture milestone ahead of schedule. When the urge to open social media hit at minute 40, I remembered my Future Self identity. Refused to yield.',
    dreamName: 'Bespoke Executive Studio & Work Machine',
  },
};


export const JournalWorkspace: React.FC<{ today: string }> = ({ today }) => {
  const t = useT();
  const { data, saveNotebookEntry, updateDreamJournalEntry, deleteNotebookEntry, deleteDreamJournalEntry } = useApp();
  const { busy, notice, run, setNotice } = useNotebookAction();
  const [editingRef, setEditingRef] = useSessionDraft<{ id: string; source: 'notebook' | 'dream' } | null>('journal:editing', null);
  const editing = data && editingRef ? getNotebookEntries(data, { kinds: ['journal'] }).find(entry => entry.id === editingRef.id && entry.source === editingRef.source) || null : null;
  const setEditing = (entry: NotebookDisplayEntry | null) => setEditingRef(entry ? { id: entry.id, source: entry.source } : null);
  const [title, setTitle] = useSessionDraft('journal:title', '');
  const [content, setContent] = useSessionDraft('journal:content', '');
  const [mood, setMood] = useSessionDraft('journal:mood', '');
  const [baseline, setBaseline] = useSessionDraft('journal:baseline', '\u0000\u0000');
  const [query, setQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(true);
  const [validation, setValidation] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const photoDialog = useRef<HTMLDialogElement>(null);
  const displayText = (entry: NotebookDisplayEntry, field: 'title' | 'content' | 'dreamName') => {
    const value = entry[field] || '';
    return entry.source === 'dream' && SEED_TEXT[entry.id]?.[field] === value ? t(value) : value;
  };
  const dirty = `${title}\u0000${content}\u0000${mood}` !== baseline;
  const entries = useMemo(() => data ? getNotebookEntries(data, { kinds: ['journal'], dateKey: selectedDate || undefined }).filter(entry => !query.trim() || [entry.title, entry.content, entry.dreamName || '', displayText(entry, 'title'), displayText(entry, 'content'), displayText(entry, 'dreamName')].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())) : [], [data, query, selectedDate, t]);
  const dates = useMemo(() => new Set(data ? getNotebookEntries(data, { kinds: ['journal'] }).map(entry => entry.dateKey) : []), [data]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => {
    if (photoOpen) photoDialog.current?.showModal();
    else photoDialog.current?.close();
  }, [photoOpen]);

  if (!data) return null;
  const reset = () => { setEditing(null); setTitle(''); setContent(''); setMood(''); setBaseline('\u0000\u0000'); setValidation(false); };
  const canReplace = () => !busy && (!dirty || window.confirm(t('Discard your unsaved changes?')));
  const openEntry = (entry: NotebookDisplayEntry) => {
    if (editing?.viewId === entry.viewId || !canReplace()) return;
    const shownTitle = displayText(entry, 'title');
    const shownContent = displayText(entry, 'content');
    setEditing(entry); setTitle(shownTitle); setContent(shownContent); setMood(entry.mood || '');
    setBaseline(`${shownTitle}\u0000${shownContent}\u0000${entry.mood || ''}`); setValidation(false); setNotice(null);
    document.getElementById('notebook-journal-title')?.scrollIntoView({ behavior: 'auto', block: 'center' });
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (editingRef && !editing) { setNotice({ error: true, message: t('This notebook record no longer exists.') }); return; }
    if (!content.trim()) { setValidation(true); document.getElementById('notebook-journal-content')?.focus(); return; }
    const result = await run(async () => {
      if (editing?.source === 'dream') {
        await updateDreamJournalEntry(editing.id, { title: title === baseline.split('\u0000')[0] ? editing.title : title, content: content === baseline.split('\u0000')[1] ? editing.content : content, mood: (mood || undefined) as DreamJournalEntry['mood'] });
        return true;
      }
      return saveNotebookEntry({ id: editing?.id, kind: 'journal', title, content, mood: (mood || undefined) as NotebookMood | undefined });
    });
    if (result !== undefined) reset();
  };
  const remove = async () => {
    if (!editing || busy || !window.confirm(t('Delete this entry? This cannot be undone.'))) return;
    const result = await run(async () => { if (editing.source === 'dream') await deleteDreamJournalEntry(editing.id); else await deleteNotebookEntry(editing.id); return true; }, 'Entry deleted.');
    if (result) reset();
  };

  return <div className="space-y-6">
    <div className={cardCls}>
      <div className="p-5 flex items-start justify-between gap-3">
        <div><p className={smallLabel}>{editing ? dateLabel(editing.dateKey) : dateLabel(today)}</p><h2 className="text-lg font-semibold tracking-tight text-[var(--fg)] mt-0.5">{editing ? t('Edit entry') : t('Today')}</h2></div>
        <NButton type="button" variant="ghost" icon={Plus} disabled={busy} onClick={() => { if (canReplace()) { reset(); setNotice(null); } }}>{t('New')}</NButton>
      </div>
      <form onSubmit={save} className="px-5 pb-5 space-y-4">
        {editing?.source === 'dream' && <p className="text-xs text-[var(--fg-muted)]">{t('From dream journal')}{editing.dreamName ? ` · ${displayText(editing, 'dreamName')}` : ''}</p>}
        <NField id="notebook-journal-title" label={t('Title')}><NInput id="notebook-journal-title" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('Optional')} disabled={busy} maxLength={200} /></NField>
        <NField id="notebook-journal-content" label={t('Your writing')} error={validation && !content.trim() ? t('Write a few words before saving.') : undefined} required>
          <NTextarea id="notebook-journal-content" value={content} onChange={e => { setContent(e.target.value); setValidation(false); }} placeholder={t('What happened, what did you feel, and what do you want to remember?')} rows={12} className="!text-[15px] !leading-relaxed !min-h-[280px]" disabled={busy} hasError={validation && !content.trim()} aria-invalid={validation && !content.trim()} />
        </NField>
        <div className="sm:max-w-xs"><NField id="notebook-journal-mood" label={t('Mood')}><NSelect id="notebook-journal-mood" value={mood} onChange={e => setMood(e.target.value)} disabled={busy} options={[{ value: '', label: t('None') }, ...(editing?.source === 'dream' ? LEGACY_MOODS : MOODS).map(([value, label]) => ({ value, label: t(label) }))]} /></NField></div>
        {editing?.photoDataUrl && <div><button type="button" onClick={() => setPhotoOpen(true)} className="block max-w-full rounded-[var(--radius-sm)] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" aria-label={t('View journal photo')}><img src={editing.photoDataUrl} alt={t('Journal photo')} className="max-h-48 max-w-full object-contain" /></button><p className="text-xs text-[var(--fg-muted)] mt-2">{t('Your original photo and dream link stay with this entry.')}</p></div>}
        <ActionNotice notice={notice} />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
          <div className="flex flex-wrap gap-2"><NButton type="submit" isLoading={busy}>{editing ? t('Save') : t('Save entry')}</NButton>{editing && <NButton type="button" variant="ghost" disabled={busy} onClick={() => { if (canReplace()) { reset(); setNotice(null); } }}>{t('Cancel')}</NButton>}</div>
          {editing ? <button type="button" className={`${quietButton} !text-[var(--danger)] gap-1.5`} onClick={remove} disabled={busy}><Trash2 className="w-4 h-4" strokeWidth={1.8} />{t('Delete')}</button> : <span className="text-xs text-[var(--fg-muted)]">{dirty ? t('Unsaved') : t('Just for you')}</span>}
        </div>
      </form>
    </div>

    <section className="min-w-0 space-y-3" aria-label={t('Journal archive')}>
      <div className="flex justify-between items-center"><h2 className="text-[15px] font-semibold">{t('Entries')} <span className="text-[var(--fg-muted)] font-normal">({entries.length})</span></h2><NButton type="button" variant="ghost" icon={CalendarDays} aria-expanded={showCalendar} aria-controls="notebook-calendar" onClick={() => setShowCalendar(!showCalendar)}>{t('Calendar')}</NButton></div>
      <div className="relative"><Search className="absolute left-3 top-3.5 w-4 h-4 text-[var(--fg-muted)]" aria-hidden="true" strokeWidth={1.8} /><label htmlFor="notebook-journal-search" className="sr-only">{t('Search entries')}</label><NInput id="notebook-journal-search" type="search" className="pl-9 !bg-[var(--bg-muted)] !border-transparent" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('Search')} /></div>
      {showCalendar && <div id="notebook-calendar"><NotebookCalendar today={today} selected={selectedDate} dates={dates} onSelect={setSelectedDate} /></div>}
      {selectedDate && <div className="flex gap-2 justify-between items-center text-sm"><span>{dateLabel(selectedDate)}</span><button type="button" className={quietButton} onClick={() => setSelectedDate('')}>{t('All dates')}</button></div>}
      {entries.length === 0 ? <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 text-center"><p className="text-[15px] font-semibold">{query || selectedDate ? t('No entries match.') : t('Nothing written yet')}</p><p className="text-sm text-[var(--fg-muted)] mt-1">{query || selectedDate ? t('Try another word or choose all dates.') : t('Your first entry will appear here.')}</p>{(query || selectedDate) && <button type="button" className={`${quietButton} mt-2`} onClick={() => { setQuery(''); setSelectedDate(''); }}>{t('Clear filters')}</button>}</div> : <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] divide-y divide-[var(--border)] max-h-[650px] overflow-y-auto">{entries.map(entry => <button type="button" key={entry.viewId} disabled={busy} aria-current={editing?.viewId === entry.viewId ? 'true' : undefined} onClick={() => openEntry(entry)} className={`w-full text-left px-4 py-3 min-h-[56px] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset disabled:opacity-50 ${editing?.viewId === entry.viewId ? 'bg-[var(--bg-inset)]' : ''}`}>
        <span className="flex justify-between gap-2 text-xs text-[var(--fg-muted)]"><span>{dateLabel(entry.dateKey, { month: 'short', day: 'numeric', year: 'numeric' })}</span>{entry.source === 'dream' && <span>{t('Dream journal')}</span>}</span>
        <span className="text-[15px] font-medium leading-snug block break-words mt-0.5">{displayText(entry, 'title') || t('Untitled')}</span>
        <span className="text-sm text-[var(--fg-muted)] line-clamp-2 block mt-0.5 break-words">{displayText(entry, 'content')}</span>
        {(entry.photoDataUrl || entry.mood) && <span className="flex flex-wrap items-center gap-2 mt-2">{entry.photoDataUrl && <img src={entry.photoDataUrl} alt="" className="w-10 h-10 object-cover rounded-[var(--radius-xs)]" loading="lazy" />}{entry.mood && <span className="text-xs text-[var(--fg-muted)]">{t(moodLabel(entry.mood))}</span>}</span>}
      </button>)}</div>}
    </section>
    <dialog ref={photoDialog} aria-label={t('Journal photo')} onClose={() => setPhotoOpen(false)} onClick={e => { if (e.target === e.currentTarget) setPhotoOpen(false); }} className="m-auto max-w-[95vw] max-h-[95vh] p-4 bg-[var(--bg)] text-[var(--fg)] rounded-[var(--radius-md)] backdrop:bg-black/85">
      <div className="flex justify-end mb-2"><button autoFocus type="button" aria-label={t('Close photo')} onClick={() => setPhotoOpen(false)} className="w-11 h-11 flex items-center justify-center text-[var(--fg-muted)] cursor-pointer"><X className="w-5 h-5" strokeWidth={1.8} /></button></div>
      {editing?.photoDataUrl && <img src={editing.photoDataUrl} alt={t('Journal photo')} className="max-w-full max-h-[78vh] object-contain" />}
    </dialog>
  </div>;
};
