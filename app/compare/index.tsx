import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { treatmentCategories, type TreatmentCategoryId } from '../../src/domain/recommendation';
import {
  bibleStageLabels,
  bibleTreatments,
  facialAgingLayerLabels,
  type BibleTreatment,
} from '../../src/domain/bible';
import { colors, spacing } from '../../constants/theme';

const categoryRows: { label: string; get: (c: (typeof treatmentCategories)[TreatmentCategoryId]) => string }[] = [
  { label: 'BEST SUITED FOR', get: (c) => c.bestSuitedFor },
  { label: 'DOWNTIME', get: (c) => c.downtimeContext },
  { label: 'TYPICAL COST', get: (c) => c.costContext },
  { label: 'LONGEVITY', get: (c) => c.longevityContext },
];

// Treatment-level rows only render when BOTH treatments being compared have
// a non-empty value for that field — per the content-integration rule
// against fabricating a comparison field when either side lacks source
// data from the manuscript.
const treatmentRows: { label: string; get: (t: BibleTreatment) => string }[] = [
  { label: 'STAGE', get: (t) => bibleStageLabels[t.stage] },
  { label: 'PRIMARY LAYERS', get: (t) => t.primaryLayers.map((layer) => facialAgingLayerLabels[layer]).join(', ') },
  { label: 'WHAT THIS DOES NOT ADDRESS', get: (t) => t.whatItDoesNotAddress },
  { label: 'DISCOMFORT', get: (t) => t.discomfort },
  { label: 'REPEAT FREQUENCY', get: (t) => t.repeatFrequency },
  { label: 'VALUE CONTEXT', get: (t) => t.valueSummary },
  { label: 'WHO SHOULD RECONSIDER THIS', get: (t) => t.whoShouldSkip },
];

export default function CompareScreen() {
  const { a, b, ta, tb } = useLocalSearchParams<{ a?: string; b?: string; ta?: string; tb?: string }>();

  const treatmentA = ta ? bibleTreatments.find((t) => t.id === ta) : undefined;
  const treatmentB = tb ? bibleTreatments.find((t) => t.id === tb) : undefined;

  // Treatment-level compare (e.g. Botox vs. Dysport) takes priority when
  // both treatment ids resolve. Otherwise falls back to the original
  // category-level compare (e.g. a generic "tox vs. rf" comparison),
  // unchanged from before.
  const categoryIdA = treatmentA?.categoryId ?? (a as TreatmentCategoryId | undefined);
  const categoryIdB = treatmentB?.categoryId ?? (b as TreatmentCategoryId | undefined);
  const categoryA = categoryIdA ? treatmentCategories[categoryIdA] : undefined;
  const categoryB = categoryIdB ? treatmentCategories[categoryIdB] : undefined;

  if (!categoryA || !categoryB) {
    return (
      <Screen>
        <ScreenHeader />
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.notFound}>
          Choose two categories to compare from your plan.
        </ThemedText>
      </Screen>
    );
  }

  const nameA = treatmentA?.name ?? categoryA.name;
  const nameB = treatmentB?.name ?? categoryB.name;

  const visibleTreatmentRows =
    treatmentA && treatmentB
      ? treatmentRows.filter((row) => row.get(treatmentA).length > 0 && row.get(treatmentB).length > 0)
      : [];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          COMPARE
        </ThemedText>
        <ThemedText variant="displaySmall" style={styles.title}>
          {nameA} vs {nameB}
        </ThemedText>

        <View style={styles.columns}>
          <Card variant="surface" style={styles.column}>
            <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.columnTitle}>
              {nameA}
            </ThemedText>
            {categoryRows.map((row) => (
              <View key={row.label} style={styles.row}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {row.label}
                </ThemedText>
                <ThemedText variant="body" color={colors.textPrimary}>
                  {row.get(categoryA)}
                </ThemedText>
              </View>
            ))}
            {visibleTreatmentRows.map((row) => (
              <View key={row.label} style={styles.row}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {row.label}
                </ThemedText>
                <ThemedText variant="body" color={colors.textPrimary}>
                  {row.get(treatmentA as BibleTreatment)}
                </ThemedText>
              </View>
            ))}
          </Card>

          <Card variant="surface" style={styles.column}>
            <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.columnTitle}>
              {nameB}
            </ThemedText>
            {categoryRows.map((row) => (
              <View key={row.label} style={styles.row}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {row.label}
                </ThemedText>
                <ThemedText variant="body" color={colors.textPrimary}>
                  {row.get(categoryB)}
                </ThemedText>
              </View>
            ))}
            {visibleTreatmentRows.map((row) => (
              <View key={row.label} style={styles.row}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {row.label}
                </ThemedText>
                <ThemedText variant="body" color={colors.textPrimary}>
                  {row.get(treatmentB as BibleTreatment)}
                </ThemedText>
              </View>
            ))}
          </Card>
        </View>
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
    marginBottom: spacing.lg,
  },
  columns: {
    gap: spacing.sm,
  },
  column: {
    marginBottom: spacing.sm,
  },
  columnTitle: {
    marginBottom: spacing.sm,
  },
  row: {
    marginBottom: spacing.sm,
  },
});
