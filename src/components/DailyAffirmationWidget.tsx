import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store/useApp';
import { Card } from './ui';
import { Shuffle, Heart, Copy, Check, Wind } from 'lucide-react';
import {
  Affirmation,
  getDailyAffirmation,
  getRandomAffirmation,
} from '../data/affirmations';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { useT, getSpeechLang } from '../i18n';

const FAVORITES_STORAGE_KEY = 'mylife_favorite_affirmations';

export const DailyAffirmationWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
  const t = useT();
  const { showToast } = useApp();

  // Daily quote as default, with capability to shuffle or switch category
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(() => getDailyAffirmation());
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isBreathingMode, setIsBreathingMode] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(4);

  // Bookmarked / favorited affirmation IDs in local storage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isFavorited = favorites.includes(currentAffirmation.id);

  // Formatted date string for "Today"
  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat(getSpeechLang(), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, [t]);

  // Breath pacing loop when breathing mode is activated
  useEffect(() => {
    if (!isBreathingMode) return;

    let count = 4;
    setBreathPhase('Inhale');
    setBreathCount(4);

    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        setBreathPhase((prev) => {
          if (prev === 'Inhale') return 'Hold';
          if (prev === 'Hold') return 'Exhale';
          return 'Inhale';
        });
        count = 4;
      }
      setBreathCount(count);
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingMode]);

  const handleShuffle = () => {
    setIsShuffling(true);
    soundSynthesizer.playTapChime();
    setTimeout(() => {
      const next = getRandomAffirmation(currentAffirmation.id, selectedCategory);
      setCurrentAffirmation(next);
      setIsShuffling(false);
      showToast(t('✨ Rolled new daily affirmation'), 'info');
    }, 250);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const next = getRandomAffirmation(undefined, category);
    setCurrentAffirmation(next);
    soundSynthesizer.playTapChime();
  };

  const handleToggleFavorite = () => {
    let next: string[];
    if (isFavorited) {
      next = favorites.filter((id) => id !== currentAffirmation.id);
      showToast(t('Removed quote from saved favorites'), 'info');
    } else {
      next = [...favorites, currentAffirmation.id];
      soundSynthesizer.playTapChime();
      showToast(t('❤️ Saved to your favorite mantras'), 'success');
    }
    setFavorites(next);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    const text = `"${t(currentAffirmation.quote)}" — ${currentAffirmation.author}\n\n${t('Daily Focus: {reflection}', { reflection: t(currentAffirmation.reflection) })}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundSynthesizer.playTapChime();
    showToast(t('Quote copied to clipboard'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBreath = () => {
    setIsBreathingMode((prev) => !prev);
    soundSynthesizer.playTapChime();
  };

  const categories = ['All', 'Mastery', 'Vision', 'Discipline', 'Agency', 'Peace', 'Compounding'];

  const iconBtn =
    'w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-inset)]';

  return (
    <Card padding="md" className={`space-y-4 ${className}`}>
      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-[var(--fg)]">{t('Affirmation')}</h3>
          <p className="text-[13px] text-[var(--fg-muted)]">{formattedToday}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`${iconBtn} ${isFavorited ? 'text-[var(--accent)]' : ''}`}
            aria-label={isFavorited ? t('Remove from favorites') : t('Save to favorite mantras')}
            title={isFavorited ? t('Remove from favorites') : t('Save to favorite mantras')}
          >
            <Heart className={`w-[18px] h-[18px] ${isFavorited ? 'fill-current' : ''}`} strokeWidth={1.8} />
          </button>
          <button type="button" onClick={handleCopy} className={iconBtn} aria-label={t('Copy quote')} title={t('Copy quote')}>
            {copied ? (
              <Check className="w-[18px] h-[18px] text-[var(--accent)]" strokeWidth={1.8} />
            ) : (
              <Copy className="w-[18px] h-[18px]" strokeWidth={1.8} />
            )}
          </button>
          <button
            type="button"
            onClick={handleShuffle}
            disabled={isShuffling}
            className={iconBtn}
            aria-label={t('New quote')}
            title={t('New quote')}
          >
            <Shuffle className={`w-[18px] h-[18px] ${isShuffling ? 'animate-spin' : ''}`} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {isBreathingMode ? (
        /* Guided breath */
        <div className="py-6 text-center space-y-4 bg-[var(--bg)] rounded-[var(--radius-sm)] animate-in fade-in">
          <div className="flex items-center justify-center gap-2 text-[13px] font-medium text-[var(--fg-muted)]">
            <Wind className="w-4 h-4" strokeWidth={1.8} />
            <span>{t('Breathe with it')}</span>
          </div>

          <div className="relative flex items-center justify-center py-3">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-transform duration-1000 bg-[var(--accent-soft)] text-[var(--accent)] ${
                breathPhase === 'Inhale' ? 'scale-125' : breathPhase === 'Hold' ? 'scale-110' : 'scale-90'
              }`}
            >
              <div className="text-center">
                <div className="text-[13px] font-medium">{t(breathPhase)}</div>
                <div className="text-[18px] font-semibold tabular-nums">{breathCount}s</div>
              </div>
            </div>
          </div>

          <p className="text-[14px] text-[var(--fg-muted)] max-w-md mx-auto px-4">{t(currentAffirmation.quote)}</p>

          <button
            type="button"
            onClick={handleToggleBreath}
            className="h-10 px-4 text-[13px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer"
          >
            {t('Done')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <blockquote className="text-[17px] font-medium text-[var(--fg)] leading-snug tracking-tight">
              {t(currentAffirmation.quote)}
            </blockquote>
            <div className="text-[13px] text-[var(--fg-muted)] mt-2">{currentAffirmation.author}</div>
          </div>

          <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed">{t(currentAffirmation.actionCue)}</p>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleToggleBreath}
              className="h-10 px-3 -ml-3 text-[13px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] flex items-center gap-1.5 transition-colors cursor-pointer"
              title={t('Pause and breathe with this affirmation for 15 seconds')}
            >
              <Wind className="w-4 h-4" strokeWidth={1.8} />
              <span>{t('Breathe')}</span>
            </button>

            <select
              aria-label={t('Filter category')}
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="h-10 text-[13px] px-3 rounded-[var(--radius-sm)] bg-[var(--bg)] text-[var(--fg-muted)] focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? t('All themes') : t(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </Card>
  );
};
