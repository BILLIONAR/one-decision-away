# Data display sites — fields that consumers must render via `t(value)`

All static data in `src/data/*.ts` is now wrapped with `N_('…')` (identity marker for extraction).
`N_` does **not** translate. Every place a value from these objects is rendered, spoken, put in a
notification, or copied to the clipboard must pass it through `t(value)` (`useT()` in components,
`import { t } from '../i18n'` elsewhere).

Do NOT `t()` values that are compared against stored data (`category === 'Homes'`, `area`, `seasonId`,
`intent`, ids). Only wrap at the display site. Search/filter code that lowercases a field
(`item.name.toLowerCase().includes(q)`) may optionally match on both `item.name` and `t(item.name)`.

Note on seeded user data: seed goals/missions/habits/check-ins/daily goals are copied into the persisted
store (`repository.ts`). Their titles are English keys; `t()` at the display site returns them unchanged
when a user has edited the text or when no translation exists, so calling `t()` on user-entered values is
safe (falls back to the source).

---

## `src/data/seed.ts`

| Field | Consumers found (grep) |
|---|---|
| `MarketItem.name` (`SEED_MARKET_ITEMS[].name`) | `src/pages/Market.tsx` (lines ~390 `alt`, ~434, ~563 `alt`), `src/pages/MyLife.tsx` (~608 `name=`, ~694), `src/pages/Home.tsx` (~454 `targetItem.name`), `src/components/VisionExplore.tsx` (~148 `setCustomName`, ~368/~420 `alt`, ~371, ~484), `src/components/ShareCards.tsx` (~97, ~129 `it.name`), `src/components/WeekendSummary.tsx` (~66 `closest.name`), `src/components/PurchaseReveal.tsx` (~52 `alt`, ~56), `src/components/ArchivedMarketHistory.tsx` (~282 `alt`, ~298), `src/components/MorningVision.tsx` (~26/~28), `src/components/DreamJournal.tsx`, `src/components/QuickDreamJournalModal.tsx`, `src/components/ArchiveDreamModal.tsx`, `src/components/DailyVisionAffirmation.tsx` (`priorityDream.name`), `src/components/SavingsMomentumChart.tsx`, `src/components/FocusTimerHub.tsx` |
| `MarketItem.description` | `src/pages/Market.tsx` (~439, ~574), `src/pages/MyLife.tsx` (~697), `src/components/VisionExplore.tsx` (~487), `src/components/ArchivedMarketHistory.tsx` (~310) |
| `Season.title` / `.subtitle` / `.description` / `.theme` | `src/pages/Seasons.tsx` (~62 `season.title`, ~66 `season.theme \|\| season.description`, ~83, ~85), `src/store/useApp.tsx` (season title used in toasts/notifications — check `currentSeason.title` usages) |
| `Season.badgeName` / `.rewardBadgeTitle` / `.cosmeticReward` | `src/pages/Seasons.tsx` (~80 Badge, ~158 `"{name}" Profile Emblem` param) |
| `Season.missions[].title` (SeasonMission) | `src/pages/Seasons.tsx` (~134 `mission.title`) |
| `Goal.title` / `.description` (`SEED_INITIAL_GOALS`) | rendered wherever goals are listed: `src/pages/Missions.tsx`, `src/components/MissionFlows.tsx`, `src/components/EditMicroHabitModal.tsx` (goal picker `goal.title`), `src/components/DailyMicroHabits.tsx` |
| `Mission.title` (`SEED_INITIAL_MISSIONS`) | `src/pages/Home.tsx` (~184 `todayOneDecision.title`, ~208 `missionTitle:`, ~397 `currentActiveMission.title`), `src/pages/Missions.tsx`, `src/components/MissionFlows.tsx`, `src/components/ShareCards.tsx` (~187 `todayDecision.title`), `src/components/FocusTimerHub.tsx` (~576 `m.title`), `src/components/DailyPrimaryGoalsChart.tsx` (~332), `src/services/economy.ts` (mission title in reward/toast text), `src/services/repository.ts` (only copies — no t needed) |
| `MicroHabit.title` / `.description` (`SEED_MICRO_HABITS`) | `src/components/DailyMicroHabits.tsx`, `src/components/EditMicroHabitModal.tsx`, `src/components/WeeklyMicroHabitsSummary.tsx`, `src/components/MicroHabitsProgressIndicator.tsx`, `src/services/microHabitsService.ts` (spoken cue text), `src/utils/exportCsv.ts` (CSV rows), `src/store/useApp.tsx` (toasts) |
| `CustomHabitCategory.name` / `.description` (`SEED_CUSTOM_CATEGORIES`) | `src/utils/categoryHelpers.ts` (~304 builds `label:` — wrap `name` there), `src/components/DailyMicroHabits.tsx`, `src/components/EditMicroHabitModal.tsx`, `src/components/WeeklyMicroHabitsSummary.tsx`, `src/pages/Budget.tsx`, `src/store/useApp.tsx` |
| `DailyCheckIn.notes` (`SEED_CHECK_INS`) | `src/components/DailyCheckIn.tsx` (~238-240 `dataPoint.notes` tooltip; input default value ~87 should stay raw) |
| `DailyPrimaryGoal.title` / `.notes` (`SEED_DAILY_PRIMARY_GOALS`) | `src/components/DailyPrimaryGoalsChart.tsx` (~316 uses seed directly, ~378 `goal?.title`, ~609 `goal.title`, ~1006 `selectedMilestonePoint.goal.title`), `src/components/SavingsMomentumChart.tsx`, `src/components/DailyMicroHabits.tsx` |

