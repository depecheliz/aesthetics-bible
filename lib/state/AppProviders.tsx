import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthContextProvider, useAuth } from './AuthContext';
import { AppStateProvider } from './AppStateContext';
import { EntitlementProvider } from './EntitlementContext';
import { createPersistenceAdapter } from '../services/persistenceAdapter';
import { configureRevenueCat, identifyRevenueCatUser, resetRevenueCatUser } from '../services/revenueCatBilling';
import { SaveErrorWatcher } from '../../components/system/SaveErrorWatcher';
import { colors } from '../../constants/theme';

/**
 * Composition root for identity + product state. AuthContextProvider owns
 * session restoration; AppStateProvider gets a Supabase-backed persistence
 * adapter only once a user is signed in, so anonymous behavior is exactly
 * the original local-only build (see AppStateContext). EntitlementProvider
 * owns RevenueCat/premium state independently of Supabase auth — a
 * purchase can happen before sign-in (anonymous RevenueCat user); once
 * signed in, this aliases that anonymous purchaser to the real account.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    configureRevenueCat();
  }, []);

  return (
    <AuthContextProvider>
      <AuthGatedAppState>
        <EntitlementProvider>{children}</EntitlementProvider>
      </AuthGatedAppState>
    </AuthContextProvider>
  );
}

function AuthGatedAppState({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  const userId = user?.id ?? null;
  const persistence = useMemo(() => (userId ? createPersistenceAdapter(userId) : undefined), [userId]);

  const previousUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (userId) {
      identifyRevenueCatUser(userId).catch(() => {
        // Non-fatal: entitlement still resolves against the anonymous
        // RevenueCat user until the next successful identify call.
      });
    } else if (previousUserIdRef.current) {
      resetRevenueCatUser().catch(() => {});
    }
    previousUserIdRef.current = userId;
  }, [userId]);

  if (status === 'restoring') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <AppStateProvider persistence={persistence}>
      <SaveErrorWatcher />
      {children}
    </AppStateProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
