import { N_ } from '../i18n';

/**
 * ODA's voice for reminders and small moments: a warm friend who believes in
 * you. Short, "you" form, no guilt, no streak threats, no fake urgency. It
 * notices, it invites, it celebrates quietly. Lines rotate by calendar day so
 * the same words don't repeat every day.
 */
export const VOICE = {
  choose: [
    N_('Good morning. What’s one small thing that would make today count?'),
    N_('One decision is enough for today. Want to pick it now?'),
    N_('Morning. Choose something small enough to finish, even on a busy day.'),
  ],
  followThrough: [
    N_('Your decision is still open: “{title}”. Two minutes is enough to start.'),
    N_('How about two minutes for “{title}” now? Starting is the whole trick.'),
    N_('There’s still time for “{title}”. The smallest version counts too.'),
  ],
  comeback: [
    N_('No catching up needed. One small decision today is a fresh start.'),
    N_('Welcome back. Pick the easiest thing you can finish today.'),
  ],
  kept: [
    N_('You did what you said you would. That’s the whole point.'),
    N_('Another promise kept. Quietly, that’s how people change.'),
    N_('Done. Your future self just got one more piece of proof.'),
  ],
} as const;

export type VoiceMoment = keyof typeof VOICE;

/** A stable line for the day: same line all day, a different one tomorrow. */
export function voiceLine(moment: VoiceMoment, date = new Date()): string {
  const lines = VOICE[moment];
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return lines[((day % lines.length) + lines.length) % lines.length];
}
