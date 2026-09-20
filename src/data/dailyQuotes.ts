import { N_ } from '../i18n';

/**
 * Short, action-driving lines shown at the top of Today — one per day,
 * chosen deterministically from the date so everyone's day has one voice.
 * Written in the app's own voice (no attributions needed).
 */
export const DAILY_QUOTES: string[] = [
  N_("Your future is built before breakfast or not at all."),
  N_("One kept promise to yourself outweighs a hundred plans."),
  N_("The life you want is on the other side of the task you avoid."),
  N_("Start before you feel ready. Readiness follows action."),
  N_("Discipline is choosing the same future twice."),
  N_("Today's ten minutes beat tomorrow's two hours."),
  N_("You don't find time. You take it."),
  N_("Small decisions, kept daily, become an unrecognizable life."),
  N_("Motivation is a visitor. Habit is a resident."),
  N_("The dream doesn't need you to be perfect. It needs you to show up."),
  N_("Every avoided decision is a decision to stay."),
  N_("Do the hard thing first. The day gets lighter."),
  N_("You are always one decision away from a different day."),
  N_("What you repeat, you become."),
  N_("Your streak doesn't care how you feel. It cares what you do next."),
  N_("Done today is stronger than perfect someday."),
  N_("Quiet mornings build loud futures."),
  N_("Don't negotiate with the alarm. Negotiate with your future."),
  N_("Effort compounds in silence."),
  N_("The version of you in three years is watching today."),
  N_("A focused hour is a vote for the life you said you wanted."),
  N_("Comfort is expensive. It costs the future."),
  N_("Begin. The bridge appears as you walk."),
  N_("Nobody is coming. That is the good news."),
  N_("Protect the first hour and the day protects itself."),
  N_("You can't think your way into a new life. You act your way there."),
  N_("The task shrinks the moment you touch it."),
  N_("Keep the promise small enough to keep."),
  N_("Rest is part of the work. Escape is not."),
  N_("Direction beats speed. Choose, then walk."),
  N_("Your habits are voting for a future. Check the ballot."),
  N_("The excuse also takes energy. Spend it on the task."),
  N_("One honest page beats a week of intentions."),
  N_("Show up on the gray days. That's where the gap closes."),
  N_("The future doesn't arrive. It accumulates."),
  N_("Choose the discomfort that pays rent."),
  N_("Waiting is also a habit. Break it like one."),
  N_("Make it easy to start and hard to quit."),
  N_("A calm mind is a working tool, not a luxury."),
  N_("Today is the oldest you've been and the youngest you'll be. Use it."),
  N_("Your attention is the currency. Spend it like money."),
  N_("Finish something small before noon."),
  N_("The plan is not the work."),
  N_("Doubt gets a vote, not a veto."),
  N_("You water what you look at. Look at the dream."),
  N_("Slow is fine. Stopped is the only failure."),
  N_("Say no to the good so you can say yes to the built."),
  N_("Your environment is a decision you make once and obey daily."),
  N_("Act like the person you wrote about last night."),
  N_("The first rep is the decision. The rest is momentum."),
  N_("Don't count the days you missed. Count the one in front of you."),
  N_("A short walk fixes more than a long scroll."),
  N_("Earn the evening."),
  N_("Write it down. The mind is for deciding, not storing."),
  N_("What scares you at 9 is done by 9:20 if you start at 9."),
  N_("Consistency looks boring for weeks and unbelievable in a year."),
  N_("You built today's normal. You can build a different one."),
  N_("Ask less of the mood and more of the calendar."),
  N_("The distance between you and the dream is measured in kept days."),
  N_("Decide once, in the morning, and let the day obey."),
];

/** Deterministic quote of the day (stable for the whole calendar day). */
export function getDailyQuote(date: Date = new Date()): string {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const day = Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - start) / 86400000);
  return DAILY_QUOTES[(date.getFullYear() * 366 + day) % DAILY_QUOTES.length];
}
