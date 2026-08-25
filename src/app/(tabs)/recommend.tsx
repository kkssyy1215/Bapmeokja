import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Header, MacroBar, Pill, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { menuApi, userApi } from '@/services/bapmeokja-api';
import { MenuSummary, RecommendationCategory } from '@/types/api';

const demoCategories: Record<'outside' | 'home', RecommendationCategory[]> = {
  outside: [
    { categoryId: 'cat_001', categoryName: '포케', reason: '부족한 단백질을 채우기 좋아요.' },
    { categoryId: 'cat_002', categoryName: '샌드위치', reason: '남은 칼로리 안에서 균형을 맞추기 쉬워요.' },
    { categoryId: 'cat_003', categoryName: '순두부', reason: '부담이 적고 따뜻하게 먹을 수 있어요.' },
  ],
  home: [
    { categoryId: 'hcat_001', categoryName: '두부 달걀 덮밥', reason: '냉장고 재료를 바로 활용할 수 있어요.', estimatedCost: 4800, isWithinBudget: true },
    { categoryId: 'hcat_002', categoryName: '애호박 닭가슴살 볶음', reason: '단백질 목표를 채우기 좋은 조합이에요.', estimatedCost: 5900, isWithinBudget: true },
    { categoryId: 'hcat_003', categoryName: '참치 두부전', reason: '남은 두부를 한 번에 사용할 수 있어요.', estimatedCost: 5200, isWithinBudget: true },
  ],
};

