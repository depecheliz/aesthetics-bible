import { StyleSheet } from 'react-native';
import { ThemedText } from '../typography/ThemedText';
import { Card } from '../ui/Card';
import { colors, spacing } from '../../constants/theme';

type SummaryCardProps = {
  label: string;
  value: string;
};

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <Card variant="surface" style={styles.card}>
      <ThemedText variant="caption" color={colors.textSecondary} style={styles.label}>
        {label.toUpperCase()}
      </ThemedText>
      <ThemedText variant="displaySmall" color={colors.textPrimary}>
        {value}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    paddingVertical: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
});
