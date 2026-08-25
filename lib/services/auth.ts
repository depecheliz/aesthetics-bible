/**
 * Auth provider interface. Backed by Supabase in a later phase.
 * No live implementation yet — core logic must not couple directly to
 * one auth vendor.
 */

export type AuthUser = {
  id: string;
  email: string | null;
};

export interface AuthProvider {
  getCurrentUser(): Promise<AuthUser | null>;
  signInWithEmail(email: string, password: string): Promise<AuthUser>;
  signUpWithEmail(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
}
