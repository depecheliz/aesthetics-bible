import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { colors, radius, spacing } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  icon?: keyof typeof Feather.glyphMap;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  icon,
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? colors.textOnIvory : colors.accent} />
        ) : (
          <>
            {icon && (
              <Feather
                name={icon}
                size={16}
                color={variant === 'primary' ? colors.textOnIvory : colors.accent}
                style={styles.icon}
              />
            )}
            <ThemedText variant="button" color={textColor[variant]} style={styles.label}>
              {label.toUpperCase()}
            </ThemedText>
          </>
        )}
      </View>
    </Pressable>
  );
}

const textColor: Record<ButtonVariant, string> = {
  primary: colors.textOnIvory,
  secondary: colors.accent,
  ghost: colors.textSecondary,
};

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    maxWidth: '100%',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flexShrink: 1,
    textAlign: 'center',
  },
  icon: {
    flexShrink: 0,
    marginRight: spacing.xs,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});
