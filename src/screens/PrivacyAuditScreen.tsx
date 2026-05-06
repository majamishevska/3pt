import { useCallback, useMemo, useState, useEffect } from 'react';
import type React from 'react';
import { Alert, LayoutAnimation, Modal, Platform, Pressable, ScrollView, Text, TextInput, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAvatarBackgroundStyle } from '../hooks/useAvatarBackgroundStyle';
import { compareISO, toDateISO } from '../utils/dates';
import { filterEntriesByDateRange, formatExport } from '../utils/exportEntries';
import { loadEntries } from '../utils/storage';
import { colors, spacing } from '../utils/theme';
import { friendlyDocumentsHint, writeExportToDocuments } from '../utils/writeExportFile';
import { documentDirectory } from 'expo-file-system/legacy';
import { formatISOForInput, parseUserDateToISO, validateStartEnd } from '../utils/dateRangeInputs';
import { deleteAllLocalData } from '../utils/deleteAllData';
import { privacyStyles } from './PrivacyAuditScreen.styles';
import { loadSettings } from '../utils/settingsStorage';
import { generatePeriodCalendarPdf } from '../pdf/generatePdf';
import { useAppSettings } from '../hooks/useAppSettings';

const styles = privacyStyles as any;

function pathForDisplay(uri: string): string {
  try {
    return decodeURIComponent(uri.replace(/^file:\/\//, ''));
  } catch {
    return uri;
  }
}

export default function PrivacyAuditScreen() {
  const bg = useAvatarBackgroundStyle();
  const appName = Constants.expoConfig?.name ?? 'this app';
  const { settings } = useAppSettings();
  const avatarHex = settings?.profileCustomization?.colorHex ?? colors.green;
  const avatarFill = { backgroundColor: avatarHex };
  const [faqOpenId, setFaqOpenId] = useState<
    'predictions' | 'storage' | 'visibility' | 'export' | 'otherTrackers' | null
  >(null);

  const [startText, setStartText] = useState(() => toDateISO(new Date()));
  const [endText, setEndText] = useState(() => toDateISO(new Date()));
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
  const [lastExport, setLastExport] = useState<{ fileName: string; fileUri: string; folderUri: string } | null>(
    null,
  );
  const documentsHint = useMemo(() => friendlyDocumentsHint(appName), [appName]);
  const exportsFolderUri = documentDirectory ? `${documentDirectory}exports` : null;
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

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
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

  const openExportsFolder = async () => {
    if (!exportsFolderUri) {
      Alert.alert('Folder', 'This device does not expose a documents folder.');
      return;
    }
    try {
      const ok = await Linking.openURL(exportsFolderUri);
      if (!ok) {
        await copyPath(exportsFolderUri, 'Folder path');
      }
    } catch {
      await copyPath(exportsFolderUri, 'Folder path');
    }
  };

  return (
    <SafeAreaView style={[styles.root, bg]} edges={['top']}>
      <ScreenHeader title="Privacy" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.body}>
          Your data stays with you. 3pt stores your entries on this device, and nothing is shared unless you choose
          to export.
        </Text>

        <View style={styles.faqCard}>
          <Text style={styles.faqTitle}>Quick questions</Text>

          <FaqRow
            title="How are my predictions calculated?"
            open={faqOpenId === 'predictions'}
            onToggle={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setFaqOpenId((v) => (v === 'predictions' ? null : 'predictions'));
            }}
          >
            Your future period dates are estimated from the patterns in the entries you log. As you add more data,
            predictions can become more personalized over time.
          </FaqRow>

          <FaqRow
            title="Where is my data stored?"
            open={faqOpenId === 'storage'}
            onToggle={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setFaqOpenId((v) => (v === 'storage' ? null : 'storage'));
            }}
          >
            <View>
              <Text style={styles.faqA}>
                Your information stays on this device unless you choose to export it. You stay in control of when files
                leave the app.
              </Text>
              <View style={styles.copyRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open exports folder"
                  onPress={() => void openExportsFolder()}
                  style={({ pressed }) => [styles.copyPill, pressed && { opacity: 0.88 }]}
                >
                  <Ionicons name="folder-open-outline" size={16} color={colors.text} />
                  <Text style={styles.copyPillLabel}>Open exports folder</Text>
                </Pressable>
              </View>
            </View>
          </FaqRow>

          <FaqRow
            title="Who can see my data?"
            open={faqOpenId === 'visibility'}
            onToggle={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setFaqOpenId((v) => (v === 'visibility' ? null : 'visibility'));
            }}
          >
            No one else can see your information through this app. If you export or share a file, that choice is always up
            to you.
          </FaqRow>

          <FaqRow
            title="What happens when I export my data?"
            open={faqOpenId === 'export'}
            onToggle={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setFaqOpenId((v) => (v === 'export' ? null : 'export'));
            }}
          >
            Export creates a file you can save, print, or share whenever you choose. It’s your data, in a format you
            control.
          </FaqRow>

          <FaqRow
            title="Do all period trackers work like this?"
            open={faqOpenId === 'otherTrackers'}
            onToggle={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setFaqOpenId((v) => (v === 'otherTrackers' ? null : 'otherTrackers'));
            }}
            hideDivider
          >
            Not always. Different apps handle data in different ways. Some store information on your device, some use cloud
            servers, and some may share certain data with third-party services.
          </FaqRow>
        </View>

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
                Last export: <Text style={styles.bold}>{lastExport.fileName}</Text>.
              </Text>
              <View style={styles.copyRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Copy last export file path"
                  onPress={() => void copyPath(lastExport.fileUri, 'File path')}
                  style={({ pressed }) => [styles.copyPill, pressed && { opacity: 0.88 }]}
                >
                  <Ionicons name="copy-outline" size={16} color={colors.text} />
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

function FaqRow(props: {
  title: string;
  open: boolean;
  onToggle: () => void;
  hideDivider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.faqRow, props.hideDivider && styles.faqRowNoDivider]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: props.open }}
        accessibilityLabel={props.title}
        onPress={props.onToggle}
        style={({ pressed }) => [styles.faqRowPress, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.faqQ}>{props.title}</Text>
        <Ionicons name={props.open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textTertiary} />
      </Pressable>
      {props.open ? (
        <View style={styles.faqAWrap}>{typeof props.children === 'string' ? <Text style={styles.faqA}>{props.children}</Text> : props.children}</View>
      ) : null}
    </View>
  );
}
