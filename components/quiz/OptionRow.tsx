import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { colors, spacing } from '../../constants/theme';

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
      style={styles.row}
    >
      <ThemedText
        variant={selected ? 'displaySmall' : 'bodyLarge'}
        color={selected ? colors.textPrimary : colors.textSecondary}
        style={styles.label}
      >
        {label}
      </ThemedText>
      {selected && <Feather name="check" size={18} color={colors.accent} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    flex: 1,
    marginRight: spacing.sm,
  },
});
