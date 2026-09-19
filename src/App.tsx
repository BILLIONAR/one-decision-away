import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './store/useApp';
import { AppShell } from './layout/AppShell';
import { Landing } from './pages/Landing';
import { useT } from './i18n';
const PublicTwoFutures = lazy(() => import('./pages/PublicTwoFutures').then((m) => ({ default: m.PublicTwoFutures })));
import { Today } from './pages/Today';
import { Onboarding } from './components/Onboarding';
const Dreams = lazy(() => import('./pages/Dreams').then((m) => ({ default: m.Dreams })));
const Me = lazy(() => import('./pages/Me').then((m) => ({ default: m.Me })));
const Missions = lazy(() => import('./pages/Missions').then((m) => ({ default: m.Missions })));
const Progress = lazy(() => import('./pages/Progress').then((m) => ({ default: m.Progress })));
const TwoFutures = lazy(() => import('./pages/TwoFutures').then((m) => ({ default: m.TwoFutures })));
const FutureSelf = lazy(() => import('./pages/FutureSelf').then((m) => ({ default: m.FutureSelf })));
const LifeScore = lazy(() => import('./pages/LifeScore').then((m) => ({ default: m.LifeScore })));
const Bank = lazy(() => import('./pages/Bank').then((m) => ({ default: m.Bank })));
const Bridge = lazy(() => import('./pages/Bridge').then((m) => ({ default: m.Bridge })));
const Budget = lazy(() => import('./pages/Budget').then((m) => ({ default: m.Budget })));
const Seasons = lazy(() => import('./pages/Seasons').then((m) => ({ default: m.Seasons })));
const Upgrade = lazy(() => import('./pages/Upgrade').then((m) => ({ default: m.Upgrade })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));
const Notebook = lazy(() => import('./pages/Notebook').then((m) => ({ default: m.Notebook })));

const RouteFallback: React.FC = () => {
  const t = useT();
  return (
  <div className="min-h-[40vh] flex items-center justify-center text-sm text-[var(--fg-muted)]">
    <div className="w-4 h-4 border-2 border-[var(--color-sage)] border-t-transparent rounded-full animate-spin mr-3" />
    {t('Loading…')}
  </div>
  );
};

const AppRouter: React.FC = () => {
  const { activeRoute, isLoading, data } = useApp();
  const t = useT();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-sm font-medium text-[var(--fg-muted)]">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[var(--color-sage)] border-t-transparent rounded-full animate-spin" />
          <span>{t('Loading One Decision Away...')}</span>
        </div>
      </div>
    );
  }

  // Public Routes
  if (activeRoute === '/') {
    return <Landing />;
  }

  if (activeRoute === '/two-futures') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <PublicTwoFutures />
      </Suspense>
    );
  }

  // First run: 3-step onboarding replaces the shell until completed
  if (data && data.profile.onboardingStep !== 'completed') {
    return <Onboarding />;
  }

  // In-App Routes inside AppShell
  const renderAppContent = () => {
    switch (activeRoute) {
      case '/app':
        return <Today />;
      case '/app/dreams':
        return <Dreams />;
      case '/app/me':
        return <Me />;
      case '/app/missions':
        return <Missions />;
      case '/app/market':
        return <Dreams />;
      case '/app/life':
        return <Dreams />;
      case '/app/progress':
        return <Progress />;
      case '/app/two-futures':
        return <TwoFutures />;
      case '/app/future-self':
        return <FutureSelf />;
      case '/app/score':
      case '/app/life-score':
        return <LifeScore />;
      case '/app/bank':
        return <Bank />;
      case '/app/bridge':
        return <Bridge />;
      case '/app/budget':
        return <Budget />;
      case '/app/seasons':
        return <Seasons />;
      case '/app/upgrade':
        return <Upgrade />;
      case '/app/settings':
        return <Settings />;
      case '/app/notebook':
        return <Notebook />;
      default:
        return <Today />;
    }
  };

  return (
    <AppShell>
      <Suspense fallback={<RouteFallback />}>{renderAppContent()}</Suspense>
    </AppShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
