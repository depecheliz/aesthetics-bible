/**
 * Ambient typing for public runtime env vars exposed via EXPO_PUBLIC_*.
 * Keep this list in sync with .env.example. Never add secret keys here —
 * anything prefixed EXPO_PUBLIC_ is bundled into the client.
 */

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_APP_ENV?: 'development' | 'staging' | 'production';
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?: string;
    EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?: string;
    EXPO_PUBLIC_GOOGLE_PLACES_CLIENT_KEY?: string;
    EXPO_PUBLIC_ANALYTICS_WRITE_KEY?: string;
  }
}
