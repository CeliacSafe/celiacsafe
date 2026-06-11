import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import EmptyState from '../components/EmptyState';
import AppBrandMark from '../components/AppBrandMark';
import FeaturedCities from '../components/FeaturedCities';
import LanguageSwitcher from '../components/LanguageSwitcher';
import RestaurantCard from '../components/RestaurantCard';
import SearchBarRow from '../components/SearchBarRow';
import SearchQuickFilterChips from '../components/SearchQuickFilterChips';
import SearchQuickFiltersRow from '../components/SearchQuickFiltersRow';
import SearchFilterPanel from '../components/SearchFilterPanel';
import SkeletonCard from '../components/SkeletonCard';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useFilterCriteria } from '../hooks/useFilterCriteria';
import { useUserLocation } from '../hooks/useUserLocation';
import { hapticLight, hapticMedium } from '../utils/haptics';
import { useRestaurants } from '../hooks/useRestaurants';
import type { BuscarStackParamList } from '../navigation/BuscarStack';
import { useFilterStore } from '../store/filterStore';
import type { Restaurant } from '../types/Restaurant';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

import { fontFamilies } from '../theme/fonts';
import { typography } from '../theme/typography';
import { formatResultCount } from '../utils/pluralize';
import { sortRestaurantsByDistance, restaurantDistanceKm } from '../utils/restaurantDistance';
import { applyFilters } from '../utils/searchAndFilter';

type BuscarNavigationProp = NativeStackNavigationProp<BuscarStackParamList, 'BuscarList'>;
type BuscarScreenProps = NativeStackScreenProps<BuscarStackParamList, 'BuscarList'>;
const NEARBY_PAGE_SIZE = 10;

type BuscarRowProps = {
  restaurant: Restaurant;
  distanceKm: number | null;
  onPressRestaurant: (id: string) => void;
};

const BuscarRestaurantRow = memo(function BuscarRestaurantRow({
  restaurant,
  distanceKm,
  onPressRestaurant,
}: BuscarRowProps) {
  const handlePress = useCallback(
    () => onPressRestaurant(restaurant.id),
    [onPressRestaurant, restaurant.id]
  );
  return (
    <RestaurantCard
      restaurant={restaurant}
      distanceKm={distanceKm}
      variant="editorial"
      onPress={handlePress}
    />
  );
}, (prev, next) =>
  prev.restaurant.id === next.restaurant.id && prev.distanceKm === next.distanceKm
);

