import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';

import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import MapSearchPill from '../components/MapSearchPill';
import RegionQuickJumps from '../components/RegionQuickJumps';
import SearchCountryChips from '../components/SearchCountryChips';
import RestaurantBottomSheet from '../components/RestaurantBottomSheet';
import RestaurantMapMarker from '../components/RestaurantMapMarker';
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
import { hapticError, hapticMedium } from '../utils/haptics';
import { toMapFilterCriteria } from '../utils/platformLinks';
import { applyFilters } from '../utils/searchAndFilter';
import { isKnownCountryCode } from '../utils/filterTextMatch';

const INITIAL_REGION = QUICK_JUMPS[0].region;
const QUICK_JUMP_ANIMATION_MS = 800;

const MY_LOCATION_ZOOM = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type MapaNavigationProp = NativeStackNavigationProp<MapaStackParamList, 'MapaMain'>;

/**
 * Karte full-bleed unter der Status-Bar; nur Overlays (Quick-Jumps, leerer Zustand)
 * nutzen `insets.top` — kein SafeAreaView um die MapView.
 */
export function MapaScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<MapaNavigationProp>();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const { regionName } = useLocalized();
  const language = useAppLanguage();
  const mapRef = useRef<MapView>(null);
  const { location, loading: locationLoading, requestLocation, lastErrorRef } = useUserLocation();
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
  const categoryTab = useFilterStore((state) => state.categoryTab);
  const sortBy = useFilterStore((state) => state.sortBy);
  const hasActiveFilters = useFilterStore((state) => state.hasActiveFilters);
  const resetFilters = useFilterStore((state) => state.resetFilters);

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const selectedRestaurantId = selectedRestaurant?.id ?? null;

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

  const restaurantById = useMemo(
    () => new Map(mappableRestaurants.map((restaurant) => [restaurant.id, restaurant])),
    [mappableRestaurants]
  );

  const handleMarkerPress = useCallback(
    (restaurantId: string) => {
      const restaurant = restaurantById.get(restaurantId);
      if (restaurant) {
        setSelectedRestaurant(restaurant);
      }
    },
    [restaurantById]
  );

  const handleDetailPress = useCallback(
    (restaurantId: string) => {
      setSelectedRestaurant(null);
      navigation.navigate('RestaurantDetail', { restaurantId });
    },
    [navigation]
  );

  const handleMyLocationPress = useCallback(async () => {
    const loc = await requestLocation();
    if (loc) {
      mapRef.current?.animateToRegion(
        {
          latitude: loc.latitude,
          longitude: loc.longitude,
          ...MY_LOCATION_ZOOM,
        },
        1000
      );
    } else {
      hapticError();
      Alert.alert(
        t('map.location_denied_title'),
        lastErrorRef.current ?? t('map.location_denied_message')
      );
    }
  }, [lastErrorRef, requestLocation, t]);

  const handleQuickJump = useCallback((region: MapRegion) => {
    mapRef.current?.animateToRegion(region, QUICK_JUMP_ANIMATION_MS);
  }, []);

  const mapMarkers = useMemo(
    () =>
      mappableRestaurants.map((restaurant) => (
        <RestaurantMapMarker
          key={restaurant.id}
          restaurant={restaurant}
          isSelected={selectedRestaurantId === restaurant.id}
          onPress={handleMarkerPress}
        />
      )),
    [handleMarkerPress, mappableRestaurants, selectedRestaurantId]
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={location != null}
        showsMyLocationButton={false}
        showsCompass
        showsScale={false}
        rotateEnabled
        pitchEnabled={false}
      >
        {mapMarkers}
      </MapView>

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

      <RestaurantBottomSheet
        restaurant={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onDetailPress={handleDetailPress}
        variant="compact"
      />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
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
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});

// i18n-migrated
