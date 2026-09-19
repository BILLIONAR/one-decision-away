import React, { useState } from 'react';
import { ArrowUpRight, Trash2, type LucideIcon } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { N_, useT } from '../../i18n';
import type { NotebookEntryKind } from '../../types/models';
import { getNotebookEntries, type NotebookDisplayEntry } from '../../services/notebook';
import { ActionNotice, dateLabel, quietButton, smallLabel, cardCls, NButton, NField, NInput, NSelect, NTextarea, useNotebookAction, useSessionDraft, useDraftGuard } from './shared';

const STARTERS = [N_('Today I woke up in…'), N_('I feel…'), N_('I am grateful that…')];
const SEEDED_PROFILE_TEXT = new Set(['The Finisher', 'I am someone who finishes important work, protects my attention, and acts before I feel ready.', 'First 90 minutes dedicated to high leverage work', 'No digital noise at meals', 'Daily physical movement']);

export const WrittenPractice: React.FC<{
  kind: Extract<NotebookEntryKind, 'scripting' | 'future_letter'>;
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  prompts: { id: string; label: string; question: string }[];
}> = ({ kind, title: heading, description, prompts }) => {
  const t = useT();
  const { data, saveNotebookEntry, deleteNotebookEntry } = useApp();
  const { busy, notice, run, setNotice } = useNotebookAction();
  const [title, setTitle] = useSessionDraft(`${kind}:title`, '');
  const [content, setContent] = useSessionDraft(`${kind}:content`, '');
  const [promptId, setPromptId] = useSessionDraft(`${kind}:prompt`, prompts[0]?.id || '');
  const [editingId, setEditingId] = useSessionDraft<string | null>(`${kind}:editing`, null);
  const editing = data && editingId ? getNotebookEntries(data, { kinds: [kind] }).find(entry => entry.id === editingId) || null : null;
  const setEditing = (entry: NotebookDisplayEntry | null) => setEditingId(entry?.id || null);
  const [baseline, setBaseline] = useSessionDraft(`${kind}:baseline`, '');
  const [invalid, setInvalid] = useState(false);
  const entries = data ? getNotebookEntries(data, { kinds: [kind] }) : [];
  const prompt = prompts.find(p => p.id === promptId) || prompts[0];
  const profileText = (value: string) => SEEDED_PROFILE_TEXT.has(value) ? t(value) : value;
  const append = (words: string) => { setContent(previous => `${previous}${previous.trim() ? '\n\n' : ''}${words}`); setInvalid(false); document.getElementById(`${kind}-content`)?.focus(); };
  const dirty = editing ? `${title}\u0000${content}` !== baseline : Boolean(title || content);
  useDraftGuard(dirty);
  const reset = () => { setTitle(''); setContent(''); setEditing(null); setBaseline(''); setInvalid(false); };
  const load = (entry: NotebookDisplayEntry) => {
    if (busy || (dirty && !window.confirm(t('Discard your unsaved changes?')))) return;
    setEditing(entry); setTitle(entry.title); setContent(entry.content); setPromptId(entry.promptId || prompts[0]?.id || ''); setBaseline(`${entry.title}\u0000${entry.content}`); setInvalid(false); setNotice(null);
    document.getElementById(`${kind}-title`)?.scrollIntoView({ behavior: 'auto', block: 'center' });
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && !editing) { setNotice({ error: true, message: t('This notebook record no longer exists.') }); return; }
    if (!content.trim()) { setInvalid(true); document.getElementById(`${kind}-content`)?.focus(); return; }
    const result = await run(() => saveNotebookEntry({ id: editing?.id, kind, title, content, promptId }));
    if (result !== undefined) reset();
  };
  const remove = async (id: string) => {
    if (!window.confirm(t('Delete this entry? This cannot be undone.'))) return;
    const result = await run(async () => { await deleteNotebookEntry(id); return true; }, 'Entry deleted.');
    if (result && editing?.id === id) reset();
  };
  const chip = 'h-9 px-3 rounded-full bg-[var(--bg)] text-sm text-[var(--fg)] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40';
  return <div className={cardCls}>
    <div className="p-5"><h2 className="text-lg font-semibold tracking-tight">{t(heading)}</h2><p className="text-sm text-[var(--fg-muted)] leading-relaxed mt-1">{t(description)}</p></div>
    <form onSubmit={save} className="px-5 pb-5 space-y-4">
      <NField id={`${kind}-prompt`} label={t('Starting point')}><NSelect id={`${kind}-prompt`} value={promptId} disabled={busy} onChange={e => setPromptId(e.target.value)} options={prompts.map(p => ({ value: p.id, label: t(p.label) }))} /></NField>
      {prompt && <p className="text-[15px] leading-relaxed text-[var(--fg)]">{t(prompt.question)}</p>}
      {kind === 'scripting' && <fieldset disabled={busy}><legend className={`${smallLabel} mb-2`}>{t('Start a sentence')}</legend><div className="flex flex-wrap gap-2">{STARTERS.map(starter => <button type="button" key={starter} onClick={() => append(t(starter).replace(/…$/, ' '))} className={chip}>{t(starter)}</button>)}</div></fieldset>}
      {data?.futureSelf && <details><summary className="min-h-[44px] flex items-center text-sm text-[var(--fg-muted)] cursor-pointer focus-visible:outline focus-visible:outline-2">{t('Prompts from my future self')}</summary><div className="mt-2 space-y-3"><p className="text-sm font-medium">{profileText(data.futureSelf.title)}</p>{data.futureSelf.identityStatement && <div><p className="text-sm text-[var(--fg-muted)] leading-relaxed">{profileText(data.futureSelf.identityStatement)}</p><button type="button" disabled={busy} className={quietButton} onClick={() => append(profileText(data.futureSelf.identityStatement))}>{t('Use my identity statement')}</button></div>}{data.futureSelf.dailyStandards.slice(0, 3).map((standard, index) => <button type="button" key={index} disabled={busy} onClick={() => append(t('Today I lived this standard: {standard}', { standard: profileText(standard) }))} className="block w-full text-left border-t border-[var(--border)] pt-3 min-h-[44px] text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer focus-visible:outline focus-visible:outline-2">{profileText(standard)}</button>)}</div></details>}
      {editing && <p className={smallLabel}>{t('Editing')} · {dateLabel(editing.dateKey)}</p>}
      <NField id={`${kind}-title`} label={t('Title')}><NInput id={`${kind}-title`} value={title} onChange={e => setTitle(e.target.value)} disabled={busy} maxLength={200} placeholder={t('Optional')} /></NField>
      <NField id={`${kind}-content`} label={t('Your writing')} required error={invalid ? t('Write a few words before saving.') : undefined}><NTextarea id={`${kind}-content`} value={content} onChange={e => { setContent(e.target.value); setInvalid(false); }} rows={7} className="!text-[15px] !leading-relaxed" disabled={busy} hasError={invalid} aria-invalid={invalid} placeholder={kind === 'scripting' ? t('Write in the present tense. Make the ordinary details feel real.') : t('Dear me, here is what I want you to remember…')} /></NField>
      <ActionNotice notice={notice} />
      <div className="flex flex-wrap items-center gap-3"><NButton type="submit" isLoading={busy}>{editing ? t('Save') : t('Save page')}</NButton>{editing && <button type="button" className={quietButton} disabled={busy} onClick={() => { if (!dirty || window.confirm(t('Discard your unsaved changes?'))) reset(); }}>{t('Cancel')}</button>}</div>
    </form>
    <details className="border-t border-[var(--border)]"><summary className="px-5 py-4 min-h-[52px] flex items-center cursor-pointer text-sm font-medium text-[var(--fg-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset">{t('Saved pages ({n})', { n: entries.length })}</summary><div className="px-5 pb-5 space-y-4 max-h-[540px] overflow-y-auto">{entries.length === 0 ? <p className="text-sm text-[var(--fg-muted)]">{t('Your saved writing will appear here.')}</p> : entries.map(entry => <article key={entry.viewId} className="border-t border-[var(--border)] pt-4"><p className={smallLabel}>{dateLabel(entry.dateKey)}</p><h3 className="text-[15px] font-semibold mt-1 break-words">{entry.title || t('Untitled')}</h3><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-[var(--fg-muted)] mt-1">{entry.content}</p><div className="flex gap-4"><button type="button" onClick={() => load(entry)} disabled={busy} className={`${quietButton} gap-1`}><ArrowUpRight className="w-4 h-4" strokeWidth={1.8} />{t('Edit')}</button><button type="button" onClick={() => remove(entry.id)} disabled={busy} className={`${quietButton} gap-1`}><Trash2 className="w-4 h-4" strokeWidth={1.8} />{t('Delete')}</button></div></article>)}</div></details>
  </div>;
};
