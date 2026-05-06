import type { CycleEntry } from './types';
import { toDateISO } from './dates';

type Rng = () => number;

function mulberry32(seed: number): Rng {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: Rng, items: T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function maybe(rng: Rng, p: number): boolean {
  return rng() < p;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function generateSampleCycleEntries(opts?: { year?: number; seed?: number }): CycleEntry[] {
  const year = opts?.year ?? new Date().getFullYear();
  const rng = mulberry32(opts?.seed ?? year * 1009 + 7);

  // Start with a plausible period near early Jan.
  let cursor = new Date(year, 0, 4 + Math.floor(rng() * 6));
  const endOfYear = new Date(year, 11, 31);

  const symptomPool = ['cramps', 'bloating', 'headache', 'fatigue', 'acne', 'nausea'] as const;
  const moodPool = ['calm', 'happy', 'low', 'anxious', 'irritable', 'energetic'] as const;
  const notesPool = [
    'Took it easy today.',
    'Hydrated + light walk.',
    'Slept a bit earlier.',
    'Gentle cramps, manageable.',
    'Low energy—kept plans simple.',
    'Felt steadier by the afternoon.',
    'Good mood day.',
    'Headache eased after lunch.',
  ];

  const entries: CycleEntry[] = [];
  let cycleIndex = 0;

  while (cursor <= endOfYear) {
    // Cycle length ~ 26–32 with small variance.
    const cycleLen = 26 + Math.floor(rng() * 7); // 26..32
    const periodLen = 4 + Math.floor(rng() * 3); // 4..6

    const start = new Date(cursor);
    const end = addDays(start, periodLen - 1);

    const symptoms: string[] = [];
    const mood: string[] = [];
    // Flow strength (1–5) tends to start higher then taper; store a single representative value per entry for now.
    const flowStrength =
      periodLen <= 4
        ? 2 + Math.floor(rng() * 3) // 2..4
        : 3 + Math.floor(rng() * 3); // 3..5

    // For demo/testing, make every period entry feel complete.
    // Always include at least one symptom + a short note.
    symptoms.push(pick(rng, [...symptomPool]));
    if (maybe(rng, 0.45)) symptoms.push(pick(rng, [...symptomPool]));
    if (maybe(rng, 0.75)) mood.push(pick(rng, [...moodPool]));

    const notes = pick(rng, notesPool);

    const entry: CycleEntry = {
      id: `sample-${year}-${cycleIndex}`,
      periodStartDate: toDateISO(start),
      periodEndDate: toDateISO(end),
      flowStrength,
      symptoms: Array.from(new Set(symptoms)),
      mood: Array.from(new Set(mood)),
      notes,
      savedAt: new Date(year, start.getMonth(), start.getDate(), 9, 0, 0).toISOString(),
    };
    entries.push(entry);

    cycleIndex++;
    cursor = addDays(start, cycleLen);
  }

  return entries;
}

