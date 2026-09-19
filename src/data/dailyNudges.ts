/**
 * Daily nudges — short, second-person lines sent as notifications 2–3 times a day.
 * Morning ignites, midday re-aims, evening closes with kindness.
 */

import { N_ } from '../i18n';

export type NudgeSlot = 'morning' | 'midday' | 'evening';

export const NUDGE_LINES: Record<NudgeSlot, string[]> = {
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
  morning: '08:00',
  midday: '13:30',
  evening: '20:30',
};

export const NUDGE_TITLES: Record<NudgeSlot, string> = {
  morning: N_('☀️ One Decision Away'),
  midday: N_('🎯 Midday check-in'),
  evening: N_('🌙 Close the day well'),
};

/** Deterministic line per slot per day, so a nudge never repeats on the same day. */
export function getNudgeLine(slot: NudgeSlot, date = new Date()): string {
  const pool = NUDGE_LINES[slot];
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return pool[(dayIndex * 7 + slot.length) % pool.length];
}
