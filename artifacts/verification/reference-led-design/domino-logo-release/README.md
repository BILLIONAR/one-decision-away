# Selected domino logo — reviewed web release evidence

Tested source: `84ecbf8776146b766a30964bf8e6487234dd1dd4`, on the existing `design/reference-led-oda` branch. This packet is an evidence-only successor; it does not change app source. Rollback/previous production: `350aa158f30c773a373f2895e267119f9f2eb17a`.

The parent accepted the supplied high-resolution icon8 reconstruction after comparing it with the chosen original preview. It is explicitly a reference-guided reconstruction, not the recovered original source. [Source verification](source/source-receipt.json) binds the actual owned ZIP (1,467,955 bytes, SHA256 `ed18a60c978261b6af1e1db71dbaf7473f32296e0126fd4e447e878f59bb984f`) and the opaque RGB 1254px master (1,226,532 bytes, SHA256 `49ebd132ec6f67282a95a9e941631fccfd3e1d72bd5049a45179c277dcf78a96`). Repository `brand-assets/domino8` preserves the unchanged source, comparison and provenance files.

## Exact build and independent review

- [Actual aggregate log](final-build/aggregate-check.log): `VITE_BASE_PATH=/one-decision-away/ npm run check`, exit 0, **621 passes / 0 failures**. Original 79,264 bytes, SHA256 `17e93008892990c226a74dc59af7d68d515fdb5ff1c177d348b6c16fa7bddb0f`. Copied unchanged; no silent rerun or replacement.
- [Build receipt](final-build/build-receipt.json) binds all 900 non-artifact tracked source files and all 445 compiled files before and after that run. The clean committed source remained unchanged throughout QA.
- [Independent icon/source audit](independent-assets/asset-source-audit-84ecbf8.json): 54 passes, zero failures. All 43 source paths are within the selected logo scope; 6,451 prior files, Today palette, core functionality, previous brand assets and native configuration remain preserved. [Small-size favicon](independent-assets/favicon-small-size-preview.png), [PWA masks](independent-assets/web-pwa-mask-preview.png), [native icon masks](independent-assets/native-icon-mask-preview.png) and [splash](independent-assets/native-splash-320.png) are synthetic normal-browser previews, not physical-device screenshots.
- [Combined source audit](independent-production/final-combined-source-audit-84ecbf8.json) and [accumulated production delta audit](independent-production/production-delta-audit.json) preserve the functional and protection reviews. No source P0/P1 blocker was found.
- [Independent browser seal](browser-qa/final/independent-browser-review-84ecbf8.json): 18 capture cases / 21 PNGs at 1440, 390 and 320px; 46 functional checks; 17 continuity checks; actual recorded-English on-demand playback and cached offline replay. [Measured baseline comparison](browser-qa/final/baseline-comparison.json) has no rectangle or computed-style change; SVG ODA text changes are recorded separately.
- [Actual service-worker upgrade evidence](browser-qa/final-sw/report.json) links the genuine installed v5 baseline, first-attempt v6 activation and subsequent settled v6/offline checks. The first immediate check encountered a transient v5-prefixed cache; that failed assertion and the corrected scratch-only search assumption are retained under `browser-qa/attempts`. The final settled run is not represented as another v5 starting state.

## Actual PNG previews

- [Desktop Today](browser-qa/final/today-1440.png)
- [390px Focus with logo](browser-qa/final/focus-390.png)
- [390px onboarding preview](browser-qa/final/onboarding-390.png)
- [320px Today](browser-qa/final/today-320.png)
- [390px landing](browser-qa/final/landing-390.png)

These are synthetic local review fixtures. First-use preview remains labelled, saved text is protected, course overview/resume/search/quiz and Notebook draft/save were checked. Explicit Preview voice fetched one 105,260-byte English clip; guided start fetched only three current/upcoming clips totalling 354,564 bytes, not the full narration bundle. Source and asset hashes match the approved clips; these checks do not claim human listening or transcription QA for every clip.

The logo update contains no new app behavior, theme, layout, signing, dependency, backend schema or workflow change. Today retains the already reviewed palette. Native/PWA exports are opaque and square without baked corner rounding; platform masks retain the domino group. The padded maskable background has a subtle tonal seam (cosmetic P3), documented by independent QA. Physical iPhone, Xcode compilation, monochrome notification rendering and App Store publication are not covered.

## Publication state when this packet was sealed

The user explicitly authorized changing the live web version on 2026-10-03 at 18:44:58 UTC (`Sentinel_cb683aa0952c81919347c1371bd242fb`). The parent subsequently authorized proceeding after accepted source and final QA. This packet precedes the normal PR/main/Pages release; it does not assert publication. [Repository preflight](deployment/repository-preflight.json) and [previous served production assets](deployment/previous-live-public-assets.json) preserve the normal deployment route and rollback baseline. Actual deployed commit, CI result and HTTPS-served evidence will be recorded separately after success. No production secrets, credentials, account writes, paid services, signing, DNS or App Store release are part of this operation.

[Packet byte manifest](manifest.json) lists every included file except itself. Signed transfer metadata, browser profiles and private upload receipts are excluded.

The current Library export batch was attempted once through the supported upload helper and stopped before preparation: `library upload failed: hosted apps tools/list request failed: network`. No Library upload is claimed. These actual PNGs and exact logs are supplied through this committed review-artifact path instead.
