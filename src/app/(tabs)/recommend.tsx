import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Field, Header, Icon, ListGroup, ListRow, Pill, PrimaryButton, Pressable, Screen, SectionTitle, Segmented } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { menuApi, userApi } from '@/services/bapmeokja-api';
import { MenuSummary, RecommendationCategory } from '@/types/api';

const demoCategories: Record<'outside' | 'home', RecommendationCategory[]> = {
  outside: [
    { categoryId: 'cat_005', categoryName: '간편식', reason: '가볍게 한 끼를 채우기 좋아요.', estimatedCost: 3800 },
    { categoryId: 'cat_002', categoryName: '샌드위치', reason: '남은 칼로리 안에서 균형을 맞추기 쉬워요.', estimatedCost: 5500 },
    { categoryId: 'cat_003', categoryName: '순두부', reason: '부담이 적고 따뜻하게 먹을 수 있어요.', estimatedCost: 9000 },
    { categoryId: 'cat_001', categoryName: '포케', reason: '부족한 단백질을 채우기 좋아요.', estimatedCost: 10900 },
  ],
  home: [
    { categoryId: 'hcat_001', categoryName: '두부 달걀 덮밥', reason: '냉장고 재료를 바로 활용할 수 있어요.', estimatedCost: 4800 },
    { categoryId: 'hcat_003', categoryName: '참치 두부전', reason: '남은 두부를 한 번에 사용할 수 있어요.', estimatedCost: 5200 },
    { categoryId: 'hcat_002', categoryName: '애호박 닭가슴살 볶음', reason: '단백질 목표를 채우기 좋은 조합이에요.', estimatedCost: 5900 },
  ],
};

const BUDGET_PRESETS = [5000, 10000];

