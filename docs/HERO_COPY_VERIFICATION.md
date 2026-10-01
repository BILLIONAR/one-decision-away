# ODA hero-copy verification

**Prepublication receipt: local hero-copy validation passed.**
Base main: `a793799d008f3577bcced1e608f60b08ab70a1e4`.
Hero report timestamp: **2026-10-01 04:06:23 UTC**.

## Approved copy and scope

The source is [landingCopy.ts](../src/data/landingCopy.ts). The English headline was approved by the user; Turkish and Spanish carry the same meaning.

| Locale | Rendered headline | Introduction |
| --- | --- | --- |
| EN | Change starts with one decision. | Turn what matters to you into daily action—with practical courses, guided reflection, and progress you can see. |
| TR | Değişim tek bir kararla başlar. | Senin için önemli olanları günlük adımlara dönüştür—uygulamalı kurslar, rehberli düşünme ve görebileceğin ilerlemeyle. |
| ES | El cambio empieza con una decisión. | Convierte lo que te importa en acciones diarias, con cursos prácticos, reflexión guiada y un progreso que puedes ver. |

Only the three hero fields `title`, `titleAccent` and `introduction` change in each locale. The product diff contains only this copy file. Renderer, styles, original C4 logo/branding, CTA copy, language choices and application features are unchanged. QA scripts and evidence are separate from the product change.

[The validation summary](../artifacts/verification/hero-copy/validation-summary.json) records the copy hash, unchanged-file hashes, original C4 image hash and the exact test counts below.

## Fresh verification

- **277 distinct automated tests passed:** [258 named core tests](../artifacts/verification/hero-copy/core-tests.log) in the supplemental authorized `npm test` run plus [19 notebook tests](../artifacts/verification/hero-copy/check.log) in `npm run check`.
- The 11 standalone routing cases repeat core coverage and are excluded from that total.
- TypeScript, translation validation, locale assertions, device-only voice assertions and the root production build passed.
- The `/one-decision-away/` [project-base production build](../artifacts/verification/hero-copy/project-build.log) passed. Build warnings remain; no performance improvement is claimed.

[The targeted WebKit report](../artifacts/verification/hero-copy/report.json) has overall status **passed**: **38 named checks**, **12 cases**, **24 screenshots**, **zero uncaught browser errors** and **zero external requests**. It uses official Playwright **1.63.0 / WebKit 26.6, revision 2359**, Node **22.23.3**, and an owned loopback HTTPS production preview at `https://127.0.0.1:4176/one-decision-away/`.

| App locales | Light viewports | Dark viewport |
| --- | --- | --- |
| EN, TR, ES | 320×740, 390×844, 1440×1000 | 390×844 |

Each case verifies exact localized headline/body text, theme, rendered line bounds, clipping/overlap clearance and logo/CTA bounds. Header and hero CTAs scroll into view and pass unobscured center hit-tests. Root and mobile-review agents completed screenshot review with no confirmed hero layout issue. [The passing authorized run log](../artifacts/verification/hero-copy/run-authorized.log) preserves the executed checks.

## Execution receipts and limits

The initial restricted `npm run check` recorded **37 core file groups**, not the actual 258 named core cases. The supplemental authorized run supplies the 258-case evidence used above; the 37 groups are not added to the total.

The first browser invocation stopped at `spawnSync git EPERM` **before browser launch**. [Its original log](../artifacts/verification/hero-copy/run.log) is retained separately from the passing authorized log. These execution-permission receipts do not establish an application failure.

This is targeted hero-copy validation in Linux WebKit. Mobile contexts emulate screen/touch parameters; physical iPhone, branded Safari, native keyboard and device safe areas were not exercised. Public Pages, production accounts, live Supabase and provider writes were not tested by this task. No public-host request was made for this validation.

## Publication status

Exact-commit Pages outcome and the release SHA are reported in the final handoff. This receipt records the prepublication validation. Public live verification remains a separate parent-owned task; this executor makes no requests to the blocked public Pages host.
