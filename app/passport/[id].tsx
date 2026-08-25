import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Screen } from '../../components/layout/Screen';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ThemedText } from '../../components/typography/ThemedText';
import { InfoRow } from '../../components/ui/InfoRow';
import { Rule } from '../../components/ui/Rule';
import { useAppState } from '../../lib/state/AppStateContext';
import { formatCurrency } from '../../src/domain/passport';
import { colors, radius, spacing } from '../../constants/theme';

function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PassportEntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { passportEntries } = useAppState();
  const entry = passportEntries.find((item) => item.id === id);

  if (!entry) {
    return (
      <Screen>
        <ScreenHeader />
        <ThemedText variant="bodyLarge" color={colors.textSecondary} style={styles.notFound}>
          We couldn&apos;t find that Passport entry.
        </ThemedText>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader />

        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          PASSPORT ENTRY
        </ThemedText>
        <ThemedText variant="displayHero" style={styles.title}>
          {entry.treatment}
        </ThemedText>
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.date}>
          {formatDate(entry.date)}
        </ThemedText>

        <Rule style={styles.rule} />
        <InfoRow label="PROVIDER" value={entry.provider || '—'} />
        <InfoRow label="COST" value={formatCurrency(entry.cost)} />
        <InfoRow label="PRODUCT" value={entry.product || '—'} />
        <InfoRow label="AMOUNT / UNITS" value={entry.amountUnits || '—'} />
        <InfoRow label="AREA" value={entry.area || '—'} />

        <View style={styles.satisfactionRow}>
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Feather
                key={index}
                name="star"
                size={16}
                color={index < entry.satisfaction ? colors.accent : colors.border}
                style={styles.star}
              />
            ))}
          </View>
          <ThemedText variant="caption" color={colors.textSecondary}>
            {entry.wouldDoAgain ? 'Would do again' : 'Would not do again'}
          </ThemedText>
        </View>

        {entry.notes.length > 0 && (
          <>
            <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
              NOTES
            </ThemedText>
            <ThemedText variant="body" color={colors.textPrimary} style={styles.notes}>
              {entry.notes}
            </ThemedText>
          </>
        )}

        <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.sectionLabel}>
          PHOTOS
        </ThemedText>
        <View style={styles.photoRow}>
          <View style={styles.photoSlot}>
            <Feather
              name={entry.photos.baseline ? 'image' : 'plus'}
              size={20}
              color={entry.photos.baseline ? colors.accent : colors.textSecondary}
            />
            <ThemedText variant="caption" color={colors.textSecondary} style={styles.photoLabel}>
              Baseline
            </ThemedText>
          </View>
          <View style={styles.photoSlot}>
            <Feather
              name={entry.photos.follow_up ? 'image' : 'plus'}
              size={20}
              color={entry.photos.follow_up ? colors.accent : colors.textSecondary}
            />
            <ThemedText variant="caption" color={colors.textSecondary} style={styles.photoLabel}>
              Follow-Up
            </ThemedText>
          </View>
        </View>
        <ThemedText variant="caption" color={colors.textMuted} style={styles.photoNote}>
          Private to you. Photos never leave this device in this preview build.
        </ThemedText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxxl,
  },
  notFound: {
    marginTop: spacing.xl,
  },
  eyebrow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  date: {
    marginBottom: spacing.lg,
  },
  rule: {
    width: '100%',
    opacity: 0.4,
    marginBottom: spacing.sm,
  },
  satisfactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  starsRow: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  notes: {
    marginBottom: spacing.lg,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  photoLabel: {
    marginTop: spacing.xs,
  },
  photoNote: {
    marginBottom: spacing.xl,
  },
});
