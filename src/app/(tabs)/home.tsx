import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, IconButton, MacroBar, NutrientChips, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

const tomatoCharacters = {
  HUNGRY: require('../../../assets/characters/tomato-hungry.png'),
  NORMAL: require('../../../assets/characters/tomato-balanced.png'),
  OVEREATEN: require('../../../assets/characters/tomato-full.png'),
};

export default function HomeScreen() {
  const { profile, meals, dashboard, refreshDashboard, apiMode, lastError } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  useFocusEffect(useCallback(() => {
    setRefreshing(true);
    refreshDashboard().catch(() => undefined).finally(() => setRefreshing(false));
  }, [refreshDashboard]));
  const today = meals.filter((meal) => new Date(meal.eatenAt).toDateString() === new Date().toDateString());
  const percent = Math.round((dashboard.calorieConsumed / dashboard.calorieGoal) * 100);
  const status = dashboard.tomatoStatus === 'OVEREATEN'
    ? { image: tomatoCharacters.OVEREATEN, colors: ['#FDE7DD', '#FFF1D9'] as const, title: `${profile.nickname}의\n배부른 토마토`, message: `오늘 목표보다 ${dashboard.calorieExceeded.toLocaleString()} kcal 더 먹었어요. 다음 끼니는 편안하게 골라봐요.`, accessibilityLabel: '배를 감싸고 앉아 있는 배부른 토마토 캐릭터' }
    : dashboard.tomatoStatus === 'HUNGRY'
      ? { image: tomatoCharacters.HUNGRY, colors: ['#FFE7D2', '#FFF5D9'] as const, title: `${profile.nickname}의\n꼬르륵 토마토`, message: '아직 섭취량이 부족해요. 다음 끼니를 든든하게 챙겨주세요.', accessibilityLabel: '배를 감싸고 있는 배고픈 토마토 캐릭터' }
      : { image: tomatoCharacters.NORMAL, colors: ['#E8F3DF', '#FFF4D9'] as const, title: `${profile.nickname}의\n균형 토마토`, message: '오늘 목표 범위에 잘 맞춰가고 있어요. 지금 리듬을 이어가요.', accessibilityLabel: '엄지를 들고 웃는 균형 잡힌 토마토 캐릭터' };
  const greeting = new Date().getHours() < 12 ? '좋은 아침이에요,' : new Date().getHours() < 18 ? '좋은 오후예요,' : '좋은 저녁이에요,';

  return (
    <Screen>
      <View style={styles.top}><View><Text style={styles.hello}>{greeting}</Text><Text style={styles.name}>{profile.nickname}</Text></View><IconButton label="⚙" onPress={() => router.push('/settings')} accessibilityLabel="설정" /></View>
      <LinearGradient colors={status.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.mascotCard}>
        <View style={styles.mascotCopy}><Text style={styles.mascotEyebrow}>{dashboard.date} · 오늘의 영양 상태</Text><Text style={styles.mascotTitle}>{status.title}</Text><Text style={styles.mascotMessage}>{status.message}</Text><View style={styles.sourceBadge}><Text style={styles.sourceBadgeText}>{refreshing ? '불러오는 중' : apiMode === 'server' ? '서버 데이터' : '시연 데이터'}</Text></View></View>
        <View style={styles.mascotWrap}><Image source={status.image} style={styles.mascotImage} contentFit="contain" transition={160} accessibilityLabel={status.accessibilityLabel} /></View>
      </LinearGradient>
      <Card>
        <View style={styles.summaryTop}>
          <View><Text style={styles.summaryLabel}>오늘 섭취</Text><View style={styles.calorieRow}><Text style={styles.calories}>{dashboard.calorieConsumed.toLocaleString()}</Text><Text style={styles.goal}> / {dashboard.calorieGoal.toLocaleString()} kcal</Text></View><Text style={styles.remaining}>{dashboard.calorieExceeded > 0 ? `${dashboard.calorieExceeded.toLocaleString()} kcal 초과` : `${dashboard.calorieRemaining.toLocaleString()} kcal 남았어요`}</Text></View>
          <View style={styles.ring}><Text style={styles.ringValue}>{percent}%</Text><Text style={styles.ringLabel}>달성</Text></View>
        </View>
        <View style={styles.macros}>
          <MacroBar label="탄수화물" value={dashboard.carb.consumedGram} goal={dashboard.carb.goalGram} color={palette.leaf} />
          <MacroBar label="단백질" value={dashboard.protein.consumedGram} goal={dashboard.protein.goalGram} color={palette.yellow} />
          <MacroBar label="지방" value={dashboard.fat.consumedGram} goal={dashboard.fat.goalGram} color={palette.tomato} />
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
      {lastError ? <Text style={styles.syncError}>{lastError}</Text> : null}
      <Pressable style={styles.tip} onPress={() => router.push('/ai-feedback')}><View><Text style={styles.tipLabel}>오늘의 식단 피드백</Text><Text style={styles.tipText}>단백질 {Math.max(0, dashboard.protein.goalGram - dashboard.protein.consumedGram)}g을 더 채우면 목표에 가까워져요.</Text></View><Text style={styles.tipArrow}>›</Text></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 60 }, hello: { ...font.caption, color: palette.muted }, name: { ...font.title, color: palette.ink, fontSize: 25 },
  mascotCard: { minHeight: 205, borderRadius: radii.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', ...shadow }, mascotCopy: { flex: 1, zIndex: 2 }, mascotEyebrow: { color: palette.tomatoDark, fontSize: 11, fontWeight: '800' }, mascotTitle: { ...font.heading, color: palette.ink, marginTop: 6 }, mascotMessage: { ...font.caption, color: palette.muted, marginTop: 6, maxWidth: 190 }, sourceBadge: { alignSelf: 'flex-start', marginTop: spacing.md, backgroundColor: 'rgba(255,255,255,.75)', borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 }, sourceBadgeText: { color: palette.ink, fontSize: 10, fontWeight: '800' }, mascotWrap: { width: 128, height: 148, alignItems: 'center', justifyContent: 'center' }, mascotImage: { width: '100%', height: '100%' },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, summaryLabel: { color: palette.muted, fontSize: 12, fontWeight: '700' }, calorieRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 }, calories: { fontSize: 27, fontWeight: '900', color: palette.ink }, goal: { color: palette.muted, fontSize: 12 }, remaining: { color: palette.tomato, fontSize: 12, fontWeight: '800', marginTop: 4 }, ring: { width: 74, height: 74, borderRadius: 37, borderWidth: 9, borderColor: palette.tomato, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.tomatoSoft }, ringValue: { color: palette.ink, fontSize: 17, fontWeight: '900' }, ringLabel: { color: palette.muted, fontSize: 9 }, macros: { marginTop: spacing.lg, gap: spacing.md },
  quickGrid: { flexDirection: 'row', gap: spacing.sm }, quick: { flex: 1, borderRadius: radii.lg, padding: spacing.md, minHeight: 125 }, quickEmoji: { fontSize: 29 }, quickTitle: { ...font.subheading, color: palette.ink, marginTop: spacing.sm }, quickSub: { ...font.caption, color: palette.muted, marginTop: 2 },
  mealCard: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: palette.line }, mealEmoji: { width: 62, height: 68, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceWarm }, mealEmojiText: { fontSize: 34 }, mealInfo: { flex: 1, gap: 5 }, mealTitleRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }, mealType: { color: palette.tomato, fontWeight: '800', fontSize: 11 }, mealTime: { color: palette.muted, fontSize: 10 }, mealName: { color: palette.ink, fontWeight: '800', fontSize: 14 }, mealKcal: { color: palette.ink, textAlign: 'right', fontSize: 15, fontWeight: '900' }, mealUnit: { fontSize: 9, color: palette.muted },
  emptyText: { ...font.body, color: palette.muted, textAlign: 'center', marginBottom: spacing.md },
  tip: { backgroundColor: palette.ink, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center' }, tipLabel: { color: '#FFB9AE', fontSize: 11, fontWeight: '800' }, tipText: { color: '#fff', fontSize: 13, fontWeight: '600', marginTop: 4, maxWidth: 290 }, tipArrow: { color: '#fff', marginLeft: 'auto', fontSize: 28 },
  syncError: { color: palette.danger, fontSize: 11, textAlign: 'center' },
});
