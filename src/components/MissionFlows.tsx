import React, { useState, useEffect } from 'react';
import { Mission, MissionDifficulty, MissionType, MissionArea } from '../types/models';
import { Modal, Button, Field, Input, Textarea, Select, Badge, Card } from './ui';
import { Play, Pause, Square, CheckCircle, Clock, ShieldCheck, Flame } from 'lucide-react';
import { getBaseReward, evaluateMissionReward, computeLedgerBalance } from '../services/economy';

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
      setCompletedSummary(`Finished: ${mission.title}`);
      setResistanceNoticed('');
      setNextStep('');
    }
  }, [mission]);

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
          resistanceNoticed: resistanceNoticed.trim() || 'None reported.',
          nextStep: nextStep.trim() || 'Continue daily rhythm.',
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
      title={mission.isOneDecision ? "Complete Today's One Decision" : 'Complete Mission'}
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
            Direct Completion
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
            Focus Timer
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
            Proof Note
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
                  Start Focus
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Pause}
                  onClick={() => setIsTimerRunning(false)}
                >
                  Pause
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
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Proof Note */}
        {method === 'photo' && (
          <Field id="photo-note" label="Optional Proof / Observation" helper="Record any specific outcome or metric.">
            <Input
              id="photo-note"
              value={photoNote}
              onChange={(e) => setPhotoNote(e.target.value)}
              placeholder="e.g. 1,200 words drafted in Obsidian, 3 bug fixes pushed"
            />
          </Field>
        )}

        {/* Required 3 Reflection Questions */}
        <div className="p-4 bg-[var(--bg-muted)]/60 rounded-[var(--radius-md)] border border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--color-sage)]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
              30-Second Reflection Loop
            </h4>
          </div>

          <Field
            id="q1"
            label="1. What did you complete?"
            required
            helper="Name the tangible output or boundary held."
          >
            <Input
              id="q1"
              value={completedSummary}
              onChange={(e) => setCompletedSummary(e.target.value)}
              placeholder="e.g. Completed initial wireframes and reviewed database schema"
            />
          </Field>

          <Field
            id="q2"
            label="2. What resistance did you notice?"
            helper="Distraction urges, boredom, self-doubt, perfectionism."
          >
            <Input
              id="q2"
              value={resistanceNoticed}
              onChange={(e) => setResistanceNoticed(e.target.value)}
              placeholder="e.g. Felt the urge to check phone at the 20-minute mark"
            />
          </Field>

          <Field
            id="q3"
            label="3. What is the next meaningful step?"
            helper="The next single domino to set up tomorrow."
          >
            <Input
              id="q3"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="e.g. Connect the payment webhook and test edge case"
            />
          </Field>
        </div>

        {/* Reward Preview */}
        <div className="flex items-center justify-between p-3.5 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-[var(--radius-md)]">
          <div>
            <span className="text-xs text-[var(--fg-muted)]">Verified Reward</span>
            <div className="text-sm font-bold text-[var(--color-sage)]">
              {mission.type === 'constraint' ? 'Rule Kept (Vote Recorded)' : `+ D$${reward.toLocaleString()}`}
            </div>
          </div>
          <Badge variant="sage">Vote for Future</Badge>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="accent"
            icon={CheckCircle}
            isLoading={isSubmitting}
            onClick={handleFinish}
            disabled={!completedSummary.trim()}
          >
            Confirm & Claim D$
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
    <Modal isOpen={isOpen} onClose={onClose} title="Create Mission" subtitle="Structure a real-world task tied to your future.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="mission-title" label="Mission Title" required helper="Be concrete: specify what finishing looks like.">
          <Input
            id="mission-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Write and send proposal to 2 corporate clients"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="mission-type" label="Mission Type">
            <Select
              id="mission-type"
              value={type}
              onChange={(e) => setType(e.target.value as MissionType)}
              options={[
                { value: 'daily_quest', label: 'Daily Quest (D$50-400)' },
                { value: 'weekly_mission', label: 'Weekly Mission (D$1,000)' },
                { value: 'monthly_boss_fight', label: 'Monthly Boss Fight (D$5,000-10,000)' },
                { value: 'one_year_mission', label: 'One-Year Mission (D$25,000)' },
                { value: 'constraint', label: 'Personal Constraint (Rule of Game)' },
              ]}
            />
          </Field>

          <Field id="mission-area" label="Life Domain">
            <Select
              id="mission-area"
              value={area}
              onChange={(e) => setArea(e.target.value as MissionArea)}
              options={[
                { value: 'Work', label: 'Work & Enterprise' },
                { value: 'Money', label: 'Money & Wealth' },
                { value: 'Health', label: 'Health & Vitality' },
                { value: 'Learning', label: 'Learning & Craft' },
                { value: 'Relationships', label: 'Relationships' },
                { value: 'Environment', label: 'Environment & Space' },
                { value: 'Personal Meaning', label: 'Personal Meaning' },
              ]}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="mission-difficulty" label="Difficulty">
            <Select
              id="mission-difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as MissionDifficulty)}
              options={[
                { value: 'easy', label: 'Easy (< 45 min)' },
                { value: 'medium', label: 'Medium (45-119 min)' },
                { value: 'hard', label: 'Hard (120+ min / High Resistance)' },
              ]}
            />
          </Field>

          <Field id="mission-time" label="Estimated Minutes">
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
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting} disabled={!title.trim()}>
            Create Mission
          </Button>
        </div>
      </form>
    </Modal>
  );
};
