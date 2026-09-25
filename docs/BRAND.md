# ODA brand decisions

Confirmed by the owner on 23 September 2026. Preserve these decisions in future changes.

- **Designer signature:** `Designed by Yahya`. Use this exact wording in English, Turkish and Spanish; do not translate it or replace it with `by AurelyStudio`.
- **App name:** `ODA`, without dots. The expanded name is `One Decision Away`.
- **Installed app name:** the phone home screen and desktop applications list must both display exactly `ODA`. Keep the web manifest's `name` and `short_name`, and the Apple mobile web app title, set to `ODA`. The expanded name may remain inside the website.
- **Selected logo:** C4 (the owner's original). On 25 September 2026 the owner reviewed v3 (open door) and asked to go back to the old logo; v2 and v3 remain in the repo (`LogoV2.tsx`, `LogoV3.tsx`, `public/brand/v2|v3/`) but are not in use. Page titles use Fraunces and UI text uses Geist (self-hosted); that typography change was kept.
- **Every earlier brand is preserved:** C4 (`public/brand/oda-c4.png`, `oda-*-c4-v1-*`, `LogoC4.tsx`) and v2. Switch with `node scripts/brand.mjs c4`, `v2` or `v3`; it swaps every reference (manifest, index.html, service worker, notifications, test) and `src/brand/current.ts`, then commit and push. Do not generate a new logo as part of ordinary interface changes.
- **Visual direction:** an elegant, warm editorial workbook, with forest green and burgundy accents. Use the shared tokens in `src/styles/tokens.css` and reserve explanatory illustrations for learning and action.
- **Credit placement:** visible landing-page and settings signatures, with matching website metadata and install branding. The compact standalone signature is always `Designed by Yahya`.

Historical translation keys may retain the old studio name for compatibility. Their displayed values must use the current designer signature. Third-party licenses, legal notices and copyright attributions are not designer signatures and must not be rewritten.
