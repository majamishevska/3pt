import type { DetectedSource, ImportInspection, ImportResult, ImportSelection } from './types';
import { detectSource } from './detect';
import { inspectAppleHealthXml, importAppleHealthXml } from './adapters/appleHealthXml';
import { inspectClue, importClue } from './adapters/clue';
import { inspectFlo, importFlo } from './adapters/flo';

function inspectForSource(source: DetectedSource, raw: string, fileName: string): ImportInspection {
  if (source === 'appleHealth') return inspectAppleHealthXml(raw, fileName);
  if (source === 'flo') return inspectFlo(raw, fileName);
  if (source === 'clue') return inspectClue(raw, fileName);
  return {
    source: 'unknown',
    fileName,
    categories: [{ id: 'unknown', label: 'Unrecognized data', count: 0, preview: [], defaultEnabled: false }],
    issues: ['This file type isn’t recognized yet. Try exporting from Flo, Clue, or Apple Health.'],
    stats: { periodsFound: 0 },
  };
}

function importForSource(source: DetectedSource, raw: string, fileName: string, selection: ImportSelection): ImportResult {
  if (source === 'appleHealth') return importAppleHealthXml(raw, fileName, selection);
  if (source === 'flo') return importFlo(raw, fileName, selection);
  if (source === 'clue') return importClue(raw, fileName, selection);
  return { source: 'unknown', fileName, entries: [], warnings: ['Unsupported file.'], counts: { parsed: 0, imported: 0, skippedDuplicates: 0 } };
}

export function inspectImport(raw: string, fileName: string): ImportInspection {
  const source = detectSource(fileName, raw);
  if (source === 'appleHealth' || source === 'flo' || source === 'clue') return inspectForSource(source, raw, fileName);

  // Fallback: try clue then flo to salvage generic exports.
  const clue = inspectClue(raw, fileName);
  if (clue.stats.periodsFound > 0) return clue;
  const flo = inspectFlo(raw, fileName);
  if (flo.stats.periodsFound > 0) return flo;

  return inspectForSource('unknown', raw, fileName);
}

export function importFromInspection(
  raw: string,
  fileName: string,
  selection: ImportSelection,
): ImportResult {
  const source = detectSource(fileName, raw);
  if (source === 'appleHealth' || source === 'flo' || source === 'clue') return importForSource(source, raw, fileName, selection);

  // Fallback: attempt clue then flo.
  const clue = importClue(raw, fileName, selection);
  if (clue.entries.length > 0) return clue;
  return importFlo(raw, fileName, selection);
}

export function inspectImportWithSource(raw: string, fileName: string, source: Exclude<DetectedSource, 'unknown'>): ImportInspection {
  // Skip detection and force the adapter the user chose.
  return inspectForSource(source, raw, fileName);
}

export function importWithSource(
  raw: string,
  fileName: string,
  source: Exclude<DetectedSource, 'unknown'>,
  selection: ImportSelection,
): ImportResult {
  return importForSource(source, raw, fileName, selection);
}

