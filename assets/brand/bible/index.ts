/**
 * The Bible — per-category diagram assets.
 *
 * Each of the 12 treatment categories (see `TreatmentCategoryId` in
 * `src/domain/recommendation.ts`) has exactly one pairing here:
 *
 * - `preview` — a distilled, mobile-first editorial hero derived from the
 *   category's book diagram. This is what renders collapsed, in the
 *   normal hero slot on Bible detail and Quiz Result. Built for "understand
 *   the mechanism in about one second," not full page fidelity.
 * - `full` — the original educational diagram (the actual book page,
 *   resized/re-encoded for the app bundle but otherwise unaltered — see
 *   `AESTELLA_IMAGE_SHOT_LIST.md` / the image-integration project docs for
 *   the crop rationale on each preview) — this is what opens in the
 *   full-screen zoom viewer when a diagram is tapped. It is deliberately a
 *   *different* asset from `preview`, not an upscale of it: the preview
 *   trades detail for instant clarity, the full diagram trades instant
 *   clarity for completeness.
 *
 * `bibleCategoryAspectRatios` gives each preview's true width/height ratio
 * so its container can size to the image exactly (no crop, no
 * letterboxing) — see EditorialImage's `fit`/`aspectRatio` props. All 12
 * previews are landscape editorial heroes (either 4:3 or 3:2), which does
 * not match the `treatment` variant's default 2:3 portrait container, so
 * every category needs an override here (not just the odd ones out).
 *
 * No source diagram files are touched by anything in this module — these
 * are derivative copies only, optimized for the app bundle via a one-off
 * resize/re-encode from the original book page scans.
 */

import type { TreatmentCategoryId } from '../../../src/domain/recommendation';

export type BibleCategoryImages = {
  /** Distilled mobile-first hero — shown collapsed. Metro resolves a
   * `require('./x.jpg')` to a numeric module id (see types/assets.d.ts). */
  preview: number;
  /** Original educational diagram (the book page) — shown in the zoom viewer. */
  full: number;
};

export const bibleCategoryImages: Record<TreatmentCategoryId, BibleCategoryImages> = {
  tox: {
    preview: require('./bible-hero-tox-preview.jpg'),
    full: require('./bible-full-tox.jpg'),
  },
  fillers: {
    preview: require('./bible-hero-fillers-preview.jpg'),
    full: require('./bible-full-fillers.jpg'),
  },
  skin_boosters: {
    preview: require('./bible-hero-skinboosters-preview.jpg'),
    full: require('./bible-full-skinboosters.jpg'),
  },
  biostimulators: {
    preview: require('./bible-hero-biostimulators-preview.jpg'),
    full: require('./bible-full-biostimulators.jpg'),
  },
  lasers: {
    preview: require('./bible-hero-lasers-preview.jpg'),
    full: require('./bible-full-lasers.jpg'),
  },
  rf: {
    preview: require('./bible-hero-rf-preview.jpg'),
    full: require('./bible-full-rf.jpg'),
  },
  ultrasound: {
    preview: require('./bible-hero-ultrasound-preview.jpg'),
    full: require('./bible-full-ultrasound.jpg'),
  },
  microneedling: {
    preview: require('./bible-hero-microneedling-preview.jpg'),
    full: require('./bible-full-microneedling.jpg'),
  },
  peels: {
    preview: require('./bible-hero-peels-preview.jpg'),
    full: require('./bible-full-peels.jpg'),
  },
  threads: {
    preview: require('./bible-hero-threads-preview.jpg'),
    full: require('./bible-full-threads.jpg'),
  },
  skincare: {
    preview: require('./bible-hero-skincare-preview.jpg'),
    full: require('./bible-full-skincare.jpg'),
  },
  at_home_devices: {
    preview: require('./bible-hero-athome-preview.jpg'),
    full: require('./bible-full-athome.jpg'),
  },
};

/**
 * Native width/height ratio of each category's `preview` image, so its
 * container can be sized to fit the asset exactly via
 * `<EditorialImage fit="contain" aspectRatio={...} />`. All landscape
 * (either 4:3 = 1.3333 or 3:2 = 1.5) — none match the `treatment`
 * variant's default 2:3 (0.6667) portrait container, so every category
 * needs an entry.
 */
export const bibleCategoryAspectRatios: Record<TreatmentCategoryId, number> = {
  tox: 4 / 3,
  fillers: 4 / 3,
  skin_boosters: 4 / 3,
  biostimulators: 3 / 2,
  lasers: 4 / 3,
  rf: 3 / 2,
  ultrasound: 3 / 2,
  microneedling: 4 / 3,
  peels: 3 / 2,
  threads: 4 / 3,
  skincare: 4 / 3,
  at_home_devices: 3 / 2,
};
