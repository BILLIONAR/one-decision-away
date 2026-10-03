import React, { useId } from 'react';

const brandImage = `${import.meta.env.BASE_URL}brand/domino8/oda-mark-domino8-v1-256.png`;
type LogoProps = { className?: string; title?: string };

/** The accepted icon8 reconstruction, contained in full; rounding is for in-app display only. */
const DominoImage: React.FC = () => {
  const clipId = `oda-domino8-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return <>
    <defs><clipPath id={clipId}><rect width="100" height="100" rx="20" /></clipPath></defs>
    <image href={brandImage} width="100" height="100" preserveAspectRatio="xMidYMid meet" clipPath={`url(#${clipId})`} />
  </>;
};

export const LogoDomino8: React.FC<LogoProps> = ({ className = 'w-6 h-6', title }) => (
  <svg viewBox="0 0 100 100" className={`oda-brand-mark oda-domino8-mark ${className}`} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
    {title && <title>{title}</title>}
    <DominoImage />
  </svg>
);

export const LogoDomino8Lockup: React.FC<LogoProps> = ({ className = 'w-12 h-18', title = 'ODA' }) => (
  <svg viewBox="0 0 100 150" className={`oda-brand-mark oda-domino8-mark ${className}`} role="img" aria-label={title}>
    <DominoImage />
    <text x="50" y="137" textAnchor="middle" fontSize="32" letterSpacing="1.5" fill="currentColor" style={{ fontFamily: 'var(--font-editorial)' }}>ODA</text>
  </svg>
);
