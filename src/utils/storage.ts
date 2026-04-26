import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CycleEntry } from './types';
import { compareISO } from './dates';

export const STORAGE_KEY = '@period_tracker_entries_v2';

/** Privacy screen copy — what each saved period entry can include (plain language). */
export const PERIOD_DATA_PRIVACY_ITEMS: { title: string; body: string }[] = [
  {
    title: 'Period dates',
    body: 'The first and last bleeding day you chose when you logged that period.',
  },
  {
    title: 'Notes',
    body: 'Anything you typed in your own words for that entry, if you added a note.',
  },
  {
    title: 'Symptoms',
    body: 'Optional symptom tags linked to an entry, if you choose to track them.',
  },
  {
    title: 'Mood',
    body: 'Optional mood tags you pick for that entry, separate from symptoms.',
  },
  {
    title: 'When it was saved',
    body: 'The date and time you tapped save, so your history can stay in order.',
  },
];

function normalizeStoredEntry(raw: unknown): CycleEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Partial<CycleEntry>;
  if (typeof e.id !== 'string' || typeof e.periodStartDate !== 'string' || typeof e.periodEndDate !== 'string') return null;
  const flowRaw = Number((e as any).flowStrength);
  const flowStrength = Number.isFinite(flowRaw) ? Math.min(5, Math.max(1, Math.round(flowRaw))) : 3;
  const symptomsRaw = Array.isArray(e.symptoms) ? e.symptoms.map(String) : [];
  const hadLegacyMoodChip = symptomsRaw.includes('mood');
  const symptomsClean = symptomsRaw.filter((s) => s !== 'mood');
  const moodStored = Array.isArray(e.mood) ? e.mood.map(String) : [];
  const mood = moodStored.length > 0 ? moodStored : hadLegacyMoodChip ? ['general'] : [];
  return {
    id: e.id,
    periodStartDate: e.periodStartDate,
    periodEndDate: e.periodEndDate,
    flowStrength,
    symptoms: symptomsClean,
    mood,
    notes: typeof e.notes === 'string' ? e.notes : '',
    savedAt: typeof e.savedAt === 'string' ? e.savedAt : new Date().toISOString(),
  };
}

export async function loadEntries(): Promise<CycleEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeStoredEntry).filter((x): x is CycleEntry => x !== null);
  } catch {
    return [];
  }
}

export async function saveEntries(entries: CycleEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export async function addEntry(entry: CycleEntry): Promise<void> {
  const existing = await loadEntries();
  await saveEntries([entry, ...existing]);
}

function entryDedupeKey(e: Pick<CycleEntry, 'periodStartDate' | 'periodEndDate'>): string {
  const lo = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodStartDate : e.periodEndDate;
  const hi = compareISO(e.periodStartDate, e.periodEndDate) <= 0 ? e.periodEndDate : e.periodStartDate;
  return `${lo}|${hi}`;
}

export async function addEntriesBulk(incoming: CycleEntry[]): Promise<{ imported: number; skippedDuplicates: number }> {
  const existing = await loadEntries();
  const seen = new Set(existing.map((e) => entryDedupeKey(e)));

  let imported = 0;
  let skippedDuplicates = 0;
  const toAdd: CycleEntry[] = [];
  for (const e of incoming) {
    const key = entryDedupeKey(e);
    if (seen.has(key)) {
      skippedDuplicates++;
      continue;
    }
    seen.add(key);
    toAdd.push(e);
    imported++;
  }

  if (toAdd.length > 0) {
    await saveEntries([...toAdd, ...existing]);
  }
  return { imported, skippedDuplicates };
}

export async function deleteAllEntries(): Promise<void> {
  await saveEntries([]);
}

export async function updateEntry(updated: CycleEntry): Promise<void> {
  const existing = await loadEntries();
  const next = existing.map((e) => (e.id === updated.id ? updated : e));
  await saveEntries(next);
}

export async function getEntryById(id: string): Promise<CycleEntry | null> {
  const existing = await loadEntries();
  return existing.find((e) => e.id === id) ?? null;
}

export async function deleteEntry(id: string): Promise<void> {
  const existing = await loadEntries();
  const next = existing.filter((e) => e.id !== id);
  await saveEntries(next);
}
