# ODA Today domino palette — review evidence

Reviewed source: `712d411df93c79ce2f423cfb0be1acc2d3b227f1` on `design/reference-led-oda`.
Comparison baseline: `159901f8859a644add2e3fd44f4ef20368d797ad` (same application source as the previously reviewed `7b78cf89adf3c1bd89e9e5c1540cffdb3953a566`). This packet is evidence only; the source commit above is the exact tested build. No production deployment or main merge.

The selected owned icon8 reference was downloaded into the selected saved Linux cloud and its actual 980×820 pixels inspected by the executor and independent reviewer. Its 188,093 bytes match SHA256 `d0e852498e6d69ba74c59d2b15bf386d280087fdd258cf31f3cfa14dbab05d59`. [Reference PNG](reference/ODA-8-Telefon-Onizleme.png) · [Transfer/pixel receipt](reference/reference-receipt.json).

## Actual synthetic previews

These are captured from the compiled application, with isolated synthetic English records: Alex, a real persisted “Read two pages” decision, and a valid completed first lesson (1 of 103 library lessons; 17% of the current course). They are review fixtures, not real-user records or a new concept render. Images are unaltered PNG bytes; no image generation or pixel retouching.

- [Desktop — 1440×1000](previews/ODA-Today-Domino-Desktop-1440.png) · [Full desktop](browser-qa/final/today-1440-full.png)
- [Phone — 390×844](previews/ODA-Today-Domino-Phone-390.png) · [Full 390](browser-qa/final/today-390-full.png)
- [Phone — 320×844](previews/ODA-Today-Domino-Phone-320.png) · [Full 320](browser-qa/final/today-320-full.png)
- [Planning input focus](browser-qa/final/functional/plan-focus-390.png) · [Save failure](browser-qa/final/functional/plan-error-390.png) · [Saved plan](browser-qa/final/functional/plan-success-390.png)
- [Disabled decision](browser-qa/final/functional/empty-disabled-320.png) · [Dark focus](browser-qa/final/functional/dark-focus-320.png) · [Actual completed decision](browser-qa/final/functional/completed-decision-390.png)

The Library prepared-upload helper failed before preparing any write: `library upload failed: hosted apps tools/list request failed: network`. No Library save is claimed. This packet uses the previously authorized existing review-branch artifact workflow.

## Scope and palette

[Exact source diff](source.diff): one Today stylesheet import and one new stylesheet, entirely guarded by the existing Today route attribute. Page/card geometry, typography, content, original hero image, logo assets, functional code, real progress values and responsive rules are unchanged. Shared navigation receives the approved palette only while Today is active. Other routes retain their existing appearance and theme preference.

Approved colors: warm ivory page `#F7F2EA` and cards `#FFFDF8`; burgundy anchors `#54010C`/`#6A0715`, elevated dark `#711326`; ruby CTA `#C51624`, hover `#D71827`; gold `#E0AB5A`, highlight `#FCEBB6`; light text `#2D1717`/`#756057`, dark text `#FFF8EB`/`#E4C8C0`; links `#A50C24`; borders `#E8D9CB`/`#8A3542`. Existing semantic success/error indicators are retained. Keyboard focus uses ruby on ivory and pale gold on burgundy, with separated rings; disabled actions stay visibly distinct and legible.

The approved contrast exception is confined to gold progress companion tracks: gold against the light track was 1.50:1, so ring/course tracks use elevated burgundy `#711326` for 5.56:1. Numeric progress and fill proportions remain unchanged. The existing hero scrim inherits warm route tokens; its original image is untouched.

## Exact checks and independent review

The single final aggregate run executed `VITE_BASE_PATH=/one-decision-away/ npm run check`, exited 0, and reported 621 passes / 0 failures, including the existing lint (`tsc --noEmit`), translation/data/functional tests and Vite build. It was not silently rerun or replaced. [Actual aggregate log](final-build/aggregate-check.log): 79,256 bytes, SHA256 `fe0c0e94658eda2e8b39e8dbcc2d8e66907356866e1c065e58c219a81c7c7e4c`. [Frozen build receipt](final-build/build-receipt.json) binds all 879 source and 437 compiled files and records a clean, unchanged checkout during the run.

- [Independent source/protection audit](independent-source/source-protection-review-712d411.json): exactly two authorized paths; all 6,405 protected tracked files unchanged, including 305 other source files, 325 public assets, 160 MP3s and 102 test/script files. All 24 CSS selectors are route scoped; no layout, typography or responsive declarations.
- [Sealed independent browser review](browser-qa/final/independent-browser-review-712d411.json): 46/46 focused checks; eight rendered contrast audits with zero automated violations. Actual CTA ratios are 5.66:1 normal and 4.91:1 hover. Plan failure retains the draft; retry saves once. Habit toggle, actual 120-second timer/Stop/reopen/expiry, completion timer pause/resume/reset and repeated completion taps passed. Repeat Confirm produced exactly one completion, one D$ 500 reward transaction and one rendered leaf.
- [Final capture report](browser-qa/final/report.json), [baseline report](browser-qa/baseline/report.json), and [comparison](browser-qa/final/comparison.json): 13 route/viewport cases, exact queried Today geometry at 1440/390/320, no horizontal overflow. Ten non-Today cases retain exact computed styles, text and geometry. Nine of ten PNGs are byte-identical; Sound at 390 differs by 364 pixels at an existing decorative scene edge, manually inspected, with unchanged styles/geometry/asset source.
- [Focused functional report](browser-qa/final/functional/report.json): 12 state PNGs, no page errors or external requests; 188 served HTML/JS/CSS responses bound to the frozen build. Sources/build hashes match before and after browser QA. Owned preview and browser processes are closed.

The packet retains exact final logs/reports and baseline PNGs. Early harness attempts remain in scratch and are not represented as final evidence: lazy route readiness was corrected, the disabled-state assertion was corrected to inspect its distinct background instead of assume reduced opacity, and a native habit-write wait was corrected. These required no app changes; the final run passed on the frozen source. The aggregate log is the original exact tested log throughout.

Limits: installed Chromium desktop/mobile viewport emulation, not physical iPhone, native, WebKit or real accounts/providers. Hero image scrim and overlapping sheet headings produced automated-tool incomplete findings and were manually reviewed; this is not a universal accessibility certification. No new narration listening, runtime, provider, account, migration or production operation was part of this color-only change. Existing two-minute start has Stop rather than Pause; the separate completion timer supplies the tested pause/resume controls.

[Packet byte/hash manifest](packet-manifest.json) covers every packet file except itself. Signed Library URLs, transfer internals, credentials and model runtime are excluded.
