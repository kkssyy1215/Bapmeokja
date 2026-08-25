import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Header, IconButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

export default function RecordsScreen() {
  const { meals } = useApp();

  const pick = async (camera: boolean) => {
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한이 필요해요', camera ? '식단을 촬영하려면 카메라 권한을 허용해 주세요.' : '식단 사진을 선택하려면 사진 권한을 허용해 주세요.');
      return;
    }
    const result = camera ? await ImagePicker.launchCameraAsync({ quality: 0.8 }) : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) router.push({ pathname: '/meal-analysis', params: { uri: result.assets[0].uri } });
  };

  return (
    <Screen>
      <Header title="식단 기록" subtitle="사진 한 장이면 충분해요" right={<IconButton label="◫" onPress={() => router.push('/history')} accessibilityLabel="식단 달력" />} />
      <View style={styles.hero}><Text style={styles.sparkle}>PHOTO FOOD SCAN</Text><Text style={styles.title}>지금 먹은 음식을{`\n`}기록해 볼까요?</Text><Text style={styles.description}>사진에 보이는 음식과 양으로 영양 정보를 추정해요. 저장 전에 직접 확인하고 수정할 수 있어요.</Text><View style={styles.dish}><Text style={styles.dishEmoji}>🍱</Text><View style={styles.scanLine} /></View></View>
      <Pressable style={styles.camera} onPress={() => pick(true)}><View style={styles.actionIcon}><Text style={styles.actionEmoji}>📷</Text></View><View style={styles.actionCopy}><Text style={styles.actionTitle}>카메라로 촬영</Text><Text style={styles.actionSub}>지금 바로 찍고 분석하기</Text></View><Text style={styles.chevron}>›</Text></Pressable>
      <View style={styles.actionGrid}>
        <Pressable style={styles.smallAction} onPress={() => pick(false)}><Text style={styles.smallEmoji}>🖼️</Text><Text style={styles.smallTitle}>앨범에서 선택</Text><Text style={styles.smallSub}>저장된 음식 사진</Text></Pressable>
        <Pressable style={styles.smallAction} onPress={() => router.push('/manual-entry')}><Text style={styles.smallEmoji}>⌨️</Text><Text style={styles.smallTitle}>직접 입력</Text><Text style={styles.smallSub}>음식명과 양 입력</Text></Pressable>
      </View>
      <SectionTitle title="최근 기록" action="전체 보기" onAction={() => router.push('/history')} />
      <Card style={styles.recentCard}>
        {meals.slice(0, 3).map((meal, index) => <Pressable key={meal.id} onPress={() => router.push({ pathname: '/meal-analysis', params: { saved: '1', id: meal.id } })} style={[styles.recent, index > 0 && styles.recentBorder]}><Text style={styles.recentEmoji}>{meal.emoji}</Text><View style={styles.recentInfo}><Text style={styles.recentName}>{meal.name}</Text><Text style={styles.recentMeta}>{meal.type} · {meal.calories} kcal</Text></View><Text style={styles.chevronSmall}>›</Text></Pressable>)}
      </Card>
      <View style={styles.guide}><Text style={styles.guideTitle}>사진 분석은 참고용이에요</Text><Text style={styles.guideText}>• 음식 전체가 보이도록 위에서 촬영해 주세요.{`\n`}• 사진 기반 추정값은 실제와 다를 수 있으니 저장 전에 음식명, 양, 영양값을 확인해 주세요.</Text></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 250, borderRadius: radii.xl, backgroundColor: palette.ink, padding: spacing.lg, overflow: 'hidden' }, sparkle: { color: '#FF9F8D', fontSize: 10, fontWeight: '900', letterSpacing: 1.7 }, title: { ...font.title, color: '#fff', marginTop: 8, lineHeight: 37 }, description: { ...font.caption, color: '#C9C4BA', marginTop: 8, maxWidth: 230 }, dish: { position: 'absolute', right: -10, bottom: -20, width: 150, height: 150, backgroundColor: '#3A3833', borderRadius: 75, alignItems: 'center', justifyContent: 'center' }, dishEmoji: { fontSize: 76 }, scanLine: { position: 'absolute', width: 120, height: 2, backgroundColor: palette.tomato, top: 70 },
  camera: { minHeight: 82, backgroundColor: palette.tomato, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadow }, actionIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,.2)', alignItems: 'center', justifyContent: 'center' }, actionEmoji: { fontSize: 23 }, actionCopy: { flex: 1 }, actionTitle: { color: '#fff', fontSize: 16, fontWeight: '900' }, actionSub: { color: '#FFE4DE', fontSize: 11, marginTop: 3 }, chevron: { color: '#fff', fontSize: 30 },
  actionGrid: { flexDirection: 'row', gap: spacing.sm }, smallAction: { flex: 1, minHeight: 125, backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.md, borderWidth: 1, borderColor: palette.line }, smallEmoji: { fontSize: 28 }, smallTitle: { fontWeight: '800', color: palette.ink, marginTop: spacing.sm }, smallSub: { color: palette.muted, fontSize: 11, marginTop: 3 },
  recentCard: { paddingVertical: 4 }, recent: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 9 }, recentBorder: { borderTopWidth: 1, borderTopColor: palette.line }, recentEmoji: { fontSize: 28, width: 45, height: 45, textAlign: 'center', paddingTop: 7, backgroundColor: palette.surfaceWarm, borderRadius: radii.md, overflow: 'hidden' }, recentInfo: { flex: 1 }, recentName: { color: palette.ink, fontSize: 14, fontWeight: '800' }, recentMeta: { color: palette.muted, fontSize: 11, marginTop: 3 }, chevronSmall: { color: palette.muted, fontSize: 25 },
  guide: { backgroundColor: palette.blueSoft, borderRadius: radii.md, padding: spacing.md, gap: spacing.xs }, guideTitle: { color: palette.blue, fontWeight: '800', fontSize: 13 }, guideText: { ...font.caption, color: '#5F6D86', lineHeight: 19 },
});
