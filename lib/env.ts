/**
 * Centralized, typed access to public runtime configuration.
 *
 * Only EXPO_PUBLIC_* variables belong here — those are bundled into the
 * client. Server-side secrets (service-role keys, AI provider secrets,
 * RevenueCat secret keys, Google server keys) must never be read here or
 * shipped to the client at all.
 */

export const env = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  revenueCatIosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '',
  revenueCatAndroidApiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '',
  googlePlacesClientKey: process.env.EXPO_PUBLIC_GOOGLE_PLACES_CLIENT_KEY ?? '',
  analyticsWriteKey: process.env.EXPO_PUBLIC_ANALYTICS_WRITE_KEY ?? '',
} as const;
