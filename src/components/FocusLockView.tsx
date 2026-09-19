import React, { useState, useEffect } from 'react';
import { useApp } from '../store/useApp';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Flame,
  ShieldCheck,
  Brain,
  CloudRain,
  Waves,
  Wind,
  Flame as FireIcon,
  Headphones,
  Plus,
  Send,
  X,
  Clock,
  Bell,
  Eye,
  Activity,
  Heart,
  Sun,
  Radio,
  Mic,
  MicOff,
} from 'lucide-react';
import { FocusSoundTrack } from '../types/models';
import { getBaseReward } from '../services/economy';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { voiceGuide } from '../utils/voiceGuide';
import { getGuidedMeditation, INTENT_LABELS } from '../data/guidedMeditations';
import { useT } from '../i18n';

export const FocusLockView: React.FC = () => {
  const t = useT();
  const {
    data,
    activeFocusSession,
    activeGuidedCueIndex,
    pauseFocusSession,
    resumeFocusSession,
    setFocusSoundTrack,
    setFocusVolume,
    addDistractionNote,
    cancelFocusSession,
    finishFocusSessionEarly,
    completeFocusSession,
    toggleFocusTabBlink,
    toggleFocusScreenPulse,
  } = useApp();

  const [distractionInput, setDistractionInput] = useState('');
  const [showAbortModal, setShowAbortModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [bowlRang, setBowlRang] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(voiceGuide.isEnabled());
  const [voiceVolume, setVoiceVolume] = useState<number>(voiceGuide.getVolume());
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => voiceGuide.onSpeakingChange(setIsSpeaking), []);

  // Reflection form state when finished
  const [completedSummary, setCompletedSummary] = useState('');
  const [resistanceNoticed, setResistanceNoticed] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Box Breathing cycle (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
  useEffect(() => {
    if (!showBreathingGuide) return;
    const interval = setInterval(() => {
      setBreathingPhase((prev) => {
        if (prev === 'inhale') return 'hold1';
        if (prev === 'hold1') return 'exhale';
        if (prev === 'exhale') return 'hold2';
        return 'inhale';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [showBreathingGuide]);

  if (!activeFocusSession) return null;

  const {
    missionTitle,
    durationMinutes,
    remainingSeconds,
    totalSeconds,
    isPaused,
    soundTrack,
    volume,
    distractionNotes,
    missionId,
  } = activeFocusSession;

  const isCompleted = remainingSeconds <= 0;
  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progressPct = Math.min(100, Math.max(0, (elapsedSeconds / totalSeconds) * 100));

  const guidedMeditation = getGuidedMeditation(activeFocusSession.guidedMeditationId);
  const isGuided = !!guidedMeditation;
  const currentCue =
    guidedMeditation && activeGuidedCueIndex >= 0 ? guidedMeditation.cues[activeGuidedCueIndex] : null;
  const nextCue =
    guidedMeditation && activeGuidedCueIndex + 1 < guidedMeditation.cues.length
      ? guidedMeditation.cues[activeGuidedCueIndex + 1]
      : null;
  const voiceSupported = voiceGuide.isAvailable();

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    voiceGuide.setEnabled(next);
    setVoiceEnabled(next);
  };

  const handleVoiceVolume = (v: number) => {
    voiceGuide.setVolume(v);
    setVoiceVolume(v);
  };

  const handleReplayCue = () => {
    if (currentCue) voiceGuide.speak(t(currentCue.text));
  };

  const isMeditation =
    isGuided ||
    durationMinutes <= 8 ||
    soundTrack === 'meditation_432hz' ||
    soundTrack === 'solfeggio_528hz' ||
    soundTrack === 'theta_meditation' ||
    soundTrack === 'tibetan_bowls' ||
    soundTrack === 'solfeggio_396hz' ||
    soundTrack === 'solfeggio_639hz';

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distractionInput.trim()) return;
    addDistractionNote(distractionInput.trim());
    setDistractionInput('');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleRingBowl = () => {
    soundSynthesizer.triggerSingingBowlTone(260, 6.0);
    setBowlRang(true);
    setTimeout(() => setBowlRang(false), 1500);
  };

  const soundTracks: { id: FocusSoundTrack; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'meditation_432hz', label: t('432 Hz Healing'), icon: Sparkles },
    { id: 'solfeggio_528hz', label: t('528 Hz Miracle'), icon: Heart },
    { id: 'theta_meditation', label: t('Theta 6 Hz'), icon: Brain },
    { id: 'tibetan_bowls', label: t('Tibetan Bowls'), icon: Bell },
    { id: 'solfeggio_396hz', label: t('396 Hz Release'), icon: Flame },
    { id: 'solfeggio_639hz', label: t('639 Hz Harmony'), icon: Sun },
    { id: 'binaural', label: t('Binaural Alpha'), icon: Headphones },
    { id: 'rain', label: t('Gentle Rain'), icon: CloudRain },
    { id: 'waves', label: t('Ocean'), icon: Waves },
    { id: 'brown_noise', label: t('Deep Noise'), icon: Wind },
    { id: 'fireplace', label: t('Fireplace'), icon: FireIcon },
    { id: 'silence', label: t('Silence'), icon: VolumeX },
  ];

  // Linked mission lookup
  const linkedMission = missionId ? data?.missions.find((m) => m.id === missionId) : null;
  const rewardD$ = linkedMission
    ? getBaseReward(linkedMission.type, linkedMission.difficulty, linkedMission.isOneDecision)
    : Math.min(300, Math.max(60, Math.round(durationMinutes * 4)));

  const handleFinalClaim = async () => {
    setIsSubmitting(true);
    try {
      await completeFocusSession({
        completedSummary: completedSummary.trim() || t('Deep Work completed: {title}', { title: missionTitle }),
        resistanceNoticed:
          resistanceNoticed.trim() ||
          (distractionNotes.length > 0
            ? t('Captured {n} thoughts in distraction parking lot.', { n: distractionNotes.length })
            : t('Sustained unbroken attention throughout session.')),
        nextStep: nextStep.trim() || t('Review outcomes and maintain daily standard.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fill reflection if not set
  if (isCompleted && !completedSummary && missionTitle) {
    setCompletedSummary(t('Finished: {title}', { title: missionTitle }));
  }

  const tabBlinkEnabled = data?.profile?.focusTabBlinkEnabled !== false;
  const screenPulseEnabled = data?.profile?.focusScreenPulseEnabled !== false;

  return (
    <div
      id="focus-lock-viewport"
      className="fixed inset-0 z-50 bg-[var(--bg)] text-[var(--fg)] flex flex-col justify-between overflow-y-auto selection:bg-[var(--color-sage)] selection:text-white animate-in fade-in duration-300"
    >
      {/* Visual Screen Alert: Subtle Pulsing Screen Border when Timer reaches 0 */}
      {isCompleted && screenPulseEnabled && (
        <div
          id="focus-completed-screen-pulse"
          className="fixed inset-0 pointer-events-none z-40 border-4 sm:border-8 border-transparent animate-focus-screen-pulse"
          aria-hidden="true"
        />
      )}

      {/* Background Zen Ambience Accent */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--color-sage)]/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[var(--color-coral)]/10 rounded-full blur-3xl" />
      </div>

      {/* Top Focus Bar: Lock Status, Identity Anchor & Controls */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1 bg-[var(--color-slate)] text-white text-[11px] font-bold uppercase tracking-widest rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {t('Focus Lock Active')}
          </span>
          {isPaused && (
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider rounded-md">
              {t('Timer Paused')}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? t('Exit Fullscreen') : t('Enter Fullscreen')}
            className="p-2 rounded-[var(--radius-sm)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setShowAbortModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-[var(--fg-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-[var(--radius-sm)] border border-[var(--border)] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>{t('End Early')}</span>
          </button>
        </div>
      </header>

      {/* Center Focus Chamber */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-6 py-6 flex-1 flex flex-col items-center justify-center text-center">
        {!isCompleted ? (
          <div className="w-full max-w-2xl space-y-8 animate-in zoom-in-95 duration-200">
            {/* Mission / Target Intention Card */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] text-xs font-semibold text-[var(--color-sage)]">
                <Brain className="w-3.5 h-3.5" />
                <span>{isGuided ? t('Guided Meditation • {intent}', { intent: t(INTENT_LABELS[guidedMeditation!.intent]) }) : t('Current Deep Work Intention')}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold font-display tracking-tight text-[var(--fg)] leading-tight">
                {missionTitle}
              </h1>
              {linkedMission?.isOneDecision && (
                <div className="inline-block mt-1 px-3 py-0.5 bg-[var(--color-coral)]/15 text-[var(--color-coral)] text-xs font-bold uppercase tracking-wider rounded-md">
                  {t("★ Today's One Decision Milestone")}
                </div>
              )}
            </div>

            {/* Meditation & Breathing Controls Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowBreathingGuide(!showBreathingGuide)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  showBreathingGuide
                    ? 'bg-[var(--color-sage)] text-white border-[var(--color-sage)] shadow-xs'
                    : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{t('Box Breathing (4-4-4-4): {state}', { state: showBreathingGuide ? t('On') : t('Off') })}</span>
              </button>

              <button
                type="button"
                onClick={handleRingBowl}
                title={t('Ring a Tibetan singing bowl to return to the present moment')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  bowlRang
                    ? 'bg-[var(--color-coral)] text-white border-[var(--color-coral)] scale-105'
                    : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)]'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>{bowlRang ? t('🔔 Ringing…') : t('Ring Tibetan Bowl')}</span>
              </button>

              {isMeditation && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--color-sage)]/15 text-[var(--color-sage)] border border-[var(--color-sage)]/30">
                  {t('🧘 Meditation tuning active')}
                </span>
              )}
            </div>

            {/* Visual Box Breathing Pacer */}
            {showBreathingGuide && (
              <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--color-sage)]/30 rounded-[var(--radius-md)] flex flex-col items-center justify-center text-center space-y-3 animate-in fade-in zoom-in-95 duration-300 shadow-xs">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-3000 ease-in-out ${
                      breathingPhase === 'inhale'
                        ? 'scale-125 bg-[var(--color-sage)]/25 border-2 border-[var(--color-sage)]'
                        : breathingPhase === 'hold1'
                        ? 'scale-125 bg-[var(--color-sage)]/35 border-2 border-[var(--color-sage)]'
                        : breathingPhase === 'exhale'
                        ? 'scale-75 bg-[var(--color-sage)]/15 border-2 border-[var(--border)]'
                        : 'scale-75 bg-[var(--bg-muted)] border-2 border-[var(--border)]'
                    }`}
                  />
                  <span className="relative text-xs font-bold font-display text-[var(--fg)]">
                    {breathingPhase === 'inhale' && t('Breathe In')}
                    {breathingPhase === 'hold1' && t('Hold')}
                    {breathingPhase === 'exhale' && t('Breathe Out')}
                    {breathingPhase === 'hold2' && t('Rest Empty')}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--fg-muted)] max-w-sm">
                  {t('Box breathing: inhale for 4 seconds, hold for 4, exhale for 4, and rest for 4.')}
                </p>
              </div>
            )}

            {/* Guided Meditation: spoken cue subtitles & voice controls */}
            {isGuided && (
              <div className="p-5 bg-[var(--bg-elevated)] border border-[var(--color-sage)]/40 rounded-[var(--radius-md)] space-y-4 shadow-xs animate-in fade-in duration-300">
                <div className="min-h-[72px] flex items-center justify-center">
                  {currentCue ? (
                    <p
                      key={activeGuidedCueIndex}
                      className="text-base sm:text-xl font-display italic text-[var(--fg)] leading-relaxed max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-500"
                    >
                      “{t(currentCue.text)}”
                    </p>
                  ) : (
                    <p className="text-sm text-[var(--fg-muted)] italic">
                      {isPaused ? t('Paused. Resume when you are ready.') : t('Settling in… the guide will begin in a moment.')}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded-full bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--fg-muted)] font-semibold">
                    {t('Step {n} / {total}', { n: Math.max(0, activeGuidedCueIndex + 1), total: guidedMeditation!.cues.length })}
                  </span>
                  {isSpeaking && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-sage)]/15 text-[var(--color-sage)] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-sage)] animate-ping" />
                      {t('Speaking')}
                    </span>
                  )}
                  {nextCue && !isPaused && (
                    <span className="text-[var(--fg-subtle)]">
                      {t('Next cue in {n}s', { n: Math.max(0, nextCue.atSeconds - elapsedSeconds) })}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 border-t border-[var(--border)]">
                  {voiceSupported ? (
                    <>
                      <button
                        type="button"
                        onClick={handleToggleVoice}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                          voiceEnabled
                            ? 'bg-[var(--color-sage)] text-white border-[var(--color-sage)]'
                            : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] border-[var(--border)]'
                        }`}
                      >
                        {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                        <span>{voiceEnabled ? t('Voice On') : t('Voice Off')}</span>
                      </button>
                      <div className="flex items-center gap-2 px-2">
                        <span className="text-[10px] uppercase font-bold text-[var(--fg-subtle)]">{t('Voice')}</span>
                        <input
                          type="range"
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={voiceVolume}
                          onChange={(e) => handleVoiceVolume(parseFloat(e.target.value))}
                          className="w-20 h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-sage)]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleReplayCue}
                        disabled={!currentCue || !voiceEnabled}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-[var(--bg-muted)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)] disabled:opacity-40 cursor-pointer"
                      >
                        {t('Repeat')}
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-amber-700 dark:text-amber-300">
                      {t('Spoken voice isn’t available in this browser — follow the on-screen guidance.')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Circular / Large Timer Display */}
            <div className="relative flex flex-col items-center justify-center my-4">
              {/* Animated Progress Ring */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="transparent"
                    stroke="var(--border)"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="transparent"
                    stroke="var(--color-sage)"
                    strokeWidth="3.5"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={2 * Math.PI * 44 * (1 - progressPct / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-[var(--fg)] drop-shadow-xs">
                    {formatTime(remainingSeconds)}
                  </span>
                  <span className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-widest mt-2">
                    {t('{pct}% Complete', { pct: Math.round(progressPct) })}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Play / Pause & Complete Early Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {isPaused ? (
                <button
                  type="button"
                  onClick={resumeFocusSession}
                  className="px-6 py-3 bg-[var(--fg)] text-[var(--bg)] font-bold text-sm rounded-[var(--radius-sm)] flex items-center gap-2 shadow-sm hover:opacity-90 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isGuided ? t('Resume Meditation') : t('Resume Deep Work')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseFocusSession}
                  className="px-6 py-3 bg-[var(--bg-muted)] border border-[var(--border-strong)] text-[var(--fg)] font-bold text-sm rounded-[var(--radius-sm)] flex items-center gap-2 hover:bg-[var(--bg-elevated)] transition-all cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>{t('Pause Timer')}</span>
                </button>
              )}

              <button
                type="button"
                onClick={finishFocusSessionEarly}
                className="px-5 py-3 bg-[var(--color-sage)] text-white font-bold text-sm rounded-[var(--radius-sm)] flex items-center gap-2 hover:opacity-90 shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isGuided ? t('Finish Meditation') : t('Task Finished Early')}</span>
              </button>
            </div>

            {/* Ambient Sound Selector Bar */}
            <div className="p-3.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-semibold">
                <span className="flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                  <span>{t('Focus Soundscapes')}</span>
                </span>
                {soundTrack !== 'silence' && (
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-[var(--fg-subtle)]" />
                    <input
                      type="range"
                      min={0.05}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => setFocusVolume(parseFloat(e.target.value))}
                      className="w-20 h-1 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-[var(--color-sage)]"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {soundTracks.map((item) => {
                  const Icon = item.icon;
                  const isActive = soundTrack === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFocusSoundTrack(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-xs)] text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[var(--fg)] text-[var(--bg)] font-bold shadow-xs'
                          : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg)]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Distraction Parking Lot (Capture without breaking flow) */}
            <div className="p-4 bg-[var(--bg-muted)]/50 border border-[var(--border)] rounded-[var(--radius-md)] text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--fg)]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                  <span>{t('Distraction Parking Lot')}</span>
                </span>
                <span className="text-[11px] text-[var(--fg-subtle)]">
                  {t("Park thoughts here; don't leave focus.")}
                </span>
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={distractionInput}
                  onChange={(e) => setDistractionInput(e.target.value)}
                  placeholder={t('Capture random thought or urge (e.g. check email, grocery item)...')}
                  className="flex-1 px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)] focus:outline-none focus:border-[var(--color-sage)]"
                />
                <button
                  type="submit"
                  disabled={!distractionInput.trim()}
                  className="px-3 py-1.5 bg-[var(--bg-elevated)] border border-[var(--border)] text-xs font-semibold rounded-[var(--radius-xs)] hover:bg-[var(--bg)] transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('Park')}</span>
                </button>
              </form>

              {distractionNotes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {distractionNotes.map((note, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-md text-[var(--fg-muted)]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-coral)]" />
                      <span>{note}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Future Self Identity Quote */}
            {data?.futureSelf.identityStatement && (
              <p className="text-xs italic text-[var(--fg-subtle)] font-serif max-w-lg mx-auto">
                "{data.futureSelf.identityStatement}"
              </p>
            )}
          </div>
        ) : (
          /* Completion & Reflection Loop */
          <div className="w-full max-w-lg bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 sm:p-8 space-y-6 text-left shadow-lg animate-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold font-display text-[var(--fg)]">
                {t('Focus Session Complete!')}
              </h2>
              <p className="text-xs text-[var(--fg-muted)]">
                {t('You held the standard for {n} minutes of deep craftsmanship.', { n: durationMinutes })}
              </p>

              {/* Visual Alerts Status Badge */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={toggleFocusTabBlink}
                  title={t('Click to toggle browser tab title blinking alert')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                    tabBlinkEnabled
                      ? 'bg-[var(--color-sage)]/10 text-[var(--color-sage)] border-[var(--color-sage)]/30 hover:bg-[var(--color-sage)]/20'
                      : 'bg-[var(--bg-muted)] text-[var(--fg-subtle)] border-[var(--border)] opacity-60'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${tabBlinkEnabled ? 'bg-[var(--color-sage)] animate-ping' : 'bg-gray-400'}`} />
                  <Bell className="w-3 h-3" />
                  <span>{t('Tab Blink: {state}', { state: tabBlinkEnabled ? t('Active') : t('Off') })}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFocusScreenPulse}
                  title={t('Click to toggle subtle screen edge pulsing border alert')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                    screenPulseEnabled
                      ? 'bg-[var(--color-coral)]/10 text-[var(--color-coral)] border-[var(--color-coral)]/30 hover:bg-[var(--color-coral)]/20'
                      : 'bg-[var(--bg-muted)] text-[var(--fg-subtle)] border-[var(--border)] opacity-60'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${screenPulseEnabled ? 'bg-[var(--color-coral)] animate-pulse' : 'bg-gray-400'}`} />
                  <Activity className="w-3 h-3" />
                  <span>{t('Screen Pulse: {state}', { state: screenPulseEnabled ? t('Active') : t('Off') })}</span>
                </button>
              </div>
            </div>

            {/* Reward Card */}
            <div className="p-4 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-md)] flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[var(--fg-subtle)] font-semibold">
                  {t('Verified Yield')}
                </span>
                <div className="text-lg font-bold text-[var(--color-sage)]">
                  + D$ {rewardD$.toLocaleString()}
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[var(--bg-elevated)] text-[var(--fg)] border border-[var(--border)] rounded-full">
                {t('{n} mins deep work', { n: durationMinutes })}
              </span>
            </div>

            {/* Reflection Questions */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--fg)]">
                  {t('1. What did you finish during this block?')}
                </label>
                <input
                  type="text"
                  value={completedSummary}
                  onChange={(e) => setCompletedSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)] focus:outline-none focus:border-[var(--color-sage)]"
                  placeholder={t('e.g. Drafted pitch email and sent 3 samples')}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--fg)]">
                  {t('2. What resistance or distraction did you notice?')}
                </label>
                <input
                  type="text"
                  value={resistanceNoticed}
                  onChange={(e) => setResistanceNoticed(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)] focus:outline-none focus:border-[var(--color-sage)]"
                  placeholder={t('e.g. Urge to browse social feeds at minute 18')}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--fg)]">
                  {t('3. What is the next single domino?')}
                </label>
                <input
                  type="text"
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)] focus:outline-none focus:border-[var(--color-sage)]"
                  placeholder={t('e.g. Review responses tomorrow morning')}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalClaim}
              disabled={isSubmitting}
              className="w-full py-3 bg-[var(--color-sage)] text-white font-bold text-sm rounded-[var(--radius-sm)] flex items-center justify-center gap-2 hover:opacity-90 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? t('Recording...') : t('Claim D$ & Return to Life OS')}</span>
            </button>
          </div>
        )}
      </main>

      {/* Bottom Footer Quote */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-[11px] text-[var(--fg-subtle)] border-t border-[var(--border)]">
        <span>{t('One Decision Away — Deep Work Engine')}</span>
        <span>{t('Standard: Craftsmanship over Distraction')}</span>
      </footer>

      {/* Abort Session Confirmation Modal */}
      {showAbortModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-lg)] p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertOctagon className="w-6 h-6" />
              <h3 className="text-base font-bold text-[var(--fg)]">{t('End Deep Work Early?')}</h3>
            </div>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
              {t('You have completed {n} minutes of focus. Ending now will release the app lock without logging a verified completion.', { n: Math.round(elapsedSeconds / 60) })}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAbortModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[var(--fg)] bg-[var(--bg-muted)] rounded-[var(--radius-xs)] hover:bg-[var(--bg)] cursor-pointer"
              >
                {t('Keep Focusing')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAbortModal(false);
                  cancelFocusSession();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-[var(--radius-xs)] hover:bg-red-700 cursor-pointer"
              >
                {t('Abort Session')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
