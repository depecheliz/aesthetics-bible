#!/usr/bin/env python3
"""
One-off re-crop pass on the existing campaign photography, run as part of
the P0 UI/UX polish sprint (see AESTELLA_SPRINT_REPORT.md).

Problem: several EditorialImage placements (Home hero, Preview hero, Botox
Bestie header, the shared 'treatment' and Home's 'skin-detail' defaults)
render most of their frame as dead black space, because the source photos
are moody, dramatically-lit portraits where the subject occupies roughly
the top 40-60% of the frame and the rest is near-black clothing/background.
React Native's Image `resizeMode="cover"` has no focal-point control, so
when the source image's own aspect ratio already matches its container
(several of these do, exactly), the *entire* image is shown at its own
composition — including that dead lower half.

Fix: re-crop each affected source JPEG to a tighter window that keeps the
subject's face/shoulders and drops most of the dark lower portion, while
preserving the exact aspect ratio EditorialImage's variant expects, so no
further runtime cropping/distortion occurs. This does not invent any new
image content — it only re-frames pixels that already exist in the
approved campaign photography.

Second finding while verifying this in the web preview (react-native-web
+ Metro): EditorialImage's <Image> renders at the *source file's native
pixel dimensions*, not the size of its styled container — RNW appears to
apply Metro's registered intrinsic width/height as inline CSS on the
absolutely-positioned <img>, which overrides the `top/left/right/bottom:
0` stretch StyleSheet.absoluteFill relies on to fill the parent. The
parent's `overflow: hidden` then just clips to whatever corner of the
oversized image happens to land inside it, anchored top-left — nothing
here does an actual proportional cover-scale in this environment. For a
container close in size to its image this goes unnoticed (Home/Preview
heroes, Bible detail: natural size only ~1.5–2.2x the rendered box, so
most of the intended crop still falls inside it); for a much smaller slot
fed a full-size source — Home's 96x96 Bible-teaser thumbnail with an
800x800 image (8.3x oversized), and Botox Bestie's 88pt-wide header with
a 427x923 image (4.85x oversized) — only a small top-left sliver was
visible (a wash of skin tone, or hair only), reproducing something close
to the original audit's "dead space" complaint for a different reason
than the lighting/composition issue this script otherwise fixes. Native
iOS/Android's real Image component is expected to honor resizeMode
properly regardless (this looks specific to RNW's web output), but
without a physical device to confirm, the safe fix applied here doesn't
depend on that: RESIZE_JOBS below downsamples those two crops to roughly
2–2.2x their actual display size — the same framing, just not needlessly
oversized — which fixes the web preview outright and is good practice
for a small fixed-size slot either way.

No new npm dependency: uses Pillow (already available in this
environment). Requires `pip install pillow` if run elsewhere.

Run: python3 scripts/recrop-campaign-images.py
"""
from PIL import Image
import os

SRC_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "brand", "campaign")

# Each job: source file, output file, crop box (left, top, right, bottom)
# in source pixel coordinates, chosen from a per-image vertical-brightness
# scan so the crop window keeps the brightest (subject) band.
JOBS = [
    {
        "src": "home-hero.jpg",
        "out": "home-hero-crop.jpg",
        # Original 900x1125 (4:5). Subject/face band is roughly rows
        # 0-55%; crop keeps that band and zooms slightly, preserving 4:5.
        "box": (171, 0, 729, 698),
    },
    {
        "src": "preview-hero.jpg",
        "out": "preview-hero-crop.jpg",
        # Original 900x1125 (4:5). This source is brighter throughout
        # (less of a "black space" problem) but the bottom ~18% is dark
        # and dead — trim it and re-letterbox to 4:5.
        "box": (81, 0, 819, 922),
    },
    {
        "src": "treatment-editorial.jpg",
        "out": "treatment-editorial-crop.jpg",
        # Original 900x1350 (2:3, the 'treatment' variant's ratio).
        # Subject band is roughly rows 8-62%.
        "box": (200, 100, 700, 850),
    },
    {
        "src": "botox-bestie.jpg",
        "out": "botox-bestie-crop.jpg",
        # Original 853x1844 (~0.4626, the explicit aspect ratio Botox
        # Bestie's header passes). First pass (rows 92-1014) put the eye at
        # the very bottom edge of this narrow container; shifted down
        # ~150px so the eye/cheek/lips sit centered in frame instead.
        "box": (213, 250, 640, 1173),
    },
    {
        "src": "skin-detail.jpg",
        "out": "skin-detail-crop.jpg",
        # Original 853x1844. Used at 1:1 on Home's Bible teaser module.
        # Subject/brightest band is roughly rows 15-58%.
        "box": (26, 276, 826, 1076),
    },
]


# Second pass: downsample two of the crops above that are rendered into a
# much smaller fixed-size slot than their cropped resolution (see the RNW
# finding above). Same framing as the crop step, just not oversized for
# where it's actually displayed. Target ~2–2.2x the slot's real CSS size.
RESIZE_JOBS = [
    {
        # Home's Bible-teaser thumbnail slot is 96x96 CSS px; 800x800 was
        # 8.3x that, so only the top-left ~12% (a wash of skin tone, no
        # legible face) was ever visible in the RNW web preview.
        "file": "skin-detail-crop.jpg",
        "size": (210, 210),
    },
    {
        # Botox Bestie's header slot is 88x190 CSS px; 427x923 was 4.85x
        # that, so only the top-left ~21% (hair only, no eye/face) was
        # ever visible in the RNW web preview.
        "file": "botox-bestie-crop.jpg",
        "size": (190, 411),
    },
]


def main():
    for job in JOBS:
        src_path = os.path.join(SRC_DIR, job["src"])
        out_path = os.path.join(SRC_DIR, job["out"])
        im = Image.open(src_path)
        cropped = im.crop(job["box"])
        w, h = cropped.size
        cropped.save(out_path, "JPEG", quality=88)
        print(f"{job['src']} {im.size} -> {job['out']} {cropped.size} (ratio {w / h:.4f})")

    for job in RESIZE_JOBS:
        path = os.path.join(SRC_DIR, job["file"])
        im = Image.open(path)
        resized = im.resize(job["size"], Image.LANCZOS)
        resized.save(path, "JPEG", quality=88)
        print(f"{job['file']} resized {im.size} -> {resized.size}")


if __name__ == "__main__":
    main()
