#!/usr/bin/env python3
"""
Aestella P0 Asset Remediation — run once during the polish sprint.

Changes made:
1. Re-crops skin-detail-crop.jpg and botox-bestie-crop.jpg at proper retina
   resolution. The previous recrop-campaign-images.py script applied RESIZE_JOBS
   that targeted ~2x the CSS display size (for the web/RNW preview). Native iOS
   and Android render at 3x DPR, so those crops were sub-1x quality on device.
   This pass saves the same crop box at its full source resolution.

2. Creates bible-full-{cat}-mobile.jpg files by detecting and cropping white/
   near-white page margins from each book-page scan. The originals are preserved;
   the mobile derivatives are new files. assets/brand/bible/index.ts points to
   the mobile derivatives for the ZoomableImageModal source.
"""
from PIL import Image
import os

ASSET_ROOT = os.path.join(os.path.dirname(__file__), "..", "assets", "brand")
CAMPAIGN_DIR = os.path.join(ASSET_ROOT, "campaign")
BIBLE_DIR = os.path.join(ASSET_ROOT, "bible")


# ── Fix 1: Full-resolution crops for retina devices ──────────────────────────
# Same crop boxes as recrop-campaign-images.py (which derived them from a
# per-image brightness scan to keep the subject band). The only change here
# is that the RESIZE_JOBS downsize is not applied — we want the full crop.
RETINA_CROP_JOBS = [
    {
        "src": os.path.join(CAMPAIGN_DIR, "skin-detail.jpg"),
        "out": os.path.join(CAMPAIGN_DIR, "skin-detail-crop.jpg"),
        # 853x1844 source. Box: (26,276,826,1076) = 800x800 square.
        # Displayed at 96pt; 3x DPR needs 288px min. 800px gives ~2.8x — good.
        "box": (26, 276, 826, 1076),
    },
    {
        "src": os.path.join(CAMPAIGN_DIR, "botox-bestie.jpg"),
        "out": os.path.join(CAMPAIGN_DIR, "botox-bestie-crop.jpg"),
        # 853x1844 source. Box: (213,250,640,1173) = 427x923.
        # Displayed at 88pt wide; 3x DPR needs 264px min. 427px gives ~1.6x.
        "box": (213, 250, 640, 1173),
    },
]

# ── Fix 2: Bible full-diagram margin crop ────────────────────────────────────
BIBLE_CATEGORIES = [
    "tox", "fillers", "skinboosters", "biostimulators", "lasers", "rf",
    "ultrasound", "microneedling", "peels", "threads", "skincare", "athome",
]

# Grayscale brightness below which a pixel is considered "content"
# (vs. white/near-white page background). JPEG compression adds ~5-10 noise
# to pure white, so we use 235 rather than 255 to avoid treating compressed
# white as content while still catching lightly-coloured diagram elements.
CONTENT_THRESHOLD = 235
MARGIN_PADDING = 24  # pixels of breathing room kept around detected content


def find_content_bbox(img: Image.Image) -> tuple | None:
    """
    Returns (left, top, right, bottom) bounding box of non-background content,
    with MARGIN_PADDING added. Returns None if the image appears fully white.
    """
    gray = img.convert("L")
    mask = gray.point(lambda p: 255 if p < CONTENT_THRESHOLD else 0, mode="L")
    bbox = mask.getbbox()
    if bbox is None:
        return None
    left, top, right, bottom = bbox
    w, h = img.size
    return (
        max(0, left - MARGIN_PADDING),
        max(0, top - MARGIN_PADDING),
        min(w, right + MARGIN_PADDING),
        min(h, bottom + MARGIN_PADDING),
    )


def main():
    flags: list[str] = []

    # ── Fix 1 ──
    print("=== Re-cropping campaign images at retina resolution ===")
    for job in RETINA_CROP_JOBS:
        im = Image.open(job["src"])
        orig = im.size
        cropped = im.crop(job["box"])
        new_size = cropped.size
        cropped.save(job["out"], "JPEG", quality=88, optimize=True)
        kb = os.path.getsize(job["out"]) // 1024
        name = os.path.basename(job["out"])
        print(f"  {name}: {orig} → {new_size}  {kb} KB")

    # ── Fix 2 ──
    print("\n=== Cropping white margins from bible full diagrams ===")
    for cat in BIBLE_CATEGORIES:
        src_path = os.path.join(BIBLE_DIR, f"bible-full-{cat}.jpg")
        out_path = os.path.join(BIBLE_DIR, f"bible-full-{cat}-mobile.jpg")
        im = Image.open(src_path)
        orig = im.size

        bbox = find_content_bbox(im)
        if bbox is None:
            msg = f"  FLAG {cat}: no content detected (image may be fully white)"
            flags.append(msg)
            print(msg)
            continue

        l, t, r, b = bbox
        content_w, content_h = r - l, b - t
        orig_area = orig[0] * orig[1]
        crop_area = content_w * content_h
        margin_pct = (1 - crop_area / orig_area) * 100

        cropped = im.crop(bbox)
        cropped.save(out_path, "JPEG", quality=90, optimize=True)
        kb = os.path.getsize(out_path) // 1024

        note = ""
        if margin_pct < 3:
            note = " ← FLAG: very little margin removed, inspect manually"
            flags.append(f"  {cat}: only {margin_pct:.1f}% margin removed")
        print(
            f"  {cat}: {orig} → {cropped.size}  "
            f"margins removed: {margin_pct:.1f}%  {kb} KB{note}"
        )

    if flags:
        print("\n=== Items needing human review ===")
        for f in flags:
            print(f)
    else:
        print("\nAll categories processed. No flags.")


if __name__ == "__main__":
    main()
