import React from 'react';
import { useApp } from '../store/useApp';
import { Sun, Star, BookOpen, User, X, ArrowLeft, MessageCircle, GraduationCap, AudioLines, Leaf, Settings, CircleHelp } from 'lucide-react';
import { computeLedgerBalance } from '../services/economy';
import { FocusLockView } from '../components/FocusLockView';
import { QuickDreamJournalModal } from '../components/QuickDreamJournalModal';
import { useT, useLocale } from '../i18n';
import { companionCopy } from '../i18n/companion';
import { designCopy } from '../i18n/design';
import { firstRunCopy } from '../i18n/firstRun';
import { LogoLockup, LogoCompact } from '../components/Logo';

interface AppShellProps {
  children: React.ReactNode;
}

/** Five primary mobile destinations; learning also has direct desktop links. */
export const PRIMARY_TABS = [
  { key: 'today', path: '/app', icon: Sun },
  { key: 'dreams', path: '/app/dreams', icon: Star },
  { key: 'notebook', path: '/app/notebook', icon: BookOpen },
  { key: 'coach', path: '/app/coach', icon: MessageCircle },
  { key: 'me', path: '/app/me', icon: User },
] as const;

/** Legacy / secondary routes grouped under "Me" — which tab they belong to for highlighting. */
const SECONDARY_ROUTE_PARENT: Record<string, string> = {
  '/app/courses': '/app',
  '/app/evidence': '/app',
  '/app/market': '/app/dreams',
  '/app/life': '/app/dreams',
  '/app/missions': '/app',
  '/app/focus': '/app',
  '/app/progress': '/app/me',
  '/app/two-futures': '/app/me',
  '/app/future-self': '/app/me',
  '/app/score': '/app/me',
  '/app/life-score': '/app/me',
  '/app/bank': '/app/me',
  '/app/bridge': '/app/me',
  '/app/budget': '/app/me',
  '/app/seasons': '/app/me',
  '/app/upgrade': '/app/me',
  '/app/settings': '/app/me',
  '/app/tools': '/app/me',
  '/app/account': '/app/me',
  '/app/sound': '/app/me',
};

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    data,
    activeRoute,
    setActiveRoute,
    toast,
    hideToast,
    isFocusLocked,
    isSimulatingFocusAlert,
    isQuickJournalOpen,
    closeQuickJournal,
  } = useApp();
  const t = useT();
  const [locale] = useLocale();
  const c = designCopy(locale);

  const balance = data ? computeLedgerBalance(data.transactions) : 0;
  const labels: Record<string, string> = {
    coach: companionCopy(locale).coach,
    today: t('Today'),
    dreams: t('Dreams'),
    notebook: t('Notebook'),
    me: t('Me'),
  };

  const activeTabPath = SECONDARY_ROUTE_PARENT[activeRoute] ?? activeRoute;
  const isSecondary = activeRoute in SECONDARY_ROUTE_PARENT;

  const handleNav = (path: string) => setActiveRoute(path);

  return (
    <div className="min-h-screen text-[var(--fg)] flex flex-col md:flex-row">
      <a href="#oda-main" onClick={(event) => { event.preventDefault(); document.getElementById('oda-main')?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:top-3 focus:left-3 focus:p-3 focus:bg-[var(--bg-elevated)]">{c.skip}</a>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            role="status"
            className={`px-4 py-3 rounded-[var(--radius-md)] border flex items-center justify-between gap-3 text-sm shadow-[var(--shadow-lg)] ${
              toast.type === 'error'
                ? 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/30'
                : 'bg-[var(--fg)] text-[var(--bg)] border-transparent'
            }`}
          >
            <span className="font-medium leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={hideToast}
              aria-label={t('Dismiss')}
              className="opacity-70 hover:opacity-100 p-1 rounded-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="oda-sidebar hidden md:flex flex-col w-60 bg-[var(--bg-elevated)] border-r border-[var(--border)] shrink-0 h-screen overflow-y-auto sticky top-0 p-6 gap-6">
        <button
          type="button"
          onClick={() => handleNav('/app')}
          className="oda-sidebar-brand cursor-pointer text-left"
          aria-label={t('One Decision Away')}
        >
          <LogoLockup variant="inverted" />
        </button>

        <nav className="flex flex-col gap-1" aria-label={t('Main')}>
          {PRIMARY_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.path || (activeTabPath === item.path && activeRoute !== '/app/courses' && activeRoute !== '/app/sound');
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 h-12 rounded-[12px] text-[14px] leading-[1.4] transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'oda-nav-active bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]'
                }`}
              >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{labels[item.key]}</span>
              </button>
            );
          })}
        </nav>

        <nav className="flex flex-col gap-1 border-t border-[var(--border)] pt-5" aria-label={c.learn}>
          <p className="oda-kicker text-[var(--fg-muted)] px-3 mb-2">{c.learn}</p>
          {[{ path: '/app/courses', label: c.courses, icon: GraduationCap }, { path: '/app/evidence', label: t('Your evidence'), icon: Leaf }, { path: '/app/sound', label: t('Sound Room'), icon: AudioLines }].map(item => {
            const Icon = item.icon;
            const active = activeRoute === item.path;
            return <button key={item.path} type="button" onClick={() => handleNav(item.path)} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 px-3 min-h-11 rounded-[var(--radius-sm)] text-sm text-left ${active ? 'oda-nav-active bg-[var(--accent-soft)] text-[var(--accent)] font-semibold' : 'text-[var(--fg-muted)] hover:bg-[var(--bg-muted)]'}`}><Icon size={18} strokeWidth={1.8} />{item.label}</button>;
          })}
        </nav>

        <button
          type="button"
          onClick={() => handleNav('/app/bank')}
          className="mt-auto flex flex-col gap-0.5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] cursor-pointer text-left hover:bg-[var(--bg-inset)] transition-colors"
        >
          <span className="text-[12px] text-[var(--fg-muted)]">{t('Balance')}</span>
          <span className="text-[20px] font-semibold text-[var(--accent)] tracking-tight">D$ {balance.toLocaleString()}</span>
        </button>
        <div className="flex gap-2 border-t border-[var(--border)] pt-3"><button type="button" onClick={() => handleNav('/app/settings')} className="min-h-11 flex flex-1 items-center justify-center gap-2 text-xs rounded-[var(--radius-sm)] hover:bg-[var(--bg-muted)]" aria-label={t('Settings')}><Settings size={16} />{t('Settings')}</button><button type="button" onClick={() => handleNav('/app/support')} aria-label={firstRunCopy(locale).help} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-[var(--bg-muted)]"><CircleHelp size={18} /></button></div>
      </aside>

      {/* Mobile top bar: only on secondary pages, gives a way back */}
      {isSecondary && (
        <header className="md:hidden sticky top-0 z-30 oda-glass-bar pt-safe">
          <div className="h-14 px-2 flex items-center">
            <button
              type="button"
              onClick={() => handleNav(activeTabPath)}
              className="flex items-center gap-1.5 h-10 px-2 rounded-[var(--radius-sm)] text-[14px] font-medium text-[var(--fg)] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              {labels[PRIMARY_TABS.find((p) => p.path === activeTabPath)?.key ?? 'me']}
            </button>
            <LogoCompact className="oda-mobile-brand" />
          </div>
        </header>
      )}

      {/* Content */}
      <main id="oda-main" tabIndex={-1} className="outline-none flex-1 min-w-0 overflow-y-auto pb-36 md:pb-12 min-h-screen">
        <div key={activeRoute} className={`oda-page-enter ${activeRoute === '/app' ? 'max-w-[1160px]' : activeRoute === '/app/courses' || activeRoute === '/app/tools' ? 'max-w-[1040px]' : 'max-w-[760px]'} mx-auto px-5 sm:px-8 md:px-10 lg:px-12 ${isSecondary ? 'pt-6' : 'pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]'} md:pt-12`}>{children}</div>
      </main>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden oda-tabbar" aria-label={t('Main')}>
        {PRIMARY_TABS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTabPath === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNav(item.path)}
              aria-current={isActive ? 'page' : undefined}
              className="oda-tab"
            >
              <Icon className="w-[21px] h-[21px]" strokeWidth={isActive ? 2.1 : 1.7} aria-hidden="true" />
              <span>{labels[item.key]}</span>
            </button>
          );
        })}
      </nav>

      {isFocusLocked && <FocusLockView />}

      {isSimulatingFocusAlert && !isFocusLocked && (
        <div
          id="focus-simulation-screen-pulse"
          className="fixed inset-0 pointer-events-none z-50 border-4 sm:border-8 border-transparent animate-focus-screen-pulse"
          aria-hidden="true"
        />
      )}

      <QuickDreamJournalModal isOpen={isQuickJournalOpen} onClose={closeQuickJournal} />
    </div>
  );
};
