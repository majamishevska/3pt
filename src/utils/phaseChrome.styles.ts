import { StyleSheet } from 'react-native';
import type { CyclePhaseId } from './phaseConfig';
import { palette } from './palette';

export const phaseAccentHex: Record<CyclePhaseId, string> = {
  menstrual: palette.pink,
  follicular: palette.green,
  ovulation: palette.orange,
  luteal: palette.blue,
};

/** Screen root tint — matches current cycle phase. */
export const phaseScreenBg = StyleSheet.create({
  menstrual: { backgroundColor: 'rgba(251, 138, 155, 0.12)' },
  follicular: { backgroundColor: 'rgba(213, 236, 192, 0.22)' },
  ovulation: { backgroundColor: 'rgba(253, 140, 79, 0.14)' },
  luteal: { backgroundColor: 'rgba(188, 231, 240, 0.22)' },
});

/** Filled controls: active tabs, primary actions, key buttons — phase accent. */
export const phaseAccentFill = StyleSheet.create({
  menstrual: { backgroundColor: palette.pink },
  follicular: { backgroundColor: palette.green },
  ovulation: { backgroundColor: palette.orange },
  luteal: { backgroundColor: palette.blue },
});
