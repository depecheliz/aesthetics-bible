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
  homeHeroCrop: require('./home-hero-crop.jpg'),
  /** Preview tab hero — "see a possibility before making a decision." */
  previewHero: require('./preview-hero.jpg'),
  /** Preview tab hero, re-cropped to trim dead space at the bottom. */
  previewHeroCrop: require('./preview-hero-crop.jpg'),
  /** Glow / social — lifestyle imagery for polished social looks. */
  glowSocial: require('./glow-social.jpg'),
  /** Treatment / Bible editorial — used for Result and Bible detail heroes. */
  treatmentEditorial: require('./treatment-editorial.jpg'),
  /** Treatment / Bible editorial, re-cropped to keep the subject band. */
  treatmentEditorialCrop: require('./treatment-editorial-crop.jpg'),
  /** Skin / detail — macro-style crop for education and marketing moments. */
  skinDetail: require('./skin-detail.jpg'),
  /** Skin / detail, re-cropped to the brightest/subject band. */
  skinDetailCrop: require('./skin-detail-crop.jpg'),
  /** Pre-composed Preview before/after visualization (labels baked in). */
  previewVisualization: require('./preview-visualization.jpg'),
  /** Botox Bestie header portrait. */
  botoxBestie: require('./botox-bestie.jpg'),
  /** Botox Bestie header portrait, re-cropped to trim the dead lower half. */
  botoxBestieCrop: require('./botox-bestie-crop.jpg'),
  /** Bonus asset — Paywall story / secondary portrait moments. */
  paywallStory: require('./paywall-story.jpg'),
} as const;
