import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { TreatmentCategory } from '../../src/domain/recommendation';
import { analytics } from '../../lib/services/analyticsClient';
import { colors, spacing } from '../../constants/theme';

type PremiumRoadmapCardProps = {
  alternates: TreatmentCategory[];
};

/**
 * The locked "Your Complete Aesthetics Roadmap" teaser shown below the
 * free top match on both the Result screen and the Plan tab — kept as one
 * component so the two stay visually and behaviorally identical.
 */
export function PremiumRoadmapCard({ alternates }: PremiumRoadmapCardProps) {
  return (
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
          <ThemedText variant="bodyLarge" color={colors.textOnIvory} style={styles.lockedLine}>
            Your personal roadmap
          </ThemedText>
          <ThemedText variant="bodyLarge" color={colors.textOnIvory} style={styles.lockedLine}>
            AI Preview — see your possibilities
          </ThemedText>
        </View>
        <View style={styles.lockOverlay}>
          <Feather name="lock" size={18} color={colors.textOnIvory} />
        </View>
      </View>

      <Button
        label="Unlock My Full Plan"
        onPress={() => {
          analytics.track('full_roadmap_clicked');
          router.push('/paywall');
        }}
        style={styles.unlockButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
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
