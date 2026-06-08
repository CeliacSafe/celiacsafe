import { MaterialCommunityIcons } from '@expo/vector-icons';
import { hapticLight, hapticSuccess } from '../utils/haptics';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useFavoritesStore } from '../store/favoritesStore';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';

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
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
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

    if (activating) {
      hapticSuccess();
    } else {
      hapticLight();
    }
    toggleFavorite(restaurantId);
    onPressed?.();
  };

  const inactiveColor = variant === 'overlay' ? colors.white : colors.textSecondary;

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? t('favorites.remove') : t('favorites.add')}
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

const createStyles = (colors: AppColors) => StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: colors.overlayDark,
  },
});

export default HeartButton;
