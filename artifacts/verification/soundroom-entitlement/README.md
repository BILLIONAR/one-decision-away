# SoundRoom entitlement review candidate

Source commit: **`5adcb6a22bda7a087e1718b2cf2eeb105e1248ba`** on `fix/soundroom-entitlement`, based on `8fe9e55b602cc757646aa2c51baac8e176284840`. Exactly six source/test files changed. This packet is review evidence; production remains held.

Native SoundRoom starts and resume now check current confirmed Essentials-or-higher access and the selected category/index. Downgrade, unconfirmed identity or a different account revision clears only an owned restricted selection and its audio graph, including paused tails. It clears active timing and sleep state, retains the timer preference, and requires a new tap after access returns. A pricing/offerings reload preserves an already-confirmed same-account paid tier.

Free entries and duplicate-track free placements remain available. External Focus replacement, including the same track and synchronous state-publication handoffs, retains its own graph and envelope. Web and unconfigured purchases remain open. Failed or missing audio starts cannot publish false playback. No engine, purchase policy, catalogue, package, native, workflow or styling source changed.

## Evidence

- [Final review receipt](final-review-receipt.json): exact source, build, evidence hashes and limits.
- [Final aggregate log](implementation/aggregate-check-v2.log): **565 passes, 0 failures**, full lint/i18n/Notebook/voice/routing/test/Pages-build command. **72,608 bytes**, SHA256 `cb05f88fb5e77a4510d905ea18f2c3cbe7e46bd5ab607debcaa4e9902a017b42`.
- [Aggregate source/build receipt](implementation/build-receipt-v2.json): source bytes stayed unchanged and match the committed source.
- [Implementation receipt](implementation/implementation-receipt.json): **67 focused checks** with actual player/engine code and synthetic audio/purchases.
- [Independent receipt](independent/final-review-receipt.json): **53 actual-player probes**, **62 actual-engine tests**, **15 extracted UI checks** and 17 catalogue bindings. Prior ownership findings and their unchanged probes are preserved.
- [Styled browser report](browser/report.json) and [browser receipt](browser/review-receipt.json): **22/22**, 12 inspected EN/TR/ES PNGs at 320/390 px. Both main and separately built SoundRoom CSS are bound to the tested build. No clipping; ES320 retains intentional internal tab scrolling. Zero observed provider/WebAudio attempts, page errors, unexpected external attempts or failed local responses; **192 expected Unsplash image aborts** exercise the existing fallbacks.
- [Protected appearance parity](protected-appearance-parity.json): all **83** protected files equal main `350aa158f30c773a373f2895e267119f9f2eb17a`.

Current screenshots: [EN390 top](browser/soundroom-en-390-top.png), [EN320 full](browser/soundroom-en-320-full.png), [TR390 full](browser/soundroom-tr-390-full.png), [ES320 full](browser/soundroom-es-320-full.png). The browser directory includes all twelve current PNGs.

## Preserved attempts and review limits

The [original red baseline](implementation/red-baseline.log) remains unchanged: 12 existing checks passed and 25 draft checks failed. One draft expectation was corrected: `ready=false` describes offerings loading and must preserve confirmed cached paid access. [Start-edge failures](implementation/start-edge-red.log), [pause/timer handoff failures](implementation/handoff-review-red.log), independent interim findings and the [earlier passing aggregate](implementation/aggregate-check.log) are retained separately.

The [first browser attempt](browser/before-route-css/fixture-gap.md) omitted route CSS. Its original report/log/twelve PNGs remain byte-exact under `browser/before-route-css`; those screenshots are **invalid for visual acceptance**. Current PNGs load both built stylesheets.

Tests are synthetic: no actual native device, paid SDK/customer update, real audio output or human listening QA was performed. Direct Focus sound entitlement policy remains outside this SoundRoom-only change. The inherited cloud guard is **HOLD** after parent reproduced stale caller payload rollback and a dirty-document backup-status gap; a separate `fix/cloud-upload-current-record` follow-up is in progress. This SoundRoom review pass is not a combined publication approval.

[PACKAGING.json](PACKAGING.json) records preserved raw bytes. Harness source files carry `.txt` suffixes. The two generated `fixture.js` snapshots carry `.log` suffixes, which are force-added despite the existing Git ignore rule. This keeps their raw bytes reviewable while preventing Tailwind from scanning bundled runtime strings; restore original names in scratch to reproduce. CSS snapshots are preserved too. No production merge or deployment occurred.

## Packaging correction

The earlier evidence tip `f97e22e95a954c78147df151031604921b0c5fca` stored generated bundles as `.js.txt`; a post-artifact build proved Tailwind scanned those strings and changed compiled main CSS. That tip remains intact. This separate evidence-only correction renames only the two generated bundles to `.js.log`, without changing their bytes or app/config/style source. All 386 resulting build files match the original reviewed aggregate byte-for-byte. [Packaging build proof](packaging-build/receipt.json) preserves the original failed equality check and the successful correction. The original aggregate logs and PNG bytes remain unchanged.
