# ODA cloud mobile validation and native handoff

ODA / ONE DECISION AWAY serves an international audience with English as its primary language and English, Turkish and Spanish support. This handoff covers the authorized Linux cloud web checks and optional future native validation. The root task owns browser installation, execution, release checks and publication. Physical iPhone testing is future native work and is not a prerequisite for the cloud web publication scope approved in this task. The required cloud WebKit check has passed; publication, exact-commit CI and live checks remain pending.

## Current fresh-task results · 1 October 2026

**The full cloud WebKit run passed: 59 named checks.** The fresh task fetched application source `bf704df99b15f268f2e848400010ca8bb1b3f5b8` from `feat/oda-growth-studio`; main at its start was `b27d1ea2cbb3a516657ff0dbeb3c35494e9ade41`. The parent attested published environment configuration `6abdbafe0ef4819a90382822ddf8abf0`, with only the three approved added hosts: `cdn.playwright.dev`, `playwright.download.prss.microsoft.com` and `snapshot.debian.org`. That configuration readback belongs to the parent; this task's evidence is the actual successful authorized download, dependency retrieval and launch.

Official Playwright **1.63.0** WebKit **revision 2359 / version 26.6** launched on Debian 13.6 x64 with Node 22.23.3. Ten authenticated Debian packages from the existing `snapshot.debian.org` repository (`20260828T000000Z`) were extracted into task-local directories for the missing libraries. Package sources and the environment package preset were unchanged. [Dependency receipt](../artifacts/verification/webkit-mobile-setup/dependencies.json)

Fresh `npm run check` passed **258 core + 19 notebook = 277 distinct automated tests**, TypeScript, translation/voice assertions and the root production build. The routing command reran 11 already-counted core cases. The separate `/one-decision-away/` build also passed. [Fresh check log](../artifacts/verification/webkit-mobile-setup/oda-check-20261001.log). The earlier **158 named Chromium checks and two separate synthetic scenarios** remain prior evidence in [the October 1 review](VERIFICATION_2026-10-01.md); they are not fresh Chromium runs in this task.

[The final WebKit report](../artifacts/verification/webkit-mobile-final/report.json) records **59 passing named checks**, seven mobile contexts, 13 axe scans with zero violations, 18 geometry records, eight screenshots and no uncaught page errors. The app-origin transport-loss control first received HTTP 200, then removed the task-owned preview process and independently received `ECONNREFUSED` at `127.0.0.1:4175`. Cached app/course reloads retained a new decision and lesson reflection; JSON backup and both support routes passed without replacing the cached app shell. `navigator.onLine` remained true, so this establishes origin-unavailable/cache-fallback behavior rather than airplane mode.

[Intermediate attempt 5](../artifacts/verification/webkit-mobile-attempt5/report.json) remains failed after 55 checks: `context.setOffline(true)` followed by reload returned **“WebKit encountered an internal error.”** ODA and unrelated minimal service-worker probes reproduce that emulation failure. The final pass uses actual local-origin transport loss; it does not claim that `setOffline(true)` reload works. Merge/publication, exact-commit CI and live checks remain pending.

Executed checks include touch onboarding and daily persistence, EN/TR/ES workbook storage/download/restore, 320/390px reflow, relevant 44px controls, light/dark, reduced motion and native/fallback web-dialog focus. The **390×844 workbook** checks verify date/export helper hit-tests and final-helper clearance at maximum scroll. Linux WebKit reported `env(safe-area-inset-bottom) = 0`; a temporary **34px CSS navigation-bottom override** adds geometry stress without claiming a physical safe area. A focused **390×430 viewport** verifies usable space and saving, without exercising an iOS keyboard. Trusted touch/pointer events were recorded despite this Linux engine reporting `navigator.maxTouchPoints = 0`.

The [fresh WebKit release report](WEBKIT_MOBILE_RELEASE_2026-10-01.md) records setup receipts, intermediate harness failures, geometry and the remaining release gate. No physical iPhone, Xcode, native keyboard/VoiceOver, StoreKit or live Supabase validation has occurred.

## Historical results · earlier existing tasks

