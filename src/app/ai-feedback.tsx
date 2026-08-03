import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Header, IconButton, MacroBar, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';

export default function AiFeedbackScreen() {
  return <Screen><Header title="AI 영양 리포트" subtitle="2026.08.04 · 일간 분석" left={<IconButton label="←" onPress={() => router.back()} />} />
    <View style={styles.hero}><Text style={styles.spark}>✦</Text><Text style={styles.eyebrow}>오늘의 균형 점수</Text><Text style={styles.score}>82<Text style={styles.outOf}> / 100</Text></Text><Text style={styles.heroTitle}>꽤 균형 있게 잘 먹었어요!</Text><Text style={styles.heroText}>점심의 단백질 선택이 좋았고, 저녁에 채소 한 접시를 더하면 훨씬 완벽해져요.</Text></View>
    <SectionTitle title="오늘의 잘한 점" />
    <Card style={styles.point}><View style={[styles.pointIcon, { backgroundColor: palette.leafSoft }]}><Text style={styles.pointEmoji}>💪</Text></View><View style={styles.pointCopy}><Text style={styles.pointTitle}>단백질 목표 82% 달성</Text><Text style={styles.pointText}>닭가슴살과 그릭요거트로 매 끼니 골고루 섭취했어요.</Text></View></Card>
    <Card style={styles.point}><View style={[styles.pointIcon, { backgroundColor: palette.yellowSoft }]}><Text style={styles.pointEmoji}>⏰</Text></View><View style={styles.pointCopy}><Text style={styles.pointTitle}>규칙적인 식사 간격</Text><Text style={styles.pointText}>끼니 사이가 4~5시간으로 안정적이었어요.</Text></View></Card>
    <SectionTitle title="조금만 개선해요" />
    <Card><View style={styles.issueHead}><Text style={styles.issueEmoji}>🥦</Text><View><Text style={styles.issueTitle}>식이섬유가 부족해요</Text><Text style={styles.issueSub}>권장량의 약 61% 섭취</Text></View></View><View style={styles.macro}><MacroBar label="식이섬유" value={15} goal={25} color={palette.tomato} /></View><View style={styles.suggestion}><Text style={styles.suggestionTitle}>이렇게 채워 보세요</Text><Text style={styles.suggestionText}>브로콜리 80g, 사과 반 개 또는 현미밥 한 공기를 추가하면 좋아요.</Text></View></Card>
    <SectionTitle title="내일을 위한 한 가지" />
    <View style={styles.tomorrow}><Text style={styles.tomorrowEmoji}>🌿</Text><Text style={styles.tomorrowText}>점심이나 저녁에 <Text style={styles.bold}>초록색 채소 한 접시</Text>를 더해 보세요. 작은 변화가 일주일 뒤 큰 차이를 만들어요.</Text></View>
    <Text style={styles.disclaimer}>AI 분석은 건강 관리를 돕는 참고 정보이며, 의료 진단을 대신하지 않습니다.</Text>
  </Screen>;
}

const styles = StyleSheet.create({ hero: { backgroundColor: palette.ink, borderRadius: radii.xl, padding: spacing.lg, alignItems: 'center' }, spark: { color: '#FFB2A5', fontSize: 28 }, eyebrow: { color: '#C9C3BA', fontSize: 11, marginTop: 8 }, score: { color: '#fff', fontSize: 48, fontWeight: '900', marginTop: 2 }, outOf: { fontSize: 14, color: '#AAA59D' }, heroTitle: { ...font.heading, color: '#fff', marginTop: 6 }, heroText: { ...font.body, color: '#C9C3BA', textAlign: 'center', marginTop: 8 }, point: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, pointIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }, pointEmoji: { fontSize: 23 }, pointCopy: { flex: 1 }, pointTitle: { color: palette.ink, fontWeight: '800' }, pointText: { ...font.caption, color: palette.muted, marginTop: 4 }, issueHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, issueEmoji: { fontSize: 34 }, issueTitle: { color: palette.ink, fontWeight: '800' }, issueSub: { color: palette.tomato, fontSize: 11, marginTop: 2 }, macro: { marginTop: spacing.md }, suggestion: { backgroundColor: palette.surfaceWarm, borderRadius: radii.md, padding: spacing.md, marginTop: spacing.md }, suggestionTitle: { color: palette.ink, fontSize: 12, fontWeight: '800' }, suggestionText: { ...font.caption, color: palette.muted, marginTop: 4 }, tomorrow: { backgroundColor: palette.leafSoft, borderRadius: radii.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'center' }, tomorrowEmoji: { fontSize: 35 }, tomorrowText: { ...font.body, color: '#3E6249', flex: 1 }, bold: { fontWeight: '900' }, disclaimer: { ...font.caption, color: palette.muted, textAlign: 'center' } });
