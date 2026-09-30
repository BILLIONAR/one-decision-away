# Daily practice and weekly evidence

The Today page joins the existing decision, obstacle plan, two-minute start and completion flow into three visible stages: choose, act and look back. The stages read saved data; starting a timer does not claim an action was completed, and a reflection never completes a decision.

A daily reflection is a normal notebook journal entry with stable `promptId: oda-daily-reflection-v1`. Its date is the local calendar date. It can be reopened and edited, remains separate from other journal pages, earns only the existing once-daily notebook reward, and travels with the existing notebook backup and optional sync. Unsubmitted daily and weekly text uses the existing notebook draft store, scoped to profile and date. Drafts survive route changes and reloads within the same tab; intentional data replacement/reset clears them. Unsaved drafts are not backups. A successful save clears its draft, so edits made later in the notebook are visible when the daily editor is reopened.

The weekly look-back shows the calendar week ending on Sunday. It remains available on the following weekdays, and does not require a Sunday or Monday visit. It counts distinct local days with a kept decision, a dedicated reflection or a check-in. Completed decision titles provide concrete evidence. Reviews persist in the existing `weeklyReviews` model; the existing helped/blocked/change fields store the observed result, obstacle and adjustment. A saved review remains editable. Empty reviews cannot be saved.

Today resumes an interrupted course before suggesting a new one from the member's onboarding intent. It reads normalized course progress and lightweight course catalog metadata, then uses the existing course selection contract to open the first incomplete lesson. Full lesson prose stays off the Today import path.

The page updates on focus, visibility change and once per minute so an open session can cross local midnight. Decision selection compares today's latest choice/completion and excludes archived and future plans. Unfinished earlier decisions remain usable carry-overs. Creating a decision now uses the same local day key.

## Design references

These are interface references, not claims about the app's psychological effectiveness. The product inference is to show persisted states clearly and let people resume a small practice across sessions.

- [USWDS step indicator](https://designsystem.digital.gov/components/step-indicator/): visible stages, separate task controls and clear current context.
- [GOV.UK task list guidance](https://design-system.service.gov.uk/components/task-list/): distinguish status from answers; favor a simple flow and resumable progress.

No reference layouts, assets or text were copied. New daily-loop copy is explicit in EN/TR/ES and uses the existing themes, with 44px or larger action targets, visible focus and no added animation.

## Verification

- 11 new regression tests cover local midnight in both timezone directions, stale/future/archived decision selection, replacement choices, review availability, distinct weekly evidence, notebook preservation/edit/reward/JSON round-trip behavior, actual course continuation and localization parity.
- The daily-loop plus existing momentum suites pass 22 tests.
- Chromium, 390×844 mobile and 1440×1000 desktop, reduced motion: unsaved daily and weekly drafts survive reload; saved reflection edits remain one record; the weekly review persists the real kept-day count; reflection leaves an active decision active; the course action opens the selected course's actual first incomplete lesson.
- Mobile document width and scroll width are both 390px. The checked EN/TR/ES mobile layouts have no horizontal overflow. Keyboard focus moves into each editor and returns to its edit button after saving. The tested desktop screen reports zero axe WCAG A/AA violations and zero page errors. Axe is one automated check, not an exhaustive accessibility audit.
- Evidence: `artifacts/qa/today-loop-checks.json`, `today-mobile-daily-loop.png`, `today-mobile-reflection-saved.png`, `today-desktop-daily-loop.png`.

The Linux browser checks do not establish native iOS, device, Xcode or App Store behavior. Optional cloud sync was not exercised in these daily-loop checks.
