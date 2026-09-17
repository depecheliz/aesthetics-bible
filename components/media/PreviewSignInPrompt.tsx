import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '../typography/ThemedText';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { colors, radius, spacing } from '../../constants/theme';

/**
 * Sign-in gate for AI Preview, shown when a signed-out user presses
 * "Generate Preview". This is an authentication prompt, not a generation
 * error — it must never flip Preview's own `generation.phase` to `'error'`
 * (that phase is reserved for genuine generation/API failures, which alone
 * should ever show "Retry Preview").
 */
type PreviewSignInPromptProps = {
  visible: boolean;
  /** "Continue" — routes to sign-in. */
  onContinue: () => void;
  /** "Maybe later" or backdrop tap — dismiss without navigating. */
  onDismiss: () => void;
};

export function PreviewSignInPrompt({ visible, onContinue, onDismiss }: PreviewSignInPromptProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      testID="preview-sign-in-prompt"
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <SafeAreaProvider>
          <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
            <Card variant="ivory" style={styles.card}>
              <ThemedText variant="eyebrow" color={colors.accent}>
                AI PREVIEW
              </ThemedText>
              <ThemedText variant="displaySmall" color={colors.textOnIvory} style={styles.title}>
                Your personalized preview is ready to create
              </ThemedText>
              <ThemedText variant="body" color={colors.textOnIvory} style={styles.body}>
                Sign in to continue. AI Preview is included with Aestella Premium.
              </ThemedText>
              <Button label="Continue" onPress={onContinue} style={styles.continueButton} />
              <Button label="Maybe later" variant="ghost" onPress={onDismiss} />
            </Card>
          </SafeAreaView>
        </SafeAreaProvider>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  safeArea: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radius.lg,
  },
  title: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  body: {
    marginBottom: spacing.lg,
  },
  continueButton: {
    marginBottom: spacing.sm,
  },
});
