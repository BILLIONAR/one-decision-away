import React from 'react';
import { useT } from '../i18n';
import { FocusTimerHub } from '../components/FocusTimerHub';

/** Dedicated home for meditations, sound frequencies and the focus timer. */
export const Focus: React.FC = () => {
  const t = useT();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-[var(--fg)]">{t('Focus')}</h1>
        <p className="text-[15px] text-[var(--fg-muted)] mt-1">
          {t('Guided meditations, sound waves and a focus timer.')}
        </p>
      </div>
      <FocusTimerHub />
    </div>
  );
};
