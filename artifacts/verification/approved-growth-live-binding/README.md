# Approved static ODA release: verified live

Published URL: https://billionar.github.io/one-decision-away/

Published main SHA: `350aa158f30c773a373f2895e267119f9f2eb17a`.
The parent visual and independent QA checkpoint approved this exact commit.
Main advanced by a normal fast-forward push; no force push or subsequent
application changes were made. Original course references remain present.
The held 3D prototype is not imported into the production UI.

Exact-SHA Actions/Pages run:
https://github.com/BILLIONAR/one-decision-away/actions/runs/36913553645

The run and both build/deploy jobs completed successfully. See
`deployment-receipt.json` for the exact source SHA, job steps and artifact binding.
GitHub Pages artifact 11189570137 is 23,296,091 bytes; its downloaded ZIP matches
the Actions digest
`eaba25b0184b276f277cc3cc969b2d85753a2d91178bf440ab66c3868ac2b181`.

`artifact-byte-report.json` verifies strict public HTTPS response-body SHA-256
matches for 108 files against that exact CI artifact: all 94 JavaScript/CSS files,
index.html, the original C4 image, both asset manifests and all six tree/four course
cover PNGs. The ten PNGs also match their original approved manifests. No 3D chunk
or renderer/UI markers occur in the production artifact.

The actual public site passed 27 focused checks in official Linux WebKit 26.6,
with zero failures/runtime errors and no serious/critical findings across 11 axe
audits. Thirty-one live screenshots and the full report are in
`../approved-growth-live-webkit/`. These verify growth stages/caps, 320/390/1440
layouts, actual course continuation, EN/TR/ES catalogue covers, workbook
persistence, repeated/interrupted navigation, history and the Me miniature.

The strict-TLS live core flow passed 15 checks with zero browser errors or blocked
requests. See `../approved-growth-live-core-final/`. It verifies fresh onboarding,
reflection and one completion across reload, unchanged rewards, workbook edits,
actual text/JSON exports, and localized lessons. The original smoke script needed
three test-only adaptations: C4 bytes fetched through the working WebKit page
transport; the workbook's direct summary selected without its nested sources
summary; same-origin local Blob export reads permitted by the request guard.
The retained rerun adapter shows those precise substitutions. Every original
assertion and strict TLS setting remains; no application source changed.

Earlier attempts are recorded in `transport-diagnostics.json` and preserved in
the saved workspace's `/workspace/scratch/oda-qa-diagnostics/post-publication/`.
They are not counted as passing: this executor's Chromium certificate trust
rejected the public chain, and Node's separate APIRequestContext could not resolve
the host. No certificate bypass or system trust change was used.

Scope: synthetic signed-out local browser records, public assets and web flows.
No physical iPhone, native iOS, live Supabase, payment, or device-performance
validation is claimed. This evidence commit stays on the existing review branch;
it does not change the deployed main SHA or trigger another production release.
