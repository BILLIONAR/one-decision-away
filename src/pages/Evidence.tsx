import React from 'react';
import { Check, Timer, Route } from 'lucide-react';
import { useApp } from '../store/useApp';
import { useT, formatDate } from '../i18n';
import { evidenceSummary, keptDecisions } from '../services/momentum';

/**
 * The evidence log: every kept One Decision is proof of the identity the
 * member is building ("I am someone who keeps promises to myself").
 */
export const Evidence: React.FC = () => {
  const t = useT();
  const { data, setActiveRoute } = useApp();
  if (!data) return null;
  const kept = keptDecisions(data.missions);
  const s = evidenceSummary(data.missions);

  const byMonth = new Map<string, typeof kept>();
  for (const entry of kept) {
    const month = formatDate(entry.completedAt, { month: 'long', year: 'numeric' });
    byMonth.set(month, [...(byMonth.get(month) ?? []), entry]);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="oda-kicker text-[var(--accent)]">{t('Evidence')}</p>
        <h1 className="oda-display text-[32px] sm:text-[40px] leading-tight tracking-tight text-[var(--fg)]">{t('Proof that you keep your word')}</h1>
        <p className="text-[15px] leading-relaxed text-[var(--fg-muted)] max-w-[56ch]">
          {kept.length === 1
            ? t('Once already, you did what you said you would. That is who you are becoming.')
            : kept.length
            ? t('{n} times you did what you said you would. That is who you are becoming.', { n: kept.length })
            : t('Every decision you keep will be written here. Motivation often follows action, and this list is how you’ll see it.')}
        </p>
      </header>

      <section className="grid grid-cols-3 gap-3" aria-label={t('Summary')}>
        {[
          { value: s.total, label: t('Kept decisions') },
          { value: s.days, label: t('Days with a kept decision') },
          { value: `${s.last7}/7`, label: t('This week') },
        ].map(item => (
          <div key={item.label} className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-4">
            <p className="text-[24px] font-semibold text-[var(--accent)] tabular-nums">{item.value}</p>
            <p className="text-[12px] leading-snug text-[var(--fg-muted)]">{item.label}</p>
          </div>
        ))}
      </section>

      <section aria-label={t('Last 7 days')} className="flex justify-between gap-2">
        {s.weekDays.map(d => (
          <div key={d.dayKey} className="flex flex-col items-center gap-1.5 flex-1">
            <span className={`w-9 h-9 rounded-full flex items-center justify-center ${d.kept ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border-strong)]'}`}>
              {d.kept && <Check size={16} strokeWidth={2.4} />}
            </span>
            <span className="text-[11px] text-[var(--fg-muted)]">{formatDate(`${d.dayKey}T12:00:00`, { weekday: 'short' })}</span>
          </div>
        ))}
      </section>

      {kept.length === 0 ? (
        <button type="button" onClick={() => setActiveRoute('/app')} className="w-full h-12 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg)] text-[15px] font-semibold">
          {t('Go to today’s decision')}
        </button>
      ) : (
        [...byMonth].map(([month, entries]) => (
          <section key={month} className="space-y-2">
            <h2 className="text-[13px] font-semibold text-[var(--fg-muted)]">{month}</h2>
            <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {entries.map(entry => (
                <li key={entry.id} className="py-3.5 flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center"><Check size={14} strokeWidth={2.4} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] text-[var(--fg)] break-words">{t(entry.title)}</p>
                    <p className="text-[12px] text-[var(--fg-muted)] flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                      <span>{formatDate(entry.completedAt, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      {entry.planned && <span className="inline-flex items-center gap-1"><Route size={12} />{t('with a plan')}</span>}
                      {entry.started && <span className="inline-flex items-center gap-1"><Timer size={12} />{t('started with 2 minutes')}</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
};
