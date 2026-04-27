import { StyleSheet } from 'react-native';
import type { CyclePhaseId } from './phaseConfig';
import { colors } from './theme';

export const phaseAccentHex: Record<CyclePhaseId, string> = {
  menstrual: colors.phaseMenstrual,
  follicular: colors.phaseFollicular,
  ovulation: colors.phaseOvulation,
  luteal: colors.phaseLuteal,
};

// function hexToRgba(hex: string, alpha: number): string {
//   const h = hex.replace('#', '').trim();
//   const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
//   const r = parseInt(full.slice(0, 2), 16);
//   const g = parseInt(full.slice(2, 4), 16);
//   const b = parseInt(full.slice(4, 6), 16);
//   if (![r, g, b].every((n) => Number.isFinite(n))) return `rgba(17, 17, 17, ${alpha})`;
//   return `rgba(${r}, ${g}, ${b}, ${alpha})`;
// }

/** Screen root tint — matches current cycle phase. */
export const phaseScreenBg = StyleSheet.create({
  // Phase-tinted backgrounds are intentionally disabled for now.
  // If you want them back, swap these lines back in:
  // menstrual: { backgroundColor: hexToRgba(colors.phaseMenstrual, 0.12) },
  // follicular: { backgroundColor: hexToRgba(colors.phaseFollicular, 0.22) },
  // ovulation: { backgroundColor: hexToRgba(colors.phaseOvulation, 0.14) },
  // luteal: { backgroundColor: hexToRgba(colors.phaseLuteal, 0.22) },
  menstrual: { backgroundColor: colors.bg },
  follicular: { backgroundColor: colors.bg },
  ovulation: { backgroundColor: colors.bg },
  luteal: { backgroundColor: colors.bg },
});

/** Filled controls: active tabs, primary actions, key buttons — phase accent. */
export const phaseAccentFill = StyleSheet.create({
  menstrual: { backgroundColor: colors.phaseMenstrual },
  follicular: { backgroundColor: colors.phaseFollicular },
  ovulation: { backgroundColor: colors.phaseOvulation },
  luteal: { backgroundColor: colors.phaseLuteal },
});
