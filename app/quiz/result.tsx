import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { InfoRow } from '../../components/ui/InfoRow';
import { Rule } from '../../components/ui/Rule';
import { TreatmentActionsGrid } from '../../components/plan/TreatmentActionsGrid';
import { PremiumRoadmapCard } from '../../components/plan/PremiumRoadmapCard';
import { ShareCard, ShareCardStatRow } from '../../components/media/ShareCard';
import { useAppState } from '../../lib/state/AppStateContext';
import { intensityLabels } from '../../src/domain/quiz';
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
          YOUR AESTHETICS PROFILE
        </ThemedText>
        <ThemedText variant="body" color={colors.textSecondary} style={styles.subEyebrow}>
          Your #1 Area to Explore
        </ThemedText>
        <ThemedText variant="displayHero" style={styles.categoryName}>
          {category.name}
        </ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.explanation}>
          {topMatch.explanation}
        </ThemedText>

        <Rule style={styles.rule} />
        <InfoRow label="BEST SUITED FOR" value={category.bestSuitedFor} />
        <InfoRow label="DOWNTIME" value={category.downtimeContext} />
        <InfoRow label="TYPICAL COST" value={category.costContext} />
        <InfoRow label="LONGEVITY" value={category.longevityContext} />
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.budgetNote}>
          {budgetNote}
        </ThemedText>

        <View style={styles.actionsWrap}>
          <TreatmentActionsGrid categoryId={category.id} />
        </View>

        <ShareCard eyebrow="A KEEPSAKE" title="My Aesthetics Profile">
          <ShareCardStatRow label="Top Goal" value={category.name} />
          <ShareCardStatRow label="Style" value={intensityLabels[result.intensity]} />
          <ShareCardStatRow label="#1 Category" value={category.name} />
        </ShareCard>

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
    marginBottom: spacing.sm,
  },
  subEyebrow: {
    marginBottom: spacing.xs,
  },
  categoryName: {
    marginBottom: spacing.md,
  },
  explanation: {
    marginBottom: spacing.lg,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.sm,
  },
  budgetNote: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionsWrap: {
    marginBottom: spacing.xl,
  },
});
