import { REGION_NAMES } from '../i18n/regions';

// Primaere Venue-Types fuer schnell zugaengliche Pill-Filter in der Suchansicht.
export const PRIMARY_VENUE_TYPES = [
  { code: 'restaurant', icon: 'silverware-fork-knife' },
  { code: 'pizzeria', icon: 'pizza' },
  { code: 'cafe', icon: 'coffee' },
  { code: 'pastry_shop', icon: 'cupcake' },
  { code: 'bakery', icon: 'baguette' },
  { code: 'ice_cream', icon: 'ice-cream' },
  { code: 'bar_tapas', icon: 'glass-wine' },
] as const;

// Alle verfuegbaren Regions-Codes fuer den Bottom-Sheet-Filter.
export const ALL_REGIONS = Object.keys(REGION_NAMES) as Array<keyof typeof REGION_NAMES>;

// Preisfilter fuer erweiterten Filterdialog.
export const PRICE_RANGES = ['€', '€€', '€€€', '€€€€'] as const;

// Sortieroptionen mit Labels fuer spaetere i18n-Umschaltung.
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
