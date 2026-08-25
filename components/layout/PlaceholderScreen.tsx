import { StyleSheet, View } from 'react-native';
import { Screen } from './Screen';
import { ThemedText } from '../typography/ThemedText';
import { colors, spacing } from '../../constants/theme';

type PlaceholderScreenProps = {
  title: string;
  description: string;
};

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <Screen>
      <View style={styles.center}>
        <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
          THE AESTHETICS BIBLE
        </ThemedText>
        <ThemedText variant="displayMedium" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText variant="bodyLarge" color={colors.textSecondary}>
          {description}
        </ThemedText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  eyebrow: {
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
});
