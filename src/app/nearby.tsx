import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState, Header, IconButton, PrimaryButton, Screen } from '@/components/ui';
import { font, palette, radii, spacing } from '@/constants/design';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { menuApi } from '@/services/bapmeokja-api';
import { NearbyStore } from '@/types/api';

const demoStores: NearbyStore[] = [
  { storeId: 'store_001', name: '그린볼 성수점', address: '서울 성동구 연무장길 21', lat: 37.5447, lng: 127.0557, distance: 230, menus: [{ name: '닭가슴살 포케', calorie: 520, price: 10900 }] },
  { storeId: 'store_002', name: '담백한상', address: '서울 성동구 아차산로 88', lat: 37.5454, lng: 127.0581, distance: 410, menus: [{ name: '순두부 정식', calorie: 480, price: 10000 }] },
  { storeId: 'store_003', name: '샌드키친', address: '서울 성동구 성수이로 64', lat: 37.5439, lng: 127.0568, distance: 560, menus: [{ name: '에그 샌드위치', calorie: 455, price: 9500 }] },
];

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.9780 };
type LocationMode = 'checking' | 'device' | 'demo' | 'unavailable' | 'error';

function getDevicePosition() {
  return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('이 기기에서는 위치 기능을 사용할 수 없어요.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (result) => resolve({ lat: result.coords.latitude, lng: result.coords.longitude }),
      (error) => reject(new Error(error.code === 1 ? '위치 권한이 허용되지 않았어요.' : '현재 위치를 확인하지 못했어요.')),
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 60_000 },
    );
  });
}

