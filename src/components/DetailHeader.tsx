import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import BadgePill from './BadgePill';
import HeartButton from './HeartButton';
import RestaurantImagePlaceholder from './RestaurantImagePlaceholder';
import { useLocalized } from '../hooks/useLocalized';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';

interface DetailHeaderProps {
  restaurant: Restaurant;
  onBack?: () => void;
}

const HERO_HEIGHT = 280;
const GRADIENT_HEIGHT = 100;

/**
 * Hero-Bereich der Detail-Seite: Bild, Badges, Favoriten- und Zurueck-Buttons, Name.
 */
function DetailHeader({ restaurant, onBack }: DetailHeaderProps) {
  const { t } = useTranslation();
  const { regionName } = useLocalized();
  const insets = useSafeAreaInsets();
  const showVerificationBadge =
    restaurant.face_program === true || restaurant.aoecs_certified === true;
  const regionLabel = regionName(restaurant.region_code);
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
          <RestaurantImagePlaceholder restaurantId={restaurant.id} iconSize={96} />
        )}

        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        <View style={[styles.topControls, { top: insets.top + spacing.cardPadding }]}>
          {onBack ? (
            <Pressable
              onPress={onBack}
              accessibilityLabel={t('common.back')}
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
  bottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: GRADIENT_HEIGHT,
  },
  topControls: {
    position: 'absolute',
    left: spacing.screenPadding,
    right: spacing.screenPadding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
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
    left: spacing.screenPadding,
    right: spacing.screenPadding,
    bottom: spacing.cardPadding,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  textBlock: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
  },
  name: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  locationRow: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  locationText: {
    ...typography.bodyLarge,
    flex: 1,
    color: colors.textSecondary,
  },
});

export default DetailHeader;

// i18n-migrated
