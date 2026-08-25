import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { Rule } from '../ui/Rule';
import { Monogram } from '../brand/Monogram';
import { colors, radius, spacing } from '../../constants/theme';

/**
 * Editorial image placeholder/container system.
 *
 * Until real photography is wired up, every variant renders a minimal,
 * intentionally designed slot — icon + thin rule, sized to the correct
 * aspect ratio for its purpose — rather than a debug-style caption
 * ("EDITORIAL PORTRAIT") or a generic gray box. Pass `uri` once a real
 * (owned/generated) image source exists; loading/error states are handled
 * automatically and it falls back to the same slot on failure.
 *
 * `label`, when provided, is real UI copy overlaid on the image (e.g. "AI
 * VISUALIZATION", a preset name) — not a debug hint — so it renders as a
 * caption chip, not placeholder text.
 *
 * No third-party photography is embedded here — see the final report for
 * which slots still need owned/generated imagery.
 */

export type EditorialImageVariant = 'portrait' | 'skin-detail' | 'treatment' | 'social' | 'face-zone';

type VariantConfig = {
  aspectRatio: number;
  icon: keyof typeof Feather.glyphMap;
};

const variantConfig: Record<EditorialImageVariant, VariantConfig> = {
  portrait: { aspectRatio: 4 / 5, icon: 'user' },
  'skin-detail': { aspectRatio: 1, icon: 'aperture' },
  treatment: { aspectRatio: 3 / 2, icon: 'feather' },
  social: { aspectRatio: 4 / 5, icon: 'sun' },
  'face-zone': { aspectRatio: 1, icon: 'grid' },
};

type EditorialImageProps = {
  variant: EditorialImageVariant;
  uri?: string;
  /** Real UI copy overlaid as a caption chip — not placeholder text. */
  label?: string;
  tone?: 'dark' | 'ivory';
  /** Compact mode for small thumbnails — icon only, no rule/label. */
  compact?: boolean;
  /** Overlay a small AB monogram — reserve for key branded moments only. */
  monogram?: boolean;
  style?: ViewStyle;
};

export function EditorialImage({
  variant,
  uri,
  label,
  tone = 'dark',
  compact = false,
  monogram = false,
  style,
}: EditorialImageProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>(uri ? 'loading' : 'idle');
  const config = variantConfig[variant];
  const showPlaceholder = !uri || status === 'error';
  const backgroundColor = tone === 'dark' ? colors.imageSurface : colors.imageSurfaceOnIvory;
  const iconColor = tone === 'dark' ? colors.textSecondary : colors.textMuted;

  return (
    <View style={[styles.container, { aspectRatio: config.aspectRatio, backgroundColor }, style]}>
      {uri && (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onLoadStart={() => setStatus('loading')}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}

      {showPlaceholder && (
        <View style={styles.placeholder}>
          {!compact && <Rule color={colors.rule} width={16} style={styles.placeholderRule} />}
          <Feather name={config.icon} size={compact ? 16 : 20} color={iconColor} />
        </View>
      )}

      {uri && status === 'loading' && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}

      {label && !compact && (
        <View style={styles.labelChip}>
          <ThemedText variant="caption" color={colors.textPrimary} style={styles.labelText}>
            {label}
          </ThemedText>
        </View>
      )}

      {monogram && !compact && (
        <View style={styles.monogramWrap}>
          <Monogram size="sm" tone={tone} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  placeholderRule: {
    marginBottom: spacing.xxs,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  labelChip: {
    position: 'absolute',
    left: spacing.sm,
    bottom: spacing.sm,
    backgroundColor: colors.overlay,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  labelText: {
    letterSpacing: 1.2,
  },
  monogramWrap: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
  },
});
