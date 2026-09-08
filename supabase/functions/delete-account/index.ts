import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Preview photos live in Storage, which has no FK to auth.users, so nothing
// cascades there when the account is deleted. These buckets are cleaned up
// explicitly, by folder prefix (not by reading preview_generations rows),
// because a failed generation still uploads a preview-sources object without
// ever getting a database row — a DB-driven cleanup would miss those.
const PREVIEW_BUCKETS = ["preview-sources", "preview-results"] as const;

const LIST_PAGE_SIZE = 100;
const REMOVE_CHUNK_SIZE = 100;

// Storage's list() is paginated (100 objects/page by default); walk every
// page so a prolific user's older objects aren't left behind.
async function listAllPaths(adminClient: SupabaseClient, bucket: string, userId: string): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await adminClient.storage
      .from(bucket)
      .list(userId, { limit: LIST_PAGE_SIZE, offset });
    if (error) {
      throw new Error(`list ${bucket}: ${error.message}`);
    }
    const page = data ?? [];
    for (const item of page) {
      paths.push(`${userId}/${item.name}`);
    }
    if (page.length < LIST_PAGE_SIZE) {
      break;
    }
    offset += LIST_PAGE_SIZE;
  }
  return paths;
}

async function removeAllPaths(adminClient: SupabaseClient, bucket: string, paths: string[]): Promise<void> {
  for (let i = 0; i < paths.length; i += REMOVE_CHUNK_SIZE) {
    const chunk = paths.slice(i, i + REMOVE_CHUNK_SIZE);
    const { error } = await adminClient.storage.from(bucket).remove(chunk);
    if (error) {
      throw new Error(`remove ${bucket}: ${error.message}`);
    }
  }
}

// Deletes every object under the user's folder in one bucket and confirms
// via a fresh list() that nothing remains, so a partial/failed remove()
// can never be mistaken for success.
async function clearBucket(adminClient: SupabaseClient, bucket: string, userId: string): Promise<void> {
  const paths = await listAllPaths(adminClient, bucket, userId);
  if (paths.length > 0) {
    await removeAllPaths(adminClient, bucket, paths);
  }
  const remaining = await listAllPaths(adminClient, bucket, userId);
  if (remaining.length > 0) {
    throw new Error(`${remaining.length} object(s) still present in ${bucket} after removal`);
  }
}

// Deletes the calling user's own auth.users row, and everything they own in
// Storage first. verify_jwt=true means this only runs for an already-
// authenticated request; the user id is read from that verified JWT, never
// from a client-supplied body, so a caller can only ever delete their own
// account/photos. All user-owned tables reference auth.users(id) with
// ON DELETE CASCADE, so profile/quiz-answers/plan/saved-items/passport rows
// are removed automatically by Postgres once the auth user is deleted.
Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller's JWT and resolve their user id using the anon key
    // client bound to this request's Authorization header.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await callerClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Admin client using the service-role key never leaves this server-side
    // runtime and is never returned to the client.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const userId = userData.user.id;

    // Storage must be confirmed empty before the auth user is deleted: if we
    // deleted the account first and this failed, the photos would be
    // orphaned with no user left to retry the cleanup. Doing this first
    // keeps the whole operation safely retryable on failure.
    try {
      for (const bucket of PREVIEW_BUCKETS) {
        await clearBucket(adminClient, bucket, userId);
      }
    } catch (storageErr) {
      return new Response(
        JSON.stringify({
          error: "Could not delete your stored photos. Please try again.",
          code: "storage_cleanup_failed",
          detail: String(storageErr),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
