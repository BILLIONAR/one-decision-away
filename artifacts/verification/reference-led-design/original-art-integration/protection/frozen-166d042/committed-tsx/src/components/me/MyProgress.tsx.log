import React, { useMemo } from 'react';
import { Sprout, Leaf, TreeDeciduous, Link2, PenLine, BookOpenText, GraduationCap, Gem, type LucideIcon } from 'lucide-react';
import type { UserData } from '../../types/models';
import { useT, useLocale, getSpeechLang } from '../../i18n';
import { keptDecisions, decisionChain, daysBetween, localDayKey } from '../../services/momentum';
import { getNotebookStats } from '../../services/notebook';
import { readCourseProgress } from '../../services/courseProgress';

const WEEKS = 5;

/** Longest run of consecutive kept days, ever (the live chain may have been longer once). */
function longestKeptRun(dayKeys: string[]): number {
  const days = [...new Set(dayKeys)].sort();
  let best = 0;
  let run = 0;
  let last = '';
  for (const day of days) {
    run = last && daysBetween(last, day) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    last = day;
  }
  return best;
}

const weekdayFormatter = (style: 'narrow' | 'long') => {
  try {
    return new Intl.DateTimeFormat(getSpeechLang(), { weekday: style });
  } catch {
    return new Intl.DateTimeFormat('en', { weekday: style });
  }
};

/** Monday-first weekday names; 2024-01-01 was a Monday. */
function weekdayNames(style: 'narrow' | 'long'): string[] {
  const f = weekdayFormatter(style);
  return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 0, 1 + i)));
}

/* ---------- Your month ---------- */

