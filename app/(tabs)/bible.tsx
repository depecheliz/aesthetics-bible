import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterChip } from '../../components/ui/FilterChip';
import { Rule } from '../../components/ui/Rule';
import {
  bibleCategoryFilters,
  bibleConcerns,
  bibleTreatments,
  filterBibleTreatmentsByCategory,
  searchBibleTreatments,
  type BibleConcernId,
} from '../../src/domain/bible';
import { treatmentCategories, type TreatmentCategoryId } from '../../src/domain/recommendation';
import { colors, spacing } from '../../constants/theme';

const mostExplored = bibleTreatments.slice(0, 3);

function stepNumber(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

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

  const isFiltered = query.length > 0 || selectedCategory !== 'all' || selectedConcernId !== null;

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
        <ThemedText variant="displayLarge" style={styles.title}>
          Your Aesthetics Library
        </ThemedText>

        <SearchInput value={query} onChangeText={setQuery} placeholder="Search treatments" />

        {!isFiltered && (
          <>
            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              MOST EXPLORED
            </ThemedText>
            <View style={styles.mostExploredRow}>
              {mostExplored.map((treatment) => (
                <Pressable
                  key={treatment.id}
                  onPress={() => router.push(`/bible/${treatment.id}`)}
                  style={styles.mostExploredItem}
                >
                  <ThemedText variant="body" color={colors.textPrimary}>
                    {treatment.name}
                  </ThemedText>
                  <Feather name="arrow-right" size={13} color={colors.accent} />
                </Pressable>
              ))}
            </View>
            <Rule style={styles.sectionRule} />
          </>
        )}

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          BY CONCERN
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {bibleConcerns.map((concern) => (
            <FilterChip
              key={concern.id}
              label={concern.name}
              selected={selectedConcernId === concern.id}
              onPress={() => selectConcern(concern.id)}
            />
          ))}
        </ScrollView>

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          CATEGORY
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
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

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          TREATMENT INDEX
        </ThemedText>
        <View style={styles.results}>
          {results.length === 0 ? (
            <ThemedText variant="body" color={colors.textSecondary} style={styles.emptyText}>
              No matches for that search.
            </ThemedText>
          ) : (
            results.map((treatment, index) => (
              <Pressable key={treatment.id} onPress={() => router.push(`/bible/${treatment.id}`)}>
                <View style={styles.indexRow}>
                  <ThemedText variant="numberLabel" color={colors.textMuted} style={styles.indexNumber}>
                    {stepNumber(index + 1)}
                  </ThemedText>
                  <View style={styles.indexBody}>
                    <ThemedText variant="displaySmall" color={colors.textPrimary}>
                      {treatment.name}
                    </ThemedText>
                    <ThemedText variant="caption" color={colors.accent} style={styles.treatmentCategory}>
                      {treatmentCategories[treatment.categoryId].name.toUpperCase()}
                    </ThemedText>
                    <ThemedText
                      variant="body"
                      color={colors.textSecondary}
                      numberOfLines={2}
                      style={styles.treatmentOverview}
                    >
                      {treatment.overview}
                    </ThemedText>
                    <View style={styles.exploreRow}>
                      <ThemedText variant="caption" color={colors.accent} style={styles.exploreLabel}>
                        EXPLORE
                      </ThemedText>
                      <Feather name="arrow-right" size={12} color={colors.accent} />
                    </View>
                  </View>
                </View>
                <Rule style={styles.itemRule} />
              </Pressable>
            ))
          )}
        </View>

        {!isFiltered && (
          <>
            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              COMPARE
            </ThemedText>
            <Pressable
              onPress={() => router.push('/compare?a=ultrasound&b=rf')}
              style={styles.compareRow}
              accessibilityRole="button"
              accessibilityLabel="Sofwave vs RF Microneedling"
            >
              <ThemedText variant="bodyLarge" color={colors.textPrimary}>
                Sofwave vs RF Microneedling
              </ThemedText>
              <Feather name="arrow-right" size={16} color={colors.accent} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/botox-bestie')}
              style={styles.compareRow}
              accessibilityRole="button"
              accessibilityLabel="Ask Botox Bestie"
            >
              <View>
                <ThemedText variant="bodyLarge" color={colors.textPrimary}>
                  Not sure where to start?
                </ThemedText>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  Ask Botox Bestie
                </ThemedText>
              </View>
              <Feather name="arrow-right" size={16} color={colors.accent} />
            </Pressable>
          </>
        )}
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
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  mostExploredRow: {
    gap: spacing.sm,
  },
  mostExploredItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  sectionRule: {
    width: '100%',
    opacity: 0.4,
    marginTop: spacing.sm,
  },
  chipScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  results: {},
  emptyText: {
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  indexRow: {
    flexDirection: 'row',
    paddingVertical: spacing.lg,
  },
  indexNumber: {
    width: 32,
  },
  indexBody: {
    flex: 1,
  },
  treatmentCategory: {
    marginTop: spacing.xxs,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  treatmentOverview: {
    marginBottom: spacing.sm,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  exploreLabel: {
    letterSpacing: 1.4,
  },
  itemRule: {
    width: '100%',
    opacity: 0.4,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
