# ODA fresh cloud WebKit mobile validation · 1 October 2026

**Local cloud WebKit passed: 59 named checks; exact-commit Pages deployment succeeded; live verification is blocked.** [The local final report](../artifacts/verification/webkit-mobile-final/report.json) records the complete run against the unchanged application source, including verified transport loss to the disposable local origin and successful cache-fallback flows. Intermediate failures remain retained below. The publication record and public-origin blocker are separate evidence; no successful live core-flow check is claimed.

## Source and authorized environment

- Application source: `bf704df99b15f268f2e848400010ca8bb1b3f5b8`, `BILLIONAR/one-decision-away`, branch `feat/oda-growth-studio`.
- Main at task start: `b27d1ea2cbb3a516657ff0dbeb3c35494e9ade41`.
- Parent-attested published environment configuration: `6abdbafe0ef4819a90382822ddf8abf0`. Only the three approved added hosts are `cdn.playwright.dev`, `playwright.download.prss.microsoft.com` and `snapshot.debian.org`; the package preset is unchanged. The parent verified the configuration readback. This task verifies the resulting download, dependency access and browser execution.
- Runtime: Debian **13.6 x64**, Linux **6.18.44**, Node **22.23.3**, Playwright **1.63.0**.
- Engine: official Playwright WebKit **revision 2359 / version 26.6**, explicitly launched through `webkit.executablePath()`; no other browser supplies these results.

The existing application source is retained. This task extends the QA runner and evidence; intermediate harness corrections are not application repairs. ODA / ONE DECISION AWAY remains English-primary with EN/TR/ES support and the original C4 branching-sprout logo.

The post-release source comparison against `bf704df99b15f268f2e848400010ca8bb1b3f5b8` has no differences in `src`, `public`, `package.json`, `package-lock.json` or `.github/workflows/deploy-pages.yml`. The release changes QA/evidence/documentation, preserving the application and deployment workflow.

## Dependency and build receipts

The official archive came from `https://cdn.playwright.dev/dbazure/download/playwright/builds/webkit/2359/webkit-debian-13.zip`: **99,959,260 bytes**, SHA256 **`6c402e84b829a5f0bdee7c86dd0725a21ace8801340542d6422deb0f3a40c4eb`**. The missing-library packages were `libgtk-4-1`, `libgraphene-1.0-0`, `libharfbuzz-icu0`, `libmanette-0.2-0`, `libhyphen0` and `libgles2`.

Ten packages including their required dependencies were retrieved through authenticated apt indexes from the **existing configured `snapshot.debian.org` repositories at `20260828T000000Z`**. They were extracted with `dpkg-deb` into `/workspace/.cloud-tools/webkit-deps`, with library symlinks in the official browser's `sys/lib`. This unprivileged setup did not update the system apt package database or change package sources. No new host, mirror or proxy route was used. The [dependency receipt](../artifacts/verification/webkit-mobile-setup/dependencies.json) records all ten versions and archive hashes; [the launch log](../artifacts/verification/webkit-mobile-setup/oda-webkit-launch-success.log) records WebKit 26.6 at 390×844.

Fresh `npm run check` passed **258 core + 19 notebook = 277 distinct tests**, TypeScript, translation/voice assertions and the root production build. Its 11 routing cases are repeated core cases and are not added again. [Fresh check log](../artifacts/verification/webkit-mobile-setup/oda-check-20261001.log). The `/one-decision-away/` project build also passed. Bundle warnings remain; these builds are not device-performance measurements. The prior **158 named Chromium checks plus two dedicated synthetic scenarios** remain evidence from [the preceding review](VERIFICATION_2026-10-01.md), not fresh Chromium execution in this task. The **59 WebKit checks** are a separate fresh engine result.

The tested project build is served at `https://127.0.0.1:4175/one-decision-away/`. A temporary self-signed loopback HTTPS preview preserves the production `upgrade-insecure-requests` CSP. The runner accepts its certificate only when the URL is HTTPS localhost or 127.0.0.1; public-host TLS verification is unchanged. [The build receipt](../artifacts/verification/webkit-mobile-setup/local-build.json) records source, base, index and asset hashes. These loopback addresses are reproduction references, not public release links.

With the recorded official engine and task-local libraries available, reproduce the complete origin-loss check with:

```sh
VITE_BASE_PATH=/one-decision-away/ npx vite build --outDir /tmp/oda-webkit-project-build
ODA_WEBKIT_LOCAL_DEPS=1 PLAYWRIGHT_BROWSERS_PATH=/workspace/.cloud-tools/playwright-browsers ODA_WEBKIT_QA_OUT=artifacts/verification/webkit-mobile-final node --import tsx scripts/qa-webkit-origin-harness.mjs
```

