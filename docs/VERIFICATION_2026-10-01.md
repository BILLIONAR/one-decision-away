# ODA additional bug review · 1 October 2026

The preserved cloud checkout now contains a further implementation review and repairs at **`272348d360cf4f047f68ceb0f8ad3d2edad93e7d`**, on `feat/oda-growth-studio`, following `ec89ff6145d189de3326e466ab1f70e0cd42525e`. Main remains `b27d1ea2cbb3a516657ff0dbeb3c35494e9ade41`. This report covers the additional review; [the original product report](VERIFICATION_2026-09-30.md) describes the design, onboarding, Today practice and 18-course workbook implementation.

## Confirmed problems and resulting behavior

| Reproduced problem | Repair and regression evidence |
| --- | --- |
| Stale profile/settings snapshots reversed completed missions or lost rewards and other concurrent edits. | Baseline-aware merging preserves independent fields and rejects conflicting edits or snapshots from a replaced dataset. Purchases, savings and bridge commands reread under the record lock. `tests/deep-storage-review.test.ts` covers 15 cases. |
| Two tabs could still lose independent course checkbox edits after a Web Lock handoff: Chromium's localStorage projection remained stale in 4 of 8 repetitions. | IndexedDB supplies the committed shared baseline under the lock. Current browser evidence retains both edits in all 8 repetitions. |
| Transient course storage errors could be interpreted as empty progress; failed private drafts disappeared after internal navigation or lacked retry on locked lessons. | Mutations fail safely, private session drafts survive internal routes, and editable workbooks retain save warnings/retry. Successful replacements cancel previous drafts without resurrecting them. |
| Provisional restore events could discard private drafts before a later transaction abort, including a session first opened during the restore and a same-tab event after releasing the lock. | Initial course state comes from confirmed data; other-tab notifications hydrate under the queue; same-tab course publication occurs under the commit lock. |
| A restore could outlive its account, and a failed compensating transaction could expose the cancelled record on the next read. | Guarded candidates retain a durable previous snapshot. Rejected candidates and failed finalization continue to read the previous record across tabs and real reloads. Publication and draft reset happen only after successful finalization. |
| Deferred backups could capture B's account after an A-origin save. Course storage notifications could also schedule uploads from the receiving tab. | Repository and course commands retain the initiating account guard. Only the origin tab schedules a course upload, and only while its account remains current. Ordinary local saves can still succeed after an account switch. |
| Sync and deletion UI actions crossed an account boundary while awaiting work. Late A deletion responses could sign B out. Coach history and sharing consent carried across accounts; a B-authenticated synthetic request included A's history. | Asynchronous actions remain bound to their original account/project. Coach history, draft and consent reset; obsolete responses cannot alter B's pending request. Cancellation covers response-body download. No real provider/deletion requests were used. |
| Global/historical sync timestamps hid the correct remote record, including A→B→A. | Account/project timestamps are trusted only with ownership metadata matching the current dataset replacement epoch. Metadata write failures remain conservative. |
| Habit and check-in UI used local dates while writes used UTC. Undo/recheck duplicated rewards; the remaining daily reward budget could be exceeded. | Personal calendar records use the local day, both check-in surfaces share a record, and rewards stay idempotent within the existing UTC ledger cap. Historical rewards remain unchanged. |
| Automatically offered planning overlapped a completion dialog and lost fallback focus. | Planning waits while the other interaction is open. Keyboard containment, reopen, Escape, short viewports and native/fallback dialogs pass Chromium checks. |
| Malformed backup dates/renderer fields crashed notebook rendering or normalized away private attempt notes. IDs generated in one clock tick collided. | Validation rejects these imports before replacement, legitimate legacy/leap-day records remain accepted, and record IDs remain distinct. |
| Failed Settings saves surfaced as unhandled promises without useful feedback. | Failed saves report an accessible error, retain form input, preserve the saved theme and support a successful retry/reload. |

All records in regression artifacts are disposable synthetic fixtures. The review did not read or modify a production Supabase database or send personal workbook text to analytics.

## Exact final automated results

`npm run check` passed with Node **22.23.3**:

- **258 core tests + 19 notebook tests = 277 distinct tests**, all passing.
- The routing script reran 11 tests already included in core; they are not added again.
- TypeScript (`npm run lint`), translation validation, locale assertions and device-only voice assertions passed.
- Root production, `/one-decision-away/` project-folder and iOS-target **web** builds passed.
- Strict store metadata passed for 4 locales and 6 subscriptions.

The prior report's 209 distinct tests were accurate for its earlier source. This review adds **68** distinct regressions, giving **277**. Intermediate failures are retained rather than relabelled as final successes: two old test fixtures were updated to supply the new queued-restore baseline and a stable synthetic signed-in scope. The offline runner now waits for acknowledged persistence before reloading. These fixture repairs retain the original data/reward/privacy assertions.

