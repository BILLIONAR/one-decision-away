import React, { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { useT } from '../../i18n';
import { FEEDBACK_EMAIL } from '../../data/contact';
import {
  comebackState, evidenceSummary, freshStart, localDayKey, usageStats,
  type CheckInAnswer, SIMPLE_MODE_KEPT,
} from '../../services/momentum';

const DISMISS_KEY = 'oda_momentum_card_dismissed';
function readDismissed() { try { return localStorage.getItem(DISMISS_KEY); } catch { return null; } }

/**
 * A kind return after a lapse, or a fresh-start nudge on a new week/month.
 * Shows at most one card, only while today's decision is still open.
 */
export const MomentumCard: React.FC<{ decisionOpen: boolean; hasDecision: boolean; onMakeSmaller: () => void; onChoose: () => void }> = ({ decisionOpen, hasDecision, onMakeSmaller, onChoose }) => {
  const t = useT();
  const { data } = useApp();
  const today = localDayKey();
  const [dismissed, setDismissed] = useState(() => readDismissed() === today);
  if (!data || dismissed || !decisionOpen) return null;

  const comeback = comebackState(data.missions);
  const fresh = comeback ? null : freshStart();
  if (!comeback && !fresh) return null;

  const title = comeback?.kind === 'missed-once' ? t('Yesterday didn’t happen. That’s okay.')
    : comeback ? t('Welcome back. Today is a clean page.')
    : fresh === 'month' ? t('A new month, a clean page.') : t('A new week, a clean page.');
  const body = comeback?.kind === 'missed-once'
    ? t('Missing one day doesn’t undo your progress. What matters is not missing twice. Choose the smallest version of today’s decision.')
    : comeback ? t('No need to make up for the missed days. Go easy on yourself about the gap, and choose one small decision for today.')
    : t('New beginnings make change easier to start. What do you want this period to be about? Begin with today’s decision.');

  const dismiss = () => { setDismissed(true); try { localStorage.setItem(DISMISS_KEY, today); } catch { /* per-device only */ } };

  return (
    <section aria-label={title} className="relative rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5 pr-12 space-y-2">
      <button type="button" onClick={dismiss} aria-label={t('Dismiss')} className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full text-[var(--fg-muted)] hover:bg-[var(--bg-muted)]"><X size={18} /></button>
      <h2 className="text-[16px] font-semibold text-[var(--fg)]">{title}</h2>
      <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{body}</p>
      <button type="button" onClick={hasDecision ? onMakeSmaller : onChoose} className="inline-flex items-center gap-1 min-h-11 text-[14px] font-semibold text-[var(--accent)]">
        {hasDecision ? t('Make it smaller') : t('Choose today’s decision')}<ChevronRight size={16} />
      </button>
    </section>
  );
};

/** Kept promises as a compact week strip that opens the evidence log. */
export const EvidenceStrip: React.FC = () => {
  const t = useT();
  const { data, setActiveRoute } = useApp();
  if (!data) return null;
  const s = evidenceSummary(data.missions);
  return (
    <button type="button" onClick={() => setActiveRoute('/app/evidence')} className="w-full flex items-center gap-4 rounded-[var(--radius-md)] bg-[var(--bg-muted)] px-5 py-4 text-left hover:bg-[var(--bg-inset)] transition-colors">
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-[var(--fg)]">
          {s.total === 0 ? t('Your evidence starts today') : s.total === 1 ? t('1 kept promise') : t('{n} kept promises', { n: s.total })}
        </span>
        <span className="block text-[13px] text-[var(--fg-muted)]">{t('This week: {n} of 7 days', { n: s.last7 })}</span>
      </span>
      <span className="flex gap-1.5 shrink-0" aria-hidden="true">
        {s.weekDays.map(d => <span key={d.dayKey} className={`w-2.5 h-2.5 rounded-full ${d.kept ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`} />)}
      </span>
      <ChevronRight size={18} className="shrink-0 text-[var(--fg-subtle)]" />
    </button>
  );
};

/** First-week notice with an escape hatch to every tool. */
export const SimpleModeNote: React.FC = () => {
  const t = useT();
  const { updateMomentumProfile } = useApp();
  return (
    <section className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] p-5 space-y-2">
      <h2 className="text-[15px] font-semibold text-[var(--fg)]">{t('A simple start')}</h2>
      <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">
        {t('For your first week you’ll see only what matters most: one decision a day. The other tools open after {n} kept decisions.', { n: SIMPLE_MODE_KEPT })}
      </p>
      <button type="button" onClick={() => void updateMomentumProfile({ simpleModeOff: true })} className="min-h-11 text-[14px] font-semibold text-[var(--accent)]">
        {t('Show everything now')}
      </button>
    </section>
  );
};

