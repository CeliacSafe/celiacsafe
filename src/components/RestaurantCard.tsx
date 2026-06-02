import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import BadgePill from './BadgePill';
import { getLocalizedName } from '../i18n/getLocalizedName';
import { REGION_NAMES } from '../i18n/regions';
import { colors } from '../theme/colors';
import type { AppLanguage } from '../i18n/getLocalizedName';
import type { Restaurant } from '../types/Restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  language?: AppLanguage;
}

const MAX_CUISINE_TAGS = 3;

function RestaurantCard({
  restaurant,
  onPress,
  isFavorite = false,
  onToggleFavorite,
  language = 'es',
}: RestaurantCardProps) {
  const showVerificationBadge =
    restaurant.face_program === true || restaurant.aoecs_certified === true;
  const regionLabel = getLocalizedName(REGION_NAMES, restaurant.region_code, language);
  const cuisineTypes = restaurant.cuisine_types ?? [];
  const visibleCuisines = cuisineTypes.slice(0, MAX_CUISINE_TAGS);
  const hiddenCuisineCount = cuisineTypes.length - visibleCuisines.length;
  const hasImage = Boolean(restaurant.featured_image_url?.trim());

  const accessibilityLabel = `${restaurant.name}, ${restaurant.city}, 100 Prozent glutenfrei`;

  return (
    <View style={styles.cardWrapper}>
      {/* ── Pressable Card-Body ── */}
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        android_ripple={{ color: 'rgba(255, 255, 255, 0.12)' }}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        {/* ── Bild-Container ── */}
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

          {/* ── Badges oben links ── */}
          <View style={styles.badgeStack}>
            <BadgePill label="100% SIN GLUTEN" variant="sinGluten" iconName="check-circle" />
            {showVerificationBadge ? (
              <BadgePill label="VERIFICACIÓN OFICIAL" variant="verified" iconName="shield-check" />
            ) : null}
          </View>
        </View>

        {/* ── Text-Container ── */}
        <View style={styles.textContainer}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.location}>
            {restaurant.city} · {regionLabel}
          </Text>

          {(visibleCuisines.length > 0 || hiddenCuisineCount > 0) && (
            <View style={styles.tagRow}>
              {visibleCuisines.map((cuisine) => (
                <BadgePill key={cuisine} label={cuisine} variant="cuisine" />
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

      {/* ── Favoriten-Button (eigener Pressable, kein Card-Tap) ── */}
      <Pressable
        accessibilityLabel={isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
        accessibilityRole="button"
        disabled={!onToggleFavorite}
        hitSlop={8}
        onPress={(event) => {
          event.stopPropagation();
          onToggleFavorite?.();
        }}
        style={({ pressed }) => [styles.heartButton, pressed && styles.heartButtonPressed]}
      >
        <MaterialCommunityIcons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={22}
          color={isFavorite ? colors.heart : colors.textPrimary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
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
    top: 12,
    left: 12,
    gap: 6,
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000080',
  },
  heartButtonPressed: {
    opacity: 0.85,
  },
  textContainer: {
    padding: 16,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-medium' }),
  },
  location: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 14,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  priceRow: {
    marginTop: 8,
    flexDirection: 'row',
  },
});

export default RestaurantCard;
