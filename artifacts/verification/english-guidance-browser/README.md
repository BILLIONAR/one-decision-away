Final functional candidate guidance QA passed 18 browser cases and 35 checks on Chromium 151.0.7922.173, using the normal HTTP preview at `http://127.0.0.1:4187/one-decision-away/`.

`lifecycle-report.json` records real MP3 decoding, Web Audio source starts/stops/disconnections/offsets/gain, request counts, native CacheStorage replay while offline, controlled missing-recording device-voice fixtures, Notebook locale checks, and final layout screenshots. There were zero failures, page errors, or attempted external/provider/write requests.

The refreshed report and screenshots are bound to the parent build receipt SHA256 `527e2ffc217c3816c7579e3793c06ad4e50330aae812989e39f34926d49e7407`, after the isolated onboarding proof-wrapper fix. All 131 recorded HTTP JavaScript response bodies matched the reviewed dist files and parent receipt. All 160 public and dist MP3 checksums matched the reused native decoding evidence in `../english-guidance-first-use/admission/chromium-all160-decode.json`.

The seven `final-guided-*` images cover EN/TR/ES at 320 and 390 pixels and EN desktop at 1440 pixels. The other four captures show recorded playback, verified offline replay, unavailable guidance, and device fallback. These captures use the main-based candidate appearance; initial rejected-appearance captures were not copied here.

Real native AudioContext and decoder instrumentation establishes source/gain/cache behavior. Headless cloud Chromium and viewport emulation do not establish physical iPhone/native iOS behavior or perceived listening quality. Device voice inventories and utterances in strict-fallback and Notebook cases are explicitly mocked; the normal recorded-playback cases use real browser MP3 decoding and trusted Playwright clicks. No claim is made that all 160 clips were human-listened or independently transcribed.

Only QA artifacts and scratch harness files were written. No source edits, package installs, provider/account/credential calls, commits, or publication were performed.
