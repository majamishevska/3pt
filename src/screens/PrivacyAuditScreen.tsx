import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/ScreenHeader';
import { RangeCalendar } from '../components/RangeCalendar';
import type { CyclePhaseId } from '../utils/phaseConfig';
import { useCyclePhaseId } from '../hooks/useCyclePhaseAccent';
import { phaseAccentFill, phaseScreenBg } from '../utils/phaseChrome.styles';
import { compareISO, toDateISO } from '../utils/dates';
import {
  filterEntriesByDateRange,
  formatExport,
  type ExportFormat,
} from '../utils/exportEntries';
import { palette } from '../utils/palette';
import { PERIOD_DATA_PRIVACY_ITEMS, loadEntries } from '../utils/storage';
import { spacing } from '../utils/theme';
import { friendlyDocumentsHint, writeExportToDocuments } from '../utils/writeExportFile';
import { documentDirectory } from 'expo-file-system/legacy';
import { styles } from './PrivacyAuditScreen.styles';

function isISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function pathForDisplay(uri: string): string {
  try {
    return decodeURIComponent(uri.replace(/^file:\/\//, ''));
  } catch {
    return uri;
  }
}

export default function PrivacyAuditScreen() {
  const phaseId = useCyclePhaseId() as CyclePhaseId;
  const phaseFill = phaseAccentFill[phaseId];
  const appName = Constants.expoConfig?.name ?? 'this app';

  const [exportStart, setExportStart] = useState(() => toDateISO(new Date()));
  const [exportEnd, setExportEnd] = useState(() => toDateISO(new Date()));
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [exportFolderUri, setExportFolderUri] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<{ fileName: string; fileUri: string; folderUri: string } | null>(
    null,
  );
  const documentsHint = useMemo(() => friendlyDocumentsHint(appName), [appName]);
  const [exportRangeDirty, setExportRangeDirty] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const list = await loadEntries();
        if (list.length === 0) {
          const t = toDateISO(new Date());
          setExportStart(t);
          setExportEnd(t);
        } else {
          const sorted = [...list].sort((a, b) => compareISO(a.periodStartDate, b.periodStartDate));
          setExportStart(sorted[0].periodStartDate);
          setExportEnd(sorted[sorted.length - 1].periodStartDate);
        }
        if (documentDirectory) {
          setExportFolderUri(`${documentDirectory}exports`);
        } else {
          setExportFolderUri(null);
        }
      })();
    }, []),
  );

  const onExport = async () => {
    if (exportRangeDirty) {
      Alert.alert('Dates', 'Apply your date range on the calendar first.');
      return;
    }
    if (!isISODate(exportStart) || !isISODate(exportEnd)) {
      Alert.alert('Dates', 'Pick a start and end date, then tap Apply.');
      return;
    }
    const entries = await loadEntries();
    const filtered = filterEntriesByDateRange(entries, exportStart, exportEnd);
    const payload = formatExport(filtered, exportFormat);
    const ext = exportFormat === 'csv' ? 'csv' : 'json';
    try {
      const { fileUri, fileName, folderUri } = await writeExportToDocuments(payload, ext);
      setExportFolderUri(folderUri);
      setLastExport({ fileName, fileUri, folderUri });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export saved', `We saved ${fileName}. Use the buttons below to copy the folder path.${documentsHint}`);
      }
    } catch (e) {
      Alert.alert('Export', e instanceof Error ? e.message : 'Could not save the export.');
    }
  };

  const copyPath = async (uri: string, label: string) => {
    try {
      await Clipboard.setStringAsync(pathForDisplay(uri));
      Alert.alert('Copied', `${label} copied to the clipboard.`);
    } catch {
      Alert.alert('Copy', 'Could not copy to the clipboard.');
    }
  };

  return (
    <SafeAreaView style={[styles.root, phaseScreenBg[phaseId]]} edges={['top']}>
      <ScreenHeader title="Privacy" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.body}>
          {appName} keeps your cycle data on your phone. There is no account and no cloud backup in this build—only what
          you explicitly export leaves the app.
        </Text>

        <Text style={styles.section}>Where your data lives</Text>
        <View style={styles.card}>
          <Text style={styles.desc}>
            <Text style={styles.bold}>Period entries & notes</Text> are saved in secure on-device storage (like a small
            private database only this app can read). They are not stored as regular files in your Photos or Downloads
            folders.
          </Text>
          <Text style={[styles.desc, { marginTop: spacing.sm }]}>
            <Text style={styles.bold}>Settings</Text> (name, profile icon, preferences) are saved the same way, in a
            separate area of that storage.
          </Text>
          {exportFolderUri ? (
            <View style={styles.pathBox}>
              <Text style={styles.pathLabel}>Export files folder</Text>
              <Text style={styles.pathText} selectable>
                {pathForDisplay(exportFolderUri)}
              </Text>
              <View style={styles.copyRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Copy exports folder path"
                  onPress={() => void copyPath(exportFolderUri, 'Exports folder path')}
                  style={({ pressed }) => [styles.copyPill, pressed && { opacity: 0.88 }]}
                >
                  <Text style={styles.copyPillLabel}>Copy folder path</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          <Text style={[styles.technical, { marginTop: spacing.md }]}>
            {documentsHint} If you use Export, we also write a file under Documents → exports so you can share it via
            the system share sheet (Mail, Files, Drive, etc.).
          </Text>
        </View>

        <Text style={styles.section}>Export your data</Text>
        <View style={styles.exportCard}>
          <RangeCalendar
            title="Date range to export"
            committedStart={exportStart}
            committedEnd={exportEnd}
            onApply={(s, e) => {
              setExportStart(s);
              setExportEnd(e);
            }}
            selectionFillStyle={phaseFill}
            rangeMiddleStyle={[phaseFill, { opacity: 0.38 }]}
            onDirtyChange={setExportRangeDirty}
          />
          <Text style={styles.inlineFieldLabel}>Format</Text>
          <View style={styles.formatRow}>
            {(['json', 'csv'] as const).map((fmt) => (
              <Pressable
                key={fmt}
                accessibilityRole="button"
                accessibilityState={{ selected: exportFormat === fmt }}
                onPress={() => setExportFormat(fmt)}
                style={({ pressed }) => [
                  styles.formatChip,
                  exportFormat === fmt && styles.formatChipSelected,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.formatChipLabel}>{fmt.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Export data"
            onPress={() => void onExport()}
            disabled={exportRangeDirty}
            style={({ pressed }) => [
              styles.exportButton,
              phaseFill,
              pressed && styles.exportButtonPressed,
              exportRangeDirty && { opacity: 0.45 },
            ]}
          >
            <Ionicons name="share-outline" size={18} color={palette.black} />
            <Text style={styles.exportLabel}>Export</Text>
          </Pressable>
          {lastExport ? (
            <>
              <Text style={styles.lastExportNote}>
                Last export: <Text style={styles.bold}>{lastExport.fileName}</Text>. It is saved in the exports folder
                above; the share sheet also lets you send a copy elsewhere (for example the Files app).
              </Text>
              <View style={styles.copyRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Copy last export file path"
                  onPress={() => void copyPath(lastExport.fileUri, 'File path')}
                  style={({ pressed }) => [styles.copyPill, pressed && { opacity: 0.88 }]}
                >
                  <Text style={styles.copyPillLabel}>Copy file path</Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </View>

        <Text style={styles.section}>What we store</Text>
        <View style={styles.card}>
          {PERIOD_DATA_PRIVACY_ITEMS.map((item) => (
            <View key={item.title} style={styles.row}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.desc}>{item.body}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Export and storage behavior can evolve as the app grows.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
