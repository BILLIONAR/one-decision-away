import { FAITH_QUOTES } from './quoteExpansionFaith';
import { THINKER_QUOTES } from './quoteExpansionThinkers';
import { FAITH_QUOTES_MORE } from './quoteExpansionFaithMore';
import { SCIENCE_QUOTES_MORE } from './quoteExpansionScienceMore';
import { PHILOSOPHY_QUOTES_MORE } from './quoteExpansionPhilosophyMore';
import type { SourcedQuote } from './quoteTypes';

// Keep the original 300 in place, then alternate faith, science and philosophy.
export const QUOTE_COLLECTION: SourcedQuote[] = [
  ...FAITH_QUOTES.flatMap((quote, index) =>
    THINKER_QUOTES[index] ? [quote, THINKER_QUOTES[index]] : [quote],
  ),
  ...FAITH_QUOTES_MORE.flatMap((quote, index) => [
    quote, SCIENCE_QUOTES_MORE[index], PHILOSOPHY_QUOTES_MORE[index],
  ]),
];

export function localCalendarDay(date = new Date()): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/** A continuous 100-day cycle: six distinct passages/day, independent of time zone offsets and DST. */
export function getScheduledQuote(slotIndex: number, date = new Date()): SourcedQuote {
  const index = ((localCalendarDay(date) * 6 + slotIndex) % QUOTE_COLLECTION.length + QUOTE_COLLECTION.length) % QUOTE_COLLECTION.length;
  return QUOTE_COLLECTION[index];
}

export function quoteText(quote: SourcedQuote, locale: string): string {
  return locale === 'tr' ? quote.tr : quote.text;
}

export function quoteSource(quote: SourcedQuote, locale: string): string {
  return locale === 'tr' ? quote.sourceTr : quote.source;
}
