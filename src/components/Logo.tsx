import React from 'react';

const brandImage = `${import.meta.env.BASE_URL}brand/oda-c4.png`;
type LogoProps = { className?: string; title?: string };

/** C4 mark and stacked ODA lockup share the selected transparent master asset. */
export const Logo: React.FC<LogoProps> = ({ className = 'w-6 h-6', title }) => (
  <svg viewBox="280 130 700 640" className={`oda-brand-mark ${className}`} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
    {title && <title>{title}</title>}
    <image href={brandImage} width="1254" height="1254" />
  </svg>
);

export const LogoLockup: React.FC<LogoProps> = ({ className = 'w-12 h-18', title = 'ODA' }) => (
  <svg viewBox="280 130 700 1000" className={`oda-brand-mark ${className}`} role="img" aria-label={title}>
    <image href={brandImage} width="1254" height="1254" />
  </svg>
);
