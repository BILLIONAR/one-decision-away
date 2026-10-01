# Approved ODA growth dashboard and catalogue review

Review branch: `design/approved-growth-catalogue`, based on main
`d623b60ab58dde3d37e1b8d8768e64343cf390e3`. Production publication is pending
the parent model's visual and independent QA checkpoint. This document records
local acceptance evidence, not a deployment or exact-SHA CI result.

## Asset provenance and behavior

The actual two concept images, six transparent tree stages and four editorial
course covers from the user-attached `ODA-approved-dashboard-design-assets.zip`
were inspected. The 18,536,498-byte ZIP has SHA-256
`cc00b0399b9480e4c624a58786b2e0cedfb720d3ace5ee4b8f7e8d7806799366`.
The bundle's asset checksums were verified; production PNGs and original manifests
are copied unchanged under `public/assets/oda/`. The native tree root anchors and
stage sizing follow the original manifest.

Today uses the actual decision ledger and continuing course. The total kept count
remains exact; illustrated leaf count caps at 60 and blossoms at 30. Stages cover
0, 1–9, 10–29, 30–59, 60 and 61+. Counts above 90 retain the flowering stage rather
than regressing visually. The rolling seven-day strip counts distinct kept days,
with “Last 7 days” labels in EN/TR/ES. Multiple decisions on one day remain one
kept day. The Evidence and Me views use the same capped visual description.

The catalogue retains all 18 courses and 103 lessons, their original learning
content, access decisions, progress and workbook persistence. Four original local
covers are mapped to course themes with localized concise outcomes. Broken tree
and cover images retain truthful readable information. The C4 mark, ODA spelling,
signature and approved landing hero copy are preserved.

## Verification

`npm run check` passed TypeScript, translations, notebook/voice/routing checks,
262 core tests and 19 notebook tests (281 distinct tests), and the production
build. Its routing harness repeats 11 tests already included in the core count.
Final local logs and task-local WebKit setup receipts are in
`artifacts/verification/approved-growth-setup/`.

| Browser suite | Checks | Axe audits | Result |
| --- | ---: | ---: | --- |
| Chromium full application | 39 | 9 | Passed; zero browser errors |
| Chromium modal fallback | 13 | 4 | Passed; zero browser errors |
| Chromium course learning | 28 | 11 | Passed; zero browser errors |
| Linux WebKit full mobile flows | 59 | 13 | Passed; zero browser errors |
| Chromium approved growth design | 27 | 11 | Passed; zero failures/runtime errors |
| Linux WebKit approved growth design | 27 | 11 | Passed; zero failures/runtime errors |

The focused growth suites exercise 0, 1, 9, 10, 29, 30, 59, 60, 61, 89, 90 and
120 kept decisions; original asset hashes; stage baseline/clipping; distinct days;
the Me miniature at 120; EN/TR/ES; 320/390/1440-pixel layouts; light/dark and reduced
motion; actual course continuation; image failures; and repeated/interrupted
navigation with browser history. Each browser saves 31 suite screenshots; Chromium
also includes two supplemental scrolled card views for the parent review. The broader
WebKit run also verifies cached app/course behavior after killing its own local
preview process and proving the origin request fails.

Current reports and screenshots are under
`artifacts/verification/approved-growth-{chromium,webkit}/`,
`approved-design-browser/`, `approved-design-modals/`,
`approved-design-courses-final/` and `approved-design-webkit/`.
The independent read-only release reviewer found no blocking static design defect.
Earlier diagnostic attempts were preserved outside the repository in
`/workspace/scratch/oda-qa-diagnostics`; they are not counted as passing runs.

## Held 3D prototype

The separately authorized prototype contains actual original Three.js geometry,
camera orbit, bounded zoom, reset, mouse and keyboard input, and touch behavior
that preserves vertical page scrolling. It is not imported into production UI.
The production build contains no InteractiveTree chunk or Three.js core code;
the prototype adds no production 3D download. Review artifacts and a standalone
geometry viewer are in `artifacts/tree-3d/`.

The final recorded probe uses Chromium 151 on Linux and SwiftShader software
rendering, at 900×1000, device pixel ratio 1. Sixteen interaction/fallback checks
passed with no uncaught errors, including actual 90-degree camera rotation,
zoom/reset, no autonomous motion, close/reopen and count changes, context loss,
reduced motion, low memory, unsupported WebGL, initialization failure cleanup,
slow-frame fallback, and mobile touch/scroll emulation. Initialization cleanup and
camera framing were tightened following independent review. The independent
reviewer confirmed both prior prototype findings resolved; projection of actual
vertices across 1,944 stage/aspect/tilt/yaw configurations at maximum zoom found
no clipping (worst absolute normalized device coordinate 0.606135).

The mature tree has 59,078 triangles, 3 draw calls and 3,645 decorative leaves.
CPU submission median/p95 was 0.4/0.6 ms; host frame cadence median/p95 was
72.6/90.3 ms, triggering `slow-rendering` fallback. These are software-host
measurements, not GPU query timing or real iPhone performance. The isolated
minified bundle is 557,753 JS bytes (143,177 gzip) and 1,523 CSS bytes (634 gzip),
with React/i18n external. It is not a deployed transfer measurement.

Decision: **HOLD 3D**. Its procedural appearance does not match the approved photo
assets, and mature-tree performance is insufficiently established. Release the
approved static imagery after the parent checkpoint. No native iOS, physical
iPhone, live Supabase, purchase, or production deployment claim is made by these
local tests. Exact final-SHA CI and public-site checks follow publication approval.
