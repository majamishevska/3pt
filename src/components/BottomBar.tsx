import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { CyclePhaseId } from '../utils/phaseConfig';
import { palette } from '../utils/palette';
import { phaseAccentFill, phaseScreenBg } from '../utils/phaseChrome.styles';
import { useCyclePhaseId } from '../hooks/useCyclePhaseAccent';
import { styles } from './BottomBar.styles';

type RouteName = 'index' | 'history' | 'privacy';

const ICONS: Record<RouteName, React.ComponentProps<typeof Ionicons>['name']> = {
  index: 'home-outline',
  history: 'calendar-outline',
  privacy: 'shield-checkmark-outline',
};

export function BottomBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const activeIndex = state.index;
  const phaseId = useCyclePhaseId() as CyclePhaseId;
  const phaseFill = phaseAccentFill[phaseId];

  return (
    <SafeAreaView style={[styles.safe, phaseScreenBg[phaseId]]} edges={['bottom']}>
      <View style={styles.wrap}>
        <View style={styles.row}>
          <View style={styles.pill}>
            {state.routes
              .filter((r) => r.name !== 'log')
              .map((route) => {
                const isFocused = state.routes[activeIndex]?.key === route.key;
                const onPress = () => {
                  const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
                };

                const name = route.name as RouteName;
                const icon = ICONS[name] ?? 'ellipse-outline';

                return (
                  <Pressable
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel={descriptors[route.key]?.options?.tabBarAccessibilityLabel}
                    onPress={onPress}
                    style={[styles.tabHit, isFocused && phaseFill]}
                    hitSlop={10}
                  >
                    <Ionicons name={icon} size={22} color={isFocused ? palette.black : palette.white} />
                  </Pressable>
                );
              })}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Log period"
            onPress={() => router.push('/log' as any)}
            style={({ pressed }) => [styles.plusOuter, pressed && phaseFill, pressed && { opacity: 0.95 }]}
            hitSlop={10}
          >
            <Ionicons name="add" size={26} color={palette.white} />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

