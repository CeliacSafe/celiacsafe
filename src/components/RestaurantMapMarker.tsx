import { memo, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Marker } from 'react-native-maps';

import CustomMarker from './CustomMarker';
import type { Restaurant } from '../types/Restaurant';
import { getMapPinStyle } from '../utils/mapPinStyle';

interface RestaurantMapMarkerProps {
  restaurant: Restaurant;
  isSelected: boolean;
  onSelect: (restaurantId: string) => void;
}

/**
 * Einzelner Karten-Marker — memoized, damit nicht alle Pins bei jedem Render neu mounten.
 */
const RestaurantMapMarker = memo(function MapRestaurantMarker({
  restaurant,
  isSelected,
  onSelect,
}: RestaurantMapMarkerProps) {
  const pinStyle = useMemo(() => getMapPinStyle(restaurant), [restaurant]);

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
  }, [tracksViewChanges, isSelected, pinStyle.fill]);

  return (
    <Marker
      identifier={restaurant.id}
      coordinate={coordinate}
      onPress={() => onSelect(restaurant.id)}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 1 }}
    >
      <CustomMarker
        pinStyle={pinStyle}
        isSelected={isSelected}
        isFeatured={restaurant.is_premium_partner === true}
      />
    </Marker>
  );
});

export default RestaurantMapMarker;
