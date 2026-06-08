import { MaterialCommunityIcons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import RestaurantHeroImage from './RestaurantHeroImage';
import { useLocalized } from '../hooks/useLocalized';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { fontFamilies } from '../theme/fonts';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';

interface FavoriteRestaurantRowProps {
  restaurant: Restaurant;
  onPress: () => void;
}

/**
 * Kompakte Favoriten-Zeile (76px Thumb, Meta, Fraunces-Name, Herz).
 */
const FavoriteRestaurantRow = memo(function FavoriteRestaurantRow({
  restaurant,
  onPress,
}: FavoriteRestaurantRowProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { venueTypeName, cuisineName } = useLocalized();

  const venueLabel = restaurant.venue_type ? venueTypeName(restaurant.venue_type) : null;
  const metaParts = [venueLabel, restaurant.city].filter(Boolean);
  const cuisines = restaurant.cuisine_types ?? [];
  const tagParts = [
    ...cuisines.slice(0, 2).map((code) => cuisineName(code)),
    t('card.badge_sin_gluten'),
  ].filter(Boolean);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={restaurant.name}
      android_ripple={{ color: colors.rippleLight }}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.thumb}>
        <RestaurantHeroImage restaurant={restaurant} iconSize={28} style={styles.thumbImage} />
      </View>

      <View style={styles.info}>
        {metaParts.length > 0 ? (
          <Text style={styles.meta} numberOfLines={1}>
            {metaParts.join(' · ')}
          </Text>
        ) : null}
        <Text style={styles.name} numberOfLines={2}>
          {restaurant.name}
        </Text>
        {tagParts.length > 0 ? (
          <Text style={styles.tag} numberOfLines={1}>
            {tagParts.join(' · ')}
          </Text>
        ) : null}
      </View>

      <View style={styles.heartWrap} pointerEvents="none">
        <MaterialCommunityIcons name="heart" size={22} color={colors.heart} />
      </View>
    </Pressable>
  );
});

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm + 2,
      paddingVertical: spacing.sm + 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.lineSoft,
    },
    rowPressed: {
      opacity: 0.92,
    },
    thumb: {
      width: 76,
      height: 76,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.surfaceAlt,
    },
    thumbImage: {
      width: 76,
      height: 76,
      borderRadius: radius.lg,
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    meta: {
      fontFamily: fontFamilies.mono,
      fontSize: 9,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    name: {
      fontFamily: fontFamilies.serif,
      fontSize: 18,
      letterSpacing: -0.35,
      lineHeight: 21,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    tag: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    heartWrap: {
      width: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default FavoriteRestaurantRow;
