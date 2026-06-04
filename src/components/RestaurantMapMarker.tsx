import { memo, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Marker } from 'react-native-maps';

import CustomMarker from './CustomMarker';
import type { Restaurant } from '../types/Restaurant';

interface RestaurantMapMarkerProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onPress: (restaurantId: string) => void;
}

/**
 * Einzelner Karten-Marker — memoized, damit nicht alle 107 Pins bei jedem Render neu mounten.
 */
const RestaurantMapMarker = memo(function MapRestaurantMarker({
  restaurant,
  isSelected,
  onPress,
}: RestaurantMapMarkerProps) {
  const coordinate = useMemo(
    () => ({
      latitude: restaurant.latitude!,
      longitude: restaurant.longitude!,
    }),
    [restaurant.latitude, restaurant.longitude]
  );

  const [tracksViewChanges, setTracksViewChanges] = useState(Platform.OS === 'android');

  useEffect(() => {
    if (!tracksViewChanges) {
      return;
    }
    const timer = setTimeout(() => setTracksViewChanges(false), 600);
    return () => clearTimeout(timer);
  }, [tracksViewChanges, isSelected]);

  return (
    <Marker
      identifier={restaurant.id}
      coordinate={coordinate}
      onPress={() => onPress(restaurant.id)}
      tracksViewChanges={tracksViewChanges}
    >
      <CustomMarker isSelected={isSelected} />
    </Marker>
  );
});

export default RestaurantMapMarker;
