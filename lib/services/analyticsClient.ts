/**
 * Singleton analytics client used by call sites throughout the app.
 *
 * No analytics vendor is wired in yet — `EXPO_PUBLIC_ANALYTICS_WRITE_KEY`
 * exists as a placeholder in `lib/env.ts` but no provider decision has been
 * made. Rather than leaving every call site as a dead `noopAnalytics` (as
 * before, where nothing was ever imported), this client:
 *  - in development, logs events to the console so the funnel is visible
 *    while testing, without claiming any data is actually being collected;
 *  - in any other environment, is a true no-op.
 *
 * Once a provider (e.g. PostHog, Amplitude, Segment) is chosen and keyed,
 * replace the body of `track()` below with that SDK's call — every call
 * site elsewhere in the app already uses the correct event names from
 * `AnalyticsEventName` and does not need to change.
 */

import { env } from '../env';
import { noopAnalytics, type AnalyticsProvider } from './analytics';

const devLoggingAnalytics: AnalyticsProvider = {
  track(event, params) {
    console.log(`[analytics:not-yet-connected] ${event}`, params ?? {});
  },
};

export const analytics: AnalyticsProvider =
  env.appEnv === 'development' && !env.analyticsWriteKey ? devLoggingAnalytics : noopAnalytics;
