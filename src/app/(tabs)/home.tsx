import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, IconButton, MacroBar, NutrientChips, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

export default function HomeScreen() {
  const { profile, meals } = useApp();
  const today = meals.filter((meal) => new Date(meal.eatenAt).toDateString() === new Date().toDateString());
  const total = today.reduce((sum, meal) => ({ calories: sum.calories + meal.calories, carbs: sum.carbs + meal.carbs, protein: sum.protein + meal.protein, fat: sum.fat + meal.fat }), { calories: 0, carbs: 0, protein: 0, fat: 0 });
  const percent = Math.min(100, Math.round((total.calories / profile.dailyCalories) * 100));
  const remaining = Math.max(0, profile.dailyCalories - total.calories);
  const status = percent > 105 ? { face: '😵', title: '조금 배부른 토마토', message: '오늘은 가벼운 간식으로 마무리해요.' } : percent > 55 ? { face: '😊', title: '기분 좋은 토마토', message: '아주 좋은 흐름이에요. 균형을 유지해요!' } : { face: '😋', title: '꼬르륵 토마토', message: '다음 끼니에는 단백질을 조금 더 챙겨요.' };

  return (
    <Screen>
      <View style={styles.top}><View><Text style={styles.hello}>좋은 오후예요,</Text><Text style={styles.name}>{profile.nickname} 🍚</Text></View><IconButton label="⚙" onPress={() => router.push('/settings')} accessibilityLabel="설정" /></View>
      <LinearGradient colors={['#FFE7D2', '#FFF5D9']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mascotCard}>
        <View style={styles.mascotCopy}><Text style={styles.mascotEyebrow}>오늘의 영양 토마토</Text><Text style={styles.mascotTitle}>{status.title}</Text><Text style={styles.mascotMessage}>{status.message}</Text><View style={styles.streak}><Text style={styles.streakText}>🔥 7일 연속 기록 중</Text></View></View>
        <View style={styles.mascotWrap}><Text style={styles.mascot}>🍅</Text><Text style={styles.face}>{status.face}</Text></View>
      </LinearGradient>
      <Card>
        <View style={styles.summaryTop}>
          <View><Text style={styles.summaryLabel}>오늘 섭취</Text><View style={styles.calorieRow}><Text style={styles.calories}>{total.calories.toLocaleString()}</Text><Text style={styles.goal}> / {profile.dailyCalories.toLocaleString()} kcal</Text></View><Text style={styles.remaining}>{remaining.toLocaleString()} kcal 남았어요</Text></View>
          <View style={styles.ring}><Text style={styles.ringValue}>{percent}%</Text><Text style={styles.ringLabel}>달성</Text></View>
        </View>
        <View style={styles.macros}>
          <MacroBar label="탄수화물" value={total.carbs} goal={profile.carbGoal} color={palette.leaf} />
          <MacroBar label="단백질" value={total.protein} goal={profile.proteinGoal} color={palette.yellow} />
          <MacroBar label="지방" value={total.fat} goal={profile.fatGoal} color={palette.tomato} />
        </View>
      </Card>
      <View style={styles.quickGrid}>
        <Pressable style={[styles.quick, { backgroundColor: palette.tomatoSoft }]} onPress={() => router.push('/(tabs)/records')}><Text style={styles.quickEmoji}>📷</Text><Text style={styles.quickTitle}>식단 기록</Text><Text style={styles.quickSub}>사진으로 3초 분석</Text></Pressable>
        <Pressable style={[styles.quick, { backgroundColor: palette.leafSoft }]} onPress={() => router.push('/(tabs)/recommend')}><Text style={styles.quickEmoji}>✦</Text><Text style={styles.quickTitle}>메뉴 추천</Text><Text style={styles.quickSub}>남은 영양에 맞춤</Text></Pressable>
      </View>
      <SectionTitle title="오늘의 식사" action="전체 보기" onAction={() => router.push('/history')} />
      {today.length ? today.map((meal) => (
        <Pressable key={meal.id} style={styles.mealCard} onPress={() => router.push({ pathname: '/meal-analysis', params: { saved: '1', id: meal.id } })}>
          <View style={styles.mealEmoji}><Text style={styles.mealEmojiText}>{meal.emoji}</Text></View>
          <View style={styles.mealInfo}><View style={styles.mealTitleRow}><Text style={styles.mealType}>{meal.type}</Text><Text style={styles.mealTime}>{new Date(meal.eatenAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</Text></View><Text style={styles.mealName}>{meal.name}</Text><NutrientChips carbs={meal.carbs} protein={meal.protein} fat={meal.fat} /></View>
          <Text style={styles.mealKcal}>{meal.calories}{`\n`}<Text style={styles.mealUnit}>kcal</Text></Text>
        </Pressable>
      )) : <Card><Text style={styles.emptyText}>첫 식사를 기록하고 토마토를 깨워 보세요!</Text><PrimaryButton title="식단 기록하기" onPress={() => router.push('/(tabs)/records')} /></Card>}
      <Pressable style={styles.tip} onPress={() => router.push('/ai-feedback')}><View><Text style={styles.tipLabel}>AI 코치의 한마디</Text><Text style={styles.tipText}>단백질 {Math.max(0, profile.proteinGoal - total.protein)}g만 더 채우면 오늘 목표에 가까워져요.</Text></View><Text style={styles.tipArrow}>›</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 60 }, hello: { ...font.caption, color: palette.muted }, name: { ...font.title, color: palette.ink, fontSize: 25 },
  mascotCard: { minHeight: 190, borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', ...shadow }, mascotCopy: { flex: 1, zIndex: 2 }, mascotEyebrow: { color: palette.tomatoDark, fontSize: 12, fontWeight: '800' }, mascotTitle: { ...font.heading, color: palette.ink, marginTop: 6 }, mascotMessage: { ...font.caption, color: palette.muted, marginTop: 6, maxWidth: 200 }, streak: { alignSelf: 'flex-start', marginTop: spacing.md, backgroundColor: 'rgba(255,255,255,.7)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 }, streakText: { color: palette.ink, fontSize: 11, fontWeight: '800' }, mascotWrap: { width: 118, height: 125, alignItems: 'center', justifyContent: 'center' }, mascot: { fontSize: 94 }, face: { position: 'absolute', fontSize: 29, top: 46 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, summaryLabel: { color: palette.muted, fontSize: 12, fontWeight: '700' }, calorieRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }, calories: { fontSize: 27, fontWeight: '900', color: palette.ink }, goal: { color: palette.muted, fontSize: 12 }, remaining: { color: palette.tomato, fontSize: 12, fontWeight: '800', marginTop: 4 }, ring: { width: 74, height: 74, borderRadius: 37, borderWidth: 9, borderColor: palette.tomato, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.tomatoSoft }, ringValue: { color: palette.ink, fontSize: 17, fontWeight: '900' }, ringLabel: { color: palette.muted, fontSize: 9 }, macros: { marginTop: spacing.lg, gap: spacing.md },
  quickGrid: { flexDirection: 'row', gap: spacing.sm }, quick: { flex: 1, borderRadius: radii.lg, padding: spacing.md, minHeight: 125 }, quickEmoji: { fontSize: 29 }, quickTitle: { ...font.subheading, color: palette.ink, marginTop: spacing.sm }, quickSub: { ...font.caption, color: palette.muted, marginTop: 2 },
  mealCard: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: palette.line }, mealEmoji: { width: 62, height: 68, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceWarm }, mealEmojiText: { fontSize: 34 }, mealInfo: { flex: 1, gap: 5 }, mealTitleRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }, mealType: { color: palette.tomato, fontWeight: '800', fontSize: 11 }, mealTime: { color: palette.muted, fontSize: 10 }, mealName: { color: palette.ink, fontWeight: '800', fontSize: 14 }, mealKcal: { color: palette.ink, textAlign: 'right', fontSize: 15, fontWeight: '900' }, mealUnit: { fontSize: 9, color: palette.muted },
  emptyText: { ...font.body, color: palette.muted, textAlign: 'center', marginBottom: spacing.md },
  tip: { backgroundColor: palette.ink, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center' }, tipLabel: { color: '#FFB9AE', fontSize: 11, fontWeight: '800' }, tipText: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 4, maxWidth: 290 }, tipArrow: { color: '#fff', marginLeft: 'auto', fontSize: 28 },
});
