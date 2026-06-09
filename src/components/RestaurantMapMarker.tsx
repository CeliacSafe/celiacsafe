import { memo, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Callout, Marker } from 'react-native-maps';

import CustomMarker from './CustomMarker';
import MapMarkerCallout from './MapMarkerCallout';
import type { Restaurant } from '../types/Restaurant';

interface RestaurantMapMarkerProps {
  restaurant: Restaurant;
  venueTypeLabel: string | null;
  isSelected: boolean;
  onSelect: (restaurantId: string) => void;
  onRestaurantOpen: (restaurantId: string) => void;
}

/**
 * Einzelner Karten-Marker — memoized, damit nicht alle 107 Pins bei jedem Render neu mounten.
 */
const RestaurantMapMarker = memo(function MapRestaurantMarker({
  restaurant,
  venueTypeLabel,
  isSelected,
  onSelect,
  onRestaurantOpen,
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
      onPress={() => onSelect(restaurant.id)}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 1 }}
    >
      <CustomMarker
        isSelected={isSelected}
        isFeatured={restaurant.is_premium_partner === true}
      />
      <Callout tooltip={false}>
        <MapMarkerCallout
          name={restaurant.name}
          venueTypeLabel={venueTypeLabel}
          onNamePress={() => onRestaurantOpen(restaurant.id)}
        />
      </Callout>
    </Marker>
  );
});

export default RestaurantMapMarker;
