import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { ScreenHeader } from '../components/ScreenHeader';
import { FilePickerCard } from '../components/FilePickerCard';
import { ChecklistRow } from '../components/ChecklistRow';
import { PreviewList } from '../components/PreviewList';
import { inspectImportWithSource, importWithSource } from '../import';
import type { DetectedSource, ImportCategoryId, ImportInspection, ImportSelection } from '../import/types';
import { addEntriesBulk } from '../utils/storage';
import { addImportSession } from '../utils/importStorage';
import { useCyclePhaseId } from '../hooks/useCyclePhaseAccent';
import type { CyclePhaseId } from '../utils/phaseConfig';
import { phaseAccentFill, phaseScreenBg } from '../utils/phaseChrome.styles';
import type { CycleEntry } from '../utils/types';
import { compareISO } from '../utils/dates';
import { colors } from '../utils/theme';
import { styles } from './ImportInspectScreen.styles';

function defaultSelectionFromInspection(inspection: ImportInspection | null): ImportSelection {
  return {
    periods: inspection?.categories.find((c) => c.id === 'periods')?.defaultEnabled ?? true,
    symptoms: inspection?.categories.find((c) => c.id === 'symptoms')?.defaultEnabled ?? false,
    notes: inspection?.categories.find((c) => c.id === 'notes')?.defaultEnabled ?? false,
    unknown: inspection?.categories.find((c) => c.id === 'unknown')?.defaultEnabled ?? false,
  };
}

type ImportSourceChoice = 'flo' | 'clue' | 'appleHealth' | 'threept';

function safeText(s: unknown): string {
  return typeof s === 'string' ? s : '';
}

function unquoteCsv(s: string): string {
  const t = s.trim();
  if (t.startsWith('"') && t.endsWith('"')) return t.slice(1, -1).replace(/""/g, '"');
  return t;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i + 1] === '"') {
      cur += '"';
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map(unquoteCsv);
}

function parse3PTExportJSON(raw: string): CycleEntry[] {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((e: any) => {
      const start = safeText(e.periodStartDate);
      const end = safeText(e.periodEndDate);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return null;
      const flowRaw = Number(e?.flowStrength);
      const flowStrength = Number.isFinite(flowRaw) ? Math.min(5, Math.max(1, Math.round(flowRaw))) : 3;
      return {
        id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        periodStartDate: start,
        periodEndDate: end,
        flowStrength,
        symptoms: Array.isArray(e.symptoms) ? e.symptoms.map(String) : [],
        mood: Array.isArray(e.mood) ? e.mood.map(String) : [],
        notes: safeText(e.notes).trim(),
        savedAt: new Date().toISOString(),
      } satisfies CycleEntry;
    })
    .filter(Boolean) as CycleEntry[];
}

function parse3PTExportCSV(raw: string): CycleEntry[] {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim());
  const idxStart = header.indexOf('periodStartDate');
  const idxEnd = header.indexOf('periodEndDate');
  const idxFlow = header.indexOf('flowStrength');
  const idxSymptoms = header.indexOf('symptoms');
  const idxMood = header.indexOf('mood');
  const idxNotes = header.indexOf('notes');
  if (idxStart < 0 || idxEnd < 0) return [];

  return lines
    .slice(1)
    .map((ln) => splitCsvLine(ln))
    .map((cols) => {
      const start = safeText(cols[idxStart]);
      const end = safeText(cols[idxEnd]);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return null;
      const flowRaw = idxFlow >= 0 ? Number(safeText(cols[idxFlow])) : NaN;
      const flowStrength = Number.isFinite(flowRaw) ? Math.min(5, Math.max(1, Math.round(flowRaw))) : 3;
      let symptoms: string[] = [];
      if (idxSymptoms >= 0) {
        try {
          const parsed = JSON.parse(safeText(cols[idxSymptoms]));
          if (Array.isArray(parsed)) symptoms = parsed.map(String);
        } catch {
          symptoms = [];
        }
      }
      let mood: string[] = [];
      if (idxMood >= 0) {
        try {
          const parsed = JSON.parse(safeText(cols[idxMood]));
          if (Array.isArray(parsed)) mood = parsed.map(String);
        } catch {
          mood = [];
        }
      }
      const notes = idxNotes >= 0 ? safeText(cols[idxNotes]).trim() : '';
      return {
        id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        periodStartDate: start,
        periodEndDate: end,
        flowStrength,
        symptoms,
        mood,
        notes,
        savedAt: new Date().toISOString(),
      } satisfies CycleEntry;
    })
    .filter(Boolean) as CycleEntry[];
}

