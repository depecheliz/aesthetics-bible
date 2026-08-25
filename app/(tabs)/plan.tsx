import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { TreatmentActionsGrid } from '../../components/plan/TreatmentActionsGrid';
import { PremiumRoadmapCard } from '../../components/plan/PremiumRoadmapCard';
import { useAppState } from '../../lib/state/AppStateContext';
import { concernLabels, areaLabels } from '../../src/domain/quiz';
import { treatmentCategories } from '../../src/domain/recommendation';
import { colors, radius, spacing } from '../../constants/theme';

function PlanEmptyState() {
  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.emptyContent} showsVerticalScrollIndicator={false}>
        <EditorialImage variant="portrait" style={styles.emptyImage} />
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.emptyEyebrow}>
          MY AESTHETICS PLAN
        </ThemedText>
        <ThemedText variant="displayLarge" style={styles.emptyTitle}>
          Your face.{'\n'}Your goals.{'\n'}Your plan.
        </ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.emptyBody}>
          Answer a few questions about what matters to you and discover the aesthetic categories
          worth exploring.
        </ThemedText>
        <Button label="Build My Plan" icon="arrow-right" onPress={() => router.push('/quiz')} />
      </ScrollView>
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
        <ThemedText variant="displaySmall" color={colors.textSecondary} style={styles.goalLabel}>
          {concernLabels[result.concern]} · {areaLabels[result.area]}
        </ThemedText>

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.topMatchLabel}>
          #1 MATCH
        </ThemedText>
        <ThemedText variant="displayHero" color={colors.textPrimary} style={styles.topMatchName}>
          {category.name}
        </ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.topMatchExplanation}>
          {topMatch.explanation}
        </ThemedText>
        <Rule style={styles.rule} />

        <TreatmentActionsGrid categoryId={category.id} mode="plan" compareWithCategoryId={alternates[0]?.id} />

        {savedCategories.length > 0 && (
          <>
            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              SAVED TO YOUR PLAN
            </ThemedText>
            {savedCategories.map((saved) => (
              <Pressable key={saved.id} onPress={() => router.push(`/bible/${saved.id}`)} style={styles.savedRow}>
                <ThemedText variant="body" color={colors.textPrimary}>
                  {saved.name}
                </ThemedText>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
            <Rule style={styles.rule} />
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
  emptyContent: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  emptyImage: {
    marginBottom: spacing.lg,
  },
  emptyEyebrow: {
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    marginBottom: spacing.md,
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
  goalLabel: {
    marginBottom: spacing.xl,
  },
  topMatchLabel: {
    marginBottom: spacing.xs,
  },
  topMatchName: {
    marginBottom: spacing.md,
  },
  topMatchExplanation: {
    marginBottom: spacing.lg,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
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
