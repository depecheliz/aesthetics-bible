import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { colors, radius, spacing } from '../../constants/theme';

type OptionRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function OptionRow({ label, selected, onPress }: OptionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={[styles.row, selected && styles.rowSelected]}
    >
      <ThemedText variant="bodyLarge" color={selected ? colors.textPrimary : colors.textSecondary} style={styles.label}>
        {label}
      </ThemedText>
      <Feather
        name={selected ? 'check-circle' : 'circle'}
        size={20}
        color={selected ? colors.accent : colors.border}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  rowSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceRaised,
  },
  label: {
    flex: 1,
    marginRight: spacing.sm,
  },
});
