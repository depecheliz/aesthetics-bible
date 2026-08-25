import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { InfoRow } from '../../components/ui/InfoRow';
import { TreatmentActionsGrid } from '../../components/plan/TreatmentActionsGrid';
import { PremiumRoadmapCard } from '../../components/plan/PremiumRoadmapCard';
import { useAppState } from '../../lib/state/AppStateContext';
import { colors, spacing } from '../../constants/theme';

export default function ResultScreen() {
  const { result } = useAppState();

  useEffect(() => {
    if (!result) {
      router.replace('/quiz');
    }
  }, [result]);

  if (!result) {
    return null;
  }

  const { topMatch, alternates, budgetNote } = result;
  const category = topMatch.category;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          YOUR #1 AREA TO EXPLORE
        </ThemedText>
        <ThemedText variant="displayMedium" style={styles.categoryName}>
          {category.name}
        </ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.explanation}>
          {topMatch.explanation}
        </ThemedText>

        <Card variant="surface" style={styles.infoCard}>
          <InfoRow label="BEST SUITED FOR" value={category.bestSuitedFor} />
          <InfoRow label="DOWNTIME" value={category.downtimeContext} />
          <InfoRow label="TYPICAL COST" value={category.costContext} />
          <InfoRow label="LONGEVITY" value={category.longevityContext} />
        </Card>
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.budgetNote}>
          {budgetNote}
        </ThemedText>

        <View style={styles.actionsWrap}>
          <TreatmentActionsGrid categoryId={category.id} />
        </View>

        <PremiumRoadmapCard alternates={alternates} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  categoryName: {
    marginBottom: spacing.sm,
  },
  explanation: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.xs,
  },
  budgetNote: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionsWrap: {
    marginBottom: spacing.xl,
  },
});
