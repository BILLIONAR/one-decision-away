import React, { useMemo, useState } from 'react';
import { useApp } from '../store/useApp';
import { Plus, Trash2, Check, Pencil, Play, X } from 'lucide-react';
import { DriftCostItem } from '../types/models';
import { useT, N_, getSpeechLang } from '../i18n';

/**
 * Default Future Studio — the "life you're allowing", made concrete:
 * drift signals, the cost of drift, a timeline and a letter from the default self.
 */

const TIMELINE_PROMPTS = {
  oneYear: {
    label: N_('One year from now'),
    placeholder:
      N_('Same job, same excuses, one more year older. What does an ordinary Tuesday look like? What have you quietly stopped mentioning to friends?'),
  },
  threeYears: {
    label: N_('Three years from now'),
    placeholder:
      N_('Which opportunities did you watch other people take? What does your body feel like? What do you tell yourself at 11pm?'),
  },
  tenYears: {
    label: N_('Ten years from now'),
    placeholder:
      N_('Which doors are closed for good? Who did you become to the people who depend on you? What is the one sentence you would say about the last decade?'),
  },
} as const;

const LETTER_TEMPLATE = N_(`Dear me,

It's ten years later and nothing changed. I want to tell you what it's like here.

Every morning I ...

The thing I regret most is ...

I kept telling myself ...

If you can hear me: the decision that would have changed everything was ...

— The version of you that waited`);

const DEFAULT_SIGNALS = [
  N_('Scrolled instead of starting'),
  N_('Said "tomorrow" to the hard thing'),
  N_('Chose comfort over the plan'),
  N_('Complained without acting'),
  N_('Skipped the One Decision'),
];

function formatDays(minutesPerDay: number): { hoursPerYear: number; daysPerYear: number; daysPerDecade: number } {
  const hoursPerYear = (minutesPerDay * 365) / 60;
  const daysPerYear = hoursPerYear / 24;
  return { hoursPerYear, daysPerYear, daysPerDecade: daysPerYear * 10 };
}

const card = 'bg-[var(--bg-muted)] rounded-[var(--radius-md)] p-5 space-y-4';
const inputCls =
  'w-full h-11 px-3 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-[var(--fg)] placeholder:text-[var(--fg-subtle)]';
const textareaCls =
  'w-full p-3 bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-[var(--fg)] placeholder:text-[var(--fg-subtle)] resize-y min-h-[88px] leading-relaxed';
const secondaryBtn =
  'h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0';
const primaryBtn =
  'h-11 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0';

