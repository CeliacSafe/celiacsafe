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
  /** Editorial: Feed-Stil der Design-Vorlage (Buscar). */
  variant?: 'default' | 'editorial';
}

const MAX_CUISINE_TAGS = 3;

function RestaurantCard({
  restaurant,
  onPress,
  distanceKm = null,
  variant = 'default',
}: RestaurantCardProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { regionName, cuisineName, venueTypeName, description } = useLocalized();
  const isEditorial = variant === 'editorial';
  const showVerificationBadge =
    restaurant.face_program === true || restaurant.aoecs_certified === true;
  const regionLabel = regionName(restaurant.region_code);
  const venueLabel = restaurant.venue_type ? venueTypeName(restaurant.venue_type) : null;
  const cuisineTypes = restaurant.cuisine_types ?? [];
  const visibleCuisines = cuisineTypes.slice(0, MAX_CUISINE_TAGS);
  const hiddenCuisineCount = cuisineTypes.length - visibleCuisines.length;
  const distanceLabel =
    distanceKm != null ? formatDistanceKm(distanceKm, i18n.language) : null;
  const excerpt = description(restaurant);
  const metaParts = [venueLabel, restaurant.city, distanceLabel].filter(Boolean);
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
        <View style={[styles.imageContainer, isEditorial && styles.imageEditorial]}>
          <RestaurantHeroImage restaurant={restaurant} iconSize={64} />

          <View style={styles.badgeStack}>
            {restaurant.is_premium_partner === true ? (
              <BadgePill
                label={t('card.badge_premium')}
                variant="premium"
                iconName="star"
              />
            ) : null}
            {!isEditorial || !showVerificationBadge ? (
              <BadgePill
                label={t('card.badge_sin_gluten')}
                variant="sinGluten"
                iconName="check-circle"
              />
            ) : null}
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
          {isEditorial ? (
            <>
              <Text style={styles.metaLine}>{metaParts.join(' · ')}</Text>
              <Text style={styles.name}>{restaurant.name}</Text>
              {excerpt ? (
                <Text style={styles.excerpt} numberOfLines={2}>
                  {excerpt}
                </Text>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.location}>
                {restaurant.city} · {regionLabel}
                {distanceLabel ? ` · ${distanceLabel}` : ''}
              </Text>
              <Text style={styles.name}>{restaurant.name}</Text>

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
            </>
          )}
        </View>
      </Pressable>

      <HeartButton
        restaurantId={restaurant.id}
        variant="overlay"
        size={isEditorial ? 32 : 40}
        style={styles.heartButton}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginBottom: spacing.lg + spacing.xs,
  },
  card: {
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  cardPressed: {
    opacity: 0.92,
  },
  imageContainer: {
    height: 220,
    position: 'relative',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.card,
    overflow: 'hidden',
    ...shadows.small,
  },
  imageEditorial: {
    height: undefined,
    aspectRatio: 4 / 3,
  },
  badgeStack: {
    position: 'absolute',
    top: spacing.sm + spacing.xs,
    left: spacing.sm + spacing.xs,
    gap: spacing.xs,
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm + spacing.xs,
    right: spacing.sm + spacing.xs,
    zIndex: 2,
  },
  textContainer: {
    paddingTop: spacing.sm + spacing.xs,
    paddingBottom: spacing.xs,
  },
  name: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  location: {
    ...typography.overline,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metaLine: {
    ...typography.overline,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  excerpt: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 19,
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
  prev.restaurant.id === next.restaurant.id &&
  prev.distanceKm === next.distanceKm &&
  prev.variant === next.variant
);

// i18n-migrated
