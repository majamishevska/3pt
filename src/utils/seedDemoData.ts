import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadEntries, saveEntries } from './storage';
import { generateSampleCycleEntries } from './sampleData';
import { addDaysISO, compareISO, toDateISO } from './dates';

const SEEDED_KEY = '@period_tracker_demo_seeded_v1';

function clampFlow(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 3;
  return Math.min(5, Math.max(1, Math.round(v)));
}

function isSampleId(id: unknown): boolean {
  return typeof id === 'string' && id.startsWith('sample-');
}

function shiftDemoLatestToFollicular(entries: ReturnType<typeof generateSampleCycleEntries>, todayISO: string) {
  if (entries.length === 0) return entries;
  // Follicular is cycle days 6–13. Pick day 9 for “clearly follicular”.
  // cycleDay = daysSince(anchor, today) + 1  => anchor = today - (cycleDay-1)
  const desiredCycleDay = 9;
  const anchorISO = addDaysISO(todayISO, -(desiredCycleDay - 1));

  // Use the newest entry (by start date) as the anchor.
  const sortedIdx = entries
    .map((e, idx) => ({ idx, start: e.periodStartDate }))
    .sort((a, b) => compareISO(b.start, a.start));
  const newestIdx = sortedIdx[0]?.idx ?? 0;
  const newest = entries[newestIdx]!;

  const startISO = anchorISO;
  const endISO = addDaysISO(startISO, 4); // keep 5-day demo bleed

  const updated = [...entries];
  updated[newestIdx] = {
    ...newest,
    periodStartDate: startISO,
    periodEndDate: endISO,
    savedAt: new Date().toISOString(),
  };
  return updated;
}

async function ensureDemoDataAdjusted(): Promise<void> {
  const todayISO = toDateISO(new Date());
  const existing = await loadEntries();
  if (existing.length === 0) return;

  // Only auto-adjust if this looks like our seeded demo set.
  const sampleCount = existing.filter((e) => isSampleId(e.id)).length;
  if (sampleCount < Math.max(3, Math.floor(existing.length * 0.7))) return;

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
  const symptomPool = ['cramps', 'bloating', 'headache', 'fatigue', 'acne'];

  const withCompleteness = existing.map((e, idx) => {
    const notes = typeof e.notes === 'string' && e.notes.trim().length > 0 ? e.notes : notesPool[idx % notesPool.length]!;
    const symptoms = Array.isArray(e.symptoms) && e.symptoms.length > 0 ? e.symptoms : [symptomPool[idx % symptomPool.length]!];
    return {
      ...e,
      notes,
      symptoms,
      flowStrength: clampFlow((e as any).flowStrength),
    };
  });

  // Shift latest entry so today is follicular.
  const shifted = shiftDemoLatestToFollicular(withCompleteness as any, todayISO);
  await saveEntries(shifted as any);
}

/**
 * Seeds realistic demo data exactly once (per install), only when there are no entries yet.
 * Local-only; no network.
 */
export async function ensureDemoDataSeeded(): Promise<void> {
  const already = await AsyncStorage.getItem(SEEDED_KEY);
  if (already === '1') {
    await ensureDemoDataAdjusted();
    return;
  }

  const existing = await loadEntries();
  if (existing.length > 0) {
    await AsyncStorage.setItem(SEEDED_KEY, '1');
    await ensureDemoDataAdjusted();
    return;
  }

  const year = new Date().getFullYear();
  const demo = generateSampleCycleEntries({ year });
  await saveEntries(demo);
  await AsyncStorage.setItem(SEEDED_KEY, '1');
  await ensureDemoDataAdjusted();
}

