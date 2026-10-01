# Premium and protection refinement — review candidate

This continues the existing ODA implementation. It is a development candidate on `design/premium-protection-refinement`, based on published main `350aa158f30c773a373f2895e267119f9f2eb17a`. This batch has not been published. Parent visual/QA review and the user's publication approval remain required.

The original approved ZIP, `ODA-approved-dashboard-design-assets.zip`, has SHA-256 `cc00b0399b9480e4c624a58786b2e0cedfb720d3ace5ee4b8f7e8d7806799366`. Its ten production PNGs and two approval manifests remain byte-identical. Attached reference material supplies assets and design context; it does not authorize publication or provider changes.

## Resulting behavior

- The newly authorized original v5 vector identity is consistent in the app, favicon/PWA, notifications, social and native artwork. Explicit inverse forms replace brightness filters. Earlier identities and former active native artwork remain available. Native configuration and signing were not changed.
- The complete daily quotation appears once above growth, preserving locale text, attribution, source links and adaptation labels. Hanken Grotesk/Newsreader hierarchy, forest navigation, solid mobile tabs, card spacing and the 240px mobile tree follow the parent design brief.
- The first meaningful saved notebook, lesson, weekly review or decision work qualifies for a visible backup reminder. Empty shells do not. Only a valid recent export, a recently successful scoped cloud sync without an error, or session dismissal suppresses it.
- Responsive lossless WebP delivery keeps the approved frame and transparency, with original PNG retry and the existing final unavailable state. Exact evidence counts and caps remain independent of the six coarse pictures. No production 3D mode is enabled.
- Bank behavior counts use kept One Decisions. Deposits and welcome grants remain actual wallet amounts without inflating practice evidence. UTC ledger chart keys, the first displayed day's net and selected-locale dates are corrected. The short D$ goal annotation fits at 320px; the full goal name wraps in its summary. Dreams explains symbolic rewards; baseline-only history no longer presents timing estimates or time filters. Prices, balances and reward rules remain unchanged.
- Native plan loading can retry without duplicate SDK setup. Free-trial claims require confirmed eligibility. Cancelled, pending, failed and unconfirmed purchases have distinct conservative feedback. Provider configuration and actual purchases were not exercised.
- Guided cues and previews remain English while captions/UI remain EN/TR/ES. Notebook speech retains the member's language and text. Stale provider/device callbacks cannot revive stopped, paused or replaced cues. Device voice availability is described truthfully.
- Ambient scenes use distinct original procedural stereo textures, longer loops and seam overlap. User gain, initial attack and timer fade are separate. Track switching releases the previous graph safely. External playback, including a same-track restart, clears Sound Room's former countdown. These are procedural audio improvements, not field recordings or a listening-quality certification.

## Review evidence

The latest voice-volume follow-up `npm run check` passed: 393/393 Node tests, type checking, both 6,823-entry translations with zero missing keys or placeholder differences, the 19-test Notebook suite, 11 routing tests, Notebook speech checks and the project-path build. The suites overlap, so their counts are not added together. Its log and current source/build receipt are in `artifacts/verification/voice-volume-followup/`. The earlier 381-test receipt in `premium-checks/` belongs to candidate `be33d77274a0a02dc3a4bdc77c36e13f954843f9` and remains historical evidence.

Parent visual, backup and data QA gave GO for that candidate. The follow-up only fixes current voice volume after deferred synthesis/resume/preview and device mute/pause/new-session handling. It passes 64 focused tests and 26 provider-free Chromium/WebKit voice checks. Earlier visual evidence below remains from the reviewed candidate; it was not rerun or relabelled as a new full visual matrix.

| Evidence | Scope |
| --- | --- |
| `voice-volume-followup/final-receipt.json` | Latest source/build binding, 393-test aggregate, 64 focused voice tests and 26 browser voice checks; deferred 1→0 and 1→0.35 PCM starts, rendered RMS, cancellation/pause/new-session guards; zero provider calls |
| `premium-ui/report.json` | 134 passing checks; 126 page/locale/theme/width cases, 133 screenshots; zero failures/runtime errors or serious/critical axe findings; 320/390/1440 and a separate CSS 200% layout-zoom pass |
| `premium-growth-webkit/growth-browser-report.json` | 28 passing official Linux WebKit checks; all stage thresholds/caps, locale inventory/filtering, progress, repeated navigation, PNG retry and final image failure; zero failures/runtime errors |
| `premium-backup/final/report.json` | 15 checks/13 cases; first saves, real synthetic JSON export, dismissal and Settings; six EN/TR/ES mobile layouts; zero failures/runtime errors |
| `premium-final-smoke/report.json` | Final rebuilt candidate: six Chromium/WebKit × EN/TR/ES checks at 320px; fitted goal labels, localized ledger metadata, zero practice from welcome credit, one daily quotation and Sound Room route; zero failures/runtime errors; 12 top/chart screenshots |
| `independent-bank-ui/final/final-review.json` | Independent actual-image and lower-content review; translated metadata, full cap, readable stats and settled reduced-motion chart |
| `image-delivery/report.json` | 24 cold-cache before/after route runs and four failure checks; response-body image bytes only |
| `image-delivery/pixel-alpha-review.json` | All 58 variants decoded exactly against their full-frame resize reference; zero codec RGBA/alpha error, original hashes preserved |
| `premium-brand/brand-v5-size-review.png` | Actual-size vector variants; provenance in `docs/BRAND_V5_REVIEW.md` |
| `premium-voice/README.md` | Provider-free English/device and Gemini lifecycle tests; Notebook preservation; dormant recording contract |
| `premium-ambient-audio/README.md` | Deterministic render/transition tests, real Chromium OfflineAudioContext gain checks, and optional rain/surf/fireplace audition clips |

Cold-cache bytes for all four covers fell from 8,145,625 to 256,890–2,079,348; the flowering tree fell from 1,902,188 to 116,382–1,384,102 across 320/390/1440 at DPR 1/2. This comparison excludes scripts, fonts, logos, HTTP headers and unrelated images. Resizing is recorded separately from lossless compression; it is not a claim that resized pixels equal the full-resolution original.

Preliminary failed harness runs and corrected findings are retained under `/workspace/scratch/oda-qa-diagnostics/premium-preliminary`, separately from passing review evidence. WebKit's initial HTTP preview failed because subresource requests were upgraded to HTTPS against a plaintext port; the passing run used a disposable loopback HTTPS preview. Its local self-signed certificate exception does not apply to public production TLS. The first final smoke measured before ResizeObserver/D3 settled; its failed receipt is retained there, and the final passing harness waits for the actual chart layout before asserting bounds.

## Remaining boundaries

The user's narration sample preference is pending. Only the sample exists; the other 159 cue recordings have not been rendered, decoded or duration-checked. No recorded mode, inference runtime, bulk generation or new provider has been activated. The dormant adapter still requires approved actual assets, source/byte hash validation and cue-slot checks before activation.

Ambient audition files have not received a listening assessment. Physical-phone performance, real iPhone/native UI, VoiceOver, live cloud account operations and real store purchases remain unverified. The browser tests use disposable signed-out local records and provider-free mocks. No deployment, billing, DNS, credential or native signing change is part of this batch.

The review branch push is separate from publication: Pages deploys on `main` or explicit workflow dispatch. This task performs neither for the new batch.
