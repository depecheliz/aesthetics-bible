import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { InfoRow } from '../../components/ui/InfoRow';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { bibleCategoryImages, bibleCategoryAspectRatios } from '../../assets/brand/bible';
import { TreatmentActionsGrid } from '../../components/plan/TreatmentActionsGrid';
import { ShareCard, ShareCardStatRow } from '../../components/media/ShareCard';
import { useAppState } from '../../lib/state/AppStateContext';
import { analytics } from '../../lib/services/analyticsClient';
import { areaLabels, concernLabels, intensityLabels } from '../../src/domain/quiz';
import { colors, spacing } from '../../constants/theme';

export default function ResultScreen() {
  const { result } = useAppState();
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (!result) {
      router.replace('/quiz');
    }
  }, [result]);

  useEffect(() => {
    if (!result || hasTrackedView.current) {
      return;
    }
    hasTrackedView.current = true;
    analytics.track('top_match_viewed');
  }, [result]);

  if (!result) {
    return null;
  }

  const { topMatch, alternates, budgetNote } = result;
  const category = topMatch.category;
  const matchCount = alternates.length;
  const personalizedReason = `Selected for your ${concernLabels[result.concern].toLowerCase()} goal, focused on your ${areaLabels[result.area].toLowerCase()}, with a ${intensityLabels[result.intensity].toLowerCase()} result in mind.`;

  const matchReasons = [
    { label: 'Your goal', value: concernLabels[result.concern] },
    { label: 'Focus area', value: areaLabels[result.area] },
    { label: 'Your style', value: intensityLabels[result.intensity] },
  ];

  const unlockBlueprint = () => {
    analytics.track('full_roadmap_clicked');
    router.push('/paywall');
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <View style={styles.revealHeader}>
          <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
            YOUR AESTELLA PROFILE
          </ThemedText>
          <ThemedText variant="displaySmall" color={colors.textPrimary} style={styles.revealTitle}>
            Your #1 Match
          </ThemedText>
          <ThemedText variant="displayHero" style={styles.categoryName}>
            {category.name}
          </ThemedText>
          <ThemedText variant="body" color={colors.textSecondary} style={styles.personalizedReason}>
            {personalizedReason}
          </ThemedText>
        </View>

        <EditorialImage
          variant="treatment"
          uri={bibleCategoryImages[category.id].preview}
          zoomSource={bibleCategoryImages[category.id].full}
          zoomable
          aspectRatio={bibleCategoryAspectRatios[category.id]}
          fit="contain"
          label={category.name}
          style={styles.heroImage}
        />

        <View style={styles.whyList}>
          {matchReasons.map((reason) => (
            <View key={reason.label} style={styles.whyRow}>
              <Feather name="check" size={15} color={colors.accent} style={styles.checkIcon} />
              <View style={styles.whyCopy}>
                <ThemedText variant="caption" color={colors.textSecondary}>
                  {reason.label.toUpperCase()}
                </ThemedText>
                <ThemedText variant="body" color={colors.textPrimary}>
                  {reason.value}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <Card variant="ivory" style={styles.unlockCard}>
          <View style={styles.unlockTopline}>
            <Feather name="lock" size={16} color={colors.accent} />
            <ThemedText variant="eyebrow" color={colors.accent}>
              YOUR FULL AESTELLA BLUEPRINT IS READY
            </ThemedText>
          </View>
          <ThemedText variant="displaySmall" color={colors.textOnIvory} style={styles.unlockHeadline}>
            {matchCount > 0
              ? `${matchCount} more ${matchCount === 1 ? 'match' : 'matches'} selected for you.`
              : 'Your complete personalized roadmap is ready.'}
          </ThemedText>
          <ThemedText variant="body" color={colors.textMuted} style={styles.unlockDetails}>
            Your treatment roadmap · full comparisons · AI Preview
          </ThemedText>
          <Button label="Unlock My Blueprint" onPress={unlockBlueprint} style={styles.unlockButton} />
        </Card>

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.detailsLabel}>
          YOUR MATCH AT A GLANCE
        </ThemedText>
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
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  revealHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  eyebrow: {
    marginBottom: spacing.xs,
  },
  revealTitle: {
    marginBottom: spacing.xxs,
  },
  categoryName: {
    marginBottom: spacing.sm,
  },
  personalizedReason: {
    maxWidth: 420,
  },
  heroImage: {
    marginBottom: spacing.md,
  },
  whyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  whyRow: {
    flexGrow: 1,
    flexBasis: 110,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  checkIcon: {
    marginTop: 2,
    marginRight: spacing.xs,
  },
  whyCopy: {
    flex: 1,
  },
  unlockCard: {
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  unlockTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unlockHeadline: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  unlockDetails: {
    marginBottom: spacing.md,
  },
  unlockButton: {
    marginTop: spacing.xs,
  },
  detailsLabel: {
    marginBottom: spacing.sm,
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
