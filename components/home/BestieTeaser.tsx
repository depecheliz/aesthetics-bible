import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { Rule } from '../ui/Rule';
import { botoxBestieEntries } from '../../src/domain/botoxBestie';
import { colors, spacing } from '../../constants/theme';

type BestieTeaserProps = {
  onPress: () => void;
};

export function BestieTeaser({ onPress }: BestieTeaserProps) {
  const sampleQuestions = botoxBestieEntries.slice(0, 3);

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Ask Botox Bestie">
      <Rule style={styles.topRule} />
      <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
        MEET YOUR BOTOX BESTIE
      </ThemedText>
      <ThemedText variant="displaySmall" color={colors.textPrimary} style={styles.title}>
        The aesthetics questions you actually want to ask.
      </ThemedText>

      <View style={styles.questionList}>
        {sampleQuestions.map((entry) => (
          <ThemedText key={entry.id} variant="body" color={colors.textSecondary} style={styles.question}>
            {entry.question}
          </ThemedText>
        ))}
      </View>

      <View style={styles.ctaRow}>
        <ThemedText variant="caption" color={colors.accent} style={styles.ctaLabel}>
          ASK BOTOX BESTIE
        </ThemedText>
        <Feather name="arrow-right" size={13} color={colors.accent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRule: {
    marginBottom: spacing.lg,
    width: '100%',
    opacity: 0.4,
  },
  eyebrow: {
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.md,
  },
  questionList: {
    marginBottom: spacing.md,
  },
  question: {
    marginBottom: spacing.xs,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  ctaLabel: {
    letterSpacing: 1.4,
  },
});
