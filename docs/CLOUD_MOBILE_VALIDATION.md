# ODA cloud mobile validation and native handoff

ODA / ONE DECISION AWAY serves an international audience with English as its primary language and English, Turkish and Spanish support. This handoff covers the authorized Linux cloud web checks and optional future native validation. The root task owns browser installation, execution, release checks and publication. Physical iPhone testing is future native work and is not a prerequisite for the cloud web publication scope approved in this task. Publication remains pending the required successful WebKit check.

## Current results

**Blocked at WebKit installation.** The root run attempted the official download with this command:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cloud-tools/playwright-browsers npx playwright install webkit
```

The official hosts `cdn.playwright.dev` and `playwright.download.prss.microsoft.com` returned **HTTP 403** with the response **“Domain forbidden.”** No WebKit engine launched and no WebKit application test passed. This is an environment/download blocker; it does not establish either a WebKit application pass or an application defect. The conditional merge/publication step remains pending a successful WebKit run.

The application code is unchanged from `0a04e2d264344b9f47f5e2a71735e5241c73ef3b`. The existing **209 distinct automated tests and 118 named Chromium QA checks** remain unchanged; see [the verification report](VERIFICATION_2026-09-30.md). They are historical Chromium evidence, not WebKit or native iPhone evidence. Planned commands below are not additional test results. A supported additional-network-permission attempt returned the same download denial; no alternate download route was used.

| Evidence | Current status |
| --- | --- |
| Application source and intended build URL | `0a04e2d`; project preview `http://127.0.0.1:4174/one-decision-away/`; no URL loaded in WebKit |
| Linux image, Node and Playwright versions | Debian 13.6, Linux x64; Node 22.23.3; Playwright 1.63.0 |
| WebKit installation and successful launch | Blocked: official downloads returned HTTP 403 “Domain forbidden”; no launch |
| Exact WebKit version, desktop and mobile context parameters | Unavailable; no WebKit context created |
| Executed flow checks, failures and fixes | No WebKit application checks executed |
| EN/TR/ES, light/dark, reduced-motion and accessibility results | No WebKit results; prior Chromium reports retained |
| Report and installer evidence | `artifacts/webkit-mobile/report.json`, `launch-blocked.log`, `install-blocked.log`, `network-permission-check.log`; no WebKit screenshots or traces |
| Post-publication URL and smoke checks | Pending successful required WebKit validation |
| Xcode compilation, Simulator and physical iPhone execution | Not performed in this Linux task |

Keep the earlier verified archives intact. Save this run's reports and screenshots in a new, clearly named location; record that location here when execution finishes. A browser-launch failure is a missing check, not a passing application result.

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

The dedicated runner uses WebKit without a browser fallback:

```sh
PLAYWRIGHT_BROWSERS_PATH=/workspace/.cloud-tools/playwright-browsers ODA_QA_URL=http://127.0.0.1:4174/one-decision-away/ node --import tsx scripts/qa-webkit-mobile.mjs
```

Its syntax check passed. The actual invocation exited 1 at WebKit launch and saved a `blocked` report with **zero checks, contexts or screenshots**. A passing syntax check does not validate its application flows. Running it requires an authorized cloud environment with the matching WebKit engine already installed or access to the official download hosts and required Linux libraries. No control available in this executor changes the denied domain policy.

Existing browser scripts must explicitly launch WebKit to establish WebKit evidence; a narrow Chromium viewport alone establishes Chromium mobile-layout behavior. The new runner prepares disposable contexts and synthetic records for onboarding, daily choose/act/reflect, interrupted course work, backup export/restore, keyboard dialogs, direct route reload and offline revisit. It also prepares 320/390px touch/reflow, EN/TR/ES, reduced-motion, light/dark and axe checks. These are **pending coverage**, not results. Offline checks detect actual service-worker/cache support; a shortened viewport is only an approximation of available keyboard space.

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
