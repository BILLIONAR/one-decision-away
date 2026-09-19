import React from 'react';

/**
 * Brand mark: one path splitting in two — the life you're building (accent)
 * and the life you're allowing (faded). The dot at the base is today's decision.
 */
export const Logo: React.FC<{ className?: string; title?: string }> = ({ className = 'w-6 h-6', title }) => (
  <svg viewBox="0 0 72 72" fill="none" className={className} aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
    {title && <title>{title}</title>}
    <path d="M36 62 L36 38" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
    <path d="M36 38 C36 26, 24 22, 18 12" stroke="var(--border-strong)" strokeWidth="7" strokeLinecap="round" />
    <path d="M36 38 C36 26, 48 22, 54 12" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" />
    <circle cx="54" cy="12" r="6" fill="var(--accent)" />
    <circle cx="36" cy="62" r="6" fill="currentColor" />
  </svg>
);
