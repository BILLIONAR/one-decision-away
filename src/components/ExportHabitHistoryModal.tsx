import React, { useState } from 'react';
import { useApp } from '../store/useApp';
import { Card, Button, Badge } from './ui';
import {
  Download,
  FileSpreadsheet,
  X,
  Calendar,
  CheckCircle2,
  Filter,
  Table,
  Sparkles,
} from 'lucide-react';
import {
  generateMicroHabitsDetailedCsv,
  generateMicroHabitsSummaryCsv,
  downloadCsvFile,
} from '../utils/exportCsv';

interface ExportHabitHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportHabitHistoryModal: React.FC<ExportHabitHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
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
      showToast(`✓ Exported ${totalFilteredCompletions} completion records to CSV!`, 'success');
    } else {
      const csv = generateMicroHabitsSummaryCsv(data);
      const filename = `micro_habits_summary_${timestamp}.csv`;
      downloadCsvFile(csv, filename);
      showToast(`✓ Exported summary for ${habits.length} micro-habits to CSV!`, 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <Card
        padding="none"
        className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[var(--bg-elevated)] border border-[var(--border)] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-[var(--primary)]/15 text-[var(--primary)]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display text-[var(--fg)]">
                  Export Micro-Habit History
                </h3>
                <Badge variant="sage" className="text-[10px] uppercase">
                  CSV • RFC 4180
                </Badge>
              </div>
              <p className="text-xs text-[var(--fg-muted)]">
                Download your micro-habit tracking logs for spreadsheet analysis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-muted)] rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Format Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--fg)]">
              Export Format Structure
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportType('detailed')}
                className={`p-3 text-left rounded-[var(--radius-md)] border text-xs transition-all cursor-pointer ${
                  exportType === 'detailed'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--fg)] shadow-xs'
                    : 'border-[var(--border)] bg-[var(--bg-muted)]/50 text-[var(--fg-muted)] hover:border-[var(--border-strong)]'
                }`}
              >
                <span className="font-bold block text-[var(--fg)] mb-0.5">
                  Detailed Daily Log
                </span>
                <span className="text-[11px] text-[var(--fg-subtle)] leading-tight block">
                  One row per completion date with habit title, category, linked life goal, and streak at completion.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setExportType('summary')}
                className={`p-3 text-left rounded-[var(--radius-md)] border text-xs transition-all cursor-pointer ${
                  exportType === 'summary'
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--fg)] shadow-xs'
                    : 'border-[var(--border)] bg-[var(--bg-muted)]/50 text-[var(--fg-muted)] hover:border-[var(--border-strong)]'
                }`}
              >
                <span className="font-bold block text-[var(--fg)] mb-0.5">
                  Habit Summary Metrics
                </span>
                <span className="text-[11px] text-[var(--fg-subtle)] leading-tight block">
                  One row per micro-habit with lifetime completions, active streak, best streak, and linked goals.
                </span>
              </button>
            </div>
          </div>

          {/* Time Range Filter (Only applicable to detailed log) */}
          {exportType === 'detailed' && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--fg)]">
                History Time Window
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Last 7 Days', days: 7 },
                  { label: 'Last 30 Days', days: 30 },
                  { label: 'Last 90 Days', days: 90 },
                  { label: 'All-Time History', days: undefined },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setRangeDays(item.days)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-[var(--radius-sm)] border transition-all cursor-pointer ${
                      rangeDays === item.days
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                        : 'bg-[var(--bg)] border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Data Summary Stats Box */}
          <div className="p-3 bg-[var(--bg-muted)] rounded-[var(--radius-md)] border border-[var(--border)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-[var(--fg-muted)]">
                {exportType === 'detailed' ? (
                  <>
                    <strong className="text-[var(--fg)]">{totalFilteredCompletions}</strong> completion records found across{' '}
                    <strong className="text-[var(--fg)]">{habits.length}</strong> micro-habits
                  </>
                ) : (
                  <>
                    <strong className="text-[var(--fg)]">{habits.length}</strong> active micro-habit definitions
                  </>
                )}
              </span>
            </div>
            <Badge variant="neutral">Excel / Sheets ready</Badge>
          </div>

          {/* Column Schema Preview */}
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-[var(--fg-muted)] uppercase tracking-wider text-[10px]">
              Included CSV Columns:
            </span>
            <div className="p-2.5 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] text-[11px] font-mono text-[var(--fg-muted)] flex flex-wrap gap-1.5">
              {exportType === 'detailed'
                ? [
                    'Date',
                    'Day of Week',
                    'Habit Title',
                    'Category',
                    'Duration (Mins)',
                    'Linked Life Goal',
                    'Goal Domain Area',
                    'Current Streak',
                    'Best Streak',
                    'Lifetime Completions',
                    'Status',
                  ].map((col) => (
                    <span
                      key={col}
                      className="px-1.5 py-0.5 bg-[var(--bg-muted)] rounded border border-[var(--border)] text-[10px]"
                    >
                      {col}
                    </span>
                  ))
                : [
                    'Habit Title',
                    'Category',
                    'Duration (Mins)',
                    'Description',
                    'Linked Life Goal',
                    'Goal Area',
                    'Current Streak',
                    'Best Streak',
                    'Total Completed Days',
                    'Created At',
                  ].map((col) => (
                    <span
                      key={col}
                      className="px-1.5 py-0.5 bg-[var(--bg-muted)] rounded border border-[var(--border)] text-[10px]"
                    >
                      {col}
                    </span>
                  ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border)] flex items-center justify-between bg-[var(--bg-muted)]/30">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            icon={Download}
            onClick={handleExport}
            disabled={exportType === 'detailed' && totalFilteredCompletions === 0}
          >
            Download CSV Export
          </Button>
        </div>
      </Card>
    </div>
  );
};
