/**
 * Curated library of inspiring daily affirmations and philosophical quotes.
 * Spans self-mastery, high agency, future vision, discipline, deep focus, and sovereignty.
 */

export interface Affirmation {
  id: string;
  quote: string;
  author: string;
  category: 'Mastery' | 'Vision' | 'Discipline' | 'Agency' | 'Peace' | 'Compounding';
  reflection: string;
  actionCue: string;
}

export const CURATED_AFFIRMATIONS: Affirmation[] = [
  {
    id: 'aff-1',
    quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    category: 'Compounding',
    reflection: 'Focus on building frictionless daily rituals rather than stressing over distant outcomes.',
    actionCue: 'Refine one routine today to remove resistance before you start working.',
  },
  {
    id: 'aff-2',
    quote: 'We suffer more often in imagination than in reality.',
    author: 'Seneca',
    category: 'Peace',
    reflection: 'The friction you anticipate is almost always larger than the physical task itself.',
    actionCue: 'Take the first 2-minute step on what you have been overthinking.',
  },
  {
    id: 'aff-3',
    quote: 'Waste no more time arguing about what a good person should be. Be one.',
    author: 'Marcus Aurelius',
    category: 'Agency',
    reflection: 'Identity is demonstrated through action in real-time, not through philosophical intentions.',
    actionCue: 'Close the gap between your ideal self and your next immediate choice.',
  },
  {
    id: 'aff-4',
    quote: 'A champion is defined not by their wins but by how they can recover when they fall.',
    author: 'Serena Williams',
    category: 'Mastery',
    reflection: 'Resilience is not the absence of setbacks; it is the speed of your reset.',
    actionCue: 'Reset your focus immediately if your morning was derailed.',
  },
  {
    id: 'aff-5',
    quote: 'The future belongs to those who believe in the beauty of their dreams and back it with unrelenting craft.',
    author: 'Eleanor Roosevelt',
    category: 'Vision',
    reflection: 'Holding a lucid vision gives direction, but daily craftsmanship gives it physical form.',
    actionCue: 'Dedicate one undistracted block purely to your highest-leverage vision item.',
  },
  {
    id: 'aff-6',
    quote: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Abraham Lincoln',
    category: 'Discipline',
    reflection: 'Every temptation resisted is an immediate deposit into the reality of your future self.',
    actionCue: 'Say no to one low-value impulse today to protect your deep work hours.',
  },
  {
    id: 'aff-7',
    quote: 'The secret of getting ahead is getting started.',
    author: 'Mark Twain',
    category: 'Agency',
    reflection: 'Action creates the clarity and motivation that thinking alone cannot produce.',
    actionCue: 'Initiate your hardest task for just five focused minutes right now.',
  },
  {
    id: 'aff-8',
    quote: 'What we achieve inwardly will change outer reality.',
    author: 'Plutarch',
    category: 'Mastery',
    reflection: 'Your external life is a trailing indicator of your internal standards and beliefs.',
    actionCue: 'Hold your poise and posture as the person you are evolving to become.',
  },
  {
    id: 'aff-9',
    quote: 'Do not wait; the time will never be "just right." Start where you stand, and work with whatever tools you may have at your command.',
    author: 'George Herbert',
    category: 'Agency',
    reflection: 'Waiting for ideal conditions is subtle procrastination. Excellence thrives within constraints.',
    actionCue: 'Ship your current milestone with the resources you possess today.',
  },
  {
    id: 'aff-10',
    quote: 'Simplicity is the prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
    category: 'Compounding',
    reflection: 'Complicated plans break easily. Simple, repeatable habits sustain momentum forever.',
    actionCue: 'Strip away the unnecessary steps from your main daily workflow.',
  },
  {
    id: 'aff-11',
    quote: 'The mind is everything. What you think you become.',
    author: 'Buddha',
    category: 'Peace',
    reflection: 'Your dominant internal monologue sculpts your physical perception and choices.',
    actionCue: 'Replace self-limiting commentary with calm, decisive certainty.',
  },
  {
    id: 'aff-12',
    quote: 'If you want to go fast, go alone. If you want to go far, go together with clear vision and uncompromising standards.',
    author: 'Proverb of Sovereignty',
    category: 'Vision',
    reflection: 'Long-term endurance requires protecting your energy and aligning with high-standard peers.',
    actionCue: 'Acknowledge someone who uplifts your standards or share your progress.',
  },
  {
    id: 'aff-13',
    quote: 'Small deeds done are better than great deeds planned.',
    author: 'Peter Marshall',
    category: 'Discipline',
    reflection: 'A single completed micro-task creates more neurological momentum than ten master outlines.',
    actionCue: 'Finish and check off one lingering micro-item right this minute.',
  },
  {
    id: 'aff-14',
    quote: 'He who has a why to live can bear almost any how.',
    author: 'Friedrich Nietzsche',
    category: 'Vision',
    reflection: 'When your emotional anchor to your future life is vivid, momentary discomfort fades.',
    actionCue: 'Revisit why your top vision item matters to your personal sovereignty.',
  },
  {
    id: 'aff-15',
    quote: 'It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.',
    author: 'Seneca',
    category: 'Agency',
    reflection: 'Hesitation magnifies obstacles. Audacity and swift action shrink them to scale.',
    actionCue: 'Make the courageous phone call or send the proposal you have been postponing.',
  },
  {
    id: 'aff-16',
    quote: 'Continuous effort—not strength or intelligence—is the key to unlocking our potential.',
    author: 'Winston Churchill',
    category: 'Mastery',
    reflection: 'Relentless consistency outperforms intermittent bursts of genius every time.',
    actionCue: 'Keep your streak unbroken today regardless of external circumstances.',
  },
  {
    id: 'aff-17',
    quote: 'Your time is limited, so don\'t waste it living someone else\'s life.',
    author: 'Steve Jobs',
    category: 'Vision',
    reflection: 'Refuse to conform to defaults. Author your schedule around what truly matters to you.',
    actionCue: 'Audit today\'s calendar and decline one distraction that does not serve your vision.',
  },
  {
    id: 'aff-18',
    quote: 'Quiet the mind, and the soul will speak.',
    author: 'Ma Jaya Sati Bhagavati',
    category: 'Peace',
    reflection: 'In a noisy world, silence is a superpower that unlocks deep insight and original thoughts.',
    actionCue: 'Take 3 deliberate deep breaths before diving into your next focus block.',
  },
  {
    id: 'aff-19',
    quote: 'The impediment to action advances action. What stands in the way becomes the way.',
    author: 'Marcus Aurelius',
    category: 'Mastery',
    reflection: 'Treat modern roadblocks not as stops, but as the exact curriculum designed to sharpen you.',
    actionCue: 'Find the hidden advantage in today\'s most annoying hurdle.',
  },
  {
    id: 'aff-20',
    quote: 'Focus is a muscle. The more you protect it from fragmentation, the greater its generative power.',
    author: 'Deep Work Philosophy',
    category: 'Discipline',
    reflection: 'Multitasking is an illusion that drains cognitive bandwidth. Single-tasking is mastery.',
    actionCue: 'Close all unrelated browser tabs before starting your next sprint.',
  },
  {
    id: 'aff-21',
    quote: 'Wealth consists not in having great possessions, but in having few wants and abundant margin.',
    author: 'Epictetus',
    category: 'Compounding',
    reflection: 'Freedom is the gap between your income and your ego. Guard your margin relentlessly.',
    actionCue: 'Celebrate intentional frugality today and direct saved capital toward your vision fund.',
  },
  {
    id: 'aff-22',
    quote: 'Energy flows where attention goes. Anchor your attention to the life you are building.',
    author: 'Michael Beckwith',
    category: 'Vision',
    reflection: 'Where you place your gaze determines the emotional tone and trajectory of your day.',
    actionCue: 'Visualize the physical details of your future milestone for 30 seconds.',
  },
  {
    id: 'aff-23',
    quote: 'Do what you can, with what you have, where you are.',
    author: 'Theodore Roosevelt',
    category: 'Agency',
    reflection: 'High agency individuals never wait for permissions or ideal resources to begin.',
    actionCue: 'Create something of value with the exact tools sitting on your desk.',
  },
  {
    id: 'aff-24',
    quote: 'The only person you are destined to become is the person you decide to be.',
    author: 'Ralph Waldo Emerson',
    category: 'Vision',
    reflection: 'Your past does not define your trajectory. Today\'s decisions rewrite your identity.',
    actionCue: 'Act with the calm confidence of your Future Self right now.',
  },
];

/**
 * Returns a daily deterministic affirmation based on the calendar date.
 */
export function getDailyAffirmation(dateOffset: number = 0): Affirmation {
  const now = new Date();
  // Epoch day calculation
  const dayIndex = Math.floor(now.getTime() / (1000 * 60 * 60 * 24)) + dateOffset;
  const safeIndex = Math.abs(dayIndex) % CURATED_AFFIRMATIONS.length;
  return CURATED_AFFIRMATIONS[safeIndex];
}

/**
 * Returns a randomized affirmation, optionally excluding a specific ID.
 */
export function getRandomAffirmation(excludeId?: string, category?: string): Affirmation {
  let pool = CURATED_AFFIRMATIONS;
  if (category && category !== 'All') {
    pool = pool.filter((a) => a.category === category);
  }
  if (pool.length === 0) pool = CURATED_AFFIRMATIONS;

  const eligible = excludeId ? pool.filter((a) => a.id !== excludeId) : pool;
  const list = eligible.length > 0 ? eligible : pool;
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}
