import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BottomBar } from '../../src/components/BottomBar';
import { styles } from './_layout.styles';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size ?? 24} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" color={color} size={size ?? 24} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          href: null,
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          title: 'Privacy',
          tabBarIcon: ({ color, size }) =>
            <Ionicons name="shield-checkmark-outline" color={color} size={size ?? 24} />,
        }}
      />
    </Tabs>
  );
}

