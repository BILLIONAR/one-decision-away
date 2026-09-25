import React from 'react';

type LogoProps = { className?: string; title?: string };

/**
 * Brand v3 (25 Sep 2026): an open door. "Oda" means room in Turkish, and one
 * decision is the step across the threshold; the burgundy leaf is the door
 * already opening. Colours follow the theme through CSS variables.
 */
const DoorPaths: React.FC = () => (
  <>
    <path d="M49 84 V31.5 C57 32.5 63 37 65.5 44 V84 Z" fill="var(--logo-accent)" />
    <path d="M30 84 V46 A20 20 0 0 1 70 46 V84" stroke="var(--logo-ink)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M18 84 H82" stroke="var(--logo-ink)" strokeWidth="7" strokeLinecap="round" />
  </>
);

export const LogoV3: React.FC<LogoProps> = ({ className = 'w-6 h-6', title }) => (
  <svg viewBox="0 0 100 100" className={`oda-logo-v3 ${className}`} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
    {title && <title>{title}</title>}
    <DoorPaths />
  </svg>
);

/** Stacked lockup (fits the existing vertical logo slots): door above the wordmark. */
export const LogoV3Lockup: React.FC<LogoProps> = ({ className = 'w-12 h-18', title = 'ODA' }) => (
  <svg viewBox="0 0 100 150" className={`oda-logo-v3 ${className}`} role="img" aria-label={title}>
    <DoorPaths />
    <text x="50" y="136" textAnchor="middle" fontSize="36" fontWeight="560" letterSpacing="1" fill="var(--logo-ink)" style={{ fontFamily: 'var(--font-editorial)', fontVariationSettings: "'opsz' 72" }}>ODA</text>
  </svg>
);
