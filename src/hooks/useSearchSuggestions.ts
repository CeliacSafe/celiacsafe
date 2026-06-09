import { useMemo } from 'react';

import { useAppLanguage } from '../i18n/useAppLanguage';
import { useRestaurants } from './useRestaurants';
import { getSearchSuggestions } from '../utils/searchSuggestions';
import type { Restaurant } from '../types/Restaurant';

export function useSearchSuggestions(
  query: string,
  restaurantsOverride?: Restaurant[]
) {
  const { restaurants: syncedRestaurants } = useRestaurants();
  const language = useAppLanguage();
  const restaurants = restaurantsOverride ?? syncedRestaurants;

  return useMemo(
    () => getSearchSuggestions(restaurants, query, undefined, language),
    [language, restaurants, query]
  );
}
