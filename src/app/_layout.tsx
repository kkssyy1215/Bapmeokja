import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from '@/context/app-context';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="signup" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="meal-analysis" />
        <Stack.Screen name="manual-entry" />
        <Stack.Screen name="history" />
        <Stack.Screen name="ai-feedback" />
        <Stack.Screen name="recommendation-detail" />
        <Stack.Screen name="nearby" />
        <Stack.Screen name="fridge" />
        <Stack.Screen name="community/new-post" />
        <Stack.Screen name="community/[id]" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="settings/profile" />
        <Stack.Screen name="settings/notifications" />
      </Stack>
    </AppProvider>
  );
}
