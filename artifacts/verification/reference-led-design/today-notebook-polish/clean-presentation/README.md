# Clean synthetic presentation views

These three actual viewport PNGs supplement the original stress-test QA evidence. They use ordinary synthetic sample data in isolated disposable browser contexts. They do not replace QA proof or imply publication approval.

The existing compiled build was captured without rebuilding or changing app source, styles, assets, DOM presentation or real user records. This is Chromium viewport emulation, not a physical-device run.

- Tested app source: `7b78cf89adf3c1bd89e9e5c1540cffdb3953a566`.
- Existing evidence commit: `d4fc80080002deccb78c24164c4a10c50c838d1f`.
- Review branch: `design/reference-led-oda`.
- Exact tested receipt: [final-reviewed/build-receipt.json](../final-reviewed/build-receipt.json).
- Existing complete QA packet: [README.md](../README.md).

| Actual PNG | Viewport | Synthetic example |
| --- | --- | --- |
| [Today desktop](today-desktop.png) | 1440 × 1000 | Read two pages, with a naturally cased planning sentence |
| [Notebook desktop](notebook-desktop.png) | 1440 × 1000 | One saved entry, “A small step forward,” beside the editor |
| [Notebook 320](notebook-320.png) | 320 × 844 | Saturday 3 selected and fully visible in the horizontally scrolling week strip |

The mobile capture is at page top. The existing fixed navigation and normal vertical content continuation remain visible. No UI pixel regeneration or image processing was used.

[Capture receipt](capture-receipt.json) records source/build hashes before and after capture, actual observed served-file bindings, PNG byte hashes, page geometry and selected-date bounds. [Capture script](capture.mjs) and [capture log](capture.log) preserve how these three views were produced. No tests or broader QA campaign were rerun for this presentation task.

[Independent presentation review](independent-presentation-review.json) records separate inspection of all three original PNGs and their provenance. Its review covers these presentation views only.

The supported Library upload helper stopped before preparing any write with `hosted apps tools/list request failed: network`. No Library save or Library ID is claimed. These small review artifacts are the authorized fallback; no deployment was performed.
