import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors } from '../../constants/theme';

type RuleProps = {
  color?: string;
  width?: number;
  style?: ViewStyle;
};

/** A thin editorial rule — used instead of boxed cards to separate content. */
export function Rule({ color = colors.rule, width = 32, style }: RuleProps) {
  return <View style={[styles.rule, { backgroundColor: color, width }, style]} />;
}

const styles = StyleSheet.create({
  rule: {
    height: 1,
  },
});
