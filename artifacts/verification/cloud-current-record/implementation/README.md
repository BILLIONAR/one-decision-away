The current-record cloud follow-up is implemented in `/workspace/oda-cloud-upload-current-record`, branch `fix/cloud-upload-current-record`, based on isolated SoundRoom source `5adcb6a22bda7a087e1718b2cf2eeb105e1248ba`. This subagent has not committed, pushed or published it.

The two exact-base service probes reproduced a stale backup claim after an ordinary durable edit and a stale supplied Notebook payload overwriting newer acknowledged cloud work while preserving newer device bytes. Production manual callers use a render snapshot after `syncFromCloud`; their operation guards previously bound only storage observed at click. The service boundary now freezes supplied JSON, hydrates the existing authoritative record queue, validates both documents and compares canonical backup snapshots before any cloud query. Mismatched, missing or invalid records fail closed. Existing latest-course normalization is preserved.

Durable commits and authoritative hydration notify CloudSync independently of upload scheduling. Current backup confirmation is tied to the saved document, with persisted SHA256 confirmation metadata and conservative verification after reload. `currentDocumentConfirmed` and `lastSyncAt` describe the current document; `lastSuccessfulSyncAt` retains account/project-scoped history. Remote acknowledgement/version/fingerprint remains separate from dirty display metadata. An older valid in-flight upload can retain its remote baseline while later local work stays unconfirmed, allowing the next queued payload to update safely. Dirty startup uses acknowledged remote history rather than a null display timestamp, preserving pending device work.

The local queue is held only during snapshot admission, durable hydration and final metadata publication. Provider requests and digest awaits occur outside it. Every asynchronous hash checks captured account, project, generation, local bytes and owner/import tokens before metadata publication; obsolete completions publish no newer-scope success/error/status. `markRemoteApplied` now returns `Promise<boolean>` and existing test callers await it.

`implementation-receipt.json` records byte counts, SHA256 values, actual commands and outcomes. Final source matched before/after checks in `source-before-final.json` and `source-after-final.json`.

- `focused-final.log`: 149 tests, 149 passed, 0 failed/cancelled.
- `notebook-final.log`: 19 tests, 19 passed, 0 failed/cancelled.
- `lint-final.log`: TypeScript exit 0.
- `diff-check-final.log`: whitespace check exit 0.
- `baseline-service-probes.log`: exact-base actual service/repository diagnosis, 2/2 defects reproduced, no network.
- `new-tests-before.log`: immutable original 21-case red run on original service SHA `74f6405e6fe70cf89f7ac64473565a8d812ebc8180d3a0dc7e214e8183713dce`.
- `new-tests-adversarial.log`: 11 later cases expanded the file to 32, with 27 passes and 5 stale-notification failures; preserved before their fix.
- `new-tests-after.log`: final 32/32 current-record cases passed, with matching source hash lists and denied network access.
- `existing-before-adapters.log`: actual intermediate 104/110 run; API-await and dirty-display assertion changes are recorded in the final diff rather than concealing this run.

Three initial course fixtures used an unknown lesson and were subsequently corrected to the actual catalogue lesson. Clean reload subsequently gained a public-state subscription wait for asynchronous verification. Eleven async cases were added later. The final 32-case source is therefore not asserted to be byte-identical to the original 21-case red source; both logs and hashes are retained.

These are real service/repository tests with synthetic local storage, CRUD and timers. The Node external-tab case represents coherent bytes after hydration. It does not verify browser IndexedDB/Web Locks, native hardware, actual UI rendering or provider operations. Independent actual-caller review, browser QA, aggregate checks and final publication approval remain with the parent. The prior documented legacy-writer limitation remains: timestamp-only CAS cannot detect a writer that changes content without advancing the timestamp between SELECT and PATCH.

Owned source changes are CloudSync, its canonical helper, and a generic durable queue subscription. Repository/course source, AppProvider, SoundRoom and all visual branding are unchanged by this subagent. Root owns the Account/Settings consumption of the new state. Existing protection tests retain account/project/import/owner checks, and distinguish unchanged remote acknowledgement permission from current dirty display status.
