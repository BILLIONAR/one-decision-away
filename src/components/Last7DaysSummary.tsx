import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../store/useApp';
import { Progress as ProgressBar } from './ui';
import { Check } from 'lucide-react';
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Line,
  ComposedChart,
} from 'recharts';
import { Mission, MissionCompletion, WalletTransaction } from '../types/models';
import { useT, getSpeechLang } from '../i18n';

/* ----------------------------- Chart palette ----------------------------- */
const readVar = (name: string, fallback: string): string => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
};

const readChartColors = () => ({
  accent: readVar('--accent', '#1F5F3F'),
  secondary: readVar('--border-strong', '#C9C9C6'),
  tertiary: readVar('--fg-muted', '#6F6F6C'),
  grid: readVar('--border', '#E4E4E1'),
  text: readVar('--fg-muted', '#6F6F6C'),
  fg: readVar('--fg', '#111111'),
  bg: readVar('--bg', '#FFFFFF'),
});

const useChartColors = () => {
  const [colors, setColors] = useState(readChartColors);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => setColors(readChartColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    return () => observer.disconnect();
  }, []);
  return colors;
};

interface DaySummaryData {
  dayKey: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Mon"
  fullDayLabel: string; // e.g. "Monday, Sep 1"
  dateNum: number;
  isToday: boolean;
  isYesterday: boolean;
  totalEarned: number;
  missionEarnings: number;
  oneDecisionEarnings: number;
  habitEarnings: number;
  focusEarnings: number;
  checkInEarnings: number;
  otherEarnings: number;
  missionsCompletedCount: number;
  oneDecisionsCompletedCount: number;
  completedMissions: Array<{
    completion: MissionCompletion;
    mission?: Mission;
  }>;
}