export function BuscarScreen(_screenProps: BuscarScreenProps) {
  const { t } = useTranslation();
  const navigation = useNavigation<BuscarNavigationProp>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { restaurants, loading, error, syncError, refetch } = useRestaurants();
  const { location, loading: locationLoading, error: locationError, requestLocation } =
    useUserLocation();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const sortBy = useFilterStore((state) => state.sortBy);
  const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const filterCriteria = useFilterCriteria();
  const [refreshing, setRefreshing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(NEARBY_PAGE_SIZE);
  const [locationRequested, setLocationRequested] = useState(false);
  const listRef = useRef<FlatList<Restaurant>>(null);

  const handleFeaturedCitySelect = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const handleHomePress = useCallback(() => {
    hapticLight();
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  useEffect(() => {
    if (locationRequested) return;
    setLocationRequested(true);
    // Browser blockieren Geolocation ohne Nutzeraktion — auf Web per Banner-Tap anfordern.
    if (Platform.OS !== 'web') {
      requestLocation().catch(() => undefined);
    }
  }, [locationRequested, requestLocation]);

  const handleRequestLocation = useCallback(() => {
    requestLocation().catch(() => undefined);
  }, [requestLocation]);

  const handleClearFilters = useCallback(() => {
    hapticMedium();
    resetFilters();
  }, [resetFilters]);

  const isBrowsingNearby = !hasActiveFilters() && searchQuery.trim().length === 0;
  const showFeaturedCities = isBrowsingNearby;
  /** Web: Liste auch ohne GPS (nach Name); Native: kurz warten bis Standort da ist. */
  const hideNearbyList =
    Platform.OS !== 'web' &&
    isBrowsingNearby &&
    (locationLoading || !location) &&
    searchQuery.trim().length === 0;

  const filteredRestaurants = useMemo(
    () => applyFilters(restaurants, debouncedSearchQuery, filterCriteria, sortBy),
    [restaurants, debouncedSearchQuery, filterCriteria, sortBy]
  );

  const sortedRestaurants = useMemo(() => {
    if (location && isBrowsingNearby) {
      return sortRestaurantsByDistance(
        filteredRestaurants,
        location.latitude,
        location.longitude
      );
    }
    return filteredRestaurants;
  }, [filteredRestaurants, isBrowsingNearby, location]);

  const displayRestaurants = useMemo(() => {
    if (hideNearbyList) {
      return [];
    }
    if (!isBrowsingNearby) {
      return sortedRestaurants;
    }
    return sortedRestaurants.slice(0, visibleCount);
  }, [hideNearbyList, isBrowsingNearby, sortedRestaurants, visibleCount]);

  const hasMoreNearby = isBrowsingNearby && visibleCount < sortedRestaurants.length;

  useEffect(() => {
    setVisibleCount(NEARBY_PAGE_SIZE);
  }, [searchQuery, filterCriteria, location?.latitude, location?.longitude]);

  const openDetail = useCallback(
    (restaurantId: string) => {
      navigation.navigate('RestaurantDetail', { restaurantId });
    },
    [navigation]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
      await requestLocation();
    } finally {
      setRefreshing(false);
    }
  }, [refetch, requestLocation]);

  const loadMore = useCallback(() => {
    hapticMedium();
    setVisibleCount((count) => count + NEARBY_PAGE_SIZE);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Restaurant }) => (
      <BuscarRestaurantRow
        restaurant={item}
        distanceKm={
          location
            ? restaurantDistanceKm(item, location.latitude, location.longitude)
            : null
        }
        onPressRestaurant={openDetail}
      />
    ),
    [location, openDetail]
  );

  const counterLabel = useMemo(() => {
    if (isBrowsingNearby && sortedRestaurants.length > displayRestaurants.length) {
      return t('search.showing_nearby', {
        shown: displayRestaurants.length,
        total: sortedRestaurants.length,
      }).toUpperCase();
    }
    return formatResultCount(sortedRestaurants.length).toUpperCase();
  }, [displayRestaurants.length, isBrowsingNearby, sortedRestaurants.length, t]);

  const listSortKey = useMemo(() => {
    if (!location || !isBrowsingNearby) {
      return 'name';
    }
    return `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
  }, [isBrowsingNearby, location]);

  const listHeader = useMemo(
    () => (
      <View style={styles.scrollHeader}>
        <View style={styles.editorialHeader}>
          <View style={styles.editorialLeft}>
            <AppBrandMark />
            <Text style={styles.valueProposition} accessibilityRole="text">
              <Text style={styles.valuePropositionLead}>{t('search.value_proposition_lead')}</Text>
              {' '}
              <Text style={styles.valuePropositionTail}>{t('search.value_proposition_tail')}</Text>
            </Text>
          </View>
          <LanguageSwitcher variant="header" />
        </View>

        {filtersOpen ? (
          <SearchFilterPanel restaurants={restaurants} onClose={() => setFiltersOpen(false)} />
        ) : null}

        <SearchQuickFiltersRow restaurants={restaurants} />

        {syncError && restaurants.length > 0 ? (
          <Pressable
            onPress={onRefresh}
            style={({ pressed }) => [styles.staleBanner, pressed && styles.nearbyBannerPressed]}
          >
            <MaterialCommunityIcons name="cloud-off-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.staleBannerText} numberOfLines={2}>
              {t('search.offline_stale')}
            </Text>
            <MaterialCommunityIcons name="refresh" size={16} color={colors.primary} />
          </Pressable>
        ) : null}

        <View style={styles.feedHeader}>
          {isBrowsingNearby && !hideNearbyList ? (
            <Pressable
              onPress={
                Platform.OS === 'web' && !locationLoading
                  ? handleRequestLocation
                  : undefined
              }
              disabled={locationLoading}
              style={({ pressed }) => [
                styles.nearbyBanner,
                Platform.OS === 'web' && !locationLoading && pressed && styles.nearbyBannerPressed,
              ]}
              accessibilityRole={Platform.OS === 'web' ? 'button' : undefined}
              accessibilityLabel={
                Platform.OS === 'web' ? t('search.location_tap_to_enable') : undefined
              }
            >
              <MaterialCommunityIcons name="crosshairs-gps" size={16} color={colors.primary} />
              <Text style={styles.nearbyBannerText}>
                {locationLoading
                  ? t('search.location_requesting')
                  : locationError
                    ? locationError
                    : location
                      ? t('search.nearby_hint')
                      : Platform.OS === 'web'
                        ? t('search.location_tap_to_enable')
                        : t('search.nearby_hint')}
              </Text>
            </Pressable>
          ) : null}

          {showFeaturedCities ? (
            <FeaturedCities restaurants={restaurants} onSelectCity={handleFeaturedCitySelect} />
          ) : null}

          {!hideNearbyList ? (
            <View style={styles.counterRow}>
              <Text style={styles.counterText}>{counterLabel}</Text>
            </View>
          ) : null}
        </View>
      </View>
    ),
    [
      colors,
      counterLabel,
      filtersOpen,
      handleFeaturedCitySelect,
      hideNearbyList,
      isBrowsingNearby,
      location,
      locationError,
      locationLoading,
      onRefresh,
      restaurants,
      showFeaturedCities,
      styles,
      t,
    ]
  );

  const listFooter = useMemo(() => {
    if (!hasMoreNearby) {
      return null;
    }
    return (
      <Pressable
        onPress={loadMore}
        android_ripple={{ color: colors.rippleLight }}
        style={({ pressed }) => [styles.loadMoreButton, pressed && styles.loadMorePressed]}
      >
        <Text style={styles.loadMoreLabel}>{t('search.load_more')}</Text>
        <MaterialCommunityIcons name="chevron-down" size={22} color={colors.onPrimary} />
      </Pressable>
    );
  }, [colors, styles, hasMoreNearby, loadMore, t]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <View style={styles.stickySection}>
        <View style={styles.stickyBar}>
          <Pressable
            onPress={handleHomePress}
            style={({ pressed }) => [styles.homeButton, pressed && styles.homeButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel={t('search.brand_title')}
          >
            <MaterialCommunityIcons name="home-outline" size={22} color={colors.textPrimary} />
          </Pressable>
          <SearchBarRow
            embedded
            filtersOpen={filtersOpen}
            onToggleFilters={() => setFiltersOpen((open) => !open)}
          />
        </View>
        <SearchQuickFilterChips />
      </View>

      {loading ? (
        <FlatList
          ref={listRef}
          style={styles.list}
          data={Array(5).fill(null)}
          ListHeaderComponent={listHeader}
          keyExtractor={(_item, index) => `skeleton-${index}`}
          renderItem={() => <SkeletonCard />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <FlatList
          ref={listRef}
          key={listSortKey}
          style={styles.list}
          data={displayRestaurants}
          extraData={listSortKey}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            hasActiveFilters() ? (
              <EmptyState
                inline
                illustration="search"
                iconName="filter-off-outline"
                title={t('search.no_results_title')}
                description={t('search.no_results_description')}
                actionLabel={t('search.clear_filters')}
                onAction={handleClearFilters}
              />
            ) : (
              <EmptyState
                inline
                illustration="default"
                iconName="food-off"
                title={t('search.no_restaurants_title')}
                description={error ?? undefined}
              />
            )
          }
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            displayRestaurants.length === 0 && styles.listContentEmpty,
          ]}
          refreshing={refreshing}
          onRefresh={onRefresh}
          initialNumToRender={4}
          removeClippedSubviews
          windowSize={5}
          maxToRenderPerBatch={3}
          updateCellsBatchingPeriod={100}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stickySection: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.lineSoft,
    zIndex: 50,
  },
  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
    borderBottomWidth: 0,
    zIndex: 50,
  },
  homeButton: {
    width: spacing.xxl,
    height: spacing.xxl,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonPressed: {
    opacity: 0.85,
  },
  scrollHeader: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  editorialHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
  },
  editorialLeft: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 0,
  },
  valueProposition: {
    fontFamily: fontFamilies.sans,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
    maxWidth: 320,
  },
  valuePropositionLead: {
    fontFamily: fontFamilies.sansSemiBold,
    color: colors.primary,
  },
  valuePropositionTail: {
    fontFamily: fontFamilies.sans,
    color: colors.textSecondary,
  },
  list: {
    flex: 1,
  },
  feedHeader: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  nearbyBanner: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  nearbyBannerPressed: {
    opacity: 0.85,
  },
  staleBanner: {
    marginHorizontal: spacing.screenPadding,
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.cardPadding,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
  },
  staleBannerText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textSecondary,
  },
  nearbyBannerText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textSecondary,
  },
  counterRow: {
    marginTop: spacing.xs,
  },
  counterText: {
    ...typography.overline,
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.sectionGap,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loadMoreButton: {
    marginTop: spacing.md,
    marginBottom: spacing.cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    overflow: 'hidden',
  },
  loadMorePressed: {
    opacity: 0.9,
  },
  loadMoreLabel: {
    ...typography.button,
    color: colors.onPrimary,
  },
});

// i18n-migrated
