import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { InfoRow } from '../../components/ui/InfoRow';
import { useAppState } from '../../lib/state/AppStateContext';
import { colors, spacing } from '../../constants/theme';

export default function ResultScreen() {
  const { result, savePlanItem, isPlanItemSaved } = useAppState();

  useEffect(() => {
    if (!result) {
      router.replace('/quiz');
    }
  }, [result]);

  if (!result) {
    return null;
  }

  const { topMatch, alternates, budgetNote } = result;
  const category = topMatch.category;
  const saved = isPlanItemSaved(category.id);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          YOUR #1 AREA TO EXPLORE
        </ThemedText>
        <ThemedText variant="displayMedium" style={styles.categoryName}>
          {category.name}
        </ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.explanation}>
          {topMatch.explanation}
        </ThemedText>

        <Card variant="surface" style={styles.infoCard}>
          <InfoRow label="BEST SUITED FOR" value={category.bestSuitedFor} />
          <InfoRow label="DOWNTIME" value={category.downtimeContext} />
          <InfoRow label="TYPICAL COST" value={category.costContext} />
          <InfoRow label="LONGEVITY" value={category.longevityContext} />
        </Card>
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.budgetNote}>
          {budgetNote}
        </ThemedText>

        <View style={styles.actionsGrid}>
          <Button
            label="Learn More"
            icon="book-open"
            variant="secondary"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => router.push(`/bible/${category.id}`)}
          />
          <Button
            label="Preview"
            icon="camera"
            variant="secondary"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => router.push('/preview')}
          />
          <Button
            label="Find Near Me"
            icon="map-pin"
            variant="secondary"
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => router.push('/near-me')}
          />
          <Button
            label={saved ? 'Saved' : 'Save to My Plan'}
            icon={saved ? 'check' : 'bookmark'}
            variant={saved ? 'ghost' : 'secondary'}
            fullWidth={false}
            style={styles.actionButton}
            onPress={() => savePlanItem(category.id)}
          />
        </View>

        <Card variant="ivory" style={styles.premiumCard}>
          <ThemedText variant="eyebrow" color={colors.accent}>
            YOUR COMPLETE AESTHETICS ROADMAP
          </ThemedText>
          <ThemedText variant="displaySmall" color={colors.textOnIvory} style={styles.premiumHeadline}>
            Unlock every match, plus full comparisons.
          </ThemedText>

          <View style={styles.lockedArea}>
            <View style={styles.lockedContent}>
              {alternates.map((alt) => (
                <ThemedText key={alt.id} variant="bodyLarge" color={colors.textOnIvory} style={styles.lockedLine}>
                  {alt.name}
                </ThemedText>
              ))}
              <ThemedText variant="bodyLarge" color={colors.textOnIvory} style={styles.lockedLine}>
                Full treatment comparisons
              </ThemedText>
            </View>
            <View style={styles.lockOverlay}>
              <Feather name="lock" size={18} color={colors.textOnIvory} />
            </View>
          </View>

          <Button label="Unlock My Full Plan" onPress={() => router.push('/paywall')} style={styles.unlockButton} />
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  categoryName: {
    marginBottom: spacing.sm,
  },
  explanation: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    marginBottom: spacing.xs,
  },
  budgetNote: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  actionButton: {
    width: '48%',
    marginBottom: spacing.sm,
  },
  premiumCard: {
    overflow: 'hidden',
  },
  premiumHeadline: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  lockedArea: {
    marginBottom: spacing.lg,
  },
  lockedContent: {
    opacity: 0.32,
  },
  lockedLine: {
    marginBottom: spacing.xs,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlayOnIvory,
  },
  unlockButton: {
    marginTop: spacing.xs,
  },
});
