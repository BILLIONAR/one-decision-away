import React from 'react';

type LogoProps = { className?: string; title?: string };

/**
 * Brand v4 "Fork" (29 Sep 2026): a path splits in two and one branch is chosen.
 * The unchosen branch stays faint; the chosen one ends in a warm dot. Colours
 * follow the theme through CSS variables so the mark works on light and dark.
 */
const ForkPaths: React.FC = () => (
  <>
    <path d="M50 58 C50 47 39 44 32 38 C27.5 34 26 29.5 26 25" stroke="var(--logo-ink)" strokeOpacity=".28" strokeWidth="7" fill="none" strokeLinecap="round" />
    <path d="M50 88 V58 C50 47 61 44 68 38 C72.5 34 74 29.5 74 25" stroke="var(--logo-ink)" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="74" cy="21" r="7.5" fill="var(--logo-chosen)" />
  </>
);

export const LogoV4: React.FC<LogoProps> = ({ className = 'w-6 h-6', title }) => (
  <svg viewBox="0 0 100 100" className={`oda-logo-v4 ${className}`} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
    {title && <title>{title}</title>}
    <ForkPaths />
  </svg>
);

/** Stacked lockup (fits the existing vertical logo slots): the fork above the serif wordmark. */
export const LogoV4Lockup: React.FC<LogoProps> = ({ className = 'w-12 h-18', title = 'ODA' }) => (
  <svg viewBox="0 0 100 150" className={`oda-logo-v4 ${className}`} role="img" aria-label={title}>
    <ForkPaths />
    <text x="50" y="136" textAnchor="middle" fontSize="36" fontWeight="500" letterSpacing="1.5" fill="var(--logo-ink)" style={{ fontFamily: 'var(--font-editorial)', fontVariationSettings: "'opsz' 72" }}>ODA</text>
  </svg>
);
