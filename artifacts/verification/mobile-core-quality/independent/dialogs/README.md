# Mobile core keyboard and recovery QA

## Immutable baseline

`baseline-report.json` and `baseline-receipt.json` bind the actual Chromium run to base commit `999586179446182ad156c6d249def00459700ea6`. All four captured source hashes match the base Git blobs. Baseline source remained unchanged throughout execution.

The run reproduced two P2 defects with six failed user-facing assertions. Five supported-dialog and recovery controls passed. The Focus End early confirmation did not move or contain focus, expose a dialog name, or respond to Escape. Keyboard focus could activate Pause behind the open confirmation. Notebook escalated to whole-app recovery when either native dialog method was unavailable; the recovery export and support route retained the exact synthetic saved record.

Four original PNGs document these behaviors. Their raw byte checksums, the exact report checksum, and runnable harness checksum are in `baseline-receipt.json`. `before-harness-heading-fix/` preserves an earlier ambiguous-heading selector failure; it is a harness diagnostic, not product evidence.

The root separately reproduced the selected third issue, fullscreen unsupported/denied requests, under `/tmp/oda-mobile-quality-root`. Only these three selected defects are in scope for final regression QA.

## Execution and boundaries

The actual app, AppProvider, repository and handlers run through the root-owned local Vite preview at `http://127.0.0.1:4311` in the saved Linux cloud executor. The harness uses synthetic local records, a synthetic pixel photo, completed onboarding and muted silent focus. All non-preview requests are intercepted and blocked. Browser feature absence is explicitly simulated; this does not certify a physical legacy device, native install, provider, payment, cloud account or audio quality.

Run the baseline only against its corresponding baseline source; its expected exit status is 1 because it records six failing baseline assertions:

```sh
cd /workspace/oda-mobile-core-quality
node --import tsx /tmp/oda-mobile-quality-focused/audit.mjs
```

No app source, dependency, provider configuration or publication is changed by this QA.

## Independent current-source regression

The root authorized one repository harness, `scripts/qa-mobile-core-quality.mjs`; that is the only repository file this QA agent authored. The app fixes remain root-owned. The harness supports `ODA_QA_URL`, `ODA_MOBILE_CORE_QA_OUT` and `ODA_CHROMIUM`, uses existing dependencies, and blocks requests outside the selected preview origin.

`final-dev/report.json` records **61 passing checks**, nine disposable browser contexts and ten original viewport PNGs on the root-owned dev preview. Zero page errors and zero external requests were observed. All six captured source hashes remained unchanged during the run. The report and screenshots are byte-bound in `final-dev/receipt.json`. All ten PNGs were inspected at their original resolution; native and fallback photo panels, images and Close controls fit 320/390px viewports.

Focus coverage includes accessible naming, initial safe focus, forward/reverse Tab, background Pause isolation, missing inert, Escape, Keep going, backdrop, reopening, return focus, scroll restoration and explicit cancellation without falsely recording completion or changing saved data. Photo coverage includes genuine Chromium native dialogs, missing showModal, missing close, missing both methods plus inert, keyboard containment, loaded owned image, close/Escape/backdrop/reopening/reload and exact saved-record retention. Fullscreen coverage includes a disabled unsupported control, denied-request truthful state, Pause/Resume recovery, genuine supported Chromium entry, externally initiated API exit, reentry and explicit exit.

The final photo is a synthetic journal record using the repository-owned `public/assets/oda/trees/tree-00-seedling-0.png`; its exact checksum appears in the report. Baseline pixel-image records and raw artifacts remain unchanged.

`before-fullscreen-fixture-fix/` retains an intermediate fixture diagnostic: 54 dialog/photo checks passed, but an early init script tried to patch a not-yet-created document element. This fixture error was corrected by patching the Element prototype. The first full-page captures are not valid viewport review evidence. Final screenshots use actual viewport captures.

This is current-source development-preview acceptance; it is not a built-release, physical device or provider validation. Root will execute the same reusable harness against the final tested production build before publication review.

```sh
cd /workspace/oda-mobile-core-quality
ODA_QA_URL=http://127.0.0.1:4311 \
ODA_MOBILE_CORE_QA_OUT=/tmp/oda-mobile-quality-focused/final-dev \
node --import tsx scripts/qa-mobile-core-quality.mjs
```
