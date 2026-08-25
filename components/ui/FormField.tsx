import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';
import { ThemedText } from '../typography/ThemedText';
import { colors, radius, spacing, typography } from '../../constants/theme';

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
};

export function FormField({ label, value, onChangeText, placeholder, keyboardType, multiline }: FormFieldProps) {
  return (
    <View style={styles.wrap}>
      <ThemedText variant="eyebrow" color={colors.textSecondary} style={styles.label}>
        {label.toUpperCase()}
      </ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    backgroundColor: colors.surface,
  },
  inputMultiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
