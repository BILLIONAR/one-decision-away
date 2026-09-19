import React, { useState, useEffect } from 'react';
import { useApp } from '../store/useApp';
import {
  PageHeader,
  Button,
  Card,
  Field,
  Input,
  Badge,
  Modal,
  Disclaimer,
} from '../components/ui';
import {
  Download,
  Trash2,
  Save,
  Shield,
  Clock,
  User,
  AlertTriangle,
  Sparkles,
  Bell,
  Compass,
  Shuffle,
  Quote,
  CheckCircle2,
  Volume2,
  VolumeX,
  Music,
  Lightbulb,
  Sun,
  Moon,
  Palette,
  Check,
  FileJson,
  Database,
  Activity,
  Monitor,
  Eye,
} from 'lucide-react';
import { getWisdomForSeason, getDailyWisdomInsight, SeasonalWisdom } from '../data/wisdom';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { NaturalVoiceSettings } from '../components/NaturalVoiceSettings';
import { BackupAndCloudSettings } from '../components/BackupAndCloudSettings';
import { DailyNudgesSettings } from '../components/DailyNudgesSettings';
import { LanguagePicker } from '../components/LanguagePicker';
import { Languages } from 'lucide-react';
import { useT } from '../i18n';

export const Settings: React.FC = () => {
  const {
    data,
    updateProfile,
    toggleTheme,
    setTheme,
    toggleSoundMute,
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
  const [currentTheme, setCurrentThemeState] = useState<'light' | 'dark'>(
    data?.profile.theme || 'light'
  );
  const [soundMuted, setSoundMutedState] = useState<boolean>(
    data?.profile.soundMuted ?? false
  );
  const [dailyWisdomEnabled, setDailyWisdomEnabled] = useState<boolean>(
    data?.profile.dailyWisdomEnabled ?? true
  );
  const [dailyWisdomTime, setDailyWisdomTime] = useState<string>(
    data?.profile.dailyWisdomTime || '08:30'
  );
  const [focusTabBlinkEnabled, setFocusTabBlinkEnabled] = useState<boolean>(
    data?.profile.focusTabBlinkEnabled ?? true
  );
  const [focusScreenPulseEnabled, setFocusScreenPulseEnabled] = useState<boolean>(
    data?.profile.focusScreenPulseEnabled ?? true
  );
  const [wisdomIndex, setWisdomIndex] = useState<number>(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (data?.profile.theme) {
      setCurrentThemeState(data.profile.theme);
    }
  }, [data?.profile.theme]);

  useEffect(() => {
    if (data?.profile.soundMuted !== undefined) {
      setSoundMutedState(!!data.profile.soundMuted);
    }
  }, [data?.profile.soundMuted]);

  useEffect(() => {
    if (data?.profile.focusTabBlinkEnabled !== undefined) {
      setFocusTabBlinkEnabled(data.profile.focusTabBlinkEnabled);
    }
  }, [data?.profile.focusTabBlinkEnabled]);

  useEffect(() => {
    if (data?.profile.focusScreenPulseEnabled !== undefined) {
      setFocusScreenPulseEnabled(data.profile.focusScreenPulseEnabled);
    }
  }, [data?.profile.focusScreenPulseEnabled]);

  if (!data) return null;

  const activeSeason = data.activeSeason;
  const seasonalWisdomPool = getWisdomForSeason(activeSeason?.id);
  const currentWisdom: SeasonalWisdom =
    seasonalWisdomPool[wisdomIndex % seasonalWisdomPool.length] ||
    getDailyWisdomInsight(activeSeason?.id, wisdomIndex);

  const handleSelectTheme = async (selectedTheme: 'light' | 'dark') => {
    setCurrentThemeState(selectedTheme);
    await setTheme(selectedTheme);
  };

  const handleToggleSound = async () => {
    const nextMuted = !soundMuted;
    setSoundMutedState(nextMuted);
    await setSoundMuted(nextMuted);
  };

  const handleTestTapChime = () => {
    if (soundMuted) {
      showToast(t('🔇 Sounds are currently muted. Unmute to test audio.'), 'info');
      return;
    }
    soundSynthesizer.playTapChime();
    showToast(t('✨ Played tactile tap chime.'), 'info');
  };

  const handleTestCompletionSound = () => {
    if (soundMuted) {
      showToast(t('🔇 Sounds are currently muted. Unmute to test audio.'), 'info');
      return;
    }
    soundSynthesizer.playFocusCompleteChime();
    showToast(t('🎉 Played victory completion chord.'), 'info');
  };

  const handleTestCategoryCue = (category: string, name: string) => {
    if (soundMuted) {
      showToast(t('🔇 Sounds are currently muted. Unmute to test audio.'), 'info');
      return;
    }
    soundSynthesizer.playMicroHabitCue(category, 'complete');
    showToast(t('🎵 Tested {name} cue ({category} habit).', { name, category: t(category) }), 'info');
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
    
    // Attempt real browser notification if supported and granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(t('Daily Wisdom: {theme}', { theme: t(currentWisdom.theme) }), {
            body: t('"{quote}" — {author}', { quote: t(currentWisdom.quote), author: t(currentWisdom.author) }),
            icon: '/favicon.ico',
          });
        } catch (err) {
          // ignore fallback
        }
      } else if (Notification.permission === 'default') {
        try {
          const perm = await Notification.requestPermission();
          setNotificationStatus(perm);
          if (perm === 'granted') {
            new Notification(t('Daily Wisdom: {theme}', { theme: t(currentWisdom.theme) }), {
              body: t('"{quote}" — {author}', { quote: t(currentWisdom.quote), author: t(currentWisdom.author) }),
              icon: '/favicon.ico',
            });
          }
        } catch (err) {
          // ignore fallback
        }
      }
    }

    setIsPreviewModalOpen(true);
    showToast(t('🔔 Daily Wisdom simulated for {time}!', { time: dailyWisdomTime }), 'info');
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

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={t('Settings & Privacy')}
        subtitle={t('Manage your profile, daily cadence, data sovereignty, and security.')}
      />

      {/* Profile & Cadence */}
      <Card padding="lg" className="space-y-6 bg-[var(--bg-elevated)]">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <User className="w-4 h-4 text-[var(--color-sage)]" />
          <h3 className="font-display font-bold text-base text-[var(--fg)]">
            {t('User Profile & Routine')}
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field id="profile-name" label={t('Display Name')} required>
              <Input
                id="profile-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </Field>

            <Field id="profile-email" label={t('Email Address')}>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
          </div>

          {/* Language Section */}
          <div className="pt-4 border-t border-[var(--border)] space-y-3">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-[var(--color-sage)]" />
              <span className="font-display font-bold text-sm text-[var(--fg)]">{t('Language')}</span>
            </div>
            <p className="text-xs text-[var(--fg-muted)] leading-relaxed max-w-lg">
              {t('Choose the language for the whole app — menus, missions, meditations and daily nudges.')}
            </p>
            <LanguagePicker variant="grid" />
          </div>

          {/* Appearance & Aesthetic Theme Section */}
          <div className="pt-4 border-t border-[var(--border)] space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[var(--color-sage)]" />
                  <span className="font-display font-bold text-sm text-[var(--fg)]">
                    {t('Appearance & Aesthetic Theme')}
                  </span>
                  <Badge variant={currentTheme === 'dark' ? 'slate' : 'sage'} className="text-[10px] py-0 px-2">
                    {currentTheme === 'dark' ? t('Midnight Dark') : t('Editorial Light')}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed max-w-lg">
                  {t('Switch between the warm ivory Editorial paper format and the high-contrast Midnight dark atmosphere.')}
                </p>
              </div>

              {/* Quick Switch Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg)] hover:bg-[var(--bg-muted)] border border-[var(--border)] text-xs font-semibold text-[var(--fg)] transition-all cursor-pointer shadow-xs"
                title={currentTheme === 'dark' ? t('Switch to Editorial Light') : t('Switch to Midnight Dark')}
              >
                {currentTheme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('Editorial')}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[var(--fg-muted)]" />
                    <span>{t('Midnight')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Theme Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Editorial Light Option */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelectTheme('light')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelectTheme('light');
                }}
                className={`p-4 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  currentTheme === 'light'
                    ? 'border-[var(--fg)] ring-1 ring-[var(--fg)] bg-[#FAF8F5] text-[#1A1A1A] shadow-sm'
                    : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--fg-muted)] opacity-85 hover:opacity-100'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#F5F2ED] border border-[#1A1A1A]/20 flex items-center justify-center text-[#1A1A1A]">
                        <Sun className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <span className="font-display font-bold text-sm text-[#1A1A1A]">
                        {t('Editorial Light')}
                      </span>
                    </div>
                    {currentTheme === 'light' ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4E6B56] text-white">
                        <Check className="w-3 h-3" /> {t('Active')}
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider text-[#767676] font-semibold">
                        {t('Select')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#4A4A4A] leading-relaxed">
                    {t('Warm ivory paper canvas with high-contrast serif typography and refined hairline borders.')}
                  </p>

                  {/* Visual Theme Palette Swatch Preview */}
                  <div className="p-2.5 rounded-[var(--radius-sm)] bg-[#F5F2ED] border border-[#1A1A1A]/10 space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] text-[#767676] uppercase tracking-widest font-bold">
                      <span>{t('Paper Swatch')}</span>
                      <span className="text-[#4E6B56]">#F5F2ED</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 flex-1 rounded-xs bg-[#1A1A1A] flex items-center px-1.5">
                        <span className="text-[8px] text-[#F5F2ED] font-mono">{t('Ink #1A1A1A')}</span>
                      </div>
                      <div className="h-4 w-12 rounded-xs bg-[#4E6B56] flex items-center justify-center">
                        <span className="text-[8px] text-white font-mono">{t('Sage')}</span>
                      </div>
                      <div className="h-4 w-12 rounded-xs bg-[#B8533C] flex items-center justify-center">
                        <span className="text-[8px] text-white font-mono">{t('Coral')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Midnight Dark Option */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleSelectTheme('dark')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelectTheme('dark');
                }}
                className={`p-4 rounded-[var(--radius-md)] border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  currentTheme === 'dark'
                    ? 'border-[#F6F7F9] ring-1 ring-[#F6F7F9] bg-[#15171A] text-[#F6F7F9] shadow-md'
                    : 'border-[var(--border)] bg-[var(--bg)] hover:border-[var(--fg-muted)] opacity-85 hover:opacity-100'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#0C0D0E] border border-white/20 flex items-center justify-center text-[#F6F7F9]">
                        <Moon className="w-3.5 h-3.5 text-sky-400" />
                      </div>
                      <span className="font-display font-bold text-sm text-[#F6F7F9]">
                        {t('Midnight Dark')}
                      </span>
                    </div>
                    {currentTheme === 'dark' ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#5EA878] text-black">
                        <Check className="w-3 h-3" /> {t('Active')}
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-wider text-[var(--fg-subtle)] font-semibold">
                        {t('Select')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#B8BCC6] leading-relaxed">
                    {t('Deep obsidian black background with luminous typography and high-contrast emerald accents.')}
                  </p>

                  {/* Visual Theme Palette Swatch Preview */}
                  <div className="p-2.5 rounded-[var(--radius-sm)] bg-[#0C0D0E] border border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] text-[#7A808C] uppercase tracking-widest font-bold">
                      <span>{t('Obsidian Swatch')}</span>
                      <span className="text-[#5EA878]">#0C0D0E</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 flex-1 rounded-xs bg-[#F6F7F9] flex items-center px-1.5">
                        <span className="text-[8px] text-[#0C0D0E] font-mono font-bold">{t('Luminous')}</span>
                      </div>
                      <div className="h-4 w-12 rounded-xs bg-[#5EA878] flex items-center justify-center">
                        <span className="text-[8px] text-black font-mono font-bold">{t('Sage')}</span>
                      </div>
                      <div className="h-4 w-12 rounded-xs bg-[#E05D4A] flex items-center justify-center">
                        <span className="text-[8px] text-white font-mono">{t('Coral')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Field
            id="profile-reminder"
            label={t('Daily One Decision Reflection Time')}
            helper={t('The hour when your daily focus checkpoint prompt appears.')}
          >
            <Input
              id="profile-reminder"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-48"
            />
          </Field>

          {/* Daily Wisdom Notification Section */}
          <div className="pt-4 border-t border-[var(--border)] space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--color-coral)]" />
                  <span className="font-display font-bold text-sm text-[var(--fg)]">
                    {t('Daily Wisdom Notifications')}
                  </span>
                  <Badge variant="coral" className="text-[10px] py-0 px-2">
                    {t('Seasonal Focus')}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed max-w-lg">
                  {t('Receive a curated motivational insight, mental model, and action prompt aligned with your active 30-day season.')}
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={dailyWisdomEnabled}
                onClick={() => setDailyWisdomEnabled(!dailyWisdomEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dailyWisdomEnabled ? 'bg-[var(--color-sage)]' : 'bg-[var(--bg-muted)] border-[var(--border)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    dailyWisdomEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Time Picker & Active Season Insight Card when enabled */}
            {dailyWisdomEnabled && (
              <div className="space-y-3.5 pl-0 sm:pl-6 border-l-2 border-[var(--color-sage)]/30 mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--bg)] p-3 rounded-[var(--radius-md)] border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--fg-muted)]" />
                    <div>
                      <label htmlFor="wisdom-time" className="text-xs font-bold text-[var(--fg)] block">
                        {t('Wisdom Delivery Time')}
                      </label>
                      <span className="text-[10px] text-[var(--fg-subtle)]">
                        {t('Scheduled local morning delivery')}
                      </span>
                    </div>
                  </div>
                  <Input
                    id="wisdom-time"
                    type="time"
                    value={dailyWisdomTime}
                    onChange={(e) => setDailyWisdomTime(e.target.value)}
                    className="w-40 text-xs"
                  />
                </div>

                {/* Seasonal Curated Insight Card */}
                <div className="bg-[var(--bg)] p-4 rounded-[var(--radius-md)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-[var(--fg)] flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                        {activeSeason ? t(activeSeason.title) : t('Sovereign Vision (General)')}
                      </span>
                      <span className="text-[10px] text-[var(--color-sage)] bg-[var(--color-sage)]/10 px-2 py-0.5 rounded-[var(--radius-xs)] font-semibold">
                        {t(currentWisdom.theme)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleShuffleWisdom}
                        className="text-[11px] text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center gap-1 px-2 py-1 rounded-[var(--radius-xs)] bg-[var(--bg-elevated)] border border-[var(--border)] transition-colors cursor-pointer"
                        title={t('Shuffle to next curated seasonal insight')}
                      >
                        <Shuffle className="w-3 h-3" />
                        <span>{t('Shuffle')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleTestNotification}
                        className="text-[11px] text-[var(--color-coral)] hover:underline flex items-center gap-1 px-2 py-1 rounded-[var(--radius-xs)] bg-[var(--color-coral)]/10 border border-[var(--color-coral)]/20 transition-colors font-medium cursor-pointer"
                        title={t('Preview sample notification')}
                      >
                        <Bell className="w-3 h-3" />
                        <span>{t('Test Alert')}</span>
                      </button>
                    </div>
                  </div>

                  {/* Motivational Quote */}
                  <div className="relative pl-6 py-1">
                    <Quote className="w-4 h-4 text-[var(--fg-subtle)] absolute left-0 top-1.5 opacity-60" />
                    <p className="text-xs font-display font-semibold text-[var(--fg)] italic leading-relaxed">
                      "{t(currentWisdom.quote)}"
                    </p>
                    <span className="text-[10px] text-[var(--fg-subtle)] block mt-1">
                      — {t(currentWisdom.author)}
                    </span>
                  </div>

                  {/* Principle & Action Prompt */}
                  <div className="pt-2 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                    <div className="space-y-1">
                      <span className="font-bold text-[var(--fg-muted)] flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" /> {t('Core Principle')}
                      </span>
                      <p className="text-[var(--fg-subtle)] leading-snug">
                        {t(currentWisdom.principle)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-[var(--fg-muted)] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[var(--color-sage)]" /> {t('Actionable Anchor')}
                      </span>
                      <p className="text-[var(--fg-subtle)] leading-snug">
                        {t(currentWisdom.actionPrompt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Focus Session Timer 0 Visual Alerts Section */}
          <div className="pt-4 border-t border-[var(--border)] space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--color-sage)]" />
                <span className="font-display font-bold text-sm text-[var(--fg)]">
                  {t('Focus Timer Completion Visual Alerts')}
                </span>
                <Badge variant="sage" className="text-[10px] py-0 px-2">
                  {t('Timer = 0 Alerts')}
                </Badge>
              </div>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed max-w-lg">
                {t('Choose ambient visual alerts to notify you the instant a focus session timer finishes, keeping you aware without sudden jarring interruptions.')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Option 1: Browser Tab Title Blink */}
              <div className="p-3.5 bg-[var(--bg)] rounded-[var(--radius-md)] border border-[var(--border)] flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--color-sage)]/10 text-[var(--color-sage)] flex items-center justify-center shrink-0">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[var(--fg)]">
                        {t('Browser Tab Title Blink')}
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-label={t('Toggle Browser Tab Title Blink Animation')}
                      aria-checked={focusTabBlinkEnabled}
                      onClick={() => setFocusTabBlinkEnabled(!focusTabBlinkEnabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        focusTabBlinkEnabled ? 'bg-[var(--color-sage)]' : 'bg-[var(--bg-muted)] border-[var(--border)]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          focusTabBlinkEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--fg-subtle)] leading-relaxed">
                    {t('Alternates the browser tab title (e.g.')} <span className="font-mono text-[10px] text-[var(--color-sage)]">{t('✨ [Finished!]')}</span> ⇄ <span className="font-mono text-[10px] text-[var(--color-coral)]">{t("🔔 TIME'S UP!")}</span>) {t('when the timer reaches 0 so you see it from any tab.')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-[var(--fg-muted)]">
                  <span className={`w-1.5 h-1.5 rounded-full ${focusTabBlinkEnabled ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
                  <span>{t('Status: {status}', { status: focusTabBlinkEnabled ? t('Blink Animation Enabled') : t('Static Title') })}</span>
                </div>
              </div>

              {/* Option 2: Screen Border Pulse */}
              <div className="p-3.5 bg-[var(--bg)] rounded-[var(--radius-md)] border border-[var(--border)] flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--color-coral)]/10 text-[var(--color-coral)] flex items-center justify-center shrink-0">
                        <Monitor className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[var(--fg)]">
                        {t('Screen Edge Pulsing Border')}
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-label={t('Toggle Screen Edge Pulsing Border')}
                      aria-checked={focusScreenPulseEnabled}
                      onClick={() => setFocusScreenPulseEnabled(!focusScreenPulseEnabled)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        focusScreenPulseEnabled ? 'bg-[var(--color-coral)]' : 'bg-[var(--bg-muted)] border-[var(--border)]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          focusScreenPulseEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-[var(--fg-subtle)] leading-relaxed">
                    {t('Emits a subtle, glowing breathing pulse around the edges of your screen when the timer hits 0, providing a gentle optical alert.')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-[var(--fg-muted)]">
                  <span className={`w-1.5 h-1.5 rounded-full ${focusScreenPulseEnabled ? 'bg-[var(--color-coral)] animate-pulse' : 'bg-gray-400'}`} />
                  <span>{t('Status: {status}', { status: focusScreenPulseEnabled ? t('Edge Pulse Alert Enabled') : t('No Screen Glow') })}</span>
                </div>
              </div>
            </div>

            {/* Live Interactive Simulator */}
            <div className="bg-[var(--bg-elevated)] p-3 rounded-[var(--radius-md)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[var(--fg)]">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {t('Test how the tab title blink and screen border pulse look when a session finishes.')}
                </span>
              </div>

              <button
                type="button"
                onClick={simulateFocusTimerAlert}
                disabled={isSimulatingFocusAlert}
                className={`text-xs px-3 py-1.5 rounded-[var(--radius-sm)] border font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSimulatingFocusAlert
                    ? 'bg-[var(--color-coral)] text-white border-[var(--color-coral)] animate-pulse'
                    : 'bg-[var(--bg)] border-[var(--border-strong)] text-[var(--fg)] hover:border-[var(--color-sage)]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{isSimulatingFocusAlert ? t('Alert Playing (5s)...') : t('Simulate Timer 0 Alert')}</span>
              </button>
            </div>
          </div>

          {/* Sound & Audio Effects (Global Mute Sound) Section */}
          <div className="pt-4 border-t border-[var(--border)] space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {soundMuted ? (
                    <VolumeX className="w-4 h-4 text-[var(--color-coral)]" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[var(--color-sage)]" />
                  )}
                  <span className="font-display font-bold text-sm text-[var(--fg)]">
                    {t('Sound & Audio Effects')}
                  </span>
                  {soundMuted ? (
                    <Badge variant="coral" className="text-[10px] py-0 px-2">
                      {t('Muted')}
                    </Badge>
                  ) : (
                    <Badge variant="sage" className="text-[10px] py-0 px-2">
                      {t('Audio Enabled')}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[var(--fg-muted)] leading-relaxed max-w-lg">
                  {t('Globally control tactile tap chimes, celebratory completion fanfares, and session gongs. When muted, all interactive UI audio remains silent. Persists across sessions.')}
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-label={t('Toggle Mute Sound')}
                aria-checked={!soundMuted}
                onClick={handleToggleSound}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  !soundMuted ? 'bg-[var(--color-sage)]' : 'bg-[var(--bg-muted)] border-[var(--border)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    !soundMuted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sound Testing & Status Panel */}
            <div className="bg-[var(--bg)] p-3.5 rounded-[var(--radius-md)] border border-[var(--border)] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      soundMuted
                        ? 'bg-[var(--color-coral)]/10 text-[var(--color-coral)]'
                        : 'bg-[var(--color-sage)]/10 text-[var(--color-sage)]'
                    }`}
                  >
                    {soundMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--fg)]">
                      {soundMuted ? t('UI Sound Effects Muted') : t('UI Sound Effects Active')}
                    </div>
                    <div className="text-[10px] text-[var(--fg-subtle)]">
                      {soundMuted
                        ? t('Web Audio synthesizer output is disabled')
                        : t('Interactive synthesizer tones are operational')}
                    </div>
                  </div>
                </div>

                {/* Interactive Audio Tester Buttons */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={handleTestTapChime}
                      className={`text-xs px-2.5 py-1.5 rounded-[var(--radius-sm)] border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        soundMuted
                          ? 'bg-[var(--bg-muted)] border-[var(--border)] text-[var(--fg-subtle)] opacity-60'
                          : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--fg)] hover:border-[var(--color-sage)]'
                      }`}
                      title={soundMuted ? t('Unmute sound to test audio') : t('Test tactile tap chime')}
                    >
                      <Music className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                      <span>{t('Tap Chime')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestCompletionSound}
                      className={`text-xs px-2.5 py-1.5 rounded-[var(--radius-sm)] border font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        soundMuted
                          ? 'bg-[var(--bg-muted)] border-[var(--border)] text-[var(--fg-subtle)] opacity-60'
                          : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--fg)] hover:border-[var(--color-sage)]'
                      }`}
                      title={soundMuted ? t('Unmute sound to test audio') : t('Test victory fanfare')}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[var(--color-coral)]" />
                      <span>{t('Victory Chord')}</span>
                    </button>
                  </div>

                  {/* Micro-Habit Category Acoustic Cues */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-[var(--fg-subtle)] font-semibold">{t('Habit Cues:')}</span>
                    <button
                      type="button"
                      onClick={() => handleTestCategoryCue('Health', t('528Hz Vitality Bloom'))}
                      className={`text-[11px] px-2 py-1 rounded-[var(--radius-sm)] border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                        soundMuted
                          ? 'bg-[var(--bg-muted)] border-[var(--border)] text-[var(--fg-subtle)] opacity-60'
                          : 'bg-[var(--color-sage)]/10 border-[var(--color-sage)]/30 text-[var(--color-sage)] hover:bg-[var(--color-sage)]/20'
                      }`}
                      title={t('Health: 528Hz Solfeggio vitality bloom + heartbeat haptic')}
                    >
                      <span>{t('🌿 Health (528Hz)')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTestCategoryCue('Learning', t('Crystal Glissando'))}
                      className={`text-[11px] px-2 py-1 rounded-[var(--radius-sm)] border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                        soundMuted
                          ? 'bg-[var(--bg-muted)] border-[var(--border)] text-[var(--fg-subtle)] opacity-60'
                          : 'bg-[var(--color-navy)]/10 border-[var(--color-navy)]/30 text-[var(--color-navy)] hover:bg-[var(--color-navy)]/20'
                      }`}
                      title={t('Learning: Ascending crystalline 4-note glissando + double-tap haptic')}
                    >
                      <span>{t('📚 Learning (Glissando)')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTestCategoryCue('Discipline', t('Bedrock Anchor'))}
                      className={`text-[11px] px-2 py-1 rounded-[var(--radius-sm)] border font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                        soundMuted
                          ? 'bg-[var(--bg-muted)] border-[var(--border)] text-[var(--fg-subtle)] opacity-60'
                          : 'bg-[var(--color-coral)]/10 border-[var(--color-coral)]/30 text-[var(--color-coral)] hover:bg-[var(--color-coral)]/20'
                      }`}
                      title={t('Discipline: Resolute 330Hz strike with sub-weight & fifth + anchor haptic')}
                    >
                      <span>{t('🎯 Discipline (Anchor)')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--color-sage)] font-semibold">
              {isSaved ? t('Settings saved successfully.') : ''}
            </span>
            <Button variant="primary" type="submit" icon={Save}>
              {t('Save Preferences')}
            </Button>
          </div>
        </form>
      </Card>

      {/* Daily motivational nudges */}
      <DailyNudgesSettings />

      {/* Meditation narration voice */}
      <NaturalVoiceSettings />

      {/* Backup, restore & cloud */}
      <BackupAndCloudSettings />

      {/* Data Export & Local Storage */}
      <Card padding="lg" className="space-y-4 bg-[var(--bg-elevated)]">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <Download className="w-4 h-4 text-[var(--color-slate)]" />
          <h3 className="font-display font-bold text-base text-[var(--fg)]">
            {t('Data Sovereignty & Backup')}
          </h3>
        </div>

        <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
          {t('Your life data, journal reflections, Dream Bank ledger, and Two Futures statements are stored locally on your device. Export a complete JSON backup at any time.')}
        </p>

        <div className="pt-2">
          <Button
            variant="outline"
            icon={Download}
            onClick={() => setIsExportConfirmOpen(true)}
          >
            {t('Export My Complete Data (JSON)')}
          </Button>
        </div>
      </Card>

      {/* Danger Zone: Hard Account Reset */}
      <Card padding="lg" className="space-y-4 border border-[var(--color-coral)]/40 bg-[var(--accent-soft)]/10">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
          <Trash2 className="w-4 h-4 text-[var(--color-coral)]" />
          <h3 className="font-display font-bold text-base text-[var(--fg)]">
            {t('Reset Application Data')}
          </h3>
        </div>

        <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
          {t('Clears all transactions, completions, custom dream items, and resets the app state to default sample data. This action is irreversible.')}
        </p>

        <div>
          <Button
            variant="destructive"
            size="sm"
            icon={AlertTriangle}
            onClick={() => setIsResetConfirmOpen(true)}
          >
            {t('Reset All Application Data')}
          </Button>
        </div>
      </Card>

      {/* Complete Legal & Simulation Disclaimer */}
      <div className="p-4 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] space-y-2 text-[11px] text-[var(--fg-subtle)] leading-relaxed">
        <div className="font-bold text-[var(--fg)] text-xs">
          {t('Simulation & Privacy Disclosures')}
        </div>
        <p>
          1. <strong>{t('Virtual Currency:')}</strong> {t('"Dream Dollars" (D$) is a simulation currency. It possesses no monetary value, cannot be converted to fiat currency, cannot be traded, and cannot be withdrawn.')}
        </p>
        <p>
          2. <strong>{t('Physical Reality:')}</strong> {t('Purchases within the "Dream Market" and assets in "My Future Life" are visual and psychological anchors. Physical acquisition requires real-world execution as modeled in the Reality Bridge.')}
        </p>
        <p>
          3. <strong>{t('Data Privacy:')}</strong> {t('Built by AurelyStudio. Your responses to the Two Futures questions and daily mission reflections are never sold or shared.')}
        </p>
      </div>

      {/* Daily Wisdom Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={t('Daily Wisdom Notification Preview')}
        subtitle={t('Scheduled for {time} · Aligned with {season}', { time: dailyWisdomTime, season: activeSeason ? t(activeSeason.title) : t('Active Season') })}
      >
        <div className="space-y-4 pt-1">
          <div className="p-4 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-3 shadow-inner">
            <div className="flex items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
              <span className="text-[11px] font-bold text-[var(--color-sage)] flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                {t('Scheduled at {time}', { time: dailyWisdomTime })}
              </span>
              <Badge variant="coral" className="text-[10px]">
                {t(currentWisdom.theme)}
              </Badge>
            </div>

            <p className="text-sm font-display font-bold text-[var(--fg)] italic leading-relaxed">
              "{t(currentWisdom.quote)}"
            </p>
            <span className="text-xs text-[var(--fg-muted)] block">
              — {t(currentWisdom.author)}
            </span>

            <div className="p-2.5 rounded bg-[var(--bg-elevated)] border border-[var(--border)] text-xs text-[var(--fg-muted)] space-y-1">
              <strong className="text-[var(--fg)] block font-semibold">{t("Today's Focus Anchor:")}</strong>
              <p>{t(currentWisdom.actionPrompt)}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Shuffle}
              onClick={handleShuffleWisdom}
            >
              {t('Shuffle Next')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsPreviewModalOpen(false)}
            >
              {t('Got It')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Confirmation Modal */}
      <Modal
        isOpen={isExportConfirmOpen}
        onClose={() => setIsExportConfirmOpen(false)}
        title={t('Confirm Data Export')}
        subtitle={t('Export and download your complete local workspace snapshot')}
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
            {t('Are you sure you want to download a full JSON backup of your One Decision Life OS workspace?')}
          </p>

          {/* Backup Contents Summary */}
          <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[var(--fg)] border-b border-[var(--border)] pb-2">
              <span className="flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5 text-[var(--color-sage)]" />
                {t('Backup Contents Overview')}
              </span>
              <span className="text-[10px] font-mono text-[var(--fg-subtle)]">
                {t('.json format')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--fg-muted)]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[var(--color-sage)] shrink-0" />
                <span>{t('Two Futures Statements')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[var(--color-sage)] shrink-0" />
                <span>{t('Dream Bank Ledger ({n} items)', { n: data.transactions.length })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[var(--color-sage)] shrink-0" />
                <span>{t('Daily Missions & Habits')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[var(--color-sage)] shrink-0" />
                <span>{t('Check-ins & Mood Logs')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[var(--color-sage)] shrink-0" />
                <span>{t('Dream Market & Visions')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-[var(--color-sage)] shrink-0" />
                <span>{t('Profile & Preferences')}</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] text-[11px] text-[var(--fg-subtle)] leading-snug">
            <span className="font-semibold text-[var(--fg)]">{t('Privacy Note:')} </span>
            {t('This file is packaged locally inside your browser and downloaded straight to your machine. No external servers or analytics track your backup.')}
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExportConfirmOpen(false)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleConfirmExport}
            >
              {t('Confirm & Download JSON')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title={t('Confirm Account Reset')}
        subtitle={t('Are you sure you want to reset all data?')}
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
            {t('This will permanently wipe your Dream Bank ledger, completed missions history, custom items, and Two Futures statements from your local device.')}
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsResetConfirmOpen(false)}>
              {t('Cancel')}
            </Button>
            <Button variant="destructive" onClick={handleHardReset}>
              {t('Yes, Reset Everything')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

