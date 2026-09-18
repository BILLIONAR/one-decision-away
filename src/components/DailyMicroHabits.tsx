import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Badge, Progress, Input, Field } from './ui';
import {
  Check,
  Flame,
  Plus,
  Play,
  Trash2,
  Sparkles,
  Zap,
  RotateCcw,
  Clock,
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
  CheckCircle2,
  CalendarCheck,
  Volume2,
  Trophy,
  Award,
  History,
  Edit3,
  SlidersHorizontal,
  Palette,
  Tag,
} from 'lucide-react';
import { MicroHabit, MicroHabitCategory, CustomHabitCategory } from '../types/models';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { calculateBestMicroHabitStreak } from '../services/microHabitsService';
import { MicroHabitCheckbox } from './MicroHabitCheckbox';
import {
  resolveCategoryConfig,
  ResolvedCategoryConfig,
  CURATED_CATEGORY_COLORS,
  CURATED_CATEGORY_ICONS,
  ICON_MAP,
} from '../utils/categoryHelpers';
import { CustomCategoryModal } from './CustomCategoryModal';
import { GoalModal } from './GoalModal';
import { EditMicroHabitModal } from './EditMicroHabitModal';

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
    label: 'Health',
    icon: Heart,
    badgeVariant: 'sage',
    description: 'Physical vitality, hydration, nutrition & daily movement',
    colorClass: 'text-[var(--color-sage)]',
    bgClass: 'bg-[var(--color-sage)]/10',
    borderClass: 'border-[var(--color-sage)]/30',
    soundCueName: '528Hz Vitality Bloom',
    soundCueDetail: 'Warm Solfeggio vitality bloom (528Hz + 660Hz)',
    hapticDetail: 'Heartbeat pulse [35ms, 40ms]',
  },
  {
    id: 'Learning',
    label: 'Learning',
    icon: BookOpen,
    badgeVariant: 'default',
    description: 'Knowledge acquisition, reading, study & intellectual craft',
    colorClass: 'text-[var(--color-navy)]',
    bgClass: 'bg-[var(--color-navy)]/10',
    borderClass: 'border-[var(--color-navy)]/30',
    soundCueName: 'Crystal Glissando',
    soundCueDetail: 'Ascending 4-note insight chime (E5 → G#5 → B5 → E6)',
    hapticDetail: 'Crisp double-tap [15ms, 25ms]',
  },
  {
    id: 'Discipline',
    label: 'Discipline',
    icon: Target,
    badgeVariant: 'coral',
    description: 'Friction reduction, impulse control, standards & consistency',
    colorClass: 'text-[var(--color-coral)]',
    bgClass: 'bg-[var(--color-coral)]/10',
    borderClass: 'border-[var(--color-coral)]/30',
    soundCueName: 'Bedrock Anchor',
    soundCueDetail: 'Resolute 330Hz strike with 165Hz sub-weight & 495Hz fifth',
    hapticDetail: 'Firm anchor pulse [65ms]',
  },
  {
    id: 'Mindset',
    label: 'Mindset',
    icon: Brain,
    badgeVariant: 'coral',
    description: 'Cognitive reframing, future self identity & gratitude',
    colorClass: 'text-[var(--color-coral)]',
    bgClass: 'bg-[var(--color-coral)]/10',
    borderClass: 'border-[var(--color-coral)]/30',
    soundCueName: '432Hz Zen Bowl',
    soundCueDetail: 'Harmonic singing bowl resonance (432Hz + 864Hz)',
    hapticDetail: 'Smooth meditative wave [25ms, 20ms]',
  },
  {
    id: 'Clarity',
    label: 'Clarity',
    icon: Sparkles,
    badgeVariant: 'sage',
    description: 'Breathing, meditation & mental space decluttering',
    colorClass: 'text-[var(--color-sage)]',
    bgClass: 'bg-[var(--color-sage)]/10',
    borderClass: 'border-[var(--color-sage)]/30',
    soundCueName: 'Harmonic Dual Bell',
    soundCueDetail: 'Uplifting clarity chime [1046Hz → 1568Hz]',
    hapticDetail: 'Confirmation tap [30ms]',
  },
  {
    id: 'Craft',
    label: 'Craft',
    icon: Wrench,
    badgeVariant: 'default',
    description: 'Technical execution, deliberate practice & creative output',
    colorClass: 'text-[var(--fg)]',
    bgClass: 'bg-[var(--bg-muted)]',
    borderClass: 'border-[var(--border-strong)]',
    soundCueName: 'Precision Bell',
    soundCueDetail: 'Resonant execution chime',
    hapticDetail: 'Tactile tap [30ms]',
  },
  {
    id: 'Environment',
    label: 'Environment',
    icon: Home,
    badgeVariant: 'slate',
    description: 'Physical desk workspace, browser tabs & staged surroundings',
    colorClass: 'text-[var(--fg-muted)]',
    bgClass: 'bg-[var(--bg-muted)]',
    borderClass: 'border-[var(--border)]',
    soundCueName: 'Spacious Tone',
    soundCueDetail: 'Open ambient tone',
    hapticDetail: 'Tactile tap [30ms]',
  },
  {
    id: 'Wealth',
    label: 'Wealth',
    icon: TrendingUp,
    badgeVariant: 'coral',
    description: 'Resource management, value creation & leverage tracking',
    colorClass: 'text-[var(--color-sand)]',
    bgClass: 'bg-[var(--color-sand)]/20',
    borderClass: 'border-[var(--color-sand)]/40',
    soundCueName: 'Prosperity Chime',
    soundCueDetail: 'Harmonic abundance tone',
    hapticDetail: 'Tactile tap [30ms]',
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
  const progressRatio =
    bestStreak > 0 ? Math.min(100, Math.round((currentStreak / bestStreak) * 100)) : 0;
  const daysToMatch = Math.max(0, bestStreak - currentStreak);

  return (
    <div className="relative group/beststreak inline-flex items-center">
      {/* Visual Indicator Badge */}
      <div
        tabIndex={0}
        role="button"
        aria-label={`All-time best streak: ${bestStreak} days. Current streak: ${currentStreak} days.`}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-tight border cursor-help transition-all select-none ${
          isAtRecord
            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 ring-1 ring-amber-500/20'
            : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)] border-[var(--border)] hover:border-amber-400/40'
        }`}
        title={`🏆 Best Streak: ${bestStreak} consecutive days (retrieved from history) · Current: ${currentStreak}d · Total completions: ${totalCompletions}d`}
      >
        <Trophy
          className={`w-3 h-3 shrink-0 ${
            isAtRecord
              ? 'text-amber-500 fill-amber-500/40'
              : 'text-amber-500/70'
          }`}
        />
        <span className="font-mono">{bestStreak}d best</span>
        {isAtRecord && (
          <span
            className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-ping"
            title="Active all-time personal best!"
          />
        )}
      </div>

      {/* Rich Tooltip Popover on Hover & Focus */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute bottom-full left-0 mb-2 hidden group-hover/beststreak:flex group-focus-within/beststreak:flex flex-col w-64 max-w-[calc(100vw-2.5rem)] p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border)] shadow-[var(--shadow-md)] text-xs z-30 pointer-events-none transition-all duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-1.5 font-bold text-[var(--fg)]">
              <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
              <span>Personal Record</span>
            </div>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-xs">
              {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>

          {/* Metric Rows */}
          <div className="py-2 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--fg-muted)]">Current Active Streak</span>
              <span className="font-mono font-semibold text-[var(--fg)]">
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[var(--fg-muted)]">Historical Completions</span>
              <span className="font-mono font-semibold text-[var(--fg)]">
                {totalCompletions} {totalCompletions === 1 ? 'day' : 'days'} logged
              </span>
            </div>

            {/* Record Momentum Bar */}
            <div className="space-y-1 pt-0.5">
              <div className="flex items-center justify-between text-[10px] text-[var(--fg-subtle)]">
                <span>Momentum vs Best</span>
                <span className="font-mono font-medium">{progressRatio}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden border border-[var(--border)]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isAtRecord
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                      : 'bg-[var(--color-sage)]'
                  }`}
                  style={{ width: `${progressRatio}%` }}
                />
              </div>
            </div>
          </div>

          {/* Status Note */}
          <div className="pt-2 border-t border-[var(--border)] text-[10px] text-[var(--fg-muted)] flex items-center justify-between">
            {isAtRecord ? (
              <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Active All-Time High!
              </span>
            ) : daysToMatch > 0 ? (
              <span>
                {daysToMatch} more {daysToMatch === 1 ? 'day' : 'days'} to match record
              </span>
            ) : (
              <span>Complete today to begin streak</span>
            )}
            <span className="text-[9px] text-[var(--fg-subtle)] font-mono">from history</span>
          </div>

          {/* Caret Pointer Arrow */}
          <div className="absolute top-full left-4 -mt-1 w-2 h-2 bg-[var(--bg-elevated)] border-b border-r border-[var(--border)] transform rotate-45" />
        </div>
      )}
    </div>
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
      label: 'Other Routines',
      icon: Folder,
      badgeVariant: 'slate',
      description: 'Additional custom categories',
      colorClass: 'text-[var(--fg-muted)]',
      bgClass: 'bg-[var(--bg-muted)]',
      borderClass: 'border-[var(--border)]',
      soundCueName: 'Standard Chime',
      soundCueDetail: 'Clean completion tone',
      hapticDetail: 'Confirmation tap [30ms]',
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
    <Card
      id="daily-micro-habits-section"
      padding="lg"
      className="space-y-5 border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[var(--color-sage)]/10 text-[var(--color-sage)]">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold font-display text-[var(--fg)]">
              Daily Micro-Habits (5-Min Momentum)
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <p className="text-xs text-[var(--fg-muted)]">
              Low-friction 5-minute foundational actions organized by category to eliminate inertia and build compounding momentum.
            </p>
            <span
              id="micro-habits-autoreset-badge"
              title="Daily auto-reset is active: uncompleted habits reset automatically whenever dateKey changes across midnight or on app load"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--color-sage)]/10 text-[var(--color-sage)] border border-[var(--color-sage)]/25"
            >
              <CalendarCheck className="w-3 h-3" />
              Auto-reset on dateKey change ({data.lastActiveDateKey || todayStr})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant={progressPct === 100 ? 'sage' : 'slate'} className="font-semibold">
            {completedCount} / {totalCount} Done ({progressPct}%)
          </Badge>
          {!isAdding && (
            <Button
              id="btn-add-micro-habit"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => setIsAdding(true)}
            >
              Add Habit
            </Button>
          )}
        </div>
      </div>

      {/* Momentum Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[var(--fg-muted)] flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-[var(--color-coral)]" />
            <span>
              Micro-Habits Progress: {completedCount} of {totalCount} completed today
            </span>
          </span>
          <span className={progressPct === 100 ? 'text-[var(--color-sage)] font-bold' : 'text-[var(--fg)]'}>
            {progressPct === 100 ? '🔥 Momentum Peak Unlocked! (100%)' : `${progressPct}% Activated`}
          </span>
        </div>
        <Progress value={progressPct} variant={progressPct === 100 ? 'sage' : 'coral'} />
      </div>

      {/* Category Filter Pills (Quick switcher for grouped list) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)] shrink-0 mr-1">
            Group:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border shrink-0 ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] shadow-xs'
                : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)] border-[var(--border)] hover:bg-[var(--bg-muted)]'
            }`}
          >
            All Categories ({habits.length})
          </button>

          {groupedHabits.map((group) => {
            const Icon = group.config.icon;
            const isSelected =
              selectedCategoryFilter === group.config.id ||
              selectedCategoryFilter === group.config.label;
            return (
              <button
                key={group.config.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(group.config.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)] shadow-xs'
                    : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)] border-[var(--border)] hover:bg-[var(--bg-muted)]'
                }`}
              >
                {group.config.color ? (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: group.config.color }}
                  />
                ) : (
                  <Icon className="w-3 h-3" />
                )}
                <span>{group.config.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({group.habits.length})</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            setCategoryToEdit(null);
            setIsCategoryModalOpen(true);
          }}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-[var(--color-sage)] hover:bg-[var(--color-sage)]/10 border border-[var(--color-sage)]/30 transition-colors shrink-0 cursor-pointer ml-auto"
        >
          <Palette className="w-3 h-3" />
          <span>New Category</span>
        </button>
      </div>

      {/* Goal Filter Selector Bar if user has goals */}
      {goals.length > 0 && (
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs no-scrollbar border-t border-[var(--border)] pt-2.5">
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)] shrink-0 flex items-center gap-1">
              <Target className="w-3 h-3 text-[var(--primary)]" />
              <span>Goal:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedGoalFilter('ALL')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border shrink-0 ${
                selectedGoalFilter === 'ALL'
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                  : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)] border-[var(--border)]'
              }`}
            >
              All Goals ({habits.length})
            </button>
            {goals.map((g) => {
              const goalHabitsCount = habits.filter((h) => h.goalId === g.id).length;
              const isSelected = selectedGoalFilter === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGoalFilter(g.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border shrink-0 ${
                    isSelected
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                      : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)] border-[var(--border)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <span>{g.title}</span>
                  <span className="text-[10px] opacity-80 font-mono">({goalHabitsCount})</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setSelectedGoalFilter('UNASSIGNED')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all border shrink-0 ${
                selectedGoalFilter === 'UNASSIGNED'
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                  : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)] border-[var(--border)]'
              }`}
            >
              Standalone ({habits.filter((h) => !h.goalId).length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsGoalModalOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--primary)] hover:underline shrink-0 ml-auto"
          >
            <Plus className="w-3 h-3" />
            <span>New Goal</span>
          </button>
        </div>
      )}

      {/* Add New Micro-Habit Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="p-4 sm:p-5 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-4 transition-all"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[var(--color-sage)]" />
              Create New Micro-Habit
            </h4>
            <span className="text-[11px] text-[var(--fg-muted)]">Target: 2 to 5 mins max</span>
          </div>

          <div className="space-y-3">
            <Field id="micro-title" label="Habit Action / Routine" required>
              <Input
                id="micro-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 5-minute deep hydration & mineral protocol, box breathing, or flash study"
                autoFocus
              />
            </Field>

            {/* Tag to Overarching Life Goal */}
            <div className="p-3 rounded-[var(--radius-sm)] border border-[var(--primary)]/25 bg-[var(--primary)]/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="micro-goal-select" className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Tag to Overarching Life Goal (Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(true)}
                  className="text-xs text-[var(--primary)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> + New Life Goal
                </button>
              </div>
              <p className="text-[11px] text-[var(--fg-muted)]">
                Connect this daily routine to a broader objective to visualize habit completion momentum on your Missions & Progress pages.
              </p>
              <select
                id="micro-goal-select"
                value={newGoalId}
                onChange={(e) => setNewGoalId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">── None (Standalone Routine) ──</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    🎯 {g.title} ({g.area})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector with Custom Categories Support */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-[var(--fg)]">
                    Category & Life Domain
                  </label>
                  <p className="text-[11px] text-[var(--fg-muted)]">
                    Assign a core domain to color-code and organize this routine.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryToEdit(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-sage)] hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  + Create Custom Category
                </button>
              </div>

              {/* Predefined Categories */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
                  Standard Categories
                </span>
                <div
                  role="radiogroup"
                  aria-label="Micro-habit category selection"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5"
                >
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
                        className={`flex items-center gap-2 p-2 rounded-[var(--radius-sm)] border text-left transition-all cursor-pointer ${
                          isSelected
                            ? `bg-[var(--bg-elevated)] ${cat.borderClass} ring-2 ring-[var(--color-sage)] shadow-sm font-semibold`
                            : 'bg-[var(--bg)] border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--border-strong)] hover:text-[var(--fg)]'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                            isSelected ? `${cat.bgClass} ${cat.colorClass}` : 'bg-[var(--bg-muted)] text-[var(--fg-subtle)]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs truncate">{cat.label}</div>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[var(--color-sage)] stroke-[3] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Categories Section if available */}
              {customCategories.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
                    Your Custom Categories
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {customCategories.map((cc) => {
                      const Icon = ICON_MAP[cc.icon] || Tag;
                      const isSelected =
                        newCustomCategoryId === cc.id || newCategory === cc.name;

                      return (
                        <div
                          key={cc.id}
                          className={`flex items-center justify-between p-2 rounded-[var(--radius-sm)] border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--bg-elevated)] shadow-sm font-semibold ring-2'
                              : 'bg-[var(--bg)] border-[var(--border)] text-[var(--fg-muted)] hover:border-[var(--border-strong)]'
                          }`}
                          style={{
                            borderColor: isSelected ? cc.color : undefined,
                            boxShadow: isSelected ? `0 0 0 1px ${cc.color}` : undefined,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setNewCategory(cc.name);
                              setNewCustomCategoryId(cc.id);
                            }}
                            className="flex items-center gap-2 min-w-0 flex-1 text-left"
                          >
                            <span
                              className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border"
                              style={{
                                backgroundColor: `${cc.color}20`,
                                borderColor: `${cc.color}40`,
                                color: cc.color,
                              }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs truncate text-[var(--fg)]">{cc.name}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCategoryToEdit(cc);
                              setIsCategoryModalOpen(true);
                            }}
                            title="Edit this category"
                            className="p-1 rounded text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected category contextual description */}
              <div
                className="p-2.5 rounded bg-[var(--bg-elevated)] border text-[11px] text-[var(--fg-muted)] flex items-center justify-between gap-3"
                style={{
                  borderColor: selectedCategoryMeta.color
                    ? `${selectedCategoryMeta.color}40`
                    : 'var(--border)',
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: selectedCategoryMeta.color
                        ? `${selectedCategoryMeta.color}20`
                        : undefined,
                      color: selectedCategoryMeta.color || undefined,
                    }}
                  >
                    <selectedCategoryMeta.icon
                      className={`w-3.5 h-3.5 ${!selectedCategoryMeta.color ? selectedCategoryMeta.colorClass : ''}`}
                    />
                  </span>
                  <span className="truncate">
                    <strong className="text-[var(--fg)]">{selectedCategoryMeta.label}:</strong>{' '}
                    {selectedCategoryMeta.description}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedCategoryMeta.isCustom && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${selectedCategoryMeta.color}15`,
                        borderColor: `${selectedCategoryMeta.color}40`,
                        color: selectedCategoryMeta.color,
                      }}
                    >
                      Custom
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      soundSynthesizer.playMicroHabitCue(
                        newCategory,
                        'complete',
                        selectedCategoryMeta.color
                      )
                    }
                    title="Audition acoustic chime"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-muted)] hover:bg-[var(--bg)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Chime</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field id="micro-mins" label="Duration (Minutes)">
                <Input
                  id="micro-mins"
                  type="number"
                  min={1}
                  max={15}
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(parseInt(e.target.value) || 5)}
                />
              </Field>

              <Field id="micro-desc" label="Optional Cue / Execution Note" helper="Trigger cue or location.">
                <Input
                  id="micro-desc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Perform immediately after morning coffee."
                />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--border)]">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewTitle('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!newTitle.trim()}
            >
              Save Micro-Habit
            </Button>
          </div>
        </form>
      )}

      {/* Visually Grouped Micro-Habits List */}
      <div className="space-y-5">
        {habits.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--fg-muted)] bg-[var(--bg-muted)] rounded-[var(--radius-md)]">
            No micro-habits defined yet. Click "Add Habit" to create your first 5-minute win.
          </div>
        ) : displayedGroups.length === 0 ? (
          <div className="p-6 text-center text-xs text-[var(--fg-muted)] bg-[var(--bg-muted)] rounded-[var(--radius-md)]">
            No habits found in the selected category.
          </div>
        ) : (
          displayedGroups.map((group) => {
            const GroupIcon = group.config.icon;
            const categoryCompleted = group.habits.filter((h) =>
              h.completedDates.includes(todayStr)
            ).length;
            const categoryTotal = group.habits.length;
            const isCategoryAllDone = categoryTotal > 0 && categoryCompleted === categoryTotal;

            return (
              <div
                key={group.config.id}
                id={`micro-habits-group-${group.config.id.toLowerCase()}`}
                className="space-y-2.5"
              >
                {/* Visual Category Group Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                        group.config.color ? 'border' : `${group.config.bgClass} ${group.config.colorClass}`
                      }`}
                      style={
                        group.config.color
                          ? {
                              backgroundColor: `${group.config.color}20`,
                              borderColor: `${group.config.color}40`,
                              color: group.config.color,
                            }
                          : undefined
                      }
                    >
                      <GroupIcon className="w-3.5 h-3.5" />
                    </span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                      {group.config.label}
                    </h4>
                    {group.config.isCustom && (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                        style={{
                          backgroundColor: `${group.config.color}15`,
                          borderColor: `${group.config.color}35`,
                          color: group.config.color,
                        }}
                      >
                        Custom Domain
                      </span>
                    )}
                    <Badge variant={group.config.badgeVariant} className="text-[10px] px-1.5 py-0.2">
                      {categoryTotal} {categoryTotal === 1 ? 'habit' : 'habits'}
                    </Badge>
                    <button
                      type="button"
                      onClick={() =>
                        soundSynthesizer.playMicroHabitCue(
                          group.config.id,
                          'complete',
                          group.config.color
                        )
                      }
                      title={`Preview acoustic cue: ${group.config.soundCueName || 'Harmonic Chime'} · ${group.config.soundCueDetail || ''}`}
                      aria-label={`Preview ${group.config.label} cue`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[var(--bg-muted)] hover:bg-[var(--bg-elevated)] text-[var(--fg-muted)] hover:text-[var(--fg)] border border-[var(--border)] transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3 text-[var(--fg-muted)]" />
                      <span className="hidden sm:inline font-mono text-[10px]">
                        {group.config.soundCueName || 'Chime'}
                      </span>
                    </button>
                    {group.config.isCustom && group.config.customCategory && (
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryToEdit(group.config.customCategory!);
                          setIsCategoryModalOpen(true);
                        }}
                        title="Edit this custom domain"
                        aria-label={`Edit ${group.config.label} domain`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-[var(--bg-muted)] hover:bg-[var(--bg-elevated)] text-[var(--fg-muted)] hover:text-[var(--fg)] border border-[var(--border)] transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-[var(--fg-muted)]" />
                        <span className="hidden sm:inline">Edit Domain</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`text-[11px] font-semibold ${
                        isCategoryAllDone
                          ? 'text-[var(--color-sage)]'
                          : 'text-[var(--fg-muted)]'
                      }`}
                    >
                      {isCategoryAllDone ? '✓ All done today' : `${categoryCompleted} / ${categoryTotal} done`}
                    </span>
                  </div>
                </div>

                {/* Habits in this Category */}
                <div className="space-y-2">
                  {group.habits.map((habit) => {
                    const isCompletedToday = habit.completedDates.includes(todayStr);
                    const isExpanded = expandedHabitId === habit.id;

                    return (
                      <div
                        key={habit.id}
                        className={`group flex flex-col p-3 rounded-[var(--radius-md)] border transition-all duration-200 ${
                          isCompletedToday
                            ? 'bg-[var(--success-soft)]/25 border-[var(--color-sage)]/40 text-[var(--fg)]'
                            : 'bg-[var(--bg)] hover:bg-[var(--bg-muted)]/60 border-[var(--border)] text-[var(--fg)]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Left: Check Toggle & Title */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Tactile Micro-Interaction Toggle Button with Particle Burst & Morph */}
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
                              ariaLabel={`Mark ${habit.title} as ${isCompletedToday ? 'incomplete' : 'completed'}`}
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`text-sm font-semibold tracking-tight transition-all ${
                                    isCompletedToday
                                      ? 'line-through text-[var(--fg-muted)] decoration-[var(--color-sage)] decoration-2'
                                      : 'text-[var(--fg)]'
                                  }`}
                                >
                                  {habit.title}
                                </span>

                                {/* Streak count indicator next to the title */}
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold tracking-tight border transition-all ${
                                    habit.streakCount > 0
                                      ? 'bg-[var(--color-coral)]/10 text-[var(--color-coral)] border-[var(--color-coral)]/30'
                                      : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] border-[var(--border)]'
                                  }`}
                                  title={
                                    habit.streakCount > 0
                                      ? `🔥 ${habit.streakCount}-day active streak! Completed across ${habit.streakCount} consecutive calendar days.`
                                      : '0-day streak. Complete this micro-habit today to begin your streak!'
                                  }
                                >
                                  <Flame
                                    className={`w-3 h-3 ${
                                      habit.streakCount > 0
                                        ? 'fill-[var(--color-coral)] text-[var(--color-coral)]'
                                        : 'text-[var(--fg-muted)] opacity-60'
                                    }`}
                                  />
                                  <span>{habit.streakCount || 0}d streak</span>
                                </span>

                                {/* Best Streak Achieved from History Indicator & Tooltip */}
                                <HabitBestStreakIndicator
                                  habit={habit}
                                  todayStr={todayStr}
                                />

                                <span className="inline-flex items-center gap-0.5 text-[11px] text-[var(--fg-subtle)] font-medium">
                                  <Clock className="w-3 h-3" /> {habit.durationMinutes}m
                                </span>

                                {/* Linked Life Goal Badge */}
                                {habit.goalId && (() => {
                                  const linkedGoal = goals.find((g) => g.id === habit.goalId);
                                  if (!linkedGoal) return null;
                                  return (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingHabit(habit);
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/25 hover:bg-[var(--primary)]/20 transition-all cursor-pointer"
                                      title={`Linked to Goal: "${linkedGoal.title}" (${linkedGoal.area}). Click to edit.`}
                                    >
                                      <Target className="w-2.5 h-2.5 shrink-0" />
                                      <span className="truncate max-w-[120px] sm:max-w-[170px]">{linkedGoal.title}</span>
                                    </button>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Right Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Quick 5-min Focus Lock Launcher */}
                            <button
                              type="button"
                              onClick={() =>
                                startFocusSession({
                                  missionTitle: `Micro-Habit: ${habit.title}`,
                                  durationMinutes: habit.durationMinutes || 5,
                                })
                              }
                              title={`Launch ${habit.durationMinutes}m Focus Timer`}
                              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--fg-muted)] hover:text-[var(--color-sage)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit Habit & Goal Tag */}
                            <button
                              type="button"
                              onClick={() => setEditingHabit(habit)}
                              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                              title="Edit habit details & goal tag"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Expand/Collapse Note & Cue Info */}
                            <button
                              type="button"
                              onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
                              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                              title={isExpanded ? 'Collapse cue details' : 'View habit cue & details'}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Delete Custom Habit */}
                            <button
                              type="button"
                              onClick={() => deleteMicroHabit(habit.id)}
                              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--fg-subtle)] hover:text-[var(--color-coral)] hover:bg-[var(--bg-elevated)] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                              title="Delete habit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Expanded Description / Acoustic Cue & History Breakdown */}
                        {isExpanded && (
                          <div className="mt-2.5 pt-2 border-t border-[var(--border)] text-xs text-[var(--fg-muted)] leading-relaxed pl-9 space-y-2.5">
                            {habit.description && <div>{habit.description}</div>}

                            {/* Sound & Haptic Cue Row */}
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--fg-subtle)] bg-[var(--bg-muted)]/50 p-2 rounded-[var(--radius-sm)] border border-[var(--border)]">
                              <span className="font-semibold text-[var(--fg)]">Sound & Haptic Cue:</span>
                              <span className="font-mono text-[var(--fg)] font-medium">{group.config.soundCueName}</span>
                              <span>— {group.config.soundCueDetail}</span>
                              <span className="text-[10px] text-[var(--fg-muted)]">({group.config.hapticDetail})</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  soundSynthesizer.playMicroHabitCue(habit.category, 'complete');
                                }}
                                className="inline-flex items-center gap-1 text-[var(--color-sage)] hover:underline ml-auto font-medium cursor-pointer"
                              >
                                <Volume2 className="w-3 h-3" /> Test Cue
                              </button>
                            </div>

                            {/* Streak & History Intelligence Card */}
                            {(() => {
                              const habitBest = calculateBestMicroHabitStreak(
                                habit.completedDates || [],
                                habit.streakCount || 0,
                                habit.bestStreak || 0
                              );
                              const isAtRecord = (habit.streakCount || 0) >= habitBest && (habit.streakCount || 0) > 0;
                              const past7Days = Array.from({ length: 7 }).map((_, i) => {
                                const d = new Date(Date.now() - (6 - i) * 86400000);
                                return {
                                  dateKey: d.toISOString().slice(0, 10),
                                  label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
                                  fullLabel: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
                                };
                              });

                              return (
                                <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border border-[var(--border)] space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-[var(--fg)]">
                                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                      <span>Historical Streak Intelligence</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-[var(--fg-muted)]">
                                      {isAtRecord ? '⭐ Personal Best Active' : `Personal Record: ${habitBest}d`}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="p-2 rounded bg-[var(--bg-muted)] border border-[var(--border)]">
                                      <div className="text-[10px] text-[var(--fg-muted)] font-medium">Active Streak</div>
                                      <div className="text-sm font-mono font-bold text-[var(--fg)] flex items-center justify-center gap-1 mt-0.5">
                                        <Flame className="w-3.5 h-3.5 text-[var(--color-coral)]" />
                                        {habit.streakCount || 0}d
                                      </div>
                                    </div>

                                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/25">
                                      <div className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">Best Streak</div>
                                      <div className="text-sm font-mono font-bold text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1 mt-0.5">
                                        <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                                        {habitBest}d
                                      </div>
                                    </div>

                                    <div className="p-2 rounded bg-[var(--bg-muted)] border border-[var(--border)]">
                                      <div className="text-[10px] text-[var(--fg-muted)] font-medium">Total Logged</div>
                                      <div className="text-sm font-mono font-bold text-[var(--fg)] flex items-center justify-center gap-1 mt-0.5">
                                        <CalendarCheck className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                                        {habit.completedDates?.length || 0}d
                                      </div>
                                    </div>
                                  </div>

                                  {/* Past 7 days streak timeline rhythm */}
                                  <div className="pt-1 flex items-center justify-between text-[11px] text-[var(--fg-muted)]">
                                    <span className="text-[10px] text-[var(--fg-subtle)] flex items-center gap-1">
                                      <History className="w-3 h-3 text-[var(--fg-muted)]" />
                                      Past 7-day completion rhythm:
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {past7Days.map((day) => {
                                        const isDone = habit.completedDates?.includes(day.dateKey);
                                        return (
                                          <span
                                            key={day.dateKey}
                                            title={`${day.fullLabel}: ${isDone ? 'Completed' : 'Not completed'}`}
                                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border transition-all ${
                                              isDone
                                                ? 'bg-[var(--color-sage)] text-white border-[var(--color-sage)] shadow-2xs'
                                                : 'bg-[var(--bg-muted)] text-[var(--fg-subtle)] border-[var(--border)] opacity-60'
                                            }`}
                                          >
                                            {isDone ? '✓' : day.label}
                                          </span>
                                        );
                                      })}
                                    </div>
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

      {/* Footer / Quick Reset & Simulation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-[var(--border)] text-xs text-[var(--fg-muted)]">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-sage)]" />
          Uncompleted habits reset automatically each calendar day (+D$ 25 per toggle).
        </span>

        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-simulate-tomorrow-rollover"
            onClick={() => simulateDateKeyChange()}
            title="Simulate advancing dateKey to tomorrow to test automated daily reset & streak evaluation"
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--color-coral)] hover:underline transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Simulate Next Day's Rollover
          </button>

          {completedCount > 0 && (
            <button
              type="button"
              id="btn-reset-micro-habits-today"
              onClick={resetMicroHabitsToday}
              className="flex items-center gap-1 text-[11px] text-[var(--fg-subtle)] hover:text-[var(--fg)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Clear today's marks
            </button>
          )}
        </div>
      </div>

      {/* Modal for Creating / Editing Custom Habit Categories */}
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

      {/* Modal for Creating / Editing Overarching Life Goals */}
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

      {/* Modal for Editing Micro-Habit & Goal Tagging */}
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

