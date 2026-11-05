import '@/services/web-alert';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { palette } from '@/constants/design';
import { AppProvider, useApp } from '@/context/app-context';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProvider>
  );
}

function RootNavigator() {
  const { hydrated, isAuthenticated } = useApp();

  if (!hydrated) {
    return <View style={styles.loader}><ActivityIndicator color={palette.tomato} /></View>;
  }

  return (
      <Stack screenOptions={{ headerShown: false, title: '밥 먹자!', animation: 'slide_from_right' }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="signup" />
        </Stack.Protected>
        <Stack.Screen name="settings/legal" />
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="meal-analysis" />
          <Stack.Screen name="manual-entry" />
          <Stack.Screen name="history" />
          <Stack.Screen name="ai-feedback" />
          <Stack.Screen name="recommendation-detail" />
          <Stack.Screen name="nearby" />
          <Stack.Screen name="shopping-list" />
          <Stack.Screen name="fridge" />
          <Stack.Screen name="community/new-post" />
          <Stack.Screen name="community/[id]" />
          <Stack.Screen name="settings/index" />
          <Stack.Screen name="settings/profile" />
          <Stack.Screen name="settings/notifications" />
          <Stack.Screen name="settings/budget" />
          <Stack.Screen name="settings/password" />
          <Stack.Screen name="settings/account" />
          <Stack.Screen name="settings/help" />
        </Stack.Protected>
      </Stack>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.background },
});
