import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Field, Header, IconButton, PrimaryButton, Screen, SectionTitle } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { useApp } from '@/context/app-context';

export default function FridgeScreen() {
  const { fridgeItems, addFridgeItem, removeFridgeItem, refreshFridge } = useApp();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('개');
  const [expiryDate, setExpiryDate] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => { refreshFridge().catch(() => undefined); }, [refreshFridge]));

  const add = async () => {
    if (!name.trim() || !quantity || !unit.trim()) return Alert.alert('입력값을 확인해 주세요', '재료명, 수량, 단위를 입력해 주세요.');
    if (expiryDate && !/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return Alert.alert('날짜 형식을 확인해 주세요', '유통기한은 YYYY-MM-DD 형식으로 입력해 주세요.');
    setSaving(true);
    try {
      await addFridgeItem({ name: name.trim(), quantity: `${Number(quantity)}${unit.trim()}`, quantityValue: Number(quantity), unit: unit.trim(), expiry: '', expiryDate: expiryDate || undefined, isExpiringSoon: false });
      setName(''); setQuantity('1'); setUnit('개'); setExpiryDate('');
    } catch (error) { Alert.alert('재료를 추가하지 못했어요', error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.'); }
    finally { setSaving(false); }
  };

  const remove = (id: string, itemName: string) => Alert.alert('재료 삭제', `${itemName}을(를) 냉장고에서 삭제할까요?`, [
    { text: '취소', style: 'cancel' },
    { text: '삭제', style: 'destructive', onPress: () => removeFridgeItem(id).catch((error) => Alert.alert('삭제 실패', error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.')) },
  ]);

  const expiring = fridgeItems.filter((item) => item.isExpiringSoon || ['D-0', 'D-1', 'D-2', 'D-3'].includes(item.expiry));

  return <Screen><Header title="내 냉장고" subtitle={`${fridgeItems.length}개 재료를 보관 중`} left={<IconButton label="←" onPress={() => router.back()} />} />
    <View style={styles.hero}><View style={styles.heroMark}><Text style={styles.heroMarkText}>냉</Text></View><View><Text style={styles.heroTitle}>있는 재료부터 사용해요</Text><Text style={styles.heroText}>수량과 유통기한을 기준으로 집밥 메뉴를 추천합니다.</Text></View></View>
    {expiring.length ? <View style={styles.expiryNotice}><Text style={styles.noticeTitle}>유통기한 임박</Text><Text style={styles.noticeText}>{expiring.map((item) => item.name).join(', ')}을 먼저 사용해 보세요.</Text></View> : null}
    <SectionTitle title="보관 중인 재료" />
    {fridgeItems.length ? <Card style={styles.list}>{fridgeItems.map((item, index) => <View key={item.id} style={[styles.item, index > 0 && styles.border]}><View style={styles.itemInitial}><Text style={styles.itemInitialText}>{item.name.slice(0, 1)}</Text></View><View style={styles.itemInfo}><Text style={styles.itemName}>{item.name}</Text><Text style={styles.itemQuantity}>{item.quantity}{item.expiryDate ? ` · ${item.expiryDate}` : ''}</Text></View>{item.expiry ? <Text style={[styles.expiry, item.isExpiringSoon && styles.expirySoon]}>{item.expiry}</Text> : null}<Pressable onPress={() => remove(item.id, item.name)} hitSlop={10}><Text style={styles.remove}>삭제</Text></Pressable></View>)}</Card> : <Card><EmptyState emoji="🧊" title="등록된 재료가 없어요" description="자주 쓰는 재료부터 하나씩 추가해 보세요." /></Card>}
    <SectionTitle title="재료 추가" />
    <Field label="재료명" value={name} onChangeText={setName} placeholder="예: 양파" />
    <View style={styles.fields}><View style={styles.flex}><Field label="수량" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" /></View><View style={styles.flex}><Field label="단위" value={unit} onChangeText={setUnit} placeholder="개, g, ml" /></View></View>
    <Field label="유통기한 (선택)" value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
    <PrimaryButton title="냉장고에 추가" variant="secondary" onPress={add} loading={saving} />
    <PrimaryButton title="이 재료로 집밥 추천" onPress={() => router.replace('/(tabs)/recommend')} />
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: palette.leafSoft, borderRadius: radii.lg, padding: spacing.md, flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  heroMark: { width: 48, height: 48, borderRadius: 24, backgroundColor: palette.leaf, alignItems: 'center', justifyContent: 'center' },
  heroMarkText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  heroTitle: { ...font.subheading, color: palette.ink },
  heroText: { ...font.caption, color: palette.muted, marginTop: 3, maxWidth: 275 },
  expiryNotice: { backgroundColor: palette.yellowSoft, borderRadius: radii.md, padding: spacing.md },
  noticeTitle: { color: '#805B17', fontSize: 12, fontWeight: '900' },
  noticeText: { color: palette.muted, fontSize: 11, marginTop: 4 },
  list: { paddingVertical: 2 },
  item: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  border: { borderTopWidth: 1, borderTopColor: palette.line },
  itemInitial: { width: 40, height: 40, borderRadius: radii.sm, backgroundColor: palette.surfaceWarm, alignItems: 'center', justifyContent: 'center' },
  itemInitialText: { color: palette.tomatoDark, fontSize: 15, fontWeight: '900' },
  itemInfo: { flex: 1 },
  itemName: { color: palette.ink, fontWeight: '800' },
  itemQuantity: { color: palette.muted, fontSize: 10, marginTop: 3 },
  expiry: { color: palette.leaf, backgroundColor: palette.leafSoft, borderRadius: radii.pill, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, fontSize: 9, fontWeight: '900' },
  expirySoon: { color: palette.tomato, backgroundColor: palette.tomatoSoft },
  remove: { color: palette.muted, fontSize: 10, fontWeight: '700', marginLeft: 3 },
  fields: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
