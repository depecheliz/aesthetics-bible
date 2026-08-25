import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAppState } from '../../lib/state/AppStateContext';
import { summarizeEntriesThisYear } from '../../src/domain/passport';
import { colors, spacing } from '../../constants/theme';

const quickActions: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  href: '/bible' | '/preview' | '/passport';
}[] = [
  { label: 'Explore The Bible', icon: 'book-open', href: '/bible' },
  { label: 'Preview My Look', icon: 'camera', href: '/preview' },
  { label: 'My Aesthetics Passport', icon: 'briefcase', href: '/passport' },
];

function NewUserHome() {
  return (
    <>
      <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
        THE AESTHETICS BIBLE
      </ThemedText>
      <ThemedText variant="displayLarge" style={styles.headline}>
        See your possibilities.{'\n'}Discover your options.{'\n'}Plan your aesthetic journey.
      </ThemedText>

      <Button
        label="Build My Aesthetics Plan"
        icon="arrow-right"
        onPress={() => router.push('/quiz')}
        style={styles.primaryCta}
      />

      <Card variant="outline" style={styles.introCard}>
        <ThemedText variant="bodyLarge" color={colors.textPrimary}>
          The Aesthetics Bible helps you understand your options, visualize possibilities,
          organize your aesthetics journey, and remember what you&apos;ve done — all in one place.
        </ThemedText>
      </Card>

      <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
        QUICK ACTIONS
      </ThemedText>
      <View style={styles.quickActions}>
        {quickActions.map((action) => (
          <Card key={action.href} variant="surface" style={styles.quickActionCard}>
            <Button
              label={action.label}
              icon={action.icon}
              variant="ghost"
              fullWidth={false}
              onPress={() => router.push(action.href)}
              style={styles.quickActionButton}
            />
          </Card>
        ))}
      </View>
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
      <ThemedText variant="displayMedium" style={styles.headline}>
        Continue your aesthetics journey.
      </ThemedText>

      <Pressable onPress={() => router.push('/quiz/result')}>
        <Card variant="ivory" style={styles.matchCard}>
          <ThemedText variant="eyebrow" color={colors.accent}>
            YOUR #1 MATCH
          </ThemedText>
          <ThemedText variant="displaySmall" color={colors.textOnIvory} style={styles.matchName}>
            {category.name}
          </ThemedText>
          <Button label="Continue My Plan" onPress={() => router.push('/plan')} style={styles.matchButton} />
        </Card>
      </Pressable>

      <View style={styles.statsRow}>
        <Card variant="surface" style={styles.statCard}>
          <ThemedText variant="displaySmall" color={colors.textPrimary}>
            {savedPlanItems.length}
          </ThemedText>
          <ThemedText variant="caption" color={colors.textSecondary}>
            Saved to Plan
          </ThemedText>
        </Card>
        <Pressable style={styles.statCardFlex} onPress={() => router.push('/passport')}>
          <Card variant="surface" style={styles.statCard}>
            <ThemedText variant="displaySmall" color={colors.textPrimary}>
              {treatmentsThisYear}
            </ThemedText>
            <ThemedText variant="caption" color={colors.textSecondary}>
              Treatments This Year
            </ThemedText>
          </Card>
        </Pressable>
      </View>

      <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
        QUICK ACTIONS
      </ThemedText>
      <View style={styles.quickActions}>
        {quickActions.map((action) => (
          <Card key={action.href} variant="surface" style={styles.quickActionCard}>
            <Button
              label={action.label}
              icon={action.icon}
              variant="ghost"
              fullWidth={false}
              onPress={() => router.push(action.href)}
              style={styles.quickActionButton}
            />
          </Card>
        ))}
      </View>
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
  eyebrow: {
    marginBottom: spacing.md,
  },
  headline: {
    marginBottom: spacing.xl,
  },
  primaryCta: {
    marginBottom: spacing.xl,
  },
  introCard: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  quickActions: {
    gap: spacing.sm,
  },
  quickActionCard: {
    padding: spacing.xs,
  },
  quickActionButton: {
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.sm,
  },
  matchCard: {
    marginBottom: spacing.lg,
  },
  matchName: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  matchButton: {
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCardFlex: {
    flex: 1,
  },
  statCard: {
    flex: 1,
  },
});
