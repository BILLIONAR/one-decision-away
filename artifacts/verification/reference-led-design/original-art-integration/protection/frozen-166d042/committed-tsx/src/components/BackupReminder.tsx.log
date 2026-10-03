import React, { useEffect, useReducer, useState } from 'react';
import { useApp } from '../store/useApp';
import { Download, X } from 'lucide-react';
import { Button } from './ui';
import { cloudSync } from '../services/cloudSync';
import { useLocale } from '../i18n';
import { backupReminderCopy } from '../i18n/backupReminder';
import { backupAgeDays, shouldShowBackupReminder } from '../services/backupReminder';

/** Quiet protection for saved work without a recently confirmed export or scoped cloud backup. */
export const BackupReminder: React.FC = () => {
  const [locale] = useLocale();
  const copy = backupReminderCopy(locale);
  const { exportDataJson, setActiveRoute, data } = useApp();
  const [, refresh] = useReducer((version: number) => version + 1, 0);
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem('oda_backup_nudge_hidden') === '1';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    const unsubscribe = cloudSync.subscribe(() => refresh());
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'oda_last_backup' || event.key === null) refresh();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  let last: string | null = null;
  try {
    last = localStorage.getItem('oda_last_backup');
  } catch {
    /* ignore */
  }
  // Re-read on every render: a dataset replacement can invalidate cloud ownership between emissions.
  const cloud = cloudSync.getState();
  const now = Date.now();
  const cloudStatus = { configured: cloud.configured, signedIn: Boolean(cloud.session), lastSyncAt: cloud.lastSyncAt, error: cloud.error };
  if (!shouldShowBackupReminder({ data, dismissed: hidden, lastBackupAt: last, cloud: cloudStatus, now })) return null;
  const daysSince = backupAgeDays(last, now);
  const explanation = cloud.error !== null ? copy.cloudError : cloud.session ? copy.cloudUnconfirmed : copy.local;
  const exportBackup = async () => {
    await exportDataJson();
    refresh();
  };

  const dismiss = () => {
    setHidden(true);
    try {
      sessionStorage.setItem('oda_backup_nudge_hidden', '1');
    } catch {
      /* ignore */
    }
  };

  return (
    <aside aria-label={copy.label} className="oda-backup-reminder flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 oda-card rounded-[var(--radius-lg)]">
      <p className="text-[14px] text-[var(--fg-muted)] leading-relaxed">
        <span className="text-[var(--fg)] font-medium">{copy.title}</span>{' '}
        {explanation}{daysSince !== null && <span className="block text-[12px] mt-1">{copy.lastExport(daysSince)}</span>}
      </p>
      <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto shrink-0">
        <Button size="sm" variant="secondary" icon={Download} onClick={exportBackup}>
          {copy.download}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setActiveRoute('/app/settings')}>
          {copy.cloudSync}
        </Button>
        <button type="button" onClick={dismiss} className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] cursor-pointer" title={copy.dismiss} aria-label={copy.dismiss}>
          <X className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
};
