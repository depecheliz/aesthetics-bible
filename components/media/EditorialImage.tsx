import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from '../typography/ThemedText';
import { Rule } from '../ui/Rule';
import { Monogram } from '../brand/Monogram';
import { ZoomableImageModal } from './ZoomableImageModal';
import { campaignImages } from '../../assets/brand/campaign';
import { colors, radius, spacing } from '../../constants/theme';

/**
 * Editorial image placeholder/container system.
 *
 * Marketing/editorial slots (portrait, social, treatment) fall back to the
 * approved first-pass campaign photography when no explicit `uri` is
 * given, so most call sites need no changes to show a real photo. Slots
 * that represent a user's own content (progress photos, a specific
 * provider's listing) deliberately have no default and keep rendering the
 * minimal icon+rule placeholder until the user supplies their own image —
 * showing a stock model there would misrepresent that content as real.
 *
 * `label`, when provided, is real UI copy overlaid on the image (e.g. "AI
 * VISUALIZATION", a preset name) — not a debug hint — so it renders as a
 * caption chip.
 *
 * `zoomable` (default `false`) opts a single instance into tap-to-expand:
 * a full-screen `ZoomableImageModal` opens on tap, showing `zoomSource`
 * when given or falling back to the same `source`/`uri` otherwise — so a
 * caller that only wants "let people pinch-zoom this exact photo" can pass
 * `zoomable` alone. Ordinary Aestella photography (Home, Preview, Glow,
 * Botox Bestie, Paywall, etc.) never passes `zoomable`, so it stays
 * non-interactive exactly as before. When `zoomable` is `false` (the
 * default, every pre-existing call site), nothing about rendering or
 * behavior changes at all — no extra element, no touch handling.
 */

export type EditorialImageVariant = 'portrait' | 'skin-detail' | 'treatment' | 'social' | 'face-zone';

type VariantConfig = {
  aspectRatio: number;
  icon: keyof typeof Feather.glyphMap;
  defaultSource?: ImageSourcePropType;
};

const variantConfig: Record<EditorialImageVariant, VariantConfig> = {
  portrait: { aspectRatio: 4 / 5, icon: 'user', defaultSource: campaignImages.homeHeroCrop },
  'skin-detail': { aspectRatio: 1, icon: 'aperture' },
  treatment: { aspectRatio: 2 / 3, icon: 'feather', defaultSource: campaignImages.treatmentEditorialCrop },
  social: { aspectRatio: 4 / 5, icon: 'sun', defaultSource: campaignImages.glowSocial },
  'face-zone': { aspectRatio: 1, icon: 'grid' },
};

type EditorialImageProps = {
  variant: EditorialImageVariant;
  uri?: ImageSourcePropType | string;
  /** Real UI copy overlaid as a caption chip — not placeholder text. */
  label?: string;
  tone?: 'dark' | 'ivory';
  /** Compact mode for small thumbnails — icon only, no rule/label. */
  compact?: boolean;
  /** Overlay a small AB monogram — reserve for key branded moments only. */
  monogram?: boolean;
  /** Override the variant's default aspect ratio for an exact-fit asset. */
  aspectRatio?: number;
  /** Opt out of the variant's default campaign photo (show the bare slot). */
  noDefault?: boolean;
  /**
   * How the resolved image fills its container. Defaults to `'cover'`
   * (existing behavior, unchanged for every current call site). Diagrams
   * should pass `'contain'` so no labels/edges are cropped — pair it with
   * `aspectRatio` set to the asset's own native ratio so the container
   * takes the image's true shape and `cover`/`contain` become equivalent
   * (zero crop, zero letterboxing).
   */
  fit?: 'cover' | 'contain';
  /** Opt this instance into tap-to-expand. Defaults to `false` — every
   * pre-existing call site is unaffected: no trigger renders, no touch
   * handling, byte-for-byte the same output as before this prop existed. */
  zoomable?: boolean;
  /**
   * The image the full-screen viewer opens when `zoomable` is set. When
   * omitted, the viewer falls back to the same resolved `source`/`uri` —
   * so `zoomable` alone still works for a single-asset case. Pass this
   * when the collapsed hero and the full-screen view are genuinely
   * different assets (a distilled preview vs. the original diagram).
   */
  zoomSource?: ImageSourcePropType | string;
  style?: ViewStyle;
};

export function EditorialImage({
  variant,
  uri,
  label,
  tone = 'dark',
  compact = false,
  monogram = false,
  aspectRatio,
  noDefault = false,
  fit = 'cover',
  zoomable = false,
  zoomSource,
  style,
}: EditorialImageProps) {
  const config = variantConfig[variant];
  const resolved = uri ?? (noDefault ? undefined : config.defaultSource);
  const source: ImageSourcePropType | undefined =
    typeof resolved === 'string' ? { uri: resolved } : resolved;

  const resolvedZoom = zoomSource ?? resolved;
  const zoomImageSource: ImageSourcePropType | undefined =
    typeof resolvedZoom === 'string' ? { uri: resolvedZoom } : resolvedZoom;

  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>(source ? 'loading' : 'idle');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const showPlaceholder = !source || status === 'error';
  const backgroundColor = tone === 'dark' ? colors.imageSurface : colors.imageSurfaceOnIvory;
  const iconColor = tone === 'dark' ? colors.textSecondary : colors.textMuted;
  const canZoom = zoomable && !!source && !!zoomImageSource;

  const openZoom = useCallback(() => setIsZoomOpen(true), []);
  const closeZoom = useCallback(() => setIsZoomOpen(false), []);

  // Stable identities: react-native-web's <Image> re-runs its own load
  // effect whenever onLoadStart/onLoad/onError change reference, so new
  // inline arrow functions here would re-trigger the load on every render
  // — which flips `status`, which re-renders this component, which would
  // create new inline functions again, forever. useCallback breaks that
  // cycle by keeping the same function reference across renders.
  const handleLoadStart = useCallback(() => setStatus('loading'), []);
  const handleLoad = useCallback(() => setStatus('loaded'), []);
  const handleError = useCallback(() => setStatus('error'), []);

  return (
    <View
      style={[
        styles.container,
        { aspectRatio: aspectRatio ?? config.aspectRatio, backgroundColor },
        style,
      ]}
    >
      {source && (
        <Image
          testID="editorial-image"
          source={source}
          style={StyleSheet.absoluteFill}
          resizeMode={fit}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {canZoom && (
        <Pressable
          testID="editorial-image-zoom-trigger"
          onPress={openZoom}
          style={StyleSheet.absoluteFill}
          accessibilityRole="imagebutton"
          accessibilityLabel={label ? `View full-screen: ${label}` : 'View full-screen'}
          accessibilityHint="Opens a zoomable, full-screen view of this diagram"
        />
      )}

      {showPlaceholder && (
        <View style={styles.placeholder}>
          {!compact && <Rule color={colors.rule} width={16} style={styles.placeholderRule} />}
          <Feather name={config.icon} size={compact ? 16 : 20} color={iconColor} />
        </View>
      )}

      {source && status === 'loading' && (
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

      {canZoom && !compact && (
        <View style={styles.zoomBadge} pointerEvents="none">
          <Feather name="maximize-2" size={13} color={colors.textPrimary} />
        </View>
      )}

      {canZoom && (
        <ZoomableImageModal
          visible={isZoomOpen}
          source={zoomImageSource as ImageSourcePropType}
          label={label}
          onClose={closeZoom}
        />
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
  zoomBadge: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
