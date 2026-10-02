# Bounded Sound Room entitlement guard

Candidate worktree: `/workspace/oda-soundroom-entitlement-fix`, branch `fix/soundroom-entitlement`, base `8fe9e55b602cc757646aa2c51baac8e176284840`. This agent did not commit, push, deploy, or edit provider, purchase, native, appearance, catalog, or synthesizer source. Root owns the page's category/index caller wiring.

The process-lived player now reads current purchase state for starts, resume, toggle and timer changes. Native restricted selections require confirmed Essentials or higher access; the selection captures its category/index and identity revision. A downgrade, unconfirmed identity or changed revision clears an owned restricted selection and hard-stops its graph, including paused tails. The timer preference stays selected, while the track, playing state, deadline, remaining time and sleep mode clear. Restored access waits for a new explicit tap.

Category origins must match the actual catalog track. First two entries in every category stay free. Direct starts without an origin use all catalog placements, so the free Focus brown-noise and Frequencies 432 Hz placements stay usable. External Focus replacement, including the same track, drops Sound Room ownership. Web and unconfigured purchase states remain open across identity transitions.

Starts require an actual engine emission and matching current track before publishing success. Failed allocation or no replacement restores the preceding ownership. The player rechecks ownership after synchronous state notifications before arming a timer, so a reentrant Focus replacement cannot inherit the old Sound Room countdown.

## Verification

- `red-baseline.log` and `red-baseline-receipt.json`: unchanged base player, 37 tests; 12 existing engine/timer/fade checks pass, 25 new contract checks fail. One draft expectation was later corrected: `ready=false` alone must preserve confirmed cached paid access because readiness describes offering loads. The original log is retained unchanged.
- `start-edge-red.log`: two additional failures captured before their fixes, for revocation during player publication and an absent actual AudioContext.
- `focused-guard-run.log`: final v2 67/67 tests pass. Command: `node --import tsx --test --test-reporter=tap tests/sound-room-player-access.test.ts tests/sound-synthesizer.test.ts tests/sound-room.test.ts tests/ambient-textures.test.ts`.
- `handoff-review-red.log`: four independent-review handoff defects reproduced before the v2 fix. Final tests cover same/different replacements from both owned and external ownership, plus ordinary external controls. Prior receipt/log retained as `pre-review-*`.
- `lint.log`: TypeScript lint result. `implementation-receipt.json`: exact hashes, test counts, protected-source comparisons and contract.

Tests execute the actual player and synthesizer with synthetic AudioContext nodes, a deterministic clock, and in-memory purchase singleton updates. A purchase initialization call fails the fixture; no provider SDK or network action runs. All 12 existing engine/timer/fade test bodies remain intact, and their shared fake-audio fixture was extracted unchanged.

Parent aggregate validation, independent lifecycle review, browser checks and publication checkpoint remain with the parent. No production/native purchase claim is made from these local synthetic tests.