function parse3PT(raw: string): CycleEntry[] {
  const t = raw.trim();
  if (!t) return [];
  if (t.startsWith('[')) {
    try {
      return parse3PTExportJSON(t);
    } catch {
      return [];
    }
  }
  if (t.startsWith('id,') || t.includes('periodStartDate')) {
    return parse3PTExportCSV(t);
  }
  try {
    return parse3PTExportJSON(t);
  } catch {
    return [];
  }
}

export default function ImportInspectScreen() {
  const phaseId = useCyclePhaseId() as CyclePhaseId;
  const phaseFill = phaseAccentFill[phaseId];

  const [source, setSource] = useState<ImportSourceChoice | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [raw, setRaw] = useState<string | null>(null);

  const [inspection, setInspection] = useState<ImportInspection | null>(null);
  const [selection, setSelection] = useState<ImportSelection>(() => defaultSelectionFromInspection(null));
  const [threePTPreview, setThreePTPreview] = useState<{ count: number; span?: { startISO: string; endISO: string } } | null>(
    null,
  );
  const [expanded, setExpanded] = useState<Record<ImportCategoryId, boolean>>({
    periods: true,
    symptoms: false,
    notes: false,
    unknown: false,
  });
  const [importing, setImporting] = useState(false);

  const canImport = useMemo(() => {
    if (!source) return false;
    if (source === 'threept') {
      return !!raw && (threePTPreview?.count ?? 0) > 0;
    }
    if (!inspection) return false;
    const hasPeriods = inspection.stats.periodsFound > 0;
    return hasPeriods && selection.periods;
  }, [inspection, raw, selection.periods, source, threePTPreview?.count]);

  const resetFileState = () => {
    setFileUri(null);
    setFileName(null);
    setFileSize(null);
    setRaw(null);
    setInspection(null);
    setSelection(defaultSelectionFromInspection(null));
    setThreePTPreview(null);
  };

  const onChooseSource = (next: ImportSourceChoice) => {
    setSource(next);
    resetFileState();
  };

  const pickFile = useCallback(() => {
    void (async () => {
      if (!source) {
        Alert.alert('Choose a source', 'Select where you’re importing from first.');
        return;
      }
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/json', 'text/xml', 'application/xml', '*/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      setFileUri(asset.uri);
      setFileName(asset.name ?? 'import-file');
      setFileSize(typeof asset.size === 'number' ? asset.size : null);

      try {
        const nextRaw = await FileSystem.readAsStringAsync(asset.uri);
        setRaw(nextRaw);
        if (source === 'threept') {
          const entries = parse3PT(nextRaw);
          if (entries.length === 0) {
            setThreePTPreview({ count: 0 });
            return;
          }
          const span = entries.reduce(
            (acc, e) => ({
              startISO: compareISO(e.periodStartDate, acc.startISO) < 0 ? e.periodStartDate : acc.startISO,
              endISO: compareISO(e.periodEndDate, acc.endISO) > 0 ? e.periodEndDate : acc.endISO,
            }),
            { startISO: entries[0].periodStartDate, endISO: entries[0].periodEndDate },
          );
          setThreePTPreview({ count: entries.length, span });
          return;
        }

        const forced = source === 'appleHealth' ? 'appleHealth' : source;
        const nextInspection = inspectImportWithSource(nextRaw, asset.name ?? 'import-file', forced as Exclude<DetectedSource, 'unknown'>);
        setInspection(nextInspection);
        setSelection(defaultSelectionFromInspection(nextInspection));
      } catch (e: any) {
        setRaw(null);
        setInspection(null);
        setSelection(defaultSelectionFromInspection(null));
        setThreePTPreview(null);
        Alert.alert('Couldn’t read file', e?.message ?? 'Please try a different export file.');
      }
    })();
  }, [source]);

  const toggleCategory = (id: ImportCategoryId, next: boolean) => {
    setSelection((s) => ({ ...s, [id]: next }));
  };

  const doImport = useCallback(() => {
    if (!source || !raw || !fileName) return;
    void (async () => {
      setImporting(true);
      try {
        if (source === 'threept') {
          const entries = parse3PT(raw);
          if (entries.length === 0) {
            Alert.alert('Unsupported file', 'This doesn’t look like a 3PT export (JSON or CSV).');
            return;
          }
          const bulk = await addEntriesBulk(entries);
          Alert.alert(
            'Import complete',
            `Imported ${bulk.imported} periods.${bulk.skippedDuplicates > 0 ? ` Skipped ${bulk.skippedDuplicates} duplicates.` : ''}`,
            [{ text: 'Done', style: 'cancel' }, { text: 'Open history', onPress: () => router.push('/history' as any) }],
          );
          return;
        }

        if (!inspection || !selection.periods) {
          Alert.alert('Nothing to import', 'Turn on “Period dates” to import.');
          return;
        }

        const forced = source === 'appleHealth' ? 'appleHealth' : source;
        const result = importWithSource(raw, fileName, forced as Exclude<DetectedSource, 'unknown'>, selection);

        const bulk = await addEntriesBulk(result.entries);
        const finalCounts = { parsed: result.counts.parsed, imported: bulk.imported, skippedDuplicates: bulk.skippedDuplicates };

        await addImportSession({
          id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          source: result.source,
          importedAt: new Date().toISOString(),
          fileName: result.fileName,
          categoriesImported: (Object.keys(selection) as ImportCategoryId[]).filter((k) => !!selection[k]),
          counts: finalCounts,
          warnings: result.warnings,
        });

        Alert.alert(
          'Import complete',
          `Imported ${finalCounts.imported} periods.${finalCounts.skippedDuplicates > 0 ? ` Skipped ${finalCounts.skippedDuplicates} duplicates.` : ''}`,
          [{ text: 'Done', style: 'cancel' }, { text: 'Open history', onPress: () => router.push('/history' as any) }],
        );
      } catch (e: any) {
        Alert.alert('Import failed', e?.message ?? 'Please try again.');
      } finally {
        setImporting(false);
      }
    })();
  }, [fileName, inspection, raw, selection, source]);

  return (
    <SafeAreaView style={[styles.root, phaseScreenBg[phaseId]]} edges={['top']}>
      <ScreenHeader title="Import" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>Choose where you’re importing from. Then pick a file and import.</Text>

        <Text style={styles.sectionLabel}>Source</Text>
        <View style={styles.optionList}>
          {([
            { id: 'flo', title: 'Flo', body: 'Import your Flo export file.' },
            { id: 'clue', title: 'Clue', body: 'Import your Clue export file.' },
            { id: 'appleHealth', title: 'Apple Health', body: 'Import from Apple Health export XML.' },
            { id: 'threept', title: '3PT', body: 'Import a file you exported from this app (JSON or CSV).' },
          ] as const).map((opt) => {
            const selected = source === opt.id;
            return (
              <Pressable
                key={opt.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Import from ${opt.title}`}
                onPress={() => onChooseSource(opt.id)}
                style={({ pressed }) => [
                  styles.optionCard,
                  selected && styles.optionCardSelected,
                  pressed && { opacity: 0.92 },
                ]}
              >
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  <Text style={styles.optionBody}>{opt.body}</Text>
                </View>
                {opt.id === 'appleHealth' ? (
                  <Ionicons name="logo-apple" size={20} color={colors.text} />
                ) : opt.id === 'threept' ? (
                  <Ionicons name="repeat-outline" size={20} color={colors.text} />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={20} color={colors.text} />
                )}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>File</Text>
        <View style={styles.fileCardWrap}>
          <FilePickerCard fileName={fileName} fileSizeBytes={fileSize} onPick={pickFile} />
        </View>

        {source === 'threept' && threePTPreview ? (
          <>
            <Text style={styles.sectionLabel}>Preview</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                {threePTPreview.count} {threePTPreview.count === 1 ? 'period' : 'periods'} found
              </Text>
              {threePTPreview.span ? (
                <Text style={styles.infoSub}>{threePTPreview.span.startISO} → {threePTPreview.span.endISO}</Text>
              ) : null}
              {threePTPreview.count === 0 ? (
                <Text style={styles.optionBody}>
                  This doesn’t look like a 3PT export file yet. Try a JSON or CSV you exported from this app.
                </Text>
              ) : null}
            </View>
          </>
        ) : null}

        {source !== 'threept' && inspection ? (
          <>
            <Text style={styles.sectionLabel}>What we found</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoTitle}>
                    {inspection.source === 'appleHealth'
                      ? 'Apple Health export'
                      : inspection.source === 'clue'
                        ? 'Clue export'
                        : inspection.source === 'flo'
                          ? 'Flo export'
                          : 'Unknown export'}
                  </Text>
                  {inspection.stats.span ? (
                    <Text style={styles.infoSub}>{inspection.stats.span.startISO} → {inspection.stats.span.endISO}</Text>
                  ) : (
                    <Text style={styles.infoSub}>No date span available.</Text>
                  )}
                </View>
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>{inspection.stats.periodsFound} periods</Text>
                </View>
              </View>

              {inspection.issues.length > 0 ? (
                <View style={styles.issuesList}>
                  {inspection.issues.map((it) => (
                    <View key={it} style={styles.issueRow}>
                      <Text style={styles.issueBullet}>•</Text>
                      <Text style={styles.issueText}>{it}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            <Text style={styles.sectionLabel}>Choose what to import</Text>
            <View style={styles.infoCard}>
              {inspection.categories.map((cat, idx) => (
                <View key={cat.id}>
                  <ChecklistRow
                    label={cat.label}
                    count={cat.count}
                    value={!!selection[cat.id]}
                    onChange={(next) => toggleCategory(cat.id, next)}
                    disabled={cat.count === 0}
                  />

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={expanded[cat.id] ? `Hide preview for ${cat.label}` : `Show preview for ${cat.label}`}
                    onPress={() => setExpanded((e) => ({ ...e, [cat.id]: !e[cat.id] }))}
                    style={({ pressed }) => [{ paddingVertical: 6 }, pressed && { opacity: 0.85 }]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name={expanded[cat.id] ? 'chevron-up' : 'chevron-down'} size={16} color={colors.text} />
                      <Text style={styles.optionBody}>
                        {expanded[cat.id] ? 'Hide preview' : 'Show preview'}
                      </Text>
                    </View>
                  </Pressable>

                  {expanded[cat.id] ? <PreviewList items={cat.preview} /> : null}
                  {idx < inspection.categories.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Import selected data"
              onPress={doImport}
              disabled={!canImport || importing}
              style={({ pressed }) => [
                styles.darkButton,
                (!canImport || importing) && styles.primaryButtonDisabled,
                pressed && canImport && !importing && { opacity: 0.9 },
              ]}
            >
              <Ionicons name="download-outline" size={18} color={colors.surface} />
              <Text style={styles.darkButtonLabel}>{importing ? 'Importing…' : 'Import'}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open history"
              onPress={() => router.push('/history' as any)}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: phaseFill.backgroundColor ?? 'rgba(17,17,17,0.06)' },
                pressed && { opacity: 0.92 },
              ]}
            >
              <Ionicons name="time-outline" size={18} color={colors.text} />
              <Text style={styles.secondaryLabel}>History</Text>
            </Pressable>
          </>
        ) : null}

        {source === 'threept' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Import from 3PT export"
            onPress={doImport}
            disabled={!canImport || importing}
            style={({ pressed }) => [
              styles.darkButton,
              (!canImport || importing) && styles.primaryButtonDisabled,
              pressed && canImport && !importing && { opacity: 0.9 },
            ]}
          >
            <Ionicons name="download-outline" size={18} color={colors.surface} />
            <Text style={styles.darkButtonLabel}>{importing ? 'Importing…' : 'Import'}</Text>
          </Pressable>
        ) : null}

        {fileUri && source !== 'threept' && !inspection ? (
          <Text style={styles.errorNote}>Selected file couldn’t be inspected yet. Try a different export.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

