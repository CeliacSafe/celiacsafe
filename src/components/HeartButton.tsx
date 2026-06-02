import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useFavoritesStore } from '../store/favoritesStore';
import { colors } from '../theme/colors';

interface HeartButtonProps {
  restaurantId: string;
  size?: number;
  variant?: 'overlay' | 'plain';
  onPressed?: () => void;
  style?: StyleProp<ViewStyle>;
}

const ICON_SIZE = 24;

/**
 * Favoriten-Heart mit Store-Anbindung, Haptik und Bounce-/Wiggle-Animation.
 */
function HeartButton({
  restaurantId,
  size = 40,
  variant = 'overlay',
  onPressed,
  style,
}: HeartButtonProps) {
  const isFavorite = useFavoritesStore((state) =>
    Object.prototype.hasOwnProperty.call(state.favorites, restaurantId)
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handlePress = () => {
    const activating = !isFavorite;

    scale.value = withSequence(
      withTiming(1.3, { duration: 150 }),
      withTiming(1.0, { duration: 150 })
    );

    if (activating) {
      rotation.value = withSequence(
        withTiming(-12, { duration: 75 }),
        withTiming(12, { duration: 75 }),
        withTiming(-6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    toggleFavorite(restaurantId);
    onPressed?.();
  };

  const inactiveColor = variant === 'overlay' ? colors.white : colors.textSecondary;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Anadir a favoritos'}
      style={style}
    >
      <Animated.View
        style={[
          styles.button,
          { width: size, height: size, borderRadius: size / 2 },
          variant === 'overlay' && styles.overlay,
          animatedStyle,
        ]}
      >
        <MaterialCommunityIcons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={ICON_SIZE}
          color={isFavorite ? colors.heart : inactiveColor}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: colors.overlayDark,
  },
});

export default HeartButton;
