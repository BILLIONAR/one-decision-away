# GitHub Pages preparation — 2026-09-19

Publication is pending GitHub account access. These are local verification results, not proof of a live GitHub deployment.

- Public-source audit covered all seven existing commits and both bundled source archives; no real credential or private user backup was found. Old source archives are now ignored and removed from the tracked current tree, while remaining on disk and in existing history.
- `npx tsc --noEmit` passed.
- `node scripts/validate-i18n.mjs` passed: 4,445 entries per translated locale, zero missing keys and zero placeholder differences.
- English-first startup, remembered language, all three language choices, fallback and repeated placeholders passed.
- All 19 Notebook data/repository tests and the device-only speech check passed.
- Eight routing/service-worker checks passed, including deployment cache isolation and notification paths.
- Root and `/one-decision-away/` builds passed. The existing large-bundle warning remains.
- A plain local static server without SPA fallback served the project build. The shell, JS/CSS, manifest, icons and service worker returned HTTP 200. A non-hash nested path correctly returned 404, confirming the test server did not mask routing errors.
- Real-browser checks: English first landing, home-to-Notebook navigation, Notebook reload, Settings language changes EN → TR → ES → EN, localized Notebook reloads and browser Back all passed. Captured console errors: zero.
- The GitHub Actions workflow uses action revisions from the official Vite GitHub Pages example. Its exact test commands were run locally. A successful remote workflow and anonymous public-site check are still required after upload.

The site uses a repository subdirectory and hash routes for GitHub Pages. Root-path hosting keeps history routing and needs a host-provided SPA fallback.