export const Last7DaysSummary: React.FC = () => {
  const { data } = useApp();
  const t = useT();
  const colors = useChartColors();
  const [activeTab, setActiveTab] = useState<'overview' | 'missions' | 'earnings'>('overview');
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const {
    sevenDaysList,
    total7DayEarnings,
    total7DayMissions,
    total7DayOneDecisions,
    avgDailyEarnings,
    avgDailyMissions,
    activeDaysCount,
    bestEarningDay,
    all7DayCompletions,
    earningsBySource,
  } = useMemo(() => {
    if (!data) {
      return {
        sevenDaysList: [],
        total7DayEarnings: 0,
        total7DayMissions: 0,
        total7DayOneDecisions: 0,
        avgDailyEarnings: 0,
        avgDailyMissions: 0,
        activeDaysCount: 0,
        bestEarningDay: null,
        all7DayCompletions: [],
        earningsBySource: {
          missions: 0,
          oneDecision: 0,
          habits: 0,
          focus: 0,
          checkIn: 0,
          other: 0,
        },
      };
    }

    const todayDate = new Date();
    const days: DaySummaryData[] = [];
    const dayMap: Record<string, DaySummaryData> = {};

    // Build the 7-day chronological window (6 days ago -> Today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate.getTime() - i * 86400000);
      const dayKey = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString(getSpeechLang(), { weekday: 'short' });
      const fullDayLabel = d.toLocaleDateString(getSpeechLang(), {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const dateNum = d.getDate();
      const isToday = i === 0;
      const isYesterday = i === 1;

      const dayObj: DaySummaryData = {
        dayKey,
        dayLabel,
        fullDayLabel,
        dateNum,
        isToday,
        isYesterday,
        totalEarned: 0,
        missionEarnings: 0,
        oneDecisionEarnings: 0,
        habitEarnings: 0,
        focusEarnings: 0,
        checkInEarnings: 0,
        otherEarnings: 0,
        missionsCompletedCount: 0,
        oneDecisionsCompletedCount: 0,
        completedMissions: [],
      };

      days.push(dayObj);
      dayMap[dayKey] = dayObj;
    }

    const sources = {
      missions: 0,
      oneDecision: 0,
      habits: 0,
      focus: 0,
      checkIn: 0,
      other: 0,
    };

    // 1. Process Transactions in 7-day window
    (data.transactions || []).forEach((t: WalletTransaction) => {
      // Only count positive earning transactions
      if (t.amount > 0 && t.kind !== 'purchase') {
        const tDate = t.dayKey || t.createdAt.slice(0, 10);
        if (dayMap[tDate]) {
          dayMap[tDate].totalEarned += t.amount;

          switch (t.kind) {
            case 'mission_reward':
              dayMap[tDate].missionEarnings += t.amount;
              sources.missions += t.amount;
              break;
            case 'one_decision_reward':
              dayMap[tDate].oneDecisionEarnings += t.amount;
              sources.oneDecision += t.amount;
              break;
            case 'micro_habit_reward':
              dayMap[tDate].habitEarnings += t.amount;
              sources.habits += t.amount;
              break;
            case 'focus_reward':
              dayMap[tDate].focusEarnings += t.amount;
              sources.focus += t.amount;
              break;
            case 'check_in_reward':
              dayMap[tDate].checkInEarnings += t.amount;
              sources.checkIn += t.amount;
              break;
            default:
              dayMap[tDate].otherEarnings += t.amount;
              sources.other += t.amount;
              break;
          }
        }
      }
    });

    // 2. Process Mission Completions in 7-day window
    const allCompletions: Array<{ completion: MissionCompletion; mission?: Mission; dayKey: string }> = [];

    (data.completions || []).forEach((c: MissionCompletion) => {
      const cDate = c.completedAt.slice(0, 10);
      if (dayMap[cDate]) {
        const mission = data.missions.find((m) => m.id === c.missionId);
        dayMap[cDate].missionsCompletedCount += 1;
        if (mission?.isOneDecision) {
          dayMap[cDate].oneDecisionsCompletedCount += 1;
        }
        dayMap[cDate].completedMissions.push({
          completion: c,
          mission,
        });

        allCompletions.push({
          completion: c,
          mission,
          dayKey: cDate,
        });
      }
    });

    // Sort completions newest first
    allCompletions.sort(
      (a, b) => new Date(b.completion.completedAt).getTime() - new Date(a.completion.completedAt).getTime()
    );

    const total7DayEarnings = days.reduce((acc, d) => acc + d.totalEarned, 0);
    const total7DayMissions = days.reduce((acc, d) => acc + d.missionsCompletedCount, 0);
    const total7DayOneDecisions = days.reduce((acc, d) => acc + d.oneDecisionsCompletedCount, 0);
    const activeDaysCount = days.filter((d) => d.totalEarned > 0 || d.missionsCompletedCount > 0).length;
    const avgDailyEarnings = Math.round(total7DayEarnings / 7);
    const avgDailyMissions = Number((total7DayMissions / 7).toFixed(1));

    let bestDay: DaySummaryData | null = null;
    days.forEach((d) => {
      if (!bestDay || d.totalEarned > bestDay.totalEarned) {
        bestDay = d;
      }
    });

    return {
      sevenDaysList: days,
      total7DayEarnings,
      total7DayMissions,
      total7DayOneDecisions,
      avgDailyEarnings,
      avgDailyMissions,
      activeDaysCount,
      bestEarningDay: bestDay,
      all7DayCompletions: allCompletions,
      earningsBySource: sources,
    };
  }, [data, t]);

  if (!data) return null;

  // Selected day details or default to today if present
  const selectedDayData = selectedDayKey
    ? sevenDaysList.find((d) => d.dayKey === selectedDayKey) || null
    : null;

  const pctOf = (amount: number) =>
    total7DayEarnings > 0 ? Math.round((amount / total7DayEarnings) * 100) : 0;

  const sourceRows = [
    { key: 'oneDecision', label: t('One Decisions'), amount: earningsBySource.oneDecision },
    { key: 'missions', label: t('Mission Quests'), amount: earningsBySource.missions },
    { key: 'habits', label: t('Micro-Habits'), amount: earningsBySource.habits },
    { key: 'focus', label: t('Focus Sessions'), amount: earningsBySource.focus },
    { key: 'checkIn', label: t('Daily Check-Ins'), amount: earningsBySource.checkIn },
    { key: 'other', label: t('Bonuses & Grants'), amount: earningsBySource.other },
  ];

  const tabClass = (active: boolean) =>
    `h-11 px-3 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors cursor-pointer ${
      active ? 'bg-[var(--bg)] text-[var(--fg)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
    }`;

  return (
    <div className="bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('Last 7 days')}</h2>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
            {t('Missions finished and Dream Dollars earned this week.')}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[var(--bg-inset)] p-1 rounded-[var(--radius-sm)] self-start">
          <button type="button" onClick={() => setActiveTab('overview')} className={tabClass(activeTab === 'overview')}>
            {t('Overview')}
          </button>
          <button type="button" onClick={() => setActiveTab('missions')} className={tabClass(activeTab === 'missions')}>
            {t('Missions')}
            <span className="ml-1.5 text-[var(--fg-muted)]">{total7DayMissions}</span>
          </button>
          <button type="button" onClick={() => setActiveTab('earnings')} className={tabClass(activeTab === 'earnings')}>
            {t('Sources')}
          </button>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--accent)] leading-none">
            +D$ {total7DayEarnings.toLocaleString()}
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('7-Day Total D$')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('Avg. +D$ {amount} / day', { amount: avgDailyEarnings.toLocaleString() })}
          </div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">{total7DayMissions}</div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Missions Completed')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('Avg. {n} missions / day', { n: avgDailyMissions })}
          </div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
            {total7DayOneDecisions}
            <span className="text-[13px] font-normal text-[var(--fg-muted)] ml-1">{t('/ 7 Days')}</span>
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('One Decisions')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {total7DayOneDecisions >= 5 ? t('High consistency') : t('Daily signature focus')}
          </div>
        </div>

        <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4">
          <div className="text-[22px] font-semibold text-[var(--fg)] leading-none">
            {Math.round((activeDaysCount / 7) * 100)}%
          </div>
          <div className="text-[12px] text-[var(--fg-muted)] mt-2">{t('Active days')}</div>
          <div className="text-[12px] text-[var(--fg-subtle)] mt-0.5">
            {t('{n} of 7 active days', { n: activeDaysCount })}
          </div>
        </div>
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Earnings and missions by day')}</h3>
                <p className="text-[13px] text-[var(--fg-muted)]">
                  {t('Bars are D$ earned; the line is missions finished.')}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[12px] text-[var(--fg-muted)]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[3px] bg-[var(--accent)] inline-block" />
                  <span>{t('D$ Earned')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded-full bg-[var(--fg-muted)] inline-block" />
                  <span>{t('Missions')}</span>
                </div>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={sevenDaysList}
                  margin={{ top: 12, right: 8, left: -10, bottom: 0 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      const clickedKey = (e.activePayload[0].payload as DaySummaryData).dayKey;
                      setSelectedDayKey((prev) => (prev === clickedKey ? null : clickedKey));
                    }
                  }}
                >
                  <CartesianGrid vertical={false} stroke={colors.grid} />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fill: colors.text, fontSize: 11 }}
                    axisLine={{ stroke: colors.grid }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: colors.text, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `D$${val}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    allowDecimals={false}
                    tick={{ fill: colors.text, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: colors.grid, opacity: 0.5 }}
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload as DaySummaryData;
                      return (
                        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[12px] p-3 space-y-1 min-w-44">
                          <div className="flex items-center justify-between gap-3 pb-2 mb-1 border-b border-[var(--border)]">
                            <span className="font-semibold text-[var(--fg)]">{d.fullDayLabel}</span>
                            {d.isToday && <span className="text-[var(--accent)] font-medium">{t('Today')}</span>}
                          </div>
                          <div className="flex justify-between items-center gap-3">
                            <span className="text-[var(--fg-muted)]">{t('Total D$ Earned:')}</span>
                            <span className="font-medium text-[var(--accent)]">+D$ {d.totalEarned.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center gap-3">
                            <span className="text-[var(--fg-muted)]">{t('Missions Done:')}</span>
                            <span className="font-medium text-[var(--fg)]">{d.missionsCompletedCount}</span>
                          </div>
                          {d.oneDecisionsCompletedCount > 0 && (
                            <div className="flex justify-between items-center gap-3">
                              <span className="text-[var(--fg-muted)]">{t('Signature Decision:')}</span>
                              <span className="font-medium text-[var(--fg)]">{t('Done')}</span>
                            </div>
                          )}
                          <div className="text-[var(--fg-subtle)] pt-1">
                            {t('Click day below for detailed inspection')}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="totalEarned"
                    name={t('D$ Earned')}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    {sevenDaysList.map((entry) => (
                      <Cell
                        key={`cell-${entry.dayKey}`}
                        fill={entry.totalEarned > 0 ? colors.accent : colors.secondary}
                        opacity={entry.dayKey === selectedDayKey || entry.isToday ? 1 : entry.totalEarned > 0 ? 0.75 : 0.6}
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="missionsCompletedCount"
                    name={t('Missions')}
                    stroke={colors.tertiary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors.bg, strokeWidth: 2, stroke: colors.tertiary }}
                    activeDot={{ r: 5, fill: colors.tertiary, stroke: colors.bg }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Day-by-day */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Day by day')}</h3>
              <span className="text-[13px] text-[var(--fg-muted)]">{t('Click a day to view completions')}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {sevenDaysList.map((day) => {
                const isSelected = selectedDayKey === day.dayKey;
                const isActive = day.totalEarned > 0 || day.missionsCompletedCount > 0;
                return (
                  <button
                    type="button"
                    key={day.dayKey}
                    onClick={() => setSelectedDayKey(isSelected ? null : day.dayKey)}
                    className={`p-4 rounded-[var(--radius-sm)] text-left transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-[var(--bg)] border-[var(--fg)]'
                        : 'bg-[var(--bg)] border-transparent hover:border-[var(--border-strong)]'
                    } ${!isActive && !isSelected ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[var(--fg)]">
                        {day.isToday ? t('Today') : day.isYesterday ? t('Yest.') : day.dayLabel}
                      </span>
                      <span className="text-[12px] text-[var(--fg-muted)]">{day.fullDayLabel.split(', ')[1]}</span>
                    </div>
                    <div className="mt-3 text-[15px] font-semibold text-[var(--accent)]">
                      +D$ {day.totalEarned.toLocaleString()}
                    </div>
                    <div className="text-[12px] text-[var(--fg-muted)] mt-0.5">
                      {day.missionsCompletedCount === 1 ? t('1 mission') : t('{n} missions', { n: day.missionsCompletedCount })}
                    </div>
                    <div className="text-[12px] mt-2">
                      {day.oneDecisionsCompletedCount > 0 ? (
                        <span className="text-[var(--accent)] font-medium">{t('Decision')}</span>
                      ) : day.totalEarned > 0 ? (
                        <span className="text-[var(--fg-muted)]">{t('Active')}</span>
                      ) : (
                        <span className="text-[var(--fg-subtle)]">{t('Rest')}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day */}
          {selectedDayData && (
            <div className="bg-[var(--bg)] rounded-[var(--radius-sm)] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-semibold text-[var(--fg)]">
                  {selectedDayData.fullDayLabel} · {t('Detailed Record (+D$ {amount} earned)', { amount: selectedDayData.totalEarned.toLocaleString() })}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDayKey(null)}
                  className="h-11 px-2 text-[13px] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer shrink-0"
                >
                  {t('Close')}
                </button>
              </div>

              {selectedDayData.completedMissions.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[12px] text-[var(--fg-muted)] block">
                    {t('Completed Missions on {day}:', { day: selectedDayData.dayLabel })}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDayData.completedMissions.map(({ completion, mission }, idx) => (
                      <div
                        key={completion.id || idx}
                        className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[13px] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <Check className="w-[18px] h-[18px] text-[var(--accent)] shrink-0" strokeWidth={1.8} />
                          <div className="min-w-0">
                            <div className="font-medium text-[var(--fg)] truncate">
                              {mission?.title || t('One Decision / Quest')}
                            </div>
                            {mission?.area && (
                              <div className="text-[12px] text-[var(--fg-muted)]">
                                {t('Area: {area} • {type}', { area: mission.area, type: mission.type })}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className="font-medium text-[var(--accent)] shrink-0">
                          +D$ {completion.rewardAmount || 500}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-[var(--fg-muted)]">
                  {t('No mission completion records logged on this day. D$ rewards came from micro-habits, check-ins, or focus time.')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Missions */}
      {activeTab === 'missions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[15px] font-semibold text-[var(--fg)]">
              {t('All Missions Completed in the Last 7 Days ({n})', { n: all7DayCompletions.length })}
            </h3>
            <span className="text-[13px] text-[var(--fg-muted)]">{t('{n} One Decisions', { n: total7DayOneDecisions })}</span>
          </div>

          {all7DayCompletions.length > 0 ? (
            <div className="space-y-2">
              {all7DayCompletions.map(({ completion, mission, dayKey }, idx) => {
                const isDecision = mission?.isOneDecision;
                const formattedTime = new Date(completion.completedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const dayObj = sevenDaysList.find((d) => d.dayKey === dayKey);

                return (
                  <div
                    key={completion.id || idx}
                    className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <Check className="w-[18px] h-[18px] text-[var(--accent)] shrink-0 mt-0.5" strokeWidth={1.8} />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[15px] font-medium text-[var(--fg)]">
                            {mission?.title || t('Completed Objective')}
                          </span>
                          {isDecision && (
                            <span className="text-[12px] text-[var(--accent)] font-medium">{t('One Decision')}</span>
                          )}
                          {mission?.area && <span className="text-[12px] text-[var(--fg-muted)]">{mission.area}</span>}
                          {mission?.difficulty && (
                            <span className="text-[12px] text-[var(--fg-muted)]">{mission.difficulty}</span>
                          )}
                        </div>

                        {completion.note && (
                          <p className="text-[13px] text-[var(--fg-muted)] line-clamp-2">{completion.note}</p>
                        )}

                        <div className="text-[12px] text-[var(--fg-subtle)] flex items-center gap-2 flex-wrap">
                          <span>{t('{day} at {time}', { day: dayObj?.fullDayLabel || dayKey, time: formattedTime })}</span>
                          {completion.focusMinutes && (
                            <span>{t('{n}m Deep Focus', { n: completion.focusMinutes })}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1">
                      <span className="text-[15px] font-semibold text-[var(--accent)]">
                        +D$ {(completion.rewardAmount || 500).toLocaleString()}
                      </span>
                      <span className="text-[12px] text-[var(--fg-muted)]">
                        {t('Method: {method}', { method: completion.method || t('verified') })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-[var(--bg)] rounded-[var(--radius-sm)] space-y-1">
              <p className="text-[15px] font-semibold text-[var(--fg)]">{t('No missions completed in the last 7 days yet.')}</p>
              <p className="text-[13px] text-[var(--fg-muted)]">
                {t('Execute your daily signature One Decision or mission quests to populate your weekly record.')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sources */}
      {activeTab === 'earnings' && (
        <div className="space-y-3">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Where your D$ came from')}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sourceRows.map((row) => (
              <div key={row.key} className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg)] space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[22px] font-semibold text-[var(--fg)] leading-none">
                    +D$ {row.amount.toLocaleString()}
                  </span>
                  <span className="text-[12px] text-[var(--fg-muted)]">
                    {t('{pct}% of weekly earnings', { pct: pctOf(row.amount) })}
                  </span>
                </div>
                <div className="text-[12px] text-[var(--fg-muted)]">{row.label}</div>
                <ProgressBar value={pctOf(row.amount)} variant="sage" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
