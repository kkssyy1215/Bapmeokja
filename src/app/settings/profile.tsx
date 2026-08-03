import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, Pill, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { UserProfile } from '@/types';

export default function ProfileSettingsScreen() {
  const { profile, updateProfile } = useApp();
  const [draft, setDraft] = useState(profile);
  const set = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => setDraft((prev) => ({ ...prev, [key]: value }));
  const save = () => { updateProfile(draft); Alert.alert('저장했어요', '새 목표가 대시보드에 바로 반영됐어요.', [{ text: '확인', onPress: () => router.back() }]); };
  return <Screen><Header title="내 정보 관리" subtitle="변경 즉시 목표를 다시 계산해요" left={<IconButton label="←" onPress={() => router.back()} />} />
    <View style={styles.avatar}><Text style={styles.avatarEmoji}>🍅</Text><Text style={styles.nickname}>{draft.nickname}</Text><Text style={styles.change}>프로필 사진 변경</Text></View>
    <Field label="닉네임" value={draft.nickname} onChangeText={(value) => set('nickname', value)} />
    <Field label="이메일" value={draft.email} editable={false} />
    <SectionTitle title="신체 정보" /><View style={styles.two}><View style={styles.flex}><Field label="나이" value={String(draft.age)} onChangeText={(value) => set('age', Number(value))} keyboardType="number-pad" /></View><View style={styles.flex}><Field label="키 (cm)" value={String(draft.height)} onChangeText={(value) => set('height', Number(value))} keyboardType="decimal-pad" /></View></View><Field label="몸무게 (kg)" value={String(draft.weight)} onChangeText={(value) => set('weight', Number(value))} keyboardType="decimal-pad" />
    <View style={styles.section}><Text style={styles.label}>활동량</Text><View style={styles.pills}>{(['낮음','보통','높음'] as const).map((value) => <Pill key={value} label={value} active={draft.activity === value} onPress={() => set('activity', value)} />)}</View></View>
    <View style={styles.section}><Text style={styles.label}>목표</Text><View style={styles.pills}>{(['감량','유지','증량'] as const).map((value) => <Pill key={value} label={value} active={draft.goal === value} onPress={() => set('goal', value)} />)}</View></View>
    <SectionTitle title="인바디 정보 (선택)" /><View style={styles.optional}><Text style={styles.optionalTitle}>더 정밀한 분석을 원한다면</Text><Text style={styles.optionalText}>골격근량, 체지방량, 체지방률을 추가하면 개인화된 영양 배분을 제공할 수 있어요.</Text></View><View style={styles.three}><View style={styles.flex}><Field label="골격근량" placeholder="kg" keyboardType="decimal-pad" /></View><View style={styles.flex}><Field label="체지방량" placeholder="kg" keyboardType="decimal-pad" /></View><View style={styles.flex}><Field label="체지방률" placeholder="%" keyboardType="decimal-pad" /></View></View>
    <PrimaryButton title="변경사항 저장" onPress={save} />
  </Screen>;
}

const styles = StyleSheet.create({ avatar: { alignItems: 'center', paddingVertical: spacing.md }, avatarEmoji: { width: 90, height: 90, borderRadius: 45, backgroundColor: palette.tomatoSoft, overflow: 'hidden', textAlign: 'center', paddingTop: 18, fontSize: 48 }, nickname: { ...font.heading, color: palette.ink, marginTop: 8 }, change: { color: palette.tomato, fontSize: 11, fontWeight: '800', marginTop: 4 }, two: { flexDirection: 'row', gap: spacing.sm }, three: { flexDirection: 'row', gap: spacing.xs }, flex: { flex: 1 }, section: { gap: spacing.sm }, label: { ...font.subheading, color: palette.ink }, pills: { flexDirection: 'row', gap: spacing.sm }, optional: { backgroundColor: palette.leafSoft, borderRadius: radii.md, padding: spacing.md }, optionalTitle: { color: palette.leaf, fontWeight: '800', fontSize: 12 }, optionalText: { color: palette.muted, fontSize: 10, marginTop: 4, lineHeight: 15 } });
