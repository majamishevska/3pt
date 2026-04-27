import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppSettings } from '../hooks/useAppSettings';
import { ProfileAvatar } from './profile/ProfileAvatar';
import { customizationColors } from '../utils/profileCustomization';
import { colors } from '../utils/theme';
import { styles } from './ScreenHeader.styles';

type Props = {
  title: string;
  showBack?: boolean;
  showSettingsButton?: boolean;
  onBackPress?: () => void;
};

export function ScreenHeader({ title, showBack = false, showSettingsButton = true, onBackPress }: Props) {
  const { settings } = useAppSettings();

  const openSettings = () => {
    router.push('/settings' as any);
  };

  const openProfile = () => {
    router.push('/settings' as any);
  };

  return (
    <View style={styles.bar}>
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => (onBackPress ? onBackPress() : router.back())}
          style={styles.backHit}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
      ) : null}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={openProfile}
          style={styles.avatarOuter}
          hitSlop={6}
        >
          {settings?.profileImageUri ? (
            <Image source={{ uri: settings.profileImageUri }} style={styles.avatarImage} />
          ) : (
            <ProfileAvatar
              size={38}
              customization={
                settings?.profileCustomization ?? { base: 'bunny', colorHex: customizationColors[0], mouthChar: 'p', nose: 'none' }
              }
            />
          )}
        </Pressable>
        {showSettingsButton ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Settings"
            onPress={openSettings}
            style={styles.settingsHit}
            hitSlop={6}
          >
            <Ionicons name="settings-outline" size={22} color={colors.text} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
