import { parseISODate, toDateISO } from './dates';

export type MonthCursor = { year: number; monthIndex: number };

export function monthCursorFromISO(iso: string): MonthCursor {
  const d = parseISODate(iso);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

export function shiftMonth(c: MonthCursor, delta: number): MonthCursor {
  const d = new Date(c.year, c.monthIndex + delta, 1);
  return { year: d.getFullYear(), monthIndex: d.getMonth() };
}

export function formatMonthTitle(c: MonthCursor): string {
  return new Date(c.year, c.monthIndex, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

/** Rows of week cells: null = padding; number = day of month (1-based). */
export function buildMonthWeeks(year: number, monthIndex: number): (number | null)[][] {
  const first = new Date(year, monthIndex, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export function isoFromDay(year: number, monthIndex: number, day: number): string {
  return toDateISO(new Date(year, monthIndex, day));
}
