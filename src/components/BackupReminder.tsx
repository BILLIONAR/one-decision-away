import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Download, X, ShieldAlert } from 'lucide-react';
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
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-[var(--bg-muted)] border border-[var(--border-strong)] rounded-[var(--radius-md)]">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
        <p className="text-xs text-[var(--fg-muted)]">
          <strong className="text-[var(--fg)]">{t('Your data lives only in this browser.')}</strong>{' '}
          {last ? t('Last backup was {n} days ago.', { n: daysSince }) : t('You have never made a backup.')}{' '}
          {t('Download one, or sign in to sync to the cloud.')}
        </p>
      </div>
      <div className="flex items-center gap-1.5 self-start sm:self-auto">
        <Button size="sm" variant="secondary" icon={Download} onClick={exportDataJson}>
          {t('Backup now')}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setActiveRoute('/app/settings')}>
          {t('Cloud sync')}
        </Button>
        <button type="button" onClick={dismiss} className="p-1.5 text-[var(--fg-subtle)] hover:text-[var(--fg)] cursor-pointer" title={t('Not now')}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
