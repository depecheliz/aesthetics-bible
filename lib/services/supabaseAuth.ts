/**
 * Supabase-backed implementation of the AuthProvider interface. Screens
 * never import this directly — they go through AuthContext, which is the
 * only consumer of this file.
 */

import { supabase } from './supabaseClient';
import type { AuthProvider, AuthUser } from './auth';

function toAuthUser(user: { id: string; email?: string | null } | null): AuthUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

export const supabaseAuthProvider: AuthProvider = {
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return toAuthUser(data.session?.user ?? null);
  },

  async signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const user = toAuthUser(data.user);
    if (!user) throw new Error('Sign in did not return a user.');
    return user;
  },

  async signUpWithEmail(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const user = toAuthUser(data.user);
    if (!user) throw new Error('Sign up did not return a user.');
    // No session yet means the project requires email confirmation first.
    return { user, needsEmailConfirmation: !data.session };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async deleteAccount() {
    const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
    if (error) throw error;
    await supabase.auth.signOut();
  },

  onAuthStateChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(toAuthUser(session?.user ?? null));
    });
    return () => data.subscription.unsubscribe();
  },
};
