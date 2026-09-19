import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import {
  Card,
  Button,
  Badge,
  Progress,
  Stat,
  Field,
  Input,
  Disclaimer,
} from '../components/ui';
import {
  CheckCircle,
  Clock,
  Play,
  ArrowRight,
  Sparkles,
  Flame,
  Plus,
  Compass,
  Layers,
  ShoppingBag,
  BellRing,
} from 'lucide-react';
import { CompleteMissionModal } from '../components/MissionFlows';
import { DreamArt } from '../components/DreamArt';
import { DailyAffirmationWidget } from '../components/DailyAffirmationWidget';
import { DailyVisionAffirmation } from '../components/DailyVisionAffirmation';
import { DailyMicroHabits } from '../components/DailyMicroHabits';
import { MicroHabitsProgressIndicator } from '../components/MicroHabitsProgressIndicator';
import { DailyCheckIn } from '../components/DailyCheckIn';
import { DreamJournal } from '../components/DreamJournal';
import { OneDecisionStreakCounter } from '../components/OneDecisionStreakCounter';
import { FloatingJournalButton } from '../components/FloatingJournalButton';
import { MeditateNowWidget } from '../components/MeditateNowWidget';
import { WeeklyTwoFuturesReview, EveningDriftCheck } from '../components/TwoFuturesPulseWidgets';
import { BackupReminder } from '../components/BackupReminder';
import { ShareStreakButton } from '../components/ShareCards';
import { DailyDeepQuestion } from '../components/DailyDeepQuestion';
import { MorningVision } from '../components/MorningVision';
import { WeekendSummary } from '../components/WeekendSummary';
import { SEED_MARKET_ITEMS } from '../data/seed';
import {
  computeLedgerBalance,
  calculateCurrentStreak,
  calculateOneDecisionStreakData,
  ECONOMY_CONSTANTS,
} from '../services/economy';
import { Mission } from '../types/models';
import { useT } from '../i18n';

