import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { buildPreviewPrompt } from '../_shared/previewGoals.ts';
import {
  callPreviewProvider,
  PreviewProviderError,
  validateProviderConfig,
} from '../_shared/previewProvider.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST')
    return json({ error: 'Method not allowed.', code: 'bad_request' }, 405);
  let release: (() => Promise<void>) | undefined;
  let cleanup: (() => Promise<void>) | undefined;
  let committed = false;
  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization) return json({ error: 'Sign in required.', code: 'unauthenticated' }, 401);
    const url = Deno.env.get('SUPABASE_URL')!;
    const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: auth, error: authError } = await caller.auth.getUser();
    if (authError || !auth.user)
      return json({ error: 'Please sign in again.', code: 'unauthenticated' }, 401);
    const userId = auth.user.id;
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid request.', code: 'bad_request' }, 400);
    }
    const sourcePath = body?.sourceStoragePath;
    if (
      typeof sourcePath !== 'string' ||
      !sourcePath.startsWith(userId + '/') ||
      !/^[a-f0-9-]{36}[.]jpg$/.test(sourcePath.slice(userId.length + 1))
    ) {
      return json({ error: 'Invalid source path.', code: 'bad_request' }, 400);
    }
    let prompt: string;
    try {
      prompt = buildPreviewPrompt(body.visualizationGoal, body.intensity);
    } catch {
      return json(
        { error: 'Choose a supported Preview goal and intensity.', code: 'bad_request' },
        400,
      );
    }
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: previous, error: previousError } = await admin
      .from('preview_generations')
      .select('id,result_storage_path,deleted_at')
      .eq('user_id', userId)
      .eq('source_storage_path', sourcePath)
      .maybeSingle();
    if (previousError)
      return json({ error: 'Could not check saved previews.', code: 'history_failed' }, 502);
    if (previous?.deleted_at)
      return json({ error: 'This preview has been deleted.', code: 'deleted' }, 410);
    // Recover a paid, owned result without requiring another credit or provider call.
    if (previous)
      return json({ generationId: previous.id, resultStoragePath: previous.result_storage_path });
    const config = {
      model: Deno.env.get('PREVIEW_REPLICATE_MODEL'),
      token: Deno.env.get('REPLICATE_API_TOKEN'),
    };
    validateProviderConfig(config);

    // Existing entitlement boundary preserved. Agent #4 owns billing changes.
    const revenueCatSecretKey = Deno.env.get('REVENUECAT_SECRET_API_KEY');
    if (!revenueCatSecretKey)
      return json(
        { error: 'Preview access is not configured.', code: 'billing_not_configured' },
        503,
      );
    const entitlementRes = await fetch('https://api.revenuecat.com/v1/subscribers/' + userId, {
      headers: { Authorization: 'Bearer ' + revenueCatSecretKey },
      signal: AbortSignal.timeout(10000),
    });
    if (!entitlementRes.ok)
      return json({ error: 'Could not verify access.', code: 'entitlement_check_failed' }, 502);
    const entitlementData = await entitlementRes.json();
    const expiry = entitlementData?.subscriber?.entitlements?.premium?.expires_date;
    if (!(expiry === null || (typeof expiry === 'string' && new Date(expiry) > new Date()))) {
      return json({ error: 'Premium access required.', code: 'not_entitled' }, 403);
    }
    const token = crypto.randomUUID();
    const { data: lease, error: leaseError } = await admin.rpc('acquire_preview_request', {
      p_user_id: userId,
      p_token: token,
    });
    if (leaseError)
      return json(
        { error: 'Could not verify Preview allowance.', code: 'quota_check_failed' },
        502,
      );
    if (lease !== 'allowed')
      return json(
        {
          error: 'Preview allowance is used or another request is processing.',
          code: lease === 'quota_exceeded' ? lease : 'request_in_progress',
        },
        429,
      );
    release = async () => {
      // Brief cooldown also limits repeated failed requests without consuming quota.
      await admin
        .from('preview_request_locks')
        .update({ expires_at: new Date(Date.now() + 15_000).toISOString() })
        .eq('user_id', userId)
        .eq('token', token);
    };
    // Re-check after acquiring the lease: a prior call may have committed since the first lookup.
    const { data: recovered, error: recoveredError } = await admin
      .from('preview_generations')
      .select('id,result_storage_path,deleted_at')
      .eq('user_id', userId)
      .eq('source_storage_path', sourcePath)
      .maybeSingle();
    if (recoveredError)
      return json({ error: 'Could not check saved previews.', code: 'history_failed' }, 502);
    if (recovered?.deleted_at)
      return json({ error: 'This preview has been deleted.', code: 'deleted' }, 410);
    if (recovered)
      return json({ generationId: recovered.id, resultStoragePath: recovered.result_storage_path });
    cleanup = async () => {
      await admin.storage.from('preview-sources').remove([sourcePath]);
    };
    const { data: sourceFile, error: sourceError } = await admin.storage
      .from('preview-sources')
      .download(sourcePath);
    if (sourceError || !sourceFile)
      return json({ error: 'Could not read your photo.', code: 'source_read_failed' }, 502);
    const sourceBytes = new Uint8Array(await sourceFile.arrayBuffer());
    if (
      sourceFile.size > 20 * 1024 * 1024 ||
      sourceBytes[0] !== 255 ||
      sourceBytes[1] !== 216 ||
      sourceBytes[2] !== 255
    ) {
      return json({ error: 'Choose a JPEG photo under 20 MB.', code: 'bad_photo' }, 400);
    }
    const { data: signed, error: signError } = await admin.storage
      .from('preview-sources')
      .createSignedUrl(sourcePath, 180);
    if (signError || !signed)
      return json({ error: 'Could not prepare your photo.', code: 'source_read_failed' }, 502);
    const result = await callPreviewProvider(signed.signedUrl, prompt, config);
    const resultPath =
      userId +
      '/' +
      crypto.randomUUID() +
      (result.contentType === 'image/png'
        ? '.png'
        : result.contentType === 'image/webp'
          ? '.webp'
          : '.jpg');
    const { error: uploadError } = await admin.storage
      .from('preview-results')
      .upload(resultPath, result.resultBytes, { contentType: result.contentType });
    if (uploadError)
      return json({ error: 'Could not save the image.', code: 'result_write_failed' }, 502);
    committed = true;
    const { data: inserted, error: insertError } = await admin
      .from('preview_generations')
      .insert({
        user_id: userId,
        provider: result.providerId,
        source_storage_path: sourcePath,
        result_storage_path: resultPath,
        visualization_goal: body.visualizationGoal,
        intensity: body.intensity,
        cost_usd: result.costUsd,
      })
      .select('id')
      .single();
    // A DB transport failure has an uncertain commit outcome. Retain files for recovery;
    // never remove a result that might already be recorded as a successful generation.
    if (insertError || !inserted)
      return json(
        {
          error: 'Could not confirm saving. Refresh saved previews or retry.',
          code: 'record_failed',
        },
        502,
      );
    return json({ generationId: inserted.id, resultStoragePath: resultPath });
  } catch (error) {
    if (error instanceof PreviewProviderError)
      return json(
        { error: error.message, code: error.code },
        error.code === 'provider_not_configured' ? 503 : 502,
      );
    return json(
      {
        error: 'Preview could not finish. Please retry or refresh saved previews.',
        code: 'unexpected_error',
      },
      500,
    );
  } finally {
    if (!committed) await cleanup?.().catch(() => undefined);
    await release?.().catch(() => undefined);
  }
});