export const DefaultFutureStudio: React.FC = () => {
  const t = useT();
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

  const last14 = useMemo(() => {
    const days: { key: string; count: number; weekday: string }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        key,
        count: driftLog.filter((e) => e.dateKey === key).length,
        weekday: d.toLocaleDateString(getSpeechLang(), { weekday: 'narrow' }),
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

  const EditToggle: React.FC<{ editing: boolean; hasContent: boolean; onEdit: () => void; onSave: () => void }> = ({ editing, hasContent, onEdit, onSave }) =>
    !editing ? (
      <button type="button" onClick={onEdit} className={secondaryBtn}>
        <Pencil className="w-4 h-4" strokeWidth={1.8} />
        {hasContent ? t('Edit') : t('Write')}
      </button>
    ) : (
      <button type="button" onClick={onSave} className={primaryBtn}>
        <Check className="w-4 h-4" strokeWidth={1.8} />
        {t('Save')}
      </button>
    );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('The default path')}</h2>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            {t('Make it concrete, count what it costs, notice when you drift toward it.')}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            startFocusSession({
              missionTitle: t('The Two Futures Walk'),
              durationMinutes: 9,
              soundTrack: 'solfeggio_396hz',
              guidedMeditationId: 'gm-two-futures',
            })
          }
          className={secondaryBtn}
        >
          <Play className="w-4 h-4" strokeWidth={1.8} />
          {t('Guided walk, 9 min')}
        </button>
      </div>

      <div className={card}>
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Drift')}</h3>
          <p className="text-sm text-[var(--fg-muted)] mt-1">{t('Tap the moment you catch yourself sliding. Noticing is the first step back.')}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-[var(--fg)]">
            {cleanDaysInRow === 1 ? t('1 clean day') : t('{n} clean days', { n: cleanDaysInRow })}
          </span>
          <span className="text-[var(--fg-muted)]">
            {t('{n} this week, {prev} last week', { n: driftLast7, prev: driftPrev7 })}
          </span>
        </div>

        <div className="flex items-end gap-1">
          {last14.map((d) => (
            <div key={d.key} className="flex-1 flex flex-col items-center gap-1" title={t('{date}: {n} drift', { date: d.key, n: d.count })}>
              <div
                className={`w-full h-6 rounded-[var(--radius-xs)] ${
                  d.count === 0 ? 'bg-[var(--accent)]' : d.count === 1 ? 'bg-[var(--border-strong)]' : 'bg-[var(--fg-subtle)]'
                } ${d.key === todayKey ? 'ring-2 ring-[var(--fg)] ring-offset-2 ring-offset-[var(--bg-muted)]' : ''}`}
              />
              <span className="text-[10px] text-[var(--fg-subtle)]">{d.weekday}</span>
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
                className={`h-10 px-3.5 rounded-full text-sm inline-flex items-center gap-1.5 cursor-pointer disabled:cursor-default ${
                  done ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg)] text-[var(--fg)]'
                }`}
              >
                {done && <Check className="w-4 h-4" strokeWidth={1.8} />}
                {t(sig)}
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
          <input
            id="custom-drift"
            value={customSignal}
            onChange={(e) => setCustomSignal(e.target.value)}
            placeholder={t('Something else you noticed')}
            className={inputCls}
          />
          <button type="submit" disabled={!customSignal.trim()} aria-label={t('Log')} className={`${secondaryBtn} w-11 px-0`}>
            <Plus className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </form>

        {driftLog.length > 0 && (
          <div className="border-t border-[var(--border)] pt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--fg-muted)]">{t('Recent')}</span>
              {driftLog.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllDrift(!showAllDrift)}
                  className="min-h-[44px] text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
                >
                  {showAllDrift ? t('Show less') : t('Show all ({n})', { n: driftLog.length })}
                </button>
              )}
            </div>
            <div className="divide-y divide-[var(--border)]">
              {visibleDrift.map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 min-h-[44px] text-sm">
                  <span className="text-[var(--fg)] min-w-0 truncate">
                    <span className="text-[var(--fg-subtle)] mr-2">{e.dateKey.slice(5)}</span>
                    {t(e.signal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDriftEntry(e.id)}
                    title={t('Remove')}
                    aria-label={t('Remove')}
                    className="w-11 h-11 -mr-3 shrink-0 flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--danger)] cursor-pointer"
                  >
                    <X className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={card}>
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('What drift costs')}</h3>
          <p className="text-sm text-[var(--fg-muted)] mt-1">{t('The habits that eat your days, and what they add up to.')}</p>
        </div>

        {costs.length > 0 && (
          <div className="divide-y divide-[var(--border)]">
            {costs.map((c) => {
              const fd = formatDays(c.minutesPerDay);
              return (
                <div key={c.id} className="flex items-center justify-between gap-3 min-h-[56px] py-2 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-[var(--fg)] truncate">{c.label}</div>
                    <div className="text-xs text-[var(--fg-muted)]">
                      {t('{n} min/day', { n: c.minutesPerDay })} · {t('{n} days a year', { n: fd.daysPerYear.toFixed(1) })} ·{' '}
                      {t('{n} months a decade', { n: (fd.daysPerDecade / 30.4).toFixed(1) })}
                      {c.dollarsPerMonth ? ` · $${(c.dollarsPerMonth * 120).toLocaleString()} ${t('in 10 years')}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCost(c.id)}
                    className="w-11 h-11 -mr-3 shrink-0 flex items-center justify-center text-[var(--fg-subtle)] hover:text-[var(--danger)] cursor-pointer"
                    title={t('Remove')}
                    aria-label={t('Remove')}
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {costs.length > 0 && (
          <div className="grid grid-cols-3 gap-3 border-t border-[var(--border)] pt-4">
            <div>
              <div className="text-lg font-semibold tracking-tight text-[var(--fg)]">{totals.hoursPerYear.toFixed(0)}h</div>
              <div className="text-xs text-[var(--fg-muted)]">{t('per year')}</div>
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-[var(--fg)]">
                {t('{n} mo', { n: (totals.daysPerDecade / 30.4).toFixed(1) })}
              </div>
              <div className="text-xs text-[var(--fg-muted)]">{t('per decade')}</div>
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight text-[var(--fg)]">
                {decadeDollars > 0 ? `$${Math.round(decadeDollars / 1000)}k` : '—'}
              </div>
              <div className="text-xs text-[var(--fg-muted)]">{t('in 10 years')}</div>
            </div>
          </div>
        )}

        <div className="space-y-2 border-t border-[var(--border)] pt-4">
          <input
            id="cost-label"
            value={newCostLabel}
            onChange={(e) => setNewCostLabel(e.target.value)}
            placeholder={t('e.g. Doomscrolling, food delivery')}
            className={inputCls}
          />
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <input
              id="cost-minutes"
              type="number"
              min={0}
              max={1440}
              value={newCostMinutes}
              onChange={(e) => setNewCostMinutes(parseInt(e.target.value) || 0)}
              placeholder={t('min/day')}
              title={t('Minutes per day')}
              className={inputCls}
            />
            <input
              id="cost-dollars"
              type="number"
              min={0}
              value={newCostDollars}
              onChange={(e) => setNewCostDollars(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              placeholder={t('$/month')}
              title={t('Dollars per month, optional')}
              className={inputCls}
            />
            <button type="button" onClick={handleAddCost} disabled={!newCostLabel.trim()} className={primaryBtn}>
              {t('Add')}
            </button>
          </div>
        </div>
      </div>

      <div className={card}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('If nothing changes')}</h3>
          <EditToggle
            editing={editingTimeline}
            hasContent={Boolean(df.oneYear || df.threeYears || df.tenYears)}
            onEdit={() => setEditingTimeline(true)}
            onSave={handleSaveTimeline}
          />
        </div>

        {(
          [
            ['oneYear', oneYear, setOneYear, df.oneYear],
            ['threeYears', threeYears, setThreeYears, df.threeYears],
            ['tenYears', tenYears, setTenYears, df.tenYears],
          ] as const
        ).map(([key, value, setter, saved]) => (
          <div key={key} className="space-y-1.5">
            <label htmlFor={`df-${key}`} className="block text-sm text-[var(--fg-muted)]">
              {t(TIMELINE_PROMPTS[key].label)}
            </label>
            {editingTimeline ? (
              <textarea
                id={`df-${key}`}
                value={value}
                onChange={(e) => setter(e.target.value)}
                rows={3}
                placeholder={t(TIMELINE_PROMPTS[key].placeholder)}
                className={textareaCls}
              />
            ) : saved ? (
              <p className="text-[15px] text-[var(--fg)] leading-relaxed">{saved}</p>
            ) : (
              <p className="text-sm text-[var(--fg-subtle)]">{t(TIMELINE_PROMPTS[key].placeholder)}</p>
            )}
          </div>
        ))}
      </div>

      <div className={card}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('A letter from your default self')}</h3>
            <p className="text-sm text-[var(--fg-muted)] mt-1">{t('Written ten years down the default path. Read it when you feel the pull to postpone.')}</p>
          </div>
          <EditToggle
            editing={editingLetter}
            hasContent={Boolean(df.letterFromDefaultSelf)}
            onEdit={() => {
              if (!letter.trim()) setLetter(t(LETTER_TEMPLATE));
              setEditingLetter(true);
            }}
            onSave={handleSaveLetter}
          />
        </div>
        {editingLetter ? (
          <textarea id="df-letter" value={letter} onChange={(e) => setLetter(e.target.value)} rows={12} className={textareaCls} />
        ) : df.letterFromDefaultSelf ? (
          <pre className="whitespace-pre-wrap font-sans text-[15px] text-[var(--fg)] leading-relaxed">{df.letterFromDefaultSelf}</pre>
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--fg-subtle)] leading-relaxed">{t(LETTER_TEMPLATE)}</pre>
        )}
      </div>

      <div className={card}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Your answers')}</h3>
          <span className="text-sm text-[var(--fg-muted)] shrink-0">{answeredAllowing.length} / 8</span>
        </div>
        {answeredAllowing.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--fg-muted)]">{t('You have not answered the eight questions yet.')}</p>
            <button type="button" onClick={() => setActiveRoute('/two-futures')} className={secondaryBtn}>
              {t('Answer them')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)] max-h-[420px] overflow-y-auto">
            {answeredAllowing.map(([id, answer]) => (
              <div key={id} className="py-3 text-sm">
                <div className="text-xs text-[var(--fg-muted)]">{ALLOWING_TITLES[id] ? t(ALLOWING_TITLES[id]) : id}</div>
                <div className="text-[var(--fg)] mt-0.5 leading-relaxed">{answer}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ALLOWING_TITLES: Record<string, string> = {
  q1: N_('Quiet dissatisfaction'),
  q2: N_('Unchanged complaints'),
  q3: N_('A Tuesday in 5 years'),
  q4: N_('Closed doors in 10 years'),
  q5: N_('Late-life regret'),
  q6: N_('Identity to release'),
  q7: N_('The shield'),
  q8: N_('The real price'),
};
