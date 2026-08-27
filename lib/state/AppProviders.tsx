import { useMemo, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthContextProvider, useAuth } from './AuthContext';
import { AppStateProvider } from './AppStateContext';
import { createPersistenceAdapter } from '../services/persistenceAdapter';
import { SaveErrorWatcher } from '../../components/system/SaveErrorWatcher';
import { colors } from '../../constants/theme';

/**
 * Composition root for identity + product state. AuthContextProvider owns
 * session restoration; AppStateProvider gets a Supabase-backed persistence
 * adapter only once a user is signed in, so anonymous behavior is exactly
 * the original local-only build (see AppStateContext).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthContextProvider>
      <AuthGatedAppState>{children}</AuthGatedAppState>
    </AuthContextProvider>
  );
}

function AuthGatedAppState({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();

  const userId = user?.id ?? null;
  const persistence = useMemo(() => (userId ? createPersistenceAdapter(userId) : undefined), [userId]);

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
