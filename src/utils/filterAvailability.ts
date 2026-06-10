/**
 * Ermittelt welche Filteroptionen es in der aktuellen Ergebnismenge gibt.
 * Beim Berechnen einer Dimension wird deren eigener Wert ignoriert (kaskadierend).
 */

import type { RatingChip, SearchCategoryTab } from '../data/filterOptions';
import type { UserDietaryPreferences } from '../store/userPreferencesStore';
import type { Restaurant } from '../types/Restaurant';
import { restaurantHasDelivery } from './platformLinks';
import { cuisineMatchesDiet, normalizeVenueTypes } from './venueNormalization';
import { matchesFilter, matchesQuery, type FilterCriteria } from './searchAndFilter';

export type FilterDimension =
  | 'country'
  | 'region'
  | 'city'
  | 'venueType'
  | 'priceRange'
  | 'delivery';

export type FilterOptionContext = FilterCriteria & {
  searchQuery?: string;
};

function withoutDimension(
  criteria: FilterOptionContext,
  dimension: FilterDimension
): FilterCriteria {
  const next: FilterCriteria = { ...criteria };
  switch (dimension) {
    case 'country':
      next.selectedCountry = null;
      break;
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
      next.deliveryAvailable = null;
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

export function getAvailableCountryCodes(
  restaurants: Restaurant[],
  criteria: FilterOptionContext
): string[] {
  const pool = getRestaurantsForFilterOptions(restaurants, criteria, 'country');
  const codes = new Set<string>();
  for (const restaurant of pool) {
    codes.add(restaurant.country_code);
  }
  return [...codes].sort((a, b) => a.localeCompare(b, 'es'));
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
    for (const code of normalizeVenueTypes(r.venue_type)) {
      types.add(code);
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

export function getDeliveryFilterAvailability(
  restaurants: Restaurant[],
  criteria: FilterOptionContext
): { hasWithDelivery: boolean; hasWithoutDelivery: boolean } {
  const pool = getRestaurantsForFilterOptions(restaurants, criteria, 'delivery');
  let hasWithDelivery = false;
  let hasWithoutDelivery = false;
  for (const restaurant of pool) {
    if (restaurantHasDelivery(restaurant)) {
      hasWithDelivery = true;
    } else {
      hasWithoutDelivery = true;
    }
    if (hasWithDelivery && hasWithoutDelivery) {
      break;
    }
  }
  return { hasWithDelivery, hasWithoutDelivery };
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
  const diet = cuisineCode === 'vegana' ? 'vegan' : 'vegetarian';
  return restaurants
    .filter((r) => matchesQuery(r, query))
    .filter((r) => matchesFilter(r, scoped))
    .some((r) => cuisineMatchesDiet(r.cuisine_types, diet));
}

export function buildFilterOptionContext(state: {
  searchQuery: string;
  selectedVenueTypes: string[];
  selectedRegions: string[];
  selectedPriceRanges: string[];
  selectedCountry: string | null;
  selectedCity: string | null;
  deliveryAvailable: boolean | null;
  onlyFaceCertified: boolean;
  onlyAoecsCertified: boolean;
  dietVegan: boolean;
  dietVegetarian: boolean;
  dietLactoseFree?: boolean;
  minRating: RatingChip;
  categoryTab: SearchCategoryTab;
  profileDietary?: UserDietaryPreferences;
}): FilterOptionContext {
  return {
    selectedVenueTypes: state.selectedVenueTypes,
    selectedRegions: state.selectedRegions,
    selectedPriceRanges: state.selectedPriceRanges,
    selectedCountry: state.selectedCountry,
    selectedCity: state.selectedCity,
    deliveryAvailable: state.deliveryAvailable,
    onlyFaceCertified: state.onlyFaceCertified,
    onlyAoecsCertified: state.onlyAoecsCertified,
    dietVegan: state.dietVegan,
    dietVegetarian: state.dietVegetarian,
    dietLactoseFree: state.dietLactoseFree,
    minRating: state.minRating,
    categoryTab: state.categoryTab,
    profileDietary: state.profileDietary,
    searchQuery: state.searchQuery,
  };
}
