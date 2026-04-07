import { palette } from './palette';

/**
 * App-wide design tokens.
 * Keep colors consistent across screens/components.
 */

export const colors = {
  /** Main surfaces */
  bg: palette.white,
  surface: palette.white,
  surfaceMuted: palette.yellowB,
  text: palette.black,
  textSecondary: palette.black,
  textTertiary: palette.black,
  border: palette.blue,

  /** Accents */
  accent: palette.orange,
  accentMuted: palette.blue,
  accentWarm: palette.pink,
  tabInactive: palette.black,
  danger: palette.orange,

  /** Inputs / chips */
  calendarPeriod: palette.pink,
  calendarPeriodText: palette.black,
  chipOff: palette.blue,
  chipOn: palette.green,
  chipIcon: palette.black,

  /** Cycle ring phase arcs */
  phaseMenstrual: palette.pink,
  phaseFollicular: palette.green,
  phaseOvulation: palette.orange,
  phaseLuteal: palette.blue,
} as const;

export type ThemeColorKey = keyof typeof colors;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};
