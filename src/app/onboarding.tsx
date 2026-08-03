import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, Pill, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { UserProfile } from '@/types';

export default function OnboardingScreen() {
  const { signIn, updateProfile } = useApp();
  const [gender, setGender] = useState<UserProfile['gender']>('여성');
  const [activity, setActivity] = useState<UserProfile['activity']>('보통');
  const [goal, setGoal] = useState<UserProfile['goal']>('유지');
  const [age, setAge] = useState('24');
  const [height, setHeight] = useState('163');
  const [weight, setWeight] = useState('55');

  const complete = () => {
    updateProfile({ gender, activity, goal, age: Number(age), height: Number(height), weight: Number(weight), dailyCalories: goal === '감량' ? 1650 : goal === '증량' ? 2350 : 2000 });
    signIn();
    router.replace('/(tabs)/home');
  };

  return (
    <Screen>
      <Header title="나의 기본 설정" subtitle="1분이면 충분해요" left={<IconButton label="←" onPress={() => router.back()} />} />
      <View style={styles.progress}><View style={styles.progressFill} /></View>
      <View style={styles.hero}><Text style={styles.emoji}>🌱</Text><Text style={styles.title}>더 정확한 영양 분석을 위해{`\n`}몸 정보를 알려주세요</Text><Text style={styles.description}>입력한 정보는 권장 섭취량 계산에만 사용돼요.</Text></View>
      <View style={styles.section}><Text style={styles.label}>성별</Text><View style={styles.pills}>{(['여성', '남성'] as const).map((value) => <Pill key={value} label={value} active={gender === value} onPress={() => setGender(value)} />)}</View></View>
      <View style={styles.fields}><Field label="나이 (세)" value={age} onChangeText={setAge} keyboardType="number-pad" /><Field label="키 (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" /><Field label="몸무게 (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View>
      <View style={styles.section}><Text style={styles.label}>평소 활동량</Text><View style={styles.pills}>{(['낮음', '보통', '높음'] as const).map((value) => <Pill key={value} label={value} active={activity === value} onPress={() => setActivity(value)} />)}</View></View>
      <View style={styles.section}><Text style={styles.label}>나의 목표</Text><View style={styles.goalGrid}>{(['감량', '유지', '증량'] as const).map((value, index) => <Text key={value} onPress={() => setGoal(value)} style={[styles.goal, goal === value && styles.goalActive]}>{['📉', '⚖️', '💪'][index]}{`\n`}{value}</Text>)}</View></View>
      <View style={styles.optional}><Text style={styles.optionalTitle}>인바디 정보 (선택)</Text><Text style={styles.optionalText}>골격근량·체지방량·체지방률은 설정에서 언제든 추가할 수 있어요.</Text></View>
      <PrimaryButton title="맞춤 목표 만들기" onPress={complete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { height: 5, borderRadius: 3, backgroundColor: palette.line }, progressFill: { width: '100%', height: '100%', borderRadius: 3, backgroundColor: palette.tomato },
  hero: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm }, emoji: { fontSize: 48 }, title: { ...font.title, color: palette.ink, textAlign: 'center', fontSize: 24, lineHeight: 33 }, description: { ...font.body, color: palette.muted, textAlign: 'center' },
  section: { gap: spacing.sm }, label: { ...font.subheading, color: palette.ink }, pills: { flexDirection: 'row', gap: spacing.sm },
  fields: { gap: spacing.md }, goalGrid: { flexDirection: 'row', gap: spacing.sm }, goal: { flex: 1, textAlign: 'center', borderRadius: radii.md, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, paddingVertical: spacing.md, color: palette.muted, fontSize: 14, fontWeight: '700', lineHeight: 26, overflow: 'hidden' }, goalActive: { color: palette.tomato, backgroundColor: palette.tomatoSoft, borderColor: palette.tomato },
  optional: { backgroundColor: palette.surfaceWarm, borderRadius: radii.md, padding: spacing.md, gap: 4 }, optionalTitle: { fontWeight: '800', color: palette.ink }, optionalText: { ...font.caption, color: palette.muted },
});
