import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { loadSettings, type AppSettings } from '../utils/settingsStorage';

export function useAppSettings(): { settings: AppSettings | null; refresh: () => Promise<void> } {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const refresh = useCallback(async () => {
    setSettings(await loadSettings());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return { settings, refresh };
}