/** Day-14 question: the honest measure of whether the app helps. */
export const TwoWeekCheckIn: React.FC = () => {
  const t = useT();
  const { data, updateMomentumProfile, showToast } = useApp();
  const [answer, setAnswer] = useState<CheckInAnswer | null>(null);
  const [note, setNote] = useState('');
  if (!data) return null;

  const options: { key: CheckInAnswer; label: string }[] = [
    { key: 'yes', label: t('Yes') }, { key: 'a-little', label: t('A little') }, { key: 'not-yet', label: t('Not yet') },
  ];

  const save = async (send: boolean) => {
    if (!answer) return;
    const at = new Date().toISOString();
    if (send) {
      const s = usageStats(data);
      const label = options.find(o => o.key === answer)!.label;
      const body = [
        `${t('Did you start something you had been putting off?')} ${label}`,
        ...(note.trim() ? [`${t('Note')}: ${note.trim()}`] : []),
        '',
        t('Days since start: {n}', { n: s.daysSinceStart }),
        t('Decisions set: {n}', { n: s.decisionsSet }),
        t('Decisions kept: {n}', { n: s.decisionsKept }),
        t('Plans made: {n}', { n: s.plansMade }),
        t('Two-minute starts: {n}', { n: s.twoMinuteStarts }),
      ].join('\n');
      window.location.href = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('ODA — 14 days')}&body=${encodeURIComponent(body)}`;
    }
    await updateMomentumProfile({ twoWeekCheckIn: { answer, note: note.trim() || undefined, at } });
    showToast(t('Thank you. This helps us make ODA better.'), 'success');
  };

  return (
    <section aria-labelledby="two-week-title" className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5 space-y-4">
      <div className="space-y-1">
        <p className="oda-kicker text-[var(--accent)]">{t('Two weeks in')}</p>
        <h2 id="two-week-title" className="text-[17px] font-semibold text-[var(--fg)]">{t('Did you start something you had been putting off?')}</h2>
      </div>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="two-week-title">
        {options.map(o => (
          <button key={o.key} type="button" role="radio" aria-checked={answer === o.key} onClick={() => setAnswer(o.key)}
            className={`min-h-11 px-4 rounded-full text-[14px] font-medium ${answer === o.key ? 'bg-[var(--accent)] text-[var(--bg)]' : 'bg-[var(--bg-muted)] text-[var(--fg)]'}`}>{o.label}</button>
        ))}
      </div>
      {answer && <>
        <label htmlFor="two-week-note" className="sr-only">{t('What helped, or what got in the way? (optional)')}</label>
        <textarea id="two-week-note" value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={600}
          placeholder={t('What helped, or what got in the way? (optional)')}
          className="w-full px-4 py-3 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-[16px] outline-none focus:border-[var(--accent)]" />
        <div className="flex flex-col sm:flex-row gap-2">
          <button type="button" onClick={() => void save(true)} className="h-12 flex-1 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg)] text-[15px] font-semibold">{t('Send to the ODA team')}</button>
          <button type="button" onClick={() => void save(false)} className="h-12 px-5 rounded-[var(--radius-sm)] text-[15px] font-semibold text-[var(--fg-muted)]">{t('Just save')}</button>
        </div>
        <p className="text-[12px] text-[var(--fg-muted)]">{t('Sending opens your email app with your answer and a few usage numbers. Nothing is sent automatically.')}</p>
      </>}
    </section>
  );
};
