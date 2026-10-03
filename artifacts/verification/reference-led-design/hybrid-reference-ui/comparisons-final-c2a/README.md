# Native comparison artifacts

Eight side-by-side comparisons preserve full 390×844 screenshot pixels at native size. Seven are requested views; the expanded Sound player is a supplement. Annotation canvas is 852×1020. No screenshot resizing, repainting or image synthesis. Both complete image regions were compared pixel-for-pixel after saving.

Before source: `4c873b0df32c4489a8b95260122ae3ae9efd936d` (Oct 2 synthetic capture). After source: `c2a5e6497f1bed4cf95951375c9aa86872b169a9` (Oct 3 synthetic capture). Dates, date-dependent passages, entry previews, counters and scroll states can differ, so this is not an identical-fixture functional regression test.

**Today uses the new explicitly sealed toast-dismissed capture only.** Its 390×844 bytes happen to match the earlier sealed native Today capture; the new receipt verifies normal dismissal. Original screenshots remain unchanged.

| View | Comparison |
|---|---|
| sound-discovery | [sound-discovery](sound-discovery-before-after.png) |
| sound-detail-player | [sound-detail-player](sound-detail-player-before-after.png) |
| coach | [coach](coach-before-after.png) |
| today | [today](today-before-after.png) |
| notebook | [notebook](notebook-before-after.png) |
| focus | [focus](focus-before-after.png) |
| course-overview | [course-overview](course-overview-before-after.png) |
| sound-expanded-player (supplement) | [sound-expanded-player](sound-expanded-player-before-after.png) |

Exact input/composite bytes, SHA256 values, source bindings, pixel-region equality and capture limits are in `comparison-file-manifest.json`. Byte-identical input copies are retained under `input-snapshot/` for portable review. No repository source edits, build, browser, deployment or parent/user approval.
