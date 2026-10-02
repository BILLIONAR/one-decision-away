The functional candidate is based on latest main `350aa158f30c773a373f2895e267119f9f2eb17a`, on `feat/english-guidance-functional`. Theme, colour and logo remain user-owned. All 83 protected main files—including every CSS file, brand entry, logo, app shell, native configuration, package files and notification settings—remain byte-identical. There is no rejected b6/v5 merge ancestry and no inseparable visual dependency. The previous b6-based work is preserved separately on `review/english-guidance-b6-snapshot` at `f04f1ba1d118edd0a8c02eabd954bdac856fb306`.

Recorded English guidance now uses the approved 160 MP3 clips for 11 sessions. First load requests zero MP3s; playback loads the current cue and next two, keeps three decoded buffers and at most 32 verified clips in its bounded persistent cache. Cancel, pause/resume, replay, volume including mute, session switching, cache-backed offline replay and missing-file handling are checked. Guidance remains English while interface/subtitles follow EN/TR/ES; Notebook device read-aloud retains its locale. A missing recording uses an explicitly labelled installed English device voice or reports unavailable. It does not silently invoke a paid provider or another language. No model/runtime is shipped.

The onboarding demo says Preview and explains its accelerated example and example leaf. Its chosen decision seeds a fresh final field without overwriting any saved draft or existing text. Planning is optional and visible. The real timer still reaches 120 seconds before completion, and repeat confirmation awards one reward and one leaf. Untouched courses show their actual localized description, outcome, ordered lesson titles and minutes before Start lesson 1; returning learners resume saved work. Today gets the real next lesson title, minutes and goal from lightweight generated metadata. Search, filters, workbook and quizzes remain working. The separately requested quote placement retains its main styling.

Selected verified nonvisual work also includes ambient playback lifecycle fixes, lossless responsive derivatives of the existing images, truthful backup/purchase states, calendar/cumulative chart calculations and symbolic reward wording. No new dashboard concept, assistant brand palette or logo is applied. There is no production deployment, native-signing, provider credential, billing or account change.

Validation passed:

- Aggregate `VITE_BASE_PATH=/one-decision-away/ npm run check`: 419 tests, zero failures, plus translation/Notebook/routing checks and build. [Log](aggregate-check.log).
- Actual cloud Chromium narration: 35 checks across 18 cases, zero exceptions/failures; real WebAudio decoding/nodes, trusted clicks and normal HTTP. [Report](../english-guidance-browser/lifecycle-report.json), [QA notes](../english-guidance-browser/README.md).
- Independent first-use/course-entry: 46 checks, 28 scoped axe scans, 35 actual PNGs, zero exceptions. EN/TR/ES at 320×844, 390×844 and 1440×1000; the preview caption clipping found during review is fixed. [Evidence](../english-guidance-first-use/browser/independent-first-use/README.md).
- General browser: 41 checks and nine axe scans. [Report](general-browser/browser-report.json).
- Course/workbook browser: 36 checks and 15 axe scans. [Report](course-browser/course-browser-report.json).
- Backup/protection browser: 15 checks. [Report](backup-browser/report.json).
- Independent source selection and final appearance parity: [83 protected files](branding-parity.json), [independent recheck](independent-final-parity.json).

The attached archive was verified locally at 19,611,959 bytes and SHA256 `ec4344cd511971a9875107d32a534aaf201ed5614a35a9feafef5d869184c35c`. All 160 shipped mappings, text/source hashes, bytes and duration slots pass. All clips fully decode with FFmpeg and native Chromium; their bytes match the final public assets and built output. The 1,226.529791667 seconds are decoded duration including pauses, not pure voiced speech; the minimum conservative cue margin is 3.688 seconds. [Archive receipt](../english-guidance-first-use/admission/archive-receipt.json), [160-clip technical audit](../english-guidance-first-use/admission/summary.json), [native decoding](../english-guidance-first-use/admission/chromium-all160-decode.json).

The immutable [build receipt](build-receipt.json), SHA256 `527e2ffc217c3816c7579e3793c06ad4e50330aae812989e39f34926d49e7407`, binds the aggregate-tested source, built output and independent screenshots. The [final review receipt](final-review-receipt.json), SHA256 `72329018c0da7b33c77b15a428efca2c444a6efbdf47c975d0f4cc14bfc6c867`, records the final harness revision and all report hashes. Only `scripts/qa-browser.mjs` changed after the build: it now waits for the existing IndexedDB durable save before reload and uses the actual Settings language/theme controls. All application source, public assets and 385 built files remain identical to the independently reviewed build.

Actual preview PNGs:

- [English guided control, 320 px](../english-guidance-browser/final-guided-en-320.png) and [390 px](../english-guidance-browser/final-guided-en-390.png).
- [Recorded session, 390 px](../english-guidance-browser/lock-recorded-en-390.png).
- [English preview example leaf, 320 px](../english-guidance-first-use/browser/independent-first-use/en-onboarding-proof-320.png).
- [Spanish preview example leaf, 390 px](../english-guidance-first-use/browser/independent-first-use/es-onboarding-proof-390.png).
- [Course overview, 320 px](course-browser/overview-320px.png), [Today desktop](general-browser/today-desktop.png).

The sample voice was user-approved. These checks do not claim human listening or independent transcription of all clips. Device-voice fallback inventories are explicitly mocked; viewport QA is Chromium emulation, not a physical iPhone/native test. No Spanish bulk voice assets exist. Before-fix caption evidence is labelled historical under `before-proof-fix/`; final reports and linked PNGs show the correction. All QA used synthetic local records with external provider writes blocked.

The candidate is ready for the parent's visual/QA checkpoint. This branch is review-only. Main has not been changed and no production publication is authorized by this handoff. After any newer user styling reaches main, rebase the functional work and repeat the affected visual review before publication.
