# Independent final built first-use/course checks

PASS against exact committed source `b6b8f76bb5f4507ee6f5f927092c8c58cb41b569`, built Pages preview `http://127.0.0.1:4313/one-decision-away/#/app`. Baseline `999586179446182ad156c6d249def00459700ea6` discovery evidence remains in the parent directory. Only scratch copies of the harnesses were adjusted for the output namespace and actual Pages URL/origin. No repository edits.

- `preflight-receipt.json`: all 687 source files and 386 dist files match the parent's exact build receipt.
- `served-entry-receipt.json`: actual HTTP index and `assets/index-BHJu62wr.js` return 200 and match local dist bytes; the JavaScript has the correct content type.
- `initial-inspection-report.json` / `.log`: 42 screenshots, EN/TR/ES at 320×740 and 390×844, covering Today, saved decision, two-minute start, course catalogue, untouched overview, lesson and workbook. No horizontal overflow or page errors.
- `finite-behaviour-report.json` / `.log`: eight screenshots. Fresh onboarding keyboard radio selection and final decision draft restoration; optional obstacle planning; actual timer reaches two minutes without automatic completion; practice/quiz completion; next lesson and saved lesson 2 restoration.
- `final-browser-receipt.json`: final status, all 687 source/386 dist hashes unchanged after the run, clean repository, 50 PNG count and the existing nonblocking course completion focus observation.
- `evidence-manifest.json`: exact hashes for this final evidence namespace, excluding the manifest itself.

Final pixels inspected include the 320px completed timer, Turkish 320px workbook and Spanish 390px timer. External browser requests were aborted (22 attempts across both runs). These are isolated synthetic Chromium checks, not real account/provider/payment, physical-device, listening or software-keyboard tests. Parent owns selected-dialog/fullscreen QA, aggregate verification and publication.
