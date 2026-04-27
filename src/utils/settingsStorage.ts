import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@period_tracker_settings_v2';
const LEGACY_SETTINGS_KEY = '@period_tracker_settings_v1';

export type AppSettings = {
  showPregnancyInfo: boolean;
  displayName: string;
  /** Kept for backward compatibility; not shown in UI. */
  pronouns: string;
  /** Local file URI when user picks a photo; null = bunny placeholder. */
  profileImageUri: string | null;
  /** Legacy fallback (emoji). Kept for backward compatibility; not shown in UI. */
  profileEmoji: string | null;
  /** When no photo, shown in header if set. */
  profileCustomization: ProfileCustomization | null;
  /** Typical full cycle length in days (e.g. 28). */
  averageCycleLengthDays: number;
  /** Typical bleeding length in days. */
  averagePeriodLengthDays: number;
  notificationsEnabled: boolean;
  /** Days before expected period to remind (when notifications are on). */
  reminderDaysBeforePeriod: number;
};

export type ProfileCustomizationBase = 'bear' | 'cat' | 'dog' | 'bunny';

export type ProfileCustomization = {
  base: ProfileCustomizationBase;
  colorHex: string;
  mouthChar: string;
  nose: 'none' | 'circle' | 'triangle';
};

const CUSTOMIZATION_COLORS = ['#bedd3c', '#4ca4f0', '#e9b41f', '#fa97ca', '#ea5035'] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  showPregnancyInfo: false,
  displayName: '',
  pronouns: '',
  profileImageUri: null,
  profileEmoji: null,
  profileCustomization: {
    base: 'bunny',
    colorHex: CUSTOMIZATION_COLORS[0],
    mouthChar: 'p',
    nose: 'none',
  },
  averageCycleLengthDays: 28,
  averagePeriodLengthDays: 5,
  notificationsEnabled: false,
  reminderDaysBeforePeriod: 1,
};

function clampInt(n: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function normalizeSettings(parsed: Partial<AppSettings> | null): AppSettings {
  if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_SETTINGS };
  const rawCustomization = (parsed as any).profileCustomization as Partial<ProfileCustomization> | null | undefined;
  const normalizedCustomization: ProfileCustomization | null = (() => {
    if (rawCustomization === null || rawCustomization === undefined) return DEFAULT_SETTINGS.profileCustomization;
    if (!rawCustomization || typeof rawCustomization !== 'object') return DEFAULT_SETTINGS.profileCustomization;
    const base = rawCustomization.base;
    const colorHex = rawCustomization.colorHex;
    const mouthChar = rawCustomization.mouthChar;
    const showNose = (rawCustomization as any).showNose;
    const nose = (rawCustomization as any).nose;

    const baseOk = base === 'bear' || base === 'cat' || base === 'dog' || base === 'bunny';
    const colorOk = typeof colorHex === 'string' && (CUSTOMIZATION_COLORS as readonly string[]).includes(colorHex);
    const mouthOk = typeof mouthChar === 'string';
    const noseOk = nose === 'none' || nose === 'circle' || nose === 'triangle';
    const showNoseOk = typeof showNose === 'boolean';

    if (!baseOk || !colorOk || !mouthOk || !(noseOk || showNoseOk)) return DEFAULT_SETTINGS.profileCustomization;
    return {
      base,
      colorHex,
      mouthChar: mouthChar.slice(0, 1),
      nose: noseOk ? nose : showNose ? 'circle' : 'none',
    };
  })();
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
    profileCustomization: normalizedCustomization ?? DEFAULT_SETTINGS.profileCustomization,
    averageCycleLengthDays: clampInt(
      Number(parsed.averageCycleLengthDays),
      15,
      45,
      DEFAULT_SETTINGS.averageCycleLengthDays,
    ),
    averagePeriodLengthDays: clampInt(
      Number(parsed.averagePeriodLengthDays),
      1,
      14,
      DEFAULT_SETTINGS.averagePeriodLengthDays,
    ),
    notificationsEnabled:
      typeof parsed.notificationsEnabled === 'boolean'
        ? parsed.notificationsEnabled
        : DEFAULT_SETTINGS.notificationsEnabled,
    reminderDaysBeforePeriod: clampInt(
      Number(parsed.reminderDaysBeforePeriod),
      0,
      14,
      DEFAULT_SETTINGS.reminderDaysBeforePeriod,
    ),
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
