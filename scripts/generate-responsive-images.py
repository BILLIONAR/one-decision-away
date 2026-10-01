#!/usr/bin/env python3
"""Build delivery-only lossless WebP variants; never rewrite approved sources.

Run from any directory: python3 scripts/generate-responsive-images.py
Requires the existing Pillow + numpy image toolchain (no project dependency changes).
Full frames are resized with Lanczos; there is no crop, recoloring, or alpha flattening.
The manifest has no timestamp and records decoder pixel checks and source hashes.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image, features
import PIL

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ODA = PUBLIC / "assets/oda"
OUT = ODA / "delivery"
WIDTHS = {"course-covers": (320, 400, 640, 800, 960, 1280, 1672), "trees": (320, 480, 640, 960, 1254)}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def bounds(alpha: np.ndarray) -> list[int] | None:
    ys, xs = np.nonzero(alpha > 128)
    return [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1] if len(xs) else None


def generate() -> dict:
    if not features.check("webp"):
        raise RuntimeError("The existing Pillow toolchain must include the WebP codec.")
    sources = []
    immutable = {}
    for group in WIDTHS:
        source_manifest = ODA / group / "manifest.json"
        immutable[str(source_manifest.relative_to(PUBLIC))] = digest(source_manifest)
        for asset in json.loads(source_manifest.read_text())["assets"]:
            filename = asset.get("filename", asset.get("file"))
            path = ODA / group / filename
            actual_hash = digest(path)
            if actual_hash != asset["sha256"]:
                raise RuntimeError(f"Approved source hash mismatch: {path}")
            immutable[str(path.relative_to(PUBLIC))] = actual_hash
            sources.append((group, path, asset))

    manifest = {
        "schemaVersion": 1,
        "reproduce": "python3 scripts/generate-responsive-images.py",
        "codec": {"format": "WebP", "lossless": True, "quality": 100, "method": 6, "exactTransparentRGB": True,
                  "pillow": PIL.__version__, "libwebp": features.version("webp")},
        "resize": {"filter": "Pillow Lanczos", "geometry": "complete source frame, proportional rounded height; never upscale",
                   "color": "source RGB/RGBA mode; no palette, crop, or color adjustment", "alpha": "RGBA alpha retained; never flattened"},
        "immutableSources": immutable,
        "assets": {},
    }
    for group, path, asset in sources:
        image = Image.open(path)
        image.load()
        width, height = image.size
        item = {"width": width, "height": height, "mode": image.mode, "bytes": path.stat().st_size,
                "sha256": digest(path), "variants": []}
        for target_width in WIDTHS[group]:
            if target_width > width:
                continue
            target_height = round(height * target_width / width)
            reference = image.copy() if target_width == width else image.resize((target_width, target_height), Image.Resampling.LANCZOS)
            target = OUT / group / f"{path.stem}-{target_width}.webp"
            target.parent.mkdir(parents=True, exist_ok=True)
            reference.save(target, format="WEBP", lossless=True, quality=100, method=6, exact=True)
            decoded = Image.open(target).convert("RGBA")
            expected = np.asarray(reference.convert("RGBA"), dtype=np.int16)
            actual = np.asarray(decoded, dtype=np.int16)
            error = np.abs(actual - expected)
            maximum_error = int(error.max())
            if maximum_error != 0:
                raise RuntimeError(f"Lossless RGBA pixel verification failed for {target}: max error {maximum_error}")
            alpha = actual[:, :, 3]
            bbox = bounds(alpha)
            variant = {
                "src": str(target.relative_to(PUBLIC)), "width": target_width, "height": target_height,
                "bytes": target.stat().st_size, "sha256": digest(target),
                "referencePixelErrorMaxRGBA": maximum_error, "referencePixelErrorMeanRGBA": float(error.mean()),
                "referencePSNR": "infinity (identical decoded RGBA to resize reference)",
                "referenceAlphaErrorMax": int(error[:, :, 3].max()), "visibleBBoxAlphaAbove128": bbox,
                "alphaExtrema": [int(alpha.min()), int(alpha.max())],
                "fullyTransparentPixels": int((alpha == 0).sum()), "partiallyTransparentPixels": int(((alpha > 0) & (alpha < 255)).sum()),
                "fullFrame": True,
            }
            if group == "trees" and bbox:
                origin_y = asset["transformOriginPercent"][1]
                raw_baseline = (bbox[3] - 1) / target_height * 100
                normalized_baseline = origin_y + asset["displayOffsetYPercent"] + (raw_baseline - origin_y) * asset["displayScale"]
                variant["normalizedRootBaselinePercent"] = round(normalized_baseline, 6)
                variant["rootBaselineDeviationCSSPixelsAt240"] = round(abs(normalized_baseline - 88) / 100 * 240, 6)
            item["variants"].append(variant)
        manifest["assets"][str(path.relative_to(PUBLIC))] = item
        print(f"{path.name}: {len(item['variants'])} exact-decoding WebP variants", flush=True)

    for src, expected_hash in immutable.items():
        if digest(PUBLIC / src) != expected_hash:
            raise RuntimeError(f"Approved source changed while generating: {src}")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    # Keep runtime selection small; quality evidence stays in the delivery manifest.
    runtime = {src: [{k: variant[k] for k in ("src", "width", "height")} for variant in item["variants"]]
               for src, item in manifest["assets"].items()}
    (ROOT / "src/data/imageDeliveryAssets.ts").write_text(
        "/** Generated by scripts/generate-responsive-images.py; approved originals are retained. */\n"
        + "export const IMAGE_DELIVERY_ASSETS = " + json.dumps(runtime, indent=2) + " as const;\n")
    print(f"Verified {len(sources)} approved PNGs and both original manifests unchanged.", flush=True)
    return manifest


if __name__ == "__main__":
    generate()
