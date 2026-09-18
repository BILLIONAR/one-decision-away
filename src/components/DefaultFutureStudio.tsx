import React, { useMemo, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Field, Textarea, Input, Badge } from '../components/ui';
import {
  AlertTriangle,
  Clock,
  Hourglass,
  Plus,
  Trash2,
  Check,
  Edit2,
  Mail,
  Eye,
  Footprints,
  Play,
  X,
} from 'lucide-react';
import { DriftCostItem } from '../types/models';

/**
 * Default Future Studio — the enriched "life you're allowing".
 * Makes the future the user is running from concrete, measurable and noticeable,
 * so the daily One Decision has real gravity behind it.
 */

const TIMELINE_PROMPTS = {
  oneYear: {
    label: 'One year from now — if nothing changes',
    placeholder:
      'Same job, same excuses, one more year older. What does an ordinary Tuesday look like? What have you quietly stopped mentioning to friends?',
  },
  threeYears: {
    label: 'Three years from now — if nothing changes',
    placeholder:
      'Which opportunities did you watch other people take? What does your body feel like? What do you tell yourself at 11pm?',
  },
  tenYears: {
    label: 'Ten years from now — if nothing changes',
    placeholder:
      'Which doors are closed for good? Who did you become to the people who depend on you? What is the one sentence you would say about the last decade?',
  },
} as const;

const LETTER_TEMPLATE = `Dear me,

It's ten years later and nothing changed. I want to tell you what it's like here.

Every morning I ...

The thing I regret most is ...

I kept telling myself ...

If you can hear me: the decision that would have changed everything was ...

— The version of you that waited`;

const DEFAULT_SIGNALS = [
  'Scrolled instead of starting',
  'Said "tomorrow" to the hard thing',
  'Chose comfort over the plan',
  'Complained without acting',
  'Skipped the One Decision',
];

function formatDays(minutesPerDay: number): { hoursPerYear: number; daysPerYear: number; daysPerDecade: number } {
  const hoursPerYear = (minutesPerDay * 365) / 60;
  const daysPerYear = hoursPerYear / 24;
  return { hoursPerYear, daysPerYear, daysPerDecade: daysPerYear * 10 };
}

