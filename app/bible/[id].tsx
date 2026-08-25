import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { InfoRow } from '../../components/ui/InfoRow';
import { treatmentCategories, type TreatmentCategoryId } from '../../src/domain/recommendation';
import { colors, spacing } from '../../constants/theme';

const providerQuestions = [
  'What results are realistic for my specific goals, and over what timeframe?',
  'What downtime or aftercare should I plan for?',
  'How many sessions are typically recommended, and how is pricing structured?',
];

export default function TreatmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const category = treatmentCategories[id as TreatmentCategoryId];

  if (!category) {
    return (
      <Screen>
        <ScreenHeader />
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.notFound}>
          We couldn&apos;t find that entry in The Bible.
        </ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          THE BIBLE
        </ThemedText>
        <ThemedText variant="displayMedium" style={styles.title}>
          {category.name}
        </ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.overview}>
          {category.overview}
        </ThemedText>

        <Card variant="surface" style={styles.infoCard}>
          <InfoRow label="BEST SUITED FOR" value={category.bestSuitedFor} />
          <InfoRow label="DOWNTIME" value={category.downtimeContext} />
          <InfoRow label="TYPICAL COST" value={category.costContext} />
          <InfoRow label="LONGEVITY" value={category.longevityContext} />
        </Card>

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
    marginBottom: spacing.sm,
  },
  overview: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
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
});
