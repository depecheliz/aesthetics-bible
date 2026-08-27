import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '../typography/ThemedText';
import { Button } from '../ui/Button';
import { Rule } from '../ui/Rule';
import { useOptionalAuth } from '../../lib/state/AuthContext';
import { showAlert } from '../../lib/utils/crossPlatformAlert';
import { colors, spacing } from '../../constants/theme';

/**
 * Minimal account affordance — sign in/out and delete account. Passport is
 * the most private area of the app, so this lives here rather than a new
 * settings tab (the nav stays at five destinations per CLAUDE.md).
 *
 * Uses useOptionalAuth (not useAuth) so this renders safely even outside
 * AuthContextProvider — e.g. a screen test that mounts only AppStateProvider.
 */
export function AccountSection() {
  const auth = useOptionalAuth();
  const [isWorking, setIsWorking] = useState(false);

  if (!auth || auth.status !== 'signedIn') {
    return (
      <View style={styles.wrap}>
        <Rule style={styles.rule} />
        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.label}>
          ACCOUNT
        </ThemedText>
        <ThemedText variant="body" color={colors.textSecondary} style={styles.hint}>
          Sign in to keep your Plan and Passport saved across devices.
        </ThemedText>
        <Button label="Sign In" variant="secondary" fullWidth={false} onPress={() => router.push('/auth/sign-in')} />
      </View>
    );
  }

  const { user, signOut, deleteAccount } = auth;

  const handleSignOut = async () => {
    setIsWorking(true);
    try {
      await signOut();
    } catch {
      showAlert('Sign Out Failed', 'Please try again.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleDeleteAccount = () => {
    showAlert(
      'Delete Account',
      'This permanently deletes your account and everything saved to it — your Plan, quiz answers, and Passport entries. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsWorking(true);
            try {
              await deleteAccount();
            } catch {
              setIsWorking(false);
              showAlert('Delete Failed', 'Please try again or contact support.');
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.wrap}>
      <Rule style={styles.rule} />
      <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.label}>
        ACCOUNT
      </ThemedText>
      <ThemedText variant="body" color={colors.textSecondary} style={styles.hint}>
        Signed in as {user?.email ?? 'your account'}
      </ThemedText>
      <View style={styles.buttonRow}>
        <Button label="Sign Out" variant="secondary" fullWidth={false} loading={isWorking} onPress={handleSignOut} style={styles.button} />
        <Button label="Delete Account" variant="ghost" fullWidth={false} loading={isWorking} onPress={handleDeleteAccount} style={styles.button} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xl,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  hint: {
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});
