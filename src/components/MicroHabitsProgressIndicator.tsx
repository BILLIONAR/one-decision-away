import React from 'react';
import { useApp } from '../store/useApp';
import { Card, Badge, Progress } from './ui';
import {
  CheckCircle2,
  Circle,
  Flame,
  Zap,
  Clock,
  ArrowDown,
  Sparkles,
  Check,
} from 'lucide-react';
import { MicroHabit } from '../types/models';
import { MicroHabitCheckbox } from './MicroHabitCheckbox';

interface MicroHabitsProgressIndicatorProps {
  className?: string;
  onScrollToHabits?: () => void;
}

export const MicroHabitsProgressIndicator: React.FC<MicroHabitsProgressIndicatorProps> = ({
  className = '',
  onScrollToHabits,
}) => {
  const { data, toggleMicroHabit } = useApp();

  if (!data) return null;

  const habits: MicroHabit[] = data.microHabits || [];
  const todayStr = new Date().toISOString().slice(0, 10);

  const totalCount = habits.length;
  const completedHabits = habits.filter((h) => h.completedDates?.includes(todayStr));
  const completedCount = completedHabits.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const remainingCount = Math.max(0, totalCount - completedCount);

  const handleScrollToDetail = () => {
    if (onScrollToHabits) {
      onScrollToHabits();
      return;
    }
    const element = document.getElementById('daily-micro-habits-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card
      id="micro-habits-progress-card"
      padding="md"
      className={`border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-sm)] space-y-4 transition-all ${className}`}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-sage)]/10 text-[var(--color-sage)] flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold font-display text-[var(--fg)]">
                Daily Micro-Habits Progress
              </h3>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--fg-muted)] border border-[var(--border)]">
                Today
              </span>
            </div>
            <p className="text-xs text-[var(--fg-muted)]">
              Showing completion progress across all {totalCount} micro-habits saved in your daily protocol.
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge
            variant={progressPct === 100 ? 'sage' : progressPct > 0 ? 'coral' : 'subtle'}
            className="text-[11px] font-bold px-2.5 py-1 tracking-normal"
          >
            {progressPct === 100 ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                {completedCount} of {totalCount} Completed (100%)
              </span>
            ) : (
              <span>
                {completedCount} of {totalCount} Completed ({progressPct}%)
              </span>
            )}
          </Badge>

          <button
            type="button"
            onClick={handleScrollToDetail}
            className="text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-[var(--bg-muted)]"
            title="Jump to full micro-habits manager"
          >
            <span>Manage</span>
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Numerical Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--fg)]">
            <Flame
              className={`w-3.5 h-3.5 ${
                progressPct === 100 ? 'text-[var(--color-sage)]' : 'text-[var(--color-coral)]'
              }`}
            />
            <span>
              {completedCount} of {totalCount} micro-habits completed today
            </span>
          </div>

          <span
            className={`font-mono font-bold text-xs ${
              progressPct === 100
                ? 'text-[var(--color-sage)]'
                : progressPct > 0
                ? 'text-[var(--color-coral)]'
                : 'text-[var(--fg-muted)]'
            }`}
          >
            {progressPct}%
          </span>
        </div>

        {/* Outer Custom Progress Bar Container */}
        <div
          id="home-micro-habits-progress-bar"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Micro-habits completion: ${completedCount} of ${totalCount} completed`}
          className="relative h-3 w-full bg-[var(--bg-muted)] rounded-full overflow-hidden border border-[var(--border)]"
        >
          <div
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              progressPct === 100
                ? 'bg-[var(--color-sage)]'
                : 'bg-gradient-to-r from-[var(--color-coral)] to-[var(--color-sage)]'
            }`}
            style={{ width: `${progressPct}%` }}
          />

          {/* Tick dividers for each habit if habits exist */}
          {totalCount > 1 && totalCount <= 12 && (
            <div className="absolute inset-0 flex justify-between pointer-events-none px-0.5">
              {Array.from({ length: totalCount - 1 }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 h-full bg-[var(--bg-elevated)]/60"
                  style={{ left: `${((i + 1) / totalCount) * 100}%`, position: 'absolute' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Motivational Status Text */}
        <div className="flex items-center justify-between text-[11px] text-[var(--fg-subtle)] pt-0.5">
          <span>
            {totalCount === 0 ? (
              'No micro-habits currently configured in your protocol.'
            ) : progressPct === 100 ? (
              <span className="text-[var(--color-sage)] font-semibold inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[var(--color-sage)]" />
                All {totalCount} micro-habits completed! Today's foundational momentum is secured.
              </span>
            ) : remainingCount > 0 ? (
              <span>
                <strong className="text-[var(--fg)] font-semibold">{remainingCount}</strong> habit
                {remainingCount === 1 ? '' : 's'} remaining today (+D$25 momentum per habit)
              </span>
            ) : (
              'Tap any habit below to mark it done for today.'
            )}
          </span>

          <span className="text-[10px] font-mono text-[var(--fg-muted)]">
            {completedCount} / {totalCount} Done
          </span>
        </div>
      </div>

      {/* Quick Interactive Micro-Habit Chips */}
      {habits.length > 0 && (
        <div className="pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--fg-muted)]">
              Quick Toggle Today's Habits:
            </span>
            <span className="text-[10px] text-[var(--fg-subtle)]">Click to complete</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {habits.map((habit) => {
              const isDone = habit.completedDates?.includes(todayStr);
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => toggleMicroHabit(habit.id)}
                  title={`${habit.title} (${isDone ? 'Completed today · Click to undo' : 'Pending · Click to complete'})`}
                  className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs transition-all cursor-pointer border text-left ${
                    isDone
                      ? 'bg-[var(--color-sage)]/10 border-[var(--color-sage)]/40 text-[var(--color-sage)] font-medium'
                      : 'bg-[var(--bg)] border-[var(--border)] text-[var(--fg)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <MicroHabitCheckbox
                    as="span"
                    size="sm"
                    checked={isDone}
                    category={habit.category}
                  />
                  <span className={`truncate max-w-[150px] sm:max-w-[200px] ${isDone ? 'line-through opacity-85' : ''}`}>
                    {habit.title}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      habit.streakCount > 0
                        ? 'text-[var(--color-coral)] bg-[var(--color-coral)]/10'
                        : 'text-[var(--fg-muted)] bg-[var(--bg-muted)]'
                    }`}
                    title={`Current streak: ${habit.streakCount || 0} days`}
                  >
                    <Flame className={`w-2.5 h-2.5 ${habit.streakCount > 0 ? 'fill-[var(--color-coral)]' : ''}`} />
                    <span>{habit.streakCount || 0}d</span>
                  </span>
                  <span className="text-[10px] font-mono text-[var(--fg-muted)] shrink-0">
                    {habit.durationMinutes}m
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
