/**
 * Auth provider interface. Backed by Supabase in a later phase.
 * No live implementation yet — core logic must not couple directly to
 * one auth vendor.
 */

export type AuthUser = {
  id: string;
  email: string | null;
};

export type SignUpResult = {
  user: AuthUser;
  /** True when the project requires email confirmation before a session exists — no auto-login yet. */
  needsEmailConfirmation: boolean;
};

export interface AuthProvider {
  getCurrentUser(): Promise<AuthUser | null>;
  signInWithEmail(email: string, password: string): Promise<AuthUser>;
  signUpWithEmail(email: string, password: string): Promise<SignUpResult>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  /**
   * Subscribe to session changes (sign-in, sign-out, token refresh) so
   * launch-time restoration and cross-tab/device sign-out can update the
   * UI without polling. Returns an unsubscribe function.
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void;
}
