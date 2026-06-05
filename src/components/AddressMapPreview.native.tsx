import { Pressable, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import CustomMarker from './CustomMarker';
import { radius } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

interface AddressMapPreviewProps {
  restaurant: Restaurant;
  onPress: () => void;
}

const MAP_DELTA = 0.005;

export default function AddressMapPreview({ restaurant, onPress }: AddressMapPreviewProps) {
  const mapRegion = {
    latitude: restaurant.latitude!,
    longitude: restaurant.longitude!,
    latitudeDelta: MAP_DELTA,
    longitudeDelta: MAP_DELTA,
  };

  return (
    <Pressable onPress={onPress} style={styles.mapPressable}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.miniMap}
        region={mapRegion}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        pointerEvents="none"
      >
        <Marker
          coordinate={{
            latitude: restaurant.latitude!,
            longitude: restaurant.longitude!,
          }}
          tracksViewChanges={false}
        >
          <CustomMarker />
        </Marker>
      </MapView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mapPressable: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  miniMap: {
    width: '100%',
    height: 180,
  },
});
