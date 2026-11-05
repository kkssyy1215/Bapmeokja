import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, IconButton, ListGroup, ListRow, MacroBar, MealRow, PrimaryButton, Ring, Screen, SectionTitle } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

const tomatoCharacters = {
  HUNGRY: require('../../../assets/characters/tomato-hungry.png'),
  NORMAL: require('../../../assets/characters/tomato-balanced.png'),
  OVEREATEN: require('../../../assets/characters/tomato-full.png'),
};

export default function HomeScreen() {
  const { profile, meals, dashboard, refreshDashboard, apiMode, lastError } = useApp();
  useFocusEffect(useCallback(() => {
    refreshDashboard().catch(() => undefined);
  }, [refreshDashboard]));
  const today = meals.filter((meal) => new Date(meal.eatenAt).toDateString() === new Date().toDateString());
  const percent = Math.round((dashboard.calorieConsumed / dashboard.calorieGoal) * 100);
  const over = dashboard.calorieExceeded > 0;
  const status = dashboard.tomatoStatus === 'OVEREATEN'
    ? { image: tomatoCharacters.OVEREATEN, title: '배부른 토마토', message: `오늘 목표보다 ${dashboard.calorieExceeded.toLocaleString()} kcal 더 먹었어요. 다음 끼니는 가볍게 골라봐요.`, accessibilityLabel: '배를 감싸고 앉아 있는 배부른 토마토 캐릭터' }
    : dashboard.tomatoStatus === 'HUNGRY'
      ? { image: tomatoCharacters.HUNGRY, title: '꼬르륵 토마토', message: '아직 섭취량이 부족해요. 다음 끼니를 든든하게 챙겨주세요.', accessibilityLabel: '배를 감싸고 있는 배고픈 토마토 캐릭터' }
      : { image: tomatoCharacters.NORMAL, title: '균형 토마토', message: '오늘 목표 범위에 잘 맞춰가고 있어요. 지금 리듬을 이어가요.', accessibilityLabel: '엄지를 들고 웃는 균형 잡힌 토마토 캐릭터' };
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '좋은 저녁이에요';
  const dateLabel = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  const proteinLeft = Math.max(0, dashboard.protein.goalGram - dashboard.protein.consumedGram);

  return (
    <Screen>
      <View style={styles.top}>
        <View style={styles.flex}>
          <Text style={styles.hello}>{greeting}{apiMode === 'mock' ? ' · 시연 데이터' : ''}</Text>
          <Text style={styles.name} numberOfLines={1}>{profile.nickname}</Text>
        </View>
        <IconButton label="⚙" onPress={() => router.push('/settings')} accessibilityLabel="설정" />
      </View>

      <View style={styles.statusCard}>
        <View style={styles.flex}>
          <Text style={styles.date}>{dateLabel}</Text>
          <Text style={styles.statusTitle} numberOfLines={1}>{profile.nickname}의 {status.title}</Text>
          <Text style={styles.statusMessage}>{status.message}</Text>
        </View>
        <Image source={status.image} style={styles.character} contentFit="contain" transition={160} accessibilityLabel={status.accessibilityLabel} />
      </View>

      <Card>
        <View style={styles.summary}>
          <View style={styles.flex}>
            <Text style={styles.label}>오늘 섭취</Text>
            <View style={styles.calorieRow}>
              <Text style={styles.calories}>{dashboard.calorieConsumed.toLocaleString()}</Text>
              <Text style={styles.goal}> / {dashboard.calorieGoal.toLocaleString()} kcal</Text>
            </View>
            <Text style={[styles.remaining, over && styles.remainingOver]}>{over ? `${dashboard.calorieExceeded.toLocaleString()} kcal 초과` : `${dashboard.calorieRemaining.toLocaleString()} kcal 남았어요`}</Text>
          </View>
          <Ring percent={percent} size={76} stroke={7}>
            <Text style={styles.ringValue}>{percent}%</Text>
          </Ring>
        </View>
        <View style={styles.macros}>
          <MacroBar label="탄수화물" value={dashboard.carb.consumedGram} goal={dashboard.carb.goalGram} color={palette.leafFill} />
          <MacroBar label="단백질" value={dashboard.protein.consumedGram} goal={dashboard.protein.goalGram} color={palette.yellow} />
          <MacroBar label="지방" value={dashboard.fat.consumedGram} goal={dashboard.fat.goalGram} color={palette.tomatoFill} />
        </View>
      </Card>

      <PrimaryButton title="식단 기록하기" icon="camera" onPress={() => router.push('/(tabs)/records')} />

      <ListGroup>
        <ListRow icon="zap" tone="accent" title="오늘의 식단 피드백 보기" subtitle={today.length ? `단백질 ${proteinLeft}g을 더 채우면 좋아요` : '식사를 기록하면 분석해 드려요'} onPress={() => router.push('/ai-feedback')} />
      </ListGroup>

      <SectionTitle title="오늘의 식사" action="전체 보기" onAction={() => router.push('/history')} />
      {today.length ? (
        <ListGroup>
          {today.map((meal) => <MealRow key={meal.id} meal={meal} onPress={() => router.push({ pathname: '/meal-analysis', params: { saved: '1', id: meal.id } })} />)}
        </ListGroup>
      ) : <Card><EmptyState icon="edit-3" title="아직 기록이 없어요" description="첫 식사를 기록하고 토마토를 깨워 보세요." /></Card>}
      {lastError ? <Text style={styles.syncError}>{lastError}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, paddingBottom: 6, paddingHorizontal: 4 },
  hello: { color: palette.muted, fontSize: 14 },
  name: { color: palette.ink, fontSize: 28, lineHeight: 35, fontWeight: '600', letterSpacing: -0.6, marginTop: 1 },
  statusCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: palette.accentSoft, borderRadius: radii.lg, paddingVertical: 14, paddingLeft: 18, paddingRight: 12 },
  date: { color: palette.tomato, fontSize: 12, fontWeight: '500' },
  statusTitle: { color: palette.ink, fontSize: 17, lineHeight: 23, fontWeight: '600', letterSpacing: -0.3, marginTop: 6 },
  statusMessage: { color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 4 },
  character: { width: 80, height: 86 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { color: palette.muted, fontSize: 13 },
  calorieRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  calories: { fontSize: 36, lineHeight: 43, fontWeight: '600', letterSpacing: -0.9, color: palette.ink },
  goal: { color: palette.muted, fontSize: 13 },
  remaining: { color: palette.tomato, fontSize: 13, fontWeight: '500', marginTop: 2 },
  remainingOver: { color: palette.danger },
  ringValue: { color: palette.tomato, fontSize: 16, fontWeight: '600', letterSpacing: -0.3 },
  macros: { gap: 14, marginTop: 18 },
  syncError: { color: palette.danger, fontSize: 12, textAlign: 'center' },
});
