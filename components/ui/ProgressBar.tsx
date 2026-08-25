import { StyleSheet, View } from 'react-native';
import { colors, radius } from '../../constants/theme';

type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  const ratio = total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0;

  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
  },
});
