import { compareISO, parseISODate } from './dates';

/** Inclusive calendar-day count between two YYYY-MM-DD values. */
export function periodLengthDaysInclusive(startISO: string, endISO: string): number {
  const lo = compareISO(startISO, endISO) <= 0 ? startISO : endISO;
  const hi = compareISO(startISO, endISO) <= 0 ? endISO : startISO;
  const [y1, m1, d1] = lo.split('-').map(Number);
  const [y2, m2, d2] = hi.split('-').map(Number);
  const t1 = Date.UTC(y1, m1 - 1, d1);
  const t2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((t2 - t1) / 86400000) + 1;
}

function shortDateWithYear(iso: string): string {
  try {
    return parseISODate(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

/**
 * Human-readable period span, e.g. "Apr 7 – 12, 2026" or "Dec 28, 2025 – Jan 4, 2026".
 */
export function formatPeriodRangeLabel(startISO: string, endISO: string): string {
  const lo = compareISO(startISO, endISO) <= 0 ? startISO : endISO;
  const hi = compareISO(startISO, endISO) <= 0 ? endISO : startISO;

  if (lo === hi) {
    return shortDateWithYear(lo);
  }

  const d0 = parseISODate(lo);
  const d1 = parseISODate(hi);
  const sameYear = d0.getFullYear() === d1.getFullYear();
  const sameMonth = sameYear && d0.getMonth() === d1.getMonth();

  if (sameMonth) {
    const mon = d0.toLocaleDateString(undefined, { month: 'short' });
    return `${mon} ${d0.getDate()} – ${d1.getDate()}, ${d1.getFullYear()}`;
  }

  if (sameYear) {
    const a = `${d0.toLocaleDateString(undefined, { month: 'short' })} ${d0.getDate()}`;
    const b = `${d1.toLocaleDateString(undefined, { month: 'short' })} ${d1.getDate()}, ${d1.getFullYear()}`;
    return `${a} – ${b}`;
  }

  return `${shortDateWithYear(lo)} – ${shortDateWithYear(hi)}`;
}

export function formatPeriodLengthLabel(days: number): string {
  if (days === 1) return '1 day';
  return `${days} days`;
}
