# ODA brand decisions

Confirmed by the owner on 23 September 2026. Preserve these decisions in future changes.

- **Designer signature:** `Designed by Yahya`. Use this exact wording in English, Turkish and Spanish; do not translate it or replace it with `by AurelyStudio`.
- **App name:** `ODA`, without dots. The expanded name is `One Decision Away`.
- **Installed app name:** the phone home screen and desktop applications list must both display exactly `ODA`. Keep the web manifest's `name` and `short_name`, and the Apple mobile web app title, set to `ODA`. The expanded name may remain inside the website.
- **Selected logo:** v3 since 25 September 2026, at the owner's request ("change the logo and the site design, do your best; keep the old ones so I can go back"). v3 is an open door: *oda* means room in Turkish, and one decision is the step across the threshold; the burgundy leaf is the door already opening. Wordmark and page titles use Fraunces (self-hosted, calm optical size 36); UI text uses Geist (self-hosted, no Google Fonts request). Components: `src/components/brand/LogoV3.tsx`; icons: `public/brand/v3/` (forest tile for home-screen icons). Earlier v2 (24 Sep, vector redraw of C4) lives in `LogoV2.tsx` and `public/brand/v2/`.
- **Every earlier brand is preserved:** C4 (`public/brand/oda-c4.png`, `oda-*-c4-v1-*`, `LogoC4.tsx`) and v2. Switch with `node scripts/brand.mjs c4`, `v2` or `v3`; it swaps every reference (manifest, index.html, service worker, notifications, test) and `src/brand/current.ts`, then commit and push. Do not generate a new logo as part of ordinary interface changes.
- **Visual direction:** an elegant, warm editorial workbook, with forest green and burgundy accents. Use the shared tokens in `src/styles/tokens.css` and reserve explanatory illustrations for learning and action.
- **Credit placement:** visible landing-page and settings signatures, with matching website metadata and install branding. The compact standalone signature is always `Designed by Yahya`.

Historical translation keys may retain the old studio name for compatibility. Their displayed values must use the current designer signature. Third-party licenses, legal notices and copyright attributions are not designer signatures and must not be rewritten.
