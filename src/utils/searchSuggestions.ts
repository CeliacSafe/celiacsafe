import type { SupportedLanguage } from '../i18n';
import type { Restaurant } from '../types/Restaurant';
import { COUNTRY_NAMES } from '../i18n/lookups';
import { matchesQuery, normalize } from './searchAndFilter';

export type SearchSuggestionKind = 'restaurant' | 'city';

export type SearchSuggestion = {
  id: string;
  label: string;
  subtitle?: string;
  kind: SearchSuggestionKind;
};

const DEFAULT_LIMIT = 8;
const MIN_QUERY_LENGTH = 1;

function scoreRestaurant(restaurant: Restaurant, normalizedQuery: string): number {
  const name = normalize(restaurant.name);
  const city = normalize(restaurant.city);

  if (name.startsWith(normalizedQuery)) {
    return 100;
  }
  if (name.includes(normalizedQuery)) {
    return 80;
  }
  if (city.startsWith(normalizedQuery)) {
    return 65;
  }
  if (city.includes(normalizedQuery)) {
    return 55;
  }
  return matchesQuery(restaurant, normalizedQuery) ? 40 : 0;
}

function buildCitySuggestions(
  restaurants: Restaurant[],
  normalizedQuery: string,
  limit: number,
  seenRestaurantIds: Set<string>
): SearchSuggestion[] {
  const cityScores = new Map<string, number>();

  for (const restaurant of restaurants) {
    const city = restaurant.city?.trim();
    if (!city) {
      continue;
    }
    const normalizedCity = normalize(city);
    if (!normalizedCity.includes(normalizedQuery)) {
      continue;
    }
    const score = normalizedCity.startsWith(normalizedQuery) ? 70 : 50;
    const current = cityScores.get(city) ?? 0;
    if (score > current) {
      cityScores.set(city, score);
    }
  }

  return [...cityScores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, Math.max(2, Math.floor(limit / 3)))
    .map(([city]) => {
      seenRestaurantIds.add(`city:${city}`);
      return {
        id: `city:${city}`,
        label: city,
        kind: 'city' as const,
      };
    });
}

export function getSearchSuggestions(
  restaurants: Restaurant[],
  query: string,
  limit = DEFAULT_LIMIT,
  language: SupportedLanguage = 'es'
): SearchSuggestion[] {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const normalizedQuery = normalize(trimmed);
  const seenIds = new Set<string>();
  const restaurantSuggestions: Array<SearchSuggestion & { score: number }> = [];

  for (const restaurant of restaurants) {
    const score = scoreRestaurant(restaurant, normalizedQuery);
    if (score <= 0) {
      continue;
    }

    const countryLabel =
      COUNTRY_NAMES[restaurant.country_code as keyof typeof COUNTRY_NAMES]?.[language] ??
      restaurant.country_code;

    restaurantSuggestions.push({
      id: `restaurant:${restaurant.id}`,
      label: restaurant.name,
      subtitle: [restaurant.city, countryLabel].filter(Boolean).join(' · '),
      kind: 'restaurant',
      score,
    });
  }

  restaurantSuggestions.sort(
    (a, b) => b.score - a.score || a.label.localeCompare(b.label, 'es')
  );

  const results: SearchSuggestion[] = [];
  for (const entry of restaurantSuggestions) {
    if (results.length >= limit) {
      break;
    }
    if (seenIds.has(entry.id)) {
      continue;
    }
    seenIds.add(entry.id);
    const { score: _score, ...suggestion } = entry;
    results.push(suggestion);
  }

  if (results.length < limit) {
    const citySuggestions = buildCitySuggestions(
      restaurants,
      normalizedQuery,
      limit - results.length,
      seenIds
    );
    for (const city of citySuggestions) {
      if (results.length >= limit || seenIds.has(city.id)) {
        continue;
      }
      seenIds.add(city.id);
      results.push(city);
    }
  }

  return results;
}

export function suggestionToSearchQuery(suggestion: SearchSuggestion): string {
  return suggestion.label;
}
