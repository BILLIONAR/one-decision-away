import React, { useState, useEffect } from 'react';
import { Mission, MissionDifficulty, MissionType, MissionArea } from '../types/models';
import { Play, Pause, Square, X } from 'lucide-react';
import { getBaseReward } from '../services/economy';
import { useT } from '../i18n';

const primaryBtn =
  'h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';
const secondaryBtn =
  'h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] text-sm font-medium cursor-pointer disabled:opacity-40';
const ghostBtn = 'h-11 px-3 inline-flex items-center justify-center text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer';
const inputCls =
  'w-full h-11 px-3 bg-[var(--bg-muted)] text-[var(--fg)] rounded-[var(--radius-sm)] text-sm focus:outline-none placeholder:text-[var(--fg-subtle)]';
const labelCls = 'block text-sm text-[var(--fg-muted)]';

const Sheet: React.FC<{ isOpen: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode }> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  const t = useT();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 overflow-y-auto" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-[var(--bg)] rounded-[var(--radius-lg)] p-5 space-y-5 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-[var(--fg)]">{title}</h3>
            {subtitle && <p className="text-sm text-[var(--fg-muted)] mt-0.5 break-words">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="w-11 h-11 -mr-2 -mt-2 shrink-0 flex items-center justify-center text-[var(--fg-muted)] cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface CompleteMissionModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (params: {
    missionId: string;
    method: 'self' | 'timer' | 'photo';
    focusMinutes?: number;
    note?: string;
    reflection: { completedSummary: string; resistanceNoticed: string; nextStep: string };
  }) => Promise<void>;
}

