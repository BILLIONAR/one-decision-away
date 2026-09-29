import { N_ } from '../i18n';

/** Gentle daily writing prompts. One per day, deterministic by calendar date. */
export const JOURNAL_PROMPTS: string[] = [
  N_('What is one small thing that went better than I expected this week?'),
  N_('Which promise to myself am I quietly proud of keeping?'),
  N_('What would I do today if I trusted myself a little more?'),
  N_('Who has made my life easier lately, and what would I like them to know?'),
  N_('What am I carrying that I could set down for one evening?'),
  N_('Describe a moment today when I felt most like myself.'),
  N_('What is the kindest thing I could say to myself right now?'),
  N_('What did I avoid this week, and what is the smallest first step toward it?'),
  N_('Which ordinary part of my day would I miss if it were gone?'),
  N_('What do I want more of in my days, and what could I do about it today?'),
  N_('When did I last feel calm, and what was around me?'),
  N_('What is a decision I made recently that I would make again?'),
  N_('What am I learning about myself that I did not know a year ago?'),
  N_('Write about a place where I feel safe, and what makes it so.'),
  N_('What would a good day look like, in detail, from waking to sleep?'),
  N_('Which worry is loudest today, and what is actually within my control?'),
  N_('What is one thing I can forgive myself for?'),
  N_('Who do I want to become a little more like, and what do they do differently?'),
  N_('What made me smile today, however briefly?'),
  N_('What does rest look like for me, and when did I last allow it?'),
  N_('What would I tell a close friend who was in my exact situation?'),
  N_('What is a small courage I showed recently that no one noticed?'),
  N_('What do I want to remember about this season of my life?'),
  N_('If tomorrow could start one small thing well, what would it be?'),
];

/** Local calendar day number, so the same date always maps to the same prompt. */
export function promptIndexForDate(dateKey: string, count = JOURNAL_PROMPTS.length): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const day = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return ((day % count) + count) % count;
}

export function promptForDate(dateKey: string): string {
  return JOURNAL_PROMPTS[promptIndexForDate(dateKey)];
}
