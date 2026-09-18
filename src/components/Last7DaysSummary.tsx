import React, { useMemo, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Badge, Button, Progress as ProgressBar } from './ui';
import {
  TrendingUp,
  Target,
  Coins,
  Calendar,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Zap,
  Layers,
  ChevronRight,
  Award,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
  Line,
  ComposedChart,
} from 'recharts';
import { Mission, MissionCompletion, WalletTransaction } from '../types/models';

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
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDayLabel = d.toLocaleDateString('en-US', {
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
  }, [data]);

  if (!data) return null;

  // Selected day details or default to today if present
  const selectedDayData = selectedDayKey
    ? sevenDaysList.find((d) => d.dayKey === selectedDayKey) || null
    : null;

  return (
    <Card padding="lg" className="space-y-6 border border-[var(--border)] relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--color-sage)]/10 via-[var(--color-coral)]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--color-sage)]/15 text-[var(--color-sage)]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-[var(--fg)] tracking-tight">
                7-Day Performance & Earnings Summary
              </h2>
              <p className="text-xs text-[var(--fg-muted)]">
                Rolling weekly velocity of completed missions and earned Dream Dollars (D$).
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[var(--bg-muted)] p-1 rounded-[var(--radius-sm)] border border-[var(--border)] self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-[var(--radius-xs)] font-semibold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            Overview & Velocity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('missions')}
            className={`px-3 py-1.5 rounded-[var(--radius-xs)] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'missions'
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            <span>Missions</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-sage)]/20 text-[var(--color-sage)] text-[10px]">
              {total7DayMissions}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('earnings')}
            className={`px-3 py-1.5 rounded-[var(--radius-xs)] font-semibold transition-all cursor-pointer ${
              activeTab === 'earnings'
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            Revenue Sources
          </button>
        </div>
      </div>

      {/* 4-Key Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 relative">
        {/* Total D$ Earned */}
        <div className="p-4 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--bg-muted)] to-[var(--color-sage)]/10 border border-[var(--color-sage)]/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-sage)]">
              7-Day Total D$
            </span>
            <Coins className="w-4 h-4 text-[var(--color-sage)]" />
          </div>
          <div className="text-2xl font-black font-display text-[var(--fg)]">
            +D$ {total7DayEarnings.toLocaleString()}
          </div>
          <p className="text-[11px] text-[var(--fg-muted)]">
            Avg. +D$ {avgDailyEarnings.toLocaleString()} / day
          </p>
        </div>

        {/* Total Missions Completed */}
        <div className="p-4 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--bg-muted)] to-[var(--color-coral)]/10 border border-[var(--color-coral)]/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-coral)]">
              Missions Completed
            </span>
            <Target className="w-4 h-4 text-[var(--color-coral)]" />
          </div>
          <div className="text-2xl font-black font-display text-[var(--fg)]">
            {total7DayMissions} <span className="text-sm font-normal text-[var(--fg-muted)]">Missions</span>
          </div>
          <p className="text-[11px] text-[var(--fg-muted)]">
            Avg. {avgDailyMissions} missions / day
          </p>
        </div>

        {/* Signature Decisions Completed */}
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
              One Decisions
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black font-display text-[var(--fg)]">
            {total7DayOneDecisions}{' '}
            <span className="text-sm font-normal text-[var(--fg-muted)]">/ 7 Days</span>
          </div>
          <p className="text-[11px] text-[var(--fg-muted)]">
            {total7DayOneDecisions >= 5 ? '🔥 High consistency' : 'Daily signature focus'}
          </p>
        </div>

        {/* Active Velocity / Execution Rate */}
        <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              Execution Velocity
            </span>
            <Sparkles className="w-4 h-4 text-[var(--color-sage)]" />
          </div>
          <div className="text-2xl font-black font-display text-[var(--fg)]">
            {Math.round((activeDaysCount / 7) * 100)}%
          </div>
          <p className="text-[11px] text-[var(--fg-muted)]">
            {activeDaysCount} of 7 active days
          </p>
        </div>
      </div>

      {/* Main Content Area based on Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dual-Axis Recharts Visualization: D$ Earned (Bars) & Missions Completed (Lines) */}
          <div className="p-4 sm:p-5 rounded-[var(--radius-md)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-[var(--fg)] font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[var(--color-sage)]" />
                  <span>Daily D$ Earnings & Mission Count Over Time</span>
                </h3>
                <p className="text-xs text-[var(--fg-muted)]">
                  Bars represent daily D$ currency earned; dots indicate missions executed.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-[var(--color-sage)] inline-block" />
                  <span className="text-[var(--fg-muted)]">D$ Earned</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-coral)] inline-block" />
                  <span className="text-[var(--fg-muted)]">Missions</span>
                </div>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={sevenDaysList}
                  margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      const clickedKey = (e.activePayload[0].payload as DaySummaryData).dayKey;
                      setSelectedDayKey((prev) => (prev === clickedKey ? null : clickedKey));
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="dayLabel"
                    tick={{ fill: 'var(--fg-muted)', fontSize: 11 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={{ stroke: 'var(--border)' }}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: 'var(--fg-muted)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={{ stroke: 'var(--border)' }}
                    tickFormatter={(val) => `D$${val}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    allowDecimals={false}
                    tick={{ fill: 'var(--color-coral)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={{ stroke: 'var(--border)' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload as DaySummaryData;
                      return (
                        <div className="p-3 bg-black/90 text-white rounded-[var(--radius-sm)] border border-white/15 shadow-xl text-xs space-y-1.5 min-w-44">
                          <div className="flex items-center justify-between border-b border-white/10 pb-1 font-bold">
                            <span>{d.fullDayLabel}</span>
                            {d.isToday && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-[var(--color-sage)] text-white rounded-full">
                                Today
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-[var(--color-sage)] font-semibold">
                            <span>Total D$ Earned:</span>
                            <span className="font-mono">+D$ {d.totalEarned.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-[var(--color-coral)]">
                            <span>Missions Done:</span>
                            <span className="font-mono font-bold">{d.missionsCompletedCount}</span>
                          </div>
                          {d.oneDecisionsCompletedCount > 0 && (
                            <div className="flex justify-between items-center text-amber-400 text-[11px]">
                              <span>Signature Decision:</span>
                              <span>✓ Done</span>
                            </div>
                          )}
                          <div className="text-[10px] text-white/50 pt-0.5 border-t border-white/10">
                            Click day below for detailed inspection
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="totalEarned"
                    name="D$ Earned"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  >
                    {sevenDaysList.map((entry) => (
                      <Cell
                        key={`cell-${entry.dayKey}`}
                        fill={
                          entry.dayKey === selectedDayKey
                            ? '#2A9D8F'
                            : entry.isToday
                            ? '#38A3A5'
                            : entry.totalEarned > 0
                            ? 'var(--color-sage)'
                            : 'var(--border)'
                        }
                        opacity={entry.totalEarned > 0 ? 0.9 : 0.4}
                      />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="missionsCompletedCount"
                    name="Missions"
                    stroke="var(--color-coral)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--color-coral)', strokeWidth: 1.5, stroke: 'var(--bg)' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Day-by-Day Interactive 7-Day Timeline Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
              <span className="font-bold uppercase tracking-wider text-[11px] text-[var(--fg)]">
                Daily Breakdown (Past 7 Days)
              </span>
              <span className="text-[11px]">Click a day to view completions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
              {sevenDaysList.map((day) => {
                const isSelected = selectedDayKey === day.dayKey;
                return (
                  <button
                    type="button"
                    key={day.dayKey}
                    onClick={() => setSelectedDayKey(isSelected ? null : day.dayKey)}
                    className={`p-3 rounded-[var(--radius-sm)] border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                      isSelected
                        ? 'bg-[var(--color-sage)]/15 border-[var(--color-sage)] ring-2 ring-[var(--color-sage)]/40 shadow-sm'
                        : day.isToday
                        ? 'bg-[var(--bg-elevated)] border-amber-500/50 hover:border-amber-500'
                        : day.totalEarned > 0 || day.missionsCompletedCount > 0
                        ? 'bg-[var(--bg-elevated)] border-[var(--border)] hover:border-[var(--color-sage)]/50'
                        : 'bg-[var(--bg-muted)] border-[var(--border)] opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* Day & Date Header */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] font-bold text-[var(--fg)]">
                        {day.isToday ? 'Today' : day.isYesterday ? 'Yest.' : day.dayLabel}
                      </span>
                      <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                        {day.fullDayLabel.split(', ')[1]}
                      </span>
                    </div>

                    {/* D$ Earnings Amount */}
                    <div className="my-1">
                      <div className="text-xs font-mono font-bold text-[var(--color-sage)]">
                        +D$ {day.totalEarned.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[var(--fg-muted)] flex items-center gap-1 mt-0.5">
                        <Target className="w-3 h-3 text-[var(--color-coral)]" />
                        <span>{day.missionsCompletedCount} {day.missionsCompletedCount === 1 ? 'mission' : 'missions'}</span>
                      </div>
                    </div>

                    {/* Footer Pill Status */}
                    <div className="pt-1.5 border-t border-[var(--border)] flex items-center justify-between w-full text-[10px]">
                      {day.oneDecisionsCompletedCount > 0 ? (
                        <span className="text-amber-500 font-bold flex items-center gap-0.5">
                          <Flame className="w-3 h-3" /> Decision
                        </span>
                      ) : day.totalEarned > 0 ? (
                        <span className="text-[var(--color-sage)] font-semibold">Active</span>
                      ) : (
                        <span className="text-[var(--fg-subtle)]">Rest</span>
                      )}

                      {day.completedMissions.length > 0 && (
                        <span className="text-[var(--fg-subtle)] font-mono">
                          {day.completedMissions.length} items
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Expanded Details */}
          {selectedDayData && (
            <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--color-sage)]/40 space-y-3 animate-vision-enter">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Badge variant="sage">{selectedDayData.fullDayLabel}</Badge>
                  <span className="text-xs font-bold text-[var(--fg)]">
                    Detailed Record (+D$ {selectedDayData.totalEarned.toLocaleString()} earned)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDayKey(null)}
                  className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
                >
                  ✕ Close Day View
                </button>
              </div>

              {selectedDayData.completedMissions.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)] block">
                    Completed Missions on {selectedDayData.dayLabel}:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDayData.completedMissions.map(({ completion, mission }, idx) => (
                      <div
                        key={completion.id || idx}
                        className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] text-xs flex items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-sage)] shrink-0" />
                            <span className="font-semibold text-[var(--fg)] truncate">
                              {mission?.title || 'One Decision / Quest'}
                            </span>
                          </div>
                          {mission?.area && (
                            <span className="text-[10px] text-[var(--fg-muted)]">
                              Area: {mission.area} • {mission.type}
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-[var(--color-sage)] shrink-0 text-xs">
                          +D$ {completion.rewardAmount || 500}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--fg-muted)]">
                  No mission completion records logged on this day. D$ rewards came from micro-habits, check-ins, or focus time.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Missions Detailed Tab */}
      {activeTab === 'missions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
              All Missions Completed in the Last 7 Days ({all7DayCompletions.length})
            </span>
            <Badge variant="coral">{total7DayOneDecisions} One Decisions</Badge>
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
                    className={`p-3.5 rounded-[var(--radius-sm)] border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDecision
                        ? 'bg-[var(--color-coral)]/5 border-[var(--color-coral)]/30'
                        : 'bg-[var(--bg-muted)] border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`p-1.5 rounded-[var(--radius-xs)] shrink-0 mt-0.5 ${
                          isDecision
                            ? 'bg-[var(--color-coral)]/20 text-[var(--color-coral)]'
                            : 'bg-[var(--color-sage)]/20 text-[var(--color-sage)]'
                        }`}
                      >
                        {isDecision ? <Flame className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-[var(--fg)]">
                            {mission?.title || 'Completed Objective'}
                          </span>
                          {isDecision && <Badge variant="coral">One Decision</Badge>}
                          {mission?.area && <Badge variant="subtle">{mission.area}</Badge>}
                          {mission?.difficulty && (
                            <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                              [{mission.difficulty.toUpperCase()}]
                            </span>
                          )}
                        </div>

                        {completion.note && (
                          <p className="text-[11px] text-[var(--fg-muted)] italic line-clamp-2">
                            "{completion.note}"
                          </p>
                        )}

                        <div className="text-[10px] text-[var(--fg-subtle)] flex items-center gap-2">
                          <span>
                            {dayObj?.fullDayLabel || dayKey} at {formattedTime}
                          </span>
                          {completion.focusMinutes && (
                            <span>• {completion.focusMinutes}m Deep Focus</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 font-mono">
                      <span className="text-sm font-bold text-[var(--color-sage)]">
                        +D$ {(completion.rewardAmount || 500).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[var(--fg-muted)] font-sans">
                        Method: {completion.method || 'verified'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] text-xs text-[var(--fg-muted)] space-y-2">
              <Target className="w-8 h-8 text-[var(--fg-subtle)] mx-auto" />
              <p className="font-semibold text-[var(--fg)]">No missions completed in the last 7 days yet.</p>
              <p>Execute your daily signature One Decision or mission quests to populate your weekly record.</p>
            </div>
          )}
        </div>
      )}

      {/* Revenue Sources Breakdown Tab */}
      {activeTab === 'earnings' && (
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-muted)]">
            7-Day Dream Dollar (D$) Inflow Breakdown
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* One Decision Rewards */}
            <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1.5 font-bold text-[var(--fg)]">
                  <Flame className="w-4 h-4 text-[var(--color-coral)]" /> One Decisions
                </span>
                <span className="font-mono font-bold text-[var(--color-sage)]">
                  +D$ {earningsBySource.oneDecision.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={
                  total7DayEarnings > 0
                    ? Math.round((earningsBySource.oneDecision / total7DayEarnings) * 100)
                    : 0
                }
                variant="coral"
              />
              <span className="text-[10px] text-[var(--fg-subtle)]">
                {total7DayEarnings > 0
                  ? Math.round((earningsBySource.oneDecision / total7DayEarnings) * 100)
                  : 0}
                % of weekly earnings
              </span>
            </div>

            {/* General Missions & Quests */}
            <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1.5 font-bold text-[var(--fg)]">
                  <Target className="w-4 h-4 text-[var(--color-sage)]" /> Mission Quests
                </span>
                <span className="font-mono font-bold text-[var(--color-sage)]">
                  +D$ {earningsBySource.missions.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={
                  total7DayEarnings > 0
                    ? Math.round((earningsBySource.missions / total7DayEarnings) * 100)
                    : 0
                }
                variant="sage"
              />
              <span className="text-[10px] text-[var(--fg-subtle)]">
                {total7DayEarnings > 0
                  ? Math.round((earningsBySource.missions / total7DayEarnings) * 100)
                  : 0}
                % of weekly earnings
              </span>
            </div>

            {/* Micro Habits */}
            <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1.5 font-bold text-[var(--fg)]">
                  <Zap className="w-4 h-4 text-amber-500" /> Micro-Habits
                </span>
                <span className="font-mono font-bold text-[var(--color-sage)]">
                  +D$ {earningsBySource.habits.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={
                  total7DayEarnings > 0
                    ? Math.round((earningsBySource.habits / total7DayEarnings) * 100)
                    : 0
                }
                variant="slate"
              />
              <span className="text-[10px] text-[var(--fg-subtle)]">
                {total7DayEarnings > 0
                  ? Math.round((earningsBySource.habits / total7DayEarnings) * 100)
                  : 0}
                % of weekly earnings
              </span>
            </div>

            {/* Focus Sessions */}
            <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1.5 font-bold text-[var(--fg)]">
                  <Clock className="w-4 h-4 text-sky-500" /> Focus Sessions
                </span>
                <span className="font-mono font-bold text-[var(--color-sage)]">
                  +D$ {earningsBySource.focus.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={
                  total7DayEarnings > 0
                    ? Math.round((earningsBySource.focus / total7DayEarnings) * 100)
                    : 0
                }
                variant="slate"
              />
              <span className="text-[10px] text-[var(--fg-subtle)]">
                {total7DayEarnings > 0
                  ? Math.round((earningsBySource.focus / total7DayEarnings) * 100)
                  : 0}
                % of weekly earnings
              </span>
            </div>

            {/* Daily Check-In */}
            <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1.5 font-bold text-[var(--fg)]">
                  <CheckCircle2 className="w-4 h-4 text-teal-500" /> Daily Check-Ins
                </span>
                <span className="font-mono font-bold text-[var(--color-sage)]">
                  +D$ {earningsBySource.checkIn.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={
                  total7DayEarnings > 0
                    ? Math.round((earningsBySource.checkIn / total7DayEarnings) * 100)
                    : 0
                }
                variant="sage"
              />
              <span className="text-[10px] text-[var(--fg-subtle)]">
                {total7DayEarnings > 0
                  ? Math.round((earningsBySource.checkIn / total7DayEarnings) * 100)
                  : 0}
                % of weekly earnings
              </span>
            </div>

            {/* Other Grants & Bonuses */}
            <div className="p-3.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] space-y-1.5">
              <div className="flex items-center justify-between text-[var(--fg-muted)]">
                <span className="flex items-center gap-1.5 font-bold text-[var(--fg)]">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Bonuses & Grants
                </span>
                <span className="font-mono font-bold text-[var(--color-sage)]">
                  +D$ {earningsBySource.other.toLocaleString()}
                </span>
              </div>
              <ProgressBar
                value={
                  total7DayEarnings > 0
                    ? Math.round((earningsBySource.other / total7DayEarnings) * 100)
                    : 0
                }
                variant="slate"
              />
              <span className="text-[10px] text-[var(--fg-subtle)]">
                {total7DayEarnings > 0
                  ? Math.round((earningsBySource.other / total7DayEarnings) * 100)
                  : 0}
                % of weekly earnings
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
