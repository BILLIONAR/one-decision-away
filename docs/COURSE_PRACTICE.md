# Course practice and transfer

Updated September 30, 2026. This is the rationale and data contract for ODA's optional course practice workbook.

## Reader outcome

The existing 18 courses retain their lesson IDs, order, reading, exercises, knowledge checks, sources, and entitlement rules. The added experience helps a reader leave with one usable plan, a record of what happened when trying it, and a chosen next adjustment. It does not assess mental health or claim that completion proves a personal change.

Each course has a distinct English, Turkish, and Spanish practice guide. Three milestones move from noticing the situation to trying an action and carrying the useful part into another ordinary situation. A collapsed workbook keeps the primary lesson readable. Readers can start with the example without replacing any notes they already wrote, or create their own plan.

The plan contains a recognizable situation, a small action within the reader's control, a smaller fallback, and an observable sign. The journal records attempted, adapted, or paused practice without success scores or streak penalties. Review asks readers to recall the useful idea before rereading and choose a concrete adjustment. The default seven-day revisit is an editable return date, not a notification or a scientifically established dosage.

## Source decisions and limits

Primary/public sources opened on September 30, 2026:

- [Gollwitzer and Sheeran's implementation-intention overview, archived by the US National Cancer Institute](https://cancercontrol.cancer.gov/brp/research/constructs/implementation-intentions). Researchers describe connecting a recognizable situation to a feasible action. This archive is no longer maintained. ODA adapts the general planning structure; the source does not test this workbook.
- [Harkin et al., progress monitoring meta-analysis, PubMed abstract (2016)](https://pubmed.ncbi.nlm.nih.gov/26479070/). Experimental evidence across varied goals informed the choice to offer an observation journal. Only the abstract was reviewed. It does not validate this journal or require sharing private entries.
- [Institute of Education Sciences, Organizing Instruction and Study to Improve Student Learning](https://ies.ed.gov/ncee/wwc/PracticeGuide/1). Its educational recommendations informed recalling an idea before reviewing and revisiting it after a delay. Extending these principles to a personal-growth app is a product inference; this app and its review schedule were not evaluated by that guide.

Visible links and source-specific limits are available in each workbook. No book quotations, effect-size charts, medical treatment protocols, or guarantees were added. Health-related examples stay within existing course scope, allow stopping or choosing support, and do not prescribe sleep restriction or forced breathing.

## Persistence and privacy

`CourseProgress.version` remains 1. Its optional `experiments` field maps existing course IDs to `CourseExperiment` records. Plans, dated journal entries, and review notes are included in the same user-owned ODA data as course progress and are covered by backups and optional enabled sync. The UI says this clearly. There is no new cloud service, credential, or permission.

`courseLearning.ts` whitelists existing course IDs, bounds plan text to 500 characters and notes to 1,000, validates calendar dates and attempt outcomes, deduplicates entry IDs, and retains the most recent 60 entries per course. The retention limit is shown when reached. Plain text export lets the reader retain their own practice notes.

Live edits pass updater functions through `mutateCourseProgress` and the shared data-write lock. The optimistic draft queue keeps pending updates until a write succeeds, rebases them onto the latest saved data, and replays them over same-tab/cross-tab save notifications. Quota failures preserve the active draft and expose a retry control. Lesson completion still requires the original practice checks, correct answer, and completed prerequisites; practice plans do not unlock lessons.

## Verification

Unit regressions: `node --import tsx --test tests/course-learning.test.ts tests/course-progress-draft.test.ts tests/course-progress.test.ts`.

Real Chromium flow: start a dev/preview server, then `node --import tsx scripts/qa-course-learning.mjs`. The script uses fresh disposable browser contexts, supports `ODA_QA_URL` and `ODA_CHROMIUM`, and writes its actual report/screenshots under `artifacts/learning`. It exercises EN/TR/ES, search and categories, keyboard workbook disclosure, interruption/reload, practice and reflection persistence, review, text download, blocked storage/retry, sequential lesson progression, narrow/mobile/desktop layout, and axe checks scoped to the course surface. Browser checks are not Xcode, device, or App Store validation.
