/**
 * Utility for exporting Micro-Habit completion history and records as CSV
 * Implements strict RFC 4180 CSV formatting with quotation escaping.
 */

import { UserData, MicroHabit } from '../types/models';

interface CsvExportOptions {
  rangeDays?: number; // e.g. 7, 30, 90, or undefined for all time
  format?: 'detailed_logs' | 'habit_summary';
}

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a detailed CSV where each row corresponds to a date completion event
 */
export function generateMicroHabitsDetailedCsv(
  data: UserData,
  rangeDays?: number
): string {
  const habits = data.microHabits || [];
  const goals = data.goals || [];
  const now = new Date();
  const minDate = rangeDays ? new Date(now.getTime() - rangeDays * 86400000) : null;

  const headers = [
    'Date',
    'Day of Week',
    'Habit ID',
    'Habit Title',
    'Category',
    'Duration (Minutes)',
    'Linked Life Goal',
    'Goal Domain Area',
    'Current Streak (Days)',
    'Best Streak (Days)',
    'Lifetime Habit Completions',
    'Status',
  ];

  const rows: string[][] = [];

  habits.forEach((habit) => {
    const linkedGoal = habit.goalId ? goals.find((g) => g.id === habit.goalId) : undefined;
    const completedDates = Array.isArray(habit.completedDates) ? habit.completedDates : [];

    completedDates.forEach((dateStr) => {
      if (minDate) {
        const d = new Date(dateStr);
        if (d < minDate) return;
      }

      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayOfWeek = isNaN(dateObj.getTime())
        ? ''
        : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

      rows.push([
        dateStr,
        dayOfWeek,
        habit.id,
        habit.title,
        habit.category,
        habit.durationMinutes ? String(habit.durationMinutes) : '5',
        linkedGoal ? linkedGoal.title : 'None',
        linkedGoal ? linkedGoal.area : 'General',
        String(habit.streakCount || 0),
        String(habit.bestStreak || 0),
        String(completedDates.length),
        'Completed',
      ]);
    });
  });

  // Sort chronologically descending (newest first)
  rows.sort((a, b) => b[0].localeCompare(a[0]));

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ].join('\r\n');

  return csvContent;
}

/**
 * Generates a summary CSV where each row represents a micro-habit with its metrics
 */
export function generateMicroHabitsSummaryCsv(data: UserData): string {
  const habits = data.microHabits || [];
  const goals = data.goals || [];

  const headers = [
    'Habit ID',
    'Habit Title',
    'Category',
    'Target Duration (Minutes)',
    'Description',
    'Linked Life Goal',
    'Goal Area',
    'Current Streak (Days)',
    'Best Streak (Days)',
    'Total Completed Days',
    'Created At',
    'Completed Dates List',
  ];

  const rows: string[][] = habits.map((h) => {
    const linkedGoal = h.goalId ? goals.find((g) => g.id === h.goalId) : undefined;
    const completedDates = Array.isArray(h.completedDates) ? h.completedDates : [];

    return [
      h.id,
      h.title,
      h.category,
      h.durationMinutes ? String(h.durationMinutes) : '5',
      h.description || '',
      linkedGoal ? linkedGoal.title : 'None',
      linkedGoal ? linkedGoal.area : 'General',
      String(h.streakCount || 0),
      String(h.bestStreak || 0),
      String(completedDates.length),
      h.createdAt,
      completedDates.join('; '),
    ];
  });

  const csvContent = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ].join('\r\n');

  return csvContent;
}

/**
 * Triggers a browser file download of CSV content
 */
export function downloadCsvFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
