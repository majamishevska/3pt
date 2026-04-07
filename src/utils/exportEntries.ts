import type { CycleEntry } from './types';
import { compareISO } from './dates';

export type ExportFormat = 'json' | 'csv';

export function filterEntriesByDateRange(
  entries: CycleEntry[],
  startISO: string,
  endISO: string,
): CycleEntry[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startISO) || !/^\d{4}-\d{2}-\d{2}$/.test(endISO)) {
    return entries;
  }
  const rangeStart = compareISO(startISO, endISO) <= 0 ? startISO : endISO;
  const rangeEnd = compareISO(startISO, endISO) <= 0 ? endISO : startISO;
  return entries.filter((e) => {
    return compareISO(e.periodStartDate, rangeEnd) <= 0 && compareISO(e.periodStartDate, rangeStart) >= 0;
  });
}

function escapeCsvField(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function entriesToCSV(entries: CycleEntry[]): string {
  const header = 'id,periodStartDate,periodEndDate,symptoms,notes,savedAt';
  const rows = entries.map((e) =>
    [
      escapeCsvField(e.id),
      escapeCsvField(e.periodStartDate),
      escapeCsvField(e.periodEndDate),
      escapeCsvField(JSON.stringify(e.symptoms ?? [])),
      escapeCsvField(e.notes ?? ''),
      escapeCsvField(e.savedAt),
    ].join(','),
  );
  return [header, ...rows].join('\n');
}

export function entriesToJSON(entries: CycleEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function formatExport(entries: CycleEntry[], format: ExportFormat): string {
  return format === 'csv' ? entriesToCSV(entries) : entriesToJSON(entries);
}
