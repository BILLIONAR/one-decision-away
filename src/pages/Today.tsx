import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, AudioLines, Check, ChevronDown, ChevronRight, Leaf, Plus, MessageCircle, GraduationCap, Route, Share2, Waves } from 'lucide-react';
import { GrowthTreePanel, GrowthWeek } from '../components/momentum/GrowthDashboard';
import { OriginalSceneImage } from '../components/OriginalSceneImage';
import { growthCopy } from '../i18n/growth';
import { courseCatalogFor } from '../data/courseCatalog';
import { courseForIntent } from '../data/starterDecisions';
import { useSavedCourseProgress } from '../hooks/useSavedCourseProgress';
import { timerFocusEvidence } from '../services/focusEvidence';
import { dashboardHybridCopy } from '../i18n/dashboardHybrid';
import { useApp } from '../store/useApp';
import { getDailyQuote } from '../data/dailyQuotes';
import { Modal } from '../components/ui';
import { CompleteMissionModal } from '../components/MissionFlows';
import { DreamArt } from '../components/DreamArt';
import { DailyMicroHabits } from '../components/DailyMicroHabits';
import { MeditateNowWidget } from '../components/MeditateNowWidget';
import { DailyCheckIn } from '../components/DailyCheckIn';
import { ArrivalCheckIn } from '../components/today/ArrivalCheckIn';
import { DailyPractice, DailyReflection } from '../components/today/DailyPractice';
import { WeeklyOutcomeReview } from '../components/today/WeeklyOutcomeReview';
import { CourseNextStep } from '../components/today/CourseNextStep';
import { availableReviewWeek, todayDecision } from '../services/dailyLoop';
import { dailyLoopCopy } from '../i18n/dailyLoop';
import '../styles/dailyLoop.css';
import { DailyAffirmationWidget } from '../components/DailyAffirmationWidget';
import { DailyDeepQuestion } from '../components/DailyDeepQuestion';
import { EveningDriftCheck } from '../components/TwoFuturesPulseWidgets';
import { MorningVision } from '../components/MorningVision';
import { BackupReminder } from '../components/BackupReminder';
import { SEED_MARKET_ITEMS } from '../data/seed';
import {
  computeLedgerBalance,
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
import { MomentumCard, EvidenceStrip, SimpleModeNote, TwoWeekCheckIn } from '../components/momentum/TodayMomentum';
import { shareDecision } from '../components/momentum/shareDecision';
import { decisionChain, evidenceSummary, isSimpleMode, keptDecisions, localDayKey, twoWeekCheckInDue } from '../services/momentum';
import { EasyDecisionChips, KeptMomentCard } from '../components/momentum/FirstSteps';
import { easyDecisions } from '../data/starterDecisions';
import { firstRunCopy } from '../i18n/firstRun';
import { sentenceCaseLabel } from '../utils/sentenceCaseLabel';
import '../styles/workingSurfaces.css';
import '../styles/todayPalette.css';

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
  const loop = dailyLoopCopy(locale);
  const growth = growthCopy(locale);
  const hybrid = dashboardHybridCopy(locale);
  const courseProgress = useSavedCourseProgress(data);

  const [completingMission, setCompletingMission] = useState<Mission | null>(null);
  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [decisionError, setDecisionError] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const update = () => setNow(new Date());
    const timer = window.setInterval(update, 60_000);
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update); };
  }, []);
  const [ritualsOpen, setRitualsOpen] = useState<boolean>(readRitualsOpen);
  const [habitsModalOpen, setHabitsModalOpen] = useState(false);
  const [plan, setPlan] = useState<{ open: boolean; justSet?: boolean; smaller?: boolean }>({ open: false });
  const [startOpen, setStartOpen] = useState(false);

  if (!data) return null;

  const balance = computeLedgerBalance(data.transactions);
  const todayStr = localDayKey(now);
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

  const todayOneDecision = todayDecision(data.missions, now);
  const decisionDone = todayOneDecision?.status === 'completed';
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
    setDecisionError(false);
    try {
      await setOneDecision(title);
      setNewDecisionTitle('');
    } catch {
      setDecisionError(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Micro-habits
  const habits = data.microHabits || [];
  const visibleHabits = habits.slice(0, 3);
  const allHabitsDone = habits.filter(habit => habit.completedDates.includes(todayStr)).length;

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
  const reviewWeek = availableReviewWeek(now);
  const keptCount = keptDecisions(data.missions).length;
  const chain = decisionChain(data.missions);
  const week = evidenceSummary(data.missions, now);
  const catalog = courseCatalogFor(locale);
  const allLessonIds = new Set(catalog.flatMap(course => course.lessonIds));
  const completedLessons = [...allLessonIds].filter(id => courseProgress.lessons[id]?.completed === true).length;
  const coursePercent = Math.round(completedLessons / Math.max(1, allLessonIds.size) * 100);
  const focusEvidence = timerFocusEvidence(data.completions, now);
  const maximumFocusMinutes = Math.max(1, ...focusEvidence.days.map(day => day.minutes));
  const suggestedCourse = courseCatalogFor(locale).find(c => c.id === courseForIntent(data.profile.intent));
  const draftForToday = data.profile.nextDecisionDraft?.forDay === localDayKey() ? data.profile.nextDecisionDraft.text : null;
  const pickSuggestion = (title: string) => {
    setNewDecisionTitle(title);
    document.getElementById('today-decision-input')?.focus();
  };
  const quickSetDecision = async (title: string) => {
    if (isSaving) return;
    setIsSaving(true);
    setDecisionError(false);
    try { await setOneDecision(title); } catch { setDecisionError(true); } finally { setIsSaving(false); }
  };
  const decisionPlan = todayOneDecision?.plan;

  const handleShare = async () => {
    if (!todayOneDecision) return;
    const result = await shareDecision(t(todayOneDecision.title));
    if (result === 'copied') showToast(t('Copied. Send it to one person you trust.'), 'success');
    else if (result === 'failed') showToast(t('Sharing isn’t available here.'), 'error');
  };

  return (
    <div className="oda-reference-today oda-fidelity-today space-y-6">
      {/* 1. Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] text-[var(--fg-muted)]">{dateLine}</p>
          <p className="text-[14px] text-[var(--fg-muted)] mt-1">{greeting}</p>
          <h1 className="oda-display oda-today-headline">{growth.headline}</h1>
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

      <div className="oda-fidelity-command">
      {/* The quote has its own scene; the saved growth stage appears once in its evidence panel. */}
      <figure className="oda-quote oda-fidelity-hero">
        <div className="oda-fidelity-scene oda-fidelity-scene--original" aria-hidden="true"><OriginalSceneImage asset="today-scene" sizes="(max-width: 479px) calc(100vw - 40px), (max-width: 1179px) calc(100vw - 80px), 1024px" eager fallback="assets/oda/course-covers/oda-growth-values.png" /></div>
        <span aria-hidden="true" className="oda-quote-mark text-5xl">“</span>
        <div className="oda-fidelity-hero-copy min-w-0">
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

      <div className="oda-growth-dashboard">
        <div className="oda-growth-actions">
      {/* 2. One decision: a soft card with this week's ring, one clear action and a check. */}
      <div className="oda-fidelity-decision-module">
      <section id="set-one-decision" className="oda-decision" aria-labelledby="today-decision-label">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="flex items-baseline justify-between gap-2">
              <span id="today-decision-label" className="oda-kicker text-[var(--brand-burgundy)]">{todayOneDecision?.status === 'active' && todayOneDecision.scheduledFor && todayOneDecision.scheduledFor < todayStr ? loop.carry : t("Today's one decision")}</span>
              {chain.days > 0 && (
                <span className="text-[12px] text-[var(--fg-muted)] whitespace-nowrap" title={t('Your chain: one missed day a week is forgiven, two in a row start a new chain.')}>
                  {chain.days === 1 ? t('1 day') : t('{n} days', { n: chain.days })}
                </span>
              )}
            </p>
            {todayOneDecision
              ? <p className={`oda-decision-text ${decisionDone ? 'is-kept' : ''}`}>{t(todayOneDecision.title)}</p>
              : <p className="oda-decision-text text-[var(--fg-muted)]">{t('What would make today count?')}</p>}
          </div>
        </div>

        {todayOneDecision ? (
          <>
            {decisionPlan?.ifThen && !decisionDone && (
              <button type="button" onClick={() => setPlan({ open: true })} className="oda-decision-plan">
                <span className="block text-[13px] text-[var(--fg-muted)]">
                  {decisionPlan.obstacle ? t('If {obstacle}', { obstacle: decisionPlan.obstacle }) : t('If it gets hard')}
                </span>
                <span className="block text-[15px] leading-snug text-[var(--fg)]">{sentenceCaseLabel(t('then I will {plan}', { plan: decisionPlan.ifThen }), locale)}</span>
              </button>
            )}
            {decisionDone ? (
              <div className="oda-decision-kept">
                <span className="oda-decision-seal" aria-hidden="true"><Check size={15} strokeWidth={2.4} /></span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-[var(--fg)]">{t('Kept today')} <span className="font-normal text-[var(--fg-muted)]">· +D$ {earnedAmount.toLocaleString()}</span></p>
                  <p className="text-[14px] text-[var(--fg-muted)]">{t('That’s proof #{n} that you keep your word.', { n: keptCount })}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStartOpen(true)} className="oda-decision-action oda-btn-primary">
                    <span>{t('Start · just 2 minutes')}</span>
                    <span className="oda-decision-action-arrow" aria-hidden="true"><ArrowRight size={18} strokeWidth={2} /></span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompletingMission(todayOneDecision)}
                    aria-label={t('Done · +D$ {amount}', { amount: ECONOMY_CONSTANTS.ONE_DECISION_REWARD.toLocaleString() })}
                    className="oda-decision-done"
                  >
                    <Check size={22} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </div>
                <p className="text-[12.5px] text-[var(--fg-muted)] px-1">{t('Did it? Tap the check · +D$ {amount}', { amount: ECONOMY_CONSTANTS.ONE_DECISION_REWARD.toLocaleString() })}</p>
                {!decisionPlan?.ifThen && <button type="button" onClick={() => setPlan({ open: true })} className="min-h-11 inline-flex items-center gap-2 text-[13px] text-[var(--fg-muted)] underline underline-offset-4"><Route size={16} aria-hidden="true" />{firstRunCopy(locale).optionalPlan}</button>}
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
              onChange={(e) => { setNewDecisionTitle(e.target.value); setDecisionError(false); }}
              maxLength={160}
              placeholder={t('Write it in a few words…')}
              className="oda-decision-input"
            />
            <button type="submit" disabled={!newDecisionTitle.trim() || isSaving} className="oda-decision-action oda-btn-primary w-full justify-center disabled:opacity-40">
              {t('Set decision')}
            </button>
            {!newDecisionTitle.trim() && (
              draftForToday
                ? <EasyDecisionChips options={[draftForToday]} onPick={pickSuggestion} label={t('You chose this last night')} />
                : <EasyDecisionChips options={easyDecisions(data.profile.intent)} onPick={pickSuggestion} label={t('Or start with something easy')} />
            )}
          </form>
        )}
      </section>
      {decisionError && <p role="alert" className="oda-loop-error">{loop.saveError}</p>}
      </div>
          <section className="oda-hybrid-progress oda-hybrid-card" aria-labelledby="today-library-progress">
            <h2 id="today-library-progress">{hybrid.progress}</h2>
            <div className="oda-hybrid-progress-summary">
              <div className="oda-hybrid-ring" style={{ '--progress': `${coursePercent}%` } as React.CSSProperties} role="progressbar" aria-label={hybrid.progress} aria-valuemin={0} aria-valuemax={allLessonIds.size} aria-valuenow={completedLessons}>
                <span aria-hidden="true">{coursePercent}%</span>
              </div>
              <div><p>{hybrid.lessons(completedLessons, allLessonIds.size)}</p><p className="oda-hybrid-help">{hybrid.progressHint}</p></div>
            </div>
            <dl className="oda-hybrid-metrics"><div><dt>{hybrid.keptDays}</dt><dd>{week.last7} / 7</dd></div><div><dt>{hybrid.habits}</dt><dd>{allHabitsDone} / {habits.length}</dd></div></dl>
          </section>
          <GrowthTreePanel count={keptCount} onEvidence={() => setActiveRoute('/app/evidence')} />
          <section className="oda-hybrid-focus oda-hybrid-card" aria-labelledby="today-timer-streak">
            <h2 id="today-timer-streak">{hybrid.focus}</h2>
            <p className="oda-hybrid-streak-value">{hybrid.days(focusEvidence.streak)}</p>
            <p className="oda-hybrid-help">{hybrid.utc}</p>
            <ol className="oda-hybrid-focus-days">{focusEvidence.days.map(day => <li key={day.dayKey} aria-label={`${day.dayKey} UTC: ${day.minutes} min`} data-focus-day-minutes={day.minutes}>
              <span className="oda-hybrid-focus-bar" aria-hidden="true"><span style={{ height: `${day.minutes / maximumFocusMinutes * 100}%` }} /></span>
              <span aria-hidden="true">{formatDate(`${day.dayKey}T12:00:00Z`, { weekday: 'narrow', timeZone: 'UTC' })}</span>
            </li>)}</ol>
            <p className="oda-hybrid-help">{focusEvidence.streak > 0 || focusEvidence.todayMinutes > 0 ? hybrid.focusToday(Number(focusEvidence.todayMinutes.toFixed(1))) : hybrid.focusEmpty}</p>
            <button type="button" onClick={() => setActiveRoute('/app/focus')} className="oda-hybrid-link">{hybrid.openFocus}<ArrowRight size={16} aria-hidden="true" /></button>
          </section>
          <section className="oda-hybrid-actions oda-hybrid-card" aria-labelledby="today-real-actions">
            <div className="oda-hybrid-heading"><h2 id="today-real-actions">{hybrid.actions}</h2><button type="button" onClick={() => setHabitsModalOpen(true)} className="oda-hybrid-link">{hybrid.viewAll}<ChevronRight size={15} aria-hidden="true" /></button></div>
            <ul>
              <li>{todayOneDecision ? <button type="button" disabled={decisionDone} onClick={() => setCompletingMission(todayOneDecision)} aria-label={`${decisionDone ? t('Kept today') : hybrid.confirm}: ${t(todayOneDecision.title)}`} className="oda-hybrid-action" data-done={decisionDone}>
                <span className="oda-hybrid-check" aria-hidden="true">{decisionDone && <Check size={15} />}</span><span>{t(todayOneDecision.title)}</span>
              </button> : <button type="button" onClick={() => { document.getElementById('today-decision-input')?.focus(); }} className="oda-hybrid-action"><Plus size={18} aria-hidden="true" /><span>{hybrid.choose}</span></button>}</li>
              {visibleHabits.map(habit => { const done = habit.completedDates.includes(todayStr); return <li key={habit.id}><button type="button" onClick={() => toggleMicroHabit(habit.id)} aria-pressed={done} className="oda-hybrid-action" data-done={done}><span className="oda-hybrid-check" aria-hidden="true">{done && <Check size={15} />}</span><span>{t(habit.title)}</span></button></li>; })}
              {habits.length === 0 && <li><button type="button" onClick={() => setHabitsModalOpen(true)} className="oda-hybrid-action"><Plus size={18} aria-hidden="true" /><span>{hybrid.addHabit}</span></button></li>}
            </ul>
          </section>
          <CourseNextStep />
        </div>
      </div>
      </div>
      <BackupReminder />

      <div className="oda-fidelity-support">
      <GrowthWeek summary={week} onEvidence={() => setActiveRoute('/app/evidence')} />
      <DailyPractice mission={todayOneDecision} dayKey={todayStr} />

      <MomentumCard
        decisionOpen={!decisionDone}
        hasDecision={Boolean(todayOneDecision)}
        onMakeSmaller={() => setPlan({ open: true, smaller: true })}
        onChoose={() => document.getElementById('today-decision-input')?.focus()}
        onPickEasy={(title) => void quickSetDecision(title)}
      />


      <ArrivalCheckIn
        decisionState={!todayOneDecision ? 'none' : decisionDone ? 'done' : 'open'}
        onTwoMinute={() => setStartOpen(true)}
        onChooseDecision={() => document.getElementById('today-decision-input')?.focus()}
        onSoundRoom={() => setActiveRoute('/app/sound')}
        onCourse={() => setActiveRoute('/app/courses')}
        courseTitle={suggestedCourse?.title}
      />

      {/* Quick actions: four tinted tiles */}
      <nav aria-label={t('Quick actions')} className="oda-fidelity-shortcuts grid grid-cols-2 gap-2.5">
        {todayOneDecision && !decisionDone && !decisionPlan?.ifThen ? (
          <button type="button" onClick={() => setPlan({ open: true })} className="oda-tile">
            <span className="oda-tile-icon oda-tint-sage"><Route size={18} strokeWidth={1.9} aria-hidden="true" /></span>
            <span><span className="block text-[14px] font-semibold">{t('Plan for obstacles')}</span><span className="block text-[12px] text-[var(--fg-muted)]">{t('30 seconds')}</span></span>
          </button>
        ) : (
          <button type="button" onClick={() => setActiveRoute('/app/evidence')} className="oda-tile">
            <span className="oda-tile-icon oda-tint-sage"><Leaf size={18} strokeWidth={1.9} aria-hidden="true" /></span>
            <span><span className="block text-[14px] font-semibold">{t('Your evidence')}</span><span className="block text-[12px] text-[var(--fg-muted)]">{keptCount === 1 ? t('1 kept promise') : t('{n} kept promises', { n: keptCount })}</span></span>
          </button>
        )}
        {todayOneDecision ? (
          <button type="button" onClick={() => void handleShare()} className="oda-tile">
            <span className="oda-tile-icon oda-tint-rose"><Share2 size={18} strokeWidth={1.9} aria-hidden="true" /></span>
            <span><span className="block text-[14px] font-semibold">{t('Tell one person')}</span><span className="block text-[12px] text-[var(--fg-muted)]">{t('A promise said out loud holds')}</span></span>
          </button>
        ) : (
          <button type="button" onClick={() => setActiveRoute('/app/coach')} className="oda-tile">
            <span className="oda-tile-icon oda-tint-rose"><MessageCircle size={18} strokeWidth={1.9} aria-hidden="true" /></span>
            <span><span className="block text-[14px] font-semibold">{t('Think it through')}</span><span className="block text-[12px] text-[var(--fg-muted)]">{t('With the coach')}</span></span>
          </button>
        )}
        <button type="button" onClick={() => setActiveRoute('/app/sound')} className="oda-tile">
          <span className="oda-tile-icon oda-tint-blue"><Waves size={18} strokeWidth={1.9} aria-hidden="true" /></span>
          <span><span className="block text-[14px] font-semibold">{t('Sound Room')}</span><span className="block text-[12px] text-[var(--fg-muted)]">{t('Calm, focus, sleep')}</span></span>
        </button>
        <button type="button" onClick={() => setActiveRoute('/app/courses')} className="oda-tile">
          <span className="oda-tile-icon oda-tint-sand"><GraduationCap size={18} strokeWidth={1.9} aria-hidden="true" /></span>
          <span><span className="block text-[14px] font-semibold">{suggestedCourse ? suggestedCourse.title : t('Guided courses')}</span><span className="block text-[12px] text-[var(--fg-muted)]">{t('A short lesson')}</span></span>
        </button>
      </nav>

      {decisionDone && <KeptMomentCard />}
      <DailyReflection key={todayStr} mission={todayOneDecision} dayKey={todayStr} />
      <WeeklyOutcomeReview key={reviewWeek} weekKey={reviewWeek} />
      <EvidenceStrip />
      {checkInDue && <TwoWeekCheckIn />}

      {simple ? <SimpleModeNote /> : <>
      <section aria-labelledby="today-discover" className="space-y-3">
        <h2 id="today-discover" className="text-sm font-semibold">{d.discover}</h2>
        <button type="button" onClick={() => setActiveRoute('/app/coach')} className="oda-discovery-link w-full flex items-center gap-4 text-left py-4 border-b border-[var(--border)]">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]"><MessageCircle size={22} strokeWidth={1.6} /></span><span className="text-base font-semibold">{c.talk}</span><ChevronRight size={18} className="ml-auto shrink-0" />
        </button>
      </section>

      {/* 4. Active dream */}
      {targetItem ? (
        <button
          type="button"
          onClick={() => setActiveRoute('/app/dreams')}
          className="w-full oda-card rounded-[var(--radius-lg)] p-5 flex items-center gap-4 text-left"
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
          className="w-full oda-card rounded-[var(--radius-lg)] p-5 flex items-center justify-between gap-4 text-left"
        >
          <span className="text-[15px] font-semibold text-[var(--fg)]">{t('Pick your first dream')}</span>
          <ChevronRight size={18} strokeWidth={1.8} className="shrink-0 text-[var(--fg-subtle)]" />
        </button>
      )}

      {/* Meditate & focus */}
      <button
        type="button"
        onClick={() => setActiveRoute('/app/focus')}
        className="w-full oda-card rounded-[var(--radius-lg)] p-5 flex items-center gap-4 text-left cursor-pointer hover:bg-[var(--bg-inset)] transition-colors"
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
          </div>
        )}
      </section>

      </>}
      </div>

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
