import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Header, IconButton, MacroBar, Pill, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';
import { recommendations } from '@/data/mock';

export default function RecommendScreen() {
  const { fridgeItems } = useApp();
  const [mode, setMode] = useState<'outside' | 'home'>('outside');
  const [budget, setBudget] = useState(12000);
  const list = recommendations[mode].filter((item) => item.price <= budget);

  return (
    <Screen>
      <Header title="오늘 뭐 먹지?" subtitle="AI가 영양과 취향을 함께 봐요" right={<IconButton label="♡" />} />
      <Card style={styles.summary}>
        <View style={styles.summaryTop}><View><Text style={styles.summaryLabel}>오늘 남은 칼로리</Text><Text style={styles.summaryValue}>800 <Text style={styles.summaryUnit}>kcal</Text></Text></View><Text style={styles.summaryEmoji}>🍚</Text></View>
        <View style={styles.macroList}><MacroBar label="탄수화물" value={74} goal={100} color={palette.leaf} unit="%" /><MacroBar label="단백질" value={52} goal={100} color={palette.yellow} unit="%" /><MacroBar label="지방" value={81} goal={100} color={palette.tomato} unit="%" /></View>
      </Card>
      <View style={styles.modeSwitch}><Pressable style={[styles.mode, mode === 'outside' && styles.modeActive]} onPress={() => setMode('outside')}><Text style={styles.modeEmoji}>🥡</Text><Text style={[styles.modeText, mode === 'outside' && styles.modeTextActive]}>외식 추천</Text></Pressable><Pressable style={[styles.mode, mode === 'home' && styles.modeActive]} onPress={() => setMode('home')}><Text style={styles.modeEmoji}>🍳</Text><Text style={[styles.modeText, mode === 'home' && styles.modeTextActive]}>집밥 추천</Text></Pressable></View>
      <View style={styles.budgetRow}><Text style={styles.budgetLabel}>한 끼 예산</Text><View style={styles.budgetPills}>{[8000, 12000, 16000].map((value) => <Pill key={value} label={`${value / 10000}만`} active={budget === value} onPress={() => setBudget(value)} />)}</View></View>
      {mode === 'home' ? <Pressable style={styles.fridgeStrip} onPress={() => router.push('/fridge')}><View><Text style={styles.fridgeTitle}>내 냉장고 재료 {fridgeItems.length}개</Text><Text style={styles.fridgeSub}>{fridgeItems.map((item) => item.name).join(' · ')}</Text></View><Text style={styles.chevron}>›</Text></Pressable> : <Pressable style={styles.locationStrip} onPress={() => router.push('/nearby')}><Text style={styles.locationIcon}>⌖</Text><View><Text style={styles.locationTitle}>현재 위치 주변</Text><Text style={styles.locationSub}>서울 성동구 · 1.5km 이내</Text></View><Text style={styles.chevron}>›</Text></Pressable>}
      <SectionTitle title={mode === 'outside' ? '지금 딱 맞는 외식 메뉴' : '냉장고 재료로 만드는 집밥'} action="새로 추천" />
      {list.length ? list.map((item, index) => (
        <Pressable key={item.id} style={styles.recommendCard} onPress={() => router.push({ pathname: '/recommendation-detail', params: { id: item.id, mode } })}>
          <View style={[styles.rank, index === 0 && styles.rankFirst]}><Text style={[styles.rankText, index === 0 && styles.rankTextFirst]}>{index + 1}</Text></View>
          <View style={styles.foodVisual}><Text style={styles.foodEmoji}>{item.emoji}</Text></View>
          <View style={styles.foodInfo}><Text style={styles.reason}>✦ {item.reason}</Text><Text style={styles.foodName}>{item.name}</Text><Text style={styles.place}>{item.place}</Text><View style={styles.metaRow}><Text style={styles.kcal}>{item.calories} kcal</Text><Text style={styles.price}>{item.price.toLocaleString()}원</Text></View></View>
        </Pressable>
      )) : <Card><Text style={styles.noResult}>선택한 예산 안의 메뉴가 없어요. 예산을 조금 높여 보세요.</Text></Card>}
      <PrimaryButton title={mode === 'home' ? '남은 재료로 다시 추천받기' : '지도로 주변 식당 보기'} variant="secondary" onPress={() => router.push(mode === 'home' ? '/fridge' : '/nearby')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: palette.ink }, summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, summaryLabel: { color: '#C6C1B8', fontSize: 11 }, summaryValue: { color: '#fff', fontSize: 29, fontWeight: '900', marginTop: 3 }, summaryUnit: { color: '#C6C1B8', fontSize: 12 }, summaryEmoji: { fontSize: 48 }, macroList: { marginTop: spacing.md, gap: 12 },
  modeSwitch: { flexDirection: 'row', backgroundColor: '#EDE9E1', borderRadius: radii.lg, padding: 4 }, mode: { flex: 1, minHeight: 55, borderRadius: radii.md, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' }, modeActive: { backgroundColor: palette.surface, ...shadow }, modeEmoji: { fontSize: 18 }, modeText: { color: palette.muted, fontWeight: '800', fontSize: 13 }, modeTextActive: { color: palette.ink },
  budgetRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, budgetLabel: { color: palette.ink, fontSize: 13, fontWeight: '800' }, budgetPills: { flexDirection: 'row', gap: spacing.xs },
  locationStrip: { backgroundColor: palette.blueSoft, borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }, locationIcon: { fontSize: 24, color: palette.blue }, locationTitle: { color: palette.ink, fontSize: 13, fontWeight: '800' }, locationSub: { color: palette.muted, fontSize: 10, marginTop: 2 }, fridgeStrip: { backgroundColor: palette.leafSoft, borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', alignItems: 'center' }, fridgeTitle: { color: palette.ink, fontSize: 13, fontWeight: '800' }, fridgeSub: { color: palette.muted, fontSize: 10, marginTop: 3 }, chevron: { marginLeft: 'auto', color: palette.muted, fontSize: 26 },
  recommendCard: { minHeight: 145, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.sm, borderWidth: 1, borderColor: palette.line }, rank: { position: 'absolute', top: 8, left: 8, zIndex: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center' }, rankFirst: { backgroundColor: palette.tomato }, rankText: { color: '#fff', fontSize: 11, fontWeight: '900' }, rankTextFirst: { color: '#fff' }, foodVisual: { width: 110, height: 120, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surfaceWarm }, foodEmoji: { fontSize: 60 }, foodInfo: { flex: 1 }, reason: { color: palette.tomato, fontSize: 9, fontWeight: '900' }, foodName: { ...font.subheading, color: palette.ink, marginTop: 5 }, place: { color: palette.muted, fontSize: 10, marginTop: 4 }, metaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 12 }, kcal: { color: palette.ink, fontSize: 11, fontWeight: '800' }, price: { color: palette.leaf, fontSize: 11, fontWeight: '800' }, noResult: { ...font.body, color: palette.muted, textAlign: 'center' },
});
