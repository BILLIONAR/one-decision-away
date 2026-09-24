import React, { useEffect, useRef, useState } from 'react';
import { Modal } from '../ui';
import { useApp } from '../../store/useApp';
import { useT } from '../../i18n';
import { TWO_MINUTES } from '../../services/momentum';
import { soundSynthesizer } from '../../utils/soundSynthesizer';
import type { Mission } from '../../types/models';

/**
 * "Just two minutes": lowers the cost of starting, the moment where
 * procrastination usually wins. Wall-clock based so it stays accurate when
 * the tab is in the background.
 */
export const TwoMinuteStart: React.FC<{ mission: Mission | null; isOpen: boolean; onClose: () => void; onDone: () => void }> = ({ mission, isOpen, onClose, onDone }) => {
  const t = useT();
  const { updateDecision, setActiveRoute } = useApp();
  const [left, setLeft] = useState(TWO_MINUTES);
  const endsAt = useRef(0);

  useEffect(() => {
    if (!isOpen || !mission) return;
    endsAt.current = Date.now() + TWO_MINUTES * 1000;
    setLeft(TWO_MINUTES);
    if (!mission.startedAt) void updateDecision(mission.id, { startedAt: new Date().toISOString() });
    const id = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setLeft(next);
      if (next === 0) {
        window.clearInterval(id);
        soundSynthesizer.playFocusCompleteChime();
        try { navigator.vibrate?.(200); } catch { /* optional */ }
      }
    }, 250);
    return () => window.clearInterval(id);
    // Start once per opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mission?.id]);

  if (!mission) return null;
  const finished = left === 0;
  const progress = 1 - left / TWO_MINUTES;
  const time = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  const r = 54; const circumference = 2 * Math.PI * r;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={finished ? t('You started.') : t('Just two minutes')}>
      <div className="space-y-6 pb-2 text-center">
        <p className="text-[15px] leading-relaxed text-[var(--fg-muted)]">
          {finished
            ? t('That was the hardest part. Stop here with a clear conscience, or keep going while you’re warm.')
            : t('You don’t have to finish. Just start “{title}”. When the time is up, you may stop.', { title: t(mission.title) })}
        </p>
        <div className="relative mx-auto w-40 h-40" role="timer" aria-live="off" aria-label={t('{time} left', { time })}>
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} style={{ transition: 'stroke-dashoffset 250ms linear' }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[34px] font-semibold tabular-nums text-[var(--fg)]">{finished ? '✓' : time}</span>
        </div>
        <p className="sr-only" aria-live="polite">{finished ? t('Two minutes are up.') : ''}</p>
        {finished ? (
          <div className="flex flex-col gap-2">
            <button type="button" onClick={() => { onClose(); onDone(); }} className="h-12 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--bg)] text-[15px] font-semibold">{t('I did it — mark as done')}</button>
            <button type="button" onClick={() => { onClose(); setActiveRoute('/app/focus'); }} className="h-12 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg)] text-[15px] font-semibold">{t('Keep going with a focus timer')}</button>
            <button type="button" onClick={onClose} className="h-11 text-[14px] text-[var(--fg-muted)]">{t('Stop for now')}</button>
          </div>
        ) : (
          <button type="button" onClick={onClose} className="h-11 px-5 text-[14px] text-[var(--fg-muted)]">{t('Stop')}</button>
        )}
      </div>
    </Modal>
  );
};
