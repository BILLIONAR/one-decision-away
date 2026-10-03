# Bounded upload guard design, before implementation

This is a read-only proposal following the parent's later instruction. It supersedes the earlier diagnostic recommendation to retain automatic import-to-existing-cloud replacement: **an import facing unacknowledged existing cloud work must hold**, keeping the device bytes and import token. No repository source, branch, provider or deployed database was changed for this design.

## Narrow service behavior

1. Capture snapshot, exact local raw bytes, account/project/client revision, replacement epoch and import token using the existing guards. Recheck those after every read/hash wait and immediately before a write. Read the current account's remote row before every upload. A SELECT error or invalid/unknown row yields false and a truthful current-scope blocked status; neither record changes.
2. Absent row: use atomic `insert(...).select('data,updated_at')`, with no upsert. A racing insert/duplicate key is a conflict and holds. Require exactly one returned row before acknowledging a successful upload. Do not infer success from `error:null` without a returned row.
3. Existing row: authorize upload only if current owner+epoch acknowledgement contains the exact server-returned `remoteVersion` **and a canonical SHA256 fingerprint of the exact remote JSON** and both match this fresh SELECT. Legacy display timestamps and timestamp-only metadata are not acknowledgement. A mismatch/unknown acknowledgement holds. Then use `update(...).eq('user_id', id).eq('updated_at', selectedVersion).select('data,updated_at')`; zero rows/conflict holds. Generate a timestamp strictly later than the old timestamp (`max(Date.now(), Date.parse(old)+1ms)`) and validate it. A returned server row, still-current scope/local snapshot and successful acknowledgement storage establish success.

Extend only existing `LOCAL_SYNC_SCOPE_KEY` metadata with version/fingerprint. Keep its owner/project key and replacement epoch, so ordinary edits can retain the known remote baseline while replacement and shared-device account changes invalidate it. Do not introduce a per-account local dataset or use an earlier A timestamp after B owned the device document. Record acknowledgement only after an actual accepted local cloud commit (`markRemoteApplied`) or a verified successful insert/update. A preview, decline, auth event, SELECT alone or display timestamp never creates acknowledgement. Fingerprint the raw fetched server JSON, not `prepareBackupRestore`'s normalized/local-course-merged result. Object key order must be canonical; arrays retain order. Hash failure or acknowledgement-storage failure must fail closed. Use the returned stored version, not a second client Date.now, for acknowledgement.

Existing error/status rendering can expose a localized paused-backup message and say the device record remains saved, with the existing Sync review as the next action. A manual Sync review must be able to expose unacknowledged/changed remote content even if its timestamp is equal, older or inside the former two-second tolerance. Otherwise a blocked user could get stuck indefinitely. A narrowly scoped review option on `pullIfNewer`/a review-read helper can support that without adding an automatic sign-in replacement. Root owns product/UI copy and this call-site choice; this agent has implemented neither.

Explicit imports keep their account/project token until a verified authorized upload, and do not bypass acknowledgement of existing cloud work. Imported data can insert into an absent cloud row. Unacknowledged existing remote data holds and surfaces the decision. No quiet cloud replacement, merge or winner choice is introduced. Existing startup restore policy should not be silently extended to a new OTP/account-change trigger.

## Protection boundary

Timestamp-only conditional writes protect races where every competing writer changes `updated_at`. The tracked schema has no server trigger requiring that. A canonical fingerprint catches changed content retaining the old timestamp **when present at the fresh SELECT**. It cannot stop an old/other writer changing content while retaining that timestamp **between SELECT and PATCH**. This remaining case must be stated explicitly in the bounded candidate; do not claim complete concurrent-write protection.

Scratch PostgreSQL proves that adding atomic `AND data=$oldData::jsonb` also stops that remaining race. Installed PostgREST implements its content filters in the URL, making that a poor universal solution: current empty app data was 4,980 bytes and its full-content-filter URL was 7,530 characters; a 128KB synthetic document produced a 128,176-character URL. The installed default URL-length warning threshold is 8,000. Do not send a whole private document as an unbounded URL filter or silently increase transport limits. If strict protection against timestamp-preserving concurrent legacy writers is required, a separately approved server-atomic version/content comparison is the dependency. No database/provider change is authorized here.

## Focused regression cases for implementation

All are feasible using the existing injected in-memory client fixture and fake timers, with global fetch denied. The actual implementation must be tested independently; this proposal's SQL/client feasibility is not that implementation QA.

| Case | Required observable result |
| --- | --- |
| Fresh OTP to existing remote, first local save | No INSERT/UPDATE; both documents retained; honest blocked state. |
| No remote row, first signed-in save | INSERT only, one returned row; correct scoped acknowledgement; no upsert. |
| Thrown/resolved SELECT failure, offline/reconnect | Local saved; no cloud mutation or acknowledgement. Retry reads again. |
| Account A→B and A→B→A with shared dataset | Existing local bytes preserved; no stale acknowledgement authorizes the wrong remote. |
| Stale SELECT after logout/project/account/local-record/import change | No write, no wrong-scope status/ack/token removal. |
| Remote version advances before or during write | Hold; zero affected rows is failure/conflict, not success. |
| Same timestamp, different remote JSON at fresh read | Fingerprint mismatch holds, including equal/older/within-two-second timestamps. |
| Reordered equivalent object keys | Fingerprint remains equal; ordered arrays still differ when reordered. |
| Racing INSERT | Duplicate error/zero represented rows holds; remote winner preserved. |
| Empty, missing or malformed returned write representation | Never acknowledged as success. |
| Successful accepted cloud restore | Exact raw remote version/fingerprint acknowledged only after committed replacement. |
| Preview/decline or rejected restore | No acknowledgement; later automatic save holds. |
| Explicit imported device document vs existing unacknowledged cloud | Both retained; local import token stays; no implicit winner. |
| Explicit import with absent remote | INSERT can succeed and clear only its own still-current token. |
| Frozen/regressed clock and future/microsecond remote timestamp | New timestamp is strictly later under PostgreSQL comparison. |
| Awaited hashing/write response/account switch/storage failure | No new-scope acknowledgement/status; no newer import token cleared. |
| Manual review while cloud timestamp does not advance | Existing review can show changed/unacknowledged remote; no automatic replacement. |
| Legacy same-version mutation after SELECT | Explicit limitation reproduced; never label it protected by timestamp+read fingerprint. |

The SQL/client feasibility run is `guard-feasibility.mts`, with actual report `guard-feasibility-report.json`: **9/9 assertions, zero live fetch**, real in-memory PostgreSQL only. It proves timestamp-only limitations, fingerprint pre-read behavior, exact-content atomic comparison, zero-row CAS, duplicate insert, strictly advancing timestamps and installed client query construction. It does not validate deployed RLS, real OTP, a simulator, a physical device or the future service implementation.
