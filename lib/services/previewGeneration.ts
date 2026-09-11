import { supabase } from './supabaseClient';
import { uploadPreviewSourcePhoto } from './previewStorage';
import type { PreviewIntensity } from './ai';

export type PreviewGenerationRequest = {
  userId: string;
  requestId: string;
  sourcePhotoUri: string;
  visualizationGoal: string;
  intensity: PreviewIntensity;
};
export type PreviewGenerationSuccess = {
  status: 'success';
  generationId: string;
  resultStoragePath: string;
};
export type PreviewGenerationFailure = { status: 'failure'; code: string; message: string };
export type PreviewGenerationOutcome = PreviewGenerationSuccess | PreviewGenerationFailure;
const failure = (code: string, message: string): PreviewGenerationFailure => ({
  status: 'failure',
  code,
  message,
});
const messages: Record<string, string> = {
  unauthenticated: 'Please sign in again to use AI Preview.',
  not_entitled: 'Premium access is required for AI Preview.',
  billing_not_configured: 'Preview access is not configured on the server yet.',
  provider_not_configured:
    'AI Preview is finishing testing. The image provider is not configured yet.',
  quota_exceeded: 'You have used your monthly Preview allowance.',
  request_in_progress:
    'A preview is already processing. Wait a moment, then retry or refresh saved previews.',
  generation_timeout:
    'Preview took too long. Please retry or refresh saved previews before starting another.',
  source_read_failed: 'Could not read your photo. Choose the photo again and retry.',
  bad_request: 'Please choose a supported goal and photo again.',
  deleted: 'This preview has been deleted. Choose a photo to start again.',
};

/** Retries reuse requestId so a lost response cannot charge a second success. */
export async function requestPreviewGeneration(
  request: PreviewGenerationRequest,
  signal?: AbortSignal,
): Promise<PreviewGenerationOutcome> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  const timer = setTimeout(cancel, 125_000);
  signal?.addEventListener('abort', cancel);
  try {
    if (signal?.aborted)
      return failure('cancelled', 'Stopped waiting. Completed previews will be in saved previews.');
    const stopped = new Promise<PreviewGenerationOutcome>((resolve) => {
      controller.signal.addEventListener(
        'abort',
        () => resolve(failure('generation_timeout', messages.generation_timeout)),
        { once: true },
      );
    });
    return await Promise.race([
      stopped,
      (async (): Promise<PreviewGenerationOutcome> => {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError || auth.user?.id !== request.userId)
          return failure('unauthenticated', messages.unauthenticated);
        if (controller.signal.aborted) return failure('cancelled', 'Stopped waiting.');
        let sourceStoragePath: string;
        try {
          sourceStoragePath = await uploadPreviewSourcePhoto(
            request.userId,
            request.sourcePhotoUri,
            request.requestId,
          );
        } catch {
          return failure(
            'upload_failed',
            'Could not upload your photo. Check your connection and retry.',
          );
        }
        if (controller.signal.aborted)
          return failure('cancelled', 'Stopped waiting. You can retry this photo.');
        const { data, error } = await supabase.functions.invoke('generate-preview', {
          body: {
            sourceStoragePath,
            visualizationGoal: request.visualizationGoal,
            intensity: request.intensity,
          },
          signal: controller.signal,
        });
        if (error || data?.error) {
          const context = error && 'context' in error ? error.context : undefined;
          const detail =
            context instanceof Response ? await context.json().catch(() => null) : data;
          const code = typeof detail?.code === 'string' ? detail.code : 'generation_failed';
          return failure(
            code,
            messages[code] ??
              'Could not generate your preview. Please retry or refresh saved previews.',
          );
        }
        if (
          typeof data?.generationId !== 'string' ||
          !data.generationId ||
          typeof data?.resultStoragePath !== 'string' ||
          !data.resultStoragePath.startsWith(request.userId + '/')
        ) {
          return failure(
            'malformed_response',
            'The server returned an incomplete result. Refresh saved previews or retry.',
          );
        }
        return {
          status: 'success',
          generationId: data.generationId,
          resultStoragePath: data.resultStoragePath,
        };
      })(),
    ]);
  } catch {
    return failure(
      controller.signal.aborted ? 'generation_timeout' : 'invoke_failed',
      messages.generation_timeout,
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

export async function getPreviewGenerationsUsedThisMonth(): Promise<number> {
  const { data, error } = await supabase.rpc('my_preview_generations_this_month');
  if (error || typeof data !== 'number') throw new Error('Could not refresh Preview usage.');
  return data;
}
export type SavedPreview = {
  id: string;
  source_storage_path: string;
  result_storage_path: string;
  visualization_goal: string;
  intensity: string;
  created_at: string;
};
export async function listSavedPreviews(): Promise<SavedPreview[]> {
  const { data, error } = await supabase
    .from('preview_generations')
    .select('id,source_storage_path,result_storage_path,visualization_goal,intensity,created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error('Could not load saved previews. Please refresh.');
  return data ?? [];
}
/** URLs are freshly signed for viewing, never persisted. Storage RLS owns authorization. */
export async function getPreviewImageUrls(
  preview: Pick<SavedPreview, 'source_storage_path' | 'result_storage_path'>,
) {
  const results = await Promise.all([
    supabase.storage.from('preview-sources').createSignedUrl(preview.source_storage_path, 600),
    supabase.storage.from('preview-results').createSignedUrl(preview.result_storage_path, 600),
  ]);
  if (results.some(({ data, error }) => error || !data?.signedUrl))
    throw new Error('Could not load the images. Refresh to try again.');
  return { before: results[0].data!.signedUrl, after: results[1].data!.signedUrl };
}
export async function deleteSavedPreview(generationId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('delete-preview', {
    body: { generationId },
  });
  if (error || data?.error) throw new Error('Could not delete the images. Please retry.');
}
export async function reportPreviewGeneration(generationId: string, reason: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke('report-preview', {
    body: { generationId, reason },
  });
  if (error || data?.error) throw new Error('Could not submit your report. Please try again.');
}