export default function NearbyScreen() {
  const { categoryId = 'cat_001' } = useLocalSearchParams<{ categoryId?: string }>();
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationMode, setLocationMode] = useState<LocationMode>('checking');
  const [message, setMessage] = useState('');

  const findFromDevice = useCallback(async () => {
    setLoading(true);
    setLocationMode('checking');
    setMessage('');
    let position: { lat: number; lng: number };
    try {
      position = await getDevicePosition();
    } catch (error) {
      setStores([]);
      setLocationMode('unavailable');
      setMessage(error instanceof Error ? error.message : '현재 위치를 확인하지 못했어요.');
      setLoading(false);
      return;
    }
    try {
      const result = await menuApi.nearbyStores({ ...position, categoryId, radius: 1500 });
      setStores(result.stores);
      setLocationMode('device');
    } catch (error) {
      setStores([]);
      setLocationMode('error');
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const useDemoPosition = useCallback(async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await menuApi.nearbyStores({ ...SEOUL_CITY_HALL, categoryId, radius: 1500 });
      setStores(result.stores);
      setLocationMode('demo');
      setMessage('현재 위치 대신 서울시청을 기준으로 검색한 시연 결과예요.');
    } catch (error) {
      setStores([]);
      setLocationMode('error');
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (isMockMode) {
        setLoading(true);
        simulateRequest(demoStores, 450).then((result) => {
          if (cancelled) return;
          setStores(result);
          setLocationMode('demo');
          setMessage('실제 위치가 아닌 성수동 시연 데이터로 매장 화면을 보여드리고 있어요.');
        }).finally(() => !cancelled && setLoading(false));
        return;
      }
      findFromDevice();
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [findFromDevice]);

  const mapLabel = locationMode === 'device' ? '현재 위치' : locationMode === 'demo' ? '시연 위치' : '위치 미확인';
  const mapTitle = locationMode === 'device' ? '내 위치를 확인했어요' : locationMode === 'demo' ? '기본 시연 위치로 보고 있어요' : '현재 위치를 확인할 수 없어요';

  return <Screen><Header title="주변 식당" subtitle="추천 메뉴를 판매하는 가까운 매장" left={<IconButton label="←" onPress={() => router.back()} />} />
    <View style={styles.mapPlaceholder}><View style={[styles.mapCircle, locationMode !== 'device' && styles.mapCircleDemo]}><Text style={styles.mapCircleText}>{mapLabel}</Text></View><Text style={styles.mapTitle}>{mapTitle}</Text><Text style={styles.mapText}>{locationMode === 'device' ? '지도 API 키가 설정되면 현재 위치와 매장이 여기에 표시됩니다.' : message || '위치 권한을 확인한 뒤 다시 시도해 주세요.'}</Text></View>
    {(locationMode === 'unavailable' || locationMode === 'error') && !loading ? <View style={styles.locationHelp}><Text style={styles.locationHelpTitle}>{locationMode === 'unavailable' ? '위치 확인이 필요해요' : '매장 정보를 불러오지 못했어요'}</Text><Text style={styles.locationHelpText}>{message} 위치 권한을 확인해 다시 시도하거나, 서울시청 기준 시연 위치를 직접 선택할 수 있어요.</Text><View style={styles.locationActions}><View style={styles.flex}><PrimaryButton title="다시 확인" variant="secondary" onPress={findFromDevice} /></View><View style={styles.flex}><PrimaryButton title="시연 위치 사용" onPress={useDemoPosition} /></View></View></View> : null}
    {locationMode === 'demo' && !loading ? <View style={styles.demoNotice}><Text style={styles.demoNoticeText}>{message}</Text>{!isMockMode ? <Text style={styles.useLocation} onPress={findFromDevice}>현재 위치 다시 확인</Text> : null}</View> : null}
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>가까운 매장</Text><Text style={styles.count}>{stores.length}곳</Text></View>
    {loading ? <ActivityIndicator color={palette.tomato} /> : stores.length ? stores.map((store, index) => <Card key={store.storeId}><View style={styles.storeHeader}><View style={[styles.rank, index === 0 && styles.rankFirst]}><Text style={styles.rankText}>{index + 1}</Text></View><View style={styles.storeInfo}><Text style={styles.storeName}>{store.name}</Text><Text style={styles.address}>{store.address}</Text></View><Text style={styles.distance}>{store.distance < 1000 ? `${store.distance}m` : `${(store.distance / 1000).toFixed(1)}km`}</Text></View>{store.menus.map((menu) => <View key={menu.name} style={styles.menu}><View><Text style={styles.menuName}>{menu.name}</Text><Text style={styles.menuCalorie}>{menu.calorie} kcal</Text></View><Text style={styles.price}>{menu.price.toLocaleString()}원</Text></View>)}</Card>) : <Card><EmptyState emoji="⌖" title="주변에 적합한 식당이 없어요" description="검색 반경을 넓히거나 다른 메뉴를 선택해 보세요." /></Card>}
  </Screen>;
}

const styles = StyleSheet.create({
  mapPlaceholder: { minHeight: 210, borderRadius: radii.xl, backgroundColor: '#E8E5DD', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  mapCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(85,134,216,.18)', borderWidth: 1, borderColor: palette.blue, alignItems: 'center', justifyContent: 'center' },
  mapCircleDemo: { backgroundColor: palette.yellowSoft, borderColor: palette.yellow },
  mapCircleText: { color: palette.blue, fontSize: 11, fontWeight: '900' },
  mapTitle: { ...font.subheading, color: palette.ink, marginTop: spacing.md },
  mapText: { ...font.caption, color: palette.muted, textAlign: 'center', marginTop: 4 },
  locationHelp: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.line, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm },
  locationHelpTitle: { color: palette.ink, fontSize: 14, fontWeight: '900' },
  locationHelpText: { ...font.caption, color: palette.muted, lineHeight: 18 },
  locationActions: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  demoNotice: { backgroundColor: palette.yellowSoft, borderRadius: radii.md, padding: spacing.md, flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  demoNoticeText: { ...font.caption, color: '#6E5B34', flex: 1, lineHeight: 17 },
  useLocation: { color: palette.tomato, fontSize: 10, fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...font.heading, color: palette.ink },
  count: { color: palette.muted, fontSize: 11 },
  storeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rank: { width: 28, height: 28, borderRadius: 14, backgroundColor: palette.ink, alignItems: 'center', justifyContent: 'center' },
  rankFirst: { backgroundColor: palette.tomato },
  rankText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  storeInfo: { flex: 1 },
  storeName: { color: palette.ink, fontWeight: '900' },
  address: { color: palette.muted, fontSize: 10, marginTop: 3 },
  distance: { color: palette.leaf, fontSize: 11, fontWeight: '900' },
  menu: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: palette.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuName: { color: palette.ink, fontSize: 12, fontWeight: '800' },
  menuCalorie: { color: palette.muted, fontSize: 10, marginTop: 3 },
  price: { color: palette.ink, fontSize: 12, fontWeight: '900' },
});
