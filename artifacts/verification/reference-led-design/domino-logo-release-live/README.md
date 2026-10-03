# ODA actual live web release proof

Published through normal [PR #6](https://github.com/BILLIONAR/one-decision-away/pull/6) and main-triggered [Pages run 37147734045](https://github.com/BILLIONAR/one-decision-away/actions/runs/37147734045).

- Live website: https://billionar.github.io/one-decision-away/
- Exact deployed merge commit: `9e07fb13ee1f3ba1b06ec0a69d64fa536bd6a429`.
- Tested source: `84ecbf8776146b766a30964bf8e6487234dd1dd4`.
- Pre-release review/evidence commit: `66b6ba44aef70d9811c778ed109eb68b8d7d90fb`.
- Previous production / rollback commit: `350aa158f30c773a373f2895e267119f9f2eb17a`.

[Normal merge receipt](deployment/normal-merge-receipt.json) binds the expected head and unchanged previous main. [CI receipt](deployment/successful-pages-ci.json) records successful type/translation/data checks, website build/upload and actual Publish website step. [Source identity](deployment/merge-source-identity.json) independently confirms every one of the 900 frozen source files equals the merged commit and all 445 local compiled files remain unchanged. This evidence-only successor is pushed to the existing review branch; it does not alter the released app or trigger another production deployment.

[Actual normal-HTTPS served receipt](deployment/live-served-assets.json) and [served HTML](deployment/live-index.html) show the new selected domino references. All 15 versioned/root PNG, manifest and service-worker assets returned 200 and exactly matched the reviewed public source bytes. The actual entry JS returned 200 and its 952,854 bytes / SHA256 `6ce9eb064102bb673f739c91825cd1328054bc98b76d5432a297cee6fbd96168` are recorded. Served CSS is 110,545 bytes / SHA256 `36c163113d0186bf11de8498a554f339400a55a8bdb9dcf521bb39be13e38966`, exactly equal to the tested build.

CI injects the existing public VITE settings; the actual entry/index differs from the local blank-env build. We do not claim all live JS equals local JS or direct whole-artifact identity. The GitHub Pages artifact metadata binds the successful workflow/head: artifact `11282578198`, 76,589,568 bytes, digest `sha256:4278407bc2cc5edacd0a101da148fc460e20b4760d4a8dab70ac43992e9066bc`. It exceeds the platform's 32 MiB download limit, so no artifact download is claimed. Source, exact workflow commit, served static bytes and recorded live entry hashes provide the stated release evidence.

## Remaining live browser blocker

Independent normal Chromium navigation stopped immediately with **`page.goto: net::ERR_CERT_AUTHORITY_INVALID`** at `https://billionar.github.io/one-decision-away/#/`. [Sealed exact blocker](browser-qa/live/independent-live-verification-9e07fb1.json), [original report](browser-qa/live/report.json), [original log](browser-qa/live-capture.log) and [guarded harness](browser-qa/live-capture.mjs) are preserved unchanged. One attempt, zero live page bodies/PNGs, no security bypass, certificate/permission changes or retries. Normal Python HTTPS GET verification used its default certificate validation and succeeded; this is distinct from a successful browser render. No live browser/mobile rendering pass is claimed.

The [pre-release review packet](../domino-logo-release/README.md) preserves the actual local synthetic 1440/390/320 previews, exact aggregate log (621/0), independent 54-check asset/source audit and 69-check browser seal. [All 110 pre-release artifacts](deployment/pushed-review-artifacts.json) were individually fetched from immutable `66b6ba4` and verified HTTP 200 with exact bytes/SHA256. The initial live static-verifier assertion used an incorrect guessed OG filename; its unchanged harness/index/report are retained under `deployment/attempts/live-static-1`. The scratch verifier was corrected from actual source/served HTML only; no app edits, rebuild or aggregate rerun occurred.

No App Store/native release, billing, paid provider, credential, DNS or signing change was performed. Selected artwork remains the parent-accepted reference-guided reconstruction, with provenance preserved in the pre-release packet. [Byte manifest](manifest.json) covers this proof packet except itself.
