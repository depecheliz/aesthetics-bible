import { Pressable, StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '../typography/ThemedText';
import { colors, spacing } from '../../constants/theme';

type ScreenHeaderProps = {
  title?: string;
  onBack?: () => void;
  closeIcon?: boolean;
};

export function ScreenHeader({ title, onBack, closeIcon = false }: ScreenHeaderProps) {
  const handleBack = onBack ?? (() => router.back());

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel={closeIcon ? 'Close' : 'Go back'}
        hitSlop={12}
        style={styles.iconButton}
      >
        <Feather name={closeIcon ? 'x' : 'chevron-left'} size={20} color={colors.textPrimary} />
      </Pressable>
      {title && (
        <ThemedText variant="bodyLarge" style={styles.title}>
          {title}
        </ThemedText>
      )}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  title: {
    marginLeft: spacing.sm,
  },
  spacer: {
    flex: 1,
  },
});