**Blocked at WebKit installation.** The root run attempted the official download with this command:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cloud-tools/playwright-browsers npx playwright install webkit
```

The official hosts `cdn.playwright.dev` and `playwright.download.prss.microsoft.com` returned **HTTP 403** with the response **“Domain forbidden.”** No WebKit engine launched and no WebKit application test passed. This is an environment/download blocker; it does not establish either a WebKit application pass or an application defect. The conditional merge/publication step remains pending a successful WebKit run.

At the first blocked run, application code matched `0a04e2d264344b9f47f5e2a71735e5241c73ef3b`. Its **209 distinct automated tests and 118 named Chromium QA checks** are historical results in [the original verification report](VERIFICATION_2026-09-30.md). The additional October 1 bug review changes the application; see [its verification report](VERIFICATION_2026-10-01.md) for current results. Neither report establishes WebKit or native iPhone execution.

The approved update added only `cdn.playwright.dev` and `playwright.download.prss.microsoft.com` to the saved environment configuration. One official installation retry after republishing still received HTTP 403 in this existing task. The response is verified; the exact rejecting network layer is not. No further download attempts or alternate routes were used. The current [cloud environment guide](https://learn.chatgpt.com/docs/environments/cloud-environments) directs using a new task after republishing; existing tasks retain their own saved state. Transfer the verified development branch to a QA-only task using that same updated environment, then test official WebKit availability there. The original workspace and archives remain intact.

| Evidence | Historical status at the blocked run |
| --- | --- |
| Application source and intended build URL | October 1 development branch; intended project path `/one-decision-away/`; no URL loaded in WebKit |
| Linux image, Node and Playwright versions | Debian 13.6, Linux x64; Node 22.23.3; Playwright 1.63.0 |
| WebKit installation and successful launch | Blocked: official downloads returned HTTP 403 “Domain forbidden”; no launch |
| Exact WebKit version, desktop and mobile context parameters | Unavailable; no WebKit context created |
| Executed flow checks, failures and fixes | No WebKit application checks executed |
| EN/TR/ES, light/dark, reduced-motion and accessibility results | No WebKit results; prior Chromium reports retained |
| Report and installer evidence | `artifacts/webkit-mobile/report.json`, `launch-blocked.log`, `install-blocked.log`, `network-permission-check.log`; no WebKit screenshots or traces |
| Post-publication URL and smoke checks | Pending successful required WebKit validation |
| Xcode compilation, Simulator and physical iPhone execution | Not performed in this Linux task |

These historical archives remain intact. Fresh setup is under `artifacts/verification/webkit-mobile-setup/`; intermediate runs are under `artifacts/verification/webkit-mobile-attempt1/` through `webkit-mobile-attempt5/`. A browser-launch failure remains a missing check, not a passing application result.

## What Linux WebKit establishes

Playwright uses a patched WebKit build derived from recent upstream sources. It can expose WebKit-specific layout, JavaScript, focus, navigation and persistence defects in the built web application. Its engine can be ahead of released Safari; Playwright cannot drive branded Safari through this WebKit browser. Platform features such as media codecs also differ between Linux and macOS. [Playwright browser documentation](https://playwright.dev/docs/browsers#webkit)

An iPhone-named Playwright device profile supplies browser parameters such as viewport, screen size, device scale, user agent and touch settings. Locale, timezone, color scheme, reduced motion and offline conditions can be configured separately. Those parameters do not start iOS or a physical iPhone. Record the actual profile and overrides instead of labelling the result simply “iPhone tested.” [Playwright emulation documentation](https://playwright.dev/docs/emulation)

The resulting evidence supports responsive web behavior in the tested engine and contexts. Native Swift compilation, Capacitor's actual WKWebView host, physical safe areas and keyboard behavior, VoiceOver, device memory/performance, native background/foreground delivery, local notification permissions/delivery, StoreKit/RevenueCat and App Store acceptance remain outside this cloud browser run. These distinctions follow from running a web browser rather than the native host.

## Cloud reproduction and recording

Use the repository's locked dependencies. Install the matching WebKit binary and record a successful launch before running application checks; Linux libraries may require installation in the authorized cloud environment. Playwright documents separate browser and system-dependency installation. [Installation instructions](https://playwright.dev/docs/browsers#install-browsers)

```sh
npm ci
node --version
npx playwright --version
npx playwright install webkit
npm run check
```

Build and serve the same deployment base intended for the web release. For the existing project-folder deployment:

```sh
VITE_BASE_PATH=/one-decision-away/ npx vite build --outDir /tmp/oda-cloud-mobile-web
VITE_BASE_PATH=/one-decision-away/ npx vite preview --outDir /tmp/oda-cloud-mobile-web --host 127.0.0.1 --port 4174
```

The dedicated runner uses WebKit without a browser fallback. The earlier blocked invocation was:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cloud-tools/playwright-browsers ODA_QA_URL=http://127.0.0.1:4174/one-decision-away/ node --import tsx scripts/qa-webkit-mobile.mjs
```

