import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { Field, Header, IconButton, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode } from '@/services/api';
import { userApi } from '@/services/bapmeokja-api';
import { NotificationSettings } from '@/types';

export default function NotificationSettingsScreen() {
  const { notifications, updateNotifications } = useApp();
  const [saving, setSaving] = useState(false);
  const toggle = (key: keyof NotificationSettings, value: boolean) => updateNotifications({ [key]: value });
  const save = async () => {
    const times = [notifications.breakfastTime, notifications.lunchTime, notifications.dinnerTime];
    const isValidTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    if (times.some((value) => !isValidTime(value))) {
      Alert.alert('식사 시간을 확인해 주세요', '시간은 00:00부터 23:59 사이의 HH:mm 형식으로 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      if (!isMockMode) await userApi.updateNotifications({ pushEnabled: notifications.pushEnabled, waterReminderEnabled: notifications.waterReminder, breakfastTime: notifications.breakfastTime, lunchTime: notifications.lunchTime, dinnerTime: notifications.dinnerTime, expiryAlertEnabled: notifications.expiryAlert });
      Alert.alert('알림 설정을 저장했어요', '', [{ text: '확인', onPress: () => router.back() }]);
    } catch (error) { Alert.alert('저장하지 못했어요', getErrorMessage(error)); setSaving(false); }
  };
  return <Screen><Header title="푸시 알림 설정" subtitle="필요한 알림만 골라 받아요" left={<IconButton label="←" onPress={() => router.back()} />} />
    <View style={styles.hero}><Text style={styles.heroEmoji}>🔔</Text><View><Text style={styles.heroTitle}>생활 리듬을 가볍게 도와드릴게요</Text><Text style={styles.heroText}>기기 알림 권한이 켜져 있어야 받을 수 있어요.</Text></View></View>
    <SectionTitle title="알림 종류" /><View style={styles.group}><SwitchRow emoji="💧" title="수분 섭취 알림" subtitle="2시간마다 물 마실 시간을 알려요" value={notifications.waterReminder} onChange={(value) => toggle('waterReminder', value)} /><SwitchRow emoji="🧊" title="유통기한 임박 알림" subtitle="D-2 재료가 있으면 알려요" value={notifications.expiryAlert} onChange={(value) => toggle('expiryAlert', value)} last /></View>
    <SectionTitle title="식사 시간" /><View style={styles.scheduleNote}><Text style={styles.scheduleNoteTitle}>{notifications.pushEnabled ? '식사 시간 알림 사용 중' : '전체 푸시 알림이 꺼져 있어요'}</Text><Text style={styles.scheduleNoteText}>{notifications.pushEnabled ? '아래 시간을 서버에 저장하고 각 식사 시간에 알려드려요.' : '시간은 저장되지만 알림을 받으려면 설정 화면에서 전체 푸시를 켜 주세요.'}</Text></View><View style={styles.timeGrid}><View style={styles.flex}><Field label="아침" value={notifications.breakfastTime} onChangeText={(value) => updateNotifications({ breakfastTime: value })} autoCapitalize="none" placeholder="08:00" /></View><View style={styles.flex}><Field label="점심" value={notifications.lunchTime} onChangeText={(value) => updateNotifications({ lunchTime: value })} autoCapitalize="none" placeholder="12:00" /></View><View style={styles.flex}><Field label="저녁" value={notifications.dinnerTime} onChangeText={(value) => updateNotifications({ dinnerTime: value })} autoCapitalize="none" placeholder="18:30" /></View></View>
    <View style={styles.preview}><Text style={styles.previewLabel}>알림 미리보기</Text><View style={styles.notification}><Text style={styles.appIcon}>🍅</Text><View><Text style={styles.notificationTitle}>밥 먹자!</Text><Text style={styles.notificationText}>저녁 먹을 시간이에요. 오늘 부족한 단백질을 챙겨 볼까요?</Text></View><Text style={styles.now}>지금</Text></View></View>
    <PrimaryButton title="알림 설정 저장" onPress={save} loading={saving} />
  </Screen>;
}

function SwitchRow({ emoji, title, subtitle, value, onChange, last = false }: { emoji: string; title: string; subtitle: string; value: boolean; onChange: (value: boolean) => void; last?: boolean }) { return <View style={[styles.row, last && styles.last]}><View style={styles.rowIcon}><Text>{emoji}</Text></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.rowSub}>{subtitle}</Text></View><Switch value={value} onValueChange={onChange} trackColor={{ true: palette.tomato }} /></View>; }

const styles = StyleSheet.create({ hero: { backgroundColor: palette.tomatoSoft, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'center' }, heroEmoji: { fontSize: 37 }, heroTitle: { ...font.subheading, color: palette.ink }, heroText: { ...font.caption, color: palette.muted, marginTop: 3, maxWidth: 285 }, group: { backgroundColor: palette.surface, borderRadius: radii.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: palette.line }, row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: palette.line }, last: { borderBottomWidth: 0 }, rowIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.background, alignItems: 'center', justifyContent: 'center' }, rowCopy: { flex: 1 }, rowTitle: { color: palette.ink, fontWeight: '800', fontSize: 13 }, rowSub: { color: palette.muted, fontSize: 10, marginTop: 3 }, scheduleNote: { backgroundColor: palette.leafSoft, borderRadius: radii.md, padding: spacing.md }, scheduleNoteTitle: { color: palette.leaf, fontSize: 12, fontWeight: '900' }, scheduleNoteText: { color: palette.muted, fontSize: 10, lineHeight: 15, marginTop: 3 }, timeGrid: { flexDirection: 'row', gap: spacing.xs }, flex: { flex: 1 }, preview: { backgroundColor: '#ECEBE8', borderRadius: radii.lg, padding: spacing.md }, previewLabel: { color: palette.muted, fontSize: 10, fontWeight: '700', marginBottom: spacing.sm }, notification: { backgroundColor: 'rgba(255,255,255,.88)', borderRadius: radii.md, padding: spacing.sm, flexDirection: 'row', gap: spacing.sm }, appIcon: { fontSize: 24 }, notificationTitle: { color: palette.ink, fontWeight: '800', fontSize: 11 }, notificationText: { color: palette.ink, fontSize: 10, marginTop: 3, maxWidth: 260, lineHeight: 14 }, now: { color: palette.muted, fontSize: 9, marginLeft: 'auto' } });
