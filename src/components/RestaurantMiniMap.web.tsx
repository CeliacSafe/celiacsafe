import { memo } from 'react';
import { StyleSheet } from 'react-native';

import StaticOsmMapImage from './StaticOsmMapImage';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';
import { restaurantHasMapCoordinates } from '../utils/platformLinks';

interface RestaurantMiniMapProps {
  restaurant: Restaurant;
  onPress?: () => void;
}

const MINI_DELTA = 0.012;

const RestaurantMiniMap = memo(function RestaurantMiniMap({
  restaurant,
  onPress,
}: RestaurantMiniMapProps) {
  const styles = useThemedStyles(createStyles);

  if (!restaurantHasMapCoordinates(restaurant)) {
    return null;
  }

  return (
    <StaticOsmMapImage
      latitude={restaurant.latitude!}
      longitude={restaurant.longitude!}
      height={120}
      latitudeDelta={MINI_DELTA}
      onPress={onPress}
      style={styles.wrap}
    />
  );
});

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrap: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.cuisineSurface,
  },
});

export default RestaurantMiniMap;
