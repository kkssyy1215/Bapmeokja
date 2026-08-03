import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Header, IconButton, MacroBar, Pill, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

const days = [68, 82, 74, 91, 65, 87, 72];

export default function StatsScreen() {
  const { profile, meals } = useApp();
  const total = meals.reduce((sum, meal) => ({ calories: sum.calories + meal.calories, carbs: sum.carbs + meal.carbs, protein: sum.protein + meal.protein, fat: sum.fat + meal.fat }), { calories: 0, carbs: 0, protein: 0, fat: 0 });
  return (
    <Screen>
      <Header title="영양 통계" subtitle="8월 4일 화요일" right={<IconButton label="▦" onPress={() => router.push('/history')} />} />
      <View style={styles.periods}><Pill label="일간" active /><Pill label="주간" /><Pill label="월간" /></View>
      <Card>
        <View style={styles.chartHeader}><View><Text style={styles.cardLabel}>오늘 섭취 칼로리</Text><Text style={styles.big}>{Math.min(total.calories, 1570).toLocaleString()} <Text style={styles.bigUnit}>kcal</Text></Text></View><Text style={styles.good}>목표 안</Text></View>
        <View style={styles.donutWrap}><View style={styles.donut}><View style={styles.donutInner}><Text style={styles.donutValue}>78%</Text><Text style={styles.donutLabel}>달성</Text></View></View><View style={styles.legend}><Text style={styles.legendItem}>● <Text style={{ color: palette.ink }}>섭취 1,570 kcal</Text></Text><Text style={[styles.legendItem, { color: palette.line }]}>● <Text style={{ color: palette.muted }}>남음 430 kcal</Text></Text><Text style={styles.encourage}>적정 범위로 잘 먹고 있어요!</Text></View></View>
      </Card>
      <Card><SectionTitle title="영양소 균형" /><View style={styles.macroList}><MacroBar label="탄수화물" value={173} goal={profile.carbGoal} color={palette.leaf} /><MacroBar label="단백질" value={78} goal={profile.proteinGoal} color={palette.yellow} /><MacroBar label="지방" value={44} goal={profile.fatGoal} color={palette.tomato} /></View></Card>
      <Card><View style={styles.weekHeader}><View><Text style={styles.cardLabel}>최근 7일 달성률</Text><Text style={styles.weekTitle}>평균 77%</Text></View><Text style={styles.weekBadge}>지난주보다 +8%</Text></View><View style={styles.barChart}>{days.map((value, index) => <View key={index} style={styles.barItem}><View style={styles.barTrack}><View style={[styles.bar, { height: `${value}%`, backgroundColor: index === 6 ? palette.tomato : '#C8DDBD' }]} /></View><Text style={[styles.day, index === 6 && styles.dayActive]}>{['수','목','금','토','일','월','오늘'][index]}</Text></View>)}</View></Card>
      <SectionTitle title="AI 분석" />
      <Pressable style={styles.aiCard} onPress={() => router.push('/ai-feedback')}><View style={styles.aiIcon}><Text style={styles.aiEmoji}>✦</Text></View><View style={styles.aiCopy}><Text style={styles.aiLabel}>오늘의 AI 피드백</Text><Text style={styles.aiTitle}>단백질은 좋고, 식이섬유는 조금 부족해요</Text><Text style={styles.aiLink}>자세히 분석 보기 →</Text></View></Pressable>
      <View style={styles.insightGrid}><Card style={styles.insight}><Text style={styles.insightEmoji}>🥦</Text><Text style={styles.insightValue}>2.3회</Text><Text style={styles.insightLabel}>주간 채소 섭취</Text></Card><Card style={styles.insight}><Text style={styles.insightEmoji}>💧</Text><Text style={styles.insightValue}>1.6L</Text><Text style={styles.insightLabel}>평균 수분 섭취</Text></Card></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  periods: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm }, chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, cardLabel: { color: palette.muted, fontSize: 12, fontWeight: '700' }, big: { fontSize: 28, fontWeight: '900', color: palette.ink, marginTop: 3 }, bigUnit: { fontSize: 12, color: palette.muted }, good: { color: palette.leaf, backgroundColor: palette.leafSoft, borderRadius: radii.pill, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 7, fontSize: 11, fontWeight: '800' },
  donutWrap: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, gap: spacing.lg }, donut: { width: 130, height: 130, borderRadius: 65, borderWidth: 22, borderColor: palette.tomato, borderTopColor: palette.tomatoSoft, alignItems: 'center', justifyContent: 'center' }, donutInner: { alignItems: 'center' }, donutValue: { fontSize: 23, fontWeight: '900', color: palette.ink }, donutLabel: { color: palette.muted, fontSize: 10 }, legend: { flex: 1, gap: 10 }, legendItem: { color: palette.tomato, fontSize: 12 }, encourage: { color: palette.leaf, fontSize: 12, fontWeight: '800', marginTop: 4 },
  macroList: { gap: spacing.md, marginTop: spacing.md }, weekHeader: { flexDirection: 'row', justifyContent: 'space-between' }, weekTitle: { ...font.heading, color: palette.ink, marginTop: 3 }, weekBadge: { color: palette.leaf, fontSize: 11, fontWeight: '800' }, barChart: { height: 150, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: spacing.md }, barItem: { flex: 1, alignItems: 'center', gap: 7 }, barTrack: { height: 115, width: 19, borderRadius: 10, backgroundColor: '#F0ECE4', justifyContent: 'flex-end', overflow: 'hidden' }, bar: { width: '100%', borderRadius: 10 }, day: { color: palette.muted, fontSize: 9 }, dayActive: { color: palette.tomato, fontWeight: '800' },
  aiCard: { backgroundColor: palette.ink, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md }, aiIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#3D3934', alignItems: 'center', justifyContent: 'center' }, aiEmoji: { color: '#FFAD9E', fontSize: 24 }, aiCopy: { flex: 1 }, aiLabel: { color: '#FFAD9E', fontSize: 11, fontWeight: '800' }, aiTitle: { color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 21, marginTop: 4 }, aiLink: { color: '#D5D0C8', fontSize: 11, marginTop: 10 },
  insightGrid: { flexDirection: 'row', gap: spacing.sm }, insight: { flex: 1 }, insightEmoji: { fontSize: 25 }, insightValue: { ...font.heading, color: palette.ink, marginTop: 8 }, insightLabel: { ...font.caption, color: palette.muted },
});
