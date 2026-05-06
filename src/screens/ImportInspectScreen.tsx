import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { SvgXml } from 'react-native-svg';
import { ScreenHeader } from '../components/ScreenHeader';
import { FilePickerCard } from '../components/FilePickerCard';
import { inspectImportWithSource, importWithSource } from '../import';
import type { DetectedSource, ImportCategoryId, ImportInspection, ImportSelection } from '../import/types';
import { addEntriesBulk } from '../utils/storage';
import { addImportSession } from '../utils/importStorage';
import { useCyclePhaseId } from '../hooks/useCyclePhaseAccent';
import type { CyclePhaseId } from '../utils/phaseConfig';
import { phaseAccentFill } from '../utils/phaseChrome.styles';
import type { CycleEntry } from '../utils/types';
import { compareISO } from '../utils/dates';
import { colors } from '../utils/theme';
import { useAvatarBackgroundStyle } from '../hooks/useAvatarBackgroundStyle';
import { loadSvgXmlFromModule, tintSvgMonochrome } from '../utils/svgAsset';
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

const IMPORT_OPTIONS: Record<ImportSourceChoice, number> = {
  flo: require('../../assets/import-options/flo-logo.svg'),
  clue: require('../../assets/import-options/clue-logo.svg'),
  appleHealth: require('../../assets/import-options/apple-health-logo.svg'),
  threept: require('../../assets/import-options/3pt-logo.svg'),
};

function useExportOptionLogosXml(): Partial<Record<ImportSourceChoice, string>> {
  const [xmlById, setXmlById] = useState<Partial<Record<ImportSourceChoice, string>>>({});

  useMemo(() => {
    void (async () => {
      const entries = (Object.keys(IMPORT_OPTIONS) as ImportSourceChoice[]).map(async (k) => {
        const xml = await loadSvgXmlFromModule(IMPORT_OPTIONS[k]);
        return [k, tintSvgMonochrome(xml, '#202020')] as const;
      });
      const resolved = await Promise.all(entries);
      setXmlById(Object.fromEntries(resolved) as Partial<Record<ImportSourceChoice, string>>);
    })();
  }, []);

  return xmlById;
}

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
  const bg = useAvatarBackgroundStyle();
  void phaseAccentFill[phaseId];

  const [source, setSource] = useState<ImportSourceChoice | null>(null);
  const logoXmlById = useExportOptionLogosXml();
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [raw, setRaw] = useState<string | null>(null);

  const [inspection, setInspection] = useState<ImportInspection | null>(null);
  const [, setSelection] = useState<ImportSelection>(() => defaultSelectionFromInspection(null));
  const [threePTPreview, setThreePTPreview] = useState<{ count: number; span?: { startISO: string; endISO: string } } | null>(
    null,
  );
  const [importing, setImporting] = useState(false);

  const canImport = useMemo(() => {
    if (!source) return false;
    if (source === 'threept') {
      return !!raw && (threePTPreview?.count ?? 0) > 0;
    }
    if (!inspection) return false;
    const hasPeriods = inspection.stats.periodsFound > 0;
    return hasPeriods && !!raw;
  }, [inspection, raw, source, threePTPreview?.count]);

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

        if (!inspection || inspection.stats.periodsFound <= 0) {
          Alert.alert('Nothing to import', 'No period dates were found in that file.');
          return;
        }

        const forced = source === 'appleHealth' ? 'appleHealth' : source;
        // For now we only import period dates (no per-category controls).
        const forcedSelection: ImportSelection = { periods: true, symptoms: false, notes: false, unknown: false };
        setSelection(forcedSelection);
        const result = importWithSource(raw, fileName, forced as Exclude<DetectedSource, 'unknown'>, forcedSelection);

        const bulk = await addEntriesBulk(result.entries);
        const finalCounts = { parsed: result.counts.parsed, imported: bulk.imported, skippedDuplicates: bulk.skippedDuplicates };

        await addImportSession({
          id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
          source: result.source,
          importedAt: new Date().toISOString(),
          fileName: result.fileName,
          categoriesImported: (Object.keys(forcedSelection) as ImportCategoryId[]).filter((k) => !!forcedSelection[k]),
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
  }, [fileName, inspection, raw, source]);

  return (
    <SafeAreaView style={[styles.root, bg]} edges={['top']}>
      <ScreenHeader title="Import" showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

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
                {logoXmlById[opt.id] ? (
                  <SvgXml xml={logoXmlById[opt.id] as string} width={28} height={28} style={styles.optionLogo} />
                ) : (
                  <Ionicons name="ellipse-outline" size={20} color={colors.text} />
                )}
              </Pressable>
            );
          })}
        </View>

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
            <Text style={styles.sectionLabel}>Preview</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                {inspection.stats.periodsFound} {inspection.stats.periodsFound === 1 ? 'period' : 'periods'} found
              </Text>
              {inspection.stats.span ? (
                <Text style={styles.infoSub}>{inspection.stats.span.startISO} → {inspection.stats.span.endISO}</Text>
              ) : null}
              {inspection.stats.periodsFound === 0 ? (
                <Text style={styles.optionBody}>No period dates were detected in this file.</Text>
              ) : null}
            </View>
          </>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Import"
          onPress={doImport}
          disabled={!canImport || importing}
          style={({ pressed }) => [
            styles.darkButton,
            (!canImport || importing) && styles.darkButtonDisabled,
            (!canImport || importing) && styles.primaryButtonDisabled,
            pressed && canImport && !importing && { opacity: 0.9 },
          ]}
        >
          <Ionicons name="download-outline" size={18} color={colors.surface} />
          <Text style={styles.darkButtonLabel}>{importing ? 'Importing…' : 'Import'}</Text>
        </Pressable>

        {fileUri && source !== 'threept' && !inspection ? (
          <Text style={styles.errorNote}>Selected file couldn’t be inspected yet. Try a different export.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

