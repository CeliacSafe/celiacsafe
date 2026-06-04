import type { ImageSource } from 'expo-image';

import { getVenueTypeImageSource } from '../constants/venueTypeImages';
import type { Restaurant } from '../types/Restaurant';

/**
 * Anzeige-Bild: eigenes Foto hat Vorrang, sonst Standardfoto der Restaurant-Art.
 */
export function getRestaurantDisplayImage(restaurant: Restaurant): ImageSource | null {
  const url = restaurant.featured_image_url?.trim();
  if (url) {
    return { uri: url };
  }
  return getVenueTypeImageSource(restaurant.venue_type);
}
