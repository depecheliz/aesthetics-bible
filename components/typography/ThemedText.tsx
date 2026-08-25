import { Text, type TextProps } from 'react-native';
import { colors, typography } from '../../constants/theme';

type Variant = keyof typeof typography;

type ThemedTextProps = TextProps & {
  variant?: Variant;
  color?: string;
};

export function ThemedText({ variant = 'body', color, style, ...rest }: ThemedTextProps) {
  return (
    <Text
      style={[{ color: color ?? colors.textPrimary }, typography[variant], style]}
      {...rest}
    />
  );
}
