/**
 * Single source of truth for whether AI Preview generation can actually be
 * attempted right now. Flip this to `true` only once all of the following
 * are true — not before:
 *   1. benchmarks/image-providers/ has been run and a provider chosen
 *      (identity preservation + quality first, cost second).
 *   2. supabase/functions/generate-preview has that provider's adapter
 *      selected via PREVIEW_REPLICATE_MODEL and is deployed
 *      with the provider's secret key set via `supabase secrets set`.
 *   3. The preview-sources/preview-results Storage buckets exist (see
 *      supabase/migrations/20260906000001_create_preview_storage_buckets.sql)
 *      on a reactivated Supabase project, including the Preview request-safety migration.
 *   4. RevenueCat's secret API key is set for the Edge Function's
 *      server-side entitlement check.
 *
 * Kept as a plain constant (not an env var) on purpose: this isn't
 * configuration that varies by environment, it's a one-time launch gate
 * that a person flips deliberately after verifying the above, with a code
 * change that's visible in review — not a value that could be silently
 * absent from an .env file.
 */
export const isPreviewGenerationLive = false;

export const previewNotLiveMessage = 'AI Preview is finishing testing — check back soon.';
