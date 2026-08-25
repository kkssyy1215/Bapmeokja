import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Field, Header, IconButton, MacroBar, NutrientChips, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { dietApi } from '@/services/bapmeokja-api';
import { Meal, MealType } from '@/types';
import { AnalyzeDietResponse } from '@/types/api';

const demoAnalysis: AnalyzeDietResponse = {
  analyzeId: 'anl_demo_001',
  foodName: '현미 닭가슴살 플레이트',
  totalCalorie: 513,
  totalCarb: 64,
  totalProtein: 45,
  totalFat: 10,
  items: [
    { itemId: 'itm_001', name: '현미밥', weightGram: 150, calorie: 224, carb: 48, protein: 5, fat: 2 },
    { itemId: 'itm_002', name: '닭가슴살 구이', weightGram: 120, calorie: 198, carb: 2, protein: 36, fat: 5 },
    { itemId: 'itm_003', name: '구운 채소', weightGram: 100, calorie: 91, carb: 14, protein: 4, fat: 3 },
  ],
};

type EditableDietItem = {
  itemId: string;
  name: string;
  weightGram: string;
  calorie: string;
  carb: string;
  protein: string;
  fat: string;
};

function editableItemsFrom(analysis: AnalyzeDietResponse): EditableDietItem[] {
  return analysis.items.map((item) => ({
    itemId: item.itemId,
    name: item.name,
    weightGram: String(item.weightGram),
    calorie: String(item.calorie),
    carb: String(item.carb),
    protein: String(item.protein),
    fat: String(item.fat),
  }));
}

function safeNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function rounded(value: number) {
  return Math.round(value * 10) / 10;
}

