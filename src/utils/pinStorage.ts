import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = '@3pt_pin_v1';
export const DEFAULT_PIN = '1952';

function normalizePin(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!/^\d{4}$/.test(t)) return null;
  return t;
}

export async function getStoredPin(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(PIN_KEY);
    const normalized = normalizePin(raw);
    if (normalized) return normalized;
  } catch {
    // fall through
  }
  // Ensure a stable default exists so enforcement is consistent.
  try {
    await AsyncStorage.setItem(PIN_KEY, DEFAULT_PIN);
  } catch {
    // ignore
  }
  return DEFAULT_PIN;
}

export async function setStoredPin(pin: string): Promise<void> {
  const normalized = normalizePin(pin);
  if (!normalized) throw new Error('PIN must be exactly 4 digits.');
  await AsyncStorage.setItem(PIN_KEY, normalized);
}

