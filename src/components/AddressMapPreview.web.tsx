import { StyleSheet } from 'react-native';

import StaticOsmMapImage from './StaticOsmMapImage';
import { radius } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

interface AddressMapPreviewProps {
  restaurant: Restaurant;
  onPress: () => void;
}

const MAP_DELTA = 0.005;

export default function AddressMapPreview({ restaurant, onPress }: AddressMapPreviewProps) {
  return (
    <StaticOsmMapImage
      latitude={restaurant.latitude!}
      longitude={restaurant.longitude!}
      height={180}
      latitudeDelta={MAP_DELTA}
      onPress={onPress}
      style={styles.mapPressable}
    />
  );
}

const styles = StyleSheet.create({
  mapPressable: {
    borderRadius: radius.lg,
  },
});
