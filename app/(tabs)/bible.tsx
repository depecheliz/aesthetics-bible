import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Card } from '../../components/ui/Card';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterChip } from '../../components/ui/FilterChip';
import {
  bibleCategoryFilters,
  bibleConcerns,
  bibleTreatments,
  filterBibleTreatmentsByCategory,
  searchBibleTreatments,
  type BibleConcernId,
} from '../../src/domain/bible';
import { treatmentCategories, type TreatmentCategoryId } from '../../src/domain/recommendation';
import { colors, radius, spacing } from '../../constants/theme';

export default function BibleScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TreatmentCategoryId | 'all'>('all');
  const [selectedConcernId, setSelectedConcernId] = useState<BibleConcernId | null>(null);

  const results = useMemo(() => {
    const searched = searchBibleTreatments(query, bibleTreatments);

    if (selectedConcernId) {
      const concern = bibleConcerns.find((c) => c.id === selectedConcernId);
      const ids = new Set((concern?.relatedTreatments ?? []).map((t) => t.id));
      return searched.filter((treatment) => ids.has(treatment.id));
    }

    return filterBibleTreatmentsByCategory(selectedCategory, searched);
  }, [query, selectedCategory, selectedConcernId]);

  const selectConcern = (id: BibleConcernId) => {
    setSelectedConcernId((prev) => (prev === id ? null : id));
    setSelectedCategory('all');
  };

  const selectCategory = (id: TreatmentCategoryId | 'all') => {
    setSelectedCategory(id);
    setSelectedConcernId(null);
  };

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          THE BIBLE
        </ThemedText>
        <ThemedText variant="displaySmall" style={styles.title}>
          Your Aesthetics Library
        </ThemedText>

        <SearchInput value={query} onChangeText={setQuery} placeholder="Search treatments" />

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          BROWSE BY CONCERN
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.concernScroll}>
          {bibleConcerns.map((concern) => {
            const selected = selectedConcernId === concern.id;
            return (
              <Pressable
                key={concern.id}
                onPress={() => selectConcern(concern.id)}
                accessibilityRole="button"
                accessibilityLabel={concern.name}
                accessibilityState={{ selected }}
              >
                <Card variant={selected ? 'ivory' : 'outline'} style={styles.concernCard}>
                  <ThemedText
                    variant="body"
                    color={selected ? colors.textOnIvory : colors.textPrimary}
                    style={styles.concernLabel}
                  >
                    {concern.name}
                  </ThemedText>
                </Card>
              </Pressable>
            );
          })}
        </ScrollView>

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          CATEGORY
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <FilterChip label="All" selected={selectedCategory === 'all'} onPress={() => selectCategory('all')} />
          {bibleCategoryFilters.map((categoryId) => (
            <FilterChip
              key={categoryId}
              label={treatmentCategories[categoryId].name}
              selected={selectedCategory === categoryId}
              onPress={() => selectCategory(categoryId)}
            />
          ))}
        </ScrollView>

        <View style={styles.results}>
          {results.length === 0 ? (
            <ThemedText variant="body" color={colors.textSecondary} style={styles.emptyText}>
              No matches for that search.
            </ThemedText>
          ) : (
            results.map((treatment) => (
              <Pressable key={treatment.id} onPress={() => router.push(`/bible/${treatment.id}`)}>
                <Card variant="surface" style={styles.treatmentCard}>
                  <ThemedText variant="bodyLarge" color={colors.textPrimary}>
                    {treatment.name}
                  </ThemedText>
                  <ThemedText variant="caption" color={colors.accent} style={styles.treatmentCategory}>
                    {treatmentCategories[treatment.categoryId].name.toUpperCase()}
                  </ThemedText>
                  <ThemedText variant="body" color={colors.textSecondary} numberOfLines={2} style={styles.treatmentOverview}>
                    {treatment.overview}
                  </ThemedText>
                </Card>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  concernScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  concernCard: {
    marginRight: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  concernLabel: {
    minWidth: 110,
  },
  filterScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  results: {
    marginTop: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  treatmentCard: {
    marginBottom: spacing.sm,
  },
  treatmentCategory: {
    marginTop: spacing.xxs,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  treatmentOverview: {},
});
