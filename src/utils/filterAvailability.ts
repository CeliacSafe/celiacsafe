/**
 * Ermittelt welche Filteroptionen es in der aktuellen Ergebnismenge gibt.
 * Beim Berechnen einer Dimension wird deren eigener Wert ignoriert (kaskadierend).
 */

import type { RatingChip, SearchCategoryTab } from '../data/filterOptions';
import type { DeliveryPlatform, Restaurant } from '../types/Restaurant';
import { getActiveDeliveryLinks, normalizeDeliveryPlatform } from './platformLinks';
import { matchesFilter, matchesQuery, type FilterCriteria } from './searchAndFilter';

export type FilterDimension =
  | 'region'
  | 'city'
  | 'venueType'
  | 'priceRange'
  | 'delivery';

export type FilterOptionContext = FilterCriteria & {
  searchQuery?: string;
};

const DELIVERY_PLATFORM_ORDER: DeliveryPlatform[] = [
  'glovo',
  'uber_eats',
  'just_eat',
  'wolt',
  'deliveroo',
  'lieferando',
  'foodora',
  'takeaway',
  'bolt_food',
  'own_delivery',
];

function withoutDimension(
  criteria: FilterOptionContext,
  dimension: FilterDimension
): FilterCriteria {
  const next: FilterCriteria = { ...criteria };
  switch (dimension) {
    case 'region':
      next.selectedRegions = [];
      break;
    case 'city':
      next.selectedCity = null;
      break;
    case 'venueType':
      next.selectedVenueTypes = [];
      break;
    case 'priceRange':
      next.selectedPriceRanges = [];
      break;
    case 'delivery':
      next.selectedDeliveryPlatform = null;
      break;
    default:
      break;
  }
  return next;
}

export function getRestaurantsForFilterOptions(
  restaurants: Restaurant[],
  criteria: FilterOptionContext,
  dimension: FilterDimension
): Restaurant[] {
  const scoped = withoutDimension(criteria, dimension);
  const query = criteria.searchQuery ?? '';
  return restaurants
    .filter((r) => matchesQuery(r, query))
    .filter((r) => matchesFilter(r, scoped));
}

export function getAvailableRegionCodes(
  restaurants: Restaurant[],
  criteria: FilterOptionContext
): string[] {
  const pool = getRestaurantsForFilterOptions(restaurants, criteria, 'region');
  const codes = new Set<string>();
  for (const r of pool) {
    codes.add(r.region_code);
  }
  return [...codes].sort((a, b) => a.localeCompare(b, 'es'));
}

export function getAvailableCities(
  restaurants: Restaurant[],
  criteria: FilterOptionContext
): string[] {
  const pool = getRestaurantsForFilterOptions(restaurants, criteria, 'city');
  const cities = new Set<string>();
  for (const r of pool) {
    if (r.city) {
      cities.add(r.city);
    }
  }
  return [...cities].sort((a, b) => a.localeCompare(b, 'es'));
}

export function getAvailableVenueTypes(
  restaurants: Restaurant[],
  criteria: FilterOptionContext
): string[] {
  const pool = getRestaurantsForFilterOptions(restaurants, criteria, 'venueType');
  const types = new Set<string>();
  for (const r of pool) {
    if (r.venue_type) {
      types.add(r.venue_type);
    }
  }
  return [...types].sort((a, b) => a.localeCompare(b, 'es'));
}

export function getAvailablePriceRanges(
  restaurants: Restaurant[],
  criteria: FilterOptionContext
): string[] {
  const pool = getRestaurantsForFilterOptions(restaurants, criteria, 'priceRange');
  const prices = new Set<string>();
  for (const r of pool) {
    if (r.price_range) {
      prices.add(r.price_range);
    }
  }
  const order = ['€', '€€', '€€€', '€€€€'];
  return order.filter((p) => prices.has(p));
}

export function getAvailableDeliveryPlatforms(
  restaurants: Restaurant[],
  criteria: FilterOptionContext
): string[] {
  const pool = getRestaurantsForFilterOptions(restaurants, criteria, 'delivery');
  const platforms = new Set<string>();
  for (const r of pool) {
    for (const link of getActiveDeliveryLinks(r)) {
      platforms.add(normalizeDeliveryPlatform(link.platform));
    }
  }
  const ordered = DELIVERY_PLATFORM_ORDER.filter((p) => platforms.has(p));
  const extras = [...platforms]
    .filter((p) => !DELIVERY_PLATFORM_ORDER.includes(p as DeliveryPlatform))
    .sort((a, b) => a.localeCompare(b, 'es'));
  return [...ordered, ...extras];
}

export function poolHasDietOption(
  restaurants: Restaurant[],
  criteria: FilterOptionContext,
  cuisineCode: 'vegana' | 'vegetariana'
): boolean {
  const query = criteria.searchQuery ?? '';
  const scoped: FilterCriteria = {
    ...criteria,
    dietVegan: false,
    dietVegetarian: false,
  };
  return restaurants
    .filter((r) => matchesQuery(r, query))
    .filter((r) => matchesFilter(r, scoped))
    .some((r) => (r.cuisine_types ?? []).includes(cuisineCode));
}

export function buildFilterOptionContext(state: {
  searchQuery: string;
  selectedVenueTypes: string[];
  selectedRegions: string[];
  selectedPriceRanges: string[];
  selectedCity: string | null;
  selectedDeliveryPlatform: string | null;
  onlyFaceCertified: boolean;
  onlyAoecsCertified: boolean;
  dietVegan: boolean;
  dietVegetarian: boolean;
  minRating: RatingChip;
  categoryTab: SearchCategoryTab;
}): FilterOptionContext {
  return {
    selectedVenueTypes: state.selectedVenueTypes,
    selectedRegions: state.selectedRegions,
    selectedPriceRanges: state.selectedPriceRanges,
    selectedCity: state.selectedCity,
    selectedDeliveryPlatform: state.selectedDeliveryPlatform,
    onlyFaceCertified: state.onlyFaceCertified,
    onlyAoecsCertified: state.onlyAoecsCertified,
    dietVegan: state.dietVegan,
    dietVegetarian: state.dietVegetarian,
    minRating: state.minRating,
    categoryTab: state.categoryTab,
    searchQuery: state.searchQuery,
  };
}
