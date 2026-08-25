import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { EditorialImage } from '../media/EditorialImage';
import { formatCurrency, type PassportEntry } from '../../src/domain/passport';
import { colors, spacing } from '../../constants/theme';

type EntryCardProps = {
  entry: PassportEntry;
  onPress: () => void;
};

function formatDate(dateIso: string): { month: string; day: string } {
  const date = new Date(dateIso);
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.toLocaleDateString('en-US', { day: 'numeric' }),
  };
}

/** One editorial timeline row — replaces the earlier stacked dark card. */
export function EntryCard({ entry, onPress }: EntryCardProps) {
  const { month, day } = formatDate(entry.date);
  const hasPhoto = Boolean(entry.photos.baseline || entry.photos.follow_up);

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={entry.treatment} style={styles.row}>
      <View style={styles.dateColumn}>
        <ThemedText variant="caption" color={colors.textMuted}>
          {month}
        </ThemedText>
        <ThemedText variant="displaySmall" color={colors.textPrimary}>
          {day}
        </ThemedText>
      </View>

      {hasPhoto && (
        <View style={styles.thumbnail}>
          <EditorialImage variant="skin-detail" compact />
        </View>
      )}

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.treatment}>
            {entry.treatment}
          </ThemedText>
          <ThemedText variant="caption" color={colors.accent}>
            {formatCurrency(entry.cost)}
          </ThemedText>
        </View>
        <ThemedText variant="caption" color={colors.textSecondary}>
          {entry.provider}
        </ThemedText>

        <View style={styles.footerRow}>
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Feather
                key={index}
                name="star"
                size={11}
                color={index < entry.satisfaction ? colors.accent : colors.border}
                style={styles.star}
              />
            ))}
          </View>
        </View>
        <View style={styles.rule} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  dateColumn: {
    width: 48,
  },
  thumbnail: {
    width: 40,
    marginRight: spacing.sm,
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxs,
  },
  treatment: {
    flex: 1,
    marginRight: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
  },
  star: {
    marginRight: 2,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginTop: spacing.md,
  },
});
