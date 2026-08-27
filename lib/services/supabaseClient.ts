import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

/**
 * Single Supabase client instance. Only the client-safe anon key is ever
 * used here — never a service-role key. AsyncStorage persists the session
 * across app launches on native; supabase-js falls back to browser storage
 * automatically on web.
 */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

// A placeholder keeps client construction from throwing when env vars are
// absent (e.g. Jest, where AuthContext's `provider` prop is always
// overridden in tests and this default is never actually called).
// isSupabaseConfigured is the real signal to check before relying on it.
export const supabase = createClient(env.supabaseUrl || 'https://placeholder.supabase.co', env.supabaseAnonKey || 'placeholder-anon-key', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
