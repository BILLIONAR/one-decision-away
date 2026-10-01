# Personal record and learning work

The personal record is one JSON document, projected into localStorage at
`one_decision_away_app_data_v1`. Its optional
`courseProgress` field contains version-1 lesson checks, answers, completion,
private reflections, and practice plans, attempts, and reviews.

Existing devices without this field read `oda_course_progress_v1` as a migration
fallback. The next successful repository or course save includes course work in
the primary document. Once that field exists, even an explicit empty value wins
over the old key; an old side-store value cannot resurrect an intentionally
cleared or restored course record.

Repository reads and all primary-record writes use `queueDataWrite` from `dataWrites.ts`.
Its shared queue and `oda-data-writes` Web Lock serialize repository, notebook,
and course operations. The IndexedDB database `oda_personal_record_v1`, store
`record`, key `current` is the committed authority for the exact primary and
legacy course strings. A queued operation reads that authority and refreshes its
tab's localStorage projection before using it; a Web Lock alone cannot make a
different tab's localStorage cache current. Live course edits use
`mutateCourseProgress` to re-read and apply the
updater after acquiring the lock. `saveCourseProgress` is an asynchronous
snapshot-save API. The course UI retains updater functions and optimistic text
until persistence succeeds, then rebases pending edits over the saved record.

## Backups and restore

`createBackupSnapshot` includes the latest saved course work, and JSON export
loads the current repository record before producing the file. Optional cloud
uploads also capture course work. File and cloud restores validate the personal
record's collection and renderer fields before changing local storage.

A restore commits one complete JSON document, including courses. Caller
publication, cloud scheduling and intentional course/notebook draft resets occur
only after the authority transaction succeeds. A failed write restores the prior
projection; if that restoration is temporarily blocked, subsequent queued reads
recover the prior authoritative record and the save remains unsuccessful.
Older backups
without `courseProgress` preserve the existing course work. A backup with an
explicit empty version-1 course record deliberately clears it.

Manual file and cloud replacements show a review with source and record counts,
with controls to cancel, download the current backup, or replace the record.
Cancelled cloud previews neither mark a successful sync nor trigger the caller's
fallback upload. Last-sync time changes only after an accepted local commit.
Startup cloud synchronization still checks for a newer snapshot. Every remote read captures its account, project, client revision, restore barrier and saved local document. A late response or open review cannot replace the record after any of those change; `replaceAll(remote, canReplace)` rechecks inside the shared write lock against the original committed raw document. Manual fallback uploads and delayed automatic uploads stay bound to their original operation. Stale upload responses cannot mark or emit another account’s sync status. These guards preserve newer local writing and prevent a response from one connection being accepted by another. The sync model still replaces complete documents; it is not field-level multi-device conflict resolution.

A reviewed cloud replacement first persists a pending candidate with its prior
snapshot. Canonical readers continue to expose the prior snapshot until the
candidate is finalized. The owner is revalidated after the pending transaction
is durable; that synchronous check is the authorization and ordering point. An
expired review returns false without requiring another rollback transaction.
Failure during finalization leaves the prior snapshot readable across tabs and
reloads. Account changes after that authorization point follow the accepted local
restore, while origin guards still prevent its work from being uploaded into the
new account. This is one shared device record, without separate local datasets
for each cloud account.

Explicit local imports establish the cloud-restore barrier before the local
commit. Offline or failed uploads keep that account/project-scoped barrier so an
older cloud copy cannot replace the imported local record after reload.

## Calendar contracts

User-facing One Decision scheduling, onboarding, and evidence use the local
calendar. The reward ledger and notebook reward ceiling retain their existing
UTC-day contract together. Moving only one reward writer to local days would
split the shared daily ceiling around midnight. No ledger migration is performed.

## Verification

- `tests/backup.test.ts` covers migration, course/experiment roundtrips, legacy
  and explicit-empty restore behavior, stale saves, invalid imports, quota
  failure/retry, shared-lock rebasing, cloud preview timestamps, and the
  local-day/UTC-ledger boundary.
- `tests/backup-rendering-safety.test.ts` covers malformed fields that previously
  reached React renderers after replacement.
- `scripts/qa-backup.mjs` exercises real Chromium file/download flows, mobile
  keyboard review and accessibility checks, reloads, two-tab writes, a real Web
  Lock, quota failure, and simulated optional-cloud cancellation/acceptance.
- `scripts/qa-deep-courses.mjs` repeatedly checks two-tab independent edits,
  failed drafts, route changes and replacement boundaries.
- `scripts/qa-data-authority.mjs` injects real IndexedDB transaction aborts and
  checks publication, draft preservation, recovery, unsupported APIs and the
  reviewed replacement authorization boundary.

Browser evidence is saved in `artifacts/backup-qa`. Cloud tests use an isolated
mock connector; no production Supabase account or data is accessed. Browser
persistence requires Web Locks and IndexedDB; missing or blocked authority APIs
report a failed save rather than accepting an unsafe cross-tab write. Node tests
and server-side helpers retain the in-process queue. Direct localStorage edits
are projections, so developer fixtures must use the repository or record queue;
an older build's open tab should be refreshed before further edits. Clearing the
app record removes both canonical primary and legacy course values. Browser
site-data clearing must cover both localStorage and IndexedDB.
