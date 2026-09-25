import React, { useEffect, useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Field } from './ui';
import { Send, Check, Bell } from 'lucide-react';
import { notificationScheduler } from '../services/notificationScheduler';
import { getPushStatus, enablePush, disablePush, syncPushPreferences } from '../services/pushNotifications';
import { cloudSync } from '../services/cloudSync';
import { NUDGE_SLOTS, NudgeSlot, getNudgeLine, normaliseNudgeTimes, isNudgeTime } from '../data/dailyNudges';
import { useT, useLocale } from '../i18n';
import { companionCopy } from '../i18n/companion';
import { usualReminderTime } from '../services/momentum';

export const DailyNudgesSettings: React.FC = () => {
  const t = useT(); const [locale] = useLocale(); const c = companionCopy(locale);
  const { data, updateProfile, updateMomentumProfile, showToast } = useApp();
  const [perm, setPerm] = useState(notificationScheduler.permission());
  const [enabled, setEnabled] = useState(data?.profile.nudgesEnabled === true);
  const [times, setTimes] = useState<Record<NudgeSlot, string>>(() => normaliseNudgeTimes(data?.profile.nudgeTimes));
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [push, setPush] = useState<Awaited<ReturnType<typeof getPushStatus>> | null>(null);
  useEffect(() => {
    let active = true;
    const refresh = () => { setPerm(notificationScheduler.permission()); getPushStatus().then(state => { if (active) setPush(state); }).catch(() => {}); };
    refresh(); const unsubscribe = cloudSync.subscribe(refresh);
    return () => { active = false; unsubscribe(); };
  }, []);
  if (!data) return null;
  const supported = notificationScheduler.isSupported();
  const valid = () => NUDGE_SLOTS.every(slot => isNudgeTime(times[slot])) && new Set(Object.values(times)).size === 6;
  const report = (error: unknown) => showToast(error instanceof Error ? error.message : t('Something went wrong. Please try again.'), 'error');

  const handleToggle = async () => {
    if (busy) return;
    const next = !enabled;
    if (next && !valid()) { showToast(c.timeInvalid, 'error'); return; }
    setBusy(true);
    try {
      if (next && perm !== 'granted') {
        const permission = await notificationScheduler.requestPermission(); setPerm(permission);
        if (permission !== 'granted') { showToast(t('Notifications are blocked in the browser. Allow them to receive nudges.'), 'error'); return; }
      }
      if (!next) {
        // Stop this device's local reminders even if remote cleanup is offline.
        await updateProfile({ nudgesEnabled: false, nudgeTimes: times }); setEnabled(false);
        await disablePush();
      }
      await updateProfile({ nudgesEnabled: next, nudgeTimes: times }); setEnabled(next);
      setPush(await getPushStatus());
    } catch (error) { report(error); } finally { setBusy(false); }
  };
  const handleSave = async () => {
    if (!valid()) { showToast(c.timeInvalid, 'error'); return; }
    setBusy(true);
    try {
      if (push?.subscribed) await syncPushPreferences(times, locale);
      await updateProfile({ nudgesEnabled: enabled, nudgeTimes: times }); setSaved(true);
    } catch (error) { report(error); } finally { setBusy(false); }
  };
  const handleBackground = async () => {
    if (!valid()) { showToast(c.timeInvalid, 'error'); return; }
    setBusy(true);
    try {
      setPush(await enablePush(times, locale)); setPerm(notificationScheduler.permission());
      await updateProfile({ nudgesEnabled: true, nudgeTimes: times }); setEnabled(true);
    } catch (error) { report(error); } finally { setBusy(false); }
  };
  const handleTest = async () => {
    if (perm !== 'granted') {
      const permission = await notificationScheduler.requestPermission(); setPerm(permission);
      if (permission !== 'granted') return;
    }
    await notificationScheduler.show('morning');
  };
  const status = !supported ? t('Not supported here') : perm === 'denied' ? t('Blocked by browser') : enabled ? c.notificationOn : c.notificationOff;
  return <Card padding="md" className="space-y-5">
    <div><h3 className="text-[17px] font-semibold">{c.reminders}</h3><p className="text-[13px] text-[var(--fg-muted)] mt-1">{status}</p></div>
    <p className="text-sm text-[var(--fg-muted)] leading-relaxed">{c.remindersHint}</p>
    <div className="flex items-center justify-between gap-4 p-4 rounded-[var(--radius-sm)] bg-[var(--bg)]">
      <div className="text-sm"><p className="font-medium">{t('Send me daily nudges')}</p><p className="text-xs mt-1 text-[var(--fg-muted)]">{perm === 'granted' ? t('Notification permission granted.') : perm === 'denied' ? t('Permission denied — enable it in browser site settings.') : t("We'll ask for permission once.")}</p></div>
      <button type="button" onClick={handleToggle} disabled={!supported || busy} aria-pressed={enabled} aria-label={t('Send me daily nudges')} className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-40 shrink-0 ${enabled ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}><span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`} /></button>
    </div>
    <div className="flex items-center justify-between gap-4 p-4 rounded-[var(--radius-sm)] bg-[var(--bg)]">
      <div className="text-sm"><p className="font-medium">{t('Smart timing')}</p><p className="text-xs mt-1 text-[var(--fg-muted)]">{usualReminderTime(data.missions)
        ? t('At most two reminders a day: a morning nudge if you haven’t chosen yet, and one around {time}, before you usually keep your decision. Nothing once it’s done.', { time: usualReminderTime(data.missions)! })
        : t('At most two reminders a day: a morning nudge if you haven’t chosen yet, and one in the evening. After three kept decisions, ODA learns your usual time.')}</p></div>
      <button type="button" onClick={() => void updateMomentumProfile({ nudgeMode: data.profile.nudgeMode === 'smart' ? 'custom' : 'smart' })} aria-pressed={data.profile.nudgeMode === 'smart'} aria-label={t('Smart timing')} className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${data.profile.nudgeMode === 'smart' ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'}`}><span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${data.profile.nudgeMode === 'smart' ? 'translate-x-5' : ''}`} /></button>
    </div>
    {data.profile.nudgeMode === 'smart' && <p className="text-xs leading-relaxed text-[var(--fg-muted)]">{t('Smart timing applies on this device while ODA is open or installed. Background reminders from the server still use the times below.')}</p>}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{NUDGE_SLOTS.map(slot => <Field key={slot} id={`nudge-${slot}`} label={c[slot]}><input id={`nudge-${slot}`} type="time" value={times[slot]} onChange={event => { setTimes({ ...times, [slot]: event.target.value }); setSaved(false); }} className="w-full h-11 px-3 text-sm bg-[var(--bg)] rounded-[var(--radius-sm)]" /></Field>)}</div>
    <details className="text-sm"><summary className="min-h-10 cursor-pointer font-medium">{c.showToday}</summary><ol className="space-y-4 mt-2">{NUDGE_SLOTS.map(slot => <li key={slot} className="text-[13px] leading-relaxed text-[var(--fg-muted)]"><strong className="text-[var(--fg)] block mb-1">{c[slot]} · {times[slot]}</strong>{getNudgeLine(slot)}</li>)}</ol></details>
    <div className="flex justify-between gap-3 flex-wrap"><Button variant="secondary" size="sm" icon={Send} onClick={handleTest} disabled={!supported || busy}>{t('Send a test')}</Button><Button variant="primary" size="sm" icon={saved ? Check : undefined} onClick={handleSave} disabled={busy}>{saved ? t('Saved') : t('Save times')}</Button></div>
    <section className="border-t border-[var(--border)] pt-4 space-y-2"><p className="text-sm font-semibold flex items-center gap-2"><Bell size={16} />{c.background}</p><p className="text-xs leading-relaxed text-[var(--fg-muted)]">{push?.subscribed ? c.backgroundOn : !push?.configured ? c.backgroundSetup : !push?.signedIn ? c.backgroundSignIn : c.notificationLocal}</p>{push?.configured && push.signedIn && !push.subscribed && <Button variant="secondary" size="sm" onClick={handleBackground} disabled={busy || !supported}>{c.backgroundEnable}</Button>}</section>
  </Card>;
};
