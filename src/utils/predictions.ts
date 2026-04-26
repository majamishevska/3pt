import type { CycleEntry } from './types';
import { addDaysISO, compareISO } from './dates';
import { periodLengthDaysInclusive } from './historyFormat';
import type { AppSettings } from './settingsStorage';

export type PredictedPeriodRange = { startISO: string; endISO: string };

function clampInt(n: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  if (a.length % 2 === 1) return a[mid]!;
  return Math.round(((a[mid - 1] ?? a[mid] ?? 0) + (a[mid] ?? 0)) / 2);
}

export function inferCycleAndPeriodLengthDays(entries: CycleEntry[], settings: AppSettings): { cycleDays: number; periodDays: number } {
  const starts = [...entries]
    .map((e) => e.periodStartDate)
    .filter((x): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x))
    .sort(compareISO);

  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i++) {
    const prev = starts[i - 1]!;
    const cur = starts[i]!;
    // Count calendar days between starts (exclusive of prev day).
    // Using ISO add loop keeps it consistent with our date utilities.
    let d = prev;
    let count = 0;
    while (compareISO(d, cur) < 0 && count < 120) {
      d = addDaysISO(d, 1);
      count++;
    }
    if (count >= 15 && count <= 60) gaps.push(count);
  }

  const periodLens = entries
    .map((e) => periodLengthDaysInclusive(e.periodStartDate, e.periodEndDate))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 14);

  const cycleFromData = median(gaps);
  const periodFromData = median(periodLens);

  return {
    cycleDays: clampInt(cycleFromData ?? settings.averageCycleLengthDays, 15, 60, 28),
    periodDays: clampInt(periodFromData ?? settings.averagePeriodLengthDays, 1, 14, 5),
  };
}

export function latestLoggedPeriodStart(entries: CycleEntry[]): string | null {
  const starts = entries
    .map((e) => e.periodStartDate)
    .filter((x): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x));
  if (starts.length === 0) return null;
  starts.sort(compareISO);
  return starts[starts.length - 1] ?? null;
}

export function predictPeriodsWithinRange(args: {
  entries: CycleEntry[];
  settings: AppSettings;
  rangeStartISO: string;
  rangeEndISO: string;
}): PredictedPeriodRange[] {
  const { entries, settings, rangeStartISO, rangeEndISO } = args;
  const anchor = latestLoggedPeriodStart(entries);
  if (!anchor) return [];

  const { cycleDays, periodDays } = inferCycleAndPeriodLengthDays(entries, settings);

  const out: PredictedPeriodRange[] = [];
  let start = addDaysISO(anchor, cycleDays);
  let guard = 0;

  while (compareISO(start, rangeEndISO) <= 0 && guard < 36) {
    const end = addDaysISO(start, periodDays - 1);
    const overlaps = compareISO(start, rangeEndISO) <= 0 && compareISO(end, rangeStartISO) >= 0;
    if (overlaps) out.push({ startISO: start, endISO: end });
    start = addDaysISO(start, cycleDays);
    guard++;
  }

  return out;
}

export function predictedDateSet(ranges: PredictedPeriodRange[]): Set<string> {
  const out = new Set<string>();
  for (const r of ranges) {
    let d = r.startISO;
    out.add(d);
    let guard = 0;
    while (compareISO(d, r.endISO) < 0 && guard < 31) {
      d = addDaysISO(d, 1);
      out.add(d);
      guard++;
    }
  }
  return out;
}

