# Photo-led landing review candidate

Reviewed source: `9627fa22c379f15755d9388d7fbaf49c27c6457c`, on `design/landing-photographic-oda`, based on production main `9e07fb13ee1f3ba1b06ec0a69d64fa536bd6a429`. No production deployment. This separate landing revision requires fresh parent visual/user approval before publication.

The landing uses the supplied Wolfgang Moritzer photograph edge to edge, targeted burgundy scrims, ivory text and a gold CTA matched to the existing domino. Old door/arch art is removed. The unchanged interactive sample appears below the hero. Copy, locales, catalogue metadata, links, handlers and personal-record behavior are preserved. The original photograph and provenance remain outside `public`; six responsive WebPs are self-hosted.

## Actual previews

Actual Chromium captures of the implemented local build, with synthetic test context. Library upload failed once with `hosted apps tools/list request failed: network`; this committed review path is the delivery fallback.

- [Desktop 1440 × 1000](browser-qa/corrected-final/landing-en-light-1440.png)
- [Mobile 390 × 844](browser-qa/corrected-final/landing-en-light-390.png)
- [Mobile 320 × 844](browser-qa/corrected-final/landing-en-light-320.png)
- [Desktop full page](browser-qa/corrected-final/landing-en-light-1440-full.png)
- [360 px](browser-qa/corrected-boundary/landing-en-light-360.png)
- [768 px](browser-qa/corrected-boundary/remaining-768/landing-en-light-768.png)

## Verification

| Evidence | Result |
| --- | --- |
| [Exact aggregate log](aggregate-check.log), [build receipt](build-receipt.json) | 621 passed, 0 failed; exit 0; typecheck, translations/data/notebook/routing tests, unit cases and production build |
| [Independent browser seal](browser-qa/independent-browser-review-9627fa22.json) | 145 fresh checks: 96 matrix, 26 boundary, 5 photo/DPR2/failure, 18 CTA/focus |
| [Independent source audit](source-audit/source-audit-9627fa22.json), [protected files](source-protection.json) | 898/900 baseline files byte-identical; two landing files changed, plus 12 new photo/provenance files |
| [Retained app evidence binding](browser-qa/protected-corrected-binding.json) | 27 checks at actual f02 provenance; 910 non-landing candidate files unchanged by correction; nine app geometry/text/style comparisons match. Eight PNGs exact; Today1440 retains 15 antialias pixels, maximum channel delta 2 |
| [Source diff](source.diff), [QA correction](qa-correction.diff), [changed paths](changed-paths.txt) | Dashboard palette, logo, functionality, dependencies, workflows, accounts and signing preserved |

Exact aggregate log: **79,289 bytes**, SHA256 `e7d71eac74795db5e3b18e410843977f44fb01628c890daeb45640a4cc88cdd3`. It is explicitly committed here; it was not in the source commit. Its receipt binds all 912 source and 451 build files, unchanged during the run.

The initial f02 candidate passed aggregate tests but failed real gold-heading contrast in ES1440/TR768/ES768 and undersupplied tablet image pixels. The focused correction strengthens desktop/tablet scrims and matches picture/preload sizing to the tall hero. Fresh actual ratios are 4.493:1, 4.591:1 and 4.244:1 respectively. Sampled normal-text minimum is 6.021:1; large-text minimum is 3.997:1. CTA default/hover/active and visible outlines pass. EN/TR/ES render at 320/390/1440 in light/dark, plus 360/768 locale checks; measured text fits and primary controls reach 44 px.

Natural first views fetch one selected hero: desktop1440/tablet768 130,032 bytes, mobile DPR1 34,224 bytes, DPR2 96,748 bytes. Original JPEG and automatic narration clips are not requested. [Timing evidence](browser-qa/corrected-boundary/diagnostic768/report.json) records the screenshot tool's transient 1×1 viewport and resulting diagnostic responsive request separately. Missing-photo fallback remains readable.

[Original f02 aggregate](prior-f02/build-receipt.json), [partial browser evidence](browser-qa/partial-browser-review-f02ce33.json), failed diagnostics and exact supporting files remain intact. Scratch capture/restoration failures were corrected in QA helpers and resumed while retaining original reports. The corrected aggregate is a fresh run required by the source correction; the original 79,287-byte log remains unchanged in prior-f02.

[Photo exports/provenance](../../../../brand-assets/landing-photo/wolfgang-moritzer/derivatives.json), [consumer source receipt](../../../../brand-assets/landing-photo/wolfgang-moritzer/consumer-source-receipt.json), [photo source](https://unsplash.com/photos/landscape-photo-of-mountain-range-during-golden-hour-pn_Pp9P8P2U), [Unsplash License](https://unsplash.com/license). Original JPEG: 639,103 bytes, 3243 × 1842, SHA256 `830bd84d81a7cd41135ff6ec0c1c77a57087506964945aabea0521e3cf600a37`. Source pixels inspected; no image generation or retouching.

## Limits and delivery

Local Chromium with synthetic data; no physical iPhone, real account/provider, native signing, production capture or broad accessibility certification. Axe reported no scoped violations; photo contrast incomplete items were assessed separately using actual paired captures. Earlier TLS blocker was not retried or bypassed. Owned browsers/previews are closed.

[Packet manifest](packet-manifest.json) records exact bytes/hashes except itself. Original receipts retain their runtime paths; this folder mirrors their relative browser-QA supporting paths. A post-push remote-accessibility receipt may be added separately without changing tested app source. Early f02 previews are historical; the links above show the corrected reviewed candidate.
