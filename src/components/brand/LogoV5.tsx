import React from 'react';
import { BRAND_V5, type BrandVariant } from '../../brand/v5';

export type LogoV5Props = { className?: string; title?: string; variant?: BrandVariant };

const Branch: React.FC = () => <>
  {BRAND_V5.branchPaths.map(d => <path key={d} d={d} fill="none" stroke="var(--oda-brand-ink)" strokeWidth="2.8" strokeLinecap="round" />)}
  <path d={BRAND_V5.selectedLeaf} fill="var(--oda-brand-selected)" stroke="var(--oda-brand-outline)" strokeWidth=".8" strokeLinejoin="round" />
</>;
const Wordmark: React.FC = () => <g fill="var(--oda-brand-ink)" fillRule="evenodd">
  {BRAND_V5.wordmarkPaths.map(d => <path key={d} d={d} />)}
</g>;

function colors(variant: BrandVariant): React.CSSProperties {
  return {
    '--oda-brand-ink': variant === 'inverted' ? 'var(--brand-ivory, #F7F3EA)' : 'var(--logo-ink, var(--brand-forest, #173E35))',
    '--oda-brand-selected': variant === 'monochrome' ? 'var(--oda-brand-ink)' : 'var(--brand-wine, #8A3042)',
    '--oda-brand-outline': variant === 'inverted' ? 'var(--brand-ivory, #F7F3EA)' : 'var(--logo-selected-outline, none)',
  } as React.CSSProperties;
}

export const LogoV5: React.FC<LogoV5Props> = ({ className = 'w-7 h-7', title, variant = 'default' }) => (
  <svg viewBox="0 0 40 40" className={`oda-logo-v5 ${className}`} data-brand="v5" data-brand-variant={variant} style={colors(variant)} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined} aria-label={title}>
    {title && <title>{title}</title>}<Branch />
  </svg>
);

/** Horizontal editorial lockup: 192 × 64. Never compress into a tall mobile slot. */
export const LogoV5Lockup: React.FC<LogoV5Props> = ({ className = 'w-48 h-16', title = 'ODA — One Decision Away', variant = 'default' }) => (
  <svg viewBox="0 0 192 64" className={`oda-logo-v5 oda-logo-v5-lockup ${className}`} data-brand="v5" data-brand-variant={variant} style={colors(variant)} role="img" aria-label={title}>
    <title>{title}</title><g transform="translate(0 8) scale(.9)"><Branch /></g>
    <g transform="translate(45 4) scale(.93)"><Wordmark /></g>
    <text x="45" y="59" fontSize="10.5" letterSpacing="1.36" fill="var(--oda-brand-ink)" style={{ fontFamily: 'var(--font-sans, Arial, sans-serif)', fontWeight: 550 }}>ONE DECISION AWAY</text>
  </svg>
);

/** Mobile mark is 28 × 28 beside a 50px-wide path wordmark. */
export const LogoV5Compact: React.FC<LogoV5Props> = ({ className = 'w-[84px] h-8', title = 'ODA', variant = 'default' }) => (
  <svg viewBox="0 0 84 32" className={`oda-logo-v5 oda-logo-v5-compact ${className}`} data-brand="v5" data-brand-variant={variant} style={colors(variant)} role="img" aria-label={title}>
    <title>{title}</title><g transform="translate(0 2) scale(.7)"><Branch /></g><g transform="translate(34 8.5) scale(.338)"><Wordmark /></g>
  </svg>
);