export default function RecommendScreen() {
  const { fridgeItems, dashboard, profile } = useApp();
  const [mode, setMode] = useState<'outside' | 'home'>('outside');
  const [budget, setBudget] = useState(10000);
  const [summary, setSummary] = useState<MenuSummary | null>(null);
  const [categories, setCategories] = useState<RecommendationCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const demoSummary: MenuSummary = { date: dashboard.date, calorieRemaining: dashboard.calorieRemaining, calorieGoal: dashboard.calorieGoal, calorieConsumed: dashboard.calorieConsumed, carb: { percentage: dashboard.carb.percentage }, protein: { percentage: dashboard.protein.percentage }, fat: { percentage: dashboard.fat.percentage }, defaultBudget: { diningOut: profile.defaultDiningBudget ?? 10000, homeCooking: profile.defaultHomeBudget ?? 8000 } };
      const [nextSummary, nextCategories] = isMockMode
        ? await simulateRequest<[MenuSummary, RecommendationCategory[]]>([demoSummary, demoCategories[mode].filter((item) => (item.estimatedCost ?? 0) <= budget)], 450)
        : await Promise.all([menuApi.summary(), mode === 'outside' ? menuApi.diningOut(budget).then((result) => result.recommendedCategories) : menuApi.homeCooking(budget).then((result) => result.recommendedCategories)]);
      setSummary(nextSummary);
      // 예산을 넘는 메뉴는 보여 주지 않아 예산을 바꾸면 추천도 바뀌게 한다.
      setCategories(nextCategories.filter((item) => item.isWithinBudget !== false));
    } catch (error) {
      Alert.alert('추천을 불러오지 못했어요', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [budget, dashboard, mode, profile.defaultDiningBudget, profile.defaultHomeBudget]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openNearby = (category?: RecommendationCategory) => {
    const target = category ?? categories[0];
    Alert.alert('위치 정보 사용', '현재 위치는 주변 식당을 찾는 동안에만 사용합니다.', [
      { text: '취소', style: 'cancel' },
      { text: '동의하고 계속', onPress: async () => {
        try {
          if (!isMockMode) await userApi.setLocationConsent(true);
          router.push({ pathname: '/nearby', params: { categoryId: target?.categoryId ?? 'cat_001', categoryName: target?.categoryName ?? '맛집' } });
        } catch (error) { Alert.alert('위치 설정 실패', getErrorMessage(error)); }
      } },
    ]);
  };

  const isCustomBudget = !BUDGET_PRESETS.includes(budget);
  const applyCustomBudget = () => {
    const value = Number(customText.replaceAll(',', ''));
    if (!Number.isInteger(value) || value < 1000 || value > 1000000) return Alert.alert('예산을 확인해 주세요', '1,000원부터 1,000,000원까지 숫자로 입력해 주세요.');
    setBudget(value);
    setCustomOpen(false);
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
      {mode === 'home' ? (
        <View style={styles.linkCard}>
          <ListRow icon="package" tone="card" title={`내 냉장고 · ${fridgeItems.length}개`} subtitle={fridgeItems.length ? fridgeItems.map((item) => item.name).join(' · ') : '재료를 먼저 등록해 주세요'} onPress={() => router.push('/fridge')} />
        </View>
      ) : (
        <View style={styles.linkCard}>
          <ListRow icon="map-pin" tone="card" title="주변 식당 보기" subtitle="추천 메뉴를 파는 가까운 식당을 지도에서 찾아요" onPress={() => openNearby()} />
        </View>
      )}

      <View style={styles.budgetRow}>
        <Text style={styles.budgetLabel}>한 끼 예산</Text>
        <View style={styles.budgetPills}>
          {BUDGET_PRESETS.map((value) => <Pill key={value} label={value === 5000 ? '5천원' : '1만원'} active={budget === value} onPress={() => { setBudget(value); setCustomOpen(false); }} />)}
          <Pill label={isCustomBudget ? `${budget.toLocaleString()}원` : '직접 설정'} active={isCustomBudget || customOpen} onPress={() => { setCustomText(isCustomBudget ? String(budget) : ''); setCustomOpen((open) => !open); }} />
        </View>
      </View>
      {customOpen ? (
        <View style={styles.customRow}>
          <View style={styles.customField}><Field value={customText} onChangeText={setCustomText} placeholder="예산을 입력하세요 (원)" keyboardType="number-pad" returnKeyType="done" onSubmitEditing={applyCustomBudget} autoFocus /></View>
          <View style={styles.customButton}><PrimaryButton title="적용" onPress={applyCustomBudget} disabled={!customText.trim()} /></View>
        </View>
      ) : null}
      <SectionTitle title={mode === 'outside' ? '추천 외식 메뉴' : '추천 집밥 메뉴'} action="새로고침" onAction={load} />
      {loading ? <ActivityIndicator color={palette.tomato} /> : categories.length ? (
        <ListGroup>
          {categories.map((item, index) => (
            <View key={item.categoryId} style={styles.item}>
              <Pressable accessibilityRole="button" style={styles.itemBody} onPress={() => router.push({ pathname: '/recommendation-detail', params: { id: item.categoryId, mode } })}>
                <View style={[styles.rank, index === 0 && styles.rankFirst]}><Text style={[styles.rankText, index === 0 && styles.rankTextFirst]}>{index + 1}</Text></View>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{item.categoryName}</Text>
                  <Text style={styles.reason}>{item.reason}</Text>
                  <View style={styles.metaRow}>{item.estimatedCost ? <Text style={styles.meta}>예상 {item.estimatedCost.toLocaleString()}원</Text> : <Text style={styles.meta}>상세 메뉴 보기</Text>}</View>
                </View>
              </Pressable>
              {mode === 'outside'
                ? <Pressable accessibilityRole="button" accessibilityLabel={`${item.categoryName} 파는 식당 찾기`} hitSlop={6} style={styles.storeButton} onPress={() => openNearby(item)}><Icon name="map-pin" size={17} color={palette.tomato} /></Pressable>
                : <Icon name="chevron-right" size={18} color={palette.muted} />}
            </View>
          ))}
        </ListGroup>
      ) : <Card><EmptyState icon="search" title={`${budget.toLocaleString()}원에 맞는 메뉴가 없어요`} description="예산을 조금 올리거나 집밥 추천을 확인해 보세요." /></Card>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  item: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  storeButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  linkCard: { backgroundColor: palette.accentSoft, borderRadius: radii.lg, paddingHorizontal: 14, paddingVertical: 2 },
  rank: { width: 30, height: 30, borderRadius: 15, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  rankFirst: { backgroundColor: palette.accent },
  rankText: { color: palette.tomato, fontSize: 13, fontWeight: '600' },
  rankTextFirst: { color: palette.onAccent },
  budgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  customRow: { flexDirection: 'row', gap: spacing.sm },
  customField: { flex: 1 },
  customButton: { width: 80 },
  budgetLabel: { color: palette.ink, fontSize: 14, fontWeight: '500' },
  budgetPills: { flexDirection: 'row', gap: 6 },
  foodInfo: { flex: 1 },
  foodName: { color: palette.ink, fontSize: 16, fontWeight: '500', letterSpacing: -0.2 },
  reason: { color: palette.muted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  meta: { color: palette.tomato, fontSize: 13, fontWeight: '500' },
});
