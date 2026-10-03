Focused provisional course-progress reproduction — synthetic review evidence

Confirmed P2 display correctness issue in the frozen candidate. A real Complete lesson action followed by same-tab Today navigation shows 1/6 course lessons completed, 1/103 library lessons completed, lesson 1 Completed in the roadmap, and lesson 2 as the next lesson before the native IndexedDB put has run. The durable record still has lesson 1 incomplete. This is transient exposure of a provisional save, not demonstrated durable corruption.

App source: c2a5e6497f1bed4cf95951375c9aa86872b169a9.
Evidence HEAD: 5ff74beeadcc820adce69541d0a811d5335ad0d7.
Branch: design/reference-led-oda. No repository edits, builds, installs, dependency overrides, commits, pushes, or deployment were performed for this reproduction. All 874 source files and 437 compiled files matched the exact prior build receipt before and after execution. The preview index matched frozen dist/index.html. Git was clean; remote main remained 350aa158f30c773a373f2895e267119f9f2eb17a.

Actual run: 2026-10-03 02:27:05–02:27:15 UTC; existing normal local preview, Chromium 151.0.7922.173, 1440×1000, UTC, reduced motion, blocked service workers, three disposable signed-out synthetic contexts / four pages. Valid already-saved practice and correct quiz prerequisites came from the actual English Turning Point Day catalogue. No real personal record was used.

Method: patch only the targeted native IDBObjectStore.put for record/current first-lesson completion. Withhold its native call, chain native get requests within the same genuine readwrite transaction, and capture the old authoritative snapshot. Keep transaction lifecycle handlers intact. Release the write from an active request callback for success or call transaction.abort for failure. During every pending observation there were zero native mutation puts, an old authoritative completed=false record, and no complete/abort event. A 20-second watchdog bounds the injected hold. Each context close disposes the injected prototype patch.

| Case | Before commit | Outcome |
| --- | --- | --- |
| Actual Complete lesson → Today; successful release | Course 1/6; library 1/103; next lesson 2; authoritative lesson 1 incomplete | Native put/commit saves lesson 1; UI and reload correctly retain 1 |
| Actual Complete lesson → Today; native abort | Same premature completion display while native put count remains zero | Projection, durable record, course/library metrics and next title return to zero / lesson 1; reload also correct |
| Second tab already displaying Today; writer pending; focus-handler event; abort | Storage-event path alone stays at zero; explicit synthetic window focus event makes both metrics 1 and advances next lesson | Native abort returns the reader to zero / lesson 1; reload correct |

Headless bringToFront did not emit a trusted window focus event. Cross-tab focus coverage is explicitly synthetic; no claim of reproducing a trusted operating-system focus transition. Same-tab route navigation and lesson completion used actual visible application buttons. The hold amplifies a real persistence boundary and does not establish usual production frequency/duration. Courses' private optimistic editor state is intentional and was not used as saved-progress evidence. No mobile or all-course coverage is claimed.

No persistent post-abort stale progress or durable corruption was reproduced. No page errors occurred. Two existing Unsplash GET attempts per context were blocked and recorded; no claim of zero external attempts.

Exact finding: existing protection receipt's inheritedDurabilityConcern. In src/hooks/useSavedCourseProgress.ts, the initial read (line 6), focus read (line 10), and replacement read (line 14) inspect readCourseProgress synchronously. That reader reads localStorage (courseProgress.ts lines 110–125). The course mutation projects its candidate to localStorage (line 139) before runOperation's awaited durable commit. The existing cross-tab storage subscription deliberately queues/hydrates before reading (lines 181–186), and failure recovery restores the projection and refreshes AppProvider data. Runtime observations demonstrate the direct-read gap and the working rollback correction.

Minimal proposed remedy, not implemented: initialize the saved-progress hook from a confirmed record rather than localStorage, and route initial/focus/replacement refresh through a coalesced authoritative queue read. Publish only that returned snapshot while the hook's mounted/profile/replacement scope remains current, and retain prior confirmed progress on read failure. Keep the existing committed course subscription / recovery refresh and the intentional optimistic Courses draft. Avoid an unconditional committed-listener → queue-read subscription loop: pure queue reads also notify committed listeners. Re-run these focused success/abort/focus cases and replacement-scope cancellation after the parent authorizes a fix.

Independent read-only review by /root/nonvisual_selection_audit inspected the exact successful harness, structured report and raw run log. It agreed the held transaction evidence supports transient provisional display exposure, P2 severity and successful rollback correction; confirmed the cross-tab focus qualification; and endorsed the hook-only remedy with mounted/request/profile/replacement generation guards and retention of the existing canSync guard. It ran no browser, build or test and made no edits. Root inspected the actual pending and corrected roadmap PNG pixels.

Deliverables:

- [Actual structured observations](attempt-02/report.json)
- [Actual run log](attempt-02/run.log)
- [Exact executed harness](attempt-02/harness.mjs)
- [Synthetic fixture](attempt-02/synthetic-seed.json)
- [Pending roadmap screenshot](attempt-02/same-tab-abort-pending.png)
- [Corrected roadmap after abort](attempt-02/same-tab-abort-settled.png)
- Additional successful-release and cross-tab pending/settled PNGs in attempt-02.
- attempt-01/run.log and harness-original.mjs preserve a scratch syntax failure before any browser started; this was corrected and did not alter app source. No failed raw log was replaced.

report.json: 76,690 bytes; SHA256 feea28d9c4201f1f091da2737437727c8cbe280bcfc39a236bea2309d77c1ffb.
run.log: 569 bytes; SHA256 15d30dd354496341398755eb9917f143b44d4a330f8d5758cf89ce510caf4a24.
harness.mjs: 15,853 bytes; SHA256 732e508d77fd20baaa8115e44c830f55a21d53c462540cb0cbe4b346c9338582.

Evidence is in scratch only. It has not been committed, pushed or published. The parent can read the files directly in the shared selected cloud workspace.
