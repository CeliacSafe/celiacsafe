/**
 * Zentrale Such-, Filter- und Sortierlogik fuer Restaurantlisten.
 * Diese Funktionen laufen bei jeder Such-/Filteraenderung und sorgen dafuer,
 * dass die Ergebnisliste konsistent und performant berechnet wird.
 */

import type { Restaurant } from '../types/Restaurant';

import type { RatingChip, SearchCategoryTab } from '../data/filterOptions';
import { COUNTRY_NAMES } from '../i18n/lookups';
import { compareWithPremiumInCity } from './restaurantSort';
import { restaurantHasDelivery } from './platformLinks';
import {
  matchesCityFilter,
  matchesCountryFilter,
  matchesRegionFilter,
  matchesVenueTypeFilter,
} from './filterTextMatch';
import { cuisineMatchesDiet, restaurantMatchesVenueType } from './venueNormalization';

export interface FilterCriteria {
  selectedVenueTypes: string[];
  selectedRegions: string[];
  selectedPriceRanges: string[];
  onlyFaceCertified: boolean;
  onlyAoecsCertified: boolean;
  selectedCountry?: string | null;
  selectedCity?: string | null;
  deliveryAvailable?: boolean | null;
  dietVegan?: boolean;
  dietVegetarian?: boolean;
  minRating?: RatingChip;
  categoryTab?: SearchCategoryTab;
}

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function matchesQuery(restaurant: Restaurant, query: string): boolean {
  if (!query) return true;
  const normalizedQuery = normalize(query);
  const terms = normalizedQuery.split(/\s+/).filter((t) => t.length > 0);

  const countryLabels = COUNTRY_NAMES[restaurant.country_code];
  const countryText = countryLabels
    ? Object.values(countryLabels).join(' ')
    : restaurant.country_code;

  const haystack = normalize(
    [
      restaurant.name,
      restaurant.city,
      restaurant.region_name ?? '',
      restaurant.province ?? '',
      restaurant.district ?? '',
      restaurant.address_street ?? '',
      restaurant.country_code,
      countryText,
      ...(restaurant.cuisine_types ?? []),
      restaurant.description_es ?? '',
    ].join(' ')
  );

  return terms.every((term) => haystack.includes(term));
}

export function matchesFilter(restaurant: Restaurant, c: FilterCriteria): boolean {
  if (
    c.selectedVenueTypes.length > 0 &&
    !c.selectedVenueTypes.some((code) => matchesVenueTypeFilter(restaurant, code))
  ) {
    return false;
  }
  if (c.selectedCountry && !matchesCountryFilter(restaurant, c.selectedCountry)) {
    return false;
  }
  if (
    c.selectedRegions.length > 0 &&
    !c.selectedRegions.some((code) => matchesRegionFilter(restaurant, code))
  ) {
    return false;
  }
  if (
    c.selectedPriceRanges.length > 0 &&
    !c.selectedPriceRanges.includes(restaurant.price_range ?? '')
  ) {
    return false;
  }
  if (c.onlyFaceCertified && !restaurant.face_program) {
    return false;
  }
  if (c.onlyAoecsCertified && !restaurant.aoecs_certified) {
    return false;
  }
  if (c.selectedCity && !matchesCityFilter(restaurant, c.selectedCity)) {
    return false;
  }
  if (c.deliveryAvailable === true && !restaurantHasDelivery(restaurant)) {
    return false;
  }
  if (c.deliveryAvailable === false && restaurantHasDelivery(restaurant)) {
    return false;
  }
  if (c.dietVegan && !cuisineMatchesDiet(restaurant.cuisine_types, 'vegan')) {
    return false;
  }
  if (c.dietVegetarian && !cuisineMatchesDiet(restaurant.cuisine_types, 'vegetarian')) {
    return false;
  }
  if (c.categoryTab === 'verified' && restaurant.verification_status === 'rejected') {
    return false;
  }
  if (
    c.categoryTab === 'community' &&
    !['pending_verification', 'in_verification'].includes(restaurant.verification_status)
  ) {
    return false;
  }
  if (c.categoryTab === 'bakery' && !restaurantMatchesVenueType(restaurant, 'bakery')) {
    return false;
  }
  return true;
}

export function sortRestaurants(
  restaurants: Restaurant[],
  sortBy: 'name_asc' | 'name_desc' | 'recently_verified'
): Restaurant[] {
  const copy = [...restaurants];
  switch (sortBy) {
    case 'name_asc':
      return copy.sort((a, b) =>
        compareWithPremiumInCity(a, b, (left, right) =>
          left.name.localeCompare(right.name, 'es')
        )
      );
    case 'name_desc':
      return copy.sort((a, b) =>
        compareWithPremiumInCity(a, b, (left, right) =>
          right.name.localeCompare(left.name, 'es')
        )
      );
    case 'recently_verified':
      return copy.sort((a, b) =>
        compareWithPremiumInCity(a, b, (left, right) => {
          const da = left.last_verified_at ?? '';
          const db = right.last_verified_at ?? '';
          return db.localeCompare(da);
        })
      );
  }
}

export function applyFilters(
  restaurants: Restaurant[],
  query: string,
  filterCriteria: FilterCriteria,
  sortBy: 'name_asc' | 'name_desc' | 'recently_verified'
): Restaurant[] {
  const filtered = restaurants
    .filter((r) => matchesQuery(r, query))
    .filter((r) => matchesFilter(r, filterCriteria));
  return sortRestaurants(filtered, sortBy);
}
