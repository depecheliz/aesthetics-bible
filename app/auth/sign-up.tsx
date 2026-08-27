import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { useAuth } from '../../lib/state/AuthContext';
import { showAlert } from '../../lib/utils/crossPlatformAlert';
import { colors, spacing } from '../../constants/theme';

const MIN_PASSWORD_LENGTH = 8;

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length >= MIN_PASSWORD_LENGTH && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      const { needsEmailConfirmation } = await signUp(email.trim(), password);
      if (needsEmailConfirmation) {
        setIsSubmitting(false);
        showAlert('Check Your Email', `We sent a confirmation link to ${email.trim()}. Confirm it, then sign in.`, [
          { text: 'OK', onPress: () => router.replace(redirect ? `/auth/sign-in?redirect=${encodeURIComponent(redirect)}` : '/auth/sign-in') },
        ]);
        return;
      }
      if (redirect) {
        router.replace(redirect as Href);
      } else {
        router.back();
      }
    } catch (err) {
      setIsSubmitting(false);
      showAlert('Sign Up Failed', err instanceof Error ? err.message : 'Please try again.');
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ScreenHeader />

          <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
            SAVE YOUR JOURNEY
          </ThemedText>
          <ThemedText variant="displayLarge" style={styles.title}>
            Create your{'\n'}Aesthetics Bible account.
          </ThemedText>

          <FormField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
          />

          <Button label="Create Account" onPress={handleSubmit} disabled={!canSubmit} loading={isSubmitting} style={styles.submit} />

          <Button
            label="I Already Have an Account"
            variant="ghost"
            onPress={() => router.replace(redirect ? `/auth/sign-in?redirect=${encodeURIComponent(redirect)}` : '/auth/sign-in')}
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
