import React from 'react';
import { Download } from 'lucide-react';
import { Button, Modal } from './ui';
import { useLocale, useT } from '../i18n';
import { backupCopy } from '../data/backupCopy';
import { summarizeBackup } from '../services/backup';
import type { UserData } from '../types/models';

interface Props {
  record: UserData | null;
  filename?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onBackup: () => void;
}

export const BackupRestoreReview: React.FC<Props> = ({ record, filename, busy = false, onCancel, onConfirm, onBackup }) => {
  const [locale] = useLocale();
  const t = useT();
  const copy = backupCopy(locale);
  const summary = record ? summarizeBackup(record) : null;
  return (
    <Modal isOpen={record !== null} onClose={() => { if (!busy) onCancel(); }} title={copy.reviewTitle} subtitle={filename ?? copy.cloud}>
      {summary && <div className="space-y-4">
        <p className="text-[14px] leading-relaxed text-[var(--fg-muted)]">{copy.replace}</p>
        <dl className="grid grid-cols-2 gap-2">
          {(Object.keys(summary) as (keyof typeof summary)[]).map(key => <div key={key} className="rounded-xl border border-[var(--border)] bg-[var(--bg-muted)] p-3">
            <dt className="text-[12px] text-[var(--fg-muted)]">{copy[key]}</dt>
            <dd className="text-[22px] font-semibold tabular-nums">{summary[key].toLocaleString(locale)}</dd>
          </div>)}
        </dl>
        <p className="text-[12px] leading-relaxed text-[var(--fg-muted)]">{copy.restore}</p>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>{t('Cancel')}</Button>
          <Button variant="secondary" size="sm" icon={Download} disabled={busy} onClick={onBackup}>{t('Download backup')}</Button>
          <Button variant="primary" size="sm" disabled={busy} onClick={onConfirm}>{busy ? copy.restoring : copy.confirm}</Button>
        </div>
      </div>}
    </Modal>
  );
};
