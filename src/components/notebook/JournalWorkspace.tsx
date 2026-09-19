import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CalendarDays, Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { N_, useT } from '../../i18n';
import { getNotebookEntries, type NotebookDisplayEntry } from '../../services/notebook';
import type { DreamJournalEntry, NotebookMood } from '../../types/models';
import { Badge, Button, Card, Field, Input, Select, Textarea } from '../ui';
import { NotebookCalendar } from './NotebookCalendar';
import { ActionNotice, dateLabel, quietButton, smallLabel, useNotebookAction, useSessionDraft } from './shared';

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

  return <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.8fr)_minmax(290px,1fr)] gap-6 items-start">
    <Card padding="none" className="min-w-0 overflow-hidden">
      <div className="px-5 sm:px-7 pt-6 pb-4 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)]">
        <div><p className={smallLabel}>{editing ? dateLabel(editing.dateKey) : dateLabel(today)}</p><h2 className="font-display text-3xl text-[var(--fg)] mt-1">{editing ? t('Revisit a page') : t('A page for today')}</h2></div>
        <Button type="button" variant="ghost" size="sm" icon={Plus} disabled={busy} onClick={() => { if (canReplace()) { reset(); setNotice(null); } }}>{t('New entry')}</Button>
      </div>
      <form onSubmit={save} className="p-5 sm:p-7 space-y-5">
        {editing?.source === 'dream' && <div className="flex flex-wrap gap-2 items-center"><Badge variant="sage">{t('From Dream Journal')}</Badge>{editing.dreamName && <span className="text-xs text-[var(--fg-muted)]">{displayText(editing, 'dreamName')}</span>}</div>}
        <Field id="notebook-journal-title" label={t('Title (optional)')}><Input id="notebook-journal-title" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('Give this moment a name')} disabled={busy} maxLength={200} /></Field>
        <Field id="notebook-journal-content" label={t('Your writing')} error={validation && !content.trim() ? t('Write a few words before saving.') : undefined} required>
          <Textarea id="notebook-journal-content" value={content} onChange={e => { setContent(e.target.value); setValidation(false); }} placeholder={t('What happened, what did you feel, and what do you want to remember?')} rows={13} className="!text-base sm:!text-lg !leading-[1.85] !min-h-[320px]" disabled={busy} hasError={validation && !content.trim()} aria-invalid={validation && !content.trim()} />
        </Field>
        <div className="sm:max-w-xs"><Field id="notebook-journal-mood" label={t('Mood (optional)')}><Select id="notebook-journal-mood" value={mood} onChange={e => setMood(e.target.value)} disabled={busy} options={[{ value: '', label: t('Choose a mood') }, ...(editing?.source === 'dream' ? LEGACY_MOODS : MOODS).map(([value, label]) => ({ value, label: t(label) }))]} /></Field></div>
        {editing?.photoDataUrl && <div><button type="button" onClick={() => setPhotoOpen(true)} className="block max-w-full rounded-sm overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" aria-label={t('View journal photo')}><img src={editing.photoDataUrl} alt={t('Journal photo')} className="max-h-48 max-w-full object-contain" /></button><p className="text-xs text-[var(--fg-muted)] mt-2">{t('Your original photo and dream link stay with this entry.')}</p></div>}
        <ActionNotice notice={notice} />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
          <div className="flex flex-wrap gap-2"><Button type="submit" icon={Edit3} isLoading={busy}>{editing ? t('Save changes') : t('Save entry')}</Button>{editing && <Button type="button" variant="ghost" disabled={busy} onClick={() => { if (canReplace()) { reset(); setNotice(null); } }}>{t('Cancel edit')}</Button>}</div>
          {editing ? <button type="button" className={`${quietButton} !text-[var(--danger)] inline-flex items-center gap-1.5`} onClick={remove} disabled={busy}><Trash2 className="w-3.5 h-3.5" />{t('Delete entry')}</button> : <span className="text-[11px] text-[var(--fg-muted)]">{dirty ? t('Unsaved draft') : t('Just for you')}</span>}
        </div>
      </form>
    </Card>

    <aside className="min-w-0 space-y-4" aria-label={t('Journal archive')}>
      <div className="flex justify-between items-center"><h2 className="font-display text-2xl">{t('Your pages')}</h2><Button type="button" variant="ghost" size="sm" icon={CalendarDays} aria-expanded={showCalendar} aria-controls="notebook-calendar" onClick={() => setShowCalendar(!showCalendar)}>{t('Calendar')}</Button></div>
      <Field id="notebook-journal-search" label={t('Search entries')}><div className="relative"><Search className="absolute left-3 top-3 w-4 h-4 text-[var(--fg-muted)]" aria-hidden="true" /><Input id="notebook-journal-search" type="search" className="pl-9" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('Search your words')} /></div></Field>
      {showCalendar && <div id="notebook-calendar"><NotebookCalendar today={today} selected={selectedDate} dates={dates} onSelect={setSelectedDate} /></div>}
      {selectedDate && <div className="flex gap-2 justify-between items-center text-xs"><span>{dateLabel(selectedDate)}</span><button type="button" className={quietButton} onClick={() => setSelectedDate('')}>{t('All dates')}</button></div>}
      <p role="status" className={smallLabel}>{t('{n} entries', { n: entries.length })}</p>
      {entries.length === 0 ? <div className="py-8 px-4 border-y border-[var(--border)] text-center"><BookOpen className="w-6 h-6 mx-auto mb-3 text-[var(--fg-muted)]" /><p className="text-sm font-medium">{query || selectedDate ? t('No pages match this search.') : t('Your story starts here.')}</p><p className="text-xs text-[var(--fg-muted)] mt-2 leading-relaxed">{query || selectedDate ? t('Try another word or choose all dates.') : t('Save your first entry; it will appear here.')}</p>{(query || selectedDate) && <button type="button" className={`${quietButton} mt-4`} onClick={() => { setQuery(''); setSelectedDate(''); }}>{t('Clear filters')}</button>}</div> : <div className="divide-y divide-[var(--border)] border-y border-[var(--border)] max-h-[650px] overflow-y-auto">{entries.map(entry => <button type="button" key={entry.viewId} disabled={busy} aria-current={editing?.viewId === entry.viewId ? 'true' : undefined} onClick={() => openEntry(entry)} className={`w-full text-left py-4 px-3 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset disabled:opacity-50 ${editing?.viewId === entry.viewId ? 'bg-[var(--bg-muted)]' : 'hover:bg-[var(--bg-muted)]/60'}`}>
        <span className="flex justify-between gap-2 text-[10px] text-[var(--fg-muted)] mb-2"><span>{dateLabel(entry.dateKey, { month: 'short', day: 'numeric', year: 'numeric' })}</span>{entry.source === 'dream' && <span>{t('Dream Journal')}</span>}</span>
        <span className="font-display text-xl leading-tight block break-words">{displayText(entry, 'title') || t('Untitled entry')}</span>
        <span className="text-xs text-[var(--fg-muted)] leading-relaxed line-clamp-2 block mt-1 break-words">{displayText(entry, 'content')}</span>
        <span className="flex flex-wrap items-center gap-2 mt-2">{entry.photoDataUrl && <img src={entry.photoDataUrl} alt="" className="w-10 h-10 object-cover rounded-sm" loading="lazy" />}{entry.mood && <span className="text-[10px] text-[var(--fg-muted)]">{t(moodLabel(entry.mood))}</span>}</span>
      </button>)}</div>}
    </aside>
    <dialog ref={photoDialog} aria-label={t('Journal photo')} onClose={() => setPhotoOpen(false)} onClick={e => { if (e.target === e.currentTarget) setPhotoOpen(false); }} className="m-auto max-w-[95vw] max-h-[95vh] p-4 sm:p-6 bg-[var(--bg-elevated)] text-[var(--fg)] border border-[var(--border)] rounded-[var(--radius-md)] backdrop:bg-black/85">
      <div className="flex justify-end mb-3"><Button autoFocus type="button" aria-label={t('Close photo')} variant="ghost" size="sm" onClick={() => setPhotoOpen(false)}><X className="w-4 h-4" /></Button></div>
      {editing?.photoDataUrl && <img src={editing.photoDataUrl} alt={t('Journal photo')} className="max-w-full max-h-[78vh] object-contain" />}
    </dialog>
  </div>;
};
