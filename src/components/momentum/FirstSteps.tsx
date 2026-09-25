import React, { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useApp } from '../../store/useApp';
import { useLocale, useT } from '../../i18n';
import { keptDecisions, localDayKey, usualReminderTime } from '../../services/momentum';
import { notificationScheduler } from '../../services/notificationScheduler';
import { enablePush, getPushStatus } from '../../services/pushNotifications';
import { normaliseNudgeTimes } from '../../data/dailyNudges';
import { voiceLine } from '../../data/odaVoice';
import { EvidenceTree } from './EvidenceTree';

/** Tap-to-fill suggestions for small decisions (never auto-submitted). */
export const EasyDecisionChips: React.FC<{ options: string[]; onPick: (title: string) => void; label: string; tone?: 'dark' | 'light' }> = ({ options, onPick, label, tone = 'light' }) => {
  const t = useT();
  return (
    <div className="space-y-2">
      <p className={`text-[12px] font-semibold ${tone === 'dark' ? 'opacity-70' : 'text-[var(--fg-muted)]'}`}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(option => (
          <button key={option} type="button" onClick={() => onPick(option)}
            className={`min-h-9 px-3 py-1.5 rounded-full text-[13px] leading-snug text-left transition-colors ${tone === 'dark'
              ? 'border border-[var(--bg)]/35 hover:bg-[var(--bg)]/10'
              : 'border border-[var(--border-strong)] bg-[var(--bg-elevated)] hover:border-[var(--accent)]'}`}>
            {t(option)}
          </button>
        ))}
      </div>
    </div>
  );
};

const fallbackTime = (now = new Date()) => {
  const minutes = Math.min(22 * 60, Math.max(7 * 60, Math.round((now.getHours() * 60 + now.getMinutes() - 30) / 5) * 5));
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
};
const tomorrowKey = (now = new Date()) => localDayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
const DISMISS_KEY = 'oda_kept_card_dismissed';
function readDismissed() { try { return localStorage.getItem(DISMISS_KEY); } catch { return null; } }

/** True while the one-time reminder offer still makes sense on this device. */
export function reminderOfferOpen(profile: { reminderAskedAt?: string; nudgesEnabled?: boolean }): boolean {
  const permission = notificationScheduler.permission();
  return !profile.reminderAskedAt && !profile.nudgesEnabled && permission !== 'unsupported' && permission !== 'denied';
}

/**
 * After a kept decision: a quiet celebration (the first one gets a tree),
 * an invitation to write tomorrow's decision now, and — once — an offer of
 * a reminder at the time the member actually keeps decisions. Asking here,
 * after a success, follows Habit Tracker/Productive rather than asking cold.
 */
export const KeptMomentCard: React.FC = () => {
  const t = useT();
  const [locale] = useLocale();
  const { data, updateMomentumProfile, showToast } = useApp();
  const today = localDayKey();
  const [dismissed, setDismissed] = useState(() => readDismissed() === today);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  if (!data || dismissed) return null;

  const kept = keptDecisions(data.missions).length;
  const first = kept === 1;
  const hasDraft = data.profile.nextDecisionDraft?.forDay === tomorrowKey();
  const offerReminder = reminderOfferOpen(data.profile);
  if (!first && hasDraft && !offerReminder) return null;
  const time = usualReminderTime(data.missions) ?? fallbackTime();

  const dismiss = () => { setDismissed(true); try { localStorage.setItem(DISMISS_KEY, today); } catch { /* per-device only */ } };

  const saveDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    await updateMomentumProfile({ nextDecisionDraft: { text, forDay: tomorrowKey() } });
    setDraft('');
  };

  const acceptReminder = async () => {
    if (busy) return;
    setBusy(true);
    const askedAt = new Date().toISOString();
    try {
      const permission = await notificationScheduler.requestPermission();
      if (permission !== 'granted') {
        await updateMomentumProfile({ reminderAskedAt: askedAt });
        showToast(t('Notifications are blocked in the browser. You can allow them later in Settings.'), 'error');
        return;
      }
      const times = normaliseNudgeTimes({ ...normaliseNudgeTimes(data.profile.nudgeTimes), evening: time });
      await updateMomentumProfile({ reminderAskedAt: askedAt, nudgesEnabled: true, nudgeMode: 'smart', nudgeTimes: times });
      // Background delivery needs a signed-in member and a configured push server; otherwise reminders run while ODA is open.
      const push = await getPushStatus().catch(() => null);
      if (push?.configured && push.signedIn && !push.subscribed) await enablePush(times, locale).catch(() => undefined);
      showToast(t('Done. ODA will remind you around {time}, at most twice a day.', { time }), 'success');
    } finally { setBusy(false); }
  };

  return (
    <section aria-label={first ? t('Your first piece of proof') : t('Kept')} className="relative rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5 pr-12 space-y-4">
      <button type="button" onClick={dismiss} aria-label={t('Dismiss')} className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full text-[var(--fg-muted)] hover:bg-[var(--bg-muted)]"><X size={18} /></button>
      <div className="flex items-center gap-4">
        {first && <EvidenceTree count={1} className="w-20 h-16 shrink-0" label={t('Your evidence tree: {n} leaves', { n: 1 })} />}
        <div className="min-w-0 space-y-1">
          <h2 className="text-[16px] font-semibold text-[var(--fg)]">{first ? t('Your first piece of proof') : t('Kept.')}</h2>
          <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{first ? t('You did what you said you would. Your evidence tree just grew its first leaf.') : t(voiceLine('kept'))}</p>
        </div>
      </div>

      {!hasDraft ? (
        <form onSubmit={saveDraft} className="space-y-2">
          <label htmlFor="tomorrow-draft" className="block text-[13px] font-semibold text-[var(--fg)]">{t('Want to choose tomorrow’s decision now?')}</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input id="tomorrow-draft" value={draft} onChange={e => setDraft(e.target.value)} placeholder={t('Tomorrow I will…')} className="flex-1 min-w-0 h-11 px-3 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-[15px] outline-none focus:border-[var(--accent)]" />
            <button type="submit" disabled={!draft.trim()} className="h-11 px-4 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-[14px] font-semibold disabled:opacity-40">{t('Save for tomorrow')}</button>
          </div>
        </form>
      ) : (
        <p className="flex items-center gap-2 text-[13px] text-[var(--fg-muted)]"><Check size={15} className="text-[var(--accent)]" />{t('Tomorrow’s decision is waiting: “{text}”', { text: data.profile.nextDecisionDraft!.text })}</p>
      )}

      {offerReminder && (
        <div className="rounded-[var(--radius-sm)] bg-[var(--bg-muted)] p-4 space-y-3">
          <p className="flex items-start gap-2 text-[14px] leading-relaxed text-[var(--fg)]"><Bell size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />{t('Want a gentle reminder tomorrow around {time}? At most twice a day, never to guilt you.', { time })}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void acceptReminder()} disabled={busy} className="h-10 px-4 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg)] text-[14px] font-semibold disabled:opacity-50">{t('Yes, remind me')}</button>
            <button type="button" onClick={() => void updateMomentumProfile({ reminderAskedAt: new Date().toISOString() })} className="h-10 px-3 text-[14px] text-[var(--fg-muted)]">{t('Not now')}</button>
          </div>
        </div>
      )}
    </section>
  );
};
