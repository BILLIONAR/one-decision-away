import React, { useEffect, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Field, Badge } from './ui';
import { BellRing, Send, Check } from 'lucide-react';
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

  return (
    <Card padding="lg" className="space-y-5 bg-[var(--bg-elevated)]">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-[var(--color-coral)]" />
          <h3 className="font-display font-bold text-base text-[var(--fg)]">{t('Daily Nudges')}</h3>
        </div>
        <Badge variant={enabled && perm === 'granted' ? 'sage' : 'subtle'}>
          {!supported ? t('Not supported here') : perm === 'denied' ? t('Blocked by browser') : enabled ? t('On · 3 a day') : t('Off')}
        </Badge>
      </div>

      <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
        {t('Three short, honest lines a day — one to start, one to re-aim, one to close. They arrive as notifications while the app is open or installed on your home screen. Never the same line twice in a day.')}
      </p>

      <div className="flex items-center justify-between p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)]/60 border border-[var(--border)]">
        <div className="text-xs">
          <div className="font-bold text-[var(--fg)]">{t('Send me daily nudges')}</div>
          <div className="text-[var(--fg-muted)]">
            {perm === 'granted' ? t('Notification permission granted.') : perm === 'denied' ? t('Permission denied — enable it in browser site settings.') : t("We'll ask for permission once.")}
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={!supported}
          className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer disabled:opacity-40 ${enabled ? 'bg-[var(--color-sage)]' : 'bg-[var(--border-strong)]'}`}
          aria-pressed={enabled}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-5' : ''}`} />
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
              className="w-full px-3 py-2 text-xs bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-xs)] text-[var(--fg)]"
            />
          </Field>
        ))}
      </div>

      <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--bg-muted)]/40 border border-[var(--border)] space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider font-bold text-[var(--fg-subtle)]">{t("Today's lines")}</div>
        {SLOTS.map((s) => (
          <div key={s.key} className="text-xs text-[var(--fg-muted)]">
            <span className="font-semibold text-[var(--fg)]">{t(NUDGE_TITLES[s.key])} · {times[s.key]}</span> — {t(getNudgeLine(s.key))}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
        <Button variant="outline" size="sm" icon={Send} onClick={handleTest} disabled={!supported}>
          {t('Send a test now')}
        </Button>
        <Button variant="primary" size="sm" icon={saved ? Check : undefined} onClick={handleSave}>
          {saved ? t('Saved') : t('Save times')}
        </Button>
      </div>
      <p className="text-[11px] text-[var(--fg-subtle)]">
        {t("Browser limitation: when the app is fully closed, nudges can't fire without a push server. Keep it installed on your home screen or open in a tab, and they arrive on time; if you open the app within 90 minutes of a slot, the missed nudge is delivered then.")}
      </p>
    </Card>
  );
};
