import type { CyclePhaseId, PhaseDefinition } from './phaseConfig';
import { totalCycleDays } from './phaseConfig';
import { addDaysISO, compareISO, parseISODate, toDateISO } from './dates';

export type PhasePlacement = {
  phaseId: CyclePhaseId;
  label: string;
  color: string;
  startDay: number;
  endDay: number;
};

export type CycleContext = {
  cycleLength: number;
  cycleDay: number;
  placements: PhasePlacement[];
  current: PhasePlacement & { dayWithinPhase: number };
};

export function buildPlacements(defs: PhaseDefinition[]): PhasePlacement[] {
  let cursor = 1;
  return defs.map((d) => {
    const startDay = cursor;
    const endDay = cursor + d.days - 1;
    cursor = endDay + 1;
    return {
      phaseId: d.id,
      label: d.label,
      color: d.color,
      startDay,
      endDay,
    };
  });
}

export function resolvePhaseForCycleDay(cycleDay: number, defs: PhaseDefinition[]): CycleContext {
  const cycleLength = totalCycleDays(defs);
  const clamped = Math.min(Math.max(cycleDay, 1), cycleLength);
  const placements = buildPlacements(defs);
  const current =
    placements.find((p) => clamped >= p.startDay && clamped <= p.endDay) ?? placements[placements.length - 1];
  const dayWithinPhase = clamped - current.startDay + 1;
  return {
    cycleLength,
    cycleDay: clamped,
    placements,
    current: { ...current, dayWithinPhase },
  };
}

export function calendarDaysSince(isoStart: string, isoEnd: string): number {
  const a = parseISODate(isoStart);
  const b = parseISODate(isoEnd);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function cycleDayFromAnchor(lastPeriodStartISO: string, todayISO: string, cycleLength: number): number {
  if (cycleLength < 1) return 1;
  const raw = calendarDaysSince(lastPeriodStartISO, todayISO);
  const mod = ((raw % cycleLength) + cycleLength) % cycleLength;
  return mod + 1;
}

export function nextPeriodStartISO(lastPeriodStartISO: string, cycleLength: number): string {
  return addDaysISO(lastPeriodStartISO, cycleLength);
}

export function latestPeriodStartBefore(entries: { periodStartDate: string }[], todayISO: string): string | null {
  const sorted = [...entries].sort((a, b) => compareISO(b.periodStartDate, a.periodStartDate));
  for (const e of sorted) {
    if (compareISO(e.periodStartDate, todayISO) <= 0) return e.periodStartDate;
  }
  return null;
}

export const MOCK_LAST_PERIOD_START_OFFSET_DAYS = 11;

export function mockLastPeriodStartISO(today: Date = new Date()): string {
  const t = new Date(today);
  t.setDate(t.getDate() - MOCK_LAST_PERIOD_START_OFFSET_DAYS);
  return toDateISO(t);
}
