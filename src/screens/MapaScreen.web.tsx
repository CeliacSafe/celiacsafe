import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import EmptyState from '../components/EmptyState';
import InteractiveOsmMap from '../components/InteractiveOsmMap';
import LoadingSpinner from '../components/LoadingSpinner';
import MapSearchPill from '../components/MapSearchPill';
import RegionQuickJumps from '../components/RegionQuickJumps';
import SearchCountryChips from '../components/SearchCountryChips';
import { QUICK_JUMPS } from '../data/quickJumps';
import { useRestaurants } from '../hooks/useRestaurants';
import { useUserLocation } from '../hooks/useUserLocation';
import { useLocalized } from '../hooks/useLocalized';
import { COUNTRY_NAMES } from '../i18n/lookups';
import { useAppLanguage } from '../i18n/useAppLanguage';
import type { MapaStackParamList } from '../navigation/MapaStack';
import { useFilterStore } from '../store/filterStore';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing } from '../theme/spacing';
import type { MapRegion } from '../types/MapRegion';
import type { Restaurant } from '../types/Restaurant';
import { hapticError, hapticLight, hapticMedium } from '../utils/haptics';
import { toMapFilterCriteria } from '../utils/platformLinks';
import { applyFilters } from '../utils/searchAndFilter';
import { isKnownCountryCode } from '../utils/filterTextMatch';

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
  const styles = useThemedStyles(createStyles);
  const { regionName, venueTypeName } = useLocalized();
  const language = useAppLanguage();
  const { loading: locationLoading, requestLocation, lastErrorRef } = useUserLocation();
  const { restaurants } = useRestaurants();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const selectedVenueTypes = useFilterStore((state) => state.selectedVenueTypes);
  const selectedCountry = useFilterStore((state) => state.selectedCountry);
  const selectedRegions = useFilterStore((state) => state.selectedRegions);
  const selectedPriceRanges = useFilterStore((state) => state.selectedPriceRanges);
  const onlyFaceCertified = useFilterStore((state) => state.onlyFaceCertified);
  const onlyAoecsCertified = useFilterStore((state) => state.onlyAoecsCertified);
  const selectedCity = useFilterStore((state) => state.selectedCity);
  const deliveryAvailable = useFilterStore((state) => state.deliveryAvailable);
  const dietVegan = useFilterStore((state) => state.dietVegan);
  const dietVegetarian = useFilterStore((state) => state.dietVegetarian);
  const dietLactoseFree = useFilterStore((state) => state.dietLactoseFree);
  const categoryTab = useFilterStore((state) => state.categoryTab);
  const sortBy = useFilterStore((state) => state.sortBy);
  const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters);
  const resetFilters = useFilterStore((state) => state.resetFilters);

  const [viewRegion, setViewRegion] = useState<MapRegion>(INITIAL_REGION);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  const getVenueTypeLabel = useCallback(
    (restaurant: Restaurant) =>
      restaurant.venue_type ? venueTypeName(restaurant.venue_type) : null,
    [venueTypeName]
  );

  const areaLabel = useMemo(() => {
    const query = searchQuery.trim();
    if (query) {
      return query;
    }
    if (selectedCity) {
      return selectedCity;
    }
    if (selectedRegions.length === 1) {
      return regionName(selectedRegions[0]);
    }
    if (selectedCountry) {
      if (isKnownCountryCode(selectedCountry)) {
        return COUNTRY_NAMES[selectedCountry][language] ?? selectedCountry;
      }
      return selectedCountry;
    }
    return t('map.all_areas');
  }, [language, regionName, searchQuery, selectedCity, selectedCountry, selectedRegions, t]);

  const filterCriteria = useMemo(
    () => ({
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      onlyFaceCertified,
      onlyAoecsCertified,
      selectedCountry,
      selectedCity,
      deliveryAvailable,
      dietVegan,
      dietVegetarian,
      dietLactoseFree,
      categoryTab,
    }),
    [
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      onlyFaceCertified,
      onlyAoecsCertified,
      selectedCountry,
      selectedCity,
      deliveryAvailable,
      dietVegan,
      dietVegetarian,
      dietLactoseFree,
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

  const handleMarkerPress = useCallback((restaurantId: string) => {
    if (!restaurantId) {
      setSelectedRestaurantId(null);
      return;
    }
    hapticLight();
    setSelectedRestaurantId(restaurantId);
  }, []);

  const handleRestaurantOpen = useCallback(
    (restaurantId: string) => {
      hapticMedium();
      navigation.navigate('RestaurantDetail', { restaurantId });
    },
    [navigation]
  );

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

  return (
    <View style={styles.container}>
      <InteractiveOsmMap
        restaurants={mappableRestaurants}
        region={viewRegion}
        selectedRestaurantId={selectedRestaurantId}
        getVenueTypeLabel={getVenueTypeLabel}
        onMarkerPress={handleMarkerPress}
        onRestaurantOpen={handleRestaurantOpen}
      />

      {showNoPinsEmpty ? (
        <View style={[styles.emptyOverlay, { paddingTop: insets.top }]} pointerEvents="box-none">
          <EmptyState
            illustration="map"
            iconName="map-marker-off-outline"
            title={t('map.no_pins_title')}
            description={t('map.no_pins_description')}
            actionLabel={t('search.clear_filters')}
            onAction={handleClearFilters}
            style={styles.emptyState}
          />
        </View>
      ) : null}

      <View style={[styles.topOverlay, { paddingTop: insets.top }]} pointerEvents="box-none">
        <RegionQuickJumps onJumpTo={handleQuickJump} />
        <SearchCountryChips restaurants={restaurants} compact />
        <MapSearchPill
          areaLabel={areaLabel}
          pinCount={mappableRestaurants.length}
          onMyLocationPress={handleMyLocationPress}
          locationLoading={locationLoading}
        />
      </View>

      {locationLoading ? <LoadingSpinner fullscreen message={t('map.locating')} /> : null}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.scrim,
    zIndex: 2,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    flex: undefined,
    minHeight: 0,
    paddingVertical: 0,
  },
});

// i18n-migrated
