import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CycleEntry } from './types';

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
    title: 'When it was saved',
    body: 'The date and time you tapped save, so your history can stay in order.',
  },
];

export async function loadEntries(): Promise<CycleEntry[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CycleEntry[];
    return Array.isArray(parsed) ? parsed : [];
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
