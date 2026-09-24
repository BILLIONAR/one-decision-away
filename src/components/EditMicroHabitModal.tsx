import React, { useState, useEffect } from 'react';
import { Modal, Field, Input, Select, Button, Textarea } from './ui';
import { MicroHabit, MicroHabitCategory, CustomHabitCategory, Goal } from '../types/models';
import { Trash2, Plus } from 'lucide-react';
import { useT } from '../i18n';

interface EditMicroHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: MicroHabit | null;
  goals: Goal[];
  customCategories: CustomHabitCategory[];
  onSave: (
    habitId: string,
    updates: Partial<Omit<MicroHabit, 'id' | 'createdAt'>>
  ) => Promise<void>;
  onDelete: (habitId: string) => Promise<void>;
  onOpenCreateGoalModal: () => void;
}

const PREDEFINED_CATEGORIES: MicroHabitCategory[] = [
  'Health',
  'Mindset',
  'Discipline',
  'Clarity',
  'Craft',
  'Environment',
  'Learning',
];

export const EditMicroHabitModal: React.FC<EditMicroHabitModalProps> = ({
  isOpen,
  onClose,
  habit,
  goals,
  customCategories,
  onSave,
  onDelete,
  onOpenCreateGoalModal,
}) => {
  const t = useT();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryType, setCategoryType] = useState<string>('Health');
  const [goalId, setGoalId] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (habit) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setGoalId(habit.goalId || '');
      setDurationMinutes(habit.durationMinutes || 5);

      if (habit.customCategoryId) {
        setCategoryType(`custom:${habit.customCategoryId}`);
      } else {
        setCategoryType(habit.category);
      }
    }
  }, [habit, isOpen]);

  if (!habit) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);

      let finalCategory: MicroHabitCategory = 'Health';
      let finalCustomCategoryId: string | undefined = undefined;

      if (categoryType.startsWith('custom:')) {
        const catId = categoryType.replace('custom:', '');
        const matched = customCategories.find((c) => c.id === catId);
        finalCategory = (matched?.name as MicroHabitCategory) || 'Custom';
        finalCustomCategoryId = catId;
      } else {
        finalCategory = categoryType as MicroHabitCategory;
      }

      await onSave(habit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category: finalCategory,
        customCategoryId: finalCustomCategoryId,
        goalId: goalId.trim() ? goalId.trim() : undefined,
        durationMinutes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('Are you sure you want to delete the micro-habit "{title}"?', { title: t(habit.title) }))) {
      try {
        setIsDeleting(true);
        await onDelete(habit.id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Build category options
  const categoryOptions = [
    { value: '---built-in---', label: t('Core'), disabled: true },
    ...PREDEFINED_CATEGORIES.map((cat) => ({
      value: cat,
      label: t(cat),
    })),
    ...(customCategories.length > 0
      ? [
          { value: '---custom---', label: t('Custom'), disabled: true },
          ...customCategories.map((c) => ({
            value: `custom:${c.id}`,
            label: c.name,
          })),
        ]
      : []),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('Edit habit')} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Field id="edit-habit-title" label={t('Title')} required>
          <Input
            id="edit-habit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('e.g. Drink a glass of water')}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="edit-habit-category" label={t('Category')}>
            <Select
              id="edit-habit-category"
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              options={categoryOptions}
            />
          </Field>

          <Field id="edit-habit-duration" label={t('Minutes')}>
            <Input
              id="edit-habit-duration"
              type="number"
              min={1}
              max={30}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 5))}
            />
          </Field>
        </div>

        {/* Goal link */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="edit-habit-goal-select" className="block text-[13px] font-medium text-[var(--fg-muted)]">
              {t('Goal (optional)')}
            </label>
            <button
              type="button"
              onClick={onOpenCreateGoalModal}
              className="h-8 -mr-2 px-2 rounded-full flex items-center gap-1 text-[13px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={1.8} /> {t('New goal')}
            </button>
          </div>
          <Select
            id="edit-habit-goal-select"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            options={[
              { value: '', label: t('None') },
              ...goals.map((g) => ({
                value: g.id,
                label: `${t(g.title)} · ${t(g.area)}`,
              })),
            ]}
          />
          <p className="text-[12px] text-[var(--fg-subtle)] leading-relaxed">
            {t('Linked habits count toward that goal in Progress.')}
          </p>
        </div>

        <Field id="edit-habit-description" label={t('Notes (optional)')}>
          <Textarea
            id="edit-habit-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('A cue or a small detail that makes it easier.')}
          />
        </Field>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
            className="text-[var(--danger)] hover:text-[var(--danger)]"
            icon={Trash2}
          >
            {isDeleting ? t('Deleting…') : t('Delete')}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {t('Save')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
