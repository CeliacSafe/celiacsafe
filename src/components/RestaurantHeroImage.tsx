import { Image } from 'expo-image';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import type { Restaurant } from '../types/Restaurant';
import { getRestaurantDisplayImage } from '../utils/restaurantDisplayImage';

import RestaurantImagePlaceholder from './RestaurantImagePlaceholder';

interface RestaurantHeroImageProps {
  restaurant: Restaurant;
  iconSize: number;
  style?: StyleProp<ViewStyle>;
}

function RestaurantHeroImage({ restaurant, iconSize, style }: RestaurantHeroImageProps) {
  const source = getRestaurantDisplayImage(restaurant);

  if (source) {
    return (
      <Image
        source={source}
        style={[styles.fill, style]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <RestaurantImagePlaceholder
      restaurantId={restaurant.id}
      venueType={restaurant.venue_type}
      iconSize={iconSize}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    width: '100%',
    height: '100%',
  },
});

export default RestaurantHeroImage;
