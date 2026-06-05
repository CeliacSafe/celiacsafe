import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import MyLocationButton from '../components/MyLocationButton';
import RegionQuickJumps from '../components/RegionQuickJumps';
import RestaurantBottomSheet from '../components/RestaurantBottomSheet';
import RestaurantCard from '../components/RestaurantCard';
import StaticOsmMapImage from '../components/StaticOsmMapImage';
import { QUICK_JUMPS } from '../data/quickJumps';
import { useRestaurants } from '../hooks/useRestaurants';
import { useUserLocation } from '../hooks/useUserLocation';
import type { MapaStackParamList } from '../navigation/MapaStack';
import { useFilterStore } from '../store/filterStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { MapRegion } from '../types/MapRegion';
import type { Restaurant } from '../types/Restaurant';
import { hapticError, hapticMedium } from '../utils/haptics';
import { toMapFilterCriteria } from '../utils/platformLinks';
import { applyFilters } from '../utils/searchAndFilter';

const INITIAL_REGION = QUICK_JUMPS[0].region;

const MY_LOCATION_ZOOM = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type MapaNavigationProp = NativeStackNavigationProp<MapaStackParamList, 'MapaMain'>;

/**
 * Web-Variante der Karte: statische OSM-Vorschau plus Restaurantliste (kein react-native-maps).
 */
export function MapaScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<MapaNavigationProp>();
  const insets = useSafeAreaInsets();
  const { loading: locationLoading, requestLocation, lastErrorRef } = useUserLocation();
  const { restaurants } = useRestaurants();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const selectedVenueTypes = useFilterStore((state) => state.selectedVenueTypes);
  const selectedRegions = useFilterStore((state) => state.selectedRegions);
  const selectedPriceRanges = useFilterStore((state) => state.selectedPriceRanges);
  const onlyFaceCertified = useFilterStore((state) => state.onlyFaceCertified);
  const onlyAoecsCertified = useFilterStore((state) => state.onlyAoecsCertified);
  const selectedCity = useFilterStore((state) => state.selectedCity);
  const dietVegan = useFilterStore((state) => state.dietVegan);
  const dietVegetarian = useFilterStore((state) => state.dietVegetarian);
  const categoryTab = useFilterStore((state) => state.categoryTab);
  const sortBy = useFilterStore((state) => state.sortBy);
  const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters);
  const resetFilters = useFilterStore((state) => state.resetFilters);

  const [viewRegion, setViewRegion] = useState<MapRegion>(INITIAL_REGION);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const filterCriteria = useMemo(
    () => ({
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      onlyFaceCertified,
      onlyAoecsCertified,
      selectedCity,
      dietVegan,
      dietVegetarian,
      categoryTab,
    }),
    [
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      onlyFaceCertified,
      onlyAoecsCertified,
      selectedCity,
      dietVegan,
      dietVegetarian,
      categoryTab,
    ]
  );

  const mapFilterCriteria = useMemo(() => toMapFilterCriteria(filterCriteria), [filterCriteria]);

  const filteredRestaurants = useMemo(
    () => applyFilters(restaurants, searchQuery, mapFilterCriteria, sortBy),
    [restaurants, searchQuery, mapFilterCriteria, sortBy]
  );

  const mappableRestaurants = useMemo(
    () =>
      filteredRestaurants.filter(
        (restaurant) => restaurant.latitude != null && restaurant.longitude != null
      ),
    [filteredRestaurants]
  );

  const showNoPinsEmpty = hasActiveFilters() && mappableRestaurants.length === 0;

  const handleClearFilters = useCallback(() => {
    hapticMedium();
    resetFilters();
  }, [resetFilters]);

  const handleDetailPress = useCallback(
    (restaurantId: string) => {
      setSelectedRestaurant(null);
      navigation.navigate('RestaurantDetail', { restaurantId });
    },
    [navigation]
  );

  const handleRestaurantPress = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
  }, []);

  const handleMyLocationPress = useCallback(async () => {
    const loc = await requestLocation();
    if (loc) {
      setViewRegion({
        latitude: loc.latitude,
        longitude: loc.longitude,
        ...MY_LOCATION_ZOOM,
      });
    } else {
      hapticError();
      Alert.alert(
        t('map.location_denied_title'),
        lastErrorRef.current ?? t('map.location_denied_message')
      );
    }
  }, [lastErrorRef, requestLocation, t]);

  const handleQuickJump = useCallback((region: MapRegion) => {
    setViewRegion(region);
  }, []);

  const listHeader = useMemo(
    () => (
      <View style={styles.mapHeader}>
        <StaticOsmMapImage
          latitude={viewRegion.latitude}
          longitude={viewRegion.longitude}
          height={220}
          latitudeDelta={viewRegion.latitudeDelta}
        />
      </View>
    ),
    [viewRegion]
  );

  return (
    <View style={styles.container}>
      <View style={[styles.quickJumpBar, { paddingTop: insets.top }]}>
        <RegionQuickJumps onJumpTo={handleQuickJump} />
      </View>

      {showNoPinsEmpty ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            illustration="map"
            iconName="map-marker-off-outline"
            title={t('map.no_pins_title')}
            description={t('map.no_pins_description')}
            actionLabel={t('search.clear_filters')}
            onAction={handleClearFilters}
          />
        </View>
      ) : (
        <FlatList
          data={mappableRestaurants}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          windowSize={7}
          renderItem={({ item }) => (
            <RestaurantCard restaurant={item} onPress={() => handleRestaurantPress(item)} />
          )}
        />
      )}

      <MyLocationButton
        onPress={handleMyLocationPress}
        loading={locationLoading}
        style={styles.myLocationButton}
      />

      {locationLoading ? <LoadingSpinner fullscreen message={t('map.locating')} /> : null}

      <RestaurantBottomSheet
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onDetailPress={handleDetailPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  quickJumpBar: {
    zIndex: 1,
  },
  mapHeader: {
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xl + 56,
    gap: spacing.md,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
  },
});

// i18n-migrated
