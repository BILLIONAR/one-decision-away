import React, { useId } from 'react';

/** A soft gradient ring with a book-face number in the middle (this week's kept days). */
export const ProgressRing: React.FC<{ value: number; max: number; size?: number; stroke?: number; label: string; caption: string }> = ({ value, max, size = 92, stroke = 9, label, caption }) => {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={`ring${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--ring-a)" />
            <stop offset="1" stopColor="var(--ring-b)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        {pct > 0 && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#ring${id})`} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${(c * pct).toFixed(1)} ${c.toFixed(1)}`} className="oda-ring-arc" />
        )}
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="oda-numeral leading-none text-[var(--fg)]" style={{ fontSize: Math.round(size * 0.29) }}>{value}/{max}</span>
        <span className="text-[11px] text-[var(--fg-muted)] mt-1">{caption}</span>
      </span>
    </div>
  );
};
