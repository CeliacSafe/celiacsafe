import { memo, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import CustomMarker from './CustomMarker';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';
import { restaurantHasMapCoordinates } from '../utils/platformLinks';

interface RestaurantMiniMapProps {
  restaurant: Restaurant;
  onPress?: () => void;
}

const MINI_DELTA = {
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

const RestaurantMiniMap = memo(function RestaurantMiniMap({
  restaurant,
  onPress,
}: RestaurantMiniMapProps) {
  const region = useMemo(() => {
    if (!restaurantHasMapCoordinates(restaurant)) {
      return null;
    }
    return {
      latitude: restaurant.latitude!,
      longitude: restaurant.longitude!,
      ...MINI_DELTA,
    };
  }, [restaurant.latitude, restaurant.longitude]);

  const [tracksViewChanges, setTracksViewChanges] = useState(Platform.OS === 'android');

  useEffect(() => {
    if (!tracksViewChanges) {
      return;
    }
    const timer = setTimeout(() => setTracksViewChanges(false), 600);
    return () => clearTimeout(timer);
  }, [tracksViewChanges, region?.latitude, region?.longitude]);

  if (!region) {
    return null;
  }

  const map = (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={styles.map}
      region={region}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      pointerEvents="none"
      liteMode={Platform.OS === 'android'}
    >
      <Marker coordinate={region} tracksViewChanges={tracksViewChanges}>
        <CustomMarker />
      </Marker>
    </MapView>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.wrap} accessibilityRole="button">
        {map}
      </Pressable>
    );
  }

  return <View style={styles.wrap}>{map}</View>;
});

const styles = StyleSheet.create({
  wrap: {
    height: 120,
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.cuisineSurface,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default RestaurantMiniMap;
