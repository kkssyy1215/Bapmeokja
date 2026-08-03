import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, Field, Header, IconButton, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

export default function FridgeScreen() {
  const { fridgeItems, addFridgeItem, removeFridgeItem } = useApp();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const add = () => { if (!name) return Alert.alert('재료명을 입력해 주세요'); addFridgeItem({ name, quantity: quantity || '1개', expiry: 'D-5' }); setName(''); setQuantity(''); };
  return <Screen><Header title="내 냉장고" subtitle={`${fridgeItems.length}개 재료를 보관 중`} left={<IconButton label="←" onPress={() => router.back()} />} />
    <View style={styles.hero}><Text style={styles.heroEmoji}>🧊</Text><View><Text style={styles.heroTitle}>남은 재료도 맛있는 한 끼로</Text><Text style={styles.heroText}>재료와 유통기한을 기반으로 집밥을 추천해요.</Text></View></View>
    <SectionTitle title="보관 중인 재료" />
    <Card style={styles.list}>{fridgeItems.map((item, index) => <View key={item.id} style={[styles.item, index > 0 && styles.border]}><Text style={styles.itemEmoji}>{['🥚','🥬','◻','🥕'][index % 4]}</Text><View style={styles.itemInfo}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemQuantity}>{item.quantity}</Text></View><Text style={[styles.expiry, item.expiry === 'D-2' && styles.expirySoon]}>{item.expiry}</Text><Pressable onPress={() => removeFridgeItem(item.id)} hitSlop={10}><Text style={styles.remove}>×</Text></Pressable></View>)}</Card>
    <SectionTitle title="재료 추가" />
    <View style={styles.fields}><View style={styles.flex}><Field label="재료명" value={name} onChangeText={setName} placeholder="예: 양파" /></View><View style={styles.small}><Field label="수량" value={quantity} onChangeText={setQuantity} placeholder="2개" /></View></View>
    <PrimaryButton title="냉장고에 추가" variant="secondary" onPress={add} />
    <View style={styles.expiryNotice}><Text style={styles.noticeEmoji}>⏰</Text><View><Text style={styles.noticeTitle}>두부 유통기한이 2일 남았어요</Text><Text style={styles.noticeText}>오늘 추천에서 두부 활용 레시피를 먼저 보여드릴게요.</Text></View></View>
    <PrimaryButton title="이 재료로 집밥 추천" onPress={() => router.replace('/(tabs)/recommend')} />
  </Screen>;
}

const styles = StyleSheet.create({ hero: { backgroundColor: palette.leafSoft, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'center' }, heroEmoji: { fontSize: 42 }, heroTitle: { ...font.subheading, color: palette.ink }, heroText: { ...font.caption, color: palette.muted, marginTop: 3, maxWidth: 275 }, list: { paddingVertical: 2 }, item: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, border: { borderTopWidth: 1, borderTopColor: palette.line }, itemEmoji: { fontSize: 25, width: 39, textAlign: 'center' }, itemInfo: { flex: 1 }, itemName: { color: palette.ink, fontWeight: '800' }, itemQuantity: { color: palette.muted, fontSize: 10, marginTop: 3 }, expiry: { color: palette.leaf, backgroundColor: palette.leafSoft, borderRadius: radii.pill, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5, fontSize: 10, fontWeight: '900' }, expirySoon: { color: palette.tomato, backgroundColor: palette.tomatoSoft }, remove: { color: palette.muted, fontSize: 22, marginLeft: 4 }, fields: { flexDirection: 'row', gap: spacing.sm }, flex: { flex: 1 }, small: { width: 100 }, expiryNotice: { backgroundColor: palette.yellowSoft, borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }, noticeEmoji: { fontSize: 25 }, noticeTitle: { color: palette.ink, fontSize: 12, fontWeight: '900' }, noticeText: { color: palette.muted, fontSize: 10, marginTop: 3, maxWidth: 280 } });
