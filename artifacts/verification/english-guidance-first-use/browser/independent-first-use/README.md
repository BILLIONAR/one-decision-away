Independent first-use and course-entry QA passed on the functional-only candidate based on main `350aa158f30c773a373f2895e267119f9f2eb17a`, branch `feat/english-guidance-functional`. Normal Chromium preview: `http://127.0.0.1:4187/one-decision-away/#/app`. Synthetic browser records only; all external requests were blocked. No source edits, package installations, certificate bypass, account changes, or publication occurred during this review.

The final run passed 46 checks and 28 scoped axe scans with no serious or critical findings or browser exceptions. It captured 35 actual PNGs. EN/TR/ES onboarding preview, proof and course overview fit at 320×844, 390×844 and 1440×1000. Actual EN320 and ES390 proof pixels were inspected after the scoped fix.

The preview earns no real completion/reward. A fresh chosen decision reaches the final field and survives reload; saved empty, whitespace and existing text, plus manually typed text, are preserved. Setting a decision, reloading or returning to Today never automatically opens planning after 700 ms. Explicit planning persists. The real timer is unfinished at 119 seconds and finishes at 120 seconds without a reward; three synchronous confirmation taps yield exactly one completion, one reward and one leaf across reload.

The overview uses the real localized description, outcome, lesson titles and minutes before lesson 1. A saved learner resumes lesson 2 directly with their reflection preserved. Today exposes that actual lesson's title, six minutes and goal without fetching the full Courses chunk. The parent's broader course/quiz/workbook harness is separate from this focused independent review.

The first candidate's proof caption overflow is preserved under `before-proof-fix/` as historical evidence; it is resolved in the final PNGs and report. Fixed navigation appears at the original viewport position in long full-page screenshots; the content remains scrollable.

Reproduce from the candidate repository with `ODA_QA_REPO=/workspace/oda-functional-candidate ODA_QA_URL=http://127.0.0.1:4187/one-decision-away/# ODA_QA_OUT=/workspace/scratch/oda-first-use-reproduction node --import tsx artifacts/verification/english-guidance-first-use/browser/independent-first-use/independent-first-use-harness.mjs`.

Build receipt SHA256: `527e2ffc217c3816c7579e3793c06ad4e50330aae812989e39f34926d49e7407`. The report and `evidence-sha256.json` bind the screenshots and harness to this run. Publication remains subject to the parent visual/QA checkpoint.
