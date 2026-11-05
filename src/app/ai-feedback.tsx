import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Header, Icon, IconButton, ListGroup, Note, PrimaryButton, Screen, SectionTitle, Segmented } from '@/components/ui';
import { font, palette, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { ApiError, getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { feedbackApi } from '@/services/bapmeokja-api';
import { AiFeedback } from '@/types/api';

type PeriodParam = 'daily' | 'weekly' | 'monthly';

const character = require('../../assets/characters/tomato-balanced.png');
function macroStatus(percent: number) { return percent < 70 ? '부족' : percent > 110 ? '초과' : '적정'; }

function localDate() { return new Date().toLocaleDateString('en-CA'); }
function monday() { const date = new Date(); const day = date.getDay() || 7; date.setDate(date.getDate() - day + 1); return date.toLocaleDateString('en-CA'); }

export default function AiFeedbackScreen() {
  const { period = 'daily' } = useLocalSearchParams<{ period?: PeriodParam }>();
  const { dashboard } = useApp();
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noRecords, setNoRecords] = useState(false);

  const load = useCallback(async () => {
    try {
      const now = new Date();
      const demo: AiFeedback = {
        period: period === 'daily' ? dashboard.date : period === 'weekly' ? `${monday()} ~ ${localDate()}` : `${now.getFullYear()}년 ${now.getMonth() + 1}월`,
        periodType: period === 'daily' ? 'DAILY' : period === 'weekly' ? 'WEEKLY' : 'MONTHLY',
        calorieAnalysis: { consumed: dashboard.calorieConsumed, goal: dashboard.calorieGoal, comment: dashboard.calorieConsumed < dashboard.calorieGoal ? `목표보다 ${dashboard.calorieRemaining.toLocaleString()} kcal 적게 섭취했습니다.` : `목표보다 ${dashboard.calorieExceeded.toLocaleString()} kcal 많이 섭취했습니다.` },
        nutritionBalance: { carbPercentage: dashboard.carb.percentage, proteinPercentage: dashboard.protein.percentage, fatPercentage: dashboard.fat.percentage, comment: dashboard.protein.percentage < 70 ? '탄수화물과 지방에 비해 단백질 섭취가 부족한 편입니다.' : '세 영양소를 비교적 고르게 섭취했습니다.' },
        suggestions: dashboard.protein.percentage < 70 ? ['다음 식사에 달걀, 두부, 닭가슴살처럼 익숙한 단백질 식품을 하나 추가해 보세요.', '간식은 당이 높은 음료보다 그릭요거트나 견과류가 잘 맞습니다.'] : ['현재 식사 구성을 유지하고 채소 반찬을 한 가지 더해 보세요.'],
        overallFeedback: dashboard.protein.percentage < 70 ? '전체 섭취량은 무난하지만 단백질을 조금 더 챙기면 좋겠습니다.' : '현재 영양 균형이 안정적입니다. 식사 시간을 일정하게 유지해 보세요.',
      };
      const result = isMockMode ? await simulateRequest(demo, 650) : period === 'daily' ? await feedbackApi.daily(localDate()) : period === 'weekly' ? await feedbackApi.weekly(monday()) : await feedbackApi.monthly(now.getFullYear(), now.getMonth() + 1);
      setFeedback(result);
    } catch (requestError) {
      setFeedback(null);
      if (requestError instanceof ApiError && requestError.status === 404) setNoRecords(true);
      else setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [dashboard, period]);

  useEffect(() => {
    const timer = setTimeout(() => { load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const changePeriod = (next: PeriodParam) => { if (next === period) return; setLoading(true); setError(''); setNoRecords(false); router.setParams({ period: next }); };

  if (loading) return <Screen><Header title="식단 피드백" left={<IconButton label="←" onPress={() => router.back()} />} /><View style={styles.center}><ActivityIndicator color={palette.tomato} /><Text style={styles.centerText}>식단 기록을 분석하고 있어요</Text></View></Screen>;
  const periodTabs = <Segmented value={period} onChange={changePeriod} options={[{ value: 'daily', label: '일간' }, { value: 'weekly', label: '주간' }, { value: 'monthly', label: '월간' }]} />;
  const emptyLabel = period === 'daily' ? '오늘' : period === 'weekly' ? '이번 주' : '이번 달';
  if (!feedback && noRecords) return <Screen><Header title="식단 피드백" left={<IconButton label="←" onPress={() => router.back()} />} />
    {periodTabs}
    <Card><EmptyState icon="edit-3" title={`${emptyLabel} 기록이 아직 없어요`} description="식사를 기록하면 칼로리와 영양 균형을 분석해 드려요." /></Card>
    <PrimaryButton title="식단 기록하기" onPress={() => router.push('/(tabs)/records')} />
  </Screen>;
  if (!feedback) return <Screen><Header title="식단 피드백" left={<IconButton label="←" onPress={() => router.back()} />} /><View style={styles.center}><Icon name="alert-circle" size={32} color={palette.muted} /><Text style={styles.centerTitle}>피드백을 만들 수 없어요</Text><Text style={styles.centerText}>{error}</Text><PrimaryButton title="다시 시도" onPress={() => { setLoading(true); setError(''); load(); }} /></View></Screen>;

  const periodLabel = feedback.periodType === 'DAILY' ? '오늘' : feedback.periodType === 'WEEKLY' ? '이번 주' : '이번 달';
  const calorieEntries = Object.entries(feedback.calorieAnalysis).filter(([key]) => key !== 'comment');
  const goal = Number(calorieEntries.find(([key]) => key.toLowerCase().includes('goal'))?.[1] ?? 0);
  const consumed = Number(calorieEntries.find(([key]) => !key.toLowerCase().includes('goal'))?.[1] ?? 0);
  const macros = Object.entries(feedback.nutritionBalance)
    .filter(([key]) => key.toLowerCase().includes('percentage'))
    .slice(0, 3)
    .map(([, value], index) => ({ label: ['탄수화물', '단백질', '지방'][index], percent: Number(value), color: [palette.leafFill, palette.yellow, palette.tomatoFill][index] }));
  const noRecord = consumed === 0;

  return <Screen><Header title="식단 피드백" subtitle={feedback.period} left={<IconButton label="←" onPress={() => router.back()} />} />
    {periodTabs}
    {noRecord ? <>
      <Card><EmptyState icon="edit-3" title={`${periodLabel} 기록이 아직 없어요`} description="식사를 기록하면 칼로리와 영양 균형을 분석해 드려요." /></Card>
      <PrimaryButton title="식단 기록하기" onPress={() => router.push('/(tabs)/records')} />
    </> : <>
      <Card style={styles.verdictCard}>
        <View style={styles.verdictRow}>
          <Image source={character} style={styles.character} contentFit="contain" accessibilityLabel="토마토 캐릭터" />
          <View style={styles.verdictCopy}>
            <Text style={styles.verdictLabel}>{periodLabel}의 한 줄 평가</Text>
            <Text style={styles.verdict}>{feedback.overallFeedback}</Text>
          </View>
        </View>
      </Card>

      <SectionTitle title="칼로리" />
      <Card>
        <Text style={styles.big}>{consumed.toLocaleString()} <Text style={styles.bigUnit}>/ {goal.toLocaleString()} kcal</Text></Text>
        <View style={styles.track}><View style={[styles.fill, { width: `${goal ? Math.min(100, Math.round((consumed / goal) * 100)) : 0}%` }]} /></View>
        <Text style={styles.comment}>{String(feedback.calorieAnalysis.comment)}</Text>
      </Card>

      <SectionTitle title="영양 균형" />
      <Card>
        <View style={styles.macroList}>
          {macros.map((macro) => (
            <View key={macro.label} style={styles.macro}>
              <View style={styles.macroHead}><Text style={styles.macroLabel}>{macro.label}</Text><Text style={styles.macroValue}>{macro.percent}% · {macroStatus(macro.percent)}</Text></View>
              <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, macro.percent)}%`, backgroundColor: macro.color }]} /></View>
            </View>
          ))}
        </View>
        <Text style={styles.comment}>{String(feedback.nutritionBalance.comment)}</Text>
      </Card>

      <SectionTitle title="다음 식사 제안" />
      <ListGroup>
        {feedback.suggestions.map((suggestion, index) => (
          <View key={suggestion} style={styles.suggestion}>
            <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </ListGroup>
      <PrimaryButton title="제안에 맞는 메뉴 보기" icon="compass" onPress={() => router.push('/(tabs)/recommend')} />
      <Note>식단 피드백은 참고 정보이며 의료 진단을 대신하지 않습니다.</Note>
    </>}
  </Screen>;
}

const styles = StyleSheet.create({
  center: { minHeight: 430, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg },
  centerTitle: { ...font.heading, color: palette.ink },
  centerText: { ...font.body, color: palette.muted, textAlign: 'center' },
  verdictCard: { backgroundColor: palette.accentSoft, boxShadow: 'none' },
  verdictRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  character: { width: 64, height: 72 },
  verdictCopy: { flex: 1 },
  verdictLabel: { color: palette.muted, fontSize: 13, fontWeight: '400' },
  verdict: { color: palette.ink, fontSize: 17, lineHeight: 24, fontWeight: '500', letterSpacing: -0.3, marginTop: 3 },
  big: { fontSize: 32, lineHeight: 39, fontWeight: '600', letterSpacing: -0.8, color: palette.ink },
  bigUnit: { fontSize: 13, fontWeight: '400', letterSpacing: 0, color: palette.muted },
  track: { height: 8, borderRadius: 4, backgroundColor: palette.sunken, overflow: 'hidden', marginTop: 8 },
  fill: { height: '100%', borderRadius: 4, backgroundColor: palette.tomatoFill },
  comment: { ...font.caption, color: palette.muted, marginTop: 14 },
  macroList: { gap: spacing.md },
  macro: {},
  macroHead: { flexDirection: 'row', justifyContent: 'space-between' },
  macroLabel: { color: palette.ink, fontSize: 14, fontWeight: '400' },
  macroValue: { color: palette.ink, fontSize: 14, fontWeight: '500' },
  suggestion: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 12 },
  number: { width: 26, height: 26, borderRadius: 13, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  numberText: { color: palette.tomato, fontSize: 12, fontWeight: '600' },
  suggestionText: { ...font.body, color: palette.ink, flex: 1 },
});
