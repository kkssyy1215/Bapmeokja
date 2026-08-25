import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Header, IconButton, MacroBar, Pill, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
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

  return (
    <Screen>
      <Header title="영양 통계" subtitle={new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })} right={<IconButton label="▦" onPress={() => router.push('/history')} />} />
      <View style={styles.periods}><Pill label="일간" active={period === 'daily'} onPress={() => { setLoading(true); setPeriod('daily'); }} /><Pill label="주간" active={period === 'weekly'} onPress={() => { setLoading(true); setPeriod('weekly'); }} /><Pill label="월간" active={period === 'monthly'} onPress={() => { setLoading(true); setPeriod('monthly'); }} /></View>
      {loading ? <View style={styles.loading}><ActivityIndicator color={palette.tomato} /><Text style={styles.loadingText}>통계를 불러오고 있어요</Text></View> : null}
      {period === 'daily' && daily ? <>
        <Card>
          <View style={styles.chartHeader}><View><Text style={styles.cardLabel}>오늘 섭취 칼로리</Text><Text style={styles.big}>{daily.calorieConsumed.toLocaleString()} <Text style={styles.bigUnit}>kcal</Text></Text></View><Text style={[styles.status, daily.caloriePercentage > 100 && styles.statusOver]}>{daily.caloriePercentage > 100 ? '목표 초과' : '목표 범위'}</Text></View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, daily.caloriePercentage)}%` }]} /></View><View style={styles.progressLabels}><Text style={styles.progressText}>0</Text><Text style={styles.progressText}>{daily.calorieGoal.toLocaleString()} kcal</Text></View>
        </Card>
        <Card><SectionTitle title="영양소 균형" /><View style={styles.macroList}><MacroBar label="탄수화물" value={daily.carb.consumedGram} goal={daily.carb.goalGram} color={palette.leaf} /><MacroBar label="단백질" value={daily.protein.consumedGram} goal={daily.protein.goalGram} color={palette.yellow} /><MacroBar label="지방" value={daily.fat.consumedGram} goal={daily.fat.goalGram} color={palette.tomato} /></View></Card>
      </> : null}
      {period !== 'daily' && chartValues.length ? <Card><View style={styles.weekHeader}><View><Text style={styles.cardLabel}>{period === 'weekly' ? '주간 평균 섭취' : '월간 평균 섭취'}</Text><Text style={styles.weekTitle}>{averageCalories?.toLocaleString()} kcal</Text></View><Text style={styles.periodBadge}>{period === 'weekly' ? '월요일 시작' : `${new Date().getMonth() + 1}월`}</Text></View><View style={styles.barChart}>{chartValues.map((value, index) => <View key={index} style={styles.barItem}><View style={styles.barTrack}><View style={[styles.bar, { height: `${Math.min(100, value)}%`, backgroundColor: index === chartValues.length - 1 ? palette.tomato : '#BFD7C5' }]} /></View><Text style={styles.day}>{period === 'weekly' ? ['월','화','수','목','금','토','일'][index] : index + 1}</Text></View>)}</View></Card> : null}
      {period === 'monthly' && monthly ? <Card><SectionTitle title="월평균 영양 달성률" /><View style={styles.macroList}><MacroBar label="탄수화물" value={monthly.monthlyAvgCarbPercentage} goal={100} unit="%" color={palette.leaf} /><MacroBar label="단백질" value={monthly.monthlyAvgProteinPercentage} goal={100} unit="%" color={palette.yellow} /><MacroBar label="지방" value={monthly.monthlyAvgFatPercentage} goal={100} unit="%" color={palette.tomato} /></View></Card> : null}
      <SectionTitle title="식단 피드백" />
      <Pressable style={styles.feedbackCard} onPress={() => router.push({ pathname: '/ai-feedback', params: { period } })}><View style={styles.feedbackCopy}><Text style={styles.feedbackLabel}>{period === 'daily' ? '오늘' : period === 'weekly' ? '이번 주' : '이번 달'} 분석</Text><Text style={styles.feedbackTitle}>섭취 기록을 바탕으로 개선점을 확인해 보세요</Text><Text style={styles.feedbackLink}>피드백 보기 →</Text></View></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  periods: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  loading: { minHeight: 80, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: palette.muted, fontSize: 11 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel: { color: palette.muted, fontSize: 12, fontWeight: '700' },
  big: { fontSize: 28, fontWeight: '900', color: palette.ink, marginTop: 3 },
  bigUnit: { fontSize: 12, color: palette.muted },
  status: { color: palette.leaf, backgroundColor: palette.leafSoft, borderRadius: radii.pill, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 7, fontSize: 11, fontWeight: '800' },
  statusOver: { color: palette.tomato, backgroundColor: palette.tomatoSoft },
  progressTrack: { height: 14, backgroundColor: palette.line, borderRadius: 7, overflow: 'hidden', marginTop: spacing.lg },
  progressFill: { height: '100%', borderRadius: 7, backgroundColor: palette.tomato },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  progressText: { color: palette.muted, fontSize: 9 },
  macroList: { gap: spacing.md, marginTop: spacing.md },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  weekTitle: { ...font.heading, color: palette.ink, marginTop: 3 },
  periodBadge: { color: palette.leaf, fontSize: 11, fontWeight: '800' },
  barChart: { height: 160, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.md },
  barItem: { flex: 1, alignItems: 'center', gap: 7 },
  barTrack: { height: 122, width: 18, borderRadius: 9, backgroundColor: '#F0ECE4', justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: '100%', borderRadius: 9 },
  day: { color: palette.muted, fontSize: 9 },
  feedbackCard: { backgroundColor: palette.ink, borderRadius: radii.lg, padding: spacing.lg },
  feedbackCopy: { maxWidth: 300 },
  feedbackLabel: { color: '#FFAD9E', fontSize: 11, fontWeight: '800' },
  feedbackTitle: { color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 23, marginTop: 5 },
  feedbackLink: { color: '#D5D0C8', fontSize: 11, marginTop: 12 },
});
