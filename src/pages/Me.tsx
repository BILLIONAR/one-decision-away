import { FEEDBACK_EMAIL } from '../data/contact';
import React, { useMemo } from 'react';
import { useApp } from '../store/useApp';
import { useT, useLocale } from '../i18n';
import { companionCopy } from '../i18n/companion';
import { calculateCurrentStreak, computeLifetimeEarned } from '../services/economy';
import { evidenceSummary } from '../services/momentum';
import {
  ChevronRight,
  UserRound,
  Wallet,
  Landmark,
  PieChart,
  Target,
  CalendarRange,
  TrendingUp,
  Gauge,
  Bell,
  SunMoon,
  Sparkles,
  AudioLines,
  LucideIcon,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';

interface MenuRow {
  icon: LucideIcon;
  label: string;
  hint?: string;
  route: string;
}

const APP_VERSION = '2.0';

export const Me: React.FC = () => {
  const { data, setActiveRoute } = useApp();
  const t = useT();
  const [locale] = useLocale();
  const c = companionCopy(locale);

  const stats = useMemo(() => {
    if (!data) return null;

    const streak = calculateCurrentStreak((data.completions || []).map((c) => c.completedAt));
    const earned = computeLifetimeEarned(data.transactions || []);
    const latestScore =
      [...(data.lifeScores || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.totalScore ??
      null;

    const firstOpened = new Date(data.profile.firstOpenedAt || data.profile.createdAt);
    const dayNumber = Math.max(
      1,
      Math.floor((Date.now() - firstOpened.getTime()) / 86400000) + 1
    );

    // Two futures for this month: every completed mission is a vote for the
    // life you're building; every logged drift signal is a vote for the default.
    const monthKey = new Date().toISOString().slice(0, 7);
    const building = (data.completions || []).filter((c) => c.completedAt.slice(0, 7) === monthKey).length;
    const allowing = (data.twoFutures?.defaultFuture?.driftLog || []).filter(
      (d) => (d.dateKey || d.createdAt).slice(0, 7) === monthKey
    ).length;
    const total = building + allowing;
    const buildingPct = total > 0 ? Math.round((building / total) * 100) : 0;

    return { streak, earned, latestScore, dayNumber, building, allowing, total, buildingPct };
  }, [data]);

  if (!data || !stats) return null;

  const displayName = data.profile.displayName?.trim() || t('You');
  const initial = displayName.charAt(0).toUpperCase();
  const role = data.futureSelf?.title?.trim();

  // Few, clear choices first; every other tool still one tap away under "More tools".
  const groups: { title: string; rows: MenuRow[] }[] = [
    {
      title: t('Your practice'),
      rows: [
        { icon: CheckCircle2, label: t('Your evidence'), hint: t('Every decision you kept'), route: '/app/evidence' },
        { icon: UserRound, label: c.coach, hint: c.talk, route: '/app/coach' },
        { icon: GraduationCap, label: c.courses, hint: c.courseHint, route: '/app/courses' },
        { icon: AudioLines, label: t('Focus & meditations'), hint: t('Guided sessions and sound waves'), route: '/app/focus' },
      ],
    },
    {
      title: t('App'),
      rows: [
        { icon: Bell, label: t('Settings'), hint: t('Reminders, language, backup, appearance'), route: '/app/settings' },
        { icon: Sparkles, label: t('Pro plan'), route: '/app/upgrade' },
      ],
    },
  ];
  const moreTools: MenuRow[] = [
    { icon: UserRound, label: t('Future self'), hint: t('Roles, standards, letters'), route: '/app/future-self' },
    { icon: SunMoon, label: t('Two futures'), route: '/app/two-futures' },
    { icon: Target, label: t('Missions'), route: '/app/missions' },
    { icon: CalendarRange, label: t('Seasons'), route: '/app/seasons' },
    { icon: TrendingUp, label: t('Progress'), route: '/app/progress' },
    { icon: Gauge, label: t('Life score'), route: '/app/score' },
    { icon: Wallet, label: t('Wallet & savings'), hint: t('D$ ledger and real-money bridge'), route: '/app/bank' },
    { icon: Landmark, label: t('Reality bridge'), route: '/app/bridge' },
    { icon: PieChart, label: t('Budget'), route: '/app/budget' },
  ];
  const evidence = evidenceSummary(data.missions);

  const feedbackHref = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('One Decision Away feedback')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-full bg-[var(--fg)] text-[var(--bg)] flex items-center justify-center text-[22px] font-semibold shrink-0"
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <h1 className="text-[24px] font-semibold tracking-tight text-[var(--fg)] leading-tight truncate">
            {displayName}
          </h1>
          <p className="text-[14px] text-[var(--fg-muted)] mt-0.5 truncate">
            {role
              ? t('Day {n} · {role}', { n: stats.dayNumber, role: t(role) })
              : t('Day {n}', { n: stats.dayNumber })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <button type="button" onClick={() => setActiveRoute('/app/evidence')} className="w-full grid grid-cols-3 gap-3 text-left">
        <StatTile value={String(evidence.total)} label={t('Kept decisions')} accent />
        <StatTile value={`${evidence.last7}/7`} label={t('This week')} />
        <StatTile value={stats.earned >= 10000 ? `${(stats.earned / 1000).toFixed(1)}k` : stats.earned.toLocaleString()} label={t('D$ earned')} />
      </button>

      {/* Menu groups */}
      {groups.map((group) => (
        <section key={group.title} className="space-y-2">
          <h2 className="text-[15px] font-semibold text-[var(--fg)] px-1">{group.title}</h2>
          <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] overflow-hidden">
            {group.rows.map((row, idx) => (
              <button
                key={`${row.route}-${row.label}`}
                type="button"
                onClick={() => setActiveRoute(row.route)}
                className={`w-full h-14 px-4 flex items-center gap-3 text-left cursor-pointer transition-colors hover:bg-[var(--bg-inset)] ${
                  idx > 0 ? 'border-t border-[var(--border)]' : ''
                }`}
              >
                <row.icon className="w-5 h-5 text-[var(--accent)] shrink-0" strokeWidth={1.8} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] text-[var(--fg)] truncate">{row.label}</span>
                  {row.hint && (
                    <span className="block text-[12px] text-[var(--fg-subtle)] truncate">{row.hint}</span>
                  )}
                </span>
                <ChevronRight className="w-5 h-5 text-[var(--fg-subtle)] shrink-0" strokeWidth={1.8} />
              </button>
            ))}
          </div>
        </section>
      ))}

      <details className="oda-more-tools group bg-[var(--bg-muted)] rounded-[var(--radius-md)] overflow-hidden">
        <summary className="h-14 px-4 flex items-center gap-3 cursor-pointer list-none text-[15px] font-semibold text-[var(--fg)]">
          <span className="flex-1">{t('More tools')}</span>
          <span className="text-[12px] font-normal text-[var(--fg-subtle)]">{moreTools.length}</span>
          <ChevronRight className="w-5 h-5 text-[var(--fg-subtle)] shrink-0 transition-transform group-open:rotate-90" strokeWidth={1.8} />
        </summary>
        {moreTools.map((row) => (
          <button
            key={row.route}
            type="button"
            onClick={() => setActiveRoute(row.route)}
            className="w-full h-14 px-4 flex items-center gap-3 text-left cursor-pointer transition-colors hover:bg-[var(--bg-inset)] border-t border-[var(--border)]"
          >
            <row.icon className="w-5 h-5 text-[var(--accent)] shrink-0" strokeWidth={1.8} />
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] text-[var(--fg)] truncate">{row.label}</span>
              {row.hint && <span className="block text-[12px] text-[var(--fg-subtle)] truncate">{row.hint}</span>}
            </span>
            <ChevronRight className="w-5 h-5 text-[var(--fg-subtle)] shrink-0" strokeWidth={1.8} />
          </button>
        ))}
      </details>

      {/* Footer */}
      <div className="pt-2 pb-4 text-center space-y-1">
        <p className="text-[12px] text-[var(--fg-subtle)]">
          {t('One Decision Away · v{version}', { version: APP_VERSION })}
        </p>
        <a
          href={feedbackHref}
          className="inline-flex items-center justify-center min-h-[44px] px-3 text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg)] underline underline-offset-4"
        >
          {t('Send feedback')}
        </a>
      </div>
    </div>
  );
};

const StatTile: React.FC<{ value: string; label: string; accent?: boolean }> = ({ value, label, accent }) => (
  <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-4 min-w-0">
    <div
      className={`text-[20px] font-semibold tracking-tight leading-tight truncate ${
        accent ? 'text-[var(--accent)]' : 'text-[var(--fg)]'
      }`}
    >
      {value}
    </div>
    <div className="text-[12px] text-[var(--fg-muted)] mt-1 leading-tight">{label}</div>
  </div>
);
