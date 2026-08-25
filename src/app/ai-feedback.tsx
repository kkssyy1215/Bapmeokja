import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, Header, IconButton, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { feedbackApi } from '@/services/bapmeokja-api';
import { AiFeedback } from '@/types/api';

type PeriodParam = 'daily' | 'weekly' | 'monthly';
function localDate() { return new Date().toLocaleDateString('en-CA'); }
function monday() { const date = new Date(); const day = date.getDay() || 7; date.setDate(date.getDate() - day + 1); return date.toLocaleDateString('en-CA'); }

export default function AiFeedbackScreen() {
  const { period = 'daily' } = useLocalSearchParams<{ period?: PeriodParam }>();
  const { dashboard } = useApp();
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const now = new Date();
      const demo: AiFeedback = {
        period: period === 'daily' ? dashboard.date : period === 'weekly' ? `${monday()} ~ ${localDate()}` : `${now.getFullYear()}년 ${now.getMonth() + 1}월`,
        periodType: period === 'daily' ? 'DAILY' : period === 'weekly' ? 'WEEKLY' : 'MONTHLY',
        calorieAnalysis: { consumed: dashboard.calorieConsumed, goal: dashboard.calorieGoal, comment: dashboard.calorieConsumed < dashboard.calorieGoal ? `목표보다 ${dashboard.calorieRemaining}kcal 적게 섭취했습니다.` : `목표보다 ${dashboard.calorieExceeded}kcal 많이 섭취했습니다.` },
        nutritionBalance: { carbPercentage: dashboard.carb.percentage, proteinPercentage: dashboard.protein.percentage, fatPercentage: dashboard.fat.percentage, comment: dashboard.protein.percentage < 70 ? '탄수화물과 지방에 비해 단백질 섭취가 부족한 편입니다.' : '세 영양소를 비교적 고르게 섭취했습니다.' },
        suggestions: dashboard.protein.percentage < 70 ? ['다음 식사에 달걀, 두부, 닭가슴살처럼 익숙한 단백질 식품을 하나 추가해 보세요.', '간식은 당이 높은 음료보다 그릭요거트나 견과류가 잘 맞습니다.'] : ['현재 식사 구성을 유지하고 채소 반찬을 한 가지 더해 보세요.'],
        overallFeedback: dashboard.protein.percentage < 70 ? '전체 섭취량은 무난하지만 단백질을 조금 더 챙기면 좋겠습니다.' : '현재 영양 균형이 안정적입니다. 식사 시간을 일정하게 유지해 보세요.',
      };
      const result = isMockMode ? await simulateRequest(demo, 650) : period === 'daily' ? await feedbackApi.daily(localDate()) : period === 'weekly' ? await feedbackApi.weekly(monday()) : await feedbackApi.monthly(now.getFullYear(), now.getMonth() + 1);
      setFeedback(result);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [dashboard, period]);

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  if (loading) return <Screen><Header title="식단 피드백" left={<IconButton label="←" onPress={() => router.back()} />} /><View style={styles.center}><ActivityIndicator color={palette.tomato} /><Text style={styles.centerText}>식단 기록을 분석하고 있어요</Text></View></Screen>;
  if (!feedback) return <Screen><Header title="식단 피드백" left={<IconButton label="←" onPress={() => router.back()} />} /><View style={styles.center}><Text style={styles.errorMark}>!</Text><Text style={styles.centerTitle}>피드백을 만들 수 없어요</Text><Text style={styles.centerText}>{error}</Text><PrimaryButton title="다시 시도" onPress={() => { setLoading(true); setError(''); load(); }} /></View></Screen>;

  const periodLabel = feedback.periodType === 'DAILY' ? '일간' : feedback.periodType === 'WEEKLY' ? '주간' : '월간';
  return <Screen><Header title="식단 피드백" subtitle={`${feedback.period} · ${periodLabel} 분석`} left={<IconButton label="←" onPress={() => router.back()} />} />
    <View style={styles.hero}><Text style={styles.heroEyebrow}>{periodLabel} 종합 의견</Text><Text style={styles.heroTitle}>{feedback.overallFeedback}</Text></View>
    <SectionTitle title="섭취량" />
    <Card><Text style={styles.cardTitle}>칼로리 분석</Text><Text style={styles.cardText}>{String(feedback.calorieAnalysis.comment)}</Text><View style={styles.metricRow}>{Object.entries(feedback.calorieAnalysis).filter(([key]) => key !== 'comment').slice(0, 2).map(([key, value]) => <View key={key} style={styles.metric}><Text style={styles.metricValue}>{Number(value).toLocaleString()}</Text><Text style={styles.metricLabel}>{key.includes('goal') ? '목표 kcal' : '섭취 kcal'}</Text></View>)}</View></Card>
    <SectionTitle title="영양 균형" />
    <Card><Text style={styles.cardTitle}>탄수화물 · 단백질 · 지방</Text><Text style={styles.cardText}>{String(feedback.nutritionBalance.comment)}</Text><View style={styles.balanceRow}>{Object.entries(feedback.nutritionBalance).filter(([key]) => key.toLowerCase().includes('percentage')).slice(0, 3).map(([key, value], index) => <View key={key} style={styles.balance}><Text style={[styles.balanceValue, { color: [palette.leaf, palette.yellow, palette.tomato][index] }]}>{value}%</Text><Text style={styles.balanceLabel}>{['탄수화물', '단백질', '지방'][index]}</Text></View>)}</View></Card>
    <SectionTitle title="다음 식사를 위한 제안" />
    <View style={styles.suggestions}>{feedback.suggestions.map((suggestion, index) => <View key={suggestion} style={styles.suggestion}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><Text style={styles.suggestionText}>{suggestion}</Text></View>)}</View>
    <Text style={styles.disclaimer}>식단 피드백은 건강 관리를 돕는 참고 정보이며 의료 진단을 대신하지 않습니다.</Text>
  </Screen>;
}

