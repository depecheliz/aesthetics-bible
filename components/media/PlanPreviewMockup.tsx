import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../typography/ThemedText';
import { colors, radius, shadow, spacing } from '../../constants/theme';

type SkeletonRow = { icon: keyof typeof Feather.glyphMap; widthPercent: number; locked?: boolean };

const rows: SkeletonRow[] = [
  { icon: 'check-circle', widthPercent: 72 },
  { icon: 'check-circle', widthPercent: 58 },
  { icon: 'lock', widthPercent: 64, locked: true },
];

/**
 * A UI-only composition used on the paywall in place of a photographic
 * before/after. It renders an abstract, wireframe-style preview of a
 * personal roadmap — never a real screenshot, a treatment photo, or a
 * simulated result — so it sells the product ("your plan is already
 * built and waiting") without implying a promised outcome. See
 * AESTELLA_SPRINT_REPORT.md (P0-2) for why the previous TODAY/ORGANIZED
 * photo pairing was replaced.
 */
export function PlanPreviewMockup() {
  return (
    <View style={styles.frame}>
      <View style={styles.headerRow}>
        <View style={styles.avatarDot} />
        <View style={styles.headerBars}>
          <View style={[styles.bar, styles.barHeaderWide]} />
          <View style={[styles.bar, styles.barHeaderNarrow]} />
        </View>
      </View>

      {rows.map((row, index) => (
        <View key={index} style={styles.itemRow}>
          <View style={[styles.iconWrap, row.locked && styles.iconWrapLocked]}>
            <Feather name={row.icon} size={14} color={row.locked ? colors.textMuted : colors.accent} />
          </View>
          <View style={[styles.bar, styles.itemBar, { width: `${row.widthPercent}%` }]} />
        </View>
      ))}

      <View style={styles.captionRow}>
        <Feather name="star" size={12} color={colors.accent} />
        <ThemedText variant="caption" color={colors.textOnIvory} style={styles.captionText}>
          Your personalized aesthetics intelligence is already waiting.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.ivoryBackground,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  avatarDot: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.accentLight,
  },
  headerBars: {
    flex: 1,
    gap: spacing.xxs,
  },
  bar: {
    height: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.borderOnIvory,
  },
  barHeaderWide: {
    width: '60%',
  },
  barHeaderNarrow: {
    width: '38%',
    opacity: 0.7,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.imageSurfaceOnIvory,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapLocked: {
    opacity: 0.6,
  },
  itemBar: {
    height: 10,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderOnIvory,
  },
  captionText: {
    flex: 1,
  },
});
