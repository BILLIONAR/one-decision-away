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
  Bell,
  Sparkles,
  AudioLines,
  LucideIcon,
  GraduationCap,
  CheckCircle2,
  Waves,
  LayoutGrid,
  CloudUpload,
} from 'lucide-react';
import { EvidenceTree } from '../components/momentum/EvidenceTree';
import { YourMonth, InsightLine, Milestones } from '../components/me/MyProgress';
import { useCloudState } from '../services/useCloudState';
import { usePro } from '../services/purchases';

interface MenuRow {
  icon: LucideIcon;
  label: string;
  hint?: string;
  route: string;
}

const APP_VERSION = '2.0';

const TINTS = ['oda-tint-sage', 'oda-tint-sand', 'oda-tint-blue', 'oda-tint-rose'];

export const Me: React.FC = () => {
  const { data, setActiveRoute } = useApp();
  const t = useT();
  const cloud = useCloudState();
  const plan = usePro();
  const planName = plan.tier === 'essentials' ? t('Essentials') : plan.tier === 'pro' ? t('Pro') : plan.tier === 'coach' ? t('Pro Coach') : t('Free');
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

  // Few, clear choices; every secondary tool lives on one Tools page.
  const groups: { title: string; rows: MenuRow[] }[] = [
    {
      title: t('Your practice'),
      rows: [
        { icon: CheckCircle2, label: t('Your evidence'), hint: t('Every decision you kept'), route: '/app/evidence' },
        { icon: GraduationCap, label: c.courses, hint: c.courseHint, route: '/app/courses' },
        { icon: Waves, label: t('Sound Room'), hint: t('Sound for calm, sleep, focus and breathing'), route: '/app/sound' },
        { icon: AudioLines, label: t('Focus & meditations'), hint: t('Guided sessions and sound waves'), route: '/app/focus' },
        { icon: UserRound, label: c.coach, hint: c.talk, route: '/app/coach' },
      ],
    },
    {
      title: t('Go deeper'),
      rows: [
        { icon: LayoutGrid, label: t('Tools'), hint: t('Future self, missions, wallet, budget and more'), route: '/app/tools' },
      ],
    },
    {
      title: t('App'),
      rows: [
        ...(cloud.configured ? [{ icon: CloudUpload, label: t('Account'), hint: cloud.session?.user.email || t('Sign in to back up and sync'), route: '/app/account' }] : []),
        { icon: Bell, label: t('Settings'), hint: t('Reminders, language, backup, appearance'), route: '/app/settings' },
        { icon: Sparkles, label: t('Plan'), hint: planName, route: '/app/upgrade' },
      ],
    },
  ];
  const evidence = evidenceSummary(data.missions);

  const feedbackHref = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('One Decision Away feedback')}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="oda-surface p-5 sm:p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full oda-btn-primary flex items-center justify-center text-[22px] oda-numeral shrink-0" aria-hidden="true">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="oda-display text-[28px] tracking-tight text-[var(--fg)] leading-tight truncate">{displayName}</h1>
            <p className="text-[14px] text-[var(--fg-muted)] mt-0.5 truncate">
              {role ? t('Day {n} · {role}', { n: stats.dayNumber, role: t(role) }) : t('Day {n}', { n: stats.dayNumber })}
            </p>
          </div>
          <button type="button" onClick={() => setActiveRoute('/app/evidence')} className="shrink-0 -my-2" aria-label={t('Your evidence tree: {n} leaves', { n: evidence.total })}>
            <EvidenceTree count={evidence.total} className="w-20 h-[70px]" label={t('Your evidence tree: {n} leaves', { n: evidence.total })} />
          </button>
        </div>
        {cloud.configured && !cloud.session && (
          <button type="button" onClick={() => setActiveRoute('/app/account')} className="w-full flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--accent-soft)] px-4 py-3 text-left">
            <CloudUpload size={18} className="text-[var(--accent)] shrink-0" />
            <span className="flex-1 min-w-0 text-[14px] leading-snug"><span className="font-semibold text-[var(--accent)]">{t('Sign in')}</span> <span className="text-[var(--fg-muted)]">{t('so your proof is backed up and on every device.')}</span></span>
            <ChevronRight size={18} className="text-[var(--accent)] shrink-0" />
          </button>
        )}
        <button type="button" onClick={() => setActiveRoute('/app/evidence')} className="w-full grid grid-cols-3 gap-2 text-left">
          <StatTile value={String(evidence.total)} label={t('Kept decisions')} tint="oda-tint-sage" />
          <StatTile value={`${evidence.last7}/7`} label={t('This week')} tint="oda-tint-rose" />
          <StatTile value={stats.earned >= 10000 ? `${(stats.earned / 1000).toFixed(1)}k` : stats.earned.toLocaleString()} label={t('D$ earned')} tint="oda-tint-sand" />
        </button>
      </section>

      {/* Progress: month heatmap, insight, milestones */}
      <YourMonth data={data} />
      <InsightLine data={data} />
      <Milestones data={data} />

      {/* Menu groups */}
      {groups.map((group) => (
        <section key={group.title} className="space-y-3">
          <h2 className="oda-kicker text-[var(--fg-muted)] px-1">{group.title}</h2>
          <div className="oda-surface overflow-hidden">
            {group.rows.map((row, idx) => (
              <button
                key={`${row.route}-${row.label}`}
                type="button"
                onClick={() => setActiveRoute(row.route)}
                className={`w-full min-h-[60px] px-4 py-2 flex items-center gap-4 text-left cursor-pointer transition-colors hover:bg-[var(--bg-muted)] ${idx > 0 ? 'border-t border-[var(--border)]' : ''}`}
              >
                <span className={`oda-tile-icon shrink-0 ${TINTS[idx % TINTS.length]}`}><row.icon className="w-[18px] h-[18px]" strokeWidth={1.9} aria-hidden="true" /></span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-medium text-[var(--fg)] truncate">{row.label}</span>
                  {row.hint && <span className="block text-[12.5px] text-[var(--fg-muted)] truncate">{row.hint}</span>}
                </span>
                <ChevronRight className="w-[18px] h-[18px] text-[var(--fg-subtle)] shrink-0" strokeWidth={1.6} />
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

const StatTile: React.FC<{ value: string; label: string; tint: string }> = ({ value, label, tint }) => (
  <div className={`min-w-0 rounded-[16px] px-3 py-2.5 ${tint}`}>
    <div className="oda-numeral text-[24px] leading-none truncate">{value}</div>
    <div className="text-[11.5px] opacity-80 mt-1 leading-tight">{label}</div>
  </div>
);
