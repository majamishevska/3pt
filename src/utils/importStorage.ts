import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DetectedSource, ImportCategoryId } from '../import/types';

export const IMPORT_SESSIONS_KEY = '@period_tracker_import_sessions_v1';

export type ImportSession = {
  id: string;
  source: DetectedSource;
  importedAt: string; // ISO timestamp
  fileName: string;
  categoriesImported: ImportCategoryId[];
  counts: {
    parsed: number;
    imported: number;
    skippedDuplicates: number;
  };
  warnings: string[];
};

export async function loadImportSessions(): Promise<ImportSession[]> {
  const raw = await AsyncStorage.getItem(IMPORT_SESSIONS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ImportSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveImportSessions(sessions: ImportSession[]): Promise<void> {
  await AsyncStorage.setItem(IMPORT_SESSIONS_KEY, JSON.stringify(sessions));
}

export async function addImportSession(session: ImportSession): Promise<void> {
  const existing = await loadImportSessions();
  await saveImportSessions([session, ...existing]);
}

export async function deleteAllImportSessions(): Promise<void> {
  await saveImportSessions([]);
}

