import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Screen } from '../components/layout/Screen';
import { ScreenHeader } from '../components/layout/ScreenHeader';
import { ThemedText } from '../components/typography/ThemedText';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Rule } from '../components/ui/Rule';
import { BeforeAfterFrame } from '../components/media/BeforeAfterFrame';
import { Monogram } from '../components/brand/Monogram';
import { campaignImages } from '../assets/brand/campaign';
import { colors, radius, spacing } from '../constants/theme';

const premiumModules: { name: string; description: string }[] = [
  { name: 'PLAN', description: 'Your complete personalized roadmap.' },
  { name: 'PREVIEW', description: 'Explore aesthetic possibilities.' },
  { name: 'GLOW', description: 'Create polished social images.' },
  { name: 'PASSPORT', description: 'Track every treatment and result.' },
  { name: 'THE BIBLE', description: 'Understand your options.' },
  { name: 'BOTOX BESTIE', description: 'Ask the questions you actually want answered.' },
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

        <View style={styles.brandRow}>
          <Monogram size="sm" />
          <ThemedText variant="eyebrow" color={colors.accent}>
            THE AESTHETICS BIBLE PREMIUM
          </ThemedText>
        </View>
        <ThemedText variant="displayHero" style={styles.headline}>
          Your entire aesthetics journey, beautifully organized.
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

        <Card variant="ivory" style={[styles.priceCard, styles.priceCardPrimary]}>
          <View style={styles.bestValueTag}>
            <ThemedText variant="caption" color={colors.textOnIvory}>
              BEST VALUE
            </ThemedText>
          </View>
          <ThemedText variant="statHero" color={colors.textOnIvory}>
            $99
          </ThemedText>
          <ThemedText variant="eyebrow" color={colors.textOnIvory} style={styles.priceUnit}>
            PER YEAR
          </ThemedText>
          <ThemedText variant="caption" color={colors.textMuted} style={styles.priceSubtext}>
            Just $8.25/month, billed annually
          </ThemedText>
          <Button label="Unlock My Aesthetics Bible" onPress={handleMockPurchase} style={styles.priceButton} />
        </Card>

        <View style={styles.secondaryPriceRow}>
          <ThemedText variant="body" color={colors.textSecondary}>
            Or $14.99/month
          </ThemedText>
          <Button label="Continue Monthly" variant="ghost" fullWidth={false} onPress={handleMockPurchase} />
        </View>

        <ThemedText variant="caption" color={colors.textSecondary} style={styles.footnote}>
          Preview and Glow are included with a monthly Premium allowance — not unlimited generations.
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  headline: {
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
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
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
  priceUnit: {
    marginTop: spacing.xxs,
  },
  priceSubtext: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  priceButton: {
    marginTop: spacing.xs,
  },
  secondaryPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  footnote: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
