import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, Header, IconButton, MacroBar, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { goBack } from '@/services/navigation';
import { menuApi } from '@/services/bapmeokja-api';

type Detail = {
  id: string;
  name: string;
  imageUrl?: string;
  calorie: number;
  carb: number;
  protein: number;
  fat: number;
  price?: number;
  cookingTime?: number;
  difficulty?: string;
  ingredients: { name: string; amount: string; alternatives?: { name: string; reason: string }[] }[];
  steps?: { stepNo: number; description: string }[];
};

const demo: Record<'outside' | 'home', Detail> = {
  outside: { id: 'food_201', name: '닭가슴살 포케', calorie: 520, carb: 62, protein: 37, fat: 14, price: 10900, ingredients: [{ name: '현미밥', amount: '150g' }, { name: '닭가슴살', amount: '120g' }, { name: '채소', amount: '100g' }] },
  home: { id: 'rec_r_001', name: '두부 달걀 덮밥', calorie: 495, carb: 58, protein: 29, fat: 15, price: 4800, cookingTime: 20, difficulty: 'EASY', ingredients: [{ name: '두부', amount: '1/2모', alternatives: [{ name: '닭가슴살', reason: '단백질 함량이 비슷합니다.' }] }, { name: '달걀', amount: '2개' }, { name: '현미밥', amount: '150g' }], steps: [{ stepNo: 1, description: '두부의 물기를 빼고 한입 크기로 썰어 주세요.' }, { stepNo: 2, description: '팬에 두부를 굽고 달걀을 넣어 익혀요.' }, { stepNo: 3, description: '밥 위에 올리고 간장 소스를 가볍게 둘러 완성해요.' }] },
};

