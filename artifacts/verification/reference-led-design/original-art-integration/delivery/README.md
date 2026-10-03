# Original ODA scene delivery

This delivery derives six original ODA images from the parent-approved uploaded archive (**14,521,867 bytes**, SHA256 `4e4c037409ef7a17b13c4ff145272a1cd468f31295c4015d5ea29f1e0884462e`). The raw six PNG masters and source manifest remain byte-identical in scratch. Runtime delivery contains only responsive variants and bounded fallbacks; it contains no master PNGs or ZIP.

New application files are limited to `public/assets/oda/original-scenes/` (**40 image files**) and `src/data/originalSceneAssets.ts` (**one metadata file**). Existing source, artwork, workflows and service worker files were not edited by this delivery worker. No package installation, network/provider action, image generation, semantic image edit, crop or application build was performed.

Five opaque scenes use proportionally resized WebP with **quality86, method6**, widths160/320/480/640/960/1280 capped at the master width (the portrait sculpture stops at1024). Coach uses **lossless RGBA WebP**, widths160/320/480/640. Every decoded Coach WebP preserves all resized RGBA pixels and alpha exactly. All scenes have a **640px lossless PNG fallback**; decoded fallback pixels match the resized source exactly. LANCZOS resizing rounds height to integral pixels; no image is upscaled or cropped. Source focal placement is left to consumer CSS.

| Scene | WebP widths | 640px WebP bytes | PNG fallback bytes |
| --- | --- | ---: | ---: |
| dunes | 160, 320, 480, 640, 960, 1280 | 27,690 | 340,027 |
| palms | 160, 320, 480, 640, 960, 1280 | 66,608 | 492,324 |
| foam | 160, 320, 480, 640, 960, 1280 | 85,884 | 543,080 |
| sound-sculpture | 160, 320, 480, 640, 960, 1024 | 97,178 | 843,453 |
| coach-orb | 160, 320, 480, 640 | 376,140 | 500,550 |
| today-scene | 160, 320, 480, 640, 960, 1280 | 72,072 | 485,885 |

Total delivery inventory: **6,419,005 bytes** (34 WebPs:3,213,686; six PNG fallbacks:3,205,319). The three640px Sound discovery WebPs total **180,182 bytes**. Largest WebP is376,140 bytes (Coach640); largest fallback is843,453 bytes (portrait sculpture640×960). These are file inventory/budget measurements, not a first-load network measurement. The consumer must request the currently selected responsive source, use PNG only as fallback, and avoid downloading or precaching the full inventory on first load. Root owns the consumer helper and integration/network checks.

The generated TypeScript exports `ORIGINAL_SCENE_ASSETS as const`, keyed `dunes`, `palms`, `foam`, `sound-sculpture`, `coach-orb`, `today-scene`, and `OriginalSceneId`. Each `src` is a fallback PNG path relative to `BASE_URL`; width/height are the actual fallback intrinsic dimensions. Each sources row contains its relative WebP path and actual width. All six mappings resolve and decode, all40 runtime paths are referenced, and no unexpected/orphan runtime files exist.

[Delivery receipt](delivery-report.json) records every original/variant byte count, SHA256, dimensions, codec parameters, decode result and alpha integrity. Photo PSNR is measured against the resized master; it is a compression metric, not visual/fidelity acceptance. [Integrity receipt](metadata-and-integrity-receipt.json) verifies metadata mappings, unchanged masters and runtime hashes. Actual pixels from all six640px WebPs and all six PNG fallbacks were inspected in diagnostic contact sheets. Parent independent browser QA and visual review remain the publication checkpoint.

The generator is preserved at `../generate-original-scene-delivery.py`; it performs resizing/compression only and refuses to overwrite an existing runtime folder or metadata file. All writer and reader processes are closed after handoff; no build was run while other writers were active.
