import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { radii } from '@/constants/design';
import { mapEmbedUrl, MapPoint } from '@/services/map-links';

export function StoreMap({ origin, store }: { origin: MapPoint; store: MapPoint }) {
  return (
    <View style={styles.map}>
      <WebView source={{ uri: mapEmbedUrl(origin, store) }} scrollEnabled={false} accessibilityLabel="식당 위치 지도" />
    </View>
  );
}

const styles = StyleSheet.create({ map: { height: 210, borderRadius: radii.lg, overflow: 'hidden' } });
