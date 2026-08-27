import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AuthProvider, AuthUser } from '../services/auth';
import { supabaseAuthProvider } from '../services/supabaseAuth';

/**
 * Session/identity state — separate from AppStateContext, which holds
 * product data (quiz answers, plan, Passport). Restoring a session is a
 * one-time async operation on launch, so `status` starts at 'restoring'
 * and screens should treat that as a loading state, not "signed out."
 */

export type AuthStatus = 'restoring' | 'signedIn' | 'signedOut';

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  /** Resolves with whether email confirmation is required before a session exists. */
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

type AuthProviderComponentProps = {
  children: ReactNode;
  /** Test-only seam — defaults to the real Supabase-backed provider. */
  provider?: AuthProvider;
};

export function AuthContextProvider({ children, provider = supabaseAuthProvider }: AuthProviderComponentProps) {
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const providerRef = useRef(provider);
  useEffect(() => {
    providerRef.current = provider;
  }, [provider]);

  useEffect(() => {
    let cancelled = false;

    providerRef.current
      .getCurrentUser()
      .then((current) => {
        if (cancelled) return;
        setUser(current);
        setStatus(current ? 'signedIn' : 'signedOut');
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus('signedOut');
      });

    const unsubscribe = providerRef.current.onAuthStateChange((nextUser) => {
      if (cancelled) return;
      setUser(nextUser);
      setStatus(nextUser ? 'signedIn' : 'signedOut');
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      await providerRef.current.signInWithEmail(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await providerRef.current.signUpWithEmail(email, password);
      return { needsEmailConfirmation: result.needsEmailConfirmation };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign up.');
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await providerRef.current.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign out.');
      throw err;
    }
  };

  const deleteAccount = async () => {
    setError(null);
    try {
      await providerRef.current.deleteAccount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete account.');
      throw err;
    }
  };

  const clearError = () => setError(null);

  const value: AuthState = { status, user, error, signIn, signUp, signOut, deleteAccount, clearError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}

/**
 * Non-throwing variant for components that may render outside
 * AuthContextProvider (e.g. a screen under test with only AppStateProvider
 * mounted). Treats "no provider" the same as "signed out."
 */
export function useOptionalAuth(): AuthState | undefined {
  return useContext(AuthContext);
}
