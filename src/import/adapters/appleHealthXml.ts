import type { CycleEntry } from '../../utils/types';
import { compareISO, toDateISO } from '../../utils/dates';
import type { ImportInspection, ImportResult, ImportSelection } from '../types';

function isoFromAppleDate(s: string): string | null {
  // Apple Health often uses: "2023-01-02 07:12:34 -0700"
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  // Some exports might be ISO-ish.
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m2) return `${m2[1]}-${m2[2]}-${m2[3]}`;
  return null;
}

type MenstrualRecord = { startISO: string; endISO: string };

function extractMenstrualFlowRecords(raw: string): { records: MenstrualRecord[]; issues: string[] } {
  const issues: string[] = [];
  const records: MenstrualRecord[] = [];

  // Lightweight scan: pull only Record tags with the menstrual-flow type.
  const re = /<Record\b[^>]*\btype="HKCategoryTypeIdentifierMenstrualFlow"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const tag = m[0];
    const startAttr = tag.match(/\bstartDate="([^"]+)"/)?.[1];
    const endAttr = tag.match(/\bendDate="([^"]+)"/)?.[1];
    const valueAttr = tag.match(/\bvalue="([^"]+)"/)?.[1];

    if (valueAttr && valueAttr.toLowerCase().includes('un')) {
      // 'unspecified' or 'not applicable' — skip.
      continue;
    }

    const startISO = startAttr ? isoFromAppleDate(startAttr) : null;
    const endISO = endAttr ? isoFromAppleDate(endAttr) : null;
    if (!startISO || !endISO) continue;

    const lo = compareISO(startISO, endISO) <= 0 ? startISO : endISO;
    const hi = compareISO(startISO, endISO) <= 0 ? endISO : startISO;
    records.push({ startISO: lo, endISO: hi });
  }

  if (records.length === 0) {
    issues.push('No menstrual flow records found in this Apple Health export.');
  }

  return { records, issues };
}

function dedupeRecords(records: MenstrualRecord[]): MenstrualRecord[] {
  const seen = new Set<string>();
  const out: MenstrualRecord[] = [];
  for (const r of records) {
    const key = `${r.startISO}|${r.endISO}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export function inspectAppleHealthXml(raw: string, fileName: string): ImportInspection {
  const { records, issues } = extractMenstrualFlowRecords(raw);
  const deduped = dedupeRecords(records);
  const span =
    deduped.length === 0
      ? undefined
      : deduped.reduce(
          (acc, r) => {
            return {
              startISO: compareISO(r.startISO, acc.startISO) < 0 ? r.startISO : acc.startISO,
              endISO: compareISO(r.endISO, acc.endISO) > 0 ? r.endISO : acc.endISO,
            };
          },
          { startISO: deduped[0].startISO, endISO: deduped[0].endISO },
        );

  const previews = deduped.slice(0, 3).map((r) => `${r.startISO} → ${r.endISO}`);

  return {
    source: 'appleHealth',
    fileName,
    categories: [
      { id: 'periods', label: 'Period dates', count: deduped.length, preview: previews, defaultEnabled: true },
      { id: 'symptoms', label: 'Symptoms', count: 0, preview: [], defaultEnabled: false },
      { id: 'notes', label: 'Notes', count: 0, preview: [], defaultEnabled: false },
      { id: 'unknown', label: 'Other data', count: 0, preview: [], defaultEnabled: false },
    ],
    issues,
    stats: { periodsFound: deduped.length, span },
  };
}

export function importAppleHealthXml(raw: string, fileName: string, selection: ImportSelection): ImportResult {
  const warnings: string[] = [];
  const { records } = extractMenstrualFlowRecords(raw);
  const deduped = dedupeRecords(records);

  const allowPeriods = selection.periods !== false;
  const entries: CycleEntry[] = [];

  if (allowPeriods) {
    for (const r of deduped) {
      entries.push({
        id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        periodStartDate: r.startISO,
        periodEndDate: r.endISO,
        flowStrength: 3,
        symptoms: [],
        mood: [],
        notes: '',
        savedAt: new Date().toISOString(),
      });
    }
  }

  if (selection.notes) warnings.push('Notes were selected, but Apple Health export adapter does not import notes yet.');
  if (selection.symptoms)
    warnings.push('Symptoms were selected, but Apple Health export adapter does not import symptoms yet.');
  if (selection.unknown) warnings.push('Other data was selected, but this app ignores non-period data for now.');

  return {
    source: 'appleHealth',
    fileName,
    entries,
    warnings,
    counts: { parsed: deduped.length, imported: entries.length, skippedDuplicates: 0 },
  };
}

