import { Redirect, Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, IconName, TomatoIcon } from '@/components/ui';
import { palette } from '@/constants/design';
import { useApp } from '@/context/app-context';

const tabIcons: Record<string, IconName> = { records: 'camera', recommend: 'compass', stats: 'bar-chart-2', community: 'message-circle' };

export default function TabLayout() {
  const { hydrated, isAuthenticated } = useApp();
  const insets = useSafeAreaInsets();
  if (hydrated && !isAuthenticated) return <Redirect href="/" />;

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.tomato,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: [styles.tabBar, { bottom: Math.max(insets.bottom, 12) }],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, focused }) => route.name === 'home'
          ? <View style={[styles.homeWrap, focused && styles.iconWrapActive]}><TomatoIcon size={30} muted={!focused} /></View>
          : <View style={[styles.iconWrap, focused && styles.iconWrapActive]}><Icon name={tabIcons[route.name]} size={19} color={String(color)} /></View>,
      })}>
      <Tabs.Screen name="records" options={{ title: '식단' }} />
      <Tabs.Screen name="recommend" options={{ title: '추천' }} />
      <Tabs.Screen name="home" options={{ title: '홈' }} />
      <Tabs.Screen name="stats" options={{ title: '통계' }} />
      <Tabs.Screen name="community" options={{ title: '커뮤니티' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { position: 'absolute', left: 0, right: 0, marginHorizontal: 14, height: 72, paddingTop: 8, paddingBottom: 8, borderRadius: 24, backgroundColor: palette.surface, borderTopWidth: 0, elevation: 0, boxShadow: '0px 8px 28px rgba(70, 50, 40, 0.14)' },
  tabLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  iconWrap: { width: 44, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  homeWrap: { width: 44, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconWrapActive: { backgroundColor: palette.accentSoft },
});
