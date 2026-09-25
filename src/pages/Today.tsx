import React, { useEffect, useRef, useState } from 'react';
import { AudioLines, Check, ChevronDown, ChevronRight, Plus, MessageCircle, GraduationCap, Timer, Share2, Route } from 'lucide-react';
import { useApp } from '../store/useApp';
import { getDailyQuote } from '../data/dailyQuotes';
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
import { useT, formatDate, useLocale } from '../i18n';
import { designCopy } from '../i18n/design';
import { companionCopy } from '../i18n/companion';
import { DecisionPlanModal } from '../components/momentum/DecisionPlanModal';
import { TwoMinuteStart } from '../components/momentum/TwoMinuteStart';
import { MomentumCard, EvidenceStrip, SimpleModeNote, TwoWeekCheckIn, WeeklyReviewCard, WeeklyFocusNote } from '../components/momentum/TodayMomentum';
import { shareDecision } from '../components/momentum/shareDecision';
import { isSimpleMode, keptDecisions, twoWeekCheckInDue, weeklyFocus, weeklyReviewDue } from '../services/momentum';

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
  const { data, setActiveRoute, completeMission, setOneDecision, toggleMicroHabit, showToast } = useApp();
  const t = useT();
  const [locale] = useLocale();
  const c = companionCopy(locale);
  const d = designCopy(locale);

  const [completingMission, setCompletingMission] = useState<Mission | null>(null);
  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [ritualsOpen, setRitualsOpen] = useState<boolean>(readRitualsOpen);
  const [habitsModalOpen, setHabitsModalOpen] = useState(false);
  const [plan, setPlan] = useState<{ open: boolean; justSet?: boolean; smaller?: boolean }>({ open: false });
  const [startOpen, setStartOpen] = useState(false);

  // A new member's first decision comes from onboarding: offer the 30-second plan once.
  const mountedAt = useRef(new Date().toISOString());
  const firstPlanCandidate = data?.missions.find(
    // Decisions chosen on this page already open the plan themselves.
    (m) => m.isOneDecision && m.status === 'active' && !m.plan && m.createdAt < mountedAt.current
  );
  const firstWeek = data ? isSimpleMode(data) : false;
  useEffect(() => {
    if (!firstPlanCandidate || !firstWeek) return;
    try {
      if (localStorage.getItem('oda_plan_prompted') === firstPlanCandidate.id) return;
      localStorage.setItem('oda_plan_prompted', firstPlanCandidate.id);
    } catch { return; }
    const timer = window.setTimeout(() => setPlan({ open: true, justSet: true }), 700);
    return () => window.clearTimeout(timer);
  }, [firstPlanCandidate?.id, firstWeek]);

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
      // Right after choosing is the best moment to plan for the obstacle.
      setPlan({ open: true, justSet: true });
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

  const quote = getDailyQuote();
  const simple = isSimpleMode(data);
  const checkInDue = !simple && twoWeekCheckInDue(data);
  const reviewWeek = weeklyReviewDue(data);
  const focusChange = weeklyFocus(data);
  const keptCount = keptDecisions(data.missions).length;
  const decisionPlan = todayOneDecision?.plan;

  const handleShare = async () => {
    if (!todayOneDecision) return;
    const result = await shareDecision(t(todayOneDecision.title));
    if (result === 'copied') showToast(t('Copied. Send it to one person you trust.'), 'success');
    else if (result === 'failed') showToast(t('Sharing isn’t available here.'), 'error');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] text-[var(--fg-muted)]">{dateLine}</p>
          <h1 className="oda-display text-[30px] sm:text-[34px] tracking-tight text-[var(--fg)] leading-tight">
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

      <MomentumCard
        decisionOpen={!decisionDone}
        hasDecision={Boolean(todayOneDecision)}
        onMakeSmaller={() => setPlan({ open: true, smaller: true })}
        onChoose={() => document.getElementById('today-decision-input')?.focus()}
      />

      {/* 2. One decision */}
      <section
        id="set-one-decision"
        className="oda-decision p-6 sm:p-8 space-y-5"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="oda-kicker opacity-90">{t("Today's one decision")}</span>
          {decisionStreak.currentStreak > 0 && (
            <span className="text-[13px] opacity-70">{decisionStreak.currentStreak === 1 ? t('1 day') : t('{n} days', { n: decisionStreak.currentStreak })}</span>
          )}
        </div>

        {todayOneDecision ? (
          <>
            <p className="oda-display text-[30px] sm:text-[34px] leading-snug break-words">{t(todayOneDecision.title)}</p>
            {decisionPlan?.ifThen && !decisionDone && (
              <button type="button" onClick={() => setPlan({ open: true })} className="oda-decision-plan w-full text-left px-4 py-3 space-y-0.5">
                <span className="block text-[13px] font-semibold opacity-75">
                  {decisionPlan.obstacle ? t('If {obstacle}', { obstacle: decisionPlan.obstacle }) : t('If it gets hard')}
                </span>
                <span className="block text-[15px] leading-snug">{t('then I will {plan}', { plan: decisionPlan.ifThen })}</span>
              </button>
            )}
            {decisionDone ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 text-[15px] opacity-80">
                  <span className="w-6 h-6 rounded-full bg-[var(--bg)] text-[var(--fg)] flex items-center justify-center">
                    <Check size={14} strokeWidth={2.2} />
                  </span>
                  <span>{t('Done for today · +D$ {amount}', { amount: earnedAmount.toLocaleString() })}</span>
                </div>
                <p className="text-[14px] opacity-75">{t('That’s proof #{n} that you keep your word.', { n: keptCount })}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStartOpen(true)}
                    className="oda-decision-action w-full h-12 rounded-[var(--radius-sm)] font-semibold text-[15px] inline-flex items-center justify-center gap-2"
                  >
                    <Timer size={18} strokeWidth={2} />
                    {t('Start · just 2 minutes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompletingMission(todayOneDecision)}
                    className="oda-decision-secondary w-full h-12 rounded-[var(--radius-sm)] font-semibold text-[15px]"
                  >
                    {t('Done · +D$ {amount}', { amount: ECONOMY_CONSTANTS.ONE_DECISION_REWARD.toLocaleString() })}
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-5">
                  {!decisionPlan?.ifThen && (
                    <button type="button" onClick={() => setPlan({ open: true })} className="oda-decision-link inline-flex items-center gap-1.5">
                      <Route size={15} />{t('Plan for obstacles · 30 sec')}
                    </button>
                  )}
                  <button type="button" onClick={() => void handleShare()} className="oda-decision-link inline-flex items-center gap-1.5">
                    <Share2 size={15} />{t('Tell one person')}
                  </button>
                </div>
              </div>
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
              className="oda-decision-action w-full h-12 rounded-[var(--radius-sm)] font-semibold text-[15px] disabled:opacity-40"
            >
              {t('Set decision')}
            </button>
          </form>
        )}
      </section>

      {focusChange && <WeeklyFocusNote change={focusChange} />}
      <EvidenceStrip />
      {reviewWeek && <WeeklyReviewCard weekKey={reviewWeek} />}
      {checkInDue && !reviewWeek && <TwoWeekCheckIn />}

      {/* 3. Three small habits */}
      <section className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] p-5">
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

      {/* Quote of the day */}
      <figure className="oda-quote flex gap-3 py-6">
        <span aria-hidden="true" className="oda-quote-mark text-5xl">“</span>
        <div className="min-w-0">
          <p className="oda-kicker text-[var(--fg-muted)] mb-2">{d.quote}</p>
          <blockquote className="oda-display text-[22px] leading-snug text-[var(--fg)] max-w-[46ch]">
            {locale === 'tr' && quote.tr ? quote.tr : t(quote.text)}
          </blockquote>
          {quote.source && (
            <figcaption className="mt-1 text-[12px] font-medium text-[var(--fg-muted)]">
              — {quote.sourceUrl ? <a href={quote.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{locale === 'tr' && quote.sourceTr ? quote.sourceTr : t(quote.source)}</a> : t(quote.source)}
              {quote.kind && <span className="block mt-1 font-normal">{quote.kind === 'adaptation' ? c.adaptation : c.translation}</span>}
            </figcaption>
          )}
        </div>
      </figure>

      {simple ? <SimpleModeNote /> : <>
      <section aria-labelledby="today-discover" className="space-y-3">
        <h2 id="today-discover" className="text-sm font-semibold">{d.discover}</h2>
        <button type="button" onClick={() => setActiveRoute('/app/courses')} className="oda-discovery-link w-full flex items-center gap-4 text-left py-5 border-y border-[var(--border)]">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--brand-burgundy-soft)] text-[var(--brand-burgundy)]"><GraduationCap size={24} strokeWidth={1.5} /></span><span><span className="block text-base font-semibold">{c.courses}</span><span className="block text-xs leading-relaxed text-[var(--fg-muted)] mt-1">{c.courseHint}</span></span><ChevronRight size={18} className="ml-auto shrink-0" />
        </button>
        <button type="button" onClick={() => setActiveRoute('/app/coach')} className="oda-discovery-link w-full flex items-center gap-4 text-left py-4 border-b border-[var(--border)]">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"><MessageCircle size={22} strokeWidth={1.6} /></span><span className="text-base font-semibold">{c.talk}</span><ChevronRight size={18} className="ml-auto shrink-0" />
        </button>
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

      </>}

      {/* Modals */}
      <DecisionPlanModal
        mission={todayOneDecision ?? null}
        isOpen={plan.open && Boolean(todayOneDecision)}
        justSet={plan.justSet}
        initialFeeling={plan.smaller ? 'overwhelming' : undefined}
        onClose={() => setPlan({ open: false })}
      />
      <TwoMinuteStart
        mission={todayOneDecision ?? null}
        isOpen={startOpen && Boolean(todayOneDecision)}
        onClose={() => setStartOpen(false)}
        onDone={() => todayOneDecision && setCompletingMission(todayOneDecision)}
      />
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
