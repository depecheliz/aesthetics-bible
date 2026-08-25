import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius, spacing } from '../../constants/theme';

type CardProps = ViewProps & {
  variant?: 'surface' | 'ivory' | 'outline';
};

export function Card({ children, style, variant = 'surface', ...rest }: CardProps) {
  return (
    <View style={[styles.base, variantStyles[variant], style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});

const variantStyles = StyleSheet.create({
  surface: {
    backgroundColor: colors.surface,
  },
  ivory: {
    backgroundColor: colors.ivoryBackground,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
