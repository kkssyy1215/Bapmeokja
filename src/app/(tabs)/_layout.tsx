import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { palette } from '@/constants/design';
import { useApp } from '@/context/app-context';

const tabIcons: Record<string, string> = { records: '＋', stats: '◔', home: '🍅', community: '◌', recommend: '✦' };

export default function TabLayout() {
  const { hydrated, isAuthenticated } = useApp();
  if (hydrated && !isAuthenticated) return <Redirect href="/" />;

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.tomato,
        tabBarInactiveTintColor: '#908B82',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => <Text style={[styles.tabIcon, { color }, focused && styles.tabIconFocused]}>{tabIcons[route.name]}</Text>,
      })}>
      <Tabs.Screen name="records" options={{ title: '식단' }} />
      <Tabs.Screen name="stats" options={{ title: '통계' }} />
      <Tabs.Screen name="home" options={{ title: '홈' }} />
      <Tabs.Screen name="community" options={{ title: '커뮤니티' }} />
      <Tabs.Screen name="recommend" options={{ title: '추천' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { height: 82, paddingTop: 8, paddingBottom: 14, backgroundColor: '#FFFEFC', borderTopColor: '#EEE8DE' },
  tabLabel: { fontSize: 11, fontWeight: '700' },
  tabIcon: { fontSize: 22, fontWeight: '500', height: 27 },
  tabIconFocused: { transform: [{ scale: 1.08 }] },
});
