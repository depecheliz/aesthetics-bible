import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../typography/ThemedText';
import { colors, spacing } from '../../constants/theme';

type InfoRowProps = {
  label: string;
  value: string;
};

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText variant="body" color={colors.textPrimary}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    marginBottom: spacing.xxs,
  },
});
