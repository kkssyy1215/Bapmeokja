import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { Card, Header, IconButton, Screen, Pressable } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { goBack } from '@/services/navigation';
import { menuApi } from '@/services/bapmeokja-api';
import { ShoppingList } from '@/types/api';

const demoList: ShoppingList = {
  recipeId: 'rec_r_001',
  recipeName: '두부 달걀 덮밥',
  estimatedTotalCost: 4200,
  shoppingItems: [
    { name: '두부', requiredAmount: '1/2모', inFridge: true, products: [] },
    { name: '달걀', requiredAmount: '2개', inFridge: false, products: [{ mallName: '온라인몰', productName: '무항생제 달걀 10구', price: 4900, productUrl: 'https://example.com' }] },
    { name: '현미밥', requiredAmount: '150g', inFridge: false, products: [{ mallName: '온라인몰', productName: '즉석 현미밥 6개', price: 7800, productUrl: 'https://example.com' }] },
  ],
  disclaimer: '외부 쇼핑몰로 이동합니다. 상품 정보와 가격은 판매처에 따라 달라질 수 있습니다.',
};

export default function ShoppingListScreen() {
  const { recipeId = 'rec_r_001' } = useLocalSearchParams<{ recipeId?: string }>();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (isMockMode ? simulateRequest(demoList, 450) : menuApi.shoppingList(recipeId))
      .then(setList)
      .catch((error) => Alert.alert('장보기 목록을 불러오지 못했어요', getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [recipeId]);

  return <Screen><Header title="장보기 목록" subtitle={list?.recipeName} left={<IconButton label="←" onPress={() => goBack()} />} />
    {loading ? <ActivityIndicator color={palette.tomato} /> : list ? <>
      <Card><Text style={styles.estimateLabel}>부족한 재료 예상 금액</Text><Text style={styles.estimate}>{list.estimatedTotalCost.toLocaleString()}원</Text></Card>
      {list.shoppingItems.map((item) => <Card key={item.name}><View style={styles.itemHeader}><View><Text style={styles.itemName}>{item.name}</Text><Text style={styles.amount}>필요량 {item.requiredAmount}</Text></View><Text style={[styles.status, item.inFridge && styles.have]}>{item.inFridge ? '냉장고에 있음' : '구매 필요'}</Text></View>{item.products.map((product) => <Pressable key={product.productUrl} style={styles.product} onPress={() => Linking.openURL(product.productUrl)}><View><Text style={styles.mall}>{product.mallName}</Text><Text style={styles.productName}>{product.productName}</Text></View><View style={styles.productRight}><Text style={styles.price}>{product.price.toLocaleString()}원</Text><Text style={styles.open}>판매처 보기 ›</Text></View></Pressable>)}</Card>)}
      <View style={styles.notice}><Text style={styles.noticeText}>{list.disclaimer}</Text></View>
    </> : <View style={styles.empty}><Text style={styles.emptyTitle}>표시할 장보기 항목이 없어요</Text></View>}
  </Screen>;
}

const styles = StyleSheet.create({
  estimateLabel: { color: palette.muted, fontSize: 12 },
  estimate: { ...font.title, color: palette.ink, marginTop: 4 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { color: palette.ink, fontSize: 15, fontWeight: '600' },
  amount: { color: palette.muted, fontSize: 12, marginTop: 3 },
  status: { color: palette.tomato, backgroundColor: palette.tomatoSoft, overflow: 'hidden', borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 5, fontSize: 12, fontWeight: '600' },
  have: { color: palette.leaf, backgroundColor: palette.leafSoft },
  product: { marginTop: spacing.md, paddingTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mall: { color: palette.leaf, fontSize: 12, fontWeight: '600' },
  productName: { color: palette.ink, fontSize: 12, fontWeight: '500', marginTop: 3 },
  productRight: { alignItems: 'flex-end' },
  price: { color: palette.ink, fontSize: 12, fontWeight: '600' },
  open: { color: palette.muted, fontSize: 12, marginTop: 3 },
  notice: { backgroundColor: palette.surfaceWarm, borderRadius: radii.md, padding: spacing.md },
  noticeText: { ...font.caption, color: palette.muted },
  empty: { minHeight: 300, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { ...font.heading, color: palette.ink },
});
