import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../typography/ThemedText';
import { EditorialImage } from './EditorialImage';
import { colors, spacing } from '../../constants/theme';

type BeforeAfterFrameProps = {
  leftLabel?: string;
  rightLabel?: string;
  leftUri?: string;
  rightUri?: string;
};

/** Two-image side-by-side comparison — e.g. "Today | Visualization". */
export function BeforeAfterFrame({
  leftLabel = 'TODAY',
  rightLabel = 'VISUALIZATION',
  leftUri,
  rightUri,
}: BeforeAfterFrameProps) {
  return (
    <View style={styles.row}>
      <View style={styles.pane}>
        <EditorialImage variant="portrait" uri={leftUri} label={leftLabel} />
        <ThemedText variant="caption" color={colors.textSecondary} style={styles.paneLabel}>
          {leftLabel}
        </ThemedText>
      </View>
      <View style={styles.divider} />
      <View style={styles.pane}>
        <EditorialImage variant="portrait" uri={rightUri} label={rightLabel} />
        <ThemedText variant="caption" color={colors.accent} style={styles.paneLabel}>
          {rightLabel}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pane: {
    flex: 1,
  },
  paneLabel: {
    marginTop: spacing.xs,
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  divider: {
    width: 1,
    backgroundColor: colors.rule,
    marginHorizontal: spacing.sm,
    alignSelf: 'stretch',
  },
});
