// Stable goal labels from PRODUCT_SPEC §6 and the existing Preview UI.
// Instructions describe an illustration, never a diagnosis or procedure plan.
export const previewGoalInstructions: Record<string, string> = {
  'Softer-Looking Lines':
    'Soften only existing upper-face expression lines slightly. Retain natural expression and visible fine skin detail.',
  'Brighter Complexion':
    'Gently improve only dull-looking facial skin luminosity. Preserve original skin color, pigmentation, facial volume and lighting.',
  'More Even Tone':
    'Gently reduce only uneven facial pigmentation. Preserve natural skin tone, freckles, moles, pores and facial contours.',
  'Subtle Lip-Volume Look':
    'Add a small, plausible amount of volume only to the lips. Preserve lip shape, natural asymmetry, color, mouth position and surrounding anatomy.',
  'Jawline-Definition Look':
    'Gently refine only the jawline contour. Preserve chin identity, face width, neck, expression and all other facial proportions.',
  'Refreshed Look':
    'Slightly soften only the appearance of under-eye shadows. Preserve eye shape, eye color, eyelids and all facial volumes.',
};

export function buildPreviewPrompt(goal: string, intensity: string): string {
  if (
    !Object.hasOwn(previewGoalInstructions, goal) ||
    !['subtle', 'moderate', 'enhanced'].includes(intensity)
  ) {
    throw new Error('Unsupported visualization goal or intensity.');
  }
  return [
    'Edit this photograph of the same person. Identity preservation is the highest priority.',
    previewGoalInstructions[goal],
    `Requested intensity: ${intensity}. Even enhanced must remain conservative, anatomically plausible and recognizable.`,
    'Preserve age, ethnicity, natural skin texture, pores, hair, eyes, clothing, background, lighting, camera angle, pose, expression, crop and image aspect ratio.',
    'Change nothing outside the specified area. Do not beautify the whole face, smooth away texture, reshape unrelated features, add makeup, or replace the person.',
    'Return one photorealistic image with exactly the original framing, no text or collage. This is an illustrative possibility, not a prediction of a treatment outcome.',
  ].join(' ');
}
