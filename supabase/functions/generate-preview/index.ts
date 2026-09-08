import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// AI Preview generation. NOT YET DEPLOYED — see BUILD_STATUS.md.
//
// This function is a real skeleton, not a mock: authentication, entitlement
// verification, and quota enforcement below are fully implemented and
// meant to run as-is. The one deliberately unfinished piece is
// `callProvider()`, which throws NotConfigured until:
//   1. benchmarks/image-providers/ has been run and a provider chosen, and
//   2. that provider's identifier + its secret API key are set as this
//      function's environment secrets (`supabase secrets set ...`).
// Do not hardcode a specific provider (e.g. FLUX) here before that
// decision is made — see PRODUCT_SPEC.md / project decisions on this.
//
// Request body: { sourceStoragePath: string, visualizationGoal: string, intensity: 'subtle'|'moderate'|'enhanced' }
// Response: { generationId: string, resultStoragePath: string } on success,
// or { error: string, code: string } with an appropriate status on failure.
// A failure NEVER inserts a preview_generations row — quota is only
// consumed by a row that exists, and a row only exists after success.

type PreviewIntensity = "subtle" | "moderate" | "enhanced";

type GenerateRequest = {
  sourceStoragePath: string;
  visualizationGoal: string;
  intensity: PreviewIntensity;
};

const MONTHLY_ALLOWANCE = 10;

// Every provider adapter must implement this shape. See
// benchmarks/image-providers/providers.js for the three candidates already
// researched (cost + identity-preservation notes) — that harness informs
// which one is wired in here, it does not predetermine it.
type ProviderResult = { resultBytes: Uint8Array; providerId: string; costUsd: number };

async function callProvider(_sourceBytes: Uint8Array, _prompt: string): Promise<ProviderResult> {
  // Intentionally unimplemented. Wiring a specific model in here before the
  // benchmark has run and a provider is chosen is exactly the kind of
  // premature commitment this project decided against.
  throw new NotConfiguredError(
    "AI Preview's provider has not been selected yet (benchmark pending). No generation can run.",
  );
}

class NotConfiguredError extends Error {}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization", code: "unauthenticated" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const revenueCatSecretKey = Deno.env.get("REVENUECAT_SECRET_API_KEY");

    // Resolve the caller's identity from their own verified JWT — never
    // trust a client-supplied user id.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData?.user) {
      return jsonResponse({ error: "Invalid session", code: "unauthenticated" }, 401);
    }
    const userId = userData.user.id;

    // Entitlement check: verify against RevenueCat's server API using the
    // secret key, not the client's own claimed entitlement. RevenueCat's
    // app_user_id is the Supabase user id after identifyRevenueCatUser()
    // has run on sign-in (see lib/services/revenueCatBilling.ts).
    if (!revenueCatSecretKey) {
      return jsonResponse(
        { error: "RevenueCat is not configured on the server yet.", code: "billing_not_configured" },
        500,
      );
    }
    const entitlementRes = await fetch(`https://api.revenuecat.com/v1/subscribers/${userId}`, {
      headers: { Authorization: `Bearer ${revenueCatSecretKey}` },
    });
    if (!entitlementRes.ok) {
      return jsonResponse({ error: "Could not verify entitlement.", code: "entitlement_check_failed" }, 502);
    }
    const entitlementData = await entitlementRes.json();
    const isPremium = Boolean(entitlementData?.subscriber?.entitlements?.premium?.expires_date === null
      || (entitlementData?.subscriber?.entitlements?.premium?.expires_date
        && new Date(entitlementData.subscriber.entitlements.premium.expires_date) > new Date()));
    if (!isPremium) {
      return jsonResponse({ error: "Premium subscription required.", code: "not_entitled" }, 403);
    }

    // Quota check: only successful past generations count (see migration
    // comment) — a failed attempt never reaches this function again with
    // quota already spent.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: usedCount, error: quotaError } = await callerClient.rpc(
      "my_preview_generations_this_month",
    );
    if (quotaError) {
      return jsonResponse({ error: "Could not verify quota.", code: "quota_check_failed" }, 502);
    }
    if ((usedCount ?? 0) >= MONTHLY_ALLOWANCE) {
      return jsonResponse(
        { error: `You've used all ${MONTHLY_ALLOWANCE} Preview generations included this month.`, code: "quota_exceeded" },
        429,
      );
    }

    const body = (await req.json()) as GenerateRequest;
    if (!body.sourceStoragePath || !body.visualizationGoal || !body.intensity) {
      return jsonResponse({ error: "Missing required fields.", code: "bad_request" }, 400);
    }
    // Defense in depth: the storage path itself is already RLS-scoped to
    // this user (see the Storage migration), but re-check the prefix here
    // too before ever reading the file.
    if (!body.sourceStoragePath.startsWith(`${userId}/`)) {
      return jsonResponse({ error: "Invalid source path.", code: "bad_request" }, 400);
    }

    const { data: sourceFile, error: downloadError } = await adminClient.storage
      .from("preview-sources")
      .download(body.sourceStoragePath);
    if (downloadError || !sourceFile) {
      return jsonResponse({ error: "Could not read the uploaded photo.", code: "source_read_failed" }, 500);
    }

    let providerResult: ProviderResult;
    try {
      const sourceBytes = new Uint8Array(await sourceFile.arrayBuffer());
      providerResult = await callProvider(sourceBytes, body.visualizationGoal);
    } catch (err) {
      const notConfigured = err instanceof NotConfiguredError;
      // A failed generation is reported honestly and NEVER writes a
      // preview_generations row — quota is not consumed.
      return jsonResponse(
        {
          error: notConfigured
            ? "AI Preview isn't live yet — check back soon."
            : "Your visualization couldn't be generated. Please try again.",
          code: notConfigured ? "provider_not_configured" : "generation_failed",
        },
        notConfigured ? 501 : 502,
      );
    }

    const resultPath = `${userId}/${crypto.randomUUID()}.jpg`;
    const { error: uploadError } = await adminClient.storage
      .from("preview-results")
      .upload(resultPath, providerResult.resultBytes, { contentType: "image/jpeg" });
    if (uploadError) {
      return jsonResponse({ error: "Could not save your visualization.", code: "result_write_failed" }, 500);
    }

    // Only now — after a real provider success and a real stored result —
    // does a row get written, which is the only thing that consumes quota.
    const { data: inserted, error: insertError } = await adminClient
      .from("preview_generations")
      .insert({
        user_id: userId,
        provider: providerResult.providerId,
        source_storage_path: body.sourceStoragePath,
        result_storage_path: resultPath,
        visualization_goal: body.visualizationGoal,
        intensity: body.intensity,
        cost_usd: providerResult.costUsd,
      })
      .select("id")
      .single();
    if (insertError || !inserted) {
      return jsonResponse({ error: "Could not record your generation.", code: "record_failed" }, 500);
    }

    return jsonResponse({ generationId: inserted.id, resultStoragePath: resultPath }, 200);
  } catch (err) {
    return jsonResponse({ error: String(err), code: "unexpected_error" }, 500);
  }
});
