import React, { useState, useEffect } from 'react';
import { Modal, Field, Input, Select, Button, Textarea } from './ui';
import { MicroHabit, MicroHabitCategory, CustomHabitCategory, Goal } from '../types/models';
import { Target, CheckCircle2, Trash2, Plus, Sparkles } from 'lucide-react';
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
    if (window.confirm(t('Are you sure you want to delete the micro-habit "{title}"?', { title: habit.title }))) {
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
    { value: '---built-in---', label: t('── Core Categories ──'), disabled: true },
    ...PREDEFINED_CATEGORIES.map((cat) => ({
      value: cat,
      label: t(cat),
    })),
    ...(customCategories.length > 0
      ? [
          { value: '---custom---', label: t('── Custom Categories ──'), disabled: true },
          ...customCategories.map((c) => ({
            value: `custom:${c.id}`,
            label: `✨ ${c.name}`,
          })),
        ]
      : []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Edit Micro-Habit')}
      subtitle={t('Update routine details or tag to an overarching life goal.')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field id="edit-habit-title" label={t('Habit Title')} required>
          <Input
            id="edit-habit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('e.g. 5-Min Hydration & Mineral Protocol')}
          />
        </Field>

        {/* Goal Tagging Section */}
        <div className="p-3.5 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)] uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{t('Overarching Life Goal Tag')}</span>
            </div>
            <button
              type="button"
              onClick={onOpenCreateGoalModal}
              className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 font-medium"
            >
              <Plus className="w-3 h-3" /> {t('New Goal')}
            </button>
          </div>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            {t('Linking this habit to a Goal visualizes daily consistency as direct momentum toward that life objective in your Missions and Progress views.')}
          </p>
          <Select
            id="edit-habit-goal-select"
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            options={[
              { value: '', label: t('── None (Standalone Routine) ──') },
              ...goals.map((g) => ({
                value: g.id,
                label: `🎯 ${g.title} (${g.area})`,
              })),
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="edit-habit-category" label={t('Category')}>
            <Select
              id="edit-habit-category"
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value)}
              options={categoryOptions}
            />
          </Field>

          <Field id="edit-habit-duration" label={t('Duration (Minutes)')}>
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

        <Field
          id="edit-habit-description"
          label={t('Execution Protocol / Context')}
          helper={t("Specific friction-reducing cue or formula (e.g. '500ml water with sea salt upon waking').")}
        >
          <Textarea
            id="edit-habit-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('Specific trigger, routine, or ritual...')}
          />
        </Field>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <Button
            variant="ghost"
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
            className="text-[var(--danger)] hover:bg-[var(--danger)]/10"
            icon={Trash2}
          >
            {isDeleting ? t('Deleting...') : t('Delete Habit')}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isSubmitting}>
              {t('Cancel')}
            </Button>
            <Button variant="primary" type="submit" loading={isSubmitting} icon={CheckCircle2}>
              {t('Save Changes')}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
