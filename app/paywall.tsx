import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/layout/Screen';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ThemedText } from '../components/typography/ThemedText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { colors, radius, spacing } from '../constants/theme';

const premiumFeatures = [
  'Full personalized roadmap',
  'Complete treatment library',
  'Aesthetics Passport',
  'AI Preview + Glow allowance',
  'Beauty Calendar',
  'Beauty Budget',
  'Comparisons',
];

// MOCK PAYWALL: no RevenueCat/entitlement wiring yet. Pricing shown here
// reflects the CLAUDE.md launch test ($14.99/mo, $99/yr annual hero offer).
// Pressing a plan does not process a purchase.
function handleMockPurchase() {
  Alert.alert('Coming Soon', 'Premium purchases will be available in a future update.');
}

export default function PaywallScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader closeIcon />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          THE AESTHETICS BIBLE PREMIUM
        </ThemedText>
        <ThemedText variant="displayMedium" style={styles.headline}>
          Unlock your complete aesthetics journey.
        </ThemedText>

        <Card variant="surface" style={styles.featuresCard}>
          {premiumFeatures.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Feather name="check" size={16} color={colors.accent} style={styles.featureIcon} />
              <ThemedText variant="body" color={colors.textPrimary}>
                {feature}
              </ThemedText>
            </View>
          ))}
        </Card>

        <Card variant="ivory" style={[styles.priceCard, styles.priceCardPrimary]}>
          <View style={styles.bestValueTag}>
            <ThemedText variant="caption" color={colors.textOnIvory}>
              BEST VALUE
            </ThemedText>
          </View>
          <ThemedText variant="displaySmall" color={colors.textOnIvory}>
            $99/year
          </ThemedText>
          <ThemedText variant="caption" color={colors.textMuted} style={styles.priceSubtext}>
            Just $8.25/month, billed annually
          </ThemedText>
          <Button label="Start My Journey" onPress={handleMockPurchase} style={styles.priceButton} />
        </Card>

        <Card variant="outline" style={styles.priceCard}>
          <ThemedText variant="displaySmall" color={colors.textPrimary}>
            $14.99/month
          </ThemedText>
          <ThemedText variant="caption" color={colors.textSecondary} style={styles.priceSubtext}>
            Billed monthly, cancel anytime
          </ThemedText>
          <Button label="Continue Monthly" variant="secondary" onPress={handleMockPurchase} style={styles.priceButton} />
        </Card>

        <ThemedText variant="caption" color={colors.textSecondary} style={styles.footnote}>
          Cancel anytime. Restore purchases from your account settings.
        </ThemedText>
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
  headline: {
    marginBottom: spacing.lg,
  },
  featuresCard: {
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    marginRight: spacing.xs,
  },
  priceCard: {
    marginBottom: spacing.md,
  },
  priceCardPrimary: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  bestValueTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  priceSubtext: {
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
  },
  priceButton: {
    marginTop: spacing.xs,
  },
  footnote: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
