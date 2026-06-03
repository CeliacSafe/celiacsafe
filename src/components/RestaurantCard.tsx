import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BadgePill from './BadgePill';
import HeartButton from './HeartButton';
import { useLocalized } from '../hooks/useLocalized';
import { colors } from '../theme/colors';
import { RADIUS_CARD } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XS } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

const MAX_CUISINE_TAGS = 3;

function RestaurantCard({ restaurant, onPress }: RestaurantCardProps) {
  const { t } = useTranslation();
  const { regionName, cuisineName } = useLocalized();
  const showVerificationBadge =
    restaurant.face_program === true || restaurant.aoecs_certified === true;
  const regionLabel = regionName(restaurant.region_code);
  const cuisineTypes = restaurant.cuisine_types ?? [];
  const visibleCuisines = cuisineTypes.slice(0, MAX_CUISINE_TAGS);
  const hiddenCuisineCount = cuisineTypes.length - visibleCuisines.length;
  const hasImage = Boolean(restaurant.featured_image_url?.trim());

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
          {hasImage ? (
            <Image
              source={{ uri: restaurant.featured_image_url }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons
                name="silverware-fork-knife"
                size={48}
                color={colors.textSecondary}
              />
            </View>
          )}

          <View style={styles.badgeStack}>
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
          </Text>

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

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginBottom: SPACE_LG,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS_CARD,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.85,
  },
  imageContainer: {
    height: 220,
    position: 'relative',
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  badgeStack: {
    position: 'absolute',
    top: SPACE_MD,
    left: SPACE_MD,
    gap: SPACE_SM - 2,
  },
  heartButton: {
    position: 'absolute',
    top: SPACE_MD,
    right: SPACE_MD,
    zIndex: 2,
  },
  textContainer: {
    padding: SPACE_LG,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-medium' }),
  },
  location: {
    marginTop: SPACE_XS,
    color: colors.textSecondary,
    fontSize: 14,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACE_SM - 2,
    marginTop: SPACE_SM,
  },
  priceRow: {
    marginTop: SPACE_SM,
    flexDirection: 'row',
  },
});

export default RestaurantCard;

// i18n-migrated
