import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { InfoRow } from '../../components/ui/InfoRow';
import { TreatmentActionsGrid } from '../../components/plan/TreatmentActionsGrid';
import { PremiumRoadmapCard } from '../../components/plan/PremiumRoadmapCard';
import { useAppState } from '../../lib/state/AppStateContext';
import { concernLabels, areaLabels } from '../../src/domain/quiz';
import { treatmentCategories } from '../../src/domain/recommendation';
import { colors, radius, spacing } from '../../constants/theme';

function PlanEmptyState() {
  return (
    <Screen edges={['top']}>
      <View style={styles.emptyWrap}>
        <Feather name="compass" size={28} color={colors.accent} style={styles.emptyIcon} />
        <ThemedText variant="displaySmall" style={styles.emptyTitle}>
          Your Aesthetics Plan Starts Here
        </ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.emptyBody}>
          Answer a few quick questions about your goals, and we&apos;ll build a personalized roadmap —
          your top match first, with a complete plan to unlock.
        </ThemedText>
        <Button label="Build My Aesthetics Plan" icon="arrow-right" onPress={() => router.push('/quiz')} />
      </View>
    </Screen>
  );
}

export default function PlanScreen() {
  const { result, savedPlanItems } = useAppState();

  if (!result) {
    return <PlanEmptyState />;
  }

  const { topMatch, alternates } = result;
  const category = topMatch.category;
  const savedCategories = savedPlanItems
    .map((item) => treatmentCategories[item.categoryId])
    .filter((c) => c.id !== category.id);

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          MY AESTHETICS PLAN
        </ThemedText>
        <ThemedText variant="displaySmall" style={styles.title}>
          {concernLabels[result.concern]}
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.subtitle}>
          Primary goal · {areaLabels[result.area]}
        </ThemedText>

        <Card variant="surface" style={styles.topMatchCard}>
          <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.topMatchLabel}>
            TOP MATCH
          </ThemedText>
          <ThemedText variant="displaySmall" color={colors.textPrimary} style={styles.topMatchName}>
            {category.name}
          </ThemedText>
          <ThemedText variant="body" color={colors.textSecondary} style={styles.topMatchExplanation}>
            {topMatch.explanation}
          </ThemedText>
          <InfoRow label="BEST SUITED FOR" value={category.bestSuitedFor} />
          <InfoRow label="DOWNTIME" value={category.downtimeContext} />
        </Card>

        <View style={styles.actionsWrap}>
          <TreatmentActionsGrid categoryId={category.id} mode="plan" compareWithCategoryId={alternates[0]?.id} />
        </View>

        {savedCategories.length > 0 && (
          <>
            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              SAVED TO YOUR PLAN
            </ThemedText>
            {savedCategories.map((saved) => (
              <Pressable key={saved.id} onPress={() => router.push(`/bible/${saved.id}`)}>
                <Card variant="outline" style={styles.savedCard}>
                  <ThemedText variant="body" color={colors.textPrimary}>
                    {saved.name}
                  </ThemedText>
                  <Feather name="chevron-right" size={18} color={colors.textSecondary} />
                </Card>
              </Pressable>
            ))}
          </>
        )}

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          ALSO WORTH EXPLORING
        </ThemedText>
        <View style={styles.alternatesRow}>
          {alternates.map((alt) => (
            <View key={alt.id} style={styles.alternateChip}>
              <ThemedText variant="caption" color={colors.textPrimary}>
                {alt.name}
              </ThemedText>
            </View>
          ))}
        </View>

        <PremiumRoadmapCard alternates={alternates} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxxl,
  },
  emptyIcon: {
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
  },
  emptyBody: {
    marginBottom: spacing.lg,
  },
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xxs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  topMatchCard: {
    marginBottom: spacing.md,
  },
  topMatchLabel: {
    marginBottom: spacing.xs,
  },
  topMatchName: {
    marginBottom: spacing.xs,
  },
  topMatchExplanation: {
    marginBottom: spacing.md,
  },
  actionsWrap: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  alternatesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  alternateChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
