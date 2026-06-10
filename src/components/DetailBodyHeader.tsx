import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalized } from '../hooks/useLocalized';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { fontFamilies } from '../theme/fonts';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';
import type { RestaurantAllergens } from '../types/Restaurant';
import {
  getActiveAllergenKeys,
  getRestaurantCategory,
  isRestaurantCertified,
} from '../utils/restaurantFields';

interface DetailBodyHeaderProps {
  restaurant: Restaurant;
}

const CATEGORY_I18N: Record<
  ReturnType<typeof getRestaurantCategory>,
  string
> = {
  restaurant: 'detail.category_restaurant',
  bakery: 'detail.category_bakery',
  pizza: 'detail.category_pizza',
  cafe: 'detail.category_cafe',
  fastfood: 'detail.category_fastfood',
};

const ALLERGEN_I18N: Record<keyof RestaurantAllergens, string> = {
  sin_lactosa: 'detail.allergen_sin_lactosa',
  vegan: 'detail.allergen_vegan',
  sin_trigo: 'detail.allergen_sin_trigo',
};

const ALLERGEN_ICONS: Record<
  keyof RestaurantAllergens,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  sin_lactosa: 'cup-outline',
  vegan: 'leaf',
  sin_trigo: 'barley-off',
};

function formatLocationLine(restaurant: Restaurant): string {
  const street = restaurant.address_street?.trim();
  const city = restaurant.city?.trim();
  if (street && city) {
    return `${street} · ${city}`;
  }
  return street ?? city ?? '';
}

/**
 * Oberer Inhaltsblock im Detail-Sheet: Zertifizierung, Name, Adresse, Tags.
 */
function DetailBodyHeader({ restaurant }: DetailBodyHeaderProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { cuisineName } = useLocalized();

  const certified = isRestaurantCertified(restaurant);
  const category = getRestaurantCategory(restaurant);
  const activeAllergens = getActiveAllergenKeys(restaurant);

  const locationLine = formatLocationLine(restaurant);
  const cuisines = restaurant.cuisine_types ?? [];
  const tags = [
    t(CATEGORY_I18N[category]),
    ...cuisines.map((code) => cuisineName(code)),
    ...(restaurant.price_range ? [restaurant.price_range] : []),
  ];

  return (
    <View style={styles.wrapper}>
      {certified ? (
        <View style={styles.certBadge}>
          <MaterialCommunityIcons name="shield-check" size={18} color={colors.onPrimary} />
          <Text style={styles.certBadgeText}>{t('detail.certified_safe_badge')}</Text>
        </View>
      ) : (
        <View style={styles.certRow}>
          <MaterialCommunityIcons name="check-bold" size={14} color={colors.primary} />
          <Text style={styles.certText}>{t('card.badge_sin_gluten')}</Text>
        </View>
      )}

      <Text style={styles.name}>{restaurant.name}</Text>

      {locationLine ? (
        <View style={styles.locationRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.locationText}>{locationLine}</Text>
        </View>
      ) : null}

      {activeAllergens.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.allergenRow}
        >
          {activeAllergens.map((key) => (
            <View key={key} style={styles.allergenChip}>
              <MaterialCommunityIcons
                name={ALLERGEN_ICONS[key]}
                size={14}
                color={colors.primary}
              />
              <Text style={styles.allergenLabel}>{t(ALLERGEN_I18N[key])}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {tags.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsRow}
        >
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagLabel}>{tag}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: {
      paddingHorizontal: spacing.screenPadding,
      paddingBottom: spacing.sm,
    },
    certBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: spacing.sm,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
    certBadgeText: {
      fontFamily: fontFamilies.sansSemiBold,
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 0.3,
      color: colors.onPrimary,
    },
    certRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm + spacing.xs,
    },
    certText: {
      ...typography.overline,
      color: colors.primary,
      letterSpacing: 1.6,
    },
    name: {
      fontFamily: fontFamilies.serifRegular,
      fontSize: 32,
      lineHeight: 34,
      letterSpacing: -0.8,
      color: colors.textPrimary,
      marginBottom: spacing.sm + spacing.xs,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    locationText: {
      ...typography.bodySmall,
      flex: 1,
      color: colors.textSecondary,
    },
    allergenRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingBottom: spacing.md,
    },
    allergenChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    allergenLabel: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    tagsRow: {
      flexDirection: 'row',
      gap: spacing.xs + 2,
      paddingBottom: spacing.lg,
    },
    tag: {
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: spacing.xs + 1,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
    },
    tagLabel: {
      ...typography.caption,
      fontWeight: '500',
      color: colors.textSecondary,
    },
  });

export default DetailBodyHeader;
