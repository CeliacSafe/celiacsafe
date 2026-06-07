import type { Restaurant } from '../types/Restaurant';
import { compareWithPremiumInCity } from './restaurantSort';

const EARTH_RADIUS_KM = 6371;

/** Haversine-Distanz in Kilometern zwischen zwei Koordinaten. */
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function restaurantDistanceKm(
  restaurant: Restaurant,
  latitude: number,
  longitude: number,
): number | null {
  if (restaurant.latitude == null || restaurant.longitude == null) {
    return null;
  }
  return distanceKm(latitude, longitude, restaurant.latitude, restaurant.longitude);
}

/** Nächste Lokale zuerst; ohne Koordinaten am Ende (alphabetisch). */
export function sortRestaurantsByDistance(
  restaurants: Restaurant[],
  latitude: number,
  longitude: number,
): Restaurant[] {
  const ranked = restaurants.map((restaurant) => ({
    restaurant,
    distance: restaurantDistanceKm(restaurant, latitude, longitude),
  }));

  ranked.sort((a, b) =>
    compareWithPremiumInCity(a.restaurant, b.restaurant, (left, right) => {
      const da = restaurantDistanceKm(left, latitude, longitude);
      const db = restaurantDistanceKm(right, latitude, longitude);
      if (da == null && db == null) {
        return left.name.localeCompare(right.name, 'es');
      }
      if (da == null) return 1;
      if (db == null) return -1;
      if (da !== db) return da - db;
      return left.name.localeCompare(right.name, 'es');
    })
  );

  return ranked.map((entry) => entry.restaurant);
}

/** Anzeigeformat für Entfernungen in der UI (z. B. „850 m“, „2,3 km“). */
export function formatDistanceKm(km: number, locale = 'es'): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters.toLocaleString(locale)} m`;
  }
  return `${km.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}
