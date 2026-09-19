import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Download, FileSpreadsheet } from 'lucide-react';
import {
  computeLifetimeEarned,
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

  const earned = computeLifetimeEarned(data.transactions);
  const decisionStreak = calculateOneDecisionStreakData(data);

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

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const weeklyCompletions = data.completions.filter(
    (c) => new Date(c.completedAt) >= sevenDaysAgo
  ).length;

  const totalVotes = (data.twoFutures.buildingVotes || 0) + (data.twoFutures.allowingVotes || 0);
  const buildingVotePct =
    totalVotes > 0 ? Math.round(((data.twoFutures.buildingVotes || 0) / totalVotes) * 100) : 75;

  const stats = [
    { label: t('This week'), value: String(weeklyCompletions), sub: t('missions done') },
    {
      label: t('Streak'),
      value: t('{n} days', { n: decisionStreak.currentStreak }),
      sub: t('best {n}', { n: decisionStreak.longestStreak }),
    },
    { label: t('Earned'), value: `D$ ${earned.toLocaleString()}`, sub: t('all time') },
    { label: t('Dreams'), value: String(data.purchases.length), sub: t('bought') },
  ];

  const secondaryBtn =
    'h-11 px-4 inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] text-sm font-medium';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)]">{t('Progress')}</h1>
        <p className="text-sm text-[var(--fg-muted)] mt-1">{t('Where your days are going.')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-4">
            <div className="text-xs text-[var(--fg-muted)]">{s.label}</div>
            <div className="text-xl font-semibold tracking-tight text-[var(--fg)] mt-1">{s.value}</div>
            <div className="text-xs text-[var(--fg-subtle)] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <DailyPrimaryGoalsChart onExportPng={() => setShowExportPngModal(true)} />

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Habits')}</h2>
        <WeeklyMicroHabitsSummary />
      </div>

      <Last7DaysSummary />

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Direction')}</h2>
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--fg)]">{t('{n}% building', { n: buildingVotePct })}</span>
            <span className="text-[var(--fg-muted)]">
              {t('{a} to {b}', {
                a: data.twoFutures.buildingVotes || 0,
                b: data.twoFutures.allowingVotes || 0,
              })}
            </span>
          </div>
          <div className="h-2 w-full bg-[var(--border-strong)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${buildingVotePct}%` }}
            />
          </div>
          <p className="text-xs text-[var(--fg-muted)]">
            {t('No penalty for missed days. Just the math of where your days go.')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Areas')}</h2>
        <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-[var(--fg-muted)]">{t('Most active')}</div>
              <div className="font-medium text-[var(--fg)] mt-0.5">
                {t('{area} ({n})', { area: t(mostActiveArea[0]), n: mostActiveArea[1] })}
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--fg-muted)]">{t('Needs attention')}</div>
              <div className="font-medium text-[var(--fg)] mt-0.5">
                {t('{area} ({n})', { area: t(mostNeglectedArea[0]), n: mostNeglectedArea[1] })}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(areaCounts).map(([area, count]) => {
              const max = Math.max(1, ...Object.values(areaCounts));
              const pct = Math.round((count / max) * 100);
              return (
                <div key={area} className="flex items-center gap-3 text-xs">
                  <span className="w-28 text-[var(--fg-muted)] truncate">{t(area)}</span>
                  <div className="flex-1 h-1.5 bg-[var(--border-strong)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right text-[var(--fg-subtle)]">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Bridges')}</h2>
        {data.realityBridges.length > 0 ? (
          <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] divide-y divide-[var(--border)]">
            {data.realityBridges.map((bridge) => {
              const purchase = data.purchases.find((p) => p.id === bridge.purchaseId);
              return (
                <div key={bridge.id} className="px-4 py-3 min-h-[56px] space-y-2">
                  <div className="flex items-center justify-between text-sm gap-3">
                    <span className="font-medium text-[var(--fg)] truncate">
                      {t(purchase?.itemSnapshot.name || 'Dream')}
                    </span>
                    <span className="text-[var(--fg-muted)] shrink-0">
                      ${bridge.currentSavingsUsd.toLocaleString()} / ${bridge.realCostUsd.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--border-strong)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, bridge.realProgressPct))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--fg-subtle)]">
                    <span>{t('By {date}', { date: bridge.targetDate })}</span>
                    <span>{t('${n}/month', { n: bridge.requiredMonthlySavingsUsd.toLocaleString() })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5">
            <p className="text-sm text-[var(--fg-muted)]">
              {t('No bridges yet. Buy a dream to set up a savings plan.')}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Export')}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            id="export-progress-png-btn"
            type="button"
            onClick={() => setShowExportPngModal(true)}
            className={secondaryBtn}
          >
            <Download className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {t('Image')}
          </button>
          <button
            id="export-habits-csv-btn"
            type="button"
            onClick={() => setShowExportModal(true)}
            className={secondaryBtn}
          >
            <FileSpreadsheet className="w-[18px] h-[18px]" strokeWidth={1.8} />
            {t('Habits CSV')}
          </button>
        </div>
      </div>

      <ExportHabitHistoryModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />

      <ExportProgressModal
        isOpen={showExportPngModal}
        onClose={() => setShowExportPngModal(false)}
        targetElementId="daily-primary-goals-visualization-card"
      />
    </div>
  );
};
