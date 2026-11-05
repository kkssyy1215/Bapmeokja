import { createElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { radii } from '@/constants/design';
import { mapEmbedUrl, MapPoint } from '@/services/map-links';

export function StoreMap({ origin, store }: { origin: MapPoint; store: MapPoint }) {
  return (
    <View style={styles.map}>
      {createElement('iframe', { title: '식당 위치 지도', src: mapEmbedUrl(origin, store), style: { border: 0, width: '100%', height: '100%' }, loading: 'lazy' })}
    </View>
  );
}

const styles = StyleSheet.create({ map: { height: 210, borderRadius: radii.lg, overflow: 'hidden' } });
