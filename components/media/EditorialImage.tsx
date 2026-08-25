import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View, type ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { Rule } from '../ui/Rule';
import { colors, spacing } from '../../constants/theme';

/**
 * Editorial image placeholder/container system.
 *
 * Until real photography is wired up, every variant renders an
 * intentionally designed placeholder (icon + editorial label) rather than
 * a generic gray box — so the UI reads as designed, not unfinished. Pass
 * `uri` once a real image source exists; loading/error states are handled
 * automatically and it falls back to the same placeholder on failure.
 *
 * No third-party photography is embedded here — see the final report for
 * which of these need owned/licensed/generated imagery.
 */

export type EditorialImageVariant = 'portrait' | 'skin-detail' | 'treatment' | 'social' | 'face-zone';

type VariantConfig = {
  aspectRatio: number;
  icon: keyof typeof Feather.glyphMap;
  defaultLabel: string;
};

const variantConfig: Record<EditorialImageVariant, VariantConfig> = {
  portrait: { aspectRatio: 4 / 5, icon: 'user', defaultLabel: 'EDITORIAL PORTRAIT' },
  'skin-detail': { aspectRatio: 1, icon: 'aperture', defaultLabel: 'SKIN DETAIL' },
  treatment: { aspectRatio: 3 / 2, icon: 'feather', defaultLabel: 'TREATMENT EDITORIAL' },
  social: { aspectRatio: 4 / 5, icon: 'sun', defaultLabel: 'SOCIAL LOOK' },
  'face-zone': { aspectRatio: 1, icon: 'grid', defaultLabel: 'FACE ZONE' },
};

type EditorialImageProps = {
  variant: EditorialImageVariant;
  uri?: string;
  label?: string;
  tone?: 'dark' | 'ivory';
  /** Compact mode for small thumbnails — icon only, no caption/rule. */
  compact?: boolean;
  style?: ViewStyle;
};

export function EditorialImage({ variant, uri, label, tone = 'dark', compact = false, style }: EditorialImageProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>(uri ? 'loading' : 'idle');
  const config = variantConfig[variant];
  const showPlaceholder = !uri || status === 'error';
  const backgroundColor = tone === 'dark' ? colors.imageSurface : colors.imageSurfaceOnIvory;
  const iconColor = tone === 'dark' ? colors.textSecondary : colors.textMuted;
  const labelColor = tone === 'dark' ? colors.textSecondary : colors.textMuted;

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
          {!compact && <Rule color={colors.rule} width={20} style={styles.placeholderRule} />}
          <Feather name={config.icon} size={compact ? 16 : 22} color={iconColor} />
          {!compact && (
            <ThemedText variant="caption" color={labelColor} style={styles.placeholderLabel}>
              {label ?? config.defaultLabel}
            </ThemedText>
          )}
        </View>
      )}

      {uri && status === 'loading' && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.accent} />
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
  placeholderLabel: {
    letterSpacing: 1.4,
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
});
