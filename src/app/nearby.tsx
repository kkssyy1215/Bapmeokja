import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { StoreMap } from '@/components/store-map';
import { Card, EmptyState, Header, Icon, IconButton, Note, PrimaryButton, Pressable, Screen } from '@/components/ui';
import { font, palette, radii, shadow, spacing } from '@/constants/design';
import { getErrorMessage, isMockMode, simulateRequest } from '@/services/api';
import { goBack } from '@/services/navigation';
import { menuApi } from '@/services/bapmeokja-api';
import { directionsUrl, MapPoint, naverSearchAppUrl, naverSearchWebUrl, walkingMinutes } from '@/services/map-links';
import { NearbyStore } from '@/types/api';

const demoStores: NearbyStore[] = [
  { storeId: 'store_001', name: '그린볼 성수점', address: '서울 성동구 연무장길 21', lat: 37.5447, lng: 127.0557, distance: 230, menus: [{ name: '닭가슴살 포케', calorie: 520, price: 10900 }] },
  { storeId: 'store_002', name: '담백한상', address: '서울 성동구 아차산로 88', lat: 37.5454, lng: 127.0581, distance: 410, menus: [{ name: '순두부 정식', calorie: 480, price: 10000 }] },
  { storeId: 'store_003', name: '샌드키친', address: '서울 성동구 성수이로 64', lat: 37.5439, lng: 127.0568, distance: 560, menus: [{ name: '에그 샌드위치', calorie: 455, price: 9500 }] },
];

// 등록된 매장이 강남역 주변이라 위치를 쓸 수 없을 때 이곳을 기준으로 보여 준다.
const DEMO_POSITION = { lat: 37.4979, lng: 127.0276 };
const MOCK_POSITION = { lat: 37.5446, lng: 127.056 };
type LocationMode = 'checking' | 'device' | 'demo' | 'unavailable' | 'error';

async function getDevicePosition() {
  if (Platform.OS === 'web') {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('이 브라우저에서는 위치 기능을 사용할 수 없어요.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (result) => resolve({ lat: result.coords.latitude, lng: result.coords.longitude }),
        (error) => reject(new Error(error.code === 1 ? '위치 권한이 허용되지 않았어요.' : '현재 위치를 확인하지 못했어요.')),
        { enableHighAccuracy: false, timeout: 7000, maximumAge: 60_000 },
      );
    });
  }

  let permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted) permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) throw new Error('위치 권한이 허용되지 않았어요.');

  const cached = await Location.getLastKnownPositionAsync({ maxAge: 60_000, requiredAccuracy: 1_000 });
  const result = cached ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return { lat: result.coords.latitude, lng: result.coords.longitude };
}

async function openNaverSearch(query: string) {
  try {
    if (Platform.OS !== 'web') {
      // 앱이 있으면 내 위치 기준으로 열리고, 없으면 웹으로 연다.
      try { await Linking.openURL(naverSearchAppUrl(query)); return; } catch { /* 웹으로 연다 */ }
    }
    await Linking.openURL(naverSearchWebUrl(query));
  } catch {
    Alert.alert('네이버 지도를 열지 못했어요', '잠시 후 다시 시도해 주세요.');
  }
}

async function openDirections(origin: MapPoint, store: NearbyStore) {
  try {
    await Linking.openURL(directionsUrl(origin, store));
  } catch {
    Alert.alert('길찾기를 열지 못했어요', store.address);
  }
}

