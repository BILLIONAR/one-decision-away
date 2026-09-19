import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Download, X } from 'lucide-react';
import { Button } from './ui';
import { cloudSync } from '../services/cloudSync';
import { useT } from '../i18n';

const DAYS = 14;

/** Gentle Home nudge: no backup in 14+ days and not signed in to cloud. */
export const BackupReminder: React.FC = () => {
  const t = useT();
  const { exportDataJson, setActiveRoute, data } = useApp();
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem('oda_backup_nudge_hidden') === '1';
    } catch {
      return false;
    }
  });
  if (!data || hidden || cloudSync.isSignedIn()) return null;

  let last: string | null = null;
  try {
    last = localStorage.getItem('oda_last_backup');
  } catch {
    /* ignore */
  }
  const daysSince = last ? Math.floor((Date.now() - new Date(last).getTime()) / 86400000) : 999;
  const enoughData = (data.completions?.length || 0) + (data.inVisionItemIds?.length || 0) + (data.dreamJournal?.length || 0) >= 3;
  if (daysSince < DAYS || !enoughData) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem('oda_backup_nudge_hidden', '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 bg-[var(--bg-muted)] rounded-[var(--radius-md)]">
      <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed">
        <span className="text-[var(--fg)] font-medium">{t('Your data lives only in this browser.')}</span>{' '}
        {last ? t('Last backup was {n} days ago.', { n: daysSince }) : t('You have never made a backup.')}{' '}
        {t('Download one, or sign in to sync to the cloud.')}
      </p>
      <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
        <Button size="sm" variant="secondary" icon={Download} onClick={exportDataJson}>
          {t('Back up')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setActiveRoute('/app/settings')}>
          {t('Cloud sync')}
        </Button>
        <button type="button" onClick={dismiss} className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer" title={t('Not now')} aria-label={t('Not now')}>
          <X className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};
