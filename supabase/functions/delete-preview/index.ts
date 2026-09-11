import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  try {
    const authorization = req.headers.get('Authorization');
    if (!authorization) return json({ error: 'Sign in required.' }, 401);
    const url = Deno.env.get('SUPABASE_URL')!;
    const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: auth, error: authError } = await caller.auth.getUser();
    if (authError || !auth.user) return json({ error: 'Sign in required.' }, 401);
    const body = await req.json();
    if (typeof body?.generationId !== 'string') return json({ error: 'Invalid request.' }, 400);
    const { data: row, error } = await caller
      .from('preview_generations')
      .select('id,source_storage_path,result_storage_path')
      .eq('id', body.generationId)
      .single();
    if (error || !row) return json({ error: 'Preview not found.' }, 404);
    if (
      ![row.source_storage_path, row.result_storage_path].every((path) =>
        path.startsWith(`${auth.user!.id}/`),
      )
    )
      return json({ error: 'Invalid image ownership.' }, 403);
    const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    // Retain the success ledger so deleting images cannot reset quota.
    for (const [bucket, path] of [
      ['preview-sources', row.source_storage_path],
      ['preview-results', row.result_storage_path],
    ]) {
      const { error: removeError } = await admin.storage.from(bucket).remove([path]);
      if (removeError) return json({ error: 'Could not delete images. Please retry.' }, 502);
    }
    const { error: updateError } = await admin
      .from('preview_generations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', row.id)
      .eq('user_id', auth.user.id);
    if (updateError) return json({ error: 'Could not update saved previews. Please retry.' }, 502);
    return json({ success: true });
  } catch {
    return json({ error: 'Could not delete this preview. Please retry.' }, 500);
  }
});
