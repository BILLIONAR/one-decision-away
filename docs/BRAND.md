# ODA brand decisions

Confirmed by the owner on 23 September 2026. Preserve these decisions in future changes.

- **Designer signature:** `Designed by Yahya`. Use this exact wording in English, Turkish and Spanish; do not translate it or replace it with `by AurelyStudio`.
- **App name:** `ODA`, without dots. The expanded name is `One Decision Away`.
- **Installed app name:** the phone home screen and desktop applications list must both display exactly `ODA`. Keep the web manifest's `name` and `short_name`, and the Apple mobile web app title, set to `ODA`. The expanded name may remain inside the website.
- **Selected logo:** v2 since 24 September 2026, at the owner's request ("change it if you don't like it; keep the old one so I can go back"). v2 is a vector redraw of the C4 idea (you are the dot where the road splits; the square is the old boxed-in pattern, the burgundy circle is the life you choose) with an editorial serif wordmark. Components: `src/components/brand/LogoV2.tsx`; icons: `public/brand/v2/`. Colours follow light/dark themes via `--logo-ink` and `--logo-accent`.
- **C4 is preserved, not deleted:** `public/brand/oda-c4.png`, the `oda-*-c4-v1-*` icons and `src/components/brand/LogoC4.tsx` stay in the repo. To go back, run `node scripts/brand.mjs c4` (and `node scripts/brand.mjs v2` to return); it swaps every reference (manifest, index.html, service worker, notifications, test) and `src/brand/current.ts`. Do not generate a new logo as part of ordinary interface changes.
- **Visual direction:** an elegant, warm editorial workbook, with forest green and burgundy accents. Use the shared tokens in `src/styles/tokens.css` and reserve explanatory illustrations for learning and action.
- **Credit placement:** visible landing-page and settings signatures, with matching website metadata and install branding. The compact standalone signature is always `Designed by Yahya`.

Historical translation keys may retain the old studio name for compatibility. Their displayed values must use the current designer signature. Third-party licenses, legal notices and copyright attributions are not designer signatures and must not be rewritten.
