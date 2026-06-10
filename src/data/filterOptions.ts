import { REGION_NAMES } from '../i18n/regions';

export const PRIMARY_VENUE_TYPES = [
  { code: 'restaurant', icon: 'silverware-fork-knife' },
  { code: 'pizzeria', icon: 'pizza' },
  { code: 'cafe', icon: 'coffee' },
  { code: 'pastry_shop', icon: 'cupcake' },
  { code: 'bakery', icon: 'baguette' },
  { code: 'ice_cream', icon: 'ice-cream' },
  { code: 'bar_tapas', icon: 'glass-wine' },
] as const;

/** Regionen in der Suche (Schwerpunkt Mockup: Balearen, Valencia, Katalonien). */
export const SEARCH_REGIONS = ['ES-IB', 'ES-VC', 'ES-CT', 'ES-MD', 'ES-AN'] as const;

export const ALL_REGIONS = Object.keys(REGION_NAMES) as Array<keyof typeof REGION_NAMES>;

export const PRICE_RANGES = ['€', '€€', '€€€', '€€€€'] as const;

export const RATING_CHIPS = ['all', '3', '4', '4.5'] as const;

export type RatingChip = (typeof RATING_CHIPS)[number];

export type SearchCategoryTab = 'all' | 'verified' | 'bakery' | 'community';

/** Schnellfilter-Chips unter der Suchleiste auf dem Startbildschirm. */
export type QuickFilterId = 'all' | 'lactose_free' | 'pastry_shop' | 'pizzeria' | 'vegan';

export const QUICK_FILTER_IDS: QuickFilterId[] = [
  'all',
  'lactose_free',
  'pastry_shop',
  'pizzeria',
  'vegan',
];

export const SORT_OPTIONS = [
  { code: 'name_asc', labels: { es: 'Nombre A-Z', en: 'Name A-Z', de: 'Name A-Z' } },
  { code: 'name_desc', labels: { es: 'Nombre Z-A', en: 'Name Z-A', de: 'Name Z-A' } },
  {
    code: 'recently_verified',
    labels: {
      es: 'Verificados recientemente',
      en: 'Recently verified',
      de: 'Kürzlich verifiziert',
    },
  },
] as const;
