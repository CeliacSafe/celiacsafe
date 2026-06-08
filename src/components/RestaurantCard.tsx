import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BadgePill from './BadgePill';
import HeartButton from './HeartButton';
import RestaurantHeroImage from './RestaurantHeroImage';
import RestaurantMiniMap from './RestaurantMiniMap';
import { useLocalized } from '../hooks/useLocalized';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, shadows, spacing } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';
import { formatDistanceKm } from '../utils/restaurantDistance';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  /** Entfernung zum Nutzer in km — wird neben dem Ort angezeigt. */
  distanceKm?: number | null;
}

const MAX_CUISINE_TAGS = 3;

function RestaurantCard({ restaurant, onPress, distanceKm = null }: RestaurantCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { regionName, cuisineName } = useLocalized();
  const showVerificationBadge =
    restaurant.face_program === true || restaurant.aoecs_certified === true;
  const regionLabel = regionName(restaurant.region_code);
  const cuisineTypes = restaurant.cuisine_types ?? [];
  const visibleCuisines = cuisineTypes.slice(0, MAX_CUISINE_TAGS);
  const hiddenCuisineCount = cuisineTypes.length - visibleCuisines.length;
  const distanceLabel =
    distanceKm != null ? formatDistanceKm(distanceKm, i18n.language) : null;
  const accessibilityLabel = `${restaurant.name}, ${restaurant.city}, 100 Prozent glutenfrei`;

  return (
    <View style={styles.cardWrapper}>
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        android_ripple={{ color: colors.rippleLight }}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.imageContainer}>
          <RestaurantHeroImage restaurant={restaurant} iconSize={64} />

          <View style={styles.badgeStack}>
            {restaurant.is_premium_partner === true ? (
              <BadgePill
                label={t('card.badge_premium')}
                variant="premium"
                iconName="star"
              />
            ) : null}
            <BadgePill
              label={t('card.badge_sin_gluten')}
              variant="sinGluten"
              iconName="check-circle"
            />
            {showVerificationBadge ? (
              <BadgePill
                label={t('card.badge_verified')}
                variant="verified"
                iconName="shield-check"
              />
            ) : null}
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.location}>
            {restaurant.city} · {regionLabel}
            {distanceLabel ? ` · ${distanceLabel}` : ''}
          </Text>

          <RestaurantMiniMap restaurant={restaurant} onPress={onPress} />

          {(visibleCuisines.length > 0 || hiddenCuisineCount > 0) && (
            <View style={styles.tagRow}>
              {visibleCuisines.map((cuisine) => (
                <BadgePill key={cuisine} label={cuisineName(cuisine)} variant="cuisine" />
              ))}
              {hiddenCuisineCount > 0 ? (
                <BadgePill label={`+${hiddenCuisineCount}`} variant="cuisine" />
              ) : null}
            </View>
          )}

          {restaurant.price_range ? (
            <View style={styles.priceRow}>
              <BadgePill label={restaurant.price_range} variant="priceRange" />
            </View>
          ) : null}
        </View>
      </Pressable>

      <HeartButton restaurantId={restaurant.id} variant="overlay" style={styles.heartButton} />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.medium,
  },
  cardPressed: {
    opacity: 0.85,
  },
  imageContainer: {
    height: 220,
    position: 'relative',
    backgroundColor: colors.background,
  },
  badgeStack: {
    position: 'absolute',
    top: spacing.cardPadding,
    left: spacing.cardPadding,
    gap: spacing.xs,
  },
  heartButton: {
    position: 'absolute',
    top: spacing.cardPadding,
    right: spacing.cardPadding,
    zIndex: 2,
  },
  textContainer: {
    padding: spacing.md,
  },
  name: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  location: {
    ...typography.body,
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  priceRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
  },
});

export default memo(RestaurantCard, (prev, next) =>
  prev.restaurant.id === next.restaurant.id && prev.distanceKm === next.distanceKm
);

// i18n-migrated
