import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { treatmentCategories, type TreatmentCategoryId } from '../../src/domain/recommendation';
import {
  bibleStageLabels,
  bibleTreatments,
  facialAgingLayerLabels,
  type BibleTreatment,
  type BibleTreatmentId,
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

const allCategoryIds = Object.keys(treatmentCategories) as TreatmentCategoryId[];

export default function CompareScreen() {
  const { a, b, ta, tb } = useLocalSearchParams<{ a?: string; b?: string; ta?: string; tb?: string }>();
  const [pickedTreatmentB, setPickedTreatmentB] = useState<BibleTreatmentId | null>(null);
  const [pickedCategoryB, setPickedCategoryB] = useState<TreatmentCategoryId | null>(null);

  const treatmentA = ta ? bibleTreatments.find((t) => t.id === ta) : undefined;
  const explicitTreatmentB = tb ? bibleTreatments.find((t) => t.id === tb) : undefined;

  // Treatment-level compare (e.g. Botox vs. Dysport) takes priority when A
  // resolves as a named treatment. Otherwise falls back to category-level
  // compare (e.g. a generic "tox vs. rf" comparison).
  const categoryIdA = treatmentA?.categoryId ?? (a as TreatmentCategoryId | undefined);
  const categoryA = categoryIdA ? treatmentCategories[categoryIdA] : undefined;

  if (!treatmentA && !categoryA) {
    // Reached only via a direct/deep-link URL missing valid ids — every
    // in-app entry point (Bible detail, Bible list, Plan) already guards
    // against this. A deliberate, safe state rather than a picker: send
    // the user somewhere useful instead of leaving them at a dead end.
    return (
      <Screen>
        <ScreenHeader />
        <View style={styles.emptyState}>
          <Feather name="git-branch" size={22} color={colors.textMuted} style={styles.emptyIcon} />
          <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.notFound}>
            Choose two categories to compare from your plan.
          </ThemedText>
          <Button
            label="Browse The Bible"
            variant="secondary"
            fullWidth={false}
            icon="book-open"
            onPress={() => router.push('/bible')}
            style={styles.emptyCta}
          />
        </View>
      </Screen>
    );
  }

  // B resolves from, in order: an explicit URL param (deep link / entry
  // points that already know both sides, e.g. the Plan tab's category
  // compare) or an interactive pick made on this screen.
  const treatmentB = explicitTreatmentB ?? (pickedTreatmentB ? bibleTreatments.find((t) => t.id === pickedTreatmentB) : undefined);
  const categoryIdB = treatmentB?.categoryId ?? (b as TreatmentCategoryId | undefined) ?? pickedCategoryB ?? undefined;
  const categoryB = categoryIdB ? treatmentCategories[categoryIdB] : undefined;

  const isTreatmentMode = Boolean(treatmentA);
  const hasBothSides = Boolean(categoryA && categoryB);

  if (!hasBothSides) {
    // A resolved but B hasn't been chosen yet — the interactive picker.
    const options = isTreatmentMode
      ? bibleTreatments.filter((t) => t.id !== treatmentA!.id)
      : allCategoryIds.filter((id) => id !== categoryIdA).map((id) => treatmentCategories[id]);

    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ScreenHeader />
          <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
            COMPARE
          </ThemedText>

          <ThemedText variant="caption" color={colors.textSecondary} style={styles.pickerSectionLabel}>
            CURRENT TREATMENT
          </ThemedText>
          <Card variant="surface" style={styles.currentCard}>
            <ThemedText variant="bodyLarge" color={colors.textPrimary}>
              {treatmentA?.name ?? categoryA?.name}
            </ThemedText>
          </Card>

          <ThemedText variant="caption" color={colors.textSecondary} style={styles.pickerSectionLabel}>
            CHOOSE TREATMENT
          </ThemedText>
          {(options as (BibleTreatment | (typeof treatmentCategories)[TreatmentCategoryId])[]).map((option) => (
            <Pressable
              key={option.id}
              onPress={() =>
                isTreatmentMode
                  ? setPickedTreatmentB(option.id as BibleTreatmentId)
                  : setPickedCategoryB(option.id as TreatmentCategoryId)
              }
              accessibilityRole="button"
              accessibilityLabel={`Compare against ${option.name}`}
              style={styles.optionRow}
            >
              <ThemedText variant="body" color={colors.textPrimary}>
                {option.name}
              </ThemedText>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </ScrollView>
      </Screen>
    );
  }

  const nameA = treatmentA?.name ?? categoryA!.name;
  const nameB = treatmentB?.name ?? categoryB!.name;

  const visibleTreatmentRows =
    treatmentA && treatmentB
      ? treatmentRows.filter((row) => row.get(treatmentA).length > 0 && row.get(treatmentB).length > 0)
      : [];

  const canChangeSelection = !explicitTreatmentB && !b;

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
        {canChangeSelection && (
          <Button
            label="Change treatment"
            variant="ghost"
            fullWidth={false}
            icon="refresh-cw"
            onPress={() => {
              setPickedTreatmentB(null);
              setPickedCategoryB(null);
            }}
            style={styles.changeButton}
          />
        )}

        <View style={styles.columns}>
          <Card variant="surface" style={styles.column}>
            <ThemedText variant="caption" color={colors.textSecondary} style={styles.columnEyebrow}>
              CURRENT TREATMENT
            </ThemedText>
            <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.columnTitle}>
              {nameA}
            </ThemedText>
            {categoryRows.map((row) => (
              <View key={row.label} style={styles.row}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {row.label}
                </ThemedText>
                <ThemedText variant="body" color={colors.textPrimary}>
                  {row.get(categoryA!)}
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
            <ThemedText variant="caption" color={colors.textSecondary} style={styles.columnEyebrow}>
              {canChangeSelection ? 'CHOOSE TREATMENT' : ''}
            </ThemedText>
            <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.columnTitle}>
              {nameB}
            </ThemedText>
            {categoryRows.map((row) => (
              <View key={row.label} style={styles.row}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {row.label}
                </ThemedText>
                <ThemedText variant="body" color={colors.textPrimary}>
                  {row.get(categoryB!)}
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
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  notFound: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyCta: {
    paddingHorizontal: spacing.xl,
  },
  eyebrow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.sm,
  },
  changeButton: {
    paddingHorizontal: 0,
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },
  pickerSectionLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  currentCard: {
    marginBottom: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  columns: {
    gap: spacing.sm,
  },
  column: {
    marginBottom: spacing.sm,
  },
  columnEyebrow: {
    marginBottom: spacing.xxs,
    minHeight: 16,
  },
  columnTitle: {
    marginBottom: spacing.sm,
  },
  row: {
    marginBottom: spacing.sm,
  },
});