Final log: `artifacts/verification/deep-release-check-passed.log`. The repository's lint command checks TypeScript; there is no separate ESLint configuration. Main JavaScript is approximately **785 kB minified / 260 kB gzip**; deferred course content is 2.51 MB and optional WebLLM 5.96 MB. Bundle warnings remain; these figures are not measured Core Web Vitals or device performance.

## Browser evidence on the final implementation

Fresh source server: `http://127.0.0.1:3040`. Fresh production root: `http://127.0.0.1:4179`; project build: `http://127.0.0.1:4180/one-decision-away/`. Engine: installed Chromium **151.0.7922.173**, Playwright **1.63.0**, Linux. These local URLs are reproducibility references, not published user links.

| Suite | Named checks | Report under `artifacts/verification/` |
| --- | ---: | --- |
| Onboarding, Today, notebook, restore, layout/accessibility | 39 | `deep-release-browser/browser-report.json` |
| International landing, keyboard preview and contrast | 16 | `deep-release-landing/report.json` |
| Course catalog, workbooks, progression and export | 28 | `deep-release-learning/course-browser-report.json` |
| Backup and simulated cloud review | 13 | `deep-release-backup/report.json` |
| Native/fallback web dialogs | 13 | `deep-release-modals/report.json` |
| Offline and project routing | 9 | `deep-release-platform-acknowledged/report.json` |
| Draft retry and repeated two-tab course edits | 12 | `deep-release-courses/report.json` |
| Local dates, rewards, check-ins and modal overlap | 6 | `deep-release-modal-date.json` |
| Settings failures and retry | 3 | `deep-release-settings.json` |
| IndexedDB abort, durable fallback, draft privacy and API failure | 14 | `data-authority-release.json` |
| Independent account-boundary review | 5 | `independent-account-fences-final.json` |
| **Total named Chromium checks** | **158** | |

Two additional dedicated synthetic Coach/Account scenario runners passed: `deep-release-cloud.json` and `deep-release-account/after.json`. These use boolean assertions without a named-check array and are not added to 158. Final reports contain no uncaught browser errors; scans contain no serious/critical axe findings. Tested layouts include 320/390px mobile and desktop, EN/TR/ES, light/dark and reduced motion. This is bounded automated accessibility evidence, not a complete assistive-technology audit.

The independent final reviewer inspected the pending-restore and same-tab notification repairs and reran its five browser checks successfully. The authority suite verifies cancelled candidates in another tab and after real reload, failed finalization retaining course/notebook drafts, and no B upload for an A-origin action.

### Restore and storage boundary

A guarded replacement checks the original account and original committed record after its recoverable candidate becomes durable. That synchronous check is its authorization/ordering point. If rejected, readers keep the prior record without requiring a compensating write. If accepted, finalization must succeed before publishing or clearing drafts. An account change after authorization follows the accepted local restore; automatic uploads still require the original account. The existing local personal record remains a shared-device record, not separate private vaults for each login. See [the storage contract](DATA_BACKUP.md).

Browser persistence requires Web Locks and IndexedDB. Unavailable APIs fail visibly rather than accepting unsafe writes. Existing records remain recoverable. Open tabs running an older application build should refresh before further edits; browser site-data clearing includes both IndexedDB and localStorage.

## Delivery and remaining release gate

Only the development branch is intended for transfer to GitHub. The repository's sole deployment workflow triggers on main or manual dispatch, not this branch. No main merge or Pages dispatch is part of this review transfer. Actual remote SHA and push outcome are reported separately after verification. No external deployment hook was observable in the exposed repository reads; this is not a claim of administrative hook visibility.

**WebKit remains blocked in this existing task:** the authorized official retry received HTTP 403; no WebKit browser or application checks ran. The exact rejecting network layer was not verified. No further download attempt after that denial, alternate host, mirror, proxy bypass, Library workaround or environment reset was used. The newly published environment config is intended for a fresh QA-only task fetching this verified branch. [Native/cloud handoff](CLOUD_MOBILE_VALIDATION.md) records the exact official runner and limits. Main/live publication remains conditional on that WebKit/mobile pass.

No Xcode compilation, physical iPhone, native VoiceOver/keyboard, notifications, StoreKit or live Supabase validation occurred. The iOS 16.4 baseline and English-primary international branding remain aligned; EN/TR/ES choices remain supported. The review does not establish a bug-free application.

Original seven files in `/workspace/shared` remain intact. Library did not finalize any upload and has no verified file IDs. GitHub branch source/evidence is the authorized durable transfer path.

## Two review images

- `artifacts/verification/deep-release-browser/today-desktop.png`: 137,377 bytes; SHA256 `10fd1445557b267162d7ceb7ded7285b977c9df3553fd14d0d6454c0d6587df6`.
- `artifacts/verification/deep-release-learning/workbook-mobile-plan.png`: 52,790 bytes; SHA256 `f847d52ee397e0c382738a7d6fb09083c6bf24c2c360b07332978587c4990a5e`.

Both were produced by the final browser runs and visually inspected. Their hashes match the original screenshots because this review repaired behavior and persistence while preserving the design.
