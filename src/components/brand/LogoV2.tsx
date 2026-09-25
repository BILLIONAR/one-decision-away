import React from 'react';

type LogoProps = { className?: string; title?: string };

/**
 * Brand v2 (24 Sep 2026): a vector redraw of the C4 idea. You (the dot) stand
 * where the road splits: the square is the old, boxed-in pattern; the circle
 * is the life you choose. Colours follow the theme through CSS variables.
 */
const MarkPaths: React.FC = () => (
  <>
    <path d="M50 58 C50 44 60 40 67 35 C72.5 31 75 27 75 21" stroke="var(--logo-accent)" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M50 80 V58 C50 44 40 40 33 35 C27.5 31 25 27 25 21" stroke="var(--logo-ink)" strokeWidth="6" strokeLinecap="round" fill="none" />
    <rect x="16" y="9" width="18" height="18" rx="2" fill="var(--logo-ink)" />
    <circle cx="75" cy="18" r="10" fill="var(--logo-accent)" />
    <circle cx="50" cy="82" r="8" fill="var(--logo-ink)" />
  </>
);

export const LogoV2: React.FC<LogoProps> = ({ className = 'w-6 h-6', title }) => (
  <svg viewBox="0 0 100 100" className={`oda-logo-v2 ${className}`} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
    {title && <title>{title}</title>}
    <MarkPaths />
  </svg>
);

/** Stacked lockup: mark above a spaced editorial wordmark (fits the old C4 slots). */
export const LogoV2Lockup: React.FC<LogoProps> = ({ className = 'w-12 h-18', title = 'ODA' }) => (
  <svg viewBox="0 0 100 150" className={`oda-logo-v2 ${className}`} role="img" aria-label={title}>
    <MarkPaths />
    <text x="52" y="136" textAnchor="middle" fontSize="31" letterSpacing="4" fill="var(--logo-ink)" style={{ fontFamily: 'var(--font-editorial)' }}>ODA</text>
  </svg>
);
