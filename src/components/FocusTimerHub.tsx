import React, { useState, useEffect } from 'react';
import { useApp } from '../store/useApp';
import { Play, Pause, Volume2, Mic, MicOff, ChevronDown } from 'lucide-react';
import { FocusSoundTrack, Mission } from '../types/models';
import { getBaseReward } from '../services/economy';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { voiceGuide } from '../utils/voiceGuide';
import { GUIDED_MEDITATIONS, GuidedMeditation, INTENT_LABELS } from '../data/guidedMeditations';
import { useT } from '../i18n';

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

const iconBtn =
  'w-11 h-11 shrink-0 rounded-[var(--radius-sm)] flex items-center justify-center cursor-pointer';
const selectCls =
  'w-full h-11 px-3 bg-[var(--bg)] text-[var(--fg)] rounded-[var(--radius-sm)] text-sm focus:outline-none';

export const FocusTimerHub: React.FC<FocusTimerHubProps> = ({
  initialMission,
  onMissionSelected,
}) => {
  const t = useT();
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
  const [section, setSection] = useState<'guided' | 'quick' | 'custom'>('custom');
  const voiceSupported = voiceGuide.isAvailable();

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
    { label: t('7 min'), value: 7, tag: t('Meditation'), track: 'meditation_432hz' as FocusSoundTrack },
    { label: t('8 min'), value: 8, tag: t('Theta'), track: 'theta_meditation' as FocusSoundTrack },
    { label: t('15 min'), value: 15, tag: t('Sprint'), track: 'binaural' as FocusSoundTrack },
    { label: t('25 min'), value: 25, tag: t('Pomodoro'), track: 'binaural' as FocusSoundTrack },
    { label: t('45 min'), value: 45, tag: t('Deep work'), track: 'binaural' as FocusSoundTrack },
    { label: t('60 min'), value: 60, tag: t('Flow'), track: 'rain' as FocusSoundTrack },
  ];

  const meditationSessions: MeditationQuickSession[] = [
    {
      id: 'med-432',
      title: t('432 Hz calm'),
      durationMinutes: 7,
      track: 'meditation_432hz',
      hzBadge: '432 Hz',
      subtitle: t('Quiet the mind'),
      description: t('Quiets mental noise and settles your natural rhythm.'),
      benefits: [t('Stress relief'), t('Clarity'), t('Stillness')],
    },
    {
      id: 'med-528',
      title: t('528 Hz renewal'),
      durationMinutes: 8,
      track: 'solfeggio_528hz',
      hzBadge: '528 Hz',
      subtitle: t('Heart and renewal'),
      description: t('Releases heaviness in the chest and opens gratitude.'),
      benefits: [t('Renewal'), t('Openness'), t('Lift')],
    },
    {
      id: 'med-theta',
      title: t('Theta 6 Hz'),
      durationMinutes: 7,
      track: 'theta_meditation',
      hzBadge: 'Theta 6 Hz',
      subtitle: t('Deep inward turn'),
      description: t('Theta binaural beats guide the mind into deep, quiet meditation.'),
      benefits: [t('Reset'), t('Depth'), t('Intuition')],
    },
    {
      id: 'med-tibetan',
      title: t('Tibetan bowls'),
      durationMinutes: 8,
      track: 'tibetan_bowls',
      hzBadge: t('Bowls'),
      subtitle: t('Body awareness'),
      description: t('Singing bowls and gong tones anchor you in the present moment.'),
      benefits: [t('Mindfulness'), t('Body scan'), t('Rest')],
    },
    {
      id: 'med-396',
      title: t('396 Hz release'),
      durationMinutes: 7,
      track: 'solfeggio_396hz',
      hzBadge: '396 Hz',
      subtitle: t('Grounding'),
      description: t('Releases buried anxiety, guilt and mental weight.'),
      benefits: [t('Grounding'), t('Safety'), t('Release')],
    },
    {
      id: 'med-639',
      title: t('639 Hz harmony'),
      durationMinutes: 8,
      track: 'solfeggio_639hz',
      hzBadge: '639 Hz',
      subtitle: t('Compassion and balance'),
      description: t('Peace with yourself and warmth toward others.'),
      benefits: [t('Healing'), t('Compassion'), t('Peace')],
    },
  ];

  const meditationFrequencies: { id: FocusSoundTrack; label: string; sublabel: string }[] = [
    { id: 'meditation_432hz', label: t('432 Hz'), sublabel: t('Harmony') },
    { id: 'solfeggio_528hz', label: t('528 Hz'), sublabel: t('Renewal') },
    { id: 'theta_meditation', label: t('Theta 6 Hz'), sublabel: t('Deep trance') },
    { id: 'tibetan_bowls', label: t('Tibetan bowls'), sublabel: t('Temple') },
    { id: 'solfeggio_396hz', label: t('396 Hz'), sublabel: t('Release') },
    { id: 'solfeggio_639hz', label: t('639 Hz'), sublabel: t('Heart') },
  ];

  const ambientSoundscapes: { id: FocusSoundTrack; label: string; sublabel: string }[] = [
    { id: 'binaural', label: t('Binaural 10 Hz'), sublabel: t('Alpha focus') },
    { id: 'rain', label: t('Rain'), sublabel: t('Soft rain') },
    { id: 'waves', label: t('Waves'), sublabel: t('Ocean') },
    { id: 'brown_noise', label: t('Deep noise'), sublabel: t('Masking') },
    { id: 'fireplace', label: t('Fireplace'), sublabel: t('Warm crackle') },
    { id: 'silence', label: t('Silence'), sublabel: t('No sound') },
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
        missionTitle: customGoal.trim() || (durationMinutes <= 8 ? t('Meditation') : t('Deep work')),
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
      missionTitle: t(meditation.title),
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
    voiceGuide.speak(t(meditation.cues[0]?.text || meditation.description));
  };

  const estimatedReward = selectedMission
    ? getBaseReward(selectedMission.type, selectedMission.difficulty, selectedMission.isOneDecision)
    : Math.min(300, Math.max(60, Math.round(durationMinutes * 4)));

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCompletionsWithFocus = data.completions.filter(
    (c) => c.completedAt.slice(0, 10) === todayStr && (c.focusMinutes || 0) > 0
  );
  const todayTotalFocusMinutes = todayCompletionsWithFocus.reduce(
    (acc, curr) => acc + (curr.focusMinutes || 0),
    0
  );

  const sections: { id: 'custom' | 'guided' | 'quick'; label: string }[] = [
    { id: 'custom', label: t('Timer') },
    { id: 'guided', label: t('Guided') },
    { id: 'quick', label: t('Quick') },
  ];

  const startBtn =
    'h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-sm font-semibold cursor-pointer shrink-0';

  return (
    <div id="focus-timer-hub" className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Focus')}</h2>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">
            {t('{n} min today', { n: todayTotalFocusMinutes })}
          </p>
        </div>
        {previewingTrack && (
          <button
            type="button"
            onClick={() => handleTogglePreview(previewingTrack)}
            className="h-9 px-3 rounded-full bg-[var(--bg)] text-sm text-[var(--fg)] inline-flex items-center gap-2 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            {t('Stop preview')}
          </button>
        )}
      </div>

      <div className="flex p-1 bg-[var(--bg)] rounded-[var(--radius-sm)]">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className={`flex-1 h-10 rounded-[var(--radius-xs)] text-sm font-medium transition-colors cursor-pointer ${
              section === s.id ? 'bg-[var(--fg)] text-[var(--bg)]' : 'text-[var(--fg-muted)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === 'guided' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--fg-muted)]">{t('A calm voice guides you step by step.')}</p>
            {voiceSupported ? (
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`h-9 px-3 rounded-full text-sm inline-flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  voiceEnabled ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--fg-muted)]'
                }`}
                title={t('Spoken guidance uses your device voice')}
              >
                {voiceEnabled ? <Mic className="w-4 h-4" strokeWidth={1.8} /> : <MicOff className="w-4 h-4" strokeWidth={1.8} />}
                <span>{voiceEnabled ? t('Voice on') : t('Voice off')}</span>
              </button>
            ) : (
              <span className="text-xs text-[var(--fg-subtle)] text-right">{t('No voice here. Cues show as text.')}</span>
            )}
          </div>

          <div className="bg-[var(--bg)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
            {GUIDED_MEDITATIONS.map((m) => {
              const isSampling = voiceSampleId === m.id;
              return (
                <div key={m.id} className="px-4 min-h-[56px] py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-[var(--fg)] truncate">{t(m.title)}</div>
                    <div className="text-xs text-[var(--fg-muted)] truncate">
                      {t(INTENT_LABELS[m.intent])} · {t('{n} min', { n: m.durationMinutes })} · {t(m.tagline)}
                    </div>
                  </div>
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={() => handleVoiceSample(m)}
                      title={isSampling ? t('Stop sample') : t('Hear the voice')}
                      aria-label={isSampling ? t('Stop sample') : t('Hear the voice')}
                      className={`${iconBtn} ${isSampling ? 'bg-[var(--accent)] text-white' : 'text-[var(--fg-muted)]'}`}
                    >
                      {isSampling ? <Pause className="w-[18px] h-[18px]" strokeWidth={1.8} /> : <Mic className="w-[18px] h-[18px]" strokeWidth={1.8} />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartGuided(m)}
                    aria-label={t('Start')}
                    className={`${iconBtn} bg-[var(--fg)] text-[var(--bg)]`}
                  >
                    <Play className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {section === 'quick' && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--fg-muted)]">{t('Sound only. Seven or eight minutes.')}</p>
          <div className="bg-[var(--bg)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
            {meditationSessions.map((session) => {
              const isPlayingThis = previewingTrack === session.track;
              return (
                <div key={session.id} className="px-4 min-h-[56px] py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-[var(--fg)] truncate">{t(session.title)}</div>
                    <div className="text-xs text-[var(--fg-muted)] truncate">
                      {t('{n} min', { n: session.durationMinutes })} · {session.subtitle}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(session.track)}
                    title={isPlayingThis ? t('Stop preview') : t('Listen')}
                    aria-label={isPlayingThis ? t('Stop preview') : t('Listen')}
                    className={`${iconBtn} ${isPlayingThis ? 'bg-[var(--accent)] text-white' : 'text-[var(--fg-muted)]'}`}
                  >
                    {isPlayingThis ? <Pause className="w-[18px] h-[18px]" strokeWidth={1.8} /> : <Volume2 className="w-[18px] h-[18px]" strokeWidth={1.8} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartQuickMeditation(session)}
                    aria-label={t('Start')}
                    className={`${iconBtn} bg-[var(--fg)] text-[var(--bg)]`}
                  >
                    <Play className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {section === 'custom' && (
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="focus-mission" className="block text-sm text-[var(--fg-muted)]">
              {t('Mission')}
            </label>
            <select
              id="focus-mission"
              value={selectedMissionId}
              onChange={(e) => handleSelectMission(e.target.value)}
              className={selectCls}
            >
              <option value="custom">{t('Free intention')}</option>
              {activeMissions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.isOneDecision ? `${t('One decision')} · ` : `${t(m.area)} · `}
                  {t(m.title)} ({m.estimatedMinutes || 30}m)
                </option>
              ))}
            </select>
            {selectedMissionId === 'custom' && (
              <input
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder={t('What will you focus on? Optional')}
                className={`${selectCls} placeholder:text-[var(--fg-subtle)]`}
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--fg-muted)]">{t('Duration')}</span>
              <span className="text-sm text-[var(--fg)]">{t('{n} min', { n: durationMinutes })}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
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
                    className={`h-12 px-3 rounded-[var(--radius-sm)] text-left cursor-pointer ${
                      isSelected ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--fg)]'
                    }`}
                  >
                    <div className="text-sm font-medium leading-tight">{preset.label}</div>
                    <div className={`text-xs leading-tight ${isSelected ? 'opacity-70' : 'text-[var(--fg-muted)]'}`}>{preset.tag}</div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCustomInputOpen(!customInputOpen)}
                className="min-h-[44px] text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer inline-flex items-center gap-1"
              >
                {t('Custom')}
                <ChevronDown className={`w-4 h-4 transition-transform ${customInputOpen ? 'rotate-180' : ''}`} strokeWidth={1.8} />
              </button>
              {customInputOpen && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 25)}
                    className="w-24 h-11 px-3 text-sm bg-[var(--bg)] rounded-[var(--radius-sm)] text-[var(--fg)] focus:outline-none"
                  />
                  <span className="text-sm text-[var(--fg-muted)]">{t('min')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-sm text-[var(--fg-muted)]">{t('Sound')}</span>
            <div className="flex p-1 bg-[var(--bg)] rounded-[var(--radius-sm)]">
              {(['meditation', 'ambient'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSoundTab(tab)}
                  className={`flex-1 h-9 rounded-[var(--radius-xs)] text-sm cursor-pointer ${
                    soundTab === tab ? 'bg-[var(--bg-muted)] text-[var(--fg)] font-medium' : 'text-[var(--fg-muted)]'
                  }`}
                >
                  {tab === 'meditation' ? t('Frequencies') : t('Ambient')}
                </button>
              ))}
            </div>
            <div className="bg-[var(--bg)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
              {(soundTab === 'meditation' ? meditationFrequencies : ambientSoundscapes).map((opt) => {
                const isActive = soundTrack === opt.id;
                const isPlayingThis = previewingTrack === opt.id;
                return (
                  <div key={opt.id} className="flex items-center min-h-[52px] pl-4 pr-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSoundTrack(opt.id)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer py-2"
                    >
                      <span
                        className={`w-4 h-4 rounded-full border shrink-0 ${
                          isActive ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[var(--border-strong)]'
                        }`}
                      />
                      <span className="min-w-0">
                        <span className="block text-sm text-[var(--fg)] truncate">{opt.label}</span>
                        <span className="block text-xs text-[var(--fg-muted)] truncate">{opt.sublabel}</span>
                      </span>
                    </button>
                    {opt.id !== 'silence' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePreview(opt.id);
                        }}
                        title={isPlayingThis ? t('Stop preview') : t('Listen')}
                        aria-label={isPlayingThis ? t('Stop preview') : t('Listen')}
                        className={`${iconBtn} ${isPlayingThis ? 'text-[var(--accent)]' : 'text-[var(--fg-muted)]'}`}
                      >
                        {isPlayingThis ? <Pause className="w-[18px] h-[18px]" strokeWidth={1.8} /> : <Volume2 className="w-[18px] h-[18px]" strokeWidth={1.8} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-sm text-[var(--fg-muted)]">
              {t('Reward')} <span className="text-[var(--accent)] font-medium">D$ {estimatedReward.toLocaleString()}</span>
            </span>
            <button type="button" onClick={handleStart} className={startBtn}>
              <Play className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {t('Start {n} min', { n: durationMinutes })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
