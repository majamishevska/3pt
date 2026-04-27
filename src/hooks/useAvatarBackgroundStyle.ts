import { useMemo } from 'react';
import { useAppSettings } from './useAppSettings';
import { colors, tintedAppBackground } from '../utils/theme';

export function useAvatarBackgroundStyle(): { backgroundColor: string } {
  const { settings } = useAppSettings();

  return useMemo(() => {
    const hex = settings?.profileCustomization?.colorHex;
    return { backgroundColor: tintedAppBackground(hex ?? colors.green) };
  }, [settings?.profileCustomization?.colorHex]);
}