Not wrapped in seed.ts (compared elsewhere / non-visible): `category` (`'Homes'`, …), `area`, `illustrationKey`,
`customImageUrl`, `status`, `type`, `recurring`, `difficulty`, `icon`, `color`, all ids and dates.
Note `MicroHabit.category` (`'Health'`, `'Mindset'`, …) and `MarketItem.category` are enum-like values that
consumers already map to labels via helpers — translate the label, not the value.

## `src/data/exploreDreams.ts`

| Field | Consumers found |
|---|---|
| `EXPLORE_CATEGORIES[].label` / `.description` | `src/components/VisionExplore.tsx` (~262 `cat.label`, ~311 `t.label` — note local var named `t` shadows the translator, rename), `src/pages/MyLife.tsx` (~823 `cat.label`) |
| `ExploreDreamItem.name` / `.description` | `src/components/VisionExplore.tsx` (~368-371, ~420, ~484, ~487), `src/pages/MyLife.tsx` (~694-697), `src/components/ShareCards.tsx` (~99 `e.name`), `src/components/MorningVision.tsx` (~28 `e.name`), `src/components/WeekendSummary.tsx` |
| `ExploreDreamItem.location` | `src/components/VisionExplore.tsx` (~447, ~568 subtitle param, ~587) |
| `ExploreDreamItem.whyWanted` | `src/components/VisionExplore.tsx` (~151 `setCustomWhy` — editable default, ~508, ~634), `src/pages/Market.tsx` (~578), `src/pages/MyLife.tsx` (~702), `src/components/PurchaseReveal.tsx` (~62), `src/components/MorningVision.tsx` (~26/28 `why:`), `src/components/DailyVisionAffirmation.tsx` (~75), `src/store/useApp.tsx` (~1033 copy into custom item — leave raw) |
| `ExploreDreamItem.firstRealStep` | `src/components/VisionExplore.tsx` (~152 `setCustomStep`, ~643), `src/pages/Market.tsx` (~584), `src/store/useApp.tsx` (~1034 copy — leave raw) |
| `ExploreDreamItem.highlights[]` | `src/components/VisionExplore.tsx` (~494 `hl`, ~615 `hl`) |

## `src/data/guidedMeditations.ts`