That historical invocation exited 1 at WebKit launch and saved a `blocked` report with **zero checks, contexts or screenshots**. A passing syntax check did not validate its application flows. The fresh task installed the official engine and dependencies and executed the runner against `https://127.0.0.1:4175/one-decision-away/`, using task-local dependency launch. The temporary self-signed loopback HTTPS preview preserves the application's `upgrade-insecure-requests` CSP; certificate errors are tolerated only for localhost/127.0.0.1 contexts. This does not alter public-host TLS verification. Build hashes and the exact base are in [the local build receipt](../artifacts/verification/webkit-mobile-setup/local-build.json).

With the official engine and task-local dependencies ready, the fresh origin-loss reproduction is:

```sh
VITE_BASE_PATH=/one-decision-away/ npx vite build --outDir /tmp/oda-webkit-project-build
ODA_WEBKIT_LOCAL_DEPS=1 PLAYWRIGHT_BROWSERS_PATH=/workspace/.cloud-tools/playwright-browsers ODA_WEBKIT_QA_OUT=artifacts/verification/webkit-mobile-final node --import tsx scripts/qa-webkit-origin-harness.mjs
```

The tracked harness creates and owns a disposable HTTPS preview and temporary loopback certificate, then cleans them up on exit. The runner verifies that precise process and a successful direct-origin request before removing transport. Read [the fresh report](WEBKIT_MOBILE_RELEASE_2026-10-01.md) for intermediate process/control failures and the final gate status.

Existing browser scripts must explicitly launch WebKit to establish WebKit evidence; a narrow Chromium viewport alone establishes Chromium mobile-layout behavior. The runner uses disposable contexts and synthetic records. Use its saved report to distinguish executed checks from planned coverage and inspect its overall status. Offline checks detect service-worker/cache support and record the actual loss-of-network method; a shortened viewport is only an approximation of available keyboard space.

## Optional future Mac and iPhone validation

Use a Mac compatible with the chosen **Xcode 26.0 or newer**, Node 22+, and an iPhone running **iOS 16.4 or newer**. Capacitor 8 requires Xcode 26.0+; ODA's application minimum is 16.4. Check the selected Xcode release's macOS and device support rather than assuming every Mac can install it. [Capacitor requirements](https://capacitorjs.com/docs/updating/8-0), [Apple Xcode system requirements](https://developer.apple.com/xcode/system-requirements)

From a local copy on that Mac, the following prepares the web bundle/native shell and checks the configured minimum. These commands have not been run on macOS in this task:

```sh
npm ci
npm run check
npm run build:ios
node --import tsx --test tests/native-baseline.test.ts
xcodebuild -version
xcodebuild -project ios/App/App.xcodeproj -scheme App -showdestinations
npx cap open ios
```

An optional unsigned Simulator build can provide native compilation evidence without a distribution account:

```sh
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /tmp/oda-native-validation CODE_SIGNING_ALLOWED=NO build
```

For a physical device, select the App target, an available signing team and the connected iPhone in Xcode, then Run. Apple documents local installation/testing with an existing free Apple Account through a **Personal Team**; its provisioning expires periodically and requires rebuilding. This option does not establish TestFlight, store distribution or advanced-capability support. Account sign-in stays in Xcode on the owner's Mac. [Apple Personal Team instructions](https://developer.apple.com/help/account/basics/about-your-developer-account#enable-a-personal-team-in-xcode), [running on a device](https://developer.apple.com/documentation/xcode/running-your-app-on-simulated-or-physical-devices)

Follow Xcode's device-pairing and Developer Mode instructions where required. Validate cold launch, safe areas, larger text/VoiceOver, keyboard entry, interrupted drafts, foreground/date rollover, native notifications and Files export/restore on the selected device. Record OS, hardware and build identifiers with actual outcomes. Purchase/cloud checks need their separately configured services; they are not prerequisites for testing the account-free daily practice. [Apple Developer Mode](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device)
