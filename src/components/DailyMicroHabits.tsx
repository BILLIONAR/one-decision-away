import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Progress, Input, Field } from './ui';
import {
  Check,
  Plus,
  Play,
  Trash2,
  Sparkles,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Heart,
  BookOpen,
  Target,
  Brain,
  Wrench,
  Home,
  TrendingUp,
  Folder,
  Volume2,
  Edit3,
  Tag,
} from 'lucide-react';
import { MicroHabit, MicroHabitCategory, CustomHabitCategory } from '../types/models';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { calculateBestMicroHabitStreak } from '../services/microHabitsService';
import { MicroHabitCheckbox } from './MicroHabitCheckbox';
import { resolveCategoryConfig, ICON_MAP } from '../utils/categoryHelpers';
import { CustomCategoryModal } from './CustomCategoryModal';
import { GoalModal } from './GoalModal';
import { EditMicroHabitModal } from './EditMicroHabitModal';
import { useT, N_ } from '../i18n';

export interface CategoryConfig {
  id: MicroHabitCategory;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color?: string;
  glowColor?: string;
  secondaryColor?: string;
  isCustom?: boolean;
  customCategory?: CustomHabitCategory;
  badgeVariant: 'sage' | 'coral' | 'slate' | 'default';
  description: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  soundCueName?: string;
  soundCueDetail?: string;
  hapticDetail?: string;
}

export const PREDEFINED_CATEGORIES: CategoryConfig[] = [
  {
    id: 'Health',
    label: N_('Health'),
    icon: Heart,
    badgeVariant: 'sage',
    description: N_('Physical vitality, hydration, nutrition & daily movement'),
    colorClass: 'text-[var(--fg)]',
    bgClass: 'bg-[var(--bg-inset)]',
    borderClass: 'border-[var(--border)]',
    soundCueName: N_('528Hz Vitality Bloom'),
    soundCueDetail: N_('Warm Solfeggio vitality bloom (528Hz + 660Hz)'),
    hapticDetail: N_('Heartbeat pulse [35ms, 40ms]'),
  },
  {
    id: 'Learning',
    label: N_('Learning'),
    icon: BookOpen,
    badgeVariant: 'default',
    description: N_('Knowledge acquisition, reading, study & intellectual craft'),
    colorClass: 'text-[var(--fg)]',
    bgClass: 'bg-[var(--bg-inset)]',
    borderClass: 'border-[var(--border)]',
    soundCueName: N_('Crystal Glissando'),
    soundCueDetail: N_('Ascending 4-note insight chime (E5 → G#5 → B5 → E6)'),
    hapticDetail: N_('Crisp double-tap [15ms, 25ms]'),
  },
  {
    id: 'Discipline',
    label: N_('Discipline'),
    icon: Target,
    badgeVariant: 'coral',
    description: N_('Friction reduction, impulse control, standards & consistency'),
    colorClass: 'text-[var(--fg)]',
    bgClass: 'bg-[var(--bg-inset)]',
    borderClass: 'border-[var(--border)]',
    soundCueName: N_('Bedrock Anchor'),
    soundCueDetail: N_('Resolute 330Hz strike with 165Hz sub-weight & 495Hz fifth'),
    hapticDetail: N_('Firm anchor pulse [65ms]'),
  },
  {
    id: 'Mindset',
    label: N_('Mindset'),
    icon: Brain,
    badgeVariant: 'coral',
    description: N_('Cognitive reframing, future self identity & gratitude'),
    colorClass: 'text-[var(--fg)]',
    bgClass: 'bg-[var(--bg-inset)]',
    borderClass: 'border-[var(--border)]',
    soundCueName: N_('432Hz Zen Bowl'),
    soundCueDetail: N_('Harmonic singing bowl resonance (432Hz + 864Hz)'),
    hapticDetail: N_('Smooth meditative wave [25ms, 20ms]'),
  },
  {
    id: 'Clarity',
    label: N_('Clarity'),
    icon: Sparkles,
    badgeVariant: 'sage',
    description: N_('Breathing, meditation & mental space decluttering'),
    colorClass: 'text-[var(--fg)]',
    bgClass: 'bg-[var(--bg-inset)]',
    borderClass: 'border-[var(--border)]',
    soundCueName: N_('Harmonic Dual Bell'),
    soundCueDetail: N_('Uplifting clarity chime [1046Hz → 1568Hz]'),
    hapticDetail: N_('Confirmation tap [30ms]'),
  },
  {
    id: 'Craft',
    label: N_('Craft'),
    icon: Wrench,
    badgeVariant: 'default',
    description: N_('Technical execution, deliberate practice & creative output'),
    colorClass: 'text-[var(--fg)]',
    bgClass: 'bg-[var(--bg-muted)]',
    borderClass: 'border-[var(--border-strong)]',
    soundCueName: N_('Precision Bell'),
    soundCueDetail: N_('Resonant execution chime'),
    hapticDetail: N_('Tactile tap [30ms]'),
  },
  {
    id: 'Environment',
    label: N_('Environment'),
    icon: Home,
    badgeVariant: 'slate',
    description: N_('Physical desk workspace, browser tabs & staged surroundings'),
    colorClass: 'text-[var(--fg-muted)]',
    bgClass: 'bg-[var(--bg-muted)]',
    borderClass: 'border-[var(--border)]',
    soundCueName: N_('Spacious Tone'),
    soundCueDetail: N_('Open ambient tone'),
    hapticDetail: N_('Tactile tap [30ms]'),
  },
  {
    id: 'Wealth',
    label: N_('Wealth'),
    icon: TrendingUp,
    badgeVariant: 'coral',
    description: N_('Resource management, value creation & leverage tracking'),
    colorClass: 'text-[var(--fg)]',
    bgClass: 'bg-[var(--bg-inset)]',
    borderClass: 'border-[var(--border)]',
    soundCueName: N_('Prosperity Chime'),
    soundCueDetail: N_('Harmonic abundance tone'),
    hapticDetail: N_('Tactile tap [30ms]'),
  },
];

