import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { getVenueTypeIconName } from '../constants/venueTypeIcons';
import type { VenueType } from '../types/Restaurant';
import { PLACEHOLDER_ICON_COLOR, getPlaceholderGradientColors } from '../theme/placeholderGradient';

interface RestaurantImagePlaceholderProps {
  restaurantId: string;
  venueType?: VenueType;
  iconSize: number;
  style?: StyleProp<ViewStyle>;
}

function RestaurantImagePlaceholder({
  restaurantId,
  venueType,
  iconSize,
  style,
}: RestaurantImagePlaceholderProps) {
  const gradientColors = getPlaceholderGradientColors(restaurantId);
  const iconName = getVenueTypeIconName(venueType);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fill, style]}
    >
      <MaterialCommunityIcons name={iconName} size={iconSize} color={PLACEHOLDER_ICON_COLOR} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RestaurantImagePlaceholder;
