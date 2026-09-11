/**
 * Analytics interface with a safe no-op default.
 *
 * Analytics failures must never break the core user flow, so the default
 * export always succeeds silently until a real provider is wired in.
 * Never pass raw treatment notes, private image URLs/content, or
 * secrets/tokens as event params.
 */

export type AnalyticsEventName =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'quiz_started'
  | 'quiz_completed'
  | 'top_match_viewed'
  | 'full_roadmap_clicked'
  | 'paywall_viewed'
  | 'weekly_selected'
  | 'annual_selected'
  | 'purchase_started'
  | 'weekly_purchased'
  | 'annual_purchased'
  | 'purchase_cancelled'
  | 'purchase_failed'
  | 'restore_started'
  | 'purchase_restored'
  | 'restore_no_entitlement'
  | 'restore_failed'
  | 'bible_search'
  | 'treatment_viewed'
  | 'comparison_viewed'
  | 'provider_search'
  | 'provider_viewed'
  | 'provider_saved'
  | 'passport_entry_created'
  | 'passport_photo_added'
  | 'preview_started'
  | 'preview_generated'
  | 'preview_failed'
  | 'glow_started'
  | 'glow_generated'
  | 'glow_failed'
  | 'image_exported'
  | 'reminder_created'
  | 'account_deleted';

export interface AnalyticsProvider {
  track(event: AnalyticsEventName, params?: Record<string, string | number | boolean>): void;
}

export const noopAnalytics: AnalyticsProvider = {
  track: () => {},
};