export const CompleteMissionModal: React.FC<CompleteMissionModalProps> = ({
  mission,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const t = useT();
  const [method, setMethod] = useState<'self' | 'timer' | 'photo'>('self');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState(mission?.estimatedMinutes || 25);

  const [completedSummary, setCompletedSummary] = useState('');
  const [resistanceNoticed, setResistanceNoticed] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [photoNote, setPhotoNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mission) {
      setTargetMinutes(mission.estimatedMinutes || 25);
      setTimerSeconds((mission.estimatedMinutes || 25) * 60);
      setCompletedSummary(t('Finished: {title}', { title: mission.title }));
      setResistanceNoticed('');
      setNextStep('');
    }
  }, [mission, t]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!mission) return null;

  const reward = getBaseReward(mission.type, mission.difficulty, mission.isOneDecision);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = async () => {
    if (!completedSummary.trim()) return;
    try {
      setIsSubmitting(true);
      const focusMins = method === 'timer' ? Math.round((targetMinutes * 60 - timerSeconds) / 60) : mission.estimatedMinutes;
      await onConfirm({
        missionId: mission.id,
        method,
        focusMinutes: focusMins,
        note: photoNote,
        reflection: {
          completedSummary: completedSummary.trim(),
          resistanceNoticed: resistanceNoticed.trim() || t('None reported.'),
          nextStep: nextStep.trim() || t('Continue daily rhythm.'),
        },
      });
      onClose();
    } catch (e) {
      // Handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const methods: { id: 'self' | 'timer' | 'photo'; label: string }[] = [
    { id: 'self', label: t('Done') },
    { id: 'timer', label: t('Timer') },
    { id: 'photo', label: t('Note') },
  ];

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={mission.isOneDecision ? t("Complete today's decision") : t('Complete mission')}
      subtitle={t(mission.title)}
    >
      <div className="space-y-5">
        <div className="flex p-1 bg-[var(--bg-muted)] rounded-[var(--radius-sm)]">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`flex-1 h-10 rounded-[var(--radius-xs)] text-sm font-medium transition-colors cursor-pointer ${
                method === m.id ? 'bg-[var(--bg)] text-[var(--fg)]' : 'text-[var(--fg-muted)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {method === 'timer' && (
          <div className="p-5 bg-[var(--bg-muted)] rounded-[var(--radius-md)] text-center space-y-4">
            <div className="text-4xl font-semibold tracking-tight text-[var(--fg)] tabular-nums">{formatTime(timerSeconds)}</div>
            <div className="flex items-center justify-center gap-2">
              {!isTimerRunning ? (
                <button type="button" onClick={() => setIsTimerRunning(true)} className={primaryBtn}>
                  <Play className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  {t('Start')}
                </button>
              ) : (
                <button type="button" onClick={() => setIsTimerRunning(false)} className={secondaryBtn}>
                  <Pause className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  {t('Pause')}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(targetMinutes * 60);
                }}
                className={secondaryBtn}
              >
                <Square className="w-[18px] h-[18px]" strokeWidth={1.8} />
                {t('Reset')}
              </button>
            </div>
          </div>
        )}

        {method === 'photo' && (
          <div className="space-y-1.5">
            <label htmlFor="photo-note" className={labelCls}>
              {t('What did you produce?')}
            </label>
            <input
              id="photo-note"
              value={photoNote}
              onChange={(e) => setPhotoNote(e.target.value)}
              placeholder={t('e.g. 1,200 words drafted')}
              className={inputCls}
            />
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="q1" className={labelCls}>
              {t('What did you complete?')}
            </label>
            <input
              id="q1"
              value={completedSummary}
              onChange={(e) => setCompletedSummary(e.target.value)}
              placeholder={t('The tangible output')}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="q2" className={labelCls}>
              {t('What resistance did you notice?')}
            </label>
            <input
              id="q2"
              value={resistanceNoticed}
              onChange={(e) => setResistanceNoticed(e.target.value)}
              placeholder={t('Optional')}
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="q3" className={labelCls}>
              {t('What is the next step?')}
            </label>
            <input
              id="q3"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder={t('Optional')}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm border-t border-[var(--border)] pt-4">
          <span className="text-[var(--fg-muted)]">{t('Reward')}</span>
          <span className="font-medium text-[var(--accent)]">
            {mission.type === 'constraint' ? t('Rule kept') : `D$ ${reward.toLocaleString()}`}
          </span>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={ghostBtn}>
            {t('Cancel')}
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={!completedSummary.trim() || isSubmitting}
            className={primaryBtn}
          >
            {isSubmitting ? t('Saving') : t('Confirm')}
          </button>
        </div>
      </div>
    </Sheet>
  );
};

interface CreateMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mission: {
    title: string;
    type: MissionType;
    area: MissionArea;
    difficulty: MissionDifficulty;
    estimatedMinutes: number;
    isOneDecision: boolean;
  }) => Promise<void>;
}

export const CreateMissionModal: React.FC<CreateMissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const t = useT();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MissionType>('daily_quest');
  const [area, setArea] = useState<MissionArea>('Work');
  const [difficulty, setDifficulty] = useState<MissionDifficulty>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        type,
        area,
        difficulty,
        estimatedMinutes,
        isOneDecision: false,
      });
      setTitle('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    { value: 'daily_quest', label: t('Daily (D$50–400)') },
    { value: 'weekly_mission', label: t('Weekly (D$1,000)') },
    { value: 'monthly_boss_fight', label: t('Monthly (D$5,000–10,000)') },
    { value: 'one_year_mission', label: t('One year (D$25,000)') },
    { value: 'constraint', label: t('Rule') },
  ];
  const areaOptions = [
    { value: 'Work', label: t('Work') },
    { value: 'Money', label: t('Money') },
    { value: 'Health', label: t('Health') },
    { value: 'Learning', label: t('Learning') },
    { value: 'Relationships', label: t('Relationships') },
    { value: 'Environment', label: t('Environment') },
    { value: 'Personal Meaning', label: t('Meaning') },
  ];
  const difficultyOptions = [
    { value: 'easy', label: t('Easy, under 45 min') },
    { value: 'medium', label: t('Medium, 45–120 min') },
    { value: 'hard', label: t('Hard, 2 hours or more') },
  ];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={t('New mission')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="mission-title" className={labelCls}>
            {t('What will you do?')}
          </label>
          <input
            id="mission-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('e.g. Send the proposal to two clients')}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="mission-type" className={labelCls}>
              {t('Type')}
            </label>
            <select id="mission-type" value={type} onChange={(e) => setType(e.target.value as MissionType)} className={inputCls}>
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="mission-area" className={labelCls}>
              {t('Area')}
            </label>
            <select id="mission-area" value={area} onChange={(e) => setArea(e.target.value as MissionArea)} className={inputCls}>
              {areaOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="mission-difficulty" className={labelCls}>
              {t('Difficulty')}
            </label>
            <select
              id="mission-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as MissionDifficulty)}
              className={inputCls}
            >
              {difficultyOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="mission-time" className={labelCls}>
              {t('Minutes')}
            </label>
            <input
              id="mission-time"
              type="number"
              min={5}
              max={600}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 30)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={ghostBtn}>
            {t('Cancel')}
          </button>
          <button type="submit" disabled={!title.trim() || isSubmitting} className={primaryBtn}>
            {isSubmitting ? t('Saving') : t('Add')}
          </button>
        </div>
      </form>
    </Sheet>
  );
};
