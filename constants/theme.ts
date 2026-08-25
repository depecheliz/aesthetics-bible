/**
 * The Aesthetics Bible — design tokens.
 *
 * Single source of truth for color, spacing, radius, typography, shadow,
 * and layout values. Screens and components must consume these tokens
 * rather than hardcoding one-off visual values (see CLAUDE.md Brand Rules).
 *
 * Palette and typefaces are taken directly from the approved brand sheet
 * (Branding.png): black / warm ivory / champagne, Playfair Display for
 * editorial display type, Montserrat for functional UI type.
 */

export const palette = {
  black: '#0B0B0C',
  espresso: '#332C25',
  taupe: '#8C7A66',
  champagne: '#C9A97E',
  champagneLight: '#E4D3B8',
  ivory: '#F6EFE6',
  white: '#FFFFFF',
} as const;

export const colors = {
  // Surfaces
  background: palette.black,
  backgroundAlt: palette.espresso,
  surface: '#171614',
  surfaceRaised: '#211F1C',
  ivoryBackground: palette.ivory,

  // Text
  textPrimary: palette.ivory,
  textSecondary: palette.taupe,
  textOnIvory: palette.black,
  textInverse: palette.black,
  textMuted: '#6E655A',

  // Accent / brand
  accent: palette.champagne,
  accentLight: palette.champagneLight,

  // Borders & dividers
  border: '#2C2A26',
  borderOnIvory: '#DDD0BC',

  // Semantic
  success: '#7A9B7E',
  warning: '#C9A97E',
  danger: '#B4635A',
  overlay: 'rgba(11, 11, 12, 0.72)',
  overlayOnIvory: 'rgba(246, 239, 230, 0.86)',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const fontFamily = {
  display: 'PlayfairDisplay_600SemiBold',
  displayRegular: 'PlayfairDisplay_400Regular',
  displayItalic: 'PlayfairDisplay_400Regular_Italic',
  body: 'Montserrat_400Regular',
  bodyMedium: 'Montserrat_500Medium',
  bodySemiBold: 'Montserrat_600SemiBold',
} as const;

export const typography = {
  displayLarge: { fontFamily: fontFamily.display, fontSize: 34, lineHeight: 40, letterSpacing: 0.2 },
  displayMedium: { fontFamily: fontFamily.display, fontSize: 26, lineHeight: 32, letterSpacing: 0.2 },
  displaySmall: { fontFamily: fontFamily.display, fontSize: 20, lineHeight: 26, letterSpacing: 0.2 },
  eyebrow: { fontFamily: fontFamily.bodySemiBold, fontSize: 12, lineHeight: 16, letterSpacing: 1.6 },
  bodyLarge: { fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24, letterSpacing: 0.1 },
  body: { fontFamily: fontFamily.body, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  caption: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  button: { fontFamily: fontFamily.bodySemiBold, fontSize: 14, lineHeight: 20, letterSpacing: 0.8 },
} as const;

export const shadow = {
  none: {},
  sm: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
} as const;

export const layout = {
  screenPaddingHorizontal: spacing.lg,
  maxContentWidth: 480,
  tabBarHeight: 64,
} as const;

export const theme = {
  colors,
  spacing,
  radius,
  fontFamily,
  typography,
  shadow,
  layout,
} as const;

export type Theme = typeof theme;
