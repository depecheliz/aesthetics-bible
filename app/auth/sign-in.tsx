import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { useAuth } from '../../lib/state/AuthContext';
import { showAlert } from '../../lib/utils/crossPlatformAlert';
import { colors, spacing } from '../../constants/theme';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await signIn(email.trim(), password);
      if (redirect) {
        router.replace(redirect as Href);
      } else {
        router.back();
      }
    } catch (err) {
      setIsSubmitting(false);
      showAlert('Sign In Failed', err instanceof Error ? err.message : 'Please check your email and password.');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={insets.top}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
          <ScreenHeader />

          <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
            WELCOME BACK
          </ThemedText>
          <ThemedText variant="displayLarge" style={styles.title}>
            Sign in to your{'\n'}Aesthetics Profile.
          </ThemedText>

          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />

          <Button label="Sign In" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} style={styles.submit} />

          <Button
            label="Create an Account"
            variant="ghost"
            onPress={() => router.replace(redirect ? `/auth/sign-up?redirect=${encodeURIComponent(redirect)}` : '/auth/sign-up')}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  title: {
    marginBottom: spacing.xl,
  },
  submit: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});
