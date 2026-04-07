import { compareISO, parseISODate, toDateISO } from './dates';

export type RangeDraft = { start: string | null; end: string | null };

export function normalizePair(a: string, b: string): { start: string; end: string } {
  return compareISO(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a };
}

function dayDistance(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const ta = Date.UTC(ay, am - 1, ad);
  const tb = Date.UTC(by, bm - 1, bd);
  return Math.abs(Math.round((tb - ta) / 86400000));
}

function midpointISO(lo: string, hi: string): string {
  const a = parseISODate(lo).getTime();
  const b = parseISODate(hi).getTime();
  return toDateISO(new Date((a + b) / 2));
}

/**
 * Range taps:
 * - Empty → first tap sets start only (partial).
 * - Partial: same day again → clear; earlier day → move start; later day → complete range [start, d].
 * - Complete: single-day + tap that day → clear; single-day + other day → new range; multi-day → move nearer endpoint.
 */
export function applyRangeDayTap(sel: RangeDraft, d: string): RangeDraft {
  const { start, end } = sel;

  if (start == null && end == null) {
    return { start: d, end: null };
  }

  if (start != null && end == null) {
    if (d === start) return { start: null, end: null };
    if (compareISO(d, start) < 0) return { start: d, end: null };
    return normalizePair(start, d);
  }

  if (start == null || end == null) {
    return { start: d, end: null };
  }

  const lo = compareISO(start, end) <= 0 ? start : end;
  const hi = compareISO(start, end) <= 0 ? end : start;

  if (lo === hi) {
    if (d === lo) return { start: null, end: null };
    const n = normalizePair(lo, d);
    return { start: n.start, end: n.end };
  }

  const ds = dayDistance(d, lo);
  const de = dayDistance(d, hi);

  if (ds < de) {
    const n = normalizePair(d, hi);
    return { start: n.start, end: n.end };
  }
  if (de < ds) {
    const n = normalizePair(lo, d);
    return { start: n.start, end: n.end };
  }

  const mid = midpointISO(lo, hi);
  if (compareISO(d, mid) <= 0) {
    const n = normalizePair(d, hi);
    return { start: n.start, end: n.end };
  }
  const n2 = normalizePair(lo, d);
  return { start: n2.start, end: n2.end };
}

/** Stable string for dirty checks. Partial selections use a distinct prefix. */
export function rangeFingerprint(start: string | null, end: string | null): string {
  if (start == null && end == null) return '';
  if (start != null && end == null) return `partial:${start}`;
  if (start == null || end == null) return '';
  const n = normalizePair(start, end);
  return `${n.start}|${n.end}`;
}

export function isCompleteRange(start: string | null, end: string | null): boolean {
  return start != null && end != null;
}

export function canApplyRange(start: string | null, end: string | null): boolean {
  return start != null;
}
