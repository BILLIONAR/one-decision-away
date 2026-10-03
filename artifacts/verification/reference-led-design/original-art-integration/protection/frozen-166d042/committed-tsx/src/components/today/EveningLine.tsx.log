import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { useT } from '../../i18n';
import { getNotebookDateKey, getNotebookEntries } from '../../services/notebook';

const KEY = 'oda_evening_line_';
const readDone = (day: string) => { try { return localStorage.getItem(KEY + day) === '1'; } catch { return false; } };
const markDone = (day: string) => { try { localStorage.setItem(KEY + day, '1'); } catch { /* per-device only */ } };

/**
 * After 18:00, once today's decision exists: one line about the day, appended
 * to today's journal entry (never replacing what is already written there).
 */
export const EveningLine: React.FC<{ hasDecision: boolean }> = ({ hasDecision }) => {
  const t = useT();
  const { data, saveNotebookEntry } = useApp();
  const [hour, setHour] = useState(() => new Date().getHours());
  const today = getNotebookDateKey();
  const [done, setDone] = useState(() => readDone(today));
  const [line, setLine] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const timer = window.setInterval(() => setHour(new Date().getHours()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!data || !hasDecision || (hour < 18 && !notice)) return null;
  if (done && !notice) return null;

  if (notice) {
    return (
      <p role="status" className="oda-card rounded-[var(--radius-lg)] px-4 min-h-12 flex items-center gap-2 text-[14px] text-[var(--fg-muted)]">
        <Check size={16} strokeWidth={1.9} className="shrink-0 text-[var(--accent)]" aria-hidden="true" />{notice}
      </p>
    );
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = line.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(false);
    try {
      // Append to the newest journal entry of today when there is one.
      const existing = getNotebookEntries(data, { kinds: ['journal'], dateKey: today }).find((e) => e.source === 'notebook');
      const result = await saveNotebookEntry(existing
        ? { id: existing.id, kind: 'journal', title: existing.title, content: `${existing.content.trimEnd()}\n\n${text}`, mood: existing.mood as never, promptId: existing.promptId }
        : { kind: 'journal', title: t('One line about today'), content: text });
      markDone(today);
      setDone(true);
      setNotice(result?.rewardAmount > 0 ? t('Saved. Your first writing today earned D$ {amount}.', { amount: result.rewardAmount }) : t('Added to today’s page in your notebook.'));
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="oda-card rounded-[var(--radius-lg)] p-4 space-y-2.5" aria-labelledby="evening-line-title">
      <div>
        <h2 id="evening-line-title" className="oda-kicker text-[var(--brand-burgundy)]">{t('One line about today')}</h2>
        <p className="text-[13px] text-[var(--fg-muted)]">{t('Whatever stayed with you. It goes into your notebook.')}</p>
      </div>
      <label htmlFor="evening-line-input" className="sr-only">{t('One line about today')}</label>
      <div className="flex gap-2">
        <input
          id="evening-line-input"
          value={line}
          onChange={(e) => { setLine(e.target.value); setError(false); }}
          maxLength={280}
          disabled={busy}
          placeholder={t('Today I…')}
          className="min-w-0 flex-1 h-11 px-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] text-[15px] text-[var(--fg)] placeholder:text-[var(--fg-subtle)] focus:outline-none focus:border-[var(--fg)] disabled:opacity-60"
        />
        <button type="submit" disabled={!line.trim() || busy} className="h-11 px-4 shrink-0 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-[14px] font-semibold cursor-pointer disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          {t('Save')}
        </button>
      </div>
      {error && <p role="alert" className="text-[13px] text-[var(--danger)]">{t('Could not save this change. Your writing is still here; please try again.')}</p>}
    </form>
  );
};
