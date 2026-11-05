import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Header, Icon, ListGroup, ListRow, Pill, PrimaryButton, Pressable, Screen, SectionTitle, Segmented } from '@/components/ui';
import { palette, spacing } from '@/constants/design';
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
  const [budget, setBudget] = useState(12000);
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

  const remaining = summary?.calorieRemaining ?? dashboard.calorieRemaining;
  const lowest = [
    { label: '탄수화물', value: summary?.carb.percentage ?? dashboard.carb.percentage },
    { label: '단백질', value: summary?.protein.percentage ?? dashboard.protein.percentage },
    { label: '지방', value: summary?.fat.percentage ?? dashboard.fat.percentage },
  ].sort((a, b) => a.value - b.value)[0];

  return (
    <Screen>
      <Header title="메뉴 추천" subtitle={`오늘 ${remaining.toLocaleString()} kcal 남았고, ${lowest.label}이 가장 부족해요`} />
      <Segmented value={mode} onChange={setMode} options={[{ value: 'outside', label: '외식' }, { value: 'home', label: '집밥' }]} />
      <View style={styles.budgetRow}>
        <Text style={styles.budgetLabel}>한 끼 예산</Text>
        <View style={styles.budgetPills}>{[8000, 12000, 16000].map((value) => <Pill key={value} label={value === 8000 ? '8천원' : `${value / 10000}만원`} active={budget === value} onPress={() => setBudget(value)} />)}</View>
      </View>
      <SectionTitle title={mode === 'outside' ? '추천 외식 종류' : '추천 집밥 메뉴'} action="새로고침" onAction={load} />
      {loading ? <ActivityIndicator color={palette.tomato} /> : categories.length ? (
        <ListGroup>
          {categories.map((item, index) => (
            <Pressable key={item.categoryId} accessibilityRole="button" style={[styles.item, item.isWithinBudget === false && styles.disabledItem]} disabled={item.isWithinBudget === false} onPress={() => router.push({ pathname: '/recommendation-detail', params: { id: item.categoryId, mode } })}>
              <View style={[styles.rank, index === 0 && styles.rankFirst]}><Text style={[styles.rankText, index === 0 && styles.rankTextFirst]}>{index + 1}</Text></View>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.categoryName}</Text>
                <Text style={styles.reason}>{item.reason}</Text>
                <View style={styles.metaRow}>{item.estimatedCost ? <Text style={styles.meta}>예상 {item.estimatedCost.toLocaleString()}원</Text> : <Text style={styles.meta}>상세 메뉴 보기</Text>}{item.isWithinBudget === false ? <Text style={styles.overBudget}>예산 초과</Text> : null}</View>
              </View>
              <Icon name="chevron-right" size={18} color={palette.muted} />
            </Pressable>
          ))}
        </ListGroup>
      ) : <Card><EmptyState icon="search" title="추천이 없어요" description="선택한 예산에 맞는 추천이 없습니다. 예산을 바꿔 보세요." /></Card>}
      <ListGroup>
        {mode === 'home'
          ? <ListRow icon="package" tone="accent" title={`내 냉장고 · ${fridgeItems.length}개`} subtitle={fridgeItems.length ? fridgeItems.map((item) => item.name).join(' · ') : '재료를 먼저 등록해 주세요'} onPress={() => router.push('/fridge')} />
          : <ListRow icon="map-pin" tone="accent" title="주변 식당 보기" subtitle="위치 동의 후 가까운 매장을 찾아요" onPress={openNearby} />}
      </ListGroup>
      {mode === 'home' ? <PrimaryButton title="남은 재료로 다시 추천" variant="secondary" onPress={leftover} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  disabledItem: { opacity: 0.4 },
  rank: { width: 30, height: 30, borderRadius: 15, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  rankFirst: { backgroundColor: palette.accent },
  rankText: { color: palette.tomato, fontSize: 13, fontWeight: '600' },
  rankTextFirst: { color: palette.onAccent },
  budgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  budgetLabel: { color: palette.ink, fontSize: 14, fontWeight: '500' },
  budgetPills: { flexDirection: 'row', gap: 6 },
  foodInfo: { flex: 1 },
  foodName: { color: palette.ink, fontSize: 16, fontWeight: '500', letterSpacing: -0.2 },
  reason: { color: palette.muted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  meta: { color: palette.tomato, fontSize: 13, fontWeight: '500' },
  overBudget: { color: palette.danger, fontSize: 13 },
});
