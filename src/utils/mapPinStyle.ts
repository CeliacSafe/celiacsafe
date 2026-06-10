import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { Restaurant } from '../types/Restaurant';
import { getRestaurantCategory } from './restaurantFields';

export type MapPinCategory = 'cafe_bakery' | 'restaurant' | 'fast_pizza';

export interface MapPinStyle {
  category: MapPinCategory;
  fill: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const PIN_STYLES: Record<MapPinCategory, Omit<MapPinStyle, 'category'>> = {
  cafe_bakery: {
    fill: '#E8C547',
    icon: 'coffee',
  },
  restaurant: {
    fill: '#5a6850',
    icon: 'silverware-fork-knife',
  },
  fast_pizza: {
    fill: '#D4863A',
    icon: 'pizza',
  },
};

export function getMapPinCategory(restaurant: Restaurant): MapPinCategory {
  const category = getRestaurantCategory(restaurant);
  if (category === 'bakery' || category === 'cafe') {
    return 'cafe_bakery';
  }
  if (category === 'pizza' || category === 'fastfood') {
    return 'fast_pizza';
  }
  return 'restaurant';
}

export function getMapPinStyle(restaurant: Restaurant): MapPinStyle {
  const category = getMapPinCategory(restaurant);
  return { category, ...PIN_STYLES[category] };
}

export function getMapPinStyleByCategory(category: MapPinCategory): MapPinStyle {
  return { category, ...PIN_STYLES[category] };
}
