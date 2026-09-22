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
- Five Turkish guided courses contain 25 lessons: confidence, everyday ADHD skills, motivation, faith and manifesting through action. Each lesson includes a reading, three practical steps, an optional note, a learning question with feedback and sequential progression. Six scientific publications were reviewed before writing; findings and limitations are available within the courses and in [the evidence review](docs/COURSE_EVIDENCE.md).
- Course progress and notes use browser-local storage, independently of profile JSON backups and cloud sync. They are currently **not included in profile export/import**. Do not clear browser storage if you need to preserve them.
- The selected C4 symbol with ODA beneath it is supplied as a transparent PNG in `public/brand/oda-c4.png`, used for the app, landing page and install metadata.

See [inspiration and coach notes](docs/INSPIRATION_AND_COACH.md) and [push setup](docs/PUSH_NOTIFICATIONS.md) for details.

## Verify and build

```sh
npx tsc --noEmit
node scripts/validate-i18n.mjs
node --import tsx scripts/test-i18n.ts
node --import tsx scripts/test-notebook.ts
node --import tsx scripts/test-notebook-voice.ts
node --import tsx scripts/test-routing.ts
node --import tsx --test tests/*.test.ts supabase/functions/send-nudges/core.test.ts supabase/functions/send-nudges/push-worker.test.ts
npx vite build
```

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

This is a functional test release. The Pro switch is a demonstration setting; payment collection and server-enforced subscription permissions are not implemented. Changing hosting addresses does not move users' browser-local records automatically—use JSON export/import.

See [verification notes](docs/notebook-i18n-verification.md) for completed checks and their scope.
