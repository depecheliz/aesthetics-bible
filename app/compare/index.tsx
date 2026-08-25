import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { treatmentCategories, type TreatmentCategory, type TreatmentCategoryId } from '../../src/domain/recommendation';
import { colors, spacing } from '../../constants/theme';

const comparisonRows: { label: string; get: (c: TreatmentCategory) => string }[] = [
  { label: 'BEST SUITED FOR', get: (c) => c.bestSuitedFor },
  { label: 'DOWNTIME', get: (c) => c.downtimeContext },
  { label: 'TYPICAL COST', get: (c) => c.costContext },
  { label: 'LONGEVITY', get: (c) => c.longevityContext },
];

export default function CompareScreen() {
  const { a, b } = useLocalSearchParams<{ a?: string; b?: string }>();
  const categoryA = a ? treatmentCategories[a as TreatmentCategoryId] : undefined;
  const categoryB = b ? treatmentCategories[b as TreatmentCategoryId] : undefined;

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

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          COMPARE
        </ThemedText>
        <ThemedText variant="displaySmall" style={styles.title}>
          {categoryA.name} vs {categoryB.name}
        </ThemedText>

        <View style={styles.columns}>
          <Card variant="surface" style={styles.column}>
            <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.columnTitle}>
              {categoryA.name}
            </ThemedText>
            {comparisonRows.map((row) => (
              <View key={row.label} style={styles.row}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {row.label}
                </ThemedText>
                <ThemedText variant="body" color={colors.textPrimary}>
                  {row.get(categoryA)}
                </ThemedText>
              </View>
            ))}
          </Card>

          <Card variant="surface" style={styles.column}>
            <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.columnTitle}>
              {categoryB.name}
            </ThemedText>
            {comparisonRows.map((row) => (
              <View key={row.label} style={styles.row}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {row.label}
                </ThemedText>
                <ThemedText variant="body" color={colors.textPrimary}>
                  {row.get(categoryB)}
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
