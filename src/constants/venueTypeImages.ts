import type { ImageSource } from 'expo-image';

import type { VenueType } from '../types/Restaurant';

/** Gebündelte Standardfotos pro Restaurant-Art (ohne eigenes featured_image). */
const VENUE_TYPE_IMAGE_MODULES: Record<VenueType, number> = {
  restaurant: require('../../assets/venue-types/restaurant.jpg'),
  cafe: require('../../assets/venue-types/cafe.jpg'),
  bakery: require('../../assets/venue-types/bakery.jpg'),
  pastry_shop: require('../../assets/venue-types/pastry_shop.jpg'),
  ice_cream: require('../../assets/venue-types/ice_cream.jpg'),
  pizzeria: require('../../assets/venue-types/pizzeria.jpg'),
  bar_tapas: require('../../assets/venue-types/bar_tapas.jpg'),
  fast_food: require('../../assets/venue-types/fast_food.jpg'),
  hotel_restaurant: require('../../assets/venue-types/hotel_restaurant.jpg'),
  food_truck: require('../../assets/venue-types/food_truck.jpg'),
  catering: require('../../assets/venue-types/catering.jpg'),
  brunch_place: require('../../assets/venue-types/brunch_place.jpg'),
  burger_joint: require('../../assets/venue-types/burger_joint.jpg'),
  asian_restaurant: require('../../assets/venue-types/asian_restaurant.jpg'),
};

export function getVenueTypeImageSource(venueType?: VenueType): ImageSource | null {
  if (!venueType) {
    return VENUE_TYPE_IMAGE_MODULES.restaurant;
  }
  return VENUE_TYPE_IMAGE_MODULES[venueType] ?? VENUE_TYPE_IMAGE_MODULES.restaurant;
}