export const YourMonth: React.FC<{ data: UserData }> = ({ data }) => {
  const t = useT();
  useLocale();

  const view = useMemo(() => {
    const now = new Date();
    const kept = new Set(keptDecisions(data.missions || []).map((e) => e.dayKey));
    const written = new Set(getNotebookStats(data, now).activityDateKeys);
    const todayKey = localDayKey(now);
    const mondayOffset = (now.getDay() + 6) % 7;
    const cells = Array.from({ length: WEEKS * 7 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset - (WEEKS - 1) * 7 + i);
      const key = localDayKey(d);
      return { key, date: d.getDate(), kept: kept.has(key), written: written.has(key), future: key > todayKey, today: key === todayKey };
    });
    return {
      cells,
      keptDays: cells.filter((c) => c.kept).length,
      writtenDays: cells.filter((c) => c.written).length,
    };
  }, [data]);

  const initials = weekdayNames('narrow');
  const summary = t('Last 5 weeks: {kept} days with a kept decision, {written} days of writing.', {
    kept: view.keptDays,
    written: view.writtenDays,
  });

  const cellClass = (c: (typeof view.cells)[number]) => {
    if (c.future) return 'border border-dashed border-[var(--border)] text-transparent';
    if (c.kept) return 'bg-[var(--accent)] text-[var(--bg)]';
    if (c.written) return 'oda-tint-sand';
    return 'bg-[var(--bg-muted)] text-[var(--fg-subtle)]';
  };

  return (
    <section className="space-y-3" aria-labelledby="me-month-title">
      <h2 id="me-month-title" className="oda-kicker text-[var(--fg-muted)] px-1">{t('Your month')}</h2>
      <div className="oda-surface p-4 sm:p-5 space-y-3">
        <div role="img" aria-label={summary} className="space-y-1.5">
          <div className="grid grid-cols-7 gap-1.5" aria-hidden="true">
            {initials.map((d, i) => (
              <div key={i} className="text-center text-[11px] font-medium text-[var(--fg-subtle)] uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5" aria-hidden="true">
            {view.cells.map((c) => (
              <div
                key={c.key}
                className={`relative aspect-square rounded-[10px] flex items-center justify-center text-[11px] oda-numeral ${cellClass(c)} ${c.today ? 'ring-2 ring-inset ring-[var(--fg-muted)]' : ''}`}
              >
                {c.date}
                {!c.future && c.written && (
                  <span
                    className={`absolute bottom-[3px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${c.kept ? 'bg-[var(--bg)]' : 'bg-[var(--ink-sand)]'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-[var(--fg-muted)]">
          <LegendItem swatch="bg-[var(--accent)]" label={t('Kept decision')} />
          <LegendItem swatch="oda-tint-sand" dot="bg-[var(--ink-sand)]" label={t('Wrote in journal')} />
          <LegendItem swatch="bg-[var(--accent)]" dot="bg-[var(--bg)]" label={t('Both')} />
          <LegendItem swatch="bg-[var(--bg-muted)]" label={t('Quiet day')} />
        </ul>
      </div>
    </section>
  );
};

const LegendItem: React.FC<{ swatch: string; dot?: string; label: string }> = ({ swatch, dot, label }) => (
  <li className="flex items-center gap-1.5">
    <span className={`relative inline-block w-3.5 h-3.5 rounded-[5px] ${swatch}`} aria-hidden="true">
      {dot && <span className={`absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full ${dot}`} />}
    </span>
    {label}
  </li>
);

/* ---------- Insight ---------- */

export const InsightLine: React.FC<{ data: UserData }> = ({ data }) => {
  const t = useT();
  useLocale();

  const text = useMemo(() => {
    const kept = keptDecisions(data.missions || []);
    if (kept.length < 5) {
      return t('Keep 5 decisions and a pattern about your best day or time will appear here. {n} so far.', { n: kept.length });
    }
    // Weekday (Mon-first index) and part of the day of each kept decision.
    const byDay = Array(7).fill(0) as number[];
    const byPart = { morning: 0, afternoon: 0, evening: 0 };
    for (const e of kept) {
      const d = new Date(e.completedAt);
      byDay[(d.getDay() + 6) % 7]++;
      const h = d.getHours();
      byPart[h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening']++;
    }
    const topDay = Math.max(...byDay);
    if (topDay >= 2 && byDay.filter((n) => n === topDay).length === 1) {
      const day = weekdayNames('long')[byDay.indexOf(topDay)];
      return t('{day} is your strongest day: {n} of your {total} kept decisions.', { day, n: topDay, total: kept.length });
    }
    const parts = Object.entries(byPart).sort((a, b) => b[1] - a[1]);
    if (parts[0][1] > parts[1][1]) {
      const [part, n] = parts[0];
      if (part === 'morning') return t('You keep most of your decisions in the morning: {n} of {total}.', { n, total: kept.length });
      if (part === 'afternoon') return t('You keep most of your decisions in the afternoon: {n} of {total}.', { n, total: kept.length });
      return t('You keep most of your decisions in the evening: {n} of {total}.', { n, total: kept.length });
    }
    return t('You keep your word across the whole week, at all hours. No single pattern stands out.');
  }, [data, t]);

  return (
    <div className="oda-surface px-4 py-3.5 flex items-start gap-3">
      <span className="oda-tile-icon oda-tint-blue shrink-0" aria-hidden="true">
        <Sprout className="w-[18px] h-[18px]" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <div className="oda-kicker text-[var(--fg-muted)]">{t('Insight')}</div>
        <p className="text-[14px] leading-snug text-[var(--fg)] mt-0.5">{text}</p>
      </div>
    </div>
  );
};

/* ---------- Milestones ---------- */

type Badge = { key: string; icon: LucideIcon; label: string; how: string; earned: boolean };

export const Milestones: React.FC<{ data: UserData }> = ({ data }) => {
  const t = useT();

  const badges = useMemo<Badge[]>(() => {
    const kept = keptDecisions(data.missions || []);
    const run = Math.max(longestKeptRun(kept.map((e) => e.dayKey)), decisionChain(data.missions || []).days);
    const writingDays = getNotebookStats(data).totalWritingDays;
    const lessonDone = Object.values(readCourseProgress().lessons).some((l) => l.completed);
    const bought = (data.purchases || []).length > 0;
    return [
      { key: 'first', icon: Sprout, label: t('First kept decision'), how: t('Keep one decision today.'), earned: kept.length >= 1 },
      { key: 'seven', icon: Leaf, label: t('7 kept decisions'), how: t('Keep seven in total.'), earned: kept.length >= 7 },
      { key: 'thirty', icon: TreeDeciduous, label: t('30 kept decisions'), how: t('Keep thirty in total.'), earned: kept.length >= 30 },
      { key: 'chain', icon: Link2, label: t('3-day chain'), how: t('Keep a decision three days in a row.'), earned: run >= 3 },
      { key: 'journal', icon: PenLine, label: t('First journal entry'), how: t('Write a few lines in your notebook.'), earned: writingDays >= 1 },
      { key: 'ten', icon: BookOpenText, label: t('10 days written'), how: t('Write on ten different days.'), earned: writingDays >= 10 },
      { key: 'lesson', icon: GraduationCap, label: t('First lesson done'), how: t('Finish a course lesson.'), earned: lessonDone },
      { key: 'dream', icon: Gem, label: t('First dream bought'), how: t('Spend Dream Dollars on a dream.'), earned: bought },
    ];
  }, [data, t]);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <section className="space-y-3" aria-labelledby="me-milestones-title">
      <div className="flex items-baseline justify-between px-1">
        <h2 id="me-milestones-title" className="oda-kicker text-[var(--fg-muted)]">{t('Milestones')}</h2>
        <span className="text-[12.5px] text-[var(--fg-muted)]">{t('{n} of {total}', { n: earnedCount, total: badges.length })}</span>
      </div>
      <ul className="grid grid-cols-2 min-[560px]:grid-cols-4 gap-2">
        {badges.map((b) => (
          <li
            key={b.key}
            className={`min-w-0 rounded-[16px] px-3 py-3 min-h-[92px] flex flex-col gap-1.5 ${
              b.earned ? 'oda-tint-sage' : 'border border-[var(--border-strong)] text-[var(--fg-muted)]'
            }`}
          >
            <b.icon className={`w-[20px] h-[20px] ${b.earned ? '' : 'opacity-60'}`} strokeWidth={1.8} aria-hidden="true" />
            <span className={`text-[13.5px] leading-tight ${b.earned ? 'font-semibold' : 'font-medium text-[var(--fg)]'}`}>{b.label}</span>
            {b.earned ? (
              <span className="sr-only">{t('Earned')}</span>
            ) : (
              <span className="text-[12px] leading-snug">{b.how}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};
