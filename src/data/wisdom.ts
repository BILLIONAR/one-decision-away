/**
 * Curated Seasonal Wisdom & Motivational Insights
 * Mapped to 30-day intensive seasons and high-performance principles.
 */

import { N_ } from '../i18n';

export interface SeasonalWisdom {
  id: string;
  seasonId: string; // 'season-finish' | 'season-income' | 'season-health' | 'general'
  seasonTitle: string;
  quote: string;
  author: string;
  theme: string;
  principle: string;
  actionPrompt: string;
}

export const CURATED_SEASONAL_WISDOM: SeasonalWisdom[] = [
  // --- FINISH WHAT YOU STARTED (season-finish) ---
  {
    id: 'wisdom-finish-1',
    seasonId: 'season-finish',
    seasonTitle: N_('Finish What You Started'),
    quote: N_('A finished draft is worth ten masterpieces existing only in your imagination.'),
    author: N_('Principle of Execution'),
    theme: N_('Completion Sovereignty'),
    principle: N_('Perfectionism is fear dressed as high standards. Real confidence only comes from closing loops and delivering to reality.'),
    actionPrompt: N_('Identify the one task you have delayed 3 times this week. Execute its next concrete step before opening your inbox.'),
  },
  {
    id: 'wisdom-finish-2',
    seasonId: 'season-finish',
    seasonTitle: N_('Finish What You Started'),
    quote: N_('The cost of an open loop is continuous subconscious friction.'),
    author: N_('Cognitive Load Law'),
    theme: N_('Mental Clarity'),
    principle: N_('Every unfinished project, unanswered proposal, and lingering decision drains working memory. Killing or shipping an idea restores vitality.'),
    actionPrompt: N_('Either schedule 45 uninterrupted minutes to complete a lingering draft today, or formally decide to discard it forever.'),
  },
  {
    id: 'wisdom-finish-3',
    seasonId: 'season-finish',
    seasonTitle: N_('Finish What You Started'),
    quote: N_('Amateurs wait for inspiration; the master sits down at 8:00 AM and begins.'),
    author: N_('Craftsmanship Doctrine'),
    theme: N_('The Working Standard'),
    principle: N_('Momentum is generated through physical initiation, not mental debate. Five minutes of focused execution breaks hours of hesitation.'),
    actionPrompt: N_('Set a 25-minute timer now. Work with single-task devotion until the bell chimes.'),
  },
  {
    id: 'wisdom-finish-4',
    seasonId: 'season-finish',
    seasonTitle: N_('Finish What You Started'),
    quote: N_('Shipping is the only feedback loop that transforms theory into mastery.'),
    author: N_('Delivery Imperative'),
    theme: N_('Feedback & Iteration'),
    principle: N_('Until your work meets another human mind or physical reality, you are learning nothing new. Put it into the arena.'),
    actionPrompt: N_('Send that completed file, publish that update, or request the decision from your client today.'),
  },

  // --- BUILD YOUR INCOME (season-income) ---
  {
    id: 'wisdom-income-1',
    seasonId: 'season-income',
    seasonTitle: N_('Build Your Income'),
    quote: N_('Wealth is what you do not see: the freedom to refuse compromises, buy back your hours, and construct your own environment.'),
    author: N_('Capital Sovereignty'),
    theme: N_('Financial Autonomy'),
    principle: N_('True income building is about creating leverage—packaging your deepest problem-solving ability into structured, scalable value.'),
    actionPrompt: N_('List the single most valuable outcome you produce for others and clarify how it saves them time, stress, or capital.'),
  },
  {
    id: 'wisdom-income-2',
    seasonId: 'season-income',
    seasonTitle: N_('Build Your Income'),
    quote: N_('You do not rise to the level of your financial hopes; you fall to the discipline of your daily margin.'),
    author: N_('Economic Law'),
    theme: N_('Capital Discipline'),
    principle: N_('A higher income without automated savings and clear allocation merely increases high-stress consumption. Guard your cash flow relentlessly.'),
    actionPrompt: N_('Review your last 7 days of spending. Redirect at least $50 of friction spending directly into your core vision fund.'),
  },
  {
    id: 'wisdom-income-3',
    seasonId: 'season-income',
    seasonTitle: N_('Build Your Income'),
    quote: N_('The market rewards specific knowledge, extreme reliability, and courage in negotiation.'),
    author: N_('Value Exchange Doctrine'),
    theme: N_('High Leverage Offerings'),
    principle: N_('Stop competing on volume or panic pricing. Build high-standard assets, document proof, and ask for what the transformation is truly worth.'),
    actionPrompt: N_('Draft or refine 1 high-tier offer description with clear deliverables and a confident, premium rate.'),
  },

  // --- HEALTH RESET (season-health) ---
  {
    id: 'wisdom-health-1',
    seasonId: 'season-health',
    seasonTitle: N_('Health Reset'),
    quote: N_('A person with vitality wants a thousand things; a person without it wants only one.'),
    author: N_('Biomarker Sanctuary'),
    theme: N_('Biological Foundation'),
    principle: N_('Your willpower, decision stamina, and creative audacity are direct outputs of deep sleep, clean cellular hydration, and circadian alignment.'),
    actionPrompt: N_('Get 15 minutes of natural sunlight in your eyes within 45 minutes of waking, and shut down blue screens 60 minutes before sleep.'),
  },
  {
    id: 'wisdom-health-2',
    seasonId: 'season-health',
    seasonTitle: N_('Health Reset'),
    quote: N_('Physical training is not just for the body; it is the daily forge where the mind practices overcoming quiet resistance.'),
    author: N_('Somatic Mastery'),
    theme: N_('Physical Resilience'),
    principle: N_('When you voluntarily embrace physical effort, modern mental stress loses its power over your nervous system.'),
    actionPrompt: N_('Complete a 30-minute zone-2 walk, run, or resistance session today with zero audio distractions.'),
  },
  {
    id: 'wisdom-health-3',
    seasonId: 'season-health',
    seasonTitle: N_('Health Reset'),
    quote: N_('Rest is not a reward for finished work; it is the prerequisite for standard-setting craftsmanship.'),
    author: N_('Recovery Principle'),
    theme: N_('Nervous System Recovery'),
    principle: N_('Continuous partial attention and late-night doom-scrolling deplete cognitive reserves. High performers master the art of complete shutdown.'),
    actionPrompt: N_('Establish a strict 9:30 PM digital curfew tonight. Switch your phone to airplane mode and pick up a physical book.'),
  },

  // --- GENERAL HIGH PERFORMANCE & IDENTITY (general) ---
  {
    id: 'wisdom-general-1',
    seasonId: 'general',
    seasonTitle: N_('Sovereign Vision'),
    quote: N_('You are always exactly one decisive choice away from an entirely different standard of living.'),
    author: N_('One Decision Away'),
    theme: N_('Identity & Sovereignty'),
    principle: N_('Your future is not decided by grand once-a-year resolutions, but by the private standards you uphold when nobody is watching.'),
    actionPrompt: N_('Identify the one compromise you made yesterday that your Future Self would never accept. Refuse to repeat it today.'),
  },
  {
    id: 'wisdom-general-2',
    seasonId: 'general',
    seasonTitle: N_('Sovereign Vision'),
    quote: N_('The environment you tolerate is the ceiling of what you will achieve.'),
    author: N_('Environmental Design'),
    theme: N_('Friction Elimination'),
    principle: N_('High performers do not rely on brute-force willpower; they engineer their physical, digital, and social spaces so that the right action is effortless.'),
    actionPrompt: N_('Remove 3 sources of visual or digital clutter from your immediate workspace right now.'),
  },
];

/**
 * Returns curated wisdom items matching a season ID or general wisdom.
 */
export function getWisdomForSeason(seasonId?: string): SeasonalWisdom[] {
  if (!seasonId) {
    return CURATED_SEASONAL_WISDOM;
  }
  const seasonSpecific = CURATED_SEASONAL_WISDOM.filter((w) => w.seasonId === seasonId);
  if (seasonSpecific.length > 0) {
    return seasonSpecific;
  }
  return CURATED_SEASONAL_WISDOM.filter((w) => w.seasonId === 'general');
}

/**
 * Gets the daily insight for today based on active season and day of month.
 */
export function getDailyWisdomInsight(seasonId?: string, customIndex?: number): SeasonalWisdom {
  const list = getWisdomForSeason(seasonId);
  if (list.length === 0) return CURATED_SEASONAL_WISDOM[0];
  
  if (typeof customIndex === 'number') {
    const safeIdx = Math.abs(customIndex) % list.length;
    return list[safeIdx];
  }

  // Pick deterministic item based on day of year
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return list[dayOfYear % list.length];
}
