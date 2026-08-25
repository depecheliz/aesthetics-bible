import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { InfoRow } from '../../components/ui/InfoRow';
import { Rule } from '../../components/ui/Rule';
import { getBibleTreatmentById } from '../../src/domain/bible';
import { treatmentCategories } from '../../src/domain/recommendation';
import { colors, spacing } from '../../constants/theme';

const providerQuestions = [
  'What results are realistic for my specific goals, and over what timeframe?',
  'What downtime or aftercare should I plan for?',
  'How many sessions are typically recommended, and how is pricing structured?',
];

export default function TreatmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const treatment = id ? getBibleTreatmentById(id) : undefined;

  if (!treatment) {
    return (
      <Screen>
        <ScreenHeader />
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.notFound}>
          We couldn&apos;t find that entry in The Bible.
        </ThemedText>
      </Screen>
    );
  }

  const category = treatmentCategories[treatment.categoryId];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          THE BIBLE · {category.name.toUpperCase()}
        </ThemedText>
        <ThemedText variant="displayHero" style={styles.title}>
          {treatment.name}
        </ThemedText>
        {treatment.aliases.length > 0 && (
          <ThemedText variant="caption" color={colors.textSecondary} style={styles.aliases}>
            Also known as: {treatment.aliases.join(', ')}
          </ThemedText>
        )}
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.overview}>
          {treatment.overview}
        </ThemedText>

        <Rule style={styles.rule} />
        <InfoRow label="BEST SUITED FOR" value={category.bestSuitedFor} />
        <InfoRow label="DOWNTIME" value={category.downtimeContext} />
        <InfoRow label="TYPICAL COST" value={category.costContext} />
        <InfoRow label="LONGEVITY" value={category.longevityContext} />

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          QUESTIONS TO ASK A PROVIDER
        </ThemedText>
        {providerQuestions.map((question) => (
          <View key={question} style={styles.questionRow}>
            <Feather name="help-circle" size={16} color={colors.accent} style={styles.questionIcon} />
            <ThemedText variant="body" color={colors.textPrimary} style={styles.questionText}>
              {question}
            </ThemedText>
          </View>
        ))}

        <ThemedText variant="caption" color={colors.textMuted} style={styles.footnote}>
          Content version {treatment.contentVersion} · reviewed {treatment.reviewDate}
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  notFound: {
    marginTop: spacing.xl,
  },
  eyebrow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  aliases: {
    marginBottom: spacing.sm,
  },
  overview: {
    marginBottom: spacing.lg,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  questionRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  questionIcon: {
    marginTop: 2,
    marginRight: spacing.xs,
  },
  questionText: {
    flex: 1,
  },
  footnote: {
    marginTop: spacing.md,
  },
});
