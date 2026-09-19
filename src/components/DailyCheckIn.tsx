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
import { Card, Button, Textarea } from './ui';
import { CheckCircle2 } from 'lucide-react';
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

// Three metrics, three tones from the system: accent, ink, and a lighter neutral.
const METRIC_COLOR = {
  focus: 'var(--accent)',
  energy: 'var(--fg)',
  mood: 'var(--fg-subtle)',
} as const;

const segmentBase =
  'h-9 px-3 text-[13px] font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap';
const segmentOn = 'bg-[var(--fg)] text-[var(--bg)]';
const segmentOff = 'text-[var(--fg-muted)] hover:text-[var(--fg)]';

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
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] p-3 rounded-[var(--radius-sm)] shadow-[var(--shadow-md)] text-[13px] space-y-1.5 min-w-[170px] z-50">
          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold text-[var(--fg)]">{label} ({dataPoint?.fullDate})</span>
            {dataPoint?.hasRecord ? (
              <span className="text-[12px] text-[var(--accent)]">{t('Logged')}</span>
            ) : (
              <span className="text-[12px] text-[var(--fg-subtle)]">{t('No Check-in')}</span>
            )}
          </div>
          {dataPoint?.hasRecord ? (
            <>
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--fg-muted)]">{t('Focus:')}</span>
                  <span className="font-semibold text-[var(--fg)]">{dataPoint.focus}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--fg-muted)]">{t('Energy:')}</span>
                  <span className="font-semibold text-[var(--fg)]">{dataPoint.energy}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--fg-muted)]">{t('Mood:')}</span>
                  <span className="font-semibold text-[var(--fg)]">{dataPoint.mood}/10</span>
                </div>
              </div>
              {dataPoint?.notes && (
                <div className="mt-1.5 pt-1.5 border-t border-[var(--border)] text-[12px] text-[var(--fg-muted)]">
                  {dataPoint.notes}
                </div>
              )}
            </>
          ) : (
            <p className="text-[12px] text-[var(--fg-muted)] pt-1">
              {t('No rating recorded on this date.')}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderSlider = (
    label: string,
    value: number,
    onChange: (n: number) => void,
    labels: Record<number, string>,
    low: string,
    high: string,
    accent: string,
  ) => (
    <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg)] space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-[var(--fg)]">{label}</span>
        <span className="text-[15px] font-semibold text-[var(--fg)]">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: accent }}
      />
      <div className="flex items-center justify-between text-[12px] text-[var(--fg-subtle)] gap-2">
        <span className="shrink-0">{low}</span>
        <span className="text-[var(--fg-muted)] text-center truncate">{t(labels[value])}</span>
        <span className="shrink-0">{high}</span>
      </div>
    </div>
  );

  const renderAvg = (label: string, value: number, color: string) => (
    <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg)] space-y-2">
      <span className="text-[13px] text-[var(--fg-muted)]">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-[22px] font-semibold tracking-tight text-[var(--fg)]">{value || '—'}</span>
        <span className="text-[12px] text-[var(--fg-subtle)]">/ 10</span>
      </div>
      <div className="w-full bg-[var(--bg-inset)] h-1.5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(value / 10) * 100}%`, background: color }} />
      </div>
    </div>
  );

  return (
    <Card padding="md" className="space-y-5">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Daily check-in')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">
            {todayCheckIn
              ? t('Logged today. You can still update it.')
              : t('Rate focus, energy and mood. Earns D$50.')}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-full self-start overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('checkin')}
            className={`${segmentBase} ${activeTab === 'checkin' ? segmentOn : segmentOff}`}
          >
            {todayCheckIn ? t('Update') : t('Rate')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`${segmentBase} ${activeTab === 'trends' ? segmentOn : segmentOff}`}
          >
            {t('Trend')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`${segmentBase} ${activeTab === 'history' ? segmentOn : segmentOff}`}
          >
            {t('Logs ({n})', { n: checkIns.length })}
          </button>
        </div>
      </div>

      {/* TAB 1: Rate Today's Check-in */}
      {activeTab === 'checkin' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {renderSlider(t('Focus'), focus, setFocus, FOCUS_LABELS, '1', '10', METRIC_COLOR.focus)}
            {renderSlider(t('Energy'), energy, setEnergy, ENERGY_LABELS, '1', '10', METRIC_COLOR.energy)}
            {renderSlider(t('Mood'), mood, setMood, MOOD_LABELS, '1', '10', METRIC_COLOR.mood)}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="checkin-notes" className="text-[13px] font-medium text-[var(--fg-muted)]">
              {t('Note (optional)')}
            </label>
            <Textarea
              id="checkin-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('What helped or got in the way today?')}
              rows={2}
              className="bg-[var(--bg)] min-h-[72px]"
            />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[13px] text-[var(--fg-muted)]">
              {t('{n} total check-ins recorded', { n: stats.count })}
            </span>
            <Button type="submit" variant="primary" size="md" isLoading={isSubmitting} icon={CheckCircle2}>
              {todayCheckIn ? t('Update check-in') : t('Save (+ D$50)')}
            </Button>
          </div>
        </form>
      )}

      {/* TAB 2: 7-Day Trend Visualization using Recharts */}
      {activeTab === 'trends' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {renderAvg(t('Focus, 7 days'), stats.avgFocus, METRIC_COLOR.focus)}
            {renderAvg(t('Energy, 7 days'), stats.avgEnergy, METRIC_COLOR.energy)}
            {renderAvg(t('Mood, 7 days'), stats.avgMood, METRIC_COLOR.mood)}
            <div className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg)] space-y-2">
              <span className="text-[13px] text-[var(--fg-muted)]">{t('Strongest')}</span>
              <div className="text-[15px] font-semibold text-[var(--fg)] truncate">{stats.peakState}</div>
              <p className="text-[12px] text-[var(--fg-subtle)] truncate">
                {t('{n} days logged in 7d', { n: stats.count })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {([
              ['all', t('All')],
              ['focus', t('Focus')],
              ['energy', t('Energy')],
              ['mood', t('Mood')],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedMetric(key)}
                className={`${segmentBase} ${selectedMetric === key ? segmentOn : 'bg-[var(--bg)] text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-full h-64 bg-[var(--bg)] rounded-[var(--radius-sm)] p-3 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.8} />
                <XAxis dataKey="label" stroke="var(--fg-subtle)" fontSize={11} tickLine={false} dy={6} />
                <YAxis domain={[0, 10]} ticks={[2, 4, 6, 8, 10]} stroke="var(--fg-subtle)" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} iconType="circle" />

                {(selectedMetric === 'all' || selectedMetric === 'focus') && (
                  <Line
                    type="monotone"
                    dataKey="focus"
                    name={t('Focus')}
                    stroke={METRIC_COLOR.focus}
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: METRIC_COLOR.focus, strokeWidth: 1.5, stroke: 'var(--bg)' }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                )}

                {(selectedMetric === 'all' || selectedMetric === 'energy') && (
                  <Line
                    type="monotone"
                    dataKey="energy"
                    name={t('Energy')}
                    stroke={METRIC_COLOR.energy}
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: METRIC_COLOR.energy, strokeWidth: 1.5, stroke: 'var(--bg)' }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                )}

                {(selectedMetric === 'all' || selectedMetric === 'mood') && (
                  <Line
                    type="monotone"
                    dataKey="mood"
                    name={t('Mood')}
                    stroke={METRIC_COLOR.mood}
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: METRIC_COLOR.mood, strokeWidth: 1.5, stroke: 'var(--bg)' }}
                    activeDot={{ r: 5 }}
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
        <div>
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
                    className="p-4 rounded-[var(--radius-sm)] bg-[var(--bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[14px] font-medium text-[var(--fg)]">{formattedDate}</span>
                        <span className="text-[13px] text-[var(--fg-muted)]">
                          {t('Focus {n}/10', { n: entry.focus })} · {t('Energy {n}/10', { n: entry.energy })} · {t('Mood {n}/10', { n: entry.mood })}
                        </span>
                      </div>
                      {entry.notes && <p className="text-[13px] text-[var(--fg-muted)]">{entry.notes}</p>}
                    </div>

                    {entry.dateKey === todayStr && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('checkin')}
                        className="h-9 px-2 text-[13px] text-[var(--accent)] font-medium shrink-0 self-end sm:self-auto cursor-pointer"
                      >
                        {t('Edit')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-[14px] text-[var(--fg-muted)]">
              {t('No check-ins yet.')}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
