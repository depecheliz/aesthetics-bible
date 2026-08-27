// Provider adapters for the Stage 1 benchmark. Verified against public
// Replicate documentation/pricing pages on 2026-08-27 — NOT taken from the
// earlier research report's numbers, several of which were stale (notably
// InstantID's true cost and the fact that a newer "nano-banana-2" model now
// supersedes the "nano-banana" model that report named).
//
// Each adapter's `buildInput()` places the SAME instruction string (from
// transformations.js) into that provider's own required field — it never
// changes the wording, only the JSON shape, per the benchmark rules.
//
// Schema fields marked "unverified via live call" were confirmed from
// Replicate's public docs/blog examples but not yet exercised against the
// live API (no token was available during this research pass). The
// harness logs the raw request/response shape (minus the token) on the
// first call per provider so any mismatch is immediately visible and
// fixable before the full 108-run batch proceeds.

const providers = [
  {
    id: 'nano_banana_2',
    label: 'Nano Banana 2 (Gemini 3.1 Flash Image)',
    replicateModel: 'google/nano-banana-2',
    // Google's own direct API charges $0.08/image at 1K resolution;
    // Replicate typically prices hosted proprietary models at/near vendor
    // cost. Treated as an estimate — the harness captures Replicate's
    // actual predict_time/billing fields per call when present.
    estimatedCostPerImage: 0.08,
    buildInput(instruction, imageDataUri) {
      return {
        prompt: instruction,
        image_input: [imageDataUri],
        aspect_ratio: 'match_input_image',
        output_format: 'jpg',
      };
    },
  },
  {
    id: 'flux_kontext_pro',
    label: 'FLUX.1 Kontext [pro]',
    replicateModel: 'black-forest-labs/flux-kontext-pro',
    // Confirmed on Replicate's own pricing page: "$0.04 / output image" —
    // this one is a flat, confirmed rate, not an estimate.
    estimatedCostPerImage: 0.04,
    buildInput(instruction, imageDataUri) {
      return {
        prompt: instruction,
        input_image: imageDataUri,
      };
    },
  },
  {
    id: 'instant_id_photorealistic',
    label: 'InstantID (photorealistic, grandlineai)',
    replicateModel: 'grandlineai/instant-id-photorealistic',
    // Billed as L40S GPU-seconds ($0.000975/sec), not a flat fee. The
    // model page states "~$0.017 to run" at ~18s typical runtime — the
    // harness computes the real figure per call from predict_time when
    // Replicate returns it, and falls back to this estimate otherwise.
    estimatedCostPerImage: 0.017,
    l40sPerSecond: 0.000975,
    buildInput(instruction, imageDataUri) {
      return {
        image: imageDataUri,
        prompt: instruction,
        negative_prompt: 'lowres, bad anatomy, extra fingers, blurry, cartoon, illustration, deformed',
      };
    },
  },
];

function computeActualCost(provider, prediction) {
  const predictTime = prediction?.metrics?.predict_time;
  if (provider.l40sPerSecond && typeof predictTime === 'number') {
    return { value: provider.l40sPerSecond * predictTime, source: 'computed_from_predict_time' };
  }
  return { value: provider.estimatedCostPerImage, source: 'estimate' };
}

module.exports = { providers, computeActualCost };
