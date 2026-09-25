import { publicAssetPath } from '../utils/routing';
import React, { useState, useEffect } from 'react';
import { useApp } from '../store/useApp';
import { Input, Modal } from '../components/ui';
import { Download, Trash2, Sun, Moon, Shuffle, Bell, Activity, Music, Check } from 'lucide-react';
import { getWisdomForSeason, getDailyWisdomInsight, SeasonalWisdom } from '../data/wisdom';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { NaturalVoiceSettings } from '../components/NaturalVoiceSettings';
import { BackupAndCloudSettings } from '../components/BackupAndCloudSettings';
import { DailyNudgesSettings } from '../components/DailyNudgesSettings';
import { LanguagePicker } from '../components/LanguagePicker';
import { useT } from '../i18n';

/* ----------------------------- Local primitives ----------------------------- */

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} className="space-y-3 scroll-mt-6">
    <h2 className="text-[15px] font-semibold text-[var(--fg)] px-1">{title}</h2>
    {children}
  </section>
);

const CardBox: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-[var(--bg-muted)] rounded-[var(--radius-md)] ${className}`}>{children}</div>
);

const Switch: React.FC<{ checked: boolean; onChange: () => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? 'bg-[var(--accent)]' : 'bg-[var(--border-strong)]'
    }`}
  >
    <span
      className={`pointer-events-none absolute top-0.5 left-0.5 inline-block h-6 w-6 rounded-full bg-[var(--bg)] transition-transform duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const ToggleRow: React.FC<{
  label: string;
  hint?: string;
  checked: boolean;
  onChange: () => void;
  divider?: boolean;
}> = ({ label, hint, checked, onChange, divider }) => (
  <div
    className={`flex items-center justify-between gap-4 min-h-[56px] px-4 py-3 ${
      divider ? 'border-t border-[var(--border)]' : ''
    }`}
  >
    <div className="min-w-0">
      <div className="text-[15px] text-[var(--fg)]">{label}</div>
      {hint && <div className="text-[13px] text-[var(--fg-muted)] mt-0.5 leading-snug">{hint}</div>}
    </div>
    <Switch checked={checked} onChange={onChange} label={label} />
  </div>
);

const TimeRow: React.FC<{
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  divider?: boolean;
}> = ({ id, label, hint, value, onChange, divider }) => (
  <div
    className={`flex items-center justify-between gap-4 min-h-[56px] px-4 py-3 ${
      divider ? 'border-t border-[var(--border)]' : ''
    }`}
  >
    <label htmlFor={id} className="min-w-0">
      <span className="block text-[15px] text-[var(--fg)]">{label}</span>
      {hint && <span className="block text-[13px] text-[var(--fg-muted)] mt-0.5 leading-snug">{hint}</span>}
    </label>
    <Input id={id} type="time" value={value} onChange={(e) => onChange(e.target.value)} className="w-32 h-11" />
  </div>
);

const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 h-11 px-4 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-transparent text-[var(--fg)] text-[14px] font-medium cursor-pointer transition-colors hover:bg-[var(--bg-inset)] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...props }) => (
  <button
    type="button"
    className={`inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--radius-sm)] bg-[var(--fg)] text-[var(--bg)] text-[15px] font-semibold cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </button>
);

/* --------------------------------- Page --------------------------------- */

