export const PREVIEW_MONTHLY_ALLOWANCE = 10;

export type PreviewEligibility =
  | { allowed: true }
  | { allowed: false; reason: 'not_premium' | 'not_live' | 'quota_exceeded' };

/**
 * Pure decision function for whether the Preview generation flow should
 * even be attempted client-side. This is a UX gate only — the
 * generate-preview Edge Function re-checks entitlement and quota
 * server-side regardless (never trust a client-side "allowed" for
 * anything that spends money). Kept pure/dependency-free so it's directly
 * unit-testable without mocking Supabase or RevenueCat.
 */
export function checkPreviewEligibility(params: {
  isPremium: boolean;
  isLive: boolean;
  usedThisMonth: number;
}): PreviewEligibility {
  if (!params.isPremium) {
    return { allowed: false, reason: 'not_premium' };
  }
  if (!params.isLive) {
    return { allowed: false, reason: 'not_live' };
  }
  if (params.usedThisMonth >= PREVIEW_MONTHLY_ALLOWANCE) {
    return { allowed: false, reason: 'quota_exceeded' };
  }
  return { allowed: true };
}
