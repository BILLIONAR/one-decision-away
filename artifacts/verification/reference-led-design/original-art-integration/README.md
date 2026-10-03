# Original artwork integration — preserved review history

These records document application source `166d0427257eabcb159ca8eb7c58fc4228ef3991` and the subsequent Sleep label correction `4bf566f17980fe2eaf26e3f20b277e97cad981b9`. The [current hybrid candidate](../hybrid-reference-ui/README.md) supersedes them. These historical partial visual/flow runs do not establish current acceptance.

The six owned artwork masters were decoded and personally inspected; [verified receipt](verified-receipt.json) and [pixel review](root-author-pixel-review.json) bind their bytes. Raw masters are review artifacts. Runtime delivery uses the 40 finite responsive WebP/PNG files recorded in `delivery/`; no raw master enters the application bundle. The artwork is original generated photo-style or rendered 3D, not camera photography or copied reference pixels.

[Original aggregate](final/aggregate-check.log) is 76,428 bytes, SHA256 `f4405fa60cb7e78cd776c0bde209c7495a3db7a606b0647636989044df8f1a24`; its exact [receipt](final/build-receipt.json) is authoritative for the hash. [Sleep-correction aggregate](final/sleep-contrast-fix/aggregate-check.log) is 76,415 bytes, SHA256 `6ac57fed21791f633162ec3aa6c8f4c3f4f28b563ca68db15dc2e0f9096ec624`, with its [receipt](final/sleep-contrast-fix/build-receipt.json). Both actual runs recorded 597 passed / 0 failed; neither log was replaced by later checks.

Earlier browser admission failures and scratch-harness failures are retained in [flow history](final/flows/README.md). The terminal fallback observation settled without a loop: four distinct fallback paths, five requests including the initial WebP retry. This is not a claim of only four total requests. The later diagnostic discovered a genuine Focus label contrast issue on bright foam; its repair and actual current-build raster evidence are in the current hybrid packet.

`independent-visual/final-166d/` and `independent-visual/final-4bf/` contain historical smoke, representative and partial diagnostic records. They are not the current 18-context certification. Author captures under `coach/`, `sound/` and `today/` are scoped development previews. Current source/build protection is independently checked in the hybrid packet.

All browser records use synthetic isolated fixtures in the selected saved Linux cloud. No production publication, copied third-party screenshot upload, paid provider or account/billing/native-signing change is authorized by these artifacts. Parent visual/QA review remains required.
