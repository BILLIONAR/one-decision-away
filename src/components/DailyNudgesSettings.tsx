import React, { useEffect, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Field } from './ui';
import { Send, Check } from 'lucide-react';
import { notificationScheduler } from '../services/notificationScheduler';
import { DEFAULT_NUDGE_TIMES, NUDGE_TITLES, NudgeSlot, getNudgeLine } from '../data/dailyNudges';
import { useT, N_ } from '../i18n';

const SLOTS: { key: NudgeSlot; label: string; hint: string }[] = [
  { key: 'morning', label: N_('Morning ignite'), hint: N_('Sets the One Decision before the day starts') },
  { key: 'midday', label: N_('Midday re-aim'), hint: N_('Catches the drift, brings you back') },
  { key: 'evening', label: N_('Evening close'), hint: N_('Kind review, tomorrow\'s first step') },
];

export const DailyNudgesSettings: React.FC = () => {
  const t = useT();
  const { data, updateProfile, showToast } = useApp();
  const [perm, setPerm] = useState(notificationScheduler.permission());
  const [enabled, setEnabled] = useState<boolean>(data?.profile.nudgesEnabled === true);
  const [times, setTimes] = useState<Record<NudgeSlot, string>>({
    morning: data?.profile.nudgeTimes?.morning || DEFAULT_NUDGE_TIMES.morning,
    midday: data?.profile.nudgeTimes?.midday || DEFAULT_NUDGE_TIMES.midday,
    evening: data?.profile.nudgeTimes?.evening || DEFAULT_NUDGE_TIMES.evening,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => setPerm(notificationScheduler.permission()), []);
  if (!data) return null;

  const supported = notificationScheduler.isSupported();

  const handleToggle = async () => {
    const next = !enabled;
    if (next && perm !== 'granted') {
      const p = await notificationScheduler.requestPermission();
      setPerm(p);
      if (p !== 'granted') {
        showToast(t('Notifications are blocked in the browser. Allow them to receive nudges.'), 'error');
        return;
      }
    }
    setEnabled(next);
    await updateProfile({ nudgesEnabled: next, nudgeTimes: times });
  };

  const handleSave = async () => {
    await updateProfile({ nudgesEnabled: enabled, nudgeTimes: times });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (perm !== 'granted') {
      const p = await notificationScheduler.requestPermission();
      setPerm(p);
      if (p !== 'granted') return;
    }
    const hour = new Date().getHours();
    const slot: NudgeSlot = hour < 12 ? 'morning' : hour < 18 ? 'midday' : 'evening';
    await notificationScheduler.show(slot);
  };

  const status = !supported ? t('Not supported here') : perm === 'denied' ? t('Blocked by browser') : enabled ? t('On, 3 a day') : t('Off');

  return (
    <Card padding="md" className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Daily nudges')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)] mt-0.5">{status}</p>
        </div>
      </div>

      <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed">
        {t('Three short lines a day: one to start, one to re-aim, one to close. They arrive as notifications while the app is open or installed on your home screen.')}
      </p>

      <div className="flex items-center justify-between gap-4 p-4 rounded-[var(--radius-sm)] bg-[var(--bg)]">
        <div className="text-[14px] min-w-0">
          <div className="font-medium text-[var(--fg)]">{t('Send me daily nudges')}</div>
          <div className="text-[13px] text-[var(--fg-muted)]">
            {perm === 'granted' ? t('Notification permission granted.') : perm === 'denied' ? t('Permission denied — enable it in browser site settings.') : t("We'll ask for permission once.")}
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={!supported}
          className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer disabled:opacity-40 shrink-0 ${enabled ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}
          aria-pressed={enabled}
          aria-label={t('Send me daily nudges')}
        >
          <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {SLOTS.map((s) => (
          <Field key={s.key} id={`nudge-${s.key}`} label={t(s.label)} helper={t(s.hint)}>
            <input
              id={`nudge-${s.key}`}
              type="time"
              value={times[s.key]}
              onChange={(e) => setTimes({ ...times, [s.key]: e.target.value })}
              className="w-full h-11 px-3.5 text-[15px] bg-[var(--bg)] rounded-[var(--radius-sm)] text-[var(--fg)] focus:outline-none"
            />
          </Field>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-[13px] font-medium text-[var(--fg-muted)]">{t("Today's lines")}</div>
        {SLOTS.map((s) => (
          <div key={s.key} className="text-[13px] text-[var(--fg-muted)] leading-relaxed">
            <span className="font-medium text-[var(--fg)]">{t(NUDGE_TITLES[s.key])} · {times[s.key]}</span> — {t(getNudgeLine(s.key))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button variant="secondary" size="sm" icon={Send} onClick={handleTest} disabled={!supported}>
          {t('Send a test')}
        </Button>
        <Button variant="primary" size="sm" icon={saved ? Check : undefined} onClick={handleSave}>
          {saved ? t('Saved') : t('Save times')}
        </Button>
      </div>
      <p className="text-[12px] text-[var(--fg-subtle)] leading-relaxed">
        {t("When the app is fully closed, nudges can't fire without a push server. Keep it installed or open in a tab. If you open the app within 90 minutes of a slot, the missed nudge is delivered then.")}
      </p>
    </Card>
  );
};