export const DefaultFutureStudio: React.FC = () => {
  const { data, saveDefaultFuture, logDriftSignal, removeDriftEntry, startFocusSession, setActiveRoute } = useApp();

  const df = data?.twoFutures.defaultFuture || {};

  const [editingTimeline, setEditingTimeline] = useState(false);
  const [oneYear, setOneYear] = useState(df.oneYear || '');
  const [threeYears, setThreeYears] = useState(df.threeYears || '');
  const [tenYears, setTenYears] = useState(df.tenYears || '');

  const [editingLetter, setEditingLetter] = useState(false);
  const [letter, setLetter] = useState(df.letterFromDefaultSelf || '');

  const [costs, setCosts] = useState<DriftCostItem[]>(df.costs || []);
  const [newCostLabel, setNewCostLabel] = useState('');
  const [newCostMinutes, setNewCostMinutes] = useState(60);
  const [newCostDollars, setNewCostDollars] = useState<number | ''>('');

  const [customSignal, setCustomSignal] = useState('');
  const [showAllDrift, setShowAllDrift] = useState(false);

  const todayKey = new Date().toISOString().slice(0, 10);

  const driftLog = df.driftLog || [];

  // Candidate drift signals: the user's own old-self patterns first, then sensible defaults
  const signals = useMemo(() => {
    const fs = data?.futureSelf;
    const own = [
      ...(fs?.oldSelfBehaviors || []),
      ...(fs?.oldSelfPatterns || []),
      ...(fs?.oldSelfExcuses || []),
    ]
      .map((s) => s.trim())
      .filter(Boolean);
    const merged = [...own, ...DEFAULT_SIGNALS];
    return Array.from(new Set(merged)).slice(0, 10);
  }, [data?.futureSelf]);

  // Last 14 days strip
  const last14 = useMemo(() => {
    const days: { key: string; count: number; weekday: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        key,
        count: driftLog.filter((e) => e.dateKey === key).length,
        weekday: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      });
    }
    return days;
  }, [driftLog]);

  const driftLast7 = last14.slice(7).reduce((a, d) => a + d.count, 0);
  const driftPrev7 = last14.slice(0, 7).reduce((a, d) => a + d.count, 0);
  const cleanDaysInRow = (() => {
    let n = 0;
    for (let i = last14.length - 1; i >= 0; i--) {
      if (last14[i].count === 0) n++;
      else break;
    }
    return n;
  })();

  const totalMinutes = costs.reduce((a, c) => a + (c.minutesPerDay || 0), 0);
  const totalDollars = costs.reduce((a, c) => a + (c.dollarsPerMonth || 0), 0);
  const totals = formatDays(totalMinutes);
  const decadeDollars = totalDollars * 12 * 10;

  if (!data) return null;

  const allowingAnswers = data.twoFutures.allowingAnswers || {};
  const answeredAllowing = Object.entries(allowingAnswers).filter(([, v]) => typeof v === 'string' && v.trim());

  const handleSaveTimeline = async () => {
    await saveDefaultFuture({ oneYear: oneYear.trim(), threeYears: threeYears.trim(), tenYears: tenYears.trim() });
    setEditingTimeline(false);
  };

  const handleSaveLetter = async () => {
    await saveDefaultFuture({ letterFromDefaultSelf: letter.trim() });
    setEditingLetter(false);
  };

  const handleAddCost = async () => {
    if (!newCostLabel.trim()) return;
    const item: DriftCostItem = {
      id: `cost-${Date.now()}`,
      label: newCostLabel.trim(),
      minutesPerDay: Math.max(0, Math.min(1440, Number(newCostMinutes) || 0)),
      dollarsPerMonth: newCostDollars === '' ? undefined : Math.max(0, Number(newCostDollars) || 0),
    };
    const next = [...costs, item];
    setCosts(next);
    setNewCostLabel('');
    setNewCostMinutes(60);
    setNewCostDollars('');
    await saveDefaultFuture({ costs: next });
  };

  const handleRemoveCost = async (id: string) => {
    const next = costs.filter((c) => c.id !== id);
    setCosts(next);
    await saveDefaultFuture({ costs: next });
  };

  const handleLogCustom = async () => {
    if (!customSignal.trim()) return;
    await logDriftSignal(customSignal.trim());
    setCustomSignal('');
  };

  const loggedToday = new Set(driftLog.filter((e) => e.dateKey === todayKey).map((e) => e.signal));

  const visibleDrift = showAllDrift ? driftLog : driftLog.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9A8F86]">
            The Future You're Running From
          </span>
          <h2 className="font-display font-bold text-2xl text-[var(--fg)] mt-1">Default Future Studio</h2>
          <p className="text-sm text-[var(--fg-muted)] max-w-2xl mt-1">
            Fear is a poor long-term fuel, but a clear picture of the default path is a superb compass. Make it concrete,
            count what it costs, and notice the small moments you drift toward it.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={Play}
          onClick={() =>
            startFocusSession({
              missionTitle: '🌗 The Two Futures Walk',
              durationMinutes: 9,
              soundTrack: 'solfeggio_396hz',
              guidedMeditationId: 'gm-two-futures',
            })
          }
        >
          Guided: The Two Futures Walk (9m)
        </Button>
      </div>

      {/* Drift signals + 14 day strip */}
      <Card padding="lg" className="space-y-5 bg-[var(--bg-elevated)] border-2 border-[#9A8F86]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#9A8F86]/20 text-[#9A8F86] flex items-center justify-center">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--fg)]">Drift Signals</h3>
              <p className="text-[11px] text-[var(--fg-muted)]">
                Tap the moment you catch yourself sliding. Each tap is one honest vote for the default future — and
                noticing it is the first vote back.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Badge variant={cleanDaysInRow >= 3 ? 'sage' : 'subtle'}>
              {cleanDaysInRow} clean day{cleanDaysInRow === 1 ? '' : 's'} in a row
            </Badge>
            <Badge variant={driftLast7 <= driftPrev7 ? 'sage' : 'coral'}>
              7d: {driftLast7} {driftLast7 <= driftPrev7 ? '↓' : '↑'} (prev {driftPrev7})
            </Badge>
          </div>
        </div>

        {/* 14-day strip */}
        <div className="flex items-end gap-1.5">
          {last14.map((d) => (
            <div key={d.key} className="flex-1 flex flex-col items-center gap-1" title={`${d.key}: ${d.count} drift`}>
              <div
                className={`w-full h-7 rounded-md border transition-all ${
                  d.count === 0
                    ? 'bg-[var(--color-sage)]/20 border-[var(--color-sage)]/40'
                    : d.count === 1
                    ? 'bg-[#9A8F86]/40 border-[#9A8F86]/60'
                    : 'bg-[#9A8F86]/80 border-[#9A8F86]'
                } ${d.key === todayKey ? 'ring-2 ring-[var(--fg)]/40' : ''}`}
              />
              <span className="text-[9px] text-[var(--fg-subtle)]">{d.weekday}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {signals.map((sig) => {
            const done = loggedToday.has(sig);
            return (
              <button
                key={sig}
                type="button"
                onClick={() => logDriftSignal(sig)}
                disabled={done}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer disabled:cursor-default ${
                  done
                    ? 'bg-[#9A8F86] text-white border-[#9A8F86]'
                    : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] border-[var(--border)] hover:text-[var(--fg)] hover:border-[#9A8F86]'
                }`}
              >
                {done ? '✓ ' : ''}
                {sig}
              </button>
            );
          })}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogCustom();
          }}
          className="flex gap-2"
        >
          <Input
            id="custom-drift"
            value={customSignal}
            onChange={(e) => setCustomSignal(e.target.value)}
            placeholder="Something else you noticed today…"
            className="flex-1"
          />
          <Button type="submit" variant="secondary" size="sm" icon={Plus} disabled={!customSignal.trim()}>
            Log
          </Button>
        </form>

        {driftLog.length > 0 && (
          <div className="pt-3 border-t border-[var(--border)] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-subtle)]">Recent drift log</span>
              {driftLog.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllDrift(!showAllDrift)}
                  className="text-[11px] underline text-[var(--fg-muted)] cursor-pointer"
                >
                  {showAllDrift ? 'Show less' : `Show all (${driftLog.length})`}
                </button>
              )}
            </div>
            {visibleDrift.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between text-xs px-3 py-1.5 bg-[var(--bg-muted)]/60 rounded-[var(--radius-sm)]"
              >
                <span className="text-[var(--fg)]">
                  <span className="font-mono text-[var(--fg-subtle)] mr-2">{e.dateKey.slice(5)}</span>
                  {e.signal}
                </span>
                <button
                  type="button"
                  onClick={() => removeDriftEntry(e.id)}
                  title="Remove (logged by mistake)"
                  className="p-1 text-[var(--fg-subtle)] hover:text-red-500 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost of drift */}
        <Card padding="lg" className="space-y-4 bg-[var(--bg-elevated)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-[#9A8F86]" />
              <h3 className="text-sm font-bold text-[var(--fg)]">The Cost of Drift</h3>
            </div>
            <Badge variant="subtle">Quiet math</Badge>
          </div>
          <p className="text-[11px] text-[var(--fg-muted)]">
            List the default habits that eat your days. The numbers are not a judgment — they are the invoice the
            default future sends every decade.
          </p>

          {costs.length > 0 && (
            <div className="space-y-1.5">
              {costs.map((c) => {
                const t = formatDays(c.minutesPerDay);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 bg-[var(--bg-muted)]/60 rounded-[var(--radius-sm)] text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-[var(--fg)] truncate">{c.label}</div>
                      <div className="text-[var(--fg-muted)]">
                        {c.minutesPerDay} min/day → <strong>{t.daysPerYear.toFixed(1)} full days</strong> a year,{' '}
                        <strong>{(t.daysPerDecade / 30.4).toFixed(1)} months</strong> a decade
                        {c.dollarsPerMonth ? (
                          <>
                            {' '}
                            · ${c.dollarsPerMonth}/mo → <strong>${(c.dollarsPerMonth * 120).toLocaleString()}</strong> in 10 years
                          </>
                        ) : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCost(c.id)}
                      className="p-1.5 text-[var(--fg-subtle)] hover:text-red-500 cursor-pointer shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {costs.length > 0 && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-[#9A8F86]/10 border border-[#9A8F86]/30 rounded-[var(--radius-sm)]">
                <div className="text-lg font-bold font-display text-[var(--fg)]">{totals.hoursPerYear.toFixed(0)}h</div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">per year</div>
              </div>
              <div className="p-3 bg-[#9A8F86]/10 border border-[#9A8F86]/30 rounded-[var(--radius-sm)]">
                <div className="text-lg font-bold font-display text-[var(--fg)]">
                  {(totals.daysPerDecade / 30.4).toFixed(1)} mo
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">per decade</div>
              </div>
              <div className="p-3 bg-[#9A8F86]/10 border border-[#9A8F86]/30 rounded-[var(--radius-sm)]">
                <div className="text-lg font-bold font-display text-[var(--fg)]">
                  {decadeDollars > 0 ? `$${Math.round(decadeDollars / 1000)}k` : '—'}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--fg-muted)]">10-yr spend</div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--border)] space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_90px_90px] gap-2">
              <Input
                id="cost-label"
                value={newCostLabel}
                onChange={(e) => setNewCostLabel(e.target.value)}
                placeholder="e.g. Doomscrolling, late-night TV, food delivery"
              />
              <Input
                id="cost-minutes"
                type="number"
                min={0}
                max={1440}
                value={newCostMinutes}
                onChange={(e) => setNewCostMinutes(parseInt(e.target.value) || 0)}
                placeholder="min/day"
                title="Minutes per day"
              />
              <Input
                id="cost-dollars"
                type="number"
                min={0}
                value={newCostDollars}
                onChange={(e) => setNewCostDollars(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                placeholder="$/mo"
                title="Dollars per month (optional)"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[var(--fg-subtle)]">minutes per day · optional $ per month</span>
              <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddCost} disabled={!newCostLabel.trim()}>
                Add cost
              </Button>
            </div>
          </div>
        </Card>

        {/* Timeline if nothing changes */}
        <Card padding="lg" className="space-y-4 bg-[var(--bg-elevated)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#9A8F86]" />
              <h3 className="text-sm font-bold text-[var(--fg)]">If Nothing Changes — Timeline</h3>
            </div>
            {!editingTimeline ? (
              <Button variant="outline" size="sm" icon={Edit2} onClick={() => setEditingTimeline(true)}>
                {df.oneYear || df.threeYears || df.tenYears ? 'Edit' : 'Write it'}
              </Button>
            ) : (
              <Button variant="accent" size="sm" icon={Check} onClick={handleSaveTimeline}>
                Save
              </Button>
            )}
          </div>

          {(
            [
              ['oneYear', oneYear, setOneYear, df.oneYear],
              ['threeYears', threeYears, setThreeYears, df.threeYears],
              ['tenYears', tenYears, setTenYears, df.tenYears],
            ] as const
          ).map(([key, value, setter, saved]) => (
            <div key={key} className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9A8F86]">
                {TIMELINE_PROMPTS[key].label}
              </span>
              {editingTimeline ? (
                <Textarea
                  id={`df-${key}`}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  rows={3}
                  placeholder={TIMELINE_PROMPTS[key].placeholder}
                />
              ) : saved ? (
                <p className="text-sm italic font-serif text-[var(--fg)] bg-[var(--bg-muted)] p-3 rounded-[var(--radius-sm)] border border-[var(--border)] leading-relaxed">
                  {saved}
                </p>
              ) : (
                <p className="text-xs text-[var(--fg-subtle)] italic">{TIMELINE_PROMPTS[key].placeholder}</p>
              )}
            </div>
          ))}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Letter from default self */}
        <Card padding="lg" className="space-y-4 bg-[var(--bg-elevated)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#9A8F86]" />
              <h3 className="text-sm font-bold text-[var(--fg)]">A Letter From Your Default Self</h3>
            </div>
            {!editingLetter ? (
              <Button
                variant="outline"
                size="sm"
                icon={Edit2}
                onClick={() => {
                  if (!letter.trim()) setLetter(LETTER_TEMPLATE);
                  setEditingLetter(true);
                }}
              >
                {df.letterFromDefaultSelf ? 'Edit' : 'Write it'}
              </Button>
            ) : (
              <Button variant="accent" size="sm" icon={Check} onClick={handleSaveLetter}>
                Save
              </Button>
            )}
          </div>
          <p className="text-[11px] text-[var(--fg-muted)]">
            Written from ten years down the default path. Read it when you feel the pull to postpone.
          </p>
          {editingLetter ? (
            <Textarea id="df-letter" value={letter} onChange={(e) => setLetter(e.target.value)} rows={12} />
          ) : df.letterFromDefaultSelf ? (
            <pre className="whitespace-pre-wrap text-sm font-serif italic text-[var(--fg)] bg-[var(--bg-muted)] p-4 rounded-[var(--radius-md)] border border-[var(--border)] leading-relaxed">
              {df.letterFromDefaultSelf}
            </pre>
          ) : (
            <pre className="whitespace-pre-wrap text-xs font-serif italic text-[var(--fg-subtle)] leading-relaxed">
              {LETTER_TEMPLATE}
            </pre>
          )}
        </Card>

        {/* All recorded observations */}
        <Card padding="lg" className="space-y-4 bg-[var(--bg-elevated)]">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#9A8F86]" />
              <h3 className="text-sm font-bold text-[var(--fg)]">Recorded Observations</h3>
            </div>
            <Badge variant="subtle">{answeredAllowing.length} / 8 answered</Badge>
          </div>
          {answeredAllowing.length === 0 ? (
            <div className="text-xs text-[var(--fg-muted)] space-y-2">
              <p>You haven't answered the eight "life you're allowing" questions yet.</p>
              <Button variant="secondary" size="sm" onClick={() => setActiveRoute('/two-futures')}>
                <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Open the Public Compass to answer them
              </Button>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-[var(--fg-muted)] max-h-[420px] overflow-y-auto pr-1">
              {answeredAllowing.map(([id, answer]) => (
                <div key={id} className="p-2.5 bg-[var(--bg-muted)]/60 rounded-[var(--radius-sm)]">
                  <span className="font-semibold text-[var(--fg)] block">{ALLOWING_TITLES[id] || id}</span>
                  {answer}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const ALLOWING_TITLES: Record<string, string> = {
  q1: 'Quiet dissatisfaction',
  q2: 'Unchanged complaints',
  q3: 'A Tuesday in 5 years',
  q4: 'Closed doors in 10 years',
  q5: 'Late-life regret',
  q6: 'Identity to release',
  q7: 'The shield',
  q8: 'The real price',
};
