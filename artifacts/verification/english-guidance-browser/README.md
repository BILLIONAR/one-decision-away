Recorded English guidance browser evidence

`initial-report.json` contains actual Chromium decoding results for all 160 MP3s, with per-file SHA256, bytes, mono PCM duration, sample count, peak, RMS, non-finite sample count and cue-slot checks. Those are asset checks, not independent spoken-text transcription or listening approval.

The initial guidance screenshots and preview check came from the initial `feat/english-guidance-first-use` preview. They do not establish the final main-appearance candidate. Parent paused final testing pending that candidate. No final lifecycle run or screenshot recapture has occurred yet.

The prepared read-only browser harness is in `/workspace/scratch/oda-guidance-browser`. It writes QA artifacts only. `common.mjs` accepts `ODA_GUIDANCE_REPO`, `ODA_GUIDANCE_URL` and `ODA_GUIDANCE_OUT` for the next candidate. Normal HTTP Chromium is used with the installed executable; no permissions, autoplay policy overrides, provider calls, package installation or source edits are needed.

The lifecycle harness is intended to check trusted Start/Preview/Repeat gestures, bounded current/upcoming MP3 fetching, source cancellation/offset/gain/disconnection, pending-load Pause/Resume/stop/switch, verified CacheStorage replay offline after switching sessions, strict English or unavailable fallback, Notebook locale retention, and final 320/390 EN/TR/ES plus desktop 1440 layout captures. These prepared checks are not yet results.
