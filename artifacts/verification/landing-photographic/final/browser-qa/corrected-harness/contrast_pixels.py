#!/usr/bin/env python3
"""Read-only sampled text contrast analysis of paired browser PNG captures.

Usage: python contrast_pixels.py metadata.json output.json

Input is an object with a ``regions`` array. Each region contains ``name``,
``cleanPng``, ``backgroundPng``, ``dpr``, and ``runs``. Each run contains
``selector``, ``text``, ``color`` ([R, G, B, A]), ``opacity``, ``fontSize``,
``fontWeight``, and ``rects`` ([{x, y, width, height}]). Rects are CSS-pixel
coordinates relative to the PNG origin. PNG paths resolve relative to the
metadata file. The supplied DPR must describe the PNG's actual pixel scale.

The clean capture is the normal browser rendering. The background capture is
the same rendering with HTML text color transparent and all background paint
and geometry preserved. This program never renders or changes image pixels.
It only reads the captures and writes a JSON measurement report.

The conservative sample covers every pixel in each rect's enclosing integer
pixel box. The changed-pixel sample is its subset where any RGB channel differs
by more than 4 between the actual captures. Neither sample is a font-outline
reconstruction. A rect may be a caller-supplied glyph box or a larger text box.
Contrast uses the CSS foreground analytically composited over the *actual*
background pixel with alpha = color alpha * opacity; screenshot foreground
antialiasing is not treated as the intended foreground color.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import sys
from pathlib import Path
from typing import Any

from PIL import Image


DELTA_CUTOFF = 4
LARGE_REGULAR_PX = 24.0
LARGE_BOLD_PX = 18.667
LARGE_BOLD_WEIGHT = 700.0


def srgb_linear(channel: float) -> float:
    """Convert an sRGB channel on the 0..255 scale to linear light."""
    value = channel / 255.0
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


LINEAR_BYTE = tuple(srgb_linear(value) for value in range(256))


def luminance(rgb: tuple[float, float, float]) -> float:
    return sum(weight * srgb_linear(value) for weight, value in zip((0.2126, 0.7152, 0.0722), rgb))


def integer_luminance(rgb: tuple[int, int, int]) -> float:
    return 0.2126 * LINEAR_BYTE[rgb[0]] + 0.7152 * LINEAR_BYTE[rgb[1]] + 0.0722 * LINEAR_BYTE[rgb[2]]


def number(value: Any, label: str, *, minimum: float | None = None, maximum: float | None = None) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{label} must be a finite number")
    try:
        parsed = float(value)
    except OverflowError as exc:
        raise ValueError(f"{label} must be a finite number") from exc
    if not math.isfinite(parsed):
        raise ValueError(f"{label} must be a finite number")
    if minimum is not None and parsed < minimum:
        raise ValueError(f"{label} must be at least {minimum}")
    if maximum is not None and parsed > maximum:
        raise ValueError(f"{label} must be at most {maximum}")
    return parsed


def font_size(value: Any) -> float:
    if isinstance(value, str):
        value = value.strip()
        if value.endswith("px"):
            value = value[:-2]
        try:
            value = float(value)
        except ValueError as exc:
            raise ValueError("fontSize must be a positive CSS-pixel number") from exc
    parsed = number(value, "fontSize", minimum=0)
    if parsed == 0:
        raise ValueError("fontSize must be positive")
    return parsed


def font_weight(value: Any) -> float:
    if isinstance(value, str):
        value = value.strip().lower()
        if value in ("normal", "bold"):
            value = 400 if value == "normal" else 700
        else:
            try:
                value = float(value)
            except ValueError as exc:
                raise ValueError("fontWeight must be a resolved numeric weight, normal, or bold") from exc
    return number(value, "fontWeight", minimum=1, maximum=1000)


def add_issue(report: dict[str, Any], destination: dict[str, Any], code: str, message: str,
              *, region_index: int | None = None, run_index: int | None = None,
              rect_index: int | None = None, warning: bool = False) -> None:
    issue: dict[str, Any] = {"code": code, "message": message}
    for key, value in (("region_index", region_index), ("run_index", run_index), ("rect_index", rect_index)):
        if value is not None:
            issue[key] = value
    kind = "warnings" if warning else "errors"
    report[kind].append(issue)
    if destination is not report:
        destination.setdefault(kind, []).append(issue)


def read_png(path_value: Any, metadata_dir: Path) -> tuple[dict[str, Any], Image.Image | None, str | None]:
    provenance: dict[str, Any] = {"supplied_path": path_value if isinstance(path_value, str) else None}
    if not isinstance(path_value, str) or not path_value:
        return provenance, None, "PNG path must be a nonempty string"
    try:
        path = Path(path_value)
        if not path.is_absolute():
            path = metadata_dir / path
        path = path.resolve()
        provenance["path"] = str(path)
        payload = path.read_bytes()
    except (OSError, ValueError, RuntimeError) as exc:
        return provenance, None, f"Cannot read PNG: {exc}"
    provenance["sha256"] = hashlib.sha256(payload).hexdigest()
    provenance["byte_count"] = len(payload)
    try:
        with Image.open(io.BytesIO(payload)) as source:
            provenance.update({"format": source.format, "mode": source.mode, "width": source.width, "height": source.height})
            if source.format != "PNG":
                return provenance, None, "Input image is not a PNG"
            source.load()
            rgba = source.convert("RGBA")
            if rgba.getchannel("A").getextrema() != (255, 255):
                return provenance, None, "PNG has nonopaque pixels; the displayed background under transparency is unknown"
            # Opaque RGB conversion preserves the captured RGB values.
            return provenance, rgba.convert("RGB"), None
    except (OSError, ValueError, Image.DecompressionBombError) as exc:
        return provenance, None, f"Cannot decode PNG: {exc}"


def empty_report(metadata_path: Path) -> dict[str, Any]:
    return {
        "schema_version": "1.0",
        "analysis_status": "pending",
        "pass": False,
        "pass_basis": "Only acceptance of supplied actual changed-glyph pixel samples: nonempty runs, no errors or clipping warnings, and all actual sampled minima at or above the applicable threshold. Conservative box minima are reported separately. This is not a final QA claim.",
        "candidate_status": "draft",
        "final_qa_claim": False,
        "metadata": {"path": str(metadata_path)},
        "method": {
            "background_source": "Actual pixels from the paired browser capture with text color transparent",
            "conservative_sample": "All pixels in the enclosing integer box of each caller-supplied glyph/text rect; deduplicated within each run",
            "changed_glyph_sample": "Pixels within the rects where max(abs(clean.R-background.R), abs(clean.G-background.G), abs(clean.B-background.B)) > 4",
            "changed_pixel_rgb_delta_cutoff": DELTA_CUTOFF,
            "foreground": "Analytical sRGB channel compositing of CSS color over each actual background pixel; effective alpha = color alpha * opacity",
            "luminance": "WCAG sRGB transfer function, coefficients 0.2126/0.7152/0.0722; ratio = (lighter + 0.05)/(darker + 0.05)",
            "thresholds": {
                "ordinary_text_ratio": 4.5,
                "large_text_ratio": 3.0,
                "large_regular_minimum_css_px": LARGE_REGULAR_PX,
                "large_bold_minimum_css_px": LARGE_BOLD_PX,
                "large_bold_minimum_weight": LARGE_BOLD_WEIGHT,
            },
            "pixel_box_rounding": "floor(x*dpr), floor(y*dpr), ceil((x+width)*dpr), ceil((y+height)*dpr), clipped to capture bounds",
            "minimum_comparison": "Full precision ratio; no rounding before threshold comparison",
            "pixel_location": "PNG pixel indices and CSS pixel-center coordinates relative to region PNG origin",
            "counting": "Run totals are unique within a run; report totals sum run counts and may duplicate pixels across distinct runs",
        },
        "limitations": [
            "Draft-candidate sampled evidence only; no final QA or general accessibility compliance claim.",
            "A delta mask is an observed capture difference, not an exact glyph outline. It includes antialiasing and can include shadows, strokes, overlapping text, other paint, or capture drift.",
            "The delta cutoff can omit low-contrast glyph pixels. A missing run-level mask is an explicit error, never a passing result. Individual empty rect masks are reported separately because rects can include whitespace.",
            "Conservative boxes include nonglyph pixels and their enclosing fractional-edge pixels; their minimum can be lower than contrast at painted glyph pixels.",
            "Both minima use intended CSS foreground composited over observed background pixels; actual antialiased foreground pixel contrast is not used as a WCAG text-color measurement.",
            "Capture alignment, unchanged layout/scroll/content/fonts/animations, rect accuracy, DPR, run identity, and style metadata must be ensured by the capture producer; this analyzer cannot prove those conditions.",
            "Opacity is assumed to be text paint opacity suitable for this compositing model. Ancestor group opacity with its own background can require layer modeling and is not supported by simply multiplying opacities.",
            "Gradient text, blend modes, filters, complex compositing, and text-decoration effects are not modeled. Input must resolve the visible text color and applicable opacity.",
            "The report applies only to provided PNG regions, text runs, and captured states. It does not cover other viewports, interactions, text missing from metadata, nontext contrast, human listening, or broad quality review.",
        ],
        "regions": [],
        "errors": [],
        "warnings": [],
    }


def minimum(previous: dict[str, Any] | None, current: dict[str, Any]) -> dict[str, Any]:
    if previous is None or (current["contrast_ratio"], current["location"]["png_y"], current["location"]["png_x"]) < (
        previous["contrast_ratio"], previous["location"]["png_y"], previous["location"]["png_x"]
    ):
        return current
    return previous


def analyze_run(raw: Any, clean: Image.Image, background: Image.Image, dpr: float,
                report: dict[str, Any], region_index: int, run_index: int) -> dict[str, Any]:
    result: dict[str, Any] = {
        "index": run_index,
        "status": "pending",
        "pass": False,
        "actualGlyphMinRatio": None,
        "conservativeBoxMinRatio": None,
        "threshold": None,
        "rectangles": [],
        "conservative_box_minimum": None,
        "actual_changed_glyph_pixel_minimum": None,
        "sampled_counts": {"provided_rectangles": 0, "analyzed_rectangles": 0, "box_unique_pixels": 0, "changed_glyph_unique_pixels": 0},
        "errors": [],
        "warnings": [],
    }
    context = {"region_index": region_index, "run_index": run_index}
    if not isinstance(raw, dict):
        add_issue(report, result, "invalid_run", "Run must be an object", **context)
        result["status"] = "inconclusive"
        return result
    result["selector"] = raw.get("selector")
    result["text"] = raw.get("text")
    try:
        if not isinstance(raw.get("selector"), str) or not raw["selector"]:
            raise ValueError("selector must be a nonempty string")
        if not isinstance(raw.get("text"), str):
            raise ValueError("text must be a string")
        rgba = raw.get("color")
        if not isinstance(rgba, list) or len(rgba) != 4:
            raise ValueError("color must be [R, G, B, A]")
        rgb = tuple(number(value, f"color[{index}]", minimum=0, maximum=255) for index, value in enumerate(rgba[:3]))
        color_alpha = number(rgba[3], "color[3]", minimum=0, maximum=1)
        opacity = number(raw.get("opacity"), "opacity", minimum=0, maximum=1)
        size = font_size(raw.get("fontSize"))
        weight = font_weight(raw.get("fontWeight"))
        rects = raw.get("rects")
        if not isinstance(rects, list) or not rects:
            raise ValueError("rects must be a nonempty array")
    except ValueError as exc:
        add_issue(report, result, "invalid_run_metadata", str(exc), **context)
        result["status"] = "inconclusive"
        return result

    alpha = color_alpha * opacity
    is_large = size >= LARGE_REGULAR_PX or (size >= LARGE_BOLD_PX and weight >= LARGE_BOLD_WEIGHT)
    threshold = 3.0 if is_large else 4.5
    result.update({
        "color_rgba": [*rgb, color_alpha], "opacity": opacity, "effective_foreground_alpha": alpha,
        "font_size_css_px": size, "font_weight": weight, "large_text": is_large, "contrast_threshold": threshold,
        "threshold": threshold,
    })
    result["sampled_counts"]["provided_rectangles"] = len(rects)
    clean_pixels, background_pixels = clean.load(), background.load()
    opaque_foreground_luminance = luminance(rgb) if alpha == 1.0 else None
    seen: set[tuple[int, int]] = set()

    for rect_index, raw_rect in enumerate(rects):
        rect_result: dict[str, Any] = {
            "index": rect_index, "css_rect": raw_rect,
            "sampled_counts": {"box_pixels": 0, "changed_glyph_pixels": 0},
            "conservative_box_minimum": None, "actual_changed_glyph_pixel_minimum": None,
            "changed_glyph_mask_status": "pending", "errors": [], "warnings": [],
        }
        result["rectangles"].append(rect_result)
        try:
            if not isinstance(raw_rect, dict):
                raise ValueError("Rect must be an object")
            x = number(raw_rect.get("x"), "rect.x")
            y = number(raw_rect.get("y"), "rect.y")
            width = number(raw_rect.get("width"), "rect.width", minimum=0)
            height = number(raw_rect.get("height"), "rect.height", minimum=0)
            if width == 0 or height == 0:
                raise ValueError("Rect width and height must be positive")
            scaled = (x * dpr, y * dpr, (x + width) * dpr, (y + height) * dpr)
            if not all(math.isfinite(value) for value in scaled):
                raise ValueError("Rect bounds overflow at supplied DPR")
            requested = (math.floor(scaled[0]), math.floor(scaled[1]), math.ceil(scaled[2]), math.ceil(scaled[3]))
        except ValueError as exc:
            add_issue(report, result, "invalid_rect", str(exc), rect_index=rect_index, **context)
            rect_result["errors"].append(result["errors"][-1])
            rect_result["changed_glyph_mask_status"] = "unavailable"
            continue
        bounds = (max(0, min(background.width, requested[0])), max(0, min(background.height, requested[1])),
                  max(0, min(background.width, requested[2])), max(0, min(background.height, requested[3])))
        keys = ("left", "top", "right_exclusive", "bottom_exclusive")
        rect_result["requested_png_bounds"] = dict(zip(keys, requested))
        rect_result["sampled_png_bounds"] = dict(zip(keys, bounds))
        rect_result["was_clipped"] = requested != bounds
        if requested != bounds:
            add_issue(report, result, "rect_clipped_to_capture", "Some of this rect lies outside the PNG; minima cover only its captured pixels", rect_index=rect_index, warning=True, **context)
            rect_result["warnings"].append(result["warnings"][-1])
        left, top, right, bottom = bounds
        if left >= right or top >= bottom:
            add_issue(report, result, "empty_rect_sample", "Rect has no pixels inside the PNG", rect_index=rect_index, **context)
            rect_result["errors"].append(result["errors"][-1])
            rect_result["changed_glyph_mask_status"] = "unavailable"
            continue
        result["sampled_counts"]["analyzed_rectangles"] += 1
        for py in range(top, bottom):
            for px in range(left, right):
                bg = background_pixels[px, py]
                observed = clean_pixels[px, py]
                delta = max(abs(c - b) for c, b in zip(observed, bg))
                bg_luminance = integer_luminance(bg)
                composed = rgb if alpha == 1.0 else tuple(alpha * channel + (1.0 - alpha) * back for channel, back in zip(rgb, bg))
                fg_luminance = opaque_foreground_luminance if opaque_foreground_luminance is not None else luminance(composed)
                ratio = (max(fg_luminance, bg_luminance) + 0.05) / (min(fg_luminance, bg_luminance) + 0.05)
                sample = {
                    "contrast_ratio": ratio,
                    "contrast_threshold": threshold,
                    "meets_threshold_for_sample": ratio >= threshold,
                    "background_rgb": list(bg),
                    "composited_foreground_rgb": list(composed),
                    "observed_clean_rgb": list(observed),
                    "maximum_observed_rgb_channel_delta": delta,
                    "location": {"png_x": px, "png_y": py, "css_center_x": (px + 0.5) / dpr, "css_center_y": (py + 0.5) / dpr},
                    "source_rect_index": rect_index,
                }
                rect_result["sampled_counts"]["box_pixels"] += 1
                rect_result["conservative_box_minimum"] = minimum(rect_result["conservative_box_minimum"], sample)
                changed = delta > DELTA_CUTOFF
                if changed:
                    rect_result["sampled_counts"]["changed_glyph_pixels"] += 1
                    rect_result["actual_changed_glyph_pixel_minimum"] = minimum(rect_result["actual_changed_glyph_pixel_minimum"], sample)
                if (px, py) not in seen:
                    seen.add((px, py))
                    result["sampled_counts"]["box_unique_pixels"] += 1
                    result["conservative_box_minimum"] = minimum(result["conservative_box_minimum"], sample)
                    if changed:
                        result["sampled_counts"]["changed_glyph_unique_pixels"] += 1
                        result["actual_changed_glyph_pixel_minimum"] = minimum(result["actual_changed_glyph_pixel_minimum"], sample)
        rect_result["changed_glyph_mask_status"] = "present" if rect_result["sampled_counts"]["changed_glyph_pixels"] else "missing"

    if not result["sampled_counts"]["box_unique_pixels"]:
        add_issue(report, result, "missing_box_samples", "No background pixels were available within this run's supplied rects", **context)
    if not result["sampled_counts"]["changed_glyph_unique_pixels"]:
        add_issue(report, result, "missing_changed_glyph_mask", "No pixels within this run's rects have an RGB channel delta greater than 4; actual changed-glyph minimum is unavailable", **context)
    result["status"] = "inconclusive" if result["errors"] else "partial" if result["warnings"] else "measured"
    box_minimum = result["conservative_box_minimum"]
    glyph_minimum = result["actual_changed_glyph_pixel_minimum"]
    result["conservativeBoxMinRatio"] = box_minimum["contrast_ratio"] if box_minimum is not None else None
    result["actualGlyphMinRatio"] = glyph_minimum["contrast_ratio"] if glyph_minimum is not None else None
    result["pass"] = result["status"] == "measured" and glyph_minimum is not None and glyph_minimum["meets_threshold_for_sample"]
    return result


def analyze_region(raw: Any, metadata_dir: Path, report: dict[str, Any], index: int) -> dict[str, Any]:
    result: dict[str, Any] = {"index": index, "status": "pending", "pass": False, "runs": [], "errors": [], "warnings": []}
    if not isinstance(raw, dict):
        add_issue(report, result, "invalid_region", "Region must be an object", region_index=index)
        result["status"] = "inconclusive"
        return result
    result["name"] = raw.get("name")
    if not isinstance(raw.get("name"), str) or not raw["name"]:
        add_issue(report, result, "invalid_region_name", "Region name must be a nonempty string", region_index=index)
    try:
        dpr = number(raw.get("dpr"), "dpr", minimum=0)
        if dpr == 0:
            raise ValueError("dpr must be positive")
        result["dpr"] = dpr
    except ValueError as exc:
        dpr = None
        add_issue(report, result, "invalid_dpr", str(exc), region_index=index)
    clean_info, clean, clean_error = read_png(raw.get("cleanPng"), metadata_dir)
    background_info, background, background_error = read_png(raw.get("backgroundPng"), metadata_dir)
    result["clean_png"] = clean_info
    result["background_png"] = background_info
    for role, error in (("clean", clean_error), ("background", background_error)):
        if error:
            add_issue(report, result, f"invalid_{role}_png", error, region_index=index)
    if clean is not None and background is not None and clean.size != background.size:
        add_issue(report, result, "png_dimension_mismatch", f"Clean PNG is {clean.width}x{clean.height}; background PNG is {background.width}x{background.height}. Pixel pairing is unavailable.", region_index=index)
    if background is not None and dpr is not None and not all(math.isfinite(value / dpr) for value in background.size):
        add_issue(report, result, "invalid_dpr_coordinate_scale", "PNG dimensions divided by DPR do not produce finite CSS coordinates", region_index=index)
        dpr = None
    raw_runs = raw.get("runs")
    if not isinstance(raw_runs, list) or not raw_runs:
        add_issue(report, result, "missing_runs", "Region runs must be a nonempty array", region_index=index)
        raw_runs = []
    result["provided_run_count"] = len(raw_runs)
    ready = clean is not None and background is not None and clean.size == background.size and dpr is not None
    for run_index, raw_run in enumerate(raw_runs):
        if ready:
            result["runs"].append(analyze_run(raw_run, clean, background, dpr, report, index, run_index))
        else:
            skipped: dict[str, Any] = {
                "index": run_index,
                "selector": raw_run.get("selector") if isinstance(raw_run, dict) else None,
                "text": raw_run.get("text") if isinstance(raw_run, dict) else None,
                "status": "inconclusive",
                "pass": False,
                "actualGlyphMinRatio": None,
                "conservativeBoxMinRatio": None,
                "threshold": None,
                "conservative_box_minimum": None,
                "actual_changed_glyph_pixel_minimum": None,
                "sampled_counts": {"provided_rectangles": len(raw_run.get("rects", [])) if isinstance(raw_run, dict) and isinstance(raw_run.get("rects"), list) else 0, "analyzed_rectangles": 0, "box_unique_pixels": 0, "changed_glyph_unique_pixels": 0},
                "rectangles": [], "errors": [], "warnings": [],
            }
            add_issue(report, skipped, "pixel_pairing_unavailable", "Run could not be measured because region PNG pairing or DPR is invalid", region_index=index, run_index=run_index)
            result["runs"].append(skipped)
    if clean is not None:
        clean.close()
    if background is not None:
        background.close()
    result["status"] = "inconclusive" if result["errors"] or any(run["status"] == "inconclusive" for run in result["runs"]) else "partial" if result["warnings"] or any(run["status"] == "partial" for run in result["runs"]) else "measured"
    result["pass"] = result["status"] == "measured" and bool(result["runs"]) and all(run["pass"] for run in result["runs"])
    return result


def finalize(report: dict[str, Any]) -> None:
    runs = [run for region in report["regions"] for run in region["runs"]]
    report["summary"] = {
        "region_count": len(report["regions"]),
        "run_count": len(runs),
        "measured_run_count": sum(run["status"] == "measured" for run in runs),
        "partial_run_count": sum(run["status"] == "partial" for run in runs),
        "inconclusive_run_count": sum(run["status"] == "inconclusive" for run in runs),
        "box_sample_count_sum_over_runs": sum(run["sampled_counts"]["box_unique_pixels"] for run in runs),
        "changed_glyph_sample_count_sum_over_runs": sum(run["sampled_counts"]["changed_glyph_unique_pixels"] for run in runs),
        "sampled_box_threshold_failures": sum(run["conservative_box_minimum"] is not None and not run["conservative_box_minimum"]["meets_threshold_for_sample"] for run in runs),
        "sampled_changed_glyph_threshold_failures": sum(run["actual_changed_glyph_pixel_minimum"] is not None and not run["actual_changed_glyph_pixel_minimum"]["meets_threshold_for_sample"] for run in runs),
        "error_count": len(report["errors"]),
        "warning_count": len(report["warnings"]),
    }
    report["analysis_status"] = "completed_with_errors" if report["errors"] else "completed_with_warnings" if report["warnings"] else "completed"
    report["pass"] = bool(runs) and not report["errors"] and not report["warnings"] and all(run["pass"] for run in runs)


def same_source(first: Path, second: Path) -> bool:
    """Avoid source overwrite through direct paths, symlinks, or hard links."""
    try:
        if first.resolve() == second.resolve():
            return True
        return first.samefile(second)
    except (OSError, ValueError, RuntimeError):
        return False


def invalid_json_constant(value: str) -> None:
    raise ValueError(f"Nonfinite JSON constant is not allowed: {value}")


def finite_json_float(value: str) -> float:
    parsed = float(value)
    if not math.isfinite(parsed):
        raise ValueError(f"Nonfinite JSON number is not allowed: {value}")
    return parsed


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("metadata", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    metadata_path = args.metadata.resolve()
    output_path = args.output.resolve()
    if same_source(output_path, metadata_path):
        parser.error("output must not overwrite the input metadata")
    report = empty_report(metadata_path)
    try:
        payload = metadata_path.read_bytes()
        report["metadata"].update({"sha256": hashlib.sha256(payload).hexdigest(), "byte_count": len(payload)})
        metadata = json.loads(payload, parse_constant=invalid_json_constant, parse_float=finite_json_float)
    except (OSError, UnicodeError, ValueError) as exc:
        add_issue(report, report, "invalid_metadata_file", str(exc))
        metadata = None
    if metadata is not None:
        if not isinstance(metadata, dict) or not isinstance(metadata.get("regions"), list) or not metadata["regions"]:
            add_issue(report, report, "invalid_metadata_schema", "Metadata must be an object with a nonempty regions array")
        else:
            # Protect all source images from an accidentally chosen output path.
            for region in metadata["regions"]:
                if isinstance(region, dict):
                    for field in ("cleanPng", "backgroundPng"):
                        value = region.get(field)
                        if isinstance(value, str) and value:
                            image_path = Path(value)
                            if not image_path.is_absolute():
                                image_path = metadata_path.parent / image_path
                            if same_source(image_path, output_path):
                                parser.error("output must not overwrite an input PNG")
            for index, region in enumerate(metadata["regions"]):
                report["regions"].append(analyze_region(region, metadata_path.parent, report, index))
    elif not report["errors"]:
        add_issue(report, report, "invalid_metadata_schema", "Metadata must be an object with a nonempty regions array")
    finalize(report)
    try:
        output_path.write_text(json.dumps(report, indent=2, ensure_ascii=True, allow_nan=False) + "\n", encoding="utf-8")
    except (OSError, UnicodeError, ValueError) as exc:
        print(f"Cannot write report: {exc}", file=sys.stderr)
        return 2
    print(json.dumps({"output": str(output_path), "analysis_status": report["analysis_status"], "pass": report["pass"], "summary": report["summary"]}, allow_nan=False))
    return 2 if report["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
