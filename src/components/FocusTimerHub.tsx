import React, { useState, useEffect } from 'react';
import { useApp } from '../store/useApp';
import {
  Timer,
  Play,
  Pause,
  Flame,
  Brain,
  Headphones,
  CloudRain,
  Waves,
  Wind,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Heart,
  Bell,
  Sun,
  Radio,
  Mic,
  MicOff,
} from 'lucide-react';
import { FocusSoundTrack, Mission } from '../types/models';
import { getBaseReward } from '../services/economy';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { voiceGuide } from '../utils/voiceGuide';
import { GUIDED_MEDITATIONS, GuidedMeditation, INTENT_LABELS } from '../data/guidedMeditations';

interface FocusTimerHubProps {
  initialMission?: Mission | null;
  onMissionSelected?: (mission: Mission | null) => void;
}

interface MeditationQuickSession {
  id: string;
  title: string;
  durationMinutes: 7 | 8;
  track: FocusSoundTrack;
  hzBadge: string;
  subtitle: string;
  description: string;
  benefits: string[];
}

export const FocusTimerHub: React.FC<FocusTimerHubProps> = ({
  initialMission,
  onMissionSelected,
}) => {
  const { data, startFocusSession } = useApp();

  const [selectedMissionId, setSelectedMissionId] = useState<string>(
    initialMission?.id || 'custom'
  );
  const [customGoal, setCustomGoal] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(
    initialMission?.estimatedMinutes || 25
  );
  const [soundTrack, setSoundTrack] = useState<FocusSoundTrack>('meditation_432hz');
  const [customInputOpen, setCustomInputOpen] = useState(false);
  const [soundTab, setSoundTab] = useState<'meditation' | 'ambient'>('meditation');
  const [previewingTrack, setPreviewingTrack] = useState<FocusSoundTrack | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(voiceGuide.isEnabled());
  const [voiceSampleId, setVoiceSampleId] = useState<string | null>(null);
  const voiceSupported = voiceGuide.isAvailable();

  // Stop preview on unmount
  useEffect(() => {
    return () => {
      soundSynthesizer.stopAmbient();
      voiceGuide.stop();
    };
  }, []);

  useEffect(() => {
    return voiceGuide.onSpeakingChange((speaking) => {
      if (!speaking) setVoiceSampleId(null);
    });
  }, []);

  if (!data) return null;

  const activeMissions = data.missions.filter((m) => m.status === 'active');
  const selectedMission = activeMissions.find((m) => m.id === selectedMissionId);

  const presets = [
    { label: '7m Meditation', value: 7, tag: 'Reset & Calm', track: 'meditation_432hz' as FocusSoundTrack },
    { label: '8m Deep Peace', value: 8, tag: 'Theta Waves', track: 'theta_meditation' as FocusSoundTrack },
    { label: '15m Sprint', value: 15, tag: 'High Velocity', track: 'binaural' as FocusSoundTrack },
    { label: '25m Pomodoro', value: 25, tag: 'Standard', track: 'binaural' as FocusSoundTrack },
    { label: '45m Deep Work', value: 45, tag: 'Recommended', track: 'binaural' as FocusSoundTrack },
    { label: '60m Flow State', value: 60, tag: 'Endurance', track: 'rain' as FocusSoundTrack },
  ];

  const meditationSessions: MeditationQuickSession[] = [
    {
      id: 'med-432',
      title: '7 min • 432 Hz Mental Calm & Healing',
      durationMinutes: 7,
      track: 'meditation_432hz',
      hzBadge: '432 Hz',
      subtitle: 'Natural tuning & mental clearing',
      description: 'The Verdi tuning; quiets mental noise and cortisol, and rebalances your natural rhythm.',
      benefits: ['Stress relief', 'Cognitive clarity', 'Inner stillness'],
    },
    {
      id: 'med-528',
      title: '8 min • 528 Hz Heart & Transformation',
      durationMinutes: 8,
      track: 'solfeggio_528hz',
      hzBadge: '528 Hz',
      subtitle: 'Solfeggio "miracle" tone & renewal',
      description: 'The frequency of transformation and love; releases heaviness in the chest and opens gratitude.',
      benefits: ['Renewal', 'Heart opening', 'Emotional lift'],
    },
    {
      id: 'med-theta',
      title: '7 min • Theta 6 Hz Deep Trance',
      durationMinutes: 7,
      track: 'theta_meditation',
      hzBadge: 'Theta 6 Hz',
      subtitle: 'Monk brainwaves & deep inward turn',
      description: '6 Hz theta binaural beats guide the mind into deep meditation and intuitive quiet.',
      benefits: ['Subconscious reset', 'Deep trance', 'Intuitive clarity'],
    },
    {
      id: 'med-tibetan',
      title: '8 min • Tibetan Bowls & Zen Temple',
      durationMinutes: 8,
      track: 'tibetan_bowls',
      hzBadge: 'Zen Gong',
      subtitle: 'Himalayan bowls & body awareness',
      description: 'Singing bowls and temple gong tones anchor the mind firmly in the present moment.',
      benefits: ['Mindfulness', 'Body scan', 'Burnout reset'],
    },
    {
      id: 'med-396',
      title: '7 min • 396 Hz Release Stress & Fear',
      durationMinutes: 7,
      track: 'solfeggio_396hz',
      hzBadge: '396 Hz',
      subtitle: 'Root grounding & releasing negativity',
      description: 'The root frequency; releases buried anxiety, guilt and mental weight.',
      benefits: ['Grounding', 'Safety', 'Muscle release'],
    },
    {
      id: 'med-639',
      title: '8 min • 639 Hz Heart Harmony & Peace',
      durationMinutes: 8,
      track: 'solfeggio_639hz',
      hzBadge: '639 Hz',
      subtitle: 'Compassion, empathy & emotional balance',
      description: 'Harmony in relationships and peace with yourself; a warm frequency bath for the heart.',
      benefits: ['Emotional healing', 'Compassion', 'Inner peace'],
    },
  ];

  const meditationFrequencies: {
    id: FocusSoundTrack;
    label: string;
    sublabel: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'meditation_432hz', label: '432 Hz Healing', sublabel: 'Universal harmony', icon: Sparkles },
    { id: 'solfeggio_528hz', label: '528 Hz Miracle', sublabel: 'Cellular renewal', icon: Heart },
    { id: 'theta_meditation', label: 'Theta 6 Hz', sublabel: 'Deep trance', icon: Brain },
    { id: 'tibetan_bowls', label: 'Tibetan Bowls', sublabel: 'Zen temple', icon: Bell },
    { id: 'solfeggio_396hz', label: '396 Hz Release', sublabel: 'Stress & fear', icon: Flame },
    { id: 'solfeggio_639hz', label: '639 Hz Harmony', sublabel: 'Heart chakra', icon: Sun },
  ];

  const ambientSoundscapes: {
    id: FocusSoundTrack;
    label: string;
    sublabel: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'binaural', label: 'Binaural 10 Hz', sublabel: 'Alpha focus', icon: Headphones },
    { id: 'rain', label: 'Gentle Rain', sublabel: 'Acoustic rain', icon: CloudRain },
    { id: 'waves', label: 'Ocean Waves', sublabel: 'Rhythmic surf', icon: Waves },
    { id: 'brown_noise', label: 'Deep Noise', sublabel: 'Noise masking', icon: Wind },
    { id: 'fireplace', label: 'Fireplace', sublabel: 'Warm crackle', icon: Flame },
    { id: 'silence', label: 'Silence', sublabel: 'Mute', icon: VolumeX },
  ];

  const handleTogglePreview = (track: FocusSoundTrack) => {
    if (previewingTrack === track) {
      soundSynthesizer.stopAmbient();
      setPreviewingTrack(null);
    } else {
      soundSynthesizer.stopAmbient();
      soundSynthesizer.playAmbient(track);
      setPreviewingTrack(track);
    }
  };

  const handleSelectMission = (id: string) => {
    setSelectedMissionId(id);
    if (id === 'custom') {
      onMissionSelected?.(null);
    } else {
      const found = activeMissions.find((m) => m.id === id);
      if (found) {
        onMissionSelected?.(found);
        if (found.estimatedMinutes) {
          setDurationMinutes(found.estimatedMinutes);
        }
      }
    }
  };

  const handleStart = () => {
    soundSynthesizer.stopAmbient();
    setPreviewingTrack(null);

    if (selectedMission) {
      startFocusSession({
        missionId: selectedMission.id,
        missionTitle: selectedMission.title,
        missionType: selectedMission.type,
        missionArea: selectedMission.area,
        durationMinutes,
        soundTrack,
      });
    } else {
      startFocusSession({
        missionTitle: customGoal.trim() || (durationMinutes <= 8 ? '🧘 Meditation & Renewal Session' : 'Deep Work Sprint'),
        durationMinutes,
        soundTrack,
      });
    }
  };

  const handleStartQuickMeditation = (session: MeditationQuickSession) => {
    soundSynthesizer.stopAmbient();
    setPreviewingTrack(null);

    startFocusSession({
      missionTitle: session.title,
      durationMinutes: session.durationMinutes,
      soundTrack: session.track,
    });
  };

  const handleStartGuided = (meditation: GuidedMeditation) => {
    soundSynthesizer.stopAmbient();
    voiceGuide.stop();
    setPreviewingTrack(null);
    setVoiceSampleId(null);

    startFocusSession({
      missionTitle: `${meditation.emoji} ${meditation.title}`,
      durationMinutes: meditation.durationMinutes,
      soundTrack: meditation.track,
      guidedMeditationId: meditation.id,
    });
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    voiceGuide.setEnabled(next);
    setVoiceEnabled(next);
    setVoiceSampleId(null);
  };

  const handleVoiceSample = (meditation: GuidedMeditation) => {
    if (voiceSampleId === meditation.id) {
      voiceGuide.stop();
      setVoiceSampleId(null);
      return;
    }
    if (!voiceEnabled) {
      voiceGuide.setEnabled(true);
      setVoiceEnabled(true);
    }
    setVoiceSampleId(meditation.id);
    voiceGuide.speak(meditation.cues[0]?.text || meditation.description);
  };

  const estimatedReward = selectedMission
    ? getBaseReward(selectedMission.type, selectedMission.difficulty, selectedMission.isOneDecision)
    : Math.min(300, Math.max(60, Math.round(durationMinutes * 4)));

  // Calculate today's focus stats
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCompletionsWithFocus = data.completions.filter(
    (c) => c.completedAt.slice(0, 10) === todayStr && (c.focusMinutes || 0) > 0
  );
  const todayTotalFocusMinutes = todayCompletionsWithFocus.reduce(
    (acc, curr) => acc + (curr.focusMinutes || 0),
    0
  );

  return (
    <div
      id="focus-timer-hub"
      className="p-5 sm:p-6 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-[var(--radius-md)] space-y-6 relative overflow-hidden shadow-xs"
    >
      {/* Visual Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--color-slate)] text-white flex items-center justify-center shadow-xs">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-display text-[var(--fg)]">
                Focus & Meditation Engine
              </h2>
              <span className="px-2 py-0.5 bg-[var(--color-sage)]/15 text-[var(--color-sage)] text-[10px] font-bold uppercase tracking-wider rounded-md">
                Guided • Frequencies • Deep Work
              </span>
            </div>
            <p className="text-xs text-[var(--fg-muted)]">
              Fullscreen attention lock, voice-guided meditations, 7–8 minute frequency baths and deep work soundscapes.
            </p>
          </div>
        </div>

        {/* Quick today metrics */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-[var(--bg-muted)] px-3 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border)]">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[var(--fg-subtle)] block">
              Focus today
            </span>
            <span className="text-xs font-bold text-[var(--fg)]">
              {todayTotalFocusMinutes} min
            </span>
          </div>
          <Zap className="w-4 h-4 text-[var(--color-coral)]" />
        </div>
      </div>

      {/* GUIDED MEDITATIONS (VOICE) */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-[var(--color-sage)]/10 via-[var(--bg-elevated)] to-[var(--bg-muted)]/40 border border-[var(--color-sage)]/40 rounded-[var(--radius-md)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--color-sage)]/20 text-[var(--color-sage)] flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--fg)] flex items-center gap-2">
                <span>🎧 Guided Meditations</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-[var(--color-sage)]/15 text-[var(--color-sage)] rounded-full">
                  Voice-led • 10 sessions
                </span>
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)]">
                A calm voice guides you step by step over a frequency soundscape. Relaxation, dopamine reset, manifestation, belief, motivation and more.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {voiceSupported ? (
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  voiceEnabled
                    ? 'bg-[var(--color-sage)] text-white border-[var(--color-sage)]'
                    : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] border-[var(--border)]'
                }`}
                title="Toggle spoken guidance (uses your device's built-in voice)"
              >
                {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>Voice {voiceEnabled ? 'On' : 'Off'}</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Voice not supported here — guidance shows as on-screen text
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {GUIDED_MEDITATIONS.map((m) => {
            const isSampling = voiceSampleId === m.id;
            return (
              <div
                key={m.id}
                className="p-3.5 rounded-[var(--radius-sm)] border bg-[var(--bg)] border-[var(--border)] hover:border-[var(--color-sage)] text-left flex flex-col justify-between transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl leading-none">{m.emoji}</span>
                    <span className="text-[10px] font-mono font-bold text-[var(--fg-muted)]">⏱ {m.durationMinutes} min</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--color-sage)]">
                      {INTENT_LABELS[m.intent]}
                    </span>
                    <h4 className="text-xs font-bold text-[var(--fg)] leading-snug">{m.title}</h4>
                    <p className="text-[11px] italic text-[var(--fg-subtle)] mt-0.5">{m.tagline}</p>
                  </div>
                  <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed line-clamp-3">{m.description}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {m.benefits.map((b, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 bg-[var(--bg-muted)] text-[var(--fg-subtle)] rounded border border-[var(--border)]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center gap-1.5">
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={() => handleVoiceSample(m)}
                      title={isSampling ? 'Stop sample' : 'Hear the voice'}
                      className={`px-2 py-1.5 text-[11px] font-semibold rounded-[var(--radius-xs)] border transition-all flex items-center gap-1 cursor-pointer ${
                        isSampling
                          ? 'bg-[var(--color-coral)] text-white border-[var(--color-coral)] animate-pulse'
                          : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)]'
                      }`}
                    >
                      {isSampling ? <Pause className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartGuided(m)}
                    className="flex-1 py-1.5 px-2 bg-[var(--fg)] text-[var(--bg)] font-bold text-[11px] rounded-[var(--radius-xs)] hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7-8 MINUTE FREQUENCY QUICK SESSIONS */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-[var(--bg-muted)]/70 via-[var(--bg-elevated)] to-[var(--bg-muted)]/40 border border-[var(--color-sage)]/30 rounded-[var(--radius-md)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--color-sage)]/20 text-[var(--color-sage)] flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--fg)] flex items-center gap-2">
                <span>🧘 7–8 Minute Frequency Sessions</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-[var(--color-sage)]/15 text-[var(--color-sage)] rounded-full">
                  Quick start
                </span>
              </h3>
              <p className="text-[11px] text-[var(--fg-muted)]">
                Silent, sound-only sessions. Refresh the mind, shake off tension, or tune in before deep work.
              </p>
            </div>
          </div>
          {previewingTrack && (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-[var(--color-sage)]/10 border border-[var(--color-sage)]/30 rounded-full self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[var(--color-sage)] animate-ping" />
              <span className="text-[11px] font-bold text-[var(--color-sage)]">Preview playing…</span>
              <button
                type="button"
                onClick={() => handleTogglePreview(previewingTrack)}
                className="text-[10px] underline ml-1 font-bold cursor-pointer text-[var(--fg)] hover:text-[var(--color-coral)]"
              >
                Stop
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {meditationSessions.map((session) => {
            const isSelected = durationMinutes === session.durationMinutes && soundTrack === session.track;
            const isPlayingThis = previewingTrack === session.track;

            return (
              <div
                key={session.id}
                className={`p-3.5 rounded-[var(--radius-sm)] border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-[var(--bg)] border-[var(--color-sage)] ring-1 ring-[var(--color-sage)] shadow-xs'
                    : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--color-sage)]/15 text-[var(--color-sage)] rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>{session.hzBadge}</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[var(--fg-muted)]">
                      ⏱ {session.durationMinutes} min
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-[var(--fg)] leading-snug">{session.title}</h4>
                    <p className="text-[11px] font-medium text-[var(--fg-subtle)] mt-0.5">{session.subtitle}</p>
                  </div>

                  <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed line-clamp-2">{session.description}</p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {session.benefits.map((b, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 bg-[var(--bg-muted)] text-[var(--fg-subtle)] rounded border border-[var(--border)]"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(session.track)}
                    title={isPlayingThis ? 'Stop preview' : 'Preview this frequency'}
                    className={`px-2.5 py-1.5 text-[11px] font-semibold rounded-[var(--radius-xs)] border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isPlayingThis
                        ? 'bg-[var(--color-coral)] text-white border-[var(--color-coral)] animate-pulse'
                        : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {isPlayingThis ? (
                      <>
                        <Pause className="w-3 h-3" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartQuickMeditation(session)}
                    className="flex-1 py-1.5 px-3 bg-[var(--fg)] text-[var(--bg)] font-bold text-[11px] rounded-[var(--radius-xs)] hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start ({session.durationMinutes}m)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CUSTOM FOCUS / GENERAL TIMER CONFIGURATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Target Mission & Duration Selector */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--fg)] flex items-center justify-between">
              <span>1. Choose a mission or intention</span>
              <span className="text-[11px] font-normal text-[var(--fg-muted)]">
                {activeMissions.length} active missions
              </span>
            </label>
            <select
              value={selectedMissionId}
              onChange={(e) => handleSelectMission(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)] font-medium focus:outline-none focus:border-[var(--color-sage)]"
            >
              <option value="custom">✍️ Free intention / meditation goal</option>
              {activeMissions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.isOneDecision ? '★ [ONE DECISION] ' : `[${m.area}] `} {m.title} (
                  {m.estimatedMinutes || 30}m)
                </option>
              ))}
            </select>
          </div>

          {selectedMissionId === 'custom' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-[11px] font-semibold text-[var(--fg-muted)]">
                Name your intention (optional)
              </label>
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="e.g. 7 min breathing with 432 Hz, or 45 min writing the landing page"
                className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)] focus:outline-none focus:border-[var(--color-sage)]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--fg)] flex items-center justify-between">
              <span>2. Pick a duration</span>
              <span className="text-[11px] font-semibold text-[var(--color-sage)]">
                {durationMinutes} min selected
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {presets.map((preset) => {
                const isSelected = durationMinutes === preset.value && !customInputOpen;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setDurationMinutes(preset.value);
                      if (preset.track) {
                        setSoundTrack(preset.track);
                      }
                      setCustomInputOpen(false);
                    }}
                    className={`px-2.5 py-2 rounded-[var(--radius-xs)] border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] font-bold shadow-xs'
                        : 'bg-[var(--bg-muted)] border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="text-xs font-bold">{preset.label}</div>
                    <div
                      className={`text-[9px] uppercase tracking-wider ${
                        isSelected ? 'text-[var(--bg)] opacity-80' : 'text-[var(--fg-subtle)]'
                      }`}
                    >
                      {preset.tag}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCustomInputOpen(!customInputOpen)}
                className="text-[11px] font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)] underline cursor-pointer"
              >
                {customInputOpen ? 'Hide custom duration' : 'Set a custom number of minutes…'}
              </button>
              {customInputOpen && (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 25)}
                    className="w-20 px-2 py-1 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)]"
                  />
                  <span className="text-xs text-[var(--fg-muted)]">min</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Audio Atmosphere & Launch */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4 bg-[var(--bg-muted)]/50 border border-[var(--border)] rounded-[var(--radius-sm)] space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                <span>Sound & Frequency</span>
              </span>
              <span className="text-[10px] text-[var(--fg-subtle)]">Web Audio synthesis</span>
            </div>

            <div className="flex rounded-[var(--radius-xs)] bg-[var(--bg)] p-0.5 border border-[var(--border)] text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setSoundTab('meditation')}
                className={`flex-1 py-1 rounded-[var(--radius-xs)] text-center transition-all cursor-pointer ${
                  soundTab === 'meditation'
                    ? 'bg-[var(--fg)] text-[var(--bg)] font-bold shadow-xs'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                }`}
              >
                🧘 Frequencies (432/528 Hz)
              </button>
              <button
                type="button"
                onClick={() => setSoundTab('ambient')}
                className={`flex-1 py-1 rounded-[var(--radius-xs)] text-center transition-all cursor-pointer ${
                  soundTab === 'ambient'
                    ? 'bg-[var(--fg)] text-[var(--bg)] font-bold shadow-xs'
                    : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                }`}
              >
                🌿 Nature & Focus
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {(soundTab === 'meditation' ? meditationFrequencies : ambientSoundscapes).map((opt) => {
                const Icon = opt.icon;
                const isActive = soundTrack === opt.id;
                const isPlayingThis = previewingTrack === opt.id;

                return (
                  <div
                    key={opt.id}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-[var(--radius-xs)] border transition-all ${
                      isActive
                        ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] font-bold shadow-xs'
                        : 'bg-[var(--bg)] text-[var(--fg)] border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSoundTrack(opt.id)}
                      className="flex items-center gap-1.5 flex-1 text-left cursor-pointer truncate"
                    >
                      <Icon className="w-3 h-3 shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-bold truncate">{opt.label}</div>
                        <div
                          className={`text-[9px] truncate ${
                            isActive ? 'text-[var(--bg)] opacity-80' : 'text-[var(--fg-subtle)]'
                          }`}
                        >
                          {opt.sublabel}
                        </div>
                      </div>
                    </button>

                    {opt.id !== 'silence' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePreview(opt.id);
                        }}
                        title={isPlayingThis ? 'Stop preview' : 'Play test sound'}
                        className={`p-1 rounded cursor-pointer ml-1 ${
                          isActive
                            ? 'text-[var(--bg)] hover:bg-white/20'
                            : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)]'
                        }`}
                      >
                        {isPlayingThis ? <Pause className="w-3 h-3 text-[var(--color-coral)]" /> : <Volume2 className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--fg-muted)]">Estimated reward:</span>
              <span className="font-bold text-[var(--color-sage)]">
                + D$ {estimatedReward.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3 bg-[var(--fg)] text-[var(--bg)] font-bold text-xs uppercase tracking-wider rounded-[var(--radius-xs)] flex items-center justify-center gap-2 hover:opacity-90 shadow-xs transition-all cursor-pointer group"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>
                {durationMinutes <= 8 ? 'Start Meditation' : 'Lock Into Focus'} ({durationMinutes}m)
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
