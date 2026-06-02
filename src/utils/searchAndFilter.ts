/**
 * Zentrale Such-, Filter- und Sortierlogik fuer Restaurantlisten.
 * Diese Funktionen laufen bei jeder Such-/Filteraenderung und sorgen dafuer,
 * dass die Ergebnisliste konsistent und performant berechnet wird.
 */

import type { Restaurant } from '../types/Restaurant';

export interface FilterCriteria {
  selectedVenueTypes: string[];
  selectedRegions: string[];
  selectedPriceRanges: string[];
  onlyFaceCertified: boolean;
  onlyAoecsCertified: boolean;
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

  const haystack = normalize(
    [
      restaurant.name,
      restaurant.city,
      restaurant.region_name ?? '',
      restaurant.province ?? '',
      restaurant.district ?? '',
      restaurant.address_street ?? '',
      ...(restaurant.cuisine_types ?? []),
      restaurant.description_es ?? '',
    ].join(' ')
  );

  return terms.every((term) => haystack.includes(term));
}

export function matchesFilter(restaurant: Restaurant, c: FilterCriteria): boolean {
  if (
    c.selectedVenueTypes.length > 0 &&
    !c.selectedVenueTypes.includes(restaurant.venue_type ?? '')
  ) {
    return false;
  }
  if (c.selectedRegions.length > 0 && !c.selectedRegions.includes(restaurant.region_code)) {
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
  return true;
}

export function sortRestaurants(
  restaurants: Restaurant[],
  sortBy: 'name_asc' | 'name_desc' | 'recently_verified'
): Restaurant[] {
  const copy = [...restaurants];
  switch (sortBy) {
    case 'name_asc':
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    case 'name_desc':
      return copy.sort((a, b) => b.name.localeCompare(a.name, 'es'));
    case 'recently_verified':
      return copy.sort((a, b) => {
        const da = a.last_verified_at ?? '';
        const db = b.last_verified_at ?? '';
        return db.localeCompare(da);
      });
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
