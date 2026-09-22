/**
 * Six source-labelled passages each day, from morning through evening.
 */

import { N_, getLocale } from '../i18n';
import { getScheduledQuote, quoteText, quoteSource } from './quoteCollection';

export const NUDGE_SLOTS = ['morning', 'lateMorning', 'midday', 'afternoon', 'evening', 'night'] as const;
export type NudgeSlot = typeof NUDGE_SLOTS[number];

export const NUDGE_LINES: Record<'morning' | 'midday' | 'evening', string[]> = {
  morning: [
    N_('Good morning. One decision today is enough. Choose it before the day chooses for you.'),
    N_('Your future self is already awake. Give them one thing to be proud of by tonight.'),
    N_('You don\'t need motivation. You need the first two minutes. Start there.'),
    N_('Today is not a rehearsal. Pick the one action that actually moves the line.'),
    N_('The default future is built by accident. The built future is built before 10am.'),
    N_('Small, done, today. That\'s the whole system.'),
    N_('Whatever you avoided yesterday is the One Decision for today.'),
    N_('You have kept your word before. Do it again, quietly, this morning.'),
    N_('Discipline is remembering what you want. So: what do you want?'),
    N_('Every Dream Dollar is a vote. Cast the first one before breakfast.'),
    N_('Calm mornings are made, not found. Set the decision, then move.'),
    N_('The person you\'re becoming shows up in the next hour. Let them.'),
    N_('One brave email. One hard workout. One honest page. Pick one.'),
    N_('You\'re one decision away. Not someday — today.'),
    N_('Begin before you feel ready. Readiness is a result, not a requirement.'),
  ],
  midday: [
    N_('Halfway check: has the default future gotten a vote yet? Take one back.'),
    N_('If the One Decision isn\'t done, this is the hour. 25 minutes, phone away.'),
    N_('Drifting is normal. Noticing is the skill. Notice, then return.'),
    N_('You don\'t have to finish. You have to continue.'),
    N_('The scroll will still be there. The momentum won\'t. Choose momentum.'),
    N_('Energy low? Do the smallest true version of the task. Then decide again.'),
    N_('Say no to one thing this afternoon so you can say yes to the thing that matters.'),
    N_('Your streak doesn\'t care how you feel. It cares what you do next.'),
    N_('Ten focused minutes now beats a perfect plan for tomorrow.'),
    N_('Lunch is over. So is the excuse. Back to the one thing.'),
    N_('Progress today is measured in decisions kept, not hours worried.'),
    N_('Quick reset: three slow breaths, one clear task, go.'),
    N_('The dream on your board is a few hundred good afternoons away. This is one of them.'),
    N_('Comfort is asking for a vote. Politely decline.'),
    N_('Recommit, don\'t restart. Pick up exactly where you left off.'),
  ],
  evening: [
    N_('Close the day gently. What was the one thing you did right? Hold it.'),
    N_('Tomorrow\'s One Decision is easier to keep if you name it tonight.'),
    N_('You did enough. Rest is part of the system, not a break from it.'),
    N_('Did the default future win today? Log it honestly. Then let it go.'),
    N_('Ten minutes with your vision board before bed does more than an hour of worry.'),
    N_('A calm evening is a decision too. Phone down, lights low, mind quiet.'),
    N_('Write one line in the journal: what did today teach you?'),
    N_('The streak is safe if you kept your word. If not, tomorrow is a clean page.'),
    N_('Gratitude before sleep: one person, one thing, one moment.'),
    N_('The future you\'re building is one good night\'s sleep closer.'),
    N_('No verdicts tonight. Only notes for tomorrow.'),
    N_('You are allowed to be proud of a small day.'),
    N_('Set out tomorrow\'s first step where you\'ll see it in the morning.'),
    N_('Breathe out the day. It\'s done. You showed up.'),
    N_('Rest like it matters. Tomorrow you decide again.'),
  ],
};

export const DEFAULT_NUDGE_TIMES: Record<NudgeSlot, string> = {
  morning: '08:00', lateMorning: '10:30', midday: '13:00',
  afternoon: '15:30', evening: '18:00', night: '21:30',
};

export const NUDGE_TITLES: Record<NudgeSlot, string> = {
  morning: 'ODA · ☀️', lateMorning: 'ODA · 🌿', midday: 'ODA · ☀️',
  afternoon: 'ODA · 🌱', evening: 'ODA · 🌅', night: 'ODA · 🌙',
};

export function isNudgeTime(value: unknown): value is string {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function normaliseNudgeTimes(times?: Partial<Record<NudgeSlot, string>>): Record<NudgeSlot, string> {
  const result = {} as Record<NudgeSlot, string>;
  const occupied = new Set<string>();
  // Reserve every saved time first, including slots that occur later in this
  // list. Migration must not move a user's valid, explicitly chosen time.
  for (const slot of NUDGE_SLOTS) {
    const value = times?.[slot];
    if (isNudgeTime(value)) {
      result[slot] = value;
      occupied.add(value);
    }
  }
  for (const slot of NUDGE_SLOTS) {
    if (result[slot]) continue;
    let candidate = DEFAULT_NUDGE_TIMES[slot];
    // Only newly filled slots move; half-hour steps keep a collision away
    // from the saved reminder rather than sending two almost simultaneously.
    while (occupied.has(candidate)) {
      const [hour, minute] = candidate.split(':').map(Number);
      const next = (hour * 60 + minute + 30) % (24 * 60);
      candidate = `${String(Math.floor(next / 60)).padStart(2, '0')}:${String(next % 60).padStart(2, '0')}`;
    }
    result[slot] = candidate;
    occupied.add(candidate);
  }
  return result;
}

/** Six distinct, source-labelled passages per local calendar day; the collection cycles after 100 days. */
export function getNudgeLine(slot: NudgeSlot, date = new Date()): string {
  const quote = getScheduledQuote(NUDGE_SLOTS.indexOf(slot), date);
  const locale = getLocale();
  const label = quote.kind === 'adaptation'
    ? locale === 'tr' ? 'uyarlama' : locale === 'es' ? 'adaptación' : 'adapted'
    : locale === 'tr' ? 'çeviri' : locale === 'es' ? 'traducción' : 'translation';
  return `${quoteText(quote, locale)} — ${quoteSource(quote, locale)} (${label})`;
}
