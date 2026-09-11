import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Lets a user flag a generated Preview result (e.g. as inappropriate,
// unrealistic, or a misfire) — required by CLAUDE.md's "AI Calls" policy
// ("safe failure states; report/flag mechanism where required"). This does
// not delete or alter the generation record (so quota accounting is
// untouched); it only logs the report for review.
//
// Request body: { generationId: string, reason: string }

type ReportRequest = { generationId: string; reason: string };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST')
    return jsonResponse({ error: 'Method not allowed.', code: 'bad_request' }, 405);
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization', code: 'unauthenticated' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData?.user) {
      return jsonResponse({ error: 'Invalid session', code: 'unauthenticated' }, 401);
    }
    const userId = userData.user.id;

    const body = (await req.json()) as ReportRequest;
    if (
      !body ||
      typeof body.generationId !== 'string' ||
      typeof body.reason !== 'string' ||
      !body.reason.trim() ||
      body.reason.length > 500
    ) {
      return jsonResponse({ error: 'Missing required fields.', code: 'bad_request' }, 400);
    }

    // Confirm the generation belongs to the reporting user before logging —
    // RLS on preview_generations already enforces this for the select, so
    // this also doubles as an existence check.
    const { data: generation, error: fetchError } = await callerClient
      .from('preview_generations')
      .select('id')
      .eq('id', body.generationId)
      .maybeSingle();
    if (fetchError || !generation) {
      return jsonResponse({ error: 'Generation not found.', code: 'not_found' }, 404);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { error: insertError } = await adminClient.from('preview_generation_reports').insert({
      generation_id: body.generationId,
      user_id: userId,
      reason: body.reason,
    });
    if (insertError) {
      return jsonResponse({ error: 'Could not submit your report.', code: 'report_failed' }, 500);
    }

    return jsonResponse({ success: true }, 200);
  } catch {
    return jsonResponse(
      { error: 'Could not submit your report. Please retry.', code: 'unexpected_error' },
      500,
    );
  }
});
