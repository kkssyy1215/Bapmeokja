import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { radii } from '@/constants/design';
import { kakaoJsKey, kakaoMapHtml } from '@/services/kakao-map';
import { MapPoint } from '@/services/map-links';

// 카카오 콘솔에 등록한 웹 주소. WebView 안 지도도 이 주소에서 연 것처럼 동작해야 SDK가 허용한다.
const KAKAO_MAP_BASE_URL = 'https://bapmeokja-web.vercel.app';

export function StoreMap({ origin, store }: { origin: MapPoint; store: MapPoint & { name?: string } }) {
  if (!kakaoJsKey) return null;
  return (
    <View style={styles.map}>
      <WebView source={{ html: kakaoMapHtml(origin, store), baseUrl: KAKAO_MAP_BASE_URL }} scrollEnabled={false} accessibilityLabel="식당 위치 지도" />
    </View>
  );
}

const styles = StyleSheet.create({ map: { height: 210, borderRadius: radii.lg, overflow: 'hidden' } });
