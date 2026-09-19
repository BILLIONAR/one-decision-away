import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Modal, Button } from './ui';
import { Download, Check } from 'lucide-react';
import {
  generateMicroHabitsDetailedCsv,
  generateMicroHabitsSummaryCsv,
  downloadCsvFile,
} from '../utils/exportCsv';
import { useT } from '../i18n';

interface ExportHabitHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportHabitHistoryModal: React.FC<ExportHabitHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const t = useT();
  const { data, showToast } = useApp();
  const [rangeDays, setRangeDays] = useState<number | undefined>(30);
  const [exportType, setExportType] = useState<'detailed' | 'summary'>('detailed');

  if (!isOpen || !data) return null;

  const habits = data.microHabits || [];
  const goals = data.goals || [];

  // Calculate row counts for preview
  const now = new Date();
  const minDate = rangeDays ? new Date(now.getTime() - rangeDays * 86400000) : null;

  let totalFilteredCompletions = 0;
  habits.forEach((h) => {
    const completedDates = Array.isArray(h.completedDates) ? h.completedDates : [];
    completedDates.forEach((dateStr) => {
      if (!minDate || new Date(dateStr) >= minDate) {
        totalFilteredCompletions++;
      }
    });
  });

  const handleExport = () => {
    const timestamp = new Date().toISOString().slice(0, 10);
    if (exportType === 'detailed') {
      const csv = generateMicroHabitsDetailedCsv(data, rangeDays);
      const filename = `micro_habits_completion_history_${
        rangeDays ? `${rangeDays}d` : 'all_time'
      }_${timestamp}.csv`;
      downloadCsvFile(csv, filename);
      showToast(t('Exported {n} records.', { n: totalFilteredCompletions }), 'success');
    } else {
      const csv = generateMicroHabitsSummaryCsv(data);
      const filename = `micro_habits_summary_${timestamp}.csv`;
      downloadCsvFile(csv, filename);
      showToast(t('Exported {n} habits.', { n: habits.length }), 'success');
    }
    onClose();
  };

  const formatOptions: { id: 'detailed' | 'summary'; label: string; description: string }[] = [
    {
      id: 'detailed',
      label: t('Daily log'),
      description: t('One row per completed day.'),
    },
    {
      id: 'summary',
      label: t('Summary'),
      description: t('One row per habit with streaks and totals.'),
    },
  ];

  const rangeOptions: { label: string; days: number | undefined }[] = [
    { label: t('7 days'), days: 7 },
    { label: t('30 days'), days: 30 },
    { label: t('90 days'), days: 90 },
    { label: t('All time'), days: undefined },
  ];

  const columns =
    exportType === 'detailed'
      ? [
          t('Date'),
          t('Day of Week'),
          t('Habit Title'),
          t('Category'),
          t('Duration (Mins)'),
          t('Linked Life Goal'),
          t('Goal Domain Area'),
          t('Current Streak'),
          t('Best Streak'),
          t('Lifetime Completions'),
          t('Status'),
        ]
      : [
          t('Habit Title'),
          t('Category'),
          t('Duration (Mins)'),
          t('Description'),
          t('Linked Life Goal'),
          t('Goal Area'),
          t('Current Streak'),
          t('Best Streak'),
          t('Total Completed Days'),
          t('Created At'),
        ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Export habits')}
      subtitle={t('Download a CSV for Excel, Numbers or Google Sheets.')}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Format */}
        <div className="space-y-2">
          <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Format')}</span>
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-muted)] overflow-hidden">
            {formatOptions.map((opt, idx) => {
              const selected = exportType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setExportType(opt.id)}
                  className={`w-full min-h-[56px] px-4 py-3 flex items-center gap-3 text-left cursor-pointer hover:bg-[var(--bg-inset)] transition-colors ${
                    idx > 0 ? 'border-t border-[var(--border)]' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-[var(--fg)]">{opt.label}</div>
                    <div className="text-[13px] text-[var(--fg-muted)]">{opt.description}</div>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${
                      selected ? 'bg-[var(--accent)] text-white' : 'border border-[var(--border-strong)]'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" strokeWidth={2.5} />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Range */}
        {exportType === 'detailed' && (
          <div className="space-y-2">
            <span className="block text-[13px] font-medium text-[var(--fg-muted)]">{t('Range')}</span>
            <div className="flex flex-wrap gap-2">
              {rangeOptions.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setRangeDays(item.days)}
                  className={`h-9 px-3.5 text-[13px] font-medium rounded-full transition-colors cursor-pointer ${
                    rangeDays === item.days
                      ? 'bg-[var(--fg)] text-[var(--bg)]'
                      : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="space-y-2">
          <div className="text-[13px] text-[var(--fg-muted)]">
            {exportType === 'detailed'
              ? t('{records} records across {habits} habits', { records: totalFilteredCompletions, habits: habits.length })
              : t('{n} habits', { n: habits.length })}
          </div>
          <div className="text-[12px] text-[var(--fg-subtle)] leading-relaxed">
            {t('Columns')}: {columns.join(', ')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            {t('Cancel')}
          </Button>
          <Button
            variant="primary"
            icon={Download}
            onClick={handleExport}
            disabled={exportType === 'detailed' && totalFilteredCompletions === 0}
          >
            {t('Download CSV')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
