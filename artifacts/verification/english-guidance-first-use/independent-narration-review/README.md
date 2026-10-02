# Independent English narration integration review

Read-only application review on `feat/english-guidance-first-use`. Only these scratch evidence files were written. No application source was edited, no packages installed, no external provider/secret accessed, and no deployment performed.

## Results

- `lifecycle-report.json`: 15 independently authored controlled lifecycle probes passed on the source hashes recorded in that report. These cover dormant construction, only current/upcoming preloads, latest volume zero during loading, cancellation, playing and loading pause/resume, replay, stale callbacks, session replacement, 32 persisted/3 decoded cache bounds, corrupt cache retry, initial/resumed failure fallback restricted to English, and unavailable reporting when no English voice exists. No paid provider was invoked.
- `focused-tests.log`: independent rerun of voice-guide, recorded-narration, English-asset, and Gemini lifecycle test files. Inspect the final TAP totals for exact counts.
- `browser-report.json`: three normal-HTTP Chromium browser checks passed in a disposable context on `http://127.0.0.1:4182/one-decision-away/`: fresh service-worker narration exclusion, active global cue surviving Back/Forward without stop or duplicate start, and narration-owned on-demand cache containing three requested clips. Zero uncaught browser errors. `history-active-session.png` records the active-session UI.

Two concrete races were found and sent to focused QA, then verified fixed by fresh independent probes: pending-load resume failure originally bypassed the installed English fallback; a definitively failed recording could be retried on pause/resume while device fallback was still speaking, producing overlap. Both now pass.

## Limits

The browser run used the initial 00:32 built preview, which included service-worker exclusion and panel-preview ownership fixes. The latest resume-fallback lifecycle fixes were verified against current source in controlled probes and focused tests, not by that initial preview. A final fresh build/browser run remains the root team's checkpoint.

Browser evidence uses actual local Chromium Web Audio and service workers, but is not a real-device iPhone, native iOS, auditory listening, or subjective narration-quality assessment. Controlled audio buffers/voices prove lifecycle semantics, not perceptual pronunciation. No live account or provider was exercised.
