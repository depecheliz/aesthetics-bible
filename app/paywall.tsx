import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../components/layout/Screen';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ThemedText } from '../components/typography/ThemedText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Rule } from '../components/ui/Rule';
import { BeforeAfterFrame } from '../components/media/BeforeAfterFrame';
import { Monogram } from '../components/brand/Monogram';
import { campaignImages } from '../assets/brand/campaign';
import { useEntitlement } from '../lib/state/EntitlementContext';
import { analytics } from '../lib/services/analyticsClient';
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
  const { isPremium, isLoading, error, purchaseWeekly, purchaseAnnual, restorePurchases } = useEntitlement();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('annual');

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

        <BeforeAfterFrame
          leftLabel="TODAY"
          rightLabel="ORGANIZED"
          leftUri={campaignImages.homeHero}
          rightUri={campaignImages.paywallStory}
        />
        <ThemedText variant="caption" color={colors.textMuted} style={styles.storyCaption}>
          From scattered notes and screenshots to one private, beautiful record.
        </ThemedText>

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
                style={[styles.priceCard, selectedPlan === 'annual' && styles.priceCardSelected]}
              >
                <View style={styles.bestValueTag}>
                  <ThemedText variant="caption" color={colors.textOnIvory}>
                    BEST VALUE
                  </ThemedText>
                </View>
                <ThemedText variant="eyebrow" color={colors.textOnIvory} style={styles.planName}>
                  YOUR AESTELLA COMPANION
                </ThemedText>
                <ThemedText variant="statHero" color={colors.textOnIvory}>
                  $99
                </ThemedText>
                <ThemedText variant="eyebrow" color={colors.textOnIvory} style={styles.priceUnit}>
                  PER YEAR
                </ThemedText>
                <ThemedText variant="caption" color={colors.textMuted} style={styles.priceSubtext}>
                  Just $1.90/week, billed annually
                </ThemedText>
                <ThemedText variant="caption" color={colors.textMuted}>
                  Plan. Preview. Track. Keep Aestella with you throughout your aesthetics journey.
                </ThemedText>
              </Card>
            </Pressable>

            <Pressable onPress={() => selectPlan('weekly')} accessibilityRole="button" accessibilityState={{ selected: selectedPlan === 'weekly' }}>
              <Card
                variant="ivory"
                style={[styles.priceCard, selectedPlan === 'weekly' && styles.priceCardSelected]}
              >
                <ThemedText variant="eyebrow" color={colors.textOnIvory} style={styles.planName}>
                  EXPLORE
                </ThemedText>
                <ThemedText variant="statHero" color={colors.textOnIvory}>
                  $11.99
                </ThemedText>
                <ThemedText variant="eyebrow" color={colors.textOnIvory} style={styles.priceUnit}>
                  FOR 1 WEEK
                </ThemedText>
                <ThemedText variant="caption" color={colors.textMuted} style={styles.priceSubtext}>
                  For exploring your personalized plan and possibilities.
                </ThemedText>
              </Card>
            </Pressable>

            <Button
              label="Unlock My Aestella Plan"
              onPress={handleUnlock}
              loading={isLoading}
              style={styles.unlockButton}
            />

            {error && (
              <ThemedText variant="caption" color={colors.accent} style={styles.errorText}>
                {error}
              </ThemedText>
            )}

            <Button
              label="Restore Purchases"
              variant="ghost"
              onPress={restorePurchases}
              loading={isLoading}
              style={styles.restoreButton}
            />
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
  storyCaption: {
    textAlign: 'center',
    marginTop: spacing.sm,
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priceCardSelected: {
    borderColor: colors.accent,
  },
  premiumActiveCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  bestValueTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accentLight,
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
