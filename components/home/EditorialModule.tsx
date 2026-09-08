import { Pressable, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { Rule } from '../ui/Rule';
import { EditorialImage, type EditorialImageVariant } from '../media/EditorialImage';
import { colors, spacing } from '../../constants/theme';

type EditorialModuleLayout = 'image-right' | 'image-left' | 'image-top' | 'text-only';

type EditorialModuleProps = {
  number: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  layout: EditorialModuleLayout;
  imageVariant?: EditorialImageVariant;
  /** Override the variant's default campaign photo for this module. */
  imageUri?: ImageSourcePropType;
  /** e.g. "COMING SOON" — shown instead of the EXPLORE affordance when the feature isn't real yet. */
  badge?: string;
  onPress: () => void;
};

/**
 * One editorial "module" on Home — deliberately composition-driven rather
 * than a repeated card, so the four Home modules can share one component
 * while still reading as distinct (see CLAUDE.md: avoid repeated card
 * patterns).
 */
export function EditorialModule({
  number,
  eyebrow,
  title,
  subtitle,
  layout,
  imageVariant,
  imageUri,
  badge,
  onPress,
}: EditorialModuleProps) {
  const textBlock = (
    <View style={styles.textBlock}>
      <ThemedText variant="numberLabel" color={colors.textMuted}>
        {number}
      </ThemedText>
      <ThemedText variant="eyebrow" color={colors.accent} style={styles.eyebrow}>
        {eyebrow}
      </ThemedText>
      <ThemedText variant="displaySmall" color={colors.textPrimary} style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        {subtitle}
      </ThemedText>
      {badge ? (
        <View style={styles.badgeRow}>
          <ThemedText variant="caption" color={colors.textMuted} style={styles.badgeLabel}>
            {badge}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.exploreRow}>
          <ThemedText variant="caption" color={colors.accent} style={styles.exploreLabel}>
            EXPLORE
          </ThemedText>
          <Feather name="arrow-right" size={13} color={colors.accent} />
        </View>
      )}
    </View>
  );

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={styles.wrap}>
      {layout === 'image-top' && imageVariant && (
        <EditorialImage variant={imageVariant} uri={imageUri} style={styles.imageTop} />
      )}
      {layout === 'image-right' && imageVariant ? (
        <View style={styles.row}>
          <View style={styles.rowText}>{textBlock}</View>
          <EditorialImage variant={imageVariant} uri={imageUri} style={styles.rowImage} />
        </View>
      ) : layout === 'image-left' && imageVariant ? (
        <View style={styles.row}>
          <EditorialImage variant={imageVariant} uri={imageUri} style={styles.rowImage} />
          <View style={styles.rowText}>{textBlock}</View>
        </View>
      ) : layout !== 'image-right' && layout !== 'image-left' ? (
        textBlock
      ) : null}
      <Rule style={styles.bottomRule} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: spacing.lg,
  },
  imageTop: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
  },
  rowImage: {
    width: 96,
  },
  textBlock: {},
  eyebrow: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.sm,
  },
  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  exploreLabel: {
    letterSpacing: 1.4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeLabel: {
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  bottomRule: {
    marginTop: spacing.lg,
    width: '100%',
    opacity: 0.4,
  },
});