export const Settings: React.FC = () => {
  const {
    data,
    updateProfile,
    setTheme,
    setSoundMuted,
    resetAllData,
    exportDataJson,
    showToast,
    simulateFocusTimerAlert,
    isSimulatingFocusAlert,
  } = useApp();
  const t = useT();

  const [displayName, setDisplayName] = useState(data?.profile.displayName || '');
  const [email, setEmail] = useState(data?.profile.email || '');
  const [reminderTime, setReminderTime] = useState(data?.profile.reminderTime || '09:00');
  const [currentTheme, setCurrentThemeState] = useState<'light' | 'dark'>(data?.profile.theme || 'light');
  const [soundMuted, setSoundMutedState] = useState<boolean>(data?.profile.soundMuted ?? false);
  const [dailyWisdomEnabled, setDailyWisdomEnabled] = useState<boolean>(data?.profile.dailyWisdomEnabled ?? true);
  const [dailyWisdomTime, setDailyWisdomTime] = useState<string>(data?.profile.dailyWisdomTime || '08:30');
  const [focusTabBlinkEnabled, setFocusTabBlinkEnabled] = useState<boolean>(data?.profile.focusTabBlinkEnabled ?? true);
  const [focusScreenPulseEnabled, setFocusScreenPulseEnabled] = useState<boolean>(
    data?.profile.focusScreenPulseEnabled ?? true
  );
  const [wisdomIndex, setWisdomIndex] = useState<number>(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [, setNotificationStatus] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (data?.profile.theme) setCurrentThemeState(data.profile.theme);
  }, [data?.profile.theme]);

  useEffect(() => {
    if (data?.profile.soundMuted !== undefined) setSoundMutedState(!!data.profile.soundMuted);
  }, [data?.profile.soundMuted]);

  useEffect(() => {
    if (data?.profile.focusTabBlinkEnabled !== undefined) setFocusTabBlinkEnabled(data.profile.focusTabBlinkEnabled);
  }, [data?.profile.focusTabBlinkEnabled]);

  useEffect(() => {
    if (data?.profile.focusScreenPulseEnabled !== undefined)
      setFocusScreenPulseEnabled(data.profile.focusScreenPulseEnabled);
  }, [data?.profile.focusScreenPulseEnabled]);

  if (!data) return null;

  const activeSeason = data.activeSeason;
  const seasonalWisdomPool = getWisdomForSeason(activeSeason?.id);
  const currentWisdom: SeasonalWisdom =
    seasonalWisdomPool[wisdomIndex % seasonalWisdomPool.length] || getDailyWisdomInsight(activeSeason?.id, wisdomIndex);

  const handleSelectTheme = async (selectedTheme: 'light' | 'dark') => {
    setCurrentThemeState(selectedTheme);
    await setTheme(selectedTheme);
  };

  const handleToggleSound = async () => {
    const nextMuted = !soundMuted;
    setSoundMutedState(nextMuted);
    await setSoundMuted(nextMuted);
  };

  const requireSound = () => {
    if (soundMuted) {
      showToast(t('Sounds are muted. Turn them on to test.'), 'info');
      return false;
    }
    return true;
  };

  const handleTestTapChime = () => {
    if (!requireSound()) return;
    soundSynthesizer.playTapChime();
    showToast(t('Played tap sound.'), 'info');
  };

  const handleTestCompletionSound = () => {
    if (!requireSound()) return;
    soundSynthesizer.playFocusCompleteChime();
    showToast(t('Played completion sound.'), 'info');
  };

  const handleTestCategoryCue = (category: string) => {
    if (!requireSound()) return;
    soundSynthesizer.playMicroHabitCue(category, 'complete');
    showToast(t('Played {category} habit cue.', { category: t(category) }), 'info');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName: displayName.trim(),
      email: email.trim(),
      reminderTime,
      theme: currentTheme,
      soundMuted,
      focusTabBlinkEnabled,
      focusScreenPulseEnabled,
      dailyWisdomEnabled,
      dailyWisdomTime,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleShuffleWisdom = () => {
    soundSynthesizer.playTapChime();
    setWisdomIndex((prev) => prev + 1);
  };

  const handleTestNotification = async () => {
    soundSynthesizer.playSuccessChord();

    const fire = () => {
      new Notification(t('Daily wisdom: {theme}', { theme: t(currentWisdom.theme) }), {
        body: t('"{quote}" — {author}', { quote: t(currentWisdom.quote), author: t(currentWisdom.author) }),
        icon: publicAssetPath('brand/v3/oda-app-v3-192.png'),
      });
    };

    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          fire();
        } else if (Notification.permission === 'default') {
          const perm = await Notification.requestPermission();
          setNotificationStatus(perm);
          if (perm === 'granted') fire();
        }
      } catch {
        // ignore
      }
    }

    setIsPreviewModalOpen(true);
    showToast(t('Daily wisdom preview sent for {time}.', { time: dailyWisdomTime }), 'info');
  };

  const handleConfirmExport = () => {
    soundSynthesizer.playSuccessChord();
    exportDataJson();
    setIsExportConfirmOpen(false);
  };

  const handleHardReset = async () => {
    await resetAllData();
    setIsResetConfirmOpen(false);
  };

  const themeOptions: { key: 'light' | 'dark'; label: string; icon: typeof Sun }[] = [
    { key: 'light', label: t('Light'), icon: Sun },
    { key: 'dark', label: t('Dark'), icon: Moon },
  ];

  const habitCues: { category: string; label: string }[] = [
    { category: 'Health', label: t('Health') },
    { category: 'Learning', label: t('Learning') },
    { category: 'Discipline', label: t('Discipline') },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-[24px] font-semibold tracking-tight text-[var(--fg)]">{t('Settings')}</h1>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Profile */}
        <Section id="profile" title={t('Profile')}>
          <CardBox className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="block text-[13px] text-[var(--fg-muted)]">
                {t('Name')}
              </label>
              <Input
                id="profile-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-11 bg-[var(--bg)]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="profile-email" className="block text-[13px] text-[var(--fg-muted)]">
                {t('Email')}
              </label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-[var(--bg)]"
              />
            </div>
          </CardBox>
        </Section>

        {/* Language */}
        <Section id="language" title={t('Language')}>
          <CardBox className="p-5 space-y-3">
            <p className="text-[13px] text-[var(--fg-muted)] leading-snug">
              {t('Used across the whole app, including nudges and meditations.')}
            </p>
            <LanguagePicker variant="grid" />
          </CardBox>
        </Section>

        {/* Appearance */}
        <Section id="appearance" title={t('Appearance')}>
          <CardBox className="p-2">
            <div className="grid grid-cols-2 gap-2">
              {themeOptions.map((opt) => {
                const active = currentTheme === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleSelectTheme(opt.key)}
                    aria-pressed={active}
                    className={`h-12 rounded-[var(--radius-sm)] flex items-center justify-center gap-2 text-[15px] cursor-pointer transition-colors ${
                      active
                        ? 'bg-[var(--fg)] text-[var(--bg)] font-semibold'
                        : 'text-[var(--fg)] hover:bg-[var(--bg-inset)]'
                    }`}
                  >
                    <opt.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                    <span>{opt.label}</span>
                    {active && <Check className="w-4 h-4" strokeWidth={2} />}
                  </button>
                );
              })}
            </div>
          </CardBox>
        </Section>

        {/* Sound */}
        <Section id="sound" title={t('Sound')}>
          <CardBox>
            <ToggleRow
              label={t('Sounds')}
              hint={t('Taps, completions and session chimes.')}
              checked={!soundMuted}
              onChange={handleToggleSound}
            />
            <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2 border-t border-[var(--border)]">
              <SecondaryButton onClick={handleTestTapChime} disabled={soundMuted} className="mt-3">
                <Music className="w-[18px] h-[18px]" strokeWidth={1.8} />
                {t('Tap')}
              </SecondaryButton>
              <SecondaryButton onClick={handleTestCompletionSound} disabled={soundMuted} className="mt-3">
                {t('Completion')}
              </SecondaryButton>
              {habitCues.map((cue) => (
                <SecondaryButton
                  key={cue.category}
                  onClick={() => handleTestCategoryCue(cue.category)}
                  disabled={soundMuted}
                  className="mt-3"
                >
                  {cue.label}
                </SecondaryButton>
              ))}
            </div>
          </CardBox>
        </Section>

        {/* Focus alerts */}
        <Section id="focus" title={t('Focus alerts')}>
          <CardBox>
            <ToggleRow
              label={t('Blink the tab title')}
              hint={t('So you notice the end of a session from another tab.')}
              checked={focusTabBlinkEnabled}
              onChange={() => setFocusTabBlinkEnabled(!focusTabBlinkEnabled)}
            />
            <ToggleRow
              label={t('Pulse the screen edge')}
              hint={t('A soft glow around the screen when the timer ends.')}
              checked={focusScreenPulseEnabled}
              onChange={() => setFocusScreenPulseEnabled(!focusScreenPulseEnabled)}
              divider
            />
            <div className="px-4 py-3 border-t border-[var(--border)]">
              <SecondaryButton onClick={simulateFocusTimerAlert} disabled={isSimulatingFocusAlert}>
                <Activity className="w-[18px] h-[18px]" strokeWidth={1.8} />
                {isSimulatingFocusAlert ? t('Playing…') : t('Preview alert')}
              </SecondaryButton>
            </div>
          </CardBox>
        </Section>

        {/* Reminders */}
        <Section id="reminders" title={t('Reminders')}>
          <CardBox>
            <TimeRow
              id="profile-reminder"
              label={t('One Decision check-in')}
              hint={t('When your daily prompt appears.')}
              value={reminderTime}
              onChange={setReminderTime}
            />
            <ToggleRow
              label={t('Daily wisdom')}
              hint={t('One short insight a day, matched to your season.')}
              checked={dailyWisdomEnabled}
              onChange={() => setDailyWisdomEnabled(!dailyWisdomEnabled)}
              divider
            />
            {dailyWisdomEnabled && (
              <>
                <TimeRow
                  id="wisdom-time"
                  label={t('Wisdom time')}
                  value={dailyWisdomTime}
                  onChange={setDailyWisdomTime}
                  divider
                />
                <div className="px-4 py-4 border-t border-[var(--border)] space-y-3">
                  <p className="text-[15px] text-[var(--fg)] leading-relaxed">“{t(currentWisdom.quote)}”</p>
                  <p className="text-[13px] text-[var(--fg-muted)]">
                    {t(currentWisdom.author)} · {t(currentWisdom.theme)}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <SecondaryButton onClick={handleShuffleWisdom}>
                      <Shuffle className="w-[18px] h-[18px]" strokeWidth={1.8} />
                      {t('Another')}
                    </SecondaryButton>
                    <SecondaryButton onClick={handleTestNotification}>
                      <Bell className="w-[18px] h-[18px]" strokeWidth={1.8} />
                      {t('Preview')}
                    </SecondaryButton>
                  </div>
                </div>
              </>
            )}
          </CardBox>

          {/* Daily motivational nudges */}
          <DailyNudgesSettings />
        </Section>

        <div className="flex items-center justify-between gap-4">
          <span className="text-[13px] text-[var(--accent)]">{isSaved ? t('Saved.') : ''}</span>
          <PrimaryButton type="submit">{t('Save')}</PrimaryButton>
        </div>
      </form>

      {/* Meditation narration voice */}
      <Section id="voice" title={t('Voice')}>
        <NaturalVoiceSettings />
      </Section>

      {/* Backup, restore & cloud */}
      <Section id="backup" title={t('Backup & sync')}>
        <BackupAndCloudSettings />
      </Section>

      {/* Data */}
      <Section id="data" title={t('Data')}>
        <CardBox className="p-5 space-y-4">
          <p className="text-[13px] text-[var(--fg-muted)] leading-snug">
            {t('Everything is stored on this device. Export a full JSON copy any time.')}
          </p>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton onClick={() => setIsExportConfirmOpen(true)}>
              <Download className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {t('Export data')}
            </SecondaryButton>
            <SecondaryButton
              onClick={() => setIsResetConfirmOpen(true)}
              className="border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger-soft)]"
            >
              <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {t('Reset all data')}
            </SecondaryButton>
          </div>
        </CardBox>

        <div className="px-1 space-y-2 text-[12px] text-[var(--fg-subtle)] leading-relaxed">
          <p>{t('Dream Dollars (D$) are a simulation. They have no monetary value and cannot be exchanged or withdrawn.')}</p>
          <p>{t('Dream purchases are visual anchors. Real acquisition happens through your own action, as modelled in the Reality bridge.')}</p>
          <p>{t('Designed by Yahya. Your answers and reflections are never sold or shared.')}</p>
        </div>
      </Section>

      {/* Daily wisdom preview */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={t('Daily wisdom')}
        subtitle={t('Scheduled for {time}', { time: dailyWisdomTime })}
      >
        <div className="space-y-4">
          <p className="text-[15px] text-[var(--fg)] leading-relaxed">“{t(currentWisdom.quote)}”</p>
          <p className="text-[13px] text-[var(--fg-muted)]">{t(currentWisdom.author)}</p>
          <div className="bg-[var(--bg-muted)] rounded-[var(--radius-sm)] p-4 text-[13px] text-[var(--fg-muted)] space-y-1">
            <p className="text-[var(--fg)] font-medium">{t("Today's action")}</p>
            <p>{t(currentWisdom.actionPrompt)}</p>
          </div>
          <div className="flex justify-between items-center pt-2 gap-2">
            <SecondaryButton onClick={handleShuffleWisdom}>
              <Shuffle className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {t('Another')}
            </SecondaryButton>
            <PrimaryButton onClick={() => setIsPreviewModalOpen(false)}>{t('Done')}</PrimaryButton>
          </div>
        </div>
      </Modal>

      {/* Export confirmation */}
      <Modal
        isOpen={isExportConfirmOpen}
        onClose={() => setIsExportConfirmOpen(false)}
        title={t('Export data')}
        subtitle={t('Download a full JSON copy of your data')}
      >
        <div className="space-y-4">
          <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed">
            {t('Includes your notebook, journal, ledger ({n} entries), missions, habits, check-ins, dreams and preferences.', {
              n: data.transactions.length,
            })}
          </p>
          <p className="text-[13px] text-[var(--fg-subtle)] leading-relaxed">
            {t('The file is created in your browser and saved straight to your device. Nothing is uploaded.')}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <SecondaryButton onClick={() => setIsExportConfirmOpen(false)}>{t('Cancel')}</SecondaryButton>
            <PrimaryButton onClick={handleConfirmExport}>
              <Download className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {t('Download')}
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      {/* Reset confirmation */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title={t('Reset all data?')}
        subtitle={t('This cannot be undone.')}
      >
        <div className="space-y-4">
          <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed">
            {t('Your ledger, completed missions, custom dreams and Two Futures statements will be removed from this device.')}
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <SecondaryButton onClick={() => setIsResetConfirmOpen(false)}>{t('Cancel')}</SecondaryButton>
            <button
              type="button"
              onClick={handleHardReset}
              className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[var(--radius-sm)] bg-[var(--danger)] text-white text-[15px] font-semibold cursor-pointer hover:opacity-90"
            >
              {t('Reset everything')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