| Field | Consumers found |
|---|---|
| `GuidedMeditation.title` | `src/components/FocusTimerHub.tsx` (~252 `missionTitle: \`${emoji} ${meditation.title}\``, ~394 `m.title`), `src/components/MeditateNowWidget.tsx` (~25, ~63) |
| `GuidedMeditation.tagline` | `src/components/FocusTimerHub.tsx` (~395), `src/components/MeditateNowWidget.tsx` (~64) |
| `GuidedMeditation.description` | `src/components/FocusTimerHub.tsx` (~277 spoken fallback `voiceGuide.speak(... \|\| meditation.description)`, ~397) |
| `GuidedMeditation.benefits[]` | `src/components/FocusTimerHub.tsx` (~399 `m.benefits.map(b)`, ~507 `session.benefits.map(b)`) |
| `GuidedMeditation.cues[].text` (subtitle + speech) | `src/components/FocusLockView.tsx` (~110-113 `activeCue`/`nextCue` `.text` rendered as subtitle), `src/components/FocusTimerHub.tsx` (~277 `meditation.cues[0]?.text` spoken), `src/store/useApp.tsx` (~300 `voiceGuide.speak(meditation.cues[dueIndex].text)`, ~302 and ~418 `prefetch(cues.map(c => c.text))` — wrap each with `t()` so the prefetched and spoken text match) |
| `INTENT_LABELS[intent]` | `src/components/FocusLockView.tsx` (~281), `src/components/FocusTimerHub.tsx` (~392) |

Not wrapped: `id`, `intent`, `track`, `emoji`, `atSeconds`, `durationMinutes`.

## `src/data/affirmations.ts`

| Field | Consumers found |
|---|---|
| `Affirmation.quote` | `src/components/DailyAffirmationWidget.tsx` (~123 share text, ~234, ~252) |
| `Affirmation.reflection` | `src/components/DailyAffirmationWidget.tsx` (~123 `Daily Focus: {reflection}` param, plus its render) |
| `Affirmation.actionCue` | `src/components/DailyAffirmationWidget.tsx` (~266) |
| `Affirmation.author` | NOT wrapped (real people's names) — render raw |
| `Affirmation.category` | enum (`'Mastery'` …) used in filter comparisons — translate only the filter chip label at the display site |

Helpers `getDailyAffirmation()` / `getRandomAffirmation()` return the raw object; consumers `t()` the fields.

## `src/data/wisdom.ts`

| Field | Consumers found |
|---|---|
| `SeasonalWisdom.theme` | `src/pages/Settings.tsx` (~197/~209 notification title `Daily Wisdom: ${theme}`, ~529, ~971) |
| `SeasonalWisdom.quote` | `src/pages/Settings.tsx` (~198/~210 notification body, ~559, ~976) |
| `SeasonalWisdom.author` | wrapped with `N_` (these are conceptual labels like "Principle of Execution", not people) — `src/pages/Settings.tsx` (~198/~210) |
| `SeasonalWisdom.principle` | `src/pages/Settings.tsx` (~573) |
| `SeasonalWisdom.actionPrompt` | `src/pages/Settings.tsx` (~581, ~984), `src/components/DailyVisionAffirmation.tsx` (~309 `currentAffirmation.actionPrompt`, ~179 share text) |
| `SeasonalWisdom.seasonTitle` | grep found no direct render; translate if displayed |

Helpers `getWisdomForSeason()` / `getDailyWisdomInsight()` return objects; consumers `t()` the fields.

## `src/data/dailyNudges.ts`

| Field | Consumers found |
|---|---|
| `NUDGE_LINES[slot][]` via `getNudgeLine(slot)` | `src/services/notificationScheduler.ts` (~94 — already `t(getNudgeLine(slot))`), `src/components/DailyNudgesSettings.tsx` (~114 preview `{getNudgeLine(s.key)}` — needs `t()`) |
| `NUDGE_TITLES[slot]` | `src/services/notificationScheduler.ts` (~95 — already `t(NUDGE_TITLES[slot])`), `src/components/DailyNudgesSettings.tsx` (~114 — needs `t()`) |

`getNudgeLine()` intentionally returns the untranslated key (the scheduler already wraps it in `t()`);
`DEFAULT_NUDGE_TIMES` are not text.
