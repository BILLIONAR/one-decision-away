# Sound Room scoped repair frozen

Changed only `src/pages/SoundRoom.tsx` and `src/styles/sound.css`. Scene assets, catalog, entitlement/identity/audio services, synthesizer and shared AppShell are byte-exact against635209e.

- Expanded player becomes primary when its complete control surface is within the usable viewport; the fixed mini is absent then and returns offscreen, including paused state. Existing native volume/timer controls share one page volume value and existing guarded player methods. Focus transfers between matching toggle/volume/timer controls using preventScroll. Scroll/resize fallback works without IntersectionObserver.
- Three continuous scenes derive span/overlap from viewport height. The fourth Breathe tab follows with nav-aware scroll margin. Home/End/Left/Right and the single roving tab stop remain intact. Extremely short viewports preserve accessible scroll instead of clipping readable content; repeated section intro remains in detail cover.
- Sound-only dark translucent bottom navigation uses the existing `/app/sound` route attribute. All five destinations, labels, handlers and aria-current markup remain unchanged. Active icon has circular emphasis.
- Session selected state remains visible while paused. Rows use compact descriptions with separate native rationale details; existing Why it matters translations label the44px Info summary. Existing rationale/headphone note retained. Cover/thumbnail curve proportions refined with exact original SVG bytes.

## Actual verification

TypeScript passed. Fifty focused sound/timer/access tests passed, actual log included. Ten local Chromium contexts passed: EN/TR/ES320/390, ENdark390, EN390×568, EN1440×1000, and EN390 with IntersectionObserver unavailable. Scene-fit, Breathe reachability, four-tab keyboard, native rationale, volume/timer, focus handoff, paused countdown, pause/resume and access guard/upgrade route checks passed. There were zero Axe violations, horizontal overflows, page errors or external requests. Scrolling/disclosures did not start new audio graphs; one explicit resume did. Native timer preserved width:auto/min118 and min44px height. No provider/account/billing operation ran; access checks use synthetic in-memory fixture only.

`initial-timer-observation.json` preserves an initial harness-only observation from a direct Vite module import; corrected harness imports the canonical app-loaded resource URL, recorded per case. A separate archived short-viewport attempt aligned the whole tall artwork panel while controls remained outside usable view; the app correctly kept mini. The continuation helper scrolls actual controls into view. Completed contexts were retained, and only remaining cases were run. No source/service change addressed either harness issue.

Actual synthetic preview PNGs and their SHA256 values are bound by `freeze-receipt.json`. `browser-report.json`, `focused-services.log`, `typescript-check.json` and `scoped-repair.diff` provide exact evidence. Parent owns final aggregate/build/independent QA. No build, commit, push, install, asset generation or publication occurred in this delegated phase.

Art material remains **2/4 HOLD**. This functional/layout repair does not claim to pass photographic reference fidelity.
