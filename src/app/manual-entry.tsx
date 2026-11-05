import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Field, Header, IconButton, Pill, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { MealType } from '@/types';
import { goBack } from '@/services/navigation';

export default function ManualEntryScreen() {
  const { saveManualMeal, updateMeal } = useApp();
  // id가 있으면 저장된 식단을 수정한다.
  const editing = useLocalSearchParams<{ id?: string; name?: string; type?: MealType; eatenAt?: string; weightGram?: string; calories?: string; carbs?: string; protein?: string; fat?: string }>();
  const [name, setName] = useState(editing.name ?? '');
  const [type, setType] = useState<MealType>(editing.type ?? '점심');
  const [weightGram, setWeightGram] = useState(editing.weightGram ?? '100');
  const [calories, setCalories] = useState(editing.calories ?? '');
  const [carbs, setCarbs] = useState(editing.carbs ?? '');
  const [protein, setProtein] = useState(editing.protein ?? '');
  const [fat, setFat] = useState(editing.fat ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !calories.trim()) return Alert.alert('필수 정보를 확인해 주세요', '음식명과 칼로리는 꼭 입력해야 해요.');
    const values = [weightGram, calories, carbs || '0', protein || '0', fat || '0'].map(Number);
    if (!Number.isFinite(values[0]) || values[0] <= 0 || values.slice(1).some((value) => !Number.isFinite(value) || value < 0)) {
      return Alert.alert('영양 값을 확인해 주세요', '섭취 중량은 0보다 커야 하고 영양 값은 0 이상의 숫자여야 해요.');
    }
    setSaving(true);
    try {
      const meal = { name: name.trim(), type, eatenAt: editing.eatenAt ?? new Date().toISOString(), weightGram: values[0], calories: values[1], carbs: values[2], protein: values[3], fat: values[4] };
      if (editing.id) await updateMeal(editing.id, meal);
      else await saveManualMeal(meal);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert(editing.id ? '식단을 수정하지 못했어요' : '식단을 저장하지 못했어요', error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.');
      setSaving(false);
    }
  };

  return <Screen><Header title={editing.id ? '식단 수정' : '직접 입력'} subtitle={editing.id ? '바꿀 내용을 고쳐 주세요' : '알고 있는 만큼만 적어도 돼요'} left={<IconButton label="←" onPress={() => goBack()} />} />
    <View style={styles.section}><Text style={styles.label}>식사 구분</Text><View style={styles.pills}>{(['아침','점심','저녁','간식'] as MealType[]).map((value) => <Pill key={value} label={value} active={type === value} onPress={() => setType(value)} />)}</View></View>
    <Field label="음식명" value={name} onChangeText={setName} placeholder="예: 닭가슴살 샐러드" maxLength={100} />
    <Field label="섭취 중량 (g)" value={weightGram} onChangeText={setWeightGram} keyboardType="decimal-pad" />
    <Field label="칼로리 (kcal)" value={calories} onChangeText={setCalories} keyboardType="number-pad" placeholder="필수" />
    <View style={styles.three}><View style={styles.flex}><Field label="탄수화물 (g)" value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" /></View><View style={styles.flex}><Field label="단백질 (g)" value={protein} onChangeText={setProtein} keyboardType="decimal-pad" /></View><View style={styles.flex}><Field label="지방 (g)" value={fat} onChangeText={setFat} keyboardType="decimal-pad" /></View></View>
    <PrimaryButton title={editing.id ? '수정 내용 저장' : '식단에 저장'} onPress={save} loading={saving} />
  </Screen>;
}

const styles = StyleSheet.create({ hero: { backgroundColor: palette.blueSoft, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'center' }, heroEmoji: { fontSize: 35 }, heroTitle: { ...font.subheading, color: palette.ink }, heroText: { ...font.caption, color: palette.muted, marginTop: 3, maxWidth: 280 }, section: { gap: spacing.sm }, label: { color: palette.muted, fontSize: 13, marginLeft: 4 }, pills: { flexDirection: 'row', gap: spacing.xs }, three: { flexDirection: 'row', gap: spacing.xs }, flex: { flex: 1 } });
