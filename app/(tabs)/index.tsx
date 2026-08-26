import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { EditorialModule } from '../../components/home/EditorialModule';
import { BestieTeaser } from '../../components/home/BestieTeaser';
import { Monogram } from '../../components/brand/Monogram';
import { campaignImages } from '../../assets/brand/campaign';
import { useAppState } from '../../lib/state/AppStateContext';
import { summarizeEntriesThisYear } from '../../src/domain/passport';
import { colors, spacing } from '../../constants/theme';

function DiscoverModules() {
  return (
    <View style={styles.modules}>
      <EditorialModule
        number="01"
        eyebrow="DISCOVER"
        title="The Aesthetics Bible"
        subtitle="Understand treatments before making decisions."
        layout="image-right"
        imageVariant="skin-detail"
        imageUri={campaignImages.skinDetail}
        onPress={() => router.push('/bible')}
      />
      <EditorialModule
        number="02"
        eyebrow="PREVIEW"
        title="See Your Possibilities"
        subtitle="Explore aesthetic looks before making a decision."
        layout="image-top"
        imageVariant="portrait"
        imageUri={campaignImages.previewHero}
        onPress={() => router.push('/preview')}
      />
      <EditorialModule
        number="03"
        eyebrow="GLOW"
        title="Your Photo. Elevated."
        subtitle="Create polished social images."
        layout="image-left"
        imageVariant="social"
        onPress={() => router.push({ pathname: '/preview', params: { mode: 'glow' } })}
      />
      <EditorialModule
        number="04"
        eyebrow="PASSPORT"
        title="Your Aesthetic History"
        subtitle="Everything you've done, remembered beautifully."
        layout="text-only"
        onPress={() => router.push('/passport')}
      />
    </View>
  );
}

function NewUserHome() {
  return (
    <>
      <View style={styles.brandRow}>
        <Monogram size="sm" />
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          THE AESTHETICS BIBLE
        </ThemedText>
      </View>
      <ThemedText variant="displayHero" style={styles.headline}>
        See your possibilities.{'\n'}Discover your options.{'\n'}Plan your aesthetic journey.
      </ThemedText>

      <EditorialImage variant="portrait" uri={campaignImages.homeHero} monogram style={styles.heroImage} />

      <Button
        label="Build My Aesthetics Plan"
        icon="arrow-right"
        onPress={() => router.push('/quiz')}
        style={styles.primaryCta}
      />

      <BestieTeaser onPress={() => router.push('/botox-bestie')} />
      <DiscoverModules />
    </>
  );
}

function ReturningUserHome() {
  const { result, savedPlanItems, passportEntries } = useAppState();
  const category = result!.topMatch.category;
  const { treatmentsThisYear } = summarizeEntriesThisYear(passportEntries);

  return (
    <>
      <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
        WELCOME BACK
      </ThemedText>
      <ThemedText variant="displayLarge" style={styles.headline}>
        Continue your aesthetics journey.
      </ThemedText>

      <Pressable onPress={() => router.push('/quiz/result')} style={styles.matchRow}>
        <View style={styles.matchText}>
          <ThemedText variant="eyebrow" color={colors.textSecondary}>
            YOUR #1 MATCH
          </ThemedText>
          <ThemedText variant="displayMedium" color={colors.textPrimary} style={styles.matchName}>
            {category.name}
          </ThemedText>
          <Button label="Continue My Plan" onPress={() => router.push('/plan')} fullWidth={false} />
        </View>
        <EditorialImage variant="portrait" style={styles.matchImage} />
      </Pressable>

      <View style={styles.statsRow}>
        <ThemedText variant="body" color={colors.textSecondary}>
          {savedPlanItems.length} saved to Plan
        </ThemedText>
        <ThemedText variant="body" color={colors.textSecondary}>
          {treatmentsThisYear} treatments this year
        </ThemedText>
      </View>
      <Rule style={styles.statsRule} />

      <BestieTeaser onPress={() => router.push('/botox-bestie')} />
      <DiscoverModules />
    </>
  );
}

export default function HomeScreen() {
  const { result } = useAppState();

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {result ? <ReturningUserHome /> : <NewUserHome />}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  eyebrow: {
    marginBottom: spacing.md,
  },
  headline: {
    marginBottom: spacing.lg,
  },
  heroImage: {
    marginBottom: spacing.lg,
  },
  primaryCta: {
    marginBottom: spacing.md,
  },
  modules: {
    marginTop: spacing.md,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  matchText: {
    flex: 1,
  },
  matchName: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  matchImage: {
    width: 110,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statsRule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.sm,
  },
});
