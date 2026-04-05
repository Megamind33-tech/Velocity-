/**
 * Typography System for Velocity Game
 * Includes font stacks, sizes, weights, and predefined text styles
 */

import { TextStyle } from 'pixi.js';
import { COLORS } from './colors';

// Font families
export const FONTS = {
  primary: 'Orbitron',     // Headers, titles, buttons
  secondary: 'Exo 2',      // Body text, stats
  mono: 'Oxanium',         // Numbers, values, countdown
} as const;

// Font sizes (desktop/tablet base: 16px)
export const FONT_SIZES = {
  h1: 48,      // Screen titles
  h2: 36,      // Panel headers
  h3: 28,      // Section headers
  h4: 24,      // Card titles
  body: 18,    // Regular text
  small: 14,   // Supporting text
  tiny: 12,    // Labels, hints

  // Mobile (scale down 20%)
  mobile: {
    h1: 38,
    h2: 29,
    h3: 22,
    h4: 19,
    body: 14,
    small: 11,
    tiny: 10,
  },
} as const;

// Font weights
export const FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
} as const;

// Line heights
export const LINE_HEIGHTS = {
  tight: 1.2,    // Headers
  normal: 1.5,   // Body
  relaxed: 1.8,  // Large blocks
} as const;

// Predefined text styles for use throughout the app
export const TEXT_STYLES = {
  // Screen titles - bold, large, with drop shadow
  screenTitle: new TextStyle({
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.h1,
    fontWeight: '800',
    fill: COLORS.text.primary,
    letterSpacing: 2,
    dropShadow: {
      color: 0x000000,
      blur: 8,
      distance: 2,
      alpha: 0.85,
      angle: Math.PI / 4,
    },
  }),

  // Panel headers - bold, medium size
  panelHeader: new TextStyle({
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.h2,
    fontWeight: 'bold',
    fill: COLORS.text.primary,
    letterSpacing: 1,
  }),

  // h3 - section headers
  h3: new TextStyle({
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.h3,
    fontWeight: 'bold',
    fill: COLORS.text.primary,
    letterSpacing: 0.5,
  }),

  // h4 - card titles
  h4: new TextStyle({
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.h4,
    fontWeight: '600',
    fill: COLORS.text.primary,
  }),

  // Body text - regular weight, secondary color
  bodyText: new TextStyle({
    fontFamily: FONTS.secondary,
    fontSize: FONT_SIZES.body,
    fontWeight: 'normal',
    fill: COLORS.text.secondary,
    lineHeight: LINE_HEIGHTS.normal,
  }),

  // Small supporting text
  small: new TextStyle({
    fontFamily: FONTS.secondary,
    fontSize: FONT_SIZES.small,
    fontWeight: 'normal',
    fill: COLORS.text.tertiary,
    lineHeight: LINE_HEIGHTS.normal,
  }),

  // Stat labels - small, muted
  statLabel: new TextStyle({
    fontFamily: FONTS.secondary,
    fontSize: FONT_SIZES.small,
    fontWeight: '600',
    fill: COLORS.text.tertiary,
    letterSpacing: 0.5,
  }),

  // Stat values - mono font, accent color, bold
  statValue: new TextStyle({
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.h4,
    fontWeight: '600',
    fill: COLORS.text.accent,
  }),

  // Button text - bold, branded font
  buttonText: new TextStyle({
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
    fill: COLORS.text.primary,
    letterSpacing: 1.5,
  }),

  // Button text small - for smaller buttons
  buttonTextSmall: new TextStyle({
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
    fill: COLORS.text.primary,
    letterSpacing: 1,
  }),

  // Dialog title - large, bold
  dialogTitle: new TextStyle({
    fontFamily: FONTS.primary,
    fontSize: FONT_SIZES.h2,
    fontWeight: 'bold',
    fill: COLORS.text.primary,
    letterSpacing: 1,
  }),

  // Dialog body - readable supporting text
  dialogBody: new TextStyle({
    fontFamily: FONTS.secondary,
    fontSize: FONT_SIZES.body,
    fontWeight: 'normal',
    fill: COLORS.text.secondary,
    align: 'center',
    wordWrap: true,
  }),

  // Disabled text - grayed out
  disabled: new TextStyle({
    fontFamily: FONTS.secondary,
    fontSize: FONT_SIZES.body,
    fontWeight: 'normal',
    fill: COLORS.text.disabled,
  }),

  // Accent text - highlighted, primary color
  accent: new TextStyle({
    fontFamily: FONTS.secondary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    fill: COLORS.text.accent,
  }),

  // Badge text - small, bold, monospace
  badge: new TextStyle({
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.tiny,
    fontWeight: 'bold',
    fill: COLORS.text.primary,
  }),

  // Countdown/timer - mono font, large
  countdown: new TextStyle({
    fontFamily: FONTS.mono,
    fontSize: FONT_SIZES.h2,
    fontWeight: 'bold',
    fill: COLORS.text.accent,
    letterSpacing: 2,
  }),

  // Warning text - danger color
  warning: new TextStyle({
    fontFamily: FONTS.secondary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    fill: COLORS.semantic.danger,
  }),

  // Success text - success color
  success: new TextStyle({
    fontFamily: FONTS.secondary,
    fontSize: FONT_SIZES.body,
    fontWeight: '600',
    fill: COLORS.semantic.success,
  }),
} as const;

/**
 * Get a text style by name
 * @param styleName - Key from TEXT_STYLES object
 * @returns TextStyle object that can be cloned for modification
 */
export function getTextStyle(styleName: keyof typeof TEXT_STYLES): TextStyle {
  const style = TEXT_STYLES[styleName];
  if (!style) {
    console.warn(`Text style "${styleName}" not found, using bodyText as fallback`);
    return TEXT_STYLES.bodyText;
  }
  // Clone to avoid modifying the original
  return new TextStyle(style);
}

/**
 * Create a custom text style by merging with a base style
 * @param baseName - Key from TEXT_STYLES to use as base
 * @param overrides - Partial TextStyle properties to override
 * @returns New TextStyle with merged properties
 */
export function createTextStyle(
  baseName: keyof typeof TEXT_STYLES,
  overrides: Partial<TextStyle> = {}
): TextStyle {
  const baseStyle = getTextStyle(baseName);
  return new TextStyle({ ...baseStyle, ...overrides });
}
