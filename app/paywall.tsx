import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../components/layout/Screen';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ThemedText } from '../components/typography/ThemedText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Rule } from '../components/ui/Rule';
import { PlanPreviewMockup } from '../components/media/PlanPreviewMockup';
import { Monogram } from '../components/brand/Monogram';
import { useEntitlement } from '../lib/state/EntitlementContext';
import { analytics } from '../lib/services/analyticsClient';
import { isRevenueCatConfigured } from '../lib/services/revenueCatBilling';
import { colors, radius, spacing } from '../constants/theme';

// GLOW is intentionally not part of this list for V1 — it isn't built, and
// listing it here would be the same silent-fake-inside-a-paid-feature
// problem as the old mocked Preview button. It stays visible elsewhere in
// the app, clearly labeled "Coming Soon."
const premiumModules: { name: string; description: string }[] = [
  { name: 'PLAN', description: 'Your complete personalized roadmap.' },
  { name: 'PREVIEW', description: 'See aesthetic possibilities — 10 AI visualizations a month.' },
  { name: 'PASSPORT', description: 'Track every treatment and result.' },
  { name: 'THE BIBLE', description: 'Understand your options.' },
  { name: 'BOTOX BESTIE', description: 'Ask the questions you actually want answered.' },
];

type PlanId = 'weekly' | 'annual';