export default function MealAnalysisScreen() {
  const params = useLocalSearchParams<{ uri?: string; saved?: string; id?: string; type?: string; name?: string; eatenAt?: string; calories?: string; carbs?: string; protein?: string; fat?: string }>();
  const { saveAnalyzedMeal, meals } = useApp();
  const savedMeal = useMemo<Meal | undefined>(() => {
    if (!params.saved) return undefined;
    const localMeal = meals.find((meal) => meal.id === params.id);
    if (localMeal) return localMeal;
    if (!params.id || !params.name) return undefined;
    const routeType = ['아침', '점심', '저녁', '간식'].includes(params.type ?? '') ? params.type as MealType : '저녁';
    return {
      id: params.id,
      type: routeType,
      name: params.name,
      emoji: '🍱',
      eatenAt: params.eatenAt ?? new Date().toISOString(),
      calories: Number(params.calories ?? 0),
      carbs: Number(params.carbs ?? 0),
      protein: Number(params.protein ?? 0),
      fat: Number(params.fat ?? 0),
    };
  }, [meals, params.calories, params.carbs, params.eatenAt, params.fat, params.id, params.name, params.protein, params.saved, params.type]);
  const [mealType, setMealType] = useState<MealType>(savedMeal?.type ?? '저녁');
  const [analysis, setAnalysis] = useState<AnalyzeDietResponse | null>(savedMeal ? {
    analyzeId: '', foodName: savedMeal.name, totalCalorie: savedMeal.calories, totalCarb: savedMeal.carbs, totalProtein: savedMeal.protein, totalFat: savedMeal.fat,
    items: [{ itemId: savedMeal.id, name: savedMeal.name, weightGram: 0, calorie: savedMeal.calories, carb: savedMeal.carbs, protein: savedMeal.protein, fat: savedMeal.fat }],
  } : null);
  const [analyzing, setAnalyzing] = useState(!savedMeal);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editFoodName, setEditFoodName] = useState('');
  const [editItems, setEditItems] = useState<EditableDietItem[]>([]);

  const analyze = useCallback(async () => {
    if (savedMeal) return;
    await Promise.resolve();
    setAnalyzing(true);
    setError('');
    try {
      const result = isMockMode || !params.uri
        ? await simulateRequest(demoAnalysis, 900)
        : await dietApi.analyzeImage(params.uri);
      setAnalysis(result);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setAnalyzing(false);
    }
  }, [params.uri, savedMeal]);

  useEffect(() => {
    const timer = setTimeout(() => { analyze(); }, 0);
    return () => clearTimeout(timer);
  }, [analyze]);

  const total = useMemo(() => analysis ? { calories: analysis.totalCalorie, carbs: analysis.totalCarb, protein: analysis.totalProtein, fat: analysis.totalFat } : null, [analysis]);

  const beginEditing = () => {
    if (!analysis) return;
    setEditFoodName(analysis.foodName);
    setEditItems(editableItemsFrom(analysis));
    setEditing(true);
  };

  const updateEditItem = (index: number, key: keyof EditableDietItem, value: string) => {
    setEditItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  };

  const addEditItem = () => {
    setEditItems((current) => [...current, { itemId: `manual_${Date.now()}`, name: '', weightGram: '0', calorie: '0', carb: '0', protein: '0', fat: '0' }]);
  };

  const removeEditItem = (index: number) => {
    if (editItems.length === 1) {
      Alert.alert('음식 항목이 필요해요', '최소 한 개의 음식 항목을 남겨 주세요.');
      return;
    }
    setEditItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const applyEdits = () => {
    const foodName = editFoodName.trim();
    if (!foodName) {
      Alert.alert('식단 이름을 입력해 주세요');
      return;
    }
    if (!editItems.length || editItems.some((item) => !item.name.trim())) {
      Alert.alert('음식 이름을 확인해 주세요', '모든 음식 항목에 이름을 입력해 주세요.');
      return;
    }

    const parsedItems = editItems.map((item) => ({
      itemId: item.itemId,
      name: item.name.trim(),
      weightGram: safeNumber(item.weightGram),
      calorie: safeNumber(item.calorie),
      carb: safeNumber(item.carb),
      protein: safeNumber(item.protein),
      fat: safeNumber(item.fat),
    }));
    if (parsedItems.some((item) => [item.weightGram, item.calorie, item.carb, item.protein, item.fat].some((value) => value === null))) {
      Alert.alert('영양 값을 확인해 주세요', '무게와 영양 값은 0 이상의 숫자로 입력해 주세요.');
      return;
    }

    const items = parsedItems.map((item) => ({
      itemId: item.itemId,
      name: item.name,
      weightGram: item.weightGram ?? 0,
      calorie: item.calorie ?? 0,
      carb: item.carb ?? 0,
      protein: item.protein ?? 0,
      fat: item.fat ?? 0,
    }));
    setAnalysis((current) => current ? {
      ...current,
      foodName,
      items,
      totalCalorie: rounded(items.reduce((sum, item) => sum + item.calorie, 0)),
      totalCarb: rounded(items.reduce((sum, item) => sum + item.carb, 0)),
      totalProtein: rounded(items.reduce((sum, item) => sum + item.protein, 0)),
      totalFat: rounded(items.reduce((sum, item) => sum + item.fat, 0)),
    } : current);
    setEditing(false);
  };

  const save = async () => {
    if (!analysis) return;
    setSaving(true);
    try {
      await saveAnalyzedMeal(analysis, mealType);
      Alert.alert('식단을 저장했어요', '오늘 섭취량에 바로 반영했습니다.', [{ text: '홈에서 확인', onPress: () => router.replace('/(tabs)/home') }]);
    } catch (requestError) {
      Alert.alert('식단을 저장하지 못했어요', getErrorMessage(requestError));
      setSaving(false);
    }
  };

  if (analyzing) {
    return <Screen><Header title="음식 분석" left={<IconButton label="←" onPress={() => router.back()} />} /><View style={styles.loading}><ActivityIndicator color={palette.tomato} size="large" /><Text style={styles.loadingTitle}>사진을 분석하고 있어요</Text><Text style={styles.loadingText}>사진에 보이는 음식 종류와 양을 바탕으로 영양값을 추정하는 중입니다.</Text></View></Screen>;
  }

  if (!analysis || !total) {
    return <Screen><Header title="음식 분석" left={<IconButton label="←" onPress={() => router.back()} />} /><View style={styles.loading}><Text style={styles.errorIcon}>!</Text><Text style={styles.loadingTitle}>음식을 인식하지 못했어요</Text><Text style={styles.loadingText}>{error || '다른 사진을 사용하거나 직접 입력해 주세요.'}</Text><View style={styles.errorButtons}><PrimaryButton title="다시 분석" onPress={analyze} /><PrimaryButton title="직접 입력" variant="secondary" onPress={() => router.replace('/manual-entry')} /></View></View></Screen>;
  }

  return (
    <Screen>
      <Header title={savedMeal ? '식단 상세' : '분석 결과'} subtitle={savedMeal ? '저장된 영양 정보' : '저장 전 내용을 확인·수정해 주세요'} left={<IconButton label="←" onPress={() => router.back()} />} />
      <View style={styles.imageWrap}>{params.uri ? <Image source={{ uri: params.uri }} style={styles.image} contentFit="cover" /> : <Text style={styles.foodHero}>{savedMeal?.emoji ?? '🍱'}</Text>}<View style={styles.resultBadge}><Text style={styles.resultBadgeText}>{savedMeal ? '저장 완료' : '사진 분석 완료'}</Text></View></View>
      <View style={styles.typeRow}>{(['아침', '점심', '저녁', '간식'] as MealType[]).map((type) => <Text key={type} onPress={() => !savedMeal && setMealType(type)} style={[styles.type, mealType === type && styles.typeActive]}>{type}</Text>)}</View>
      <Card>
        <View style={styles.totalTop}><View><Text style={styles.totalLabel}>총 섭취 칼로리</Text><Text style={styles.total}>{total.calories} <Text style={styles.unit}>kcal</Text></Text></View><View style={styles.itemCount}><Text style={styles.itemCountValue}>{analysis.items.length}</Text><Text style={styles.itemCountLabel}>인식 항목</Text></View></View>
        <View style={styles.macroList}><MacroBar label="탄수화물" value={total.carbs} goal={100} color={palette.leaf} /><MacroBar label="단백질" value={total.protein} goal={60} color={palette.yellow} /><MacroBar label="지방" value={total.fat} goal={30} color={palette.tomato} /></View>
      </Card>
      <SectionTitle title="인식한 음식" action={!savedMeal && !editing ? '항목·영양값 수정' : undefined} onAction={beginEditing} />
      {editing ? (
        <View style={styles.editWrap}>
          <Field label="식단 이름" value={editFoodName} onChangeText={setEditFoodName} placeholder="예: 현미 닭가슴살 플레이트" />
          {editItems.map((item, index) => (
            <View key={item.itemId} style={styles.editItem}>
              <View style={styles.editItemHeader}><Text style={styles.editItemTitle}>음식 항목 {index + 1}</Text><Pressable onPress={() => removeEditItem(index)}><Text style={styles.removeItem}>삭제</Text></Pressable></View>
              <Field label="음식명" value={item.name} onChangeText={(value) => updateEditItem(index, 'name', value)} placeholder="음식 이름" />
              <View style={styles.editRow}><View style={styles.editFlex}><Field label="무게 (g)" value={item.weightGram} onChangeText={(value) => updateEditItem(index, 'weightGram', value)} keyboardType="decimal-pad" /></View><View style={styles.editFlex}><Field label="열량 (kcal)" value={item.calorie} onChangeText={(value) => updateEditItem(index, 'calorie', value)} keyboardType="decimal-pad" /></View></View>
              <View style={styles.editRow}><View style={styles.editFlex}><Field label="탄수화물 (g)" value={item.carb} onChangeText={(value) => updateEditItem(index, 'carb', value)} keyboardType="decimal-pad" /></View><View style={styles.editFlex}><Field label="단백질 (g)" value={item.protein} onChangeText={(value) => updateEditItem(index, 'protein', value)} keyboardType="decimal-pad" /></View><View style={styles.editFlex}><Field label="지방 (g)" value={item.fat} onChangeText={(value) => updateEditItem(index, 'fat', value)} keyboardType="decimal-pad" /></View></View>
            </View>
          ))}
          <PrimaryButton title="＋ 음식 항목 추가" variant="secondary" onPress={addEditItem} />
          <View style={styles.editActions}><View style={styles.editFlex}><PrimaryButton title="취소" variant="ghost" onPress={() => setEditing(false)} /></View><View style={styles.editFlex}><PrimaryButton title="수정값 반영" onPress={applyEdits} /></View></View>
        </View>
      ) : (
        <Card style={styles.foodList}>
          {analysis.items.map((item, index) => <View key={item.itemId} style={[styles.foodRow, index > 0 && styles.foodBorder]}><View style={styles.foodInitial}><Text style={styles.foodInitialText}>{item.name.slice(0, 1)}</Text></View><View style={styles.foodInfo}><Text style={styles.foodName}>{item.name}</Text><Text style={styles.foodAmount}>{item.weightGram ? `${item.weightGram}g` : '저장된 기록'}</Text><NutrientChips carbs={item.carb} protein={item.protein} fat={item.fat} /></View><Text style={styles.foodKcal}>{item.calorie}{`\n`}<Text style={styles.foodUnit}>kcal</Text></Text></View>)}
        </Card>
      )}
      {!savedMeal ? <View style={styles.notice}><Text style={styles.noticeMark}>추정값</Text><Text style={styles.noticeText}>사진에 보이는 음식과 양을 바탕으로 계산한 추정값이며 실제와 다를 수 있어요. 저장 전 항목과 영양값을 확인·수정해 주세요.</Text></View> : null}
      {savedMeal ? <PrimaryButton title="식단 목록으로" variant="secondary" onPress={() => router.push('/history')} /> : <PrimaryButton title="이 내용으로 저장" loading={saving} disabled={editing} onPress={save} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { minHeight: 460, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl },
  loadingTitle: { ...font.heading, color: palette.ink, marginTop: spacing.sm },
  loadingText: { ...font.body, color: palette.muted, textAlign: 'center' },
  errorIcon: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', textAlign: 'center', lineHeight: 45, backgroundColor: palette.tomatoSoft, color: palette.tomato, fontSize: 24, fontWeight: '900' },
  errorButtons: { width: '100%', gap: spacing.sm, marginTop: spacing.md },
  imageWrap: { height: 250, borderRadius: radii.xl, backgroundColor: '#EDE2D0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  foodHero: { fontSize: 120 },
  resultBadge: { position: 'absolute', bottom: 13, left: 13, backgroundColor: 'rgba(36,35,31,.85)', borderRadius: radii.pill, paddingHorizontal: 11, paddingVertical: 7 },
  resultBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  typeRow: { flexDirection: 'row', gap: spacing.xs },
  type: { flex: 1, textAlign: 'center', paddingVertical: 10, borderRadius: radii.pill, color: palette.muted, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, overflow: 'hidden', fontSize: 12, fontWeight: '700' },
  typeActive: { color: '#fff', backgroundColor: palette.ink, borderColor: palette.ink },
  totalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: palette.muted, fontSize: 11 },
  total: { color: palette.ink, fontSize: 30, fontWeight: '900', marginTop: 3 },
  unit: { color: palette.muted, fontSize: 12 },
  itemCount: { alignItems: 'center', backgroundColor: palette.leafSoft, borderRadius: radii.md, padding: 10, minWidth: 60 },
  itemCountValue: { color: palette.leaf, fontWeight: '900' },
  itemCountLabel: { color: palette.muted, fontSize: 8 },
  macroList: { gap: 12, marginTop: spacing.md },
  foodList: { paddingVertical: 3 },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 12 },
  foodBorder: { borderTopWidth: 1, borderTopColor: palette.line },
  foodInitial: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceWarm, borderRadius: radii.md },
  foodInitialText: { color: palette.tomatoDark, fontSize: 17, fontWeight: '900' },
  foodInfo: { flex: 1, gap: 3 },
  foodName: { color: palette.ink, fontWeight: '800', fontSize: 13 },
  foodAmount: { color: palette.muted, fontSize: 10 },
  foodKcal: { color: palette.ink, textAlign: 'right', fontWeight: '900' },
  foodUnit: { color: palette.muted, fontSize: 9 },
  editWrap: { gap: spacing.md },
  editItem: { backgroundColor: palette.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.line, padding: spacing.md, gap: spacing.sm },
  editItemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  editItemTitle: { color: palette.ink, fontSize: 13, fontWeight: '900' },
  removeItem: { color: palette.tomato, fontSize: 11, fontWeight: '800', padding: spacing.xs },
  editRow: { flexDirection: 'row', gap: spacing.xs },
  editFlex: { flex: 1 },
  editActions: { flexDirection: 'row', gap: spacing.sm },
  notice: { flexDirection: 'row', backgroundColor: palette.yellowSoft, borderRadius: radii.md, padding: spacing.md, gap: spacing.sm, alignItems: 'center' },
  noticeMark: { color: '#6E5B34', fontSize: 10, fontWeight: '900' },
  noticeText: { ...font.caption, color: '#6E5B34', flex: 1 },
});
