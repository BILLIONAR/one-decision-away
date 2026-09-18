import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../store/useApp';
import { Card, Badge, Button } from './ui';
import {
  Quote,
  Sparkles,
  Shuffle,
  Heart,
  Copy,
  Check,
  Wind,
  Calendar,
  Layers,
  ChevronRight,
  Share2,
} from 'lucide-react';
import {
  Affirmation,
  CURATED_AFFIRMATIONS,
  getDailyAffirmation,
  getRandomAffirmation,
} from '../data/affirmations';
import { soundSynthesizer } from '../utils/soundSynthesizer';

const FAVORITES_STORAGE_KEY = 'mylife_favorite_affirmations';

export const DailyAffirmationWidget: React.FC<{ className?: string }> = ({ className = '' }) => {
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
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

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
      showToast('✨ Rolled new daily affirmation', 'info');
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
      showToast('Removed quote from saved favorites', 'info');
    } else {
      next = [...favorites, currentAffirmation.id];
      soundSynthesizer.playTapChime();
      showToast('❤️ Saved to your favorite mantras', 'success');
    }
    setFavorites(next);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    const text = `"${currentAffirmation.quote}" — ${currentAffirmation.author}\n\nDaily Focus: ${currentAffirmation.reflection}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundSynthesizer.playTapChime();
    showToast('Quote copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleBreath = () => {
    setIsBreathingMode((prev) => !prev);
    soundSynthesizer.playTapChime();
  };

  const categories = ['All', 'Mastery', 'Vision', 'Discipline', 'Agency', 'Peace', 'Compounding'];

  return (
    <Card
      padding="md"
      className={`border border-[var(--border)] bg-[var(--bg-elevated)] relative overflow-hidden transition-all duration-300 shadow-xs ${className}`}
    >
      {/* Decorative subtle background accents */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 dark:bg-amber-400/5 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border)] relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg)]">
                Daily Affirmation
              </span>
              <span className="text-[10px] text-[var(--fg-subtle)] font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedToday}
              </span>
            </div>
          </div>
        </div>

        {/* Right Controls: Category Pills / Shuffle / Favorite */}
        <div className="flex items-center gap-1.5">
          <Badge variant="subtle" className="text-[10px] py-0.5 px-2 font-medium">
            {currentAffirmation.category}
          </Badge>

          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isFavorited
                ? 'text-rose-500 bg-rose-500/10'
                : 'text-[var(--fg-subtle)] hover:text-rose-500 hover:bg-[var(--bg-muted)]'
            }`}
            title={isFavorited ? 'Remove from favorites' : 'Save to favorite mantras'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-full text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
            title="Copy quote"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleShuffle}
            disabled={isShuffling}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
            title="Roll a new random daily quote"
          >
            <Shuffle className={`w-3 h-3 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>Randomize</span>
          </button>
        </div>
      </div>

      {/* Main Quote Body */}
      <div className="pt-3.5 pb-2 relative z-10">
        {isBreathingMode ? (
          /* Guided Mindful Breath Overlay */
          <div className="py-4 text-center space-y-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-amber-500/20 p-4 animate-in fade-in">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest">
              <Wind className="w-4 h-4 animate-pulse" />
              <span>Mindful Affirmation Pause</span>
            </div>

            <div className="relative flex items-center justify-center my-3">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-1000 border-2 ${
                  breathPhase === 'Inhale'
                    ? 'scale-125 bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400'
                    : breathPhase === 'Hold'
                    ? 'scale-110 bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'scale-90 bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-xs font-bold">{breathPhase}</div>
                  <div className="text-sm font-mono font-extrabold">{breathCount}s</div>
                </div>
              </div>
            </div>

            <p className="text-xs italic text-[var(--fg-muted)] max-w-md mx-auto">
              "{currentAffirmation.quote}"
            </p>

            <button
              type="button"
              onClick={handleToggleBreath}
              className="text-[11px] text-[var(--fg-subtle)] hover:text-[var(--fg)] underline cursor-pointer"
            >
              Exit Breathing Mode
            </button>
          </div>
        ) : (
          /* Standard Inspiring Quote Display */
          <div className="space-y-2.5">
            <div className="flex gap-2.5 items-start">
              <Quote className="w-4 h-4 text-amber-500/50 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <blockquote className="text-sm sm:text-base font-serif italic text-[var(--fg)] leading-relaxed">
                  "{currentAffirmation.quote}"
                </blockquote>
                <div className="text-xs font-semibold text-[var(--fg-muted)] flex items-center gap-1.5">
                  <span>— {currentAffirmation.author}</span>
                </div>
              </div>
            </div>

            {/* Reflection & Action Prompt */}
            <div className="mt-2.5 pt-2.5 border-t border-[var(--border)]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="text-[11px] text-[var(--fg-muted)] flex items-center gap-1.5">
                <span className="font-bold text-amber-500 uppercase tracking-wider text-[10px]">
                  Daily Prompt:
                </span>
                <span className="line-clamp-1">{currentAffirmation.actionCue}</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleToggleBreath}
                  className="text-[11px] font-medium text-[var(--fg-subtle)] hover:text-amber-500 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Pause and breathe with this affirmation for 15 seconds"
                >
                  <Wind className="w-3 h-3" />
                  <span>Reflect</span>
                </button>

                {/* Quick Theme Selector Dropdown */}
                <select
                  aria-label="Filter category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="text-[11px] py-0.5 px-1.5 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--fg-muted)] focus:outline-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Themes' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
