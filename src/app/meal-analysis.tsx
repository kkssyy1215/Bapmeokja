import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card, Header, IconButton, MacroBar, NutrientChips, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { MealType } from '@/types';

const detected = [
  { id: 'food-1', name: '현미밥', amount: '150g', calories: 224, carbs: 48, protein: 5, fat: 2, emoji: '🍚' },
  { id: 'food-2', name: '닭가슴살 구이', amount: '120g', calories: 198, carbs: 2, protein: 36, fat: 5, emoji: '🍗' },
  { id: 'food-3', name: '구운 채소', amount: '100g', calories: 91, carbs: 14, protein: 4, fat: 3, emoji: '🥦' },
];

export default function MealAnalysisScreen() {
  const params = useLocalSearchParams<{ uri?: string; saved?: string; id?: string }>();
  const { addMeal, meals } = useApp();
  const savedMeal = params.saved ? meals.find((meal) => meal.id === params.id) : undefined;
  const [mealType, setMealType] = useState<MealType>(savedMeal?.type ?? '저녁');
  const [saving, setSaving] = useState(false);
  const total = useMemo(() => savedMeal ?? detected.reduce((sum, item) => ({ ...sum, calories: sum.calories + item.calories, carbs: sum.carbs + item.carbs, protein: sum.protein + item.protein, fat: sum.fat + item.fat }), { calories: 0, carbs: 0, protein: 0, fat: 0 }), [savedMeal]);

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      addMeal({ id: `meal-${Date.now()}`, type: mealType, name: '현미 닭가슴살 플레이트', emoji: '🍱', eatenAt: new Date().toISOString(), calories: total.calories, carbs: total.carbs, protein: total.protein, fat: total.fat, confidence: 94 });
      setSaving(false);
      Alert.alert('식단을 저장했어요', '오늘의 영양 토마토가 업데이트됐어요.', [{ text: '홈에서 확인', onPress: () => router.replace('/(tabs)/home') }]);
    }, 550);
  };

  return (
    <Screen>
      <Header title={savedMeal ? '식단 상세' : 'AI 분석 결과'} subtitle={savedMeal ? '저장된 영양 정보' : '인식 정확도 94%'} left={<IconButton label="←" onPress={() => router.back()} />} right={<IconButton label="⋯" />} />
      <View style={styles.imageWrap}>{params.uri ? <Image source={{ uri: params.uri }} style={styles.image} contentFit="cover" /> : <Text style={styles.foodHero}>{savedMeal?.emoji ?? '🍱'}</Text>}<View style={styles.aiBadge}><Text style={styles.aiBadgeText}>✦ AI 분석 완료</Text></View></View>
      <View style={styles.typeRow}>{(['아침', '점심', '저녁', '간식'] as MealType[]).map((type) => <Text key={type} onPress={() => !savedMeal && setMealType(type)} style={[styles.type, mealType === type && styles.typeActive]}>{type}</Text>)}</View>
      <Card>
        <View style={styles.totalTop}><View><Text style={styles.totalLabel}>총 섭취 칼로리</Text><Text style={styles.total}>{total.calories} <Text style={styles.unit}>kcal</Text></Text></View><View style={styles.confidence}><Text style={styles.confidenceValue}>94%</Text><Text style={styles.confidenceLabel}>AI 확신도</Text></View></View>
        <View style={styles.macroList}><MacroBar label="탄수화물" value={total.carbs} goal={100} color={palette.leaf} /><MacroBar label="단백질" value={total.protein} goal={60} color={palette.yellow} /><MacroBar label="지방" value={total.fat} goal={30} color={palette.tomato} /></View>
      </Card>
      <SectionTitle title="인식한 음식" action={savedMeal ? undefined : '직접 수정'} onAction={() => router.push('/manual-entry')} />
      <Card style={styles.foodList}>
        {(savedMeal ? [{ id: savedMeal.id, name: savedMeal.name, amount: '1인분', calories: savedMeal.calories, carbs: savedMeal.carbs, protein: savedMeal.protein, fat: savedMeal.fat, emoji: savedMeal.emoji }] : detected).map((item, index) => <View key={item.id} style={[styles.foodRow, index > 0 && styles.foodBorder]}><Text style={styles.foodEmoji}>{item.emoji}</Text><View style={styles.foodInfo}><Text style={styles.foodName}>{item.name}</Text><Text style={styles.foodAmount}>{item.amount}</Text><NutrientChips carbs={item.carbs} protein={item.protein} fat={item.fat} /></View><Text style={styles.foodKcal}>{item.calories}{`\n`}<Text style={styles.foodUnit}>kcal</Text></Text></View>)}
      </Card>
      <View style={styles.notice}><Text style={styles.noticeIcon}>💡</Text><Text style={styles.noticeText}>양이나 음식이 다르면 직접 수정해 주세요. 수정할수록 AI 분석이 더 정확해져요.</Text></View>
      {savedMeal ? <PrimaryButton title="식단 목록으로" variant="secondary" onPress={() => router.push('/history')} /> : <PrimaryButton title="이대로 식단에 저장" loading={saving} onPress={save} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  imageWrap: { height: 250, borderRadius: radii.xl, backgroundColor: '#EDE2D0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, image: { width: '100%', height: '100%' }, foodHero: { fontSize: 120 }, aiBadge: { position: 'absolute', bottom: 13, left: 13, backgroundColor: 'rgba(36,35,31,.85)', borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 7 }, aiBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  typeRow: { flexDirection: 'row', gap: spacing.xs }, type: { flex: 1, textAlign: 'center', paddingVertical: 10, borderRadius: radii.pill, color: palette.muted, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, overflow: 'hidden', fontSize: 12, fontWeight: '700' }, typeActive: { color: '#fff', backgroundColor: palette.ink, borderColor: palette.ink },
  totalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, totalLabel: { color: palette.muted, fontSize: 11 }, total: { color: palette.ink, fontSize: 30, fontWeight: '900', marginTop: 3 }, unit: { color: palette.muted, fontSize: 12 }, confidence: { alignItems: 'center', backgroundColor: palette.leafSoft, borderRadius: radii.md, padding: 10 }, confidenceValue: { color: palette.leaf, fontWeight: '900' }, confidenceLabel: { color: palette.muted, fontSize: 8 }, macroList: { gap: 12, marginTop: spacing.md },
  foodList: { paddingVertical: 3 }, foodRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 12 }, foodBorder: { borderTopWidth: 1, borderTopColor: palette.line }, foodEmoji: { fontSize: 31, width: 48, height: 48, textAlign: 'center', paddingTop: 7, backgroundColor: palette.surfaceWarm, borderRadius: radii.md, overflow: 'hidden' }, foodInfo: { flex: 1, gap: 3 }, foodName: { color: palette.ink, fontWeight: '800', fontSize: 13 }, foodAmount: { color: palette.muted, fontSize: 10 }, foodKcal: { color: palette.ink, textAlign: 'right', fontWeight: '900' }, foodUnit: { color: palette.muted, fontSize: 9 }, notice: { flexDirection: 'row', backgroundColor: palette.yellowSoft, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm }, noticeIcon: { fontSize: 18 }, noticeText: { ...font.caption, color: '#6E5B34', flex: 1 },
});
