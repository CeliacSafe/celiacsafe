import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { PLACEHOLDER_ICON_COLOR, getPlaceholderGradientColors } from '../theme/placeholderGradient';

interface RestaurantImagePlaceholderProps {
  restaurantId: string;
  iconSize: number;
  style?: StyleProp<ViewStyle>;
}

function RestaurantImagePlaceholder({
  restaurantId,
  iconSize,
  style,
}: RestaurantImagePlaceholderProps) {
  const gradientColors = getPlaceholderGradientColors(restaurantId);

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.fill, style]}
    >
      <MaterialCommunityIcons
        name="silverware-fork-knife"
        size={iconSize}
        color={PLACEHOLDER_ICON_COLOR}
      />
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