The [origin harness](../scripts/qa-webkit-origin-harness.mjs) generates a temporary loopback TLS key/certificate with OpenSSL and starts its own Vite preview through [the QA HTTPS config](../scripts/qa-webkit-https.config.mjs). It passes that child's PID to the runner and cleans up the preview and temporary certificate directory on exit. The runner checks the exact PID, owner, executable, checkout Vite CLI, command, output directory, bind address and port, plus an HTTP 200 positive control at the trailing-slash project URL, before shutdown. No production process is targeted.

## Final executed mobile evidence

[The final report](../artifacts/verification/webkit-mobile-final/report.json), started at **2026-10-01 02:17:28 UTC**, has overall status **passed**, **59 named checks**, **seven mobile contexts**, **13 axe scans**, **18 geometry records**, **eight screenshots** and **no uncaught page errors**. All 13 axe scans record zero violations. [The final run log](../artifacts/verification/webkit-mobile-final/run.log) preserves the executed check names. The root also inspected the maximum-scroll screenshots. The report and geometry were read independently when finalizing this document.

Contexts use the Playwright `iPhone 13` descriptor with `isMobile` and `hasTouch`, 390×844 or 320×740 viewports, `en-US` browser locale, `America/New_York` timezone and reduced motion. The app locale is separately set to EN/TR/ES. Service workers are blocked for ordinary isolated flow checks and allowed for the offline context. Linux WebKit reports `navigator.maxTouchPoints = 0`; real Playwright taps nevertheless produce trusted `touchstart`, `touchend` and touch-pointer events, retained in each context's report.

Completed checks cover interrupted and successful onboarding; local-day decision creation; completion, reflection and reload without duplicate rewards; 320/390px reflow and relevant 44px targets; EN/TR/ES course reading and partial work; plan, adapted attempt, review and text export; blocked-storage draft retention/retry; sequential progression; JSON backup and malformed/cancelled/confirmed restore; native and missing-dialog/inert fallback focus containment/return; light/dark and reduced motion. These are disposable synthetic records. No real provider account, production database or payment was exercised.

### Workbook navigation clearance

At **390×844**, the date/export helpers are scrolled into usable space and checked at their top, center and bottom with `document.elementFromPoint`. At maximum scroll, the final lesson helper is fully above the floating navigation and passes the same hit-tests. The final report records:

| Geometry | Final helper bottom | Floating navigation top | Result |
| --- | ---: | ---: | --- |
| English, observed browser inset | 695.34px | 754px | Clear |
| English, synthetic 34px navigation bottom | 695.34px | 734px | Clear |
| Turkish, observed browser inset | 694.58px | 754px | Clear |
| Spanish, observed browser inset | 694.84px | 754px | Clear |

The actual observed `env(safe-area-inset-bottom)` is **0px**, with a normal 14px navigation bottom offset and `viewport-fit=cover`. The **34px** condition is a temporary CSS navigation-bottom override for geometry stress; it is not a physical iPhone safe-area reading. At **390×430**, the focused workbook textarea remains clear of the header/navigation, accepts an edit, and the review save survives reload. This short viewport approximates available space; it does not open or measure an iOS software keyboard.

## Retained intermediate failures and offline boundary

| Attempt | Completed checks | Recorded failure and evidence |
| --- | ---: | --- |
| [1](../artifacts/verification/webkit-mobile-attempt1/report.json) | 1 | A harness assertion assumed `maxTouchPoints > 0`. Trusted generated touch events replaced that unsupported capability assumption. |
| [2](../artifacts/verification/webkit-mobile-attempt2/report.json), [3](../artifacts/verification/webkit-mobile-attempt3/report.json) | 21 each | A maximum-scroll equality assumption rejected `scrollTop = 8001` with nominal maximum 7996. The runner now accepts reaching or slightly exceeding the maximum and separately checks helper geometry/hit-tests. |
| [4](../artifacts/verification/webkit-mobile-attempt4/report.json) | 22 | The synthetic 34px override had not taken effect (`navBottom = 14`). Attempt 5 records the applied 34px value; the expected clearance check remains. |
| [5](../artifacts/verification/webkit-mobile-attempt5/report.json) | 55 | `context.setOffline(true)` followed by reload produced “WebKit encountered an internal error.” |
| [First origin-loss run](../artifacts/verification/webkit-mobile-origin-loss/report.json) | 55 | The runner could not read `/proc/3955/cwd` across execution sessions (`EACCES`). It stopped before signalling the preview; no transport-loss result was established. The new harness owns its preview child in the same execution session. |
| [First origin positive-control run](../artifacts/verification/webkit-mobile-origin-control-failed/report.json) | 55 | The independent control used slashless `/one-decision-away` and returned HTTP 404 before shutdown. The corrected control requests `/one-decision-away/`; no transport-loss result was established in this failed run. |