export default function NearbyScreen() {
  const { categoryId = 'cat_001', categoryName = '맛집' } = useLocalSearchParams<{ categoryId?: string; categoryName?: string }>();
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationMode, setLocationMode] = useState<LocationMode>('checking');
  const [message, setMessage] = useState('');
  const [position, setPosition] = useState<MapPoint | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const findFromDevice = useCallback(async () => {
    setLoading(true);
    setLocationMode('checking');
    setMessage('');
    let current: MapPoint;
    try {
      current = await getDevicePosition();
      setPosition(current);
    } catch (error) {
      setStores([]);
      setLocationMode('unavailable');
      setMessage(error instanceof Error ? error.message : '현재 위치를 확인하지 못했어요.');
      setLoading(false);
      return;
    }
    try {
      const result = await menuApi.nearbyStores({ ...current, categoryId, radius: 1500 });
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
    setPosition(DEMO_POSITION);
    try {
      const result = await menuApi.nearbyStores({ ...DEMO_POSITION, categoryId, radius: 1500 });
      setStores(result.stores);
      setLocationMode('demo');
      setMessage('현재 위치 대신 강남역을 기준으로 검색한 시연 결과예요.');
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
        setPosition(MOCK_POSITION);
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

  const selectedStore = stores.find((store) => store.storeId === selectedId) ?? stores[0];
  const mapLabel = locationMode === 'device' ? '현재 위치' : locationMode === 'demo' ? '시연 위치' : '위치 미확인';
  const mapTitle = locationMode === 'device' ? '내 위치를 확인했어요' : locationMode === 'demo' ? '기본 시연 위치로 보고 있어요' : '현재 위치를 확인할 수 없어요';

  return <Screen><Header title="주변 식당" subtitle={`${categoryName} 파는 식당`} left={<IconButton label="←" onPress={() => goBack()} />} />
    <PrimaryButton title={`네이버 지도에서 ${categoryName} 식당 보기`} icon="map" onPress={() => openNaverSearch(categoryName)} />
    <Note>네이버 지도에서 실제 식당과 영업 정보를 볼 수 있어요. 아래는 밥먹자에 등록된 매장이에요.</Note>
    {position && selectedStore ? <>
      <StoreMap origin={position} store={selectedStore} />
      <Text style={styles.mapCaption}>{mapLabel} 기준 · {selectedStore.name}까지 도보 약 {walkingMinutes(selectedStore.distance)}분</Text>
    </> : !loading ? <View style={styles.mapPlaceholder}><Text style={styles.mapTitle}>{mapTitle}</Text><Text style={styles.mapText}>{message || (locationMode === 'device' ? '이 근처에는 등록된 매장이 아직 없어요.' : '위치 권한을 확인한 뒤 다시 시도해 주세요.')}</Text>{locationMode === 'device' ? <View style={styles.mapAction}><PrimaryButton title="강남역 기준으로 보기" variant="secondary" onPress={useDemoPosition} /></View> : null}</View> : null}
    {(locationMode === 'unavailable' || locationMode === 'error') && !loading ? <View style={styles.locationHelp}><Text style={styles.locationHelpTitle}>{locationMode === 'unavailable' ? '위치 확인이 필요해요' : '매장 정보를 불러오지 못했어요'}</Text><Text style={styles.locationHelpText}>{message} 위치 권한을 확인해 다시 시도하거나, 강남역 기준 시연 위치를 직접 선택할 수 있어요.</Text><View style={styles.locationActions}><View style={styles.flex}><PrimaryButton title="다시 확인" variant="secondary" onPress={findFromDevice} /></View><View style={styles.flex}><PrimaryButton title="시연 위치 사용" onPress={useDemoPosition} /></View></View></View> : null}
    {locationMode === 'demo' && !loading && !isMockMode ? <Text accessibilityRole="button" style={styles.useLocation} onPress={findFromDevice}>현재 위치 다시 확인</Text> : null}
    <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>등록된 매장</Text><Text style={styles.count}>{stores.length}곳</Text></View>
    {loading ? <ActivityIndicator color={palette.tomato} /> : stores.length ? stores.map((store, index) => <Pressable key={store.storeId} accessibilityRole="button" accessibilityState={{ selected: store.storeId === selectedStore?.storeId }} onPress={() => setSelectedId(store.storeId)} style={[styles.store, store.storeId === selectedStore?.storeId && styles.storeSelected]}><View style={styles.storeHeader}><View style={[styles.rank, index === 0 && styles.rankFirst]}><Text style={[styles.rankText, index === 0 && styles.rankTextFirst]}>{index + 1}</Text></View><View style={styles.storeInfo}><Text style={styles.storeName}>{store.name}</Text><Text style={styles.address}>{store.address}</Text></View><Text style={styles.distance}>{store.distance < 1000 ? `${store.distance}m` : `${(store.distance / 1000).toFixed(1)}km`}</Text></View>{store.menus.map((menu) => <View key={menu.name} style={styles.menu}><View><Text style={styles.menuName}>{menu.name}</Text><Text style={styles.menuCalorie}>{menu.calorie} kcal</Text></View><Text style={styles.price}>{menu.price.toLocaleString()}원</Text></View>)}{position ? <Pressable accessibilityRole="link" onPress={() => openDirections(position, store)} style={styles.mapLink}><Icon name="navigation" size={15} color={palette.tomato} /><Text style={styles.mapLinkText}>내 위치에서 길찾기</Text></Pressable> : null}</Pressable>) : <Card><EmptyState icon="map-pin" title="주변에 적합한 식당이 없어요" description="검색 반경을 넓히거나 다른 메뉴를 선택해 보세요." /></Card>}
  </Screen>;
}

const styles = StyleSheet.create({
  store: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: 18, borderWidth: 1.5, borderColor: 'transparent', ...shadow },
  storeSelected: { borderColor: palette.tomatoFill },
  mapCaption: { color: palette.muted, fontSize: 13, textAlign: 'center' },
  mapAction: { alignSelf: 'stretch', marginTop: spacing.md },
  mapPlaceholder: { minHeight: 150, borderRadius: radii.lg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: palette.accentSoft },
  mapTitle: { ...font.subheading, color: palette.ink, marginTop: spacing.md },
  mapText: { ...font.caption, color: palette.muted, textAlign: 'center', marginTop: 4 },
  locationHelp: { backgroundColor: palette.surface, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm, ...shadow },
  locationHelpTitle: { color: palette.ink, fontSize: 14, fontWeight: '600' },
  locationHelpText: { ...font.caption, color: palette.muted, lineHeight: 18 },
  locationActions: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  useLocation: { color: palette.tomato, fontSize: 14, textAlign: 'center', paddingVertical: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { ...font.heading, color: palette.ink },
  count: { color: palette.muted, fontSize: 12 },
  storeHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rank: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.accentSoft },
  rankFirst: { backgroundColor: palette.accent },
  rankText: { fontSize: 13, fontWeight: '600', color: palette.tomato },
  rankTextFirst: { color: palette.onAccent },
  storeInfo: { flex: 1 },
  storeName: { color: palette.ink, fontWeight: '600' },
  address: { color: palette.muted, fontSize: 12, marginTop: 3 },
  distance: { color: palette.leaf, fontSize: 12, fontWeight: '600' },
  menu: { marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  menuName: { color: palette.ink, fontSize: 12, fontWeight: '500' },
  menuCalorie: { color: palette.muted, fontSize: 12, marginTop: 3 },
  price: { color: palette.ink, fontSize: 12, fontWeight: '600' },
  mapLink: { marginTop: spacing.md, minHeight: 44, flexDirection: 'row', gap: 6, borderRadius: radii.md, backgroundColor: palette.accentSoft, alignItems: 'center', justifyContent: 'center' },
  mapLinkText: { color: palette.tomato, fontSize: 14, fontWeight: '500' },
});
