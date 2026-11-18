import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { radii } from '@/constants/design';
import { drawKakaoStoreMap, kakaoJsKey, loadKakaoMaps } from '@/services/kakao-map';
import { MapPoint } from '@/services/map-links';

type Store = MapPoint & { name?: string };

/** 카카오맵으로 내 위치와 식당 위치를 보여 준다. 키가 없거나 지도를 불러오지 못하면 지도를 숨긴다. */
export function StoreMap({ origin, store }: { origin: MapPoint; store: Store }) {
  const ref = useRef<View>(null);
  const [failed, setFailed] = useState(!kakaoJsKey);
  const { lat: originLat, lng: originLng } = origin;
  const { lat: storeLat, lng: storeLng, name } = store;

  useEffect(() => {
    if (!kakaoJsKey) return;
    let cancelled = false;
    loadKakaoMaps()
      .then((kakao) => {
        const element = ref.current as unknown as HTMLElement | null;
        if (!cancelled && element) drawKakaoStoreMap(kakao, element, { lat: originLat, lng: originLng }, { lat: storeLat, lng: storeLng, name });
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [originLat, originLng, storeLat, storeLng, name]);

  if (failed) return null;
  return <View ref={ref} style={styles.map} accessibilityLabel="식당 위치 지도" />;
}

const styles = StyleSheet.create({ map: { height: 210, borderRadius: radii.lg, overflow: 'hidden' } });
