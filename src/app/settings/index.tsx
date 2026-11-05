import { Image } from 'expo-image';
import { Href, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Header, Icon, IconButton, ListGroup, ListRow, Pressable, Screen, SectionTitle, Switch } from '@/components/ui';
import { font, palette } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode } from '@/services/api';
import { userApi } from '@/services/bapmeokja-api';
import { syncLocalNotifications } from '@/services/device-notifications';
import { NotificationSettings } from '@/types';

const character = require('../../../assets/characters/tomato-balanced.png');

export default function SettingsScreen() {
  const { profile, notifications, updateNotifications, signOut } = useApp();
  const [savingNotification, setSavingNotification] = useState<keyof NotificationSettings | null>(null);

  const saveNotification = async (key: 'pushEnabled' | 'waterReminder', value: boolean) => {
    const previous = notifications[key];
    const next = { ...notifications, [key]: value };
    updateNotifications({ [key]: value });
    if (isMockMode) return;

    setSavingNotification(key);
    try {
      await userApi.updateNotifications({
        pushEnabled: next.pushEnabled,
        waterReminderEnabled: next.waterReminder,
        breakfastTime: next.breakfastTime,
        lunchTime: next.lunchTime,
        dinnerTime: next.dinnerTime,
        expiryAlertEnabled: next.expiryAlert,
      });
      const result = await syncLocalNotifications(next);
      if (result.status === 'denied') {
        const denied = { ...next, pushEnabled: false };
        updateNotifications({ pushEnabled: false });
        await userApi.updateNotifications({
          pushEnabled: false,
          waterReminderEnabled: denied.waterReminder,
          breakfastTime: denied.breakfastTime,
          lunchTime: denied.lunchTime,
          dinnerTime: denied.dinnerTime,
          expiryAlertEnabled: denied.expiryAlert,
        });
        Alert.alert('알림 권한이 필요해요', '기기 설정에서 밥 먹자! 알림을 허용한 뒤 다시 켜 주세요.');
      } else if (result.status === 'unsupported' && key === 'pushEnabled' && value) {
        Alert.alert('모바일 앱에서 적용돼요', '설정은 저장했습니다. 실제 알림 예약은 iOS 또는 Android 앱에서 적용됩니다.');
      }
    } catch (error) {
      updateNotifications({ [key]: previous });
      await syncLocalNotifications({ ...notifications, [key]: previous }).catch(() => undefined);
      Alert.alert('알림 설정을 바꾸지 못했어요', getErrorMessage(error));
    } finally {
      setSavingNotification(null);
    }
  };

  const logout = () => Alert.alert('로그아웃할까요?', '이 기기의 로그인 정보가 삭제됩니다.', [{ text: '취소', style: 'cancel' }, { text: '로그아웃', style: 'destructive', onPress: async () => { await signOut(); router.replace('/'); } }]);
  return <Screen><Header title="설정" left={<IconButton label="←" onPress={() => router.back()} />} />
    <ListGroup>
      <Pressable accessibilityRole="button" style={styles.profile} onPress={() => router.push('/settings/profile')}>
        <Image source={character} style={styles.avatar} contentFit="contain" accessibilityLabel="토마토 프로필" />
        <View style={styles.profileCopy}>
          <Text style={styles.nickname}>{profile.nickname}</Text>
          <Text style={styles.email} numberOfLines={1}>{profile.email}</Text>
          <Text style={styles.goal}>{profile.goal} 목표 · {profile.dailyCalories.toLocaleString()} kcal</Text>
        </View>
        <Icon name="chevron-right" size={18} color={palette.muted} />
      </Pressable>
    </ListGroup>
    <SectionTitle small title="나의 설정" />
    <ListGroup>
      <ListRow icon="user" title="내 정보 관리" subtitle="키, 몸무게, 목표 설정" onPress={() => router.push('/settings/profile')} />
      <ListRow icon="target" title="영양 목표" subtitle={`탄 ${profile.carbGoal}g · 단 ${profile.proteinGoal}g · 지 ${profile.fatGoal}g`} onPress={() => router.push('/settings/profile')} />
      <ListRow icon="credit-card" title="기본 예산" subtitle={`외식 ${(profile.defaultDiningBudget ?? 10000).toLocaleString()}원 · 집밥 ${(profile.defaultHomeBudget ?? 8000).toLocaleString()}원`} onPress={() => router.push('/settings/budget' as Href)} />
    </ListGroup>
    <SectionTitle small title="알림" />
    <ListGroup>
      <ListRow icon="bell" title="푸시 알림" subtitle="식사 시간과 주요 알림 전체 설정" right={<Switch value={notifications.pushEnabled} disabled={savingNotification !== null} onValueChange={(value) => saveNotification('pushEnabled', value)} />} />
      <ListRow icon="droplet" title="물 마시기 알림" subtitle="2시간마다 알려드려요" right={<Switch value={notifications.waterReminder} disabled={savingNotification !== null} onValueChange={(value) => saveNotification('waterReminder', value)} />} />
      <ListRow icon="clock" title="세부 알림 설정" subtitle="식사 시간과 유통기한" onPress={() => router.push('/settings/notifications')} />
    </ListGroup>
    <SectionTitle small title="계정 및 보안" />
    <ListGroup>
      <ListRow icon="lock" title="비밀번호 변경" subtitle="현재 비밀번호 확인 후 변경" onPress={() => router.push('/settings/password' as Href)} />
      <ListRow icon="user-x" tone="danger" title="회원 탈퇴" subtitle="계정과 저장한 데이터를 삭제" onPress={() => router.push('/settings/account' as Href)} />
    </ListGroup>
    <SectionTitle small title="앱 정보" />
    <ListGroup>
      <ListRow icon="help-circle" title="도움말" onPress={() => router.push('/settings/help' as Href)} />
      <ListRow icon="file-text" title="이용약관 및 개인정보 처리방침" onPress={() => router.push('/settings/legal' as Href)} />
      <ListRow icon="info" title="버전" right={<Text style={styles.version}>1.0.0</Text>} />
    </ListGroup>
    <ListGroup><Pressable accessibilityRole="button" style={styles.logout} onPress={logout}><Text style={styles.logoutText}>로그아웃</Text></Pressable></ListGroup>
  </Screen>;
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  avatar: { width: 56, height: 56 },
  profileCopy: { flex: 1 },
  nickname: { ...font.heading, color: palette.ink },
  email: { color: palette.muted, fontSize: 13, marginTop: 2 },
  goal: { color: palette.muted, fontSize: 13, marginTop: 2 },
  version: { color: palette.muted, fontSize: 14 },
  logout: { minHeight: 52, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: palette.danger, fontSize: 16 },
});
