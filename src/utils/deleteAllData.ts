import { deleteAllEntries } from './storage';
import { deleteAllImportSessions } from './importStorage';

export async function deleteAllLocalData(opts?: { includeSettings?: boolean }): Promise<void> {
  await Promise.all([deleteAllEntries(), deleteAllImportSessions()]);
  // Default: keep profile/preferences unless explicitly requested later.
  if (opts?.includeSettings) {
    // Intentionally not implemented yet: settings live in `settingsStorage.ts`.
    // We can add a `resetSettings()` helper there if you decide Delete All should include settings.
  }
}

