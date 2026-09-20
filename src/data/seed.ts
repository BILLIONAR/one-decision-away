/**
 * One Decision Away — Seed Data
 * Pure original data, generic items, zero real-world logos/trademarks.
 */

import { MarketItem, Season, Goal, Mission, BudgetAllocations, MicroHabit, DailyCheckIn, CustomHabitCategory, DailyPrimaryGoal } from '../types/models';
import { N_ } from '../i18n';

export const SEED_MARKET_ITEMS: MarketItem[] = [
  // --- REAL ESTATE & VILLAS ---
  {
    id: 'seed-modern-cliff-villa',
    name: N_('Mediterranean Cliffside Infinity Villa'),
    category: 'Homes',
    dreamDollarPrice: 45000,
    realPriceUsd: 4800000,
    description: N_('Cantilevered architectural glass villa suspended above the azure coastline with heated perimeter infinity pool and private garden terraces.'),
    illustrationKey: 'peaceful_home',
    customImageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-beverly-mansion',
    name: N_('Modernist Architectural Estate'),
    category: 'Homes',
    dreamDollarPrice: 55000,
    realPriceUsd: 6500000,
    description: N_('Expansive private resort-style sanctuary featuring floor-to-ceiling motorized glass facades, subterranean cinema, and zero-edge pool.'),
    illustrationKey: 'peaceful_home',
    customImageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-manhattan-penthouse',
    name: N_('Manhattan Skyline Duplex Penthouse'),
    category: 'Homes',
    dreamDollarPrice: 68000,
    realPriceUsd: 8500000,
    description: N_('Private key-elevator sky residence with 360-degree metropolitan panoramic views, 24ft ceilings, and wrap-around terrace.'),
    illustrationKey: 'peaceful_home',
    customImageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-nordic-sanctuary',
    name: N_('Contemporary Glass Forest Sanctuary'),
    category: 'Homes',
    dreamDollarPrice: 28000,
    realPriceUsd: 2200000,
    description: N_('Minimalist Scandinavian concrete and cedar pavilion surrounded by quiet pines with geothermal climate control and private sauna.'),
    illustrationKey: 'peaceful_home',
    customImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-tuscany-villa',
    name: N_('Tuscan Stone Villa & Olive Grove'),
    category: 'Homes',
    dreamDollarPrice: 32000,
    realPriceUsd: 3100000,
    description: N_('Restored 18th-century stone farmhouse overlooking rolling cypress hills with private vineyard, wine cellar, and open-air loggia.'),
    illustrationKey: 'peaceful_home',
    customImageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },

  // --- SUPERCARS & MOBILITY ---
  {
    id: 'seed-porsche-gt3',
    name: N_('Porsche 911 GT3 RS in Slate Grey'),
    category: 'Cars & Mobility',
    dreamDollarPrice: 18000,
    realPriceUsd: 290000,
    description: N_('Naturally aspirated 4.0-liter flat-six engineering precision, swan-neck aero wing, and lightning dual-clutch transmission.'),
    illustrationKey: 'reliable_car',
    customImageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-mercedes-amg-gt',
    name: N_('Mercedes-AMG GT R Edition'),
    category: 'Cars & Mobility',
    dreamDollarPrice: 14000,
    realPriceUsd: 195000,
    description: N_('Twin-turbocharged handcrafted V8 engine with active aerodynamics, carbon-ceramic brakes, and track-honed telemetry.'),
    illustrationKey: 'reliable_car',
    customImageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-aston-martin',
    name: N_('Aston Martin DB12 Super Tourer'),
    category: 'Cars & Mobility',
    dreamDollarPrice: 16500,
    realPriceUsd: 260000,
    description: N_('Quintessential British ultra-luxury grand tourer with Bridge of Weir leather cockpit and 680hp twin-turbo powertrain.'),
    illustrationKey: 'reliable_car',
    customImageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-g63-amg',
    name: N_('Mercedes-AMG G63 Matte Edition'),
    category: 'Cars & Mobility',
    dreamDollarPrice: 15000,
    realPriceUsd: 220000,
    description: N_('Iconic all-terrain luxury fortress featuring handcrafted diamond-stitched leather, side-pipe exhaust rumble, and triple locking differentials.'),
    illustrationKey: 'reliable_car',
    customImageUrl: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-ferrari-classic',
    name: N_('Ferrari Maranello Grand Tourer'),
    category: 'Cars & Mobility',
    dreamDollarPrice: 22000,
    realPriceUsd: 380000,
    description: N_('Italian racing pedigree with screaming V12 engine, sculptured carbon fiber bodywork, and timeless Rosso Corsa finish.'),
    illustrationKey: 'reliable_car',
    customImageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },

  // --- HAUTE HORLOGERIE & LUXURY WATCHES ---
  {
    id: 'seed-patek-nautilus',
    name: N_('Patek Philippe Nautilus 5711'),
    category: 'Luxury Watches',
    dreamDollarPrice: 8500,
    realPriceUsd: 110000,
    description: N_('Legendary hand-finished Swiss stainless steel timepiece with porthole bezel, integrated bracelet, and blue horizontal embossed dial.'),
    illustrationKey: 'work_machine',
    customImageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-rolex-submariner',
    name: N_('Rolex Submariner Date Cerachrom'),
    category: 'Luxury Watches',
    dreamDollarPrice: 4200,
    realPriceUsd: 14500,
    description: N_('Benchmark Swiss oystersteel dive chronometer with unidirectional Cerachrom ceramic bezel and automatic Calibre 3235 movement.'),
    illustrationKey: 'work_machine',
    customImageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-ap-royal-oak',
    name: N_('Audemars Piguet Skeleton Tourbillon'),
    category: 'Luxury Watches',
    dreamDollarPrice: 12000,
    realPriceUsd: 180000,
    description: N_('Haute horlogerie openworked movement exposing intricate balance wheels and hand-beveled bridges in solid brushed titanium.'),
    illustrationKey: 'work_machine',
    customImageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-alange-perpetual',
    name: N_('A. Lange & Söhne Rose Gold Chronograph'),
    category: 'Luxury Watches',
    dreamDollarPrice: 7500,
    realPriceUsd: 95000,
    description: N_('German Saxon masterpiece in 18k rose gold with perpetual moonphase, alligator strap, and hand-engraved balance cock.'),
    illustrationKey: 'work_machine',
    customImageUrl: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-minimal-horology',
    name: N_('Grand Horizon Automatic Watch'),
    category: 'Luxury Watches',
    dreamDollarPrice: 2800,
    realPriceUsd: 6500,
    description: N_('Understated minimalist dress watch with sapphire crystal, exhibition caseback, and 72-hour power reserve.'),
    illustrationKey: 'work_machine',
    customImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },

  // --- YACHTS & AVIATION ---
  {
    id: 'seed-superyacht-riviera',
    name: N_('60-Meter Mediterranean Superyacht Charter'),
    category: 'Yachts & Aviation',
    dreamDollarPrice: 35000,
    realPriceUsd: 650000,
    description: N_('Triple-deck private yacht with beach club, sundeck jacuzzi, dedicated chef crew, and cruising between Monaco, Cannes, and Portofino.'),
    illustrationKey: 'cabin_weekend',
    customImageUrl: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-private-jet',
    name: N_('Gulfstream Transcontinental Private Jet Flight'),
    category: 'Yachts & Aviation',
    dreamDollarPrice: 16000,
    realPriceUsd: 120000,
    description: N_('Zero-friction private aviation travel with bespoke lie-flat leather suites, high-altitude connectivity, and VIP ramp departure.'),
    illustrationKey: 'biz_launch',
    customImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },

  // --- EXPERIENCES & WORKSPACE & MEANING ---
  {
    id: 'seed-michelin-chef',
    name: N_('Private Michelin 3-Star Chef Residency'),
    category: 'Experiences',
    dreamDollarPrice: 2800,
    realPriceUsd: 12000,
    description: N_('Ten-course bespoke gastronomic dining journey orchestrated in your private dining room with rare vintage wine pairings.'),
    illustrationKey: 'morning_ritual',
    customImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-creative-studio',
    name: N_('Architectural Sunlit Studio Space'),
    category: 'Dream Workspace',
    dreamDollarPrice: 12000,
    realPriceUsd: 25000,
    description: N_('A dedicated minimalist studio space with acoustic treatment, dual ultra-wide displays, drafting bench, and zero clutter.'),
    illustrationKey: 'creative_studio',
    customImageUrl: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-japan-month',
    name: N_('Cultural Grand Tour of Japan'),
    category: 'Travel',
    dreamDollarPrice: 9000,
    realPriceUsd: 18000,
    description: N_('Thirty days in Kyoto and Tokyo ryokans, learning traditional craftsmanship, bullet train expeditions, and tea ceremonies.'),
    illustrationKey: 'japan_month',
    customImageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-health-retreat',
    name: N_('Alpine Thermal Longevity Retreat'),
    category: 'Health & Wellness',
    dreamDollarPrice: 4000,
    realPriceUsd: 8500,
    description: N_('Seven days of guided physical conditioning, biomarker diagnostics, thermal mineral baths, and circadian reset in the Swiss Alps.'),
    illustrationKey: 'health_retreat',
    customImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-freedom-fund',
    name: N_('Emergency Freedom Fund'),
    category: 'Business',
    dreamDollarPrice: 15000,
    realPriceUsd: 50000,
    description: N_('Six full months of living expenses untouched in liquid reserves, giving complete autonomy over career choices.'),
    illustrationKey: 'freedom_fund',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'seed-giving-fund',
    name: N_('Annual Philanthropy & Youth Fund'),
    category: 'Giving',
    dreamDollarPrice: 3000,
    realPriceUsd: 10000,
    description: N_('Dedicated capital allocated directly to local community youth learning, arts, and literacy programs.'),
    illustrationKey: 'giving_fund',
    isSeed: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const SEED_SEASONS: Season[] = [
  {
    id: 'season-finish',
    title: N_('Finish What You Started'),
    subtitle: N_('30-Day Focus on Completion'),
    description: N_('Close open loops, eliminate half-finished drafts, and experience the calmness of true delivery.'),
    theme: N_('Close open loops, eliminate half-finished drafts, and experience the calmness of true delivery.'),
    durationDays: 30,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    badgeName: N_('The Finisher Seal'),
    rewardBadgeTitle: N_('The Finisher Seal'),
    cosmeticReward: N_('Slate & Sage Profile Aura'),
    missions: [
      { id: 's1-m1', title: N_('Audit and list all unfinished projects'), area: 'Work', difficulty: 'easy', rewardDreamDollar: 150 },
      { id: 's1-m2', title: N_('Discard or formally cancel 3 stale ideas'), area: 'Personal Meaning', difficulty: 'easy', rewardDreamDollar: 150 },
      { id: 's1-m3', title: N_('Ship or publish 1 completed artifact'), area: 'Work', difficulty: 'hard', rewardDreamDollar: 750 },
      { id: 's1-m4', title: N_('Clean your digital and physical workspaces'), area: 'Environment', difficulty: 'medium', rewardDreamDollar: 300 },
      { id: 's1-m5', title: N_('Hold a weekly project retrospective'), area: 'Learning', difficulty: 'easy', rewardDreamDollar: 200 },
    ],
  },
  {
    id: 'season-income',
    title: N_('Build Your Income'),
    subtitle: N_('30-Day Financial Autonomy Sprint'),
    description: N_('Turn your highest leverage skills into structured offers and build tangible economic resilience.'),
    theme: N_('Turn your highest leverage skills into structured offers and build tangible economic resilience.'),
    durationDays: 30,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    badgeName: N_('Autonomy Catalyst'),
    rewardBadgeTitle: N_('Autonomy Catalyst'),
    cosmeticReward: N_('Architect Frame'),
    missions: [
      { id: 's2-m1', title: N_('Calculate your exact personal monthly burn rate'), area: 'Money', difficulty: 'easy', rewardDreamDollar: 150 },
      { id: 's2-m2', title: N_('Define 1 high-value problem you can solve for others'), area: 'Work', difficulty: 'medium', rewardDreamDollar: 350 },
      { id: 's2-m3', title: N_('Present an offer to 3 qualified people'), area: 'Work', difficulty: 'hard', rewardDreamDollar: 800 },
      { id: 's2-m4', title: N_('Automate 1 recurring savings deposit'), area: 'Money', difficulty: 'easy', rewardDreamDollar: 200 },
      { id: 's2-m5', title: N_('Eliminate 2 redundant monthly subscriptions'), area: 'Money', difficulty: 'easy', rewardDreamDollar: 150 },
    ],
  },
  {
    id: 'season-health',
    title: N_('Health Reset'),
    subtitle: N_('30-Day Energy & Biomarker Calibration'),
    description: N_('Restore deep sleep architecture, clean fuel intake, and purposeful physical movement.'),
    theme: N_('Restore deep sleep architecture, clean fuel intake, and purposeful physical movement.'),
    durationDays: 30,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    badgeName: N_('Vitality Anchor'),
    rewardBadgeTitle: N_('Vitality Anchor'),
    cosmeticReward: N_('Emerald Glow Badge'),
    missions: [
      { id: 's3-m1', title: N_('Establish a 10:00 PM digital curfew for 7 days'), area: 'Health', difficulty: 'medium', rewardDreamDollar: 300 },
      { id: 's3-m2', title: N_('Complete 4 zone-2 cardio or lifting sessions'), area: 'Health', difficulty: 'medium', rewardDreamDollar: 400 },
      { id: 's3-m3', title: N_('Prepare 5 days of whole-food lunches in advance'), area: 'Health', difficulty: 'easy', rewardDreamDollar: 250 },
      { id: 's3-m4', title: N_('Spend 20 minutes outside in morning sunlight daily'), area: 'Health', difficulty: 'easy', rewardDreamDollar: 150 },
      { id: 's3-m5', title: N_('Hydrate with mineral water before morning caffeine'), area: 'Health', difficulty: 'easy', rewardDreamDollar: 100 },
    ],
  },
];

export const SEED_INITIAL_GOALS: Goal[] = [
  {
    id: 'goal-seed-1',
    userId: 'demo-user',
    title: N_('Build a sustainable online income'),
    description: N_('Create an independent digital service generating reliable monthly cash flow & sovereignty.'),
    area: 'Work',
    targetDate: '2026-12-31',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'goal-seed-2',
    userId: 'demo-user',
    title: N_('Feel strong and healthy'),
    description: N_('Build sustained cellular energy, VO2 max capacity, and morning metabolic alertness.'),
    area: 'Health',
    targetDate: '2026-11-30',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'goal-seed-3',
    userId: 'demo-user',
    title: N_('Focus on what matters'),
    description: N_('Guard attention against reactive digital noise, building daily cognitive discipline.'),
    area: 'Personal Meaning',
    targetDate: '2026-12-31',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'goal-seed-4',
    userId: 'demo-user',
    title: N_('Save for real dreams'),
    description: N_('Systematically fund dream purchases and eliminate consumer impulse spending.'),
    area: 'Money',
    targetDate: '2027-06-30',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const SEED_INITIAL_MISSIONS: Mission[] = [
  {
    id: 'mission-seed-2',
    userId: 'demo-user',
    title: N_('Review this week\'s spending'),
    type: 'weekly_mission',
    area: 'Money',
    difficulty: 'easy',
    estimatedMinutes: 20,
    isOneDecision: false,
    recurring: 'weekly',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'mission-seed-3',
    userId: 'demo-user',
    title: N_('Move your body for 30 minutes'),
    type: 'daily_quest',
    area: 'Health',
    difficulty: 'easy',
    estimatedMinutes: 30,
    isOneDecision: false,
    recurring: 'daily',
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'mission-seed-5',
    userId: 'demo-user',
    title: N_('Finish one thing you have been putting off'),
    type: 'monthly_boss_fight',
    area: 'Work',
    difficulty: 'hard',
    estimatedMinutes: 120,
    isOneDecision: false,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const DEFAULT_BUDGET: BudgetAllocations = {
  housing: 30,
  health: 10,
  education: 10,
  business: 20,
  travel: 10,
  savings: 10,
  giving: 5,
  lifestyle: 5,
};

const getDaysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const SEED_MICRO_HABITS: MicroHabit[] = [
  {
    id: 'habit-seed-1',
    title: N_('Drink a glass of water'),
    category: 'Health',
    goalId: 'goal-seed-2',
    durationMinutes: 5,
    description: N_('First thing after waking, before coffee.'),
    completedDates: [
      getDaysAgo(20), getDaysAgo(19), getDaysAgo(18), getDaysAgo(17), getDaysAgo(16),
      getDaysAgo(15), getDaysAgo(14), getDaysAgo(13), getDaysAgo(12), getDaysAgo(11),
      getDaysAgo(10), getDaysAgo(9), getDaysAgo(8), getDaysAgo(7),
      getDaysAgo(6), getDaysAgo(5), getDaysAgo(4), getDaysAgo(3), getDaysAgo(2), getDaysAgo(1)
    ],
    streakCount: 6,
    bestStreak: 14,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'habit-seed-2',
    title: N_('Read for 10 minutes'),
    category: 'Mindset',
    goalId: 'goal-seed-3',
    durationMinutes: 3,
    description: N_('A book, not a feed.'),
    completedDates: [
      getDaysAgo(24), getDaysAgo(23), getDaysAgo(22), getDaysAgo(21), getDaysAgo(20),
      getDaysAgo(19), getDaysAgo(18), getDaysAgo(17), getDaysAgo(16), getDaysAgo(15),
      getDaysAgo(5), getDaysAgo(4), getDaysAgo(3), getDaysAgo(2), getDaysAgo(1)
    ],
    streakCount: 5,
    bestStreak: 10,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'habit-seed-6',
    title: N_('No phone for the first 30 minutes'),
    category: 'Discipline',
    goalId: 'goal-seed-3',
    durationMinutes: 5,
    description: N_('Start the day on your own terms.'),
    completedDates: [
      getDaysAgo(22), getDaysAgo(21), getDaysAgo(20), getDaysAgo(19),
      getDaysAgo(18), getDaysAgo(17), getDaysAgo(16), getDaysAgo(15),
      getDaysAgo(5), getDaysAgo(3), getDaysAgo(2), getDaysAgo(1)
    ],
    streakCount: 4,
    bestStreak: 8,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'habit-seed-4',
    title: N_('Box Breathing / Parasympathetic Reset'),
    category: 'Clarity',
    goalId: 'goal-seed-2',
    durationMinutes: 5,
    description: N_('4s inhale, 4s hold, 4s exhale, 4s hold for 6 full cycles to eliminate morning cortisol spike.'),
    completedDates: [
      getDaysAgo(18), getDaysAgo(17), getDaysAgo(16), getDaysAgo(15),
      getDaysAgo(14), getDaysAgo(13), getDaysAgo(12),
      getDaysAgo(5), getDaysAgo(4), getDaysAgo(2), getDaysAgo(1)
    ],
    streakCount: 4,
    bestStreak: 7,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'habit-seed-3',
    title: N_('5-Min Frictionless Workspace Reset'),
    category: 'Environment',
    goalId: 'goal-seed-1',
    durationMinutes: 5,
    description: N_('Close irrelevant browser tabs, clear physical surface, stage notebook & pen for focus.'),
    completedDates: [
      getDaysAgo(30), getDaysAgo(29), getDaysAgo(28), getDaysAgo(27), getDaysAgo(26),
      getDaysAgo(25), getDaysAgo(24), getDaysAgo(23), getDaysAgo(22), getDaysAgo(21),
      getDaysAgo(20), getDaysAgo(19),
      getDaysAgo(4), getDaysAgo(2), getDaysAgo(1)
    ],
    streakCount: 2,
    bestStreak: 12,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'habit-seed-7',
    title: N_('Review 1 High-Leverage Strategic Model'),
    category: 'Learning',
    goalId: 'goal-seed-1',
    durationMinutes: 5,
    description: N_('Recall first-principles thinking, inversion, or leverage concepts.'),
    completedDates: [
      getDaysAgo(25), getDaysAgo(24), getDaysAgo(23), getDaysAgo(22), getDaysAgo(21),
      getDaysAgo(20), getDaysAgo(19), getDaysAgo(18), getDaysAgo(17),
      getDaysAgo(4), getDaysAgo(2)
    ],
    streakCount: 2,
    bestStreak: 9,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'habit-seed-5',
    title: N_('Read 2 High-Leverage Pages of Strategy'),
    category: 'Craft',
    goalId: 'goal-seed-1',
    durationMinutes: 5,
    description: N_('Consume 2 deep, timeless pages of philosophy, architecture, or domain craft.'),
    completedDates: [
      getDaysAgo(16), getDaysAgo(15), getDaysAgo(14), getDaysAgo(13), getDaysAgo(12),
      getDaysAgo(2), getDaysAgo(1)
    ],
    streakCount: 2,
    bestStreak: 5,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'habit-seed-8',
    title: N_('5-Min Uninterrupted Deep Sprint Prep'),
    category: 'Deep Focus',
    customCategoryId: 'custom-cat-deep-focus',
    goalId: 'goal-seed-1',
    durationMinutes: 5,
    description: N_('Define single high-leverage objective and kill notifications before sprint initiation.'),
    completedDates: [
      getDaysAgo(10), getDaysAgo(9), getDaysAgo(8), getDaysAgo(7),
      getDaysAgo(3), getDaysAgo(2), getDaysAgo(1)
    ],
    streakCount: 3,
    bestStreak: 6,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const SEED_CUSTOM_CATEGORIES: CustomHabitCategory[] = [
  {
    id: 'custom-cat-deep-focus',
    name: N_('Deep Focus'),
    icon: 'Zap',
    color: '#6366f1',
    description: N_('Uninterrupted deep work sprint blocks & distraction defense'),
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'custom-cat-creativity',
    name: N_('Creativity'),
    icon: 'Palette',
    color: '#e11d48',
    description: N_('Generative thinking, design ideation, writing & rapid prototyping'),
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const generateInitialCheckIns = (): DailyCheckIn[] => {
  const checkIns: DailyCheckIn[] = [];
  const now = new Date();
  
  // Create past 6 days history
  const sampleScores = [
    { daysAgo: 6, focus: 7, energy: 6, mood: 8, notes: N_('Great deep work morning block, hit flow state quickly.') },
    { daysAgo: 5, focus: 8, energy: 7, mood: 7, notes: N_('High mental clarity, walked outside during lunch.') },
    { daysAgo: 4, focus: 6, energy: 5, mood: 6, notes: N_('Slight fatigue in afternoon, reset with box breathing.') },
    { daysAgo: 3, focus: 9, energy: 8, mood: 9, notes: N_('Major breakthrough on key milestone mission!') },
    { daysAgo: 2, focus: 8, energy: 7, mood: 8, notes: N_('Solid momentum throughout the day.') },
    { daysAgo: 1, focus: 7, energy: 8, mood: 8, notes: N_('Frictionless execution on daily micro-habits.') },
  ];

  sampleScores.forEach((sample, idx) => {
    const d = new Date(now.getTime() - sample.daysAgo * 86400000);
    const dateKey = d.toISOString().slice(0, 10);
    checkIns.push({
      id: `checkin-seed-${idx + 1}`,
      dateKey,
      focus: sample.focus,
      energy: sample.energy,
      mood: sample.mood,
      notes: sample.notes,
      createdAt: d.toISOString(),
    });
  });

  return checkIns;
};

export const SEED_CHECK_INS: DailyCheckIn[] = generateInitialCheckIns();

export const generateInitialDailyPrimaryGoals = (): DailyPrimaryGoal[] => {
  const goals: DailyPrimaryGoal[] = [];
  const sampleTitles = [
    N_('Execute 45m deep focus sprint on architecture deliverable'),
    N_('Write high-impact product proposition and strategic roadmap'),
    N_('Execute vigorous 45m strength & metabolic conditioning session'),
    N_('Finalize monthly financial ledger audit and wealth allocation'),
    N_('Refactor critical persistence layer for zero-friction sync'),
    N_('Deliver strategic sprint presentation to key stakeholders'),
    N_('Zero social media consumption before 12:00 PM standard'),
    N_('Review 10-year future self identity card & anti-vision'),
    N_('Ship production milestone release candidate with zero defects'),
    N_('High-intensity interval training & parasympathetic recovery'),
  ];

  // 30 days history from 29 days ago up to today:
  // Days 29 to 24 (6 days in a row): completed (5-day milestone hit at day 25!)
  // Day 23: missed
  // Day 22: completed (streak = 1)
  // Day 21: missed
  // Days 20 to 1 (20 consecutive days!): completed (5d milestone at day 16, 10d at day 11, 15d at day 6, 20d at day 1!)
  // Day 0 (today): completed!
  for (let i = 29; i >= 0; i--) {
    const dateKey = getDaysAgo(i);
    const isMissed = i === 23 || i === 21;
    const completed = !isMissed;
    const title = sampleTitles[i % sampleTitles.length];
    goals.push({
      id: `daily-goal-seed-${30 - i}`,
      dateKey,
      title,
      completed,
      notes: completed
        ? N_('Executed with relentless clarity and high focus standard.')
        : N_('Fell short due to unexpected emergency schedule conflict.'),
      completedAt: completed ? `${dateKey}T18:00:00Z` : undefined,
    });
  }

  return goals;
};

export const SEED_DAILY_PRIMARY_GOALS: DailyPrimaryGoal[] = generateInitialDailyPrimaryGoals();

