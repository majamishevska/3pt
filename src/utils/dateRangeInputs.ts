import { compareISO, toDateISO } from './dates';

export type DateParseResult = { iso: string | null; error: string | null };

function isValidYMD(y: number, m: number, d: number): boolean {
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return false;
  if (y < 1900 || y > 2200) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/** Accepts YYYY-MM-DD or M/D/YYYY (also MM/DD/YYYY). Returns ISO (YYYY-MM-DD). */
export function parseUserDateToISO(input: string): DateParseResult {
  const raw = input.trim();
  if (!raw) return { iso: null, error: null };

  const isoMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    const m = Number(isoMatch[2]);
    const d = Number(isoMatch[3]);
    if (!isValidYMD(y, m, d)) return { iso: null, error: 'Invalid date' };
    return { iso: toDateISO(new Date(y, m - 1, d)), error: null };
  }

  const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const m = Number(slashMatch[1]);
    const d = Number(slashMatch[2]);
    const y = Number(slashMatch[3]);
    if (!isValidYMD(y, m, d)) return { iso: null, error: 'Invalid date' };
    return { iso: toDateISO(new Date(y, m - 1, d)), error: null };
  }

  return { iso: null, error: 'Use YYYY-MM-DD or MM/DD/YYYY' };
}

export function formatISOForInput(iso: string): string {
  return iso;
}

export function validateStartEnd(startISO: string | null, endISO: string | null): string | null {
  if (!startISO || !endISO) return 'Enter a start and end date';
  if (compareISO(endISO, startISO) < 0) return 'End date must be the same as or after the start date';
  return null;
}

export function addMonthsISO(anchorISO: string, deltaMonths: number): string {
  const [y, m, d] = anchorISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setMonth(dt.getMonth() + deltaMonths);
  return toDateISO(dt);
}

