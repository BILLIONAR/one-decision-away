/**
 * Curated Seasonal Wisdom & Motivational Insights
 * Mapped to 30-day intensive seasons and high-performance principles.
 */

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
    seasonTitle: 'Finish What You Started',
    quote: 'A finished draft is worth ten masterpieces existing only in your imagination.',
    author: 'Principle of Execution',
    theme: 'Completion Sovereignty',
    principle: 'Perfectionism is fear dressed as high standards. Real confidence only comes from closing loops and delivering to reality.',
    actionPrompt: 'Identify the one task you have delayed 3 times this week. Execute its next concrete step before opening your inbox.',
  },
  {
    id: 'wisdom-finish-2',
    seasonId: 'season-finish',
    seasonTitle: 'Finish What You Started',
    quote: 'The cost of an open loop is continuous subconscious friction.',
    author: 'Cognitive Load Law',
    theme: 'Mental Clarity',
    principle: 'Every unfinished project, unanswered proposal, and lingering decision drains working memory. Killing or shipping an idea restores vitality.',
    actionPrompt: 'Either schedule 45 uninterrupted minutes to complete a lingering draft today, or formally decide to discard it forever.',
  },
  {
    id: 'wisdom-finish-3',
    seasonId: 'season-finish',
    seasonTitle: 'Finish What You Started',
    quote: 'Amateurs wait for inspiration; the master sits down at 8:00 AM and begins.',
    author: 'Craftsmanship Doctrine',
    theme: 'The Working Standard',
    principle: 'Momentum is generated through physical initiation, not mental debate. Five minutes of focused execution breaks hours of hesitation.',
    actionPrompt: 'Set a 25-minute timer now. Work with single-task devotion until the bell chimes.',
  },
  {
    id: 'wisdom-finish-4',
    seasonId: 'season-finish',
    seasonTitle: 'Finish What You Started',
    quote: 'Shipping is the only feedback loop that transforms theory into mastery.',
    author: 'Delivery Imperative',
    theme: 'Feedback & Iteration',
    principle: 'Until your work meets another human mind or physical reality, you are learning nothing new. Put it into the arena.',
    actionPrompt: 'Send that completed file, publish that update, or request the decision from your client today.',
  },

  // --- BUILD YOUR INCOME (season-income) ---
  {
    id: 'wisdom-income-1',
    seasonId: 'season-income',
    seasonTitle: 'Build Your Income',
    quote: 'Wealth is what you do not see: the freedom to refuse compromises, buy back your hours, and construct your own environment.',
    author: 'Capital Sovereignty',
    theme: 'Financial Autonomy',
    principle: 'True income building is about creating leverage—packaging your deepest problem-solving ability into structured, scalable value.',
    actionPrompt: 'List the single most valuable outcome you produce for others and clarify how it saves them time, stress, or capital.',
  },
  {
    id: 'wisdom-income-2',
    seasonId: 'season-income',
    seasonTitle: 'Build Your Income',
    quote: 'You do not rise to the level of your financial hopes; you fall to the discipline of your daily margin.',
    author: 'Economic Law',
    theme: 'Capital Discipline',
    principle: 'A higher income without automated savings and clear allocation merely increases high-stress consumption. Guard your cash flow relentlessly.',
    actionPrompt: 'Review your last 7 days of spending. Redirect at least $50 of friction spending directly into your core vision fund.',
  },
  {
    id: 'wisdom-income-3',
    seasonId: 'season-income',
    seasonTitle: 'Build Your Income',
    quote: 'The market rewards specific knowledge, extreme reliability, and courage in negotiation.',
    author: 'Value Exchange Doctrine',
    theme: 'High Leverage Offerings',
    principle: 'Stop competing on volume or panic pricing. Build high-standard assets, document proof, and ask for what the transformation is truly worth.',
    actionPrompt: 'Draft or refine 1 high-tier offer description with clear deliverables and a confident, premium rate.',
  },

  // --- HEALTH RESET (season-health) ---
  {
    id: 'wisdom-health-1',
    seasonId: 'season-health',
    seasonTitle: 'Health Reset',
    quote: 'A person with vitality wants a thousand things; a person without it wants only one.',
    author: 'Biomarker Sanctuary',
    theme: 'Biological Foundation',
    principle: 'Your willpower, decision stamina, and creative audacity are direct outputs of deep sleep, clean cellular hydration, and circadian alignment.',
    actionPrompt: 'Get 15 minutes of natural sunlight in your eyes within 45 minutes of waking, and shut down blue screens 60 minutes before sleep.',
  },
  {
    id: 'wisdom-health-2',
    seasonId: 'season-health',
    seasonTitle: 'Health Reset',
    quote: 'Physical training is not just for the body; it is the daily forge where the mind practices overcoming quiet resistance.',
    author: 'Somatic Mastery',
    theme: 'Physical Resilience',
    principle: 'When you voluntarily embrace physical effort, modern mental stress loses its power over your nervous system.',
    actionPrompt: 'Complete a 30-minute zone-2 walk, run, or resistance session today with zero audio distractions.',
  },
  {
    id: 'wisdom-health-3',
    seasonId: 'season-health',
    seasonTitle: 'Health Reset',
    quote: 'Rest is not a reward for finished work; it is the prerequisite for standard-setting craftsmanship.',
    author: 'Recovery Principle',
    theme: 'Nervous System Recovery',
    principle: 'Continuous partial attention and late-night doom-scrolling deplete cognitive reserves. High performers master the art of complete shutdown.',
    actionPrompt: 'Establish a strict 9:30 PM digital curfew tonight. Switch your phone to airplane mode and pick up a physical book.',
  },

  // --- GENERAL HIGH PERFORMANCE & IDENTITY (general) ---
  {
    id: 'wisdom-general-1',
    seasonId: 'general',
    seasonTitle: 'Sovereign Vision',
    quote: 'You are always exactly one decisive choice away from an entirely different standard of living.',
    author: 'One Decision Away',
    theme: 'Identity & Sovereignty',
    principle: 'Your future is not decided by grand once-a-year resolutions, but by the private standards you uphold when nobody is watching.',
    actionPrompt: 'Identify the one compromise you made yesterday that your Future Self would never accept. Refuse to repeat it today.',
  },
  {
    id: 'wisdom-general-2',
    seasonId: 'general',
    seasonTitle: 'Sovereign Vision',
    quote: 'The environment you tolerate is the ceiling of what you will achieve.',
    author: 'Environmental Design',
    theme: 'Friction Elimination',
    principle: 'High performers do not rely on brute-force willpower; they engineer their physical, digital, and social spaces so that the right action is effortless.',
    actionPrompt: 'Remove 3 sources of visual or digital clutter from your immediate workspace right now.',
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
