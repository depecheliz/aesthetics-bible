/**
 * Approved first-pass campaign photography for The Aesthetics Bible.
 *
 * Optimized (resized + re-encoded to JPEG) from the originals via
 * scripts/optimize-campaign-images.js. Referenced by role, not by variant,
 * so EditorialImage can assign the right photo to the right meaning
 * regardless of which aspect-ratio variant renders it.
 */

export const campaignImages = {
  /** Home hero — the primary brand moment. */
  homeHero: require('./home-hero.jpg'),
  /**
   * Home hero, re-cropped (P0 polish sprint) so the subject fills the
   * frame instead of ~40% dead black space. See
   * scripts/recrop-campaign-images.py for the crop rationale.
   */
  homeHeroCrop: require('./homeHeroCrop.jpg'),
  /** Preview tab hero — "see a possibility before making a decision." */
  previewHero: require('./preview-hero.jpg'),
  /** Preview tab hero, re-cropped to trim dead space at the bottom. */
  previewHeroCrop: require('./previewHeroCrop.jpg'),
  /** Glow / social — lifestyle imagery for polished social looks. */
  glowSocial: require('./glow-social.jpg'),
  /** Treatment / Bible editorial — used for Result and Bible detail heroes. */
  treatmentEditorial: require('./treatment-editorial.jpg'),
  /** Treatment / Bible editorial, re-cropped to keep the subject band. */
  treatmentEditorialCrop: require('./treatment-editorial-crop.jpg'),
  /** Skin / detail — macro-style crop for education and marketing moments. */
  skinDetail: require('./skin-detail.jpg'),
  /** Skin / detail, re-cropped to the brightest/subject band. */
  skinDetailCrop: require('./skinDetailCrop.jpg'),
  /** Pre-composed Preview before/after visualization (labels baked in). */
  previewVisualization: require('./preview-visualization.jpg'),
  /** Botox Bestie header portrait. */
  botoxBestie: require('./botox-bestie.jpg'),
  /** Botox Bestie header portrait, re-cropped to trim the dead lower half. */
  botoxBestieCrop: require('./botox-bestie-crop.jpg'),
  /** Bonus asset — Paywall story / secondary portrait moments. */
  paywallStory: require('./paywall-story.jpg'),
  /**
   * Interactive Preview before/after demo — "before" layer. Registered
   * (same pose/framing/camera) with `previewDemoAfter` so the two can be
   * overlaid in a drag-to-compare slider. Use only as a BeforeAfterSlider
   * layer — never as a static hero image on its own.
   */
  previewDemoBefore: require('./preview-demo-before.png'),
  /** Interactive Preview before/after demo — "after" layer. See `previewDemoBefore`. */
  previewDemoAfter: require('./preview-demo-after.png'),
  /**
   * Pre-composed marketing/reference artwork for the before/after demo —
   * NOT registered with the before/after pair (different composition) and
   * NOT for use as a BeforeAfterSlider layer. Reserved for future
   * campaign/marketing placements only.
   */
  previewDemoComparison: require('./preview-demo-comparison.png'),
} as const;
