# ODA bounded 3D prototype review

Release decision: **HOLD the 3D explorer from the production UI**. Keep the approved photographic stage images in the dashboard. The actual 3D prototype is original procedural geometry; its foliage and silhouette remain visibly procedural compared with the approved images. Cloud software rendering does not establish physical iPhone performance.

## Review artifacts

- `geometry-review.html`: self-contained original 3D geometry studio; works without downloading models, images or scripts. It deliberately renders geometry without the production performance gate for visual review and says so on the page.
- `geometry-rotation-0.png`, `geometry-rotation-90.png`: actual model/camera rotation with depth, not a turned flat image. The studio's angle changed from 0 to 1.5708 radians.
- `component-review.html` / `.tsx`: guarded component test harness; serve via the repository's Vite server. Its fallback handler retains the rejected viewport only for diagnosis; the application would display the approved static image.
- `qa-component.mjs` and `benchmark-report.json`: reproducible input/fallback checks and measured conditions. Run `node artifacts/tree-3d/qa-component.mjs` while Vite serves port 3000.
- `component-bundle/`: isolated minified module measurement with existing React and i18n excluded. This is a synthetic bundle, not a deployed transfer.

## Final verification

16 Chromium checks passed, including real component keyboard orbit, pointer orbit, safe zoom bounds, reset, no automatic rotation, close/reopen and interrupted count updates, context-loss fallback, reduced-motion fallback, low-memory fallback, unsupported WebGL fallback, texture/observer initialization failure cleanup, simulated slow-rendering fallback, and 390 px emulated touch orbit plus vertical page scrolling. No uncaught page errors. TypeScript lint passed. Two growth-cap tests passed.

Final mature guarded probe: 59,078 triangles, 3,645 decorative leaves, 3 draw calls. With `/usr/bin/chromium` 151.0.7922.173 on Linux x64, `--no-sandbox --enable-unsafe-swiftshader`, ANGLE Vulkan SwiftShader, 900 × 1000 viewport and pixel ratio 1, median CPU render submission was 0.4 ms, p95 0.6 ms. Median host requestAnimationFrame cadence was 72.6 ms, p95 90.3 ms. The component correctly rejected this with `slow-rendering`. Prior runs varied under the shared cloud host; no physical iPhone or native iOS performance claim is made. Samples exclude the first three warm-up frames and measure CPU submission and host cadence, not GPU timer-query duration.

Isolated component: 557,753 bytes minified JavaScript / 143,177 bytes gzip; CSS 1,523 bytes / 634 bytes gzip. The held component is not imported by the production UI, so it contributes no requested 3D payload to the published dashboard.

## Provenance and constraints

All mesh geometry, folded leaf shapes, bark texture and contact-shadow texture are original code in `src/components/momentum/treeGeometry.ts` and `InteractiveTree.tsx`. No external model, paid asset or service was used. Three.js 0.186.1 is MIT licensed. The original exact kept-decision ledger remains separate: decorative growth caps at 60 and extra blossoms at 30; procedural foliage does not represent exact individual ledger entries.

The component has bounded keyboard and touch interaction, no autoplay, on-demand rendering, static fallback reasons, and count/unmount resource disposal. The final cleanup uses a release stack for partial initialization failures. Camera framing uses a containing sphere with margin at maximum zoom across all permitted yaw/tilt angles.
