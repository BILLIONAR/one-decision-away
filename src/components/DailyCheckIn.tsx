import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../store/useApp';
import { Card, Badge, Button, Textarea } from './ui';
import {
  Activity,
  Flame,
  BatteryCharging,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Calendar,
  ChevronRight,
  Info,
  Edit3,
} from 'lucide-react';
import { DailyCheckIn as DailyCheckInModel } from '../types/models';
import { useT, N_ } from '../i18n';

const FOCUS_LABELS: Record<number, string> = {
  1: N_('Scattered / Foggy'),
  2: N_('Distracted'),
  3: N_('Low Clarity'),
  4: N_('Warming Up'),
  5: N_('Steady Baseline'),
  6: N_('Task-Oriented'),
  7: N_('Deep Focus'),
  8: N_('Locked In'),
  9: N_('Flow State'),
  10: N_('Unstoppable Mastery'),
};

const ENERGY_LABELS: Record<number, string> = {
  1: N_('Exhausted'),
  2: N_('Depleted'),
  3: N_('Low Reserve'),
  4: N_('Moderate'),
  5: N_('Stable & Sustainable'),
  6: N_('Alert'),
  7: N_('High Drive'),
  8: N_('Vibrant Vitality'),
  9: N_('Peak Power'),
  10: N_('Electric Boundless'),
};

const MOOD_LABELS: Record<number, string> = {
  1: N_('Reactive / Overwhelmed'),
  2: N_('Anxious'),
  3: N_('Resistant'),
  4: N_('Neutral'),
  5: N_('Grounded & Calm'),
  6: N_('Clear-Minded'),
  7: N_('Optimistic'),
  8: N_('Victorious / Confident'),
  9: N_('Joyful Momentum'),
  10: N_('Sovereign & Inspired'),
};

