import { supabase } from './supabaseClient';
import { randomId } from '../utils/randomId';

/**
 * Uploads a compressed source photo to the private `preview-sources`
 * bucket. Path is always `${userId}/${uuid}.jpg` — the Storage RLS
 * policies (see the 20260906000001 migration) enforce that a user can only
 * read/write inside their own folder, so this is real, not advisory.
 */
export async function uploadPreviewSourcePhoto(
  userId: string,
  localUri: string,
  requestId = randomId(),
): Promise<string> {
  const path = `${userId}/${requestId}.jpg`;

  const response = await fetch(localUri);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();

  const { error } = await supabase.storage.from('preview-sources').upload(path, arrayBuffer, {
    contentType: 'image/jpeg',
    upsert: false,
  });

  if (error && !('statusCode' in error && String(error.statusCode) === '409')) {
    throw new Error('Could not upload your photo. Check your connection and try again.');
  }

  return path;
}
