import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { VenueType } from '../types/Restaurant';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const VENUE_TYPE_ICONS: Record<VenueType, IconName> = {
  restaurant: 'silverware-fork-knife',
  cafe: 'coffee',
  bakery: 'bread-slice',
  pastry_shop: 'cupcake',
  ice_cream: 'ice-cream',
  pizzeria: 'pizza',
  bar_tapas: 'glass-mug-variant',
  fast_food: 'food',
  hotel_restaurant: 'bed',
  food_truck: 'truck',
  catering: 'room-service',
  brunch_place: 'egg-fried',
  burger_joint: 'hamburger',
  asian_restaurant: 'noodles',
};

export function getVenueTypeIconName(venueType?: VenueType): IconName {
  if (!venueType) {
    return VENUE_TYPE_ICONS.restaurant;
  }
  return VENUE_TYPE_ICONS[venueType] ?? VENUE_TYPE_ICONS.restaurant;
}
