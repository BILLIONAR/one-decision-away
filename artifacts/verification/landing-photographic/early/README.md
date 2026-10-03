# Photo-led landing draft

Synthetic local preview of the saved candidate on `design/landing-photographic-oda`, based on production main `9e07fb13ee1f3ba1b06ec0a69d64fa536bd6a429`. These screenshots show the current draft source; aggregate and final independent browser QA are pending. No production deployment.

- [Desktop 1440 × 1000](landing-en-1440.png)
- [Mobile 390 × 844](landing-en-390.png)
- [Mobile 320 × 844](landing-en-320.png)
- [Observed geometry and requests](report.json)
- [Capture harness](capture.mjs)

The genuine supplied Wolfgang Moritzer photo was inspected locally and matched SHA256 `830bd84d81a7cd41135ff6ec0c1c77a57087506964945aabea0521e3cf600a37` (639,103 bytes, 3243 × 1842). [Photo source](https://unsplash.com/photos/landscape-photo-of-mountain-range-during-golden-hour-pn_Pp9P8P2U); [Unsplash License](https://unsplash.com/license). The original and provenance live outside `public`; six responsive WebP derivatives are self-hosted.

Library upload was attempted once and failed with `hosted apps tools/list request failed: network`; this committed review path is the delivery fallback. PNGs are actual Chromium screenshots, not generated images or live production captures.
