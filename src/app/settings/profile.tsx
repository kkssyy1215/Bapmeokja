import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, Pill, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode } from '@/services/api';
import { goBack } from '@/services/navigation';
import { userApi } from '@/services/bapmeokja-api';
import { UserProfile } from '@/types';

const character = require('../../../assets/characters/tomato-balanced.png');

export default function ProfileSettingsScreen() {
  const { profile, updateProfile } = useApp();
  const [draft, setDraft] = useState(profile);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => setDraft((prev) => ({ ...prev, [key]: value }));
  const save = async () => {
    setSaving(true);
    try {
      const goals = isMockMode ? { dailyCalorieGoal: draft.dailyCalories, carbGoalGram: draft.carbGoal, proteinGoalGram: draft.proteinGoal, fatGoalGram: draft.fatGoal } : await userApi.updateProfile({ nickname: draft.nickname, gender: draft.gender === '남성' ? 'M' : 'F', age: draft.age, height: draft.height, weight: draft.weight, activityLevel: draft.activity === '낮음' ? 'LIGHT' : draft.activity === '높음' ? 'ACTIVE' : 'MODERATE', goal: draft.goal === '감량' ? 'LOSE' : draft.goal === '증량' ? 'GAIN' : 'MAINTAIN', skeletalMuscleMass: draft.skeletalMuscleMass, bodyFatMass: draft.bodyFatMass, bodyFatPercentage: draft.bodyFatPercentage });
      updateProfile({ ...draft, dailyCalories: goals.dailyCalorieGoal, carbGoal: goals.carbGoalGram, proteinGoal: goals.proteinGoalGram, fatGoal: goals.fatGoalGram });
      Alert.alert('저장했어요', '변경된 목표를 대시보드에 반영했습니다.', [{ text: '확인', onPress: () => goBack() }]);
    } catch (error) { Alert.alert('저장하지 못했어요', getErrorMessage(error)); setSaving(false); }
  };
  return <Screen><Header title="내 정보 관리" subtitle="변경 즉시 목표를 다시 계산해요" left={<IconButton label="←" onPress={() => goBack()} />} />
    <View style={styles.avatar}><Image source={character} style={styles.avatarImage} contentFit="contain" accessibilityLabel="토마토 프로필" /><Text style={styles.nickname}>{draft.nickname}</Text></View>
    <Field label="닉네임" value={draft.nickname} onChangeText={(value) => set('nickname', value)} />
    <Field label="이메일" value={draft.email} editable={false} />
    <SectionTitle title="신체 정보" /><View style={styles.two}><View style={styles.flex}><Field label="나이" value={String(draft.age)} onChangeText={(value) => set('age', Number(value))} keyboardType="number-pad" /></View><View style={styles.flex}><Field label="키 (cm)" value={String(draft.height)} onChangeText={(value) => set('height', Number(value))} keyboardType="decimal-pad" /></View></View><Field label="몸무게 (kg)" value={String(draft.weight)} onChangeText={(value) => set('weight', Number(value))} keyboardType="decimal-pad" />
    <View style={styles.section}><Text style={styles.label}>활동량</Text><View style={styles.pills}>{(['낮음','보통','높음'] as const).map((value) => <Pill key={value} label={value} active={draft.activity === value} onPress={() => set('activity', value)} />)}</View></View>
    <View style={styles.section}><Text style={styles.label}>목표</Text><View style={styles.pills}>{(['감량','유지','증량'] as const).map((value) => <Pill key={value} label={value} active={draft.goal === value} onPress={() => set('goal', value)} />)}</View></View>
    <SectionTitle title="인바디 정보 (선택)" /><View style={styles.optional}><Text style={styles.optionalTitle}>더 정밀한 분석을 원한다면</Text><Text style={styles.optionalText}>세 항목을 모두 입력하면 제지방량을 기준으로 영양 목표를 다시 계산합니다.</Text></View><View style={styles.three}><View style={styles.flex}><Field label="골격근량" value={draft.skeletalMuscleMass ? String(draft.skeletalMuscleMass) : ''} onChangeText={(value) => set('skeletalMuscleMass', value ? Number(value) : undefined)} placeholder="kg" keyboardType="decimal-pad" /></View><View style={styles.flex}><Field label="체지방량" value={draft.bodyFatMass ? String(draft.bodyFatMass) : ''} onChangeText={(value) => set('bodyFatMass', value ? Number(value) : undefined)} placeholder="kg" keyboardType="decimal-pad" /></View><View style={styles.flex}><Field label="체지방률" value={draft.bodyFatPercentage ? String(draft.bodyFatPercentage) : ''} onChangeText={(value) => set('bodyFatPercentage', value ? Number(value) : undefined)} placeholder="%" keyboardType="decimal-pad" /></View></View>
    <PrimaryButton title="변경사항 저장" onPress={save} loading={saving} />
  </Screen>;
}

const styles = StyleSheet.create({ avatar: { alignItems: 'center', paddingVertical: spacing.md }, avatarImage: { width: 88, height: 96 }, nickname: { ...font.heading, color: palette.ink, marginTop: 8 }, change: { color: palette.ink, fontSize: 12, fontWeight: '500', marginTop: 4 }, two: { flexDirection: 'row', gap: spacing.sm }, three: { flexDirection: 'row', gap: spacing.xs }, flex: { flex: 1 }, section: { gap: spacing.sm }, label: { color: palette.muted, fontSize: 13, marginLeft: 4 }, pills: { flexDirection: 'row', gap: spacing.sm }, optional: { backgroundColor: palette.leafSoft, borderRadius: radii.md, padding: spacing.md }, optionalTitle: { color: palette.leaf, fontWeight: '500', fontSize: 12 }, optionalText: { color: palette.muted, fontSize: 12, marginTop: 4, lineHeight: 15 } });
