import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BadgePill from './BadgePill';
import HeartButton from './HeartButton';
import { getLocalizedName, type AppLanguage } from '../i18n/getLocalizedName';
import { REGION_NAMES } from '../i18n/regions';
import { colors } from '../theme/colors';
import { RADIUS_BUTTON } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

interface DetailHeaderProps {
  restaurant: Restaurant;
  onBack?: () => void;
  language?: AppLanguage;
}

const HERO_HEIGHT = 280;
const GRADIENT_HEIGHT = 100;

/**
 * Hero-Bereich der Detail-Seite: Bild, Badges, Favoriten- und Zurueck-Buttons, Name.
 */
function DetailHeader({ restaurant, onBack, language = 'es' }: DetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const showVerificationBadge =
    restaurant.face_program === true || restaurant.aoecs_certified === true;
  const regionLabel = getLocalizedName(REGION_NAMES, restaurant.region_code, language);
  const hasImage = Boolean(restaurant.featured_image_url?.trim());

  return (
    <View style={styles.wrapper}>
      <View style={styles.imageContainer}>
        {hasImage ? (
          <Image
            source={{ uri: restaurant.featured_image_url }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <LinearGradient
            colors={[colors.surface, colors.background]}
            style={styles.placeholderGradient}
          >
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={96}
              color={colors.textSecondary}
            />
          </LinearGradient>
        )}

        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        <View style={[styles.topControls, { top: insets.top + SPACE_MD }]}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityLabel="Volver"
              accessibilityRole="button"
              style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
            >
              <MaterialCommunityIcons name="arrow-left" size={22} color={colors.white} />
            </Pressable>
          ) : (
            <View style={styles.iconSpacer} />
          )}

          <HeartButton restaurantId={restaurant.id} variant="overlay" />
        </View>

        <View style={styles.badgeOverlay}>
          <BadgePill label="100% SIN GLUTEN" variant="sinGluten" iconName="check-circle" />
          {showVerificationBadge ? (
            <BadgePill label="VERIFICACIÓN OFICIAL" variant="verified" iconName="shield-check" />
          ) : null}
          {restaurant.price_range ? (
            <BadgePill label={restaurant.price_range} variant="priceRange" />
          ) : null}
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={colors.primary} />
          <Text style={styles.locationText}>
            {restaurant.city} · {regionLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  imageContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
    backgroundColor: colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: GRADIENT_HEIGHT,
  },
  topControls: {
    position: 'absolute',
    left: SPACE_XL,
    right: SPACE_XL,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS_BUTTON,
    backgroundColor: colors.overlayDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: {
    width: 40,
    height: 40,
  },
  iconPressed: {
    opacity: 0.85,
  },
  badgeOverlay: {
    position: 'absolute',
    left: SPACE_XL,
    right: SPACE_XL,
    bottom: SPACE_MD,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACE_SM - 2,
  },
  textBlock: {
    paddingHorizontal: SPACE_XL,
    paddingVertical: SPACE_LG,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  locationRow: {
    marginTop: SPACE_SM,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_SM - 2,
  },
  locationText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default DetailHeader;
