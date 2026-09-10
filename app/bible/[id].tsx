import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { InfoRow } from '../../components/ui/InfoRow';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { bibleCategoryAspectRatios, bibleCategoryImages } from '../../assets/brand/bible';
import {
  bibleCoreProviderQuestions,
  bibleSpecificProviderQuestions,
  bibleStageLabels,
  facialAgingLayerLabels,
  findComparableCategoryId,
  findComparableTreatmentId,
  getBibleTreatmentById,
  type BibleTreatmentId,
} from '../../src/domain/bible';
import { treatmentCategories } from '../../src/domain/recommendation';
import { colors, spacing } from '../../constants/theme';

export default function TreatmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const treatment = id ? getBibleTreatmentById(id) : undefined;

  if (!treatment) {
    return (
      <Screen>
        <ScreenHeader />
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.notFound}>
          We couldn&apos;t find that entry in The Bible.
        </ThemedText>
      </Screen>
    );
  }

  const category = treatmentCategories[treatment.categoryId];

  // Prefer comparing against another named treatment in the same category
  // (e.g. Botox vs. Dysport) so Compare can show real treatment-level
  // differences. Falls back to the category-level comparison when this
  // is the only named treatment in its category.
  const compareTreatmentId = findComparableTreatmentId(treatment.id as BibleTreatmentId);
  const compareCategoryId = findComparableCategoryId(treatment.categoryId);
  const compareHref = compareTreatmentId
    ? `/compare?ta=${treatment.id}&tb=${compareTreatmentId}`
    : compareCategoryId
      ? `/compare?a=${category.id}&b=${compareCategoryId}`
      : undefined;

  const hasStageContext = treatment.primaryLayers.length > 0;
  const specificQuestions = bibleSpecificProviderQuestions[treatment.id as BibleTreatmentId] ?? [];
  const providerQuestions = [...bibleCoreProviderQuestions, ...specificQuestions];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <EditorialImage
          variant="treatment"
          uri={bibleCategoryImages[treatment.categoryId].preview}
          zoomSource={bibleCategoryImages[treatment.categoryId].full}
          zoomable
          fit="contain"
          aspectRatio={bibleCategoryAspectRatios[treatment.categoryId]}
          label={treatment.name}
          style={styles.heroImage}
        />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          THE BIBLE · {category.name.toUpperCase()}
        </ThemedText>
        <ThemedText variant="displayHero" style={styles.title}>
          {treatment.name}
        </ThemedText>
        {treatment.aliases.length > 0 && (
          <ThemedText variant="caption" color={colors.textSecondary} style={styles.aliases}>
            Also known as: {treatment.aliases.join(', ')}
          </ThemedText>
        )}
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.overview}>
          {treatment.overview}
        </ThemedText>

        {hasStageContext && (
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <ThemedText variant="caption" color={colors.accent}>
                {bibleStageLabels[treatment.stage].toUpperCase()} STAGE
              </ThemedText>
            </View>
            {treatment.primaryLayers.map((layer) => (
              <View key={layer} style={styles.badge}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {facialAgingLayerLabels[layer]}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        <Rule style={styles.rule} />
        <InfoRow label="BEST SUITED FOR" value={category.bestSuitedFor} />
        <InfoRow label="DOWNTIME" value={category.downtimeContext} />
        <InfoRow label="TYPICAL COST" value={category.costContext} />
        <InfoRow label="LONGEVITY" value={category.longevityContext} />

        {treatment.whatItDoesNotAddress.length > 0 && (
          <InfoRow label="WHAT THIS DOES NOT ADDRESS" value={treatment.whatItDoesNotAddress} />
        )}
        {treatment.discomfort.length > 0 && <InfoRow label="DISCOMFORT" value={treatment.discomfort} />}
        {treatment.repeatFrequency.length > 0 && (
          <InfoRow label="REPEAT FREQUENCY" value={treatment.repeatFrequency} />
        )}
        {treatment.valueSummary.length > 0 && <InfoRow label="VALUE CONTEXT" value={treatment.valueSummary} />}
        {treatment.whoShouldSkip.length > 0 && (
          <InfoRow label="WHO SHOULD RECONSIDER THIS" value={treatment.whoShouldSkip} />
        )}

        <View style={styles.actionsRow}>
          {compareHref && (
            <Button
              label="Compare"
              icon="bar-chart-2"
              variant="secondary"
              fullWidth={false}
              style={styles.actionButton}
              onPress={() => router.push(compareHref as Href)}
            />
          )}
          <Button
            label="Ask Bestie"
            icon="message-circle"
            variant="secondary"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => router.push('/botox-bestie')}
          />
          <Button
            label="Find Near Me"
            icon="map-pin"
            variant="secondary"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => router.push('/near-me')}
          />
        </View>

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          QUESTIONS TO ASK A PROVIDER
        </ThemedText>
        {providerQuestions.map((question) => (
          <View key={question} style={styles.questionRow}>
            <Feather name="help-circle" size={16} color={colors.accent} style={styles.questionIcon} />
            <ThemedText variant="body" color={colors.textPrimary} style={styles.questionText}>
              {question}
            </ThemedText>
          </View>
        ))}

        <ThemedText variant="caption" color={colors.textMuted} style={styles.footnote}>
          Content version {treatment.contentVersion} · reviewed {treatment.reviewDate}
        </ThemedText>
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
  heroImage: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  aliases: {
    marginBottom: spacing.sm,
  },
  overview: {
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  badge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
  },
  sectionLabel: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  questionRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  questionIcon: {
    marginTop: 2,
    marginRight: spacing.xs,
  },
  questionText: {
    flex: 1,
  },
  footnote: {
    marginTop: spacing.md,
  },
});
