/**
 * Single source of truth for the cycle ring: angles, arc spans, and the day dot.
 * Import these helpers from UI only — do not duplicate angle math in screens.
 *
 * Coordinate system (react-native-svg, y increases downward):
 * - Angles use Math.cos / Math.sin: 0 rad = 3 o'clock (east).
 * - Increasing angle moves CLOCKWISE on screen (6 o'clock, 9 o'clock, …).
 *
 * ## Fixed start (day 1)
 * `RING_START_ANGLE_RAD` is where **cycle day 1** begins (first day of bleeding).
 * The ring proceeds clockwise from there through the full cycle.
 *
 * `-π/2` = **12 o'clock** (top): cos(-π/2)=0, sin(-π/2)=-1 → (cx, cy - r).
 *
 * ## Day → angle
 * - Fraction `f = 0`: start of day 1. `f = 1`: full lap back to day 1.
 * - Dot at **midnight band center** for day `d`: `f = (d - 0.5) / totalDays`.
 *
 * ## Arc segments
 * Each phase sweeps `(phaseDays / totalDays) × 2π` radians, starting at the cumulative
 * fraction of previous phases. Paths use SVG elliptical arcs so proportions are exact.
 */

import type { PhaseDefinition } from './phaseConfig';
import { totalCycleDays } from './phaseConfig';

const TWO_PI = 2 * Math.PI;

/**
 * Radians at **12 o'clock**: **start of cycle day 1**. Ring grows clockwise.
 */
export const RING_START_ANGLE_RAD = -Math.PI / 2;

export type RingArcSegment = {
  phaseId: string;
  color: string;
  startDay: number;
  endDay: number;
  startAngleRad: number;
  sweepAngleRad: number;
};

export function angleAtCycleFraction(fraction: number): number {
  const f = fraction - Math.floor(fraction);
  return RING_START_ANGLE_RAD + f * TWO_PI;
}

export function angleAtDayCenterRad(cycleDay: number, totalDays: number): number {
  const d = Math.max(1, Math.min(cycleDay, totalDays));
  return angleAtCycleFraction((d - 0.5) / totalDays);
}

export function dotPositionOnRing(
  cx: number,
  cy: number,
  radius: number,
  cycleDay: number,
  totalDays: number,
): { x: number; y: number } {
  const a = angleAtDayCenterRad(cycleDay, totalDays);
  return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
}

export function buildRingArcSegments(defs: PhaseDefinition[]): RingArcSegment[] {
  const totalDays = totalCycleDays(defs);
  if (totalDays < 1) return [];

  let dayCursor = 1;
  let cumulativeDays = 0;
  const segments: RingArcSegment[] = [];

  for (const p of defs) {
    const startFraction = cumulativeDays / totalDays;
    const sweepFraction = p.days / totalDays;
    segments.push({
      phaseId: p.id,
      color: p.color,
      startDay: dayCursor,
      endDay: dayCursor + p.days - 1,
      startAngleRad: RING_START_ANGLE_RAD + startFraction * TWO_PI,
      sweepAngleRad: sweepFraction * TWO_PI,
    });
    cumulativeDays += p.days;
    dayCursor += p.days;
  }

  return segments;
}

/**
 * SVG path `d` for a circular arc. `sweep-flag` = 1 = clockwise (y-down), matching `startAngle + sweep`.
 */
export function svgArcPathD(
  cx: number,
  cy: number,
  radius: number,
  startAngleRad: number,
  sweepAngleRad: number,
): string {
  const x1 = cx + radius * Math.cos(startAngleRad);
  const y1 = cy + radius * Math.sin(startAngleRad);
  const endAngle = startAngleRad + sweepAngleRad;
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);
  const largeArc = sweepAngleRad >= Math.PI - 1e-9 ? 1 : 0;
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
}