export const DailyCheckIn: React.FC = () => {
  const { data, saveDailyCheckIn } = useApp();
  const t = useT();
  const checkIns = data?.checkIns || [];

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const todayCheckIn = useMemo(() => {
    return checkIns.find((c) => c.dateKey === todayStr);
  }, [checkIns, todayStr]);

  // Active Tab: 'checkin' | 'trends' | 'history'
  const [activeTab, setActiveTab] = useState<'checkin' | 'trends' | 'history'>(
    todayCheckIn ? 'trends' : 'checkin'
  );

  // Form State
  const [focus, setFocus] = useState<number>(todayCheckIn ? todayCheckIn.focus : 8);
  const [energy, setEnergy] = useState<number>(todayCheckIn ? todayCheckIn.energy : 7);
  const [mood, setMood] = useState<number>(todayCheckIn ? todayCheckIn.mood : 8);
  const [notes, setNotes] = useState<string>(todayCheckIn?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'focus' | 'energy' | 'mood'>('all');

  // Sync state if todayCheckIn changes
  React.useEffect(() => {
    if (todayCheckIn) {
      setFocus(todayCheckIn.focus);
      setEnergy(todayCheckIn.energy);
      setMood(todayCheckIn.mood);
      setNotes(todayCheckIn.notes || '');
    }
  }, [todayCheckIn]);

  // Compute 7-day trend dataset for recharts
  const trendData = useMemo(() => {
    const now = new Date();
    const result: Array<{
      dateKey: string;
      label: string;
      fullDate: string;
      focus: number | null;
      energy: number | null;
      mood: number | null;
      notes?: string;
      hasRecord: boolean;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const isToday = i === 0;
      const dayName = isToday
        ? t('Today')
        : d.toLocaleDateString(undefined, { weekday: 'short' });
      const fullDate = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      const entry = checkIns.find((c) => c.dateKey === key);

      result.push({
        dateKey: key,
        label: `${dayName}`,
        fullDate,
        focus: entry ? entry.focus : null,
        energy: entry ? entry.energy : null,
        mood: entry ? entry.mood : null,
        notes: entry?.notes,
        hasRecord: Boolean(entry),
      });
    }

    return result;
  }, [checkIns, t]);

  // Calculate 7-day averages
  const stats = useMemo(() => {
    const records = checkIns.filter((c) => {
      const d = new Date(c.dateKey);
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      return d >= sevenDaysAgo;
    });

    if (records.length === 0) {
      return {
        avgFocus: 0,
        avgEnergy: 0,
        avgMood: 0,
        count: 0,
        peakState: t('N/A'),
      };
    }

    const totalFocus = records.reduce((acc, c) => acc + c.focus, 0);
    const totalEnergy = records.reduce((acc, c) => acc + c.energy, 0);
    const totalMood = records.reduce((acc, c) => acc + c.mood, 0);

    const avgFocus = Number((totalFocus / records.length).toFixed(1));
    const avgEnergy = Number((totalEnergy / records.length).toFixed(1));
    const avgMood = Number((totalMood / records.length).toFixed(1));

    // Determine highest driver
    let peakState = t('Balanced');
    if (avgFocus >= avgEnergy && avgFocus >= avgMood) peakState = t('Deep Focus');
    else if (avgEnergy >= avgFocus && avgEnergy >= avgMood) peakState = t('High Vitality');
    else peakState = t('Victorious Mood');

    return {
      avgFocus,
      avgEnergy,
      avgMood,
      count: records.length,
      peakState,
    };
  }, [checkIns, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveDailyCheckIn({
        focus,
        energy,
        mood,
        notes,
        dateKey: todayStr,
      });
      setActiveTab('trends');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-strong)] p-3 rounded-[var(--radius-md)] shadow-lg text-xs space-y-1.5 min-w-[170px] z-50">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-1">
            <span className="font-bold text-[var(--fg)] font-display">{label} ({dataPoint?.fullDate})</span>
            {dataPoint?.hasRecord ? (
              <span className="text-[10px] text-[var(--color-sage)] font-semibold">{t('Logged')}</span>
            ) : (
              <span className="text-[10px] text-[var(--fg-subtle)]">{t('No Check-in')}</span>
            )}
          </div>
          {dataPoint?.hasRecord ? (
            <>
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-[var(--color-sage)] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-sage)]" /> {t('Focus:')}
                  </span>
                  <span className="font-bold text-[var(--fg)]">{dataPoint.focus}/10</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-[var(--color-coral)] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-coral)]" /> {t('Energy:')}
                  </span>
                  <span className="font-bold text-[var(--fg)]">{dataPoint.energy}/10</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-sky-500" /> {t('Mood:')}
                  </span>
                  <span className="font-bold text-[var(--fg)]">{dataPoint.mood}/10</span>
                </div>
              </div>
              {dataPoint?.notes && (
                <div className="mt-1.5 pt-1.5 border-t border-[var(--border)] text-[10px] text-[var(--fg-muted)] italic">
                  "{dataPoint.notes}"
                </div>
              )}
            </>
          ) : (
            <p className="text-[11px] text-[var(--fg-muted)] pt-1">
              {t('No rating recorded on this date.')}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card padding="md" className="border border-[var(--border)] bg-[var(--bg-elevated)] space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-[var(--radius-xs)] bg-[var(--color-sage)]/10 text-[var(--color-sage)] border border-[var(--color-sage)]/20">
              <Activity className="w-4 h-4" />
            </span>
            <h3 className="font-display font-bold text-base text-[var(--fg)] tracking-tight">
              {t('Daily Check-in & Internal Vitality')}
            </h3>
            {todayCheckIn ? (
              <Badge variant="sage" className="text-[10px] py-0 px-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {t('Logged Today')}
              </Badge>
            ) : (
              <Badge variant="coral" className="text-[10px] py-0 px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {t('+ D$50 Daily Fuel')}
              </Badge>
            )}
          </div>
          <p className="text-xs text-[var(--fg-muted)]">
            {t('Rate focus, energy, and state of mind to track long-term compounding clarity.')}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-[var(--bg)] p-0.5 rounded-[var(--radius-sm)] border border-[var(--border)] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('checkin')}
            className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-xs)] transition-all cursor-pointer ${
              activeTab === 'checkin'
                ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {todayCheckIn ? t('Update Today') : t('Rate Today')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1 text-xs font-semibold rounded-[var(--radius-xs)] transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'trends'
                ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> {t('7-Day Trend')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-xs)] transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[var(--fg)] text-[var(--bg)] shadow-xs'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            }`}
          >
            {t('Logs ({n})', { n: checkIns.length })}
          </button>
        </div>
      </div>

      {/* TAB 1: Rate Today's Check-in */}
      {activeTab === 'checkin' && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. FOCUS RATING */}
            <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-sage)]" /> {t('Focus Rating')}
                </span>
                <span className="text-sm font-extrabold text-[var(--color-sage)] font-display">
                  {focus}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={focus}
                onChange={(e) => setFocus(Number(e.target.value))}
                className="w-full accent-[var(--color-sage)] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-[var(--fg-subtle)]">
                <span>{t('1 (Scattered)')}</span>
                <span className="font-semibold text-[var(--color-sage)] text-center px-1 truncate max-w-[130px]">
                  {t(FOCUS_LABELS[focus])}
                </span>
                <span>{t('10 (Flow)')}</span>
              </div>
            </div>

            {/* 2. ENERGY RATING */}
            <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-coral)]" /> {t('Energy Reserve')}
                </span>
                <span className="text-sm font-extrabold text-[var(--color-coral)] font-display">
                  {energy}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full accent-[var(--color-coral)] cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-[var(--fg-subtle)]">
                <span>{t('1 (Drained)')}</span>
                <span className="font-semibold text-[var(--color-coral)] text-center px-1 truncate max-w-[130px]">
                  {t(ENERGY_LABELS[energy])}
                </span>
                <span>{t('10 (Peak)')}</span>
              </div>
            </div>

            {/* 3. MOOD RATING */}
            <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" /> {t('State of Mind')}
                </span>
                <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400 font-display">
                  {mood}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-[var(--fg-subtle)]">
                <span>{t('1 (Reactive)')}</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400 text-center px-1 truncate max-w-[130px]">
                  {t(MOOD_LABELS[mood])}
                </span>
                <span>{t('10 (Inspired)')}</span>
              </div>
            </div>
          </div>

          {/* Quick reflection notes input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--fg)] flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[var(--fg-muted)]" /> {t('Daily Internal Note (Optional)')}
            </label>
            <Textarea
              id="checkin-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('What fueled your focus or caused friction today? (e.g. 7 hours uninterrupted sleep, box breathing session, deep work win)...')}
              rows={2}
              className="text-xs"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs text-[var(--fg-muted)]">
              <Flame className="w-4 h-4 text-[var(--color-coral)]" />
              <span>{t('{n} total check-ins recorded', { n: stats.count })}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                icon={CheckCircle2}
              >
                {todayCheckIn ? t('Update Check-in') : t('Record Today (+ D$50)')}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: 7-Day Trend Visualization using Recharts */}
      {activeTab === 'trends' && (
        <div className="space-y-4 pt-1">
          {/* Quick Stat Gauges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                {t('7-Day Avg Focus')}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold font-display text-[var(--color-sage)]">
                  {stats.avgFocus || '—'}
                </span>
                <span className="text-[10px] text-[var(--fg-subtle)]">/ 10</span>
              </div>
              <div className="w-full bg-[var(--bg-muted)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--color-sage)] h-full transition-all duration-500"
                  style={{ width: `${(stats.avgFocus / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                {t('7-Day Avg Energy')}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold font-display text-[var(--color-coral)]">
                  {stats.avgEnergy || '—'}
                </span>
                <span className="text-[10px] text-[var(--fg-subtle)]">/ 10</span>
              </div>
              <div className="w-full bg-[var(--bg-muted)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--color-coral)] h-full transition-all duration-500"
                  style={{ width: `${(stats.avgEnergy / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                {t('7-Day Avg Mood')}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold font-display text-sky-600 dark:text-sky-400">
                  {stats.avgMood || '—'}
                </span>
                <span className="text-[10px] text-[var(--fg-subtle)]">/ 10</span>
              </div>
              <div className="w-full bg-[var(--bg-muted)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full transition-all duration-500"
                  style={{ width: `${(stats.avgMood / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                {t('Leading Driver')}
              </span>
              <div className="text-sm font-bold text-[var(--fg)] truncate pt-0.5">
                {stats.peakState}
              </div>
              <p className="text-[10px] text-[var(--fg-muted)] truncate">
                {t('{n} days logged in 7d', { n: stats.count })}
              </p>
            </div>
          </div>

          {/* Metric Filter Toggles */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-[var(--fg-muted)] font-medium mr-1">{t('Metrics:')}</span>
              <button
                type="button"
                onClick={() => setSelectedMetric('all')}
                className={`px-2.5 py-0.5 rounded-[var(--radius-xs)] font-semibold cursor-pointer border ${
                  selectedMetric === 'all'
                    ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                    : 'bg-[var(--bg)] text-[var(--fg-muted)] border-[var(--border)]'
                }`}
              >
                {t('All 3 Metrics')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetric('focus')}
                className={`px-2.5 py-0.5 rounded-[var(--radius-xs)] font-semibold cursor-pointer border ${
                  selectedMetric === 'focus'
                    ? 'bg-[var(--color-sage)] text-white border-[var(--color-sage)]'
                    : 'bg-[var(--bg)] text-[var(--fg-muted)] border-[var(--border)]'
                }`}
              >
                {t('Focus Only')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetric('energy')}
                className={`px-2.5 py-0.5 rounded-[var(--radius-xs)] font-semibold cursor-pointer border ${
                  selectedMetric === 'energy'
                    ? 'bg-[var(--color-coral)] text-white border-[var(--color-coral)]'
                    : 'bg-[var(--bg)] text-[var(--fg-muted)] border-[var(--border)]'
                }`}
              >
                {t('Energy Only')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedMetric('mood')}
                className={`px-2.5 py-0.5 rounded-[var(--radius-xs)] font-semibold cursor-pointer border ${
                  selectedMetric === 'mood'
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-[var(--bg)] text-[var(--fg-muted)] border-[var(--border)]'
                }`}
              >
                {t('Mood Only')}
              </button>
            </div>

            <span className="text-[11px] text-[var(--fg-subtle)] flex items-center gap-1">
              <Info className="w-3 h-3" /> {t('Scale: 1 (Lowest) to 10 (Peak)')}
            </span>
          </div>

          {/* Recharts LineChart Visualization */}
          <div className="w-full h-64 bg-[var(--bg)] rounded-[var(--radius-md)] border border-[var(--border)] p-3 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="label"
                  stroke="var(--fg-subtle)"
                  fontSize={11}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  domain={[0, 10]}
                  ticks={[2, 4, 6, 8, 10]}
                  stroke="var(--fg-subtle)"
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                />

                {(selectedMetric === 'all' || selectedMetric === 'focus') && (
                  <Line
                    type="monotone"
                    dataKey="focus"
                    name={t('Focus')}
                    stroke="var(--color-sage, #4E6B56)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--color-sage, #4E6B56)', strokeWidth: 1.5, stroke: 'var(--bg)' }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )}

                {(selectedMetric === 'all' || selectedMetric === 'energy') && (
                  <Line
                    type="monotone"
                    dataKey="energy"
                    name={t('Energy')}
                    stroke="var(--color-coral, #B8533C)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: 'var(--color-coral, #B8533C)', strokeWidth: 1.5, stroke: 'var(--bg)' }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )}

                {(selectedMetric === 'all' || selectedMetric === 'mood') && (
                  <Line
                    type="monotone"
                    dataKey="mood"
                    name={t('Mood')}
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#0284c7', strokeWidth: 1.5, stroke: 'var(--bg)' }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TAB 3: History & Past Reflections */}
      {activeTab === 'history' && (
        <div className="space-y-2.5 pt-1">
          {checkIns.length > 0 ? (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {checkIns.slice(0, 10).map((entry) => {
                const formattedDate = new Date(entry.createdAt || entry.dateKey).toLocaleDateString(
                  undefined,
                  { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
                );
                return (
                  <div
                    key={entry.id}
                    className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[var(--fg-muted)]" />
                          {formattedDate}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className="px-1.5 py-0.2 rounded bg-[var(--color-sage)]/10 text-[var(--color-sage)] font-semibold">
                            {t('Focus {n}/10', { n: entry.focus })}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-[var(--color-coral)]/10 text-[var(--color-coral)] font-semibold">
                            {t('Energy {n}/10', { n: entry.energy })}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold">
                            {t('Mood {n}/10', { n: entry.mood })}
                          </span>
                        </div>
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-[var(--fg-muted)] italic">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>

                    {entry.dateKey === todayStr && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('checkin')}
                        className="text-[11px] text-[var(--color-sage)] hover:underline font-semibold flex items-center gap-1 shrink-0 self-end sm:self-auto cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> {t('Edit Today')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[var(--fg-muted)]">
              {t('No previous check-ins logged yet.')}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