export const Home: React.FC = () => {
  const {
    data,
    setActiveRoute,
    completeMission,
    setOneDecision,
    startFocusSession,
  } = useApp();
  const t = useT();

  const [completingMission, setCompletingMission] = useState<Mission | null>(null);
  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [newDecisionMinutes, setNewDecisionMinutes] = useState(45);
  const [isSettingDecision, setIsSettingDecision] = useState(false);

  if (!data) return null;

  const balance = computeLedgerBalance(data.transactions);
  const todayStr = new Date().toISOString().slice(0, 10);

  // Today's One Decision
  const todayOneDecision = data.missions.find(
    (m) => m.isOneDecision && (m.scheduledFor === todayStr || m.status === 'active')
  );

  // One Decision Streak Analytics
  const decisionStreak = calculateOneDecisionStreakData(data);

  // Active missions
  const activeMissions = data.missions.filter(
    (m) => m.status === 'active' && !m.isOneDecision && m.type !== 'constraint'
  );
  const currentActiveMission = activeMissions[0];

  // Active Dream Target (from inVisionItemIds or first seed item)
  const allItems = [...SEED_MARKET_ITEMS, ...data.customMarketItems];
  const targetItemId = data.inVisionItemIds?.[0] || allItems[0]?.id;
  const targetItem = allItems.find((i) => i.id === targetItemId) || allItems[0];
  const targetProgress = targetItem
    ? Math.min(100, Math.round((balance / targetItem.dreamDollarPrice) * 100))
    : 0;

  // Streak & Votes
  const streak = calculateCurrentStreak(data.completions.map((c) => c.completedAt));
  const totalVotes = (data.twoFutures.buildingVotes || 0) + (data.twoFutures.allowingVotes || 0);
  const buildingPct = totalVotes > 0 ? Math.round(((data.twoFutures.buildingVotes || 0) / totalVotes) * 100) : 75;

  // Recent completions
  const recentCompletions = data.completions.slice(0, 3);

  const handleCreateDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecisionTitle.trim()) return;
    await setOneDecision(newDecisionTitle.trim(), undefined, newDecisionMinutes);
    setNewDecisionTitle('');
    setIsSettingDecision(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 0. Daily reminder banner — shown until today's One Decision is set */}
      {!todayOneDecision && (
        <div
          role="status"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[var(--color-coral)]/10 border border-[var(--color-coral)]/40 rounded-[var(--radius-md)] animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 shrink-0 rounded-full bg-[var(--color-coral)] text-white flex items-center justify-center shadow-xs">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--fg)]">{t("You haven't set today's One Decision yet.")}</p>
              <p className="text-xs text-[var(--fg-muted)]">
                {t('One meaningful action a day is how the future gets built. Pick it now, before the day picks for you.')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button size="sm" variant="primary" onClick={() => setIsSettingDecision(true)}>
              {t('Set it here')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setActiveRoute('/app/missions')}>
              {t('Go to Missions')} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <MorningVision />
      <BackupReminder />
      <WeekendSummary />

      {/* Weekly Two Futures review nudge (7+ days since last look) */}
      <WeeklyTwoFuturesReview />

      {/* 1. Today's One Decision Section */}
      <Card
        id="set-one-decision"
        padding="lg"
        className={`border-2 transition-all ${
          todayOneDecision && todayOneDecision.status === 'completed'
            ? 'bg-[var(--success-soft)]/40 border-[var(--color-sage)]'
            : 'bg-[var(--bg-elevated)] border-[var(--color-coral)]/40 shadow-[var(--shadow-sm)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-coral)] animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
              {t("Today's Signature Decision")}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="coral">{t('+ D$ 500 Reward')}</Badge>
            {decisionStreak.currentStreak > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-coral)]/15 text-[var(--color-coral)] border border-[var(--color-coral)]/30">
                <Flame className="w-3 h-3 fill-current" /> {t('{n}-Day Streak', { n: decisionStreak.currentStreak })}
              </span>
            ) : (
              <Badge variant="slate">{t('Priority #1')}</Badge>
            )}
          </div>
        </div>

        {todayOneDecision ? (
          <div className="pt-4 space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-[var(--fg-muted)]">
                {todayOneDecision.status === 'completed'
                  ? t('Completed for today · Vote recorded')
                  : t('What makes today meaningful:')}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-[var(--fg)]">
                {todayOneDecision.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-[var(--fg-muted)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {t('{n} mins', { n: todayOneDecision.estimatedMinutes || 45 })}
                </span>
                <span className="capitalize px-2 py-0.5 rounded bg-[var(--bg-muted)] border border-[var(--border)]">
                  {t('{difficulty} difficulty', { difficulty: todayOneDecision.difficulty })}
                </span>
              </div>

              {todayOneDecision.status !== 'completed' ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="md"
                    icon={Play}
                    onClick={() =>
                      startFocusSession({
                        missionId: todayOneDecision.id,
                        missionTitle: todayOneDecision.title,
                        missionType: todayOneDecision.type,
                        missionArea: todayOneDecision.area,
                        durationMinutes: todayOneDecision.estimatedMinutes || 45,
                      })
                    }
                    title={t("Lock app into dedicated Deep Work for today's signature decision")}
                  >
                    {t('Lock Into Focus ({n}m)', { n: todayOneDecision.estimatedMinutes || 45 })}
                  </Button>
                  <Button
                    variant="accent"
                    size="md"
                    icon={CheckCircle}
                    onClick={() => setCompletingMission(todayOneDecision)}
                  >
                    {t('Complete One Decision')}
                  </Button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-sage)]">
                  <CheckCircle className="w-4 h-4" /> {t('Finished Today')}
                </div>
              )}
            </div>
          </div>
        ) : isSettingDecision ? (
          <form onSubmit={handleCreateDecision} className="pt-4 space-y-4">
            <Field
              id="decision-input"
              label={t('What is the one decision that would make today meaningful?')}
              required
              helper={t('Under 45 min = Easy, 45-119 min = Medium, 120+ min = Hard.')}
            >
              <Input
                id="decision-input"
                value={newDecisionTitle}
                onChange={(e) => setNewDecisionTitle(e.target.value)}
                placeholder={t('e.g. Ship the client proposal draft before 2:00 PM')}
                autoFocus
              />
            </Field>

            <div className="flex items-center gap-4">
              <Field id="est-mins" label={t('Estimated Minutes')} className="w-40">
                <Input
                  id="est-mins"
                  type="number"
                  min={10}
                  max={300}
                  value={newDecisionMinutes}
                  onChange={(e) => setNewDecisionMinutes(parseInt(e.target.value) || 45)}
                />
              </Field>

              <div className="pt-5 flex gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={!newDecisionTitle.trim()}
                >
                  {t('Lock In Decision')}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsSettingDecision(false)}
                >
                  {t('Cancel')}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-base font-semibold text-[var(--fg)]">
                {t('No One Decision committed for today yet.')}
              </div>
              <p className="text-xs text-[var(--fg-muted)]">
                {t('Choose the single task that would render the day successful.')}
              </p>
            </div>
            <Button
              variant="accent"
              icon={Plus}
              onClick={() => setIsSettingDecision(true)}
            >
              {t("Set Today's One Decision")}
            </Button>
          </div>
        )}
      </Card>

      {/* 2. One Decision Streak Counter Widget */}
      <OneDecisionStreakCounter
        onSetDecision={() => setIsSettingDecision(true)}
        onCompleteDecision={(mission) => setCompletingMission(mission)}
      />
      <div className="flex justify-end -mt-4">
        <ShareStreakButton />
      </div>

      {/* 3. Daily Affirmation Widget (Inspiring Quote of the Day) */}
      <DailyAffirmationWidget />

      {/* Voice-guided meditation, matched to the time of day */}
      <MeditateNowWidget />

      {/* Evening: one honest question about drift */}
      <EveningDriftCheck />

      {/* Onboarding, one question a day */}
      <DailyDeepQuestion />

      {/* 4. Daily Check-in (Focus, Energy, Mood & 7-Day Trend) */}
      <DailyCheckIn />

      {/* 5. Daily Micro-Habits Progress Bar Indicator */}
      <MicroHabitsProgressIndicator />

      {/* 6. Daily Micro-Habits (5-Min Momentum Fuel) */}
      <DailyMicroHabits />

      {/* 7. Daily Vision Affirmation */}
      <DailyVisionAffirmation />

      {/* 8. Key Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <Stat
          label={t('Dream Bank')}
          value={`D$ ${balance.toLocaleString()}`}
          subtext={t('Verified simulation ledger')}
          badge={t('Verified')}
          className="cursor-pointer hover:border-[var(--border-strong)]"
          onClick={() => setActiveRoute('/app/bank')}
        />
        <Stat
          label={t('Decision Streak')}
          value={t('{n} Days', { n: decisionStreak.currentStreak })}
          subtext={
            decisionStreak.currentStreak > 0
              ? t('{tier} Tier ({n}d record)', { tier: decisionStreak.tier.name, n: decisionStreak.longestStreak })
              : t('Execute today to ignite')
          }
          icon={Flame}
        />
        <Stat
          label={t('Completed Missions')}
          value={data.completions.length}
          subtext={t('Total lifetime executions')}
          icon={CheckCircle}
        />
        <Stat
          label={t('Two Futures Votes')}
          value={t('{n} Votes', { n: data.twoFutures.buildingVotes || 0 })}
          subtext={t('Toward built future')}
          icon={Compass}
        />
      </div>

      {/* 3. Main Dashboard Grid: Active Mission & Dream Target */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Next Mission */}
        <Card padding="md" className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                {t('Active Mission Queue')}
              </span>
              <button
                onClick={() => setActiveRoute('/app/missions')}
                className="text-xs font-semibold text-[var(--color-sage)] hover:underline"
              >
                {t('View All ({n})', { n: data.missions.filter((m) => m.status === 'active').length })}
              </button>
            </div>

            {currentActiveMission ? (
              <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 bg-[var(--bg-elevated)] rounded-full text-[var(--fg-muted)]">
                    {currentActiveMission.area} · {currentActiveMission.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-[var(--color-sage)]">
                    {currentActiveMission.type === 'constraint' ? t('+ D$ 0 (Rule)') : t('+ D$ 150-1,000')}
                  </span>
                </div>
                <h4 className="text-base font-bold font-display text-[var(--fg)]">
                  {currentActiveMission.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t('{n} mins', { n: currentActiveMission.estimatedMinutes || 30 })}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[var(--bg-muted)] rounded-[var(--radius-md)] text-center text-xs text-[var(--fg-muted)]">
                {t('No secondary missions queued.')}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveRoute('/app/missions')}
            >
              {t('Missions List')}
            </Button>
            {currentActiveMission && (
              <Button
                variant="primary"
                size="sm"
                icon={CheckCircle}
                onClick={() => setCompletingMission(currentActiveMission)}
              >
                {t('Complete Mission')}
              </Button>
            )}
          </div>
        </Card>

        {/* Active Dream Target */}
        <Card padding="md" className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-sage)]">
                {t('Active Dream Target')}
              </span>
              <button
                onClick={() => setActiveRoute('/app/market')}
                className="text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center gap-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> {t('Market')}
              </button>
            </div>

            {targetItem && (
              <div className="p-3.5 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] flex gap-3.5 items-center">
                <div className="w-20 h-16 shrink-0 rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border)]">
                  <DreamArt type={targetItem.illustrationKey} />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="text-sm font-bold font-display text-[var(--fg)] truncate">
                    {targetItem.name}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                    <span>{t('Price: D$ {price}', { price: targetItem.dreamDollarPrice.toLocaleString() })}</span>
                    <span>{targetProgress}%</span>
                  </div>
                  <Progress value={targetProgress} variant="sage" />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--fg-subtle)]">
              {Math.max(0, (targetItem?.dreamDollarPrice || 0) - balance) === 0
                ? t('Ready to buy!')
                : t('Need D$ {amount} more', { amount: Math.max(0, (targetItem?.dreamDollarPrice || 0) - balance).toLocaleString() })}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveRoute('/app/market')}
            >
              {t('Open Dream Market')}
            </Button>
          </div>
        </Card>
      </div>

      {/* 4. Two Futures Trajectory Bar */}
      <Card padding="md" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold font-display text-[var(--fg)]">
              {t('Two Futures Trajectory')}
            </h3>
            <p className="text-xs text-[var(--fg-muted)]">
              {t('Every completed mission is a symbolic vote for the life you are building.')}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[var(--color-sage)] font-bold">
              {t('Building: {n} votes', { n: data.twoFutures.buildingVotes || 0 })}
            </span>
            <span className="text-[#9A8F86] font-medium">
              {t('Default: {n} votes', { n: data.twoFutures.allowingVotes || 0 })}
            </span>
          </div>
        </div>

        <div className="h-3 w-full bg-[#9A8F86]/30 rounded-full overflow-hidden flex border border-[var(--border)]">
          <div
            className="h-full bg-[var(--color-sage)] transition-all duration-500 ease-out"
            style={{ width: `${buildingPct}%` }}
            title={t('Building votes: {pct}%', { pct: buildingPct })}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[var(--fg-subtle)] pt-1">
          <span>{t('Anti-Vision: "{text}..."', { text: data.twoFutures.antiVision.slice(0, 45) })}</span>
          <button
            onClick={() => setActiveRoute('/app/two-futures')}
            className="text-[var(--color-coral)] hover:underline shrink-0"
          >
            {t('Review Two Futures →')}
          </button>
        </div>
      </Card>

      {/* 5. Dream Journal & Visual Progress Log */}
      <DreamJournal limit={4} />

      {/* 6. Recent Activity & Action Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)]">
        <div className="space-y-0.5 text-center sm:text-left">
          <div className="text-sm font-bold font-display text-[var(--fg)]">
            {t('Ready for your next milestone?')}
          </div>
          <div className="text-xs text-[var(--fg-muted)]">
            {t('Small, daily, deliberate actions compound into an entirely new life.')}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveRoute('/app/progress')}
            className="flex-1 sm:flex-initial"
          >
            {t('View Progress')}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => setActiveRoute('/app/missions')}
            className="flex-1 sm:flex-initial"
          >
            {t('Continue Mission')}
          </Button>
        </div>
      </div>

      <Disclaimer text={t('Dream Dollars (D$) is a simulation currency. Purchases and assets in My Future Life represent symbolic milestones.')} />

      {/* Complete Mission Reflection Modal */}
      <CompleteMissionModal
        mission={completingMission}
        isOpen={Boolean(completingMission)}
        onClose={() => setCompletingMission(null)}
        onConfirm={completeMission}
      />

      {/* Floating Action Button: Instantly log Dream Journal entry */}
      <FloatingJournalButton />
    </div>
  );
};
