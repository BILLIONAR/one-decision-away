import React from 'react';
import { useApp } from '../store/useApp';
import { Sun, Star, BookOpen, User, X, ArrowLeft } from 'lucide-react';
import { computeLedgerBalance } from '../services/economy';
import { FocusLockView } from '../components/FocusLockView';
import { QuickDreamJournalModal } from '../components/QuickDreamJournalModal';
import { useT } from '../i18n';
import { Logo } from '../components/Logo';

interface AppShellProps {
  children: React.ReactNode;
}

/** The four primary destinations. Everything else is reachable from "Me". */
export const PRIMARY_TABS = [
  { key: 'today', path: '/app', icon: Sun },
  { key: 'dreams', path: '/app/dreams', icon: Star },
  { key: 'notebook', path: '/app/notebook', icon: BookOpen },
  { key: 'me', path: '/app/me', icon: User },
] as const;

/** Legacy / secondary routes grouped under "Me" — which tab they belong to for highlighting. */
const SECONDARY_ROUTE_PARENT: Record<string, string> = {
  '/app/market': '/app/dreams',
  '/app/life': '/app/dreams',
  '/app/missions': '/app',
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

  const balance = data ? computeLedgerBalance(data.transactions) : 0;
  const labels: Record<string, string> = {
    today: t('Today'),
    dreams: t('Dreams'),
    notebook: t('Notebook'),
    me: t('Me'),
  };

  const activeTabPath = SECONDARY_ROUTE_PARENT[activeRoute] ?? activeRoute;
  const isSecondary = activeRoute in SECONDARY_ROUTE_PARENT;

  const handleNav = (path: string) => setActiveRoute(path);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col md:flex-row">
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
      <aside className="hidden md:flex flex-col w-60 bg-[var(--bg)] border-r border-[var(--border)] shrink-0 h-screen sticky top-0 p-5 gap-6">
        <button
          type="button"
          onClick={() => handleNav('/app')}
          className="flex items-center gap-2.5 cursor-pointer text-left"
          aria-label={t('One Decision Away')}
        >
          <Logo className="w-7 h-7" />
          <span className="font-semibold text-[15px] tracking-tight">{t('One Decision Away')}</span>
        </button>

        <nav className="flex flex-col gap-1" aria-label={t('Main')}>
          {PRIMARY_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTabPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 h-11 rounded-[var(--radius-sm)] text-[14px] transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[var(--bg-muted)] text-[var(--fg)] font-semibold'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{labels[item.key]}</span>
              </button>
            );
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
      </aside>

      {/* Mobile top bar: only on secondary pages, gives a way back */}
      {isSecondary && (
        <header className="md:hidden sticky top-0 z-30 bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--border)] pt-safe">
          <div className="h-12 px-2 flex items-center">
            <button
              type="button"
              onClick={() => handleNav(activeTabPath)}
              className="flex items-center gap-1.5 h-10 px-2 rounded-[var(--radius-sm)] text-[14px] font-medium text-[var(--fg)] cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              {labels[PRIMARY_TABS.find((p) => p.path === activeTabPath)?.key ?? 'me']}
            </button>
          </div>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-28 md:pb-12 min-h-screen">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-6 md:pt-10">{children}</div>
      </main>

      {/* Mobile bottom tabs */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg)]/95 backdrop-blur-md border-t border-[var(--border)] z-30 pb-safe"
        aria-label={t('Main')}
      >
        <div className="grid grid-cols-4 h-16">
          {PRIMARY_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTabPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-1 text-[11px] transition-colors cursor-pointer ${
                  isActive ? 'text-[var(--fg)] font-semibold' : 'text-[var(--fg-subtle)] font-medium'
                }`}
              >
                <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{labels[item.key]}</span>
              </button>
            );
          })}
        </div>
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
