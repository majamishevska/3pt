import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenHeader } from '../components/ScreenHeader';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { useAppSettings } from '../hooks/useAppSettings';
import type { CyclePhaseId } from '../utils/phaseConfig';
import { useCyclePhaseId } from '../hooks/useCyclePhaseAccent';
import { phaseAccentFill, phaseScreenBg } from '../utils/phaseChrome.styles';
import { palette } from '../utils/palette';
import { loadSettings, saveSettings, type AppSettings } from '../utils/settingsStorage';
import { styles } from './SettingsScreen.styles';

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function parseDayField(raw: string, min: number, max: number, fallback: number): number {
  const t = raw.trim();
  if (!t) return fallback;
  const n = Number(t);
  if (!Number.isFinite(n)) return fallback;
  return clamp(n, min, max);
}

export default function SettingsScreen() {
  const phaseId = useCyclePhaseId() as CyclePhaseId;
  const phaseFill = phaseAccentFill[phaseId];
  const { settings, refresh } = useAppSettings();

  const [displayName, setDisplayName] = useState('');
  const [averageCycleText, setAverageCycleText] = useState('');
  const [averagePeriodText, setAveragePeriodText] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [reminderDaysText, setReminderDaysText] = useState('');

  const hydrate = useCallback(async () => {
    const s = await loadSettings();
    setDisplayName(s.displayName);
    setAverageCycleText(String(s.averageCycleLengthDays));
    setAveragePeriodText(String(s.averagePeriodLengthDays));
    setNotificationsEnabled(s.notificationsEnabled);
    setReminderDaysText(String(s.reminderDaysBeforePeriod));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void hydrate();
    }, [hydrate]),
  );

  const persist = async (patch: Partial<AppSettings>) => {
    const base = await loadSettings();
    await saveSettings({ ...base, ...patch });
    await refresh();
  };

  const persistDisplayName = async () => {
    await persist({ displayName: displayName.trim() });
  };

  const persistAverageCycle = async () => {
    const base = await loadSettings();
    const v = parseDayField(averageCycleText, 15, 45, base.averageCycleLengthDays);
    setAverageCycleText(String(v));
    await persist({ averageCycleLengthDays: v });
  };

  const persistAveragePeriod = async () => {
    const base = await loadSettings();
    const v = parseDayField(averagePeriodText, 1, 14, base.averagePeriodLengthDays);
    setAveragePeriodText(String(v));
    await persist({ averagePeriodLengthDays: v });
  };

  const onNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await persist({ notificationsEnabled: value });
  };

  const persistReminderDays = async () => {
    const base = await loadSettings();
    const v = parseDayField(reminderDaysText, 0, 14, base.reminderDaysBeforePeriod);
    setReminderDaysText(String(v));
    await persist({ reminderDaysBeforePeriod: v });
  };

  const onChangeProfilePicture = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos', 'Photo library access is needed to choose a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    const base = await loadSettings();
    await saveSettings({ ...base, profileImageUri: result.assets[0].uri, profileEmoji: null });
    await refresh();
  };

  const onTogglePregnancy = async (value: boolean) => {
    await persist({ showPregnancyInfo: value });
  };

  const showPregnancy = settings?.showPregnancyInfo ?? false;
  const uri = settings?.profileImageUri;
  const reminderDays = settings?.reminderDaysBeforePeriod ?? 1;
  const reminderPreview = useMemo(() => {
    const t = reminderDaysText.trim();
    const n = t === '' ? reminderDays : Number(t);
    const v = Number.isFinite(n) ? clamp(n, 0, 14) : reminderDays;
    return v;
  }, [reminderDays, reminderDaysText]);

  return (
    <SafeAreaView style={[styles.root, phaseScreenBg[phaseId]]} edges={['top']}>
      <ScreenHeader title="Settings" showBack showSettingsButton={false} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionOptional}>
          <Text style={styles.sectionOptionalTitle}>Profile</Text>
          <Text style={styles.sectionOptionalHint}>(optional)</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.labelFirst}>Avatar</Text>
          <View style={styles.profileRow}>
            <View style={styles.avatarLarge}>
              {uri ? (
                <Image source={{ uri }} style={styles.avatarLargeImage} />
              ) : (
                <ProfileAvatar
                  size={styles.avatarLarge.width as number}
                  customization={
                    settings?.profileCustomization ?? { base: 'bunny', colorHex: '#bedd3c', mouthChar: 't', showNose: false }
                  }
                />
              )}
            </View>
            <Text style={styles.profileHint}>Shown in the app header.</Text>
          </View>
          <View style={styles.rowButtons}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose profile photo"
              onPress={() => void onChangeProfilePicture()}
              style={({ pressed }) => [styles.pillButton, pressed && { opacity: 0.88 }]}
            >
              <Text style={styles.pillButtonLabel}>Choose photo</Text>
            </Pressable>
          </View>

          <View style={[styles.inputRow, styles.inputRowBorder]}>
            <Text style={styles.labelFirst}>Name</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              onEndEditing={() => void persistDisplayName()}
              placeholder="How should we greet you?"
              placeholderTextColor="rgba(17, 17, 17, 0.45)"
              style={styles.input}
              autoCapitalize="words"
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Text style={styles.labelFirst}>Average cycle length</Text>
            <Text style={styles.inputHelp}>Typical days from the start of one period to the next (15–45).</Text>
            <TextInput
              value={averageCycleText}
              onChangeText={setAverageCycleText}
              onEndEditing={() => void persistAverageCycle()}
              placeholder="28"
              placeholderTextColor="rgba(17, 17, 17, 0.45)"
              style={styles.input}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={2}
            />
          </View>
          <View style={[styles.inputRow, styles.inputRowBorder]}>
            <Text style={styles.label}>Average period length</Text>
            <Text style={styles.inputHelp}>Typical bleeding days (1–14).</Text>
            <TextInput
              value={averagePeriodText}
              onChangeText={setAveragePeriodText}
              onEndEditing={() => void persistAveragePeriod()}
              placeholder="5"
              placeholderTextColor="rgba(17, 17, 17, 0.45)"
              style={styles.input}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={2}
            />
          </View>
          <View style={[styles.switchRow, styles.inputRowBorder]}>
            <View style={styles.switchLabelBlock}>
              <Text style={styles.switchTitle}>Pregnancy insights</Text>
              <Text style={styles.switchSubtitle}>Show or hide pregnancy-related information in the app.</Text>
            </View>
            <Switch
              value={showPregnancy}
              onValueChange={(v) => void onTogglePregnancy(v)}
              trackColor={{ false: palette.blue, true: palette.pink }}
              thumbColor={palette.white}
              ios_backgroundColor={palette.blue}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelBlock}>
              <Text style={styles.switchTitle}>Enable notifications</Text>
              <Text style={styles.switchSubtitle}>Reminders stay on this device until you enable system permission.</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(v) => void onNotificationsToggle(v)}
              trackColor={{ false: palette.blue, true: palette.pink }}
              thumbColor={palette.white}
              ios_backgroundColor={palette.blue}
            />
          </View>
          <View style={[styles.inputRow, styles.inputRowBorder, !notificationsEnabled && styles.rowDisabled]}>
            <Text style={styles.label}>Reminder</Text>
            <Text style={styles.inputHelp}>
              {reminderPreview} {reminderPreview === 1 ? 'day' : 'days'} before your period (0–14).
            </Text>
            <TextInput
              value={reminderDaysText}
              onChangeText={setReminderDaysText}
              onEndEditing={() => void persistReminderDays()}
              placeholder="1"
              placeholderTextColor="rgba(17, 17, 17, 0.45)"
              style={styles.input}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={2}
              editable={notificationsEnabled}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
