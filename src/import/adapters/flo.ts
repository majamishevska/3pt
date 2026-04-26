import type { CycleEntry } from '../../utils/types';
import { compareISO, toDateISO } from '../../utils/dates';
import type { ImportInspection, ImportResult, ImportSelection } from '../types';

function isISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function normalizeISO(s: string): string | null {
  const t = s.trim();
  if (isISODate(t)) return t;
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const mm = String(Number(m[1])).padStart(2, '0');
    const dd = String(Number(m[2])).padStart(2, '0');
    return `${m[3]}-${mm}-${dd}`;
  }
  return null;
}

type Parsed = { startISO: string; endISO: string; notes?: string; symptoms?: string[] };

function parseRows(raw: string): Parsed[] {
  // MVP: accept simple CSV or JSON with common keys.
  const trimmed = raw.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as any;
      const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.entries) ? parsed.entries : [];
      return rows
        .map((r: any) => {
          const a = normalizeISO(String(r.periodStartDate ?? r.start ?? r.startDate ?? ''));
          const b = normalizeISO(String(r.periodEndDate ?? r.end ?? r.endDate ?? ''));
          if (!a || !b) return null;
          const lo = compareISO(a, b) <= 0 ? a : b;
          const hi = compareISO(a, b) <= 0 ? b : a;
          const notes = typeof r.notes === 'string' ? r.notes : '';
          const symptoms = Array.isArray(r.symptoms) ? r.symptoms.map(String) : [];
          return { startISO: lo, endISO: hi, notes, symptoms };
        })
        .filter(Boolean) as Parsed[];
    } catch {
      return [];
    }
  }

  // CSV: expect headers containing start/end.
  const lines = trimmed.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const startIdx = headers.findIndex((h) => ['periodstartdate', 'start', 'startdate', 'period_start'].includes(h));
  const endIdx = headers.findIndex((h) => ['periodenddate', 'end', 'enddate', 'period_end'].includes(h));
  const notesIdx = headers.findIndex((h) => ['notes', 'note'].includes(h));
  const symptomsIdx = headers.findIndex((h) => ['symptoms'].includes(h));
  if (startIdx < 0 || endIdx < 0) return [];

  return lines
    .slice(1)
    .map((ln) => ln.split(','))
    .map((cols) => {
      const a = normalizeISO(String(cols[startIdx] ?? ''));
      const b = normalizeISO(String(cols[endIdx] ?? ''));
      if (!a || !b) return null;
      const lo = compareISO(a, b) <= 0 ? a : b;
      const hi = compareISO(a, b) <= 0 ? b : a;
      const notes = notesIdx >= 0 ? String(cols[notesIdx] ?? '') : '';
      const symptomsRaw = symptomsIdx >= 0 ? String(cols[symptomsIdx] ?? '') : '';
      const symptoms = symptomsRaw ? symptomsRaw.split('|').map((s) => s.trim()).filter(Boolean) : [];
      return { startISO: lo, endISO: hi, notes, symptoms };
    })
    .filter(Boolean) as Parsed[];
}

export function inspectFlo(raw: string, fileName: string): ImportInspection {
  const rows = parseRows(raw);
  const span =
    rows.length === 0
      ? undefined
      : rows.reduce(
          (acc, r) => ({
            startISO: compareISO(r.startISO, acc.startISO) < 0 ? r.startISO : acc.startISO,
            endISO: compareISO(r.endISO, acc.endISO) > 0 ? r.endISO : acc.endISO,
          }),
          { startISO: rows[0].startISO, endISO: rows[0].endISO },
        );

  const notesCount = rows.filter((r) => (r.notes ?? '').trim().length > 0).length;
  const symptomsCount = rows.filter((r) => (r.symptoms ?? []).length > 0).length;

  return {
    source: 'flo',
    fileName,
    categories: [
      { id: 'periods', label: 'Period dates', count: rows.length, preview: rows.slice(0, 3).map((r) => `${r.startISO} → ${r.endISO}`), defaultEnabled: true },
      { id: 'symptoms', label: 'Symptoms', count: symptomsCount, preview: rows.filter((r) => (r.symptoms ?? []).length > 0).slice(0, 3).map((r) => (r.symptoms ?? []).join(', ')), defaultEnabled: false },
      { id: 'notes', label: 'Notes', count: notesCount, preview: rows.filter((r) => (r.notes ?? '').trim().length > 0).slice(0, 3).map((r) => String(r.notes).slice(0, 80)), defaultEnabled: false },
      { id: 'unknown', label: 'Other data', count: 0, preview: [], defaultEnabled: false },
    ],
    issues: rows.length === 0 ? ['Could not find any period ranges in this file.'] : [],
    stats: { periodsFound: rows.length, span },
  };
}

export function importFlo(raw: string, fileName: string, selection: ImportSelection): ImportResult {
  const parsed = parseRows(raw);
  const allowPeriods = selection.periods !== false;
  const allowNotes = !!selection.notes;
  const allowSymptoms = !!selection.symptoms;
  const warnings: string[] = [];

  const entries: CycleEntry[] = [];
  if (allowPeriods) {
    for (const r of parsed) {
      entries.push({
        id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        periodStartDate: r.startISO,
        periodEndDate: r.endISO,
        flowStrength: 3,
        symptoms: allowSymptoms ? (r.symptoms ?? []) : [],
        mood: [],
        notes: allowNotes ? String(r.notes ?? '').trim() : '',
        savedAt: new Date().toISOString(),
      });
    }
  } else {
    warnings.push('Period dates were not selected, so nothing was imported.');
  }

  if (selection.unknown) warnings.push('Other data was selected, but this app ignores non-period data for now.');

  return {
    source: 'flo',
    fileName,
    entries,
    warnings,
    counts: { parsed: parsed.length, imported: entries.length, skippedDuplicates: 0 },
  };
}

