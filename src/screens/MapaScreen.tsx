import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';
import type { Region } from 'react-native-maps';

import MyLocationButton from '../components/MyLocationButton';
import RegionQuickJumps from '../components/RegionQuickJumps';
import RestaurantBottomSheet from '../components/RestaurantBottomSheet';
import RestaurantMapMarker from '../components/RestaurantMapMarker';
import { QUICK_JUMPS } from '../data/quickJumps';
import { useRestaurants } from '../hooks/useRestaurants';
import { useUserLocation } from '../hooks/useUserLocation';
import type { MapaStackParamList } from '../navigation/MapaStack';
import { useFilterStore } from '../store/filterStore';
import type { Restaurant } from '../types/Restaurant';
import { applyFilters } from '../utils/searchAndFilter';

const INITIAL_REGION = QUICK_JUMPS[0].region;
const QUICK_JUMP_ANIMATION_MS = 800;

const MY_LOCATION_ZOOM = {
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type MapaNavigationProp = NativeStackNavigationProp<MapaStackParamList, 'MapaMain'>;

export function MapaScreen() {
  const navigation = useNavigation<MapaNavigationProp>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { location, loading: locationLoading, requestLocation, lastErrorRef } = useUserLocation();
  const { restaurants } = useRestaurants();
  const searchQuery = useFilterStore((state) => state.searchQuery);
  const selectedVenueTypes = useFilterStore((state) => state.selectedVenueTypes);
  const selectedRegions = useFilterStore((state) => state.selectedRegions);
  const selectedPriceRanges = useFilterStore((state) => state.selectedPriceRanges);
  const onlyFaceCertified = useFilterStore((state) => state.onlyFaceCertified);
  const onlyAoecsCertified = useFilterStore((state) => state.onlyAoecsCertified);
  const sortBy = useFilterStore((state) => state.sortBy);

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const selectedRestaurantId = selectedRestaurant?.id ?? null;

  const filterCriteria = useMemo(
    () => ({
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      onlyFaceCertified,
      onlyAoecsCertified,
    }),
    [
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      onlyFaceCertified,
      onlyAoecsCertified,
    ]
  );

  const filteredRestaurants = useMemo(
    () => applyFilters(restaurants, searchQuery, filterCriteria, sortBy),
    [restaurants, searchQuery, filterCriteria, sortBy]
  );

  const mappableRestaurants = useMemo(
    () =>
      filteredRestaurants.filter(
        (restaurant) => restaurant.latitude != null && restaurant.longitude != null
      ),
    [filteredRestaurants]
  );

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
      Alert.alert('Sin acceso', lastErrorRef.current ?? 'No se pudo obtener tu ubicación.');
    }
  }, [lastErrorRef, requestLocation]);

  const handleQuickJump = useCallback((region: Region) => {
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

      <View style={[styles.quickJumpOverlay, { paddingTop: insets.top }]} pointerEvents="box-none">
        <RegionQuickJumps onJumpTo={handleQuickJump} language="es" />
      </View>

      <MyLocationButton
        onPress={handleMyLocationPress}
        loading={locationLoading}
        style={styles.myLocationButton}
      />

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
  },
  map: {
    flex: 1,
  },
  quickJumpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
  },
});
