# ODA review build · 30 September 2026

Development branch: `feat/oda-growth-studio`, based on `b27d1ea`. Work stayed in the selected cloud workspace. No push, merge, production deployment, paid service, production database mutation, or new authentication grant was performed.

## What the review version delivers

The original ODA C4 mark and **Designed by Yahya** credit remain. Forest, wine and ivory now form a consistent editorial interface, with a quiet CSS doorway illustration on the landing page, readable course surfaces, labeled navigation and reduced-motion support. The landing preview explains the daily practice and selects a real course without modifying personal records.

First use can be interrupted and resumed. Today connects a chosen decision, a real attempt, an editable notebook reflection and a weekly adjustment based on recorded activity. Existing repeatable missions retain their rules; retrying a completed daily decision cannot create duplicate evidence, minutes or rewards.

All 18 courses and 103 lessons remain in English, Turkish and Spanish. Each course has a tailored, learner-owned workbook with a cue, small action, fallback, observable evidence, attempted/adapted/paused entries and a revisit review. These records carry across lessons, save with the personal record, remain accessible independently of lesson entitlement, and export as text. Lesson completion and applied practice remain distinct.

Learning and repository writes now share a queue and, where available, a browser Web Lock. Backups include course work; older backups preserve existing learning records. Imports validate renderer fields and show a review before replacement. Failed writes retain the previous saved record. Unexpected legacy errors offer a raw recovery download and standalone support without resetting personal data.

The web shell works offline for previously downloaded routes and course content. Standalone recovery support is precached and cannot overwrite the application shell cache. The main JavaScript entry is approximately 770 kB minified; full course content and optional WebLLM remain deferred. This is a bundle observation, not a measured Core Web Vitals claim.

## Reproducible automated checks

Environment: Node **22.23.3**, Linux, Chromium **151.0.7922.173**. `npm run lint` is the repository's TypeScript check; no separate ESLint configuration exists.

```sh
npm ci
npm run check
node scripts/check-store-metadata.mjs --strict
VITE_BASE_PATH=/one-decision-away/ npx vite build --outDir /tmp/oda-project-build
VITE_BASE_PATH=/ VITE_TARGET=ios npx vite build --outDir /tmp/oda-ios-web-build
```

Final `check`: **171 core tests and 19 notebook tests passed**, plus translation validation, locale behavior and device-only voice assertions. The routing check also reran 11 tests already included in the core suite; those are not additional unique tests. The production build passed. Strict store metadata passed for **four locales and six subscriptions**. Project-folder and iOS-target **web** builds passed; the latter is not an Xcode or device build.

The lightweight course catalog generator has parity checks against all three complete course editions. New regressions cover onboarding drafts, duplicate daily completion, backup validation, atomic course/notebook writes, failed-save replay and standalone support cache isolation.

## Real browser verification

Root production preview:

```sh
npm run preview -- --host 0.0.0.0 --port 4173
ODA_QA_URL=http://localhost:4173 npm run test:browser
ODA_QA_URL=http://localhost:4173 npm run qa:landing
ODA_QA_URL=http://localhost:4173 npm run qa:courses
ODA_QA_URL=http://localhost:4173 npm run qa:modals
```

For white-box backup stress checks, run a fresh development server with HMR disabled. This prevents test-time module imports from triggering a development reload of the pending restore dialog. Cloud calls are simulated locally; no Supabase credentials or requests are used.

```sh
DISABLE_HMR=true npm run dev -- --port 3017
ODA_QA_URL=http://localhost:3017 npm run qa:backup
```

For offline/project checks, keep the root preview running and serve the project build separately:

```sh
VITE_BASE_PATH=/one-decision-away/ npx vite preview --outDir /tmp/oda-project-build --host 0.0.0.0 --port 4174
npm run qa:platform
```

The six final browser suites passed **116 named checks**: combined flow 39, courses 28, landing 16, backup stress 11, offline/project 9, and modal compatibility 13. They use disposable contexts and synthetic personal records. They cover mobile widths **320/390 px**, desktop **1280/1440 px**, light/dark themes, reduced motion, EN/TR/ES, keyboard focus containment and return, local midnight in `Europe/Istanbul`, interrupted setup and course work, repeated completion, file downloads, malformed/cancelled/confirmed restore, storage quota failure, concurrent tab writes, and independent recovery support. Modal checks also simulate missing dialog/inert APIs; they do not emulate an entire old browser engine. Tested axe scans have no serious or critical findings; this is not a full accessibility certification or a VoiceOver test.

Machine-readable reports and the actual screenshots are under `artifacts/qa`, `artifacts/learning`, `artifacts/landing`, `artifacts/backup-qa`, `artifacts/platform`, `artifacts/modal-fallback` and `artifacts/native-readiness`. Final command logs are under `artifacts/verification`.

## Remaining limits

- Actual Supabase authentication, production schema/RLS deployment and live multi-device cloud sync are unverified. The tracked example expects `VITE_SUPABASE_URL`, a **public** anon key and `oda_user_data`; no real project reference is configured there. Local integration tests exercise backup/cloud logic with an isolated mock. A separate parent setup task handles connector access.
- Xcode compilation, real iPhone lifecycle, notifications, VoiceOver, StoreKit/RevenueCat purchases and App Store acceptance remain untested in Linux. Static support and store URL files are ready to publish; their live URL has not been published or verified during this work. See `docs/APP_STORE.md` for prerequisites and browser compatibility notes.
- Optional WebGPU/local-model inference and configured cloud AI were not exercised. The deferred WebLLM bundle and complete course text still produce Vite chunk-size warnings; no external service was enabled to silence them.
- Offline use requires the app shell to have loaded online; full course content must have been downloaded before disconnecting. Clearing browser storage or changing origin still requires backup transfer.
- The existing reward ledger and notebook reward ceilings retain their shared UTC-day contract. User-facing decisions, course practice and daily reflection use local dates. No ledger migration was performed.
- Web Locks provide cross-tab serialization where supported; browsers without that API retain the in-process queue. This does not certify concurrent saves across separate devices.

The final evidence index records the last successful browser reports and counts. Product choices and research access limits are documented in `docs/PRODUCT_DIRECTION_2026-09-30.md`; course evidence remains attributed with limitations. No clinical or transformation guarantee is made.
