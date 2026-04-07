import { useCallback, useState } from 'react';
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
import { useAppSettings } from '../hooks/useAppSettings';
import type { CyclePhaseId } from '../utils/phaseConfig';
import { useCyclePhaseId } from '../hooks/useCyclePhaseAccent';
import { phaseAccentFill, phaseScreenBg } from '../utils/phaseChrome.styles';
import { palette } from '../utils/palette';
import { loadSettings, saveSettings } from '../utils/settingsStorage';
import { styles } from './SettingsScreen.styles';

export default function SettingsScreen() {
  const phaseId = useCyclePhaseId() as CyclePhaseId;
  const phaseFill = phaseAccentFill[phaseId];
  const { settings, refresh } = useAppSettings();

  const [displayName, setDisplayName] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [emojiModalOpen, setEmojiModalOpen] = useState(false);
  const [emojiDraft, setEmojiDraft] = useState('');

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const s = await loadSettings();
        setDisplayName(s.displayName);
        setPronouns(s.pronouns);
      })();
    }, []),
  );

  const persistProfileFields = async () => {
    const base = await loadSettings();
    await saveSettings({
      ...base,
      displayName: displayName.trim(),
      pronouns: pronouns.trim(),
    });
    await refresh();
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

  const applyAvatarEmoji = async (emoji: string | null) => {
    const base = await loadSettings();
    await saveSettings({ ...base, profileImageUri: null, profileEmoji: emoji });
    await refresh();
  };

  const openEmojiModal = () => {
    void (async () => {
      const s = await loadSettings();
      setEmojiDraft(s.profileEmoji?.trim() ?? '');
      setEmojiModalOpen(true);
    })();
  };

  const confirmEmojiChoice = async () => {
    const trimmed = emojiDraft.trim();
    await applyAvatarEmoji(trimmed.length > 0 ? trimmed : null);
    setEmojiModalOpen(false);
  };

  const onTogglePregnancy = async (value: boolean) => {
    const base = await loadSettings();
    await saveSettings({ ...base, showPregnancyInfo: value });
    await refresh();
  };

  const showPregnancy = settings?.showPregnancyInfo ?? false;
  const uri = settings?.profileImageUri;
  const avatarGlyph = uri ? null : settings?.profileEmoji?.trim() || '🐰';

  return (
    <SafeAreaView style={[styles.root, phaseScreenBg[phaseId]]} edges={['top']}>
      <ScreenHeader title="Settings" showBack showSettingsButton={false} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Profile</Text>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarLarge}>
              {uri ? (
                <Image source={{ uri }} style={styles.avatarLargeImage} />
              ) : (
                <Text style={styles.bunnyLarge}>{avatarGlyph}</Text>
              )}
            </View>
            <View style={styles.profileMeta}>
              <Text style={styles.profileHint}>Your profile icon appears in the app header.</Text>
            </View>
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose emoji avatar"
              onPress={openEmojiModal}
              style={({ pressed }) => [styles.pillButton, pressed && { opacity: 0.88 }]}
            >
              <Text style={styles.pillButtonLabel}>Choose emoji</Text>
            </Pressable>
          </View>

          <Text style={styles.labelFirst}>Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            onEndEditing={() => void persistProfileFields()}
            placeholder="How should we greet you?"
            placeholderTextColor="rgba(17, 17, 17, 0.45)"
            style={styles.input}
            autoCapitalize="words"
          />
          <Text style={styles.label}>Pronouns</Text>
          <TextInput
            value={pronouns}
            onChangeText={setPronouns}
            onEndEditing={() => void persistProfileFields()}
            placeholder="e.g. she/her"
            placeholderTextColor="rgba(17, 17, 17, 0.45)"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelBlock}>
              <Text style={styles.switchTitle}>Pregnancy insights</Text>
              <Text style={styles.switchSubtitle}>Turn off to hide pregnancy-related information in the app.</Text>
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
      </ScrollView>

      <Modal visible={emojiModalOpen} animationType="fade" transparent onRequestClose={() => setEmojiModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.emojiModalRoot}
        >
          <Pressable
            style={styles.emojiModalBackdrop}
            onPress={() => setEmojiModalOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
          <View style={styles.emojiModalCard}>
            <Text style={styles.emojiModalTitle}>Profile emoji</Text>
            <Text style={styles.emojiModalHint}>
              Open the emoji keyboard and enter any icon you like. Leave the field empty to clear your choice. Saving
              removes a profile photo if you had one.
            </Text>
            <TextInput
              value={emojiDraft}
              onChangeText={setEmojiDraft}
              placeholder="Tap here, then emoji key…"
              placeholderTextColor="rgba(17, 17, 17, 0.45)"
              style={styles.emojiModalInput}
              autoFocus
              multiline={false}
              maxLength={128}
            />
            <View style={styles.emojiModalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                onPress={() => setEmojiModalOpen(false)}
                style={({ pressed }) => [styles.emojiModalButton, styles.emojiModalButtonSecondary, pressed && { opacity: 0.88 }]}
              >
                <Text style={styles.emojiModalButtonLabel}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Save emoji"
                onPress={() => void confirmEmojiChoice()}
                style={({ pressed }) => [
                  styles.emojiModalButton,
                  styles.emojiModalButtonPrimary,
                  phaseFill,
                  pressed && { opacity: 0.88 },
                ]}
              >
                <Text style={styles.emojiModalButtonLabel}>Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
