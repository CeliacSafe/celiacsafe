import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTranslation } from 'react-i18next';

import RestaurantCard from './RestaurantCard';
import { useFavoritesStore } from '../store/favoritesStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';

interface SwipeableRestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

const ACTION_WIDTH = 80;

/**
 * RestaurantCard mit Swipe-to-Remove fuer die Favoriten-Liste.
 */
function SwipeableRestaurantCard({ restaurant, onPress }: SwipeableRestaurantCardProps) {
  const { t } = useTranslation();
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
        accessibilityLabel={t('favorites.remove')}
        style={styles.deleteAction}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={24} color={colors.white} />
        <Text style={styles.deleteLabel}>{t('favorites.remove')}</Text>
      </Pressable>
    ),
    [handleRemove, t]
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      onSwipeableRightOpen={handleRemove}
      overshootRight={false}
      friction={2}
    >
      <RestaurantCard restaurant={restaurant} onPress={onPress} />
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
    ...typography.caption,
    marginTop: spacing.xs,
    fontWeight: '600',
    color: colors.white,
  },
});

export default SwipeableRestaurantCard;

// i18n-migrated
