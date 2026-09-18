/**
 * Daily nudges — short, second-person lines sent as notifications 2–3 times a day.
 * Morning ignites, midday re-aims, evening closes with kindness.
 */

export type NudgeSlot = 'morning' | 'midday' | 'evening';

export const NUDGE_LINES: Record<NudgeSlot, string[]> = {
  morning: [
    'Good morning. One decision today is enough. Choose it before the day chooses for you.',
    'Your future self is already awake. Give them one thing to be proud of by tonight.',
    'You don\'t need motivation. You need the first two minutes. Start there.',
    'Today is not a rehearsal. Pick the one action that actually moves the line.',
    'The default future is built by accident. The built future is built before 10am.',
    'Small, done, today. That\'s the whole system.',
    'Whatever you avoided yesterday is the One Decision for today.',
    'You have kept your word before. Do it again, quietly, this morning.',
    'Discipline is remembering what you want. So: what do you want?',
    'Every Dream Dollar is a vote. Cast the first one before breakfast.',
    'Calm mornings are made, not found. Set the decision, then move.',
    'The person you\'re becoming shows up in the next hour. Let them.',
    'One brave email. One hard workout. One honest page. Pick one.',
    'You\'re one decision away. Not someday — today.',
    'Begin before you feel ready. Readiness is a result, not a requirement.',
  ],
  midday: [
    'Halfway check: has the default future gotten a vote yet? Take one back.',
    'If the One Decision isn\'t done, this is the hour. 25 minutes, phone away.',
    'Drifting is normal. Noticing is the skill. Notice, then return.',
    'You don\'t have to finish. You have to continue.',
    'The scroll will still be there. The momentum won\'t. Choose momentum.',
    'Energy low? Do the smallest true version of the task. Then decide again.',
    'Say no to one thing this afternoon so you can say yes to the thing that matters.',
    'Your streak doesn\'t care how you feel. It cares what you do next.',
    'Ten focused minutes now beats a perfect plan for tomorrow.',
    'Lunch is over. So is the excuse. Back to the one thing.',
    'Progress today is measured in decisions kept, not hours worried.',
    'Quick reset: three slow breaths, one clear task, go.',
    'The dream on your board is a few hundred good afternoons away. This is one of them.',
    'Comfort is asking for a vote. Politely decline.',
    'Recommit, don\'t restart. Pick up exactly where you left off.',
  ],
  evening: [
    'Close the day gently. What was the one thing you did right? Hold it.',
    'Tomorrow\'s One Decision is easier to keep if you name it tonight.',
    'You did enough. Rest is part of the system, not a break from it.',
    'Did the default future win today? Log it honestly. Then let it go.',
    'Ten minutes with your vision board before bed does more than an hour of worry.',
    'A calm evening is a decision too. Phone down, lights low, mind quiet.',
    'Write one line in the journal: what did today teach you?',
    'The streak is safe if you kept your word. If not, tomorrow is a clean page.',
    'Gratitude before sleep: one person, one thing, one moment.',
    'The future you\'re building is one good night\'s sleep closer.',
    'No verdicts tonight. Only notes for tomorrow.',
    'You are allowed to be proud of a small day.',
    'Set out tomorrow\'s first step where you\'ll see it in the morning.',
    'Breathe out the day. It\'s done. You showed up.',
    'Rest like it matters. Tomorrow you decide again.',
  ],
};

export const DEFAULT_NUDGE_TIMES: Record<NudgeSlot, string> = {
  morning: '08:00',
  midday: '13:30',
  evening: '20:30',
};

export const NUDGE_TITLES: Record<NudgeSlot, string> = {
  morning: '☀️ One Decision Away',
  midday: '🎯 Midday check-in',
  evening: '🌙 Close the day well',
};

/** Deterministic line per slot per day, so a nudge never repeats on the same day. */
export function getNudgeLine(slot: NudgeSlot, date = new Date()): string {
  const pool = NUDGE_LINES[slot];
  const dayIndex = Math.floor(date.getTime() / 86400000);
  return pool[(dayIndex * 7 + slot.length) % pool.length];
}
