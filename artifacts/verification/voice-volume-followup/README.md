# Parent voice-volume follow-up

Base review candidate: `be33d77274a0a02dc3a4bdc77c36e13f954843f9`. Parent visual, backup and data QA were already GO; only the voice-volume race was blocking signoff. This is a narrow follow-up on the same review branch. No publication occurred.

Trigger: start an uncached natural cue at volume 1, set voice volume to 0 while synthesis is pending, then resolve synthetic PCM. Previously GeminiVoice overwrote the current gain with the initial captured 1. It now stores the latest requested volume before any AudioContext exists and reads that value after synthesis/context resume, immediately before source start. Settings previews obey the same current volume. Generation and source-ownership guards remain intact.

Device speech uses volume when an utterance is queued. Nonzero changes apply to the next cue or replay. Zero cancels the owned current utterance and detaches callbacks while preserving application pause. Raising volume or Resume does not replay the cancelled utterance. A new unpaused session resumes global speech before enqueueing, because cancel preserves its paused state. This follows the [Web Speech specification](https://webaudio.github.io/web-speech-api/#speechsynthesis-methods); live device-utterance gain changes are not claimed.

Evidence:

- `regression-before-fix.log`: 63-test red run, seven failures, including six deferred 0/0.35 volume assertions and device mute. Retained as failed reproduction, not counted as a passing run.
- `focused-tests.log`: 64 passing tests, zero failures/skips. 24 Gemini lifecycle and 40 VoiceGuide tests cover synthesis/resume/preview volume, cancellation, pause/resume, stale requests, new sessions and device speech semantics.
- `browser-volume-report.json`: 26 passing checks across Chromium and WebKit; zero runtime errors, failures or provider calls. Production voice code runs against real OfflineAudioContext nodes with deferred synthetic PCM. Requested 0 and 0.35 produce gain 0 and approximately 0.35 at start, with rendered RMS 0 and approximately 0.0875 respectively. Device speech is a spec-conforming mock.
- `npm-check.log`: final aggregate PASS, 393 Node tests, Notebook/routing/speech and locale checks, type checking and project-path build. Existing large-chunk build advisory remains.
- `final-receipt.json`: current source/build and evidence hashes. Older broad visual receipts belong to the base candidate and are preserved; no new full visual-matrix claim is made.

Reproduce using installed dependencies:

```sh
node --import tsx --test tests/gemini-voice-lifecycle.test.ts tests/voice-guide.test.ts
ODA_WEBKIT_LOCAL_DEPS=1 PLAYWRIGHT_BROWSERS_PATH=/workspace/.cloud-tools/playwright-browsers node scripts/qa-voice-volume.mjs
VITE_BASE_PATH=/one-decision-away/ npm run check
```

No provider calls, actual keys, charges, package installs, recorded narration activation or ambient changes. Listening quality, installed device voice behavior and physical-phone/native performance remain unverified. The 159 remaining narration recordings and sample approval remain pending. Publication still requires the parent checkpoint and user approval.
