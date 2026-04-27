import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../components/ScreenHeader';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { useAppSettings } from '../hooks/useAppSettings';
import { loadSettings, saveSettings, type ProfileCustomization } from '../utils/settingsStorage';
import {
  customizationBases,
  customizationColors,
  normalizeMouthChar,
  type CustomizationNose,
  type CustomizationBase,
  type CustomizationColor,
} from '../utils/profileCustomization';
import { colors } from '../utils/theme';
import { styles } from './CustomizationScreen.styles';

const PREVIEW_SIZE = 200;

function buildNext(prev: ProfileCustomization, patch: Partial<ProfileCustomization>): ProfileCustomization {
  return { ...prev, ...patch };
}

export default function CustomizationScreen() {
  const { settings, refresh } = useAppSettings();

  const [draft, setDraft] = useState<ProfileCustomization | null>(null);

  const hydrate = useCallback(async () => {
    const s = await loadSettings();
    setDraft(s.profileCustomization);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void hydrate();
    }, [hydrate]),
  );

  const current = useMemo<ProfileCustomization>(() => {
    return (
      draft ??
      settings?.profileCustomization ?? {
        base: 'bunny',
        colorHex: customizationColors[0],
        mouthChar: 'p',
        nose: 'none',
      }
    );
  }, [draft, settings?.profileCustomization]);

  const persist = useCallback(
    async (next: ProfileCustomization) => {
      setDraft(next);
      const base = await loadSettings();
      await saveSettings({ ...base, profileCustomization: next, profileEmoji: null });
      await refresh();
    },
    [refresh],
  );

  const onPickBase = (b: CustomizationBase) => {
    void persist(buildNext(current, { base: b }));
  };

  const onPickColor = (c: CustomizationColor) => {
    void persist(buildNext(current, { colorHex: c }));
  };

  const onChangeMouth = (raw: string) => {
    const normalized = normalizeMouthChar(raw);
    void persist(buildNext(current, { mouthChar: normalized || raw.slice(0, 1) }));
  };

  const onPickNose = (nose: CustomizationNose) => {
    void persist(buildNext(current, { nose }));
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScreenHeader title="Customization" showBack onBackPress={() => router.back()} showSettingsButton={false} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.previewRow}>
            <View style={styles.previewMain}>
              <ProfileAvatar size={PREVIEW_SIZE} customization={current} />
            </View>
            <View style={styles.sideControls}>
              <View>
                <View style={styles.sideField}>
                  <Text style={styles.mouthFieldLabel}>Mouth</Text>
                  <TextInput
                    value={current.mouthChar}
                    onChangeText={onChangeMouth}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    keyboardType="default"
                    maxLength={1}
                    placeholder="3  x  )"
                    placeholderTextColor="rgba(17, 17, 17, 0.22)"
                    style={styles.mouthInput}
                    selectionColor={colors.text}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.noseControls}>
            {([
              { id: 'circle', label: 'Circle nose', src: require('../../assets/customization/nose/circle-nose.png') },
              { id: 'triangle', label: 'Triangle nose', src: require('../../assets/customization/nose/triangle-nose.png') },
              { id: 'none', label: 'No nose' },
            ] as const).map((opt) => {
              const selected = current.nose === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={opt.label}
                  onPress={() => onPickNose(opt.id)}
                  style={({ pressed }) => [
                    styles.noseBtn,
                    selected && styles.noseBtnSelected,
                    pressed && { opacity: 0.92 },
                  ]}
                >
                  {opt.id === 'none' ? (
                    <Ionicons name="ban" size={32} color="rgba(17, 17, 17, 0.32)" accessibilityLabel="No nose" />
                  ) : (
                    <View style={styles.noseIconWrap}>
                      <Image source={opt.src as any} style={styles.noseIcon} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.optionGrid}>
            {customizationBases.map((b) => {
              const selected = current.base === b;
              return (
                <Pressable
                  key={b}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose ${b}`}
                  onPress={() => onPickBase(b)}
                  style={({ pressed }) => [
                    styles.baseTile,
                    selected && styles.baseTileSelected,
                    pressed && { opacity: 0.92 },
                  ]}
                >
                  <View style={styles.baseTileInner}>
                    <ProfileAvatar size={118} customization={{ ...current, base: b }} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.swatchRow}>
            {customizationColors.map((c) => {
              const selected = current.colorHex === c;
              return (
                <Pressable
                  key={c}
                  accessibilityRole="button"
                  accessibilityLabel={`Choose color ${c}`}
                  onPress={() => onPickColor(c)}
                  style={({ pressed }) => [
                    styles.swatch,
                    { backgroundColor: c },
                    selected && styles.swatchSelected,
                    pressed && { opacity: 0.9 },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

