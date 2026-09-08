import { supabase } from './supabaseClient';
import { uploadPreviewSourcePhoto } from './previewStorage';
import type { PreviewIntensity } from './ai';

export type PreviewGenerationRequest = {
  userId: string;
  sourcePhotoUri: string;
  visualizationGoal: string;
  intensity: PreviewIntensity;
};

export type PreviewGenerationSuccess = {
  status: 'success';
  generationId: string;
  resultStoragePath: string;
};

export type PreviewGenerationFailure = {
  status: 'failure';
  code: string;
  message: string;
};

export type PreviewGenerationOutcome = PreviewGenerationSuccess | PreviewGenerationFailure;

/**
 * Uploads the source photo, then invokes the real generate-preview Edge
 * Function. This does NOT simulate a result — until the function is
 * deployed with a chosen provider, this will surface a real failure
 * (network error if the function doesn't exist yet, or a clear
 * "provider_not_configured" response once it's deployed but before a
 * provider is wired in). Callers should gate on
 * `previewProviderStatus.isPreviewGenerationLive` before invoking this at
 * all, so users don't pay an upload cost for a call known to fail.
 */
export async function requestPreviewGeneration(
  request: PreviewGenerationRequest,
): Promise<PreviewGenerationOutcome> {
  let sourceStoragePath: string;
  try {
    sourceStoragePath = await uploadPreviewSourcePhoto(request.userId, request.sourcePhotoUri);
  } catch (err) {
    return {
      status: 'failure',
      code: 'upload_failed',
      message: err instanceof Error ? err.message : 'Could not upload your photo.',
    };
  }

  const { data, error } = await supabase.functions.invoke('generate-preview', {
    body: {
      sourceStoragePath,
      visualizationGoal: request.visualizationGoal,
      intensity: request.intensity,
    },
  });

  if (error) {
    return {
      status: 'failure',
      code: 'invoke_failed',
      message: 'Could not generate your visualization. Please try again.',
    };
  }

  if (data?.error) {
    return { status: 'failure', code: data.code ?? 'generation_failed', message: data.error };
  }

  return { status: 'success', generationId: data.generationId, resultStoragePath: data.resultStoragePath };
}

/**
 * Reads how many successful generations the signed-in user has had this
 * calendar month, via the RLS-safe `my_preview_generations_this_month` RPC
 * (see the migration — it only ever reads the caller's own auth.uid()).
 * Returns 0 on any error rather than throwing, since this is used for
 * display ("x of 10 used") and a failure here shouldn't block the rest of
 * the screen — the real enforcement happens server-side in
 * generate-preview regardless of what this returns.
 */
export async function getPreviewGenerationsUsedThisMonth(): Promise<number> {
  const { data, error } = await supabase.rpc('my_preview_generations_this_month');
  if (error || typeof data !== 'number') {
    return 0;
  }
  return data;
}

/** Flags a generated result for review — the report/flag mechanism required by CLAUDE.md → AI Calls. */
export async function reportPreviewGeneration(generationId: string, reason: string): Promise<void> {
  const { error } = await supabase.functions.invoke('report-preview', {
    body: { generationId, reason },
  });
  if (error) {
    throw new Error('Could not submit your report. Please try again.');
  }
}