export interface HabitBestStreakIndicatorProps {
  habit: MicroHabit;
  todayStr?: string;
  showTooltip?: boolean;
}

export const HabitBestStreakIndicator: React.FC<HabitBestStreakIndicatorProps> = ({
  habit,
  todayStr = new Date().toISOString().slice(0, 10),
  showTooltip = true,
}) => {
  const t = useT();
  const currentStreak = habit.streakCount || 0;
  const bestStreak = calculateBestMicroHabitStreak(
    habit.completedDates || [],
    currentStreak,
    habit.bestStreak || 0
  );
  const totalCompletions = Array.isArray(habit.completedDates)
    ? habit.completedDates.length
    : 0;
  const isAtRecord = currentStreak >= bestStreak && currentStreak > 0;
  const daysToMatch = Math.max(0, bestStreak - currentStreak);
  void todayStr;

  return (
    <span
      className={`inline-flex items-center text-[12px] tabular-nums ${isAtRecord ? 'text-[var(--accent)] font-medium' : 'text-[var(--fg-subtle)]'}`}
      aria-label={t('All-time best streak: {bestStreak} days. Current streak: {currentStreak} days.', { bestStreak, currentStreak })}
      title={
        showTooltip
          ? isAtRecord
            ? t('Personal best. {n} days logged in total.', { n: totalCompletions })
            : daysToMatch > 0
            ? t('Best {best} days. {n} more to match it.', { best: bestStreak, n: daysToMatch })
            : t('Best {best} days. {n} days logged in total.', { best: bestStreak, n: totalCompletions })
          : undefined
      }
    >
      {t('best {n}', { n: bestStreak })}
    </span>
  );
};

