import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { Card } from '../ui/Card';
import { formatCurrency, type PassportEntry } from '../../src/domain/passport';
import { colors, radius, spacing } from '../../constants/theme';

type EntryCardProps = {
  entry: PassportEntry;
  onPress: () => void;
};

function formatDate(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function EntryCard({ entry, onPress }: EntryCardProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={entry.treatment}>
      <Card variant="surface" style={styles.card}>
        <View style={styles.headerRow}>
          <ThemedText variant="bodyLarge" color={colors.textPrimary} style={styles.treatment}>
            {entry.treatment}
          </ThemedText>
          <ThemedText variant="caption" color={colors.accent}>
            {formatCurrency(entry.cost)}
          </ThemedText>
        </View>
        <ThemedText variant="caption" color={colors.textSecondary}>
          {formatDate(entry.date)} · {entry.provider}
        </ThemedText>
        {entry.notes.length > 0 && (
          <ThemedText variant="body" color={colors.textSecondary} numberOfLines={1} style={styles.notes}>
            {entry.notes}
          </ThemedText>
        )}
        <View style={styles.footerRow}>
          <View style={styles.starsRow}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Feather
                key={index}
                name="star"
                size={12}
                color={index < entry.satisfaction ? colors.accent : colors.border}
                style={styles.star}
              />
            ))}
          </View>
          {(entry.photos.baseline || entry.photos.follow_up) && (
            <View style={styles.photoBadge}>
              <Feather name="image" size={12} color={colors.textSecondary} />
              <ThemedText variant="caption" color={colors.textSecondary} style={styles.photoBadgeLabel}>
                Photos
              </ThemedText>
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
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
  notes: {
    marginTop: spacing.xs,
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
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  photoBadgeLabel: {
    marginLeft: spacing.xxs,
  },
});
