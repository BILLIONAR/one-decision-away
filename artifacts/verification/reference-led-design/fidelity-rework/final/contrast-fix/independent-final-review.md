# Independent final review — 3ddb98b

**Strict fidelity remains FAIL; bounded correctness evidence is complete with disclosed P3 limitations.** Sound imagery/material remains 2/4, below the declared close-fidelity minimum. The saved-plan contrast and first-proof text-column P2 repairs passed. The raw full diagnostic matrix remains `pass=false` because its 18 calendar-selection assertions expected a selected filter to remain selected after toggling it; a separate corrected 18-context probe passed the actual true → false → true behavior. The raw results are preserved, not rewritten as a clean matrix pass.

Exact application source: **3ddb98b57669ceed6f220583aa01aa523d6b6a47**, existing `design/reference-led-oda` branch. Actual preview: `http://127.0.0.1:4183/one-decision-away/`. The aggregate receipt records **597 passed / 0 failed**, 696 source files matching Git and stable during the run, and 394 dist files. Independent diagnostics verified all 696 receipt source hashes before/after and all 394 compiled file hashes against that receipt. The exact aggregate log is **76,405 bytes**, SHA256 **9ceff55d932ced364b6f0c9a83104a2e31ee5bbeb132464bb29f6317c19836d2**; bytes/hash were independently checked.

## Bounded diagnostics

| Evidence | Actual result |
| --- | --- |
| EN/TR/ES × light/dark × 320/390/1440 | 18 contexts, 378 measured states, 426 viewport PNGs |
| Scoped axe | 128 scans, zero violations; incomplete-rule occurrences: contrast 84, aria-prohibited-attr 16 |
| Runtime / local HTTP | Zero page errors, zero local HTTP errors |
| Saved-plan / completed-proof target run | 18 contexts passed; proof text widths 114px at320 and184px at390, decorative tree80px |
| Corrected calendar probe | 18 contexts passed selected true → deselected false → selected true; unsaved draft retained |
| Sound native labels / controls | All90 option measurements fit; native10/60min keyboard selection, volume Home/ArrowRight, real pause/resume passed; mobile player/nav clearance≥8px |
| Compact Notebook dates | Seven actual dates; minimum44×62px targets; real keyboard/date filters and archive/editor/photo controls exercised |
| Source / compiled bytes | 696 receipt source files equal/stable; 394 dist files equal/stable |

Covered Today real decision, saved plan, completion/proof; Coach actual idle state, keyboard starter/focus and reduced motion; Notebook initial week/editor, full calendar scrolling/hint/focus/weekend reachability, retained draft, real isolated archive entry and native photo dialog Escape/focus; Courses search/filter, overview/lesson/quiz/workbook; Focus real duration/preset controls, eleven guided sessions, speaker-labelled recorded-English preview; Sound discovery/detail/active player/native timer/volume. The matrix contains synthetic isolated profiles, synthetic text and an explicitly synthetic photo. All external origins were intercepted and aborted: 18 external Unsplash image requests, no provider/model/account/payment action. No physical-device or human audio listening/transcription claim is made.

Personally inspected **18 actual diagnostic PNGs**, one in every matrix context, spanning these surfaces, plus four repaired-state PNGs. The ten representative previews were rebound under `after/`: nine are byte-identical to the individually inspected exact d7e previews; the final full-calendar PNG was newly opened and inspected. Historical 4a8/6d4/37b/d7e logs and PNGs are preserved. Representative scores remain Sound68.75, Coach85, working surfaces82.5; Today scenic real action/progress, compact Notebook writing/date hierarchy, Focus25/Start and actual course roadmap remain corrected.

## Preserved harness failures

`diagnostics/report.json` and `diagnostics.log` retain `pass=false` and all18 raw `calendar keyboard selection` failures. Compact-week current-day selection already sets the date filter. Enter on the same full-calendar date correctly toggles it off, contrary to that old assertion. `calendar-correction/report.json` records the correct true/false/true sequence and draft continuity in all18 contexts with no failures. No app change or broad matrix repeat was used to hide the mismatch.

`diagnostics-attempt1/` and its raw log retain an earlier harness timeout: selecting a September compact-week date before mounting the calendar correctly initialized the view in September, where October2 is absent. `calendar-correction-attempt1/` and its raw log retain another probe-order timeout: the already-open calendar maintains its independently navigated month. The successful probe selects the current-day week filter before mounting the full calendar, then tests the real keyboard toggle. This does not claim that an already-open calendar automatically navigates to each externally selected date.

## Remaining P3 limits

- Completed FirstSteps card: **`#tomorrow-draft` measures210×22px atEN320**, and **Dismiss measures40×40px**. The component is byte-identical at4a8,37b,d7e and3dd: 8,166 bytes, SHA25655e735b0c09d7ff20612cc300df5386ab0313c8c9a3c1fa258a9b042e2c01fa8. The explicit Dismiss40px and tomorrow input `flex-1 h-11` / parent column markup are inherited protected code. The exact earlier rendered22px input height was not measured, so that historical pixel height is not asserted. See `proof-field-probe/report.json`, its actual PNG and `protected-control-provenance.json`.
- The inherited TR Notebook Delete target measures36.78×44px. Relevant compact-week dates and player controls pass their targeted sizing checks; no global≥44px claim is made.
- The existing EN/ES320 daily-practice title intentionally ellipsizes; its full text remains in the DOM. Accessible `sr-only` label cropping is intentional. Full calendar/week columns scroll within named regions with visible hints. No global zero-clipping claim is made.

Scoped axe and actual PNG inspection do not establish full WCAG compliance. Incomplete contrast/ARIA findings require judgment beyond the automated scope; no global certification is asserted.

## Fidelity/art evidence limitation

All seven actual inline JPEG references were personally inspected. Local original attachment JPEG bytes remain0/7. Parent subsequently found public flattened Dribbble presentations for references1–3; this report does **not** claim all original sources are unavailable. Clean production artwork/layers and material-equivalent app art remain unestablished; the parent’s normal CDN download received403 and was not retried through a bypass. Scenic/orb SVGs remain declared originals/approximations, with no photographic identity claim or fabricated reference-image column. Sound remains below the strict material gate; parent/user visual approval remains outstanding.

## Deliverables / closure

- `diagnostic-summary.json`: exact counts, source/build/log binding, calendar interpretation and limits.
- `diagnostics/report.json`, `diagnostics.log`: complete raw matrix including18 assertion failures.
- `p2-targeted/report.json`: repaired planning/proof evidence across18 contexts.
- `calendar-correction/report.json`: corrected actual keyboard/filter semantics across18 contexts.
- `proof-field-probe/`: exact P3 measurement, PNG and protected-code provenance.
- `after/`: exact final representative previews and source/build capture receipts.

All browsers and source/build readers are closed. No app source edits, package installs, build, deployment or publication occurred in this independent role. Evidence is ready for the parent review packet; this report grants no visual or publication approval.
