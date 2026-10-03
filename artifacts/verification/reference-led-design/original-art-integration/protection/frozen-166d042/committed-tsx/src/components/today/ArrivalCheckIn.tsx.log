import React, { useMemo, useState } from 'react';
import { ArrowRight, Pencil, X } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { N_, useT } from '../../i18n';
import { localDayKey } from '../../services/momentum';

/** Five gentle levels, stored on the existing 1 to 10 check-in scale (level x 2). */
const ENERGY = [N_('Drained'), N_('Low'), N_('Steady'), N_('Good'), N_('Bright')];
const MOOD = [N_('Heavy'), N_('Uneasy'), N_('Even'), N_('Lighter'), N_('Lifted')];

const toLevel = (value: number) => Math.min(5, Math.max(1, Math.round(value / 2)));

export type ArrivalActions = {
  decisionState: 'none' | 'open' | 'done';
  onTwoMinute: () => void;
  onChooseDecision: () => void;
  onSoundRoom: () => void;
  onCourse: () => void;
  courseTitle?: string;
};

const LevelRow: React.FC<{ label: string; names: string[]; value: number; onPick: (level: number) => void; small?: boolean; disabled?: boolean }> = ({ label, names, value, onPick, small, disabled }) => {
  const t = useT();
  return (
    <div role="group" aria-label={label} className="grid grid-cols-5 gap-1.5">
      {names.map((name, i) => {
        const level = i + 1;
        const on = value === level;
        return (
          <button
            key={name}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            aria-label={`${label}: ${t(name)}, ${level} / 5`}
            onClick={() => onPick(level)}
            className={`min-h-11 rounded-[var(--radius-sm)] flex flex-col items-center justify-center gap-1 px-1 py-1.5 cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${on ? 'bg-[var(--fg)] text-[var(--bg)]' : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]'}`}
          >
            {!small && (
              <span aria-hidden="true" className="flex items-end gap-[3px] h-3.5">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <span key={bar} className={`w-[3px] rounded-full ${bar <= level ? 'bg-current' : 'bg-current opacity-25'}`} style={{ height: 4 + bar * 2 }} />
                ))}
              </span>
            )}
            <span className="text-[12px] leading-none font-medium">{t(name)}</span>
          </button>
        );
      })}
    </div>
  );
};

/**
 * "How are you arriving?" One compact tap for energy, one gentle suggestion,
 * then a single summary line for the rest of the day.
 */
