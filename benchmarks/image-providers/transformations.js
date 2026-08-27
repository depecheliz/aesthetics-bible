// The Stage 1 test set — 4 Preview looks (at Moderate intensity) + 2 Glow
// presets, per the approved benchmark plan. Every provider adapter receives
// exactly `instruction` verbatim; only the JSON field it's placed into
// differs per API (see providers.js). Do not vary this wording per
// provider — that would break the benchmark's core premise.

const PREVIEW_BASE =
  'Edit this photo as a subtle aesthetic visualization. Preserve the person\'s identity, ' +
  'facial structure, skin tone, pose, expression, framing, and background exactly as in the ' +
  'original photo. Preserve realistic skin texture — do not smooth or stylize it. Apply only ' +
  'the following restrained, localized change, and nothing else:';

const GLOW_BASE =
  'Edit this photo as a tasteful social-photo enhancement. Preserve the person\'s identity, ' +
  'facial structure, and pose exactly as in the original photo. Do not reshape facial anatomy. ' +
  'Apply the following polish, and nothing else:';

const PREVIEW_INTENSITY_MODERATE =
  'Make the change clearly visible but natural-looking — a moderate, believable result, not an extreme one.';

const previewLooks = [
  {
    id: 'softer_lines',
    label: 'Softer-Looking Lines',
    intensity: 'moderate',
    detail: 'Soften the appearance of fine lines and wrinkles on the forehead and around the eyes.',
  },
  {
    id: 'lip_volume',
    label: 'Subtle Lip-Volume Look',
    intensity: 'moderate',
    detail: 'Give the lips a subtly fuller, more defined look.',
  },
  {
    id: 'jawline_definition',
    label: 'Jawline-Definition Look',
    intensity: 'moderate',
    detail: 'Give the jawline a more defined, contoured look.',
  },
  {
    id: 'refreshed_look',
    label: 'Refreshed Look',
    intensity: 'moderate',
    detail: 'Give the face an overall refreshed, well-rested look — reduce under-eye puffiness/shadow slightly and even out skin tone.',
  },
];

const glowPresets = [
  {
    id: 'natural_me',
    label: 'Natural Me',
    detail: 'Gentle skin polish, slight brightening of the eyes and teeth, minimal natural makeup, soft even lighting. Keep it looking like an un-edited, high-quality photo.',
  },
  {
    id: 'golden_hour',
    label: 'Golden Hour',
    detail: 'Apply warm, golden-hour sunset lighting and tone to the photo, with gentle skin polish. Keep the background context recognizable.',
  },
];

function buildPreviewInstruction(look) {
  return `${PREVIEW_BASE} ${look.detail} ${PREVIEW_INTENSITY_MODERATE}`;
}

function buildGlowInstruction(preset) {
  return `${GLOW_BASE} ${preset.detail}`;
}

/** Flat list of the 6 approved Stage 1 transformations, each with one final instruction string. */
const transformations = [
  ...previewLooks.map((look) => ({
    mode: 'preview',
    id: look.id,
    label: look.label,
    intensity: look.intensity,
    instruction: buildPreviewInstruction(look),
  })),
  ...glowPresets.map((preset) => ({
    mode: 'glow',
    id: preset.id,
    label: preset.label,
    intensity: null,
    instruction: buildGlowInstruction(preset),
  })),
];

module.exports = { transformations };
