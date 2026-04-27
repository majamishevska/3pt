import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="customization" />
        <Stack.Screen name="edit/[id]" />
        <Stack.Screen name="import" />
        <Stack.Screen name="pin" />
      </Stack>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

