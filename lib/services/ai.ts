/**
 * AI generation provider interfaces.
 *
 * Preview (aesthetic-look visualization) and Glow (social-photo
 * enhancement) are separate product modes per CLAUDE.md and must stay on
 * separate interfaces — never merge them into one ambiguous provider.
 *
 * All generation must run through authenticated, server-side
 * infrastructure with quotas/rate limits/cost telemetry. Nothing here
 * calls a vendor directly from the client.
 */

export type PreviewIntensity = 'subtle' | 'moderate' | 'enhanced';

export type PreviewRequest = {
  sourceImageId: string;
  visualizationGoal: string;
  intensity: PreviewIntensity;
};

export type PreviewResult = {
  generationId: string;
  resultImageUrl: string;
  label: 'AI Visualization';
};

export interface PreviewAIProvider {
  generate(request: PreviewRequest): Promise<PreviewResult>;
  reportGeneration(generationId: string, reason: string): Promise<void>;
}

export type GlowPreset =
  | 'natural_me'
  | 'polished'
  | 'date_night'
  | 'soft_glam'
  | 'golden_hour'
  | 'studio'
  | 'fresh_face'
  | 'vacation_glow';

export type GlowRequest = {
  sourceImageId: string;
  preset: GlowPreset;
};

export type GlowResult = {
  generationId: string;
  resultImageUrl: string;
};

export interface GlowAIProvider {
  generate(request: GlowRequest): Promise<GlowResult>;
  reportGeneration(generationId: string, reason: string): Promise<void>;
}
