/**
 * src/constants/design.ts
 *
 * SINGLE SOURCE OF TRUTH for all design tokens.
 *
 * Rules:
 *  - No hex values, font sizes, or spacing numbers may appear anywhere
 *    else in the codebase. Import from here only.
 *  - Token names are semantic, not descriptive (COLORS.surface not COLORS.darkGrey).
 *  - Every value follows a 4-pt spacing grid (SPACING base = 4).
 */

import { Platform, TextStyle } from 'react-native';

// ─────────────────────────────────────────────
// COLOUR PALETTE — raw scale (private)
// ─────────────────────────────────────────────
const PALETTE = {
  black:       '#0A0A0C',
  grey950:     '#121214',
  grey900:     '#17171A',
  grey800:     '#1E1E22',
  grey700:     '#2A2A2E',
  grey500:     '#5A5A60',
  grey400:     '#9A968C',
  grey200:     '#D4D0C8',
  white:       '#F3EFE6',

  gold300:     '#F2D384',
  gold400:     '#D4B05E',
  gold600:     '#8A7232',
  gold900:     '#3A2E10',

  emerald400:  '#2E6B53',
  emerald600:  '#1F4A3C',

  rose400:     '#FB7185',
  rose900:     '#3B0A13',
} as const;

// ─────────────────────────────────────────────
// SEMANTIC COLOUR TOKENS (public)
// ─────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  background:       PALETTE.black,
  surface:          PALETTE.grey950,
  surfaceRaised:    PALETTE.grey900,
  surfaceOverlay:   PALETTE.grey800,

  // Borders
  border:           PALETTE.grey700,
  borderStrong:     PALETTE.grey500,

  // Text
  textPrimary:      PALETTE.white,
  textSecondary:    PALETTE.grey400,
  textDisabled:     PALETTE.grey500,
  textInverse:      '#1A1408',

  // Brand / Gold
  gold:             PALETTE.gold400,
  goldBright:       PALETTE.gold300,
  goldSubtle:       PALETTE.gold600,
  goldTint:         PALETTE.gold900,

  // Semantic
  success:          PALETTE.emerald400,
  successTint:      PALETTE.emerald600,
  error:            PALETTE.rose400,
  errorTint:        PALETTE.rose900,

  // Overlays
  scrim:            'rgba(0,0,0,0.65)',
  scrimStrong:      'rgba(0,0,0,0.82)',
} as const;

export type ColorToken = keyof typeof COLORS;

// ─────────────────────────────────────────────
// SPACING — 4-pt grid
// ─────────────────────────────────────────────
export const SPACING = {
  px:   1,
  '0':  0,
  '1':  4,
  '2':  8,
  '3':  12,
  '4':  16,
  '5':  20,
  '6':  24,
  '7':  28,
  '8':  32,
  '10': 40,
  '12': 48,
  '16': 64,
  '20': 80,
} as const;

// ─────────────────────────────────────────────
// TYPOGRAPHY
// ─────────────────────────────────────────────
const fontFamily = Platform.select({
  ios:     'System',
  android: 'Roboto',
  default: 'System',
});

export const TYPOGRAPHY = {
  // Font families
  family: {
    sans:    fontFamily,
    mono:    Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
  },

  // Size scale (T-shirt)
  size: {
    '2xs': 9,
    xs:    11,
    sm:    13,
    base:  15,
    lg:    17,
    xl:    19,
    '2xl': 22,
    '3xl': 26,
    '4xl': 32,
    '5xl': 40,
  },

  // Weight aliases
  weight: {
    regular:     '400' as TextStyle['fontWeight'],
    medium:      '500' as TextStyle['fontWeight'],
    semibold:    '600' as TextStyle['fontWeight'],
    bold:        '700' as TextStyle['fontWeight'],
    extrabold:   '800' as TextStyle['fontWeight'],
  },

  // Line heights
  leading: {
    tight:   1.2,
    snug:    1.35,
    normal:  1.5,
    relaxed: 1.65,
  },

  // Tracking
  tracking: {
    tightest: -0.5,
    tight:    -0.2,
    normal:   0,
    wide:     0.5,
    wider:    1.2,
    widest:   2.0,
  },
} as const;

// ─────────────────────────────────────────────
// BORDER RADII
// ─────────────────────────────────────────────
export const RADII = {
  none:   0,
  sm:     6,
  md:     10,
  lg:     14,
  xl:     18,
  '2xl':  22,
  '3xl':  28,
  full:   9999,
} as const;

// ─────────────────────────────────────────────
// SHADOWS
// ─────────────────────────────────────────────
export const SHADOWS = {
  none: {},
  sm: {
    shadowColor:   PALETTE.black,
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius:  4,
    elevation:     2,
  },
  md: {
    shadowColor:   PALETTE.black,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius:  8,
    elevation:     4,
  },
  gold: {
    shadowColor:   PALETTE.gold400,
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius:  24,
    elevation:     8,
  },
} as const;

// ─────────────────────────────────────────────
// ANIMATION
// ─────────────────────────────────────────────
export const ANIMATION = {
  duration: {
    instant:  80,
    fast:     150,
    normal:   250,
    slow:     400,
    gentle:   600,
    pageIn:   350,
  },
  easing: {
    // Approximate cubic-bezier via string names supported by Easing module
    standard:    'ease-in-out',
    decelerate:  'ease-out',
    accelerate:  'ease-in',
    spring:      'spring',
  },
} as const;

// ─────────────────────────────────────────────
// Z-INDEX
// ─────────────────────────────────────────────
export const Z = {
  base:    0,
  raised:  10,
  drawer:  50,
  modal:   100,
  overlay: 110,
  toast:   120,
} as const;