const styles = StyleSheet.create({
  center: { minHeight: 430, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl },
  centerTitle: { ...font.heading, color: palette.ink },
  centerText: { ...font.body, color: palette.muted, textAlign: 'center' },
  errorMark: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', textAlign: 'center', lineHeight: 43, color: palette.tomato, backgroundColor: palette.tomatoSoft, fontSize: 22, fontWeight: '900' },
  hero: { backgroundColor: palette.ink, borderRadius: radii.xl, padding: spacing.lg },
  heroEyebrow: { color: '#FFB2A5', fontSize: 11, fontWeight: '800' },
  heroTitle: { ...font.heading, color: '#fff', lineHeight: 29, marginTop: spacing.sm },
  cardTitle: { color: palette.ink, fontWeight: '900' },
  cardText: { ...font.body, color: palette.muted, marginTop: spacing.xs },
  metricRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  metric: { flex: 1, backgroundColor: palette.surfaceWarm, borderRadius: radii.md, padding: spacing.md },
  metricValue: { ...font.heading, color: palette.ink },
  metricLabel: { color: palette.muted, fontSize: 10, marginTop: 3 },
  balanceRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md },
  balance: { flex: 1, alignItems: 'center', backgroundColor: palette.background, borderRadius: radii.md, paddingVertical: spacing.md },
  balanceValue: { fontSize: 18, fontWeight: '900' },
  balanceLabel: { color: palette.muted, fontSize: 10, marginTop: 4 },
  suggestions: { gap: spacing.sm },
  suggestion: { backgroundColor: palette.surface, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.line, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  number: { width: 26, height: 26, borderRadius: 13, backgroundColor: palette.leafSoft, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: palette.leaf, fontSize: 11, fontWeight: '900' },
  suggestionText: { ...font.body, color: palette.ink, flex: 1 },
  disclaimer: { ...font.caption, color: palette.muted, textAlign: 'center' },
});
