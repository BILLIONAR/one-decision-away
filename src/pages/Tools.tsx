import React from 'react';
import {
  ChevronRight, CalendarRange, Gauge, Landmark, PieChart, Target, TrendingUp, UserRound, Wallet, SunMoon, type LucideIcon,
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
          <div className="space-y-1 px-1">
            <h2 id={`tools-${group.title}`} className="oda-display text-[22px] leading-snug">{t(group.title)}</h2>
            <p className="text-[14px] text-[var(--fg-muted)]">{t(group.intro)}</p>
          </div>
          <div className="oda-surface overflow-hidden">
            {group.tools.map((tool, idx) => (
              <button key={tool.route} type="button" onClick={() => setActiveRoute(tool.route)} className={`w-full min-h-[68px] px-4 sm:px-5 py-3 flex items-center gap-4 text-left transition-colors hover:bg-[var(--bg-muted)] ${idx > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                <tool.icon size={20} strokeWidth={1.6} className="shrink-0 text-[var(--fg-muted)]" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-medium text-[var(--fg)]">{t(tool.label)}</span>
                  <span className="block text-[13.5px] leading-snug text-[var(--fg-muted)] mt-0.5">{t(tool.hint)}</span>
                </span>
                <ChevronRight size={18} strokeWidth={1.6} className="shrink-0 text-[var(--fg-subtle)]" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};
