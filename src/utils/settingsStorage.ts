import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@period_tracker_settings_v2';
const LEGACY_SETTINGS_KEY = '@period_tracker_settings_v1';

export type AppSettings = {
  showPregnancyInfo: boolean;
  displayName: string;
  pronouns: string;
  /** Local file URI when user picks a photo; null = bunny placeholder. */
  profileImageUri: string | null;
  /** When no photo, shown in header; null = default rabbit. */
  profileEmoji: string | null;
};

export const DEFAULT_SETTINGS: AppSettings = {
  showPregnancyInfo: false,
  displayName: '',
  pronouns: '',
  profileImageUri: null,
  profileEmoji: null,
};

function normalizeSettings(parsed: Partial<AppSettings> | null): AppSettings {
  if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETTINGS };
  return {
    showPregnancyInfo:
      typeof parsed.showPregnancyInfo === 'boolean' ? parsed.showPregnancyInfo : DEFAULT_SETTINGS.showPregnancyInfo,
    displayName: typeof parsed.displayName === 'string' ? parsed.displayName : DEFAULT_SETTINGS.displayName,
    pronouns: typeof parsed.pronouns === 'string' ? parsed.pronouns : DEFAULT_SETTINGS.pronouns,
    profileImageUri:
      parsed.profileImageUri === null || typeof parsed.profileImageUri === 'string'
        ? parsed.profileImageUri
        : DEFAULT_SETTINGS.profileImageUri,
    profileEmoji:
      parsed.profileEmoji === null || typeof parsed.profileEmoji === 'string'
        ? parsed.profileEmoji
        : DEFAULT_SETTINGS.profileEmoji,
  };
}

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return normalizeSettings(parsed);
    }
    const legacyRaw = await AsyncStorage.getItem(LEGACY_SETTINGS_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as Partial<AppSettings>;
      const merged = normalizeSettings({
        ...DEFAULT_SETTINGS,
        showPregnancyInfo:
          typeof legacy.showPregnancyInfo === 'boolean' ? legacy.showPregnancyInfo : DEFAULT_SETTINGS.showPregnancyInfo,
      });
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch {
    /* fall through */
  }
  return { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
