import { palette } from './palette';

/**
 * App-wide design tokens.
 * Keep colors consistent across screens/components.
 */

export const colors = {
  /** Brand palette (single source of truth) */
  green: '#bedd3c',
  pink: '#fa97ca',
  yellow: '#e9b41f',
  blue: '#4ca4f0',
  red: '#ea5035',

  /** Main surfaces */
  // App background: light neutral gray, then we tint it subtly per-avatar.
  bg: '#f6f7f8',
  surface: palette.white,
  // Subtle warm surface for emphasized cards / primary buttons
  surfaceMuted: 'rgba(233, 180, 31, 0.18)',
  text: palette.black,
  textSecondary: 'rgba(17, 17, 17, 0.78)',
  textTertiary: 'rgba(17, 17, 17, 0.6)',
  border: 'rgba(17, 17, 17, 0.1)',
  borderStrong: 'rgba(17, 17, 17, 0.28)',
  divider: 'rgba(17, 17, 17, 0.12)',

  /** Accents */
  accent: '#ea5035',
  accentMuted: '#4ca4f0',
  accentWarm: '#fa97ca',
  tabInactive: palette.black,
  danger: '#ea5035',

  /** Inputs / chips */
  calendarPeriod: '#fa97ca',
  calendarPeriodText: palette.black,
  chipOff: '#4ca4f0',
  chipOn: '#bedd3c',
  chipIcon: palette.black,

  /** Cycle ring phase arcs */
  // Mapping:
  // - Menstrual = Pink
  // - Follicular = Green
  // - Ovulation = Yellow
  // - Luteal = Blue
  phaseMenstrual: '#fa97ca',
  phaseFollicular: '#bedd3c',
  phaseOvulation: '#e9b41f',
  phaseLuteal: '#4ca4f0',
} as const;

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace('#', '').trim();
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (full.length !== 6) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (![r, g, b].every((n) => Number.isFinite(n))) return null;
  return { r, g, b };
}

function mixRgb(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }, t: number) {
  const k = Math.max(0, Math.min(1, t));
  return {
    r: clampByte(a.r + (b.r - a.r) * k),
    g: clampByte(a.g + (b.g - a.g) * k),
    b: clampByte(a.b + (b.b - a.b) * k),
  };
}

/**
 * Subtle background tint based on avatar color.
 * Intentionally low mix so it stays clean (not muddy).
 */
export function tintedAppBackground(avatarHex?: string, mix = 0.07): string {
  const base = hexToRgb(colors.bg) ?? { r: 246, g: 247, b: 248 };
  const accent = avatarHex ? hexToRgb(avatarHex) : null;
  if (!accent) return colors.bg;
  const m = mixRgb(base, accent, mix);
  return `rgb(${m.r}, ${m.g}, ${m.b})`;
}

export type ThemeColorKey = keyof typeof colors;

export const spacing = {
  /** 4px-ish grid but tuned for touch UI */
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const fontSize = {
  /** Small caps / labels */
  label: 11,
  helper: 12,
  /** Body */
  body: 15,
  bodySm: 14,
  /** Buttons */
  button: 16,
  /** Titles */
  sectionTitle: 16,
  screenTitle: 20,
  screenTitleLg: 26,
} as const;

export const lineHeight = {
  helper: 16,
  body: 21,
  bodySm: 20,
  button: 20,
  sectionTitle: 22,
  screenTitle: 26,
  screenTitleLg: 32,
} as const;

export const typography = {
  /** Screen title (top bar / headers) */
  screenTitle: {
    fontSize: fontSize.screenTitle,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.3,
  },
  /** Large hero title (Home date line) */
  screenTitleLg: {
    fontSize: fontSize.screenTitleLg,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.4,
  },
  /** Section title / nav title */
  sectionTitle: {
    fontSize: fontSize.sectionTitle,
    fontWeight: '800' as const,
    color: colors.text,
    letterSpacing: -0.2,
  },
  /** Small uppercase label */
  labelCaps: {
    fontSize: fontSize.label,
    fontWeight: '800' as const,
    color: colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.7,
  },
  /** Body */
  body: {
    fontSize: fontSize.body,
    fontWeight: '500' as const,
    color: colors.text,
    lineHeight: lineHeight.body,
  },
  /** Helper / hint text */
  helper: {
    fontSize: fontSize.helper,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    lineHeight: lineHeight.helper,
  },
  /** Button text */
  button: {
    fontSize: fontSize.button,
    fontWeight: '700' as const,
    color: colors.text,
    lineHeight: lineHeight.button,
  },
  /** Small label (non-caps) */
  smallLabel: {
    fontSize: fontSize.bodySm,
    fontWeight: '700' as const,
    color: colors.text,
  },
} as const;

export const layout = {
  /** Consistent page padding across screens */
  pagePaddingX: spacing.lg,
  pagePaddingTop: spacing.sm,
  pagePaddingBottom: spacing.xl * 2,
  /** Standard vertical gap between page sections */
  sectionGap: spacing.md,
} as const;

export const componentStyles = {
  /** Card container */
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  /** Elevated card (subtle shadow) */
  cardElevated: {
    shadowColor: '#3D342C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  /** Standard input field */
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  /** Pill button / segmented item */
  pill: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillSelected: {
    borderColor: colors.borderStrong,
    borderWidth: 2,
  },
  /** Primary action button */
  buttonPrimary: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  /** Secondary action button */
  buttonSecondary: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
} as const;
