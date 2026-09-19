# One Decision Away

A React 19, TypeScript, Vite and Tailwind application for daily decisions, reflection and personal goals. Includes English, Turkish and Spanish, a Journal and guided Notebook practices, local persistence, and JSON backups.

## Run locally

Requires Node.js 22 and npm.

```sh
npm ci
npm run dev
```

The core application works without an account or API key. New visitors start in English; a selected language is remembered on that browser. Data is saved in the browser, so export a JSON backup before clearing browser storage or moving to another website address.

## Verify and build

```sh
npx tsc --noEmit
node scripts/validate-i18n.mjs
node --import tsx scripts/test-i18n.ts
node --import tsx scripts/test-notebook.ts
node --import tsx scripts/test-notebook-voice.ts
node --import tsx scripts/test-routing.ts
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

Cloud sync requires a configured Supabase project and its schema. Optional browser-side AI integrations require separate configuration; the Notebook voice reader uses browser speech synthesis. Keep credentials and private user backups out of Git. Values prefixed with `VITE_` are public client configuration, never server secrets.

This is a functional test release. The Pro switch is a demonstration setting; payment collection and server-enforced subscription permissions are not implemented. Changing hosting addresses does not move users' browser-local records automatically—use JSON export/import.

See [verification notes](docs/notebook-i18n-verification.md) for completed checks and their scope.
