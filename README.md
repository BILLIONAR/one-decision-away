# One Decision Away

A React 19, TypeScript, Vite and Tailwind application for daily decisions, reflection and personal goals. Includes English, Turkish and Spanish, a Journal and guided Notebook practices, local persistence, and JSON backups.

## Run locally

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

The core application works without an account or API key. New visitors start in English; a selected language is remembered on that browser. Data is saved in the browser, so export a JSON backup before clearing browser storage or moving to another website address.

## Inspiration, guided courses and ODA branding

- 600 sourced Turkish/English passages extend the original daily pool to 1,018 entries. Translations and original adaptations are labelled separately. The notification collection supplies six distinct passages per day for a 100-day cycle.
- 18 guided courses contain 103 lessons in English, Turkish and Spanish. Existing reading, examples, practice and cited limitations are retained. Every course now has a personal workbook: a cue, small action, fallback, observable evidence, dated attempts and a revisit review. Planning and reflection are optional and do not grade feelings or lock lessons.
- Course progress, reflections, workbook plans and attempts are included in JSON and optional cloud backup snapshots. Existing separate course storage migrates without changing lesson IDs. Older backups without a course section preserve current course work. A restore is validated and reviewed before replacing the saved record.
- Today connects choosing, taking a step and reflecting, with an editable saved notebook reflection, real course continuation and a weekly review based on actual recorded activity. Setup drafts survive an interrupted first run.
- The designer signature is **Designed by Yahya** in English, Turkish and Spanish. Keep that exact wording untranslated. See [brand decisions](docs/BRAND.md) for the persistent visual identity.
- The selected icon8 gold/ruby domino now supplies the application logo and web/native icon assets. Its accepted high-resolution reconstruction and provenance are retained in `brand-assets/domino8/`; it is not the missing original source. Earlier C4/v2/v3/v4 assets remain preserved. See [brand decisions](docs/BRAND.md).

See [inspiration and coach notes](docs/INSPIRATION_AND_COACH.md) and [push setup](docs/PUSH_NOTIFICATIONS.md) for details.

## Verify and build

```sh
npm run check
```

Browser regressions use Playwright and axe. Start `DISABLE_HMR=true npm run dev`, then run:

```sh
npm run test:browser
npm run qa:landing
npm run qa:courses
npm run qa:backup
npm run qa:modals
```

The saved cloud workspace has Chromium at `/usr/bin/chromium`. Elsewhere install a Playwright browser (`npx playwright install chromium`) or set `ODA_CHROMIUM` to your Chromium executable. `ODA_QA_URL` selects a production preview URL for the combined browser, landing and course suites. `qa:backup` additionally tests simulated cloud and cross-tab internals, so it requires a development server with HMR disabled. Reports and screenshots are saved in `artifacts/` using synthetic test data.

For installed-web offline and project-folder checks, serve a root production build on port 4173 and a `/one-decision-away/` build on port 4174, then run `npm run qa:platform`. Override their addresses with `ODA_QA_URL` and `ODA_PROJECT_QA_URL`. See [the review verification](docs/VERIFICATION_2026-09-30.md) for the exact commands and tested scope.

When course titles, lesson IDs or quiz structure change, regenerate the lightweight preview/validation metadata with `npm run catalog`; the parity test checks it against all three editions. Run `npm run support` after changing support content.

See [the product direction](docs/PRODUCT_DIRECTION_2026-09-30.md), [course practice](docs/COURSE_PRACTICE.md), [daily practice](docs/DAILY_PRACTICE.md) and [independent review](docs/REVIEW_2026-09-30.md).

## Publish with GitHub Pages

1. Push this source to a public GitHub repository. GitHub Pages is available without a paid plan for public repositories.
2. In the repository's **Settings → Pages**, choose **GitHub Actions** as the deployment source.
3. Run **Deploy to GitHub Pages** from **Actions**, or push a commit to `main`.
4. Share the website address shown by the successful deployment. Visitors do not need a GitHub account.

The workflow uses the deployment path supplied by GitHub Pages and runs the checks before publishing. A project site uses hash-based routes such as `/one-decision-away/#/app/notebook`, so refreshing a nested page works on static hosting. Root-domain deployments retain ordinary URL paths and require the host to serve `index.html` for app routes.

To test a project-site build locally:

```sh
VITE_BASE_PATH=/one-decision-away/ npx vite build
VITE_BASE_PATH=/one-decision-away/ npm run preview
```

## Optional services and current limits

Cloud sync and closed-app push delivery require a configured Supabase project and its schema. ODA Coach runs a real, free local WebLLM model without an API key, but Turkish conversation quality remains experimental. Its initial download is approximately 1.1 GB and requires WebGPU and sufficient device memory. The Notebook voice reader uses browser speech synthesis. Keep credentials and private user backups out of Git. Values prefixed with `VITE_` are public client configuration, never server secrets.

This is a review build. Web access remains open; native subscription levels are gated only when the existing RevenueCat configuration is enabled. Store products, cloud services and real-device behavior require their own configuration and validation. Changing hosting addresses does not move users' browser-local records automatically—use JSON export/import.

The iOS app is configured for **iOS 16.4 or newer**, matching Tailwind 4's Safari baseline. Project and app Debug/Release targets enforce this minimum; the Capacitor-generated Swift wrapper and vendor packages retain compatible library floors. `tests/native-baseline.test.ts` prevents a lower app target or conflicting native metadata from returning. Xcode compilation and iPhone compatibility remain untested in the Linux workspace; see [native readiness and prerequisites](docs/APP_STORE.md#tarayıcı-ve-ios-sürüm-sınırı).

See [verification notes](docs/notebook-i18n-verification.md) for completed checks and their scope.
