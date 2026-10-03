import React from 'react';
import { useT } from '../i18n';
import { FocusTimerHub } from '../components/FocusTimerHub';
import { CourseCover } from '../components/CourseCover';
import '../styles/workingSurfaces.css';

/** Dedicated home for meditations, sound frequencies and the focus timer. */
export const Focus: React.FC = () => {
  const t = useT();
  return (
    <div className="oda-fidelity-focus space-y-6">
      <header className="oda-focus-heading">
        <div>
        <h1 className="oda-display text-[32px] leading-tight text-[var(--fg)]">{t('Focus')}</h1>
        <p className="text-[15px] text-[var(--fg-muted)] mt-1">
          {t('Guided meditations, sound waves and a focus timer.')}
        </p>
        </div>
      </header>
      <div className="oda-focus-workbench">
        <figure className="oda-focus-illustration" aria-hidden="true"><CourseCover courseId="turning-day" eager /></figure>
        <FocusTimerHub />
      </div>
    </div>
  );
};
