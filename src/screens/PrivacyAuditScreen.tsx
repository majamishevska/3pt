import { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import type { CyclePhaseId } from '../utils/phaseConfig';
import { useCyclePhaseId } from '../hooks/useCyclePhaseAccent';
import { phaseScreenBg } from '../utils/phaseChrome.styles';
import { compareISO, toDateISO } from '../utils/dates';
import { filterEntriesByDateRange, formatExport } from '../utils/exportEntries';
import { loadEntries } from '../utils/storage';
import { colors, spacing } from '../utils/theme';
import { friendlyDocumentsHint, writeExportToDocuments } from '../utils/writeExportFile';
import { documentDirectory } from 'expo-file-system/legacy';
import { formatISOForInput, parseUserDateToISO, validateStartEnd } from '../utils/dateRangeInputs';
import { deleteAllLocalData } from '../utils/deleteAllData';
import { styles } from './PrivacyAuditScreen.styles';
import { loadSettings } from '../utils/settingsStorage';
import { generatePeriodCalendarPdf } from '../pdf/generatePdf';
import { useAppSettings } from '../hooks/useAppSettings';

function pathForDisplay(uri: string): string {
  try {
    return decodeURIComponent(uri.replace(/^file:\/\//, ''));
  } catch {
    return uri;
  }
}

export default function PrivacyAuditScreen() {
  const phaseId = useCyclePhaseId() as CyclePhaseId;
  const appName = Constants.expoConfig?.name ?? 'this app';
  const { settings } = useAppSettings();
  const avatarHex = settings?.profileCustomization?.colorHex ?? colors.green;
  const avatarFill = { backgroundColor: avatarHex };

  const [startText, setStartText] = useState(() => toDateISO(new Date()));
  const [endText, setEndText] = useState(() => toDateISO(new Date()));
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [lastExport, setLastExport] = useState<{ fileName: string; fileUri: string; folderUri: string } | null>(
    null,
  );
  const documentsHint = useMemo(() => friendlyDocumentsHint(appName), [appName]);
  const [allTimeMinMax, setAllTimeMinMax] = useState<{ min: string; max: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const syncFromStorage = useCallback(async () => {
    const list = await loadEntries();
    if (list.length === 0) {
      const t = toDateISO(new Date());
      setStartText(formatISOForInput(t));
      setEndText(formatISOForInput(t));
      setAllTimeMinMax(null);
    } else {
      const sorted = [...list].sort((a, b) => compareISO(a.periodStartDate, b.periodStartDate));
      const min = sorted[0].periodStartDate;
      const max = sorted[sorted.length - 1].periodStartDate;
      setAllTimeMinMax({ min, max });
      setStartText(formatISOForInput(min));
      setEndText(formatISOForInput(max));
    }
    if (documentDirectory) {
      // Exports go to Documents/exports; we keep the folderUri on `lastExport`.
    } else {
      // No document directory exposed on this platform.
    }
    setExportError(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void syncFromStorage();
    }, [syncFromStorage]),
  );

  const syncAndValidate = useCallback(
    (nextStartText: string, nextEndText: string) => {
      const s = parseUserDateToISO(nextStartText);
      const e = parseUserDateToISO(nextEndText);
      if (s.error) return { ok: false as const, error: s.error };
      if (e.error) return { ok: false as const, error: e.error };
      const rangeErr = validateStartEnd(s.iso, e.iso);
      if (rangeErr) return { ok: false as const, error: rangeErr };
      return { ok: true as const, startISO: s.iso!, endISO: e.iso! };
    },
    [],
  );

  const applyTextRange = useCallback(
    (nextStartText: string, nextEndText: string) => {
      setStartText(nextStartText);
      setEndText(nextEndText);
      const v = syncAndValidate(nextStartText, nextEndText);
      if (!v.ok) {
        setExportError(v.error);
        return;
      }
      setExportError(null);
    },
    [syncAndValidate],
  );

  const applyAllTime = useCallback(() => {
    if (!allTimeMinMax) {
      setExportError('No saved entries yet');
      return;
    }
    const { min, max } = allTimeMinMax;
    setExportError(null);
    setStartText(formatISOForInput(min));
    setEndText(formatISOForInput(max));
  }, [allTimeMinMax]);

  const onExport = async () => {
    const v = syncAndValidate(startText, endText);
    if (!v.ok) {
      setExportError(v.error);
      Alert.alert('Dates', v.error);
      return;
    }
    setExportError(null);

    const entries = await loadEntries();
    try {
      if (exportFormat === 'pdf') {
        const settings = await loadSettings();
        const { fileUri, fileName, folderUri } = await generatePeriodCalendarPdf({ settings, entries });
        setLastExport({ fileName, fileUri, folderUri });
        const available = await Sharing.isAvailableAsync();
        if (available) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Export saved', `We saved ${fileName}. Use the buttons below to copy the folder path.${documentsHint}`);
        }
        return;
      }

      const filtered = filterEntriesByDateRange(entries, v.startISO, v.endISO);
      const payload = formatExport(filtered, exportFormat);
      const ext = exportFormat === 'csv' ? 'csv' : 'json';
      const { fileUri, fileName, folderUri } = await writeExportToDocuments(payload, ext);
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

        <Text style={styles.section}>Import your data</Text>
        <View style={styles.card}>
          <Text style={styles.desc}>Bring in period history from other apps, or from a previous 3PT export.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Import"
            onPress={() => router.push('/import' as any)}
            style={({ pressed }) => [
              styles.exportButton,
              // Match Delete section spacing (tighter than default export button).
              { marginTop: spacing.md },
              // Phase-based fill intentionally disabled for now:
              // phaseFill,
              avatarFill,
              pressed && styles.exportButtonPressed,
            ]}
          >
            <Ionicons name="download-outline" size={18} color={colors.text} />
            <Text style={styles.exportLabel}>Import</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Export your data</Text>
        <View style={styles.exportCard}>
          <Text style={styles.fieldLabelFirst}>Start date</Text>
          <TextInput
            value={startText}
            onChangeText={(t) => applyTextRange(t, endText)}
            placeholder="YYYY-MM-DD or MM/DD/YYYY"
            placeholderTextColor="rgba(17, 17, 17, 0.45)"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            inputMode="numeric"
          />
          <Text style={styles.fieldLabel}>End date</Text>
          <TextInput
            value={endText}
            onChangeText={(t) => applyTextRange(startText, t)}
            placeholder="YYYY-MM-DD or MM/DD/YYYY"
            placeholderTextColor="rgba(17, 17, 17, 0.45)"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            inputMode="numeric"
          />
          {exportError ? <Text style={styles.error}>{exportError}</Text> : null}

          <View style={styles.presetsGrid}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="All time"
              onPress={() => void applyAllTime()}
              style={({ pressed }) => [
                styles.presetChip,
                // Phase-based fill intentionally disabled for now:
                // phaseFill,
                avatarFill,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.presetChipText}>All time</Text>
            </Pressable>
          </View>

          <Text style={styles.inlineFieldLabel}>Format</Text>
          <View style={styles.formatRow}>
            {(['json', 'csv', 'pdf'] as const).map((fmt) => (
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

          {exportFormat === 'pdf' ? <Text style={styles.technical}>Created locally on this device.</Text> : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Export data"
            onPress={() => void onExport()}
            disabled={!!exportError}
            style={({ pressed }) => [
              styles.exportButton,
              // Phase-based fill intentionally disabled for now:
              // phaseFill,
              avatarFill,
              pressed && styles.exportButtonPressed,
              exportError && { opacity: 0.45 },
            ]}
          >
            <Ionicons name="share-outline" size={18} color={colors.text} />
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

        <Text style={styles.section}>Delete all data</Text>
        <View style={styles.dangerCard}>
          <Text style={styles.desc}>
            This removes period entries and import history stored on this device. Your profile settings stay.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Delete all data"
            onPress={() => setDeleteOpen(true)}
            style={({ pressed }) => [styles.dangerButton, pressed && { opacity: 0.92 }]}
          >
            <Ionicons name="trash-outline" size={18} color={colors.surface} />
            <Text style={styles.dangerButtonLabel}>Delete all data</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={deleteOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deleting) setDeleteOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete all data?</Text>
            <Text style={styles.modalBody}>
              This will remove period entries and import history from this device. Export files you already saved won’t be
              removed.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel delete"
                onPress={() => setDeleteOpen(false)}
                disabled={deleting}
                style={({ pressed }) => [styles.modalButton, pressed && !deleting && { opacity: 0.9 }, deleting && { opacity: 0.6 }]}
              >
                <Text style={styles.modalButtonLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Confirm delete all data"
                onPress={() => {
                  void (async () => {
                    setDeleting(true);
                    try {
                      await deleteAllLocalData({ includeSettings: false });
                      await syncFromStorage();
                      setDeleteOpen(false);
                      Alert.alert('Deleted', 'Local period data and import history were removed.');
                    } catch (e) {
                      Alert.alert('Delete', e instanceof Error ? e.message : 'Could not delete local data.');
                    } finally {
                      setDeleting(false);
                    }
                  })();
                }}
                disabled={deleting}
                style={({ pressed }) => [
                  styles.modalButtonPrimary,
                  pressed && !deleting && { opacity: 0.92 },
                  deleting && { opacity: 0.6 },
                ]}
              >
                <Text style={styles.modalButtonLabelPrimary}>{deleting ? 'Deleting…' : 'Delete'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
