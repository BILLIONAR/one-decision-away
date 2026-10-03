import type { SourcedQuote } from '../data/quoteTypes';

export type QuoteFilterCategory = 'all' | SourcedQuote['category'];

function calendarDate(key: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new RangeError('Invalid notebook date');
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) throw new RangeError('Invalid notebook date');
  return date;
}
function calendarKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Monday-first archive navigation only; never supplies a date to a writing mutation. */
export function notebookWeekDates(anchor: string): string[] {
  const date = calendarDate(anchor);
  const monday = date.getDate() - (date.getDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, index) => calendarKey(new Date(date.getFullYear(), date.getMonth(), monday + index, 12)));
}
export function shiftNotebookWeek(anchor: string, weeks: number): string {
  if (!Number.isInteger(weeks)) throw new RangeError('Week offset must be an integer');
  const date = calendarDate(anchor);
  return calendarKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + weeks * 7, 12));
}

export function filterSourcedQuotes(quotes: readonly SourcedQuote[], category: QuoteFilterCategory, query: string, locale: string): SourcedQuote[] {
  const language = locale === 'tr' ? 'tr' : locale === 'es' ? 'es' : 'en';
  const normalize = (value: string) => value.toLocaleLowerCase(language).normalize('NFKD').replace(/\p{M}/gu, '');
  const needle = normalize(query.trim());
  return quotes.filter(quote => (category === 'all' || quote.category === category)
    && (!needle || normalize([quote.text, quote.tr, quote.source, quote.sourceTr, quote.reference || '', ...(quote.tags || [])].join(' ')).includes(needle)));
}

/** Catalogue links are external sources, never script or app actions. */
export function quoteSourceHref(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch { return undefined; }
}
