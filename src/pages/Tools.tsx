import React from 'react';
import {
  ArrowUpRight, CalendarRange, Gauge, Landmark, PieChart, Target, TrendingUp, UserRound, Wallet, SunMoon, type LucideIcon,
} from 'lucide-react';
import { useApp } from '../store/useApp';
import { useT, N_ } from '../i18n';

type Tool = { icon: LucideIcon; label: string; hint: string; route: string };

/**
 * Every secondary tool in one calm place, so the main flow stays simple
 * (Today, Dreams, Notebook, Coach, Me). Nothing is removed; data is kept.
 */
const GROUPS: { title: string; intro: string; tools: Tool[] }[] = [
  {
    title: N_('Who you are becoming'),
    intro: N_('Picture the person you are growing into and the life you are choosing.'),
    tools: [
      { icon: UserRound, label: N_('Future self'), hint: N_('Roles, standards and letters from the person you’re becoming.'), route: '/app/future-self' },
      { icon: SunMoon, label: N_('Two futures'), hint: N_('The life you’re building next to the one that happens by default.'), route: '/app/two-futures' },
      { icon: CalendarRange, label: N_('Seasons'), hint: N_('Chapters of a few weeks with one clear theme.'), route: '/app/seasons' },
    ],
  },
  {
    title: N_('Tracking'),
    intro: N_('See the pattern behind the days, gently.'),
    tools: [
      { icon: Target, label: N_('Missions'), hint: N_('Small tasks that move a dream forward, with a focus timer.'), route: '/app/missions' },
      { icon: TrendingUp, label: N_('Progress'), hint: N_('Where your days are going, week by week.'), route: '/app/progress' },
      { icon: Gauge, label: N_('Life score'), hint: N_('Eight areas of life, rated by you, for you.'), route: '/app/score' },
    ],
  },
  {
    title: N_('Money and dreams'),
    intro: N_('Dream Dollars you earn by keeping your word, and real money plans.'),
    tools: [
      { icon: Wallet, label: N_('Wallet & savings'), hint: N_('Your D$ ledger: what you earned and what you spent.'), route: '/app/bank' },
      { icon: Landmark, label: N_('Reality bridge'), hint: N_('Turn a dream into a real savings plan.'), route: '/app/bridge' },
      { icon: PieChart, label: N_('Budget'), hint: N_('A simple monthly budget next to your dreams.'), route: '/app/budget' },
    ],
  },
];

export const Tools: React.FC = () => {
  const t = useT();
  const { setActiveRoute } = useApp();
  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="oda-kicker text-[var(--accent)]">{t('Tools')}</p>
        <h1 className="oda-display text-[32px] sm:text-[40px] leading-tight tracking-tight">{t('Everything else, in one place')}</h1>
        <p className="text-[15px] leading-relaxed text-[var(--fg-muted)] max-w-[52ch]">{t('The daily decision is the heart of ODA. These tools are here when you want to go deeper.')}</p>
      </header>
      {GROUPS.map(group => (
        <section key={group.title} className="space-y-4" aria-labelledby={`tools-${group.title}`}>
          <div className="space-y-1">
            <h2 id={`tools-${group.title}`} className="oda-display text-[22px] leading-snug">{t(group.title)}</h2>
            <p className="text-[14px] text-[var(--fg-muted)]">{t(group.intro)}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {group.tools.map(tool => (
              <button key={tool.route} type="button" onClick={() => setActiveRoute(tool.route)} className="oda-surface group text-left p-4 sm:p-5 flex sm:flex-col items-center sm:items-stretch gap-3.5 sm:gap-3 sm:min-h-[148px]">
                <span className="flex items-center justify-between shrink-0">
                  <span className="oda-icon-chip"><tool.icon size={19} strokeWidth={1.8} /></span>
                  <ArrowUpRight size={17} className="hidden sm:block text-[var(--fg-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block text-[16px] font-semibold text-[var(--fg)]">{t(tool.label)}</span>
                  <span className="block text-[13px] leading-relaxed text-[var(--fg-muted)]">{t(tool.hint)}</span>
                </span>
                <ArrowUpRight size={17} className="sm:hidden shrink-0 text-[var(--fg-subtle)]" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
