import React, { useState, useMemo } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Progress } from './ui';
import { Play, Check, Info, Plus } from 'lucide-react';
import { calculateOneDecisionStreakData } from '../services/economy';
import { Mission } from '../types/models';
import { useT } from '../i18n';

interface OneDecisionStreakCounterProps {
  onSetDecision?: () => void;
  onCompleteDecision?: (mission: Mission) => void;
  className?: string;
}

export const OneDecisionStreakCounter: React.FC<OneDecisionStreakCounterProps> = ({
  onSetDecision,
  onCompleteDecision,
  className = '',
}) => {
  const t = useT();
  const { data, startFocusSession } = useApp();
  const [showInfo, setShowInfo] = useState(false);
  const [hoveredDayDate, setHoveredDayDate] = useState<string | null>(null);

  const streakData = useMemo(() => {
    if (!data) return null;
    return calculateOneDecisionStreakData(data);
  }, [data]);

  if (!data || !streakData) return null;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDecision = data.missions.find(
    (m) => m.isOneDecision && (m.scheduledFor === todayStr || m.status === 'active')
  );

  const {
    currentStreak,
    longestStreak,
    totalCompleted,
    totalRewardEarned,
    completedToday,
    last7Days,
    tier,
    milestoneProgress,
    daysToNextMilestone,
    multiplier,
  } = streakData;

  const executedThisWeek = last7Days.filter((d) => d.isCompleted).length;

  return (
    <Card padding="md" className={`space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Streak')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
            {t(tier.name)}
            {multiplier > 1.0 ? ` · ${t('{multiplier}x reward', { multiplier })}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-inset)] transition-colors cursor-pointer shrink-0"
          title={t('Learn about One Decision Streak methodology')}
          aria-label={t('Streak information')}
        >
          <Info className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>
      </div>

      {showInfo && (
        <div className="p-4 bg-[var(--bg)] rounded-[var(--radius-sm)] text-[13px] space-y-2 text-[var(--fg-muted)] leading-relaxed">
          <p>{t('One decision, done every day, is what moves things. Not occasional marathons.')}</p>
          <ul className="space-y-1">
            <li><span className="text-[var(--fg)] font-medium">{t('1–2 days:')}</span> {t('Breaks initial inertia.')}</li>
            <li><span className="text-[var(--fg)] font-medium">{t('7+ days:')}</span> {t('Effortless daily momentum.')}</li>
            <li><span className="text-[var(--fg)] font-medium">{t('30+ days:')}</span> {t('Complete identity shift.')}</li>
          </ul>
        </div>
      )}

      {/* Hero */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[44px] leading-none font-semibold tracking-tight text-[var(--fg)] tabular-nums">{currentStreak}</div>
          <div className="text-[13px] text-[var(--fg-muted)] mt-1">
            {currentStreak === 1 ? t('day in a row') : t('days in a row')}
          </div>
        </div>
        <div className="text-right text-[13px]">
          <div className={completedToday ? 'text-[var(--accent)] font-medium' : 'text-[var(--fg-muted)]'}>
            {completedToday ? t('Done today') : currentStreak > 0 ? t('Not yet today') : t('Start today')}
          </div>
          <div className="text-[var(--fg-subtle)] mt-0.5">
            {daysToNextMilestone === 0
              ? t('Milestone reached')
              : daysToNextMilestone === 1
              ? t('1 day to {n}', { n: tier.nextMilestone })
              : t('{d} days to {n}', { d: daysToNextMilestone, n: tier.nextMilestone })}
          </div>
        </div>
      </div>

      <Progress value={milestoneProgress} variant="sage" />

      {/* 7 days */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[13px] text-[var(--fg-muted)]">
          <span>{t('Last 7 days')}</span>
          <span className="tabular-nums">{t('{n} of 7', { n: executedThisWeek })}</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {last7Days.map((day) => {
            const isHovered = hoveredDayDate === day.date;
            return (
              <div
                key={day.date}
                onMouseEnter={() => setHoveredDayDate(day.date)}
                onMouseLeave={() => setHoveredDayDate(null)}
                className="relative flex flex-col items-center gap-1.5 py-1 text-center"
              >
                <span className={`text-[11px] ${day.isToday ? 'text-[var(--fg)] font-medium' : 'text-[var(--fg-subtle)]'}`}>
                  {t(day.dayLabel)}
                </span>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] tabular-nums ${
                    day.isCompleted
                      ? 'bg-[var(--accent)] text-white'
                      : day.isToday
                      ? 'border border-[var(--fg)] text-[var(--fg)]'
                      : 'bg-[var(--bg-inset)] text-[var(--fg-subtle)]'
                  }`}
                >
                  {day.isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : day.dayNumber}
                </div>
                {isHovered && day.title && (
                  <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 bg-[var(--fg)] text-[var(--bg)] text-[12px] rounded-[var(--radius-xs)] whitespace-nowrap pointer-events-none">
                    {t(day.title)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg)]">
          <div className="text-[12px] text-[var(--fg-subtle)]">{t('Best')}</div>
          <div className="text-[17px] font-semibold text-[var(--fg)] tabular-nums">{longestStreak}</div>
        </div>
        <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg)]">
          <div className="text-[12px] text-[var(--fg-subtle)]">{t('Total')}</div>
          <div className="text-[17px] font-semibold text-[var(--fg)] tabular-nums">{totalCompleted}</div>
        </div>
        <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg)]">
          <div className="text-[12px] text-[var(--fg-subtle)]">{t('Earned')}</div>
          <div className="text-[17px] font-semibold text-[var(--accent)] tabular-nums">D$ {totalRewardEarned.toLocaleString()}</div>
        </div>
      </div>

      {/* Today */}
      {completedToday ? (
        <p className="text-[13px] text-[var(--fg-muted)]">{t("Today's decision is done. D$500 added.")}</p>
      ) : todayDecision ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] text-[var(--fg-subtle)]">{t('Today')}</div>
            <p className="text-[15px] font-medium text-[var(--fg)] truncate">{t(todayDecision.title)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              icon={Play}
              onClick={() =>
                startFocusSession({
                  missionId: todayDecision.id,
                  missionTitle: todayDecision.title,
                  missionType: todayDecision.type,
                  missionArea: todayDecision.area,
                  durationMinutes: todayDecision.estimatedMinutes || 45,
                })
              }
              title={t('Lock Into Focus')}
            >
              {t('Focus ({n}m)', { n: todayDecision.estimatedMinutes || 45 })}
            </Button>
            {onCompleteDecision && (
              <Button variant="primary" size="sm" icon={Check} onClick={() => onCompleteDecision(todayDecision)}>
                {t('Done')}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[13px] text-[var(--fg-muted)]">{t('No decision set for today.')}</p>
          {onSetDecision && (
            <Button variant="primary" size="sm" icon={Plus} onClick={onSetDecision} className="shrink-0">
              {t("Set today's decision")}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
