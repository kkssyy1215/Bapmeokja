import { Href, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Header, IconButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode } from '@/services/api';
import { userApi } from '@/services/bapmeokja-api';
import { NotificationSettings } from '@/types';

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
    } catch (error) {
      updateNotifications({ [key]: previous });
      Alert.alert('알림 설정을 바꾸지 못했어요', getErrorMessage(error));
    } finally {
      setSavingNotification(null);
    }
  };

  const logout = () => Alert.alert('로그아웃할까요?', '이 기기의 로그인 정보가 삭제됩니다.', [{ text: '취소', style: 'cancel' }, { text: '로그아웃', style: 'destructive', onPress: async () => { await signOut(); router.replace('/'); } }]);
  return <Screen><Header title="설정" left={<IconButton label="←" onPress={() => router.back()} />} />
    <View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>🍅</Text></View><View style={styles.profileCopy}><Text style={styles.nickname}>{profile.nickname}</Text><Text style={styles.email}>{profile.email}</Text><View style={styles.goalBadge}><Text style={styles.goalText}>{profile.goal} 목표 · {profile.dailyCalories} kcal</Text></View></View><Pressable onPress={() => router.push('/settings/profile')}><Text style={styles.edit}>편집</Text></Pressable></View>
    <SectionTitle title="나의 설정" /><View style={styles.group}><SettingRow emoji="👤" title="내 정보 관리" subtitle="키, 몸무게, 목표 설정" onPress={() => router.push('/settings/profile')} /><SettingRow emoji="🎯" title="영양 목표" subtitle={`탄 ${profile.carbGoal}g · 단 ${profile.proteinGoal}g · 지 ${profile.fatGoal}g`} onPress={() => router.push('/settings/profile')} /><SettingRow emoji="💳" title="기본 예산" subtitle={`외식 ${(profile.defaultDiningBudget ?? 10000).toLocaleString()}원 · 집밥 ${(profile.defaultHomeBudget ?? 8000).toLocaleString()}원`} onPress={() => router.push('/settings/budget' as Href)} last /></View>
    <SectionTitle title="알림" /><View style={styles.group}><SettingRow emoji="🔔" title="푸시 알림" subtitle="식사 시간과 주요 알림 전체 설정" right={<Switch value={notifications.pushEnabled} disabled={savingNotification !== null} onValueChange={(value) => saveNotification('pushEnabled', value)} trackColor={{ true: palette.tomato }} />} /><SettingRow emoji="💧" title="물 마시기 알림" subtitle="2시간마다 알려드려요" right={<Switch value={notifications.waterReminder} disabled={savingNotification !== null} onValueChange={(value) => saveNotification('waterReminder', value)} trackColor={{ true: palette.tomato }} />} /><SettingRow emoji="⏰" title="세부 알림 설정" subtitle="식사 시간과 유통기한" onPress={() => router.push('/settings/notifications')} last /></View>
    <SectionTitle title="계정 및 보안" /><View style={styles.group}><SettingRow emoji="🔒" title="비밀번호 변경" subtitle="현재 비밀번호 확인 후 변경" onPress={() => router.push('/settings/password' as Href)} /><SettingRow emoji="⚠️" title="회원 탈퇴" subtitle="계정과 저장한 데이터를 삭제" onPress={() => router.push('/settings/account' as Href)} last /></View>
    <SectionTitle title="앱 정보" /><View style={styles.group}><SettingRow emoji="❔" title="도움말" onPress={() => router.push('/settings/help' as Href)} /><SettingRow emoji="📄" title="이용약관 및 개인정보 처리방침" onPress={() => router.push('/settings/legal' as Href)} /><SettingRow emoji="ℹ️" title="버전" subtitle="1.0.0" last /></View>
    <Pressable style={styles.logout} onPress={logout}><Text style={styles.logoutText}>로그아웃</Text></Pressable><Text style={styles.footer}>밥 먹자! · 잘 먹는 하루를 함께 만들어요</Text>
  </Screen>;
}

function SettingRow({ emoji, title, subtitle, onPress, right, last = false }: { emoji: string; title: string; subtitle?: string; onPress?: () => void; right?: React.ReactNode; last?: boolean }) { return <Pressable onPress={onPress} disabled={!onPress && !right} style={[styles.row, last && styles.last]}><View style={styles.rowIcon}><Text>{emoji}</Text></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text>{subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}</View>{right ?? (onPress ? <Text style={styles.arrow}>›</Text> : null)}</Pressable>; }

const styles = StyleSheet.create({ profile: { backgroundColor: palette.surface, borderRadius: radii.xl, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: palette.line }, avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: palette.tomatoSoft, alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 40 }, profileCopy: { flex: 1 }, nickname: { ...font.heading, color: palette.ink }, email: { color: palette.muted, fontSize: 11, marginTop: 3 }, goalBadge: { alignSelf: 'flex-start', backgroundColor: palette.leafSoft, borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 5, marginTop: 8 }, goalText: { color: palette.leaf, fontSize: 9, fontWeight: '800' }, edit: { color: palette.tomato, fontSize: 12, fontWeight: '800' }, group: { backgroundColor: palette.surface, borderRadius: radii.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: palette.line }, row: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: palette.line }, last: { borderBottomWidth: 0 }, rowIcon: { width: 35, height: 35, borderRadius: 18, backgroundColor: palette.background, alignItems: 'center', justifyContent: 'center' }, rowCopy: { flex: 1 }, rowTitle: { color: palette.ink, fontSize: 13, fontWeight: '800' }, rowSubtitle: { color: palette.muted, fontSize: 10, marginTop: 3 }, arrow: { color: palette.muted, fontSize: 25 }, logout: { minHeight: 50, alignItems: 'center', justifyContent: 'center' }, logoutText: { color: palette.tomato, fontWeight: '800' }, footer: { color: palette.muted, fontSize: 10, textAlign: 'center' } });
