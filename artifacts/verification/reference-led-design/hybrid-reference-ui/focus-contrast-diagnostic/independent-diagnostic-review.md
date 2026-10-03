Sound-only diagnostic on frozen compiled application `4bf566f17980fe2eaf26e3f20b277e97cad981b9` is complete: 18 contexts, 36 native PNGs, 36 element measurements. Ten contexts contain 16 localized contrast failures (eight titles and eight descriptions). This is a P2 corrective text-contrast finding, not a claim that the entire labels are unreadable. All six Turkish contexts and both EN320 contexts contain no below-threshold sampled core pixels.

The EN390 original finding is reproducible at title pixel (153, 643), background RGB (154, 157, 154), ratio 2.740:1 against the 3:1 large-text threshold; and description pixel (105, 688), background RGB (106, 123, 125), ratio 4.428:1 against 4.5:1. Coverage is 1.0 and 0.968280 respectively. These are localized foam highlights under actual high-coverage glyph pixels; they are not inferred from bounding boxes or filename captions.

Worst title: en-dark-1440, viewport pixel (534, 804), actual composited background RGB (161, 163, 159), visible RGB (255, 255, 255), reconstructed glyph coverage 1.000000, residual 0.000000, ratio 2.544:1.

Worst description: es-light-1440, viewport pixel (512, 843), actual composited background RGB (108, 145, 149), visible RGB (247, 249, 249), reconstructed glyph coverage 0.944999, residual 0.038625, ratio 3.430:1.

One localized rule is recommended for `.oda-sound-tab[data-section="focus"] :is(.oda-sound-tab-name, .oda-sound-tab-detail)`: existing-tone `background: rgb(8 19 28 / .25)` with matching `box-shadow: 0 0 0 3px rgb(8 19 28 / .25)`. Preserve padding, font, width, height, position, image, first two bands and controls. White text requires background relative luminance ≤0.300 for 3:1 and ≤0.1833 for 4.5:1. This recommendation provides margin over chasing a single foam pixel; only a fresh exact-built raster verification can establish the result.

Visible/background-probe PNG differences reconstruct glyph coverage. Samples require ≥90% coverage and RGB residual ≤40; text shadow is excluded as a contrast aid. Large text uses 3:1, small text 4.5:1. Results are supporting raster diagnostics, not full WCAG certification. Actual EN390 and the worst ENdark1440/ESlight1440 native visible PNGs were personally inspected.

All 434 compiled files match the immutable build receipt before and after. Sound CSS matches Git4bf before and after; other application surfaces were mutable and were not audited. The actual HTTP200 served Sound stylesheet is independently hash-bound in `http-sound-css-binding.json`. There were zero page errors or external requests. Synthetic fixtures are isolated. All browser readers are closed. No source edits, build, installation, server start or deployment occurred.

The original interrupted 4bf failure report and all current raw logs/PNGs remain unchanged. Course/Notebook regression captures do not establish approval for the new hybrid layout. Final hybrid review, material acceptance and publication remain pending the parent's new frozen-build GO and user checkpoint.

| Context | Label | Minimum | Required | Core pixels below |
|---|---|---:|---:|---:|
| en-light-320 | Title | 3.416:1 | 3:1 | 0/532 |
| en-light-320 | Description | 6.058:1 | 4.5:1 | 0/203 |
| en-light-390 | Title | 2.740:1 | 3:1 | 1/807 |
| en-light-390 | Description | 4.428:1 | 4.5:1 | 1/206 |
| en-light-1440 | Title | 2.568:1 | 3:1 | 2/1008 |
| en-light-1440 | Description | 5.570:1 | 4.5:1 | 0/190 |
| en-dark-320 | Title | 3.416:1 | 3:1 | 0/532 |
| en-dark-320 | Description | 6.058:1 | 4.5:1 | 0/203 |
| en-dark-390 | Title | 2.740:1 | 3:1 | 1/807 |
| en-dark-390 | Description | 4.428:1 | 4.5:1 | 1/206 |
| en-dark-1440 | Title | 2.544:1 | 3:1 | 2/1008 |
| en-dark-1440 | Description | 5.496:1 | 4.5:1 | 0/191 |
| tr-light-320 | Title | 4.178:1 | 3:1 | 0/611 |
| tr-light-320 | Description | 6.132:1 | 4.5:1 | 0/169 |
| tr-light-390 | Title | 3.576:1 | 3:1 | 0/872 |
| tr-light-390 | Description | 4.589:1 | 4.5:1 | 0/169 |
| tr-light-1440 | Title | 3.669:1 | 3:1 | 0/1126 |
| tr-light-1440 | Description | 5.000:1 | 4.5:1 | 0/173 |
| tr-dark-320 | Title | 4.178:1 | 3:1 | 0/611 |
| tr-dark-320 | Description | 6.132:1 | 4.5:1 | 0/169 |
| tr-dark-390 | Title | 3.576:1 | 3:1 | 0/872 |
| tr-dark-390 | Description | 4.589:1 | 4.5:1 | 0/169 |
| tr-dark-1440 | Title | 3.665:1 | 3:1 | 0/1126 |
| tr-dark-1440 | Description | 5.015:1 | 4.5:1 | 0/173 |
| es-light-320 | Title | 3.481:1 | 3:1 | 0/867 |
| es-light-320 | Description | 3.733:1 | 4.5:1 | 5/239 |
| es-light-390 | Title | 2.686:1 | 3:1 | 3/1279 |
| es-light-390 | Description | 3.779:1 | 4.5:1 | 5/236 |
| es-light-1440 | Title | 2.710:1 | 3:1 | 2/1593 |
| es-light-1440 | Description | 3.430:1 | 4.5:1 | 17/248 |
| es-dark-320 | Title | 3.481:1 | 3:1 | 0/867 |
| es-dark-320 | Description | 3.733:1 | 4.5:1 | 5/239 |
| es-dark-390 | Title | 2.686:1 | 3:1 | 3/1279 |
| es-dark-390 | Description | 3.779:1 | 4.5:1 | 5/236 |
| es-dark-1440 | Title | 2.721:1 | 3:1 | 2/1592 |
| es-dark-1440 | Description | 3.476:1 | 4.5:1 | 17/246 |
