# Independent final review · 30 September 2026

Reviewed the final application changes against `b27d1ea` for personal-data loss, cloud account isolation, shared modal accessibility and course practice semantics. Review and reproductions used disposable local records and mocked cloud clients; no production authentication, database request, deployment or push was performed.

## Confirmed finding and repair

A pending cloud read selected account A's document, but a session/project switch while awaiting the response caused that document to be returned and labeled as belonging to account B. Startup refresh could then replace local data. A related manual-sync path could treat an invalidated read as an absent remote backup and upload a captured previous-account snapshot into the newly connected account.

The isolated pre-fix reproduction returned `Account A remote record` with pending restore scope `account-b` / `project-b`. The same reproduction after the repair returns no remote record and attaches no pending scope.

Cloud reads and queued uploads now capture their original account, project, client and scope revision. Logout/relogin and configuration changes invalidate previous operations. Late responses also reject a local import barrier or a newer saved personal record. Confirmed cloud restores recheck this identity **inside the shared personal-data write lock**, before any storage write. Marking a remote sync requires the reviewed record to have actually been committed. Manual fallback uploads and delayed automatic uploads retain their original scope; stale upload success/failure cannot change the new account's cloud status. The UI explains an expired review in English, Turkish and Spanish and keeps the current record.

## Evidence

- `tests/cloud-restore-scope.test.ts`: 15 regressions covering pending reads, queued reviewed replacements, account/project switches, logout/relogin, import barriers, newer writing, correct-path replacement, delayed automatic uploads and stale upload results.
- `node --import tsx --test tests/cloud-restore-scope.test.ts tests/backup.test.ts`: **27 passed**.
- `npm run lint`: TypeScript passed.
- `npm test`: **190 passed**, including the concurrent native-baseline additions; full verification owns the final combined totals.
- `scripts/qa-backup.mjs`: extended with two actual `BackupAndCloudSettings` browser flows. A fresh no-HMR server on port 3020 passed **13 named checks**, with no browser errors or axe findings. `artifacts/cloud-scope-review/report.json` records the run. An earlier server started before edits retained stale transform output and was discarded; it is not counted as current-source verification.

## Course and accessibility assessment

The reviewed workbook retains cue/action/fallback/evidence fields, optional attempt records and ungraded reflection. Tried/adapted/paused entries do not unlock lessons or claim a personal outcome. Original lesson completion still uses prerequisite order, practice checks and the knowledge question. Personal course records remain accessible independently of the paid lesson gate and remain part of the same backup document. Async updater replay retains failed drafts and rebases successful writes over unrelated saved work. No private reflection text was added to analytics.

The shared modal uses native dialog behavior when available and a keyboard/background-isolation fallback when unavailable. The previous standalone-support recovery and worker cache-isolation repairs remain present. No additional confirmed high-impact data-loss, security or accessibility regression was found in these inspected areas.

This review does not establish live Supabase/RLS behavior, conflict resolution across devices, real iPhone lifecycle, VoiceOver behavior, purchases or App Store acceptance. Those remain the explicitly documented release limits.
