import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { Rule } from '../../components/ui/Rule';
import { EditorialImage } from '../../components/media/EditorialImage';
import { EntryCard } from '../../components/passport/EntryCard';
import { AccountSection } from '../../components/passport/AccountSection';
import { campaignImages } from '../../assets/brand/campaign';
import { useAppState } from '../../lib/state/AppStateContext';
import { useOptionalAuth } from '../../lib/state/AuthContext';
import { useRequireAuth } from '../../lib/state/useRequireAuth';
import { formatCurrency, sortEntriesByDateDesc, summarizeEntriesThisYear } from '../../src/domain/passport';
import { colors, radius, spacing } from '../../constants/theme';

function PassportEmptyState({ onAddTreatment }: { onAddTreatment: () => void }) {
  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.emptyContent} showsVerticalScrollIndicator={false}>
        <EditorialImage variant="skin-detail" uri={campaignImages.skinDetail} style={styles.emptyImage} />
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.emptyEyebrow}>
          PASSPORT
        </ThemedText>
        <ThemedText variant="displayLarge" style={styles.emptyTitle}>
          Your Aesthetics History, All in One Place
        </ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.emptyBody}>
          Track every treatment, provider, and result — privately, in one timeline you control.
        </ThemedText>
        <Button label="Log My First Treatment" icon="plus" onPress={onAddTreatment} />
        <AccountSection />
      </ScrollView>
    </Screen>
  );
}

export default function PassportScreen() {
  const { passportEntries } = useAppState();
  const auth = useOptionalAuth();
  const requireAuth = useRequireAuth();
  const handleAddTreatment = () => requireAuth(() => router.push('/passport/add'));
  // Signed-out sessions render AppStateContext's seeded sample entries so
  // the screen isn't empty before sign-in — labeling it clearly here keeps
  // that from ever being mistaken for the user's own treatment history.
  const isSampleData = !auth?.user;

  if (passportEntries.length === 0) {
    return <PassportEmptyState onAddTreatment={handleAddTreatment} />;
  }

  const { spendThisYear, treatmentsThisYear, mostRecent } = summarizeEntriesThisYear(passportEntries);
  const timeline = sortEntriesByDateDesc(passportEntries);

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isSampleData && (
          <View style={styles.exampleBanner}>
            <Feather name="info" size={14} color={colors.accent} />
            <ThemedText variant="caption" color={colors.accent} style={styles.exampleBannerText}>
              EXAMPLE — sign in to build your own Passport
            </ThemedText>
          </View>
        )}
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          YOUR YEAR IN AESTHETICS
        </ThemedText>
        <ThemedText variant="statHero" color={colors.textPrimary} style={styles.heroStat}>
          {formatCurrency(spendThisYear)}
        </ThemedText>

        <View style={styles.secondaryStatsRow}>
          <View style={styles.secondaryStat}>
            <ThemedText variant="displaySmall" color={colors.textPrimary}>
              {treatmentsThisYear}
            </ThemedText>
            <ThemedText variant="caption" color={colors.textSecondary}>
              TREATMENTS
            </ThemedText>
          </View>
          <View style={styles.secondaryStat}>
            <ThemedText variant="displaySmall" color={colors.textPrimary} numberOfLines={1}>
              {mostRecent?.treatment ?? '—'}
            </ThemedText>
            <ThemedText variant="caption" color={colors.textSecondary}>
              MOST RECENT
            </ThemedText>
          </View>
        </View>
        <Rule style={styles.rule} />

        <View style={styles.quickActions}>
          <Button
            label="Progress Photos"
            icon="image"
            variant="secondary"
            fullWidth={false}
            style={styles.quickActionButton}
            onPress={() => router.push('/passport/photos')}
          />
          <Button
            label="Add Treatment"
            icon="plus"
            variant="secondary"
            fullWidth={false}
            style={styles.quickActionButton}
            onPress={handleAddTreatment}
          />
        </View>

        <Pressable onPress={() => router.push('/passport/photos')} style={styles.progressStrip}>
          <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
            PROGRESS
          </ThemedText>
          <View style={styles.progressRow}>
            <View style={styles.progressThumb}>
              <EditorialImage variant="skin-detail" compact />
            </View>
            <View style={styles.progressThumb}>
              <EditorialImage variant="skin-detail" compact />
            </View>
            <View style={styles.progressMore}>
              <Feather name="arrow-right" size={16} color={colors.accent} />
            </View>
          </View>
        </Pressable>

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          TIMELINE
        </ThemedText>
        {timeline.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onPress={() => router.push(`/passport/${entry.id}`)} />
        ))}

        <View style={styles.wrappedTeaser}>
          <Feather name="gift" size={16} color={colors.textMuted} style={styles.wrappedIcon} />
          <ThemedText variant="caption" color={colors.textMuted}>
            Coming soon: your Aesthetics Wrapped — a shareable look back at your year.
          </ThemedText>
        </View>

        <AccountSection />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyContent: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  emptyImage: {
    marginBottom: spacing.lg,
  },
  emptyEyebrow: {
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    marginBottom: spacing.md,
  },
  emptyBody: {
    marginBottom: spacing.lg,
  },
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    marginBottom: spacing.sm,
  },
  exampleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    marginBottom: spacing.md,
  },
  exampleBannerText: {
    letterSpacing: 0.4,
  },
  heroStat: {
    marginBottom: spacing.lg,
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  secondaryStat: {},
  rule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  quickActionButton: {
    flex: 1,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  progressStrip: {
    marginBottom: spacing.xl,
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  progressThumb: {
    width: 64,
  },
  progressMore: {
    justifyContent: 'center',
  },
  wrappedTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  wrappedIcon: {
    marginRight: spacing.xs,
  },
});
