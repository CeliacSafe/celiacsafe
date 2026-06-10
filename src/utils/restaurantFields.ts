/**
 * Abgeleitete Restaurant-Felder für UI und Filter.
 * Neue explizite Felder (is_certified, category, allergens) haben Vorrang;
 * fehlen sie, werden Legacy-Felder genutzt.
 */

import type {
  Restaurant,
  RestaurantAllergens,
  RestaurantCategory,
} from '../types/Restaurant';
import { cuisineMatchesDiet, restaurantMatchesLactoseFree } from './venueNormalization';

const VENUE_TO_CATEGORY: Partial<Record<string, RestaurantCategory>> = {
  restaurant: 'restaurant',
  bar_tapas: 'restaurant',
  hotel_restaurant: 'restaurant',
  brunch_place: 'restaurant',
  burger_joint: 'restaurant',
  asian_restaurant: 'restaurant',
  catering: 'restaurant',
  food_truck: 'restaurant',
  pastry_shop: 'bakery',
  bakery: 'bakery',
  pizzeria: 'pizza',
  cafe: 'cafe',
  ice_cream: 'cafe',
  fast_food: 'fastfood',
};

/** Offiziell von Verband (FACE/DZG/AOECS) geprüft. */
export function isRestaurantCertified(restaurant: Restaurant): boolean {
  if (restaurant.is_certified === true) {
    return true;
  }
  if (restaurant.is_certified === false) {
    return false;
  }
  return restaurant.face_program === true || restaurant.aoecs_certified === true;
}

/** Vereinfachte Kategorie — explizit oder aus venue_type. */
export function getRestaurantCategory(restaurant: Restaurant): RestaurantCategory {
  if (restaurant.category) {
    return restaurant.category;
  }
  if (restaurant.venue_type) {
    return VENUE_TO_CATEGORY[restaurant.venue_type] ?? 'restaurant';
  }
  return 'restaurant';
}

/** Allergene/Diät — explizit oder aus cuisine_types/Beschreibung abgeleitet. */
export function resolveRestaurantAllergens(restaurant: Restaurant): RestaurantAllergens {
  const explicit = restaurant.allergens;
  const derived: RestaurantAllergens = {
    sin_lactosa:
      explicit?.sin_lactosa === true ||
      (explicit?.sin_lactosa !== false && restaurantMatchesLactoseFree(restaurant)),
    vegan:
      explicit?.vegan === true ||
      (explicit?.vegan !== false && cuisineMatchesDiet(restaurant.cuisine_types, 'vegan')),
    sin_trigo:
      explicit?.sin_trigo === true ||
      (explicit?.sin_trigo !== false && restaurant.verification_status === 'verified'),
  };
  return derived;
}

/** Aktive Allergen-Flags (nur true-Werte). */
export function getActiveAllergenKeys(
  restaurant: Restaurant
): Array<keyof RestaurantAllergens> {
  const allergens = resolveRestaurantAllergens(restaurant);
  return (Object.keys(allergens) as Array<keyof RestaurantAllergens>).filter(
    (key) => allergens[key] === true
  );
}

export function allergensToCamel(allergens: RestaurantAllergens): {
  sinLactosa: boolean;
  vegan: boolean;
  sinTrigo: boolean;
} {
  return {
    sinLactosa: allergens.sin_lactosa === true,
    vegan: allergens.vegan === true,
    sinTrigo: allergens.sin_trigo === true,
  };
}
