import React, { useState, useEffect } from 'react';
import { Modal, Field, Input, Select, Button, Textarea } from './ui';
import { Goal, MissionArea } from '../types/models';
import { Target, Calendar, CheckCircle2 } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: {
    title: string;
    description?: string;
    area: MissionArea;
    targetDate?: string;
    status?: 'active' | 'achieved' | 'archived';
  }) => Promise<void>;
  initialGoal?: Goal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<MissionArea>('Work');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState<'active' | 'achieved' | 'archived'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || '');
      setArea(initialGoal.area);
      setTargetDate(initialGoal.targetDate || '');
      setStatus(initialGoal.status);
    } else {
      setTitle('');
      setDescription('');
      setArea('Work');
      setTargetDate('');
      setStatus('active');
    }
  }, [initialGoal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        area,
        targetDate: targetDate || undefined,
        status,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialGoal ? 'Edit Life Goal' : 'Create Life Goal'}
      subtitle="Anchor your daily micro-habits and focused missions to an overarching vision."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="goal-title"
          label="Goal Title"
          required
          helper="Define the overarching outcome or standard (e.g. 'Build a sustainable online income', 'Peak Physical Vitality')."
        >
          <Input
            id="goal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Build a sustainable online income"
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="goal-area" label="Life Domain">
            <Select
              id="goal-area"
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

          <Field
            id="goal-target-date"
            label="Target Date (Optional)"
            helper="Estimated completion or horizon."
          >
            <Input
              id="goal-target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </Field>
        </div>

        <Field
          id="goal-description"
          label="Why This Matters / Core Vision (Optional)"
          helper="A short rationale to reinforce motivation during resistance."
        >
          <Textarea
            id="goal-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the real-life transformation this goal creates..."
          />
        </Field>

        {initialGoal && (
          <Field id="goal-status" label="Status">
            <Select
              id="goal-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'achieved' | 'archived')}
              options={[
                { value: 'active', label: 'Active (Currently Pursuing)' },
                { value: 'achieved', label: 'Achieved (Celebrated Outcome)' },
                { value: 'archived', label: 'Archived (Deferred)' },
              ]}
            />
          </Field>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
          <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isSubmitting} icon={CheckCircle2}>
            {initialGoal ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