The [ODA offline probe](../artifacts/verification/webkit-mobile-setup/offline-probe.json) records an online controlling service worker, populated cache and successful online service-worker navigation, followed by failed fetch/reload under `setOffline(true)`. The [unrelated minimal probe](../artifacts/verification/webkit-mobile-setup/minimal-offline-engine-probe.json) serves a synthetic response from a minimal service worker successfully online, then reproduces the same internal reload error under offline emulation. Its [HTML](../artifacts/verification/webkit-mobile-setup/minimal-engine-probe.html) and [worker](../artifacts/verification/webkit-mobile-setup/minimal-engine-probe-worker.js) contain no ODA code.

This reproduction supports an offline-emulation/runtime limitation independent of ODA. The final runner instead shut down only its verified task-owned loopback Vite preview. Its control records **HTTP 200 before shutdown**, **the preview process removed**, and an independent direct-origin request failing with **`ECONNREFUSED 127.0.0.1:4175`**. The browser then reloaded cached app/course content, saved and reloaded a new decision and lesson reflection, exported the updated JSON backup, and opened both support routes without overwriting the app shell. These are passing origin-unavailable/cache-fallback results.

`navigator.onLine` remained **true** during this transport loss. The result does not establish airplane mode or a working `context.setOffline(true)` reload. The earlier emulation failure remains a limitation; no application code was changed to conceal it.

## Publication record and blocked live verification

The required local cloud WebKit/mobile gate passed before publication. The root pushed development and main release **`a793799d008f3577bcced1e608f60b08ab70a1e4`** without force; the original main **`b27d1ea2cbb3a516657ff0dbeb3c35494e9ade41`** remains its ancestor. The automatic [GitHub Pages run 36805521226](https://github.com/BILLIONAR/one-decision-away/actions/runs/36805521226) is **completed / success** for that exact main SHA. Its `build` and `deploy` jobs both completed successfully. CI reran **258 core + 19 notebook = 277 distinct tests**, with zero failures; the 11 standalone routing cases repeat core coverage. [The CI receipt](../artifacts/verification/webkit-live-release-ci/ci-summary.json) binds run, jobs, SHA and counts; [the test summary](../artifacts/verification/webkit-live-release-ci/test-summary.log) retains the count evidence.

The deployment job reported **`https://billionar.github.io/one-decision-away/`** as its environment URL. [The retained deployment URL](../artifacts/verification/webkit-live-release-ci/deployment-url.log) supports that publication destination. A successful deploy job does not establish that the public application passed browser flows.

**Live status: BLOCKED, zero completed live checks.** [The actual public-origin WebKit attempt](../artifacts/verification/webkit-live/report.json), started at **2026-10-01 02:24:33 UTC**, failed at its first `page.goto` with **“Download is starting”**. The report records WebKit **26.6**, expected release SHA `a793799d008f3577bcced1e608f60b08ab70a1e4`, `ignoreHTTPSErrors: false`, no verified assets and zero completed checks. The caller-supplied expected SHA is not evidence of the public page's content; CI separately binds publication to that commit.

At **2026-10-01 02:27:58 UTC**, one curl diagnostic to the exact public deployment URL received **`CONNECT tunnel failed, response 403`**. The retained response is **HTTP 403** with **`server: envoy`** from the execution environment's HTTPS CONNECT layer, **before an origin response**; no Pages response body was received. [The network-block receipt](../artifacts/verification/webkit-live/network-block.json), [raw response headers](../artifacts/verification/webkit-live/connect-response-headers.txt) and [transport diagnostic](../artifacts/verification/webkit-live/transport-diagnostic.log) retain that evidence. The diagnostic used zero retries and did not follow redirects. Further public requests stopped after the 403, without new hosts, mirrors, alternate proxies or network-policy bypass.

This access failure leaves public reachability, served-asset identity and live core flows **unverified** from the task environment. It does not determine the Pages origin's health or establish an ODA application defect. The successful local 59-check run and successful exact-commit Pages deployment remain valid, separately bounded results.

These post-release artifacts and documentation updates are recorded in a **follow-up commit on `feat/oda-growth-studio` only**, whose SHA is reported separately in the final handoff. The stable main release remains **`a793799d008f3577bcced1e608f60b08ab70a1e4`**. This evidence-only follow-up does not change that deployed identity or retrigger main deployment.

## Remaining limits

This evidence covers the official Linux WebKit engine with mobile/touch emulation. It is not branded Safari, iOS, Xcode, Capacitor's actual WKWebView host or a physical iPhone. Real safe areas/software keyboard, VoiceOver, native lifecycle/notifications, StoreKit/RevenueCat, live Supabase and device performance remain unverified. Automated axe scans are bounded accessibility checks, not a full assistive-technology audit. [The cloud/native handoff](CLOUD_MOBILE_VALIDATION.md) retains the optional future Mac/iPhone instructions and historical blocked-run evidence. No bug-free or perfect-device claim follows from this validation.
