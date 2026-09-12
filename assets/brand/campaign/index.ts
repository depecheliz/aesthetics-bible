/**
 * Approved first-pass campaign photography for The Aesthetics Bible.
 *
 * Optimized (resized + re-encoded to JPEG) from the originals via
 * scripts/optimize-campaign-images.js. Referenced by role, not by variant,
 * so EditorialImage can assign the right photo to the right meaning
 * regardless of which aspect-ratio variant renders it.
 *
 * Original uncropped files (home-hero.jpg, preview-hero.jpg,
 * treatment-editorial.jpg, botox-bestie.jpg) are kept on disk as sources
 * for the crop scripts but are not exported — no screen references them.
 */

export const campaignImages = {
  /**
   * Home hero, re-cropped so the subject fills the frame instead of
   * ~40% dead black space at the bottom. See
   * scripts/recrop-campaign-images.py for the crop rationale.
   */
  homeHeroCrop: require('./home-hero-crop.jpg'),
  /** Preview tab hero, re-cropped to trim dead space at the bottom. */
  previewHeroCrop: require('./preview-hero-crop.jpg'),
  /** Glow / social — lifestyle imagery for polished social looks. */
  glowSocial: require('./glow-social.jpg'),
  /** Treatment / Bible editorial, re-cropped to keep the subject band. */
  treatmentEditorialCrop: require('./treatment-editorial-crop.jpg'),
  /** Skin / detail — macro-style crop for education and marketing moments. */
  skinDetail: require('./skin-detail.jpg'),
  /**
   * Skin / detail, re-cropped to the brightest/subject band at retina
   * resolution (800x800). See scripts/remediate-assets.py.
   */
  skinDetailCrop: require('./skin-detail-crop.jpg'),
  /** Pre-composed Preview before/after visualization (labels baked in). */
  previewVisualization: require('./preview-visualization.jpg'),
  /**
   * Botox Bestie header portrait, re-cropped to trim the dead lower half
   * at retina resolution (427x923). See scripts/remediate-assets.py.
   */
  botoxBestieCrop: require('./botox-bestie-crop.jpg'),
  /** Paywall hero — editorial portrait. */
  paywallStory: require('./paywall-story.jpg'),
} as const;
