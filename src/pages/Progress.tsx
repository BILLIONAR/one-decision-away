import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import {
  PageHeader,
  Card,
  Stat,
  Badge,
  Button,
  Progress as ProgressBar,
  Disclaimer,
} from '../components/ui';
import {
  TrendingUp,
  CheckCircle,
  Flame,
  Calendar,
  Compass,
  CreditCard,
  Layers,
  Sparkles,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  computeLedgerBalance,
  computeLifetimeEarned,
  computeLifetimeSpent,
  calculateCurrentStreak,
  calculateOneDecisionStreakData,
} from '../services/economy';
import { Last7DaysSummary } from '../components/Last7DaysSummary';
import { WeeklyMicroHabitsSummary } from '../components/WeeklyMicroHabitsSummary';
import { DailyPrimaryGoalsChart } from '../components/DailyPrimaryGoalsChart';
import { ExportHabitHistoryModal } from '../components/ExportHabitHistoryModal';
import { ExportProgressModal } from '../components/ExportProgressModal';
import { useT } from '../i18n';

export const Progress: React.FC = () => {
  const { data } = useApp();
  const t = useT();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showExportPngModal, setShowExportPngModal] = useState(false);

  if (!data) return null;

  const balance = computeLedgerBalance(data.transactions);
  const earned = computeLifetimeEarned(data.transactions);
  const spent = computeLifetimeSpent(data.transactions);
  const streak = calculateCurrentStreak(data.completions.map((c) => c.completedAt));
  const decisionStreak = calculateOneDecisionStreakData(data);

  // Area activity distribution
  const areaCounts: Record<string, number> = {
    Work: 0,
    Money: 0,
    Health: 0,
    Learning: 0,
    Relationships: 0,
    Environment: 0,
    'Personal Meaning': 0,
  };

  data.completions.forEach((c) => {
    const mission = data.missions.find((m) => m.id === c.missionId);
    if (mission && areaCounts[mission.area] !== undefined) {
      areaCounts[mission.area]++;
    }
  });

  const sortedAreas = Object.entries(areaCounts).sort((a, b) => b[1] - a[1]);
  const mostActiveArea = sortedAreas[0];
  const mostNeglectedArea = sortedAreas[sortedAreas.length - 1];

  // Weekly missions count (last 7 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const weeklyCompletions = data.completions.filter(
    (c) => new Date(c.completedAt) >= sevenDaysAgo
  ).length;

  const totalVotes = (data.twoFutures.buildingVotes || 0) + (data.twoFutures.allowingVotes || 0);
  const buildingVotePct =
    totalVotes > 0 ? Math.round(((data.twoFutures.buildingVotes || 0) / totalVotes) * 100) : 75;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('Progress & Trajectory')}
        subtitle={t('A calm, honest record of your executions, consistency, and life direction.')}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              id="export-progress-png-btn"
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => setShowExportPngModal(true)}
              title={t('Export progress visualization and milestone nodes as a shareable high-res PNG image')}
            >
              {t('Export Visualization (PNG)')}
            </Button>
            <Button
              id="export-habits-csv-btn"
              variant="secondary"
              size="sm"
              icon={FileSpreadsheet}
              onClick={() => setShowExportModal(true)}
              title={t('Download habit records as CSV spreadsheet')}
            >
              {t('Export Habits (CSV)')}
            </Button>
          </div>
        }
      />

      {/* Top Stat Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label={t('Weekly Completions')}
          value={t('{n} Missions', { n: weeklyCompletions })}
          subtext={t('Past 7 rolling days')}
          icon={Calendar}
        />
        <Stat
          label={t('Decision Streak')}
          value={t('{n} Days', { n: decisionStreak.currentStreak })}
          subtext={
            decisionStreak.currentStreak > 0
              ? t('{tier} ({n}d record)', { tier: t(decisionStreak.tier.name), n: decisionStreak.longestStreak })
              : t('Execute today to ignite')
          }
          icon={Flame}
        />
        <Stat
          label={t('Lifetime Earned')}
          value={`D$ ${earned.toLocaleString()}`}
          subtext={t('Total currency gained')}
          icon={CreditCard}
        />
        <Stat
          label={t('Purchased Dreams')}
          value={data.purchases.length}
          subtext={t('Furnished in My Life')}
          icon={Sparkles}
        />
      </div>

      {/* Primary Daily Goals 30-Day Frequency & Completion Recharts Visualization */}
      <DailyPrimaryGoalsChart onExportPng={() => setShowExportPngModal(true)} />

      {/* Weekly Micro-Habits Trends & Category Consistency Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t('Micro-Habits Consistency & Tracking')}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={FileSpreadsheet}
            onClick={() => setShowExportModal(true)}
            className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)]"
          >
            {t('Export History (CSV)')}
          </Button>
        </div>
        <WeeklyMicroHabitsSummary />
      </div>

      {/* 7-Day Performance & Velocity Summary View */}
      <Last7DaysSummary />

      {/* Trajectory & Meaningful Action Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              {t('Two Futures Trajectory')}
            </span>
            <Badge variant="sage">{t('{n}% Building', { n: buildingVotePct })}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-[var(--fg-muted)]">
              <span>{t('Votes for The Built Future: {n}', { n: data.twoFutures.buildingVotes || 0 })}</span>
              <span>{t('Votes for The Default Future: {n}', { n: data.twoFutures.allowingVotes || 0 })}</span>
            </div>
            <div className="h-3 w-full bg-[#9A8F86]/30 rounded-full overflow-hidden flex border border-[var(--border)]">
              <div
                className="h-full bg-[var(--color-sage)] transition-all duration-500 ease-out"
                style={{ width: `${buildingVotePct}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-[var(--fg-subtle)] leading-relaxed">
            {t('There is no penalty for missed days — only the quiet math of where your days go.')}
          </p>
        </Card>

        {/* Life Domain Activity Balance */}
        <Card padding="md" className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
            {t('Life Domain Focus Balance')}
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)]">
              <span className="text-[11px] text-[var(--color-sage)] font-bold block mb-1">
                {t('Most Active Domain')}
              </span>
              <div className="font-bold text-sm text-[var(--fg)]">
                {t('{area} ({n} missions)', { area: t(mostActiveArea[0]), n: mostActiveArea[1] })}
              </div>
              <p className="text-[10px] text-[var(--fg-subtle)] mt-1">
                {t('Your highest output area currently.')}
              </p>
            </div>

            <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)]">
              <span className="text-[11px] text-[var(--color-coral)] font-bold block mb-1">
                {t('Opportunity Area')}
              </span>
              <div className="font-bold text-sm text-[var(--fg)]">
                {t('{area} ({n} missions)', { area: t(mostNeglectedArea[0]), n: mostNeglectedArea[1] })}
              </div>
              <p className="text-[10px] text-[var(--fg-subtle)] mt-1">
                {t("Consider framing tomorrow's One Decision here.")}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            {Object.entries(areaCounts).map(([area, count]) => {
              const max = Math.max(1, ...Object.values(areaCounts));
              const pct = Math.round((count / max) * 100);
              return (
                <div key={area} className="flex items-center gap-3 text-xs">
                  <span className="w-28 text-[var(--fg-muted)] truncate">{t(area)}</span>
                  <div className="flex-1 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-slate)] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-[var(--fg-subtle)]">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Reality Bridges Master Real Savings Summary */}
      <Card padding="md" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-display text-[var(--fg)]">
              {t('Physical Reality Bridges')}
            </h3>
            <p className="text-xs text-[var(--fg-muted)]">
              {t('Translating symbolic Dream Market purchases into physical savings accounts and actions.')}
            </p>
          </div>
          <Badge variant="coral">{t('{n} Active', { n: data.realityBridges.length })}</Badge>
        </div>

        {data.realityBridges.length > 0 ? (
          <div className="space-y-3 pt-2">
            {data.realityBridges.map((bridge) => {
              const purchase = data.purchases.find((p) => p.id === bridge.purchaseId);
              return (
                <div
                  key={bridge.id}
                  className="p-3.5 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--fg)]">
                      {purchase?.itemSnapshot.name || t('Dream Item')}
                    </span>
                    <span className="font-semibold text-[var(--color-coral)]">
                      ${bridge.currentSavingsUsd.toLocaleString()} / ${bridge.realCostUsd.toLocaleString()} ({bridge.realProgressPct}%)
                    </span>
                  </div>
                  <ProgressBar value={bridge.realProgressPct} variant="coral" />
                  <div className="flex justify-between text-[11px] text-[var(--fg-subtle)]">
                    <span>{t('Target Date: {date}', { date: bridge.targetDate })}</span>
                    <span>{t('Req. Monthly: ${n}/mo', { n: bridge.requiredMonthlySavingsUsd.toLocaleString() })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--fg-subtle)]">
            {t('No Reality Bridges connected yet. Purchase a dream in the Market to establish your first physical execution plan.')}
          </p>
        )}
      </Card>

      <Disclaimer text={t('One Decision Away prioritizes directional honesty over high-pressure streak gamification. Missed days are data points, not failures.')} />

      {/* Micro-Habit History CSV Export Modal */}
      <ExportHabitHistoryModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Progress Visualization PNG Export Modal */}
      <ExportProgressModal
        isOpen={showExportPngModal}
        onClose={() => setShowExportPngModal(false)}
        targetElementId="daily-primary-goals-visualization-card"
      />
    </div>
  );
};
