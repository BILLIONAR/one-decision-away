# Read-only first-use and course mobile discovery

Base `999586179446182ad156c6d249def00459700ea6`, branch `fix/mobile-core-quality`, local preview `http://127.0.0.1:4311`. Repository remained clean. No application edits, installs, provider calls or publication.

No additional material first-use or course defect found in this bounded pass.

- `initial-inspection-report.json` and `initial-inspection.log`: 42 actual screenshots across EN/TR/ES at 320×740 and 390×844. Today, decision, two-minute start, course catalogue, untouched overview, lesson and workbook all fit horizontally; no page errors.
- `finite-behaviour-report.json` and `finite-behaviour.log`: eight screenshots; fresh onboarding radio keyboard selection, final decision draft restoration, optional obstacle planning, actual 120-second timer expiry without automatic completion, course practice/quiz completion, next lesson and returning lesson 2 restoration.
- `discovery-receipt.json`: exact base, source hashes, scope, observed nonblocking keyboard behavior and limitations.
- `inspect-core.mjs` and `finite-behaviour.mjs`: scratch-only reproducible harnesses. An initial nested-summary selector failure is preserved under `before-harness-selector-fix`.

Actual pixels inspected: EN320 timer/overview/lesson, TR320 Today/workbook, ES390 timer, EN320 finished timer and completed course. All 50 PNGs remain here.

These are synthetic local Chromium viewport checks, not physical-device or software-keyboard evidence. All external browser requests were aborted; no account/provider/payment operation was performed. Root owns independent dialog/focus review and implementation selection.
