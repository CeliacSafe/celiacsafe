import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  ImageBackground,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { FEATURED_CITIES, FEATURED_CITY_IMAGES } from '../data/featuredCities';
import { useFilterStore } from '../store/filterStore';
import type { Restaurant } from '../types/Restaurant';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, shadows, spacing } from '../theme/spacing';
import { fontFamilies } from '../theme/fonts';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';
import { matchesQuery } from '../utils/searchAndFilter';

const ICON_BY_KIND = {
  beach: 'beach',
  city: 'city-variant-outline',
  architecture: 'home-city-outline',
  dom: 'bank-outline',
} as const satisfies Record<
  (typeof FEATURED_CITIES)[number]['icon'],
  keyof typeof MaterialCommunityIcons.glyphMap
>;

interface FeaturedCitiesProps {
  restaurants: Restaurant[];
  onSelectCity?: () => void;
}

function FeaturedCities({ restaurants, onSelectCity }: FeaturedCitiesProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { width } = useWindowDimensions();
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery);

  const tileGap = spacing.sm;
  const horizontalPadding = spacing.screenPadding * 2;
  const tileWidth = (width - horizontalPadding - tileGap) / 2;
  const tileHeight = Math.max(180, Math.min(200, tileWidth * 0.72));

  const cities = useMemo(
    () =>
      FEATURED_CITIES.map((city) => ({
        ...city,
        count: restaurants.filter((restaurant) => matchesQuery(restaurant, city.searchQuery)).length,
        image: FEATURED_CITY_IMAGES[city.id],
      })).filter((city) => city.count > 0),
    [restaurants]
  );

  const handlePress = (searchQuery: string) => {
    hapticLight();
    setSearchQuery(searchQuery);
    Keyboard.dismiss();
    onSelectCity?.();
  };

  if (cities.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('search.featured_cities_title')}</Text>
      <Text style={styles.subtitle}>{t('search.featured_cities_subtitle')}</Text>
      <View style={styles.grid}>
        {cities.map((city, index) => {
          const isWideTile = cities.length % 2 === 1 && index === cities.length - 1;
          return (
            <Pressable
              key={city.id}
              onPress={() => handlePress(city.searchQuery)}
              accessibilityRole="button"
              accessibilityLabel={t('search.featured_city_a11y', {
                city: t(city.labelKey),
                count: city.count,
              })}
              style={({ pressed }) => [
                styles.tilePressable,
                {
                  width: isWideTile ? width - horizontalPadding : tileWidth,
                  height: tileHeight,
                },
                pressed && styles.tilePressed,
                Platform.OS === 'web' ? styles.tileWeb : null,
              ]}
            >
              {city.image ? (
                <ImageBackground
                  source={city.image}
                  style={styles.tile}
                  imageStyle={styles.tileImage}
                >
                  <LinearGradient
                    colors={['rgba(42,42,40,0.15)', 'rgba(42,42,40,0.72)']}
                    style={styles.tileOverlay}
                  >
                    <FeaturedCityContent city={city} styles={styles} t={t} />
                  </LinearGradient>
                </ImageBackground>
              ) : (
                <LinearGradient colors={[...city.gradient]} style={styles.tile}>
                  <View style={styles.iconBadge}>
                    <MaterialCommunityIcons
                      name={ICON_BY_KIND[city.icon]}
                      size={22}
                      color="rgba(253, 250, 242, 0.92)"
                    />
                  </View>
                  <FeaturedCityContent city={city} styles={styles} t={t} />
                </LinearGradient>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type CityTile = (typeof FEATURED_CITIES)[number] & { count: number };

function FeaturedCityContent({
  city,
  styles,
  t,
}: {
  city: CityTile;
  styles: ReturnType<typeof createStyles>;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  return (
    <View style={styles.tileContent}>
      <View style={styles.tileTextBlock}>
        <Text style={styles.cityName} numberOfLines={2}>
          {t(city.labelKey)}
        </Text>
        <Text style={styles.regionName} numberOfLines={1}>
          {t(city.regionKey)}
        </Text>
      </View>
      <Text style={styles.countLabel}>
        {t('search.featured_city_count', { count: city.count })}
      </Text>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    section: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.h3,
      color: colors.textPrimary,
    },
    subtitle: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    tilePressable: {
      borderRadius: radius.xl,
      overflow: 'hidden',
      ...shadows.medium,
    },
    tileWeb: Platform.select({
      web: { cursor: 'pointer' as const },
      default: {},
    }),
    tilePressed: {
      opacity: 0.92,
      transform: [{ scale: 0.985 }],
    },
    tile: {
      flex: 1,
      borderRadius: radius.xl,
      padding: spacing.md,
      justifyContent: 'space-between',
    },
    tileImage: {
      borderRadius: radius.xl,
    },
    tileOverlay: {
      flex: 1,
      borderRadius: radius.xl,
      padding: spacing.md,
      justifyContent: 'space-between',
    },
    iconBadge: {
      alignSelf: 'flex-start',
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      backgroundColor: 'rgba(253, 250, 242, 0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tileContent: {
      flex: 1,
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    tileTextBlock: {
      gap: 2,
    },
    cityName: {
      fontFamily: fontFamilies.serifRegular,
      fontSize: 22,
      lineHeight: 24,
      letterSpacing: -0.4,
      color: colors.onPrimary,
    },
    regionName: {
      fontFamily: fontFamilies.sans,
      fontSize: 13,
      lineHeight: 18,
      color: 'rgba(253, 250, 242, 0.82)',
    },
    countLabel: {
      fontFamily: fontFamilies.sansSemiBold,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.2,
      color: 'rgba(253, 250, 242, 0.92)',
    },
  });

export default FeaturedCities;
