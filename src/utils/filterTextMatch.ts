import { COUNTRY_NAMES, VENUE_TYPE_NAMES } from '../i18n/lookups';
import { REGION_NAMES } from '../i18n/regions';
import type { CountryCode, Restaurant, VenueType } from '../types/Restaurant';
import { normalize } from './searchAndFilter';
import { normalizeVenueTypes, restaurantMatchesVenueType } from './venueNormalization';

export function isKnownCountryCode(value: string): value is CountryCode {
  return Object.prototype.hasOwnProperty.call(COUNTRY_NAMES, value);
}

export function isKnownRegionCode(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(REGION_NAMES, value);
}

export function isKnownVenueTypeCode(value: string): value is VenueType {
  return Object.prototype.hasOwnProperty.call(VENUE_TYPE_NAMES, value);
}

function localizedLabelsMatch(value: string, labels: Record<string, string>): boolean {
  const needle = normalize(value);
  if (!needle) {
    return false;
  }
  return Object.values(labels).some((label) => {
    const haystack = normalize(label);
    return haystack.includes(needle) || needle.includes(haystack);
  });
}

export function matchesCountryFilter(restaurant: Restaurant, value: string): boolean {
  if (restaurant.country_code === value) {
    return true;
  }
  if (isKnownCountryCode(value)) {
    return restaurant.country_code === value;
  }
  const needle = normalize(value);
  if (normalize(restaurant.country_code) === needle) {
    return true;
  }
  const countryLabels = COUNTRY_NAMES[restaurant.country_code];
  return countryLabels ? localizedLabelsMatch(value, countryLabels) : false;
}

export function matchesRegionFilter(restaurant: Restaurant, value: string): boolean {
  if (restaurant.region_code === value) {
    return true;
  }
  if (isKnownRegionCode(value)) {
    return restaurant.region_code === value;
  }
  const needle = normalize(value);
  const regionLabels = REGION_NAMES[restaurant.region_code as keyof typeof REGION_NAMES];
  if (regionLabels && localizedLabelsMatch(value, regionLabels)) {
    return true;
  }
  const fields = [restaurant.region_name, restaurant.province, restaurant.region_code];
  return fields.some((field) => field && normalize(field).includes(needle));
}

export function matchesCityFilter(restaurant: Restaurant, value: string): boolean {
  const needle = normalize(value);
  const fields = [restaurant.city, restaurant.district, restaurant.province];
  return fields.some((field) => {
    if (!field) {
      return false;
    }
    const normalizedField = normalize(field);
    return normalizedField === needle || normalizedField.includes(needle);
  });
}

export function matchesVenueTypeFilter(restaurant: Restaurant, value: string): boolean {
  if (isKnownVenueTypeCode(value)) {
    return restaurantMatchesVenueType(restaurant, value);
  }
  const needle = normalize(value);
  for (const code of normalizeVenueTypes(restaurant.venue_type)) {
    const labels = VENUE_TYPE_NAMES[code];
    if (labels && localizedLabelsMatch(value, labels)) {
      return true;
    }
    if (normalize(code).includes(needle)) {
      return true;
    }
  }
  if (restaurant.venue_type && normalize(restaurant.venue_type).includes(needle)) {
    return true;
  }
  return false;
}
