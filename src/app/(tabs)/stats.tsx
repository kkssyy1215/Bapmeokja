import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, Header, IconButton, ListGroup, ListRow, MacroBar, Screen, Segmented } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { isMockMode, simulateRequest } from '@/services/api';
import { statisticsApi } from '@/services/bapmeokja-api';
import { DailyStatistics, MonthlyStatistics, WeeklyStatistics } from '@/types/api';

type Period = 'daily' | 'weekly' | 'monthly';

function localDate() { return new Date().toLocaleDateString('en-CA'); }
function mondayOfCurrentWeek() { const date = new Date(); const day = date.getDay() || 7; date.setDate(date.getDate() - day + 1); return date.toLocaleDateString('en-CA'); }

export default function StatsScreen() {
  const { dashboard } = useApp();
  const [period, setPeriod] = useState<Period>('daily');
  const [daily, setDaily] = useState<DailyStatistics | null>(null);
  const [weekly, setWeekly] = useState<WeeklyStatistics | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const now = new Date();
    const request = period === 'daily'
      ? isMockMode ? simulateRequest<DailyStatistics>({ date: dashboard.date, calorieGoal: dashboard.calorieGoal, calorieConsumed: dashboard.calorieConsumed, caloriePercentage: Math.round((dashboard.calorieConsumed / dashboard.calorieGoal) * 100), carb: dashboard.carb, protein: dashboard.protein, fat: dashboard.fat }) : statisticsApi.daily(localDate())
      : period === 'weekly'
        ? isMockMode ? simulateRequest<WeeklyStatistics>({ startDate: mondayOfCurrentWeek(), endDate: localDate(), daily: [62, 78, 84, 71, 93, 68, Math.round((dashboard.calorieConsumed / dashboard.calorieGoal) * 100)].map((value, index) => ({ date: `day-${index}`, calorieConsumed: Math.round(dashboard.calorieGoal * value / 100), calorieGoal: dashboard.calorieGoal, carbPercentage: value, proteinPercentage: Math.max(40, value - 18), fatPercentage: Math.min(110, value + 8) })), weeklyAvgCalorie: 1760 }) : statisticsApi.weekly(mondayOfCurrentWeek())
        : isMockMode ? simulateRequest<MonthlyStatistics>({ year: now.getFullYear(), month: now.getMonth() + 1, daily: [70, 88, 76, 95, 61, 83, 72, 90, 79, 86].map((value, index) => ({ date: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`, calorieConsumed: Math.round(dashboard.calorieGoal * value / 100), calorieGoal: dashboard.calorieGoal })), monthlyAvgCalorie: 1790, monthlyAvgCarbPercentage: 82, monthlyAvgProteinPercentage: 66, monthlyAvgFatPercentage: 88 }) : statisticsApi.monthly(now.getFullYear(), now.getMonth() + 1);
    request.then((result) => {
      if (!mounted) return;
      if (period === 'daily') setDaily(result as DailyStatistics);
      if (period === 'weekly') setWeekly(result as WeeklyStatistics);
      if (period === 'monthly') setMonthly(result as MonthlyStatistics);
    }).catch(() => undefined).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [dashboard, period]);

  const chartValues = useMemo(() => {
    if (period === 'weekly' && weekly) return weekly.daily.map((day) => Math.round((day.calorieConsumed / day.calorieGoal) * 100));
    if (period === 'monthly' && monthly) return monthly.daily.slice(-10).map((day) => Math.round((day.calorieConsumed / day.calorieGoal) * 100));
    return [];
  }, [monthly, period, weekly]);

  const averageCalories = period === 'weekly' ? weekly?.weeklyAvgCalorie : monthly?.monthlyAvgCalorie;

  const changePeriod = (next: Period) => { if (next === period) return; setLoading(true); setPeriod(next); };
  const statusLabel = daily ? (daily.caloriePercentage > 100 ? '목표 초과' : daily.caloriePercentage < 80 ? '목표 미달' : '목표 범위') : '';

  return (
    <Screen>
      <Header title="영양 통계" subtitle={new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })} right={<IconButton label="▦" onPress={() => router.push('/history')} />} />
      <Segmented value={period} onChange={changePeriod} options={[{ value: 'daily', label: '일간' }, { value: 'weekly', label: '주간' }, { value: 'monthly', label: '월간' }]} />
      {loading ? <View style={styles.loading}><ActivityIndicator color={palette.tomato} /><Text style={styles.loadingText}>통계를 불러오고 있어요</Text></View> : null}
      {period === 'daily' && daily ? (
        <Card>
          <View style={styles.chartHeader}>
            <View><Text style={styles.cardLabel}>오늘 섭취 칼로리</Text><Text style={styles.big}>{daily.calorieConsumed.toLocaleString()} <Text style={styles.bigUnit}>/ {daily.calorieGoal.toLocaleString()} kcal</Text></Text></View>
            <Text style={styles.status}>{statusLabel}</Text>
          </View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, daily.caloriePercentage)}%` }]} /></View>
          <View style={styles.macroList}>
            <MacroBar label="탄수화물" value={daily.carb.consumedGram} goal={daily.carb.goalGram} color={palette.leafFill} />
            <MacroBar label="단백질" value={daily.protein.consumedGram} goal={daily.protein.goalGram} color={palette.yellow} />
            <MacroBar label="지방" value={daily.fat.consumedGram} goal={daily.fat.goalGram} color={palette.tomatoFill} />
          </View>
        </Card>
      ) : null}
      {period !== 'daily' && chartValues.length ? (
        <Card>
          <View style={styles.chartHeader}>
            <View><Text style={styles.cardLabel}>{period === 'weekly' ? '주간 평균 섭취' : '월간 평균 섭취'}</Text><Text style={styles.big}>{averageCalories?.toLocaleString()} <Text style={styles.bigUnit}>kcal</Text></Text></View>
            <Text style={styles.status}>{period === 'weekly' ? '월요일 시작' : `${new Date().getMonth() + 1}월`}</Text>
          </View>
          <View style={styles.barChart}>{chartValues.map((value, index) => <View key={index} style={styles.barItem}><View style={styles.barTrack}><View style={[styles.bar, { height: `${Math.min(100, value)}%`, backgroundColor: index === chartValues.length - 1 ? palette.accent : palette.leafFill }]} /></View><Text style={styles.day}>{period === 'weekly' ? ['월','화','수','목','금','토','일'][index] : index + 1}</Text></View>)}</View>
          {period === 'monthly' && monthly ? (
            <View style={styles.macroList}>
              <MacroBar label="탄수화물 달성률" value={monthly.monthlyAvgCarbPercentage} goal={100} unit="%" color={palette.leafFill} />
              <MacroBar label="단백질 달성률" value={monthly.monthlyAvgProteinPercentage} goal={100} unit="%" color={palette.yellow} />
              <MacroBar label="지방 달성률" value={monthly.monthlyAvgFatPercentage} goal={100} unit="%" color={palette.tomatoFill} />
            </View>
          ) : null}
        </Card>
      ) : null}
      <ListGroup>
        <ListRow icon="zap" tone="accent" title={`${period === 'daily' ? '오늘' : period === 'weekly' ? '이번 주' : '이번 달'} 식단 피드백`} subtitle="기록을 바탕으로 개선점을 알려 드려요" onPress={() => router.push({ pathname: '/ai-feedback', params: { period } })} />
      </ListGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { minHeight: 80, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: palette.muted, fontSize: 13 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel: { color: palette.muted, fontSize: 13, fontWeight: '400' },
  big: { fontSize: 32, lineHeight: 39, fontWeight: '600', letterSpacing: -0.8, color: palette.ink, marginTop: 2 },
  bigUnit: { fontSize: 13, fontWeight: '400', letterSpacing: 0, color: palette.muted },
  status: { color: palette.tomato, backgroundColor: palette.accentSoft, borderRadius: radii.pill, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5, fontSize: 12, fontWeight: '500' },
  progressTrack: { height: 8, backgroundColor: palette.sunken, borderRadius: 4, overflow: 'hidden', marginTop: spacing.md },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: palette.tomatoFill },
  macroList: { gap: spacing.md, marginTop: spacing.lg },
  barChart: { height: 170, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.lg },
  barItem: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: { height: 140, width: 18, borderRadius: 9, backgroundColor: palette.sunken, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 9 },
  day: { color: palette.muted, fontSize: 12 },
});
