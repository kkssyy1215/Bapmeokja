import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, Pill, PrimaryButton, Screen, Pressable } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { ActivityLevelCode, GenderCode, GoalCode } from '@/types/api';

const activities: { code: ActivityLevelCode; label: string; description: string }[] = [
  { code: 'SEDENTARY', label: '거의 안 함', description: '주로 앉아서 생활' },
  { code: 'LIGHT', label: '가벼움', description: '주 1~2회 운동' },
  { code: 'MODERATE', label: '보통', description: '주 3~4회 운동' },
  { code: 'ACTIVE', label: '활발함', description: '주 5~6회 운동' },
  { code: 'VERY_ACTIVE', label: '매우 활발함', description: '매일 강도 높은 운동' },
];

const goals: { code: GoalCode; label: string; detail: string }[] = [
  { code: 'LOSE', label: '감량', detail: '체지방을 줄이고 싶어요' },
  { code: 'MAINTAIN', label: '유지', detail: '현재 몸 상태를 유지해요' },
  { code: 'GAIN', label: '증량', detail: '근육과 체중을 늘려요' },
];

export default function OnboardingScreen() {
  const { completeInitialProfile } = useApp();
  const [gender, setGender] = useState<GenderCode>('F');
  const [activityLevel, setActivityLevel] = useState<ActivityLevelCode>('MODERATE');
  const [goal, setGoal] = useState<GoalCode>('MAINTAIN');
  const [age, setAge] = useState('24');
  const [height, setHeight] = useState('163');
  const [weight, setWeight] = useState('55');
  const [showInBody, setShowInBody] = useState(false);
  const [skeletalMuscleMass, setSkeletalMuscleMass] = useState('');
  const [bodyFatMass, setBodyFatMass] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');
  const [loading, setLoading] = useState(false);

  const valid = useMemo(() => {
    const parsedAge = Number(age);
    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);
    const bodyValues = [skeletalMuscleMass, bodyFatMass, bodyFatPercentage];
    const bodyComplete = bodyValues.every(Boolean) || bodyValues.every((value) => !value);
    return parsedAge >= 1 && parsedAge <= 120 && parsedHeight >= 100 && parsedHeight <= 250 && parsedWeight >= 20 && parsedWeight <= 300 && bodyComplete;
  }, [age, height, weight, skeletalMuscleMass, bodyFatMass, bodyFatPercentage]);

  const complete = async () => {
    if (!valid) return Alert.alert('입력값을 확인해 주세요', '인바디 정보는 세 항목을 모두 입력하거나 비워 주세요.');
    setLoading(true);
    try {
      await completeInitialProfile({
        gender,
        age: Number(age),
        height: Number(height),
        weight: Number(weight),
        activityLevel,
        goal,
        skeletalMuscleMass: skeletalMuscleMass ? Number(skeletalMuscleMass) : undefined,
        bodyFatMass: bodyFatMass ? Number(bodyFatMass) : undefined,
        bodyFatPercentage: bodyFatPercentage ? Number(bodyFatPercentage) : undefined,
      });
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('저장하지 못했어요', error instanceof Error ? error.message : '입력값을 확인해 주세요.');
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Header title="기본 정보 설정" subtitle="권장 섭취량 계산에 사용해요" left={<IconButton label="←" onPress={() => router.back()} />} />
      <View style={styles.intro}><Text style={styles.title}>나에게 맞는 하루 목표를{`\n`}계산해 볼게요</Text><Text style={styles.description}>입력한 정보는 식단 분석과 목표 계산에만 사용됩니다.</Text></View>

      <View style={styles.section}><Text style={styles.label}>성별</Text><View style={styles.pills}><Pill label="여성" active={gender === 'F'} onPress={() => setGender('F')} /><Pill label="남성" active={gender === 'M'} onPress={() => setGender('M')} /></View></View>
      <View style={styles.fields}><Field label="나이 (세)" value={age} onChangeText={setAge} keyboardType="number-pad" /><Field label="키 (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" /><Field label="몸무게 (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /></View>

      <View style={styles.section}><Text style={styles.label}>평소 활동량</Text><View style={styles.optionList}>{activities.map((item) => <Pressable key={item.code} onPress={() => setActivityLevel(item.code)} style={[styles.option, activityLevel === item.code && styles.optionActive]}><View style={[styles.radio, activityLevel === item.code && styles.radioActive]} /><View><Text style={styles.optionTitle}>{item.label}</Text><Text style={styles.optionText}>{item.description}</Text></View></Pressable>)}</View></View>

      <View style={styles.section}><Text style={styles.label}>목표</Text><View style={styles.goalList}>{goals.map((item) => <Pressable key={item.code} onPress={() => setGoal(item.code)} style={[styles.goal, goal === item.code && styles.goalActive]}><Text style={[styles.goalTitle, goal === item.code && styles.goalTitleActive]}>{item.label}</Text><Text style={styles.goalText}>{item.detail}</Text></Pressable>)}</View></View>

      <Pressable style={styles.optionalHeader} onPress={() => setShowInBody((value) => !value)}><View><Text style={styles.optionalTitle}>인바디 정보</Text><Text style={styles.optionalText}>세 항목을 모두 입력하면 정밀 모드로 계산해요</Text></View><Text style={styles.optionalAction}>{showInBody ? '접기' : '입력하기'}</Text></Pressable>
      {showInBody ? <View style={styles.inbody}><Field label="골격근량 (kg)" value={skeletalMuscleMass} onChangeText={setSkeletalMuscleMass} keyboardType="decimal-pad" /><Field label="체지방량 (kg)" value={bodyFatMass} onChangeText={setBodyFatMass} keyboardType="decimal-pad" /><Field label="체지방률 (%)" value={bodyFatPercentage} onChangeText={setBodyFatPercentage} keyboardType="decimal-pad" /></View> : null}
      <PrimaryButton title="하루 목표 계산하기" disabled={!valid} loading={loading} onPress={complete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { paddingVertical: spacing.lg, gap: spacing.sm },
  title: { ...font.title, color: palette.ink, fontSize: 25, lineHeight: 34 },
  description: { ...font.body, color: palette.muted },
  section: { gap: spacing.sm },
  label: { color: palette.muted, fontSize: 13, marginLeft: 4 },
  pills: { flexDirection: 'row', gap: spacing.sm },
  fields: { gap: spacing.md },
  optionList: { gap: spacing.xs },
  option: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: palette.surface, borderRadius: radii.md, paddingHorizontal: spacing.md, ...shadow },
  optionActive: { backgroundColor: palette.accentSoft },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#C4C8CD' },
  radioActive: { borderWidth: 5, borderColor: palette.accent, backgroundColor: palette.surface },
  optionTitle: { color: palette.ink, fontSize: 15, fontWeight: '500' },
  optionText: { color: palette.muted, fontSize: 13, marginTop: 1 },
  goalList: { flexDirection: 'row', gap: spacing.xs },
  goal: { flex: 1, minHeight: 86, backgroundColor: palette.surface, borderRadius: radii.md, padding: spacing.sm, justifyContent: 'center', ...shadow },
  goalActive: { backgroundColor: palette.accentSoft },
  goalTitle: { color: palette.ink, fontSize: 15, fontWeight: '500' },
  goalTitleActive: { color: palette.tomato },
  goalText: { color: palette.muted, fontSize: 12, marginTop: 4, lineHeight: 16 },
  optionalHeader: { borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: palette.surface, ...shadow },
  optionalTitle: { fontWeight: '500', color: palette.ink },
  optionalText: { ...font.caption, color: palette.muted, marginTop: 3 },
  optionalAction: { color: palette.ink, fontSize: 12, fontWeight: '500' },
  inbody: { gap: spacing.md },
});