export default function RecommendScreen() {
  const { fridgeItems, dashboard, profile } = useApp();
  const [mode, setMode] = useState<'outside' | 'home'>('outside');
  const [budget, setBudget] = useState(10000);
  const [summary, setSummary] = useState<MenuSummary | null>(null);
  const [categories, setCategories] = useState<RecommendationCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const demoSummary: MenuSummary = { date: dashboard.date, calorieRemaining: dashboard.calorieRemaining, calorieGoal: dashboard.calorieGoal, calorieConsumed: dashboard.calorieConsumed, carb: { percentage: dashboard.carb.percentage }, protein: { percentage: dashboard.protein.percentage }, fat: { percentage: dashboard.fat.percentage }, defaultBudget: { diningOut: profile.defaultDiningBudget ?? 10000, homeCooking: profile.defaultHomeBudget ?? 8000 } };
      const [nextSummary, nextCategories] = isMockMode
        ? await simulateRequest<[MenuSummary, RecommendationCategory[]]>([demoSummary, demoCategories[mode]], 450)
        : await Promise.all([menuApi.summary(), mode === 'outside' ? menuApi.diningOut(budget).then((result) => result.recommendedCategories) : menuApi.homeCooking(budget).then((result) => result.recommendedCategories)]);
      setSummary(nextSummary);
      setCategories(nextCategories);
    } catch (error) {
      Alert.alert('추천을 불러오지 못했어요', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [budget, dashboard, mode, profile.defaultDiningBudget, profile.defaultHomeBudget]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openNearby = () => {
    Alert.alert('위치 정보 사용', '현재 위치는 주변 식당을 찾는 동안에만 사용합니다.', [
      { text: '취소', style: 'cancel' },
      { text: '동의하고 계속', onPress: async () => {
        try {
          if (!isMockMode) await userApi.setLocationConsent(true);
          router.push({ pathname: '/nearby', params: { categoryId: categories[0]?.categoryId ?? 'cat_001' } });
        } catch (error) { Alert.alert('위치 설정 실패', getErrorMessage(error)); }
      } },
    ]);
  };

  const leftover = async () => {
    if (!fridgeItems.length) return router.push('/fridge');
    setLoading(true);
    try {
      const result = isMockMode ? await simulateRequest({ categoryName: '남은 재료 추천', recipes: [] }) : await menuApi.leftover();
      Alert.alert('추천을 새로 만들었어요', result.recipes.length ? `${result.recipes.length}개의 레시피를 찾았습니다.` : '냉장고 재료에 맞춰 추천 순서를 바꿨어요.');
      await load();
    } catch (error) { Alert.alert('추천을 만들지 못했어요', getErrorMessage(error)); }
    finally { setLoading(false); }
  };

  return (
    <Screen>
      <Header title="메뉴 추천" subtitle="오늘 섭취량과 예산을 기준으로 골랐어요" />
      <Card style={styles.summary}>
        <View style={styles.summaryTop}><View><Text style={styles.summaryLabel}>오늘 남은 칼로리</Text><Text style={styles.summaryValue}>{(summary?.calorieRemaining ?? dashboard.calorieRemaining).toLocaleString()} <Text style={styles.summaryUnit}>kcal</Text></Text></View><Text style={styles.summaryDate}>{summary?.date ?? dashboard.date}</Text></View>
        <View style={styles.macroList}><MacroBar dark label="탄수화물" value={summary?.carb.percentage ?? dashboard.carb.percentage} goal={100} color={palette.leaf} unit="%" /><MacroBar dark label="단백질" value={summary?.protein.percentage ?? dashboard.protein.percentage} goal={100} color={palette.yellow} unit="%" /><MacroBar dark label="지방" value={summary?.fat.percentage ?? dashboard.fat.percentage} goal={100} color={palette.tomato} unit="%" /></View>
      </Card>
      <View style={styles.modeSwitch}><Pressable style={[styles.mode, mode === 'outside' && styles.modeActive]} onPress={() => setMode('outside')}><Text style={[styles.modeText, mode === 'outside' && styles.modeTextActive]}>외식</Text></Pressable><Pressable style={[styles.mode, mode === 'home' && styles.modeActive]} onPress={() => setMode('home')}><Text style={[styles.modeText, mode === 'home' && styles.modeTextActive]}>집밥</Text></Pressable></View>
      <View style={styles.budgetRow}><Text style={styles.budgetLabel}>한 끼 예산</Text><View style={styles.budgetPills}>{[8000, 12000, 16000].map((value) => <Pill key={value} label={value === 8000 ? '8천원' : `${value / 10000}만원`} active={budget === value} onPress={() => setBudget(value)} />)}</View></View>
      {mode === 'home' ? <Pressable style={styles.fridgeStrip} onPress={() => router.push('/fridge')}><View><Text style={styles.stripTitle}>내 냉장고 · {fridgeItems.length}개</Text><Text numberOfLines={1} style={styles.stripSub}>{fridgeItems.length ? fridgeItems.map((item) => item.name).join(' · ') : '재료를 먼저 등록해 주세요'}</Text></View><Text style={styles.chevron}>›</Text></Pressable> : <Pressable style={styles.locationStrip} onPress={openNearby}><View><Text style={styles.stripTitle}>주변 식당 보기</Text><Text style={styles.stripSub}>위치 동의 후 가까운 매장을 찾아요</Text></View><Text style={styles.chevron}>›</Text></Pressable>}
      <SectionTitle title={mode === 'outside' ? '추천 외식 종류' : '추천 집밥 메뉴'} action="다시 불러오기" onAction={load} />
      {loading ? <ActivityIndicator color={palette.tomato} /> : categories.length ? categories.map((item, index) => (
        <Pressable key={item.categoryId} style={[styles.recommendCard, item.isWithinBudget === false && styles.disabledCard]} disabled={item.isWithinBudget === false} onPress={() => router.push({ pathname: '/recommendation-detail', params: { id: item.categoryId, mode } })}>
          <View style={[styles.rank, index === 0 && styles.rankFirst]}><Text style={styles.rankText}>{index + 1}</Text></View>
          <View style={styles.categoryInitial}><Text style={styles.categoryInitialText}>{item.categoryName.slice(0, 1)}</Text></View>
          <View style={styles.foodInfo}><Text style={styles.reason}>{item.reason}</Text><Text style={styles.foodName}>{item.categoryName}</Text><View style={styles.metaRow}>{item.estimatedCost ? <Text style={styles.price}>예상 {item.estimatedCost.toLocaleString()}원</Text> : <Text style={styles.meta}>상세 메뉴 보기</Text>}{item.isWithinBudget === false ? <Text style={styles.overBudget}>예산 초과</Text> : null}</View></View><Text style={styles.chevron}>›</Text>
        </Pressable>
      )) : <Card><Text style={styles.noResult}>선택한 예산에 맞는 추천이 없습니다.</Text></Card>}
      <PrimaryButton title={mode === 'home' ? '남은 재료로 다시 추천' : '주변 식당 확인'} variant="secondary" onPress={mode === 'home' ? leftover : openNearby} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: palette.ink },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  summaryLabel: { color: '#C6C1B8', fontSize: 11 },
  summaryValue: { color: '#fff', fontSize: 29, fontWeight: '900', marginTop: 3 },
  summaryUnit: { color: '#C6C1B8', fontSize: 12 },
  summaryDate: { color: '#C6C1B8', fontSize: 10 },
  macroList: { marginTop: spacing.md, gap: 12 },
  modeSwitch: { flexDirection: 'row', backgroundColor: '#EDE9E1', borderRadius: radii.lg, padding: 4 },
  mode: { flex: 1, minHeight: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  modeActive: { backgroundColor: palette.surface, ...shadow },
  modeText: { color: palette.muted, fontWeight: '800', fontSize: 13 },
  modeTextActive: { color: palette.ink },
  budgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  budgetLabel: { color: palette.ink, fontSize: 13, fontWeight: '800' },
  budgetPills: { flexDirection: 'row', gap: spacing.xs },
  locationStrip: { backgroundColor: palette.blueSoft, borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
  fridgeStrip: { backgroundColor: palette.leafSoft, borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center' },
  stripTitle: { color: palette.ink, fontSize: 13, fontWeight: '800' },
  stripSub: { color: palette.muted, fontSize: 10, marginTop: 3, maxWidth: 300 },
  chevron: { marginLeft: 'auto', color: palette.muted, fontSize: 26 },
  recommendCard: { minHeight: 112, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.sm, borderWidth: 1, borderColor: palette.line },
  disabledCard: { opacity: 0.5 },
  rank: { width: 25, height: 25, borderRadius: 13, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center' },
  rankFirst: { backgroundColor: palette.tomato },
  rankText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  categoryInitial: { width: 70, height: 76, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceWarm },
  categoryInitialText: { color: palette.tomatoDark, fontSize: 24, fontWeight: '900' },
  foodInfo: { flex: 1 },
  reason: { color: palette.muted, fontSize: 10, lineHeight: 15 },
  foodName: { ...font.subheading, color: palette.ink, marginTop: 5 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 9 },
  meta: { color: palette.leaf, fontSize: 10, fontWeight: '800' },
  price: { color: palette.leaf, fontSize: 10, fontWeight: '800' },
  overBudget: { color: palette.tomato, fontSize: 10, fontWeight: '800' },
  noResult: { ...font.body, color: palette.muted, textAlign: 'center' },
});
