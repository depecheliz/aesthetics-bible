import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ThemedText } from '../../components/typography/ThemedText';
import { Button } from '../../components/ui/Button';
import { SummaryCard } from '../../components/passport/SummaryCard';
import { EntryCard } from '../../components/passport/EntryCard';
import { useAppState } from '../../lib/state/AppStateContext';
import { formatCurrency, sortEntriesByDateDesc, summarizeEntriesThisYear } from '../../src/domain/passport';
import { colors, spacing } from '../../constants/theme';

function PassportEmptyState() {
  return (
    <Screen edges={['top']}>
      <View style={styles.emptyWrap}>
        <Feather name="briefcase" size={28} color={colors.accent} style={styles.emptyIcon} />
        <ThemedText variant="displaySmall" style={styles.emptyTitle}>
          Your Aesthetics History, All in One Place
        </ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.emptyBody}>
          Track every treatment, provider, and result — privately, in one timeline you control.
        </ThemedText>
        <Button label="Log My First Treatment" icon="plus" onPress={() => router.push('/passport/add')} />
      </View>
    </Screen>
  );
}

export default function PassportScreen() {
  const { passportEntries } = useAppState();

  if (passportEntries.length === 0) {
    return <PassportEmptyState />;
  }

  const { spendThisYear, treatmentsThisYear, mostRecent } = summarizeEntriesThisYear(passportEntries);
  const timeline = sortEntriesByDateDesc(passportEntries);

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          PASSPORT
        </ThemedText>
        <ThemedText variant="displaySmall" style={styles.title}>
          Your Aesthetics Passport
        </ThemedText>

        <View style={styles.summaryRow}>
          <SummaryCard label="Spend This Year" value={formatCurrency(spendThisYear)} />
          <SummaryCard label="Treatments" value={String(treatmentsThisYear)} />
        </View>
        <View style={styles.summaryRowSecond}>
          <SummaryCard label="Most Recent" value={mostRecent?.treatment ?? '—'} />
        </View>

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
            onPress={() => router.push('/passport/add')}
          />
        </View>

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          TIMELINE
        </ThemedText>
        {timeline.map((entry) => (
          <EntryCard key={entry.id} entry={entry} onPress={() => router.push(`/passport/${entry.id}`)} />
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: spacing.xxxl,
  },
  emptyIcon: {
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
  },
  emptyBody: {
    marginBottom: spacing.lg,
  },
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryRowSecond: {
    marginBottom: spacing.lg,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickActionButton: {
    flex: 1,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
});
