import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import {
  Compass,
  CheckSquare,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Columns,
  UserCheck,
  Award,
  CreditCard,
  Layers,
  PieChart,
  Calendar,
  Settings as SettingsIcon,
  Crown,
  Menu,
  X,
  ExternalLink,
  RotateCcw,
  Sun,
  Moon,
  BookOpen,
} from 'lucide-react';
import { computeLedgerBalance } from '../services/economy';
import { FocusLockView } from '../components/FocusLockView';
import { QuickDreamJournalModal } from '../components/QuickDreamJournalModal';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    data,
    activeRoute,
    setActiveRoute,
    toast,
    hideToast,
    resetToDemo,
    isFocusLocked,
    toggleTheme,
    isSimulatingFocusAlert,
    isQuickJournalOpen,
    openQuickJournal,
    closeQuickJournal,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');

  const balance = data ? computeLedgerBalance(data.transactions) : 0;
  const currentTheme = data?.profile?.theme || 'light';

  const mainNavItems = [
    { label: 'Life OS', path: '/app', icon: Compass },
    { label: 'Missions', path: '/app/missions', icon: CheckSquare },
    { label: 'Market', path: '/app/market', icon: ShoppingBag },
    { label: 'My Life', path: '/app/life', icon: Sparkles },
    { label: 'Progress', path: '/app/progress', icon: TrendingUp },
  ];

  const moreNavItems = [
    { label: 'Two Futures', path: '/app/two-futures', icon: Columns },
    { label: 'Future Self', path: '/app/future-self', icon: UserCheck },
    { label: 'Future Life Score', path: '/app/life-score', icon: Award },
    { label: 'Dream Bank', path: '/app/bank', icon: CreditCard },
    { label: 'Reality Bridge', path: '/app/bridge', icon: Layers },
    { label: 'Life Budget', path: '/app/budget', icon: PieChart },
    { label: 'Seasons', path: '/app/seasons', icon: Calendar },
    { label: 'Settings', path: '/app/settings', icon: SettingsIcon },
  ];

  const handleNav = (path: string) => {
    setActiveRoute(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`p-4 rounded-[var(--radius-md)] border shadow-[var(--shadow-md)] flex items-center justify-between gap-3 text-sm ${
              toast.type === 'error'
                ? 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/30'
                : toast.type === 'info'
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] border-[var(--border)]'
                : 'bg-[var(--success-soft)] text-[var(--color-slate)] border-[var(--color-sage)]/30'
            }`}
          >
            <span className="font-medium leading-relaxed">{toast.message}</span>
            <button
              onClick={hideToast}
              className="text-[var(--fg-subtle)] hover:text-[var(--fg)] p-1 rounded-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[var(--bg-elevated)] border-r border-[var(--border)] shrink-0 h-screen sticky top-0 overflow-y-auto p-6 justify-between">
        <div className="space-y-6">
          {/* Brand Header */}
          <div
            onClick={() => handleNav('/app')}
            className="cursor-pointer group flex flex-col pt-1"
          >
            <span className="font-display font-semibold text-[1.45rem] tracking-normal text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors leading-none">
              One Decision Away
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--fg-subtle)] mt-2 font-sans">
              AurelyStudio System OS
            </span>
            <div className="w-8 h-[1px] bg-[var(--border-strong)] mt-4" />
          </div>

          {/* D$ Balance Widget */}
          <div
            onClick={() => handleNav('/app/bank')}
            className="p-3.5 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-xs)] cursor-pointer hover:border-[var(--fg)] transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[var(--fg-muted)] mb-1 font-sans">
              <span className="tracking-[0.15em] text-[var(--ink-faint)]">Dream Bank</span>
              <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 bg-[var(--bg-elevated)] text-[var(--fg)] border border-[var(--border)]">
                Verified
              </span>
            </div>
            <div className="text-2xl font-semibold font-display text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
              D$ {balance.toLocaleString()}
            </div>
          </div>

          {/* Global Quick Journal Shortcut Button (Cmd/Ctrl + K) */}
          <button
            type="button"
            onClick={openQuickJournal}
            className="w-full flex items-center justify-between px-3 py-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-muted)] border border-[var(--border)] hover:border-[var(--accent)] rounded-[var(--radius-xs)] text-xs text-[var(--fg)] transition-all cursor-pointer group"
            title={`Quick Dream Journal Entry (${isMac ? '⌘K' : 'Ctrl+K'})`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[var(--color-sage)] group-hover:scale-110 transition-transform" />
              <span className="font-medium text-[11px] tracking-wide">Quick Journal</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-muted)] border border-[var(--border)] font-mono text-[9px] font-medium text-[var(--fg-muted)] group-hover:text-[var(--fg)]">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </button>

          {/* Main Navigation */}
          <nav className="space-y-1">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-faint)] block mb-2 px-1 font-sans">
              Core Folios
            </span>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[var(--radius-xs)] text-[13px] transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'font-bold text-[var(--accent)] bg-[var(--accent-soft)]/40'
                      : 'text-[var(--fg)] opacity-80 hover:opacity-100 hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--fg-muted)]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Secondary "More" Navigation */}
          <nav className="space-y-1 pt-3 border-t border-[var(--border)]">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--ink-faint)] block mb-2 px-1 font-sans">
              Modules
            </span>
            {moreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[var(--radius-xs)] text-[13px] transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'font-bold text-[var(--accent)] bg-[var(--accent-soft)]/40'
                      : 'text-[var(--fg)] opacity-80 hover:opacity-100 hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--fg-subtle)]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Upgrade & Public Funnel Link */}
        <div className="space-y-3 pt-4 border-t border-[var(--border)]">
          <button
            onClick={() => handleNav('/app/upgrade')}
            className="w-full flex items-center justify-between p-2.5 bg-[var(--bg-muted)] border border-[var(--border-strong)] rounded-[var(--radius-xs)] text-xs font-medium text-[var(--fg)] hover:border-[var(--fg)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-[var(--color-coral)]" />
              <span className="font-semibold text-[11px] uppercase tracking-wider">Pro Edition</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-[var(--fg)] text-[var(--bg)] rounded-[var(--radius-xs)]">
              {data?.subscription.plan === 'pro' ? 'Active' : 'Upgrade'}
            </span>
          </button>

          {/* Quick Theme Toggle & Utility */}
          <div className="flex items-center justify-between p-2 rounded-[var(--radius-xs)] bg-[var(--bg-muted)] border border-[var(--border)] text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {currentTheme === 'dark' ? 'Midnight Theme' : 'Editorial Theme'}
            </span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--bg-elevated)] text-[var(--fg)] border border-[var(--border)] hover:border-[var(--fg)] text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              title={`Switch to ${currentTheme === 'dark' ? 'Editorial Light' : 'Midnight Dark'} Theme`}
            >
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-[var(--fg-muted)]" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[var(--fg-subtle)] px-1">
            <button
              onClick={() => handleNav('/two-futures')}
              className="hover:text-[var(--fg)] flex items-center gap-1 cursor-pointer"
            >
              Public Funnel <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={resetToDemo}
              title="Reset state to initial sample data"
              className="hover:text-[var(--fg)] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Demo
            </button>
          </div>

          <div className="text-[11px] text-[var(--ink-faint)] leading-relaxed pt-3 border-t border-[var(--border)] font-sans">
            Vol. 01 — Edition<br />
            AurelyStudio System OS
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border)] sticky top-0 z-30 pt-safe">
        <div
          onClick={() => handleNav('/app')}
          className="cursor-pointer"
        >
          <span className="font-display font-bold text-lg text-[var(--fg)]">
            One Decision Away
          </span>
          <span className="text-[10px] block text-[var(--fg-subtle)]">by AurelyStudio</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openQuickJournal}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-sage)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] cursor-pointer flex items-center gap-1 bg-[var(--bg-muted)] border border-[var(--border)]"
            title={`Quick Dream Journal Entry (${isMac ? '⌘K' : 'Ctrl+K'})`}
            aria-label="Quick Journal Entry"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px] font-bold font-mono">⌘K</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] cursor-pointer"
            title={`Switch to ${currentTheme === 'dark' ? 'Editorial Light' : 'Midnight Dark'} Theme`}
            aria-label="Toggle Theme"
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => handleNav('/app/bank')}
            className="px-2.5 py-1 bg-[var(--bg-muted)] border border-[var(--border)] rounded-full text-xs font-bold text-[var(--color-sage)] flex items-center gap-1.5 cursor-pointer"
          >
            <span>D$</span>
            <span>{balance.toLocaleString()}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--fg)] hover:bg-[var(--bg-muted)] cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[rgba(38,50,56,0.6)] backdrop-blur-xs flex justify-end">
          <div className="w-4/5 max-w-xs bg-[var(--bg-elevated)] h-full p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <span className="font-display font-bold text-base">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[var(--fg-subtle)] hover:text-[var(--fg)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {[...mainNavItems, ...moreNavItems].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeRoute === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[var(--color-slate)] text-white'
                          : 'text-[var(--fg-muted)] hover:bg-[var(--bg-muted)]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] space-y-2">
              <button
                onClick={() => handleNav('/app/upgrade')}
                className="w-full py-2 bg-[var(--accent-soft)] text-[var(--color-coral)] font-semibold rounded-[var(--radius-md)] text-xs text-center"
              >
                Pro Plan ($6.99/mo)
              </button>
              <button
                onClick={() => handleNav('/two-futures')}
                className="w-full text-xs text-[var(--fg-muted)] text-center py-1 hover:underline"
              >
                Public Two Futures Funnel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-12 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar (5 primary tabs) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bg-elevated)]/95 backdrop-blur-md border-t border-[var(--border)] z-30 pb-safe">
        <div className="grid grid-cols-5 h-14">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[var(--color-slate)] font-bold' : 'text-[var(--fg-subtle)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Focus Mode Fullscreen Lock Overlay */}
      {isFocusLocked && <FocusLockView />}

      {/* Focus Timer 0 Simulation Screen Pulsing Border Alert */}
      {isSimulatingFocusAlert && !isFocusLocked && (
        <div
          id="focus-simulation-screen-pulse"
          className="fixed inset-0 pointer-events-none z-50 border-4 sm:border-8 border-transparent animate-focus-screen-pulse"
          aria-hidden="true"
        />
      )}

      {/* Global Quick Dream Journal Modal (Cmd/Ctrl + K) */}
      <QuickDreamJournalModal
        isOpen={isQuickJournalOpen}
        onClose={closeQuickJournal}
      />
    </div>
  );
};
