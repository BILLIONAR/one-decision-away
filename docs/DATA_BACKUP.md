# Personal record and learning work

The primary local record is `one_decision_away_app_data_v1`. Its optional
`courseProgress` field contains version-1 lesson checks, answers, completion,
private reflections, and practice plans, attempts, and reviews.

Existing devices without this field read `oda_course_progress_v1` as a migration
fallback. The next successful repository or course save includes course work in
the primary document. Once that field exists, even an explicit empty value wins
over the old key; an old side-store value cannot resurrect an intentionally
cleared or restored course record.

All primary-record writes use `queueDataWrite` from `dataWrites.ts`. Its shared
queue and `oda-data-writes` Web Lock serialize repository, notebook, and course
writes. Live course edits use `mutateCourseProgress` to re-read and apply the
updater after acquiring the lock. `saveCourseProgress` is an asynchronous
snapshot-save API. The course UI retains updater functions and optimistic text
until persistence succeeds, then rebases pending edits over the saved record.

## Backups and restore

`createBackupSnapshot` includes the latest saved course work, and JSON export
loads the current repository record before producing the file. Optional cloud
uploads also capture course work. File and cloud restores validate the personal
record's collection and renderer fields before changing local storage.

A restore commits one complete JSON document, including courses. A failed
validation or quota check leaves the previous document intact. Older backups
without `courseProgress` preserve the existing course work. A backup with an
explicit empty version-1 course record deliberately clears it.

Manual file and cloud replacements show a review with source and record counts,
with controls to cancel, download the current backup, or replace the record.
Cancelled cloud previews neither mark a successful sync nor trigger the caller's
fallback upload. Last-sync time changes only after an accepted local commit.
Startup cloud synchronization still checks for a newer snapshot. Every remote read captures its account, project, client revision, restore barrier and saved local document. A late response or open review cannot replace the record after any of those change; `replaceAll(remote, canReplace)` rechecks inside the shared write lock. Manual fallback uploads and delayed automatic uploads stay bound to their original operation. Stale upload responses cannot mark or emit another account’s sync status. These guards preserve newer local writing and prevent a response from one connection being accepted by another. The sync model still replaces complete documents; it is not field-level multi-device conflict resolution.

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

Browser evidence is saved in `artifacts/backup-qa`. Cloud tests use an isolated
mock connector; no production Supabase account or data is accessed. Cross-tab
locking depends on browser Web Locks support; the in-process queue remains the
fallback in environments without it.
