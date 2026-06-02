import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import RestaurantCard from './RestaurantCard';
import type { AppLanguage } from '../i18n/getLocalizedName';
import { useFavoritesStore } from '../store/favoritesStore';
import { colors } from '../theme/colors';
import { SPACE_SM } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

interface SwipeableRestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  language?: AppLanguage;
}

const REMOVE_LABELS: Record<AppLanguage, string> = {
  es: 'Eliminar',
  en: 'Remove',
  de: 'Entfernen',
};

const ACTION_WIDTH = 80;

/**
 * RestaurantCard mit Swipe-to-Remove fuer die Favoriten-Liste.
 */
function SwipeableRestaurantCard({
  restaurant,
  onPress,
  language = 'es',
}: SwipeableRestaurantCardProps) {
  const swipeRef = useRef<Swipeable>(null);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  const handleRemove = useCallback(() => {
    removeFavorite(restaurant.id);
    swipeRef.current?.close();
  }, [removeFavorite, restaurant.id]);

  const renderRightActions = useCallback(
    () => (
      <Pressable
        onPress={handleRemove}
        accessibilityRole="button"
        accessibilityLabel={REMOVE_LABELS[language]}
        style={styles.deleteAction}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={24} color={colors.white} />
        <Text style={styles.deleteLabel}>{REMOVE_LABELS[language]}</Text>
      </Pressable>
    ),
    [handleRemove, language]
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      onSwipeableRightOpen={handleRemove}
      overshootRight={false}
      friction={2}
    >
      <RestaurantCard restaurant={restaurant} onPress={onPress} language={language} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  deleteAction: {
    width: ACTION_WIDTH,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteLabel: {
    marginTop: SPACE_SM - 4,
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SwipeableRestaurantCard;
