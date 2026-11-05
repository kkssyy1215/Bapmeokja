import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Field, Header, IconButton, ListGroup, ListRow, Note, PrimaryButton, Pressable, Screen, SectionTitle } from '@/components/ui';
import { palette, radii, spacing } from '@/constants/design';
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
    {expiring.length ? <Note icon="alert-circle">유통기한이 임박했어요. {expiring.map((item) => item.name).join(', ')}을 먼저 사용해 보세요.</Note> : null}
    <SectionTitle title="보관 중인 재료" />
    {fridgeItems.length ? <ListGroup>{fridgeItems.map((item) => <ListRow key={item.id} icon="package" tone="accent" title={item.name} subtitle={`${item.quantity}${item.expiryDate ? ` · ${item.expiryDate}` : ''}`} right={<View style={styles.itemRight}>{item.expiry ? <Text style={[styles.expiry, item.isExpiringSoon && styles.expirySoon]}>{item.expiry}</Text> : null}<Pressable accessibilityRole="button" onPress={() => remove(item.id, item.name)} hitSlop={10}><Text style={styles.remove}>삭제</Text></Pressable></View>} />)}</ListGroup> : <Card><EmptyState icon="package" title="등록된 재료가 없어요" description="자주 쓰는 재료부터 하나씩 추가해 보세요." /></Card>}
    {fridgeItems.length ? <PrimaryButton title="이 재료로 집밥 추천" onPress={() => router.replace('/(tabs)/recommend')} /> : null}
    <SectionTitle title="재료 추가" />
    <Card style={styles.form}>
      <Field label="재료명" value={name} onChangeText={setName} placeholder="예: 양파" />
      <View style={styles.fields}><View style={styles.flex}><Field label="수량" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" /></View><View style={styles.flex}><Field label="단위" value={unit} onChangeText={setUnit} placeholder="개, g, ml" /></View></View>
      <Field label="유통기한 (선택)" value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" autoCapitalize="none" />
      <PrimaryButton title="냉장고에 추가" variant="secondary" onPress={add} loading={saving} />
    </Card>
  </Screen>;
}

const styles = StyleSheet.create({
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  expiry: { color: palette.tomato, backgroundColor: palette.accentSoft, borderRadius: radii.pill, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 4, fontSize: 12, fontWeight: '500' },
  expirySoon: { color: palette.onAccent, backgroundColor: palette.accent },
  remove: { color: palette.muted, fontSize: 14 },
  form: { gap: spacing.md },
  fields: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
