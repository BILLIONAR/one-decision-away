import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui';
import { useT, getSpeechLang } from '../../i18n';
import { dateLabel, localDate } from './shared';

export const NotebookCalendar: React.FC<{
  today: string;
  selected: string;
  dates: Set<string>;
  onSelect: (date: string) => void;
}> = ({ today, selected, dates, onSelect }) => {
  const t = useT();
  const [month, setMonth] = useState(() => { const d = localDate(selected || today); return new Date(d.getFullYear(), d.getMonth(), 1, 12); });
  const start = (month.getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const total = Math.ceil((start + count) / 7) * 7;
  const keyFor = (day: number) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const monthLabel = new Intl.DateTimeFormat(getSpeechLang(), { month: 'long', year: 'numeric' }).format(month);
  return <div className="border border-[var(--border)] rounded-[var(--radius-sm)] p-3 space-y-2">
    <div className="flex items-center justify-between gap-2">
      <Button type="button" size="sm" variant="ghost" aria-label={t('Previous month')} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1, 12))}><ChevronLeft className="w-4 h-4" /></Button>
      <span className="text-sm font-semibold capitalize" aria-live="polite">{monthLabel}</span>
      <Button type="button" size="sm" variant="ghost" aria-label={t('Next month')} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1, 12))}><ChevronRight className="w-4 h-4" /></Button>
    </div>
    <table className="w-full table-fixed text-center border-separate border-spacing-1">
      <caption className="sr-only">{t('Writing calendar')} — {monthLabel}</caption>
      <thead><tr>{Array.from({ length: 7 }, (_, i) => <th key={i} scope="col" className="text-[10px] font-medium text-[var(--fg-muted)] pb-1">{new Intl.DateTimeFormat(getSpeechLang(), { weekday: 'narrow' }).format(new Date(2024, 0, 1 + i))}</th>)}</tr></thead>
      <tbody>{Array.from({ length: total / 7 }, (_, week) => <tr key={week}>{Array.from({ length: 7 }, (_, weekday) => {
        const day = week * 7 + weekday - start + 1;
        if (day < 1 || day > count) return <td key={weekday} />;
        const key = keyFor(day);
        return <td key={weekday}><button type="button" onClick={() => onSelect(selected === key ? '' : key)} aria-pressed={selected === key} aria-current={key === today ? 'date' : undefined} aria-label={`${dateLabel(key)}${dates.has(key) ? ` — ${t('Has entries')}` : ''}`} className={`relative w-full aspect-square min-h-8 rounded-sm text-xs cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 ${selected === key ? 'bg-[var(--fg)] text-[var(--bg)]' : key === today ? 'bg-[var(--bg-muted)] font-bold text-[var(--fg)]' : 'text-[var(--fg-muted)] hover:bg-[var(--bg-muted)]'}`}>
          {day}{dates.has(key) && <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${selected === key ? 'bg-[var(--bg)]' : 'bg-[var(--color-coral)]'}`} aria-hidden="true" />}
        </button></td>;
      })}</tr>)}</tbody>
    </table>
    <p className="text-[11px] text-[var(--fg-muted)] flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[var(--color-coral)]" aria-hidden="true" />{t('Days with journal entries')}</p>
  </div>;
};
