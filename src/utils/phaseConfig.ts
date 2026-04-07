import { colors } from './theme';

export type CyclePhaseId = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

/** Phases in ring order — menstrual first (cycle day 1 / first day of bleeding). */
export const PHASE_ORDER: CyclePhaseId[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

export type PhaseDefinition = {
  id: CyclePhaseId;
  label: string;
  shortLabel: string;
  color: string;
  days: number;
};

/**
 * Default 28-day model (day 1 = first day of bleeding):
 * - Menstrual: days 1–5 (5/28 of ring)
 * - Follicular: days 6–13 (8/28)
 * - Ovulation: day 14 (1/28)
 * - Luteal: days 15–28 (14/28)
 */
export const DEFAULT_PHASE_DEFINITIONS: PhaseDefinition[] = [
  { id: 'menstrual', label: 'Menstrual', shortLabel: 'Menstrual', color: colors.phaseMenstrual, days: 5 },
  { id: 'follicular', label: 'Follicular', shortLabel: 'Follicular', color: colors.phaseFollicular, days: 8 },
  { id: 'ovulation', label: 'Ovulation', shortLabel: 'Ovulation', color: colors.phaseOvulation, days: 1 },
  { id: 'luteal', label: 'Luteal', shortLabel: 'Luteal', color: colors.phaseLuteal, days: 14 },
];

export function totalCycleDays(defs: PhaseDefinition[]): number {
  return defs.reduce((s, p) => s + p.days, 0);
}

export function clonePhaseDefinitions(defs: PhaseDefinition[]): PhaseDefinition[] {
  return defs.map((p) => ({ ...p }));
}
