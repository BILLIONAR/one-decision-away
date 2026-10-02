Read-only Sound Room downgrade/resume preparation

Inspected `/workspace/oda-cloud-upload-guard`, base `c30da64`. Upload-guard work is ongoing; this diagnosis changes no repository file, styling, theme or native configuration. The scratch reproduction executes the actual SoundRoom player with a substituted in-memory engine only. No network, native provider, SDK, payment or real audio calls occur.

Confirmed current gap

`SoundRoom.tsx:96,363,388` checks a category card only when clicked. `PlayerBar` at `SoundRoom.tsx:224–229` enables Play whenever a catalog sound exists and calls `soundRoomPlayer.resume()` without consulting purchases. The service at `soundRoomPlayer.ts:100–115,119–132` starts and publishes playing without an access check. It has no purchase-state subscription. The player intentionally outlives its page, so a page effect alone cannot revoke background playback.

The synthetic reproduction records three starts of `tibetan_bowls`: initial play, paused resume and resume after external engine silence. The native free-card rule denies this Relax index-3 entry throughout the two resumes. An ordinary engine stop leaves `state.track` intact (`soundRoomPlayer.ts:68–70`), which is why a hard audio stop alone does not prevent replay. The full state/call sequence and seven relevant source hashes are in `current-player-diagnosis.json`.

Actual trigger map

| Trigger | Current path | Minimal expected contract |
| --- | --- | --- |
| Tier becomes unknown / account hydration fails | `purchases.deferIdentity():357–363` clears confirmed identity and sets free; no player observer | Restricted playback is denied immediately when gating is active and identity/readiness is not confirmed. Free sounds retain existing availability. |
| Native account changes | `purchases.identify():341–346` synchronously changes identityRevision and clears tier | Invalidate previous-account restricted selection before asynchronous account setup. A newly confirmed paid account never automatically restarts it. |
| Paid tier downgrades | `purchases.applyCustomer():246–248` emits changed tier | Reconcile from a process-lived observer, including while another page is mounted. Essentials still opens every Sound Room sound; Pro→Essentials is not an access loss. |
| Initial play / selecting another card | SoundCard click → `toggle()` → `play()` | Check the current provider snapshot at the shared start boundary, not a captured React lock value. Rejected starts create no graph and never publish playing. |
| Pause / resume / player-bar replay | `pause():123–127` retains track and remaining time; `resume():119` calls play | Normal allowed pause/resume preserves the wall-clock remainder. Revocation uses a separate hard-stop/reset operation and removes the unauthorized retained selection and remainder. |
| Timer duration / no-timer / extension | `setTimer():136–141` cancels the current fade when playing | Recheck/reconcile authorization before changing an envelope. Once revoked, no timer or volume action can restore playback. Existing 10/20/30/60-minute choices remain; there is no existing entitlement duration cap to add. |
| Engine timer expiry or outside stop | `followSynth():68–70` marks not-playing but keeps the track | Any later replay still passes current authorization; a retained old paid selection never grants access. |
| Focus preview/start/resume/track change | Direct `playAmbient()` at `FocusTimerHub.tsx:178` and `useApp.tsx:589,614,625` | Keep external-controller ownership explicit. Do not let a stale Sound Room revoke callback stop a newer unrelated Focus graph. These direct callers currently bypass Sound Room locks and are a separate scope boundary if global enforcement is intended. |
| Track-next / automatic playlist advancement | No such API or callback exists in Sound Room/player/synth | Another card goes through the guarded start path. Do not add a playlist or duration policy. |
| Delayed AudioContext.resume | `soundSynthesizer.ts:113–115` has no graph-building continuation | The existing hard stop disposes active/retiring graphs and timer resources. A later context resume cannot reconnect them. |

Minimal guard recommendation

1. Centralize a fresh playback-access predicate in the common player start path; `resume` and `toggle` inherit it. Use live `available`, tier, readiness, identityConfirmed and identityRevision, rather than profile.isPro or React-only state. Preserve `available:false` web/unconfigured behavior, which is unrestricted under the current product contract.
2. Bind downgrade/account reconciliation once for the playback lifetime, outside page mount/unmount. Hard-stop the owned ambient graph and reset an unauthorized retained track, deadline, sleep flag and paused remainder. A user-selected timer duration may remain a preference, but it cannot retain an active or resumable session. Regranting entitlement performs no autoplay.
3. Keep category provenance when starting from a Sound Room card. `soundForTrack()` is a display helper that returns the first catalog match, not authorization. `brown_noise` is paid in Sleep index 2 but free in Focus index 0; `meditation_432hz` is paid in Relax index 2 but free in Frequencies index 0. Deriving access from the first match would block existing free sounds. Test both placements. For externally adopted Focus graphs, preserve their controller ownership; do not invent a new Focus pricing policy in a Sound Room-only fix.
4. If a shared engine admission guard is included, return acceptance and publish `playing:true` only for an accepted/current session. The existing player currently publishes playing unconditionally. A player-only guard does not cover direct Focus start callers; document that boundary rather than claiming global enforcement.

Meaningful focused tests

- Paid active and paid paused session → native free, unconfirmed identity, failed hydration and identityRevision switch: hard silence, no retained unauthorized resume, no old-account autoplay after new confirmation.
- A stale unlocked card closure, direct play, toggle, PlayerBar resume/replay and selecting another paid card after downgrade: no engine start or false playing state.
- Timer reset/no-timer/extension, volume changes and regrant after revocation: no revived graph. Allowed free countdown/pause/resume and paid Essentials playback retain current behavior.
- Duplicate placements: free Focus brown noise and free Frequencies 432 Hz still work; paid-entry selection uses its own origin when strict per-card policy is retained.
- Route away before downgrade: the observer still revokes. Return to Sound Room cannot resume the old paid track.
- External same-track/new-track Focus replacement: old Sound Room ownership/timer is cleared; a stale observer cannot stop the unrelated newer graph.
- Resolve a deferred fake AudioContext.resume after hard stop: no new starts or reconnected nodes.
- Preserve existing `sound-synthesizer.test.ts:231` timer/pause/resume behavior and `:251` external same-track restart behavior, plus the existing volume/fade invariants.

Optional separate engine hardening

The complementary audit found delayed bowl/breath callbacks compare track names, and the fade-stop callback at `soundSynthesizer.ts:181–184` checks only the name. Deliberately invoking a captured obsolete callback after a same-track restart can contaminate resource tracking or stop a newer graph. Audible revival after hard stop was not demonstrated. This is separate from the confirmed retained-selection authorization gap; do not expand the bounded fix unless needed. If touched, use a graph generation and captured fade-plan identity, and add stale callback tests.

This is preparation for the separately authorized Sound Room fix after the upload-guard parent review. No implementation or publication has begun here.
