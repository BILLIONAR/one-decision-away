import React from 'react';
import { useApp } from '../store/useApp';
import { Card } from './ui';
import { ArrowDown } from 'lucide-react';
import { MicroHabit } from '../types/models';
import { MicroHabitCheckbox } from './MicroHabitCheckbox';
import { useT } from '../i18n';

interface MicroHabitsProgressIndicatorProps {
  className?: string;
  onScrollToHabits?: () => void;
}

export const MicroHabitsProgressIndicator: React.FC<MicroHabitsProgressIndicatorProps> = ({
  className = '',
  onScrollToHabits,
}) => {
  const { data, toggleMicroHabit } = useApp();
  const t = useT();

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
    <Card id="micro-habits-progress-card" padding="md" className={`space-y-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Micro-habits')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
            {totalCount === 0
              ? t('No habits yet.')
              : progressPct === 100
              ? t('All {n} done today.', { n: totalCount })
              : remainingCount === 1
              ? t('1 left today. D$25 each.')
              : t('{n} left today. D$25 each.', { n: remainingCount })}
          </p>
        </div>
        <button
          type="button"
          onClick={handleScrollToDetail}
          className="h-9 px-2 text-[13px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center gap-1 cursor-pointer shrink-0"
          title={t('Jump to full micro-habits manager')}
        >
          <span>{t('Manage')}</span>
          <ArrowDown className="w-4 h-4" strokeWidth={1.8} />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-[var(--fg-muted)]">
            {t('{completed} of {total} done', { completed: completedCount, total: totalCount })}
          </span>
          <span className={`tabular-nums font-medium ${progressPct === 100 ? 'text-[var(--accent)]' : 'text-[var(--fg)]'}`}>
            {progressPct}%
          </span>
        </div>
        <div
          id="home-micro-habits-progress-bar"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('Micro-habits completion: {completed} of {total} completed', { completed: completedCount, total: totalCount })}
          className="relative h-1.5 w-full bg-[var(--bg-inset)] rounded-full overflow-hidden"
        >
          <div
            className="h-full transition-all duration-500 ease-out rounded-full bg-[var(--accent)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {habits.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {habits.map((habit) => {
            const isDone = habit.completedDates?.includes(todayStr);
            return (
              <button
                key={habit.id}
                type="button"
                onClick={() => toggleMicroHabit(habit.id)}
                title={`${t(habit.title)} (${isDone ? t('Completed today · Click to undo') : t('Pending · Click to complete')})`}
                className={`inline-flex items-center gap-2 h-10 px-3 rounded-full text-[13px] transition-colors cursor-pointer text-left ${
                  isDone
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--bg-inset)]'
                }`}
              >
                <MicroHabitCheckbox as="span" size="sm" checked={isDone} category={habit.category} />
                <span className={`truncate max-w-[150px] sm:max-w-[200px] ${isDone ? 'line-through' : ''}`}>
                  {t(habit.title)}
                </span>
                {habit.streakCount > 0 && (
                  <span className="text-[12px] text-[var(--fg-subtle)] shrink-0 tabular-nums" title={t('Current streak: {n} days', { n: habit.streakCount || 0 })}>
                    {habit.streakCount}d
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
};
