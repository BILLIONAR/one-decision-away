import React, { useState, useEffect } from 'react';
import { Mission, MissionDifficulty, MissionType, MissionArea } from '../types/models';
import { Modal, Button, Field, Input, Textarea, Select, Badge, Card } from './ui';
import { Play, Pause, Square, CheckCircle, Clock, ShieldCheck, Flame } from 'lucide-react';
import { getBaseReward, evaluateMissionReward, computeLedgerBalance } from '../services/economy';
import { useT } from '../i18n';

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

  // Reflection questions
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mission.isOneDecision ? t("Complete Today's One Decision") : t('Complete Mission')}
      subtitle={mission.title}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Method selector */}
        <div className="flex rounded-[var(--radius-md)] bg-[var(--bg-muted)] p-1 border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setMethod('self')}
            className={`flex-1 py-2 text-xs font-semibold rounded-[var(--radius-sm)] transition-all cursor-pointer ${
              method === 'self'
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {t('Direct Completion')}
          </button>
          <button
            type="button"
            onClick={() => setMethod('timer')}
            className={`flex-1 py-2 text-xs font-semibold rounded-[var(--radius-sm)] transition-all cursor-pointer ${
              method === 'timer'
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {t('Focus Timer')}
          </button>
          <button
            type="button"
            onClick={() => setMethod('photo')}
            className={`flex-1 py-2 text-xs font-semibold rounded-[var(--radius-sm)] transition-all cursor-pointer ${
              method === 'photo'
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {t('Proof Note')}
          </button>
        </div>

        {/* Timer View */}
        {method === 'timer' && (
          <div className="p-6 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-lg)] text-center">
            <div className="text-4xl font-mono font-bold text-[var(--fg)] mb-4">
              {formatTime(timerSeconds)}
            </div>
            <div className="flex items-center justify-center gap-3">
              {!isTimerRunning ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Play}
                  onClick={() => setIsTimerRunning(true)}
                >
                  {t('Start Focus')}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Pause}
                  onClick={() => setIsTimerRunning(false)}
                >
                  {t('Pause')}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                icon={Square}
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(targetMinutes * 60);
                }}
              >
                {t('Reset')}
              </Button>
            </div>
          </div>
        )}

        {/* Proof Note */}
        {method === 'photo' && (
          <Field id="photo-note" label={t('Optional Proof / Observation')} helper={t('Record any specific outcome or metric.')}>
            <Input
              id="photo-note"
              value={photoNote}
              onChange={(e) => setPhotoNote(e.target.value)}
              placeholder={t('e.g. 1,200 words drafted in Obsidian, 3 bug fixes pushed')}
            />
          </Field>
        )}

        {/* Required 3 Reflection Questions */}
        <div className="p-4 bg-[var(--bg-muted)]/60 rounded-[var(--radius-md)] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--color-sage)]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
              {t('30-Second Reflection Loop')}
            </h4>
          </div>

          <Field
            id="q1"
            label={t('1. What did you complete?')}
            required
            helper={t('Name the tangible output or boundary held.')}
          >
            <Input
              id="q1"
              value={completedSummary}
              onChange={(e) => setCompletedSummary(e.target.value)}
              placeholder={t('e.g. Completed initial wireframes and reviewed database schema')}
            />
          </Field>

          <Field
            id="q2"
            label={t('2. What resistance did you notice?')}
            helper={t('Distraction urges, boredom, self-doubt, perfectionism.')}
          >
            <Input
              id="q2"
              value={resistanceNoticed}
              onChange={(e) => setResistanceNoticed(e.target.value)}
              placeholder={t('e.g. Felt the urge to check phone at the 20-minute mark')}
            />
          </Field>

          <Field
            id="q3"
            label={t('3. What is the next meaningful step?')}
            helper={t('The next single domino to set up tomorrow.')}
          >
            <Input
              id="q3"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder={t('e.g. Connect the payment webhook and test edge case')}
            />
          </Field>
        </div>

        {/* Reward Preview */}
        <div className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)]">
          <div>
            <span className="text-xs text-[var(--fg-muted)]">{t('Verified Reward')}</span>
            <div className="text-sm font-bold text-[var(--color-sage)]">
              {mission.type === 'constraint' ? t('Rule Kept (Vote Recorded)') : `+ D$${reward.toLocaleString()}`}
            </div>
          </div>
          <Badge variant="sage">{t('Vote for Future')}</Badge>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            variant="accent"
            icon={CheckCircle}
            isLoading={isSubmitting}
            onClick={handleFinish}
            disabled={!completedSummary.trim()}
          >
            {t('Confirm & Claim D$')}
          </Button>
        </div>
      </div>
    </Modal>
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('Create Mission')} subtitle={t('Structure a real-world task tied to your future.')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="mission-title" label={t('Mission Title')} required helper={t('Be concrete: specify what finishing looks like.')}>
          <Input
            id="mission-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('e.g. Write and send proposal to 2 corporate clients')}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="mission-type" label={t('Mission Type')}>
            <Select
              id="mission-type"
              value={type}
              onChange={(e) => setType(e.target.value as MissionType)}
              options={[
                { value: 'daily_quest', label: t('Daily Quest (D$50-400)') },
                { value: 'weekly_mission', label: t('Weekly Mission (D$1,000)') },
                { value: 'monthly_boss_fight', label: t('Monthly Boss Fight (D$5,000-10,000)') },
                { value: 'one_year_mission', label: t('One-Year Mission (D$25,000)') },
                { value: 'constraint', label: t('Personal Constraint (Rule of Game)') },
              ]}
            />
          </Field>

          <Field id="mission-area" label={t('Life Domain')}>
            <Select
              id="mission-area"
              value={area}
              onChange={(e) => setArea(e.target.value as MissionArea)}
              options={[
                { value: 'Work', label: t('Work & Enterprise') },
                { value: 'Money', label: t('Money & Wealth') },
                { value: 'Health', label: t('Health & Vitality') },
                { value: 'Learning', label: t('Learning & Craft') },
                { value: 'Relationships', label: t('Relationships') },
                { value: 'Environment', label: t('Environment & Space') },
                { value: 'Personal Meaning', label: t('Personal Meaning') },
              ]}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="mission-difficulty" label={t('Difficulty')}>
            <Select
              id="mission-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as MissionDifficulty)}
              options={[
                { value: 'easy', label: t('Easy (< 45 min)') },
                { value: 'medium', label: t('Medium (45-119 min)') },
                { value: 'hard', label: t('Hard (120+ min / High Resistance)') },
              ]}
            />
          </Field>

          <Field id="mission-time" label={t('Estimated Minutes')}>
            <Input
              id="mission-time"
              type="number"
              min={5}
              max={600}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(parseInt(e.target.value) || 30)}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
          <Button variant="ghost" type="button" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting} disabled={!title.trim()}>
            {t('Create Mission')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