export default function RecommendationDetailScreen() {
  const { id = 'cat_001', mode = 'outside' } = useLocalSearchParams<{ id?: string; mode?: 'outside' | 'home' }>();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const request = async () => {
      if (isMockMode) return simulateRequest(demo[mode], 500);
      if (mode === 'home') {
        const list = await menuApi.recipes(id);
        if (!list.recipes.length) throw new Error('추천 레시피가 없습니다.');
        const recipe = await menuApi.recipe(list.recipes[0].recipeId);
        return { id: recipe.recipeId, name: recipe.name, imageUrl: recipe.imageUrl, calorie: recipe.calorie, carb: recipe.carb, protein: recipe.protein, fat: recipe.fat, price: recipe.estimatedCost, cookingTime: recipe.cookingTimeMinutes, difficulty: recipe.difficulty, ingredients: recipe.ingredients, steps: recipe.steps } satisfies Detail;
      }
      const list = await menuApi.diningItems(id);
      if (!list.items.length) throw new Error('추천 메뉴가 없습니다.');
      const item = await menuApi.diningItem(list.items[0].itemId);
      return { id: item.itemId, name: item.name, imageUrl: item.imageUrl, calorie: item.calorie, carb: item.carb, protein: item.protein, fat: item.fat, price: item.avgPrice, ingredients: item.ingredients.map((ingredient) => ({ name: ingredient.name, amount: `${ingredient.weightGram}g` })) } satisfies Detail;
    };
    request().then((result) => mounted && setDetail(result)).catch((requestError) => mounted && setError(getErrorMessage(requestError))).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id, mode]);

  if (loading) return <Screen><Header title={mode === 'home' ? '집밥 레시피' : '메뉴 상세'} left={<IconButton label="←" onPress={() => goBack()} />} /><View style={styles.center}><ActivityIndicator color={palette.tomato} /><Text style={styles.centerText}>추천 정보를 불러오고 있어요</Text></View></Screen>;
  if (!detail) return <Screen><Header title="추천 상세" left={<IconButton label="←" onPress={() => goBack()} />} /><View style={styles.center}><Text style={styles.centerTitle}>정보를 불러오지 못했어요</Text><Text style={styles.centerText}>{error}</Text><PrimaryButton title="돌아가기" onPress={() => goBack()} /></View></Screen>;

  const isHome = mode === 'home';
  const difficulty = detail.difficulty === 'EASY' ? '쉬움' : detail.difficulty === 'MEDIUM' ? '보통' : detail.difficulty === 'HARD' ? '어려움' : '';
  return <Screen><Header title={isHome ? '집밥 레시피' : '메뉴 상세'} left={<IconButton label="←" onPress={() => goBack()} />} />
    {detail.imageUrl ? <View style={styles.hero}><Image source={{ uri: detail.imageUrl }} style={styles.image} contentFit="cover" /></View> : null}
    <View style={styles.titleWrap}><Text style={styles.kind}>{isHome ? `${detail.cookingTime ?? 0}분 · ${difficulty}` : '외식 추천 메뉴'}</Text><Text style={styles.title}>{detail.name}</Text></View>
    <Card><View style={styles.calorieTop}><View><Text style={styles.cardLabel}>영양 정보</Text><Text style={styles.calories}>{detail.calorie} <Text style={styles.unit}>kcal</Text></Text></View>{detail.price ? <View style={styles.price}><Text style={styles.priceLabel}>{isHome ? '예상 재료비' : '평균 가격'}</Text><Text style={styles.priceValue}>{detail.price.toLocaleString()}원</Text></View> : null}</View><View style={styles.macros}><MacroBar label="탄수화물" value={detail.carb} goal={100} color={palette.leafFill} /><MacroBar label="단백질" value={detail.protein} goal={60} color={palette.yellow} /><MacroBar label="지방" value={detail.fat} goal={30} color={palette.tomatoFill} /></View></Card>
    <SectionTitle title="재료" />
    <Card>{detail.ingredients.map((ingredient, index) => <View key={`${ingredient.name}-${index}`} style={[styles.ingredient, index > 0 && styles.ingredientBorder]}><View><Text style={styles.ingredientName}>{ingredient.name}</Text><Text style={styles.ingredientAmount}>{ingredient.amount}</Text></View>{ingredient.alternatives?.length ? <Text style={styles.alternative}>대체: {ingredient.alternatives[0].name}</Text> : null}</View>)}</Card>
    {detail.steps?.length ? <><SectionTitle title="조리 순서" />{detail.steps.map((step) => <View key={step.stepNo} style={styles.step}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{step.stepNo}</Text></View><Text style={styles.stepText}>{step.description}</Text></View>)}</> : null}
    {isHome ? <PrimaryButton title="장보기 목록 확인" variant="secondary" onPress={() => router.push({ pathname: '/shopping-list', params: { recipeId: detail.id } } as never)} /> : <PrimaryButton title="주변 매장 보기" onPress={() => router.push({ pathname: '/nearby', params: { categoryId: id } })} />}
  </Screen>;
}

const styles = StyleSheet.create({
  center: { minHeight: 430, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl },
  centerTitle: { ...font.heading, color: palette.ink },
  centerText: { ...font.body, color: palette.muted, textAlign: 'center' },
  hero: { height: 200, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: palette.sunken },
  image: { width: '100%', height: '100%' },
  titleWrap: { gap: 4 },
  kind: { color: palette.tomato, fontSize: 13, fontWeight: '500' },
  title: { ...font.title, color: palette.ink },
  calorieTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { color: palette.muted, fontSize: 12 },
  calories: { color: palette.ink, fontSize: 28, fontWeight: '600', marginTop: 3 },
  unit: { color: palette.muted, fontSize: 12 },
  price: { alignItems: 'flex-end' },
  priceLabel: { color: palette.muted, fontSize: 12 },
  priceValue: { color: palette.leaf, fontSize: 16, fontWeight: '600', marginTop: 4 },
  macros: { gap: 12, marginTop: spacing.md },
  ingredient: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ingredientBorder: {},
  ingredientName: { color: palette.ink, fontWeight: '500' },
  ingredientAmount: { color: palette.muted, fontSize: 12, marginTop: 3 },
  alternative: { color: palette.leaf, fontSize: 12, fontWeight: '500' },
  step: { flexDirection: 'row', gap: spacing.md, backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.md, alignItems: 'center', ...shadow },
  stepNumber: { width: 30, height: 30, borderRadius: 15, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: palette.tomato, fontWeight: '600' },
  stepText: { ...font.body, color: palette.ink, flex: 1 },
});
