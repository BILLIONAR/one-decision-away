import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { BookOpen, Sparkles, Plus, Feather } from 'lucide-react';
import { soundSynthesizer } from '../utils/soundSynthesizer';
import { useT } from '../i18n';

interface FloatingJournalButtonProps {
  className?: string;
}

export const FloatingJournalButton: React.FC<FloatingJournalButtonProps> = ({ className = '' }) => {
  const { openQuickJournal } = useApp();
  const t = useT();
  const [isHovered, setIsHovered] = useState(false);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform || '');

  const handleClick = () => {
    soundSynthesizer.playTapChime();
    openQuickJournal();
  };

  return (
    <div
      className={`fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-30 group select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip on Desktop Hover */}
      <div
        className={`absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-black/90 text-white text-xs rounded-[var(--radius-sm)] shadow-xl border border-white/10 pointer-events-none transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
          isHovered
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-1'
        }`}
      >
        <span className="font-semibold text-white">{t('Log Dream Journal Entry')}</span>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/15 rounded text-white/90 border border-white/20">
          {isMac ? '⌘K' : 'Ctrl+K'}
        </kbd>
      </div>

      {/* Floating Action Button */}
      <button
        type="button"
        id="home-floating-journal-btn"
        onClick={handleClick}
        aria-label={t('Instantly log Dream Journal entry')}
        className="relative flex items-center gap-2 px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-full bg-gradient-to-r from-[var(--color-slate)] via-[var(--color-slate)] to-[var(--color-coral)] text-white shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20 group-hover:border-white/40"
      >
        {/* Subtle Ambient Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-[var(--color-coral)] opacity-30 group-hover:opacity-60 blur-xs transition-opacity -z-10 animate-pulse" />

        {/* Icon with mini plus badge */}
        <div className="relative flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 transition-transform group-hover:rotate-6" />
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[var(--color-coral)] border-2 border-[var(--color-slate)] flex items-center justify-center text-[9px] font-black text-white">
            +
          </span>
        </div>

        {/* Label: shows on larger screens or expands smoothly */}
        <span className="text-xs sm:text-sm font-bold tracking-tight font-display whitespace-nowrap hidden sm:inline-block">
          {t('Quick Journal')}
        </span>
      </button>
    </div>
  );
};
