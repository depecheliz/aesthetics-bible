import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { InfoRow } from '../../components/ui/InfoRow';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { TreatmentActionsGrid } from '../../components/plan/TreatmentActionsGrid';
import { PremiumRoadmapCard } from '../../components/plan/PremiumRoadmapCard';
import { ShareCard, ShareCardStatRow } from '../../components/media/ShareCard';
import { useAppState } from '../../lib/state/AppStateContext';
import { areaLabels, concernLabels, intensityLabels } from '../../src/domain/quiz';
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

  const matchReasons = [
    { label: 'Your goal', value: concernLabels[result.concern] },
    { label: 'Focus area', value: areaLabels[result.area] },
    { label: 'Preferred result', value: intensityLabels[result.intensity] },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <EditorialImage variant="treatment" label={category.name} style={styles.heroImage} />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          YOUR AESTHETICS PROFILE
        </ThemedText>
        <ThemedText variant="body" color={colors.textSecondary} style={styles.subEyebrow}>
          Your #1 Area to Explore
        </ThemedText>
        <ThemedText variant="displayHero" style={styles.categoryName}>
          {category.name}
        </ThemedText>

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.whyLabel}>
          WHY THIS MATCHED YOU
        </ThemedText>
        <View style={styles.whyList}>
          {matchReasons.map((reason) => (
            <View key={reason.label} style={styles.whyRow}>
              <ThemedText variant="caption" color={colors.textSecondary}>
                {reason.label}
              </ThemedText>
              <ThemedText variant="body" color={colors.textPrimary}>
                {reason.value}
              </ThemedText>
            </View>
          ))}
        </View>

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
  heroImage: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    marginBottom: spacing.sm,
  },
  subEyebrow: {
    marginBottom: spacing.xs,
  },
  categoryName: {
    marginBottom: spacing.lg,
  },
  whyLabel: {
    marginBottom: spacing.sm,
  },
  whyList: {
    marginBottom: spacing.lg,
  },
  whyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
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
