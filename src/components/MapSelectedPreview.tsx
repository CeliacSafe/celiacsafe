import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import RestaurantHeroImage from './RestaurantHeroImage';
import { useUserLocation } from '../hooks/useUserLocation';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { fontFamilies } from '../theme/fonts';
import { radius, shadows, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';
import { hapticLight } from '../utils/haptics';
import { formatDistanceKm, restaurantDistanceKm } from '../utils/restaurantDistance';

interface MapSelectedPreviewProps {
  restaurant: Restaurant | null;
  onPress: (restaurantId: string) => void;
  bottomInset?: number;
}

function MapSelectedPreview({ restaurant, onPress, bottomInset = 0 }: MapSelectedPreviewProps) {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { location } = useUserLocation();

  if (!restaurant) {
    return null;
  }

  const distanceKm =
    location != null
      ? restaurantDistanceKm(restaurant, location.latitude, location.longitude)
      : null;
  const distanceLabel =
    distanceKm != null ? formatDistanceKm(distanceKm, i18n.language) : null;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(bottomInset, spacing.md) }]}>
      <Pressable
        onPress={() => {
          hapticLight();
          onPress(restaurant.id);
        }}
        accessibilityRole="button"
        accessibilityLabel={t('map.view_detail')}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={styles.imageWrap}>
          <RestaurantHeroImage restaurant={restaurant} iconSize={28} style={styles.image} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[restaurant.city, distanceLabel].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <View style={styles.cta}>
          <Text style={styles.ctaLabel}>{t('map.view_detail')}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.primary} />
        </View>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    wrap: {
      position: 'absolute',
      left: spacing.screenPadding,
      right: spacing.screenPadding,
      bottom: 0,
      zIndex: 40,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.background,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: colors.lineSoft,
      padding: spacing.sm,
      ...shadows.large,
    },
    cardPressed: {
      opacity: 0.92,
    },
    imageWrap: {
      width: 72,
      height: 72,
      borderRadius: radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.surfaceAlt,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    textWrap: {
      flex: 1,
      minWidth: 0,
      gap: spacing.xs,
    },
    name: {
      fontFamily: fontFamilies.sansSemiBold,
      fontSize: 16,
      lineHeight: 20,
      color: colors.textPrimary,
    },
    meta: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    cta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingRight: spacing.xs,
    },
    ctaLabel: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.primary,
    },
  });

export default MapSelectedPreview;
