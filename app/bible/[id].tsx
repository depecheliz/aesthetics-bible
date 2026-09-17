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
import { bibleCategoryImages, bibleCategoryAspectRatios } from '../../assets/brand/bible';
import {
  bibleCoreProviderQuestions,
  bibleSpecificProviderQuestions,
  bibleStageLabels,
  bibleTreatments,
  facialAgingLayerLabels,
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

  // Carries only this treatment as comparison A — Compare's own screen
  // presents CURRENT TREATMENT vs. an interactive CHOOSE TREATMENT picker
  // for B, rather than this screen guessing a second treatment for the
  // user. getBibleTreatmentById falls back to a synthetic, category-only
  // "treatment" (e.g. Peels) for categories with no named entry yet — that
  // synthetic id isn't in bibleTreatments, so it must be sent to Compare
  // as a category id (`a=`), not a treatment id (`ta=`).
  const isNamedTreatment = bibleTreatments.some((t) => t.id === treatment.id);
  const compareHref = isNamedTreatment ? `/compare?ta=${treatment.id}` : `/compare?a=${category.id}`;

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
          aspectRatio={bibleCategoryAspectRatios[treatment.categoryId]}
          fit="contain"
          label={treatment.name}
          style={styles.heroImage}
        />
        <ThemedText variant="caption" color={colors.textMuted} style={styles.diagramHint}>
          Tap image to view full diagram
        </ThemedText>

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
          // Metadata, not controls — plain, non-interactive Views/Text, no
          // onPress/accessibilityRole="button" anywhere in this block. Both
          // badge kinds share the same box styling AND text color so a
          // layer badge (e.g. "Muscle movement") reads as equally
          // first-class metadata, not a muted/disabled variant of the
          // stage badge — only the label text itself differs between them.
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <ThemedText variant="caption" color={colors.textPrimary}>
                {bibleStageLabels[treatment.stage].toUpperCase()} STAGE
              </ThemedText>
            </View>
            {treatment.primaryLayers.map((layer) => (
              <View key={layer} style={styles.badge}>
                <ThemedText variant="caption" color={colors.textPrimary}>
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
          <Button
            label="Compare"
            icon="bar-chart-2"
            variant="secondary"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => router.push(compareHref as Href)}
          />
          <Button
            label="Ask Bestie"
            icon="message-circle"
            variant="secondary"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => router.push('/botox-bestie')}
          />
          {/* "Find Near Me" launch entry point hidden for this release —
              the /near-me route and its implementation are untouched. */}
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
    marginBottom: spacing.xs,
  },
  diagramHint: {
    marginBottom: spacing.lg,
    letterSpacing: 0.6,
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
