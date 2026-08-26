import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { EditorialImage } from './EditorialImage';
import { colors } from '../../constants/theme';

type BeforeAfterFrameProps = {
  leftLabel?: string;
  rightLabel?: string;
  leftUri?: ImageSourcePropType | string;
  rightUri?: ImageSourcePropType | string;
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
      </View>
      <View style={styles.divider}>
        <Feather name="arrow-right" size={14} color={colors.accent} />
      </View>
      <View style={styles.pane}>
        <EditorialImage variant="portrait" uri={rightUri} label={rightLabel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pane: {
    flex: 1,
  },
  divider: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