export default function PaywallScreen() {
  const {
    isPremium,
    isLoading,
    error,
    restoreMessage,
    offering,
    purchaseWeekly,
    purchaseAnnual,
    restorePurchases,
  } = useEntitlement();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');

  // Live RevenueCat pricing when the offering has loaded; otherwise fall
  // back to the launch-test prices from CLAUDE.md so the paywall never
  // shows a blank price while offerings load or in an unconfigured build.
  const annualPriceString = offering?.annual?.product.priceString ?? '$99';
  const annualPerWeekString = offering?.annual?.product.pricePerWeekString ?? '$1.90';
  const weeklyPriceString = offering?.weekly?.product.priceString ?? '$11.99';

  useEffect(() => {
    analytics.track('paywall_viewed');
  }, []);

  const selectPlan = (plan: PlanId) => {
    setSelectedPlan(plan);
    analytics.track(plan === 'weekly' ? 'weekly_selected' : 'annual_selected');
  };

  const handleUnlock = () => {
    if (selectedPlan === 'weekly') {
      purchaseWeekly();
    } else {
      purchaseAnnual();
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader closeIcon />

        <View style={styles.brandRow}>
          <Monogram size="sm" />
          <ThemedText variant="eyebrow" color={colors.accent}>
            AESTELLA PREMIUM
          </ThemedText>
        </View>
        <ThemedText variant="displayHero" style={styles.headline}>
          Your Personalized Aesthetic Plan Is Ready.
        </ThemedText>
        <ThemedText variant="body" color={colors.textSecondary} style={styles.subheadline}>
          Unlock your full roadmap, AI Preview, and your private Aesthetics Passport.
        </ThemedText>

        <PlanPreviewMockup />

        <Rule style={styles.rule} />

        {premiumModules.map((module) => (
          <View key={module.name} style={styles.moduleRow}>
            <ThemedText variant="eyebrow" color={colors.accent} style={styles.moduleName}>
              {module.name}
            </ThemedText>
            <ThemedText variant="bodyLarge" color={colors.textPrimary}>
              {module.description}
            </ThemedText>
          </View>
        ))}

        {isPremium ? (
          <Card variant="ivory" style={styles.premiumActiveCard}>
            <ThemedText variant="bodyLarge" color={colors.textOnIvory}>
              You&rsquo;re already Premium — thank you.
            </ThemedText>
          </Card>
        ) : (
          <>
            <Pressable onPress={() => selectPlan('annual')} accessibilityRole="button" accessibilityState={{ selected: selectedPlan === 'annual' }}>
              <Card
                variant="ivory"
                style={[
                  styles.priceCard,
                  selectedPlan === 'annual' ? styles.priceCardSelected : styles.priceCardUnselected,
                ]}
              >
                {selectedPlan === 'annual' && (
                  <View style={styles.selectedCheck}>
                    <Feather name="check" size={14} color={colors.textOnIvory} />
                  </View>
                )}
                <View style={styles.bestValueTag}>
                  <ThemedText variant="caption" color={colors.textOnIvory}>
                    BEST VALUE
                  </ThemedText>
                </View>
                <ThemedText variant="eyebrow" color={colors.textOnIvory} style={styles.planName}>
                  YOUR AESTELLA COMPANION
                </ThemedText>
                <ThemedText variant="statHero" color={colors.textOnIvory}>
                  {annualPriceString}
                </ThemedText>
                <ThemedText variant="eyebrow" color={colors.textOnIvory} style={styles.priceUnit}>
                  PER YEAR
                </ThemedText>
                <ThemedText variant="caption" color={colors.textMuted} style={styles.priceSubtext}>
                  Just {annualPerWeekString}/week, billed annually
                </ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Plan. Preview. Track. Keep Aestella with you throughout your aesthetics journey.
                </ThemedText>
              </Card>
            </Pressable>

            <Pressable onPress={() => selectPlan('weekly')} accessibilityRole="button" accessibilityState={{ selected: selectedPlan === 'weekly' }}>
              <Card
                variant="ivory"
                style={[
                  styles.priceCard,
                  selectedPlan === 'weekly' ? styles.priceCardSelected : styles.priceCardUnselected,
                ]}
              >
                {selectedPlan === 'weekly' && (
                  <View style={styles.selectedCheck}>
                    <Feather name="check" size={14} color={colors.textOnIvory} />
                  </View>
                )}
                <ThemedText variant="eyebrow" color={colors.textOnIvory} style={styles.planName}>
                  EXPLORE
                </ThemedText>
                <ThemedText variant="statHero" color={colors.textOnIvory}>
                  {weeklyPriceString}
                </ThemedText>
                <ThemedText variant="eyebrow" color={colors.textOnIvory} style={styles.priceUnit}>
                  FOR 1 WEEK
                </ThemedText>
                <ThemedText variant="caption" color={colors.textMuted} style={styles.priceSubtext}>
                  For exploring your personalized plan and possibilities.
                </ThemedText>
                <ThemedText variant="caption" color={colors.textOnIvory} style={styles.priceCompare}>
                  That&rsquo;s {weeklyPriceString} every week — the annual plan works out to just{' '}
                  {annualPerWeekString}/week.
                </ThemedText>
              </Card>
            </Pressable>

            <Button
              label={isRevenueCatConfigured ? 'Unlock My Aestella Plan' : 'Purchases Unavailable'}
              disabled={!isRevenueCatConfigured}
              onPress={handleUnlock}
              loading={isLoading}
              style={styles.unlockButton}
            />

            {!isRevenueCatConfigured && (
              <ThemedText variant="caption" color={colors.textSecondary} style={styles.errorText}>
                Purchases are unavailable in this build. You can continue exploring the free features.
              </ThemedText>
            )}

            {error && (
              <ThemedText variant="caption" color={colors.accent} style={styles.errorText}>
                {error}
              </ThemedText>
            )}

            <Button
              label="Restore Purchases"
              disabled={!isRevenueCatConfigured}
              variant="ghost"
              onPress={restorePurchases}
              loading={isLoading}
              style={styles.restoreButton}
            />

            {restoreMessage && (
              <ThemedText variant="caption" color={colors.textSecondary} style={styles.errorText}>
                {restoreMessage}
              </ThemedText>
            )}
          </>
        )}

        <ThemedText variant="caption" color={colors.textSecondary} style={styles.footnote}>
          Preview is included with a monthly Premium allowance of 10 successful visualizations —
          not unlimited generations. Cancel anytime.
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  headline: {
    marginBottom: spacing.sm,
  },
  subheadline: {
    marginBottom: spacing.lg,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.md,
  },
  moduleRow: {
    marginBottom: spacing.md,
  },
  moduleName: {
    marginBottom: spacing.xxs,
    letterSpacing: 1.6,
  },
  priceCard: {
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  priceCardSelected: {
    borderColor: colors.accent,
  },
  priceCardUnselected: {
    opacity: 0.55,
  },
  selectedCheck: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumActiveCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  bestValueTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    marginBottom: spacing.sm,
  },
  planName: {
    marginBottom: spacing.xs,
  },
  priceUnit: {
    marginTop: spacing.xxs,
  },
  priceSubtext: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  priceCompare: {
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  unlockButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  restoreButton: {
    marginBottom: spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  footnote: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
