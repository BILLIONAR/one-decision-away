import React, { useMemo } from 'react';
import { useApp } from '../store/useApp';
import { useT } from '../i18n';
import { calculateCurrentStreak, computeLifetimeEarned } from '../services/economy';
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
  Languages,
  CloudUpload,
  SunMoon,
  Sparkles,
  AudioLines,
  LucideIcon,
} from 'lucide-react';

interface MenuRow {
  icon: LucideIcon;
  label: string;
  hint?: string;
  route: string;
}

const APP_VERSION = '2.0';
const FEEDBACK_EMAIL = 'ufrldk13@gmail.com';

export const Me: React.FC = () => {
  const { data, setActiveRoute } = useApp();
  const t = useT();

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

  const groups: { title: string; rows: MenuRow[] }[] = [
    {
      title: t('Your future'),
      rows: [
        { icon: AudioLines, label: t('Focus & meditations'), hint: t('Guided sessions and sound waves'), route: '/app/focus' },
        { icon: UserRound, label: t('Future self'), hint: t('Roles, standards, letters'), route: '/app/future-self' },
        { icon: Target, label: t('Missions'), route: '/app/missions' },
        { icon: CalendarRange, label: t('Seasons'), route: '/app/seasons' },
        { icon: TrendingUp, label: t('Progress'), route: '/app/progress' },
        { icon: Gauge, label: t('Life score'), route: '/app/score' },
      ],
    },
    {
      title: t('Money'),
      rows: [
        { icon: Wallet, label: t('Wallet & savings'), hint: t('D$ ledger and real-money bridge'), route: '/app/bank' },
        { icon: Landmark, label: t('Reality bridge'), route: '/app/bridge' },
        { icon: PieChart, label: t('Budget'), route: '/app/budget' },
      ],
    },
    {
      title: t('App'),
      rows: [
        { icon: Bell, label: t('Reminders'), route: '/app/settings' },
        { icon: Languages, label: t('Language'), route: '/app/settings' },
        { icon: CloudUpload, label: t('Backup & sync'), route: '/app/settings' },
        { icon: SunMoon, label: t('Appearance'), route: '/app/settings' },
        { icon: Sparkles, label: t('Pro plan'), route: '/app/upgrade' },
      ],
    },
  ];

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
      <div className="grid grid-cols-3 gap-3">
        <StatTile value={String(stats.streak)} label={t('Day streak')} />
        <StatTile value={stats.earned >= 10000 ? `${(stats.earned / 1000).toFixed(1)}k` : stats.earned.toLocaleString()} label={t('D$ earned')} accent />
        <StatTile
          value={stats.latestScore !== null ? String(stats.latestScore) : '—'}
          label={t('Life score')}
        />
      </div>

      {/* Two futures */}
      <button
        type="button"
        onClick={() => setActiveRoute('/app/two-futures')}
        className="w-full text-left bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4 cursor-pointer transition-opacity active:opacity-80"
      >
        <div className="flex items-center justify-between">
          <span className="text-[15px] font-semibold text-[var(--fg)]">{t('Two futures')}</span>
          <span className="flex items-center gap-1 text-[13px] text-[var(--fg-muted)]">
            {t('This month')}
            <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-[var(--future-allowing)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-500 ease-out"
            style={{ width: `${stats.total > 0 ? stats.buildingPct : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[var(--fg)] font-medium">
            {t('Building {pct}%', { pct: stats.buildingPct })}
          </span>
          <span className="text-[var(--fg-muted)]">
            {t('Allowing {pct}%', { pct: stats.total > 0 ? 100 - stats.buildingPct : 0 })}
          </span>
        </div>
        {stats.total === 0 && (
          <p className="text-[13px] text-[var(--fg-subtle)]">{t('No votes yet this month.')}</p>
        )}
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
