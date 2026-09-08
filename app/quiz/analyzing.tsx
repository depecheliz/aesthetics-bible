import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Monogram } from '../../components/brand/Monogram';
import { useAppState } from '../../lib/state/AppStateContext';
import { colors, spacing } from '../../constants/theme';

/**
 * A brief, honest anticipation beat between quiz completion and the Result
 * reveal. The recommendation itself is computed instantly and locally (see
 * src/domain/recommendation.ts) — this screen does not claim analysis that
 * isn't happening (no photo, no AI). Its only job is pacing: the reveal
 * should feel earned rather than instant. Copy stays literal about what's
 * actually being assembled — the user's profile/plan from their answers.
 */

const STEPS = ['Reading your answers', 'Building your Aestella Profile', 'Preparing your plan'];

const STEP_DURATION_MS = 700;

export default function AnalyzingScreen() {
  const { result } = useAppState();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!result) {
      router.replace('/quiz');
      return;
    }

    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStepIndex(i), i * STEP_DURATION_MS),
    );
    const finalTimer = setTimeout(() => {
      router.replace('/quiz/result');
    }, STEPS.length * STEP_DURATION_MS);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finalTimer);
    };
  }, [result]);

  if (!result) {
    return null;
  }

  return (
    <Screen>
      <View style={styles.center}>
        <Monogram size="sm" />
        <ThemedText variant="displaySmall" style={styles.headline}>
          {STEPS[stepIndex]}
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary}>
          Just a moment.
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  headline: {
    textAlign: 'center',
  },
});
