import React, { useState } from 'react';
import { AudioLines, Check, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../store/useApp';
import { Modal } from '../components/ui';
import { CompleteMissionModal } from '../components/MissionFlows';
import { DreamArt } from '../components/DreamArt';
import { DailyMicroHabits } from '../components/DailyMicroHabits';
import { MeditateNowWidget } from '../components/MeditateNowWidget';
import { DailyCheckIn } from '../components/DailyCheckIn';
import { DailyAffirmationWidget } from '../components/DailyAffirmationWidget';
import { DailyDeepQuestion } from '../components/DailyDeepQuestion';
import { EveningDriftCheck } from '../components/TwoFuturesPulseWidgets';
import { MorningVision } from '../components/MorningVision';
import { BackupReminder } from '../components/BackupReminder';
import { SEED_MARKET_ITEMS } from '../data/seed';
import {
  computeLedgerBalance,
  calculateOneDecisionStreakData,
  estimateDailyEarningPace,
  daysToAfford,
  ECONOMY_CONSTANTS,
} from '../services/economy';
import { Mission } from '../types/models';
import { useT, formatDate } from '../i18n';

const RITUALS_KEY = 'oda_rituals_open';

function readRitualsOpen(): boolean {
  try {
    return localStorage.getItem(RITUALS_KEY) === '1';
  } catch {
    return false;
  }
}

function writeRitualsOpen(open: boolean) {
  try {
    localStorage.setItem(RITUALS_KEY, open ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export const Today: React.FC = () => {
  const { data, setActiveRoute, completeMission, setOneDecision, toggleMicroHabit } = useApp();
  const t = useT();

  const [completingMission, setCompletingMission] = useState<Mission | null>(null);
  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [ritualsOpen, setRitualsOpen] = useState<boolean>(readRitualsOpen);
  const [habitsModalOpen, setHabitsModalOpen] = useState(false);

  if (!data) return null;

  const balance = computeLedgerBalance(data.transactions);
  const todayStr = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const hour = now.getHours();
  const name = (data.profile?.displayName || '').trim();

  const greeting =
    hour < 12
      ? name
        ? t('Good morning, {name}', { name })
        : t('Good morning')
      : hour < 18
        ? name
          ? t('Good afternoon, {name}', { name })
          : t('Good afternoon')
        : name
          ? t('Good evening, {name}', { name })
          : t('Good evening');

  const dateLine = formatDate(now, { weekday: 'long', day: 'numeric', month: 'long' });

  // One decision (same selection rule as Home.tsx)
  const todayOneDecision = data.missions.find(
    (m) => m.isOneDecision && (m.scheduledFor === todayStr || m.status === 'active')
  );
  const decisionDone = todayOneDecision?.status === 'completed';
  const decisionStreak = calculateOneDecisionStreakData(data);
  const decisionCompletion = todayOneDecision
    ? data.completions.find((c) => c.missionId === todayOneDecision.id)
    : undefined;
  const earnedAmount = decisionCompletion
    ? decisionCompletion.rewardAmount + (decisionCompletion.streakBonus || 0)
    : ECONOMY_CONSTANTS.ONE_DECISION_REWARD;

  const handleSetDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newDecisionTitle.trim();
    if (!title || isSaving) return;
    setIsSaving(true);
    try {
      await setOneDecision(title);
      setNewDecisionTitle('');
    } finally {
      setIsSaving(false);
    }
  };

  // Micro-habits
  const habits = data.microHabits || [];
  const visibleHabits = habits.slice(0, 3);
  const habitsDone = visibleHabits.filter((h) => h.completedDates.includes(todayStr)).length;

  // Active dream
  const allItems = [...SEED_MARKET_ITEMS, ...(data.customMarketItems || [])].filter((i) => !i.isArchived);
  const targetItemId = data.inVisionItemIds?.[0];
  const targetItem = targetItemId ? allItems.find((i) => i.id === targetItemId) : undefined;
  const targetProgress = targetItem
    ? Math.min(100, Math.round((balance / Math.max(1, targetItem.dreamDollarPrice)) * 100))
    : 0;
  const pace = estimateDailyEarningPace(data.transactions);
  const daysLeft = targetItem ? daysToAfford(targetItem.dreamDollarPrice, balance, pace.perDay) : 0;

  const toggleRituals = () => {
    const next = !ritualsOpen;
    setRitualsOpen(next);
    writeRitualsOpen(next);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] text-[var(--fg-muted)]">{dateLine}</p>
          <h1 className="text-[26px] font-semibold tracking-tight text-[var(--fg)] leading-tight">
            {greeting}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setActiveRoute('/app/bank')}
          className="shrink-0 inline-flex items-center gap-1 h-11 px-3.5 rounded-full bg-[var(--bg-muted)] text-[14px] text-[var(--fg-muted)]"
          aria-label={t('Dream Bank balance')}
        >
          <span>D$</span>
          <span className="font-semibold text-[var(--accent)]">{balance.toLocaleString()}</span>
        </button>
      </header>

      {/* 2. One decision */}
      <section
        id="set-one-decision"
        className="bg-[var(--fg)] text-[var(--bg)] rounded-[var(--radius-lg)] p-6 space-y-5"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] opacity-70">{t("Today's one decision")}</span>
          {decisionStreak.currentStreak > 0 && (
            <span className="text-[13px] opacity-70">{t('{n} days', { n: decisionStreak.currentStreak })}</span>
          )}
        </div>

        {todayOneDecision ? (
          <>
            <p className="text-[22px] font-medium leading-snug">{t(todayOneDecision.title)}</p>
            {decisionDone ? (
              <div className="flex items-center gap-2.5 text-[15px] opacity-80">
                <span className="w-6 h-6 rounded-full bg-[var(--bg)] text-[var(--fg)] flex items-center justify-center">
                  <Check size={14} strokeWidth={2.2} />
                </span>
                <span>{t('Done for today · +D$ {amount}', { amount: earnedAmount.toLocaleString() })}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCompletingMission(todayOneDecision)}
                className="w-full h-12 rounded-[var(--radius-sm)] bg-[var(--bg)] text-[var(--fg)] font-semibold text-[15px]"
              >
                {t('Done · +D$ {amount}', { amount: ECONOMY_CONSTANTS.ONE_DECISION_REWARD.toLocaleString() })}
              </button>
            )}
          </>
        ) : (
          <form onSubmit={handleSetDecision} className="space-y-3">
            <label htmlFor="today-decision-input" className="sr-only">
              {t('What is the one decision that would make today meaningful?')}
            </label>
            <input
              id="today-decision-input"
              value={newDecisionTitle}
              onChange={(e) => setNewDecisionTitle(e.target.value)}
              placeholder={t('What would make today count?')}
              className="w-full h-12 px-4 rounded-[var(--radius-sm)] bg-transparent border border-[var(--bg)]/30 text-[var(--bg)] placeholder:text-[var(--bg)]/50 text-[16px] outline-none focus:border-[var(--bg)]/70"
            />
            <button
              type="submit"
              disabled={!newDecisionTitle.trim() || isSaving}
              className="w-full h-12 rounded-[var(--radius-sm)] bg-[var(--bg)] text-[var(--fg)] font-semibold text-[15px] disabled:opacity-40"
            >
              {t('Set decision')}
            </button>
          </form>
        )}
      </section>

      {/* 3. Three small habits */}
      <section className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Three small habits')}</h2>
          <span className="text-[13px] text-[var(--fg-muted)]">
            {habitsDone} / {visibleHabits.length || 3}
          </span>
        </div>

        {visibleHabits.length > 0 ? (
          <ul className="divide-y divide-[var(--border)]">
            {visibleHabits.map((habit) => {
              const done = habit.completedDates.includes(todayStr);
              return (
                <li key={habit.id}>
                  <button
                    type="button"
                    onClick={() => toggleMicroHabit(habit.id)}
                    aria-pressed={done}
                    className="w-full h-[52px] flex items-center gap-3.5 text-left"
                  >
                    <span
                      className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                        done
                          ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--bg)]'
                          : 'border-[var(--border-strong)] bg-transparent'
                      }`}
                    >
                      {done && <Check size={14} strokeWidth={2.2} />}
                    </span>
                    <span
                      className={`text-[15px] truncate ${
                        done ? 'text-[var(--fg-muted)] line-through' : 'text-[var(--fg)]'
                      }`}
                    >
                      {t(habit.title)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <button
            type="button"
            onClick={() => setHabitsModalOpen(true)}
            className="w-full h-[52px] flex items-center gap-3.5 text-left"
          >
            <span className="w-6 h-6 shrink-0 rounded-full border border-dashed border-[var(--border-strong)] flex items-center justify-center text-[var(--fg-muted)]">
              <Plus size={14} strokeWidth={2} />
            </span>
            <span className="text-[15px] text-[var(--fg-muted)]">{t('Add a habit')}</span>
          </button>
        )}

        {habits.length > 3 && (
          <button
            type="button"
            onClick={() => setHabitsModalOpen(true)}
            className="mt-2 h-11 text-[14px] text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            {t('See all {n}', { n: habits.length })}
          </button>
        )}
      </section>

      {/* 4. Active dream */}
      {targetItem ? (
        <button
          type="button"
          onClick={() => setActiveRoute('/app/dreams')}
          className="w-full bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 flex items-center gap-4 text-left"
        >
          <div className="w-16 h-16 shrink-0 rounded-[var(--radius-sm)] overflow-hidden">
            <DreamArt type={targetItem.illustrationKey} imageUrl={targetItem.customImageUrl} alt={t(targetItem.name)} />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[15px] font-semibold text-[var(--fg)] truncate">{t(targetItem.name)}</span>
              <span className="text-[13px] text-[var(--fg-muted)] shrink-0">{targetProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--border)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${targetProgress}%` }}
              />
            </div>
            <p className="text-[13px] text-[var(--fg-muted)]">
              {daysLeft === 0 ? t('Ready to claim') : t('~{n} days at your pace', { n: daysLeft })}
            </p>
          </div>
          <ChevronRight size={18} strokeWidth={1.8} className="shrink-0 text-[var(--fg-subtle)]" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setActiveRoute('/app/dreams')}
          className="w-full bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 flex items-center justify-between gap-4 text-left"
        >
          <span className="text-[15px] font-semibold text-[var(--fg)]">{t('Pick your first dream')}</span>
          <ChevronRight size={18} strokeWidth={1.8} className="shrink-0 text-[var(--fg-subtle)]" />
        </button>
      )}

      {/* Meditate & focus */}
      <button
        type="button"
        onClick={() => setActiveRoute('/app/focus')}
        className="w-full bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 flex items-center gap-4 text-left cursor-pointer hover:bg-[var(--bg-inset)] transition-colors"
      >
        <span className="w-11 h-11 rounded-full bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
          <AudioLines size={20} strokeWidth={1.8} className="text-[var(--accent)]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-[var(--fg)]">{t('Meditate & focus')}</span>
          <span className="block text-[13px] text-[var(--fg-muted)] truncate">
            {t('11 guided meditations · sound waves · focus timer')}
          </span>
        </span>
        <ChevronRight size={18} strokeWidth={1.8} className="shrink-0 text-[var(--fg-subtle)]" />
      </button>

      {/* 5. Daily rituals */}
      <section className="bg-[var(--bg-muted)] rounded-[var(--radius-md)]">
        <button
          type="button"
          onClick={toggleRituals}
          aria-expanded={ritualsOpen}
          className="w-full p-5 flex items-center justify-between gap-3 text-left"
        >
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Daily rituals')}</h2>
            {!ritualsOpen && (
              <p className="text-[13px] text-[var(--fg-muted)] truncate">
                {t('Meditate · check-in · reflection')}
              </p>
            )}
          </div>
          <ChevronDown
            size={20}
            strokeWidth={1.8}
            className={`shrink-0 text-[var(--fg-subtle)] transition-transform ${ritualsOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {ritualsOpen && (
          <div className="px-5 pb-5 space-y-4">
            <MeditateNowWidget />
            <DailyCheckIn />
            <DailyAffirmationWidget />
            <DailyDeepQuestion />
            <EveningDriftCheck />
            <MorningVision />
            <BackupReminder />
          </div>
        )}
      </section>

      {/* Modals */}
      <CompleteMissionModal
        mission={completingMission}
        isOpen={Boolean(completingMission)}
        onClose={() => setCompletingMission(null)}
        onConfirm={completeMission}
      />

      <Modal
        isOpen={habitsModalOpen}
        onClose={() => setHabitsModalOpen(false)}
        title={t('Small habits')}
        maxWidth="xl"
      >
        <DailyMicroHabits />
      </Modal>
    </div>
  );
};