export const ArrivalCheckIn: React.FC<ArrivalActions> = ({ decisionState, onTwoMinute, onChooseDecision, onSoundRoom, onCourse, courseTitle }) => {
  const t = useT();
  const { data, saveDailyCheckIn } = useApp();
  const today = localDayKey();
  const entry = useMemo(() => (data?.checkIns || []).find((c) => c.dateKey === today), [data?.checkIns, today]);
  const [editing, setEditing] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  if (!data) return null;

  const energyLevel = entry ? toLevel(entry.energy) : 0;
  const moodLevel = entry ? toLevel(entry.mood) : 0;

  const save = async (patch: { energy?: number; mood?: number }) => {
    if (saving) return;
    setSaving(true);
    try {
      await saveDailyCheckIn({
        // Focus is not asked here: keep an earlier value, otherwise the neutral midpoint.
        focus: entry?.focus ?? 5,
        energy: patch.energy ?? entry?.energy ?? 6,
        mood: patch.mood ?? entry?.mood ?? 6,
        notes: entry?.notes,
        dateKey: today,
      });
    } finally {
      setSaving(false);
    }
  };
  const pickEnergy = async (level: number) => {
    await save({ energy: level * 2 });
    setEditing(false);
    setSuggesting(true);
  };

  // Collapsed: one line with an edit option.
  if (entry && !editing && !suggesting) {
    return (
      <div className="oda-card rounded-[var(--radius-lg)] pl-4 pr-1.5 min-h-12 flex items-center justify-between gap-2" role="status">
        <p className="text-[14px] text-[var(--fg-muted)] min-w-0 truncate">
          <span className="text-[var(--fg)] font-medium">{t('Arriving')}</span>
          {' · '}{t('Energy')} {t(ENERGY[energyLevel - 1])}
          {/* Mood is optional here and defaults to the midpoint, so only show it once it was set. */}
          {entry.mood !== 6 && <>{' · '}{t('Mood')} {t(MOOD[moodLevel - 1])}</>}
        </p>
        <button type="button" onClick={() => setEditing(true)} aria-label={t('Edit how you are arriving')} className="shrink-0 h-11 px-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)] cursor-pointer focus-visible:outline focus-visible:outline-2 rounded-[var(--radius-sm)]">
          <Pencil size={14} strokeWidth={1.8} aria-hidden="true" />{t('Edit')}
        </button>
      </div>
    );
  }

  // The one suggestion, chosen from energy alone.
  let suggestion: { text: string; action?: { label: string; run: () => void } } | null = null;
  if (suggesting && entry) {
    if (energyLevel <= 2) {
      if (decisionState === 'open') suggestion = { text: t('Low energy is a fine place to start. Make today’s decision the 2-minute version.'), action: { label: t('Start · just 2 minutes'), run: onTwoMinute } };
      else if (decisionState === 'none') suggestion = { text: t('On a low day, choose something very small. It still counts.'), action: { label: t('Choose today’s decision'), run: onChooseDecision } };
      else suggestion = { text: t('Today’s decision is kept. Rest counts too. A few quiet minutes might help.'), action: { label: t('Open the Sound Room'), run: onSoundRoom } };
      if (energyLevel === 1 && decisionState === 'open') suggestion.text = t('Go gently today. Make the decision the 2-minute version, or start with a few quiet minutes.');
    } else if (energyLevel === 3) {
      suggestion = decisionState === 'open'
        ? { text: t('A steady day. Do today’s decision first, and let the rest follow.'), action: { label: t('Start · just 2 minutes'), run: onTwoMinute } }
        : { text: t('A steady day is a good day to keep things simple.') };
    } else {
      suggestion = { text: t('You have some energy today. A short lesson is a good way to use it.'), action: { label: courseTitle ? t('Open: {title}', { title: courseTitle }) : t('Open a lesson'), run: onCourse } };
    }
  }

  return (
    <section className="oda-card rounded-[var(--radius-lg)] p-4 space-y-3" aria-labelledby="arrive-title">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id="arrive-title" className="oda-kicker text-[var(--brand-burgundy)]">{t('How are you arriving?')}</h2>
          {!suggestion && <p className="text-[13px] text-[var(--fg-muted)]">{t('Tap your energy. It takes one second.')}</p>}
        </div>
        {(editing || suggesting) && entry && (
          <button type="button" onClick={() => { setEditing(false); setSuggesting(false); }} aria-label={t('Close')} className="-mt-1 -mr-1 w-11 h-11 shrink-0 flex items-center justify-center rounded-full text-[var(--fg-muted)] cursor-pointer focus-visible:outline focus-visible:outline-2">
            <X size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
        )}
      </div>

      <LevelRow label={t('Energy')} names={ENERGY} value={energyLevel} onPick={(l) => void pickEnergy(l)} disabled={saving} />

      {suggestion && (
        <div className="rounded-[var(--radius-sm)] bg-[var(--bg-muted)] p-3.5 space-y-2.5" role="status">
          <p className="text-[14px] leading-relaxed text-[var(--fg)]">{suggestion.text}</p>
          <div className="flex flex-wrap items-center gap-x-4">
            {suggestion.action && (
              <button type="button" onClick={suggestion.action.run} className="inline-flex items-center gap-1 min-h-11 text-[14px] font-semibold text-[var(--accent)] cursor-pointer focus-visible:outline focus-visible:outline-2 rounded-[var(--radius-sm)]">
                {suggestion.action.label}<ArrowRight size={16} strokeWidth={1.9} aria-hidden="true" />
              </button>
            )}
            {energyLevel <= 1 && decisionState !== 'done' && (
              <button type="button" onClick={onSoundRoom} className="min-h-11 text-[14px] text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer focus-visible:outline focus-visible:outline-2 rounded-[var(--radius-sm)]">{t('Open the Sound Room')}</button>
            )}
          </div>
        </div>
      )}

      {(suggesting || editing) && entry && (
        <div className="space-y-1.5">
          <p className="text-[13px] text-[var(--fg-muted)]">{t('And your mood? Optional.')}</p>
          <LevelRow label={t('Mood')} names={MOOD} value={moodLevel} onPick={(l) => void save({ mood: l * 2 })} small disabled={saving} />
        </div>
      )}
    </section>
  );
};
