import React, { useState, useEffect } from 'react';
import { Goal, MissionArea } from '../types/models';
import { X } from 'lucide-react';
import { useT } from '../i18n';

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

const inputCls =
  'w-full h-11 px-3 bg-[var(--bg-muted)] text-[var(--fg)] rounded-[var(--radius-sm)] text-sm focus:outline-none placeholder:text-[var(--fg-subtle)]';
const textareaCls =
  'w-full p-3 bg-[var(--bg-muted)] text-[var(--fg)] rounded-[var(--radius-sm)] text-sm focus:outline-none placeholder:text-[var(--fg-subtle)] resize-y min-h-[88px] leading-relaxed';
const labelCls = 'block text-sm text-[var(--fg-muted)]';

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialGoal,
}) => {
  const t = useT();
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

  if (!isOpen) return null;

  const areaOptions = [
    { value: 'Work', label: t('Work') },
    { value: 'Money', label: t('Money') },
    { value: 'Health', label: t('Health') },
    { value: 'Learning', label: t('Learning') },
    { value: 'Relationships', label: t('Relationships') },
    { value: 'Environment', label: t('Environment') },
    { value: 'Personal Meaning', label: t('Meaning') },
  ];
  const statusOptions = [
    { value: 'active', label: t('Active') },
    { value: 'achieved', label: t('Achieved') },
    { value: 'archived', label: t('Archived') },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 overflow-y-auto" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[var(--bg)] rounded-[var(--radius-lg)] p-5 space-y-5 my-auto max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-[var(--fg)]">
            {initialGoal ? t('Edit goal') : t('New goal')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="w-11 h-11 -mr-2 -mt-2 shrink-0 flex items-center justify-center text-[var(--fg-muted)] cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="goal-title" className={labelCls}>
              {t('Goal')}
            </label>
            <input
              id="goal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('e.g. Build a steady online income')}
              autoFocus
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="goal-area" className={labelCls}>
                {t('Area')}
              </label>
              <select id="goal-area" value={area} onChange={(e) => setArea(e.target.value as MissionArea)} className={inputCls}>
                {areaOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="goal-target-date" className={labelCls}>
                {t('Target date')}
              </label>
              <input
                id="goal-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="goal-description" className={labelCls}>
              {t('Why it matters')}
            </label>
            <textarea
              id="goal-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('Optional')}
              className={textareaCls}
            />
          </div>

          {initialGoal && (
            <div className="space-y-1.5">
              <label htmlFor="goal-status" className={labelCls}>
                {t('Status')}
              </label>
              <select
                id="goal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'achieved' | 'archived')}
                className={inputCls}
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 px-3 inline-flex items-center justify-center text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer disabled:opacity-40"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="h-11 px-4 inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('Saving') : initialGoal ? t('Save') : t('Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
