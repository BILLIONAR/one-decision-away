import React, { useState, useEffect } from 'react';
import { useApp } from '../store/useApp';
import {
  Play,
  Pause,
  Volume2,
  Maximize2,
  Minimize2,
  Check,
  Plus,
  X,
  Bell,
  Mic,
  MicOff,
} from 'lucide-react';
import { FocusSoundTrack } from '../types/models';
import { getBaseReward } from '../services/economy';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { voiceGuide } from '../utils/voiceGuide';
import { getGuidedMeditation, INTENT_LABELS } from '../data/guidedMeditations';
import { useT } from '../i18n';

/* Inverted monochrome palette: the lock screen paints with --fg as the surface and --bg as the ink. */
const INK = 'text-[var(--bg)]';
const INK_MUTED = 'text-[var(--bg)]/60';
const INK_SUBTLE = 'text-[var(--bg)]/40';
const SURFACE = 'bg-[var(--bg)]/10';
const HAIRLINE = 'border-[var(--bg)]/15';

const chip = (active: boolean) =>
  `h-10 px-3.5 rounded-full text-sm inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
    active ? 'bg-[var(--bg)] text-[var(--fg)]' : `${SURFACE} ${INK}`
  }`;
const iconBtn = 'w-11 h-11 rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer text-[var(--bg)]/60 hover:text-[var(--bg)]';
const inputCls = `w-full h-11 px-3 text-sm rounded-[var(--radius-sm)] ${SURFACE} ${INK} placeholder:text-[var(--bg)]/40 focus:outline-none`;

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
  const [showSounds, setShowSounds] = useState(false);

  useEffect(() => voiceGuide.onSpeakingChange(setIsSpeaking), []);

  const [completedSummary, setCompletedSummary] = useState('');
  const [resistanceNoticed, setResistanceNoticed] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const soundTracks: { id: FocusSoundTrack; label: string }[] = [
    { id: 'meditation_432hz', label: t('432 Hz') },
    { id: 'solfeggio_528hz', label: t('528 Hz') },
    { id: 'theta_meditation', label: t('Theta') },
    { id: 'tibetan_bowls', label: t('Bowls') },
    { id: 'solfeggio_396hz', label: t('396 Hz') },
    { id: 'solfeggio_639hz', label: t('639 Hz') },
    { id: 'binaural', label: t('Binaural') },
    { id: 'rain', label: t('Rain') },
    { id: 'waves', label: t('Waves') },
    { id: 'brown_noise', label: t('Noise') },
    { id: 'fireplace', label: t('Fire') },
    { id: 'silence', label: t('Silence') },
  ];

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

  if (isCompleted && !completedSummary && missionTitle) {
    setCompletedSummary(t('Finished: {title}', { title: missionTitle }));
  }

  const tabBlinkEnabled = data?.profile?.focusTabBlinkEnabled !== false;
  const screenPulseEnabled = data?.profile?.focusScreenPulseEnabled !== false;

  const breathLabel =
    breathingPhase === 'inhale'
      ? t('Breathe in')
      : breathingPhase === 'hold1'
      ? t('Hold')
      : breathingPhase === 'exhale'
      ? t('Breathe out')
      : t('Rest');

  return (
    <div
      id="focus-lock-viewport"
      className={`fixed inset-0 z-50 bg-[var(--fg)] ${INK} flex flex-col overflow-y-auto`}
    >
      {isCompleted && screenPulseEnabled && (
        <div
          id="focus-completed-screen-pulse"
          className="fixed inset-0 pointer-events-none z-40 border-4 sm:border-8 border-transparent animate-focus-screen-pulse"
          aria-hidden="true"
        />
      )}

      <header className="w-full max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className={`flex items-center gap-2 text-sm ${INK_MUTED}`}>
          <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-[var(--bg)]/40' : 'bg-[var(--bg)]'}`} />
          <span>{isPaused ? t('Paused') : t('Focusing')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? t('Exit fullscreen') : t('Fullscreen')}
            aria-label={isFullscreen ? t('Exit fullscreen') : t('Fullscreen')}
            className={iconBtn}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" strokeWidth={1.8} /> : <Maximize2 className="w-5 h-5" strokeWidth={1.8} />}
          </button>
          <button
            type="button"
            onClick={() => setShowAbortModal(true)}
            aria-label={t('End early')}
            title={t('End early')}
            className={iconBtn}
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto px-4 py-6 flex-1 flex flex-col items-center justify-center text-center">
        {!isCompleted ? (
          <div className="w-full space-y-8">
            <div className="space-y-1">
              <p className={`text-sm ${INK_MUTED}`}>
                {isGuided ? t(INTENT_LABELS[guidedMeditation!.intent]) : linkedMission?.isOneDecision ? t("Today's one decision") : t('Deep work')}
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">{missionTitle}</h1>
            </div>

            <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="transparent" stroke="var(--bg)" strokeOpacity="0.15" strokeWidth="2" />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="transparent"
                  stroke="var(--bg)"
                  strokeWidth="2"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - progressPct / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showBreathingGuide ? (
                  <>
                    <div
                      className={`absolute w-40 h-40 rounded-full ${SURFACE} transition-transform duration-[3500ms] ease-in-out ${
                        breathingPhase === 'inhale' || breathingPhase === 'hold1' ? 'scale-125' : 'scale-75'
                      }`}
                    />
                    <span className="relative text-3xl font-semibold tracking-tight tabular-nums">{formatTime(remainingSeconds)}</span>
                    <span className={`relative text-sm mt-1 ${INK_MUTED}`}>{breathLabel}</span>
                  </>
                ) : (
                  <>
                    <span className="text-5xl sm:text-6xl font-semibold tracking-tight tabular-nums">{formatTime(remainingSeconds)}</span>
                    <span className={`text-sm mt-2 ${INK_MUTED}`}>{Math.round(progressPct)}%</span>
                  </>
                )}
              </div>
            </div>

            {isGuided && (
              <div className="space-y-3">
                <div className="min-h-[64px] flex items-center justify-center">
                  {currentCue ? (
                    <p key={activeGuidedCueIndex} className="text-lg leading-relaxed max-w-xl">
                      {t(currentCue.text)}
                    </p>
                  ) : (
                    <p className={`text-sm ${INK_MUTED}`}>
                      {isPaused ? t('Paused. Resume when you are ready.') : t('Settling in. The guide begins in a moment.')}
                    </p>
                  )}
                </div>
                <div className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs ${INK_SUBTLE}`}>
                  <span>{Math.max(0, activeGuidedCueIndex + 1)} / {guidedMeditation!.cues.length}</span>
                  {isSpeaking && <span>{t('Speaking')}</span>}
                  {nextCue && !isPaused && <span>{t('Next in {n}s', { n: Math.max(0, nextCue.atSeconds - elapsedSeconds) })}</span>}
                </div>
                {voiceSupported ? (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button type="button" onClick={handleToggleVoice} className={chip(voiceEnabled)}>
                      {voiceEnabled ? <Mic className="w-4 h-4" strokeWidth={1.8} /> : <MicOff className="w-4 h-4" strokeWidth={1.8} />}
                      <span>{voiceEnabled ? t('Voice on') : t('Voice off')}</span>
                    </button>
                    <input
                      type="range"
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={voiceVolume}
                      onChange={(e) => handleVoiceVolume(parseFloat(e.target.value))}
                      aria-label={t('Voice volume')}
                      className="w-24 accent-[var(--bg)] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={handleReplayCue}
                      disabled={!currentCue || !voiceEnabled}
                      className={`${chip(false)} disabled:opacity-40`}
                    >
                      {t('Repeat')}
                    </button>
                  </div>
                ) : (
                  <p className={`text-xs ${INK_SUBTLE}`}>{t('No spoken voice in this browser. Follow the text.')}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              {isPaused ? (
                <button
                  type="button"
                  onClick={resumeFocusSession}
                  className="h-12 px-6 rounded-[var(--radius-sm)] bg-[var(--bg)] text-[var(--fg)] font-semibold text-[15px] inline-flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  {t('Resume')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={pauseFocusSession}
                  className={`h-12 px-6 rounded-[var(--radius-sm)] border ${HAIRLINE} ${INK} font-medium text-[15px] inline-flex items-center gap-2 cursor-pointer`}
                >
                  <Pause className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  {t('Pause')}
                </button>
              )}
              <button
                type="button"
                onClick={finishFocusSessionEarly}
                className="h-12 px-6 rounded-[var(--radius-sm)] bg-[var(--bg)] text-[var(--fg)] font-semibold text-[15px] inline-flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-[18px] h-[18px]" strokeWidth={1.8} />
                {t('Done')}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button type="button" onClick={() => setShowBreathingGuide(!showBreathingGuide)} className={chip(showBreathingGuide)}>
                {t('Breathe')}
              </button>
              <button type="button" onClick={handleRingBowl} className={chip(bowlRang)} title={t('Ring a bowl')}>
                <Bell className="w-4 h-4" strokeWidth={1.8} />
                {t('Bowl')}
              </button>
              <button type="button" onClick={() => setShowSounds(!showSounds)} className={chip(showSounds)}>
                <Volume2 className="w-4 h-4" strokeWidth={1.8} />
                {soundTracks.find((s) => s.id === soundTrack)?.label || t('Sound')}
              </button>
            </div>

            {showSounds && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {soundTracks.map((item) => (
                    <button key={item.id} type="button" onClick={() => setFocusSoundTrack(item.id)} className={chip(soundTrack === item.id)}>
                      {item.label}
                    </button>
                  ))}
                </div>
                {soundTrack !== 'silence' && (
                  <input
                    type="range"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setFocusVolume(parseFloat(e.target.value))}
                    aria-label={t('Sound volume')}
                    className="w-40 accent-[var(--bg)] cursor-pointer"
                  />
                )}
              </div>
            )}

            <div className="text-left space-y-2 max-w-md mx-auto">
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={distractionInput}
                  onChange={(e) => setDistractionInput(e.target.value)}
                  placeholder={t('Park a thought for later')}
                  className={inputCls}
                />
                <button
                  type="submit"
                  disabled={!distractionInput.trim()}
                  aria-label={t('Park')}
                  className={`w-11 h-11 shrink-0 rounded-[var(--radius-sm)] ${SURFACE} ${INK} flex items-center justify-center cursor-pointer disabled:opacity-40`}
                >
                  <Plus className="w-5 h-5" strokeWidth={1.8} />
                </button>
              </form>
              {distractionNotes.length > 0 && (
                <ul className={`divide-y divide-[var(--bg)]/15 text-sm ${INK_MUTED}`}>
                  {distractionNotes.map((note, i) => (
                    <li key={i} className="py-2">{note}</li>
                  ))}
                </ul>
              )}
            </div>

            {data?.futureSelf.identityStatement && (
              <p className={`text-sm ${INK_SUBTLE} max-w-md mx-auto`}>{data.futureSelf.identityStatement}</p>
            )}
          </div>
        ) : (
          <div className="w-full max-w-md text-left space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight">{t('Done')}</h2>
              <p className={`text-sm ${INK_MUTED}`}>{t('{n} minutes of focus.', { n: durationMinutes })}</p>
            </div>

            <div className={`flex items-center justify-between text-sm border-y ${HAIRLINE} py-3`}>
              <span className={INK_MUTED}>{t('Reward')}</span>
              <span className="font-medium">D$ {rewardD$.toLocaleString()}</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="focus-q1" className={`block text-sm ${INK_MUTED}`}>{t('What did you finish?')}</label>
                <input id="focus-q1" type="text" value={completedSummary} onChange={(e) => setCompletedSummary(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="focus-q2" className={`block text-sm ${INK_MUTED}`}>{t('What resistance did you notice?')}</label>
                <input id="focus-q2" type="text" value={resistanceNoticed} onChange={(e) => setResistanceNoticed(e.target.value)} placeholder={t('Optional')} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="focus-q3" className={`block text-sm ${INK_MUTED}`}>{t('What is the next step?')}</label>
                <input id="focus-q3" type="text" value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder={t('Optional')} className={inputCls} />
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalClaim}
              disabled={isSubmitting}
              className="w-full h-12 rounded-[var(--radius-sm)] bg-[var(--bg)] text-[var(--fg)] font-semibold text-[15px] inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {isSubmitting ? t('Saving') : t('Claim and return')}
            </button>

            <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs ${INK_SUBTLE}`}>
              <button type="button" onClick={toggleFocusTabBlink} className="min-h-[44px] cursor-pointer hover:opacity-100">
                {t('Tab alert: {state}', { state: tabBlinkEnabled ? t('on') : t('off') })}
              </button>
              <button type="button" onClick={toggleFocusScreenPulse} className="min-h-[44px] cursor-pointer hover:opacity-100">
                {t('Screen pulse: {state}', { state: screenPulseEnabled ? t('on') : t('off') })}
              </button>
            </div>
          </div>
        )}
      </main>

      {showAbortModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={() => setShowAbortModal(false)}>
          <div className="w-full max-w-md bg-[var(--bg)] text-[var(--fg)] rounded-[var(--radius-lg)] p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold tracking-tight">{t('End early?')}</h3>
            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
              {t('You have done {n} minutes. Ending now will not log a completion.', { n: Math.round(elapsedSeconds / 60) })}
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAbortModal(false)}
                className="h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--border-strong)] text-sm font-medium text-[var(--fg)] cursor-pointer"
              >
                {t('Keep going')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAbortModal(false);
                  cancelFocusSession();
                }}
                className="h-11 px-4 rounded-[var(--radius-sm)] bg-[var(--danger)] text-white text-sm font-semibold cursor-pointer"
              >
                {t('End session')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