export const DailyMicroHabits: React.FC = () => {
  const {
    data,
    toggleMicroHabit,
    addMicroHabit,
    updateMicroHabit,
    deleteMicroHabit,
    addGoal,
    addCustomHabitCategory,
    deleteCustomHabitCategory,
    updateCustomHabitCategory,
    resetMicroHabitsToday,
    startFocusSession,
    simulateDateKeyChange,
    lastRolloverSummary,
  } = useApp();
  const t = useT();

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MicroHabitCategory | string>('Health');
  const [newCustomCategoryId, setNewCustomCategoryId] = useState<string | undefined>(undefined);
  const [newGoalId, setNewGoalId] = useState<string>('');
  const [newMinutes, setNewMinutes] = useState(5);
  const [newDescription, setNewDescription] = useState('');
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedGoalFilter, setSelectedGoalFilter] = useState<string>('ALL');

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CustomHabitCategory | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<MicroHabit | null>(null);

  if (!data) return null;

  const goals = data.goals || [];
  const habits = data.microHabits || [];
  const customCategories = data.customHabitCategories || [];
  const todayStr = new Date().toISOString().slice(0, 10);

  const completedCount = habits.filter((h) => h.completedDates.includes(todayStr)).length;
  const totalCount = habits.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter habits by goal if selected
  const activeHabits = habits.filter((h) => {
    if (selectedGoalFilter === 'ALL') return true;
    if (selectedGoalFilter === 'UNASSIGNED') return !h.goalId;
    return h.goalId === selectedGoalFilter;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await addMicroHabit({
      title: newTitle.trim(),
      category: newCategory,
      customCategoryId: newCustomCategoryId,
      goalId: newGoalId.trim() ? newGoalId.trim() : undefined,
      durationMinutes: newMinutes,
      description: newDescription.trim() || undefined,
    });

    setNewTitle('');
    setNewDescription('');
    setNewGoalId('');
    setNewMinutes(5);
    setIsAdding(false);
  };

  const getCategoryConfig = (cat: string): CategoryConfig => {
    const resolved = resolveCategoryConfig(cat, customCategories);
    return {
      id: resolved.id as MicroHabitCategory,
      label: resolved.label,
      icon: resolved.icon,
      color: resolved.color,
      glowColor: resolved.glowColor,
      secondaryColor: resolved.secondaryColor,
      isCustom: resolved.isCustom,
      customCategory: resolved.customCategory,
      badgeVariant: resolved.badgeVariant,
      description: resolved.description,
      colorClass: resolved.colorClass,
      bgClass: resolved.bgClass,
      borderClass: resolved.borderClass,
      soundCueName: resolved.soundCueName,
      soundCueDetail: resolved.soundCueDetail,
      hapticDetail: resolved.hapticDetail,
    };
  };

  // Group habits by predefined categories, custom categories, plus any extra
  const predefinedGroups = PREDEFINED_CATEGORIES.map((config) => {
    const categoryHabits = activeHabits.filter(
      (h) => h.category === config.id && !h.customCategoryId
    );
    return {
      config: {
        ...config,
        color: config.colorClass ? undefined : '#708879',
        isCustom: false,
      },
      habits: categoryHabits,
    };
  }).filter((group) => group.habits.length > 0);

  const customGroups = customCategories.map((cc) => {
    const config = getCategoryConfig(cc.id);
    const categoryHabits = activeHabits.filter(
      (h) => h.customCategoryId === cc.id || h.category.toLowerCase() === cc.name.toLowerCase()
    );
    return {
      config,
      habits: categoryHabits,
    };
  }).filter((group) => group.habits.length > 0);

  // Catch any habits with categories outside the predefined and custom list
  const knownCategoryIds = new Set([
    ...PREDEFINED_CATEGORIES.map((c) => c.id.toLowerCase()),
    ...customCategories.map((c) => c.id.toLowerCase()),
    ...customCategories.map((c) => c.name.toLowerCase()),
  ]);

  const otherHabits = activeHabits.filter((h) => {
    if (h.customCategoryId) {
      return !customCategories.some((c) => c.id === h.customCategoryId);
    }
    return !knownCategoryIds.has((h.category || '').toLowerCase());
  });

  const groupedHabits = [...predefinedGroups, ...customGroups];

  if (otherHabits.length > 0) {
    const otherConfig: CategoryConfig = {
      id: 'Mindset' as MicroHabitCategory,
      label: N_('Other Routines'),
      icon: Folder,
      badgeVariant: 'slate',
      description: N_('Additional custom categories'),
      colorClass: 'text-[var(--fg-muted)]',
      bgClass: 'bg-[var(--bg-muted)]',
      borderClass: 'border-[var(--border)]',
      soundCueName: N_('Standard Chime'),
      soundCueDetail: N_('Clean completion tone'),
      hapticDetail: N_('Confirmation tap [30ms]'),
    };
    groupedHabits.push({
      config: otherConfig,
      habits: otherHabits,
    });
  }

  // Filter groups if a specific category is selected
  const displayedGroups =
    selectedCategoryFilter === 'ALL'
      ? groupedHabits
      : groupedHabits.filter(
          (g) => g.config.id === selectedCategoryFilter || g.config.label === selectedCategoryFilter
        );

  const selectedCategoryMeta = getCategoryConfig(newCategory);

  const handleSaveCustomCategory = async (params: {
    id?: string;
    name: string;
    icon: string;
    color: string;
    description?: string;
  }) => {
    if (params.id) {
      await updateCustomHabitCategory(params.id, {
        name: params.name,
        icon: params.icon,
        color: params.color,
        description: params.description,
      });
    } else {
      const created = await addCustomHabitCategory({
        name: params.name,
        icon: params.icon,
        color: params.color,
        description: params.description,
      });
      if (created) {
        setNewCategory(created.name);
        setNewCustomCategoryId(created.id);
      }
    }
  };

  const handleDeleteCustomCategory = async (categoryId: string) => {
    await deleteCustomHabitCategory(categoryId);
    if (selectedCategoryFilter === categoryId) {
      setSelectedCategoryFilter('ALL');
    }
    if (newCustomCategoryId === categoryId) {
      setNewCategory('Health');
      setNewCustomCategoryId(undefined);
    }
  };

  return (
    <Card id="daily-micro-habits-section" padding="md" className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Micro-habits')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
            {totalCount === 0
              ? t('Small actions, five minutes each.')
              : progressPct === 100
              ? t('All done today.')
              : t('{completed} of {total} done today', { completed: completedCount, total: totalCount })}
          </p>
        </div>
        {!isAdding && (
          <Button id="btn-add-micro-habit" variant="secondary" size="sm" icon={Plus} onClick={() => setIsAdding(true)}>
            {t('Add')}
          </Button>
        )}
      </div>

      {totalCount > 0 && <Progress value={progressPct} variant="sage" />}

      {/* Category filter */}
      {groupedHabits.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`h-9 px-3.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors shrink-0 whitespace-nowrap ${selectedCategoryFilter === 'ALL' ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}
          >
            {t('All')}
          </button>
          {groupedHabits.map((group) => {
            const isSelected =
              selectedCategoryFilter === group.config.id || selectedCategoryFilter === group.config.label;
            return (
              <button
                key={group.config.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(group.config.id)}
                className={`h-9 px-3.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors shrink-0 whitespace-nowrap ${isSelected ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}
              >
                {t(group.config.label)} <span className="opacity-60">{group.habits.length}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Goal filter */}
      {goals.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
          <button
            type="button"
            onClick={() => setSelectedGoalFilter('ALL')}
            className={`h-9 px-3.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors shrink-0 whitespace-nowrap ${selectedGoalFilter === 'ALL' ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}
          >
            {t('All goals')}
          </button>
          {goals.map((g) => {
            const goalHabitsCount = habits.filter((h) => h.goalId === g.id).length;
            const isSelected = selectedGoalFilter === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedGoalFilter(g.id)}
                className={`h-9 px-3.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors shrink-0 whitespace-nowrap ${isSelected ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}
              >
                {g.title} <span className="opacity-60">{goalHabitsCount}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedGoalFilter('UNASSIGNED')}
            className={`h-9 px-3.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors shrink-0 whitespace-nowrap ${selectedGoalFilter === 'UNASSIGNED' ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}
          >
            {t('No goal')} <span className="opacity-60">{habits.filter((h) => !h.goalId).length}</span>
          </button>
        </div>
      )}

      {/* Add form */}
      {isAdding && (
        <form onSubmit={handleAddSubmit} className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg)] space-y-4">
          <h4 className="text-[15px] font-semibold text-[var(--fg)]">{t('New habit')}</h4>

          <Field id="micro-title" label={t('Habit')} required>
            <Input
              id="micro-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t('e.g. Drink a glass of water, 10 push-ups, read one page')}
              autoFocus
            />
          </Field>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="micro-goal-select" className="text-[13px] font-medium text-[var(--fg-muted)]">
                {t('Goal (optional)')}
              </label>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(true)}
                className="h-8 text-[13px] text-[var(--accent)] font-medium cursor-pointer"
              >
                {t('New goal')}
              </button>
            </div>
            <select
              id="micro-goal-select"
              value={newGoalId}
              onChange={(e) => setNewGoalId(e.target.value)}
              className="w-full h-11 px-3.5 text-[15px] rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg)] focus:outline-none"
            >
              <option value="">{t('None')}</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.area})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[var(--fg-muted)]">{t('Category')}</span>
              <button
                type="button"
                onClick={() => {
                  setCategoryToEdit(null);
                  setIsCategoryModalOpen(true);
                }}
                className="h-8 text-[13px] text-[var(--accent)] font-medium cursor-pointer"
              >
                {t('New category')}
              </button>
            </div>

            <div role="radiogroup" aria-label={t('Micro-habit category selection')} className="flex flex-wrap gap-2">
              {PREDEFINED_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = newCategory === cat.id && !newCustomCategoryId;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setNewCategory(cat.id);
                      setNewCustomCategoryId(undefined);
                    }}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 ${
                      isSelected ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t(cat.label)}
                  </button>
                );
              })}
              {customCategories.map((cc) => {
                const Icon = ICON_MAP[cc.icon] || Tag;
                const isSelected = newCustomCategoryId === cc.id || newCategory === cc.name;
                return (
                  <span key={cc.id} className="inline-flex items-center">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => {
                        setNewCategory(cc.name);
                        setNewCustomCategoryId(cc.id);
                      }}
                      className={`h-9 px-3.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 ${
                        isSelected ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cc.color }} />
                      <Icon className="w-4 h-4" />
                      {cc.name}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoryToEdit(cc);
                        setIsCategoryModalOpen(true);
                      }}
                      title={t('Edit this category')}
                      aria-label={t('Edit this category')}
                      className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </span>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 text-[13px] text-[var(--fg-muted)]">
              <span className="truncate">{t(selectedCategoryMeta.description)}</span>
              <button
                type="button"
                onClick={() =>
                  soundSynthesizer.playMicroHabitCue(newCategory, 'complete', selectedCategoryMeta.color)
                }
                title={t('Audition acoustic chime')}
                className="h-8 inline-flex items-center gap-1 text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>{t('Chime')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field id="micro-mins" label={t('Minutes')}>
              <Input
                id="micro-mins"
                type="number"
                min={1}
                max={15}
                value={newMinutes}
                onChange={(e) => setNewMinutes(parseInt(e.target.value) || 5)}
              />
            </Field>

            <Field id="micro-desc" label={t('Cue (optional)')}>
              <Input
                id="micro-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder={t('e.g. Right after morning coffee')}
              />
            </Field>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTitle('');
              }}
            >
              {t('Cancel')}
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={!newTitle.trim()}>
              {t('Save')}
            </Button>
          </div>
        </form>
      )}

      {/* Grouped list */}
      <div className="space-y-5">
        {habits.length === 0 ? (
          <div className="py-8 text-center text-[14px] text-[var(--fg-muted)]">
            {t('No habits yet. Add your first five-minute one.')}
          </div>
        ) : displayedGroups.length === 0 ? (
          <div className="py-8 text-center text-[14px] text-[var(--fg-muted)]">
            {t('Nothing in this category.')}
          </div>
        ) : (
          displayedGroups.map((group) => {
            const categoryCompleted = group.habits.filter((h) => h.completedDates.includes(todayStr)).length;
            const categoryTotal = group.habits.length;
            const isCategoryAllDone = categoryTotal > 0 && categoryCompleted === categoryTotal;

            return (
              <div key={group.config.id} id={`micro-habits-group-${group.config.id.toLowerCase()}`} className="space-y-2">
                <div className="flex items-center justify-between gap-3 px-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {group.config.color && (
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: group.config.color }} />
                    )}
                    <h4 className="text-[13px] font-medium text-[var(--fg-muted)] truncate">{t(group.config.label)}</h4>
                    {group.config.isCustom && group.config.customCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryToEdit(group.config.customCategory!);
                          setIsCategoryModalOpen(true);
                        }}
                        title={t('Edit this category')}
                        aria-label={t('Edit {label} category', { label: t(group.config.label) })}
                        className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className={`text-[13px] tabular-nums shrink-0 ${isCategoryAllDone ? 'text-[var(--accent)]' : 'text-[var(--fg-subtle)]'}`}>
                    {categoryCompleted}/{categoryTotal}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.habits.map((habit) => {
                    const isCompletedToday = habit.completedDates.includes(todayStr);
                    const isExpanded = expandedHabitId === habit.id;
                    const linkedGoal = habit.goalId ? goals.find((g) => g.id === habit.goalId) : undefined;

                    return (
                      <div
                        key={habit.id}
                        className="group flex flex-col p-3 rounded-[var(--radius-sm)] bg-[var(--bg)] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <MicroHabitCheckbox
                              id={`micro-habit-checkbox-${habit.id}`}
                              checked={isCompletedToday}
                              onToggle={() => {
                                toggleMicroHabit(habit.id);
                                soundSynthesizer.playMicroHabitCue(
                                  habit.category,
                                  !isCompletedToday ? 'complete' : 'undo',
                                  group.config.color
                                );
                              }}
                              category={habit.category}
                              color={group.config.color}
                              size="md"
                              ariaLabel={isCompletedToday ? t('Mark {title} as incomplete', { title: habit.title }) : t('Mark {title} as completed', { title: habit.title })}
                            />

                            <div className="min-w-0 flex-1">
                              <div className={`text-[15px] font-medium truncate ${isCompletedToday ? 'line-through text-[var(--fg-muted)]' : 'text-[var(--fg)]'}`}>
                                {habit.title}
                              </div>
                              <div className="flex items-center gap-2 text-[12px] text-[var(--fg-subtle)] flex-wrap">
                                <span>{t('{n} min', { n: habit.durationMinutes })}</span>
                                {habit.streakCount > 0 && (
                                  <span className="text-[var(--accent)] font-medium">{t('{n}d streak', { n: habit.streakCount })}</span>
                                )}
                                <HabitBestStreakIndicator habit={habit} todayStr={todayStr} />
                                {linkedGoal && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingHabit(habit);
                                    }}
                                    className="truncate max-w-[140px] sm:max-w-[200px] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
                                    title={t('Linked to Goal: "{title}" ({area}). Click to edit.', { title: linkedGoal.title, area: linkedGoal.area })}
                                  >
                                    {linkedGoal.title}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                startFocusSession({
                                  missionTitle: t('Micro-Habit: {title}', { title: habit.title }),
                                  durationMinutes: habit.durationMinutes || 5,
                                })
                              }
                              title={t('Launch {n}m Focus Timer', { n: habit.durationMinutes })}
                              aria-label={t('Launch {n}m Focus Timer', { n: habit.durationMinutes })}
                              className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingHabit(habit)}
                              className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
                              title={t('Edit')}
                              aria-label={t('Edit')}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
                              className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
                              title={isExpanded ? t('Hide details') : t('Show details')}
                              aria-label={isExpanded ? t('Hide details') : t('Show details')}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-[var(--border)] text-[13px] text-[var(--fg-muted)] leading-relaxed space-y-3">
                            {habit.description && <div>{habit.description}</div>}

                            {(() => {
                              const habitBest = calculateBestMicroHabitStreak(
                                habit.completedDates || [],
                                habit.streakCount || 0,
                                habit.bestStreak || 0
                              );
                              const past7Days = Array.from({ length: 7 }).map((_, i) => {
                                const d = new Date(Date.now() - (6 - i) * 86400000);
                                return {
                                  dateKey: d.toISOString().slice(0, 10),
                                  label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
                                  fullLabel: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
                                };
                              });

                              return (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)]">
                                      <div className="text-[12px] text-[var(--fg-subtle)]">{t('Streak')}</div>
                                      <div className="text-[17px] font-semibold text-[var(--fg)] tabular-nums">{habit.streakCount || 0}</div>
                                    </div>
                                    <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)]">
                                      <div className="text-[12px] text-[var(--fg-subtle)]">{t('Best')}</div>
                                      <div className="text-[17px] font-semibold text-[var(--fg)] tabular-nums">{habitBest}</div>
                                    </div>
                                    <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)]">
                                      <div className="text-[12px] text-[var(--fg-subtle)]">{t('Total')}</div>
                                      <div className="text-[17px] font-semibold text-[var(--fg)] tabular-nums">{habit.completedDates?.length || 0}</div>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-[12px] text-[var(--fg-subtle)]">{t('Last 7 days')}</span>
                                    <div className="flex items-center gap-1">
                                      {past7Days.map((day) => {
                                        const isDone = habit.completedDates?.includes(day.dateKey);
                                        return (
                                          <span
                                            key={day.dateKey}
                                            title={`${day.fullLabel}: ${isDone ? t('Completed') : t('Not completed')}`}
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                                              isDone ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-muted)] text-[var(--fg-subtle)]'
                                            }`}
                                          >
                                            {isDone ? <Check className="w-3 h-3" strokeWidth={2.5} /> : day.label}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between gap-3 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        soundSynthesizer.playMicroHabitCue(habit.category, 'complete');
                                      }}
                                      className="h-9 inline-flex items-center gap-1.5 text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
                                    >
                                      <Volume2 className="w-4 h-4" /> {t('Play chime')}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteMicroHabit(habit.id)}
                                      className="h-9 inline-flex items-center gap-1.5 text-[13px] text-[var(--danger)] cursor-pointer"
                                      title={t('Delete habit')}
                                    >
                                      <Trash2 className="w-4 h-4" /> {t('Delete')}
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-[var(--fg-subtle)]">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          {t('Resets each day. D$25 per habit.')}
        </span>

        <div className="flex items-center gap-4">
          <button
            type="button"
            id="btn-simulate-tomorrow-rollover"
            onClick={() => simulateDateKeyChange()}
            title={t('Simulate advancing dateKey to tomorrow to test automated daily reset & streak evaluation')}
            className="h-9 flex items-center gap-1 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> {t('Simulate next day')}
          </button>

          {completedCount > 0 && (
            <button
              type="button"
              id="btn-reset-micro-habits-today"
              onClick={resetMicroHabitsToday}
              className="h-9 flex items-center gap-1 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> {t("Clear today's marks")}
            </button>
          )}
        </div>
      </div>

      <CustomCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleSaveCustomCategory}
        onDelete={handleDeleteCustomCategory}
        categoryToEdit={categoryToEdit}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={async (goalData) => {
          const created = await addGoal(goalData);
          if (created) {
            setNewGoalId(created.id);
          }
        }}
      />

      <EditMicroHabitModal
        isOpen={editingHabit !== null}
        onClose={() => setEditingHabit(null)}
        habit={editingHabit}
        goals={goals}
        customCategories={customCategories}
        onSave={updateMicroHabit}
        onDelete={deleteMicroHabit}
        onOpenCreateGoalModal={() => setIsGoalModalOpen(true)}
      />
    </Card>
  );
};
