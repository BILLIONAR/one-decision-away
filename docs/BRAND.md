# ODA brand decisions

Core naming and signature decisions confirmed by the owner on 23 September 2026. The current development refinement follows the owner's explicit 1 October 2026 request for a new premium identity; publication still requires its separate visual/QA checkpoint.

- **Designer signature:** `Designed by Yahya`. Use this exact wording in English, Turkish and Spanish; do not translate it or replace it with `by AurelyStudio`.
- **App name:** `ODA`, without dots. The expanded name is `One Decision Away`.
- **Installed app name:** the phone home screen and desktop applications list must both display exactly `ODA`. Keep the web manifest's `name` and `short_name`, and the Apple mobile web app title, set to `ODA`. The expanded name may remain inside the website.
- **Development identity:** v5, an original ODA serif path wordmark and asymmetric decision branch with a selected wine leaf. Hanken Grotesk Variable is the UI face and Newsreader Variable the editorial face, both existing self-hosted dependencies. See [the v5 review and provenance](BRAND_V5_REVIEW.md). The prior published selection was C4; the v5 refinement is expressly authorized in this development batch, pending review before publication.
- **Every earlier brand is preserved:** C4 (`public/brand/oda-c4.png`, `oda-*-c4-v1-*`, `LogoC4.tsx`) and v2/v3/v4. Switch web references with `node scripts/brand.mjs c4|v2|v3|v4|v5`; it swaps manifest, index.html, service worker, notification/test paths and `src/brand/current.ts`. Exact former native icon/splash artwork is preserved at `brand-assets/ios/pre-v5-active/`. New branding still requires an explicit design request rather than an ordinary interface change.
- **Visual direction:** an elegant, warm editorial workbook, with forest green and burgundy accents. Use the shared tokens in `src/styles/tokens.css` and reserve explanatory illustrations for learning and action.
- **Credit placement:** visible landing-page and settings signatures, with matching website metadata and install branding. The compact standalone signature is always `Designed by Yahya`.

Historical translation keys may retain the old studio name for compatibility. Their displayed values must use the current designer signature. Third-party licenses, legal notices and copyright attributions are not designer signatures and must not be rewritten.
