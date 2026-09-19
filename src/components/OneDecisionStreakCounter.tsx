import React, { useState, useMemo } from 'react';
import { useApp } from '../store/useApp';
import { Card, Badge, Button, Progress } from './ui';
import {
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  Play,
  Check,
  Award,
  TrendingUp,
  Sparkles,
  Info,
  Calendar,
  Plus,
  ShieldCheck,
  Crown,
  ChevronRight,
} from 'lucide-react';
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

  const getTierColor = (level: number) => {
    switch (level) {
      case 5:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 4:
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 3:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 2:
        return 'text-[var(--color-coral)] bg-[var(--color-coral)]/10 border-[var(--color-coral)]/30';
      case 1:
        return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-[var(--fg-muted)] bg-[var(--bg-muted)] border-[var(--border)]';
    }
  };

  return (
    <Card
      padding="lg"
      className={`relative overflow-hidden border transition-all ${
        completedToday
          ? 'bg-gradient-to-br from-[var(--bg-elevated)] via-[var(--bg-elevated)] to-[var(--color-sage)]/5 border-[var(--color-sage)]/40 shadow-[var(--shadow-sm)]'
          : currentStreak > 0
          ? 'bg-gradient-to-br from-[var(--bg-elevated)] via-[var(--bg-elevated)] to-[var(--color-coral)]/5 border-[var(--color-coral)]/30 shadow-[var(--shadow-sm)]'
          : 'bg-[var(--bg-elevated)] border-[var(--border)]'
      } ${className}`}
    >
      {/* Background Subtle Accent Glow */}
      <div
        className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 ${
          completedToday
            ? 'bg-[var(--color-sage)]'
            : currentStreak > 0
            ? 'bg-[var(--color-coral)]'
            : 'bg-amber-500'
        }`}
      />

      <div className="relative space-y-5">
        {/* Top Bar: Title, Tier Badge & Philosophy Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-[var(--radius-sm)] flex items-center justify-center transition-transform ${
                currentStreak > 0
                  ? 'bg-gradient-to-br from-amber-500/20 to-[var(--color-coral)]/20 text-[var(--color-coral)]'
                  : 'bg-[var(--bg-muted)] text-[var(--fg-muted)]'
              }`}
            >
              <Flame
                className={`w-5 h-5 ${
                  currentStreak > 0 ? 'text-[var(--color-coral)] animate-pulse' : 'text-[var(--fg-muted)]'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-display text-[var(--fg)] tracking-tight">
                  {t('One Decision Streak Counter')}
                </h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTierColor(
                    tier.level
                  )}`}
                >
                  {tier.icon} {t(tier.name)}
                </span>
              </div>
              <p className="text-xs text-[var(--fg-muted)]">
                {t('Consecutive daily execution of your highest-leverage signature decision.')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {multiplier > 1.0 && (
              <Badge variant="coral" className="font-bold text-[11px] shadow-2xs">
                {t('⚡ {multiplier}x Reward Boost', { multiplier })}
              </Badge>
            )}
            <button
              type="button"
              onClick={() => setShowInfo(!showInfo)}
              className="p-1.5 rounded-[var(--radius-xs)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
              title={t('Learn about One Decision Streak methodology')}
              aria-label={t('Streak information')}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informational Dropdown / Guidance */}
        {showInfo && (
          <div className="p-3.5 bg-[var(--bg-muted)] border border-[var(--border)] rounded-[var(--radius-sm)] text-xs space-y-2 text-[var(--fg-muted)]">
            <div className="flex items-center gap-2 font-bold text-[var(--fg)]">
              <Sparkles className="w-4 h-4 text-[var(--color-coral)]" />
              <span>{t('The Power of Daily Compounding Execution')}</span>
            </div>
            <p>
              {t("Your future is not forged in occasional marathons—it is constructed by making and executing One Signature Decision every single day.")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded bg-[var(--bg-elevated)] border border-[var(--border)]">
                <span className="font-bold text-[var(--fg)]">{t('🔥 Ignition (1-2d):')}</span> {t('Breaks initial inertia.')}
              </div>
              <div className="p-2 rounded bg-[var(--bg-elevated)] border border-[var(--border)]">
                <span className="font-bold text-[var(--fg)]">{t('🌊 Flow State (7d+):')}</span> {t('Effortless daily momentum.')}
              </div>
              <div className="p-2 rounded bg-[var(--bg-elevated)] border border-[var(--border)]">
                <span className="font-bold text-[var(--fg)]">{t('👑 Sovereign (30d+):')}</span> {t('Complete identity shift.')}
              </div>
            </div>
          </div>
        )}

        {/* Hero Streak Display Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Main Big Streak Metric */}
          <div className="md:col-span-5 p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border)] flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div
                className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shadow-sm transition-all ${
                  completedToday
                    ? 'bg-gradient-to-br from-[var(--color-sage)]/20 to-emerald-500/10 border-[var(--color-sage)] text-[var(--color-sage)]'
                    : currentStreak > 0
                    ? 'bg-gradient-to-br from-amber-500/20 to-[var(--color-coral)]/20 border-[var(--color-coral)] text-[var(--color-coral)]'
                    : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--fg-muted)]'
                }`}
              >
                <span className="text-2xl font-black font-display leading-none">{currentStreak}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                  {currentStreak === 1 ? t('Day') : t('Days')}
                </span>
              </div>
              {currentStreak > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-[var(--bg-elevated)] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                  {t('Active Momentum')}
                </span>
                {completedToday ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-sage)]/15 text-[var(--color-sage)] border border-[var(--color-sage)]/30">
                    <Check className="w-3 h-3" /> {t('Locked')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 animate-pulse">
                    {t('Today Pending')}
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-[var(--fg)] truncate">
                {completedToday
                  ? t('Today’s One Decision Completed')
                  : currentStreak > 0
                  ? t('Complete today to extend streak')
                  : t('Execute today to begin your streak')}
              </div>
              <p className="text-[11px] text-[var(--fg-muted)] line-clamp-1">{t(tier.description)}</p>
            </div>
          </div>

          {/* Milestone Progress Bar & Target */}
          <div className="md:col-span-7 p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[var(--fg-muted)] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[var(--color-coral)]" />
                <span>{t('Next Milestone Target:')}</span>
                <strong className="text-[var(--fg)] font-semibold">
                  {t('{n} Days', { n: tier.nextMilestone })} ({tier.name === 'Sovereignty' ? t('Mastery+') : t('Tier Upgrade')})
                </strong>
              </span>
              <span className="font-bold text-[var(--color-coral)]">
                {daysToNextMilestone === 0
                  ? t('Milestone Reached! 🎉')
                  : daysToNextMilestone === 1
                  ? t('1 day away')
                  : t('{n} days away', { n: daysToNextMilestone })}
              </span>
            </div>

            <Progress
              value={milestoneProgress}
              variant={completedToday ? 'sage' : 'coral'}
              size="md"
              className="h-2"
            />

            <div className="flex items-center justify-between text-[11px] text-[var(--fg-muted)]">
              <span>{tier.prevMilestone}d</span>
              <span className="font-medium text-[var(--fg)]">
                {t('{current} / {target} Days ({pct}%)', { current: currentStreak, target: tier.nextMilestone, pct: milestoneProgress })}
              </span>
              <span>{tier.nextMilestone}d</span>
            </div>
          </div>
        </div>

        {/* 7-Day Rolling Streak Ribbon (Interactive Timeline) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
            <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-[var(--fg-muted)]" />
              <span>{t('7-Day Decision Trajectory')}</span>
            </span>
            <span className="text-[11px]">
              {t('{n} of 7 days executed', { n: last7Days.filter((d) => d.isCompleted).length })}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {last7Days.map((day) => {
              const isHovered = hoveredDayDate === day.date;
              return (
                <div
                  key={day.date}
                  onMouseEnter={() => setHoveredDayDate(day.date)}
                  onMouseLeave={() => setHoveredDayDate(null)}
                  className={`relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-[var(--radius-sm)] border text-center transition-all cursor-default ${
                    day.isToday
                      ? day.isCompleted
                        ? 'bg-[var(--color-sage)]/15 border-[var(--color-sage)] ring-1 ring-[var(--color-sage)]'
                        : 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50'
                      : day.isCompleted
                      ? 'bg-[var(--bg-muted)] border-[var(--color-sage)]/40 hover:border-[var(--color-sage)]'
                      : 'bg-[var(--bg-muted)]/50 border-[var(--border)] opacity-60'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                    {t(day.dayLabel)}
                  </span>
                  <span className="text-xs font-semibold text-[var(--fg)] my-0.5">{day.dayNumber}</span>

                  <div className="my-1">
                    {day.isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-[var(--color-sage)] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : day.isToday ? (
                      <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-dashed animate-spin flex items-center justify-center" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[var(--border)]/60 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--fg-subtle)]" />
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] font-medium text-[var(--fg-muted)]">
                    {day.isToday ? t('Today') : day.isCompleted ? t('✓ Done') : t('Missed')}
                  </span>

                  {/* Day Hover Tooltip */}
                  {isHovered && day.title && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 bg-black/90 text-white text-[10px] rounded whitespace-nowrap pointer-events-none shadow-lg border border-white/10">
                      {day.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Stats Grid & Integrated Decision Action */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t('Current Streak')}
            </span>
            <div className="text-lg font-bold font-display text-[var(--fg)] flex items-center gap-1">
              <Flame className="w-4 h-4 text-[var(--color-coral)]" />
              <span>{t('{n} Days', { n: currentStreak })}</span>
            </div>
          </div>

          <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t('Longest Record')}
            </span>
            <div className="text-lg font-bold font-display text-[var(--fg)] flex items-center gap-1">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>{t('{n} Days', { n: longestStreak })}</span>
            </div>
          </div>

          <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t('Total Decisions')}
            </span>
            <div className="text-lg font-bold font-display text-[var(--fg)] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[var(--color-sage)]" />
              <span>{totalCompleted}</span>
            </div>
          </div>

          <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t('D$ Earned')}
            </span>
            <div className="text-lg font-bold font-display text-[var(--color-sage)] flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span>+D$ {totalRewardEarned.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Interactive Today's Decision Status Banner */}
        <div className="pt-2 border-t border-[var(--border)]">
          {completedToday ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-[var(--radius-sm)] bg-[var(--color-sage)]/10 border border-[var(--color-sage)]/30 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-sage)] flex-shrink-0" />
                <span className="font-semibold text-[var(--fg)]">
                  {t("Today's signature decision was successfully executed and recorded in your ledger (+D$ 500).")}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[var(--color-sage)] whitespace-nowrap">
                {t('Streak Safe Until Tomorrow')}
              </span>
            </div>
          ) : todayDecision ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--color-coral)]/30 text-xs">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-coral)] animate-ping" />
                  <span className="font-bold text-[var(--fg)]">{t("Today's Active Decision:")}</span>
                </div>
                <p className="font-medium text-[var(--fg)] truncate">{todayDecision.title}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
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
                  <Button
                    variant="accent"
                    size="sm"
                    icon={Check}
                    onClick={() => onCompleteDecision(todayDecision)}
                  >
                    {t('Complete Decision')}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[var(--fg)]">{t('No One Decision locked for today yet.')}</span>
                <p className="text-[var(--fg-muted)] text-[11px]">
                  {t("Lock in today's signature decision to maintain and grow your consecutive streak.")}
                </p>
              </div>
              {onSetDecision && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={onSetDecision}
                  className="flex-shrink-0"
                >
                  {t("Set Today's One Decision")}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
