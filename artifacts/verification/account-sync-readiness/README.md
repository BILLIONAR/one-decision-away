# Account sync readiness diagnostic

This is a synthetic local diagnostic of candidate `dcb05c3622b92a7545054df535915de408743bb2`, not an implementation or a production test. It exercises the actual `CloudSync` singleton and `LocalDemoRepository`, using an injected in-memory Supabase client, localStorage and timers. Global fetch is denied and counted. No email was sent, account created, remote provider contacted, package installed, or repository source edited by this investigation.

Run from `/workspace/oda-native-settings-otp` with the existing dependencies:

```sh
node --import tsx /workspace/scratch/oda-account-sync-readiness/probes.mts
node --import tsx --test tests/cloud-restore-scope.test.ts tests/deep-cloud-review.test.ts tests/backup.test.ts
```

Actual results: **12/12 diagnostic assertions passed; seven assertions reproduce P1 overwrite risks, rather than seven fixes.** Existing focused cloud tests passed **42/42**. Live network calls: **0**. The local probes do not mount React, run a simulator, validate the deployed database/RLS, or exercise real OTP/native accounts.

| Trigger | Actual observed result |
| --- | --- |
| Fresh OTP sign-in with existing cloud record | No SELECT follows authentication; first ordinary local edit uploads the entire device document, removing remote-only writing. |
| Fresh OTP sign-in with absent cloud row | First ordinary edit creates the row, preserving the current intended new-account behavior. |
| Initial startup pull succeeds | The guarded cloud replacement commits and records its scoped timestamp. |
| Local edit while initial SELECT is pending | The stale pull correctly refuses to replace newer local work; the following automatic upload still replaces the unseen remote document. |
| Initial pull fails offline; reconnect and ordinary edit | Failed upload preserves cloud work while offline, but next connected save uploads without another read and removes remote-only writing. |
| Account previously synchronized; other device writes during offline period | Reconnect alone performs no retry. The next connected local edit uploads without reading and removes the other device's new writing. |
| Switch A to B on the shared device | Device bytes remain intentionally shared; the first B edit replaces B's unseen remote document. A's row remains unchanged. |
| Delayed save scheduled while A, then switch to B | Existing account guard prevents the delayed upload to either account. |
| Decline reviewed cloud replacement, then later edit locally | The decline itself performs no upload. The later ordinary automatic save still replaces the cloud document. |
| Explicit local file restore | Existing local-wins barrier remains effective and intentionally uploads the imported record. |
| Remote document changes 1 second after current scoped sync time | Current 2-second freshness tolerance misses the change; the manual fallback can replace it. |
| Pending A SELECT, then switch B | Existing guard discards the stale read without changing shared local bytes or uploading. |

The sign-in path verifies OTP and updates auth state. Its callback sets the session and emits; there is no reconciliation trigger in that callback. `refreshData` pulls at AppProvider mount and explicit refresh, while ordinary repository saves schedule `CloudSync.push`. That push validates account/project/local snapshot, then performs a blind full-document upsert. Manual review cancellation only prevents that caller's fallback. Source-backed policy intentionally keeps one shared device dataset and explicitly says sync is not field-level multi-device conflict resolution (`docs/DATA_BACKUP.md`). Independent read-only review agreed with this diagnosis.

## Proposed bounded scope, before implementation

Protect all automatic/manual push entry points in the service. Read the scoped remote row before writing; allow an absent row or an unchanged acknowledged exact remote version, and hold on unreadable, unseen or changed cloud work. A hold preserves the device record and cloud record and points to existing cloud replacement review. Preserve account/project/revision/local-snapshot guards and the explicit local-import-wins policy. Do not substitute an automatic `refreshData()` after OTP: startup refresh currently replaces local data, which would silently choose cloud over intentional shared-device work.

A per-login ready flag does not protect offline/reconnect updates. A SELECT followed by blind upsert still has a concurrency window: investigate a conditional update against the exact observed remote version, returning whether a row was updated, plus insert-conflict handling for an absent row. Existing tracked columns and select/insert/update grants make a source-only approach plausible, without a migration; deployed provider behavior remains unverified. The display last-sync timestamp is not an acknowledged remote version: push uses a second client timestamp, and pull currently tolerates two seconds. Client-written timestamps can also be equal or clock-skewed; do not promise a complete conflict protocol from timestamps alone without appropriate tests.

No automatic merging, per-account storage rewrite, DB migration, provider configuration, live data operation, branding, or publication is proposed. When both copies have independent work, the minimal safe behavior is keep both and hold upload. Choosing cloud replacement vs explicitly replacing cloud with the device record is a product/data-conflict decision; existing backup review/import controls can support a deliberate choice. The diagnostic does not implement that choice.

## Exact evidence

| Artifact | SHA256 |
| --- | --- |
| `probes.mts` | `99b3d3c4f99dab5a5afb71c604f2308df204e55777492303ed6763a542d6bcfb` |
| `report.json` | `0110579cc39bd420722ce3669363bbe4e466bfcca61e33afd7a1c275fa0d3219` |
| `probes.log` | `0110579cc39bd420722ce3669363bbe4e466bfcca61e33afd7a1c275fa0d3219` |
| `existing-cloud-tests.log` | `f0e6595065ea47f4b155f67dff7526512709673c4efc8f1901bf79a7b23941d0` |

`report.json` contains source SHA256 values, exact candidate HEAD, every mock call, before/after facts, and zero-network evidence. The diagnostic log is the exact JSON emitted by that run. These files are scratch review deliverables; they were not committed or uploaded by this read-only investigation.
