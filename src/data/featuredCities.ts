import type { ImageSourcePropType } from 'react-native';

export type FeaturedCityId = 'palma' | 'madrid' | 'barcelona' | 'berlin';

export interface FeaturedCityDefinition {
  id: FeaturedCityId;
  /** Suchbegriff — muss zu `matchesQuery` passen. */
  searchQuery: string;
  labelKey: string;
  regionKey: string;
  gradient: readonly [string, string];
  icon: 'beach' | 'city' | 'architecture' | 'dom';
}

export const FEATURED_CITIES: FeaturedCityDefinition[] = [
  {
    id: 'palma',
    searchQuery: 'Palma',
    labelKey: 'search.featured_city_palma',
    regionKey: 'search.featured_region_balearic',
    gradient: ['#3d6b7a', '#1e4d5c'],
    icon: 'beach',
  },
  {
    id: 'madrid',
    searchQuery: 'Madrid',
    labelKey: 'search.featured_city_madrid',
    regionKey: 'search.featured_region_madrid',
    gradient: ['#8b4a3a', '#5c3228'],
    icon: 'city',
  },
  {
    id: 'barcelona',
    searchQuery: 'Barcelona',
    labelKey: 'search.featured_city_barcelona',
    regionKey: 'search.featured_region_catalonia',
    gradient: ['#b86a2e', '#7a4518'],
    icon: 'architecture',
  },
  {
    id: 'berlin',
    searchQuery: 'Berlin',
    labelKey: 'search.featured_city_berlin',
    regionKey: 'search.featured_region_berlin',
    gradient: ['#4a5568', '#2d3748'],
    icon: 'dom',
  },
];

/** Optionale Kachel-Hintergründe — Fallback sind Verlaufsfarben. */
export const FEATURED_CITY_IMAGES: Partial<Record<FeaturedCityId, ImageSourcePropType>> = {};
